import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SharePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);

useEffect(() => {
  axios.get(`http://localhost:3000/api/v1/files/share/token/${token}`)
    .then(res => {
      if (res.data.success && res.data.file) {
        const file = res.data.file;
        window.location.href = `http://localhost:3000/uploads/${file.name}`;
      } else {
        alert(res.data.message || "File không tồn tại hoặc không công khai");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Lỗi khi tải file chia sẻ");
    })
    .finally(() => setLoading(false));
}, [token]);


  return (
    <div style={{ padding: "20px" }}>
      <h2>Đang tải file...</h2>
    </div>
  );
}