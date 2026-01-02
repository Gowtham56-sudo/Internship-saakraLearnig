const admin = require("firebase-admin");

// service account key load pannrom
const serviceAccount = require("../../serviceAccountKey.json");

// firebase initialize pannrom
// Default storage bucket: from env or service account project_id
const defaultBucket = process.env.FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id ? `${serviceAccount.project_id}.appspot.com` : undefined)

const initConfig = {
  credential: admin.credential.cert(serviceAccount),
}
if (defaultBucket) initConfig.storageBucket = defaultBucket

admin.initializeApp(initConfig)

// firestore database instance
const db = admin.firestore();

module.exports = { admin, db };
