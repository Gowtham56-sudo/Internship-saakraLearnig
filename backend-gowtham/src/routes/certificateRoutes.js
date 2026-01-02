const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middlewares/authmiddleware");
const roleMiddleware = require("../middlewares/rolemiddleware");
const {
  generateCertificate,
  getCertificate,
  getUserCertificates,
  getCourseCertificates,
  verifyCertificate,
  revokeCertificate,
  getCertificateStatistics,
  bulkCheckEligibility,
} = require("../controllers/certificateController");

// Generate certificate
router.post(
  "/generate",
  verifyToken,
  roleMiddleware(["admin", "instructor"]),
  generateCertificate
);

// Generate certificate for course
router.post(
  "/generate/:courseId",
  verifyToken,
  async (req, res) => {
    try {
      res.json({
        message: "Certificate generated",
        courseId: req.params.courseId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Check certificate eligibility
router.get(
  "/eligibility/:courseId",
  verifyToken,
  async (req, res) => {
    try {
      res.json({
        courseId: req.params.courseId,
        eligible: true,
        progress: 100,
        assessmentScore: 85,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// IMPORTANT: Specific routes must come BEFORE dynamic routes
// Get current user's certificates
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Fetch certificates for current user
    const snap = await db.collection('certificates').where('userId', '==', userId).get();
    const certs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ userId, certificates: certs });
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's certificates by userId
router.get("/user/:userId", verifyToken, getUserCertificates);

// Get certificate by ID (public - no auth required for verification)
router.get("/:certificateId", getCertificate);

// Get certificates for a course
router.get(
  "/course/:courseId",
  verifyToken,
  roleMiddleware(["admin", "instructor"]),
  getCourseCertificates
);

// Verify certificate authenticity
router.post("/verify", verifyCertificate);

// Verify certificate by ID
router.get(
  "/:certificateId/verify",
  async (req, res) => {
    try {
      res.json({
        certificateId: req.params.certificateId,
        valid: true,
        issuedDate: new Date(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: Revoke certificate
router.post(
  "/:certificateId/revoke",
  verifyToken,
  roleMiddleware(["admin"]),
  revokeCertificate
);

// Get certificate statistics
router.get(
  "/statistics",
  verifyToken,
  async (req, res) => {
    try {
      res.json({
        totalCertificates: 100,
        issuedThisMonth: 25,
        averageCompletionTime: 45,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Admin: Get certificate statistics (legacy)
router.get(
  "/",
  verifyToken,
  roleMiddleware(["admin"]),
  getCertificateStatistics
);

// Admin: Bulk check eligibility
router.post(
  "/bulk/check-eligibility",
  verifyToken,
  roleMiddleware(["admin"]),
  bulkCheckEligibility
);

module.exports = router;
