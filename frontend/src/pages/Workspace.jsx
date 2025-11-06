// pages/Workspace.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Workspace() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log("🔍 Workspace ID từ URL:", id);

  fetch(`/api/v1/workspaces/${id}`, { cache: "no-store" })
    .then((res) => {
      console.log("🧾 Status:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("📦 Dữ liệu workspace nhận được:", data);
      setWorkspace(data);
    })
    .catch((err) => console.error("❌ Lỗi tải workspace:", err))
    .finally(() => setLoading(false));
}, [id]);


  if (loading) return <p>Đang tải workspace...</p>;
  if (!workspace) return <p>Không tìm thấy workspace.</p>;

  return (
    <div>
      <h2>📦 Workspace: {workspace.name}</h2>

      <h4 className="mt-4">📁 Folders</h4>
      {workspace.folders?.length > 0 ? (
        <ul>
          {workspace.folders.map((f) => (
            <li key={f._id}>{f.name}</li>
          ))}
        </ul>
      ) : (
        <p>Không có thư mục nào.</p>
      )}

      <h4 className="mt-4">📄 Files</h4>
      {workspace.files?.length > 0 ? (
        <ul>
          {workspace.files.map((file) => (
            <li key={file._id}>
              {file.name} ({file.filetype})
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có tệp nào.</p>
      )}
    </div>
  );
}

export default Workspace;
