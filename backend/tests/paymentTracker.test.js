const request = require('supertest');
const express = require('express');
const paymentTrackerRoutes = require('../routes/paymentTrackerRoutes');

const Group = require('../models/Group');
const Member = require('../models/Member');
const Tracker = require('../models/Tracker'); 

const app = express();
app.use(express.json());
app.use('/api/groups', paymentTrackerRoutes);

jest.mock('../models/Group');
jest.mock('../models/Member');
jest.mock('../models/Tracker'); 

describe('GET /api/groups/:groupId/contributions Integration Test', () => {
  
  const mockGroupId = '6a090b82d9d66577440cc5c1';
  const mockMemberId = '6a090b82d9d66577440cc5c2'; 

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute controller logic, handle aggregation, and return formatted payments', async () => {
    
    Group.findById.mockResolvedValue({
      _id: mockGroupId,
      groupName: 'Soweto Investment Club',
      contributionAmount: 1000,
    });

    
    const mockAggregationOutput = [
      {
        _id: mockMemberId,
        email: 'testuser@example.com',
        firstName: 'Thabo',
        lastName: 'Khumalo',
        amount: 1000,
        status: 'pending' 
      }
    ];
    Member.aggregate.mockResolvedValue(mockAggregationOutput);

    
    const response = await request(app)
      .get(`/api/groups/${mockGroupId}/contributions`);

    
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toEqual({
      id: mockMemberId,
      name: 'Thabo',
      surname: 'Khumalo',
      email: 'testuser@example.com',
      amount: 1000,
      status: 'pending'
    });
  });

  it('should return 400 if the Group ID format is invalid', async () => {
    const response = await request(app)
      .get('/api/groups/invalid-id-format/contributions');

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid Group ID format');
  });

  it('should return 404 if the group document does not exist', async () => {
    
    Group.findById.mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/groups/${mockGroupId}/contributions`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Group not found');
  });

  it('should handle server errors gracefully inside the catch block', async () => {
    
    Group.findById.mockRejectedValue(new Error('Database disk crash connection loss'));

    const response = await request(app)
      .get(`/api/groups/${mockGroupId}/contributions`);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Server error');
  });

   
  describe('PATCH /api/groups/:groupId/contributions/:memberId', () => {
    it('should successfully update and upsert status changes for a member', async () => {
      Tracker.findOneAndUpdate.mockResolvedValue({
        memberId: mockMemberId,
        groupId: mockGroupId,
        status: 'paid'
      });

      const response = await request(app)
        .patch(`/api/groups/${mockGroupId}/contributions/${mockMemberId}`)
        .send({ status: 'paid' });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Status synchronized successfully');
      expect(response.body.data.status).toBe('paid');
    });

    it('should return 400 if the Group ID or Member ID format is invalid (Covers Line 105)', async () => {
      const response = await request(app)
        .patch(`/api/groups/invalid-group-id/contributions/${mockMemberId}`)
        .send({ status: 'paid' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid Group or Member ID format');
    });

    it('should return 400 if an invalid status option is sent across payloads', async () => {
      const response = await request(app)
        .patch(`/api/groups/${mockGroupId}/contributions/${mockMemberId}`)
        .send({ status: 'invalid-status-type' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid status type provided');
    });

    it('should handle server errors gracefully inside patch catch block (Covers Lines 125-126)', async () => {
      Tracker.findOneAndUpdate.mockRejectedValue(new Error('Database cluster timeout exception'));

      const response = await request(app)
        .patch(`/api/groups/${mockGroupId}/contributions/${mockMemberId}`)
        .send({ status: 'paid' });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Server error updating tracking target status');
    });
  });
});