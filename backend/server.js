require('dotenv').config(); // Load this once at the very top
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

// --- 1. Import All Routes ---
const payoutRoutes = require('./routes/payoutRoutes'); //by the treasurer to the member account
const paymentRoutes = require('./routes/paymentRoutes');  //by the member to the society account
const stokvelRoutes = require('./routes/stokvelRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const managegroupRoutes = require('./routes/managegroupRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const minutesRoutes = require('./routes/recordMinutesRoutes');
const bankingRoutes = require('./routes/bankingRoutes');

const app = express();

// --- 3. Middleware ---
// Explicit CORS to allow your React app to talk to this API
app.use(cors({
    origin: ['http://localhost:3000', 'https://gomolemorampa.github.io'], // added frontend URL (FOR AZURE DEPLOYMENT- your-azure-frontend-url.azurestaticapps.net')
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Added PUT so you can update payout statuses later
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role'] // Added your VIP pass header
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} request received at ${req.url}`);
    next();
});

// --- 2. Firebase Initialization ---
let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
        // Fallback to local file if env variable isn't set
        serviceAccount = require("./serviceAccountKey.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
} catch (error) {
    console.log("⚠️ Skipping Firebase Admin initialization (No credentials found)");
}

// --- 4. Register Routes ---
// The Stripe route must match your frontend fetch URL
app.use('/api/payments', paymentRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/stokvel', stokvelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/managegroup', managegroupRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/minutes', minutesRoutes); // Added route for meeting minutes
app.use('/api/banking', bankingRoutes);
app.use('/api/payouts', payoutRoutes);


app.get('/', (req, res) => {
    res.send('Stokvel Assistant API is running and healthy!');
});

// --- 5. Database Connection Logic ---
const connectDB = async (dbUri = process.env.MONGO_URI) => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ Connected to MongoDB`);
        
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1);
    }
};

// --- 6. Start Server ---
if (require.main === module) {
    // Safety check for production
    if (process.env.NODE_ENV === 'production' && process.env.MONGO_URI.includes('stokvel_test_db')) {
        console.error("CRITICAL ERROR: Production server attempting to connect to TEST DB! Shutting down.");
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

// Export for testing or other uses
module.exports = { app, admin, connectDB };