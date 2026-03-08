import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Bell, Shield, Menu, X } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white shadow z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex items-center lg:hidden">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex-shrink-0 flex items-center ml-2 lg:ml-0">
                            <Shield className="h-8 w-8 text-primary-600" />
                            <span className="ml-2 font-bold text-lg sm:text-xl text-gray-900 overflow-hidden truncate max-w-[120px] sm:max-w-none">
                                InsuRemind
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 rounded-full">
                            <Bell className="h-6 w-6" />
                        </button>

                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-700 bg-gray-50 sm:bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">
                                {user?.name?.charAt(0)}
                            </div>
                            <span className="hidden md:block font-medium">{user?.name ? user.name.split(' ')[0] : ''} ({user?.role})</span>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center text-xs sm:text-sm font-medium text-red-600 hover:text-red-900 transition-colors"
                        >
                            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                            <span className="hidden xs:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
