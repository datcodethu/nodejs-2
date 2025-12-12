import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, RefreshCw, File, Search } from "lucide-react";

// Hàm formatBytes (nên tách ra utils nếu dùng nhiều nơi)
const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileManagement = () => {
    const [files, setFiles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [ownerFilter, setOwnerFilter] = useState(""); 
    const [loading, setLoading] = useState(false); // Thêm loading state

    useEffect(() => {
        // Debounce: Chờ người dùng gõ xong 0.5s mới gọi API
        const delayDebounceFn = setTimeout(() => {
            fetchFiles();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [pagination.page, ownerFilter]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            // SỬA URL: Phải là /api/admin/files khớp với server.js
            const res = await axios.get("/api/v1/admin/files", {
                params: { page: pagination.page, limit: pagination.limit, owner: ownerFilter }
            });
            const { files, total, page } = res.data.data;
            setFiles(files);
            setPagination(prev => ({ ...prev, total, page: Number(page) }));
        } catch (error) {
            console.error("Lỗi tải files:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa file này?")) return;
        try {
            // SỬA URL: Thêm /api
            await axios.delete(`/api/v1/admin/files/${id}`);
            alert("Đã xóa file");
            fetchFiles();
        } catch (error) {
            alert("Lỗi xóa file");
        }
    };

    const handleRestore = async (id) => {
        try {
            // SỬA QUAN TRỌNG: URL /api/admin... và method PATCH
            await axios.patch(`/api/v1/admin/files/${id}/restore`);
            alert("Đã khôi phục file");
            fetchFiles();
        } catch (error) {
            alert("Lỗi khôi phục file");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý File</h1>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Lọc theo Owner ID..." 
                        className="pl-10 pr-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        value={ownerFilter}
                        onChange={(e) => setOwnerFilter(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                            <tr>
                                <th className="px-6 py-3">Tên File</th>
                                <th className="px-6 py-3">Kích thước</th>
                                <th className="px-6 py-3">Người sở hữu</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {files.length > 0 ? (
                                files.map((file) => (
                                    <tr key={file._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <File size={16} className="text-blue-500"/>
                                            <span className="truncate max-w-xs font-medium text-gray-700" title={file.filename}>
                                                {file.filename || file._id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{formatBytes(file.size)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {/* Hiển thị email nếu có populate, nếu không hiện ID */}
                                            {file.owner ? (file.owner.email || file.owner) : "Unknown"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {file.isDeleted ? (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold">Deleted</span>
                                            ) : (
                                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-semibold">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {file.isDeleted ? (
                                                <button 
                                                    onClick={() => handleRestore(file._id)} 
                                                    className="text-green-600 hover:bg-green-50 p-2 rounded flex items-center gap-1 ml-auto transition-colors"
                                                    title="Khôi phục file"
                                                >
                                                    <RefreshCw size={16} /> Restore
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleDelete(file._id)} 
                                                    className="text-red-600 hover:bg-red-50 p-2 rounded flex items-center gap-1 ml-auto transition-colors"
                                                    title="Xóa file"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Không tìm thấy file nào.
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
                    disabled={files.length < pagination.limit || loading}
                    onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                    className="px-4 py-2 bg-white border rounded disabled:opacity-50 hover:bg-gray-50"
                >Sau</button>
            </div>
        </div>
    );
};

export default FileManagement;