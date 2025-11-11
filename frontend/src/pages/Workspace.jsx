// pages/Workspace.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Workspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const res = await fetch("/api/v1/workspaces/", { cache: "no-store" });
        const data = await res.json();

        // Lấy chi tiết folder cho mỗi workspace
        const detailedWorkspaces = await Promise.all(
          data.map(async (ws) => {
            // Lấy folders chi tiết
            let folders = [];
            if (ws.folders?.length > 0) {
              folders = await Promise.all(
                ws.folders.map(async (fid) => {
                  const fRes = await fetch(`http://localhost:3000/api/v1/folders/${fid}`);
                  return await fRes.json();
                })
              );
            }

            // Lấy files chi tiết
            let files = [];
            if (ws.files?.length > 0) {
              files = await Promise.all(
                ws.files.map(async (fid) => {
                  const fRes = await fetch(`http://localhost:3000/api/v1/files/${fid}`);
                  return await fRes.json();
                })
              );
            }

            return { ...ws, folders, files };
          })
        );

        setWorkspaces(detailedWorkspaces);
        console.log("Workspaces raw:", data);

      } catch (err) {
        console.error("Lỗi tải workspace:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, []);

  if (loading) return <p>Đang tải workspace...</p>;
  if (!workspaces.length) return <p>Không có workspace nào.</p>;

  return (
    <div className="ws_grid">
      {workspaces.map((workspace) => (
        <div key={workspace._id} className="mb-5 ws_item p-2 " >
          <h2><i className="bi bi-person-workspace me-2"></i>{workspace.name}</h2>
          
          <div className="row g-2">
            {workspace.folders?.length > 0 ? (
              workspace.folders.map((f) => (
                <div key={f._id} className="col-4 " style={{backgroundColor: "#F6F9FF"}}>
                  <div className="border p-2 rounded" onClick={() => navigate(`/folder/${f._id}`)}   style={{ cursor: "pointer" }}><i class="bi bi-folder-fill p-2" style={{fontSize: "20px"}} ></i>{f.name}</div>
                </div>
              ))
            ) : (
              <p>Không có thư mục nào.</p>
            )}

            {workspace.files?.length > 0 && workspace.files.map(file => (
              <div key={file._id} className="col-4 border p-2 rounded" style={{ backgroundColor: "#F6F9FF" }}>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {window.open(`http://localhost:3000/uploads/${file.name}`, "_blank");}}
                >
                  {file.name}
                </div>
              </div>
            ))}
          </div>


        </div>
      ))}
    </div>
  );
}
``
export default Workspace;
