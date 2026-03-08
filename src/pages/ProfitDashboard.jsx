import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, TrendingUp, CalendarDays } from 'lucide-react';

const ProfitCard = ({ title, amount, icon: Icon, colorClass, bgColorClass, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex items-start justify-between transition-transform transform hover:scale-105 duration-300 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
        <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-4xl font-extrabold ${colorClass}`}>
                ₹{amount?.toLocaleString() || 0}
            </p>
        </div>
        <div className={`p-4 rounded-2xl ${bgColorClass} shrink-0`}>
            <Icon className={`h-8 w-8 ${colorClass}`} />
        </div>
    </div>
);

const ProfitDashboard = () => {
    const navigate = useNavigate();
    const [profitData, setProfitData] = useState({
        overallProfit: 0,
        todayProfit: 0,
        recentPolicies: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfitData = async () => {
            try {
                const { data } = await axios.get('/policies/profit/summary');
                setProfitData(data);
            } catch (error) {
                console.error('Failed to fetch profit data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfitData();
    }, []);

    if (loading) return <div>Loading profit data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
                    Profit Tracking Dashboard
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <ProfitCard
                    title="Today's Expected Profit"
                    amount={profitData.todayProfit}
                    icon={CalendarDays}
                    colorClass="text-blue-600"
                    bgColorClass="bg-blue-100"
                    onClick={() => navigate('/policies', { state: { filter: 'created_today' } })}
                />

                <ProfitCard
                    title="Overall Net Profit"
                    amount={profitData.overallProfit}
                    icon={IndianRupee}
                    colorClass="text-green-600"
                    bgColorClass="bg-green-100"
                    onClick={() => navigate('/policies')}
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">How is this calculated?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    The profit amounts shown above are calculated automatically across all policies based on the fields entered during policy creation.
                </p>
                <div className="bg-gray-50 p-4 rounded-md inline-block border border-gray-200">
                    <code className="text-sm text-gray-800 font-mono">
                        Profit = Customer Paid Amount - (Total Premium - Agent Commission)
                    </code>
                </div>
                <p className="text-gray-500 text-xs mt-3 italic">
                    Note: Agent Commission is automatically calculated as 45% of the Total Premium.
                </p>
            </div>

            {profitData.recentPolicies?.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 mt-8">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Recent Profit Sources
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            A breakdown of net profit from your most recently added policies.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy No.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Premium</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Commission (45%)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {profitData.recentPolicies.map((policy) => (
                                    <tr key={policy._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {policy.policyNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {policy.owner1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₹{policy.premiumAmount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₹{policy.commissionAmount?.toLocaleString() || 0}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${policy.agentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₹{policy.agentProfit?.toLocaleString() || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitDashboard;
