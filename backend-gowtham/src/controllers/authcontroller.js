const { admin, db } = require("../config/firebase");

/**
 * REGISTER
 * Default role = student
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Firebase Authentication user create
    const user = await admin.auth().createUser({
      email,
      password,
    });

    // Firestore la user details store pannrom
    await db.collection("users").doc(user.uid).set({
      name,
      email,
      role: "student", // default role
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "User registered successfully",
      uid: user.uid,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * LOGIN
 * Frontend-la irundhu ID token anuppanum
 */
exports.login = async (req, res) => {
  const { uid } = req.body;

  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    res.json({
      message: "Login success",
      role: userData.role,
      user: userData,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ADMIN – role change
 */
exports.updateRole = async (req, res) => {
  const { uid, role } = req.body;

  try {
    await db.collection("users").doc(uid).update({
      role,
    });

    res.json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
