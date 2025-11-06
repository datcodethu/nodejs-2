// components/WorkspacesDropdown.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function WorkspacesDropdown() {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    fetch("/api/v1/workspaces")
      .then((res) => res.json())
      .then((data) => setWorkspaces(data))
      .catch((err) => console.error("Lỗi tải workspaces:", err));
  }, []);

  return (
    <div>
      <h6>📂 Danh sách Workspace</h6>
      {workspaces.length > 0 ? (
        <ul className="list-unstyled">
          {workspaces.map((ws) => (
            <li key={ws._id}>
              <Link to={`/workspaces/${ws._id}`} className="text-decoration-none">
                {ws.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có workspace nào.</p>
      )}
    </div>
  );
}

export default WorkspacesDropdown;
