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

    // State for API data
    const [staff, setStaff] = useState(null);
    const [leaves, setLeaves] = useState({ details: [], history: [] });
    const [payroll, setPayroll] = useState({ payslips: [] });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                        {/* <li className={activeTab === 'payroll' ? 'active' : ''}>
                                            <a href="#payroll" onClick={(e) => { e.preventDefault(); setActiveTab('payroll'); }}>Payroll</a>
                                        </li> */}
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
                                                if (window.confirm('Are you sure you want to disable this record?')) {
                                                    console.log('Disable clicked');
                                                }
                                            }}>
                                                <i className="fa fa-thumbs-o-down"></i>
                                            </a>
                                        </li>
                                        <li className="pull-right">
                                            <a href="#" className="text-green" title="Change Password" onClick={(e) => e.preventDefault()}>
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
                                        {/* <div className={`tab-pane ${activeTab === 'payroll' ? 'active' : ''}`} id="payroll">
                                            ... (content hidden) ...
                                        </div> */}

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
                                                {documents.map((doc, idx) => (
                                                    <div className="col-lg-3 col-md-4 col-sm-6" key={idx}>
                                                        <div className="staffprofile">
                                                            <h5>{doc.title}</h5>
                                                            <button className="btn btn-default btn-xs" title="Download"><i className="fa fa-download"></i></button>
                                                            <div className="icon"><i className="fa fa-file-text-o"></i></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Timeline Tab */}
                                        <div className={`tab-pane ${activeTab === 'timeline' ? 'active' : ''}`} id="timeline">
                                            <div className="timeline-header no-border">
                                                <ul className="timeline timeline-inverse">
                                                    {timeline.map(item => (
                                                        <li key={item.id}>
                                                            <i className="fa fa-list-alt bg-blue"></i>
                                                            <div className="timeline-item">
                                                                <span className="time"><i className="fa fa-clock-o"></i> {item.date}</span>
                                                                <h3 className="timeline-header">{item.title}</h3>
                                                                <div className="timeline-body">{item.description}</div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                    <li><i className="fa fa-clock-o bg-gray"></i></li>
                                                </ul>
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
        </div>
    );
};

export default StaffProfile;
