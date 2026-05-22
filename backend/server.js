require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

// --- 1. ROUTE IMPORTS ---
const payoutRoutes = require('./routes/payoutRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const stokvelRoutes = require('./routes/stokvelRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const managegroupRoutes = require('./routes/managegroupRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const rateRoutes = require('./routes/rateRoutes');
const minutesRoutes = require('./routes/recordMinutesRoutes');
const bankingRoutes = require('./routes/bankingRoutes');
const paymentTrackerRoutes = require('./routes/paymentTrackerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const myNotificationRoutes = require('./routes/myNotificationRoutes');

// --- 2. APP INITIALIZATION ---
const app = express();

// Create a hybrid array: Hardcoded guaranteed links + Dynamic .env links
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:5000', 
  'http://localhost:5001', 
  'https://gomolemorampa.github.io',
  process.env.LOCAL_FRONTEND, 
  process.env.PROD_FRONTEND
].filter(Boolean); // Removes any empty/undefined values if .env is missing

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  // Kept x-user-id and Authorization so your CSV downloads and Logins don't break!
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id'],
  credentials: true 
};

// Apply CORS and force preflight check allowance
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Initialize Body Parsers (Must come AFTER cors!)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- 3. FIREBASE SETUP ---
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } else {
    serviceAccount = require('./serviceAccountKey.json');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }
} catch (error) {
  console.log('⚠️ Skipping Firebase Admin initialization (No credentials found)');
}

// --- 4. ROUTE ATTACHMENTS ---
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stokvel', stokvelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/managegroup', managegroupRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/minutes', minutesRoutes);
app.use('/api/banking', bankingRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/groups', paymentTrackerRoutes);
app.use('/api/analytics', analyticsRoutes); // <-- ADDED THIS SO 404 GOES AWAY!
app.use('/api/notifications', myNotificationRoutes);

// --- 5. HEALTH CHECK & DB ---
app.get('/', (req, res) => {
  res.send('Stokvel Assistant API is running and healthy!');
});

const connectDB = async (dbUri = process.env.MONGO_URI) => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  }
};

// --- 6. SERVER STARTUP ---
if (require.main === module || process.env.PORT) {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.MONGO_URI &&
    process.env.MONGO_URI.includes('stokvel_test_db')
  ) {
    console.error('CRITICAL ERROR: Production server attempting to connect to TEST DB! Shutting down.');
    process.exit(1);
  }

  if (process.env.NODE_ENV !== 'test') {
    connectDB();
  }

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`📡 Server listening on Port: ${PORT}`);
  });
}

module.exports = { app, admin, connectDB };