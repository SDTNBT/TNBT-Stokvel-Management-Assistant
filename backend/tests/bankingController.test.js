const request = require('supertest');
const mongoose = require('mongoose');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { app, connectDB } = require('../server'); 
const BankingDetails = require('../models/BankingDetails');

// Initialize Axios Mock to intercept Paystack calls
const mock = new MockAdapter(axios);

// Mock Firebase Middleware to simulate a logged-in user
jest.mock('../middleware/authMiddleware', () => ({
    verifyFirebaseToken: (req, res, next) => {
        req.user = { uid: 'test-user-uuid-12345' };
        next();
    }
}));

describe('Banking Controller Integration Tests', () => {
    
    beforeAll(async () => {
        // Explicitly using your test database URI to prevent production data leakage
        const testUri = "mongodb+srv://stokveltest:thetest2026@cluster200.l91gxta.mongodb.net/stokvel_test_db?retryWrites=true&w=majority";
        await connectDB(testUri);
    });

    afterAll(async () => {
        // Final cleanup: Close the database connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    beforeEach(async () => {
        // Reset axios mocks so tests don't interfere with each other
        mock.reset();
        // CRITICAL: Clear the banking details collection before every test
        // This prevents the "E11000 duplicate key error"
        await BankingDetails.deleteMany({});
    });

    describe('GET /api/banking/list', () => {
        it('should fetch and sort South African banks from Paystack', async () => {
            mock.onGet('https://api.paystack.co/bank?country=south%20africa').reply(200, {
                data: [
                    { name: 'Standard Bank', code: '051', id: 1 },
                    { name: 'Absa Bank', code: '632', id: 2 },
                    { name: 'Capitec', code: '001', id: 3 }
                ]
            });

            const res = await request(app).get('/api/banking/list');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            // Verify Sorting: Absa should be index 0, Capitec index 1
            expect(res.body.data[0].name).toBe('Absa Bank');
            expect(res.body.data[1].name).toBe('Capitec');
        });
    });

    describe('POST /api/banking/save', () => {
        it('should successfully verify and save banking details', async () => {
            const testPayload = {
                bankName: 'FNB',
                accountNumber: '1234567890',
                idNumber: '9001015000081',
                accountHolder: 'John Doe'
            };

            // Mock the internal calls the controller makes to Paystack
            mock.onGet('https://api.paystack.co/bank?country=south%20africa').reply(200, {
                data: [{ name: 'FNB', code: '051' }]
            });

            mock.onPost('https://api.paystack.co/bank/validate').reply(200, {
                data: { verified: true }
            });

            const res = await request(app)
                .post('/api/banking/save')
                .send(testPayload);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            
            // Verify the data actually landed in the test MongoDB
            const savedData = await BankingDetails.findOne({ user: 'test-user-uuid-12345' });
            expect(savedData).not.toBeNull();
            expect(savedData.bankName).toBe('FNB');
        });

        it('should return 400 if Paystack verification fails', async () => {
            mock.onGet('https://api.paystack.co/bank?country=south%20africa').reply(200, {
                data: [{ name: 'FNB', code: '051' }]
            });
            
            mock.onPost('https://api.paystack.co/bank/validate').reply(200, {
                data: { verified: false }
            });

            const res = await request(app)
                .post('/api/banking/save')
                .send({ bankName: 'FNB', accountNumber: '000', idNumber: '000', accountHolder: 'Fail' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Bank details could not be verified by Paystack.");
        });
    });

    describe('GET /api/banking/my-details', () => {
        it('should retrieve saved details from the database', async () => {
            // Manually insert a record for the test user
            await BankingDetails.create({
                user: 'test-user-uuid-12345',
                bankName: 'Standard Bank',
                accountNumber: '987654321',
                accountHolder: 'Jane Doe'
            });

            const res = await request(app).get('/api/banking/my-details');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.bankName).toBe('Standard Bank');
            expect(res.body.data.accountNumber).toBe('987654321');
        });

        it('should return null data if the user has no saved details', async () => {
            // collection is already cleared in beforeEach
            const res = await request(app).get('/api/banking/my-details');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toBeNull();
        });
    });
});