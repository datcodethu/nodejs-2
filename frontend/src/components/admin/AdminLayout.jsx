import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Users, 
    FolderOpen, 
    LogOut 
} from "lucide-react";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // --- CÁCH 1: Tạo đối tượng CSS (Inline Styles) ---
    // Dùng cái này khi bạn muốn viết CSS trong JS
    const styles = {
        sidebarContainer: {
            // Ví dụ: Ghi đè màu nền bằng Gradient thay vì màu đơn sắc của Tailwind
            background: "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
            borderRight: "1px solid #374151"
        },
        activeLink: {
            backgroundColor: "#2563eb", // blue-600
            color: "#ffffff",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }
    };

    const menuItems = [
        { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { path: "/admin/users", label: "Quản lý User", icon: <Users size={20} /> },
        { path: "/admin/files", label: "Quản lý File", icon: <FolderOpen size={20} /> },
    ];

    const handleLogout = () => {
        if(window.confirm("Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* --- CÁCH 2: Dùng thẻ <style> trực tiếp --- */}
            {/* Cách này giúp bạn custom thanh cuộn (Scrollbar) mà inline style không làm được */}
            <style>{`
                /* Tùy chỉnh thanh cuộn cho đẹp hơn */
                .custom-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #f1f1f1; 
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #c1c1c1; 
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8; 
                }
            `}</style>

            {/* ---------------- SIDEBAR ---------------- */}
            {/* Áp dụng style từ biến styles.sidebarContainer */}
            <aside 
                className="w-64 text-white flex flex-col shadow-lg transition-all duration-300"
                style={styles.sidebarContainer} 
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-gray-700">
                    <h2 className="text-xl font-bold tracking-wider text-blue-400">ADMIN PANEL</h2>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scroll">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                // Kết hợp Tailwind cho trạng thái thường
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    !isActive ? "text-gray-400 hover:bg-gray-800 hover:text-white" : ""
                                }`}
                                // Áp dụng Inline Style nếu đang Active
                                style={isActive ? styles.activeLink : {}}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Sidebar (Logout) */}
                <div className="p-4 border-t border-gray-700">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Main Content (Dynamic) */}
                {/* Thêm class 'custom-scroll' để thanh cuộn đẹp hơn */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scroll">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;