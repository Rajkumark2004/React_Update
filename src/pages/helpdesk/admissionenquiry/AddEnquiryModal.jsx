import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';
import { sanitizeName, sanitizePhone, validateName, validatePhone, validateDateRange } from '../../../utils/validation';

const AddEnquiryModal = ({ show, onClose, classList, sourceList, staffList, referenceList, onSuccess }) => {
    console.log('DEBUG: AddEnquiryModal Props:', { classList, sourceList, staffList, referenceList });
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        address: '',
        description: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        follow_up_date: new Date().toISOString().split('T')[0],
        assigned: '',
        reference: '',
        source: '',
        class_id: '',
        no_of_child: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let sanitized = value;
        if (name === 'name') sanitized = sanitizeName(value);
        if (name === 'contact') sanitized = sanitizePhone(value);
        setFormData(prev => ({
            ...prev,
            [name]: sanitized
        }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const nameErr = validateName(formData.name);
        if (nameErr) newErrors.name = nameErr;
        const phoneErr = validatePhone(formData.contact);
        if (phoneErr) newErrors.contact = phoneErr;
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.source) newErrors.source = 'Source is required';
        const dateRangeErr = validateDateRange(formData.date, formData.follow_up_date, 'Enquiry Date', 'Next Follow Up Date');
        if (dateRangeErr) newErrors.follow_up_date = dateRangeErr;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Format date for API (DD-MM-YYYY)
    const formatDateForApi = (dateStr) => {
        if (!dateStr) return '';
        // Input is YYYY-MM-DD from input type="date", convert to DD-MM-YYYY
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Prepare data for API - matching Postman body structure
            const apiData = {
                name: formData.name,
                contact: formData.contact,
                address: formData.address,
                reference: formData.reference,
                date: formatDateForApi(formData.date),
                description: formData.description,
                follow_up_date: formatDateForApi(formData.follow_up_date),
                note: formData.note,
                source: formData.source,
                email: formData.email,
                assigned: formData.assigned || '1',
                class: formData.class_id,
                no_of_child: formData.no_of_child || '1',
                status: 'active',
                created_by: '1'
            };

            console.log('Submitting enquiry apiData:', apiData);
            const response = await api.addEnquiry(apiData);
            console.log('Add Enquiry API Response:', response);

            // Reset form
            setFormData({
                name: '',
                contact: '',
                email: '',
                address: '',
                description: '',
                note: '',
                date: new Date().toISOString().split('T')[0],
                follow_up_date: new Date().toISOString().split('T')[0],
                assigned: '',
                reference: '',
                source: '',
                class_id: '',
                no_of_child: ''
            });

            toast.success('Enquiry added successfully');
            onSuccess();
        } catch (err) {
            console.error('Error adding enquiry:', err);
            toast.error(err.message || 'Failed to add enquiry');
        } finally {
            setTimeout(() => setLoading(false), 5000);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal fade in" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content modal-media-content">
                    <div className="modal-header modal-media-header">
                        <button type="button" className="close" onClick={handleClose}>&times;</button>
                        <h4 className="box-title">Admission Enquiry</h4>
                    </div>
                    <div className="modal-body pt0 pb0">

                        <form id="formadd" onSubmit={handleSubmit} className="ptt10">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12">
                                    <div className="row">
                                        {/* Name */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Name<small className="req"> *</small></label>
                                                <input
                                                    type="text"
                                                    id="name_add"
                                                    autoComplete="off"
                                                    className="form-control"
                                                    name="name"
                                                    maxLength={50}
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                />
                                                {errors.name && <span className="text-danger">{errors.name}</span>}
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Phone<small className="req"> *</small></label>
                                                <input
                                                    type="text"
                                                    id="number"
                                                    autoComplete="off"
                                                    name="contact"
                                                    className="form-control"
                                                    maxLength={15}
                                                    value={formData.contact}
                                                    onChange={handleChange}
                                                />
                                                {errors.contact && <span className="text-danger">{errors.contact}</span>}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input
                                                    type="text"
                                                    name="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Address</label>
                                                <textarea
                                                    name="address"
                                                    className="form-control"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea
                                                    name="description"
                                                    className="form-control"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Note */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Note</label>
                                                <textarea
                                                    name="note"
                                                    className="form-control"
                                                    value={formData.note}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Date<small className="req"> *</small></label>
                                                <input
                                                    type="date"
                                                    id="date"
                                                    name="date"
                                                    className="form-control"
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                />
                                                {errors.date && <span className="text-danger">{errors.date}</span>}
                                            </div>
                                        </div>

                                        {/* Next Follow Up Date */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Next Follow Up Date<small className="req"> *</small></label>
                                                <input
                                                    type="date"
                                                    id="date_of_call"
                                                    name="follow_up_date"
                                                    className="form-control"
                                                    value={formData.follow_up_date}
                                                    onChange={handleChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.follow_up_date && <span className="text-danger">{errors.follow_up_date}</span>}
                                            </div>
                                        </div>

                                        {/* Assigned */}
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Assigned</label>
                                                <select
                                                    name="assigned"
                                                    className="form-control"
                                                    value={formData.assigned}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select</option>
                                                    {staffList.map(staff => (
                                                        <option key={staff.id} value={staff.id}>
                                                            {staff.name} {staff.surname} ({staff.employee_id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Reference */}
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Reference</label>
                                                <select
                                                    name="reference"
                                                    className="form-control"
                                                    value={formData.reference}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select</option>
                                                    {referenceList.map((ref, idx) => (
                                                        <option key={idx} value={ref.reference}>{ref.reference}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Source */}
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Source<small className="req"> *</small></label>
                                                <select
                                                    name="source"
                                                    className="form-control"
                                                    value={formData.source}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select</option>
                                                    {sourceList.map((src, idx) => (
                                                        <option key={idx} value={src.source}>{src.source}</option>
                                                    ))}
                                                </select>
                                                {errors.source && <span className="text-danger">{errors.source}</span>}
                                            </div>
                                        </div>

                                        {/* Class */}
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Class</label>
                                                <select
                                                    name="class_id"
                                                    className="form-control"
                                                    value={formData.class_id}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select</option>
                                                    {classList.map(cls => (
                                                        <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Number of Child */}
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Number Of Child</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="1"
                                                    name="no_of_child"
                                                    value={formData.no_of_child}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="box-footer col-md-12">
                                    <button
                                        type="submit"
                                        className="btn btn-info pull-right"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><i className="fa fa-spinner fa-spin"></i> Please Wait</>
                                        ) : (
                                            'Save'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEnquiryModal;
