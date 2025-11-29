import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "bootstrap";
import axiosClient from "../utils/axiosClient";
import { fileApi } from "../services/fileApi";
import FileItem from "../components/fileItem";

export default function FolderPage() {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  // Chia sẻ
  const [currentFile, setCurrentFile] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const shareModalRef = useRef(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Lấy dữ liệu thư mục + file
  useEffect(() => {
    const loadFolder = async () => {
      try {
        const [folderRes, fileRes] = await Promise.all([
          axiosClient.get(`/folders/${id}`),
          axiosClient.get(`/folders/${id}/files`)
        ]);
        setFolder(folderRes.data);
        setFiles(fileRes.data);
      } catch (err) {
        console.error("Lỗi tải thư mục:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFolder();
  }, [id]);

  // Mở file
  const openFile = (file) => {
    const path = file.url || file.path || `/uploads/${file.name}`;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    window.open(`${API_URL}${normalized}`, "_blank");
  };

  // Tạo link chia sẻ
const handleShareFile = async (file) => {
  try {
    const res = await fileApi.share(file._id);

    if (res.data.success) {
      const link = res.data.shareUrl; // link đã sửa backend
      setShareLink(link);
      setCurrentFile(file);

      const modal = new Modal(shareModalRef.current);
      modal.show();
    } else {
      alert("Không tạo được link chia sẻ");
    }
  } catch (err) {
    console.error("Lỗi khi tạo link chia sẻ:", err.response?.data || err.message);
    alert("Lỗi khi tạo link chia sẻ");
  }
};

  // Copy link
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Đã sao chép link chia sẻ!");
  };

  if (loading) return <h2>Đang tải dữ liệu...</h2>;
  if (!folder) return <h2>Không tìm thấy thư mục</h2>;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{fontSize: "2rem", display: "flex", flexDirection: "row", marginBottom: "1rem",justifyContent:"space-between"}}>
        <div style={{display:"flex",flexDirection:"row"}}>
          <div onClick={() => navigate(`/`)} style={{ marginRight: "10px", cursor: "pointer" }}>Drive của tôi</div>
          <div>&gt; {folder.name}</div>
        </div>
        {/* Toggle view */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
          <button onClick={() => setViewMode("grid")} className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}>
            <i className="bi bi-grid"></i>
          </button>
          <button onClick={() => setViewMode("list")} className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} style={{ marginLeft: "10px" }}>
            <i className="bi bi-list"></i>
          </button>
        </div>
      </div>



      {/* File list */}
      {files.length === 0 ? (
        <p>Không có file nào trong thư mục này.</p>
      ) : viewMode === "grid" ? (
        <div className="all_folder">
          {files.map(f => (
            <FileItem
              key={f._id}
              file={f}
              onClick={() => openFile(f)}
              onShare={() => handleShareFile(f)}
            />
          ))}
        </div>
      ) : (
        <div className="list_folder">
          {files.map(f => (
            <div key={f._id} style={{ marginBottom: "5px"}}>
              <FileItem
                file={f}
                onClick={() => openFile(f)}
                onShare={() => handleShareFile(f)}
                listView
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal chia sẻ */}
      <div className="modal fade" ref={shareModalRef} tabIndex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="shareModalLabel">Chia sẻ file: {currentFile?.name}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-control" value={shareLink} readOnly />
              <small className="text-muted">Sao chép link và gửi cho người khác để họ có thể mở file.</small>
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
