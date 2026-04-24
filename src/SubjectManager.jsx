import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubjectManager.css';

const SubjectManager = () => {
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState("chemistry-Semester");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const branches = [
    { id: "cse", label: "CSE", value: "CSE" },
    { id: "ece", label: "ECE", value: "ECE" },
    { id: "ee", label: "EE", value: "EE" },
    { id: "mech", label: "Mechanical", value: "Mechanical" },
    { id: "civil", label: "Civil", value: "Civil" },
    { id: "met", label: "Metallurgy", value: "Metallurgy" },
    { id: "ep", label: "Engineering Physics", value: "Engineering Physics" },
  ];

  const semesters = [
    { id: "s1", label: "Chemistry Sem", value: "chemistry-Semester" },
    { id: "s2", label: "Physics Sem", value: "Physics-Semester" },
    { id: "s3", label: "Semester 3", value: "Semester_3" },
    { id: "s4", label: "Semester 4", value: "Semester_4" },
    { id: "s5", label: "Semester 5", value: "Semester_5" },
    { id: "s6", label: "Semester 6", value: "Semester_6" },
    { id: "s7", label: "Semester 7", value: "Semester_7" },
    { id: "s8", label: "Semester 8", value: "Semester_8" },
  ];

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://admin-backend-c1q6.onrender.com/subjects/BTech/${selectedBranch}/${selectedSemester}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects", err);
      setSubjects([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubjects(); }, [selectedBranch, selectedSemester]);

  // Handlers for Main Subjects
  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", code: "", materials_available: 0 }]);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  // Handlers for Nested Options (Electives)
  const handleOptionChange = (subIdx, optIdx, field, value) => {
    const updated = [...subjects];
    updated[subIdx].options[optIdx][field] = value;
    setSubjects(updated);
  };

  const addOption = (subIdx) => {
    const updated = [...subjects];
    if (!updated[subIdx].options) updated[subIdx].options = [];
    updated[subIdx].isNested = true;
    updated[subIdx].options.push({ name: "", code: "" });
    setSubjects(updated);
  };

  const removeOption = (subIdx, optIdx) => {
    const updated = [...subjects];
    updated[subIdx].options = updated[subIdx].options.filter((_, i) => i !== optIdx);
    if (updated[subIdx].options.length === 0) updated[subIdx].isNested = false;
    setSubjects(updated);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`https://admin-backend-c1q6.onrender.com/update-subjects/BTech/${selectedBranch}/${selectedSemester}`, subjects);
      alert("Success: Curriculum and Master List updated!");
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="manager-container">
      <header className="manager-header">
        <h1>Curriculum Editor</h1>
        <div className="selectors">
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
            {branches.map(b => <option key={b.id} value={b.value}>{b.label}</option>)}
          </select>
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
            {semesters.map(s => <option key={s.id} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </header>

      <div className="subject-list">
        {loading ? <p>Loading...</p> : subjects.map((sub, idx) => (
          <div key={idx} className="subject-card">
            <div className="subject-inputs">
              <input 
                placeholder="Subject Name" 
                value={sub.name} 
                onChange={(e) => handleSubjectChange(idx, "name", e.target.value)} 
              />
              <input 
                placeholder="Code (Leave empty for Electives)" 
                value={sub.code} 
                className="code-input"
                onChange={(e) => handleSubjectChange(idx, "code", e.target.value)} 
              />
              <button className="btn-delete" onClick={() => removeSubject(idx)}>×</button>
            </div>

            {/* Nested Options Section */}
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
              <button className="btn-add-opt" onClick={() => addOption(idx)}>+ Add Option</button>
            </div>
          </div>
        ))}
      </div>

      <footer className="manager-footer">
        <button className="btn-secondary" onClick={addSubject}>+ Add Main Subject</button>
        <button className="btn-primary" onClick={handleUpdate}>Save Changes</button>
      </footer>
    </div>
  );
};

export default SubjectManager;