const admin = require('firebase-admin');

// 1. Safely initialize Firebase ONLY if it hasn't been initialized yet by server.js
if (!admin.apps.length) {
    try {
        let serviceAccount;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Live on Render: Use the secure environment variable
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else {
            // Local testing: Fall back to the local file
            // (Assuming this file is inside backend/middleware/)
            serviceAccount = require("../serviceAccountKey.json");
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Firebase Admin Setup Error in Middleware:", error.message);
    }
}

// 2. The Middleware Function
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send("Unauthorized");

  try {
    // Firebase verifies the token for you!
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // This contains the UID
    next();
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
};

// 3. CRITICAL: Export the middleware so your routes can actually use it!
<<<<<<< Updated upstream
module.exports = verifyFirebaseToken;
=======
module.exports = verifyFirebaseToken;
>>>>>>> Stashed changes
