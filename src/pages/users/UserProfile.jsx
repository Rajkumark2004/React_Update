
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';

const Profile = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "KARTHIK",
        role: "Student",
        id: "1009",
        avatar: "https://avatar.iran.liara.run/public/boy?username=KARTHIK"
    });

    const [activeTab, setActiveTab] = useState('profile');
    const [showNotice, setShowNotice] = useState(true);

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);



    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };



    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const { api_users } = await import('../../services/api_users');
                const res = await api_users.getUserProfile();

                if (res && res.status && res.data) {
                    setProfileData(res.data);

                    if (res.data.student) {
                        setUserData({
                            name: `${res.data.student.firstname} ${res.data.student.lastname}`.trim() || 'Student',
                            role: 'Student',
                            id: res.data.student.id,
                            admission_no: res.data.student.admission_no,
                            avatar: res.data.student.image ? `${res.data.student.base_url || ''}uploads/student_images/${res.data.student.image}` : "/uploads/student_images/no_image.png",
                            adminLogoUrl: "" // Update if logo is returned by profile API
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const parseAmountDetail = (detailStr) => {
        let paid = 0;
        let mode = '';
        let date = '';
        let discount = 0;
        let fine = 0;
        let paymentId = '';
        try {
            if (detailStr && detailStr !== "0" && typeof detailStr === 'string') {
                const details = JSON.parse(detailStr);
                Object.values(details).forEach((entry) => {
                    paid += parseFloat(entry.amount || 0);
                    discount += parseFloat(entry.amount_discount || 0);
                    fine += parseFloat(entry.amount_fine || 0);
                    mode = mode ? `${mode}, ${entry.payment_mode}` : entry.payment_mode;
                    date = date ? `${date}, ${entry.date}` : entry.date;
                    paymentId = paymentId ? `${paymentId}, ${entry.inv_no}` : (entry.inv_no || '');
                });
            }
        } catch (e) {
            console.error('Error parsing fee details', e);
        }
        return {
            paid: paid.toFixed(2),
            mode,
            date,
            discount: discount.toFixed(2),
            fine: fine.toFixed(2),
            paymentId
        };
    };

    const themeColor = "#9c68e4";

    const studentObj = profileData?.student || {};
    const feesData = profileData?.student_due_fee || [];
    const attendanceTypes = profileData?.attendance_types || [];
    const timelineData = profileData?.timeline || [];
    const documentsData = profileData?.student_docs || [];
    const behaviouralNotes = profileData?.behavioural_notes || [];

    // Calculate Grand Totals for Fees
    let grandTotalAmount = 0;
    let grandTotalPaid = 0;
    let grandTotalDiscount = 0;
    let grandTotalFine = 0;
    let grandTotalBalance = 0;

    feesData.forEach(group => {
        if (group.fees && group.fees.length > 0) {
            group.fees.forEach(fee => {
                const amt = parseFloat(fee.amount || 0);
                const { paid, discount, fine } = parseAmountDetail(fee.amount_detail);
                const feePaid = parseFloat(paid);
                const feeDiscount = parseFloat(discount);
                const feeFine = parseFloat(fine);

                grandTotalAmount += amt;
                grandTotalPaid += feePaid;
                grandTotalDiscount += feeDiscount;
                grandTotalFine += feeFine;
                grandTotalBalance += (amt + feeFine - feeDiscount - feePaid);
            });
        }
    });

    const attendanceData = profileData?.student_attendance || [];
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalHalfDay = 0;
    let totalHoliday = 0;

    attendanceData.forEach(att => {
        if (att.type === 'Present') totalPresent++;
        if (att.type === 'Late') totalLate++;
        if (att.type === 'Absent') totalAbsent++;
        if (att.type === 'Half Day') totalHalfDay++;
        if (att.type === 'Holiday') totalHoliday++;
    });

    return (
        <div className="wrapper">
            <style>{`
                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                /* NAVBAR USER MENU DROPDOWN FIX */
                .navbar-custom-menu {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav > li:not(.user-menu) {
                    display: none !important;
                }
                .navbar-custom-menu .nav > li.user-menu {
                    display: block !important;
                    overflow: visible !important;
                }
                
                /* Ensure dropdown menu is on top of everything */
                .dropdown-user {
                    display: none;
                    z-index: 9999 !important;
                    position: absolute !important;
                    right: 0 !important;
                    top: 100% !important;
                }
                .user-menu.open .dropdown-user {
                    display: block !important;
                }

                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }

                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                }

                .sidebar::-webkit-scrollbar {
                    width: 5px;
                }
                .sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }

                .sidebar-menu > li > a {
                    padding: 12px 5px !important;
                    text-align: center !important;
                }
                
                .sidebar-menu li img {
                    filter: brightness(0) invert(1) !important;
                    width: 24px !important;
                    margin: 0 auto !important;
                }

                .sidebar-menu > li > a span {
                    color: #ffffff !important;
                    font-weight: 500 !important;
                    margin-top: 5px !important;
                    display: block !important;
                    font-size: 10px !important;
                    line-height: 1.2 !important;
                }

                .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a {
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                /* Notice Bar */
                .notice-bar { background: #d9edf7; border: 1px solid #bce8f1; color: #31708f; padding: 10px 15px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 13px; }
                .notice-bar .close-btn { cursor: pointer; font-size: 18px; font-weight: bold; line-height: 1; }

                /* Sidebar Profile Box */
                .profile-box { background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 0; margin-bottom: 20px; overflow: hidden; }
                .profile-header-new { display: flex; gap: 15px; padding: 20px; border-bottom: 1px solid #f4f4f4; }
                .photo-square { width: 75px; height: 75px; background: #fff8e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .photo-square .person-icon { width: 45px; height: 45px; background: url('https://cdn-icons-png.flaticon.com/512/1077/1077114.png') no-repeat center; background-size: contain; opacity: 0.35; filter: grayscale(1); }
                .name-info h3 { margin: 0; font-size: 18px; font-weight: bold; color: #333; }
                .name-info p { margin: 2px 0 0; font-size: 13px; color: #777; }
                .name-info .blue-text { color: #0084B4; }

                .info-row { display: flex; justify-content: space-between; padding: 10px 20px; border-bottom: 1px solid #f4f4f4; font-size: 13px; align-items: center; }
                .info-row:last-child { border-bottom: none; }
                .info-label { color: #333; font-weight: 600; }
                .info-value { color: #0084B4; text-align: right; }

                /* Tab Styling */
                .custom-tabs { display: flex; border-bottom: 1px solid #eee; background: #fff; margin-bottom: 0px; padding: 0 10px; }
                .tab-item { padding: 12px 15px; cursor: pointer; color: #666; font-size: 13px; position: relative; transition: all 0.2s; }
                .tab-item.active { color: #333; font-weight: 500; }
                .tab-item.active::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: #3c8dbc; }
                .tab-item:hover { background: #f9f9f9; }

                /* Content Sections */
                .tab-content-container { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0 0 4px 4px; }
                .section-header-gray { background: #f5f5f5; padding: 10px 20px; font-weight: bold; font-size: 14px; color: #444; border-bottom: 1px solid #eee; margin-top: 0px; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table td { padding: 8px 20px; font-size: 13px; color: #333; border-bottom: 1px solid #f9f9f9; width: 40%; }
                .data-table td + td { color: #333; width: 60%; text-align: left; }
                
                .parent-section { display: flex; justify-content: space-between; padding: 15px 20px; align-items: flex-start; border-bottom: 1px solid #f9f9f9; }
                .parent-data { flex: 1; }
                .parent-photo-circle { width: 70px; height: 70px; background: #fff8e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .parent-photo-circle .person-icon { width: 40px; height: 40px; background: url('https://cdn-icons-png.flaticon.com/512/1077/1077114.png') no-repeat center; background-size: contain; opacity: 0.35; filter: grayscale(1); }

                .no-record-box {
                    background: #d9edf7;
                    border: 1px solid #bce8f1;
                    color: #31708f;
                    padding: 12px 20px;
                    border-radius: 4px;
                    margin: 20px;
                    text-align: left;
                    font-size: 14px;
                }

                /* Attendance Card Styling */
                .attendance-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 15px; }
                .attendance-card { background: #f5f5f5; padding: 15px; border-radius: 4px; position: relative; display: flex; flex-direction: column; }
                .attendance-card .label { font-size: 13px; color: #333; font-weight: 500; }
                .attendance-card .count { font-size: 20px; font-weight: bold; margin-top: 5px; }
                .attendance-card .status-icon { position: absolute; right: 15px; top: 15px; font-size: 30px; color: #ccc; }

                /* Fees Table Styling */
                .fees-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .fees-table th { background: #fdf5f5; padding: 10px 5px; text-align: left; border-bottom: 1px solid #eee; color: #333; font-weight: 600; }
                .fees-table td { padding: 8px 5px; border-bottom: 1px solid #eee; vertical-align: middle; }
                .fees-summary-row { background: #fde8e8 !important; }
                .status-badge { padding: 2px 6px; border-radius: 4px; color: #fff; font-size: 10px; font-weight: bold; }
                .status-unpaid { background: #d9534f; }
                .status-paid { background: #5cb85c; }
                .sub-row { background: #ffffff !important; font-size: 11px; }
                .grand-total-row { background: #eee !important; font-weight: bold; }
                .status-warning { background: #f0ad4e; }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }
            `}</style>

            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/profile"
            />

            <div className="content-wrapper" style={{ minHeight: "626px", marginTop: "0px" }}>
                <section className="content" style={{ padding: '15px' }}>
                    {showNotice && (
                        <div className="notice-bar">
                            <span>Holiday Notice Cancel</span>
                            <span className="close-btn" onClick={() => setShowNotice(false)}>&times;</span>
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-3">
                            <div className="profile-box">
                                <div className="profile-header-new">
                                    <div className="photo-square">
                                        <div className="person-icon"></div>
                                    </div>
                                    <div className="name-info">
                                        <h3>{studentObj.firstname || 'Student'} {studentObj.lastname || ''}</h3>
                                        <p>Admission No <span className="blue-text">{studentObj.admission_no || '-'}</span></p>
                                        <p>Roll Number <span className="blue-text">{studentObj.roll_no || '-'}</span></p>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="info-row">
                                        <span className="info-label">Class</span>
                                        <span className="info-value">{studentObj.class || '-'} ({studentObj.session || '-'})</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Section</span>
                                        <span className="info-value">{studentObj.section || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">RTE</span>
                                        <span className="info-value">{studentObj.rte || 'No'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Gender</span>
                                        <span className="info-value">{studentObj.gender || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Barcode</span>
                                        <span className="info-value"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-9">
                            <div className="tab-container-main">
                                <div className="custom-tabs">
                                    <div className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</div>
                                    <div className={`tab-item ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')}>Fees</div>
                                    <div className={`tab-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</div>
                                    <div className={`tab-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Documents</div>
                                    <div className={`tab-item ${activeTab === 'behavioural' ? 'active' : ''}`} onClick={() => setActiveTab('behavioural')}>Behavioural Note</div>
                                    <div className={`tab-item ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>Timeline</div>
                                </div>

                                <div className="tab-content-container">
                                    {activeTab === 'profile' && (
                                        <div style={{ paddingBottom: '30px' }}>
                                            <table className="data-table" style={{ marginTop: '5px' }}>
                                                <tbody>
                                                    <tr><td>Admission Date</td><td>{studentObj.admission_date || '-'}</td></tr>
                                                    <tr><td>Date of Birth</td><td>{studentObj.dob || '-'}</td></tr>
                                                    <tr><td>Category</td><td>{studentObj.category_id || '-'}</td></tr>
                                                    <tr><td>Mobile Number</td><td>{studentObj.mobileno || '-'}</td></tr>
                                                    <tr><td>Caste</td><td>{studentObj.cast || '-'}</td></tr>
                                                    <tr><td>Religion</td><td>{studentObj.religion || '-'}</td></tr>
                                                    <tr><td>Email</td><td>{studentObj.email || '-'}</td></tr>
                                                    <tr><td>Note</td><td>{studentObj.note || '-'}</td></tr>
                                                </tbody>
                                            </table>

                                            <div className="section-header-gray">Address Details</div>
                                            <table className="data-table">
                                                <tbody>
                                                    <tr><td>Current Address</td><td>{studentObj.current_address || '-'}</td></tr>
                                                    <tr><td>Permanent Address</td><td>{studentObj.permanent_address || '-'}</td></tr>
                                                </tbody>
                                            </table>

                                            <div className="section-header-gray">Parent Guardian Detail</div>
                                            <div className="parent-section">
                                                <div className="parent-data">
                                                    <table className="data-table" style={{ width: '100%' }}>
                                                        <tbody>
                                                            <tr><td>Father Name</td><td>{studentObj.father_name || '-'}</td></tr>
                                                            <tr><td>Father Phone</td><td>{studentObj.father_phone || '-'}</td></tr>
                                                            <tr><td>Father Occupation</td><td>{studentObj.father_occupation || '-'}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="parent-photo-circle">
                                                    <div className="person-icon"></div>
                                                </div>
                                            </div>
                                            <div className="parent-section">
                                                <div className="parent-data">
                                                    <table className="data-table" style={{ width: '100%' }}>
                                                        <tbody>
                                                            <tr><td>Mother Name</td><td>{studentObj.mother_name || '-'}</td></tr>
                                                            <tr><td>Mother Phone</td><td>{studentObj.mother_phone || '-'}</td></tr>
                                                            <tr><td>Mother Occupation</td><td>{studentObj.mother_occupation || '-'}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="parent-photo-circle">
                                                    <div className="person-icon"></div>
                                                </div>
                                            </div>
                                            <div className="parent-section">
                                                <div className="parent-data">
                                                    <table className="data-table" style={{ width: '100%' }}>
                                                        <tbody>
                                                            <tr><td>Guardian Name</td><td>{studentObj.guardian_name || '-'}</td></tr>
                                                            <tr><td>Guardian Relation</td><td>{studentObj.guardian_relation || '-'}</td></tr>
                                                            <tr><td>Guardian Email</td><td>{studentObj.guardian_email || '-'}</td></tr>
                                                            <tr><td>Guardian Phone</td><td>{studentObj.guardian_phone || '-'}</td></tr>
                                                            <tr><td>Guardian Occupation</td><td>{studentObj.guardian_occupation || '-'}</td></tr>
                                                            <tr><td>Guardian Address</td><td>{studentObj.guardian_address || '-'}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="parent-photo-circle">
                                                    <div className="person-icon"></div>
                                                </div>
                                            </div>

                                            <div className="section-header-gray">Miscellaneous Details</div>
                                            <table className="data-table">
                                                <tbody>
                                                    <tr><td>Blood Group</td><td>{studentObj.blood_group || '-'}</td></tr>
                                                    <tr><td>House</td><td>{studentObj.house_name || '-'}</td></tr>
                                                    <tr><td>Height</td><td>{studentObj.height || '-'}</td></tr>
                                                    <tr><td>Weight</td><td>{studentObj.weight || '-'}</td></tr>
                                                    <tr><td>Measurement Date</td><td>{studentObj.measurement_date || '-'}</td></tr>
                                                    <tr><td>Previous School Details</td><td>{studentObj.previous_school || '-'}</td></tr>
                                                    <tr><td>National Identification Number</td><td>{studentObj.samagra_id || '-'}</td></tr>
                                                    <tr><td>Local Identification Number</td><td>{studentObj.adhar_no || '-'}</td></tr>
                                                    <tr><td>Bank Account Number</td><td>{studentObj.bank_account_no || '-'}</td></tr>
                                                    <tr><td>Bank Name</td><td>{studentObj.bank_name || '-'}</td></tr>
                                                    <tr><td>IFSC Code</td><td>{studentObj.ifsc_code || '-'}</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {activeTab === 'attendance' && (
                                        <div style={{ padding: '0px' }}>
                                            <div className="attendance-cards">
                                                <div className="attendance-card">
                                                    <span className="label">Total Present</span>
                                                    <span className="count">{totalPresent}</span>
                                                    <i className="fa fa-check-square status-icon"></i>
                                                </div>
                                                <div className="attendance-card">
                                                    <span className="label">Total Late</span>
                                                    <span className="count">{totalLate}</span>
                                                    <i className="fa fa-check-square status-icon"></i>
                                                </div>
                                                <div className="attendance-card">
                                                    <span className="label">Total Absent</span>
                                                    <span className="count">{totalAbsent}</span>
                                                    <i className="fa fa-check-square status-icon"></i>
                                                </div>
                                                <div className="attendance-card">
                                                    <span className="label">Total Half Day</span>
                                                    <span className="count">{totalHalfDay}</span>
                                                    <i className="fa fa-check-square status-icon"></i>
                                                </div>
                                                <div className="attendance-card" style={{ gridColumn: '1 / 2' }}>
                                                    <span className="label">Total Holiday</span>
                                                    <span className="count">{totalHoliday}</span>
                                                    <i className="fa fa-check-square status-icon"></i>
                                                </div>
                                            </div>

                                            <div style={{ padding: '10px 15px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>
                                                Present: <span style={{ color: '#5cb85c' }}>P</span> |
                                                Late With Excuse: <span style={{ color: '#f0ad4e' }}>E</span> |
                                                Late: <span style={{ color: '#d9534f' }}>L</span> |
                                                Absent: <span style={{ color: '#d9534f' }}>A</span> |
                                                Holiday: <span style={{ color: '#31708f' }}>H</span> |
                                                Half Day: <span style={{ color: '#5bc0de' }}>F</span>
                                            </div>

                                            <div className="table-responsive" style={{ padding: '0 15px 15px' }}>
                                                <table className="table table-bordered" style={{ fontSize: '11px', textAlign: 'center' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Date | Month</th>
                                                            {['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'].map(m => <th key={m}>{m}</th>)}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                            <tr key={day}>
                                                                <td style={{ fontWeight: 'bold' }}>{day}</td>
                                                                {Array.from({ length: 12 }).map((_, mi) => <td key={mi}></td>)}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'fees' && (
                                        <div className="table-responsive" style={{ padding: '15px' }}>
                                            <table className="fees-table">
                                                <thead>
                                                    <tr>
                                                        <th>Fees Group</th>
                                                        <th>Fees Code</th>
                                                        <th>Due Date</th>
                                                        <th>Status</th>
                                                        <th>Amount (₹)</th>
                                                        <th>Payment ID</th>
                                                        <th>Mode</th>
                                                        <th>Date</th>
                                                        <th>Discount (₹)</th>
                                                        <th>Fine (₹)</th>
                                                        <th>Paid (₹)</th>
                                                        <th>Balance (₹)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {feesData.length > 0 ? (
                                                        feesData.map((group, gIdx) => (
                                                            <React.Fragment key={gIdx}>
                                                                {group.fees && group.fees.length > 0 ? (
                                                                    group.fees.map((fee, fIdx) => {
                                                                        const amt = parseFloat(fee.amount || 0);
                                                                        const { paid, mode, date, discount, fine, paymentId } = parseAmountDetail(fee.amount_detail);

                                                                        const paidAmt = parseFloat(paid);
                                                                        const disAmt = parseFloat(discount);
                                                                        const fineAmt = parseFloat(fine);
                                                                        const balance = amt + fineAmt - disAmt - paidAmt;

                                                                        const isPaid = balance <= 0 && paidAmt > 0;
                                                                        const isPartial = balance > 0 && paidAmt > 0;
                                                                        const isUnpaid = paidAmt === 0;

                                                                        let statusText = "Unpaid";
                                                                        let statusClass = "status-unpaid";
                                                                        if (isPaid) {
                                                                            statusText = "Paid";
                                                                            statusClass = "status-paid";
                                                                        } else if (isPartial) {
                                                                            statusText = "Partial";
                                                                            statusClass = "status-warning";
                                                                        }

                                                                        return (
                                                                            <tr key={`${gIdx}-${fIdx}`} className="fees-summary-row" style={{ background: isPaid ? '#fff' : '#fde8e8' }}>
                                                                                <td>{group.name} ({fee.type})</td>
                                                                                <td>{fee.code}</td>
                                                                                <td>{fee.due_date && fee.due_date !== '0000-00-00' ? fee.due_date : ''}</td>
                                                                                <td><span className={`status-badge ${statusClass}`}>{statusText}</span></td>
                                                                                <td>{amt.toFixed(2)}</td>
                                                                                <td>{paymentId}</td>
                                                                                <td>{mode}</td>
                                                                                <td>{date}</td>
                                                                                <td>{discount}</td>
                                                                                <td>{fine}</td>
                                                                                <td>{paid}</td>
                                                                                <td>{balance.toFixed(2)}</td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                ) : null}
                                                            </React.Fragment>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                                                                No Fees Record Found
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {feesData.length > 0 && (
                                                        <tr className="grand-total-row">
                                                            <td colSpan="4" style={{ textAlign: 'right' }}>Grand Total</td>
                                                            <td>₹{grandTotalAmount.toFixed(2)}</td>
                                                            <td colSpan="3"></td>
                                                            <td>₹{grandTotalDiscount.toFixed(2)}</td>
                                                            <td>₹{grandTotalFine.toFixed(2)}</td>
                                                            <td>₹{grandTotalPaid.toFixed(2)}</td>
                                                            <td>₹{grandTotalBalance.toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {activeTab === 'documents' && (
                                        <div className="documents-section" style={{ padding: '15px' }}>
                                            {documentsData.length > 0 ? (
                                                <table className="table table-bordered table-striped data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Title</th>
                                                            <th>File Name</th>
                                                            <th style={{ textAlign: 'right' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {documentsData.map((doc, idx) => (
                                                            <tr key={idx}>
                                                                <td>{doc.title}</td>
                                                                <td>{doc.doc}</td>
                                                                <td style={{ textAlign: 'right' }}>
                                                                    {doc.file_url ? (
                                                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn btn-default btn-xs" title="Download">
                                                                            <i className="fa fa-download"></i> Download
                                                                        </a>
                                                                    ) : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="no-record-box" style={{ background: '#ffd1cc', border: '1px solid #ebccd1', color: '#a94442' }}>
                                                    No Record Found
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'behavioural' && (
                                        <div className="behavioural-section" style={{ padding: '15px' }}>
                                            {behaviouralNotes.length > 0 ? (
                                                <table className="table table-bordered table-striped data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Title</th>
                                                            <th>Description</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {behaviouralNotes.map((note, idx) => (
                                                            <tr key={idx}>
                                                                <td>{note.title}</td>
                                                                <td>{note.description}</td>
                                                                <td>{note.created_at}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="no-record-box">
                                                    No Record Found
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'timeline' && (
                                        <div className="timeline-section" style={{ padding: '15px' }}>
                                            {timelineData.length > 0 ? (
                                                <div className="timeline" style={{ padding: '10px' }}>
                                                    {timelineData.map((item, index) => (
                                                        <div key={index} className="timeline-item" style={{ borderLeft: '2px solid #3c8dbc', paddingLeft: '15px', position: 'relative', marginBottom: '20px' }}>
                                                            <div style={{ position: 'absolute', left: '-6px', top: '0', bottom: '0', width: '10px', height: '10px', background: '#3c8dbc', borderRadius: '50%' }}></div>
                                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                                                                <i className="fa fa-clock-o"></i> {item.timeline_date || item.date}
                                                            </div>
                                                            <h3 style={{ fontSize: '15px', marginTop: '0', color: '#333' }}>{item.title}</h3>
                                                            <div style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>
                                                                {item.description}
                                                            </div>
                                                            {item.document && (
                                                                <div style={{ marginTop: '10px' }}>
                                                                    <a href={`${studentObj.base_url || ''}uploads/student_timeline/${item.document}`} target="_blank" rel="noreferrer" className="btn btn-default btn-xs">
                                                                        <i className="fa fa-download"></i> Download Document
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="no-record-box">
                                                    No Record Found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
