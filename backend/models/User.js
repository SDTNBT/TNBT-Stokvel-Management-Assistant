const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // --- NEW: The unique link to Firebase ---
  firebaseUid: {
    type: String,
    required: true, 
    unique: true, // Prevents duplicate accounts
    index: true   // Makes lookups much faster
  },

  // --- EXISTING FIELDS ---
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true // Good practice to avoid casing issues
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    default: "" // Handles cases where Google doesn't provide a surname
  },
  role: {
    type: String,
    enum: ['Admin', 'Member', 'Treasurer'],
    default: 'Member'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

