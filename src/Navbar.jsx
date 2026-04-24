import React from 'react';
import './Navbar.css';
const Navbar = ({ activeTab, setActiveTab }) => {

  const navItems = [
    { name: 'Upload Requests', icon: 'https://img.icons8.com/?size=100&id=98618&format=png&color=000000' },
    { name: 'Dashboard', icon: 'https://img.icons8.com/?size=100&id=sUJRwjfnGwbJ&format=png&color=000000' },
    { name: 'Subject Management', icon: 'https://img.icons8.com/ios/50/ffffff/bookmark-ribbon--v1.png' },
    { name: 'Contribute', icon: 'https://img.icons8.com/ios/50/ffffff/paper-plane.png' },
  ];

  return (
    <nav className="synergic-navbar">
      <div className="nav-logo">
        <span className="logo-text">Synergic</span>
      </div>

      <div className="nav-pill-container">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
            onClick={() => setActiveTab(item.name)} // Updates the state in App.jsx
          >
            <img 
              src={item.icon} 
              alt={item.name} 
              className={`nav-icon ${activeTab === item.name ? 'icon-dark' : 'icon-light'}`}
            />
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <button className="action-btn theme-toggle">
          <img src="https://img.icons8.com/ios/50/C6EF4E/sun--v1.png" alt="Theme" />
        </button>
        <button className="action-btn profile-btn">
          <img 
            src="https://img.icons8.com/?size=100&id=zxB19VPoVLjK&format=png&color=C6EF4E" 
            alt="Profile Icon" 
            className="logo-icon"
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;