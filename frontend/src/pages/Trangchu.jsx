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
        <div className="tittle-path">Recently opened</div>
        
        {recentfiles.length === 0 ? (
          <p>Khong co tep mo gan day</p>
        ) : (
          <div className="recent_grid">
            {recentfiles.map((file) => (
              <div key={file._id} className="recent_item">
                <i class="bi bi-folder-fill" style={{fontSize: "30px"}} ></i>
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
        <div className="tittle-path">All file</div>

        <div className="all_folder">
          {folders.length === 0 ? (
            <p>Không có thư mục nào</p>
          ) : (
            folders.map(folder => (
              <div key={folder._id} className="file" onClick={() => navigate(`/folder/${folder._id}`)}>
                <i class="bi bi-folder-fill" style={{fontSize: "30px"}} ></i>
                <div style={{marginLeft: "5px"}}>{folder.name}</div>
              </div>
            ))
          )}
        </div>




      </div>

    </div>
  );
}
