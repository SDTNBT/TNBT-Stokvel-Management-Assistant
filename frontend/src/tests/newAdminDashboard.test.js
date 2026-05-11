import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NewAdminDashboard from '../Dashboard/NewAdminDashboard';
import { useGroupData } from '../Dashboard/useGroupData';
import '@testing-library/jest-dom';

// 1. Mock the custom hook
jest.mock('../Dashboard/useGroupData');

// 2. Mock Lucide Icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  Users: () => <div data-testid="icon-users" />,
  UserPlus: () => <div data-testid="icon-userplus" />,
  Users2: () => <div data-testid="icon-users2" />,
  CalendarDays: () => <div data-testid="icon-calendar" />,
  ClipboardList: () => <div data-testid="icon-clipboard" />,
  Mic2: () => <div data-testid="icon-mic" />,
  ChevronDown: () => <div data-testid="icon-chevron" />,
  UserCircle: () => <div data-testid="icon-user" />,
  LogOut: () => <div data-testid="icon-logout" />,
  ChevronLeft: () => <div data-testid="icon-left" />,
  ChevronRight: () => <div data-testid="icon-right" />,
  Bell: () => <div data-testid="icon-bell" />,
  FileText: () => <div data-testid="icon-file" />
}));

// 3. Mock Child Components
jest.mock('../Dashboard/ScheduleMeeting', () => () => <div>Mock Schedule Meeting</div>);
jest.mock('../Dashboard/PostAgendas', () => () => <div>Mock Post Agendas</div>);
jest.mock('../Dashboard/RecordMinutes', () => () => <div>Mock Record Minutes</div>);
jest.mock('../Dashboard/ViewMembers', () => ({ onSelectMember, members }) => (
  <div>
    <button onClick={() => onSelectMember(members[0])}>Select Member</button>
  </div>
));
jest.mock('../Dashboard/MemberDetails', () => ({ onClose, onRemove, member }) => (
  <div>
    <p>Details for {member.name}</p>
    <button onClick={() => onRemove(member._id)}>Remove Member</button>
    <button onClick={onClose}>Close Details</button>
  </div>
));
jest.mock('../components/Profile', () => ({ user }) => <div>Profile for {user.name}</div>);

describe('NewAdminDashboard Component', () => {
  const mockUser = { name: 'Admin User' };
  const mockLogout = jest.fn();
  const groupId = 'wits-group-001';
  
  const mockMembers = [{ _id: 'm1', name: 'John Doe', email: 'john@wits.ac.za' }];
  const mockGroup = { id: groupId, groupName: 'Tech Stokvel' };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default hook implementation
    useGroupData.mockReturnValue({
      members: mockMembers,
      group: mockGroup,
      setMembers: jest.fn()
    });

    // Mock fetch for the delete action
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    );
  });

  const renderDashboard = (state = null) => render(
    <MemoryRouter initialEntries={[{ pathname: `/admin/${groupId}`, state }]}>
      <Routes>
        <Route path="/admin/:groupId" element={<NewAdminDashboard user={mockUser} onLogout={mockLogout} />} />
      </Routes>
    </MemoryRouter>
  );

  test('retrieves group name from location state if provided', () => {
    renderDashboard({ groupName: 'State Group Name' });
    expect(screen.getByText('State Group Name')).toBeInTheDocument();
  });

  test('falls back to localStorage if location state is missing', () => {
    const localData = [{ _id: groupId, groupName: 'Storage Group Name' }];
    localStorage.setItem('stokvel_groups', JSON.stringify(localData));
    
    renderDashboard();
    expect(screen.getByText('Storage Group Name')).toBeInTheDocument();
  });

  test('toggles Group Management and switches to View Member tab', () => {
    renderDashboard();
    
    fireEvent.click(screen.getByText(/Group Management/i));
    fireEvent.click(screen.getByText(/View Member/i));
    
    expect(screen.getByText('Select Member')).toBeInTheDocument();
  });

  test('opens member details and triggers handleRemove', async () => {
    const setMembersMock = jest.fn();
    useGroupData.mockReturnValue({
      members: mockMembers,
      group: mockGroup,
      setMembers: setMembersMock
    });

    renderDashboard();
    
    // Navigate to View Members
    fireEvent.click(screen.getByText(/Group Management/i));
    fireEvent.click(screen.getByText(/View Member/i));
    
    // Select the member to show details
    fireEvent.click(screen.getByText('Select Member'));
    expect(screen.getByText('Details for John Doe')).toBeInTheDocument();
    
    // Click remove
    fireEvent.click(screen.getByText('Remove Member'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/managegroup/${groupId}/member/m1`),
        expect.any(Object)
      );
    });
  });

  test('renders timeline from localStorage meetings', () => {
    const meetings = [{
      groupId: groupId,
      meetingTitle: 'Wits Project Sync',
      meetingDate: '2026-10-10',
      startTime: '14:00',
      endTime: '15:00'
    }];
    localStorage.setItem('stokvel_meetings', JSON.stringify(meetings));
    
    renderDashboard();
    expect(screen.getByText('Wits Project Sync')).toBeInTheDocument();
  });

  test('changes month in calendar', () => {
    renderDashboard();
    const currentMonthLabel = screen.getByRole('heading', { level: 3 }).textContent;
    
    const nextBtn = screen.getAllByRole('button').filter(b => b.className.includes('month-nav-btn'))[1];
    fireEvent.click(nextBtn);
    
    const newMonthLabel = screen.getByRole('heading', { level: 3 }).textContent;
    expect(newMonthLabel).not.toBe(currentMonthLabel);
  });
});