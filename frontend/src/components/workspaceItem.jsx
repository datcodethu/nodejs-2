// components/WorkspaceItem.jsx
import React from "react";
import FolderItem from "./folderItem";
import FileItem from "./fileItem";
import { useNavigate } from "react-router-dom";

export default function WorkspaceItem({ workspace, apiUrl }) {
  const navigate = useNavigate();

  const openFile = (file) => {
    const fileUrl = file.url || file.path;
    const normalized = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
    window.open(`${apiUrl}${normalized}`, "_blank");
  };

  return (
    <div className="mb-5 ws_item p-2">
      <h2>
        <i className="bi bi-person-workspace me-2"></i>
        {workspace.name}
      </h2>

      <div className="row g-2">
        {workspace.folders?.map(folder => (
          <div key={folder._id} className="col-4">
            <FolderItem folder={folder} onClick={() => navigate(`/folder/${folder._id}`)} />
          </div>
        ))}

        {workspace.files?.map(file => (
          <div key={file._id} className="col-4">
            <FileItem file={file} onClick={() => openFile(file)} />
          </div>
        ))}
      </div>
    </div>
  );
}
