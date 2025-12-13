import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL; 

export default function FileItem({ file, onOpen, onShare, onRename, onDelete, listView }) {
  
  // --- STATE QUẢN LÝ MENU ---
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Xử lý đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hàm bật/tắt menu
  const toggleMenu = (e) => {
    e.stopPropagation(); // Ngăn không cho click xuyên qua (để không mở file)
    setShowMenu(!showMenu);
  };

  // --- STYLE ICON ---
  const getFileStyle = (fileName, fileType) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    const mime = fileType || '';

    if (extension === 'pdf' || mime.includes('pdf')) return { icon: "bi bi-file-earmark-pdf-fill", color: "#dc3545" };
    if (['doc', 'docx'].includes(extension) || mime.includes('word')) return { icon: "bi bi-file-earmark-word-fill", color: "#0d6efd" };
    if (['xls', 'xlsx', 'csv'].includes(extension) || mime.includes('excel')) return { icon: "bi bi-file-earmark-excel-fill", color: "#198754" };
    if (['ppt', 'pptx'].includes(extension) || mime.includes('powerpoint')) return { icon: "bi bi-file-earmark-ppt-fill", color: "#fd7e14" };
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) || mime.startsWith('image/')) return { type: 'image', icon: "bi bi-file-earmark-image-fill", color: "#dc3545" };
    if (['mp4', 'avi'].includes(extension) || mime.startsWith('video/')) return { icon: "bi bi-file-earmark-play-fill", color: "#ffc107" };
    if (['zip', 'rar'].includes(extension)) return { icon: "bi bi-file-earmark-zip-fill", color: "#ffc107" };
    return { icon: "bi bi-file-earmark-fill", color: "#adb5bd" };
  };

  const style = getFileStyle(file.name, file.fileType);
  const isImage = style.type === 'image';
  
  const fileUrl = file.url || file.path;
  const fullImageUrl = fileUrl?.startsWith("http") ? fileUrl : `${API_URL}${fileUrl?.startsWith("/") ? "" : "/"}${fileUrl}`;

  // --- MENU COMPONENT (SỬA LẠI LOGIC HIỂN THỊ) ---
  const ActionMenu = () => (
    <div className="dropdown" ref={menuRef}>
      <button 
        className="btn btn-link text-secondary p-0" 
        type="button" 
        onClick={toggleMenu} // Gọi hàm toggle thủ công
        style={{ textDecoration: 'none', fontSize: '1.2rem', lineHeight: '1' }}
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      
      {/* Thêm style display: block khi showMenu = true */}
      <ul 
        className={`dropdown-menu dropdown-menu-end shadow ${showMenu ? "show" : ""}`}
        style={{ 
            display: showMenu ? 'block' : 'none', // Ép hiển thị bằng CSS
            position: 'absolute', 
            zIndex: 1000,
            right: 0
        }} 
      >
        <li>
            <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onOpen(file); }}>
                <i className="bi bi-eye me-2"></i> Mở / Xem
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRename(file); }}>
                <i className="bi bi-pencil me-2"></i> Đổi tên
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onShare(file); }}>
                <i className="bi bi-share me-2"></i> Chia sẻ
            </button>
        </li>
        <li><hr className="dropdown-divider"/></li>
        <li>
            <button className="dropdown-item text-danger" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(file); }}>
                <i className="bi bi-trash me-2"></i> Xóa file
            </button>
        </li>
      </ul>
    </div>
  );

  // ==========================================
  // VIEW: LIST
  // ==========================================
  if (listView) {
    return (
      <div
        className="folder-item list-view-item"
        onClick={() => onOpen(file)}
        style={{ 
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer", position: 'relative'
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px", overflow: "hidden", flex: 1 }}>
          {isImage && <img src={fullImageUrl} alt="" style={{ width: "30px", height: "30px", objectFit: "cover", borderRadius: "4px" }} onError={(e) => e.target.style.display='none'} />}
          <i className={style.icon} style={{ fontSize: "1.5rem", color: style.color, display: isImage ? 'none' : 'block' }}></i>
          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
        </div>
        <ActionMenu />
      </div>
    );
  }

  // ==========================================
  // VIEW: GRID
  // ==========================================
  return (
    <div
      className="folder-item grid-view-item"
      onClick={() => onOpen(file)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "10px", width: "140px", margin: "10px", position: "relative",
        cursor: "pointer", borderRadius: "8px", border: "1px solid #f0f0f0", backgroundColor: "#fff"
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
        <ActionMenu />
      </div>

      <div style={{ width: "100%", height: "80px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px", marginTop: "10px" }}>
        {isImage ? (
           <img src={fullImageUrl} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
        ) : null}
        <i className={style.icon} style={{ fontSize: "3rem", color: style.color, display: isImage ? 'none' : 'block' }}></i>
      </div>

      <div style={{ textAlign: "center", fontSize: "0.9rem", width: "100%", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden", height: "2.8em", lineHeight: "1.4em" }} title={file.name}>
        {file.name}
      </div>
    </div>
  );
}