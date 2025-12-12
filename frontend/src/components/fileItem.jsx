import React from 'react';

// Lấy API URL để hiển thị ảnh thumbnail
const API_URL = import.meta.env.VITE_API_URL; 

export default function FileItem({ file, onClick, onShare, listView }) {
  
  // --- HÀM XỬ LÝ LOGIC ---
  const getFileStyle = (fileName, fileType) => {
    // 1. Lấy đuôi file (ví dụ: pdf, png, docx)
    const extension = fileName?.split('.').pop().toLowerCase();
    
    // 2. Kiểm tra MIME type (đề phòng file không có đuôi)
    const mime = fileType || '';

    // --- LOGIC PHÂN LOẠI ---
    
    // PDF
    if (extension === 'pdf' || mime.includes('pdf')) {
      return { icon: "bi bi-file-earmark-pdf-fill", color: "#dc3545" }; // Đỏ
    }
    
    // WORD (doc, docx)
    if (['doc', 'docx'].includes(extension) || mime.includes('word')) {
      return { icon: "bi bi-file-earmark-word-fill", color: "#0d6efd" }; // Xanh dương
    }

    // EXCEL (xls, xlsx, csv)
    if (['xls', 'xlsx', 'csv'].includes(extension) || mime.includes('spreadsheet') || mime.includes('excel')) {
      return { icon: "bi bi-file-earmark-excel-fill", color: "#198754" }; // Xanh lá
    }

    // POWERPOINT (ppt, pptx)
    if (['ppt', 'pptx'].includes(extension) || mime.includes('presentation') || mime.includes('powerpoint')) {
      return { icon: "bi bi-file-earmark-ppt-fill", color: "#fd7e14" }; // Cam
    }

    // ẢNH (jpg, png, webp...)
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension) || mime.startsWith('image/')) {
      return { type: 'image', icon: "bi bi-file-earmark-image-fill", color: "#dc3545" };
    }

    // VIDEO (mp4, avi...)
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension) || mime.startsWith('video/')) {
      return { icon: "bi bi-file-earmark-play-fill", color: "#ffc107" }; // Vàng
    }

    // AUDIO (mp3, wav...)
    if (['mp3', 'wav', 'ogg'].includes(extension) || mime.startsWith('audio/')) {
      return { icon: "bi bi-file-earmark-music-fill", color: "#6f42c1" }; // Tím
    }

    // CODE / TEXT (txt, js, html...)
    if (['txt', 'js', 'html', 'css', 'json'].includes(extension)) {
      return { icon: "bi bi-file-earmark-code-fill", color: "#6c757d" }; // Xám đậm
    }

    // ZIP / RAR
    if (['zip', 'rar', '7z'].includes(extension)) {
      return { icon: "bi bi-file-earmark-zip-fill", color: "#ffc107" };
    }

    // MẶC ĐỊNH
    return { icon: "bi bi-file-earmark-fill", color: "#adb5bd" }; // Xám nhạt
  };

  // Lấy style cho file hiện tại
  const style = getFileStyle(file.name, file.fileType);
  
  // Xử lý URL ảnh nếu là file ảnh
  const isImage = style.type === 'image';
  const fileUrl = file.url || file.path;
  // Tạo đường dẫn đầy đủ: Nếu url đã có http thì giữ nguyên, nếu không thì nối với API_URL
  const fullImageUrl = fileUrl?.startsWith("http") 
      ? fileUrl 
      : `${API_URL}${fileUrl?.startsWith("/") ? "" : "/"}${fileUrl}`;


  // ==========================================
  // VIEW: DẠNG DANH SÁCH (LIST VIEW)
  // ==========================================
  if (listView) {
    return (
      <div
        className="folder-item list-view-item"
        onClick={() => onClick(file)}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "10px",
          borderBottom: "1px solid #eee",
          cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px", overflow: "hidden" }}>
          {/* Nếu là ảnh thì hiện ảnh nhỏ, không thì hiện icon */}
          {isImage ? (
             <img 
               src={fullImageUrl} 
               alt="" 
               style={{ width: "30px", height: "30px", objectFit: "cover", borderRadius: "4px" }}
               onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}} // Nếu lỗi ảnh thì hiện icon
             />
          ) : null}
          
          <i 
            className={style.icon} 
            style={{ 
              fontSize: "1.5rem", 
              color: style.color, 
              display: isImage ? 'none' : 'block' // Ẩn icon nếu đã hiện ảnh
            }}
          ></i>

          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {file.name}
          </div>
        </div>

        {onShare && (
          <button
            onClick={(e) => { e.stopPropagation(); onShare(file); }}
            className="ba_cham"
            style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#666" }}
          >
            ⋮
          </button>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: DẠNG LƯỚI (GRID VIEW)
  // ==========================================
  return (
    <div
      className="folder-item grid-view-item"
      onClick={() => onClick(file)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        width: "140px", // Cố định chiều rộng để đều nhau
        margin: "10px",
        position: "relative",
        cursor: "pointer",
        borderRadius: "8px",
        border: "1px solid transparent",
        transition: "background 0.2s"
      }}
      // Thêm hiệu ứng hover bằng CSS class hoặc inline (tốt nhất là dùng CSS class)
    >
      {/* KHUNG CHỨA ICON HOẶC ẢNH */}
      <div style={{ 
          width: "100%", 
          height: "80px", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          marginBottom: "10px"
      }}>
        {isImage ? (
           <img 
             src={fullImageUrl} 
             alt={file.name} 
             style={{ 
               width: "100%", 
               height: "100%", 
               objectFit: "cover", 
               borderRadius: "6px" 
             }}
             onError={(e) => {
               // Nếu ảnh lỗi (404), ẩn ảnh đi và hiện icon
               e.target.style.display = 'none'; 
               e.target.nextSibling.style.display = 'block'; 
             }}
           />
        ) : null}

        {/* Icon (Chỉ hiện khi không phải ảnh hoặc ảnh bị lỗi) */}
        <i 
          className={style.icon} 
          style={{ 
            fontSize: "3rem", 
            color: style.color,
            display: isImage ? 'none' : 'block' 
          }}
        ></i>
      </div>

      {/* TÊN FILE */}
      <div 
        style={{ 
          textAlign: "center", 
          fontSize: "0.9rem", 
          width: "100%", 
          wordBreak: "break-word",
          display: "-webkit-box",
          WebkitLineClamp: "2", // Giới hạn 2 dòng
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
        title={file.name}
      >
        {file.name}
      </div>

      {/* NÚT 3 CHẤM */}
      {onShare && (
        <button
          onClick={(e) => { e.stopPropagation(); onShare(file); }}
          className="ba_cham"
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "white", // Thêm nền trắng cho dễ nhìn
            borderRadius: "50%",
            width: "25px",
            height: "25px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
          }}
        >
          ⋮
        </button>
      )}
    </div>
  );
}