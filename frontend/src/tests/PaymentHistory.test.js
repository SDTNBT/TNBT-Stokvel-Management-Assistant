import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PaymentHistory from '../components/PaymentHistory';

global.fetch = jest.fn();

const mockUser = {
  email: 'test@stokvel.com',
  name: 'Test User',
  _id: 'user123'
};

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
});

describe('PaymentHistory Component', () => {

  test('renders payment history and make payment button', async () => {
    const mockPayments = { payments: [] };
    const mockSummary = { summary: { totalPaid: 0, totalPayments: 0, uniqueGroups: 0 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<PaymentHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Payment History')).toBeInTheDocument();
      expect(screen.getByText('Make a Payment')).toBeInTheDocument();
    });
  });

  test('opens payment modal when Make a Payment button is clicked', async () => {
    const mockPayments = { payments: [] };
    const mockSummary = { summary: { totalPaid: 0, totalPayments: 0, uniqueGroups: 0 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<PaymentHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Make a Payment')).toBeInTheDocument();
    });

    const makePaymentBtn = screen.getByText('Make a Payment');
    fireEvent.click(makePaymentBtn);

    expect(screen.getByText('Make a Payment')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount (R)')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Method')).toBeInTheDocument();
  });

  test('closes modal when Cancel is clicked', async () => {
    const mockPayments = { payments: [] };
    const mockSummary = { summary: { totalPaid: 0, totalPayments: 0, uniqueGroups: 0 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<PaymentHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Make a Payment')).toBeInTheDocument();
    });

    const makePaymentBtn = screen.getByText('Make a Payment');
    fireEvent.click(makePaymentBtn);

    expect(screen.getByText('Make a Payment')).toBeInTheDocument();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Make a Payment')).not.toBeInTheDocument();
    });
  });

  test('displays summary cards correctly', async () => {
    const mockPayments = { payments: [] };
    const mockSummary = {
      summary: {
        totalPaid: 2500,
        totalPayments: 5,
        uniqueGroups: 2,
        lastPaymentDate: '2026-05-10T00:00:00.000Z',
        lastPaymentAmount: 500
      }
    };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<PaymentHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Total Paid')).toBeInTheDocument();
      expect(screen.getByText('R2,500.00')).toBeInTheDocument();
      expect(screen.getByText('Total Payments')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('displays transactions list when payments exist', async () => {
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

    render(<PaymentHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('R500.00')).toBeInTheDocument();
    });
  });

  test('displays no transactions message when no payments', async () => {
    const mockPayments = { payments: [] };
    const mockSummary = { summary: { totalPaid: 0, totalPayments: 0, uniqueGroups: 0 } };

    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) }));

    render(<PaymentHistory user={mockUser} groupName="Test Group" groupId="123" />);

    await waitFor(() => {
      expect(screen.getByText('No payments found. Make your first payment to see it here.')).toBeInTheDocument();
    });
  });
});
