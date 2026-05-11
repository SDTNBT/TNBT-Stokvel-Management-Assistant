const { saveMinutes } = require('../controllers/minutesController');
const mongoose = require('mongoose');

const Minutes = require('../models/minutes'); // Path to your model

// Mock the entire Minutes model
jest.mock('../models/minutes');

describe('Minutes Controller - saveMinutes', () => {
  let req, res;

  beforeEach(() => {
    // 1. Initialize req as an object so you can attach .body and .params to it
    req = {
      params: {},
      body: {}
    };

    // 2. Mock the res object and its methods
    res = {
      status: jest.fn().mockReturnThis(), // .mockReturnThis() allows chaining like res.status(200).json()
      json: jest.fn().mockReturnThis()
    };
  });

  test('✅ SUCCESS: should successfully save valid minutes', async () => {
  const validGroupId = new mongoose.Types.ObjectId().toString();
  
  req.params.groupId = validGroupId;
  req.body = {
    meetingDate: "2026-05-11",
    meetingTime: "10:00",
    contributions: [{ member: "Alice", amount: 500, status: "paid" }]
  };

  // 1. Mock the save method to resolve successfully
  Minutes.prototype.save = jest.fn().mockResolvedValue({
    _id: 'mock-id',
    ...req.body,
    group: validGroupId
  });

  await saveMinutes(req, res);

  // Now it won't time out because it's not actually hitting a DB!
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    message: "Minutes saved successfully!"
  }));
});
});