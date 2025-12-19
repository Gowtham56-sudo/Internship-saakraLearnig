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
