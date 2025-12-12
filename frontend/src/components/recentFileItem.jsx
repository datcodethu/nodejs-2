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
  const getFileColor = (type) => {
    switch (type) {
      case "document": return "#1E90FF";   // xanh dương
      case "image": return "#008000";      // cam
      case "video": return "#E72A2A";      // đỏ cam
      case "audio": return "#800080";      // tím
      case "spreadsheet": return "#FFA500"; // xanh lá
      default: return "#808080";           // xám
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <i className={getFileIcon(file.fileType)} style={{ fontSize: "1.5rem",color: getFileColor(file.fileType) }}></i>
      <span>{file.name}</span>
    </div>
  );
}