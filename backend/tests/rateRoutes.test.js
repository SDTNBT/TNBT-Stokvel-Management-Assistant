const request = require('supertest');
const { app } = require('../server');

describe('GET /api/rates', () => {
  it('should return prime rate, repo rate, source, and last updated date', async () => {
    const response = await request(app).get('/api/rates');

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('primeRate');
    expect(response.body).toHaveProperty('repoRate');
    expect(response.body).toHaveProperty('source');
    expect(response.body).toHaveProperty('lastUpdated');

    expect(typeof response.body.primeRate).toBe('number');
    expect(typeof response.body.repoRate).toBe('number');
    expect(typeof response.body.source).toBe('string');
    expect(typeof response.body.lastUpdated).toBe('string');
  });

  it('should return valid positive financial rates', async () => {
    const response = await request(app).get('/api/rates');

    expect(response.body.primeRate).toBeGreaterThan(0);
    expect(response.body.repoRate).toBeGreaterThan(0);
  });
});