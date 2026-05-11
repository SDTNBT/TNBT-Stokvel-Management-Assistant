import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MemberContributionHistory from '../components/MemberContributionHistory';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  email: 'test@stokvel.com',
  name: 'Test User',
  surname: 'User'
};

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('MemberContributionHistory Component', () => {
  
  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);
    
    expect(screen.getByText('Loading your contribution history...')).toBeInTheDocument();
  });

  test('displays payment history after successful fetch', async () => {
    const mockPayments = {
      payments: [
        {
          _id: '1',
          date: '2026-05-01T00:00:00.000Z',
          groupName: 'Test Group',
          amount: 500,
          transactionId: 'txn_123456',
          status: 'Confirmed'
        }
      ]
    };

    const mockSummary = {
      summary: {
        totalPaid: 500,
        totalPayments: 1,
        uniqueGroups: 1,
        lastPaymentDate: '2026-05-01T00:00:00.000Z',
        lastPaymentAmount: 500
      }
    };

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPayments)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSummary)
      }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('My Contribution History')).toBeInTheDocument();
      expect(screen.getByText('R500.00')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  test('displays no payments message when no data', async () => {
    const mockPayments = { payments: [] };
    const mockSummary = {
      summary: {
        totalPaid: 0,
        totalPayments: 0,
        uniqueGroups: 0,
        lastPaymentDate: null,
        lastPaymentAmount: 0
      }
    };

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPayments)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSummary)
      }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('No contributions found. Make your first payment to see it here.')).toBeInTheDocument();
    });
  });

  test('filters payments by group', async () => {
    const mockPayments = {
      payments: [
        {
          _id: '1',
          date: '2026-05-01T00:00:00.000Z',
          groupName: 'Group A',
          amount: 500,
          transactionId: 'txn_001',
          status: 'Confirmed'
        },
        {
          _id: '2',
          date: '2026-04-01T00:00:00.000Z',
          groupName: 'Group B',
          amount: 300,
          transactionId: 'txn_002',
          status: 'Confirmed'
        }
      ]
    };
    const mockSummary = { summary: { totalPaid: 800, totalPayments: 2, uniqueGroups: 2 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Group A')).toBeInTheDocument();
      expect(screen.getByText('Group B')).toBeInTheDocument();
    });

    const groupFilter = screen.getByLabelText('Filter by Group');
    fireEvent.change(groupFilter, { target: { value: 'Group A' } });

    await waitFor(() => {
      expect(screen.getByText('Group A')).toBeInTheDocument();
      expect(screen.queryByText('Group B')).not.toBeInTheDocument();
    });
  });

  test('filters payments by status', async () => {
    const mockPayments = {
      payments: [
        {
          _id: '1',
          date: '2026-05-01T00:00:00.000Z',
          groupName: 'Test Group',
          amount: 500,
          transactionId: 'txn_001',
          status: 'Confirmed'
        },
        {
          _id: '2',
          date: '2026-04-01T00:00:00.000Z',
          groupName: 'Test Group',
          amount: 300,
          transactionId: 'txn_002',
          status: 'Pending'
        }
      ]
    };
    const mockSummary = { summary: { totalPaid: 800, totalPayments: 2, uniqueGroups: 1 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText('Filter by Status');
    fireEvent.change(statusFilter, { target: { value: 'confirmed' } });

    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.queryByText('Pending')).not.toBeInTheDocument();
    });
  });

  test('filters payments by date range', async () => {
    const mockPayments = {
      payments: [
        {
          _id: '1',
          date: '2026-05-15T00:00:00.000Z',
          groupName: 'Test Group',
          amount: 500,
          transactionId: 'txn_001',
          status: 'Confirmed'
        },
        {
          _id: '2',
          date: '2026-04-01T00:00:00.000Z',
          groupName: 'Test Group',
          amount: 300,
          transactionId: 'txn_002',
          status: 'Confirmed'
        }
      ]
    };
    const mockSummary = { summary: { totalPaid: 800, totalPayments: 2, uniqueGroups: 1 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('May 15, 2026')).toBeInTheDocument();
      expect(screen.getByText('Apr 1, 2026')).toBeInTheDocument();
    });

    const startDate = screen.getByLabelText('From Date');
    fireEvent.change(startDate, { target: { value: '2026-05-01' } });

    await waitFor(() => {
      expect(screen.getByText('May 15, 2026')).toBeInTheDocument();
      expect(screen.queryByText('Apr 1, 2026')).not.toBeInTheDocument();
    });
  });

  test('shows total filtered amount in table footer', async () => {
    const mockPayments = {
      payments: [
        {
          _id: '1',
          date: '2026-05-01T00:00:00.000Z',
          groupName: 'Group A',
          amount: 500,
          transactionId: 'txn_001',
          status: 'Confirmed'
        },
        {
          _id: '2',
          date: '2026-04-01T00:00:00.000Z',
          groupName: 'Group A',
          amount: 300,
          transactionId: 'txn_002',
          status: 'Confirmed'
        }
      ]
    };
    const mockSummary = { summary: { totalPaid: 800, totalPayments: 2, uniqueGroups: 1 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('R800.00')).toBeInTheDocument();
    });
  });

  test('displays correct status badge for confirmed payment', async () => {
    const mockPayments = {
      payments: [
        {
          _id: '1',
          date: '2026-05-01T00:00:00.000Z',
          groupName: 'Test Group',
          amount: 500,
          transactionId: 'txn_001',
          status: 'Confirmed'
        }
      ]
    };
    const mockSummary = { summary: { totalPaid: 500, totalPayments: 1, uniqueGroups: 1 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      const confirmedBadge = screen.getByText('Confirmed');
      expect(confirmedBadge).toHaveClass('status-confirmed');
    });
  });

  test('displays correct status badge for pending payment', async () => {
    const mockPayments = {
      payments: [
        {
          _id: '1',
          date: '2026-05-01T00:00:00.000Z',
          groupName: 'Test Group',
          amount: 500,
          transactionId: 'txn_001',
          status: 'Pending'
        }
      ]
    };
    const mockSummary = { summary: { totalPaid: 500, totalPayments: 1, uniqueGroups: 1 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<MemberContributionHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      const pendingBadge = screen.getByText('Pending');
      expect(pendingBadge).toHaveClass('status-pending');
    });
  });
});
