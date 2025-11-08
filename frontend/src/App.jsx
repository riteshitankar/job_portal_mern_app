import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(
        'http://localhost:5000/company/upload-file/logo',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // for user
            // 'Authorization': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJpdGVzaGl0YW5rYXI3NkBnbWFpbC5jb20iLCJpYXQiOjE3NjI1NzgwNzMsImV4cCI6MTc2MjU3ODk3M30.R5kqTf2oI019NFMnSAg9PVHWoN7WwMt0fVR7NAKJruo"
            // for company
            'Authorization': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJpdGVzaGl0YW5rYXI5OUBnbWFpbC5jb20iLCJpYXQiOjE3NjI1ODU0MjcsImV4cCI6MTc2MjY3MTgyN30.eshgbowwZ3PE3ey7IDfce5dFUK_azBAZGQ9PPpinR-A"
          }
        }
      );
      setMessage('File uploaded successfully!');
      console.log(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Error uploading file.');
    }
  };

  return (
    <div style={{ width: '400px', margin: '50px auto', textAlign: 'center' }}>
      <form onSubmit={handleSubmit}>
        <h2>Upload Resume</h2>
        <input type="file" name="file" onChange={handleFileChange} />
        <br /><br />
        <button type="submit">Upload</button>
      </form>

      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
    </div>
  );
};

export default App;