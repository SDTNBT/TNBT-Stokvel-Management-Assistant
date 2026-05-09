import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// 1. All Imports at the top
import Home from './components/Home';
import CreateGroup from './components/Creategroup'; 
import './App.css';
import { LoginPage } from './components/Login';
import { SignUp } from './components/SignUp';
import Profile from './components/Profile';

// You are importing from the file 'newAdminDashboard', 
// but naming the component 'AdminDashboard' for use here.
import AdminDashboard from './Dashboard/newAdminDashboard'; 
import TreasurerDashboard from './Dashboard/TreasurerDashboard'; 
import MemberDashboard from './Dashboard/MemberDashboard';
import MeetingManagerDashboard from './Dashboard/MeetingManagerDashboard';

import ScheduleMeeting from './Dashboard/ScheduleMeeting';
import GroupManagement from './Dashboard/GroupManagement';
import PostAgendas from './Dashboard/PostAgendas'; 
import { RecordMinutes } from './Dashboard/RecordMinutes';

function App() {
  const handleLogout = () => { 
    sessionStorage.clear();
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
          
          <Route path="/meeting-manager/:groupId" element={<MeetingManagerDashboard />} />
          <Route path="/schedule/:groupId" element={<ScheduleMeeting />} />
          <Route path="/manage-group/:groupId" element={<GroupManagement />} />
          <Route path="/post-agenda/:groupId" element={<PostAgendas />} />

          {/* Profile Route */}
          <Route 
            path="/profile" 
            element={<Profile user={user} onLogout={handleLogout} />} 
          />

          {/* DASHBOARD ROUTE FIXED HERE */}
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
