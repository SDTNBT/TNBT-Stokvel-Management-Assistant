import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MemberDashboard from '../Dashboard/MemberDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  email: 'member@stokvel.com',
  name: 'Test Member',
  surname: 'User',
  _id: 'user123',
  role: 'Member'
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { groupName: 'Test Group', contributionAmount: 500, groupId: 'group123', user: mockUser } }),
  useParams: () => ({ groupId: 'group123' })
}));

// Mock child components
jest.mock('../components/Profile', () => () => <div data-testid="profile-component">Profile Component</div>);
jest.mock('../components/PaymentHistory', () => () => <div data-testid="payment-history">Payment History</div>);
jest.mock('../components/ContributionCompliance', () => () => <div data-testid="contribution-compliance">Contribution Compliance</div>);
jest.mock('../components/MemberAnalytics', () => () => <div data-testid="member-analytics">Member Analytics</div>);
jest.mock('../components/SavingsProjection', () => () => <div data-testid="savings-projection">Savings Projection</div>);
jest.mock('../Dashboard/PaymentPreview', () => () => <div data-testid="payment-preview">Payment Preview</div>);
jest.mock('../Dashboard/PaymentGateway', () => () => <div data-testid="payment-gateway">Payment Gateway</div>);
jest.mock('../Dashboard/PaymentSuccess', () => () => <div data-testid="payment-success">Payment Success</div>);

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
});

describe('MemberDashboard Component', () => {

  test('renders dashboard shell correctly', () => {
    render(<MemberDashboard onLogout={() => {}} />, { wrapper: BrowserRouter });
    
    expect(screen.getByText('StokvelStokkie')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('My Groups')).toBeInTheDocument();
  });

  test('navigates to home when Home button is clicked', () => {
    render(<MemberDashboard onLogout={() => {}} />, { wrapper: BrowserRouter });
    
    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('navigates to my-groups when My Groups button is clicked', () => {
    render(<MemberDashboard onLogout={() => {}} />, { wrapper: BrowserRouter });
    
    const myGroupsButton = screen.getByText('My Groups');
    fireEvent.click(myGroupsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/my-groups');
  });

  test('calls onLogout when Logout button is clicked', () => {
    const mockLogout = jest.fn();
    render(<MemberDashboard onLogout={mockLogout} />, { wrapper: BrowserRouter });
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });
});
