import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import api from '../../../services/api';

const LeaveModal = ({ show, handleClose, onSuccess, initialData, isEdit, classList: propClassList }) => {
    const [loading, setLoading] = useState(false);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        class_id: '',
        section_id: '',
        student_id: '',
        apply_date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
        from_date: '',
        to_date: '',
        message: '',
        leave_status: '0', // 0: Pending, 1: Approve, 2: Disapprove
        userfile: null
    });
    const fileInputRef = useRef(null);

    // Initialize Dropify
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                try {
                    const $ = window.jQuery;
                    if ($ && $.fn && typeof $.fn.dropify === 'function') {
                        // Destroy previous instance if any
                        const drp = $('.dropify').dropify();
                        drp.on('dropify.afterClear', function (event, element) {
                            // If cleared
                            // fileInputRef.current.value = ""; // handled by dropify
                        });
                    }
                } catch (error) {
                    console.error('Dropify initialization error:', error);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [show]);

    useEffect(() => {
        if (propClassList && Array.isArray(propClassList)) {
            setClassList(propClassList);
        } else {
            const fetchClasses = async () => {
                try {
                    const response = await api.getApproveLeaveList();
                    if (response && response.status && Array.isArray(response.classlist)) {
                        setClassList(response.classlist);
                    }
                } catch (error) {
                    console.error("Error fetching classes", error);
                }
            };
            fetchClasses();
        }
    }, [propClassList]);
    useEffect(() => {
        if (initialData && isEdit) {
            // Convert DD-MM-YYYY (from API) to YYYY-MM-DD (for HTML date input)
            const formatDateForInput = (dateStr) => {
                if (!dateStr || !dateStr.includes('-')) return dateStr;
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                return dateStr;
            };

            // Convert DD-MM-YYYY (from API) to DD/MM/YYYY (for text input)
            const formatDateForText = (dateStr) => {
                if (!dateStr) return dateStr;
                return dateStr.replace(/-/g, '/');
            };

            setFormData({
                id: initialData.id,
                class_id: initialData.class_id,
                section_id: initialData.section_id,
                student_id: initialData.stud_id,
                apply_date: formatDateForText(initialData.apply_date),
                from_date: formatDateForInput(initialData.from_date),
                to_date: formatDateForInput(initialData.to_date),
                message: initialData.reason,
                leave_status: initialData.leave_status !== undefined ? initialData.leave_status : initialData.status,
                userfile: null
            });
            fetchSections(initialData.class_id);
            fetchStudents(initialData.class_id, initialData.section_id);
        } else {
            setFormData({
                class_id: '',
                section_id: '',
                student_id: '',
                apply_date: new Date().toLocaleDateString('en-GB'),
                from_date: '',
                to_date: '',
                message: '',
                leave_status: '0',
                userfile: null
            });
            setSectionList([]);
            setStudentList([]);
        }
    }, [initialData, isEdit, show]);

    const fetchSections = async (classId) => {
        if (!classId) return;
        try {
            const response = await api.getSectionsByClass(classId);
            if (response && response.status && Array.isArray(response.data)) {
                setSectionList(response.data);
            } else {
                setSectionList([]);
            }
        } catch (error) {
            console.error("Error fetching sections", error);
        }
    };

    const fetchStudents = async (classId, sectionId) => {
        if (!classId || !sectionId) return;
        try {
            const response = await api.getStudentsByClassSection(classId, sectionId);
            if (response && (response.status === true || response.status === 'success')) {
                if (Array.isArray(response.data)) {
                    setStudentList(response.data);
                } else if (response.data && response.data.student_list) {
                    setStudentList(response.data.student_list);
                } else if (response.data && response.data.student_data) {
                    setStudentList(response.data.student_data);
                } else {
                    setStudentList([]);
                }
            } else if (Array.isArray(response)) {
                setStudentList(response);
            } else {
                setStudentList([]);
            }
        } catch (error) {
            console.error("Error fetching students", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'class_id') {
            fetchSections(value);
            setFormData(prev => ({ ...prev, section_id: '', student_id: '' }));
            setStudentList([]);
        }
        if (name === 'section_id') {
            fetchStudents(formData.class_id, value);
            setFormData(prev => ({ ...prev, student_id: '' }));
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, userfile: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Helper to convert YYYY-MM-DD to DD/MM/YYYY
            const formatDateForAPI = (dateStr) => {
                if (!dateStr || !dateStr.includes('-')) return dateStr;
                const parts = dateStr.split('-');
                if (parts.length === 3 && parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return dateStr;
            };

            const data = new FormData();
            data.append('class', formData.class_id);
            data.append('section', formData.section_id);
            data.append('student', formData.student_id);
            data.append('apply_date', formData.apply_date.replace(/\//g, '/')); // Ensure consistent /
            data.append('from_date', formatDateForAPI(formData.from_date));
            data.append('to_date', formatDateForAPI(formData.to_date));
            data.append('message', formData.message);
            data.append('leave_status', formData.leave_status);

            // Add approve_by from logged in user data
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData && userData.id) {
                    data.append('approve_by', userData.id);
                }
            } catch (err) {
                console.error('Error parsing user data from localStorage', err);
            }

            // Append file from Ref
            const file = fileInputRef.current?.files[0];
            if (file) {
                data.append('userfile', file);
            }

            if (isEdit) {
                data.append('leave_id', formData.id);
                await api.updateApproveLeave(data);
            } else {
                data.append('leave_id', '');
                await api.addApproveLeave(data);
            }

            onSuccess();
            handleClose();
        } catch (error) {
            console.error("Error submitting leave", error);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return ReactDOM.createPortal(
        <div className="modal fade in" style={{ display: 'block', paddingLeft: '0px' }}>
            <div className="modal-backdrop fade in" onClick={handleClose} style={{ height: '100%', zIndex: 1040 }}></div>
            <div className="modal-dialog" style={{ zIndex: 1050 }}>
                <div className="modal-content modal-media-content">
                    <div className="modal-header modal-media-header" style={{ padding: '10px 15px' }}>
                        <button type="button" className="close" onClick={handleClose}>&times;</button>
                        <h4 className="box-title">{isEdit ? 'Edit Leave' : 'Add Leave'}</h4>
                    </div>
                    <form role="form" id="addleave_form" onSubmit={handleSubmit}>
                        {/* Form content remains same, just ensuring wrapper structure is correct */}
                        <div className="modal-body pb0">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12">
                                    <div className="row">
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Class</label><small className="req"> *</small>
                                                <select name="class_id" value={formData.class_id} onChange={handleChange} className="form-control" required>
                                                    <option value="">Select</option>
                                                    {classList.map(item => (
                                                        <option key={item.id} value={item.id}>{item.class}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Section</label><small className="req"> *</small>
                                                <select name="section_id" value={formData.section_id} onChange={handleChange} className="form-control" required>
                                                    <option value="">Select</option>
                                                    {sectionList.map(item => (
                                                        <option key={item.section_id || item.id} value={item.section_id}>{item.section}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Student</label><small className="req"> *</small>
                                                <select name="student_id" value={formData.student_id} onChange={handleChange} className="form-control" required>
                                                    <option value="">Select</option>
                                                    {studentList.map(item => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.firstname} {item.middlename ? item.middlename + ' ' : ''}{item.lastname} ({item.admission_no})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Apply Date</label><small className="req"> *</small>
                                                <input type="text" name="apply_date" value={formData.apply_date} onChange={handleChange} className="form-control" required />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>From Date</label><small className="req"> *</small>
                                                <input type="date" name="from_date" value={formData.from_date} onChange={handleChange} className="form-control" required />
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>To Date</label><small className="req"> *</small>
                                                <input type="date" name="to_date" value={formData.to_date} onChange={handleChange} className="form-control" required />
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label>Reason</label>
                                                <textarea name="message" value={formData.message} onChange={handleChange} className="form-control"></textarea>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label>Leave Status</label><small className="req"> *</small>
                                                <br />
                                                <label className="radio-inline">
                                                    <input type="radio" name="leave_status" value="0" checked={formData.leave_status == '0'} onChange={handleChange} /> Pending
                                                </label>
                                                <label className="radio-inline">
                                                    <input type="radio" name="leave_status" value="2" checked={formData.leave_status == '2'} onChange={handleChange} /> Disapprove
                                                </label>
                                                <label className="radio-inline">
                                                    <input type="radio" name="leave_status" value="1" checked={formData.leave_status == '1'} onChange={handleChange} /> Approve
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label>Attach Document</label>
                                                <input type="file" ref={fileInputRef} className="dropify" data-height="100" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-info pull-right" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LeaveModal;
