import React, { useState } from 'react';
import AcademicOverview from './AcademicOverview';
import DuplicateHandler from './DuplicateHandler';
import Navbar from './Navbar';
import './App.css';
import Newsubject from './Newsubject';
import SubjectManager from './SubjectManager';

function App() {
  // 1. Centralized state to track the active view
  const [activeView, setActiveView] = useState('Dashboard');

  return (
    <div className="app-container">
      {/* 2. Pass the state and the setter to the Navbar */}
      <Navbar activeTab={activeView} setActiveTab={setActiveView} />

      <main className="content-area">
        {/* 3. Conditional Rendering based on the active tab */}
        {activeView === 'Dashboard' && <AcademicOverview />}
        {activeView === 'Upload Requests' && <DuplicateHandler />}
        
        {/* Placeholder for future sections */}
        {activeView === 'Subject Management' && <SubjectManager />}
        {activeView === 'Contribute' && <div className="placeholder">Contribute Page Coming Soon...</div>}
      </main>
    </div>
  );
}

export default App;