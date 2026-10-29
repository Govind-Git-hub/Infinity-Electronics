
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    Award,
    ClipboardList,
    X,
    MessageSquare
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Brands', path: '/admin/brands', icon: Award },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare, }
];

const AdminSidebar = ({ open, onClose }) => {
    return (
        <>
            {/* Mobile backdrop */}
            {open && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
                    <NavLink
                        to="/admin"
                        onClick={onClose}
                        className="text-xl font-bold tracking-tight text-indigo-600"
                    >
                        Infinity<span className="text-slate-300"> Admin</span>
                    </NavLink>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close sidebar"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 pt-6">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Management
                    </p>

                    <nav className="space-y-1">
                        {navItems.map(({ name, path, icon: Icon, end }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={end}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon size={19} />
                                <span>{name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto border-t border-gray-200 p-4">
                    <p className="text-xs text-gray-400">
                        Infinity Electronics
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                        Administration Panel
                    </p>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;