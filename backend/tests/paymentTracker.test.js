const request = require('supertest');
const express = require('express');
const paymentTrackerRoutes = require('../routes/paymentTrackerRoutes');
const nodemailer = require('nodemailer');

// Import Models to mock them
const Group = require('../models/Group');
const Member = require('../models/Member');
const Tracker = require('../models/Tracker');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Mock external dependencies
jest.mock('nodemailer');
jest.mock('../models/Group');
jest.mock('../models/Member');
jest.mock('../models/Tracker');
jest.mock('../models/Notification');
jest.mock('../models/User');

// Mock nodemailer transporter
const mockSendMail = jest.fn((options, callback) => callback(null, { messageId: 'test-id' }));
nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

const app = express();
app.use(express.json());
app.use('/api/groups', paymentTrackerRoutes);

describe('PaymentTrackerController Integration Tests', () => {
  const mockGroupId = '6a090b82d9d66577440cc5c1';
  const mockMemberId = '6a090b82d9d66577440cc5c2';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/groups/:groupId/contributions', () => {
    it('should return 200 and formatted payments', async () => {
      Group.findById.mockResolvedValue({ groupName: 'Test Group', contributionAmount: 1000 });
      Member.aggregate.mockResolvedValue([{
        _id: mockMemberId,
        email: 'test@test.com',
        firstName: 'John ',
        lastName: 'Doe ',
        amount: 1000,
        status: 'pending'
      }]);

      const response = await request(app).get(`/api/groups/${mockGroupId}/contributions`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body[0]).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        status: 'pending'
      });
    });
  });

  describe('PATCH /api/groups/:groupId/contributions/:id', () => {
    it('should update status and trigger notification for flagged', async () => {
      Member.findById.mockResolvedValue({ user: 'user@test.com' });
      Tracker.findOneAndUpdate.mockResolvedValue({ status: 'flagged' });
      Group.findById.mockResolvedValue({ groupName: 'Test Group' });
      
      const response = await request(app)
        .patch(`/api/groups/${mockGroupId}/contributions/${mockMemberId}`)
        .send({ status: 'flagged' });

      expect(response.statusCode).toBe(200);
      expect(Notification.create).toHaveBeenCalled();
      expect(response.body.message).toBe('Notification sent successfully');
    });
  });

});