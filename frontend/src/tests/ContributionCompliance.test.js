import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContributionCompliance from '../components/ContributionCompliance';

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

const renderWithRouter = (component) => {
  return render(component, { wrapper: BrowserRouter });
};

describe('ContributionCompliance Component', () => {

  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);
    
    expect(screen.getByText('Loading compliance report...')).toBeInTheDocument();
  });

  test('displays compliance data after successful fetch', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 85,
      totalExpected: 12,
      totalPaid: 10,
      missedPayments: 2,
      latePayments: 1,
      onTimeRate: 90,
      monthlyBreakdown: [
        {
          month: 'January 2026',
          expected: 500,
          paid: 500,
          dueDate: '15/01/2026',
          paymentDate: '2026-01-10T00:00:00.000Z',
          status: 'on-time'
        },
        {
          month: 'February 2026',
          expected: 500,
          paid: 500,
          dueDate: '15/02/2026',
          paymentDate: '2026-02-20T00:00:00.000Z',
          status: 'late'
        },
        {
          month: 'March 2026',
          expected: 500,
          paid: 0,
          dueDate: '15/03/2026',
          paymentDate: null,
          status: 'missed'
        }
      ],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: '2026-02-20T00:00:00.000Z'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Contribution Compliance Report')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('displays compliance score with correct color for excellent rate (>=90)', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 95,
      totalExpected: 20,
      totalPaid: 19,
      missedPayments: 1,
      latePayments: 0,
      onTimeRate: 100,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      const statusMessage = screen.getByText('Excellent! You are very consistent.');
      expect(statusMessage).toHaveClass('excellent');
    });
  });

  test('displays compliance score with correct color for good rate (75-89)', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 80,
      totalExpected: 10,
      totalPaid: 8,
      missedPayments: 2,
      latePayments: 1,
      onTimeRate: 85,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      const statusMessage = screen.getByText('Good. Keep up the momentum.');
      expect(statusMessage).toHaveClass('good');
    });
  });

  test('displays compliance score with correct color for average rate (50-74)', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 65,
      totalExpected: 10,
      totalPaid: 6,
      missedPayments: 4,
      latePayments: 2,
      onTimeRate: 70,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      const statusMessage = screen.getByText('Average. Try to improve consistency.');
      expect(statusMessage).toHaveClass('average');
    });
  });

  test('displays compliance score with correct color for poor rate (<50)', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 40,
      totalExpected: 10,
      totalPaid: 4,
      missedPayments: 6,
      latePayments: 3,
      onTimeRate: 50,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      const statusMessage = screen.getByText('Needs attention. Consider setting up reminders.');
      expect(statusMessage).toHaveClass('poor');
    });
  });

  test('displays monthly breakdown table with correct status badges', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 75,
      totalExpected: 3,
      totalPaid: 2,
      missedPayments: 1,
      latePayments: 0,
      onTimeRate: 100,
      monthlyBreakdown: [
        {
          month: 'January 2026',
          expected: 500,
          paid: 500,
          dueDate: '15/01/2026',
          paymentDate: '2026-01-10T00:00:00.000Z',
          status: 'on-time'
        },
        {
          month: 'February 2026',
          expected: 500,
          paid: 0,
          dueDate: '15/02/2026',
          paymentDate: null,
          status: 'missed'
        }
      ],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: '2026-01-10T00:00:00.000Z'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('January 2026')).toBeInTheDocument();
      expect(screen.getByText('February 2026')).toBeInTheDocument();
      expect(screen.getByText('On Time')).toBeInTheDocument();
      expect(screen.getByText('Missed')).toBeInTheDocument();
    });
  });

  test('displays no data message when complianceData is null', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('No compliance data available. Make your first payment to see reports.')).toBeInTheDocument();
    });
  });

  test('displays error message when API fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('displays error message when response is not ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: false
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load compliance data')).toBeInTheDocument();
    });
  });

  test('displays recommendations based on compliance data', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 60,
      totalExpected: 10,
      totalPaid: 6,
      missedPayments: 4,
      latePayments: 2,
      onTimeRate: 70,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Set up payment reminders to avoid missing contributions.')).toBeInTheDocument();
      expect(screen.getByText('You have 4 missed payment(s). Contact your treasurer to catch up.')).toBeInTheDocument();
      expect(screen.getByText('Consider scheduling automatic payments to improve on-time rate.')).toBeInTheDocument();
    });
  });

  test('displays positive recommendations for high compliance rate', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 95,
      totalExpected: 10,
      totalPaid: 9,
      missedPayments: 1,
      latePayments: 0,
      onTimeRate: 100,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Excellent work! You are a highly reliable member.')).toBeInTheDocument();
    });
  });

  test('displays summary cards with correct values', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 75,
      totalExpected: 8,
      totalPaid: 6,
      missedPayments: 2,
      latePayments: 1,
      onTimeRate: 83,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Total Expected')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Payments Made')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('On-Time Rate')).toBeInTheDocument();
      expect(screen.getByText('83%')).toBeInTheDocument();
      expect(screen.getByText('Missed Payments')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('handles missing user gracefully', async () => {
    renderWithRouter(<ContributionCompliance user={null} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Loading compliance report...')).toBeInTheDocument();
    });
  });

  test('formats currency correctly for South African Rand', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 75,
      totalExpected: 12,
      totalPaid: 9,
      missedPayments: 3,
      latePayments: 1,
      onTimeRate: 88,
      monthlyBreakdown: [
        {
          month: 'January 2026',
          expected: 500,
          paid: 500,
          dueDate: '15/01/2026',
          paymentDate: '2026-01-10T00:00:00.000Z',
          status: 'on-time'
        }
      ],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: '2026-01-10T00:00:00.000Z'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('R500.00')).toBeInTheDocument();
    });
  });

  test('displays recommendations section', async () => {
    const mockComplianceData = {
      success: true,
      complianceRate: 85,
      totalExpected: 10,
      totalPaid: 8,
      missedPayments: 2,
      latePayments: 0,
      onTimeRate: 100,
      monthlyBreakdown: [],
      joinDate: '2026-01-01T00:00:00.000Z',
      lastPaymentDate: null
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplianceData
    });

    renderWithRouter(<ContributionCompliance user={mockUser} groupName="Test Group" />);

    await waitFor(() => {
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Review your contribution schedule and plan ahead for upcoming payments.')).toBeInTheDocument();
    });
  });
});
