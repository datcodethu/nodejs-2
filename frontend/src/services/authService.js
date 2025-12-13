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
        
        console.log('[authService] Login response:', response.data);
        
        if (response.data.success && response.data.data?.accessToken) {
            const token = response.data.data.accessToken;
            // Lớp 1: Lưu token vào RAM (Hẹn giờ refresh tự động)
            setAccessToken(response.data.data.accessToken);
            
            // Lưu user info (có thể lưu vào sessionStorage nếu cần)
            currentUser = {
                _id: response.data.data._id,
                email: response.data.data.email
            };
        }
        return {
            success: true,
            role: currentUser?.role, // Trả role ra ngoài
            user: currentUser
        };
    } catch (error) {
        console.error('[authService] Login error:', error);
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
