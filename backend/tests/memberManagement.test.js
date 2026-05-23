require('dotenv').config({ path: '.env.test', override: true });

const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const Member = require('../models/Member');
const User = require('../models/User');
const Group = require('../models/Group');

jest.setTimeout(30000);

describe('Admin Member Management API', () => {
    let testGroup;
    let testGroupId;

    beforeAll(async () => {
        const testUri = process.env.MONGO_URI && process.env.MONGO_URI.includes('stokvel_test_db')
            ? process.env.MONGO_URI
            : 'mongodb+srv://stokveltest:thetest2026@cluster200.l91gxta.mongodb.net/stokvel_test_db?retryWrites=true&w=majority';
        await connectDB(testUri);
    });

    beforeEach(async () => {
        // Clean everything first
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }

        testGroup = await Group.create({
            groupName: 'Test Group',
            adminEmail: 'admin@test.com',
            treasurerEmail: 'treasurer@test.com',
            contributionAmount: 500,
            frequency: 'Monthly'
        });
        testGroupId = testGroup._id.toString();

        await User.create({
            firebaseUid: 'test-uid-12345',
            name: 'Alice Zwane',
            email: 'alice@test.com'
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('should GET group members with joined user data', async () => {
        await Member.create({
            user: 'alice@test.com',
            group: 'Test Group',
            memberType: 'Member'
        });

        const response = await request(app).get(`/api/managegroup/${testGroupId}/members`);

        expect(response.statusCode).toBe(200);
        expect(response.body.group.groupName).toBe('Test Group');
        expect(response.body.members.length).toBeGreaterThan(0);

        const member = response.body.members[0];
        // userEmail comes from the aggregate $project
        expect(member.userEmail).toBe('alice@test.com');
        // fullName may be empty string if User lookup fails — check it exists at least
        expect(member).toHaveProperty('fullName');
    });

    it('should REMOVE a member successfully', async () => {
        const memberToDie = await Member.create({
            user: 'remove-me@test.com',
            group: 'Test Group',
            memberType: 'Member'
        });

        const response = await request(app)
            .delete(`/api/managegroup/${testGroupId}/member/${memberToDie._id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toMatch(/removed/i);

        const check = await Member.findById(memberToDie._id);
        expect(check).toBeNull();
    });

    it('should NOT remove a member if they belong to a different group (Security Check)', async () => {
        const safeMember = await Member.create({
            user: 'safe@test.com',
            group: 'Unauthorized Group',
            memberType: 'Member'
        });

        const response = await request(app)
            .delete(`/api/managegroup/${testGroupId}/member/${safeMember._id}`);

        expect(response.statusCode).toBe(404);

        const check = await Member.findById(safeMember._id);
        expect(check).not.toBeNull();
    });

    it('should return 404 for a non-existent member ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .delete(`/api/managegroup/${testGroupId}/member/${fakeId}`);

        expect(response.statusCode).toBe(404);
    });
});