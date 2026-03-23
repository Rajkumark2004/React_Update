import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const StudentCollectFeeModal = ({ show, handleClose, student, feeData, onSuccess }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
        reference_no: '',
        description: '',
        // For single fee collection
        amount: '',
        amount_discount: '0',
        amount_fine: '0',
    });

    // State for batch fee amounts (editable per item)
    const [feeAmounts, setFeeAmounts] = useState({});
    const [loading, setLoading] = useState(false);
    const currencySymbol = '₹';

    // Indian currency formatting (en-IN locale) matching StudentAddFee.jsx
    const amountFormat = (amount) => {
        if (amount === null || amount === undefined) return "0.00";
        return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getItems = () => {
        if (feeData?.apiResponse?.feearray) return feeData.apiResponse.feearray;
        return feeData?.selectedItems || [];
    };

    // Compute per-row balance: amount - (paid + discounts) from amount_detail
    const getRowBalance = (item) => {
        const feeAmount = parseFloat(item.amount || item.student_fees_master_amount || 0);
        let paid = 0;
        let discount = 0;
        let amountDetail = [];
        try {
            if (item.amount_detail) {
                let parsed = item.amount_detail;
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                if (Array.isArray(parsed)) amountDetail = parsed;
                else if (parsed && typeof parsed === 'object') amountDetail = Object.values(parsed);
            }
        } catch (e) { amountDetail = []; }
        amountDetail.forEach(d => {
            paid += parseFloat(d.amount || 0);
            discount += parseFloat(d.amount_discount || 0);
        });
        const balance = feeAmount - (paid + discount);
        return balance > 0 ? balance : 0;
    };

    useEffect(() => {
        if (student && feeData) {
            const items = getItems();
            if (feeData.is_batch && items.length > 0) {
                // Initialize editable amounts for each fee item
                const initialAmounts = {};
                items.forEach((item, idx) => {
                    const rowAmount = getRowBalance(item);
                    initialAmounts[idx] = parseFloat(rowAmount).toFixed(2);
                });
                setFeeAmounts(initialAmounts);
            } else {
                setFormData(prev => ({
                    ...prev,
                    amount: feeData.balance || '',
                }));
            }
        }
    }, [student, feeData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeeAmountChange = (idx, value, maxAmount) => {
        const numValue = parseFloat(value) || 0;
        // Don't allow amount greater than balance
        const clampedValue = Math.min(numValue, maxAmount);
        setFeeAmounts(prev => ({ ...prev, [idx]: clampedValue.toFixed(2) }));
    };

    const handlePaymentModeChange = (mode) => {
        setFormData(prev => ({ ...prev, payment_mode: mode }));
    };

    // Calculate total pay for batch mode
    const calculateTotalPay = () => {
        if (!feeData?.is_batch) return parseFloat(formData.amount) || 0;
        return Object.values(feeAmounts).reduce((sum, amt) => sum + (parseFloat(amt) || 0), 0);
    };

    const handleSubmit = async () => {
        const totalPay = calculateTotalPay();
        if (totalPay <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        setLoading(true);
        try {
            let response;
            if (feeData?.is_batch) {
                // Batch collection payload matching PHP format
                const payload = {
                    collected_date: formData.date,
                    payment_mode_fee: formData.payment_mode,
                    reference_no: formData.reference_no,
                    fee_gupcollected_note: formData.description,
                    total_amount: totalPay.toFixed(2),
                    totalbalanceAmount: feeData.balance || 0,
                    fee_type: getItems()[0]?.type || getItems()[0]?.feeTypeName || getItems()[0]?.name || getItems()[0]?.groupName || 'Fees',
                    student_session_id: student.student_session_id,
                    row_counter: feeData.selectedItems.map((_, i) => i + 1)
                };

                // Add individual fee details
                feeData.selectedItems.forEach((item, index) => {
                    const row = index + 1;
                    payload[`student_fees_master_id_${row}`] = item.fee_master_id || 0;
                    payload[`fee_groups_feetype_id_${row}`] = item.fee_groups_feetype_id || 0;
                    payload[`fee_groups_feetype_fine_amount_${row}`] = item.fine_amount || 0;
                    payload[`fee_category_${row}`] = item.fee_category;
                    payload[`trans_fee_id_${row}`] = item.trans_fee_id || 0;
                    payload[`fee_amount_${row}`] = feeAmounts[index] || item.balance || 0;
                });

                response = await api.collectFeeGroup(payload);
            } else {
                // Individual collection payload
                const payload = {
                    action: 'collect',
                    ...formData,
                    student_session_id: student.student_session_id,
                    student_fees_master_id: feeData.student_fees_master_id || '0',
                    fee_groups_feetype_id: feeData.fee_groups_feetype_id || '0',
                    transport_fees_id: feeData.transport_fees_id || '0',
                    fee_category: feeData.fee_category || 'fees',
                    fee_type: feeData.type || feeData.month || 'Fees',
                };
                response = await api.addStudentFee(payload);
            }

            if (response && (response.status === "success" || response.status === 1 || response.status === true)) {
                toast.success("Fees collected successfully");
                onSuccess();
                handleClose();
            } else {
                toast.error(response.error ? JSON.stringify(response.error) : "Failed to collect fees");
            }
        } catch (error) {
            console.error("Fee collection error:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const paymentModes = ['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'];

    return (
        <>
            <style>{`
                .cfm-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1040; }
                .cfm-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .cfm-dialog { background: #fff; border-radius: 12px; width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
                .cfm-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
                .cfm-header h4 { margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; }
                .cfm-header .badge { background: #dbeafe; color: #1d4ed8; font-size: 12px; padding: 3px 10px; border-radius: 12px; margin-left: 10px; font-weight: 600; }
                .cfm-close { background: none; border: none; font-size: 22px; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 6px; line-height: 1; }
                .cfm-close:hover { background: #f1f5f9; color: #475569; }
                .cfm-body { padding: 24px; overflow-y: auto; flex: 1; }
                .cfm-section { margin-bottom: 20px; }
                .cfm-section-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
                .cfm-form-row { display: flex; align-items: center; margin-bottom: 14px; gap: 12px; }
                .cfm-form-label { width: 120px; min-width: 120px; font-size: 14px; font-weight: 500; color: #475569; }
                .cfm-form-label .req { color: #ef4444; }
                .cfm-form-input { flex: 1; }
                .cfm-form-input input, .cfm-form-input textarea, .cfm-form-input select { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; }
                .cfm-form-input input:focus, .cfm-form-input textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                .cfm-payment-modes { display: flex; flex-wrap: wrap; gap: 8px; }
                .cfm-payment-mode { padding: 6px 14px; border: 1px solid #cbd5e1; border-radius: 20px; font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; background: #fff; transition: all 0.2s; }
                .cfm-payment-mode:hover { border-color: #3b82f6; color: #3b82f6; }
                .cfm-payment-mode.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
                .cfm-fee-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px; background: #fff; transition: box-shadow 0.2s; }
                .cfm-fee-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
                .cfm-fee-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
                .cfm-fee-name { font-size: 15px; font-weight: 600; color: #1e293b; }
                .cfm-fee-type { display: inline-block; font-size: 11px; font-weight: 600; color: #6366f1; background: #eef2ff; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
                .cfm-fee-code { font-size: 12px; color: #94a3b8; margin-top: 3px; }
                .cfm-fee-balance-box { text-align: right; min-width: 100px; }
                .cfm-fee-balance-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
                .cfm-fee-balance-value { font-size: 17px; font-weight: 700; color: #0284c7; }
                .cfm-fee-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px dashed #e2e8f0; }
                .cfm-fee-pay-label { font-size: 14px; font-weight: 500; color: #475569; }
                .cfm-fee-pay-input { display: flex; align-items: center; }
                .cfm-fee-pay-prefix { background: #f1f5f9; border: 1px solid #cbd5e1; border-right: none; padding: 7px 10px; border-radius: 6px 0 0 6px; font-weight: 600; color: #475569; font-size: 14px; }
                .cfm-fee-pay-field { border-radius: 0 6px 6px 0 !important; text-align: right; font-weight: 600; font-size: 15px; color: #0f172a; width: 130px; padding: 7px 10px; border: 1px solid #cbd5e1; outline: none; }
                .cfm-fee-pay-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                .cfm-fine-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 4px; margin-top: 6px; }
                .cfm-total { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px 24px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
                .cfm-total-label { font-size: 16px; font-weight: 600; color: #166534; }
                .cfm-total-amount { font-size: 26px; font-weight: 800; color: #15803d; }
                .cfm-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .cfm-btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
                .cfm-btn-cancel { background: #f1f5f9; color: #475569; }
                .cfm-btn-cancel:hover { background: #e2e8f0; }
                .cfm-btn-pay { background: #3b82f6; color: #fff; }
                .cfm-btn-pay:hover { background: #2563eb; }
                .cfm-btn-pay:disabled { background: #94a3b8; cursor: not-allowed; }
                .cfm-inline-fields { display: flex; gap: 12px; }
                .cfm-inline-fields > div { flex: 1; }
                .cfm-inline-fields label { font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 4px; display: block; }
            `}</style>
            <div className="cfm-overlay" onClick={handleClose}></div>
            <div className="cfm-modal">
                <div className="cfm-dialog">
                    <div className="cfm-header">
                        <h4>
                            <i className="fa fa-money" style={{ color: '#3b82f6', marginRight: '8px' }}></i>
                            Collect Fees
                            {feeData?.is_batch && <span className="badge">{feeData.selectedItems?.length || 0} items</span>}
                            {!feeData?.is_batch && feeData?.name && <span className="badge">{feeData.name}</span>}
                        </h4>
                        <button className="cfm-close" onClick={handleClose}>&times;</button>
                    </div>
                    <div className="cfm-body">
                        {/* Payment Details Section */}
                        <div className="cfm-section">
                            <div className="cfm-section-title">Payment Details</div>

                            <div className="cfm-form-row">
                                <div className="cfm-form-label">Date <span className="req">*</span></div>
                                <div className="cfm-form-input">
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="cfm-form-row">
                                <div className="cfm-form-label">Payment Mode</div>
                                <div className="cfm-form-input">
                                    <div className="cfm-payment-modes">
                                        {paymentModes.map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                className={`cfm-payment-mode ${formData.payment_mode === mode ? 'active' : ''}`}
                                                onClick={() => handlePaymentModeChange(mode)}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="cfm-form-row">
                                <div className="cfm-form-label">Reference No</div>
                                <div className="cfm-form-input">
                                    <input type="text" name="reference_no" placeholder="Enter reference number" value={formData.reference_no} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="cfm-form-row">
                                <div className="cfm-form-label">Note</div>
                                <div className="cfm-form-input">
                                    <textarea name="description" rows="2" placeholder="Add a note (optional)" value={formData.description} onChange={handleChange}></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Single Fee Fields */}
                        {!feeData?.is_batch && (
                            <div className="cfm-section">
                                <div className="cfm-section-title">Fee Amount</div>
                                <div className="cfm-form-row">
                                    <div className="cfm-form-label">Amount ({currencySymbol}) <span className="req">*</span></div>
                                    <div className="cfm-form-input">
                                        <input type="number" name="amount" placeholder="Enter amount" value={formData.amount} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="cfm-inline-fields">
                                    <div>
                                        <label>Discount ({currencySymbol})</label>
                                        <input type="number" name="amount_discount" value={formData.amount_discount} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                    </div>
                                    <div>
                                        <label>Fine ({currencySymbol})</label>
                                        <input type="number" name="amount_fine" value={formData.amount_fine} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Batch Fee Items */}
                        {feeData?.is_batch && getItems().length > 0 && (
                            <div className="cfm-section">
                                <div className="cfm-section-title">Fee Breakdown</div>
                                {getItems().map((item, idx) => (
                                    <div className="cfm-fee-card" key={idx}>
                                        <div className="cfm-fee-top">
                                            <div>
                                                <div className="cfm-fee-name">
                                                    {item.name || item.groupName || 'Fee Group'}
                                                    <span className="cfm-fee-type">{item.type || item.feeTypeName || item.fee_category}</span>
                                                </div>
                                                <div className="cfm-fee-code">{item.code || item.feeTypeCode || item.fee_category}</div>
                                                {(item.fine_amount > 0 || item.amount_fine > 0) && (
                                                    <div className="cfm-fine-badge">
                                                        <i className="fa fa-exclamation-circle"></i>
                                                        Fine: {currencySymbol}{amountFormat(item.fine_amount || item.amount_fine)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="cfm-fee-balance-box">
                                                <div className="cfm-fee-balance-label">Balance</div>
                                                <div className="cfm-fee-balance-value">{currencySymbol}{amountFormat(getRowBalance(item))}</div>
                                            </div>
                                        </div>
                                        <div className="cfm-fee-bottom">
                                            <span className="cfm-fee-pay-label">Amount to Pay</span>
                                            <div className="cfm-fee-pay-input">
                                                <span className="cfm-fee-pay-prefix">{currencySymbol}</span>
                                                <input
                                                    type="number"
                                                    className="cfm-fee-pay-field"
                                                    value={feeAmounts[idx] || ''}
                                                    onChange={(e) => handleFeeAmountChange(idx, e.target.value, getRowBalance(item))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total */}
                        <div className="cfm-total">
                            <span className="cfm-total-label">Total Payable Amount</span>
                            <span className="cfm-total-amount">{currencySymbol}{amountFormat(calculateTotalPay())}</span>
                        </div>
                    </div>
                    <div className="cfm-footer">
                        <button type="button" className="cfm-btn cfm-btn-cancel" onClick={handleClose}>Cancel</button>
                        <button
                            type="button"
                            className="cfm-btn cfm-btn-pay"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <i className="fa fa-spinner fa-spin"></i> : <><i className="fa fa-check"></i> Collect Payment</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentCollectFeeModal;
