var admin = require("firebase-admin");

var serviceAccount = require("./firebase_key/as-call-firebase-adminsdk-fbsvc-ef9d33a36a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
