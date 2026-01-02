const { db } = require("../config/firebase");

// Create a new session
exports.createSession = async (req, res) => {
  const trainerId = req.user && req.user.uid;
  const {
    courseId,
    title,
    description,
    date,
    startTime,
    duration,
    type,
    maxStudents,
    meetingLink,
  } = req.body;

  if (!trainerId) return res.status(401).json({ error: "Unauthorized" });
  if (!courseId || !title || !date || !startTime || !duration || !type) {
    return res.status(400).json({ error: "courseId, title, date, startTime, duration and type are required" });
  }

  try {
    const session = {
      trainerId,
      courseId,
      title,
      description: description || "",
      date,
      startTime,
      duration,
      type,
      maxStudents: maxStudents ? Number(maxStudents) : null,
      meetingLink: meetingLink || null,
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("sessions").add(session);

    // include trainer name in response when available
    try {
      const userDoc = await db.collection("users").doc(trainerId).get();
      const trainerName = userDoc.exists ? (userDoc.data().name || null) : null;
      res.status(201).json({ message: "Session created", id: docRef.id, session: { id: docRef.id, ...session, trainerName } });
    } catch (e) {
      res.status(201).json({ message: "Session created", id: docRef.id, session: { id: docRef.id, ...session } });
    }
  } catch (error) {
    console.error("getTrainerSessions error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get sessions for authenticated trainer
exports.getTrainerSessions = async (req, res) => {
  const trainerId = req.user && req.user.uid;
  if (!trainerId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Avoid composite index requirement by fetching trainer sessions and sorting in code
    const snapshot = await db.collection("sessions").where("trainerId", "==", trainerId).get();
    let sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    sessions = sessions.sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(a.createdAt || 0);
      const dbt = b.date ? new Date(b.date) : new Date(b.createdAt || 0);
      return da - dbt;
    });

    // enrich with trainer name when possible (all sessions belong to same trainer)
    try {
      const userDoc = await db.collection("users").doc(trainerId).get();
      const trainerName = userDoc.exists ? (userDoc.data().name || null) : null;
      sessions = sessions.map((s) => ({ ...s, trainerName }));
    } catch (e) {
      // ignore enrichment errors
    }

    res.json(sessions);
  } catch (error) {
    console.error("getSessionById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get sessions for a specific course (student view)
exports.getCourseSessions = async (req, res) => {
  const { courseId } = req.params;
  if (!courseId) return res.status(400).json({ error: "courseId required" });

  try {
    const snapshot = await db.collection("sessions").where("courseId", "==", courseId).get();
    let sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    sessions = sessions.sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(a.createdAt || 0);
      const dbt = b.date ? new Date(b.date) : new Date(b.createdAt || 0);
      return da - dbt;
    });

    res.json({ courseId, sessions });
  } catch (error) {
    console.error("getCourseSessions error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single session by id (trainer must own it)
exports.getSessionById = async (req, res) => {
  const trainerId = req.user && req.user.uid;
  const { id } = req.params;
  if (!trainerId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const doc = await db.collection("sessions").doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: "Session not found" });
    const data = doc.data();
    if (data.trainerId !== trainerId) return res.status(403).json({ error: "Forbidden" });
    // attach trainer name
    try {
      const userDoc = await db.collection("users").doc(trainerId).get();
      const trainerName = userDoc.exists ? (userDoc.data().name || null) : null;
      res.json({ id: doc.id, ...data, trainerName });
    } catch (e) {
      res.json({ id: doc.id, ...data });
    }
  } catch (error) {
    console.error("updateSession error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update session
exports.updateSession = async (req, res) => {
  const trainerId = req.user && req.user.uid;
  const { id } = req.params;
  const updates = req.body;
  if (!trainerId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const docRef = db.collection("sessions").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Session not found" });
    const data = doc.data();
    if (data.trainerId !== trainerId) return res.status(403).json({ error: "Forbidden" });

    updates.updatedAt = new Date();
    await docRef.update(updates);

    const updated = await docRef.get();
    // include trainer name in updated response
    try {
      const userDoc = await db.collection("users").doc(trainerId).get();
      const trainerName = userDoc.exists ? (userDoc.data().name || null) : null;
      res.json({ id: updated.id, ...updated.data(), trainerName });
    } catch (e) {
      res.json({ id: updated.id, ...updated.data() });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
