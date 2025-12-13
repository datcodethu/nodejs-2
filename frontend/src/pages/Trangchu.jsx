import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap"; // Import Modal từ bootstrap

import { folderApi } from "../services/folderApi";
import { fileApi } from "../services/fileApi";
import { recentApi } from "../services/recentApi";
import FolderItem from "../components/folderItem";
import FileItem from "../components/fileItem";
import RecentFile from "../components/recentFileItem";

export default function Trangchu() {
  // --- STATE ---
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [recentFiles, setRecentFiles] = useState([]);

  // --- REFS & HOOKS ---
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const shareModalRef = useRef(null);
  
  // State cho chức năng Share
  const [currentFile, setCurrentFile] = useState(null);
  const [shareLink, setShareLink] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  
  // Lấy UserID từ localStorage (Chìa khóa để lọc dữ liệu)
  const currentUserId = localStorage.getItem("userId");

  // =========================================================
  // 1. LOAD DỮ LIỆU (Đã fix lỗi hiển thị file của người khác)
  // =========================================================
  useEffect(() => {
    async function loadData() {
      try {
        if (!currentUserId) {
            // Nếu chưa đăng nhập (hoặc mất ID), không tải dữ liệu để bảo mật
            setLoading(false);
            return;
        }

        const [folderRes, fileRes, recentRes] = await Promise.all([
          folderApi.getAll(),
          // QUAN TRỌNG: Truyền userId vào để chỉ lấy file của mình
          fileApi.getAll(currentUserId), 
          recentApi.getAll(),
        ]);
        
        setFolders(folderRes.data);
        setFiles(fileRes.data);
        
        // Lọc Recent Files (Chỉ lấy file upload và thuộc về user này)
        if (recentRes.data) {
            const myRecentFiles = recentRes.data.filter(
                (f) => f.path?.startsWith("/uploads") && f.owner === currentUserId
            );
            setRecentFiles(myRecentFiles);
        }

      } catch (err) {
        console.error("Lỗi tải dữ liệu", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUserId]); // Chạy lại khi ID thay đổi

  // =========================================================
  // 2. CÁC HÀM XỬ LÝ (ACTIONS)
  // =========================================================

  // A. Mở/Xem File
  const handleOpenFile = (file) => {
    const fileUrl = file.url || file.path;
    // Đảm bảo URL hợp lệ
    const normalized = fileUrl.startsWith("http") 
        ? fileUrl 
        : `${API_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
    
    window.open(normalized, "_blank");
  };

  // B. Đổi tên File
  const handleRenameFile = async (file) => {
    const newName = window.prompt("Nhập tên mới cho file:", file.name);
    
    // Nếu người dùng bấm Cancel hoặc tên không đổi -> Dừng
    if (!newName || newName.trim() === "" || newName === file.name) return;

    try {
      const res = await fileApi.rename(file._id, newName);
      if (res.data.success) {
        // Cập nhật State ngay lập tức (Optimistic Update)
        setFiles((prev) => prev.map((f) => 
          f._id === file._id ? { ...f, name: newName } : f
        ));
        alert("Đổi tên thành công!");
      }
    } catch (err) {
      console.error("Lỗi đổi tên:", err);
      alert("Đổi tên thất bại. Vui lòng thử lại.");
    }
  };

  // C. Xóa File
  const handleDeleteFile = async (file) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa file "${file.name}" không?`);
    if (!confirmDelete) return;

    try {
      const res = await fileApi.delete(file._id);
      if (res.data.success) {
        // Xóa khỏi danh sách hiển thị
        setFiles((prev) => prev.filter((f) => f._id !== file._id));
        setRecentFiles((prev) => prev.filter((f) => f._id !== file._id));
        alert("Đã xóa file.");
      }
    } catch (err) {
      console.error("Lỗi xóa file:", err);
      alert("Xóa thất bại.");
    }
  };

  // D. Chia sẻ File
  const handleShareFile = async (file) => {
    try {
      const res = await fileApi.share(file._id);
      if (res.data.success) {
        setShareLink(res.data.shareUrl);
        setCurrentFile(file);

        // Mở Modal (Sử dụng Bootstrap JS thuần)
        if (shareModalRef.current) {
            const modal = new Modal(shareModalRef.current);
            modal.show();
        }
      } else {
        alert("Không tạo được link chia sẻ");
      }
    } catch (err) {
      console.error("Lỗi share:", err);
      alert("Lỗi khi tạo link chia sẻ");
    }
  };

  // E. Upload File
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra login
    if (!currentUserId) {
        alert("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerId", currentUserId); 

    try {
      setLoading(true);
      const res = await fileApi.upload(formData); 
      if (res.data.success) {
        alert("Upload thành công!");
        setFiles((prev) => [...prev, res.data.file]);
      } else {
        alert("Upload thất bại: " + res.data.message);
      }
    } catch (err) {
      console.error("Lỗi upload:", err);
      alert("Lỗi server khi upload.");
    } finally {
      setLoading(false);
      event.target.value = null; // Reset input
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Đã sao chép link!");
  };

  // =========================================================
  // 3. RENDER GIAO DIỆN
  // =========================================================
  return (
    <div>
      {/* --- Recently Opened --- */}
      <div className="recently_opened">
        <div className="tittle-path" style={{ fontWeight: "500" }}>Recently opened</div>
        {recentFiles.length === 0 ? (
          <p>Không có tệp mở gần đây</p>
        ) : (
          <div className="recent_grid">
            {recentFiles.map((f) => (
              <div className="recent_item" key={f._id} onClick={() => handleOpenFile(f)}>
                <RecentFile file={f} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Main File List --- */}
      <div>
        <div className="tittle-path" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: "500" }}>All files</div>
          
          <div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ marginRight: "15px", display: "flex", alignItems: "center", gap: "5px" }}
              onClick={handleUploadClick}
            >
              <i className="bi bi-cloud-upload"></i> Upload
            </button>

            <button onClick={() => setViewMode("grid")} className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}>
              <i className="bi bi-grid"></i>
            </button>
            <button onClick={() => setViewMode("list")} className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} style={{ marginLeft: "10px" }}>
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>

        <div>
          {loading ? (
             <p>Đang tải dữ liệu...</p>
          ) : folders.length === 0 && files.length === 0 ? (
            <p>Không có thư mục hoặc tệp nào.</p>
          ) : (
            <div className={viewMode === "grid" ? "all_folder" : "list_folder"}>
              {/* Render Folders */}
              {folders.map((f) => (
                <FolderItem
                  key={f._id}
                  folder={f}
                  onClick={() => navigate(`/folder/${f._id}`)}
                  listView={viewMode === "list"}
                />
              ))}
              
              {/* Render Files */}
              {files
                .filter((f) => !f.folder)
                .map((f) => (
                  <FileItem
                    key={f._id}
                    file={f}
                    listView={viewMode === "list"}
                    
                    // --- TRUYỀN HÀM XỬ LÝ VÀO COMPONENT CON ---
                    onOpen={handleOpenFile}
                    onShare={handleShareFile}
                    onRename={handleRenameFile}
                    onDelete={handleDeleteFile}
                    // -----------------------------------------
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden Upload Input */}
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

      {/* Share Modal */}
      <div className="modal fade" ref={shareModalRef} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Chia sẻ file: {currentFile?.name}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-control" value={shareLink} readOnly />
              <small className="text-muted">Sao chép link và gửi cho người khác.</small>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={copyToClipboard}>Sao chép link</button>
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}