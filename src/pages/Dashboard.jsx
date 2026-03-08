import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const DashboardCard = ({ title, count, icon: Icon, colorClass, bgColorClass, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col justify-between transition-transform transform hover:scale-105 duration-300 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <p className={`text-3xl font-extrabold ${colorClass}`}>{count}</p>
            </div>
            <div className={`p-3 rounded-xl ${bgColorClass} shrink-0`}>
                <Icon className={`h-6 w-6 ${colorClass}`} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        expiringTomorrow: 0,
        expiring15Days: 0,
        expiring30Days: 0,
        expired: 0,
    });
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [policiesRes, upcomingRes, expiredRes] = await Promise.all([
                    axios.get('/policies'),
                    axios.get('/reminders/upcoming'),
                    axios.get('/reminders/expired'),
                ]);

                const policies = policiesRes.data;
                const upcomingPolicies = upcomingRes.data;
                const expiredPolicies = expiredRes.data;

                let exactly1 = 0;
                let exactly15 = 0;
                let exactly30 = 0;

                upcomingPolicies.forEach((p) => {
                    if (p.daysRemaining <= 1) exactly1++;
                    else if (p.daysRemaining <= 15) exactly15++;
                    else if (p.daysRemaining <= 30) exactly30++;
                });

                setStats({
                    total: policies.length,
                    expiringTomorrow: exactly1,
                    expiring15Days: exactly15,
                    expiring30Days: exactly30,
                    expired: expiredPolicies.length,
                });

                setUpcoming(upcomingPolicies.slice(0, 10)); // Top 10 upcoming

            } catch (error) {
                console.error('Error fetching dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getRowColor = (days) => {
        if (days <= 1) return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
        if (days <= 15) return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500';
        if (days <= 30) return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-500';
        return '';
    };

    const getStatusBadgeColor = (days) => {
        if (days <= 1) return 'bg-red-100 text-red-800';
        if (days <= 15) return 'bg-orange-100 text-orange-800';
        if (days <= 30) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    }

    if (loading) return <div>Loading dashboard data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <button className="btn-primary flex items-center shadow-lg hover:shadow-xl">
                    <FileText className="h-5 w-5 mr-2" />
                    Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-5">
                <DashboardCard title="Total Policies" count={stats.total} icon={FileText} colorClass="text-blue-600" bgColorClass="bg-blue-100" onClick={() => navigate('/policies')} />
                <DashboardCard title="Expiring Tomorrow" count={stats.expiringTomorrow} icon={AlertTriangle} colorClass="text-red-600" bgColorClass="bg-red-100" onClick={() => navigate('/policies', { state: { filter: 'tomorrow' } })} />
                <DashboardCard title="Expiring 2-15 Days" count={stats.expiring15Days} icon={AlertCircle} colorClass="text-orange-600" bgColorClass="bg-orange-100" onClick={() => navigate('/policies', { state: { filter: '15days' } })} />
                <DashboardCard title="Expiring 16-30 Days" count={stats.expiring30Days} icon={CheckCircle} colorClass="text-yellow-600" bgColorClass="bg-yellow-100" onClick={() => navigate('/policies', { state: { filter: '30days' } })} />
                <DashboardCard title="Expired Policies" count={stats.expired} icon={AlertTriangle} colorClass="text-gray-600" bgColorClass="bg-gray-200" onClick={() => navigate('/policies', { state: { filter: 'expired' } })} />
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 mt-8">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Urgent Upcoming Renewals
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {upcoming.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No upcoming renewals found.</td>
                                </tr>
                            ) : (
                                upcoming.map((policy) => (
                                    <tr
                                        key={policy._id}
                                        onClick={() => navigate(`/policies/view/${policy._id}`)}
                                        className={`${getRowColor(policy.daysRemaining)} cursor-pointer transition-colors`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {policy.policyNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {policy.vehicleNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {policy.owner1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {policy.mobileNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(policy.policyEndDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(policy.daysRemaining)}`}>
                                                {policy.daysRemaining === 0 ? 'Today' : `${policy.daysRemaining} days left`}
                                            </span>
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

export default Dashboard;
