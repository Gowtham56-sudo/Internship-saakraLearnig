const { db } = require("../config/firebase");
const evaluationService = require("../services/evaluationService");

// Check eligibility for certificate
exports.checkCertificateEligibility = async (userId, courseId) => {
  try {
    // Get course completion progress
    const progressSnapshot = await db
      .collection("progress")
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    if (progressSnapshot.empty) {
      return {
        eligible: false,
        reason: "No progress record found",
      };
    }

    const progress = progressSnapshot.docs[0].data();

    // Check if course is completed
    if (progress.completedPercentage < 100) {
      return {
        eligible: false,
        reason: `Course not completed. Current progress: ${progress.completedPercentage}%`,
        currentProgress: progress.completedPercentage,
      };
    }

    // Get assessment performance
    const assessmentSnapshot = await db
      .collection("assessment_submissions")
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .get();

    if (assessmentSnapshot.empty) {
      return {
        eligible: false,
        reason: "No assessment submissions found",
      };
    }

    const submissions = assessmentSnapshot.docs.map((doc) => doc.data());

    // Check if all assessments are passed
    const failedAssessments = submissions.filter((s) => !s.passed);

    if (failedAssessments.length > 0) {
      return {
        eligible: false,
        reason: `Failed ${failedAssessments.length} assessment(s). All assessments must be passed.`,
        failedCount: failedAssessments.length,
      };
    }

    // Calculate final score
    const finalScore = Math.round(
      submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
    );

    return {
      eligible: true,
      reason: "All eligibility criteria met",
      courseCompletion: progress.completedPercentage,
      assessmentsPassed: submissions.length,
      finalScore,
      completionDate: progress.lastUpdatedAt,
    };
  } catch (error) {
    throw error;
  }
};

