import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FolderPage() {
  const { id } = useParams(); // lấy ID từ URL
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const folderRes = await axios.get(`/api/v1/folders/${id}`);
        setFolder(folderRes.data);

        const filesRes = await axios.get(`/api/v1/folders/${id}/files`);
        setFiles(filesRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu folder:", err);
      }
    };

    fetchFolder(); 
  }, [id]);

  const handleOpenFile = async (file) => {
  try {
    // Gửi thông tin file vừa mở lên server để lưu vào RecentlyOpened
    await axios.post('/api/v1/recently-opened', {
      userId: "68fcca6cf8eb17ab26fb6b1f",
      NameId: file._id,
      name: file.name,
      path: `/folders/${id}/files/${file._id}`,
    });

    console.log("Đã ghi lại file mở gần đây:", file.name);
  } catch (err) {
    console.error("Lỗi khi ghi lại RecentlyOpened:", err);
  }
};

  if (!folder) return <h2>Đang tải...</h2>;

  return (
    <div>
      <h1>📁 {folder.name}</h1>
      <p>ID: {folder.id}</p>

      <h2>📄 Danh sách file:</h2>
      {files.length === 0 ? (
        <p>Không có file nào trong thư mục này.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <div key={file._id} className="file" onClick={() => handleOpenFile(file)} style={{ cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    className="bi bi-folder-fill" viewBox="0 0 16 16">
                  <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                </svg>
                <div>{file.name}</div>
              </div>
          ))}
        </ul>
      )}
    </div>
  );
}
