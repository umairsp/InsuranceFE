import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Users, Settings, TrendingUp, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { user } = React.useContext(AuthContext);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'My Policies', path: '/policies', icon: FileText },
        { name: 'Add Policy', path: '/policies/new', icon: PlusCircle },
        { name: 'Profit Tracking', path: '/profit', icon: TrendingUp },
    ];

    if (user?.role === 'Admin') {
        navItems.push({ name: 'Manage Users', path: '/users', icon: Users });
        navItems.push({ name: 'Settings', path: '/settings', icon: Settings });
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar container */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:inset-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white tracking-wider">MAIN MENU</h2>
                    <button className="lg:hidden text-gray-400" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="mt-5 px-2 overflow-y-auto max-h-[calc(100vh-80px)]">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`${isActive
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200`}
                                >
                                    <Icon
                                        className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                            } mr-3 flex-shrink-0 h-5 w-5`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
