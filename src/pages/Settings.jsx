import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save, Key, User, Phone, Mail } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                ...formData,
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.put('/auth/profile', formData);
            // Update local storage and context
            localStorage.setItem('userInfo', JSON.stringify(data));
            // We can't directly update AuthContext state as we don't have a setUser exposted, 
            // but the login logic in AuthContext handles it if we just reload or we could add a notify function.
            // For now, let's just show success.
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
            setFormData({ ...formData, password: '', confirmPassword: '' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-3">
                <SettingsIcon className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-md border-l-4 ${msg.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
                    }`}>
                    <p className="text-sm font-medium">{msg.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Section */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                                <User className="h-5 w-5 mr-2 text-gray-400" /> Personal Information
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">Update your account profile and contact details.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-2"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-2"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            disabled
                                            value={formData.email}
                                            className="block w-full pl-10 sm:text-sm border-gray-200 bg-gray-50 rounded-md text-gray-500 border p-2 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 italic">Email cannot be changed for security reasons.</p>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                                    <Key className="h-5 w-5 mr-2 text-gray-400" /> Security
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">Leave blank if you don't want to change your password.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 border p-2"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 text-right">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase">Profile Status</h4>
                        <div className="mt-4 flex items-center">
                            <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.role} Account</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <dl className="grid grid-cols-1 gap-y-4">
                                <div>
                                    <dt className="text-xs font-medium text-gray-500">Account ID</dt>
                                    <dd className="text-xs text-gray-900 font-mono mt-1">{user?._id}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
