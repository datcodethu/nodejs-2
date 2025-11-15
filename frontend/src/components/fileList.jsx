// src/components/FileList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Dùng để chuyển trang
const API_URL = 'http://localhost:5000/api/files';

const FileList = () => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(API_URL); // GET /api/files
            setFiles(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
            try {
                await axios.delete(`${API_URL}/${id}`); // DELETE /api/files/:id
                // Cập nhật lại state sau khi xóa thành công
                setFiles(files.filter(file => file._id !== id)); 
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
            }
        }
    };

    return (
        <div>
            <h2>Chào mừng bạn đến với <strong>Cloud Storage System</strong></h2>
            
            <div className='Files'>
                {files.map(file => (
                    <div className='File' key={file._id} style={{ borderBottom: '1px dotted #ccc', padding: '10px 0' }}>
                        <strong>{file.name}</strong> 
                         <p>
    {file.uploadDate 
      ? new Date(file.uploadDate).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) 
      : 'Chưa có ngày tạo'}
  </p>
                       <div className="options">
                             <Link to={`/edit/${file._id}`} style={{ marginLeft: '15px' }}>Sửa (UPDATE)</Link>
                            <button onClick={() => handleDelete(file._id)} style={{ marginLeft: '10px' }}>
                                Xóa (DELETE)
                            </button>
                            <Link to={`/details/${file._id}`} style={{ marginLeft: '10px' }}>Chi tiết (READ)</Link>
                       </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileList;