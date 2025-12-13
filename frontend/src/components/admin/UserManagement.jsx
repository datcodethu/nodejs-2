import React, { useEffect, useState } from "react";
// 1. Đồng bộ import axiosClient giống AdminDashboard
// Nếu file của bạn nằm ở thư mục "utils" thì sửa thành "../../utils/axiosClient"
import axiosClient from "../../utils/axiosClient"; 
import { Search, Edit, Lock, Unlock, Database, RefreshCw } from "lucide-react";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20 });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    // 2. Thêm state loading để UX mượt mà giống Dashboard
    const [loading, setLoading] = useState(true);

    // Logic Debounce (chờ 0.5s sau khi gõ mới tìm)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, debouncedSearch]);

    const fetchUsers = async () => {
        setLoading(true); // Bắt đầu load
        try {
            const res = await axiosClient.get("/admin/users", {
                params: { 
                    page: pagination.page, 
                    limit: pagination.limit, 
                    search: debouncedSearch 
                }
            });
            
            if (res.data && res.data.data) {
                const { users, total, page } = res.data.data;
                setUsers(users);
                setPagination(prev => ({ ...prev, total, page: Number(page) }));
            }
        } catch (error) {
            console.error("Lỗi tải users:", error);
        } finally {
            setLoading(false); // Kết thúc load
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? "khóa" : "mở khóa";
        if (!window.confirm(`Bạn có chắc muốn ${action} user này?`)) return;
        
        try {
            await axiosClient.patch(`/admin/users/${id}/status`, { active: !currentStatus });
            // Optimistic update
            setUsers(users.map(u => u._id === id ? { ...u, active: !currentStatus } : u));
            alert(`Đã ${action} tài khoản thành công.`);
        } catch (error) {
            alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật trạng thái"));
        }
    };

    const updateQuota = async (id, currentBytes) => {
        const currentMB = currentBytes ? (currentBytes / (1024 * 1024)).toFixed(0) : 0;
        const inputMB = prompt("Nhập giới hạn dung lượng mới (MB):", currentMB);
        
        if (inputMB === null || inputMB === "") return;
        if (isNaN(inputMB)) {
            alert("Vui lòng nhập số hợp lệ!");
            return;
        }

        const newBytes = parseFloat(inputMB) * 1024 * 1024;
        
        try {
            await axiosClient.patch(`/admin/users/${id}/quota`, { storageLimit: newBytes });
            fetchUsers();
            alert("Cập nhật dung lượng thành công!");
        } catch (error) {
            alert("Lỗi cập nhật quota");
        }
    };

    const resetPassword = async (id) => {
        const newPass = prompt("Nhập mật khẩu mới cho user này:");
        if (!newPass) return;
        
        try {
            await axiosClient.patch(`/admin/users/${id}/reset-password`, { newPassword: newPass });
            alert("Đổi mật khẩu thành công!");
        } catch (error) {
            alert("Lỗi đổi mật khẩu");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
                <div className="flex gap-2">
                     <button 
                        onClick={fetchUsers} 
                        className="p-2 bg-white rounded border hover:bg-gray-50 text-gray-600 transition-colors"
                        title="Tải lại danh sách"
                     >
                        <RefreshCw size={18}/>
                    </button>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm theo email..." 
                            className="pl-10 pr-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPagination(prev => ({...prev, page: 1})); 
                            }}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                        <tr>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Storage Limit (MB)</th>
                            <th className="px-6 py-3">Trạng thái</th>
                            <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                                    <td className="px-6 py-4">
                                        {/* 3. Style Role giống hệt AdminDashboard */}
                                        <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.storageLimit 
                                            ? (user.storageLimit / (1024 * 1024)).toLocaleString('en-US', {maximumFractionDigits: 0}) 
                                            : 0
                                        } MB
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.active ? 'Active' : 'Locked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button 
                                            onClick={() => toggleStatus(user._id, user.active)} 
                                            className={`p-2 rounded transition-colors ${user.active ? 'text-orange-600 hover:bg-orange-100' : 'text-green-600 hover:bg-green-100'}`}
                                            title={user.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                        >
                                            {user.active ? <Lock size={18} /> : <Unlock size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => updateQuota(user._id, user.storageLimit)} 
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                                            title="Sửa dung lượng"
                                        >
                                            <Database size={18} />
                                        </button>
                                        <button 
                                            onClick={() => resetPassword(user._id)} 
                                            className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors" 
                                            title="Đặt lại mật khẩu"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    Không tìm thấy người dùng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {!loading && (
                <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-600">
                    <span>
                        Hiển thị {users.length} trên tổng số {pagination.total} người dùng
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                            className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        <button 
                            disabled={pagination.page * pagination.limit >= pagination.total}
                            onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                            className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;