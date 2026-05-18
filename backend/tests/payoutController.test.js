require('dotenv').config({ path: '.env.test', override: true });

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');

const Payout = require('../models/Payout');
const BankingDetails = require('../models/BankingDetails');


// Database Setup

beforeAll(async () => {
  if (
    !process.env.MONGO_URI ||
    !process.env.MONGO_URI.includes('stokvel_test_db')
  ) {
    throw new Error(
      'STOP! You are NOT connected to the test database. Check .env.test'
    );
  }

  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Payout.deleteMany({});
  await BankingDetails.deleteMany({});
});

describe('Payout Controller Tests', () => {

  
  // Rule 1: Successful payout scheduling
  
  test('Should successfully schedule a payout and return 201', async () => {

    // Create mock banking details first
    await BankingDetails.create({
      user: 'test-user-id-123',
      bankName: 'Nedbank',
      accountHolder: 'Liso Mketsu',
      accountNumber: '1234567890'
    });

    const response = await request(app)
      .post('/api/payouts')
      .set('x-user-role', 'Treasurer')
      .send({
        groupName: 'Test Group',
        userId: 'test-user-id-123',
        userEmail: 'test@students.wits.ac.za',
        amount: 500,
        payoutDate: '2026-05-30'
      });

    expect(response.status).toBe(201);
    expect(response.body.message)
      .toBe('Payout scheduled successfully and linked to member banking details');

    expect(response.body.payout.amount).toBe(500);
    expect(response.body.payout.status).toBe('Scheduled');
    expect(response.body.payout.bankName).toBe('Nedbank');
  });

  
  // Rule 2: Reject missing banking details
  
  test('Should reject payout when banking details are missing', async () => {

    const response = await request(app)
      .post('/api/payouts')
      .set('x-user-role', 'Treasurer')
      .send({
        groupName: 'Test Group',
        userId: 'wrong-id',
        userEmail: 'wrong@email.com',
        amount: 500,
        payoutDate: '2026-05-30'
      });

    expect(response.status).toBe(400);
    expect(response.body.message)
      .toBe('Cannot schedule payout. This member has not saved banking details yet.');
  });

  
  // Rule 3: Invalid amount
  
  test('Should reject payout if amount is zero or negative', async () => {

    const response = await request(app)
      .post('/api/payouts')
      .set('x-user-role', 'Treasurer')
      .send({
        groupName: 'Test Group',
        userId: 'test-user-id',
        userEmail: 'member@email.com',
        amount: -100,
        payoutDate: '2026-05-30'
      });

    expect(response.status).toBe(400);
    expect(response.body.message)
      .toBe('Payout amount must be greater than zero');
  });

 
  // Rule 4: Update payout status
  
  test('Should update payout status to Paid', async () => {

    const payout = await Payout.create({
      groupName: 'Test Group',
      userId: 'member123',
      userEmail: 'member@email.com',
      amount: 500,
      payoutDate: '2026-05-30',
      status: 'Scheduled'
    });

    const response = await request(app)
      .put(`/api/payouts/${payout._id}/status`)
      .set('x-user-role', 'Treasurer')
      .send({
        status: 'Paid'
      });

    expect(response.status).toBe(200);
    expect(response.body.message)
      .toBe('Payout status updated successfully');

    expect(response.body.payout.status).toBe('Paid');
  });

  
  // Rule 5: Member can retrieve payout history
  
  test('Should get member payout history', async () => {

    await Payout.create({
      groupName: 'Test Group',
      userId: 'member123',
      userEmail: '2685524@students.wits.ac.za',
      amount: 500,
      payoutDate: '2026-05-30',
      status: 'Scheduled'
    });

    const response = await request(app)
      .get('/api/payouts/member/2685524@students.wits.ac.za');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  
  // Rule 6: Security - Members blocked
  
  test('Should block Members from scheduling payouts', async () => {

    const response = await request(app)
      .post('/api/payouts')
      .set('x-user-role', 'Member')
      .send({
        groupName: 'Test Group',
        userId: 'member123',
        userEmail: 'member@email.com',
        amount: 500,
        payoutDate: '2026-05-30'
      });

    expect(response.status).toBe(403);
    expect(response.body.message)
      .toBe('Access denied. Treasurers only.');
  });

});