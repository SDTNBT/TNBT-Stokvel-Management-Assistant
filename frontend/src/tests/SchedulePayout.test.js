import { render, screen, fireEvent, act, within } from '@testing-library/react';
import SchedulePayout from '../components/SchedulePayout';
import * as payoutService from '../services/payoutService';

jest.mock('../services/payoutService');

describe('Schedule Payout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders and fetches payouts on mount', async () => {
    payoutService.getScheduledPayouts.mockResolvedValue([]);
    await act(async () => { render(<SchedulePayout />); });
    expect(screen.getByText('Schedule a Payout')).toBeInTheDocument();
  });

  test('handles loading and empty states', async () => {
    payoutService.getScheduledPayouts.mockReturnValue(new Promise(() => {}));
    render(<SchedulePayout />);
    expect(screen.getByText(/Loading payouts.../i)).toBeInTheDocument();

    payoutService.getScheduledPayouts.mockResolvedValue([]);
    await act(async () => { render(<SchedulePayout />); });
    expect(screen.getByText(/No active payouts/i)).toBeInTheDocument();
  });

  test('handles fetch error and displays error message', async () => {
    payoutService.getScheduledPayouts.mockRejectedValue(new Error('API Error'));
    await act(async () => { render(<SchedulePayout />); });
    expect(await screen.findByText('Failed to load active payouts.')).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    payoutService.schedulePayout.mockResolvedValue({ message: 'Success' });
    payoutService.getScheduledPayouts.mockResolvedValue([]);
    await act(async () => { render(<SchedulePayout />); });

    fireEvent.change(screen.getByPlaceholderText(/e.g. Stokvel1/i), { target: { name: 'groupName', value: 'G1' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter member Firebase UID/i), { target: { name: 'userId', value: '123' } });
    fireEvent.change(screen.getByPlaceholderText(/member@example.com/i), { target: { name: 'userEmail', value: 't@t.com' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. 500/i), { target: { name: 'amount', value: '100' } });
    fireEvent.change(screen.getByLabelText(/Payout Date/i), { target: { name: 'payoutDate', value: '2026-05-25' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Schedule Payout/i }));
    });

    expect(await screen.findByText('Success')).toBeInTheDocument();
  });

  test('handles status update actions and resolved states', async () => {
    const mockPayouts = [
      { _id: '1', status: 'Scheduled' }, 
      { _id: '2', status: 'Paid' }      
    ];
    payoutService.getScheduledPayouts.mockResolvedValue(mockPayouts);
    payoutService.updatePayoutStatus.mockResolvedValue({});

    await act(async () => { render(<SchedulePayout />); });

    
    const rows = screen.getAllByRole('row');
    
    
    const scheduledRow = rows.find(row => row.textContent.includes('Scheduled'));
    const markPaidBtn = within(scheduledRow).getByRole('button', { name: /✓ Mark Paid/i });
    
    await act(async () => { fireEvent.click(markPaidBtn); });
    expect(payoutService.updatePayoutStatus).toHaveBeenCalledWith('1', 'Paid');

    
    const resolvedRows = rows.filter(row => 
        row.textContent.includes('Paid') && row.textContent.includes('Resolved')
    );
    
    expect(resolvedRows.length).toBeGreaterThan(0);
    expect(within(resolvedRows[0]).getByText(/— Resolved/i)).toBeInTheDocument();
  });

  test('shows error when submission fails', async () => {
    payoutService.schedulePayout.mockRejectedValue(new Error('Submit Error'));
    await act(async () => { render(<SchedulePayout />); });

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Schedule Payout/i }));
    });

    expect(await screen.findByText('Submit Error')).toBeInTheDocument();
  });
});