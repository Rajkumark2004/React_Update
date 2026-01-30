import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';

const EditEnquiryModal = ({ show, onClose, enquiry, classList, sourceList, onSuccess }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        contact: '',
        email: '',
        address: '',
        description: '',
        note: '',
        date: '',
        follow_up_date: '',
        assigned: '',
        reference: '',
        source: '',
        class_id: '',
        no_of_child: '',
        status: 'active'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    // Local state for lists (initialized with props or defaults)
    const [localClassList, setLocalClassList] = useState(classList || []);
    const [localSourceList, setLocalSourceList] = useState(sourceList || []);
    const [localStaffList, setLocalStaffList] = useState([
        { id: '1', name: 'Admin', surname: 'User', employee_id: 'EMP001' },
        { id: '2', name: 'Staff', surname: 'Member', employee_id: 'EMP002' }
    ]);
    const [localReferenceList, setLocalReferenceList] = useState([
        { reference: 'Parent' },
        { reference: 'Friend' },
        { reference: 'Employee' },
        { reference: 'Other' }
    ]);

    // Status options
    const enquiryStatus = {
        'active': 'Active',
        'passive': 'Passive',
        'dead': 'Dead',
        'won': 'Won',
        'lost': 'Lost'
    };

    // Populate form when enquiry changes or fresh data is fetched
    useEffect(() => {
        const fetchDetails = async () => {
            if (show && enquiry && enquiry.id) {
                try {
                    setFetchingDetails(true);
                    const response = await api.getEnquiryDetails(enquiry.id);
                    if (response && response.data) {
                        const { enquiry_data, class_list, stff_list, source: apiSource, Reference } = response.data;

                        // Update lists if provided by API
                        if (class_list) setLocalClassList(class_list);
                        if (stff_list) setLocalStaffList(stff_list);
                        if (apiSource) setLocalSourceList(apiSource);
                        if (Reference) setLocalReferenceList(Reference);

                        if (enquiry_data) {
                            const data = enquiry_data;

                            const safeVal = (val) => {
                                if (val === null || val === undefined) return '';
                                if (typeof val === 'object') return '';
                                return String(val);
                            };

                            // Helper to convert DD-MM-YYYY (API) to YYYY-MM-DD (Input)
                            // Defaults to today if invalid/empty/1970 to avoid display errors
                            const toInputDate = (dateStr) => {
                                const today = new Date().toISOString().split('T')[0];

                                // Strip time if present (e.g. "2025-02-19 12:00:00")
                                let cleanDate = dateStr;
                                if (dateStr && typeof dateStr === 'string' && dateStr.includes(' ')) {
                                    cleanDate = dateStr.split(' ')[0];
                                }

                                if (!cleanDate ||
                                    cleanDate === '0000-00-00' ||
                                    cleanDate === '00-00-0000' ||
                                    cleanDate === 'null' ||
                                    cleanDate.includes('1970')) { // Aggressively block 1970
                                    return today;
                                }

                                let formatted = today;

                                // If it's already YYYY-MM-DD
                                if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
                                    formatted = cleanDate;
                                }
                                // If it's DD-MM-YYYY or DD/MM/YYYY
                                else if (cleanDate.includes('-') || cleanDate.includes('/')) {
                                    const sep = cleanDate.includes('-') ? '-' : '/';
                                    const parts = cleanDate.split(sep);
                                    if (parts.length === 3) {
                                        const [d, m, y] = parts;
                                        // Standard DD-MM-YYYY
                                        if (y.length === 4) formatted = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                        // YYYY-MM-DD check
                                        else if (d.length === 4) formatted = `${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`;
                                    }
                                }

                                // Final Safety Check for 1970 result
                                if (formatted.startsWith('1970')) return today;
                                return formatted;
                            };

                            setFormData({
                                id: safeVal(data.id),
                                name: safeVal(data.name),
                                contact: safeVal(data.contact),
                                email: safeVal(data.email),
                                address: safeVal(data.address),
                                description: safeVal(data.description),
                                note: safeVal(data.note),
                                date: toInputDate(data.date),
                                follow_up_date: toInputDate(data.follow_up_date),
                                assigned: safeVal(data.staff_id || data.assigned),
                                reference: safeVal(data.reference),
                                source: safeVal(data.source),
                                class_id: safeVal(data.class_id),
                                no_of_child: safeVal(data.no_of_child),
                                status: safeVal(data.status) || 'active'
                            });
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch enquiry details:', err);
                    const today = new Date().toISOString().split('T')[0];
                    // Fallback to passed enquiry object if fetch fails
                    setFormData({
                        id: enquiry.id || '',
                        name: enquiry.name || '',
                        contact: enquiry.contact || '',
                        email: enquiry.email || '',
                        address: enquiry.address || '',
                        description: enquiry.description || '',
                        note: enquiry.note || '',
                        date: enquiry.date || today,
                        follow_up_date: enquiry.next_date || enquiry.follow_up_date || today,
                        assigned: enquiry.assigned || '',
                        reference: enquiry.reference || '',
                        source: enquiry.source || '',
                        class_id: enquiry.class_id || '',
                        no_of_child: enquiry.no_of_child || '',
                        status: enquiry.status || 'active'
                    });
                } finally {
                    setFetchingDetails(false);
                }
            }
        };

        fetchDetails();
    }, [show, enquiry, classList, sourceList]); // Add props to dependency mainly for initial load

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.contact.trim()) newErrors.contact = 'Phone is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.source) newErrors.source = 'Source is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Get current timestamp for created_by
    const getCurrentTimestamp = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Prepare payload according to Postman example
            const payload = {
                name: formData.name,
                contact: formData.contact,
                email: formData.email,
                address: formData.address,
                description: formData.description,
                note: formData.note,
                assigned: formData.assigned || '1',
                reference: formData.reference,
                source: formData.source,
                class_id: formData.class_id,
                no_of_child: formData.no_of_child || '1',
                status: formData.status || 'active',
                created_by: getCurrentTimestamp() // Postman: "19-01-2026 18:34:55"
            };

            // Date conversion helper (Postman: "YYYY-MM-DD", UI input is YYYY-MM-DD)
            // If the input is already YYYY-MM-DD, just return it.
            const toApiDate = (dateStr) => {
                // If it's already YYYY-MM-DD (standard input value)
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

                // If checking for other formats just in case, but input type="date" gives YYYY-MM-DD
                return dateStr;
            };

            const formattedDate = toApiDate(formData.date);
            const formattedFollowUp = toApiDate(formData.follow_up_date);

            payload.date = formattedDate;
            payload.follow_up_date = formattedFollowUp;
            // payload.next_date removed as per instruction - not in API response
            payload.followupdate = formattedDate;  // Sometimes used for sorting/display

            console.log('Updating enquiry payload with date keys:', payload);
            const response = await api.updateEnquiry(formData.id, payload);
            console.log('Update Enquiry API Response:', response);

            setLoading(false);
            toast.success('Enquiry updated successfully');
            onSuccess();
        } catch (err) {
            console.error('Failed to update enquiry:', err);
            setLoading(false);
            toast.error(err.message || 'Error updating enquiry');
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
                        <button type="button" className="close" onClick={handleClose}>×</button>
                        <h4 className="box-title">Edit Admission Enquiry</h4>
                    </div>
                    <div className="modal-body pt0 pb0">
                        <div id="alert_message"></div>
                        {fetchingDetails ? (
                            <div className="text-center ptt10 pbb10">
                                <i className="fa fa-spinner fa-spin fa-2x"></i>
                                <p>Fetching details...</p>
                            </div>
                        ) : (
                            <form id="myForm1" onSubmit={handleSubmit} className="ptt10">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12">
                                        <div className="row">
                                            {/* Name */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Name<small className="req"> *</small></label>
                                                    <input
                                                        type="text"
                                                        autoComplete="off"
                                                        className="form-control"
                                                        name="name"
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
                                                        autoComplete="off"
                                                        name="contact"
                                                        className="form-control"
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
                                                        autoComplete="off"
                                                        name="email"
                                                        className="form-control"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label>Address</label>
                                                    <textarea
                                                        name="address"
                                                        className="form-control"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                    ></textarea>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label>Description</label>
                                                    <textarea
                                                        name="description"
                                                        className="form-control"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                    ></textarea>
                                                </div>
                                            </div>

                                            {/* Note */}
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label>Note</label>
                                                    <textarea
                                                        name="note"
                                                        className="form-control"
                                                        value={formData.note}
                                                        onChange={handleChange}
                                                    ></textarea>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Date<small className="req"> *</small></label>
                                                    <input
                                                        type="date"
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
                                                    <label>Next Follow Up Date</label>
                                                    <input
                                                        type="date"
                                                        name="follow_up_date"
                                                        className="form-control"
                                                        value={formData.follow_up_date}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Status</label>
                                                    <select
                                                        name="status"
                                                        className="form-control"
                                                        value={String(formData.status || '')}
                                                        onChange={handleChange}
                                                    >
                                                        {Object.entries(enquiryStatus).map(([key, value]) => (
                                                            <option key={key} value={key}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Assigned */}
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label>Assigned</label>
                                                    <select
                                                        name="assigned"
                                                        className="form-control"
                                                        value={String(formData.assigned || '')}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {localStaffList.map(staff => (
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
                                                        value={String(formData.reference || '')}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {localReferenceList.map((ref, idx) => (
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
                                                        value={String(formData.source || '')}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {localSourceList.map((src, idx) => (
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
                                                        value={String(formData.class_id || '')}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {localClassList.map(cls => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* No of Child */}
                                            <div className="col-sm-3">
                                                <div className="form-group">
                                                    <label>Number of Child</label>
                                                    <input
                                                        type="number"
                                                        name="no_of_child"
                                                        className="form-control"
                                                        value={formData.no_of_child}
                                                        onChange={handleChange}
                                                        min="1"
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
                                                'Update'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEnquiryModal;
