import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Trangchu() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [recentfiles, setRecentFiles] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchFolders = async () => {
      setError(null); 
      setIsLoading(true);
      try {
        //lay thu muc
        const foldersRes = await axios.get("/api/v1/folders");
        const receivedData = foldersRes.data;
        let folderList = [];
        if (Array.isArray(receivedData)) {
            folderList = receivedData;
        } else if (receivedData && (receivedData.data || receivedData.folders)) {
            folderList = receivedData.data || receivedData.folders;
        }

        if (Array.isArray(folderList)) {
            setFolders(folderList); 
        } else {
            setError("Lỗi cấu trúc dữ liệu: API folders không trả về mảng hợp lệ.")
        }

        //lay file
        const fileRes = await axios.get("/api/v1/files");
        setFiles(fileRes.data)


      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Lỗi kết nối hoặc API folders không tồn tại (Lỗi 404). Vui lòng kiểm tra Backend.");
      } finally {
        setIsLoading(false);
      }
      
    };

    //Recently Opened
    const fetchRecentFiles = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/recently-opened");
        const data = await res.json();

        // Chỉ lấy file có path hợp lệ (bắt đầu bằng /uploads)
        const filteredData = data.filter(file => file.path?.startsWith("/uploads"));
        setRecentFiles(filteredData);
      } catch (err) {
        console.error("Lỗi recently opened:", err);
      }
    };

    Promise.all([fetchFolders(), fetchRecentFiles()]).finally(() => setIsLoading(false));
  }, []);

  const renderFolders = () => {
  if (viewMode === "grid") {
    return (
      <div className="all_folder">
        {folders.map(folder => (
          <div 
            key={folder._id} 
            onClick={() => navigate(`/folder/${folder._id}`)}
            className="folder-item"
          >
            <i className="bi bi-folder-fill" 
              style={{ fontSize: "35px", color: "#497FFF", marginBottom: "10px" }}></i>
            <div>{folder.name}</div>
          </div>
        ))}

        {files
        .filter(f => !f.folder)
        .map(file =>(
          <div
            key={file._id}
            onClick={() => window.open(`http://localhost:3000${file.url}`, "_blank")}
            className="folder-item"
          >
            <i
              className={getFileIcon(file.fileType)}
              style={{ fontSize: "1.5rem" }}
            ></i>
            <div>{file.name}</div>
          </div>
        ))}

      </div>
    );
  } else { // list view
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {folders.map(folder => (
          <div 
            key={folder._id} 
            onClick={() => navigate(`/folder/${folder._id}`)}
            className="folder-item"
            style={{ display: "flex", alignItems: "center" }} // list kiểu flex
          >
            <i className="bi bi-folder-fill" 
              style={{ fontSize: "25px", color: "#497FFF", marginRight: "10px" }}></i>
            <div>{folder.name}</div>
          </div>
        ))}

        {files
        .filter(f => !f.folder)
        .map(file =>(
          <div
            key={file._id}
            onClick={() => window.open(`http://localhost:3000${file.url}`, "_blank")}
            className="folder-item"
            style={{ display: "flex", alignItems: "center" }}
          >
            <i
              className={getFileIcon(file.fileType)}
              style={{ fontSize: "1.5rem",marginRight: "10px" }}
            ></i>
            <div>{file.name}</div>
          </div>
        ))}
      </div>
    );
  }
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

  if (isLoading) return (
    <h1>Dang tai du lieu</h1>
  )


  return (
    <div>

      <div className="recently_opened">
        <div className="tittle-path" style={{fontWeight: "500"}}>Recently opened</div>
        
        {recentfiles.length === 0 ? (
          <p>Khong co tep mo gan day</p>
        ) : (
          <div className="recent_grid">
            {recentfiles.map((file) => (
              
              <div
                key={file._id}
                className="recent_item"
                onClick={() => {
                  const fileUrl = `http://localhost:3000${file.path}`;
                  window.open(fileUrl, "_blank");
                }}
                style={{ backgroundColor: "#F6F9FF" }}
              >
                <div className="recent_info">
                  <i className={getFileIcon(file.fileType)} style={{ fontSize: '1.5rem', marginRight: '8px' }}></i>
                  <div className="recent_name p-1">{file.name}</div>
                  <small className="text_muted">
                    {/* {new Date(file.lastOpened).toLocaleString()} */}
                  </small>
                </div>
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

        <div >
          {folders.length === 0 ? (
            <p>Không có thư mục nào</p>
          ) : (
            renderFolders()
          )}
        </div>




      </div>

    </div>
  );
}
