const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Because server.js already initialized Firebase, this works automatically!
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // This contains the UID from Firebase
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    res.status(401).json({ message: "Unauthorized: Invalid Token" });
  }
};

module.exports = verifyFirebaseToken;