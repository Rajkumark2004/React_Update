import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files'; // Import global styles
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useSession } from '../../context/SessionContext';

const StaffCreate = () => {
    const navigate = useNavigate();
    const { sessionYear } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(false);

    // Dropdown data
    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [genderList, setGenderList] = useState(['Male', 'Female']);
    const [maritalStatusList, setMaritalStatusList] = useState(['Single', 'Married', 'Widowed', 'Separated', 'Not Specified']);
    const [contractTypeList, setContractTypeList] = useState(['Permanent', 'Probation']);

    // Form Data
    const [formData, setFormData] = useState({
        // Basic Information
        employee_id: '',
        role: '',
        designation: '',
        department: '',
        name: '',
        surname: '',
        father_name: '',
        mother_name: '',
        email: '',
        gender: '',
        dob: '',
        date_of_joining: '',
        contactno: '',
        emergency_no: '',
        marital_status: '',
        qualification: '',
        work_exp: '',
        address: '',
        permanent_address: '',
        note: '',
        // Photo
        file: null,
        // Payroll
        epf_no: '',
        basic_salary: '',
        contract_type: '',
        shift: '',
        location: '',
        // Leaves
        // Bank Account Details
        account_title: '',
        bank_account_no: '',
        bank_name: '',
        ifsc_code: '',
        bank_branch: '',
        // Social Media
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        // Upload Documents
        first_doc: null,
        second_doc: null,
        third_doc: null,
        fourth_doc: null,
    });

    const [leaveData, setLeaveData] = useState({});
    const [formErrors, setFormErrors] = useState({});

    // Initialize Dropify
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    // Initialize Dropify
                    const drEvent = $('.dropify').dropify();

                    // Handle file changes from Dropify
                    drEvent.on('change', function (event, element) {
                        // Dropify triggers 'change' on the underlying input natively,
                        // but if we need to do anything manual, we can do it here.
                    });
                } else {
                    console.warn('jQuery or Dropify plugin not loaded');
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500); // delay to ensure DOM is ready

        return () => clearTimeout(timer);
    }, [showMoreDetails]); // re-init when adding more details as some inputs exist inside it

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await api.getStaffCreateMeta();
            if (response && response.status && response.data) {
                const data = response.data;
                setRoles(data.roles || []);
                setDesignations(data.designation || []);
                setDepartments(data.department || []);
                setLeaveTypes(data.leave_types || []);

                if (data.gender) {
                    setGenderList(Object.values(data.gender));
                }
                if (data.marital_status) {
                    setMaritalStatusList(Object.values(data.marital_status));
                }
                if (data.contract_type) {
                    setContractTypeList(Object.values(data.contract_type));
                }
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        // Clear error on change
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleLeaveChange = (leaveId, value) => {
        setLeaveData(prev => ({ ...prev, [leaveId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!formData.employee_id.trim()) errors.employee_id = 'Staff ID is required';
        if (!formData.role) errors.role = 'Role is required';
        if (!formData.name.trim()) errors.name = 'First Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        if (!formData.dob) errors.dob = 'Date of Birth is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            const firstErrorEl = document.querySelector('.text-danger:not(:empty)');
            if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setFormErrors({});
        setSaving(true);

        try {
            const data = new FormData();

            // Convert dob from YYYY-MM-DD to DD/MM/YYYY for API
            const dateFields = ['dob'];
            const formatDate = (val) => {
                if (!val) return val;
                const parts = val.split('-');
                if (parts.length === 3 && parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return val;
            };

            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    if (formData[key] instanceof File) {
                        data.append(key, formData[key]);
                    } else {
                        const value = dateFields.includes(key) ? formatDate(formData[key]) : formData[key];
                        data.append(key, value);
                    }
                }
            });

            // Append leave data
            Object.keys(leaveData).forEach(leaveId => {
                data.append('leave_type[]', leaveId);
                data.append(`alloted_leave_${leaveId}`, leaveData[leaveId] || '');
            });

            const response = await api.createStaff(data);

            if (response && (response.status === true || response.status === 'success')) {
                toast.success(response.message || 'Staff created successfully');
                navigate('/admin/staff/search');
            } else if (response && response.errors) {
                const apiErrors = {};
                let hasErrors = false;
                
                Object.keys(response.errors).forEach(key => {
                    const errText = response.errors[key];
                    if (errText) {
                        const cleanError = errText.replace(/<\/?[^>]+(>|$)/g, "").trim();
                        if (cleanError) {
                            apiErrors[key] = cleanError;
                            hasErrors = true;
                        }
                    }
                });
                
                if (hasErrors) {
                    setFormErrors(apiErrors);
                    toast.error('Please correct the highlighted errors');
                    setTimeout(() => {
                        const firstErrorEl = document.querySelector('.text-danger:not(:empty)');
                        if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                } else {
                    toast.error(response.message || 'Failed to create staff');
                }
            } else {
                toast.error(response?.message || 'Failed to create staff');
            }
        } catch (error) {
            console.error('Error creating staff:', error);
            toast.error('An error occurred while creating staff');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="wrapper">
                <Header />
                <Sidebar sessionYear={sessionYear} />
                <div className="content-wrapper">
                    <Loader />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="wrapper">
            <Header />
            <Sidebar sessionYear={sessionYear} />
            <div className="content-wrapper" style={{ marginTop: '0px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-sitemap"></i> Human Resource
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <form id="form1" method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="alert alert-info">
                                            Staff email is their login username, password is generated automatically and sent to staff email. Superadmin can change staff password on their staff profile page.
                                        </div>

                                        {/* Basic Information */}
                                        <div className="tshadow mb25 bozero">
                                            <div className="box-tools pull-right pt3">
                                                <Link className="btn btn-sm btn-primary" to="/admin/staff/import">
                                                    <i className="fa fa-plus"></i> Import Staff
                                                </Link>
                                            </div>
                                            <h4 className="pagetitleh2">Basic Information</h4>
                                            <div className="around10">

                                                {/* Row 1: Staff ID, Role, Designation, Department */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Staff ID</label><small className="req"> *</small>
                                                            <input autoFocus name="employee_id" type="text" className="form-control" value={formData.employee_id} onChange={handleInputChange} />
                                                            {formErrors.employee_id && <span className="text-danger">{formErrors.employee_id}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Role</label><small className="req"> *</small>
                                                            <select name="role" className="form-control" value={formData.role} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {roles.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.name || r.type}</option>
                                                                ))}
                                                            </select>
                                                            {formErrors.role && <span className="text-danger">{formErrors.role}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Designation</label>
                                                            <select name="designation" className="form-control" value={formData.designation} onChange={handleInputChange}>
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
                                                            <select name="department" className="form-control" value={formData.department} onChange={handleInputChange}>
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
                                                            <input name="name" type="text" className="form-control" value={formData.name} onChange={handleInputChange} />
                                                            {formErrors.name && <span className="text-danger">{formErrors.name}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Last Name</label>
                                                            <input name="surname" type="text" className="form-control" value={formData.surname} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father Name</label>
                                                            <input name="father_name" type="text" className="form-control" value={formData.father_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother Name</label>
                                                            <input name="mother_name" type="text" className="form-control" value={formData.mother_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 3: Email, Gender, DOB, Date of Joining */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Email (Login Username)</label><small className="req"> *</small>
                                                            <input name="email" type="text" className="form-control" value={formData.email} onChange={handleInputChange} />
                                                            {formErrors.email && <span className="text-danger">{formErrors.email}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Gender</label><small className="req"> *</small>
                                                            <select name="gender" className="form-control" value={formData.gender} onChange={handleInputChange}>
                                                                <option value="">Select</option>
                                                                {genderList.map(g => (
                                                                    <option key={g} value={g}>{g}</option>
                                                                ))}
                                                            </select>
                                                            {formErrors.gender && <span className="text-danger">{formErrors.gender}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Birth</label><small className="req"> *</small>
                                                            <input name="dob" type="date" className="form-control" value={formData.dob} onChange={handleInputChange} />
                                                            {formErrors.dob && <span className="text-danger">{formErrors.dob}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Joining</label>
                                                            <input name="date_of_joining" type="date" className="form-control" value={formData.date_of_joining} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 4: Phone, Emergency Contact, Marital Status, Photo */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Phone</label>
                                                            <input name="contactno" type="text" className="form-control" value={formData.contactno} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Emergency Contact Number</label>
                                                            <input name="emergency_no" type="text" className="form-control" value={formData.emergency_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Marital Status</label>
                                                            <select name="marital_status" className="form-control" value={formData.marital_status} onChange={handleInputChange}>
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
                                                            <input className="dropify" type="file" name="file" onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 5: Current Address, Permanent Address */}
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Current Address</label>
                                                            <textarea name="address" className="form-control" value={formData.address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Permanent Address</label>
                                                            <textarea name="permanent_address" className="form-control" value={formData.permanent_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 6: Qualification, Work Experience, Note */}
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Qualification</label>
                                                            <textarea name="qualification" className="form-control" value={formData.qualification} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Work Experience</label>
                                                            <textarea name="work_exp" className="form-control" value={formData.work_exp} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Note</label>
                                                            <textarea name="note" className="form-control" value={formData.note} onChange={handleInputChange}></textarea>
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
                                                                        <input name="epf_no" type="text" className="form-control" value={formData.epf_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Basic Salary</label>
                                                                        <input name="basic_salary" type="text" className="form-control" value={formData.basic_salary} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Contract Type</label>
                                                                        <select name="contract_type" className="form-control" value={formData.contract_type} onChange={handleInputChange}>
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
                                                                        <input name="shift" type="text" className="form-control" value={formData.shift} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Work Location</label>
                                                                        <input name="location" type="text" className="form-control" value={formData.location} onChange={handleInputChange} />
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
                                                                        <input name="account_title" type="text" className="form-control" value={formData.account_title} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Account Number</label>
                                                                        <input name="bank_account_no" type="text" className="form-control" value={formData.bank_account_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Name</label>
                                                                        <input name="bank_name" type="text" className="form-control" value={formData.bank_name} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>IFSC Code</label>
                                                                        <input name="ifsc_code" type="text" className="form-control" value={formData.ifsc_code} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Branch Name</label>
                                                                        <input name="bank_branch" type="text" className="form-control" value={formData.bank_branch} onChange={handleInputChange} />
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
                                                                        <input name="facebook" type="text" className="form-control" value={formData.facebook} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Twitter URL</label>
                                                                        <input name="twitter" type="text" className="form-control" value={formData.twitter} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>LinkedIn URL</label>
                                                                        <input name="linkedin" type="text" className="form-control" value={formData.linkedin} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Instagram URL</label>
                                                                        <input name="instagram" type="text" className="form-control" value={formData.instagram} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Upload Documents */}
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="tshadow bozero">
                                                                    <h4 className="pagetitleh2">Upload Documents</h4>
                                                                    <div className="row around10">
                                                                        <div className="col-md-6">
                                                                            <table className="table">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <th style={{ width: '10px' }}>#</th>
                                                                                        <th>Title</th>
                                                                                        <th>Documents</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>1.</td>
                                                                                        <td>Resume</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="first_doc" onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>3.</td>
                                                                                        <td>Resignation Letter</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="third_doc" onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <table className="table">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <th style={{ width: '10px' }}>#</th>
                                                                                        <th>Title</th>
                                                                                        <th>Documents</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>2.</td>
                                                                                        <td>Joining Letter</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="second_doc" onChange={handleInputChange} />
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>4.</td>
                                                                                        <td>Other Documents</td>
                                                                                        <td>
                                                                                            <input className="dropify" data-height="92" type="file" name="fourth_doc" onChange={handleInputChange} />
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

export default StaffCreate;
