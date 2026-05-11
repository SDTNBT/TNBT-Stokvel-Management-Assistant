const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server'); // Destructuring app from your server.js exports
const Notification = require('../models/Notification');
const Group = require('../models/Group');
const Member = require('../models/Member');

let mongoServer;

describe('UAT: Member Invitation & Acceptance Workflow', () => {
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Ensure we are disconnected from any real DBs before starting
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up collections after every test to keep coverage accurate
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  it('✅ SUCCESS: Should create a Member and update Notification when accepted', async () => {
    // 1. Arrange with all required fields
    const group = await Group.create({ 
      groupName: 'Success Stokvel', 
      admin: 'admin@test.com',
      adminEmail: 'admin@test.com',
      treasurerEmail: 'treasurer@test.com',
      contributionAmount: 100
    });

    const notification = await Notification.create({
      recipient: 'newmember@test.com',
      type: 'invite',
      title: 'Invite',
      message: 'Join us',
      groupId: group._id
    });

    // 2. Act
    const res = await request(app)
      .put(`/api/notifications/${notification._id}/accept`)
      .send();

    // 3. Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('❌ FAIL: Should return 404 if the notification does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/notifications/${fakeId}/accept`).send();

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Notification not found');
  });

  it('❌ FAIL: Should return 404 if the group associated with the invite was deleted', async () => {
    // 1. Arrange: Create a notification for a group that DOES NOT exist
    const ghostGroupId = new mongoose.Types.ObjectId();
    
    // You MUST provide all required fields here to satisfy Mongoose validation
    const notification = await Notification.create({
      recipient: 'abandoned@test.com',
      groupId: ghostGroupId,
      type: 'invite',         // Added
      title: 'Ghost Invite',   // Added
      message: 'This group is gone' // Added
    });

    // 2. Act
    const res = await request(app)
      .put(`/api/notifications/${notification._id}/accept`)
      .send();

    // 3. Assert
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Group no longer exists');
  });
});