import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import axiosClient from "../utils/axiosClient";
import { jwtDecode } from "jwt-decode";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      console.log("Response data:", response.data);

      // Lấy token đúng cấu trúc
      const responseBody = response.data; 
      const token = responseBody.data?.accessToken;
      const refreshToken = responseBody.data?.refreshToken;

      if (!token) {
        throw new Error("Không tìm thấy accessToken hợp lệ từ Server");
      }

      // Lưu token
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      const user = responseBody.data?.user; 
      if (user && user._id) {
        localStorage.setItem("userId", user._id);
        console.log("✅ Đã lưu userId:", user._id);
      }

      // --- SỬA LẠI ĐOẠN DECODE VÀ ĐIỀU HƯỚNG ---
      let decoded; // 1. Khai báo biến ở ngoài để dùng được ở dưới
      try {
        decoded = jwtDecode(token);
        console.log("Role:", decoded.role);
      } catch (e) {
        console.error("Lỗi decode token:", e);
      }

      // Cập nhật state cho App
      if (onLoginSuccess) {
        onLoginSuccess(token);
      }

      // 2. Kiểm tra Role an toàn (dùng ?. để tránh lỗi nếu decode thất bại)
      if (decoded.role === "admin") {
        console.log("Đăng nhập thành công với vai trò Admin, chuyển hướng về trang quản trị");
        navigate("/admin");
      } else {
        console.log("Đăng nhập thành công, chuyển hướng về trang chủ");
        navigate("/");
      }
      // ------------------------------------------

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Đăng nhập</h1>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center mt-3">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;