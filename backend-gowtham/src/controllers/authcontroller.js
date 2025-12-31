const { admin, db } = require("../config/firebase");

/**
 * REGISTER
 * Default role = student
 * Check for duplicate email before creating user
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Step 1: Check if email already exists in Firestore
    const existingUser = await db.collection("users").where("email", "==", email).get();
    
    if (!existingUser.empty) {
      return res.status(409).json({ 
        error: "This email is already registered. Please use a different email or try logging in." 
      });
    }

    // Step 2: Try to create Firebase user
    let user;
    try {
      user = await admin.auth().createUser({
        email,
        password,
      });
    } catch (firebaseError) {
      // Handle Firebase-specific errors
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(409).json({ 
          error: "This email is already in use. Please try a different email." 
        });
      }
      if (firebaseError.code === 'auth/invalid-email') {
        return res.status(400).json({ 
          error: "Please enter a valid email address." 
        });
      }
      if (firebaseError.code === 'auth/weak-password') {
        return res.status(400).json({ 
          error: "Password must be at least 6 characters." 
        });
      }
      throw firebaseError;
    }

    // Step 3: Store user details in Firestore
    await db.collection("users").doc(user.uid).set({
      name,
      email,
      role: "student", // default role
      status: "active",
      createdAt: new Date(),
      phone: "",
      institution: "",
      department: ""
    });

    res.status(201).json({
      message: "User registered successfully",
      uid: user.uid,
      user: {
        name,
        email,
        role: "student"
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ 
      error: error.message || "Registration failed. Please try again." 
    });
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

    // If the account was created directly in Firebase Console (no Firestore profile yet),
    // auto-provision a Firestore user document using the Firebase custom claim `role` (if present).
    let userData;
    if (!userDoc.exists) {
      const userRecord = await admin.auth().getUser(uid);
      const roleFromClaims = userRecord.customClaims?.role || "student"; // default to student when no claim

      userData = {
        name: userRecord.displayName || userRecord.email || "User",
        email: userRecord.email || "",
        role: roleFromClaims,
        status: "active",
        createdAt: new Date(),
        phone: userRecord.phoneNumber || "",
        institution: "",
        department: "",
      };

      await db.collection("users").doc(uid).set(userData);
    } else {
      userData = userDoc.data();
    }

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
 * ADMIN: Create trainer account (email/password) and assign role
 */
exports.createTrainer = async (req, res) => {
  const { name, email, password, phone = "" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }

  try {
    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone || undefined,
    });

    // Set custom claim for role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "trainer" });

    // Persist profile in Firestore
    const profile = {
      name,
      email,
      role: "trainer",
      status: "active",
      createdAt: new Date(),
      phone: phone || "",
      institution: "",
      department: "",
    };

    await db.collection("users").doc(userRecord.uid).set(profile);

    res.status(201).json({
      message: "Trainer account created",
      uid: userRecord.uid,
      user: profile,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ADMIN: Create admin account (email/password) and assign role
 */
exports.createAdmin = async (req, res) => {
  const { name, email, password, phone = "" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone || undefined,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin" });

    const profile = {
      name,
      email,
      role: "admin",
      status: "active",
      createdAt: new Date(),
      phone: phone || "",
      institution: "",
      department: "",
    };

    await db.collection("users").doc(userRecord.uid).set(profile);

    res.status(201).json({
      message: "Admin account created",
      uid: userRecord.uid,
      user: profile,
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
