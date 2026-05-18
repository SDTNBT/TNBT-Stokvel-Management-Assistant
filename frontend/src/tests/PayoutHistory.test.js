import { render, screen, waitFor } from '@testing-library/react';
import PayoutHistory from '../components/PayoutHistory';
import * as payoutService from '../services/payoutService';

jest.mock('../services/payoutService');

describe('PayoutHistory Component', () => {

  test('renders payout history successfully', async () => {

    payoutService.getMemberPayouts.mockResolvedValue([
      {
        _id: '1',
        groupName: 'GroceryStokvel15',
        amount: 500,
        bankName: 'Nedbank',
        accountNumberLast4: '7890',
        status: 'Scheduled',
        paymentReference: 'PAY-12345',
        payoutDate: '2026-05-30'
      }
    ]);

    render(<PayoutHistory />);

    await waitFor(() => {
      expect(screen.getByText('GroceryStokvel15')).toBeInTheDocument();
      expect(screen.getByText('Nedbank')).toBeInTheDocument();
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    });
  });

});