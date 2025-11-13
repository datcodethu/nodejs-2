export default function FileItem({ file, onClick, onShare, listView }) {
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

  if(listView) {
    // ===== List view =====
    return (
      <div
        className="folder-item"
        onClick={() => onClick(file)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <i className={getFileIcon(file.fileType)} style={{ fontSize: "1.5rem" }}></i>
          <div>{file.name}</div>
        </div>
        {onShare && (
          <button
            onClick={(e) => { e.stopPropagation(); onShare(file); }}
            className="ba_cham"
            style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
          >⋮</button>
        )}
      </div>
    )
  }

  // ===== Grid view =====
  return (
    <div
      className="folder-item"
      onClick={() => onClick(file)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "15px",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <i className={getFileIcon(file.fileType)} style={{ fontSize: "2rem", marginBottom: "10px" }}></i>
      <div style={{ textAlign: "center" }}>{file.name}</div>
      {onShare && (
        <button
          onClick={(e) => { e.stopPropagation(); onShare(file); }}
          className="ba_cham"
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer"
          }}
        >⋮</button>
      )}
    </div>
  );
}