// Generate certificate record
exports.generateCertificate = async (req, res) => {
  const { userId, courseId } = req.body;

  // Validation
  if (!userId || !courseId) {
    return res.status(400).json({ error: "userId and courseId are required" });
  }

  try {
    // Check eligibility
    const eligibility = await exports.checkCertificateEligibility(
      userId,
      courseId
    );

    if (!eligibility.eligible) {
      return res.status(400).json({
        message: "Certificate eligibility criteria not met",
        details: eligibility,
      });
    }

    // Check if certificate already exists
    const existingCertSnapshot = await db
      .collection("certificates")
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    if (!existingCertSnapshot.empty) {
      return res.status(400).json({
        message: "Certificate already exists for this user and course",
        certificateId: existingCertSnapshot.docs[0].id,
      });
    }

    // Get course details
    const courseSnapshot = await db.collection("courses").doc(courseId).get();

    if (!courseSnapshot.exists) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseData = courseSnapshot.data();

    // Get user details
    const userSnapshot = await db.collection("users").doc(userId).get();
    const userData = userSnapshot.exists ? userSnapshot.data() : {};

    // Generate unique certificate ID
    const certificateId = `CERT-${courseId}-${userId}-${Date.now()}`;

    const certificateData = {
      certificateId,
      userId,
      courseId,
      courseName: courseData.name,
      userName: userData.name || userData.email,
      completionDate: new Date(),
      issuedDate: new Date(),
      status: "ACTIVE",
      courseCompletion: eligibility.courseCompletion,
      finalScore: eligibility.finalScore,
      assessmentsPassed: eligibility.assessmentsPassed,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      metadata: {
        generatedBy: "backend_system",
        version: "1.0",
        courseCompletionDate: eligibility.completionDate,
      },
    };

    const docRef = await db.collection("certificates").add(certificateData);

    // Log certificate generation for analytics
    await db.collection("certificate_logs").add({
      certificateId: docRef.id,
      userId,
      courseId,
      action: "GENERATED",
      timestamp: new Date(),
    });

    res.status(201).json({
      message: "Certificate generated successfully",
      certificateId: docRef.id,
      certificate: { id: docRef.id, ...certificateData },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get certificate by ID
exports.getCertificate = async (req, res) => {
  const { certificateId } = req.params;

  try {
    const certDoc = await db.collection("certificates").doc(certificateId).get();

    if (!certDoc.exists) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json({
      id: certDoc.id,
      ...certDoc.data(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's certificates
exports.getUserCertificates = async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db
      .collection("certificates")
      .where("userId", "==", userId)
      .orderBy("issuedDate", "desc")
      .get();

    const certificates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      userId,
      totalCertificates: certificates.length,
      certificates,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get certificates for a course
exports.getCourseCertificates = async (req, res) => {
  const { courseId } = req.params;

  try {
    const snapshot = await db
      .collection("certificates")
      .where("courseId", "==", courseId)
      .orderBy("issuedDate", "desc")
      .get();

    const certificates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      courseId,
      totalCertificates: certificates.length,
      activeCertificates: certificates.filter((c) => c.status === "ACTIVE")
        .length,
      certificates,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify certificate authenticity
exports.verifyCertificate = async (req, res) => {
  const { certificateId } = req.body;

  try {
    const certDoc = await db.collection("certificates").doc(certificateId).get();

    if (!certDoc.exists) {
      return res.json({
        valid: false,
        message: "Certificate not found",
      });
    }

    const certificate = certDoc.data();

    // Check if certificate is still valid
    const currentDate = new Date();
    const isValid =
      certificate.status === "ACTIVE" &&
      currentDate <= new Date(certificate.validUntil);

    res.json({
      valid: isValid,
      certificateId,
      userId: certificate.userId,
      courseId: certificate.courseId,
      courseName: certificate.courseName,
      userName: certificate.userName,
      issuedDate: certificate.issuedDate,
      validUntil: certificate.validUntil,
      status: certificate.status,
      message: isValid
        ? "Certificate is valid"
        : "Certificate is expired or inactive",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Revoke certificate
exports.revokeCertificate = async (req, res) => {
  const { certificateId, reason } = req.body;

  if (!certificateId) {
    return res.status(400).json({ error: "certificateId is required" });
  }

  try {
    const certDoc = await db.collection("certificates").doc(certificateId).get();

    if (!certDoc.exists) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    await db.collection("certificates").doc(certificateId).update({
      status: "REVOKED",
      revokedAt: new Date(),
      revocationReason: reason || "No reason provided",
    });

    // Log revocation
    await db.collection("certificate_logs").add({
      certificateId,
      userId: certDoc.data().userId,
      courseId: certDoc.data().courseId,
      action: "REVOKED",
      reason: reason,
      timestamp: new Date(),
    });

    res.json({
      message: "Certificate revoked successfully",
      certificateId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get certificate statistics (for admin)
exports.getCertificateStatistics = async (req, res) => {
  try {
    const snapshot = await db.collection("certificates").get();

    const certificates = snapshot.docs.map((doc) => doc.data());

    if (certificates.length === 0) {
      return res.json({
        totalCertificates: 0,
        activeCertificates: 0,
        revokedCertificates: 0,
        expiredCertificates: 0,
        averageScores: {},
      });
    }

    const currentDate = new Date();
    const activeCerts = certificates.filter((c) => c.status === "ACTIVE");
    const expiredCerts = certificates.filter(
      (c) =>
        c.status === "ACTIVE" && currentDate > new Date(c.validUntil)
    );

    const stats = {
      totalCertificates: certificates.length,
      activeCertificates: activeCerts.length,
      revokedCertificates: certificates.filter((c) => c.status === "REVOKED")
        .length,
      expiredCertificates: expiredCerts.length,
      averageFinalScore:
        certificates.reduce((sum, c) => sum + c.finalScore, 0) /
        certificates.length,
      byCourseName: {},
    };

    // Group by course
    certificates.forEach((cert) => {
      if (!stats.byCourseName[cert.courseName]) {
        stats.byCourseName[cert.courseName] = {
          count: 0,
          averageScore: 0,
        };
      }
      stats.byCourseName[cert.courseName].count++;
      stats.byCourseName[cert.courseName].averageScore += cert.finalScore;
    });

    // Calculate course averages
    for (const courseName in stats.byCourseName) {
      stats.byCourseName[courseName].averageScore =
        Math.round(stats.byCourseName[courseName].averageScore /
        stats.byCourseName[courseName].count);
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk check eligibility for multiple users
exports.bulkCheckEligibility = async (req, res) => {
  const { userIds, courseId } = req.body;

  if (!courseId || !Array.isArray(userIds) || userIds.length === 0) {
    return res
      .status(400)
      .json({ error: "courseId and userIds array are required" });
  }

  try {
    const results = await Promise.all(
      userIds.map(async (userId) => {
        const eligibility = await exports.checkCertificateEligibility(
          userId,
          courseId
        );
        return {
          userId,
          ...eligibility,
        };
      })
    );

    const eligible = results.filter((r) => r.eligible);
    const ineligible = results.filter((r) => !r.eligible);

    res.json({
      courseId,
      totalChecked: results.length,
      eligibleCount: eligible.length,
      ineligibleCount: ineligible.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
