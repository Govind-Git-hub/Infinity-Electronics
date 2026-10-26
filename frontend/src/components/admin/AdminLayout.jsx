
import { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="mt-3 text-sm text-gray-500">
                        Verifying admin access...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <Navigate to="/login" state={{ from: location }} replace />
        );
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Admin logout failed:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main area */}
            <div className="min-h-screen lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <h1 className="text-base font-semibold text-gray-900">
                                Admin Panel
                            </h1>
                            <p className="hidden text-xs text-gray-500 sm:block">
                                Manage your store
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold text-gray-900">
                                {user.name || 'Administrator'}
                            </p>
                            <p className="text-xs capitalize text-gray-500">
                                {user.role}
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                            <ShieldCheck size={19} />
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">
                                {loggingOut ? 'Logging out...' : 'Logout'}
                            </span>
                        </button>
                    </div>
                </header>

                {/* Nested page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;