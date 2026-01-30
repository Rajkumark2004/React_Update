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
    const [currencySymbol] = useState('₹');

    const getItems = () => {
        if (feeData?.apiResponse?.feearray) return feeData.apiResponse.feearray;
        return feeData?.selectedItems || [];
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
            // Format date as DD/MM/YYYY
            const dateParts = formData.date.split('-');
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

            const payload = {
                student_session_id: student.student_session_id,
                collected_date: formattedDate,
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
                                Apply Discount {feeData?.is_batch ? `(${feeData.selectedItems?.length || 0} items)` : `(${feeData?.name || feeData?.feeTypeName || ''})`}
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

                                {/* Payment Mode (Static as Discount) */}
                                <div className="form-group row">
                                    <label className="col-sm-3 control-label">Payment Mode</label>
                                    <div className="col-sm-9">
                                        <label className="radio-inline">
                                            <input
                                                type="radio"
                                                name="payment_mode_fee"
                                                value="discount"
                                                checked={true}
                                                readOnly
                                            /> Discount
                                        </label>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="form-group row">
                                    <label className="col-sm-3 control-label">Note</label>
                                    <div className="col-sm-9">
                                        <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange}></textarea>
                                    </div>
                                </div>

                                {/* Single Fee Amount */}
                                {!feeData?.is_batch && (
                                    <div className="form-group row">
                                        <label className="col-sm-3 control-label">Amount ({currencySymbol}) <small className="req">*</small></label>
                                        <div className="col-sm-9">
                                            <input type="number" name="amount" className="form-control" value={formData.amount} onChange={handleChange} />
                                        </div>
                                    </div>
                                )}

                                {/* Batch Fee Items List */}
                                {feeData?.is_batch && getItems().length > 0 && (
                                    <ul className="fees-list fees-list-in-box">
                                        {getItems().map((item, idx) => (
                                            <li className="item" key={idx}>
                                                <div className="product-info">
                                                    <div className="product-title">
                                                        <span>{item.name || item.groupName || 'Fee Group'} {item.type || item.feeTypeName ? `(${item.type || item.feeTypeName || item.fee_category})` : ''}</span>
                                                        <span>{currencySymbol}{parseFloat(item.fee_remaing_amount || item.balance || 0).toFixed(2)}</span>
                                                    </div>
                                                    <span className="product-description">{item.code || item.feeTypeCode || item.fee_category}</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        style={{ marginTop: '8px', maxWidth: '200px' }}
                                                        value={feeAmounts[idx] || ''}
                                                        onChange={(e) => handleFeeAmountChange(idx, e.target.value, item.fee_remaing_amount || item.balance)}
                                                    />
                                                    {(item.fine_amount > 0 || item.amount_fine > 0) && (
                                                        <div className="fine-label" style={{ marginTop: '5px' }}>
                                                            Fine: {currencySymbol}{parseFloat(item.fine_amount || item.amount_fine).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Total Discount Amount */}
                                <div className="row collect_grp_fees" style={{ marginTop: '15px' }}>
                                    <div className="col-md-8">
                                        <span className="pull-right">Total Discount Amount</span>
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
                                {loading ? <i className="fa fa-spinner fa-spin"></i> : <><i className="fa fa-check"></i> Apply Discount</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade in"></div>
        </>
    );
};

export default ApplyDiscountModal;
