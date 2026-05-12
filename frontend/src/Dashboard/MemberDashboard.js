import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarDays,
  Mic2,
  ChevronDown,
  UserCircle,
  LogOut,
  Bell,
  FileText,
  Home
} from 'lucide-react';

import React, { useState } from 'react';
import './MemberDashboard.css';

import SavingsProjection from './SavingsProjection';
import Profile from '../components/Profile';
import PaymentPreview from './PaymentPreview';
import PaymentGateway from './PaymentGateway';
import PaymentSuccess from './PaymentSuccess';
import PaymentHistory from '../components/PaymentHistory';

const MemberDashboard = ({ onLogout = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const groupName = location.state?.groupName || "Stokvel Group";
  const amount = location.state?.contributionAmount || "0";
  const sessionUser =
    location.state?.user || JSON.parse(sessionStorage.getItem('user'));

  const [isMeetingsOpen, setIsMeetingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [paymentStage, setPaymentStage] = useState('preview');
  const [transactionId, setTransactionId] = useState('');

  const handleProfileClick = () => setShowProfile(true);
  const handleBackToDashboard = () => setShowProfile(false);

  const handleConfirmPayment = () => {
    setPaymentStage('gateway');
  };

  const handlePaymentSuccess = (id) => {
    setTransactionId(id);
    setPaymentStage('success');
  };

  const handleCancelPayment = () => {
    setPaymentStage('preview');
    setActiveTab('dashboard');
  };

  if (showProfile) {
    return (
      <section className="dashboard-shell">
        <aside className="sidebar">
          <header className="sidebar-brand">
            <figure className="brand-identity">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="16" fill="#F5C842" />
                <path
                  d="M10 20 L16 10 L22 20"
                  stroke="#1A3A6B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="22" r="2" fill="#1A3A6B" />
              </svg>

              <figcaption className="brand-text">
                StokvelStokkie
              </figcaption>
            </figure>
          </header>

          <hr className="sidebar-divider" />

          <button
            type="button"
            className="back-to-dashboard"
            onClick={handleBackToDashboard}
          >
            ← Back to Dashboard
          </button>
        </aside>

        <main className="main-content">
          <Profile user={sessionUser} onLogout={onLogout} />
        </main>
      </section>
    );
  }

  return (
    <article className="dashboard-shell">
      <aside className="sidebar">
        <header className="sidebar-brand">
          <figure className="brand-identity">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="16" fill="#F5C842" />
              <path
                d="M10 20 L16 10 L22 20"
                stroke="#1A3A6B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="22" r="2" fill="#1A3A6B" />
            </svg>

            <figcaption className="brand-text">
              StokvelStokkie
            </figcaption>
          </figure>
        </header>

        <hr className="sidebar-divider" />

        <nav className="sidebar-nav" aria-label="Main Navigation">
          <ul className="nav-list">

            <li>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={20} />
                <small>Dashboard</small>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="nav-item"
              >
                <Home size={20} />
                <small>Home</small>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => navigate('/my-groups')}
                className="nav-item"
              >
                <Users size={20} />
                <small>My Groups</small>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveTab('contributions')}
                className={`nav-item ${activeTab === 'contributions' ? 'active' : ''}`}
              >
                <FileText size={20} />
                <small>View My Contributions</small>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('payment');
                  setPaymentStage('preview');
                }}
                className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`}
              >
                <CreditCard size={20} />
                <small>Payment</small>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setIsMeetingsOpen(!isMeetingsOpen)}
                className="nav-item dropdown-trigger"
                aria-expanded={isMeetingsOpen}
              >
                <CalendarDays size={20} />
                <small>My Reports</small>

                <ChevronDown
                  size={16}
                  className={`chevron-icon ${isMeetingsOpen ? 'rotate' : ''}`}
                />
              </button>

              {isMeetingsOpen && (
                <ul className="submenu">

                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveTab('projected-savings-growth')}
                      className={`submenu-btn ${
                        activeTab === 'projected-savings-growth'
                          ? 'active-sub'
                          : ''
                      }`}
                    >
                      <CalendarDays size={16} />
                      <small>Projected Savings Growth</small>
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveTab('financial-health-scoring')}
                      className={`submenu-btn ${
                        activeTab === 'financial-health-scoring'
                          ? 'active-sub'
                          : ''
                      }`}
                    >
                      <FileText size={16} />
                      <small>Financial Health Scoring</small>
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveTab('payout-history')}
                      className={`submenu-btn ${
                        activeTab === 'payout-history'
                          ? 'active-sub'
                          : ''
                      }`}
                    >
                      <Mic2 size={16} />
                      <small>Payout History</small>
                    </button>
                  </li>

                </ul>
              )}
            </li>

          </ul>
        </nav>

        <footer className="sidebar-footer">
          <hr className="sidebar-divider" />

          <nav aria-label="User Actions">
            <ul className="footer-list">

              <li>
                <button type="button" className="footer-item">
                  <Bell size={20} />
                  <small>Notifications</small>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="footer-item"
                  onClick={handleProfileClick}
                >
                  <UserCircle size={20} />
                  <small>Profile</small>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className="footer-item logout-btn"
                  onClick={onLogout}
                >
                  <LogOut size={20} />
                  <small>Logout</small>
                </button>
              </li>

            </ul>
          </nav>
        </footer>
      </aside>

      <main className="main-content">

        <header className="content-header">
          <h1 className="dashboard-title">
            {activeTab === 'contributions'
              ? 'My Contribution History'
              : activeTab.replace(/-/g, ' ')}
          </h1>
        </header>

        <section className="content-body">

          {activeTab === 'dashboard' && (
            <>
              <section className="welcome-hero">
                <h2>
                  Welcome back,{' '}
                  {sessionUser?.name ||
                    sessionUser?.firstName ||
                    'Member'}
                </h2>

                <p>
                  You are viewing details for the{' '}
                  <strong>{groupName}</strong> group.
                </p>

                <p>
                  Monitor your stokvel activity, financial growth,
                  meetings, and contributions from one place.
                </p>
              </section>

              <SavingsProjection />
            </>
          )}

          {activeTab === 'contributions' && (
            <PaymentHistory
              user={sessionUser}
              groupName={groupName}
              groupId={location.state?.groupId}
            />
          )}

          {activeTab === 'payment' && (
            <>
              {paymentStage === 'preview' && (
                <PaymentPreview
                  groupName={groupName}
                  amount={amount}
                  onConfirm={handleConfirmPayment}
                  onCancel={handleCancelPayment}
                />
              )}

              {paymentStage === 'gateway' && (
                <PaymentGateway
                  groupName={groupName}
                  amount={amount}
                  userId={sessionUser?._id || sessionUser?.id}
                  userEmail={sessionUser?.email}
                  onBack={() => setPaymentStage('preview')}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {paymentStage === 'success' && (
                <PaymentSuccess
                  transactionId={transactionId}
                  onDone={() => {
                    setPaymentStage('preview');
                    setActiveTab('dashboard');
                    setTransactionId('');
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'projected-savings-growth' && (
            <SavingsProjection />
          )}

          {activeTab === 'financial-health-scoring' && (
            <div className="feature-placeholder">
              <h2>Financial Health Scoring</h2>
              <p>
                Financial health scoring feature coming soon.
              </p>
            </div>
          )}

          {activeTab === 'payout-history' && (
            <div className="feature-placeholder">
              <h2>Payout History</h2>
              <p>Payout history feature coming soon.</p>
            </div>
          )}

          {activeTab === 'schedule-meeting' && (
            <div className="feature-placeholder">
              <h2>Schedule Meeting</h2>
              <p>Meeting scheduling feature coming soon.</p>
            </div>
          )}

          {activeTab === 'post-agenda' && (
            <div className="feature-placeholder">
              <h2>Post Agenda</h2>
              <p>Agenda management feature coming soon.</p>
            </div>
          )}

          {activeTab === 'record-minutes' && (
            <div className="feature-placeholder">
              <h2>Record Minutes</h2>
              <p>Minutes recording feature coming soon.</p>
            </div>
          )}

        </section>
      </main>
    </article>
  );
};

export default MemberDashboard;