import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import authService from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra user từ memory (authService)
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
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
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage setUser={setUser} /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
