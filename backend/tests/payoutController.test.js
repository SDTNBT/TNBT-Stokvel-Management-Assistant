require('dotenv').config({ path: '.env.test', override: true });

const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');

const Payout = require('../models/Payout');
const BankingDetails = require('../models/BankingDetails');
const Member = require('../models/Member');

jest.setTimeout(30000);

beforeAll(async () => {
    const testUri = process.env.MONGO_URI && process.env.MONGO_URI.includes('stokvel_test_db')
        ? process.env.MONGO_URI
        : 'mongodb+srv://stokveltest:thetest2026@cluster200.l91gxta.mongodb.net/stokvel_test_db?retryWrites=true&w=majority';
    await connectDB(testUri);
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Payout.deleteMany({});
    await BankingDetails.deleteMany({});
    await Member.deleteMany({});
});

describe('Payout Controller Tests', () => {

    test('Should successfully schedule a payout and return 201', async () => {
        // Create member record so validation passes
        await Member.create({
            user: 'test@students.wits.ac.za',
            group: 'Test Group',
            memberType: 'Member'
        });

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
        expect(response.body.message).toBe('Payout scheduled successfully and linked to member banking details');
        expect(response.body.payout.amount).toBe(500);
        expect(response.body.payout.status).toBe('Scheduled');
        expect(response.body.payout.bankName).toBe('Nedbank');
    });

    test('Should reject payout when banking details are missing', async () => {
        // Member exists but no banking details
        await Member.create({
            user: 'wrong@email.com',
            group: 'Test Group',
            memberType: 'Member'
        });

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
        expect(response.body.message).toBe('Cannot schedule payout. This member has not saved banking details yet.');
    });

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
        expect(response.body.message).toBe('Payout amount must be greater than zero');
    });

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
            .send({ status: 'Paid' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Payout status updated successfully');
        expect(response.body.payout.status).toBe('Paid');
    });

    test('Should return 404 if payout ID does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/payouts/${fakeId}/status`)
            .set('x-user-role', 'Treasurer')
            .send({ status: 'Paid' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Payout not found');
    });

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
        expect(response.body.message).toBe('Access denied. Treasurers only.');
    });
});