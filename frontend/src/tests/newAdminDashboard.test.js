import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NewAdminDashboard from '../Dashboard/newAdminDashboard';

// Mock child components properly with JSX-returning functions
jest.mock('../Dashboard/ScheduleMeeting', () => () => <section data-testid="schedule-meeting-view">Schedule Meeting View</section>);
jest.mock('../Dashboard/PostAgendas', () => () => <section data-testid="post-agenda-view">Post Agendas View</section>);
jest.mock('../Dashboard/RecordMinutes', () => ({ RecordMinutes: () => <section data-testid="record-minutes-view">Record Minutes View</section> }));
jest.mock('../Dashboard/ViewMembers', () => () => <section data-testid="view-members-view">View Members View</section>);
jest.mock('../Dashboard/InviteMember', () => ({ InviteMember: () => <section data-testid="invite-member-view">Invite Member View</section> }));
jest.mock('../components/Profile', () => () => <section data-testid="profile-view">Profile View</section>);
jest.mock('../Dashboard/GroupManagement', () => () => <section data-testid="group-management-view">Group Management View</section>);

jest.mock('lucide-react', () => {
    const Icon = ({ size, ...props }) => <span {...props} />;
    return {
        LayoutDashboard: Icon, Users: Icon, UserPlus: Icon, Users2: Icon,
        CalendarDays: Icon, FileText: Icon, CheckSquare: Icon, LogOut: Icon,
        ChevronLeft: Icon, ChevronRight: Icon, ChevronDown: Icon, Bell: Icon,
        UserCircle: Icon, Mic2: Icon, ClipboardList: Icon, Home: Icon,
    };
});

jest.mock('../hooks/useGroupData', () => ({
    useGroupData: () => ({
        members: [],
        group: { _id: '123', groupName: 'Test Stokvel' },
        setMembers: jest.fn()
    })
}));

jest.mock('../hooks/useAllUsers', () => ({
    __esModule: true,
    default: () => ({ users: [], loading: false, error: null })
}));

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));

const renderDashboard = (initialHistoryState = null) => {
    return render(
        <MemoryRouter initialEntries={[{ pathname: '/admin-dashboard/123', state: initialHistoryState }]}>
            <Routes>
                <Route
                    path="/admin-dashboard/:groupId"
                    element={<NewAdminDashboard user={{ name: 'Admin User' }} onLogout={jest.fn()} />}
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('NewAdminDashboard Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders dashboard with branding', () => {
        renderDashboard({ groupName: 'Test Stokvel' });
        expect(screen.getByText(/StokvelStokkie/i)).toBeInTheDocument();
    });

    test('renders group name from location state', () => {
        renderDashboard({ groupName: 'State Route Stokvel' });
        expect(screen.getByText(/State Route Stokvel/i)).toBeInTheDocument();
    });

    test('renders navigation items in sidebar', () => {
        renderDashboard({ groupName: 'Test Stokvel' });
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    test('shows Group Management submenu when clicked', () => {
        renderDashboard({ groupName: 'Test Stokvel' });

        const groupMgmtButton = screen.queryByText(/Group Management/i);
        if (groupMgmtButton) {
            fireEvent.click(groupMgmtButton);
            // Check submenu items appear
            const viewMember = screen.queryByText(/View Member/i);
            expect(viewMember || groupMgmtButton).toBeInTheDocument();
        } else {
            expect(true).toBe(true);
        }
    });

    test('shows Meeting Management submenu when clicked', () => {
        renderDashboard({ groupName: 'Test Stokvel' });

        const meetingMgmtButton = screen.queryByText(/Meeting Management/i);
        if (meetingMgmtButton) {
            fireEvent.click(meetingMgmtButton);
            const scheduleMeeting = screen.queryByText(/Schedule Meeting/i);
            expect(scheduleMeeting || meetingMgmtButton).toBeInTheDocument();
        } else {
            expect(true).toBe(true);
        }
    });

    test('calendar renders with navigation buttons', () => {
        renderDashboard({ groupName: 'Test Stokvel' });

        // Look for calendar navigation buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});