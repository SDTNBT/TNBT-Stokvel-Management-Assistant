import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import CreateGroup from './components/Creategroup';
import './App.css';
import { LoginPage } from './components/Login';
import { SignUp } from './components/SignUp';
import Profile from './components/Profile';
import MyGroups from './components/MyGroups';
import SchedulePayout from './components/SchedulePayout';

import AdminDashboard from './Dashboard/newAdminDashboard';
import TreasurerDashboard from './Dashboard/TreasurerDashboard';
import MemberDashboard from './Dashboard/MemberDashboard';
import MeetingManagerDashboard from './Dashboard/MeetingManagerDashboard';

import ScheduleMeeting from './Dashboard/ScheduleMeeting';
import GroupManagement from './Dashboard/GroupManagement';
import PostAgendas from './Dashboard/PostAgendas';
import { RecordMinutes } from './Dashboard/RecordMinutes';
import NotificationsPage from './components/NotificationsPage';
import NotificationDetails from './components/NotificationDetails';

function App() {
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = '/';
  };

  const user = JSON.parse(sessionStorage.getItem('user'));

  return (
    <Router>
      <main className="app-root">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-group" element={<CreateGroup />} />

          <Route path="/my-groups" element={<MyGroups user={user} onLogout={handleLogout} />} />
          <Route path="/schedule-payout/:groupId" element={<SchedulePayout user={user} onLogout={handleLogout} />} />

          <Route path="/meeting-manager/:groupId" element={<MeetingManagerDashboard />} />
          <Route path="/schedule/:groupId" element={<ScheduleMeeting />} />
          <Route path="/manage-group/:groupId" element={<GroupManagement />} />
          <Route path="/post-agenda/:groupId" element={<PostAgendas />} />

          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/notifications/:id" element={<NotificationDetails />} />

          <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />

          <Route
            path="/admin-dashboard/:groupId"
            element={<AdminDashboard user={user} onLogout={handleLogout} />}
          />

          <Route
            path="/admin/record-minutes/:groupId"
            element={<RecordMinutes user={user} onLogout={handleLogout} />}
          />

          <Route
            path="/treasurer-dashboard/:groupId"
            element={<TreasurerDashboard user={user} onLogout={handleLogout} />}
          />

          <Route
            path="/member-dashboard/:groupId"
            element={<MemberDashboard user={user} onLogout={handleLogout} />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;