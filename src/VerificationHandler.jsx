import React, { useState, useEffect } from 'react';
import './VerificationHandler.css';

const VerificationHandler = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch unverified papers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://admin-backend-c1q6.onrender.com/unverified-papers");
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Action: Accept (Verify)
  const handleAccept = async (id) => {
    try {
      const response = await fetch(`https://admin-backend-c1q6.onrender.com/verify-paper/${id}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        // Remove from local list once verified
        setFiles((prev) => prev.filter((f) => f._id !== id));
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  // 3. Action: Deny (For now, let's assume deny removes it or flags it)
  const handleDeny = async (id) => {
    if (window.confirm("Are you sure you want to deny and remove this submission?")) {
      try {
        const response = await fetch(`https://admin-backend-c1q6.onrender.com/remove-duplicate/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setFiles((prev) => prev.filter((f) => f._id !== id));
        }
      } catch (error) {
        console.error("Deny action failed:", error);
      }
    }
  };

  if (loading) return <div className="vh-container"><h2 className="page-title">Loading pending approvals...</h2></div>;

  return (
    <div className="vh-container">
      <div className="vh-header">
        <h1>Paper Verification Queue</h1>
        <p>Review and approve student submissions for the Academic Audit</p>
      </div>

      {files.length === 0 ? (
        <div className="vh-empty-state">
          <div className="vh-empty-icon">✅</div>
          <h2>All Caught Up</h2>
          <p>No papers are currently awaiting verification.</p>
        </div>
      ) : (
        <div className="vh-grid">
          {files.map((file) => (
            <div key={file._id} className="vh-card">
              <div className="vh-card-header">
                <span className="vh-group-title">
                  {file.subject.replace(/_/g, ' ')} • {file.yearOfStudy} • {file.type}
                </span>
                <span className="vh-contributor-tag">By {file.contributorName}</span>
              </div>
              
              <table className="vh-table">
                <thead>
                  <tr>
                    <th>File Reference</th>
                    <th>Uploaded Date</th>
                    <th className="action-col">Verification Decision</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <a href={file.driveLink} target="_blank" rel="noreferrer" className="vh-file-link">
                        {file.filename}
                      </a>
                    </td>
                    <td className="vh-date">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="action-col">
                      <div className="vh-button-group">
                        <button 
                          className="vh-btn-accept" 
                          onClick={() => handleAccept(file._id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="vh-btn-deny" 
                          onClick={() => handleDeny(file._id)}
                        >
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationHandler;