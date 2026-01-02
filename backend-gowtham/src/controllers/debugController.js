const { db } = require("../config/firebase")

exports.testWrite = async (req, res) => {
  try {
    const ref = db.collection("debug").doc()
    const data = { createdAt: new Date(), note: "debug-write" }
    await ref.set(data)
    const snap = await ref.get()
    res.json({ ok: true, id: ref.id, data: snap.data() })
  } catch (err) {
    console.error("Debug write failed:", err)
    res.status(500).json({ ok: false, error: err.message || String(err) })
  }
}

exports.checkCourses = async (req, res) => {
  try {
    const snapshot = await db.collection("courses").get()
    const courses = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        hasModules: !!data.modules,
        modulesIsArray: Array.isArray(data.modules),
        modulesCount: Array.isArray(data.modules) ? data.modules.length : 0,
        modules: data.modules
      }
    })
    res.json({ ok: true, totalCourses: courses.length, courses })
  } catch (err) {
    console.error("Debug check courses failed:", err)
    res.status(500).json({ ok: false, error: err.message || String(err) })
  }
}
