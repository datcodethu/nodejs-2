// src/components/FileDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaFileAlt, FaCalendarAlt, FaRulerCombined, FaUser, FaTag, FaDownload } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/files';

// --- Helper Functions ---

// Định dạng kích thước file (bytes -> KB/MB/GB)
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Định dạng ngày giờ thân thiện
const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

// --- Component Chính ---

const FileDetail = () => {
    const [file, setFile] = useState(null);
    const { id } = useParams();
    
    // Giả định API_URL được định nghĩa ở ngoài
    
    useEffect(() => {
        const fetchFile = async () => {
            try {
                const response = await axios.get(`${API_URL}/${id}`);
                setFile(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết:", error);
            }
        };
        fetchFile();
    }, [id]);

    // --- STYLE INLINE ---
    const styles = {
        container: { maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', fontFamily: 'Arial, sans-serif' },
        header: { borderBottom: '2px solid #EEE', paddingBottom: '15px', marginBottom: '20px' },
        title: { fontSize: '28px', color: '#3C4043', display: 'flex', alignItems: 'center', marginBottom: '10px' },
        icon: { marginRight: '15px', color: '#4285F4', fontSize: '30px' },
        sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#70757A', marginTop: '30px', marginBottom: '10px' },
        infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
        infoItem: { padding: '10px 0', borderBottom: '1px dotted #E0E0E0', display: 'flex', alignItems: 'center' },
        infoLabel: { fontWeight: 'bold', color: '#3C4043', width: '150px', display: 'flex', alignItems: 'center' },
        infoValue: { color: '#5F6368' },
        actionContainer: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #EEE', display: 'flex', justifyContent: 'space-between' },
        actionLink: { textDecoration: 'none', color: '#4285F4', fontWeight: 'bold', padding: '8px 15px', borderRadius: '4px', transition: 'background-color 0.2s' },
        downloadButton: {
            backgroundColor: '#34A853', color: 'white', border: 'none', padding: '10px 20px', 
            borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold'
        }
    };
    // ----------------------

    if (!file) {
        return <div style={{textAlign: 'center', marginTop: '50px', fontSize: '18px'}}>Đang tải hoặc không tìm thấy File...</div>;
    }

    // Giả định các trường dữ liệu có sẵn từ file object: 
    // _id, name, size, createdAt, updatedAt, mimetype, owner (optional)

    // Tạo giả định Owner và Location nếu không có trong dữ liệu mẫu
    const ownerName = file.owner || "Bạn";
    const mimeType = file.mimetype || "application/octet-stream";
    const downloadUrl = `${API_URL}/download/${file._id}`; // Giả định download API

    return (
        <div style={styles.container}>
            
            {/* --- HEADER VÀ TÊN FILE --- */}
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FaFileAlt style={styles.icon} />
                    {file.name}
                </h1>
                <div style={{fontSize: '14px', color: '#A0A0A0'}}>
                    ID: {file._id}
                </div>
            </div>

            {/* --- NÚT HÀNH ĐỘNG --- */}
            <div style={{...styles.actionContainer, borderTop: 'none', marginBottom: '30px', padding: '0'}}>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadButton}>
                    <FaDownload style={{marginRight: '10px'}} /> Tải xuống
                </a>
                <Link to="/">
                    <button style={{...styles.actionLink, backgroundColor: '#F0F0F0', color: '#3C4043'}}>
                        Quay về Danh sách
                    </button>
                </Link>
            </div>
            
            {/* --- THÔNG TIN CHI TIẾT --- */}
            <h2 style={styles.sectionTitle}>Thông tin chung</h2>
            <div style={styles.infoGrid}>
                
                {/* Cột 1: Thông tin cơ bản */}
                <div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}><FaTag style={{marginRight: '8px'}}/> Loại file:</span>
                        <span style={styles.infoValue}>{mimeType}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}><FaRulerCombined style={{marginRight: '8px'}}/> Kích thước:</span>
                        <span style={styles.infoValue}>{formatFileSize(file.size || 0)}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}><FaUser style={{marginRight: '8px'}}/> Chủ sở hữu:</span>
                        <span style={styles.infoValue}>{ownerName}</span>
                    </div>
                </div>

                {/* Cột 2: Thời gian */}
                <div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}><FaCalendarAlt style={{marginRight: '8px'}}/> Ngày tạo:</span>
                        <span style={styles.infoValue}>{formatDateTime(file.createdAt)}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}><FaCalendarAlt style={{marginRight: '8px'}}/> Cập nhật cuối:</span>
                        <span style={styles.infoValue}>{formatDateTime(file.updatedAt || file.createdAt)}</span>
                    </div>
                    <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Vị trí:</span>
                        <span style={styles.infoValue}>Drive của tôi</span>
                    </div>
                </div>
            </div>

            {/* --- FOOTER HÀNH ĐỘNG --- */}
            <div style={styles.actionContainer}>
                <Link to={`/edit/${file._id}`} style={styles.actionLink}>
                    Chỉnh sửa/Đổi tên
                </Link>
            </div>

        </div>
    );
};

export default FileDetail;