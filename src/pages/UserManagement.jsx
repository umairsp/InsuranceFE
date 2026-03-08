import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Users, Trash2, Shield, User as UserIcon, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/auth/users');
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (id === currentUser._id) {
            alert("You cannot delete your own account.");
            return;
        }

        if (window.confirm('Are you sure you want to delete this user? All their created policies will remain but will be orphan.')) {
            try {
                await axios.delete(`/auth/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleToggleRole = async (targetUser) => {
        if (targetUser._id === currentUser._id) {
            alert("You cannot change your own role.");
            return;
        }

        const newRole = targetUser.role === 'Admin' ? 'User' : 'Admin';
        try {
            await axios.put(`/auth/users/${targetUser._id}/role`, { role: newRole });
            setUsers(users.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                    {u.name?.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{u.mobile}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleToggleRole(u)}
                                                className="text-primary-600 hover:text-primary-900 flex items-center"
                                                title={u.role === 'Admin' ? 'Make User' : 'Make Admin'}
                                            >
                                                {u.role === 'Admin' ? <UserIcon className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete User"
                                                disabled={u._id === currentUser._id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {users.length === 0 && !loading && (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
