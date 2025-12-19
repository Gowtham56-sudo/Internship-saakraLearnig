const { db } = require("../config/firebase");

// Update progress
exports.updateProgress = async (req, res) => {
  const { courseId, percentage } = req.body;

  try {
    await db.collection("progress").add({
      userId: req.user.uid,
      courseId,
      completedPercentage: percentage,
      updatedAt: new Date(),
    });

    res.json({ message: "Progress updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get progress of user
exports.getProgress = async (req, res) => {
  try {
    const snapshot = await db
      .collection("progress")
      .where("userId", "==", req.params.uid)
      .get();

    const progress = snapshot.docs.map(doc => doc.data());
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
