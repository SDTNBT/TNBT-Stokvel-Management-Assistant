require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const Member = require('../models/Member');
const User = require('../models/User');
const Group = require('../models/Group');

// Increase timeout for network operations to Atlas
jest.setTimeout(30000);

describe('Admin Member Management API', () => {
    let testGroup;
    let testGroupId;

    // Connect to the database ONCE for this entire file
    beforeAll(async () => {
        if (!process.env.MONGO_URI || !process.env.MONGO_URI.includes('stokvel_test_db')) {
            throw new Error("STOP! You are NOT connected to the test database. Check your .env.test file.");
        }
        await connectDB(process.env.MONGO_URI);
    });

    // Create fresh data BEFORE EACH test
    beforeEach(async () => {
        testGroup = await Group.create({ 
            groupName: "Test Group", 
            adminEmail: "admin@test.com",
            treasurerEmail: "treasurer@test.com",
            contributionAmount: 500,
            frequency: "Monthly"
        });
        testGroupId = testGroup._id.toString();

        await User.create({ 
            firebaseUid: "test-uid-12345", 
            name: "Alice Zwane", 
            email: "alice@test.com"
        });
    });

    // Clean up AFTER EACH test to keep them isolated
    afterEach(async () => {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    // Disconnect AFTER ALL tests finish
    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('should GET group members with joined user data', async () => {
        await Member.create({
            user: "alice@test.com",
            group: "Test Group",
            memberType: "Member"
        });

        const response = await request(app).get(`/api/managegroup/${testGroupId}/members`);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.group.groupName).toBe("Test Group");
        expect(response.body.members[0].userEmail).toBe("alice@test.com");
        expect(response.body.members[0].fullName).toBe("Alice Zwane");
    });

    it('should REMOVE a member successfully', async () => {
        const memberToDie = await Member.create({
            user: "remove-me@test.com",
            group: "Test Group",
            memberType: "Member"
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
            user: "safe@test.com",
            group: "Unauthorized Group", 
            memberType: "Member"
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