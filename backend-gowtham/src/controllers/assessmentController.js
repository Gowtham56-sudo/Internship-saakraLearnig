const { db } = require("../config/firebase");

// Create new assessment
exports.createAssessment = async (req, res) => {
  const { courseId, title, type, totalQuestions, passingScore } = req.body;

  // Validation
  if (!courseId || !title || !type) {
    return res
      .status(400)
      .json({ error: "courseId, title, and type are required" });
  }

  if (!["quiz", "test", "assignment", "project"].includes(type)) {
    return res.status(400).json({ error: "Invalid assessment type" });
  }

  try {
    const assessment = {
      courseId,
      title,
      type,
      totalQuestions: totalQuestions || 0,
      passingScore: passingScore || 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("assessments").add(assessment);

    res.status(201).json({
      message: "Assessment created successfully",
      assessmentId: docRef.id,
      assessment: { id: docRef.id, ...assessment },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit assessment score
exports.submitAssessmentScore = async (req, res) => {
  const { assessmentId, score, totalScore, answers, timeTaken } = req.body;
  const userId = req.user.uid;

  // Validation
  if (!assessmentId || score === undefined || !totalScore) {
    return res
      .status(400)
      .json({ error: "assessmentId, score, and totalScore are required" });
  }

  try {
    // Get assessment details
    const assessmentDoc = await db
      .collection("assessments")
      .doc(assessmentId)
      .get();

    if (!assessmentDoc.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const assessmentData = assessmentDoc.data();
    const percentage = Math.round((score / totalScore) * 100);
    const passed = percentage >= assessmentData.passingScore;

    const submissionData = {
      userId,
      assessmentId,
      courseId: assessmentData.courseId,
      score,
      totalScore,
      percentage,
      passed,
      answers: answers || [],
      timeTaken: timeTaken || 0,
      submittedAt: new Date(),
    };

    const docRef = await db
      .collection("assessment_submissions")
      .add(submissionData);

    res.status(201).json({
      message: "Assessment submitted successfully",
      submissionId: docRef.id,
      submission: { id: docRef.id, ...submissionData },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assessment by ID
exports.getAssessment = async (req, res) => {
  const { assessmentId } = req.params;

  try {
    const assessmentDoc = await db
      .collection("assessments")
      .doc(assessmentId)
      .get();

    if (!assessmentDoc.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    res.json({
      id: assessmentDoc.id,
      ...assessmentDoc.data(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all assessments for a course
exports.getCourseAssessments = async (req, res) => {
  const { courseId } = req.params;

  try {
    const snapshot = await db
      .collection("assessments")
      .where("courseId", "==", courseId)
      .get();

    const assessments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      courseId,
      totalAssessments: assessments.length,
      assessments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's assessment submissions
exports.getUserSubmissions = async (req, res) => {
  const { userId } = req.params;
  const { courseId, assessmentId } = req.query;

  try {
    let query = db
      .collection("assessment_submissions")
      .where("userId", "==", userId);

    if (courseId) {
      query = query.where("courseId", "==", courseId);
    }

    if (assessmentId) {
      query = query.where("assessmentId", "==", assessmentId);
    }

    const snapshot = await query.orderBy("submittedAt", "desc").get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate statistics
    const stats = {
      totalSubmissions: submissions.length,
      averageScore: submissions.length
        ? Math.round(
            submissions.reduce((sum, s) => sum + s.percentage, 0) /
              submissions.length
          )
        : 0,
      passedCount: submissions.filter((s) => s.passed).length,
      failedCount: submissions.filter((s) => !s.passed).length,
    };

    res.json({
      userId,
      submissions,
      statistics: stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assessment analytics (for admin)
exports.getAssessmentAnalytics = async (req, res) => {
  const { assessmentId } = req.params;

  try {
    const assessmentDoc = await db
      .collection("assessments")
      .doc(assessmentId)
      .get();

    if (!assessmentDoc.exists) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const snapshot = await db
      .collection("assessment_submissions")
      .where("assessmentId", "==", assessmentId)
      .get();

    const submissions = snapshot.docs.map((doc) => doc.data());

    if (submissions.length === 0) {
      return res.json({
        assessmentId,
        totalSubmissions: 0,
        averageScore: 0,
        passRate: 0,
        scoreDistribution: {},
      });
    }

    // Calculate analytics
    const scoreDistribution = {
      excellent: submissions.filter((s) => s.percentage >= 90).length,
      good: submissions.filter((s) => s.percentage >= 75 && s.percentage < 90)
        .length,
      average: submissions.filter((s) => s.percentage >= 50 && s.percentage < 75)
        .length,
      poor: submissions.filter((s) => s.percentage < 50).length,
    };

    const averageScore = Math.round(
      submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
    );

    const passRate = Math.round(
      (submissions.filter((s) => s.passed).length / submissions.length) * 100
    );

    res.json({
      assessmentId,
      assessmentTitle: assessmentDoc.data().title,
      totalSubmissions: submissions.length,
      averageScore,
      passRate,
      scoreDistribution,
      medianScore: Math.round(
        submissions.sort((a, b) => a.percentage - b.percentage)[
          Math.floor(submissions.length / 2)
        ].percentage
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
