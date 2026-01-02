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
      console.error("Firebase createUser error:", firebaseError)
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
      // return detailed code when available to help debugging
      return res.status(500).json({ error: firebaseError.message || firebaseError.code || "Firebase createUser failed" })
    }

    // Step 3: Store user details in Firestore
    try {
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
    } catch (firestoreError) {
      console.error("Firestore write error during registration:", firestoreError)
      // Attempt to clean up the created Firebase Auth user to avoid orphaned auth entries
      try {
        await admin.auth().deleteUser(user.uid)
        console.log("Deleted orphaned auth user due to Firestore failure", user.uid)
      } catch (cleanupErr) {
        console.error("Failed to delete orphaned auth user:", cleanupErr)
      }

      return res.status(500).json({ error: firestoreError.message || String(firestoreError) })
    }
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
  // Allow uid from body (login flow) or use authenticated uid from middleware
  const { uid: bodyUid } = req.body || {}

  // If Authorization header present, verify ID token and ensure it matches bodyUid (if provided)
  const authHeader = req.headers.authorization || ""
  let tokenUid = null
  try {
    if (authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split(" ")[1]
      // Allow demo-token bypass
      if (!idToken.startsWith("demo-token-")) {
        const decoded = await admin.auth().verifyIdToken(idToken)
        tokenUid = decoded.uid || decoded.sub
      } else {
        tokenUid = idToken.replace("demo-token-", "")
      }
    }
  } catch (err) {
    console.error("Error verifying ID token in login:", err)
    return res.status(401).json({ error: "Invalid ID token" })
  }

  // If both a body UID and a token UID are present, they must match
  if (bodyUid && tokenUid && bodyUid !== tokenUid) {
    return res.status(403).json({ error: "UID mismatch between token and request body" })
  }

  const uid = bodyUid || tokenUid || req.user?.uid || req.user?.sub

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
 * GET /me - returns current user's Firestore profile
 */
exports.me = async (req, res) => {
  try {
    const uid = req.user?.uid || req.user?.sub
    if (!uid) return res.status(401).json({ error: "Unauthenticated" })

    const userDoc = await db.collection("users").doc(uid).get()
    let userData
    if (!userDoc.exists) {
      const userRecord = await admin.auth().getUser(uid)
      const roleFromClaims = userRecord.customClaims?.role || "student"
      userData = {
        name: userRecord.displayName || userRecord.email || "User",
        email: userRecord.email || "",
        role: roleFromClaims,
        status: "active",
        createdAt: new Date(),
        phone: userRecord.phoneNumber || "",
        institution: "",
        department: "",
      }
      await db.collection("users").doc(uid).set(userData)
    } else {
      userData = userDoc.data()
    }

    // Include uid so frontend can correlate trainer-owned resources
    res.json({ message: "OK", uid, role: userData.role, user: userData })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

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

/**
 * UPDATE PROFILE
 * Protected - updates Firestore users/{uid}
 */
exports.updateProfile = async (req, res) => {
  try {
    const uid = req.user?.uid || req.user?.sub
    if (!uid) return res.status(401).json({ error: "Unauthenticated" })

    const allowed = ["name", "phone", "city", "state", "bio", "education", "avatar"]
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    updates.updatedAt = new Date()

    await db.collection("users").doc(uid).set(updates, { merge: true })

    const userDoc = await db.collection("users").doc(uid).get()
    res.json({ message: "Profile updated", user: userDoc.data() })
  } catch (error) {
    console.error("updateProfile error:", error)
    res.status(500).json({ error: error.message || String(error) })
  }
}
