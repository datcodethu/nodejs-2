import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
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
import './App.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import authService from './services/authService';


function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Kiểm tra user từ memory (authService)
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);

    axios
    .get("/api/v1/files") // API lấy dữ liệu file
    .then((res) => setFiles(res.data))
    .catch((err) => console.error(err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {user && <Header />}

      {/* Main content area */}
      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft: user ? "250px" : "0", // Only add margin when Header is shown
          backgroundColor: "#FFFFFF",
          minHeight: "100vh",
        }}
      >
        <div className={user ? "container" : ""}>
          <Routes>
            {/* Trang chu */}
            <Route path="/" element={user ? <Trangchu files={files} /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <RegisterPage setUser={setUser} /> : <Navigate to="/" />} />
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
    </>
  );
}

export default App;
