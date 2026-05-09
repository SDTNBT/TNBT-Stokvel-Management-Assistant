const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const admin = require('firebase-admin');

const verifyAndSyncUser = async (token) => {
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
    } else {
      // 4. Create new user if they don't exist at all
      user = new User({
        firebaseUid: uid,
        email: email,
        name: name || "New Member",
        role: "Member"
      });
      await user.save();
    }
  }
  return user;
};


router.post('/register', async (req, res) => {
  const { token, name, surname } = req.body;

  try {
    // 1. Verify the token (Works for both Manual and Google!)
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    // 2. Look for the user
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // 3. CREATE if they are new
      // If Google login, name comes from decodedToken. 
      // If Manual signup, name comes from req.body.
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
      const needsUpdate = (user.name === "New Member" && name) || (name && user.name !== name) || (surname && user.surname !== surname);
      if (needsUpdate) {
        if (name) user.name = name;
        if (surname) user.surname = surname;
        await user.save();
        console.log(`🔄 Updated existing user details for: ${email}`);
      }
      // 4. LOGIN if they already exist
      else{
        console.log(`🔑 Existing user logged in: ${email}`);
      }
    }

    // 5. Always return the user profile
    res.status(200).json({ user });

  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

module.exports = router;