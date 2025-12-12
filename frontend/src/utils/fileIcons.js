

export const getFileIcon = (fileName, fileType) => {
  const extension = fileName?.split('.').pop().toLowerCase();

  // 1. Cấu hình cho các loại file
  switch (extension) {
    // --- PDF ---
    case 'pdf':
      return { icon: 'bi-file-earmark-pdf-fill', color: '#dc3545' }; // Màu đỏ
    
    // --- Word ---
    case 'doc':
    case 'docx':
      return { icon: 'bi-file-earmark-word-fill', color: '#0d6efd' }; // Màu xanh dương
    
    // --- Excel ---
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { icon: 'bi-file-earmark-excel-fill', color: '#198754' }; // Màu xanh lá
    
    // --- PowerPoint ---
    case 'ppt':
    case 'pptx':
      return { icon: 'bi-file-earmark-ppt-fill', color: '#fd7e14' }; // Màu cam
    
    // --- Code/Text ---
    case 'txt':
    case 'js':
    case 'html':
    case 'css':
    case 'json':
      return { icon: 'bi-file-earmark-code-fill', color: '#6c757d' }; // Màu xám

    // --- Zip/Rar ---
    case 'zip':
    case 'rar':
      return { icon: 'bi-file-earmark-zip-fill', color: '#ffc107' }; // Màu vàng

    // --- Mặc định ---
    default:
      return { icon: 'bi-file-earmark-fill', color: '#adb5bd' }; // Màu xám nhạt
  }
};

// Hàm kiểm tra xem có phải là ảnh không để hiện preview
export const isImageFile = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
};