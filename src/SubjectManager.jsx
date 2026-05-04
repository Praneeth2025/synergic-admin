import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubjectManager.css';

const SubjectManager = () => {
  // Metadata state
  const [courseMetadata, setCourseMetadata] = useState(null);
  
  // Selection states
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch metadata from the previous server on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get("https://synergic-backend.onrender.com/course-metadata");
        setCourseMetadata(res.data);
        
        // Set initial defaults based on metadata
        const firstCourse = Object.keys(res.data)[0];
        setSelectedCourse(firstCourse);
        setSelectedBranch(res.data[firstCourse].branches[0]);
        setSelectedSemester(res.data[firstCourse].semesters[0]);
      } catch (err) {
        console.error("Error fetching course metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  // 2. Fetch subjects when Course, Branch, or Semester changes
  const fetchSubjects = async () => {
    if (!selectedCourse || !selectedBranch || !selectedSemester) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`https://admin-backend-c1q6.onrender.com/subjects/${selectedCourse}/${selectedBranch}/${selectedSemester}`);
      // Ensure we set an array even if data is null/empty
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching subjects", err);
      setSubjects([]);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchSubjects(); 
  }, [selectedCourse, selectedBranch, selectedSemester]);

  // Handle Course Change (Resets branch/semester to first available in new course)
  const handleCourseChange = (courseKey) => {
    setSelectedCourse(courseKey);
    const firstBranch = courseMetadata[courseKey].branches[0];
    const firstSem = courseMetadata[courseKey].semesters[0];
    setSelectedBranch(firstBranch);
    setSelectedSemester(firstSem);
  };

  // Subject Modification Handlers
  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", code: "", materials_available: 0, options: [] }]);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleOptionChange = (subIdx, optIdx, field, value) => {
    const updated = [...subjects];
    updated[subIdx].options[optIdx][field] = value;
    setSubjects(updated);
  };

  const addOption = (subIdx) => {
    const updated = [...subjects];
    if (!updated[subIdx].options) updated[subIdx].options = [];
    updated[subIdx].options.push({ name: "", code: "" });
    setSubjects(updated);
  };

  const removeOption = (subIdx, optIdx) => {
    const updated = [...subjects];
    updated[subIdx].options = updated[subIdx].options.filter((_, i) => i !== optIdx);
    setSubjects(updated);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`https://admin-backend-c1q6.onrender.com/update-subjects/${selectedCourse}/${selectedBranch}/${selectedSemester}`, subjects);
      alert("Success: Curriculum updated!");
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="manager-container">
      <header className="manager-header">
        <h1>Curriculum Editor</h1>
        <div className="selectors">
          {/* Course Selector */}
          <select value={selectedCourse} onChange={(e) => handleCourseChange(e.target.value)}>
            {courseMetadata && Object.keys(courseMetadata).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Branch Selector */}
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
            {courseMetadata && selectedCourse && courseMetadata[selectedCourse].branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Semester Selector */}
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
            {courseMetadata && selectedCourse && courseMetadata[selectedCourse].semesters.map(s => (
              <option key={s} value={s}>{s.replace(/[-_]/g, ' ')}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="subject-list">
        {loading ? <div className="loading-spinner">Loading Subjects...</div> : subjects.map((sub, idx) => (
          <div key={idx} className="subject-card">
            <div className="subject-inputs">
              <input 
                placeholder="Subject Name" 
                value={sub.name} 
                onChange={(e) => handleSubjectChange(idx, "name", e.target.value)} 
              />
              <input 
                placeholder="Code" 
                value={sub.code} 
                className="code-input"
                onChange={(e) => handleSubjectChange(idx, "code", e.target.value)} 
              />
              <button className="btn-delete" onClick={() => removeSubject(idx)}>×</button>
            </div>

            <div className="options-container">
              {sub.options?.map((opt, optIdx) => (
                <div key={optIdx} className="option-row">
                  <span className="bullet">↳</span>
                  <input 
                    placeholder="Option Name" 
                    value={opt.name} 
                    onChange={(e) => handleOptionChange(idx, optIdx, "name", e.target.value)} 
                  />
                  <input 
                    placeholder="Code" 
                    value={opt.code} 
                    onChange={(e) => handleOptionChange(idx, optIdx, "code", e.target.value)} 
                  />
                  <button className="btn-opt-delete" onClick={() => removeOption(idx, optIdx)}>×</button>
                </div>
              ))}
              <button className="btn-add-opt" onClick={() => addOption(idx)}>+ Add Option (Elective)</button>
            </div>
          </div>
        ))}
      </div>

      <footer className="manager-footer">
        <button className="btn-secondary" onClick={addSubject}>+ Add Main Subject</button>
        <button className="btn-primary" onClick={handleUpdate}>Save Curriculum</button>
      </footer>
    </div>
  );
};

export default SubjectManager;