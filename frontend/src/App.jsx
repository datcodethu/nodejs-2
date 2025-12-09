import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import Pages & Components
import Login from "./pages/Login";
import Header from "./components/Header";
import FolderPage from "./pages/Folder";
import Workspace from "./pages/Workspace";
import FileDetail from "./components/fileDetail";
import FileList from "./components/fileList";
import FileForm from "./components/fileForm";
import FileUploadForm from "./components/fileUploadForm";
import FolderForm from "./components/folderForm";
import SharePage from "./components/SharePage";

// Styles
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  // 1. KHỞI TẠO: Kiểm tra token ngay lập tức (!! chuyển đổi giá trị sang boolean true/false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // 2. HÀM LOGIN: Được gọi từ trang Login sau khi API trả về thành công
  const handleLogin = (token) => {
    // Nếu API login của bạn trả về token thì lưu vào đây, nếu không thì chỉ cần setAuth
    if (token) localStorage.setItem("token", token); 
    setIsAuthenticated(true);
  };

  // 3. HÀM LOGOUT: Truyền xuống Header
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // 4. Helper Component để bảo vệ các Route (giúp code bên dưới ngắn gọn)
  const Protected = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      {/* Chỉ hiện Header khi đã đăng nhập */}
      {isAuthenticated && <Header onLogout={handleLogout} />}

      <div className={isAuthenticated ? "d-flex" : ""}>
        {/* Layout Content chính */}
        <div
          className={isAuthenticated ? "flex-grow-1 p-4" : "w-100"}
          style={isAuthenticated ? { marginLeft: "250px", backgroundColor: "#FFFFFF", minHeight: "100vh" } : {}}
        >
          <div className={isAuthenticated ? "container" : ""}>
            <Routes>
              {/* --- ROUTE LOGIN --- */}
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={handleLogin} />} 
              />

              {/* --- ROUTE SHARE (PUBLIC) --- */}
              <Route path="/share/:token" element={<SharePage />} />

              {/* --- CÁC ROUTE CẦN ĐĂNG NHẬP (Dùng wrapper Protected cho gọn) --- */}
              <Route path="/" element={<Protected><FileList /></Protected>} />
              <Route path="/add" element={<Protected><FileUploadForm /></Protected>} />
              <Route path="/edit/:id" element={<Protected><FileForm /></Protected>} />
              <Route path="/details/:id" element={<Protected><FileDetail /></Protected>} />
              <Route path="/add-folder" element={<Protected><FolderForm /></Protected>} />
              <Route path="/folder/:id" element={<Protected><FolderPage /></Protected>} />
              <Route path="/workspaces/:id" element={<Protected><Workspace /></Protected>} />
              <Route path="/workspaces" element={<Protected><Workspace /></Protected>} />
              <Route path="/admin" element={<Protected><Navigate to="/" /></Protected>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;