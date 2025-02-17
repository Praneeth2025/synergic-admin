import React, { useEffect, useState } from "react";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [editedFiles, setEditedFiles] = useState({});

  useEffect(() => {
    fetch("http://localhost:5003/files")
      .then((response) => response.json())
      .then((data) => {
        setFiles(data);
        // Initialize editable fields
        const initialEdits = {};
        data.forEach((file) => {
          initialEdits[file._id] = {
            filename: file.filename,
            subject: file.subject,
            yearOfStudy: file.yearOfStudy,
          };
        });
        setEditedFiles(initialEdits);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleEditChange = (id, field, value) => {
    setEditedFiles((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleAdd = (file) => {
    const updatedFile = { ...file, ...editedFiles[file._id] };
    fetch("http://localhost:5003/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFile),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Added successfully", data);
        setFiles(files.filter((f) => f._id !== file._id));
      })
      .catch((error) => console.error("Error adding data:", error));
  };

  const handleRemove = (_id) => {
    fetch(`http://localhost:5003/remove/${_id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Removed successfully", data);
        setFiles(files.filter((file) => file._id !== _id));
      })
      .catch((error) => console.error("Error removing data:", error));
  };

  return (
    <div>
      <h1 className="header">Uploaded Files</h1>
      <ul>
        {files.map((file) => (
          <li key={file._id} className="liner">
            <a href={file.driveLink} target="_blank" rel="noopener noreferrer">
              {file.filename}
            </a>
            <div>
              <label>Filename:</label>
              <input
                type="text"
                value={editedFiles[file._id]?.filename || ""}
                onChange={(e) => handleEditChange(file._id, "filename", e.target.value)}
              />
            </div>
            <div>
              <label>Folder (Subject):</label>
              <input
                type="text"
                value={editedFiles[file._id]?.subject || ""}
                onChange={(e) => handleEditChange(file._id, "subject", e.target.value)}
              />
            </div>
            <div>
              <label>Subfolder (Year of Study):</label>
              <input
                type="text"
                value={editedFiles[file._id]?.yearOfStudy || ""}
                onChange={(e) => handleEditChange(file._id, "yearOfStudy", e.target.value)}
              />
            </div>
            <button className="btn_1" onClick={() => handleAdd(file)}>+ Add</button>
            <button className="btn_2" onClick={() => handleRemove(file._id)}>- Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
