import { render, screen, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PayoutHistory from '../components/PayoutHistory';
import * as payoutService from '../services/payoutService';

jest.mock('../services/payoutService');

describe('PayoutHistory Component 100% Coverage', () => {
  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('covers Line 19 (prop vs sessionStorage)', async () => {
    payoutService.getMemberPayouts.mockResolvedValue([]);
    
    render(<PayoutHistory user={{ email: 'prop@test.com' }} />);
    await waitFor(() => expect(payoutService.getMemberPayouts).toHaveBeenCalledWith('prop@test.com'));
    
    cleanup();

    
    sessionStorage.setItem('user', JSON.stringify({ email: 'session@test.com' }));
    render(<PayoutHistory />);
    await waitFor(() => expect(payoutService.getMemberPayouts).toHaveBeenCalledWith('session@test.com'));
  });

  test('covers Line 44 (N/A vs Date)', async () => {
    payoutService.getMemberPayouts.mockResolvedValue([
      { _id: '1', status: 'Paid', payoutDate: null },         
      { _id: '2', status: 'Paid', payoutDate: '2026-05-22' }  
    ]);
    
    render(<PayoutHistory user={{ email: 'test@test.com' }} />);
    
    expect(await screen.findAllByText('N/A')).toBeTruthy();
    expect(await screen.findByText(/22 May 2026/i)).toBeInTheDocument();
  });

  test('covers remaining branches (55, 62, 75)', async () => {
    payoutService.getMemberPayouts.mockResolvedValue([
      { _id: '3', status: 'Failed', amount: 100 },
      { _id: '4', status: 'Unknown', amount: 100 }
    ]);

    render(<PayoutHistory user={{ email: 'test@test.com' }} />);
    
    expect(await screen.findByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  test('covers status styles', async () => {
    payoutService.getMemberPayouts.mockResolvedValue([
      { _id: '5', status: 'Paid', groupName: 'G1', amount: 100 },
      { _id: '6', status: 'Processing', groupName: 'G2', amount: 100 }
    ]);

    render(<PayoutHistory user={{ email: 'test@test.com' }} />);
    expect(await screen.findByText('Paid')).toBeInTheDocument();
    expect(await screen.findByText('Processing')).toBeInTheDocument();
  });

  test('covers error and empty states', async () => {
    
    render(<PayoutHistory user={null} />);
    expect(await screen.findByText(/No payouts have been scheduled for you yet/i)).toBeInTheDocument();
    
    cleanup();

    
    payoutService.getMemberPayouts.mockRejectedValue(new Error('API Error'));
    render(<PayoutHistory user={{ email: 'test@test.com' }} />);
    
    expect(await screen.findByText(/API Error/i)).toBeInTheDocument();
    
    cleanup();

    
    payoutService.getMemberPayouts.mockResolvedValue([]);
    render(<PayoutHistory user={{ email: 'test@test.com' }} />);
    expect(await screen.findByText(/No payouts have been scheduled for you yet/i)).toBeInTheDocument();
  });
  test('error when no user/session found', async () => {
    sessionStorage.clear();
    
    render(<PayoutHistory user={null} />);
    
    expect(await screen.findByText(/User email not found. Please log in again./i)).toBeInTheDocument();
  });
  
});