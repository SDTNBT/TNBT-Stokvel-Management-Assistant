require('dotenv').config();
const dns = require('dns');
// Helps with connection stability on certain networks
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const admin = require('firebase-admin');

// --- 1. Route Imports ---
const stokvelRoutes = require('./routes/stokvelRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const managegroupRoutes = require('./routes/managegroupRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const minutesRoutes = require('./routes/recordMinutesRoutes');

const app = express();

// --- 2. Firebase Initialization (Smart Logic) ---
// We do this early so routes that depend on Firebase (like Auth) don't crash
let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // 1. Production (Render)
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
        // 2. Local Testing (Your Laptop)
        serviceAccount = require("./serviceAccountKey.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
} catch (error) {
    // 3. GitHub Actions CI/CD Pipeline (No keys available, prevent crash)
    console.log("⚠️ Skipping Firebase Admin initialization (No credentials found - Safe for CI/Testing)");
}

// --- 3. Middleware ---
app.use(cors()); // Allows your GitHub Pages frontend to talk to this Render backend
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request Logger (Very helpful for debugging during your assessment)
app.use((req, res, next) => {
    console.log(`${req.method} request received at ${req.url}`);
    next();
});

// --- 4. Database Connection ---
const connectionOptions = {
    serverSelectionTimeoutMS: 10000, 
    socketTimeoutMS: 45000,          
};

const connectDB = async (dbUri = process.env.MONGO_URI) => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ Connected to MongoDB at: ${dbUri}`);
        
        // Clean up old database indexes if they exist
        const dropOldIndex = async () => {
            try {
                await mongoose.connection.db.collection('users').dropIndex('googleId_1');
                console.log('✨ Cleaned up old database indexes');
            } catch (err) { }
        };
        dropOldIndex();
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1);
    }
};

// --- 5. Routes ---
// These are the "Doors" to your backend
app.use('/api/auth', authRoutes);
app.use('/api/stokvel', stokvelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/managegroup', managegroupRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/minutes', minutesRoutes); // Added route for meeting minutes

// Basic Health Check
app.get('/', (req, res) => {
    res.send('🚀 Stokvel Assistant API is running and healthy!');
});

// --- 6. Start Server ---
if (require.main === module) {
    if (process.env.NODE_ENV === 'production' && process.env.MONGO_URI.includes('stokvel_test_db')) {
        console.error(" CRITICAL ERROR: Production server is trying to connect to a TEST database! Shutting down.");
        process.exit(1);
    }
    if (process.env.NODE_ENV !== 'test') {
        connectDB(); // Connect to production DB
    }
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`📡 Server listening on Port: ${PORT}`);
    });
}
// Export admin so other files can use Firebase if needed
module.exports = { app, admin, connectDB };