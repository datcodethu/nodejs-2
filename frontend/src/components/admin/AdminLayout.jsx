import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Users, 
    FolderOpen, 
    Settings, 
    LogOut, 
    Menu 
} from "lucide-react";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Danh sách menu
    const menuItems = [
        { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { path: "/admin/users", label: "Quản lý User", icon: <Users size={20} /> },
        { path: "/admin/files", label: "Quản lý File", icon: <FolderOpen size={20} /> },
        // { path: "/admin/settings", label: "Cài đặt", icon: <Settings size={20} /> },
    ];

    const handleLogout = () => {
        // Xử lý logout tại đây (xóa token, clear localStorage...)
        if(window.confirm("Bạn có chắc muốn đăng xuất?")) {
            localStorage.removeItem("token"); // Ví dụ xóa token
            navigate("/login"); // Chuyển về trang login
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* ---------------- SIDEBAR ---------------- */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg transition-all duration-300">
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-gray-800">
                    <h2 className="text-xl font-bold tracking-wider text-blue-400">ADMIN PANEL</h2>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        // Kiểm tra xem link này có đang active không
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 
                                    ${isActive 
                                        ? "bg-blue-600 text-white shadow-md" 
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Sidebar (Logout) */}
                <div className="p-4 border-t border-gray-800">
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
                
                {/* Header */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
                    <div className="text-gray-500">
                        {/* Có thể để Breadcrumb hoặc nút Menu toggle ở đây */}
                        <Menu className="cursor-pointer lg:hidden" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-700">Admin</p>
                            <p className="text-xs text-gray-500">admin@example.com</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Main Content (Dynamic) */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {/* <Outlet /> là nơi các trang con (Dashboard, Users...) sẽ hiển thị */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;