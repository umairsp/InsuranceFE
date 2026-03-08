import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft } from 'lucide-react';

const PolicyForm = ({ isViewMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id) && !isViewMode;

    const [formData, setFormData] = useState({
        policyNumber: '',
        vehicleNumber: '',
        insuranceCompany: '',
        owner1: '',
        owner2: '',
        owner3: '',
        mobileNumber: '',
        policyStartDate: '',
        policyEndDate: '',
        premiumAmount: '',
        commissionAmount: '',
        customerPaidAmount: '',
        agentProfit: '',
        vehicleType: 'Car',
        notes: '',
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
        const { name, value } = e.target;
        let updatedFormData = { ...formData, [name]: value };

        if (name === 'premiumAmount' || name === 'customerPaidAmount') {
            const premium = name === 'premiumAmount' ? Number(value) : Number(formData.premiumAmount || 0);
            const paid = name === 'customerPaidAmount' ? Number(value) : Number(formData.customerPaidAmount || 0);
            const commission = premium * 0.45;
            const profit = paid - (premium - commission);

            updatedFormData.commissionAmount = commission;
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isViewMode ? 'View Policy Details' : isEditMode ? 'Edit Policy Details' : 'Add New Insurance Policy'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                <fieldset disabled={isViewMode} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Section 1: Policy Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Policy Information</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Policy Number *</label>
                                <input type="text" name="policyNumber" required value={formData.policyNumber} onChange={handleChange} className="input-field" placeholder="POL-123456789" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Insurance Company *</label>
                                <input type="text" name="insuranceCompany" required value={formData.insuranceCompany} onChange={handleChange} className="input-field" placeholder="ABC Insurance Ltd" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                                    <input type="date" name="policyStartDate" required value={formData.policyStartDate} onChange={handleChange} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
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
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg bg-gray-50">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Premium (₹) *</label>
                                    <input type="number" name="premiumAmount" required value={formData.premiumAmount} onChange={handleChange} className="input-field bg-white" placeholder="15000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer Paid (₹) *</label>
                                    <input type="number" name="customerPaidAmount" required value={formData.customerPaidAmount} onChange={handleChange} className="input-field bg-white" placeholder="14000" />
                                </div>
                                <div className="flex flex-col justify-center sm:border-l border-gray-200 sm:pl-4 pt-2 sm:pt-0">
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Net Profit</label>
                                    <div className="mt-1 flex items-baseline flex-wrap gap-2">
                                        <span className={`text-xl sm:text-2xl font-bold ${formData.agentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₹{formData.agentProfit || 0}
                                        </span>
                                        <span className="text-gray-400 text-[10px] sm:text-xs" title={`45% Commission: ₹${formData.commissionAmount || 0}`}>
                                            (45% com: ₹{formData.commissionAmount || 0})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Vehicle & Owner Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Vehicle & Owner</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vehicle Number *</label>
                                    <input type="text" name="vehicleNumber" required value={formData.vehicleNumber} onChange={handleChange} className="input-field" placeholder="MH-12-AB-1234" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vehicle Type *</label>
                                    <select name="vehicleType" required value={formData.vehicleType} onChange={handleChange} className="input-field">
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Commercial">Commercial/Truck</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Primary Owner Name *</label>
                                <input type="text" name="owner1" required value={formData.owner1} onChange={handleChange} className="input-field" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer Mobile *</label>
                                <input type="text" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange} className="input-field" placeholder="+91 9876543210" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Second Owner (Optional)</label>
                                    <input type="text" name="owner2" value={formData.owner2} onChange={handleChange} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Third Owner (Optional)</label>
                                    <input type="text" name="owner3" value={formData.owner3} onChange={handleChange} className="input-field" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Section 3: Additional Notes */}
                    <div className="pt-4">
                        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                        <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} className="input-field mt-1" placeholder="Any specific coverage details or agent notes..."></textarea>
                    </div>
                </fieldset>

                <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {isViewMode ? 'Go Back' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                        <button type="submit" disabled={saving} className="btn-primary flex items-center">
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Policy Record'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default PolicyForm;
