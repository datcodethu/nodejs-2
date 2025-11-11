import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap"; // import Modal từ Bootstrap

export default function FolderPage() {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const shareModalRef = useRef(null);

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const folderRes = await axios.get(`/api/v1/folders/${id}`);
        setFolder(folderRes.data);

        const filesRes = await axios.get(`/api/v1/folders/${id}/files`);
        setFiles(filesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFolder();
  }, [id]);

  // Click ra ngoài dropdown sẽ đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show modal khi currentFile thay đổi
  useEffect(() => {
    if (currentFile && shareModalRef.current) {
      const modal = new Modal(shareModalRef.current);
      modal.show();
    }
  }, [currentFile]);

  const handleOpenFile = async (file) => {
    if (!file.name) return alert("Không tìm thấy file");
    try {
      await axios.post('/api/v1/recently-opened', {
        userId: "68fcca6cf8eb17ab26fb6b1f",
        NameId: file._id,
        name: file.name,
        path: `/folders/${id}/files/${file._id}`,
      });
    } catch (err) {
      console.error(err);
    }
    window.open(`http://localhost:3000/uploads/${file.name}`, "_blank");
  };

  const handleShareFile = async (file) => {
    try {
      const res = await axios.post(`http://localhost:3000/api/v1/files/share/${file._id}`);
      if (res.data.success) {
        setShareLink(res.data.shareUrl);
        setCurrentFile(file); // useEffect sẽ show modal
      } else {
        alert("Không tạo được link chia sẻ");
      }
    } catch (err) {
      console.error("Lỗi axios:", err.response?.data || err.message);
      alert("Lỗi khi tạo link chia sẻ");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Đã sao chép link chia sẻ!");
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "document": return "bi bi-file-earmark-text";
      case "image": return "bi bi-file-earmark-image";
      case "video": return "bi bi-file-earmark-play";
      case "audio": return "bi bi-file-earmark-music";
      case "spreadsheet": return "bi bi-file-earmark-excel";
      default: return "bi bi-file-earmark";
    }
  };

  if (!folder) return <h2>Đang tải...</h2>;

  return (
    <div>
      <div style={{fontSize: "2rem", display: "flex", flexDirection: "row"}}>
        <div onClick={() => navigate(`/`)} style={{ marginRight: "10px", cursor: "pointer" }}>Drive của tôi</div>
        <div> &gt; {folder.name}</div>
      </div>

      {files.length === 0 ? (
        <p>Không có file nào trong thư mục này.</p>
      ) : (
        <ul className="recent_grid">
          {files.map(file => (
          <div key={file._id} className="folder-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px", borderBottom: "1px solid #ddd" }}>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => handleOpenFile(file)}>
              <i className={getFileIcon(file.fileType)} style={{ fontSize: '1.5rem', marginRight: '8px' }}></i>
              <div>{file.name}</div>
            </div>

            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === file._id ? null : file._id);
                }}
                className="ba_cham"
              >
                ⋮
              </button>

              {menuOpenId === file._id && (
                <ul className="chia_se_file">
                  <li style={{ padding: "8px 12px", cursor: "pointer" }} onClick={() => handleShareFile(file)}>Chia sẻ file</li>
                </ul>
              )}
            </div>
          </div>
        ))}

        </ul>
      )}

      {/* Modal chia sẻ file */}
      <div className="modal fade" id="shareModal" ref={shareModalRef} tabIndex="-1" aria-labelledby="shareModalLabel" aria-hidden="true">
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
