const admin = require('firebase-admin');
const User = require('../models/User');

exports.hardDeleteUserAccount = async (req, res) => {
  try {
    const { email } = req.body; // Pass the email you want to delete via Postman

    // 1. Find them in the database
    const user = await User.findOne({ email: email });
    
    // 2. Delete from Firebase using their email
    try {
      const firebaseUser = await admin.auth().getUserByEmail(email);
      await admin.auth().deleteUser(firebaseUser.uid);
      console.log("Deleted from Firebase");
    } catch (fbError) {
      console.log("User not in Firebase or already deleted.");
    }

    // 3. Delete from MongoDB
    if (user) {
      await User.findByIdAndDelete(user._id);
      console.log("Deleted from MongoDB");
    }

    res.status(200).json({ message: `Successfully wiped ${email} from all systems.` });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
