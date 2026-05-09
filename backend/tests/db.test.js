const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.test'), override: true });
const mongoose = require('mongoose');
const { connectDB } = require('../server'); 

describe('Database Connection (Smoke Test)', () => {

    console.log("DEBUG: MONGO_URI is currently:", process.env.MONGO_URI);
    
    it('should successfully connect to the test database', async () => {
        // SAFETY GUARD: Check the URI before connecting
        if (!process.env.MONGO_URI || !process.env.MONGO_URI.includes('stokvel_test_db')) {
            throw new Error("STOP! You are NOT connected to the test database. Check your .env.test file.");
        }

        await connectDB(process.env.MONGO_URI);
        
        expect(mongoose.connection.readyState).toBe(1); // 1 = Connected
        
        await mongoose.disconnect();
    });
});