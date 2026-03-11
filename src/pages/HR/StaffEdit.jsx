import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../../utils/include_files'; // Import global styles
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const StaffEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentSession } = useSession();
    const [loading, setLoading] = useState(true);

    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);

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
        epf_no: '',
        basic_salary: '',
        contract_type: '',
        shift: '',
        location: '',
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

    // Helper to convert DD-MM-YYYY to YYYY-MM-DD
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    useEffect(() => {
        const fetchStaffDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await api.getStaffProfile(id);

                if (response.status && response.data && response.data.staff) {
                    const data = response.data.staff;

                    setStaff(prev => ({
                        ...prev,
                        employee_id: data.employee_id || '',
                        firstname: data.name || '',
                        surname: data.surname || '',
                        email: data.email || '',
                        role: data.role_id || data.role || '',
                        gender: data.gender || '',
                        dob: formatDateForInput(data.dob),
                        contact_no: data.contactno || '',
                        emergency_contact_no: data.emergency_no || '',
                        marital_status: data.marital_status || '',
                        local_address: data.address || '',
                        permanent_address: data.permanent_address || '',
                        qualification: data.qualification || '',
                        work_exp: data.work_exp || '',
                        note: data.note || '',
                        epf_no: data.epf_no || '',
                        basic_salary: data.basic_salary || '',
                        contract_type: data.contract_type || '',
                        shift: data.shift || '',
                        location: data.location || '',
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
                        department: data.department_id || data.department || '',
                        designation: data.designation_id || data.designation || '',

                        // Populate if available in response, else keep defaults or potentially empty
                        leave_type_id: data.leave_type_id || [],
                        alloted_leave: data.alloted_leave || [],
                        altid: data.altid || [],
                        custom_fields: data.custom_fields || {}
                    }));
                }

            } catch (error) {
                console.error('Error fetching staff details:', error);
                toast.error('Failed to load staff details');
            } finally {
                setLoading(false);
            }
        };

        const fetchDropdownsAndProfile = async () => {
            try {
                // Fetch dynamic data for roles, designations, departments
                const dropdownRes = await api.getStaffCreateData();
                let rolesList = [];
                if (dropdownRes && dropdownRes.status) {
                    const data = dropdownRes.data || dropdownRes;
                    rolesList = data.roles || data.staff_role || [];
                    setRoles(rolesList);
                    setDesignations(data.designation || data.designations || []);
                    setDepartments(data.department || data.departments || []);
                }
                await fetchStaffDetails(rolesList);
            } catch (err) {
                console.error('Error fetching dropdowns:', err);
                await fetchStaffDetails([]);
            }
        };

        fetchDropdownsAndProfile();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStaff(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare payload according to user request format
        const payload = {
            employee_id: staff.employee_id,
            name: staff.firstname,
            surname: staff.surname,
            email: staff.email,
            role: staff.role,
            gender: staff.gender,
            dob: staff.dob, // YYYY-MM-DD from input, user sample showed DD-MM-YYYY but API usually handles YYYY-MM-DD or we might need to format

            contactno: staff.contact_no,
            emergency_no: staff.emergency_contact_no,
            marital_status: staff.marital_status,
            address: staff.local_address,
            permanent_address: staff.permanent_address,
            qualification: staff.qualification,
            work_exp: staff.work_exp,
            note: staff.note,
            epf_no: staff.epf_no,
            basic_salary: staff.basic_salary,
            contract_type: staff.contract_type,
            shift: staff.shift,
            location: staff.location,

            bank_account_no: staff.bank_account_no,
            bank_name: staff.bank_name,
            account_title: staff.account_title || '', // Add this field if needed in state
            ifsc_code: staff.ifsc_code,
            bank_branch: staff.bank_branch,

            facebook: staff.facebook,
            twitter: staff.twitter,
            linkedin: staff.linkedin,
            instagram: staff.instagram,

            mother_name: staff.mother_name,
            father_name: staff.father_name,

            is_invisible_user: 1, // field from user sample

            date_of_joining: staff.date_of_joining,
            date_of_leaving: '', // Or from state if we add it

            leave_type_id: staff.leave_type_id,
            alloted_leave: staff.alloted_leave,
            altid: staff.altid,

            custom_fields: staff.custom_fields
        };

        // Date formatting if needed (User sample showed DD-MM-YYYY, inputs are YYYY-MM-DD)
        const formatDateForApi = (isoDate) => {
            if (!isoDate) return '';
            const parts = isoDate.split('-');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to DD-MM-YYYY
            }
            return isoDate;
        };

        // Apply formatting
        payload.dob = formatDateForApi(payload.dob);
        payload.date_of_joining = formatDateForApi(payload.date_of_joining);


        try {
            console.log('Saving staff details:', payload);
            setLoading(true);
            const response = await api.updateStaff(id, payload);

            if (response.status === 'success' || response.success) {
                toast.success('Staff details updated successfully');
                // navigate('/admin/staff/search'); // Optional: redirect back to list
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

    return (
        <div className="wrapper">
            <Header appName="School Management System" sessionYear={currentSession?.session || '2024-25'} userData={{ name: 'Admin User', avatar: '/images/no_image.png', role: 'Super Admin' }} />
            <Sidebar
                sessionYear={currentSession?.session || '2024-25'}
            />

            <div className="content-wrapper" style={{ minHeight: '946px', marginTop: '17px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Left Sidebar (HR Submenu) */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Human Resource</h3>
                                </div>
                                <ul className="tablists">
                                    <li><Link to="/admin/staff/search" className="active"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Directory</Link></li>
                                    <li><Link to="/admin/staff/attendance"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/2.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Attendance</Link></li>
                                    {/* <li><a href="/admin/payroll"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Payroll</a></li> */}
                                    <li><Link to="/admin/leaverequest"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/4.png" alt="icon4" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Approve Leave Request</Link></li>
                                    <li><Link to="/admin/staff/leaverequest"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/5.png" alt="icon5" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Apply Leave</Link></li>
                                    <li><Link to="/admin/leavetypes"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/6.png" alt="icon6" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Leave Type</Link></li>
                                    {/* <li><Link to="/admin/staff/rating"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/7.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Teachers Rating</Link></li> */}
                                    <li><Link to="/admin/department"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/8.png" alt="icon8" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Department</Link></li>
                                    <li><Link to="/admin/designation"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/9.png" alt="icon9" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Designation</Link></li>
                                    <li><Link to="/admin/disabledstaff"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/88.png" alt="icon10" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Disabled Staff</Link></li>
                                    {/* <li><Link to="/admin/staff/staffrecruitment"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/human_resource/1.png" alt="icon11" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} /> Staff Recruitment</Link></li> */}
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-10">
                            <div className="box box-primary">
                                <form id="form1" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="alert alert-info">
                                            Staff email is their login username, password is generated automatically and send to staff email. Superadmin can change staff password on their staff profile page.
                                        </div>

                                        <div className="tshadow mb25 bozero">
                                            <h4 className="pagetitleh2">Basic Information</h4>
                                            <div className="around10">
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Staff ID</label><small className="req"> *</small>
                                                            <input type="text" name="employee_id" className="form-control" value={staff.employee_id} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Role</label><small className="req"> *</small>
                                                            <select name="role" className="form-control" value={staff.role} onChange={handleInputChange}>
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

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>First Name</label><small className="req"> *</small>
                                                            <input type="text" name="firstname" className="form-control" value={staff.firstname} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Last Name</label>
                                                            <input type="text" name="surname" className="form-control" value={staff.surname} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Father's Name</label>
                                                            <input type="text" name="father_name" className="form-control" value={staff.father_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Mother's Name</label>
                                                            <input type="text" name="mother_name" className="form-control" value={staff.mother_name} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Email</label><small className="req"> *</small>
                                                            <input type="email" name="email" className="form-control" value={staff.email} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Gender</label><small className="req"> *</small>
                                                            <select name="gender" className="form-control" value={staff.gender} onChange={handleInputChange}>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Birth</label><small className="req"> *</small>
                                                            <input type="date" name="dob" className="form-control" value={staff.dob} onChange={handleInputChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Date of Joining</label>
                                                            <input type="date" name="date_of_joining" className="form-control" value={staff.date_of_joining} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Phone</label>
                                                            <input type="text" name="contact_no" className="form-control" value={staff.contact_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Emergency Contact</label>
                                                            <input type="text" name="emergency_contact_no" className="form-control" value={staff.emergency_contact_no} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Marital Status</label>
                                                            <select name="marital_status" className="form-control" value={staff.marital_status} onChange={handleInputChange}>
                                                                <option value="Single">Single</option>
                                                                <option value="Married">Married</option>
                                                                <option value="Widowed">Widowed</option>
                                                                <option value="Separated">Separated</option>
                                                                <option value="Not Specified">Not Specified</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Photo</label>
                                                            <input type="file" className="form-control" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Current Address</label>
                                                            <textarea name="local_address" className="form-control" rows="3" value={staff.local_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Permanent Address</label>
                                                            <textarea name="permanent_address" className="form-control" rows="3" value={staff.permanent_address} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Qualification</label>
                                                            <textarea name="qualification" className="form-control" rows="3" value={staff.qualification} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Work Experience</label>
                                                            <textarea name="work_exp" className="form-control" rows="3" value={staff.work_exp} onChange={handleInputChange}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="box-group collapsed-box">
                                            <div className="panel box box-success">
                                                <div className="box-header with-border">
                                                    <h4 className="box-title">
                                                        <a data-toggle="collapse" href="#collapsedDetails" aria-expanded="true">
                                                            <i className="fa fa-fw fa-plus"></i> Add More Details
                                                        </a>
                                                    </h4>
                                                </div>
                                                <div id="collapsedDetails" className="panel-collapse collapse in">
                                                    <div className="box-body">
                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Bank Account Details</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Account Number</label>
                                                                        <input type="text" name="bank_account_no" className="form-control" value={staff.bank_account_no} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>Bank Name</label>
                                                                        <input type="text" name="bank_name" className="form-control" value={staff.bank_name} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>IFSC Code</label>
                                                                        <input type="text" name="ifsc_code" className="form-control" value={staff.ifsc_code} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="tshadow mb25 bozero">
                                                            <h4 className="pagetitleh2">Social Media Link</h4>
                                                            <div className="row around10">
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Facebook URL</label>
                                                                        <input type="text" name="facebook" className="form-control" value={staff.facebook} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="form-group">
                                                                        <label>Twitter URL</label>
                                                                        <input type="text" name="twitter" className="form-control" value={staff.twitter} onChange={handleInputChange} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
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
