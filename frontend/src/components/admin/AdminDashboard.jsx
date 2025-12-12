import React, { useEffect, useState } from "react";
import axios from "axios";
import { HardDrive, Users, FileText } from "lucide-react";
import "./Dashboard.css"
const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const AdminDashboard = () => {
    // 1. Khởi tạo state với giá trị mặc định an toàn để tránh crash
    const [stats, setStats] = useState({ 
        totalUsers: 0, 
        totalFiles: 0, 
        totalStorageUsed: 0 
    });
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Thêm trạng thái loading

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 2. SỬA URL Ở ĐÂY: Thêm "-users" vào cuối để khớp với Backend
            const [overviewRes, topRes] = await Promise.all([
                axios.get("/api/v1/admin/system/overview"),
                axios.get("/api/v1/admin/system/top-storage-users") 
            ]);

            // Cập nhật state nếu dữ liệu trả về đúng cấu trúc
            if (overviewRes.data && overviewRes.data.data) {
                setStats(overviewRes.data.data);
            }
            
            if (topRes.data && topRes.data.data) {
                setTopUsers(topRes.data.data);
            }

        } catch (error) {
            console.error("Lỗi tải dashboard:", error);
            // Không setStats ở đây để giữ nguyên giá trị mặc định (0), tránh crash
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Hệ Thống</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Tổng User</p>
                        {/* 3. Dùng Optional Chaining (?.) để tránh crash nếu stats null */}
                        <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                    <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Tổng File</p>
                        <p className="text-2xl font-bold">{stats?.totalFiles || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600 mr-4">
                        <HardDrive size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Dung lượng sử dụng</p>
                        <p className="text-2xl font-bold">{formatBytes(stats?.totalStorageUsed || 0)}</p>
                    </div>
                </div>
            </div>

            {/* Top Storage Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-700">Top User dùng nhiều dung lượng</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Đã dùng</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {topUsers.length > 0 ? (
                            topUsers.map((user) => (
                                <tr key={user.userId}>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{formatBytes(user.usedStorage)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;