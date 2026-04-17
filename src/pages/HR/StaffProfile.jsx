import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../utils/include_files'; // Import global styles
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';

const StaffProfile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentSession } = useSession();

    // Custom styles for animated upload hover (matching DragDropFileUpload component)
    const uploadHoverStyles = `
        .upload-area-hover:hover {
            background-image: repeating-linear-gradient(-45deg, #fff, #fff 10px, #fdf7f0 10px, #fdf7f0 20px) !important;
            background-size: 28px 28px !important;
            animation: moveStripesStaff 0.8s linear infinite !important;
        }
        @keyframes moveStripesStaff {
            0% { background-position: 0 0; }
            100% { background-position: 28px 0; }
        }
    `;

    // State for API data
    const [staff, setStaff] = useState(null);
    const [leaves, setLeaves] = useState({ details: [], history: [] });
    const [payroll, setPayroll] = useState({ payslips: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const [showTimelineModal, setShowTimelineModal] = useState(false);
    const [timelineForm, setTimelineForm] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        document: null,
        visible: true
    });
    const [isUploadHovered, setIsUploadHovered] = useState(false);
    const [editTimelineId, setEditTimelineId] = useState(null);

    const handleEditTimeline = (item) => {
        // Convert DD/MM/YYYY to YYYY-MM-DD for date input
        let formattedDate = item.date;
        if (item.date && item.date.includes('/')) {
            const [day, month, year] = item.date.split('/');
            formattedDate = `${year}-${month}-${day}`;
        }
        
        setTimelineForm({
            title: item.title,
            date: formattedDate,
            description: item.description,
            document: item.document || null,
            visible: true // Default or map if available in sample data
        });
        setEditTimelineId(item.id);
        setShowTimelineModal(true);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await api.changeStaffPassword(id, newPass, confirmPass);
            alert("Password Changed Successfully");
            setShowPasswordModal(false);
            setNewPass('');
            setConfirmPass('');
        } catch (error) {
            console.error('Password change error:', error);
            alert("Failed to change password: " + error.message);
        }
    };

    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableDate, setDisableDate] = useState(new Date().toISOString().split('T')[0]);

    const handleDisableSubmit = async (e) => {
        e.preventDefault();
        try {
            const [year, month, day] = disableDate.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            await api.disableStaff(id, formattedDate);
            alert(`Staff disabled successfully.`);
            setShowDisableModal(false);
            // Optional: You could navigate away or refresh the profile data here
        } catch (error) {
            console.error('Disable staff error:', error);
            alert("Failed to disable staff: " + error.message);
        }
    };

    // Layout Props
    const appName = 'School Management System';
    const sessionYear = currentSession?.session || '2024-25';

    const userData = {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };





    const handleLogout = () => {
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search submitted');
    };

    // Fetch staff profile from API
    useEffect(() => {
        const fetchStaffProfile = async () => {
            if (!id) {
                setError('No staff ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await api.getStaffProfile(id);

                if (response.status && response.data) {
                    // Map staff data
                    const staffData = response.data.staff;
                    setStaff({
                        ...staffData,
                        role: staffData.user_type || '',
                        image: staffData.image ? `https://newlayout.wisibles.com/uploads/staff_images/${staffData.image}` : null,
                        rating: 0, // API doesn't provide rating
                        reviews_count: 0
                    });

                    // Map leave details
                    const leaveDetails = (response.data.leavedetails || []).map(l => ({
                        type: l.type,
                        alloted: parseInt(l.alloted_leave) || 0,
                        approved: parseInt(l.approve_leave) || 0
                    }));

                    const leaveHistory = (response.data.staff_leaves || []).map(l => ({
                        type: l.type,
                        date_range: `${l.leave_from} - ${l.leave_to}`,
                        days: parseInt(l.leave_days) || 0,
                        apply_date: l.date,
                        status: l.status
                    }));

                    setLeaves({ details: leaveDetails, history: leaveHistory });

                    // Map payroll data
                    setPayroll({
                        payslips: response.data.staff_payroll || []
                    });

                    // Map timeline
                    setTimeline(response.data.timeline_list || []);
                }
            } catch (err) {
                console.error('Error fetching staff profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaffProfile();
    }, [id]);

    // Static data for attendance and documents (not in API)
    const attendance = {
        stats: {
            present: 0,
            late: 0,
            absent: 0,
            half_day: 0,
            holiday: 0,
        },
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };

    const documents = [];
    const reviews = [];

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            let className = "fa fa-star";
            if (i <= rating) {
                className += " checked"; // Assuming 'checked' is the class for yellow/orange stars, might simpler style inline
            } else if (i - 0.5 === rating) {
                className += "-half-o checked";
            } else {
                className += "-o"; // Empty star if font-awesome 4.x convention
            }
            stars.push(<span key={i} className={className} style={{ color: i <= Math.ceil(rating) ? 'orange' : 'inherit' }}></span>);
        }
        return stars;
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header
                appName={appName}
                userData={userData}
                handleLogout={handleLogout}
            />

            <Sidebar

                handleSearch={handleSearch}
                sessionYear={sessionYear}
            />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                {/* Header */}
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                {/* Loading State */}
                {loading && (
                    <section className="content">
                        <Loader />
                    </section>
                )}

                {/* Error State */}
                {error && !loading && (
                    <section className="content">
                        <div className="alert alert-danger">
                            <i className="fa fa-exclamation-triangle"></i> Error: {error}
                        </div>
                        <a href="/admin/staff/search" className="btn btn-default">
                            <i className="fa fa-arrow-left"></i> Back to Staff List
                        </a>
                    </section>
                )}

                {/* Main Content */}
                {!loading && !error && staff && (
                    <section className="content">
                        <div className="row">
                            {/* Left Sidebar - Profile Card */}
                            <div className="col-md-3">
                                <div className="box box-primary" style={staff.is_active === '0' ? { backgroundColor: '#f0dddd' } : {}}>
                                    <div className="box-body box-profile">
                                        <img
                                            className="profile-user-img img-responsive img-circle"
                                            src={staff.image || "https://newlayout.wisibles.com/uploads/staff_images/default_male.jpg"}
                                            alt="User profile picture"
                                        />
                                        <h3 className="profile-username text-center">{staff.name} {staff.surname}</h3>
                                        <p className="text-muted text-center">{staff.role}</p>

                                        {/* Rating */}
                                        {/* <div className="text-center">
                                            <h3>{renderStars(staff.rating)}</h3>
                                            <h5>{staff.rating} average based on {staff.reviews_count} reviews.</h5>
                                        </div> */}

                                        <ul className="list-group list-group-unbordered">
                                            <li className="list-group-item listnoback">
                                                <b>Staff ID</b> <a className="pull-right text-aqua">{staff.employee_id}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Role</b> <a className="pull-right text-aqua">{staff.role}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Designation</b> <a className="pull-right text-aqua">{staff.designation}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Department</b> <a className="pull-right text-aqua">{staff.department}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>EPF No</b> <a className="pull-right text-aqua">{staff.epf_no}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Basic Salary</b> <a className="pull-right text-aqua">₹{staff.basic_salary}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Contract Type</b> <a className="pull-right text-aqua">{staff.contract_type}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Work Shift</b> <a className="pull-right text-aqua">{staff.shift}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Work Location</b> <a className="pull-right text-aqua">{staff.location}</a>
                                            </li>
                                            <li className="list-group-item listnoback">
                                                <b>Date of Joining</b> <a className="pull-right text-aqua">{staff.date_of_joining}</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content - Tabs */}
                            <div className="col-md-9">
                                <div className="nav-tabs-custom theme-shadow">
                                    <ul className="nav nav-tabs">
                                        <li className={activeTab === 'profile' ? 'active' : ''}>
                                            <a href="#profile" onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>Profile</a>
                                        </li>
                                        <li className={activeTab === 'payroll' ? 'active' : ''}>
                                            <a href="#payroll" onClick={(e) => { e.preventDefault(); setActiveTab('payroll'); }}>Payroll</a>
                                        </li>
                                        <li className={activeTab === 'leaves' ? 'active' : ''}>
                                            <a href="#leaves" onClick={(e) => { e.preventDefault(); setActiveTab('leaves'); }}>Leaves</a>
                                        </li>
                                        <li className={activeTab === 'attendance' ? 'active' : ''}>
                                            <a href="#attendance" onClick={(e) => { e.preventDefault(); setActiveTab('attendance'); }}>Attendance</a>
                                        </li>
                                        <li className={activeTab === 'documents' ? 'active' : ''}>
                                            <a href="#documents" onClick={(e) => { e.preventDefault(); setActiveTab('documents'); }}>Documents</a>
                                        </li>
                                        <li className={activeTab === 'timeline' ? 'active' : ''}>
                                            <a href="#timeline" onClick={(e) => { e.preventDefault(); setActiveTab('timeline'); }}>Timeline</a>
                                        </li>

                                        {/* Action Buttons - displayed right to left with pull-right */}
                                        <li className="pull-right">
                                            <a href="#" className="text-red" title="Disable" onClick={(e) => {
                                                e.preventDefault();
                                                setShowDisableModal(true);
                                            }}>
                                                <i className="fa fa-thumbs-o-down"></i>
                                            </a>
                                        </li>
                                        <li className="pull-right">
                                            <a href="#" className="text-green" title="Change Password" onClick={(e) => { e.preventDefault(); setShowPasswordModal(true); }}>
                                                <i className="fa fa-key"></i>
                                            </a>
                                        </li>
                                        <li className="pull-right">
                                            <a
                                                href={`/admin/staff/edit/${staff.id}`}
                                                className="text-light"
                                                title="Edit"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`/admin/staff/edit/${staff.id}`);
                                                }}
                                            >
                                                <i className="fa fa-pencil"></i>
                                            </a>
                                        </li>
                                    </ul>

                                    <div className="tab-content">

                                        {/* Profile Tab */}
                                        <div className={`tab-pane ${activeTab === 'profile' ? 'active' : ''}`} id="profile">
                                            <div className="tshadow mb25 bozero">
                                                <div className="table-responsive around10 pt0">
                                                    <table className="table table-hover table-striped tmb0">
                                                        <tbody>
                                                            <tr><td>Phone</td><td>{staff.contact_no}</td></tr>
                                                            <tr><td>Emergency Contact</td><td>{staff.emergency_contact_no}</td></tr>
                                                            <tr><td>Email</td><td>{staff.email}</td></tr>
                                                            <tr><td>Gender</td><td>{staff.gender}</td></tr>
                                                            <tr><td>Date of Birth</td><td>{staff.dob}</td></tr>
                                                            <tr><td>Marital Status</td><td>{staff.marital_status}</td></tr>
                                                            <tr><td>Father's Name</td><td>{staff.father_name}</td></tr>
                                                            <tr><td>Mother's Name</td><td>{staff.mother_name}</td></tr>
                                                            <tr><td>Qualification</td><td>{staff.qualification}</td></tr>
                                                            <tr><td>Work Experience</td><td>{staff.work_exp}</td></tr>
                                                            <tr><td>Note</td><td>{staff.note}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            <div className="tshadow mb25 bozero">
                                                <h3 className="pagetitleh2">Address Details</h3>
                                                <div className="table-responsive around10 pt0">
                                                    <table className="table table-hover table-striped tmb0">
                                                        <tbody>
                                                            <tr><td className="col-md-4">Current Address</td><td className="col-md-5">{staff.local_address}</td></tr>
                                                            <tr><td>Permanent Address</td><td>{staff.permanent_address}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Bank */}
                                            <div className="tshadow mb25 bozero">
                                                <h3 className="pagetitleh2">Bank Account Details</h3>
                                                <div className="table-responsive around10 pt0">
                                                    <table className="table table-hover table-striped tmb0">
                                                        <tbody>
                                                            <tr><td className="col-md-4">Account Title</td><td className="col-md-5">{staff.account_title}</td></tr>
                                                            <tr><td>Bank Name</td><td>{staff.bank_name}</td></tr>
                                                            <tr><td>Bank Branch Name</td><td>{staff.bank_branch}</td></tr>
                                                            <tr><td>Bank Account Number</td><td>{staff.bank_account_no}</td></tr>
                                                            <tr><td>IFSC Code</td><td>{staff.ifsc_code}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Social Media */}
                                            <div className="tshadow mb25 bozero">
                                                <h3 className="pagetitleh2">Social Media Link</h3>
                                                <div className="table-responsive around10 pt0">
                                                    <table className="table table-hover table-striped tmb0">
                                                        <tbody>
                                                            <tr><td className="col-md-4">Facebook URL</td><td className="col-md-5"><a href={staff.facebook} target="_blank" rel="noreferrer">{staff.facebook}</a></td></tr>
                                                            <tr><td>Twitter URL</td><td><a href={staff.twitter} target="_blank" rel="noreferrer">{staff.twitter}</a></td></tr>
                                                            <tr><td>Linkedin URL</td><td><a href={staff.linkedin} target="_blank" rel="noreferrer">{staff.linkedin}</a></td></tr>
                                                            <tr><td>Instagram URL</td><td><a href={staff.instagram} target="_blank" rel="noreferrer">{staff.instagram}</a></td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payroll Tab */}
                                        <div className={`tab-pane ${activeTab === 'payroll' ? 'active' : ''}`} id="payroll">
                                            <div className="row">
                                                <div className="col-lg-3 col-md-4 col-sm-6">
                                                    <div className="staffprofile">
                                                        <h5>Total Net Salary Paid</h5>
                                                        <h4>₹{(payroll.payslips || []).reduce((sum, p) => sum + (parseFloat(p.net_salary) || 0), 0).toLocaleString()}</h4>
                                                        <div className="icon"><i className="fa fa-money"></i></div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3 col-md-4 col-sm-6">
                                                    <div className="staffprofile">
                                                        <h5>Total Gross Salary</h5>
                                                        <h4>₹{(payroll.payslips || []).reduce((sum, p) => sum + (parseFloat(p.gross_salary) || 0), 0).toLocaleString()}</h4>
                                                        <div className="icon"><i className="fa fa-money"></i></div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3 col-md-4 col-sm-6">
                                                    <div className="staffprofile">
                                                        <h5>Total Earning</h5>
                                                        <h4>₹{(payroll.payslips || []).reduce((sum, p) => sum + (parseFloat(p.total_earning) || 0), 0).toLocaleString()}</h4>
                                                        <div className="icon"><i className="fa fa-money"></i></div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3 col-md-4 col-sm-6">
                                                    <div className="staffprofile">
                                                        <h5>Total Deduction</h5>
                                                        <h4>₹{(payroll.payslips || []).reduce((sum, p) => sum + (parseFloat(p.total_deduction) || 0), 0).toLocaleString()}</h4>
                                                        <div className="icon"><i className="fa fa-money"></i></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table table-hover table-striped table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th>Payslip #</th>
                                                            <th>Month - Year</th>
                                                            <th>Date</th>
                                                            <th>Mode</th>
                                                            <th>Status</th>
                                                            <th className="text-right">Net Salary (₹)</th>
                                                            <th className="text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(payroll.payslips || []).map((p, idx) => (
                                                            <tr key={idx}>
                                                                <td>{p.id}</td>
                                                                <td>{p.month} - {p.year}</td>
                                                                <td>{p.payment_date}</td>
                                                                <td>{p.payment_mode || 'Cash'}</td>
                                                                <td>
                                                                    <span className={`label ${p.status === 'paid' ? 'label-success' : 'label-warning'}`}>
                                                                        {p.status || 'Paid'}
                                                                    </span>
                                                                </td>
                                                                <td className="text-right">₹{parseFloat(p.net_salary).toLocaleString()}</td>
                                                                <td className="text-right">
                                                                    <button className="btn btn-primary btn-xs" style={{ borderRadius: '25px', backgroundColor: '#9754ca', border: 'none', padding: '5px 15px' }}>
                                                                        View Payslip
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {(!payroll.payslips || payroll.payslips.length === 0) && (
                                                            <tr>
                                                                <td colSpan="7" className="text-center text-muted">No payslip records found</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '0 5px' }}>
                                                <div style={{ color: '#666', fontSize: '13px' }}>
                                                    Showing 1 to {payroll.payslips.length} of {payroll.payslips.length} Records
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#666', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>&lt;</a>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '28px',
                                                        height: '28px',
                                                        backgroundColor: '#eeeeee',
                                                        color: '#333',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        borderRadius: '2px'
                                                    }}>1</span>
                                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#666', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>&gt;</a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Leaves Tab */}
                                        <div className={`tab-pane ${activeTab === 'leaves' ? 'active' : ''}`} id="leaves">
                                            <div className="row row-flex">
                                                {leaves.details.map((leave, idx) => (
                                                    <div className="col-lg-3 col-md-4 col-sm-6" key={idx}>
                                                        <div className="staffprofile">
                                                            <h5>{leave.type} ({leave.alloted})</h5>
                                                            <p>Used: {leave.approved}</p>
                                                            <p>Available: {leave.alloted - leave.approved}</p>
                                                            <div className="icon"><i className="fa fa-plane"></i></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table table-hover table-striped table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th>Leave Type</th>
                                                            <th>Leave Date</th>
                                                            <th>Days</th>
                                                            <th>Apply Date</th>
                                                            <th>Status</th>
                                                            <th className="text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leaves.history.map((hist, idx) => (
                                                            <tr key={idx}>
                                                                <td>{hist.type}</td>
                                                                <td>{hist.date_range}</td>
                                                                <td>{hist.days}</td>
                                                                <td>{hist.apply_date}</td>
                                                                <td>
                                                                    <small className={`label ${hist.status === 'approve' ? 'label-success' : 'label-warning'}`}>
                                                                        {hist.status}
                                                                    </small>
                                                                </td>
                                                                <td className="text-right">
                                                                    <button className="btn btn-default btn-xs"><i className="fa fa-eye"></i></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '0 5px' }}>
                                                <div style={{ color: '#666', fontSize: '13px' }}>
                                                    Showing 1 to {leaves.history.length} of {leaves.history.length} Records
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#666', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>&lt;</a>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '28px',
                                                        height: '28px',
                                                        backgroundColor: '#eeeeee',
                                                        color: '#333',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        borderRadius: '2px'
                                                    }}>1</span>
                                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#666', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>&gt;</a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attendance Tab */}
                                        <div className={`tab-pane ${activeTab === 'attendance' ? 'active' : ''}`} id="attendance">
                                            <div className="row">
                                                {Object.entries(attendance.stats).map(([key, val]) => (
                                                    <div className="col-lg-3 col-md-4 col-sm-6 col20per" key={key}>
                                                        <div className="staffprofile">
                                                            <h5>Total {key.replace('_', ' ').toUpperCase()}</h5>
                                                            <h4>{val}</h4>
                                                            <div className="icon"><i className="fa fa-check-square-o"></i></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Year</label>
                                                        <select className="form-control">
                                                            <option>2025</option>
                                                            <option>2024</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table table-striped table-bordered table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Date | Month</th>
                                                            {attendance.months.map(m => <th key={m}>{m}</th>)}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {/* Mocking a simplified view of attendance grid */}
                                                        <tr>
                                                            <td>01</td>
                                                            {attendance.months.map(m => <td key={m}><span title="Present">P</span></td>)}
                                                        </tr>
                                                        <tr>
                                                            <td>02</td>
                                                            {attendance.months.map(m => <td key={m}><span title="Absent" className="text-danger">A</span></td>)}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Documents Tab */}
                                        <div className={`tab-pane ${activeTab === 'documents' ? 'active' : ''}`} id="documents">
                                            <div className="row">
                                                {documents.length > 0 ? (
                                                    documents.map((doc, idx) => (
                                                        <div className="col-lg-3 col-md-4 col-sm-6" key={idx}>
                                                            <div className="staffprofile">
                                                                <h5>{doc.title}</h5>
                                                                <button className="btn btn-default btn-xs" title="Download"><i className="fa fa-download"></i></button>
                                                                <div className="icon"><i className="fa fa-file-text-o"></i></div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-md-12">
                                                        <div className="alert alert-info" style={{ backgroundColor: '#d9edf7', borderColor: '#bce8f1', color: '#31708f', margin: '10px 0' }}>
                                                            No Record Found
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline Tab */}
                                        <div className={`tab-pane ${activeTab === 'timeline' ? 'active' : ''}`} id="timeline">
                                            <div className="row" style={{ marginBottom: '15px' }}>
                                                <div className="col-md-12 text-right">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        style={{ borderRadius: '25px', backgroundColor: '#9754ca', border: 'none', padding: '5px 23px', fontSize: '12px' }}
                                                        onClick={() => {
                                                            setEditTimelineId(null);
                                                            setTimelineForm({
                                                                title: '',
                                                                date: new Date().toISOString().split('T')[0],
                                                                description: '',
                                                                document: null,
                                                                visible: true
                                                            });
                                                            setShowTimelineModal(true);
                                                        }}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="timeline-header no-border" style={{ paddingBottom: '30px' }}>
                                                {timeline.length > 0 ? (
                                                    <ul className="timeline timeline-inverse">
                                                        {timeline.map(item => (
                                                            <React.Fragment key={item.id}>
                                                                <li className="time-label">
                                                                    <span className="bg-blue" style={{ borderRadius: '3px', fontSize: '12px', padding: '3px 8px' }}>
                                                                        {item.date}
                                                                    </span>
                                                                </li>
                                                                <li>
                                                                    <i className="fa fa-list-alt bg-blue"></i>
                                                                    <div className="timeline-item" style={{ border: '1px solid #eee', boxShadow: 'none' }}>
                                                                        <div className="timeline-header" style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #f4f4f4', color: '#00c0ef', fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px' }}>
                                                                            <span>{item.title}</span>
                                                                            <div className="timeline-actions">
                                                                                {(item.document || item.file) && (
                                                                                    <i className="fa fa-download" style={{ color: '#333', marginRight: '15px', cursor: 'pointer', fontSize: '14px' }} title="Download"></i>
                                                                                )}
                                                                                <i className="fa fa-pencil" style={{ color: '#333', marginRight: '15px', cursor: 'pointer', fontSize: '14px' }} onClick={() => handleEditTimeline(item)}></i>
                                                                                <i className="fa fa-trash" style={{ color: '#333', cursor: 'pointer', fontSize: '14px' }}></i>
                                                                            </div>
                                                                        </div>
                                                                        <div className="timeline-body" style={{ padding: '10px 15px', color: '#666' }}>{item.description}</div>
                                                                    </div>
                                                                </li>
                                                            </React.Fragment>
                                                        ))}
                                                        <li><i className="fa fa-clock-o bg-gray"></i></li>
                                                    </ul>
                                                ) : (
                                                    <div className="alert alert-info" style={{ backgroundColor: '#d9edf7', borderColor: '#bce8f1', color: '#31708f', margin: '10px 0' }}>
                                                        No Record Found
                                                    </div>
                                                )}
                                            </div>
                                        </div>



                                    </div>
                                    {/* /.tab-content */}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
            <Footer />
            <div className="control-sidebar-bg"></div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setShowPasswordModal(false)}>&times;</button>
                                    <h4 className="modal-title">Change Password</h4>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>New Password <small className="req"> *</small></label>
                                        <input type="password" required className="form-control" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password <small className="req"> *</small></label>
                                        <input type="password" required className="form-control" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary pull-right">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Disable Staff Modal */}
            {showDisableModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleDisableSubmit}>
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setShowDisableModal(false)}>&times;</button>
                                    <h4 className="modal-title">Disable Staff</h4>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Date <small className="req"> *</small></label>
                                        <input type="date" required className="form-control" value={disableDate} onChange={(e) => setDisableDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary pull-right">Proceed</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Timeline Modal */}
            {showTimelineModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={(e) => { e.preventDefault(); alert('Timeline Added (Mock)'); setShowTimelineModal(false); }}>
                                <div className="modal-header" style={{ borderBottom: '1px solid #eee', padding: '15px 20px' }}>
                                    <button type="button" className="close" onClick={() => setShowTimelineModal(false)}>&times;</button>
                                    <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>
                                        {editTimelineId ? 'Edit Timeline' : 'Add Timeline'}
                                    </h3>
                                </div>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Title <small className="req"> *</small></label>
                                        <input type="text" required className="form-control" value={timelineForm.title} onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Date <small className="req"> *</small></label>
                                        <input type="date" required className="form-control" value={timelineForm.date} onChange={(e) => setTimelineForm({ ...timelineForm, date: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea className="form-control" rows="3" value={timelineForm.description} onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Attach Document</label>
                                        <style>{uploadHoverStyles}</style>
                                        <div
                                            className={!timelineForm.document ? "upload-area-hover" : ""}
                                            style={{
                                                border: 'none',
                                                borderBottom: '1px solid #e5e5e5',
                                                padding: timelineForm.document && isUploadHovered ? '0' : '8px 15px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#444',
                                                transition: 'all 0.3s ease',
                                                minHeight: '40px',
                                                maxHeight: '40px',
                                                background: timelineForm.document && isUploadHovered ? '#4a4a4a' : '#fafafa',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}
                                            onClick={() => document.getElementById('timeline-file-upload').click()}
                                            onMouseEnter={() => setIsUploadHovered(true)}
                                            onMouseLeave={() => setIsUploadHovered(false)}
                                        >
                                            {timelineForm.document ? (
                                                isUploadHovered ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', padding: '5px 15px' }}>
                                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                                                                {timelineForm.document instanceof File ? timelineForm.document.name : timelineForm.document.split('/').pop()}
                                                            </div>
                                                            <div style={{ color: '#ccc', fontSize: '11px' }}>Drag and drop or click to replace</div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTimelineForm({ ...timelineForm, document: null });
                                                            }}
                                                            style={{
                                                                border: '1px solid #777',
                                                                background: 'none',
                                                                color: '#fff',
                                                                padding: '4px 10px',
                                                                fontSize: '11px',
                                                                borderRadius: '2px'
                                                            }}
                                                        >
                                                            REMOVE
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                                        {timelineForm.document ? (
                                                            <>
                                                                {(timelineForm.document instanceof File && timelineForm.document.type.startsWith('image/')) || 
                                                                 (typeof timelineForm.document === 'string' && timelineForm.document.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                                                    <img 
                                                                        src={timelineForm.document instanceof File ? URL.createObjectURL(timelineForm.document) : timelineForm.document} 
                                                                        alt="Preview" 
                                                                        style={{ height: '32px', maxWidth: '100%', objectFit: 'contain', borderRadius: '2px' }} 
                                                                    />
                                                                ) : (
                                                                    <div style={{ textAlign: 'center' }}>
                                                                        <i className="fa fa-file-o" style={{ fontSize: '20px', color: '#666' }}></i>
                                                                        <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                                                            {timelineForm.document instanceof File ? timelineForm.document.name : timelineForm.document.split('/').pop()}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : null}
                                                    </div>
                                                )
                                            ) : (
                                                <>
                                                    <i className="fa fa-cloud-upload" style={{ fontSize: '20px', marginRight: '10px', color: '#555' }}></i>
                                                    <span style={{ fontSize: '13px' }}>Drag and drop a file here or click</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                id="timeline-file-upload"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setTimelineForm({ ...timelineForm, document: file });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="checkbox">
                                        <label>
                                            <input type="checkbox" checked={timelineForm.visible} onChange={(e) => setTimelineForm({ ...timelineForm, visible: e.target.checked })} /> Visible to this person
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary pull-right" style={{ borderRadius: '25px', backgroundColor: '#9754ca', border: 'none', padding: '5px 20px' }}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffProfile;
