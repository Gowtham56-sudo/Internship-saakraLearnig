const { db } = require("../config/firebase");

// Get single user profile
exports.getUser = async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.params.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
