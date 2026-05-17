const request = require('supertest');
const express = require('express');
const paymentTrackerRoutes = require('../routes/paymentTrackerRoutes');


const Group = require('../models/Group');
const Member = require('../models/Member');

const app = express();
app.use(express.json());
app.use('/api/groups', paymentTrackerRoutes);


jest.mock('../models/Group');
jest.mock('../models/Member');

describe('GET /api/groups/:groupId/contributions Integration Test', () => {
  
  const mockGroupId = '6a090b82d9d66577440cc5c1';

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
        _id: 'member-row-1',
        email: 'testuser@example.com',
        firstName: 'Thabo',
        lastName: 'Khumalo',
        amount: 1000,
      }
    ];
    Member.aggregate.mockResolvedValue(mockAggregationOutput);

    
    const response = await request(app)
      .get(`/api/groups/${mockGroupId}/contributions`);

    
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toEqual({
      id: 'member-row-1',
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
});