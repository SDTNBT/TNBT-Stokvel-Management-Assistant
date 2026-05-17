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

  describe('PUT /api/payouts/:id/status', () => {
      
    it('Rule 3: Should successfully update a payout status to Paid and return 200', async () => {
      // 1. Setup: Manually save a Scheduled payout to the DB
      const existingPayout = new Payout({
        groupName: 'TEST003',
        userId: '69f1eaab9ba63b55ca592b5d',
        userEmail: '2440626@students.wits.ac.za',
        amount: 500,
        payoutDate: '2026-12-01',
        status: 'Scheduled'
      });
      await existingPayout.save();

      // 2. Action: Hit the API to update it to "Paid"
      const response = await request(app)
        .put(`/api/payouts/${existingPayout._id}/status`)
        .send({ status: 'Paid' });

      // 3. Assert: Check if the API responded correctly
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Payout status updated successfully');
      expect(response.body.payout.status).toBe('Paid');
    });

    it('Should return 404 if the payout ID does not exist', async () => {
      // Generate a valid MongoDB ID, but one that doesn't belong to any payout
      const fakeId = new mongoose.Types.ObjectId(); 
      
      const response = await request(app)
        .put(`/api/payouts/${fakeId}/status`)
        .send({ status: 'Paid' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Payout not found');
    });

  }); // <-- FIXED: This closing bracket was missing!

  describe('Security Guard (Rule 4) - Role Authorization', () => {
      
    it('Should return 403 Forbidden if a standard user tries to schedule a payout', async () => {
      
      const response = await request(app)
        .post('/api/payouts')
        // We are NOT attaching a Treasurer/Admin token here, so the server SHOULD block us.
        .set('x-user-role', 'Member')
        .send({
          groupName: 'TEST003',
          userId: 'regular-member-id',
          userEmail: 'member@students.wits.ac.za',
          amount: 200,
          payoutDate: '2026-12-05'
        });

      // We expect the bouncer to kick us out with a 403 (or 401)
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied. Treasurers only.');
    });

  });

});