import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberContributionHistory from '../components/MemberContributionHistory';

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
  global.URL.revokeObjectURL = jest.fn();
});

global.fetch = jest.fn();
const mockUser = { email: 'test@stokvel.com' };

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
});

describe('MemberContributionHistory Component', () => {

  test('covers filtering, CSV download, and status change branches', async () => {
    const mockPayments = [
      { _id: '1', date: '2026-05-01', groupName: 'Group A', amount: 100, status: 'Confirmed' },
      { _id: '2', date: '2026-05-02', groupName: 'Group B', amount: 200, status: 'Pending' }
    ];
    
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ payments: mockPayments }) })
         .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ summary: { total: 300 } }) });

    await act(async () => { render(<MemberContributionHistory user={mockUser} />); });

    // 1. Trigger Filter Change (Covers status filter logic)
    const statusFilter = screen.getByLabelText(/Filter by Status/i);
    await act(async () => { fireEvent.change(statusFilter, { target: { value: 'Pending' } }); });
    
    // 2. Trigger CSV Download (Covers lines 108/120/etc)
    const downloadBtn = await screen.findByRole('button', { name: /download csv/i });
    await act(async () => { fireEvent.click(downloadBtn); });

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('covers empty state and date change', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ payments: [] }) })
         .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ summary: {} }) });

    await act(async () => { render(<MemberContributionHistory user={mockUser} />); });

    // Trigger date change (Covers date input branches)
    const dateInput = screen.getByLabelText(/From Date/i);
    await act(async () => { fireEvent.change(dateInput, { target: { value: '2026-01-01' } }); });
    
    expect(screen.getByText(/no contributions found/i)).toBeInTheDocument();
  });

  test('covers API error catch and finally blocks', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error('Network Fail'));

    await act(async () => { render(<MemberContributionHistory user={mockUser} />); });
    
    // The finally block (setLoading(false)) is covered by the component rendering error text
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});