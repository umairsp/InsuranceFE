import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, PlusCircle, FileText, TrendingUp, CheckCircle, Users } from 'lucide-react';

const PolicyForm = ({ isViewMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id) && !isViewMode;

    const [formData, setFormData] = useState({
        policyNumber: '',
        vehicleNumber: '',
        insuranceCompany: '',
        owner1: '',
        mobileNumber: '',
        policyStartDate: '',
        policyEndDate: '',
        premiumAmount: '',
        commissionAmount: '',
        customerPaidAmount: '',
        agentProfit: '',
        vehicleType: 'Car',
        notes: '',
        agentName: '',
        agentContactNumber: '',
        policyType: 'Package Policy',
        isEndorsed: false,
        endorsementNumber: '',
        newCustomerName: '',
        newMobileNumber: '',
    });

    const [loading, setLoading] = useState(Boolean(id)); // Always load if ID exists
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchPolicy();
        }
    }, [id]);

    const fetchPolicy = async () => {
        try {
            const { data } = await axios.get(`/policies/${id}`);
            setFormData({
                ...data,
                policyStartDate: data.policyStartDate ? new Date(data.policyStartDate).toISOString().split('T')[0] : '',
                policyEndDate: data.policyEndDate ? new Date(data.policyEndDate).toISOString().split('T')[0] : '',
            });
        } catch (err) {
            setError('Failed to fetch policy details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        let updatedFormData = { ...formData, [name]: val };

        if (name === 'premiumAmount' || name === 'customerPaidAmount' || name === 'commissionAmount') {
            const premium = name === 'premiumAmount' ? Number(val) : Number(formData.premiumAmount || 0);
            const paid = name === 'customerPaidAmount' ? Number(val) : Number(formData.customerPaidAmount || 0);
            const commission = name === 'commissionAmount' ? Number(val) : (name === 'premiumAmount' ? (premium * 0.45) : Number(formData.commissionAmount || 0));

            const profit = paid - (premium - commission);

            if (name === 'premiumAmount') {
                updatedFormData.commissionAmount = commission;
            }
            updatedFormData.agentProfit = profit;
        }

        setFormData(updatedFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (isEditMode) {
                await axios.put(`/policies/${id}`, formData);
            } else {
                await axios.post('/policies', formData);
            }
            navigate('/policies');
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving policy');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                            {isViewMode ? 'View Policy' : isEditMode ? 'Edit Policy' : 'Create New Policy'}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500">
                            {isViewMode ? 'Viewing recorded insurance data' : 'Enter insurance details below to save record'}
                        </p>
                    </div>
                </div>

                {!isViewMode && (
                    <button
                        onClick={(e) => handleSubmit(e)}
                        disabled={saving}
                        className="btn-primary py-2.5 px-6 shadow-md hover:shadow-lg flex items-center justify-center text-sm font-semibold rounded-xl bg-primary-600 text-white"
                    >
                        {saving ? (
                            <div className="flex items-center"><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> Saving...</div>
                        ) : (
                            <><Save className="h-4 w-4 mr-2" /> Save Policy</>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-headShake">
                    <div className="p-1 bg-red-100 rounded-full">
                        <ArrowLeft className="h-4 w-4 text-red-600 rotate-180" />
                    </div>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <fieldset disabled={isViewMode} className="contents">

                    {/* Main Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                        {/* Policy Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <h3 className="text-base font-bold text-gray-800">Policy Details</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Policy Number *</label>
                                        <input type="text" name="policyNumber" required value={formData.policyNumber} onChange={handleChange} className="input-field" placeholder="POL-123456789" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Insurance Company *</label>
                                        <select name="insuranceCompany" required value={formData.insuranceCompany} onChange={handleChange} className="input-field">
                                            <option value="">Select Insurance Company</option>
                                            <option value="Bajaj Allianz">Bajaj Allianz</option>
                                            <option value="Cholamandalam MS">Cholamandalam MS</option>
                                            <option value="Digit General Insurance">Digit General Insurance</option>
                                            <option value="Generali Central">Generali Central</option>
                                            <option value="HDFC ERGO">HDFC ERGO</option>
                                            <option value="ICICI Lombard">ICICI Lombard</option>
                                            <option value="IFFCO Tokio">IFFCO Tokio</option>
                                            <option value="IndusInd">IndusInd</option>
                                            <option value="Magma HDI">Magma HDI</option>
                                            <option value="Royal Sundaram Alliance">Royal Sundaram Alliance</option>
                                            <option value="New India Insurance">New India Insurance</option>
                                            <option value="United Insurance">United Insurance</option>
                                            <option value="National Insurance">National Insurance</option>
                                            <option value="Oriental Insurance">Oriental Insurance</option>
                                            <option value="SHRIRAM General Insurance">SHRIRAM General Insurance</option>
                                            <option value="Liberty General Insurance">Liberty General Insurance</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date *</label>
                                        <input type="date" name="policyStartDate" required value={formData.policyStartDate} onChange={handleChange} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date *</label>
                                        <input
                                            type="date"
                                            name="policyEndDate"
                                            required
                                            min={formData.policyStartDate}
                                            value={formData.policyEndDate}
                                            onChange={handleChange}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Policy Type *</label>
                                        <select name="policyType" required value={formData.policyType} onChange={handleChange} className="input-field">
                                            <option value="Package Policy">Package Policy</option>
                                            <option value="Third Party">Third Party</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle & Owner Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <h3 className="text-base font-bold text-gray-800">Vehicle & Owner Information</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Number *</label>
                                        <input type="text" name="vehicleNumber" required value={formData.vehicleNumber} onChange={handleChange} className="input-field" placeholder="MH-12-AB-1234" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Type *</label>
                                        <select name="vehicleType" required value={formData.vehicleType} onChange={handleChange} className="input-field">
                                            <option value="Car">Car</option>
                                            <option value="Two Wheelers">Two Wheelers</option>
                                            <option value="Autos">Autos</option>
                                            <option value="Taxis">Taxis</option>
                                            <option value="Goods Carrying Vehicles">Goods Carrying Vehicles</option>
                                            <option value="Buses & Coaches">Buses & Coaches</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Owner Name *</label>
                                        <input type="text" name="owner1" required value={formData.owner1} onChange={handleChange} className="input-field" placeholder="John Doe" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Mobile *</label>
                                        <input type="text" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange} className="input-field" placeholder="+91 9876543210" />
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 mt-2">
                                    <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">Accounts Summary</h4>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Premium</label>
                                            <div className="mt-0.5 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                                                <input type="number" name="premiumAmount" required value={formData.premiumAmount} onChange={handleChange} className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold" placeholder="0" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Customer Paid</label>
                                            <div className="mt-0.5 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                                                <input type="number" name="customerPaidAmount" required value={formData.customerPaidAmount} onChange={handleChange} className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold" placeholder="0" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                                        <div className="flex items-center space-x-1.5">
                                            <CheckCircle className={`h-4 w-4 ${formData.agentProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                                            <span className="text-xs font-medium text-gray-600">Net Business Profit</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-lg font-black ${formData.agentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ₹{formData.agentProfit?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agent & Endorsement Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                            {/* Agent Details Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                                <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                    <h3 className="text-base font-bold text-gray-800">Agent Assignment</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Agent Name</label>
                                            <input type="text" name="agentName" value={formData.agentName} onChange={handleChange} className="input-field" placeholder="Search or Type Agent Name" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Agent Contact</label>
                                            <input type="text" name="agentContactNumber" value={formData.agentContactNumber} onChange={handleChange} className="input-field font-mono" placeholder="9876543210" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Commission (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                <input type="number" name="commissionAmount" required value={formData.commissionAmount} onChange={handleChange} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Endorsement Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                                <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center space-x-2">
                                    <PlusCircle className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-base font-bold text-gray-800">Policy Endorsement</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                                        <div className="relative flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                name="isEndorsed"
                                                id="isEndorsed"
                                                checked={formData.isEndorsed}
                                                onChange={handleChange}
                                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded-lg cursor-pointer transition-all"
                                            />
                                        </div>
                                        <label htmlFor="isEndorsed" className="text-sm font-semibold text-purple-900 cursor-pointer select-none">
                                            Ownership Transfer / Detail Change Required?
                                        </label>
                                    </div>

                                    {formData.isEndorsed && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-purple-400 uppercase mb-1">Endorsement Reference Number</label>
                                                <input
                                                    type="text"
                                                    name="endorsementNumber"
                                                    value={formData.endorsementNumber}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-purple-50/20"
                                                    placeholder="END-XXXXXXXXX"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-purple-400 uppercase mb-1">New Customer Name</label>
                                                <input
                                                    type="text"
                                                    name="newCustomerName"
                                                    value={formData.newCustomerName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-purple-50/20"
                                                    placeholder="Recipient Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-purple-400 uppercase mb-1">New Mobile Number</label>
                                                <input
                                                    type="text"
                                                    name="newMobileNumber"
                                                    value={formData.newMobileNumber}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-purple-50/20 font-mono"
                                                    placeholder="9000000000"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {!formData.isEndorsed && (
                                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                                            <p className="text-xs text-gray-400">Regular Policy (No Endorsement)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes Section - Full Width */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-gray-500" />
                                <h3 className="text-base font-bold text-gray-800">Additional Notes & Observations</h3>
                            </div>
                            <div className="p-5">
                                <textarea
                                    name="notes"
                                    rows="1"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm min-h-[80px]"
                                    placeholder="Enter additional details, coverage specifics, or internal flags here..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Bottom Bar Actions (Secondary sticky-like feel) */}
                {!isViewMode && (
                    <div className="mt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto btn-primary py-3 px-10 shadow-lg flex items-center justify-center text-sm font-bold rounded-xl"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Processing...' : isEditMode ? 'Update Record' : 'Create Record'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default PolicyForm;
