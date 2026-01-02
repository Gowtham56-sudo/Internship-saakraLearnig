const express = require("express");
console.log("Dashboard route loaded");
const router = express.Router();
const verifyToken = require("../middlewares/authmiddleware");
const { db } = require("../config/firebase");
const queryOptimization = require("../services/queryOptimizationService");

// GET /api/dashboard
router.get("/", verifyToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      console.error("Dashboard: No UID in req.user", req.user);
      return res.status(401).json({ error: "Unauthorized: No UID" });
    }
    console.log('dashboard: request for uid', uid)
    // Compute user-specific dashboard data from real collections
    // Fetch enrollments for user
    const enrollSnap = await db.collection("enrollments").where("userId", "==", uid).get();
    const enrolledCourseIds = enrollSnap.docs.map((d) => d.data().courseId || null).filter(Boolean).map(String);

    // Deduplicate course ids so one enrollment per course counts once
    const uniqueCourseIds = Array.from(new Set(enrolledCourseIds));

    // Fetch course docs for enrolled courses (if any)
    let courses = [];
    try {
      if (uniqueCourseIds.length > 0) {
        const courseDocs = await Promise.all(
          uniqueCourseIds.map((id) => db.collection("courses").doc(id).get())
        );
        courses = courseDocs.filter((d) => d.exists).map((d) => ({ id: d.id, ...d.data() }));
      }
      console.log('dashboard: fetched unique courses count', courses.length, courses.map(c => c.id))
    } catch (courseErr) {
      console.error("Dashboard: Error fetching courses", courseErr);
      courses = [];
    }

    // Get user progress records (optimized)
    let progressRecords = [];
    try {
      progressRecords = await queryOptimization.getOptimizedUserProgress(uid);
    } catch (pErr) {
      console.error('Dashboard: failed to get user progress', pErr);
      progressRecords = [];
    }

    // Certificates count for user
    let certificatesCount = 0;
    try {
      const certSnap = await db.collection('certificates').where('userId', '==', uid).get();
      certificatesCount = certSnap.size;
    } catch (cErr) {
      console.error('Dashboard: failed to get certificates', cErr);
      certificatesCount = 0;
    }

    // Compute stats
    const completedCourses = progressRecords.filter((p) => p.completed || p.completedPercentage === 100).length || 0;
    const overallProgress = progressRecords.length > 0 ? Math.round(progressRecords.reduce((s, r) => s + (r.completedPercentage || 0), 0) / progressRecords.length) : 0;

    // Try to compute total learning hours from course metadata if available
    const totalHours = courses.reduce((sum, c) => {
      const h = typeof c.estimatedHours === 'number' ? c.estimatedHours : 0;
      return sum + h;
    }, 0);

    // Build a map of courseId -> course doc (title, etc.) for use in activities
    const courseMap = new Map()
    courses.forEach((c) => courseMap.set(String(c.id), c))

    // If progress records reference other courses, load those course docs too
    try {
      const referencedIds = Array.from(
        new Set(progressRecords.map((p) => p.courseId).filter(Boolean).map(String))
      )
      const missingIds = referencedIds.filter((id) => !courseMap.has(id))
      if (missingIds.length > 0) {
        const extraCourseDocs = await Promise.all(missingIds.map((id) => db.collection('courses').doc(id).get()))
        extraCourseDocs.forEach((d) => {
          if (d.exists) courseMap.set(String(d.id), { id: d.id, ...d.data() })
        })
      }
    } catch (mapErr) {
      console.error('Dashboard: failed to load referenced course docs', mapErr)
    }

    // Annotate courses with user-specific progress and module counts
    const annotatedCourses = courses.map((c) => {
      const course = { ...c }
      const prog = progressRecords.find((p) => String(p.courseId) === String(c.id))
      const progressPct = prog ? Number(prog.completedPercentage || prog.completedPercentage === 0 ? prog.completedPercentage : 0) : 0

      const totalModules = Array.isArray(course.modules) ? course.modules.length : 0
      const completedModules = totalModules > 0 ? Math.round((progressPct / 100) * totalModules) : 0

      let currentModule = null
      if (Array.isArray(course.modules) && totalModules > 0) {
        const idx = Math.min(totalModules - 1, Math.floor((progressPct / 100) * totalModules))
        currentModule = course.modules[idx] ? (course.modules[idx].title || course.modules[idx].name || null) : null
      }

      return {
        ...course,
        progress: progressPct,
        totalModules,
        completedModules,
        currentModule,
      }
    })

    const stats = {
      completedCourses,
      totalHours,
      certificates: certificatesCount,
      overallProgress,
      enrolledCount: annotatedCourses.length,
    };

    // Recent activities: combine recent progress updates and certificate issuances and enrollments
    const activities = [];
    try {
      // recent progress
      progressRecords.slice(0, 5).forEach((p) => {
        const course = courseMap.get(String(p.courseId))
        const title = course ? course.title || course.name || String(p.courseId) : String(p.courseId)
        activities.push({ id: `progress-${p.id}`, content: `Progress updated: ${p.completedPercentage}% (${title})`, timestamp: p.lastUpdatedAt || p.updatedAt || null });
      });
      // recent enrollments
      enrollSnap.docs.slice(-5).reverse().forEach((d) => {
        const data = d.data();
        const course = courseMap.get(String(data.courseId))
        const title = course ? course.title || course.name || String(data.courseId) : String(data.courseId)
        activities.push({ id: `enroll-${d.id}`, content: `Enrolled in ${title}`, timestamp: data.enrolledAt || null });
      });
      // recent certificates
      const certs = await db.collection('certificates').where('userId', '==', uid).orderBy('issuedDate', 'desc').limit(5).get();
      certs.docs.forEach((cd) => {
        const data = cd.data();
        const course = courseMap.get(String(data.courseId))
        const title = course ? course.title || course.name || String(data.courseId) : String(data.courseId)
        activities.push({ id: `cert-${cd.id}`, content: `Certificate issued: ${title}`, timestamp: data.issuedDate || null });
      });
    } catch (actErr) {
      console.error('Dashboard: failed to build activities', actErr);
    }

    // sort activities by timestamp (newest first) if timestamps are available
    activities.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });

    res.json({ stats, courses: annotatedCourses, activities });
  } catch (err) {
    console.error("Dashboard: General error", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
