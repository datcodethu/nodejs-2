import axios from "axios"

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json"
    }
})

// Them token tu dong
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// xu li tu dong khi token het han
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Token het han")
            localStorage.removeItem("token")
        }
        return Promise.reject(error)
    }
)

export default axiosClient