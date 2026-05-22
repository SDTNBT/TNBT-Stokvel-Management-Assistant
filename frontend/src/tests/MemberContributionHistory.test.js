import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MemberContributionHistory from '../components/MemberContributionHistory';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  email: 'member@stokvel.com',
  name: 'Test Member',
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

  test('handles missing user gracefully', async () => {
    render(<MemberContributionHistory user={null} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Loading your contribution history...')).toBeInTheDocument();
    });
  });
});
