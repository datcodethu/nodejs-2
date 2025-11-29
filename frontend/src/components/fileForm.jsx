// src/components/FileForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const FileForm = () => {
    const [name, setName] = useState('');
    const [size, setSize] = useState('');
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID nếu có (chế độ Edit)
    const API_URL = 'http://localhost:5000/api/files';
    const isEditMode = !!id; // Kiểm tra xem có ID hay không

    // Lấy dữ liệu nếu đang ở chế độ chỉnh sửa (UPDATE)
useEffect(() => {
        if (isEditMode && id) { // 👈 CHỈ GỌI KHI ID VÀ isEditMode ĐỀU CÓ
            const fetchFile = async () => {
                try {
                    const response = await axios.get(`${API_URL}/${id}`);
                    // 🚨 Đảm bảo các thuộc tính (name, size) tồn tại trong response.data
                    setName(response.data.name || ''); 
                    setSize(response.data.size || '');
                } catch (error) {
                    console.error("Lỗi khi lấy chi tiết file:", error);
                    // 💡 Xử lý lỗi: Nếu không tìm thấy, có thể chuyển hướng về trang danh sách
                    if (error.response && error.response.status === 404) {
                         alert("File không tồn tại!");
                         navigate('/');
                    }
                }
            };
            fetchFile();
        } else if (isEditMode && !id) {
            // Trường hợp user gõ /edit/ nhưng không có ID
            navigate('/');
        }
    }, [id, isEditMode, navigate]); // Thêm navigate vào dependency

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fileData = { name, size: Number(size) };

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/${id}`, fileData); // PUT /api/files/:id
            } else {
                await axios.post(API_URL, fileData); // POST /api/files
            }
            navigate('/'); // Quay về trang danh sách
        } catch (error) {
            console.error(`Lỗi khi ${isEditMode ? 'cập nhật' : 'thêm mới'}:`, error);
        }
    };

    return (
        <div>
            <h2>{isEditMode ? 'Chỉnh sửa' : 'Thêm mới'} File</h2>
            <form onSubmit={handleSubmit}>
                {/* Các input tương tự như TestAddFileForm, nhưng đặt trong FileForm */}
                <div>
                    <label>Tên File (Name):</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Kích thước (Size - byte):</label>
                    <input type="number" value={size} onChange={(e) => setSize(e.target.value)} />
                </div>
                <button type="submit" style={{ marginTop: '20px' }}>
                    {isEditMode ? 'Cập nhật (PUT)' : 'Thêm mới (POST)'}
                </button>
            </form>
            <Link to="/">Quay về Danh sách</Link>
        </div>
    );
};

export default FileForm;