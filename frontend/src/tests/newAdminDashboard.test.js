import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NewAdminDashboard from '../components/newAdminDashboard';

// 1. Mock child components using standard React structure objects to completely avoid JSX syntax
jest.mock('../components/ScheduleMeeting', () => () => ({ 
  $$typeof: Symbol.for('react.element'), 
  type: 'section', 
  props: { 'data-testid': 'schedule-meeting-view', children: 'Schedule Meeting View' }, 
  ref: null 
}));
jest.mock('../components/PostAgendas', () => () => ({ 
  $$typeof: Symbol.for('react.element'), 
  type: 'section', 
  props: { 'data-testid': 'post-agenda-view', children: 'Post Agendas View' }, 
  ref: null 
}));
jest.mock('../components/RecordMinutes', () => () => ({ 
  $$typeof: Symbol.for('react.element'), 
  type: 'section', 
  props: { 'data-testid': 'record-minutes-view', children: 'Record Minutes View' }, 
  ref: null 
}));
jest.mock('../components/ViewMembers', () => () => ({ 
  $$typeof: Symbol.for('react.element'), 
  type: 'section', 
  props: { 'data-testid': 'view-members-view', children: 'View Members View' }, 
  ref: null 
}));
jest.mock('../components/InviteMember', () => () => ({ 
  $$typeof: Symbol.for('react.element'), 
  type: 'section', 
  props: { 'data-testid': 'invite-member-view', children: 'Invite Member View' }, 
  ref: null 
}));
jest.mock('../components/Profile', () => () => ({ 
  $$typeof: Symbol.for('react.element'), 
  type: 'section', 
  props: { 'data-testid': 'profile-view', children: 'Profile View' }, 
  ref: null 
}));

// 2. Mock Lucide Icons using standard semantic paragraph objects
jest.mock('lucide-react', () => {
  const createIconMock = (testId) => () => ({
    $$typeof: Symbol.for('react.element'),
    type: 'p',
    props: { 'data-testid': testId },
    ref: null
  });

  return {
    LayoutDashboard: createIconMock('icon-dashboard'),
    sidebarOpen: createIconMock('icon-sidebar-open'),
    Users: createIconMock('icon-users'),
    UserPlus: createIconMock('icon-userplus'),
    Users2: createIconMock('icon-users2'),
    Calendar: createIconMock('icon-calendar'),
    FileText: createIconMock('icon-filetext'),
    CheckSquare: createIconMock('icon-checksquare'),
    LogOut: createIconMock('icon-logout'),
    ChevronLeft: createIconMock('icon-chevron-left'),
    ChevronRight: createIconMock('icon-chevron-right')
  };
});

// 3. Prefix hook data with "mock" to address out-of-scope tracking rules
const mockSetMembers = jest.fn();
jest.mock('../components/useGroupData', () => ({
  useGroupData: () => ({
    members: [],
    group: { _id: '123', groupName: 'Test Stokvel' },
    setMembers: mockSetMembers
  })
}));

jest.mock('../hooks/useAllUsers', () => ({
  __esModule: true,
  default: () => ({
    users: [],
    loading: false,
    error: null
  })
}));

describe('NewAdminDashboard Component Navigation and Layout', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderDashboard = (initialHistoryState = null) => {
    // Top-level wrappers are safely declared using explicit functional wrappers
    return render(
      React.createElement(
        MemoryRouter,
        {
          initialEntries: [{ pathname: '/admin/123', state: initialHistoryState }],
          future: { v7_startTransition: true, v7_relativeSplatPath: true }
        },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: '/admin/:groupId',
            element: React.createElement(NewAdminDashboard, {
              user: { name: 'Admin User' },
              onLogout: jest.fn()
            })
          })
        )
      )
    );
  };

  test('covers groupName initialization branches from location state and localStorage', () => {
    // Branch 1: groupName retrieved from router location state parameters
    const { unmount } = renderDashboard({ groupName: 'State Route Stokvel' });
    expect(screen.getByText('State Route Stokvel')).toBeInTheDocument();
    unmount();

    // Branch 2: groupName fallback logic checking local storage structures
    const mockGroups = [{ _id: '123', groupName: 'Storage Stokvel' }];
    localStorage.setItem('stokvel_groups', JSON.stringify(mockGroups));
    
    renderDashboard(null); 
    expect(screen.getByText('Storage Stokvel')).toBeInTheDocument();
  });

  test('covers dropdown menus toggling behavior in the sidebar', () => {
    renderDashboard();
    
    const groupMgmtButton = screen.getByText('Group Management');
    const meetingMgmtButton = screen.getByText('Meeting Management');

    // Group Management drop interface click validation
    fireEvent.click(groupMgmtButton);
    expect(screen.getByText('View Member')).toBeInTheDocument();
    expect(screen.getByText('Invite Member')).toBeInTheDocument();

    // Meeting Management drop interface click validation
    fireEvent.click(meetingMgmtButton);
    expect(screen.getByText('Schedule Meeting')).toBeInTheDocument();
    expect(screen.getByText('Post Agenda')).toBeInTheDocument();
  });

  test('covers interactive navigation tabs switching and content rendering', () => {
    renderDashboard();

    // Expand structural nested wrappers
    fireEvent.click(screen.getByText('Group Management'));
    fireEvent.click(screen.getByText('Meeting Management'));

    // Component View: Schedule Meeting
    fireEvent.click(screen.getByText('Schedule Meeting'));
    expect(screen.getByTestId('schedule-meeting-view')).toBeInTheDocument();

    // Component View: Post Agenda
    fireEvent.click(screen.getByText('Post Agenda'));
    expect(screen.getByTestId('post-agenda-view')).toBeInTheDocument();

    // Component View: Record Minutes
    fireEvent.click(screen.getByText('Record Minutes'));
    expect(screen.getByTestId('record-minutes-view')).toBeInTheDocument();

    // Component View: Invite Member
    fireEvent.click(screen.getByText('Invite Member'));
    expect(screen.getByTestId('invite-member-view')).toBeInTheDocument();

    // Component View: Profile Configuration Footer
    fireEvent.click(screen.getByText('Profile'));
    expect(screen.getByTestId('profile-view')).toBeInTheDocument();
  });

  test('covers calendar month changes forward and backward', () => {
    renderDashboard();

    // Capture standard baseline layout values
    const initialMonthYear = screen.getByRole('heading', { level: 3 }).textContent;

    // Isolate targeting arrays for explicit placement identification
    const prevButton = screen.getAllByClassName('month-nav-btn')[0];
    const nextButton = screen.getAllByClassName('month-nav-btn')[1];

    // Evaluate step modification targets forward
    fireEvent.click(nextButton);
    const postNextMonthYear = screen.getByRole('heading', { level: 3 }).textContent;
    expect(postNextMonthYear).not.toEqual(initialMonthYear);

    // Evaluate step modification targets backward back to base state
    fireEvent.click(prevButton);
    const backMonthYear = screen.getByRole('heading', { level: 3 }).textContent;
    expect(backMonthYear).toEqual(initialMonthYear);
  });
});