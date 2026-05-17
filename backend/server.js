require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

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

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://gomolemorampa.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(`${req.method} request received at ${req.url}`);
  next();
});

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

if (require.main === module) {
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