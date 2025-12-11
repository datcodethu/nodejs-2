import { useEffect, useState , useRef} from "react";
import axiosClient  from "../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";

import { folderApi } from "../services/folderApi";
import { fileApi } from "../services/fileApi";
import { recentApi } from "../services/recentApi";
import FolderItem from "../components/folderItem";
import FileItem from "../components/fileItem";
import RecentFile from "../components/recentFileItem";



export default function Trangchu() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [recentFiles, setRecentFiles] = useState([]);

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  // Chia sẻ
  const [currentFile, setCurrentFile] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const shareModalRef = useRef(null);

  useEffect(() => {
    
    async function loadData() {
      try{
        const [folderRes, fileRes, recentRes] = await Promise.all([
          folderApi.getAll(),
          fileApi.getAll(),
          recentApi.getAll(),
        ]);
        setFolders(folderRes.data);
        setFiles(fileRes.data);
        setRecentFiles(recentRes.data.filter(f => f.path?.startsWith("/uploads")));
      } catch (err) {
        console.error("Lỗi tải dữ liệu",err)
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openFile = (file) => {
    const fileUrl = file.url || file.path
    const normalized = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
    window.open(`${API_URL}${normalized}`,"_blank")
  }


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

  return (
    <div>

      
      {/* --- Recently opened --- */}
      <div className="recently_opened">
        <div className="tittle-path" style={{ fontWeight: "500" }}>
          Recently opened
        </div>
        {recentFiles.length === 0 ? (
          <p>Không có tệp mở gần đây</p>
        ) : (
          <div className="recent_grid">
            {recentFiles.map((f) => (
              <div className="recent_item" key={f._id} onClick={() => openFile(f)}>
                <RecentFile file={f} />
              </div>
            ))}
          </div>
        )}
      </div>


      <div>
        <div className="tittle-path">
          <div style={{fontWeight: "500"}}>All files</div>
            <div style={{ marginBottom: "10px"}}>
              <button 
                onClick={() => setViewMode("grid")} 
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              >
                <i className="bi bi-grid"></i>
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                style={{ marginLeft: "10px" }}
              >
                <i className="bi bi-list"></i>
              </button>
            </div>
        </div>

        <div>
          {folders.length === 0 && files.length === 0 ? (
            <p>Không có thư mục hoặc tệp nào.</p>
          ) : viewMode === "grid" ? (
            <div className="all_folder">
              {folders.map((f) => (
                <FolderItem
                  key={f._id}
                  folder={f}
                  onClick={() => navigate(`/folder/${f._id}`)}
                />
              ))}
              {files
                .filter((f) => !f.folder)
                .map((f) => (
                    <FileItem key={f._id} file={f} onClick={openFile} onShare={() => handleShareFile(f)} />
                ))}
            </div>
          ) : (
            <div className="list_folder">
              {folders.map((f) => (
                <FolderItem
                  key={f._id}
                  folder={f}
                  onClick={() => navigate(`/folder/${f._id}`)}
                  listView={viewMode === "list"}
                />
              ))}
              {files
                .filter((f) => !f.folder)
                .map((f) => (
                <FileItem key={f._id} file={f} onClick={openFile}onShare={() => handleShareFile(f)}  listView={viewMode === "list"}/>
                ))}
            </div>
          )}
        </div>
      </div>
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
