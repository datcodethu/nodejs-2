import axiosClient, { setAccessToken, handleLogout } from '../utils/axiosClient';
import {jwtDecode} from "jwt-decode";
const API_URL = '/auth';

// Lưu trữ user info tạm thời (Khác với accessToken - không lưu sensitive data vào localStorage)
let currentUser = null;

const register = async (email, password) => {
    try {
        const response = await axiosClient.post(`${API_URL}/register`, {
            email,
            password,
        });
        
        if (response.data.success && response.data.data?.accessToken) {
            // Lớp 1: Lưu token vào RAM (Hẹn giờ refresh tự động)
            setAccessToken(response.data.data.accessToken);
            
            // Lưu user info (có thể lưu vào sessionStorage nếu cần, tránh XSS)
            currentUser = {
                _id: response.data.data.user._id,
                email: response.data.data.user.email
            };
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Registration failed' };
    }
};

const login = async (email, password) => {
    try {
        const response = await axiosClient.post(`${API_URL}/login`, {
            email,
            password,
        });
        
        if (response.data.success && response.data.data?.accessToken) {
            const token = response.data.data.accessToken;
            // Lớp 1: Lưu token vào RAM (Hẹn giờ refresh tự động)
            setAccessToken(token);
            const decoded = jwtDecode(token);
            console.log('Decoded JWT:', decoded);
            console.log(decoded.role)
            // Lưu user info (có thể lưu vào sessionStorage nếu cần)
            currentUser = {
                _id: decoded.sub || decoded._id, // Ưu tiên lấy sub theo chuẩn JWT
                email: decoded.email, // Có thể undefined nếu token không chứa email, nhưng role quan trọng hơn
                role: decoded.role    // Lấy role admin
            };
            console.log('Current User after login:', currentUser);
        }
        return {
            success: true,
            role: currentUser?.role, // Trả role ra ngoài
            user: currentUser
        };
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Login failed' };
    }
};

const logout = () => {
    // Xóa token từ RAM và clear timer
    currentUser = null;
    handleLogout(); // Xóa token và redirect /login
};

const getCurrentUser = () => currentUser;

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;
