const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Member = require('../models/Member');

const { hardDeleteUserAccount } = require('../controllers/usersController'); 

// Placeholder for Developer 2's security middleware
// const { verifyToken } = require('../middleware/authMiddleware');

// Route: GET /api/users/profile
// Description: Get the current logged-in user's profile data
// Access: Private (Requires Token)
router.get('/profile', /* verifyToken, */ (req, res) => {
  // TODO for Backend Dev 2:
  // 1. Use the User ID decoded from the JWT (e.g., req.user.id)
  // 2. Fetch the user document from MongoDB (exclude the password/sensitive data)
  // 3. Return the user profile to the frontend
  res.status(200).json({ message: 'User profile fetched successfully. Database connection pending.' });
});

// Route: PUT /api/users/assign-role
// Description: Assign or update a user's role during onboarding
// Access: Private (Requires Token)
router.put('/assign-role', /* verifyToken, */ (req, res) => {
  const { role } = req.body;
  const validRoles = ['Admin', 'Member', 'Treasurer'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role selected.' });
  }

  // TODO for Backend Dev 2:
  // 1. Find the logged-in user in MongoDB
  // 2. Update their 'role' field to the requested role
  // 3. Save the document
  res.status(200).json({ message: `Role successfully updated to ${role}. Database save pending.` });
});

// A hidden route just for devs to clean up test accounts
router.delete('/dev/wipe-user', hardDeleteUserAccount);
// ========== NEW ENDPOINT FOR PROFILE TABLE ==========

// Route: GET /api/users/all
// Description: Get all users for the Profile Table (Admin only)
// Access: Private (Requires Token)
router.get('/all', /* verifyToken, */ async (req, res) => {
  try {
    // Fetch all users from database
    const users = await User.find({}).select('-__v');
    
    // For each user, get their role from Member collection
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const member = await Member.findOne({ user: user.email });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: member?.memberType || 'Member',
          memberId: member?._id?.toString().slice(-6) || 'N/A',
          joinDate: member?.joiningDate || user.createdAt || new Date()
        };
      })
    );
    
    res.status(200).json({ users: usersWithRoles });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Route: GET /api/users/:email
// Description: Get a single user by email
// Access: Private (Requires Token)
router.get('/:email', /* verifyToken, */ async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const member = await Member.findOne({ user: user.email });
    
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        role: member?.memberType || 'Member',
        joinDate: member?.joiningDate || user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

module.exports = router;
