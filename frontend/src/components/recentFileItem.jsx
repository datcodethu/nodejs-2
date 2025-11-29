export default function RecentFile({ file }) {
  const getFileIcon = (type) => {
    switch(type){
      case "document": return "bi bi-file-earmark-text";
      case "image": return "bi bi-file-earmark-image";
      case "video": return "bi bi-file-earmark-play";
      case "audio": return "bi bi-file-earmark-music";
      case "spreadsheet": return "bi bi-file-earmark-excel";
      default: return "bi bi-file-earmark";
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <i className={getFileIcon(file.fileType)} style={{ fontSize: "1.5rem" }}></i>
      <span>{file.name}</span>
    </div>
  );
}
