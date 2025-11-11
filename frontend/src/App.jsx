import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import Trangchu from "./pages/Trangchu";
import Header from "./components/Header";
import FolderPage from "./pages/Folder"
import Workspace from "./pages/Workspace";
import SharePage from "./components/SharePage";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
// import Footer from "./components/Footer";
import 'bootstrap-icons/font/bootstrap-icons.css';
function App() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios
      .get("/api/v1/files") // API lấy dữ liệu file
      .then((res) => setFiles(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
      <Router>
          <div className="d-flex">
        <Header />

        {/* Nội dung chính */}
        <div
          className="flex-grow-1 p-4"
          style={{
            marginLeft: "250px", // cùng chiều rộng với sidebar
            backgroundColor: "#FFFFFF",
            minHeight: "100vh",
          }}
        >
          <div className="container">
            <Routes>
              {/* Trang chu */}
              <Route path="/" element={<Trangchu files={files} />} />
              {/* Trang Folder */}
              <Route path="/folder/:id" element={<FolderPage />} />
              <Route path="/workspaces/:id" element={<Workspace />} />
              <Route path="/workspaces" element={<Workspace />} />
              <Route path="/share/:token" element={<SharePage />} />
            </Routes>
          </div>
        </div>

        {/* Footer (tuỳ chọn)
        <Footer /> */}
      </div>
      </Router>
    
  );
}

export default App;
