
export default function FolderItem({ folder, onClick, listView }) {
  if (listView) {
    // ===== List view =====
    return (
      <div className="file-list" onClick={onClick}>
        <div className="file-content">
          <i className="bi bi-folder-fill file-icon" style={{ fontSize: "35px", color: "#497FFF" }}></i>
          <div className="file-name">{folder.name}</div>
        </div>
      </div>
    );
  }

  // ===== Grid view =====
  return (
    <div className="file-grid" onClick={onClick}>
      <i className="bi bi-folder-fill file-icon" style={{ fontSize: "35px", color: "#497FFF" }}></i>
      <div className="file-name">{folder.name}</div>
    </div>
  );
}

