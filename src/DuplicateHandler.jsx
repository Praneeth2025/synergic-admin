import React, { useState, useEffect } from 'react';
// import { mockData } from './Data'; // No longer using static data
import './DuplicateHandler.css';
import noResultImg from './images/NotFound.png';

const DuplicateHandler = () => {
  // Initialize with empty array and add a loading state
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, fileId: null });

  // 1. Fetch data from the Render backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://admin-backend-c1q6.onrender.com/duplicates");
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getExamType = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes('midsem') || name.includes('mid sem')) return 'Midsem';
    if (name.includes('endsem') || name.includes('end sem')) return 'Endsem';
    return null;
  };

  const getDuplicateGroups = () => {
    const groups = {};
    files.forEach((file) => {
      const type = getExamType(file.filename);
      if (!type) return;

      const key = `${file.subject} | ${file.yearOfStudy} | ${type}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(file);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 1);
  };

  // 2. Updated delete to call the backend API
  const handleDelete = async () => {
    try {
      const response = await fetch(`https://admin-backend-c1q6.onrender.com/remove-duplicate/${modal.fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f._id !== modal.fileId));
        setModal({ show: false, fileId: null });
      } else {
        alert("Failed to delete the file from the server.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("An error occurred while deleting.");
    }
  };

  const duplicateGroups = getDuplicateGroups();

  // Show a simple message while the Render instance "wakes up"
  if (loading) {
    return (
      <div className="admin-container">
        <h2 className="page-title">Connecting to Server...</h2>
      </div>
    );
  }

  return (
    <div className="dh-container">
      <div className="dh-header">
        <h1>Duplicate Exam Recovery</h1>
        <p>Manage and remove redundant exam paper submissions</p>
      </div>

      {duplicateGroups.length === 0 ? (
        <div className="dh-empty-state">
          <div className="dh-empty-icon">🎉</div>
          <h2>Clean Slate</h2>
          <p>No duplicate papers found in the archives.</p>
        </div>
      ) : (
        <div className="dh-grid">
          {duplicateGroups.map(([groupName, items]) => (
            <div key={groupName} className="dh-card">
              <div className="dh-card-header">
                <span className="dh-group-title">{groupName.replace(/ \| /g, ' • ')}</span>
                <span className="dh-count-badge">{items.length} copies</span>
              </div>
              <table className="dh-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Uploaded</th>
                    <th>Contributor</th>
                    <th className="action-col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((file) => (
                    <tr key={file._id}>
                      <td>
                        <a href={file.driveLink} target="_blank" rel="noreferrer" className="dh-file-link">
                          {file.filename}
                        </a>
                      </td>
                      <td className="dh-date">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                      <td className="dh-user">{file.contributor || "—"}</td>
                      <td className="action-col">
                        <button
                          className="dh-delete-btn"
                          onClick={() => setModal({ show: true, fileId: file._id })}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {modal.show && (
        <div className="dh-modal-overlay">
          <div className="dh-modal">
            <div className="dh-modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div className="dh-modal-body">
              <p>Are you sure you want to permanently delete this file? This action cannot be undone.</p>
            </div>
            <div className="dh-modal-actions">
              <button className="dh-btn-cancel" onClick={() => setModal({ show: false, fileId: null })}>
                Cancel
              </button>
              <button className="dh-btn-confirm" onClick={handleDelete}>
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicateHandler;