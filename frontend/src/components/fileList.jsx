import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
    FaFolder, FaFileAlt, FaFilePdf, FaFileWord, FaFileImage, FaFileCode, FaFileExcel, 
    FaFileArchive, FaEllipsisV, FaDownload, FaPencilAlt, FaShareAlt, 
    FaInfoCircle, FaTrash, FaPlus, FaTimes 
} from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/files';

// ----------------------------------------------------------------------
// --- 1. CÁC HÀM HELPER VÀ STYLE CHUNG (KHÔNG THAY ĐỔI) ---
// ----------------------------------------------------------------------

const formatUploadDate = (dateString) => {
    if (!dateString) return 'Chưa có ngày tạo';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf': return <FaFilePdf style={{ color: '#F40F02' }} />; 
        case 'doc':
        case 'docx': return <FaFileWord style={{ color: '#2B579A' }} />;
        case 'xls':
        case 'xlsx': return <FaFileExcel style={{ color: '#0C7B38' }} />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif': return <FaFileImage style={{ color: '#34A853' }} />;
        case 'zip':
        case 'rar': return <FaFileArchive style={{ color: '#FFB300' }} />;
        case 'js':
        case 'json':
        case 'html':
        case 'css': return <FaFileCode style={{ color: '#4285F4' }} />;
        default: return <FaFileAlt style={{ color: '#70757A' }} />;
    }
};

const styles = {
    container: { padding: '20px', fontFamily: 'Roboto, Arial, sans-serif', backgroundColor: '#F7F9FC', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #E0E0E0', paddingBottom: '20px' },
    filesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    
    // Dropdown/Menu Styles
    menuButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#70757A', fontSize: '18px', padding: '5px' },
    dropdownMenu: { position: 'absolute', top: '30px', right: '0', backgroundColor: 'white', border: '1px solid #E0E0E0', borderRadius: '4px', zIndex: 100, minWidth: '200px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', padding: '5px 0' },
    menuItem: { display: 'flex', alignItems: 'center', padding: '8px 15px', cursor: 'pointer', textDecoration: 'none', color: '#3C4043', transition: 'background-color 0.1s' },
    menuSeparator: { height: '1px', backgroundColor: '#E0E0E0', margin: '5px 0' },
    
    // General Card Styles
    fileHeaderIcon: { fontSize: '20px', marginRight: '8px' },
    fileName: { fontWeight: '600', fontSize: '14px', color: '#3C4043', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' },
    renameInput: { border: '1px solid #4285F4', borderRadius: '4px', padding: '4px', fontSize: '14px', fontWeight: '600', width: '100%', boxSizing: 'border-box', textAlign: 'left' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '40px', padding: '0 10px' },
    cardFooter: { padding: '10px', display: 'flex', alignItems: 'center', fontSize: '12px', color: '#5F6368' },
    userIcon: { width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFB300', color: 'white', textAlign: 'center', lineHeight: '20px', marginRight: '8px', fontSize: '12px' },
};

// --- STYLE CHO MODAL (KHÔNG THAY ĐỔI) ---
const modalStyles = { /* ... giữ nguyên style modal ... */ 
    backdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    },
    content: {
        backgroundColor: 'white', padding: '20px', borderRadius: '10px',
        maxWidth: '70vw', maxHeight: '80vh', overflowY: 'auto',
        position: 'relative', minWidth: '400px'
    },
    closeButton: {
        position: 'absolute', top: '10px', right: '10px',
        background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer',
        color: '#70757A'
    },
    title: { fontSize: '24px', color: '#3C4043', borderBottom: '1px solid #EEE', paddingBottom: '10px', marginBottom: '15px' },
    previewArea: { 
        minHeight: '200px', backgroundColor: '#F8F8F8', border: '1px solid #CCC', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' 
    },
    image: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
    text: { whiteSpace: 'pre-wrap', padding: '15px', color: '#3C4043' },
    metadata: { fontSize: '12px', color: '#70757A', marginTop: '10px' }
};

// ----------------------------------------------------------------------
// --- 2. SUB-COMPONENT: FOLDER ITEM (Dùng cho Thư mục) ---
// ----------------------------------------------------------------------

const FolderItem = ({ folder, onAction, openMenuId, onMenuToggle }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(folder.name);
    
    // Styles cụ thể cho Folder
    const folderStyles = {
        card: { backgroundColor: 'rgb(240, 242, 252)', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', padding: '10px', cursor: 'pointer', border: '1px solid #D0D0F0' },
        iconLarge: { fontSize: '60px', color: '#4285F4', marginBottom: '10px', marginTop: '-10px', },
        renameInput: { border: '1px solid #4285F4', borderRadius: '4px', padding: '4px', fontSize: '14px', fontWeight: '600', width: '90%', boxSizing: 'border-box', textAlign: 'center' },
    };

    const startRename = (e) => {
        e.stopPropagation();
        onMenuToggle(null); // Đóng menu nếu đang mở
        setIsEditing(true);
        setNewName(folder.name);
    };

    const handleRenameSubmit = async () => {
        if (!newName || newName === folder.name) {
            setIsEditing(false);
            return;
        }

        try {
            // Giả định API cho rename folder
            await axios.put(`${API_URL}/folder/rename/${folder._id}`, { name: newName });
            
            // Cập nhật State trong component cha
            onAction('rename', folder._id, newName);

        } catch (error) {
            console.error("Lỗi khi đổi tên folder:", error);
            alert("Lỗi: Không thể đổi tên folder.");
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') setIsEditing(false);
    };

    return (
        <div 
            style={folderStyles.card} 
            onDoubleClick={() => onAction('open', folder._id, folder.name)} 
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)'}
        >
            <button 
                style={{...styles.menuButton, position: 'absolute', top: '5px', right: '5px'}} 
                onClick={(e) => { e.stopPropagation(); onMenuToggle(folder._id); }}
            >
                <FaEllipsisV />
            </button>

            <FaFolder style={folderStyles.iconLarge} />
            
            {isEditing ? (
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleKeyPress}
                    autoFocus
                    style={folderStyles.renameInput}
                />
            ) : (
                <div style={styles.fileName} title={folder.name} onClick={startRename}>
                    {folder.name}
                </div>
            )}
            
            {openMenuId === folder._id && (
                <div style={styles.dropdownMenu} onMouseLeave={() => onMenuToggle(null)}>
                    <div onClick={startRename} style={styles.menuItem}> <FaPencilAlt style={styles.fileHeaderIcon} /> Đổi tên </div>
                    <div onClick={() => onAction('share', folder._id, folder.name)} style={styles.menuItem}> <FaShareAlt style={styles.fileHeaderIcon} /> Chia sẻ </div>
                    <div style={styles.menuSeparator}></div>
                    <div onClick={() => onAction('delete', folder._id)} style={{...styles.menuItem, color: '#D93025'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FCE8E6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                        <FaTrash style={styles.fileHeaderIcon} /> Xóa
                    </div>
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// --- 3. SUB-COMPONENT: FILE ITEM (Dùng cho File) ---
// ----------------------------------------------------------------------

const FileItem = ({ file, onAction, onPreview, openMenuId, onMenuToggle }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(file.name);
    
    // Styles cụ thể cho File
    const fileStyles = {
        card: { backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', transition: 'box-shadow 0.3s ease', position: 'relative', overflow: 'hidden', height: '240px' },
        thumbnailArea: { height: '130px', backgroundColor: '#F8F9FA', border: '1px solid #E0E0E0', margin: '5px 10px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#A0A0A0', fontSize: '12px', cursor: 'pointer' },
    };

    const startRename = (e) => {
        e.stopPropagation();
        onMenuToggle(null);
        setIsEditing(true);
        setNewName(file.name);
    };

    const handleRenameSubmit = async () => {
        if (!newName || newName === file.name) {
            setIsEditing(false);
            return;
        }

        try {
            await axios.put(`${API_URL}/rename/${file._id}`, { name: newName });
            onAction('rename', file._id, newName); // Cập nhật State trong component cha
        } catch (error) {
            console.error("Lỗi khi đổi tên:", error);
            alert("Lỗi: Không thể đổi tên file.");
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') setIsEditing(false);
    };

    const handleFileClick = (e) => {
        if (!isEditing) {
            e.stopPropagation(); 
            onPreview(file); // Gọi hàm mở Modal xem trước
        }
    };

    return (
        <div style={fileStyles.card} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'}>
            
            {/* 1. HEADER (Tên file và Menu 3 chấm) */}
            <div style={styles.cardTop}>
                <div style={{...styles.fileName, flexGrow: 1, paddingRight: '10px', display: 'flex', alignItems: 'center'}} >
                    <div style={styles.fileHeaderIcon}>
                        {getFileIcon(file.name)} 
                    </div>
                    
                    {isEditing ? (
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={handleKeyPress}
                            autoFocus
                            style={styles.renameInput}
                        />
                    ) : (
                        <span title={file.name} onClick={startRename}>
                            {file.name}
                        </span>
                    )}
                </div>
                
                {/* Nút 3 chấm */}
                <button style={{...styles.menuButton, flexShrink: 0}} onClick={(e) => { e.stopPropagation(); onMenuToggle(file._id); }}>
                    <FaEllipsisV />
                </button>
                
                {/* MENU DROPDOWN */}
                {openMenuId === file._id && (
                    <div style={styles.dropdownMenu} onMouseLeave={() => onMenuToggle(null)}>
                        <div onClick={() => onAction('download', file._id, file.name)} style={styles.menuItem}> <FaDownload style={styles.fileHeaderIcon} /> Tải xuống </div>
                        <div onClick={startRename} style={styles.menuItem}> <FaPencilAlt style={styles.fileHeaderIcon} /> Đổi tên </div>
                        <div style={styles.menuSeparator}></div>
                        <div onClick={() => onAction('share', file._id, file.name)} style={styles.menuItem}> <FaShareAlt style={styles.fileHeaderIcon} /> Chia sẻ </div>
                        <Link to={`/details/${file._id}`} style={styles.menuItem} onClick={() => onMenuToggle(null)}> <FaInfoCircle style={styles.fileHeaderIcon} /> Thông tin về file </Link>
                        <div style={styles.menuSeparator}></div>
                        <div onClick={() => onAction('delete', file._id)} style={{...styles.menuItem, color: '#D93025'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FCE8E6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                            <FaTrash style={styles.fileHeaderIcon} /> Xóa (DELETE)
                        </div>
                    </div>
                )}
            </div>
            
            {/* 2. THUMBNAIL/PREVIEW AREA */}
            <div style={fileStyles.thumbnailArea} onClick={handleFileClick}>
                {getFileIcon(file.name)} <span style={{marginLeft: '5px'}}>[Xem trước nhanh]</span>
            </div>

            {/* 3. FOOTER METADATA */}
            <div style={styles.cardFooter}>
                <div style={styles.userIcon}>N</div>
                Bạn đã mở • {formatUploadDate(file.uploadDate)} 
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// --- 4. COMPONENT CHÍNH: FILE LIST ---
// ----------------------------------------------------------------------

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null); 
    
    // States cho Modal Xem trước
    const [previewFile, setPreviewFile] = useState(null); 
    const [previewContent, setPreviewContent] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(API_URL);
            // GIẢ ĐỊNH: Thêm item folder để minh họa phân loại
            const sampleData = [
                // { _id: 'f101', name: 'Photos', uploadDate: new Date(), isFolder: true, owner: 'N' },
                // { _id: 'f102', name: 'Báo cáo 2024', uploadDate: new Date(Date.now() - 86400000), isFolder: true, owner: 'N' },
                ...response.data, // Dữ liệu từ API
            ].sort((a, b) => (b.isFolder ? 1 : 0) - (a.isFolder ? 1 : 0)); // Đưa folder lên đầu
            
            setFiles(sampleData);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách:", error);
        }
    };
    
    // --- HÀM XỬ LÝ HÀNH ĐỘNG TỪ SUB-COMPONENTS ---
    const handleItemAction = async (action, id, newName) => {
        setOpenMenuId(null); 

        if (action === 'delete') {
            if (window.confirm('Bạn có chắc chắn muốn xóa item này?')) {
                try {
                    await axios.delete(`${API_URL}/${id}`);
                    setFiles(files.filter(file => file._id !== id));
                } catch (error) {
                    console.error("Lỗi khi xóa:", error);
                }
            }
        } else if (action === 'rename') {
            // Cập nhật tên trong state sau khi đổi tên thành công từ FileItem/FolderItem
            setFiles(files.map(item => 
                item._id === id ? { ...item, name: newName } : item
            ));
        } else if (action === 'download') {
            alert(`Đang tải xuống file: ${newName} (ID: ${id})`);
        } else if (action === 'share') {
            alert(`Mở hộp thoại chia sẻ cho item: ${newName}`);
        } else if (action === 'open') {
            alert(`Mở thư mục: ${newName}`);
        }
    };

    // --- LOGIC XEM TRƯỚC (QUICK PREVIEW) ---
    const handlePreview = async (file) => {
        if (file.isFolder) return;
        
        setPreviewFile(file);
        setPreviewContent('Đang tải nội dung...');

        try {
            // Giả định API: GET /api/files/view/:id trả về URL xem trước hoặc nội dung
            const response = await axios.get(`${API_URL}/view/${file._id}`); 
            
            setPreviewContent(response.data.content || response.data.url || 'Không thể xem trước nội dung.');

        } catch (error) {
            console.error("Lỗi khi tải nội dung xem trước:", error);
            setPreviewContent('Lỗi: Không thể tải nội dung xem trước. Vui lòng kiểm tra endpoint API /view/:id.');
        }
    };
    
    const closePreview = () => {
        setPreviewFile(null);
        setPreviewContent('');
    };
    
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={{ color: '#3C4043' }}>Drive của tôi 📂</h2>
                <Link to="/add" style={{ textDecoration: 'none' }}>
                    <button style={{ backgroundColor: '#4285F4', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' }}>
                        <FaPlus style={{ marginRight: '8px' }} />
                        Tải lên Mới
                    </button>
                </Link>
            </div>
            
            <div style={styles.filesGrid}>
                {files.map(item => (
                    item.isFolder ? (
                        <FolderItem 
                            key={item._id} 
                            folder={item} 
                            onAction={handleItemAction} 
                            openMenuId={openMenuId} 
                            onMenuToggle={setOpenMenuId} 
                        />
                    ) : (
                        <FileItem 
                            key={item._id} 
                            file={item} 
                            onAction={handleItemAction} 
                            onPreview={handlePreview} 
                            openMenuId={openMenuId} 
                            onMenuToggle={setOpenMenuId} 
                        />
                    )
                ))}
            </div>

            {/* --- MODAL XEM TRƯỚC (QUICK PREVIEW) --- */}
            {previewFile && (
                <div style={modalStyles.backdrop} onClick={closePreview}>
                    <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                        <button style={modalStyles.closeButton} onClick={closePreview}>
                            <FaTimes />
                        </button>
                        <h3 style={modalStyles.title}>Xem trước: {previewFile.name}</h3>
                        <div style={modalStyles.previewArea}>
                            
                            {previewContent === 'Đang tải nội dung...' || previewContent.startsWith('Lỗi:') ? (
                                <p style={modalStyles.text}>{previewContent}</p>
                            ) : previewFile.name.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                <img src={previewContent} alt={previewFile.name} style={modalStyles.image} />
                            ) : (
                                <p style={modalStyles.text}>{previewContent}</p>
                            )}
                        </div>
                        <p style={modalStyles.metadata}>
                            Loại: {previewFile.name.split('.').pop().toUpperCase()} • 
                            Ngày tạo: {formatUploadDate(previewFile.uploadDate)}
                        </p>
                    </div>
                </div>
            )}
            
            {files.length === 0 && <p style={{ textAlign: 'center', color: '#70757A', marginTop: '50px' }}>Không có item nào trong Drive.</p>}
        </div>
    );
};

export default FileList;