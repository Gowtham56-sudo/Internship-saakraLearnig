const { db, admin } = require("../config/firebase");

async function uploadBufferToStorage(file, destination) {
  if (!admin || typeof admin.storage !== "function") {
    throw new Error("Firebase Storage is not initialized on the server (admin.storage is missing)")
  }

  const bucket = admin.storage().bucket()
  if (!bucket) throw new Error("No default storage bucket available")

  const fileRef = bucket.file(destination)
  await fileRef.save(file.buffer, { contentType: file.mimetype })
  try {
    if (typeof fileRef.makePublic === "function") {
      await fileRef.makePublic()
    }
  } catch (e) {
    // ignore permission errors but log
    console.warn("uploadBufferToStorage.makePublic failed:", e.message)
  }

  return `https://storage.googleapis.com/${bucket.name}/${destination}`
}

// Trainer add course
exports.addCourse = async (req, res) => {
  // Expect multipart/form-data with optional files
  try {
    const { title, description, level, category } = req.body;
    const modules = req.body.modules ? JSON.parse(req.body.modules) : [];

    if (!title || !description) {
      return res.status(400).json({ error: "title and description are required" });
    }

    const courseRef = await db.collection("courses").add({
      title,
      description,
      level: level || "",
      category: category || "",
      trainerId: req.user.uid,
      createdAt: new Date(),
      status: "published",
      modules: [],
    });

    const courseId = courseRef.id;

    // Handle uploads
    const files = req.files || {};

    // thumbnail
    if (files.thumbnail && files.thumbnail[0]) {
      const thumb = files.thumbnail[0];
      const dest = `courses/${courseId}/thumbnail_${Date.now()}_${thumb.originalname}`;
      try {
        const url = await uploadBufferToStorage(thumb, dest);
        await db.collection("courses").doc(courseId).update({ thumbnail: url });
      } catch (err) {
        console.error("Failed to upload thumbnail", err);
      }
    }

    // module files mapping: match by originalname provided in module.videoFileName
    const moduleFiles = files.moduleFiles || [];
    const enrichedModules = [];

    for (const mod of modules) {
      const copy = { ...mod };
      if (copy.videoFileName) {
        const match = moduleFiles.find((f) => f.originalname === copy.videoFileName);
        if (match) {
          const dest = `courses/${courseId}/modules/${Date.now()}_${match.originalname}`;
          try {
            const url = await uploadBufferToStorage(match, dest);
            copy.videoUrl = url;
          } catch (err) {
            console.error("Failed to upload module video", err);
          }
        }
        delete copy.videoFileName;
      }
      enrichedModules.push(copy);
    }

    // Always update modules field to ensure it exists
    await db.collection("courses").doc(courseId).update({ modules: enrichedModules });

    res.status(201).json({ message: "Course created", courseId });
  } catch (error) {
    console.error("addCourse error:", error && (error.stack || error.message || error))
    const resp = { error: "Internal server error" }
    if (process.env.NODE_ENV !== "production") {
      resp.details = error && (error.message || String(error))
      resp.stack = error && error.stack
    }
    res.status(500).json(resp)
  }
};

// Student enroll course
exports.enrollCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    console.log("enrollCourse called", { uid: req.user?.uid, courseId })
    // Prevent duplicate enrollment
    const existing = await db.collection('enrollments')
      .where('userId', '==', req.user.uid)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Ensure course document also contains user in students array
      try {
        await db.collection('courses').doc(courseId).update({
          students: admin.firestore.FieldValue.arrayUnion(req.user.uid),
        })
      } catch (e) {
        // ignore - best-effort
        console.warn('enrollCourse: failed to arrayUnion existing enrollment', e.message || e)
      }
      return res.json({ message: 'Already enrolled' })
    }

    // Create enrollment record
    await db.collection("enrollments").add({
      userId: req.user.uid,
      courseId,
      enrolledAt: new Date(),
    });

    // Add user to course.students array so queries using array-contains work
    try {
      await db.collection('courses').doc(courseId).update({
        students: admin.firestore.FieldValue.arrayUnion(req.user.uid),
      })
      console.log('enrollCourse: course.students updated', { courseId, uid: req.user.uid })
    } catch (err) {
      console.warn('enrollCourse: failed to update course.students', err && (err.message || err))
    }

    res.json({ message: "Enrolled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const snapshot = await db.collection("courses").get();
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single course by id
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params
    const doc = await db.collection("courses").doc(id).get()
    if (!doc.exists) return res.status(404).json({ error: "Course not found" })
    
    const courseData = doc.data()
    // Ensure modules is always an array
    if (!courseData.modules || !Array.isArray(courseData.modules)) {
      courseData.modules = []
    }
    
    console.log(`getCourseById: ${id}, modules count: ${courseData.modules.length}`)
    return res.json({ id: doc.id, ...courseData })
  } catch (error) {
    console.error("getCourseById error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Public courses for development (no auth) — use only in local/dev
exports.getPublicCourses = async (req, res) => {
  try {
    const snapshot = await db.collection("courses").get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get students enrolled in a course
exports.getCourseStudents = async (req, res) => {
  const { courseId } = req.params;

  try {
    const enrollSnap = await db.collection('enrollments').where('courseId', '==', courseId).get();
    if (enrollSnap.empty) {
      return res.json({ courseId, students: [] });
    }

    const userIds = enrollSnap.docs.map(d => d.data().userId);

    if (userIds.length === 0) return res.json({ courseId, students: [] });

    // Fetch user docs in batches
    const studentDocs = [];
    const chunkSize = 10;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const usersSnap = await db.getAll(...chunk.map(id => db.collection('users').doc(id)));
      usersSnap.forEach(u => {
        if (u.exists) studentDocs.push({ id: u.id, ...u.data() });
      });
    }

    // Attach progress per student for this course
    const progressMap = {};
    await Promise.all(userIds.map(async (uid) => {
      try {
        const progSnap = await db.collection('progress')
          .where('userId', '==', uid)
          .where('courseId', '==', courseId)
          .limit(1)
          .get();
        if (!progSnap.empty) {
          const data = progSnap.docs[0].data();
          progressMap[uid] = {
            completedPercentage: Number(data.completedPercentage || 0),
            completedModuleIds: data.completedModuleIds || [],
            updatedAt: data.updatedAt || data.completedAt || null,
          };
        }
      } catch (e) {
        // ignore per-user progress errors
      }
    }));

    const enriched = studentDocs.map((s) => ({
      ...s,
      progress: progressMap[s.id] || null,
    }));

    res.json({ courseId, students: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
