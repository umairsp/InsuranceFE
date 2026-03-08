import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const PolicyList = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const filterState = location.state?.filter || 'all';

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const { data } = await axios.get('/policies');
            setPolicies(data);
        } catch (error) {
            console.error('Failed to fetch policies', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            try {
                await axios.delete(`/policies/${id}`);
                setPolicies(policies.filter((p) => p._id !== id));
            } catch (error) {
                console.error('Failed to delete policy', error);
                alert('Failed to delete policy');
            }
        }
    };

    const filteredPolicies = policies.filter((policy) => {
        // First apply the search term filter
        const matchesSearch =
            policy.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.owner1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Then apply the dashboard metric filter if present
        if (filterState === 'all') return true;

        if (filterState === 'created_today') {
            const created = new Date(policy.createdAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return created >= today;
        }

        const end = new Date(policy.policyEndDate);
        end.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = end - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filterState === 'tomorrow') return daysRemaining <= 1 && daysRemaining >= 0;
        if (filterState === '15days') return daysRemaining <= 15 && daysRemaining > 1;
        if (filterState === '30days') return daysRemaining <= 30 && daysRemaining > 15;
        if (filterState === 'expired') return daysRemaining < 0;

        return true;
    });

    if (loading) return <div>Loading policies...</div>;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Policies</h1>
                <Link to="/policies/new" className="btn-primary flex items-center w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> Add New Policy
                </Link>
            </div>

            <div className="bg-white p-3 sm:p-4 shadow rounded-lg border border-gray-100 flex items-center">
                <Search className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full focus:outline-none text-sm sm:text-base text-gray-700"
                />
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Premium</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Net Profit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Dates</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPolicies.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        No policies found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredPolicies.map((policy) => (
                                    <tr key={policy._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {policy.policyNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{policy.vehicleNumber}</div>
                                            <div className="text-xs text-gray-500 hidden sm:block">{policy.vehicleType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium sm:font-normal">{policy.owner1}</div>
                                            <div className="text-xs text-gray-500 hidden md:block">{policy.mobileNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <div className="text-sm font-medium text-gray-900">₹{policy.premiumAmount?.toLocaleString() || 0}</div>
                                            <div className="text-[10px] text-gray-500">Com: ₹{policy.commissionAmount?.toLocaleString() || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <div className={`text-sm font-bold ${policy.agentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ₹{policy.agentProfit?.toLocaleString() || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                            <div className="text-xs">{new Date(policy.policyStartDate).toLocaleDateString()}</div>
                                            <div className="font-semibold text-gray-700 mt-0.5">
                                                to {new Date(policy.policyEndDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link to={`/policies/edit/${policy._id}`} className="text-primary-600 hover:text-primary-900 p-1" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(policy._id)} className="text-red-600 hover:text-red-900 p-1" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PolicyList;
