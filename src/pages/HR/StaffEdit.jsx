import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../../utils/include_files'; // Import global styles
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const StaffEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentSession } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [genderList, setGenderList] = useState(['Male', 'Female']);
    const [maritalStatusList, setMaritalStatusList] = useState(['Single', 'Married', 'Widowed', 'Separated', 'Not Specified']);
    const [contractTypeList, setContractTypeList] = useState(['Permanent', 'Probation']);

    const [staff, setStaff] = useState({
        id: id || '',
        employee_id: '',
        role: '',
        designation: '',
        department: '',
        firstname: '',
        surname: '',
        father_name: '',
        mother_name: '',
        email: '',
        gender: '',
        dob: '',
        date_of_joining: '',
        contact_no: '',
        emergency_contact_no: '',
        marital_status: '',
        local_address: '',
        permanent_address: '',
        qualification: '',
        work_exp: '',
        note: '',
        image: '', // Staff Photo
        first_doc: '',
        second_doc: '',
        third_doc: '',
        fourth_doc: '',
        epf_no: '',
        basic_salary: '',
        contract_type: '',
        shift: '',
        location: '',
        account_title: '',
        bank_account_no: '',
        bank_name: '',
        ifsc_code: '',
        bank_branch: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        leave_type_id: [],
        alloted_leave: [],
        altid: [],
        custom_fields: {}
    });

    const [leaveData, setLeaveData] = useState({});

    // Helper to convert DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const separator = dateStr.includes('-') ? '-' : dateStr.includes('/') ? '/' : null;
        if (!separator) return dateStr;

        const parts = dateStr.split(separator);
        if (parts.length === 3) {
            // Assume DD-MM-YYYY or DD/MM/YYYY -> YYYY-MM-DD
            if (parts[0].length <= 2) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        return dateStr;
    };

    useEffect(() => {
        const fetchStaffEditData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await api.getStaffEditDetails(id);

                if (response.status && response.data) {
                    const { staff: data, leave_details: leaves, role_list, designation_list, department_list, leave_type_list, gender_list, marital_status_list } = response.data;

                    // Update Dropdowns
                    if (role_list) setRoles(role_list);
                    if (designation_list) setDesignations(designation_list);
                    if (department_list) setDepartments(department_list);
                    if (leave_type_list) setLeaveTypes(leave_type_list);
                    if (gender_list) setGenderList(Object.values(gender_list));
                    if (marital_status_list) setMaritalStatusList(Object.values(marital_status_list));

                    // Populate staff state
                    setStaff(prev => ({
                        ...prev,
                        employee_id: data.employee_id || '',
                        firstname: data.name || '',
                        surname: data.surname || '',
                        email: data.email || '',
                        role: data.role_id || '',
                        gender: data.gender || '',
                        dob: formatDateForInput(data.dob),
                        contact_no: data.contact_no || '',
                        emergency_contact_no: data.emergency_contact_no || '',
                        marital_status: data.marital_status || '',
                        local_address: data.local_address || '',
                        permanent_address: data.permanent_address || '',
                        qualification: data.qualification || '',
                        work_exp: data.work_exp || '',
                        note: data.note || '',
                        epf_no: data.epf_no || '',
                        basic_salary: data.basic_salary || '',
                        contract_type: data.contract_type || '',
                        shift: data.shift || '',
                        location: data.location || '',
                        account_title: data.account_title || '',
                        bank_account_no: data.bank_account_no || '',
                        bank_name: data.bank_name || '',
                        ifsc_code: data.ifsc_code || '',
                        bank_branch: data.bank_branch || '',
                        facebook: data.facebook || '',
                        twitter: data.twitter || '',
                        linkedin: data.linkedin || '',
                        instagram: data.instagram || '',
                        father_name: data.father_name || '',
                        mother_name: data.mother_name || '',
                        date_of_joining: formatDateForInput(data.date_of_joining),
                        department: data.department || '',
                        designation: data.designation || '',
                        image: data.image || '',
                        first_doc: data.resume || '',
                        second_doc: data.joining_letter || '',
                        third_doc: data.resignation_letter || '',
                        fourth_doc: data.other_document_name || '',
                        custom_fields: data.custom_fields || {}
                    }));

                    // Populate leave data
                    const lData = {};
                    (leaves || []).forEach(l => {
                        lData[l.id] = l.alloted_leave;
                    });
                    setLeaveData(lData);
                }

            } catch (error) {
                console.error('Error fetching staff edit data:', error);
                toast.error('Failed to load staff details');
            } finally {
                setLoading(false);
            }
        };

        fetchStaffEditData();
    }, [id]);

    // Initialize Dropify
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    $('.dropify').dropify();
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [loading, showMoreDetails]); // Re-initialize when loading finishes or "Add More Details" is toggled

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setStaff(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setStaff(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLeaveChange = (leaveId, value) => {
        setLeaveData(prev => ({ ...prev, [leaveId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();

            // Date formatting for API (StaffCreate uses DD/MM/YYYY for dob)
            const dateFields = ['dob'];
            const formatDate = (val) => {
                if (!val) return val;
                const parts = val.split('-');
                if (parts.length === 3 && parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return val;
            };

            // Standard fields
            Object.keys(staff).forEach(key => {
                const value = staff[key];
                if (value !== null && value !== undefined && value !== '') {
                    if (value instanceof File) {
                        // Rename photo field to 'file' as requested
                        if (key === 'image') {
                            data.append('file', value);
                        } else {
                            data.append(key, value);
                        }
                    } else if (dateFields.includes(key)) {
                        data.append(key, formatDate(value));
                    } else if (['id', 'firstname', 'image', 'leave_type_id', 'alloted_leave', 'altid', 'custom_fields', 'contact_no', 'emergency_contact_no', 'local_address'].includes(key)) {
                        // Skip: handled separately or not needed
                    } else {
                        data.append(key, value);
                    }
                }
            });

            // Add specific fields required by API
            data.append('contactno', staff.contact_no || '');
            data.append('emergency_no', staff.emergency_contact_no || '');
            data.append('address', staff.local_address || '');
            data.append('name', staff.firstname || '');
            data.append('editid', id);
            data.append('is_invisible_user', '0');

            // Append leave data
            Object.keys(leaveData).forEach(leaveId => {
                data.append('leave_type[]', leaveId);
                data.append(`alloted_leave_${leaveId}`, leaveData[leaveId] || '');
            });

            const response = await api.updateStaff(id, data);

            if (response.status === 'success' || response.status === true || response.success) {
                toast.success(response.message || 'Staff details updated successfully');
                navigate('/admin/staff/search');
            } else {
                toast.error(response.message || 'Failed to update staff');
            }
        } catch (error) {
            console.error('Error updating staff:', error);
            toast.error(error.message || 'An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header appName="School Management System" sessionYear={currentSession?.session || '2024-25'} userData={{ name: 'Admin User', avatar: '/images/no_image.png', role: 'Super Admin' }} />
                <Sidebar sessionYear={currentSession?.session || '2024-25'} />
                <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                    <Loader />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header appName="School Management System" sessionYear={currentSession?.session || '2024-25'} userData={{ name: 'Admin User', avatar: '/images/no_image.png', role: 'Super Admin' }} />
            <Sidebar
                sessionYear={currentSession?.session || '2024-25'}
            />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <form id="form1" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="alert alert-info">
                                            Staff email is their login username, password is generated automatically and sent to staff email. Superadmin can change staff password on their staff profile page.
                                        </div>

                                        {/* Basic Information */}
                                        <div className="tshadow mb25 bozero">
                                            <h4 className="pagetitleh2">Basic Information</h4>
                                            <div className="around10">

                                                {/* Row 1: Staff ID, Role, Designation, Department */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Staff ID</label><small className="req"> *</small>
                                                            <input name="employee_id" type="text" className="form-control" value={staff.employee_id} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Role</label><small className="req"> *</small>
                                                            <select name="role" className="form-control" value={staff.role} onChange={handleInputChange} required>
                                                                <option value="">Select</option>
                                                                {roles.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.name || r.type}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Designation</label>
                                                            <select name="designation" className="form-control" value={staff.designation} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {designations.map(d => (
                                                                    <option key={d.id} value={d.id}>{d.designation}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Department</label>
                                                            <select name="department" className="form-control" value={staff.department} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {departments.map(d => (
                                                                    <option key={d.id} value={d.id}>{d.department_name || d.department}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 2: First Name, Last Name, Father Name, Mother Name */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>First Name</label><small className="req"> *</small>
                                                            <input name="firstname" type="text" className="form-control" value={staff.firstname} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Last Name</label>
                                                            <input name="surname" type="text" className="form-control" value={staff.surname} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Name</label>
                                                            <input name="father_name" type="text" className="form-control" value={staff.father_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Name</label>
                                                            <input name="mother_name" type="text" className="form-control" value={staff.mother_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 3: Email, Gender, DOB, Date of Joining */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Email (Login Username)</label><small className="req"> *</small>
                                                            <input name="email" type="text" className="form-control" value={staff.email} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Gender</label><small className="req"> *</small>
                                                            <select name="gender" className="form-control" value={staff.gender} onChange={handleInputChange} required>
                                                                <option value="">Select</option>
                                                                {genderList.map(g => (
                                                                    <option key={g} value={g}>{g}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Birth</label><small className="req"> *</small>
                                                            <input name="dob" type="date" className="form-control" value={staff.dob} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Joining</label>
                                                            <input name="date_of_joining" type="date" className="form-control" value={staff.date_of_joining} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 4: Phone, Emergency Contact, Marital Status, Photo */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Phone</label>
                                                            <input name="contact_no" type="text" className="form-control" value={staff.contact_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Emergency Contact Number</label>
                                                            <input name="emergency_contact_no" type="text" className="form-control" value={staff.emergency_contact_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Marital Status</label>
                                                            <select name="marital_status" className="form-control" value={staff.marital_status} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {maritalStatusList.map(ms => (
                                                                    <option key={ms} value={ms}>{ms}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Photo</label>
                                                            <input className="dropify" type="file" name="image" data-default-file={staff.image ? `${api.baseUrl}/${staff.image}` : ''} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 5: Current Address, Permanent Address */}
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Current Address</label>
                                                            <textarea name="local_address" className="form-control" value={staff.local_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Permanent Address</label>
                                                            <textarea name="permanent_address" className="form-control" value={staff.permanent_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 6: Qualification, Work Experience, Note */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Qualification</label>
                                                            <textarea name="qualification" className="form-control" value={staff.qualification} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Work Experience</label>
                                                            <textarea name="work_exp" className="form-control" value={staff.work_exp} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Note</label>
                                                            <textarea name="note" className="form-control" value={staff.note} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Collapsible: Add More Details */}
                                        <div className="box-group">
                                            <div className="panel box box-success">
                                                <div className="box-header with-border" style={{ cursor: 'pointer' }} onClick={() => setShowMoreDetails(!showMoreDetails)}>
                                                    <a className="btn boxplus">
                                                        <i className={`fa fa-fw fa-${showMoreDetails ? 'minus' : 'plus'}`}></i> Add More Details
                                                    </a>
                                                </div>
                                                {showMoreDetails && (
                                                    <div className="box-body">
                                                        {/* Payroll Section */}
                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Payroll</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>EPF No</label>
                                                                        <input name="epf_no" type="text" className="form-control" value={staff.epf_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Basic Salary</label>
                                                                        <input name="basic_salary" type="text" className="form-control" value={staff.basic_salary} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Contract Type</label>
                                                                        <select name="contract_type" className="form-control" value={staff.contract_type} onChange={handleInputChange}>
                                                                            <option value="">Select</option>
                                                                            {contractTypeList.map(ct => (
                                                                                <option key={ct} value={ct}>{ct}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Work Shift</label>
                                                                        <input name="shift" type="text" className="form-control" value={staff.shift} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Work Location</label>
                                                                        <input name="location" type="text" className="form-control" value={staff.location} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Leaves Section */}
                                                        {leaveTypes.length > 0 && (
                                                            <div className="tshadow mb25 bozero">
                                                                <h4 className="pagetitleh2">Leaves</h4>
                                                                <div className="row around10">
                                                                    {leaveTypes.map(leave => (
                                                                        <div className="col-md-4" key={leave.id}>
                                                                            <div className="form-group">
                                                                                <label>{leave.type}</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    placeholder="Number of Leaves"
                                                                                    value={leaveData[leave.id] || ''}
                                                                                    onChange={(e) => handleLeaveChange(leave.id, e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Bank Account Details */}
                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Bank Account Details</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Account Title</label>
                                                                        <input name="account_title" type="text" className="form-control" value={staff.account_title} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Account Number</label>
                                                                        <input name="bank_account_no" type="text" className="form-control" value={staff.bank_account_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Name</label>
                                                                        <input name="bank_name" type="text" className="form-control" value={staff.bank_name} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>IFSC Code</label>
                                                                        <input name="ifsc_code" type="text" className="form-control" value={staff.ifsc_code} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Branch Name</label>
                                                                        <input name="bank_branch" type="text" className="form-control" value={staff.bank_branch} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Social Media */}
                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Social Media</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Facebook URL</label>
                                                                        <input name="facebook" type="text" className="form-control" value={staff.facebook} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Twitter URL</label>
                                                                        <input name="twitter" type="text" className="form-control" value={staff.twitter} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>LinkedIn URL</label>
                                                                        <input name="linkedin" type="text" className="form-control" value={staff.linkedin} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Instagram URL</label>
                                                                        <input name="instagram" type="text" className="form-control" value={staff.instagram} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Upload Documents Section */}
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="tshadow bozero">
                                                                    <h4 className="pagetitleh2">Upload Documents</h4>
                                                                    <div className="row around10">
                                                                        <div className="col-md-6">
                                                                            <table className="table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th style={{ width: '10px' }}>#</th>
                                                                                        <th>Title</th>
                                                                                        <th>Documents</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>1.</td>
                                                                                        <td>Resume</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="first_doc" data-default-file={staff.first_doc ? `${api.baseUrl}/${staff.first_doc}` : ''} onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>3.</td>
                                                                                        <td>Resignation Letter</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="third_doc" data-default-file={staff.third_doc ? `${api.baseUrl}/${staff.third_doc}` : ''} onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <table className="table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th style={{ width: '10px' }}>#</th>
                                                                                        <th>Title</th>
                                                                                        <th>Documents</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>2.</td>
                                                                                        <td>Joining Letter</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="second_doc" data-default-file={staff.second_doc ? `${api.baseUrl}/${staff.second_doc}` : ''} onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>4.</td>
                                                                                        <td>Other Documents</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="fourth_doc" data-default-file={staff.fourth_doc ? `${api.baseUrl}/${staff.fourth_doc}` : ''} onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={saving}>
                                            {saving ? <><i className="fa fa-spinner fa-spin"></i> Saving...</> : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StaffEdit;
