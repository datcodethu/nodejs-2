// pages/Workspace.jsx
import React, { useEffect, useState } from "react";
import { workspaceApi } from "../services/workspaceApi";
import { folderApi } from "../services/folderApi";
import { fileApi } from "../services/fileApi";
import WorkspaceItem from "../components/workspaceItem";

function Workspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const data = await workspaceApi.getAll();
      console.log("Workspaces raw:", data); // <-- kiểm tra dữ liệu
        const detailedWorkspaces = await Promise.all(
          data.map(async (ws) => {
            const folders = ws.folders?.length
              ? await Promise.all(ws.folders.map(fid => folderApi.getById(fid).then(r => r.data)))
              : [];
            const files = ws.files?.length
              ? await Promise.all(ws.files.map(fid => fileApi.getById(fid).then(r => r.data)))
              : [];
            return { ...ws, folders, files };
          })
        );

        setWorkspaces(detailedWorkspaces);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, []);

  if (loading) return <p>Đang tải workspace...</p>;
  if (!workspaces.length) return <p>Không có workspace nào.</p>;

  return (
    <div className="ws_grid">
      {workspaces.map(ws => (
        <WorkspaceItem key={ws._id} workspace={ws} apiUrl={API_URL} />
      ))}
    </div>
  );
}

export default Workspace;
