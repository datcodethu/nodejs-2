import React, { useEffect, useState } from "react";
// 1. Import axiosClient (Sửa đường dẫn nếu file nằm ở utils)
import axiosClient from "../../utils/axiosClient"; 
import { Trash2, RefreshCw, File, Search, HardDrive, DownloadCloud } from "lucide-react";

// Hàm format dung lượng file
const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileManagement = () => {
    const [files, setFiles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [ownerFilter, setOwnerFilter] = useState(""); 
    const [loading, setLoading] = useState(true);

    // Debounce: Chờ người dùng gõ xong Owner ID mới lọc
    const [debouncedOwner, setDebouncedOwner] = useState(ownerFilter);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedOwner(ownerFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [ownerFilter]);

    useEffect(() => {
        fetchFiles();
    }, [pagination.page, debouncedOwner]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            // Gọi API: GET /admin/files
            const res = await axiosClient.get("/admin/files", {
                params: { 
                    page: pagination.page, 
                    limit: pagination.limit, 
                    owner: debouncedOwner // Lọc theo Owner ID nếu có
                }
            });
            
            if (res.data && res.data.data) {
                const { files, total, page } = res.data.data;
                setFiles(files);
                setPagination(prev => ({ ...prev, total, page: Number(page) }));
            }
        } catch (error) {
            console.error("Lỗi tải files:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa file này vĩnh viễn?")) return;
        try {
            await axiosClient.delete(`/admin/files/${id}`);
            alert("Đã xóa file thành công");
            fetchFiles(); // Refresh lại danh sách
        } catch (error) {
            alert("Lỗi xóa file: " + (error.response?.data?.message || "Lỗi server"));
        }
    };

    const handleRestore = async (id) => {
        try {
            await axiosClient.patch(`/admin/files/${id}/restore`);
            alert("Đã khôi phục file");
            fetchFiles();
        } catch (error) {
            alert("Lỗi khôi phục file");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý File</h1>
                
                <div className="flex gap-2">
                    <button 
                        onClick={fetchFiles}
                        className="p-2 bg-white rounded border hover:bg-gray-50 text-gray-600 transition-colors"
                        title="Tải lại"
                    >
                        <RefreshCw size={18}/>
                    </button>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Lọc theo Owner ID..." 
                            className="pl-10 pr-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            value={ownerFilter}
                            onChange={(e) => {
                                setOwnerFilter(e.target.value);
                                setPagination(prev => ({...prev, page: 1}));
                            }}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b">
                            <tr>
                                <th className="px-6 py-3">Tên File</th>
                                <th className="px-6 py-3">Kích thước</th>
                                <th className="px-6 py-3">Người sở hữu</th>
                                <th className="px-6 py-3">Ngày upload</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Đang tải dữ liệu file...
                                    </td>
                                </tr>
                            ) : files.length > 0 ? (
                                files.map((file) => (
                                    <tr key={file._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-blue-50 rounded text-blue-600">
                                                    <File size={16} />
                                                </div>
                                                <span className="truncate max-w-xs font-medium text-gray-700" title={file.filename}>
                                                    {file.filename || file._id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {formatBytes(file.size)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {/* Kiểm tra null owner phòng trường hợp user đã bị xóa */}
                                            {file.owner ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-medium">{file.owner.email}</span>
                                                    <span className="text-xs text-gray-500">{file.owner.role}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Unknown User</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString('vi-VN') : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {file.isDeleted ? (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold border border-red-200">
                                                    Deleted
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-semibold border border-green-200">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {file.isDeleted ? (
                                                <button 
                                                    onClick={() => handleRestore(file._id)} 
                                                    className="text-green-600 hover:bg-green-100 p-2 rounded inline-flex items-center gap-1 transition-colors"
                                                    title="Khôi phục file"
                                                >
                                                    <RefreshCw size={16} /> <span className="text-sm">Restore</span>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleDelete(file._id)} 
                                                    className="text-red-600 hover:bg-red-100 p-2 rounded inline-flex items-center gap-1 transition-colors"
                                                    title="Xóa file"
                                                >
                                                    <Trash2 size={16} /> <span className="text-sm">Delete</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Không tìm thấy file nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {!loading && (
                <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-600">
                    <span>
                        Hiển thị {files.length} file (Trang {pagination.page})
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                            className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Trước
                        </button>
                        <button 
                            disabled={pagination.page * pagination.limit >= pagination.total}
                            onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                            className="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileManagement;