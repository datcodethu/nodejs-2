import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Trangchu() {
  const [data, setData] = useState(null);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentfiles, SetRencentFiles] = useState([])
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      setError(null); 
      setIsLoading(true);
      try {
        try {
          //lay du lieu
          const overviewRes = await axios.get("/api/v1/dashboard/overview");
          setData(overviewRes.data);
          console.log("Dữ liệu tổng quan nhận được:", overviewRes.data);
        }catch (err) {
          console.error("LỖI KHI TẢI DỮ LIỆU TỔNG QUAN /api/v1/dashboard/overview:", err);
        }
        //lay thu muc
        const foldersRes = await axios.get("/api/v1/folders");
        console.log("Dữ liệu folders nhận được từ API:", foldersRes.data);
        
        const receivedData = foldersRes.data;
        let folderList = [];
        
        if (Array.isArray(receivedData)) {
            folderList = receivedData;
        } else if (receivedData && (receivedData.data || receivedData.folders)) {
             // Xử lý dữ liệu bọc trong object
            folderList = receivedData.data || receivedData.folders;
        }

        if (Array.isArray(folderList)) {
            // !!! BƯỚC QUAN TRỌNG ĐÃ THÊM: Cập nhật state folders !!!
            setFolders(folderList); 
        } else {

            setError("Lỗi cấu trúc dữ liệu: API folders không trả về mảng hợp lệ.")
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Lỗi kết nối hoặc API folders không tồn tại (Lỗi 404). Vui lòng kiểm tra Backend.");
      } finally {
        setIsLoading(false);
      }
    };

    //Recently Opened
    fetch("http://localhost:3000/api/v1/recently-opened")
      .then(res => res.json())
      .then(data => SetRencentFiles(data) )
      .catch(err => console.error("LỖI recently Opened",err))


    fetchData();
  }, []);




  if (isLoading) return (
    <h1>Dang tai du lieu</h1>
  )


  return (
    <div>

      <div className="recently_opened">
        <h1>Recenttly opened</h1>
        
        {recentfiles.length === 0 ? (
          <p>Khong co tep mo gan day</p>
        ) : (
          <div className="recent_grid">
            {recentfiles.map((file) => (
              <div key={file._id} className="recent_item">
                <div className="recent_icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-folder-fill" viewBox="0 0 16 16">
                    <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                  </svg>
                </div>
                <div className="recent_info">
                  <div className="recent_name">{file.name}</div>
                  <small className="text_muted">
                    {new Date(file.lastOpened).toLocaleString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}




      </div>
      
      
      
      
      
      
      
      
      <div>
        <h1>All file</h1>

        <div className="all_folder">
          {folders.length === 0 ? (
            <p>Không có thư mục nào</p>
          ) : (
            folders.map(folder => (
              <div key={folder._id} className="file" onClick={() => navigate(`/folder/${folder._id}`)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    className="bi bi-folder-fill" viewBox="0 0 16 16">
                  <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                </svg>
                <div>{folder.name}</div>
              </div>
            ))
          )}
        </div>




      </div>

    </div>
  );
}
