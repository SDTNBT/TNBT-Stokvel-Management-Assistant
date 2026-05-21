const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if service account key file exists
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      // Option 1: Using service account key file
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized using service account file');
    } 
    // Option 2: Using environment variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase Admin initialized using environment variables');
    }
    else {
      console.log('⚠️ Firebase Admin not configured - running in demo mode');
    }
  } catch (error) {
    console.error('❌ Firebase Admin init failed:', error.message);
  }
}

const verifyAndSyncUser = async (token) => {
  try {
    // 1. Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // 2. Try to find the user by UID
    let user = await User.findOne({ firebaseUid: uid });

    // 3. If not found by UID, check by Email (for older Google users)
    if (!user) {
      user = await User.findOne({ email: email });
      
      if (user) {
        // Link the UID to the existing email record
        user.firebaseUid = uid;
        await user.save();
        console.log(`🔗 Linked Firebase UID to existing user: ${email}`);
      } else {
        // 4. Create new user if they don't exist at all
        user = new User({
          firebaseUid: uid,
          email: email,
          name: name || "New Member",
          surname: "",
          role: "Member"
        });
        await user.save();
        console.log(`✨ New user created: ${email}`);
      }
    }
    return user;
  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
};

router.post('/register', async (req, res) => {
  const { token, name, surname } = req.body;

  // TEMPORARY: Skip Firebase verification for testing (remove in production)
  const SKIP_FIREBASE = process.env.SKIP_FIREBASE === 'true' || true; // Set to false in production

  try {
    let user;

    if (SKIP_FIREBASE) {
      // Mock login for testing - no Firebase required
      console.log('⚠️ Running in demo mode - skipping Firebase verification');
      
      const email = req.body.email || `${Date.now()}@test.com`;
      
      user = await User.findOne({ email: email });
      
      if (!user) {
        user = new User({
          firebaseUid: 'demo-' + Date.now(),
          email: email,
          name: name || 'Demo User',
          surname: surname || '',
          role: 'Member'
        });
        await user.save();
        console.log(`✨ Demo user created: ${email}`);
      } else {
        console.log(`🔑 Demo user logged in: ${email}`);
      }
      
      return res.status(200).json({ user });
    }

    // Production: Verify token with Firebase
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    // Look for the user
    user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || decodedToken.name || "New Member",
        surname: surname || "",
        role: 'Member'
      });
      await user.save();
      console.log(`✨ New user registered: ${email}`);
    } else {
      console.log(`🔑 Existing user logged in: ${email}`);
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

// Optional: Get user by email endpoint
router.get('/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
