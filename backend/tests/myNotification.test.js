const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../routes/myNotificationRoutes'); 
const Notification = require('../models/Notification');

// Mock the model
jest.mock('../models/Notification');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notification Controller Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notifications/my-notifications', () => {
    it('should return 400 if email query is missing', async () => {
      const response = await request(app).get('/api/notifications/my-notifications');
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('User email is required');
    });

    it('should return 200 and a list of notifications', async () => {
      const mockNotifications = [{ _id: 'n1', recipient: 'test@test.com', message: 'Hello' }];
      
      Notification.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNotifications)
      });

      const response = await request(app).get('/api/notifications/my-notifications?email=test@test.com');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockNotifications);
    });

    // Coverage: Trigger the 'catch' block for GET
    it('should return 500 if database query fails', async () => {
      Notification.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB error'))
      });

      const response = await request(app).get('/api/notifications/my-notifications?email=test@test.com');
      
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should return 404 if notification is not found', async () => {
      Notification.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app).patch('/api/notifications/n1/read');
      
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Notification document not found');
    });

    it('should return 200 and updated notification when found', async () => {
      const updatedDoc = { _id: 'n1', isRead: true };
      Notification.findByIdAndUpdate.mockResolvedValue(updatedDoc);

      const response = await request(app).patch('/api/notifications/n1/read');
      
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isRead).toBe(true);
      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
        'n1',
        { isRead: true },
        { new: true }
      );
    });

    // Coverage: Trigger the 'catch' block for PATCH
    it('should return 500 if database update fails', async () => {
      Notification.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

      const response = await request(app).patch('/api/notifications/n1/read');
      
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Server error updating status status');
    });
  });
});