const express = require('express');
const router = express.Router();

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

module.exports = router;
