import React, { useEffect, useState } from "react";
import "./FileList.css";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [editedFiles, setEditedFiles] = useState({});

  useEffect(() => {
    fetch("https://admin-backend-c1q6.onrender.com/files")
      .then((response) => response.json())
      .then((data) => {
        setFiles(data);
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
    fetch("https://admin-backend-c1q6.onrender.com/add", {
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
    fetch(`https://admin-backend-c1q6.onrender.com/remove/${_id}`, {
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
      <table className="container">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Subject</th>
            <th>Year of Study</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file._id}>
              <td>
                <a href={file.driveLink} target="_blank" rel="noopener noreferrer">
                  {file.filename}
                </a>
                <input
                  type="text"
                  value={editedFiles[file._id]?.filename || ""}
                  onChange={(e) => handleEditChange(file._id, "filename", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={editedFiles[file._id]?.subject || ""}
                  onChange={(e) => handleEditChange(file._id, "subject", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={editedFiles[file._id]?.yearOfStudy || ""}
                  onChange={(e) => handleEditChange(file._id, "yearOfStudy", e.target.value)}
                />
              </td>
              <td>
                <button className="btn_1" onClick={() => handleAdd(file)}>+ Add</button>
                <button className="btn_2" onClick={() => handleRemove(file._id)}>- Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
