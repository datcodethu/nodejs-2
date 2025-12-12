import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, RefreshCw, File } from "lucide-react";

// Hàm formatBytes dùng lại từ Dashboard (tốt nhất nên tách ra file utils)
const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileManagement = () => {
    const [files, setFiles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20 });
    const [ownerFilter, setOwnerFilter] = useState(""); // ID của owner nếu muốn lọc

    useEffect(() => {
        fetchFiles();
    }, [pagination.page, ownerFilter]);

    const fetchFiles = async () => {
        try {
            const res = await axios.get("/files", {
                params: { page: pagination.page, limit: pagination.limit, owner: ownerFilter }
            });
            setFiles(res.data.data.files);
        } catch (error) {
            console.error("Lỗi tải files:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa file này?")) return;
        try {
            await axios.delete(`/admin/files/${id}`);
            alert("Đã xóa file");
            fetchFiles();
        } catch (error) {
            alert("Lỗi xóa file");
        }
    };

    const handleRestore = async (id) => {
        try {
            await axios.put(`/admin/files/${id}/restore`);
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
                <input 
                    type="text" 
                    placeholder="Lọc theo Owner ID..." 
                    className="px-4 py-2 rounded border"
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                        {files.map((file) => (
                            <tr key={file._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <File size={16} className="text-gray-400"/>
                                    <span className="truncate max-w-xs" title={file.filename}>{file.filename || file._id}</span>
                                </td>
                                <td className="px-6 py-4">{formatBytes(file.size)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {file.owner ? file.owner.email : "Unknown"}
                                </td>
                                <td className="px-6 py-4">
                                    {file.isDeleted ? (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Deleted</span>
                                    ) : (
                                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Active</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {file.isDeleted ? (
                                        <button 
                                            onClick={() => handleRestore(file._id)} 
                                            className="text-green-600 hover:bg-green-100 p-2 rounded flex items-center gap-1 ml-auto"
                                        >
                                            <RefreshCw size={16} /> Restore
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleDelete(file._id)} 
                                            className="text-red-600 hover:bg-red-100 p-2 rounded flex items-center gap-1 ml-auto"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls (Tương tự User Page) */}
            <div className="flex justify-center mt-4 gap-2">
                <button 
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                    className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                >Trước</button>
                <span className="px-4 py-2">Trang {pagination.page}</span>
                <button 
                    onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                    className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                >Sau</button>
            </div>
        </div>
    );
};

export default FileManagement;