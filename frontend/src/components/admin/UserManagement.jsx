import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Edit, Lock, Unlock, Database } from "lucide-react";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20 });
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false); // Thêm loading

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search để tránh gọi API liên tục khi gõ

        return () => clearTimeout(delayDebounceFn);
    }, [pagination.page, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // URL này phải khớp với server.js: app.use('/api/admin', adminRoutes)
            const res = await axios.get("/api/v1/admin/users", {
                params: { page: pagination.page, limit: pagination.limit, search: searchTerm }
            });
            const { users, total, page, limit } = res.data.data;
            setUsers(users);
            setPagination({ ...pagination, total, page: Number(page) });
        } catch (error) {
            console.error("Lỗi tải users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? "khóa" : "mở khóa"} user này?`)) return;
        try {
            // SỬA QUAN TRỌNG: Đổi put -> patch để khớp với Backend Router
            await axios.patch(`/api/v1/admin/users/${id}/status`, { active: !currentStatus });
            fetchUsers(); 
        } catch (error) {
            alert("Lỗi cập nhật trạng thái");
        }
    };

    const updateQuota = async (id) => {
        const limitStr = prompt("Nhập dung lượng mới (bytes): (Ví dụ: 1073741824 = 1GB)");
        if (!limitStr) return;
        
        const limit = Number(limitStr);
        if (isNaN(limit) || limit <= 0) {
            alert("Vui lòng nhập số hợp lệ");
            return;
        }

        try {
            // SỬA QUAN TRỌNG: Đổi put -> patch
            await axios.patch(`/api/v1/admin/users/${id}/quota`, { storageLimit: limit });
            alert("Cập nhật quota thành công!");
            fetchUsers();
        } catch (error) {
            alert("Lỗi cập nhật quota");
        }
    };

    const resetPassword = async (id) => {
        const newPass = prompt("Nhập mật khẩu mới:");
        if (!newPass) return;
        try {
            // SỬA QUAN TRỌNG: Đổi put -> patch
            await axios.patch(`/api/v1/admin/users/${id}/reset-password`, { newPassword: newPass });
            alert("Đổi mật khẩu thành công!");
        } catch (error) {
            alert("Lỗi đổi mật khẩu");
        }
    };

    // Hàm format bytes cho đẹp
    const formatSize = (bytes) => {
        if (!bytes) return "0 MB";
        return (bytes / (1024 * 1024)).toFixed(0) + " MB";
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Tìm theo email..." 
                        className="pl-10 pr-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                            <tr>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Storage Limit</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {formatSize(user.storageLimit)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.active ? 'Active' : 'Locked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button 
                                                onClick={() => toggleStatus(user._id, user.active)} 
                                                className={`p-2 rounded transition-colors ${user.active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={user.active ? "Khóa tài khoản" : "Mở khóa"}
                                            >
                                                {user.active ? <Lock size={18} /> : <Unlock size={18} />}
                                            </button>
                                            <button onClick={() => updateQuota(user._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Sửa dung lượng">
                                                <Database size={18} />
                                            </button>
                                            <button onClick={() => resetPassword(user._id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded" title="Đổi mật khẩu">
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Không tìm thấy user nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Pagination Controls */}
            <div className="flex justify-center mt-4 gap-2 items-center">
                <button 
                    disabled={pagination.page === 1 || loading}
                    onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                    className="px-4 py-2 bg-white border rounded disabled:opacity-50 hover:bg-gray-50"
                >Trước</button>
                <span className="px-4 py-2 text-sm text-gray-600">
                    Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit) || 1}
                </span>
                <button 
                    disabled={users.length < pagination.limit || loading} 
                    onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                    className="px-4 py-2 bg-white border rounded disabled:opacity-50 hover:bg-gray-50"
                >Sau</button>
            </div>
        </div>
    );
};

export default UserManagement;
