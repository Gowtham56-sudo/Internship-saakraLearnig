const { db } = require("../config/firebase");

// Trainer add course
exports.addCourse = async (req, res) => {
  const { title, description } = req.body;

  try {
    const courseRef = await db.collection("courses").add({
      title,
      description,
      trainerId: req.user.uid,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Course created",
      courseId: courseRef.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student enroll course
exports.enrollCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    await db.collection("enrollments").add({
      userId: req.user.uid,
      courseId,
      enrolledAt: new Date(),
    });

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

    res.json({ courseId, students: studentDocs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
