import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MemberDashboard from '../Dashboard/MemberDashboard';

// Mock the user data that the component expects to find
const mockUser = {
  firstName: 'John',
  surname: 'Doe',
  email: 'john@example.com',
  role: 'member'
};

describe('MemberDashboard Component', () => {
  beforeEach(() => {
    // This clears any old data before each test
    sessionStorage.clear();
    sessionStorage.setItem('user', JSON.stringify(mockUser));
  });

  test('renders the welcome message with the user name', () => {
    render(
      <BrowserRouter>
        <MemberDashboard />
      </BrowserRouter>
    );

    // This checks if "Welcome, John" (or similar) appears
    const welcomeText = screen.getByText(/Welcome/i);
    expect(welcomeText).toBeInTheDocument();
    expect(screen.getByText(/John/i)).toBeInTheDocument();
  });

  test('displays the main navigation sections', () => {
  render(
    <BrowserRouter>
      <MemberDashboard />
    </BrowserRouter>
  );

  expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
  expect(screen.getByText(/My Groups/i)).toBeInTheDocument();
  expect(screen.getByText(/View My Contributions/i)).toBeInTheDocument();
  expect(screen.getByText(/Payment/i)).toBeInTheDocument(); 
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
});
});