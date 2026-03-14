import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const ApplyDiscountModal = ({ show, handleClose, student, feeData, onSuccess }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'discount',
        description: '',
        amount: '',
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
        // Even if multiple fees are selected, only apply discount to the first selected row
        const selectedItems = feeData?.selectedItems || [];
        const feearray = feeData?.apiResponse?.feearray || [];

        if (selectedItems.length > 0 && feearray.length > 0) {
            const firstSelected = selectedItems[0];
            const match = feearray.find(f =>
                String(f.fee_groups_feetype_id) === String(firstSelected.fee_groups_feetype_id)
            );
            return match ? [match] : [feearray[0]];
        }
        if (feearray.length > 0) return [feearray[0]];
        if (selectedItems.length > 0) return [selectedItems[0]];
        return [];
    };

    useEffect(() => {
        if (student && feeData) {
            const items = getItems();
            if (feeData.is_batch && items.length > 0) {
                // Initialize editable amounts for each fee item
                const initialAmounts = {};
                items.forEach((item, idx) => {
                    // Use enteredDiscount if available and it's a single item selection
                    if (items.length === 1 && feeData.enteredDiscount) {
                        initialAmounts[idx] = parseFloat(feeData.enteredDiscount).toFixed(2);
                    } else {
                        initialAmounts[idx] = parseFloat(item.fee_remaing_amount || item.balance || 0).toFixed(2);
                    }
                });
                setFeeAmounts(initialAmounts);
            } else {
                setFormData(prev => ({
                    ...prev,
                    amount: feeData.enteredDiscount || feeData.balance || '',
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
        const clampedValue = Math.min(numValue, maxAmount);
        setFeeAmounts(prev => ({ ...prev, [idx]: clampedValue.toFixed(2) }));
    };

    // Calculate total pay for batch mode
    const calculateTotalPay = () => {
        const items = getItems();
        if (!feeData?.is_batch) return parseFloat(formData.amount) || 0;
        return Object.values(feeAmounts).reduce((sum, amt) => sum + (parseFloat(amt) || 0), 0);
    };

    const handleSubmit = async () => {
        const items = getItems();
        const totalPay = calculateTotalPay();
        if (totalPay <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                student_session_id: student.student_session_id,
                collected_date: formData.date,
                payment_mode_fee: formData.payment_mode,
                fee_gupcollected_note: formData.description,
                total_amount: totalPay.toFixed(2),
                parent_app_key: "",
                guardian_phone: "",
                guardian_email: ""
            };

            if (feeData?.is_batch) {
                payload['row_counter'] = items.map((_, i) => i + 1);
                payload.fee_type = items[0]?.type || items[0]?.feeTypeName || items[0]?.name || 'Discount';

                items.forEach((item, index) => {
                    const row = index + 1;
                    payload[`student_fees_master_id_${row}`] = item.id || item.fee_master_id || 0;
                    payload[`fee_groups_feetype_id_${row}`] = item.fee_groups_feetype_id || 0;
                    payload[`fee_groups_feetype_fine_amount_${row}`] = item.fine_amount || item.amount_fine || 0;
                    payload[`fee_category_${row}`] = item.fee_category || 'fees';
                    payload[`trans_fee_id_${row}`] = item.trans_fee_id || item.transport_fees_id || 0;
                    payload[`fee_amount_${row}`] = feeAmounts[index] || item.fee_remaing_amount || item.balance || 0;
                });
            } else {
                payload['row_counter'] = [1];
                payload.fee_type = feeData.type || feeData.feeTypeName || 'Discount';
                payload[`student_fees_master_id_1`] = feeData.id || feeData.fee_master_id || 0;
                payload[`fee_groups_feetype_id_1`] = feeData.fee_groups_feetype_id || 0;
                payload[`fee_groups_feetype_fine_amount_1`] = feeData.fine_amount_display || feeData.fine_amount || 0;
                payload[`fee_category_1`] = feeData.fee_category || 'fees';
                payload[`trans_fee_id_1`] = feeData.transport_fees_id || feeData.trans_fee_id || 0;
                payload[`fee_amount_1`] = formData.amount;
            }

            const response = await api.collectFeeDiscount(payload);

            if (response && (response.status === "success" || response.status === 1 || response.status === true)) {
                toast.success("Discount applied successfully");
                onSuccess();
                handleClose();
            } else {
                toast.error(response.message || "Failed to apply discount");
            }
        } catch (error) {
            console.error("Discount apply error:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <style>{`
                .adm-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1040; }
                .adm-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .adm-dialog { background: #fff; border-radius: 12px; width: 100%; max-width: 580px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
                .adm-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
                .adm-header h4 { margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; }
                .adm-header .badge { background: #fef3c7; color: #92400e; font-size: 12px; padding: 3px 10px; border-radius: 12px; margin-left: 10px; font-weight: 600; }
                .adm-close { background: none; border: none; font-size: 22px; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 6px; line-height: 1; }
                .adm-close:hover { background: #f1f5f9; color: #475569; }
                .adm-body { padding: 24px; overflow-y: auto; flex: 1; }
                .adm-section { margin-bottom: 20px; }
                .adm-section-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
                .adm-form-row { display: flex; align-items: center; margin-bottom: 14px; gap: 12px; }
                .adm-form-label { width: 100px; min-width: 100px; font-size: 14px; font-weight: 500; color: #475569; }
                .adm-form-label .req { color: #ef4444; }
                .adm-form-input { flex: 1; }
                .adm-form-input input, .adm-form-input textarea { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #1e293b; outline: none; transition: border-color 0.2s; }
                .adm-form-input input:focus, .adm-form-input textarea:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
                .adm-mode-tag { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 20px; font-size: 13px; font-weight: 600; color: #92400e; }
                .adm-fee-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px; background: #fff; transition: box-shadow 0.2s; }
                .adm-fee-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
                .adm-fee-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
                .adm-fee-name { font-size: 15px; font-weight: 600; color: #1e293b; }
                .adm-fee-type { display: inline-block; font-size: 11px; font-weight: 600; color: #6366f1; background: #eef2ff; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
                .adm-fee-code { font-size: 12px; color: #94a3b8; margin-top: 3px; }
                .adm-fee-balance-box { text-align: right; min-width: 100px; }
                .adm-fee-balance-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
                .adm-fee-balance-value { font-size: 17px; font-weight: 700; color: #0284c7; }
                .adm-fee-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px dashed #e2e8f0; }
                .adm-fee-pay-label { font-size: 14px; font-weight: 500; color: #475569; }
                .adm-fee-pay-input { display: flex; align-items: center; }
                .adm-fee-pay-prefix { background: #f1f5f9; border: 1px solid #cbd5e1; border-right: none; padding: 7px 10px; border-radius: 6px 0 0 6px; font-weight: 600; color: #475569; font-size: 14px; }
                .adm-fee-pay-field { border-radius: 0 6px 6px 0 !important; text-align: right; font-weight: 600; font-size: 15px; color: #0f172a; width: 130px; padding: 7px 10px; border: 1px solid #cbd5e1; outline: none; }
                .adm-fee-pay-field:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
                .adm-fine-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 4px; margin-top: 6px; }
                .adm-total { background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); border: 1px solid #fde68a; border-radius: 10px; padding: 18px 24px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
                .adm-total-label { font-size: 16px; font-weight: 600; color: #92400e; }
                .adm-total-amount { font-size: 26px; font-weight: 800; color: #b45309; }
                .adm-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .adm-btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
                .adm-btn-cancel { background: #f1f5f9; color: #475569; }
                .adm-btn-cancel:hover { background: #e2e8f0; }
                .adm-btn-apply { background: #f59e0b; color: #fff; }
                .adm-btn-apply:hover { background: #d97706; }
                .adm-btn-apply:disabled { background: #94a3b8; cursor: not-allowed; }
            `}</style>
            <div className="adm-overlay" onClick={handleClose}></div>
            <div className="adm-modal">
                <div className="adm-dialog">
                    <div className="adm-header">
                        <h4>
                            <i className="fa fa-tag" style={{ color: '#f59e0b', marginRight: '8px' }}></i>
                            Apply Discount
                            {feeData?.is_batch && <span className="badge">{feeData.selectedItems?.length || 0} selected</span>}
                            {!feeData?.is_batch && (feeData?.name || feeData?.feeTypeName) && <span className="badge">{feeData.name || feeData.feeTypeName}</span>}
                        </h4>
                        <button className="adm-close" onClick={handleClose}>&times;</button>
                    </div>
                    <div className="adm-body">
                        {/* Discount Details */}
                        <div className="adm-section">
                            <div className="adm-section-title">Discount Details</div>

                            <div className="adm-form-row">
                                <div className="adm-form-label">Date <span className="req">*</span></div>
                                <div className="adm-form-input">
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="adm-form-row">
                                <div className="adm-form-label">Mode</div>
                                <div className="adm-form-input">
                                    <div className="adm-mode-tag">
                                        <i className="fa fa-tag"></i> Discount
                                    </div>
                                </div>
                            </div>

                            <div className="adm-form-row">
                                <div className="adm-form-label">Note</div>
                                <div className="adm-form-input">
                                    <textarea name="description" rows="2" placeholder="Reason for discount (optional)" value={formData.description} onChange={handleChange}></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Single Fee Amount */}
                        {!feeData?.is_batch && (
                            <div className="adm-section">
                                <div className="adm-section-title">Discount Amount</div>
                                <div className="adm-form-row">
                                    <div className="adm-form-label">Amount ({currencySymbol}) <span className="req">*</span></div>
                                    <div className="adm-form-input">
                                        <input type="number" name="amount" placeholder="Enter discount amount" value={formData.amount} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Batch Fee Items */}
                        {feeData?.is_batch && getItems().length > 0 && (
                            <div className="adm-section">
                                <div className="adm-section-title">Fee to Discount</div>
                                {getItems().map((item, idx) => (
                                    <div className="adm-fee-card" key={idx}>
                                        <div className="adm-fee-top">
                                            <div>
                                                <div className="adm-fee-name">
                                                    {item.name || item.groupName || 'Fee Group'}
                                                    {(item.type || item.feeTypeName) && (
                                                        <span className="adm-fee-type">{item.type || item.feeTypeName || item.fee_category}</span>
                                                    )}
                                                </div>
                                                <div className="adm-fee-code">{item.code || item.feeTypeCode || item.fee_category}</div>
                                                {(item.fine_amount > 0 || item.amount_fine > 0) && (
                                                    <div className="adm-fine-badge">
                                                        <i className="fa fa-exclamation-circle"></i>
                                                        Fine: {currencySymbol}{amountFormat(item.fine_amount || item.amount_fine)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="adm-fee-balance-box">
                                                <div className="adm-fee-balance-label">Balance</div>
                                                <div className="adm-fee-balance-value">{currencySymbol}{amountFormat(item.fee_remaing_amount || item.balance || 0)}</div>
                                            </div>
                                        </div>
                                        <div className="adm-fee-bottom">
                                            <span className="adm-fee-pay-label">Discount Amount</span>
                                            <div className="adm-fee-pay-input">
                                                <span className="adm-fee-pay-prefix">{currencySymbol}</span>
                                                <input
                                                    type="number"
                                                    className="adm-fee-pay-field"
                                                    value={feeAmounts[idx] || ''}
                                                    onChange={(e) => handleFeeAmountChange(idx, e.target.value, item.fee_remaing_amount || item.balance)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total */}
                        <div className="adm-total">
                            <span className="adm-total-label">Total Discount</span>
                            <span className="adm-total-amount">{currencySymbol}{amountFormat(calculateTotalPay())}</span>
                        </div>
                    </div>
                    <div className="adm-footer">
                        <button type="button" className="adm-btn adm-btn-cancel" onClick={handleClose}>Cancel</button>
                        <button
                            type="button"
                            className="adm-btn adm-btn-apply"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <i className="fa fa-spinner fa-spin"></i> : <><i className="fa fa-check"></i> Apply Discount</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ApplyDiscountModal;
