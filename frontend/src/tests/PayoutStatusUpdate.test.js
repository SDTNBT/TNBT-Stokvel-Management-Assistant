import { 
  updatePayoutStatus, 
  schedulePayout, 
  getMemberPayouts, 
  getScheduledPayouts 
} from '../services/payoutService';

describe('Payout Service', () => {
  
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  
  test('updates payout status successfully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'Payout updated successfully' }),
    });

    const response = await updatePayoutStatus('123', 'Paid');
    expect(response.message).toBe('Payout updated successfully');
  });

  test('updatePayoutStatus throws error when update fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Invalid status' }),
    });

    await expect(updatePayoutStatus('123', 'Invalid')).rejects.toThrow('Invalid status');
  });

  test('updatePayoutStatus throws default error when no message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    await expect(updatePayoutStatus('123', 'Paid')).rejects.toThrow('Failed to update payout status');
  });

  
  test('schedulePayout works successfully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: '1' }),
    });
    const result = await schedulePayout({ amount: 100 });
    expect(result.id).toBe('1');
  });

  test('schedulePayout throws error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Failed' }),
    });
    await expect(schedulePayout({})).rejects.toThrow('Failed');
  });

  
  test('getMemberPayouts fetches successfully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([{ id: 'p1' }]),
    });
    const result = await getMemberPayouts('test@email.com');
    expect(result[0].id).toBe('p1');
  });

  test('getMemberPayouts throws error using text() fallback', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('Server Error'),
    });
    await expect(getMemberPayouts('test@email.com')).rejects.toThrow('Server Error');
  });

  
  test('getScheduledPayouts fetches successfully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([{ id: 's1' }]),
    });
    const result = await getScheduledPayouts();
    expect(result[0].id).toBe('s1');
  });

  test('getScheduledPayouts throws error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Auth Failed' }),
    });
    await expect(getScheduledPayouts()).rejects.toThrow('Auth Failed');
  });
});