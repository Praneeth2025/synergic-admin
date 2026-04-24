import React, { useState, useEffect, useMemo } from 'react';
import './AcademicOverview.css';

const AcademicOverview = () => {
  const [data, setData] = useState(null);
  const [uploadedPapers, setUploadedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProg, setActiveProg] = useState("BTech"); // Default to BTech
  const [activeBranch, setActiveBranch] = useState("CSE");

  // Dynamic Year Logic
  const academicYears = useMemo(() => {
    const startYear = 2022;
    const now = new Date();
    const endYear = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
    const years = [];
    for (let y = startYear; y < endYear; y++) {
      years.push(`${y}-${y + 1}`);
    }
    return years;
  }, []);

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

        // Auto-detect first available program and branch
        const availableProgs = Object.keys(structureJson).filter(k => k !== "_id");
        if (availableProgs.length > 0) {
          const defaultProg = availableProgs.includes("BTech") ? "BTech" : availableProgs[0];
          setActiveProg(defaultProg);
          const firstBranch = Object.keys(structureJson[defaultProg])[0];
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

  const isPaperUploaded = (subjectName, year, type) => {
    if (!uploadedPapers || !Array.isArray(uploadedPapers)) return false;
    const cleanSubject = (subjectName || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return uploadedPapers.some(paper => {
      const cleanPaperSub = (paper?.subject || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanPaperSub.includes(cleanSubject) && 
             cleanSubject !== "" && 
             paper?.yearOfStudy === year && 
             (paper?.type || "").toLowerCase().includes(type.toLowerCase());
    });
  };

  if (loading) return <div className="loading-screen">Syncing Archive...</div>;
  if (!data || !data[activeProg]) return <div className="error-screen">No data found for {activeProg}.</div>;

  const programs = Object.keys(data).filter(key => key !== "_id");
  const branches = Object.keys(data[activeProg] || {});
  const branchData = data[activeProg][activeBranch] || {};

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
      
      {subjects?.map((sub, i) => {
        // Determine if this subject has sub-options (Electives)
        const hasOptions = sub.options && Array.isArray(sub.options) && sub.options.length > 0;

        return (
          <React.Fragment key={`${sub.name}-${i}`}>
            {/* 1. Main Subject Row */}
            <tr className={hasOptions ? "elective-parent-row" : ""}>
              <td className="subject-cell sticky-col">
                <div className="sub-name">{sub.name}</div>
                <div className="sub-code">{sub.code || "Elective Group"}</div>
              </td>
              
              {/* If it has options, we don't show checkmarks on the parent row itself */}
              {!hasOptions ? (
                academicYears.map(year => (
                  <React.Fragment key={year}>
                    <td className="status-cell">
                      <div className={`indicator ${isPaperUploaded(sub.name, year, "mid") ? 'verified' : 'empty'}`}>
                        {isPaperUploaded(sub.name, year, "mid") && "✔"}
                      </div>
                    </td>
                    <td className="status-cell">
                      <div className={`indicator ${isPaperUploaded(sub.name, year, "end") ? 'verified' : 'empty'}`}>
                        {isPaperUploaded(sub.name, year, "end") && "✔"}
                      </div>
                    </td>
                  </React.Fragment>
                ))
              ) : (
                <td colSpan={academicYears.length * 2} className="parent-spacer-cell"></td>
              )}
            </tr>

            {/* 2. Sub-Subject Rows (The Checklist for Options) */}
            {hasOptions && sub.options.map((opt, optIdx) => (
              <tr key={`${opt.code}-${optIdx}`} className="nested-option-row">
                <td className="subject-cell sticky-col nested-col">
                  <div className="nested-visual-wrapper">
                    <div className="dashed-line"></div>
                    <div className="nested-label-content">
                      <span className="branch-character">↳</span>
                      <div className="nested-text-group">
                        <div className="sub-name small">{opt.name}</div>
                        <div className="sub-code">{opt.code}</div>
                      </div>
                    </div>
                  </div>
                </td>
                {/* CHECKLIST FOR THE OPTION SUBJECT */}
                {academicYears.map(year => (
                  <React.Fragment key={year}>
                    <td className="status-cell">
                      <div className={`indicator ${isPaperUploaded(opt.name, year, "mid") ? 'verified' : 'empty'}`}>
                        {isPaperUploaded(opt.name, year, "mid") && "✔"}
                      </div>
                    </td>
                    <td className="status-cell">
                      <div className={`indicator ${isPaperUploaded(opt.name, year, "end") ? 'verified' : 'empty'}`}>
                        {isPaperUploaded(opt.name, year, "end") && "✔"}
                      </div>
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicOverview;