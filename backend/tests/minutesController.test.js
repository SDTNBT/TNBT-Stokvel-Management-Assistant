// tests/minutesController.test.js
require('dotenv').config({ path: '.env.test' });
const { saveMinutes } = require('../controllers/minutesController');
const Minutes = require('../models/minutes');
const User = require('../models/User'); // <-- Make sure you import User if you keep the block below!

// Mock the Mongoose model
jest.mock('../models/minutes');

describe('Minutes Controller - saveMinutes (Existing Schema)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { groupId: 'stokvel-group-123' },
      body: {
        meetingId: '60d5ecb8b392d700153ee089', // Mock ObjectId string
        title: 'April Monthly Gathering',
        content: 'Discussed late fees and end of year payout.',
        attendance: [
          { memberName: 'Sipho', present: true },
          { memberName: 'Thabo', present: false }
        ]
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // 2. Setup Test User
  beforeEach(async () => {
      await User.create({
          firebaseUid: "mock-firebase-uid-123",
          name: "Alice Zwane", 
          email: "alice@test.com"
      });
  }); // <--- THIS WAS MISSING!

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully save valid minutes and return 201', async () => {
    Minutes.prototype.save = jest.fn().mockResolvedValue(true);

    await saveMinutes(req, res);

    expect(Minutes).toHaveBeenCalledWith(expect.objectContaining({
      groupId: 'stokvel-group-123',
      meetingId: '60d5ecb8b392d700153ee089',
      title: 'April Monthly Gathering',
      content: 'Discussed late fees and end of year payout.'
    }));
    
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should return a 400 error if meetingId is missing', async () => {
    req.body.meetingId = ''; // Remove required field

    await saveMinutes(req, res);

    expect(Minutes.prototype.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'meetingId, title, and content are required fields.' 
    });
  });

  it('should return a 400 error if content is missing', async () => {
    req.body.content = ''; // Remove required field

    await saveMinutes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return a 500 error if the database crashes', async () => {
    Minutes.prototype.save = jest.fn().mockRejectedValue(new Error('DB Error'));

    await saveMinutes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});