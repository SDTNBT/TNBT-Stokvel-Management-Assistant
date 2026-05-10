require('dotenv').config({ path: '.env.test', override: true });
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); // Make sure this path is correct for your setup
const Payout = require('../models/Payout'); 

// --- NEW: Database Setup & Teardown ---
beforeAll(async () => {
    // Connect to the test database
    if (!process.env.MONGO_URI || !process.env.MONGO_URI.includes('stokvel_test_db')) {
        throw new Error("STOP! You are NOT connected to the test database. Check your .env.test file.");
    }
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    // Close the connection when tests are done so Jest doesn't hang
    await mongoose.connection.close();
});
// --------------------------------------

describe('Payout Controller - Treasurer Schedule', () => {

  // Clean up the database before each test
  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
        await Payout.deleteMany({});
    }
  });

  describe('POST /api/payouts', () => {
    
    it('Rule 1: Should successfully create a scheduled payout and return 201', async () => {
      const validPayout = {
        groupName: 'TEST003',
        userId: '69f1eaab9ba63b55ca592b5d',
        userEmail: '2440626@students.wits.ac.za',
        amount: 500,
        payoutDate: '2026-12-01'
      };

      const response = await request(app)
        .post('/api/payouts')
        .send(validPayout);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Payout scheduled successfully');
      expect(response.body.payout.amount).toBe(500);
      expect(response.body.payout.status).toBe('Scheduled');
    });

    it('Rule 2: Should return 400 Bad Request if the amount is zero or negative', async () => {
      const invalidPayout = {
        groupName: 'TEST003',
        userId: '69f1eaab9ba63b55ca592b5d',
        userEmail: '2440626@students.wits.ac.za',
        amount: -100, // Invalid!
        payoutDate: '2026-12-01'
      };

      const response = await request(app)
        .post('/api/payouts')
        .send(invalidPayout);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Payout amount must be greater than zero');
    });

  });
});