import axios from "axios"
import { jwtDecode } from "jwt-decode";

const REFRESH_ENDPOINT = '/auth/refresh-token';
const BUFFER_TIME = 60 * 1000;

let accessToken = null;
let refreshTimer = null;   
let isRefreshing = false;  
let failedQueue = [];

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api/v1",

    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
})

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const scheduleRefreshToken = (token) => {
    // 1. Xóa timer cũ nếu có để tránh chạy chồng chéo
    if (refreshTimer) {
        clearTimeout(refreshTimer);
    }

    try {
        const decoded = jwtDecode(token);
        const expiresAt = decoded.exp * 1000; // Đổi sang miliseconds
        const currentTime = Date.now();

        // Tính thời gian còn lại: Hết hạn - Hiện tại - Buffer an toàn (1 phút)
        const timeUntilRefresh = expiresAt - currentTime - BUFFER_TIME;

        if (timeUntilRefresh > 0) {
            console.log(`[Lớp 1] Đã hẹn giờ refresh sau: ${timeUntilRefresh / 1000}s`);
            refreshTimer = setTimeout(async () => {
                console.log('[Lớp 1] Timer kích hoạt -> Đang refresh token...');
                await refreshTokenLogic();
            }, timeUntilRefresh);
        } else {
            // Nếu token sắp hết hạn ngay lúc login -> Refresh luôn
            console.log('[Lớp 1] Token sắp hết hạn -> Refresh ngay lập tức');
            refreshTokenLogic();
        }
    } catch (error) {
        console.error('Lỗi decode token để hẹn giờ:', error);
    }
};

const refreshTokenLogic = async () => {
    try {
        console.log('[axiosClient] Attempting to refresh token...');
        // Gọi API, cookie sẽ tự gửi đi
        const response = await axiosClient.post(REFRESH_ENDPOINT); 
        const { accessToken: newAccessToken } = response.data;
        
        console.log('[axiosClient] Token refreshed successfully');
        // Update token mới vào RAM và đặt lại lịch hẹn giờ
        setAccessToken(newAccessToken);
        
        return newAccessToken;
    } catch (error) {
        console.error('[axiosClient] Refresh token failed:', error.response?.data || error.message);
        // Nếu refresh lỗi (VD: Hết hạn 7 ngày, bị ban) -> Logout user
        handleLogout();
        return null;
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', () => {
        // Chỉ chạy khi user quay lại tab (visible) và đang có token
        if (document.visibilityState === 'visible' && accessToken) {
            const decoded = jwtDecode(accessToken);
            const expiresAt = decoded.exp * 1000;
            const now = Date.now();
            
            // Nếu token còn sống ít hơn Buffer Time (hoặc đã chết) -> Refresh ngay
            if (expiresAt - now < BUFFER_TIME) {
                console.log('[Lớp 2] Phát hiện token yếu khi quay lại tab -> Refresh ngay');
                refreshTokenLogic(); // Gọi refresh ngay lập tức
            }
        }
    });
}

// 1. Request Interceptor: Gắn token vào Authorization Header
axiosClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Bắt lỗi 401 và xử lý Concurrency
axiosClient.interceptors.response.use(
    (response) => response, // Thành công thì trả về luôn
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa từng retry request này
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                console.log('[Lớp 3] Đang có request khác refresh, request này vào hàng đợi...');
                // --- Xử lý Concurrency ---
                // Trả về một Promise chờ được resolve bởi request đang chạy refresh đầu tiên
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(axiosClient(originalRequest));
                        },
                        reject: (err) => {
                            reject(err);
                        }
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            console.log('[Lớp 3] Bắt được lỗi 401 -> Kích hoạt Refresh Token Fallback');

            try {
                const newToken = await refreshTokenLogic();

                if (newToken) {
                    // Xử lý hàng đợi đang chờ
                    processQueue(null, newToken);
                    
                    // Gọi lại request ban đầu bị lỗi
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosClient(originalRequest);
                } else {
                    processQueue(new Error('Refresh failed'), null);
                    handleLogout();
                    return Promise.reject(error);
                }
            } catch (err) {
                processQueue(err, null);
                handleLogout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const setAccessToken = (token) => {
    accessToken = token;
    // Mỗi khi set token mới -> Kích hoạt Lớp 1 (Hẹn giờ)
    scheduleRefreshToken(token);
};

export const getAccessToken = () => accessToken;

export const handleLogout = () => {
    accessToken = null;
    if (refreshTimer) clearTimeout(refreshTimer);
    // Logic redirect về trang login hoặc xóa state user
    window.location.href = '/login'; 
};

// Them token tu dong
// axiosClient.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token")
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
// })

// // xu li tu dong khi token het han
// axiosClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             console.warn("Token het han")
//             localStorage.removeItem("token")
//         }
//         return Promise.reject(error)
//     }
// )

export default axiosClient