import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TreasurerDashboard from '../Dashboard/TreasurerDashboard';
import '@testing-library/jest-dom';

// 1. Mock Lucide Icons (Prevents errors with SVG rendering in JSDOM)
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  Users: () => <div data-testid="icon-users" />,
  Users2: () => <div data-testid="icon-users2" />,
  CalendarDays: () => <div data-testid="icon-calendar" />,
  Mic2: () => <div data-testid="icon-mic" />,
  ChevronDown: () => <div data-testid="icon-chevron" />,
  UserCircle: () => <div data-testid="icon-user" />,
  LogOut: () => <div data-testid="icon-logout" />,
  Bell: () => <div data-testid="icon-bell" />,
  FileText: () => <div data-testid="icon-file" />,
  ClipboardList: () => <div data-testid="icon-clipboard" />,
  ChevronLeft: () => <div data-testid="icon-left" />,
  ChevronRight: () => <div data-testid="icon-right" />
}));

// 2. Mock Child Components using the correct relative paths
jest.mock('../Dashboard/ScheduleMeeting', () => () => <div data-testid="schedule-meeting-comp">Schedule Meeting Component</div>);
jest.mock('../Dashboard/PostAgendas', () => () => <div data-testid="post-agenda-comp">Post Agenda Component</div>);
jest.mock('../Dashboard/RecordMinutes', () => () => <div data-testid="record-minutes-comp">Record Minutes Component</div>);
jest.mock('../Dashboard/ViewContributions', () => () => <div data-testid="view-contributions-comp">View Contributions Component</div>);
jest.mock('../components/Profile', () => ({ onLogout }) => (
  <div data-testid="profile-comp">
    Profile Component
    <button onClick={onLogout}>Logout Action</button>
  </div>
));

describe('TreasurerDashboard Component', () => {
  const mockUser = { name: 'Test User', email: 'test@example.com' };
  const mockLogout = jest.fn();
  const groupId = 'group-123';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup mock data in localStorage
    const groups = [{ _id: groupId, groupName: 'Wits Tech Stokvel' }];
    const meetings = [
      { 
        groupId: groupId, 
        meetingTitle: 'Monthly Budget Review', 
        meetingDate: '2026-06-01', 
        startTime: '10:00', 
        endTime: '12:00' 
      }
    ];
    localStorage.setItem('stokvel_groups', JSON.stringify(groups));
    localStorage.setItem('stokvel_meetings', JSON.stringify(meetings));
  });

  const renderDashboard = () => render(
    <MemoryRouter initialEntries={[`/treasurer/${groupId}`]}>
      <Routes>
        <Route path="/treasurer/:groupId" element={<TreasurerDashboard user={mockUser} onLogout={mockLogout} />} />
      </Routes>
    </MemoryRouter>
  );

  test('loads group name and meetings from localStorage on mount', () => {
    renderDashboard();
    expect(screen.getByText(/Dashboard: Wits Tech Stokvel/i)).toBeInTheDocument();
    expect(screen.getByText('Monthly Budget Review')).toBeInTheDocument();
  });

  test('toggles Meeting Management dropdown', () => {
    renderDashboard();
    const meetingMgmtBtn = screen.getByText(/Meeting Management/i);
    
    fireEvent.click(meetingMgmtBtn);
    expect(screen.getByText('Post Agenda')).toBeInTheDocument();
    
    fireEvent.click(meetingMgmtBtn); // Close dropdown
    expect(screen.queryByText('Post Agenda')).not.toBeInTheDocument();
  });

  test('switches to Schedule Meeting tab', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/Meeting Management/i));
    fireEvent.click(screen.getByText(/Schedule Meeting/i));
    
    expect(screen.getByTestId('schedule-meeting-comp')).toBeInTheDocument();
    expect(screen.queryByText(/Calendar/i)).not.toBeInTheDocument();
  });

  test('navigates to Profile and triggers logout', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/Profile/i));
    
    expect(screen.getByTestId('profile-comp')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Logout Action'));
    expect(mockLogout).toHaveBeenCalled();
  });

  test('renders empty state when no meetings are available', () => {
    localStorage.setItem('stokvel_meetings', JSON.stringify([]));
    renderDashboard();
    expect(screen.getByText(/No scheduled meetings for/i)).toBeInTheDocument();
  });

  test('updates month when calendar navigation is clicked', () => {
    renderDashboard();
    const initialMonth = screen.getByRole('heading', { level: 3 }).textContent;
    
    // Get all buttons with the navigation class
    const navButtons = screen.getAllByRole('button').filter(b => b.className.includes('month-nav-btn'));
    
    // Click "Next Month" (the second button in the nav)
    fireEvent.click(navButtons[1]);
    
    const newMonth = screen.getByRole('heading', { level: 3 }).textContent;
    expect(newMonth).not.toBe(initialMonth);
  });
});