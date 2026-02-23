import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const CancelInvoiceModal = ({ show, handleClose, payment, onSuccess }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'Cancelled',
        description: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                status: 'Cancelled',
                description: '',
            });
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const mainInvoiceId = payment.id || payment.student_fees_deposite_id || payment.payment_id;

            if (!mainInvoiceId) {
                toast.error("Invalid payment ID");
                setLoading(false);
                return;
            }

            const payload = {
                receipt_id: mainInvoiceId,
                student_id: payment.student_id,
                class_id: payment.class_id,
                section_id: payment.section_id,
                cancelled_date: formData.date.split('-').reverse().join('/'), // Convert YYYY-MM-DD to DD/MM/YYYY
                status: '1',
                description: formData.description
            };

            const response = await api.updateInvoice(payload);

            if (response && (response.status === "success" || response.status === 1 || response.status === true || response.success)) {
                toast.success("Invoice cancelled successfully");
                onSuccess();
                handleClose();
            } else {
                toast.error(response.message || "Failed to cancel invoice");
            }
        } catch (error) {
            console.error("Cancel invoice error:", error);
            toast.error("An error occurred while cancelling invoice");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal fade in" style={{ display: 'block', paddingRight: '17px', background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={handleClose}>&times;</button>
                            <h4 className="modal-title title">Cancel Invoice</h4>
                        </div>
                        <div className="modal-body pb0">
                            <div className="form-horizontal">
                                <div className="form-group row">
                                    <div className="col-sm-12">
                                        <label className="control-label" style={{ textAlign: 'left', display: 'block', marginBottom: '5px' }}>Date</label>
                                        <input type="date" name="date" className="form-control" style={{ border: 'none', borderBottom: '1px solid #ddd', boxShadow: 'none', paddingLeft: 0 }} value={formData.date} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="form-group row mt-3">
                                    <div className="col-sm-12">
                                        <label className="control-label" style={{ textAlign: 'left', display: 'block', marginBottom: '5px' }}>Status</label>
                                        <select name="status" className="form-control" style={{ border: 'none', borderBottom: '1px solid #ddd', boxShadow: 'none', paddingLeft: 0, paddingBottom: 0, paddingTop: 0 }} value={formData.status} onChange={handleChange}>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group row mt-3">
                                    <div className="col-sm-12">
                                        <label className="control-label" style={{ textAlign: 'left', display: 'block', marginBottom: '5px' }}>Description</label>
                                        <textarea name="description" className="form-control" rows="2" style={{ border: 'none', borderBottom: '1px solid #ddd', boxShadow: 'none', paddingLeft: 0 }} value={formData.description} onChange={handleChange}></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                            <button
                                type="button"
                                className="btn"
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{ backgroundColor: '#a65dd4', color: '#fff', borderColor: '#a65dd4', borderRadius: '20px', padding: '6px 20px', float: 'left' }}
                            >
                                {loading ? <i className="fa fa-spinner fa-spin"></i> : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CancelInvoiceModal;
