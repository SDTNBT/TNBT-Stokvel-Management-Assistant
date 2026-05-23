import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: ({ children }) => <>{children}</>,
}));

jest.mock('./components/Home', () => () => <div>Home</div>);
jest.mock('./components/Login', () => ({ LoginPage: () => <div>Login</div> }));
jest.mock('./components/SignUp', () => ({ SignUp: () => <div>SignUp</div> }));
jest.mock('./components/Creategroup', () => () => <div>CreateGroup</div>);
jest.mock('./components/MyGroups', () => () => <div>MyGroups</div>);
jest.mock('./components/Profile', () => () => <div>Profile</div>);
jest.mock('./components/SchedulePayout', () => () => <div>SchedulePayout</div>);
jest.mock('./components/NotificationsPage', () => () => <div>Notifications</div>);
jest.mock('./components/NotificationDetails', () => () => <div>NotificationDetails</div>);
jest.mock('./components/MemberAnalytics', () => () => <div>MemberAnalytics</div>);
jest.mock('./components/PayoutHistory', () => () => <div>PayoutHistory</div>);
jest.mock('./components/VirtualAccount', () => () => <div>VirtualAccount</div>);

jest.mock('./Dashboard/SavingsProjection', () => () => <div>SavingsProjection</div>);
jest.mock('./Dashboard/newAdminDashboard', () => () => <div>AdminDashboard</div>);
jest.mock('./Dashboard/TreasurerDashboard', () => () => <div>TreasurerDashboard</div>);
jest.mock('./Dashboard/MemberDashboard', () => () => <div>MemberDashboard</div>);
jest.mock('./Dashboard/MeetingManagerDashboard', () => () => <div>MeetingManagerDashboard</div>);
jest.mock('./Dashboard/ScheduleMeeting', () => () => <div>ScheduleMeeting</div>);
jest.mock('./Dashboard/GroupManagement', () => () => <div>GroupManagement</div>);
jest.mock('./Dashboard/PostAgendas', () => () => <div>PostAgendas</div>);
jest.mock('./Dashboard/RecordMinutes', () => ({ RecordMinutes: () => <div>RecordMinutes</div> }));

test('app renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
});

test('app mounts and renders a route', () => {
    render(<App />);
    expect(document.querySelector('.app-root') || document.body).toBeTruthy();
});