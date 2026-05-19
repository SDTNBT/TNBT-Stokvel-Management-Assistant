require('dotenv').config({ path: '.env.test', override: true });
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');

jest.setTimeout(30000);

// Replace with your actual model name if it's different (e.g., Contribution, Payment)
const Transaction = require('../models/Payment'); 

beforeAll(async () => {
    if (!process.env.MONGO_URI || !process.env.MONGO_URI.includes('stokvel_test_db')) {
        throw new Error("STOP! You are NOT connected to the test database.");
    }
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe('Member Analytics Controller', () => {

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
        await Transaction.deleteMany({});
    }

    // Seed the database - ALL of these are Contributions since it's the Payment model!
    await Transaction.insertMany([
        { userId: 'test-user-123', amount: 500, date: new Date('2023-01-15'), userEmail: 'test1@wits.ac.za', payerName: 'John', groupName: 'TEST001', transactionId: 'TXN-001' },
        { userId: 'test-user-123', amount: 500, date: new Date('2023-02-15'), userEmail: 'test1@wits.ac.za', payerName: 'John', groupName: 'TEST001', transactionId: 'TXN-002' },
        { userId: 'test-user-123', amount: 2000, date: new Date('2023-12-01'), userEmail: 'test1@wits.ac.za', payerName: 'John', groupName: 'TEST001', transactionId: 'TXN-003' },
        { userId: 'other-user', amount: 1000, date: new Date('2023-01-15'), userEmail: 'other@wits.ac.za', payerName: 'Other', groupName: 'TEST001', transactionId: 'TXN-004' }
    ]);
  });

  describe('GET /api/analytics/member', () => {
    
    it('Rule 1: Should return only the logged-in member\'s financial data', async () => {
      const response = await request(app)
        .get('/api/analytics/member')
        .set('x-user-id', 'test-user-123'); 

      expect(response.status).toBe(200);
      expect(response.body.transactions.length).toBe(3); 
      // 500 + 500 + 2000 = 3000 total contributions!
      expect(response.body.summary.totalContributions).toBe(3000); 
    });

    it('Rule 2: Should correctly filter data by startDate and endDate', async () => {
      const response = await request(app)
        .get('/api/analytics/member?startDate=2023-01-01&endDate=2023-01-31')
        .set('x-user-id', 'test-user-123');

      expect(response.status).toBe(200);
      // Should only catch the Jan 15th contribution
      expect(response.body.transactions.length).toBe(1); 
      expect(response.body.transactions[0].amount).toBe(500);
    });

    it('Rule 3: Should return a downloadable CSV file when format=csv is requested', async () => {
      const response = await request(app)
        .get('/api/analytics/member?format=csv')
        .set('x-user-id', 'test-user-123');

      expect(response.status).toBe(200);
      // Check if the backend set the correct headers to trigger a file download!
      expect(response.headers['content-type']).toContain('text/csv');
      // The CSV text should contain our headers and data
      expect(response.text).toContain('Date,Type,Amount');
      expect(response.text).toContain('Contribution,500');
    });

  });
});