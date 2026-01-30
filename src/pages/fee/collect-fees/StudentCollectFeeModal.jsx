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
    const [currencySymbol] = useState('₹');

    useEffect(() => {
        if (student && feeData) {
            if (feeData.is_batch && feeData.selectedItems) {
                // Initialize editable amounts for each fee item
                const initialAmounts = {};
                feeData.selectedItems.forEach((item, idx) => {
                    initialAmounts[idx] = parseFloat(item.balance || 0).toFixed(2);
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
                    totalbalanceAmount: feeData.balance || 0, // Added based on user request
                    fee_type: feeData.selectedItems[0]?.groupName || 'Fees', // Added based on user request
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

    return (
        <>
            <style>{`
                .collect_grp_fees { font-size: 15px; font-weight: 600; padding-bottom: 15px; }
                .fees-list { list-style: none; margin: 0; padding: 0; }
                .fees-list > .item { border-radius: 3px; box-shadow: 0 1px 1px rgba(0,0,0,0.1); padding: 10px 0; background: #fff; }
                .fees-list .product-info { margin-left: 0; }
                .fees-list .product-title { font-weight: 600; font-size: 15px; display: flex; justify-content: space-between; color: #00a2d4; }
                .fees-list .product-description { display: block; color: #999; font-size: 13px; }
                .fees-list-in-box > .item { box-shadow: none; border-radius: 0; border-bottom: 1px solid #f4f4f4; padding: 15px 0; }
                .fees-list-in-box > .item:last-of-type { border-bottom-width: 0; }
                .fees-footer { padding: 15px 0 0 0; text-align: right; border-top: 1px solid #e5e5e5; }
                .fine-label { color: #dd4b39; font-weight: 600; }
            `}</style>
            <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={handleClose}>&times;</button>
                            <h4 className="modal-title title text-center fees_title">
                                Collect Fees {feeData?.is_batch ? `(${feeData.selectedItems?.length || 0} items)` : `(${feeData?.name || ''})`}
                            </h4>
                        </div>
                        <div className="modal-body pb0">
                            <div className="form-horizontal">
                                {/* Date Field */}
                                <div className="form-group row">
                                    <label className="col-sm-3 control-label">Date <small className="req">*</small></label>
                                    <div className="col-sm-9">
                                        <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="form-group row">
                                    <label className="col-sm-3 control-label">Payment Mode</label>
                                    <div className="col-sm-9">
                                        {['Cash', 'Cheque', 'DD', 'Bank Transfer', 'UPI', 'Card'].map(mode => (
                                            <label className="radio-inline" key={mode}>
                                                <input
                                                    type="radio"
                                                    name="payment_mode_fee"
                                                    value={mode}
                                                    checked={formData.payment_mode === mode}
                                                    onChange={() => handlePaymentModeChange(mode)}
                                                /> {mode}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Reference No */}
                                <div className="form-group row">
                                    <label className="col-sm-3 control-label">Reference No</label>
                                    <div className="col-sm-6">
                                        <input type="text" name="reference_no" className="form-control" value={formData.reference_no} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="form-group row">
                                    <label className="col-sm-3 control-label">Note</label>
                                    <div className="col-sm-9">
                                        <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange}></textarea>
                                    </div>
                                </div>

                                {/* Single Fee Fields */}
                                {!feeData?.is_batch && (
                                    <>
                                        <div className="form-group row">
                                            <label className="col-sm-3 control-label">Amount ({currencySymbol}) <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="number" name="amount" className="form-control" value={formData.amount} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label className="col-sm-3 control-label">Discount ({currencySymbol})</label>
                                            <div className="col-sm-4">
                                                <input type="number" name="amount_discount" className="form-control" value={formData.amount_discount} onChange={handleChange} />
                                            </div>
                                            <label className="col-sm-1 control-label">Fine</label>
                                            <div className="col-sm-4">
                                                <input type="number" name="amount_fine" className="form-control" value={formData.amount_fine} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Batch Fee Items List */}
                                {feeData?.is_batch && feeData?.selectedItems && (
                                    <ul className="fees-list fees-list-in-box">
                                        {feeData.selectedItems.map((item, idx) => (
                                            <li className="item" key={idx}>
                                                <div className="product-info">
                                                    <div className="product-title">
                                                        <span>{item.groupName || 'Fee Group'} ({item.feeTypeName || item.fee_category})</span>
                                                        <span>{currencySymbol}{parseFloat(item.balance).toFixed(2)}</span>
                                                    </div>
                                                    <span className="product-description">{item.feeTypeCode || item.fee_category}</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        style={{ marginTop: '8px', maxWidth: '200px' }}
                                                        value={feeAmounts[idx] || ''}
                                                        onChange={(e) => handleFeeAmountChange(idx, e.target.value, item.balance)}
                                                    />
                                                    {item.fine_amount > 0 && (
                                                        <div className="fine-label" style={{ marginTop: '5px' }}>
                                                            Fine: {currencySymbol}{parseFloat(item.fine_amount).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Total Pay */}
                                <div className="row collect_grp_fees" style={{ marginTop: '15px' }}>
                                    <div className="col-md-8">
                                        <span className="pull-right">Total Pay</span>
                                    </div>
                                    <div className="col-md-4">
                                        <span className="pull-right" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                            {currencySymbol}{calculateTotalPay().toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer fees-footer">
                            <button type="button" className="btn btn-default pull-left" onClick={handleClose}>Cancel</button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <i className="fa fa-spinner fa-spin"></i> : <><i className="fa fa-money"></i> Pay</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade in"></div>
        </>
    );
};

export default StudentCollectFeeModal;
