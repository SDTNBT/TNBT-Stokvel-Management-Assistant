import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TreasurerDashboard from '../Dashboard/TreasurerDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  email: 'treasurer@stokvel.com',
  name: 'Test Treasurer',
  surname: 'User',
  _id: 'user456',
  role: 'Treasurer'
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { groupName: 'Test Group', groupId: 'group123', user: mockUser } }),
  useParams: () => ({ groupId: 'group123' })
}));

// Mock child components
jest.mock('../components/Profile', () => () => <div data-testid="profile-component">Profile Component</div>);
jest.mock('../Dashboard/ScheduleMeeting', () => () => <div data-testid="schedule-meeting">Schedule Meeting</div>);
jest.mock('../Dashboard/PostAgendas', () => () => <div data-testid="post-agendas">Post Agendas</div>);
jest.mock('../Dashboard/RecordMinutes', () => () => <div data-testid="record-minutes">Record Minutes</div>);
jest.mock('../Dashboard/PaymentTracking', () => () => <div data-testid="payment-tracking">Payment Tracking</div>);
jest.mock('../components/SchedulePayout', () => () => <div data-testid="schedule-payout">Schedule Payout</div>);
jest.mock('../Dashboard/InitiatePayout', () => () => <div data-testid="initiate-payout">Initiate Payout</div>);

// Mock localStorage for meetings
beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'stokvel_meetings') {
      return JSON.stringify([]);
    }
    return JSON.stringify(mockUser);
  });
  Storage.prototype.setItem = jest.fn();
  fetch.mockResolvedValue({ ok: true, json: async () => [] });
});

describe('TreasurerDashboard Component', () => {

  test('renders dashboard shell correctly', () => {
    render(<TreasurerDashboard onLogout={() => {}} />, { wrapper: BrowserRouter });
    
    expect(screen.getByText('StokvelStokkie')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Groups')).toBeInTheDocument();
  });

  test('navigates to home when My Groups is clicked', () => {
    render(<TreasurerDashboard onLogout={() => {}} />, { wrapper: BrowserRouter });
    
    const myGroupsButton = screen.getByText('My Groups');
    fireEvent.click(myGroupsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('calls onLogout when Logout button is clicked', () => {
    const mockLogout = jest.fn();
    render(<TreasurerDashboard onLogout={mockLogout} />, { wrapper: BrowserRouter });
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });
});
