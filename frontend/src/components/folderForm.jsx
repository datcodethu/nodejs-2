// src/components/FolderForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000/api/folders'; 

const FolderForm = () => {
    const [name, setName] = useState('');
    // 💡 SỬ DỤNG ID GIẢ ĐỊNH CHO OWNER VÀ WORKSPACE ĐỂ TEST
    const [ownerId] = useState('68fcca6cf8eb17ab26fb6b1f'); // Owner ID giả định (Dựa trên ID bạn dùng trong Backend)
    const [workspaceId, setWorkspaceId] = useState('65c9281e289f81f440e0c0d0'); // Workspace ID giả định
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Đang tạo thư mục...');
        
        // 💡 Kiểm tra tối thiểu
        if (!name || !workspaceId) {
             setMessage('❌ Vui lòng điền tên thư mục và Workspace ID.');
             return;
        }

        try {
            const response = await axios.post(API_URL, { 
                name, 
                ownerId, // Gửi Owner ID giả định
                workspaceId // 👈 Gửi Workspace ID để Backend tìm kiếm
            }); 
            
            setMessage(`✅ Tạo Folder thành công! ID: ${response.data._id}`);
            setName('');
            // navigate('/'); // Chuyển hướng về danh sách

        } catch (error) {
            // Hiển thị message chi tiết từ Backend (ví dụ: "Không tìm thấy workspace")
            const errorMsg = error.response ? error.response.data.message : 'Lỗi kết nối Server.';
            setMessage(`❌ ERROR: ${errorMsg}`);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', maxWidth: '400px' }}>
            <h2>Tạo Thư mục mới</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Tên thư mục:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                {/* 💡 TRƯỜNG NHẬP WORKSPACE ID */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Workspace ID:</label>
                    <input 
                        type="text" 
                        value={workspaceId} 
                        onChange={(e) => setWorkspaceId(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Tạo Folder
                </button>
            </form>
            <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>
        </div>
    );
};

export default FolderForm;