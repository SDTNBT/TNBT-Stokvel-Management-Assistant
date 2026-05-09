import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars, FaBell, FaUserCircle, FaCaretDown, 
  FaUserAlt, FaCog, FaSignOutAlt,
  FaHome, FaUsers, FaMoneyBillWave, FaCalendarAlt, FaChartLine 
} from 'react-icons/fa';
import './Navbar.css';

function Navbar({ user = {}, onLogout = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    // Navigate to settings page if it exists
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/home" },
    { name: "My Groups", icon: <FaUsers />, path: "/my-groups" },
    { name: "Payout Pipeline", icon: <FaMoneyBillWave />, path: "/payout-pipeline" },
    { name: "Meeting Manager", icon: <FaCalendarAlt />, path: "/meeting-manager" },
    { name: "Financial Reports", icon: <FaChartLine />, path: "/financial-reports" }
  ];

  const dropdownItems = [
    { name: "Profile", icon: <FaUserAlt />, action: handleProfileClick },
    { name: "Settings", icon: <FaCog />, action: handleSettingsClick },
    { name: "Logout", icon: <FaSignOutAlt />, action: handleLogoutClick }
  ];

  return (
    <>
      <header className="header">
        <button className="hamburger-button" onClick={toggleMenu} aria-label="Open Menu">
          <FaBars />
        </button>

        <section className="header-right">
          <button className="icon-btn" aria-label="Notifications">
            <FaBell className="bell-gold" />
          </button>
          
          <nav className="profile-wrapper">
            <button className="profile-trigger" onClick={toggleDropdown} aria-haspopup="menu">
              <figure className="avatar-circle">
                <FaUserCircle className="avatar-icon" />
              </figure>
              <strong className="username">{user?.role || 'User'}</strong>
              <FaCaretDown className={`caret ${isDropdownOpen ? 'rotate' : ''}`} />
            </button>

            {isDropdownOpen && (
              <menu className="profile-dropdown">
                {dropdownItems.map((item, index) => (
                  <li key={index} className="dropdown-item">
                    <button onClick={item.action}>
                      <i className="dropdown-icon">{item.icon}</i>
                      {item.name}
                    </button>
                  </li>
                ))}
              </menu>
            )}
          </nav>
        </section>
      </header>

      <aside className={`side-nav ${isOpen ? 'open' : ''}`}>
        <nav>
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a href={item.path} onClick={(e) => {
                  e.preventDefault();
                  toggleMenu();
                  navigate(item.path);
                }}>
                  <i className="nav-icon">{item.icon}</i>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay */}
      {(isOpen || isDropdownOpen) && (
        <section 
          className="overlay" 
          onClick={() => {setIsOpen(false); setIsDropdownOpen(false);}}
          aria-hidden="true"
        ></section>
      )}
    </>
  );
}

export default Navbar;
