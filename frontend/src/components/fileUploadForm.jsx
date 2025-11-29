// src/components/FileUploadForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/files/upload'; 

const FileUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ownerId, setOwnerId] = useState('652c79f9a4b8d7c8e9f0a1b2'); 
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Đang tải tệp lên...');

    if (!selectedFile || !ownerId) {
      setMessage('❌ Vui lòng chọn tệp tin và điền Owner ID.');
      return;
    }

    const formData = new FormData();
    // Tên trường 'file' phải khớp với Multer (upload.single('file'))
    formData.append('file', selectedFile); 
    formData.append('ownerId', ownerId); 

    try {
      const response = await axios.post(API_URL, formData, {
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setMessage(`Đang tải lên: ${percentCompleted}%`);
        }
      });
      
      setMessage(`✅ Tải lên thành công! File ID mới: ${response.data.file._id}`);
      setSelectedFile(null); 
      // navigate('/'); // Quay về trang danh sách sau khi thành công

    } catch (error) {
      const errorMsg = error.response 
        ? (error.response.data.message || error.message) 
        : 'Lỗi kết nối Server.';
      setMessage(`❌ ERROR: ${errorMsg}`);
      console.error('Lỗi chi tiết:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '5px' }}>
      <h2>☁️ Tải Tệp Lên Server</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Owner ID */}
        <div>
          <label htmlFor="ownerId">Owner ID (Test):</label>
          <input 
            type="text" 
            id="ownerId"
            value={ownerId} 
            onChange={(e) => setOwnerId(e.target.value)} 
            required 
            style={{ marginLeft: '10px' }}
          />
        </div>

        {/* Chọn tệp tin */}
        <div style={{ margin: '15px 0' }}>
          <label htmlFor="fileInput">Chọn File:</label>
          <input 
            type="file" 
            id="fileInput"
            onChange={handleFileChange} 
            style={{ marginLeft: '10px' }}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!selectedFile} // Chỉ kích hoạt khi có file
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Tải Lên (POST /upload)
        </button>
      </form>

      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Trạng thái: {message}</p>
    </div>
  );
};

export default FileUploadForm;