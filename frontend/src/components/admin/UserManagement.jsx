import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Edit, Lock, Unlock, Database } from "lucide-react";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20 });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, searchTerm]); // Reload khi đổi trang hoặc search

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/api/admin/users", {
                params: { page: pagination.page, limit: pagination.limit, search: searchTerm }
            });
            const { users, total, page, limit } = res.data.data;
            setUsers(users);
            setPagination({ ...pagination, total, page: Number(page) });
        } catch (error) {
            console.error("Lỗi tải users:", error);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        if (!window.confirm(`Bạn có chắc muốn ${currentStatus ? "khóa" : "mở khóa"} user này?`)) return;
        try {
            await axios.put(`/api/admin/users/${id}/status`, { active: !currentStatus });
            fetchUsers(); // Refresh list
        } catch (error) {
            alert("Lỗi cập nhật trạng thái");
        }
    };

    const updateQuota = async (id) => {
        const limit = prompt("Nhập dung lượng mới (bytes):");
        if (!limit) return;
        try {
            await axios.put(`/api/admin/users/${id}/quota`, { storageLimit: Number(limit) });
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
            await axios.put(`/api/admin/users/${id}/reset-password`, { newPassword: newPass });
            alert("Đổi mật khẩu thành công!");
        } catch (error) {
            alert("Lỗi đổi mật khẩu");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Tìm theo email..." 
                        className="pl-10 pr-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4">{(user.storageLimit / (1024*1024)).toFixed(0)} MB</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.active ? 'Active' : 'Locked'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => toggleStatus(user._id, user.active)} className="p-2 text-gray-600 hover:bg-gray-200 rounded" title={user.active ? "Khóa" : "Mở khóa"}>
                                        {user.active ? <Lock size={18} /> : <Unlock size={18} />}
                                    </button>
                                    <button onClick={() => updateQuota(user._id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded" title="Sửa Quota">
                                        <Database size={18} />
                                    </button>
                                    <button onClick={() => resetPassword(user._id)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded" title="Đổi mật khẩu">
                                        <Edit size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex justify-center mt-4 gap-2">
                <button 
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                    className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                >Trước</button>
                <span className="px-4 py-2">Trang {pagination.page}</span>
                <button 
                    disabled={users.length < pagination.limit} // Logic đơn giản
                    onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                    className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                >Sau</button>
            </div>
        </div>
    );
};

export default UserManagement;