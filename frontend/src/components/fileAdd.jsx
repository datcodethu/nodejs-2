import React, { useState } from "react";
import axios from "axios";

// Định nghĩa một ID Owner/User giả lập cho việc test
// Bạn cần thay thế nó bằng một ID hợp lệ từ DB của bạn
const MOCK_OWNER_ID = "60c728b9f1d2f623a8b45678"; 

const FileAdd = () => {
  // --- State cho các trường BẮT BUỘC ---
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [ownerId, setOwnerId] = useState(MOCK_OWNER_ID); // Khởi tạo bằng ID giả lập
  const [size, setSize] = useState(0); // Kích thước file (bytes)
  const [fileType, setFileType] = useState("text/plain"); // Loại file

  // --- State cho các trường TÙY CHỌN ---
  const [workspaceId, setWorkspaceId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [url, setUrl] = useState("");

  // --- State cho kết quả/lỗi ---
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Chuẩn bị payload (lọc bỏ các trường tùy chọn rỗng)
    const payload = {
      name,
      content,
      ownerId,
      size: parseInt(size, 10), // Đảm bảo size là số nguyên
      fileType,
      // Thêm các trường tùy chọn nếu chúng có giá trị
      ...(workspaceId && { workspaceId }),
      ...(folderId && { folderId }),
      ...(url && { url }),
    };

    // Kiểm tra nhanh các trường bắt buộc (mặc dù form có required, nhưng vẫn nên kiểm tra)
    if (!name || !content || !ownerId || !size || !fileType) {
        setError("Thiếu các trường bắt buộc: Tên, Nội dung, ID Chủ sở hữu, Kích thước, Loại file.");
        return;
    }


    try {
      // ⚠️ Đảm bảo URL này khớp với cấu hình server của bạn
      const API_URL = "http://localhost:5000/api/v1/files/add";
      
      const res = await axios.post(API_URL, payload);
      
      setResult(res.data);
    } catch (err) {
      console.error("Lỗi API:", err.response || err);
      // Lấy thông báo lỗi từ server nếu có, hoặc thông báo lỗi chung
      setError(err.response?.data?.message || `Lỗi khi gọi API: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "500px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        </h2>
        
        {/* --- CÁC TRƯỜNG BẮT BUỘC --- */}
        <p style={{ color: 'red', marginBottom: '15px' }}>* Là trường bắt buộc</p>
        
        <label>Tên file *:</label>
        <Input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
        />

        <label>Nội dung *:</label>
        <TextArea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={4} 
            required 
        />
        
        <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
                <label>Kích thước (size - bytes) *:</label>
                <Input 
                    type="number" 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)} 
                    required 
                    min="0"
                />
            </div>
            <div style={{ flex: 1 }}>
                <label>Loại File (fileType) *:</label>
                <Input 
                    type="text" 
                    value={fileType} 
                    onChange={(e) => setFileType(e.target.value)} 
                    required 
                />
            </div>
        </div>

        {/* --- CÁC TRƯỜNG TÙY CHỌN --- */}
        <h3 style={{ marginTop: '20px', marginBottom: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            Thông tin Tùy chọn
        </h3>

        <label>ID Workspace (workspaceId):</label>
        <Input 
            type="text" 
            value={workspaceId} 
            onChange={(e) => setWorkspaceId(e.target.value)} 
        />

        <label>ID Thư mục (folderId):</label>
        <Input 
            type="text" 
            value={folderId} 
            onChange={(e) => setFolderId(e.target.value)} 
        />

        <label>URL (url):</label>
        <Input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
        />

        <button
          type="submit"
          style={{
            width: "100%",
            background: "#007bff",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: '20px',
            transition: 'background 0.3s'
          }}
        >
          Tạo File
        </button>
      </form>

      {/* HIỂN THỊ KẾT QUẢ */}
      {result && (
        <div
          style={{
            marginTop: "20px",
            background: "#e9f7ef",
            padding: "15px",
            borderRadius: "8px",
            width: "500px",
            border: "1px solid #c3e6cb"
          }}
        >
          <h3 style={{ color: "#28a745" }}>✅ Tạo file thành công!</h3>
          <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* HIỂN THỊ LỖI */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            background: "#f8d7da",
            padding: "15px",
            borderRadius: "8px",
            width: "500px",
            color: "#721c24",
            border: "1px solid #f5c6cb"
          }}
        >
          <h3 style={{ color: "#721c24" }}>❌ Lỗi!</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileAdd;

// Component Input tái sử dụng
const Input = (props) => (
    <input
        {...props}
        style={{
            width: "100%",
            padding: "8px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            boxSizing: "border-box", // Thêm dòng này để padding không làm tăng chiều rộng
            ...props.style // Giữ lại style tùy chỉnh nếu có
        }}
    />
);

// Component TextArea tái sử dụng
const TextArea = (props) => (
    <textarea
        {...props}
        style={{
            width: "100%",
            padding: "8px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            boxSizing: "border-box", // Thêm dòng này
            resize: "vertical",
            ...props.style
        }}
    />
);