import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <>{children}</>,
}));

// Mock all components to avoid import errors - use simple strings
jest.mock('../components/MemberAnalytics', () => () => 'MemberAnalytics');
jest.mock('../components/SavingsProjection', () => () => 'SavingsProjection');
jest.mock('../components/PayoutHistory', () => () => 'PayoutHistory');
jest.mock('../components/PaymentHistory', () => () => 'PaymentHistory');
jest.mock('../components/ContributionCompliance', () => () => 'ContributionCompliance');
jest.mock('../components/Profile', () => () => 'Profile');
jest.mock('../Dashboard/newAdminDashboard', () => () => 'AdminDashboard');
jest.mock('../Dashboard/TreasurerDashboard', () => () => 'TreasurerDashboard');
jest.mock('../Dashboard/MemberDashboard', () => () => 'MemberDashboard');
jest.mock('../Dashboard/MeetingManagerDashboard', () => () => 'MeetingManagerDashboard');
jest.mock('../Dashboard/ScheduleMeeting', () => () => 'ScheduleMeeting');
jest.mock('../Dashboard/GroupManagement', () => () => 'GroupManagement');
jest.mock('../Dashboard/PostAgendas', () => () => 'PostAgendas');
jest.mock('../Dashboard/RecordMinutes', () => () => 'RecordMinutes');

test('renders the StokvelStokkie logo text', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  const logoElement = screen.getByText(/StokvelStokkie/i);
  expect(logoElement).toBeInTheDocument();
});
