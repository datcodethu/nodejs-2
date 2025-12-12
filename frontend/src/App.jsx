import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom"; 
import axios from "axios";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Components
import Header from "./components/Header";
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SharePage from "./components/SharePage";
import Trangchu from "./pages/Trangchu";
import FolderPage from "./pages/Folder";
import Workspace from "./pages/Workspace";

// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import FileManagement from './components/admin/FileManagement';
import AdminLayout from "./components/admin/AdminLayout";

// Service
import authService from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);

    if (currentUser) {
        axios
        .get("/api/v1/files") 
        .then((res) => setFiles(res.data))
        .catch((err) => console.error(err));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage setUser={setUser} /> : <Navigate to="/" />} />
      <Route path="/share/:token" element={<SharePage />} />

      <Route path="/admin" element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/" />}>
          <Route index element={<AdminDashboard />} /> 
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="files" element={<FileManagement />} />
      </Route>

      <Route element={
          user ? (
              <>
                  <Header />
                  <div className="flex-grow-1 p-4" style={{ marginLeft: "250px", backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
                      <div className="container">
                          <Outlet /> 
                      </div>
                  </div>
              </>
          ) : <Navigate to="/login" />
      }>
          <Route path="/" element={<Trangchu files={files} />} />
          <Route path="/folder/:id" element={<FolderPage />} />
          <Route path="/workspaces/:id" element={<Workspace />} />
          <Route path="/workspaces" element={<Workspace />} />
      </Route>
    </Routes>
  );
}

export default App;