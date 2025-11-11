// src/components/FileDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const FileDetail = () => {
    const [file, setFile] = useState(null);
    const { id } = useParams(); // Lấy ID từ URL
    const API_URL = 'http://localhost:5000/api/files';

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const response = await axios.get(`${API_URL}/${id}`); // GET /api/files/:id
                setFile(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết:", error);
            }
        };
        fetchFile();
    }, [id]);

    if (!file) {
        return <div>Đang tải hoặc không tìm thấy File...</div>;
    }

    return (
        <div>
            <h2>Chi tiết File: {file.name}</h2>
            <p><strong>ID:</strong> {file._id}</p>
            <p><strong>Kích thước:</strong> {file.size} bytes</p>
            <p><strong>Ngày tạo:</strong> {new Date(file.createdAt).toLocaleString()}</p>
            
            <Link to={`/edit/${file._id}`}>Chỉnh sửa</Link> | 
            <Link to="/">Quay về Danh sách</Link>
        </div>
    );
};

export default FileDetail;