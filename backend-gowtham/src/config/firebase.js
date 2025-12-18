const admin = require("firebase-admin");

// service account key load pannrom
const serviceAccount = require("../../serviceAccountKey.json");

// firebase initialize pannrom
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// firestore database instance
const db = admin.firestore();

module.exports = { admin, db };
