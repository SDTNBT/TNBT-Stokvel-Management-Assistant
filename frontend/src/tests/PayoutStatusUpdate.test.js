import { updatePayoutStatus } from '../services/payoutService';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        message: 'Payout updated successfully'
      })
  })
);

describe('Update Payout Status', () => {

  test('updates payout status successfully', async () => {

    const response = await updatePayoutStatus(
      '123',
      'Paid'
    );

    expect(response.message)
      .toBe('Payout updated successfully');
  });

});