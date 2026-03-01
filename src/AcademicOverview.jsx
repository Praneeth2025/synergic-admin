import React, { useState, useEffect } from 'react';
import './AcademicOverview.css';

const AcademicOverview = () => {
  const [data, setData] = useState(null);
  const [uploadedPapers, setUploadedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProg, setActiveProg] = useState("");
  const [activeBranch, setActiveBranch] = useState("");

  const academicYears = ["2022-2023", "2023-2024", "2024-2025", "2025-2026"];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [structureRes, papersRes] = await Promise.all([
          fetch("https://admin-backend-c1q6.onrender.com/subject-structure"),
          fetch("https://admin-backend-c1q6.onrender.com/allpapers")
        ]);

        const structureJson = await structureRes.json();
        const papersJson = await papersRes.json();

        setData(structureJson);
        setUploadedPapers(papersJson);

        // Auto-select first available program (BTech/MTech)
        const firstProg = Object.keys(structureJson).find(k => k !== "_id");
        if (firstProg) {
          setActiveProg(firstProg);
          const firstBranch = Object.keys(structureJson[firstProg])[0];
          setActiveBranch(firstBranch);
        }
      } catch (err) {
        console.error("Data loading failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- SAFE MATCHING LOGIC ---
  const isPaperUploaded = (subjectName, year, type) => {
    if (!uploadedPapers || !Array.isArray(uploadedPapers)) return false;

    return uploadedPapers.some(paper => {
      // Use optional chaining and fallbacks to prevent .toLowerCase() errors
      const cleanSubject = (subjectName || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanPaperSub = (paper?.subject || "").toLowerCase().replace(/[^a-z0-9]/g, '');

      const cleanType = (type || "").toLowerCase();
      const paperType = (paper?.type || "").toLowerCase();

      // Match if subject is contained, year is exact, and type matches (mid/end)
      const isSubMatch = cleanPaperSub.includes(cleanSubject) && cleanSubject !== "";
      const isYearMatch = paper?.yearOfStudy === year;
      const isTypeMatch = paperType.includes(cleanType);

      return isSubMatch && isYearMatch && isTypeMatch;
    });
  };

  if (loading) return <div className="loading-screen">Syncing Archive...</div>;
  if (!data) return <div className="error-screen">Server connection failed.</div>;

  const programs = Object.keys(data).filter(key => key !== "_id");
  const branches = Object.keys(data[activeProg] || {});
  const branchData = data[activeProg]?.[activeBranch] || {};

  return (
    <div className="notion-layout">
      <header className="ao-header">
        <div className="ao-title-section">
          <h1>Academic Audit</h1>
          <p>Overview of verified MongoDB uploads</p>
        </div>

        <div className="ao-controls">
          <div className="ao-tabs">
            {programs.map(prog => (
              <button
                key={prog}
                className={`ao-tab-btn ${activeProg === prog ? 'active' : ''}`}
                onClick={() => {
                  setActiveProg(prog);
                  setActiveBranch(Object.keys(data[prog])[0]);
                }}
              >
                {prog}
              </button>
            ))}
          </div>

          <div className="ao-pills">
            {branches.map(br => (
              <button
                key={br}
                className={`ao-pill ${activeBranch === br ? 'selected' : ''}`}
                onClick={() => setActiveBranch(br)}
              >
                {br}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="ao-grid-wrapper">
        <table className="ao-grid">
          <thead>
            <tr>
              <th rowSpan="2" className="sticky-col main-header">Subject / Semester</th>
              {academicYears.map(year => (
                <th key={year} colSpan="2" className="year-header">{year}</th>
              ))}
            </tr>
            <tr>
              {academicYears.map(year => (
                <React.Fragment key={`${year}-types`}>
                  <th className="sub-header">MID</th>
                  <th className="sub-header">END</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(branchData).map(([semName, subjects]) => (
              <React.Fragment key={semName}>
                <tr className="semester-divider">
                  <td colSpan={academicYears.length * 2 + 1}>
                    {semName.replace(/_/g, ' ')}
                  </td>
                </tr>
                {subjects?.map((sub, i) => (
                  <tr key={(sub.code || 's') + i}>
                    <td className="subject-cell sticky-col">
                      <div className="sub-name">{sub.name}</div>
                      <div className="sub-code">{sub.code}</div>
                    </td>
                    {academicYears.map(year => {
                      const mid = isPaperUploaded(sub.name, year, "mid");
                      const end = isPaperUploaded(sub.name, year, "end");
                      return (
                        <React.Fragment key={`${sub.code}-${year}`}>
                          <td className="status-cell">
                            <div className={`indicator ${mid ? 'verified' : 'empty'}`}>
                              {mid && "✔"}
                            </div>
                          </td>
                          <td className="status-cell">
                            <div className={`indicator ${end ? 'verified' : 'empty'}`}>
                              {end && "✔"}
                            </div>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicOverview;