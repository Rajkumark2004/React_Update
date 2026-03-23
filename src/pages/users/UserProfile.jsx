
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
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

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Detailed Fees States
    const [processedFees, setProcessedFees] = useState([]);
    const [transportFees, setTransportFees] = useState([]);
    const [discountFees, setDiscountFees] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [totals, setTotals] = useState({
        amount: 0,
        paid: 0,
        discount: 0,
        fine: 0,
        balance: 0
    });

    // Documents, Behavioural Notes, Timeline States
    const [documentsData, setDocumentsData] = useState([]);
    const [behaviouralNotes, setBehaviouralNotes] = useState([]);
    const [timelineData, setTimelineData] = useState([]);


    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = async () => {
        try {
            await api_users.userLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearSession();
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            navigate('/user/login');
        }
    };



    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const profileRes = await api_users.getUserProfile();

                if (profileRes && profileRes.status && profileRes.data) {
                    setProfileData(profileRes.data);

                    if (profileRes.data.student) {
                        setUserData({
                            name: `${profileRes.data.student.firstname} ${profileRes.data.student.lastname}`.trim() || 'Student',
                            role: 'Student',
                            id: profileRes.data.student.id,
                            admission_no: profileRes.data.student.admission_no,
                            avatar: profileRes.data.student.image ? `${profileRes.data.student.base_url || ''}uploads/student_images/${profileRes.data.student.image}` : "/uploads/student_images/no_image.png",
                            adminLogoUrl: ""
                        });
                    }

                    // Populate documents, behavioural notes, timeline
                    setDocumentsData(profileRes.data.student_documents || profileRes.data.student?.student_documents || []);
                    setBehaviouralNotes(profileRes.data.behavioural_notes || profileRes.data.student?.behavioural_notes || []);
                    setTimelineData(profileRes.data.timeline || profileRes.data.student?.timeline || []);
                }

                // Fetch detailed Fees data
                const feesRes = await api_users.getFees();
                if (feesRes && feesRes.status && feesRes.data) {
                    processFeesData(feesRes.data);
                }

            } catch (error) {
                console.error("Failed to load user profile or fees:", error);
            } finally {
                setLoading(false);
            }
        };

        const processFeesData = (data) => {
            let processed = [];
            let tAmt = 0, tPaid = 0, tDisc = 0, tFine = 0, tBal = 0;
            const currentDate = new Date();

            if (data.student_due_fee) {
                data.student_due_fee.forEach(group => {
                    if (group.fees) {
                        group.fees.forEach(fee => {
                            const details = parseAmountDetailDetailed(fee.amount_detail);
                            const amt = parseFloat(fee.amount || 0);
                            const fFine = parseFloat(details.fineTotal || 0);
                            const fDisc = parseFloat(details.discountTotal || 0);
                            const fPaid = parseFloat(details.paidTotal || 0);

                            let fineAmount = 0;
                            if (fee.due_date && fee.due_date !== "0000-00-00") {
                                const dueDate = new Date(fee.due_date);
                                if (dueDate < currentDate) {
                                    fineAmount = parseFloat(fee.fine_amount || 0);
                                }
                            }

                            const fBal = amt + fFine - fDisc - fPaid;
                            let status = "Unpaid";
                            if (fBal <= 0) {
                                status = "Paid";
                            } else if (details.payments.length > 0) {
                                status = "Partial";
                            }

                            processed.push({
                                ...fee,
                                groupName: group.name,
                                groupIsSystem: group.is_system,
                                feeDetails: details,
                                balance: fBal < 0 ? 0 : fBal,
                                status: status,
                                total_paid: fPaid,
                                total_discount: fDisc,
                                total_fine: fFine,
                                fine_amount_display: fineAmount
                            });

                            tAmt += amt;
                            tFine += fFine;
                            tDisc += fDisc;
                            tPaid += fPaid;
                            tBal += (fBal < 0 ? 0 : fBal);
                        });
                    }
                });
            }

            // Transport Fees
            let transportList = [];
            if (data.transport_fees) {
                data.transport_fees.forEach(fee => {
                    const details = parseAmountDetailDetailed(fee.amount_detail);
                    const amt = parseFloat(fee.fees || 0);
                    const fFine = parseFloat(details.fineTotal || 0);
                    const fDisc = parseFloat(details.discountTotal || 0);
                    const fPaid = parseFloat(details.paidTotal || 0);

                    const fBal = amt + fFine - fDisc - fPaid;
                    let status = "Unpaid";
                    if (fBal <= 0) {
                        status = "Paid";
                    } else if (details.payments.length > 0) {
                        status = "Partial";
                    }

                    transportList.push({
                        ...fee,
                        feeDetails: details,
                        balance: fBal < 0 ? 0 : fBal,
                        status: status,
                        total_paid: fPaid,
                        total_discount: fDisc,
                        total_fine: fFine
                    });
                    tAmt += amt;
                    tFine += fFine;
                    tDisc += fDisc;
                    tPaid += fPaid;
                    tBal += (fBal < 0 ? 0 : fBal);
                });
            }

            setProcessedFees(processed);
            setTransportFees(transportList);
            setDiscountFees(data.student_discount_fee || []);
            setCurrencySymbol(data.currency_symbol || '₹');
            setTotals({ amount: tAmt, paid: tPaid, discount: tDisc, fine: tFine, balance: tBal });
        };

        fetchProfileData();
    }, []);

    const parseAmountDetailDetailed = (detailStr) => {
        let payments = [];
        let paidTotal = 0, fineTotal = 0, discountTotal = 0;
        try {
            if (detailStr && detailStr !== "0") {
                const details = JSON.parse(detailStr);
                Object.values(details).forEach(entry => {
                    payments.push(entry);
                    paidTotal += parseFloat(entry.amount || 0);
                    fineTotal += parseFloat(entry.amount_fine || 0);
                    discountTotal += parseFloat(entry.amount_discount || 0);
                });
            }
        } catch (e) { console.error('Error parsing details', e); }
        return { payments, paidTotal, fineTotal, discountTotal };
    };

    const amountFormat = (num) => {
        if (!num || isNaN(num)) return "0.00";
        return parseFloat(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const themeColor = "#9c68e4";

    const studentObj = profileData?.student || {};

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
        <>
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

                .wrapper {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }

                .content-wrapper, .main-footer {
                    margin-left: 85px !important;
                }

                .content-wrapper {
                    flex: 1;
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
                .info-label { color: #333; font-weight: 600; }
                .info-value { color: #0084B4; text-align: right; }

                /* Tab Styling */
                .custom-tabs { 
                    display: flex; 
                    border-bottom: 1px solid #eee; 
                    background: #fff; 
                    margin-bottom: 0px; 
                    padding: 0 10px;
                    overflow-x: auto;
                    white-space: nowrap;
                    scrollbar-width: none; /* Hide for Firefox */
                    -ms-overflow-style: none; /* Hide for IE/Edge */
                }
                .custom-tabs::-webkit-scrollbar {
                    display: none; /* Hide for Chrome/Safari */
                }
                .tab-item { 
                    padding: 12px 15px; 
                    cursor: pointer; 
                    color: #666; 
                    font-size: 13px; 
                    position: relative; 
                    transition: all 0.2s; 
                    flex-shrink: 0;
                }
                .tab-item.active { color: #333; font-weight: 500; }
                .tab-item.active::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; background: #3c8dbc; }
                .tab-item:hover { background: #f9f9f9; }

                .tab-content-container { background: #fff; padding-top: 5px; padding-bottom: 5px; }
                
                .profile-section-container {
                    border: 1px solid #eeeeee;
                    margin: 5px 8px 10px 8px;
                    border-radius: 4px;
                    overflow: hidden;
                    background: #fff;
                }
                .section-header-gray { 
                    background: #f5f5f5; 
                    padding: 10px 20px; 
                    font-weight: 600; 
                    font-size: 15px; 
                    color: #333; 
                    border-bottom: 1px solid #eee;
                    margin-top: 0px;
                }
                .data-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    background: #fff;
                }

                .data-table td { 
                    padding: 7px 20px; 
                    font-size: 13px; 
                    color: #555; 
                    border-bottom: none;
                }
                .section-divider td {
                    border-bottom: 1px solid #eee !important;
                }
                .data-table td:first-child {
                    width: 40%;
                    color: #444;
                }
                .data-table td:last-child {
                    width: 60%;
                    color: #333;
                }
                
                .parent-section { 
                    display: flex; 
                    justify-content: space-between; 
                    padding: 0;
                    align-items: flex-start;
                }

                .parent-data { flex: 1; }

                .parent-photo-circle { 
                    width: 60px; 
                    height: 60px; 
                    background: #ffeb3b45; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    margin: 15px 20px;
                    flex-shrink: 0;
                }
                .parent-photo-circle .person-icon { 
                    width: 35px; 
                    height: 35px; 
                    background: url('https://cdn-icons-png.flaticon.com/512/1077/1077114.png') no-repeat center; 
                    background-size: contain; 
                    filter: sepia(1) saturate(5) hue-rotate(10deg);
                    opacity: 0.8;
                }

                .no-record-box {
                    background: #dae8f2;
                    border: 1px solid #bce8f1;
                    color: #31708f;
                    padding: 10px 20px;
                    border-radius: 4px;
                    margin: 0px 8px 5px 8px;
                    text-align: left;
                    font-size: 14px;
                }

                /* Attendance Card Styling */
                .attendance-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 15px; }
                .attendance-card { background: #f5f5f5; padding: 15px; border-radius: 4px; position: relative; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; text-align: left; }
                .attendance-card .label { font-size: 13px; color: #333; font-weight: 500; }
                .attendance-card .count { font-size: 20px; font-weight: bold; margin-top: 5px; }
                .attendance-card .status-icon { position: absolute; right: 15px; top: 15px; font-size: 30px; color: #ccc; z-index: auto; opacity: 1; }

                /* Fees Table Styling */
                .fees-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .fees-table th { background: #fdf5f5; padding: 10px 5px; text-align: left; border-bottom: 1px solid #eee; color: #333; font-weight: 600; }
                .fees-table td { padding: 8px 5px; border-bottom: 1px solid #eee; vertical-align: middle; }
                .fees-summary-row { background: #fde8e8 !important; }
                .status-badge { padding: 2px 6px; border-radius: 4px; color: #fff; font-size: 10px; font-weight: bold; }
                .status-unpaid { background: #d9534f; }
                .status-paid { background: #5cb85c; }
                .sub-row { background: #f5f5f5 !important; font-size: 11px; }
                .grand-total-row { background: #eee !important; font-weight: bold; }
                .status-warning { background: #f0ad4e; }

                @media (max-width: 768px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    /* Padding balancing for mobile */
                    .content-wrapper { padding-left: 0px !important; padding-right: 0px !important; }
                    .content { padding-left: 10px !important; padding-right: 10px !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                @media (max-width: 769px) {

                    .profile-box { margin-bottom: 5px !important; box-shadow: none !important; border: 1px solid #eee !important; }
                    .profile-section-container { margin-bottom: 5px !important; }
                    .content { padding-bottom: 5px !important; }

                    .mobile-buttons-container {
                        display: flex !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        margin-bottom: 10px;
                        padding: 0 5px;
                    }
                    .mobile-box-back-btn {
                        display: flex !important;
                        align-items: center;
                        gap: 5px;
                        background-color: #9c68e4 !important;
                        color: #fff !important;
                        border: none;
                        padding: 6px 15px;
                        margin-top: -8px !important;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 600;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .mobile-box-logout-btn {
                        display: flex !important;
                        align-items: center;
                        gap: 5px;
                        background-color: #9c68e4 !important;
                        color: #fff !important;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 600;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .attendance-cards {
                        grid-template-columns: repeat(2, 1fr) !important;
                        padding: 10px !important;
                    }
                }
                @media (min-width: 770px) {
                    .mobile-buttons-container { display: none !important; }
                    .mobile-box-back-btn { display: none !important; }
                    .mobile-box-logout-btn { display: none !important; }
                }

                /* Additional Refactored Common Styles */
                .up-content-wrapper { margin-top: 0px; }
                .up-content-section { padding: 8px 10px 30px 5px; }
                .up-profile-box { position: relative; }
                .up-tab-container { position: relative; }
                .up-profile-padding { padding-bottom: 10px; }
                .up-parent-photos { display: flex; flex-direction: column; gap: 30px; padding-right: 10px; }
                
                .up-attendance-tab { padding: 0px; }
                .up-attendance-legend { padding: 10px 15px; text-align: right; font-size: 11px; font-weight: bold; }
                .up-color-p { color: #5cb85c; }
                .up-color-e { color: #f0ad4e; }
                .up-color-l { color: #d9534f; }
                .up-color-a { color: #d9534f; }
                .up-color-h { color: #31708f; }
                .up-color-f { color: #5bc0de; }
                .up-table-container { padding: 0 15px 15px; }
                .up-table-calendar { font-size: 11px; text-align: center; }
                .up-table-day-col { font-weight: bold; }
                
                .up-fees-tab { padding: 10px; }
                .up-fees-gray-icon { color: #999; }
                .up-fees-grand-total { background-color: #f4f4f4; font-weight: bold; }
                
                .up-docs-tab { padding: 10px 5px; }
                .up-docs-action-th { text-align: right; }
                .up-docs-action-td { text-align: right; }
                .up-no-record-red { background: #ffd1cc; border: 1px solid #ebccd1; color: #a94442; }
                
                .up-behav-tab { padding: 10px 5px; }
                
                .up-timeline-tab { padding: 20px 15px; }
                .up-tl-list { position: relative; margin: 0 0 30px 0; padding: 0; list-style: none; }
                .up-tl-line { position: absolute; top: 0; bottom: 0; width: 3px; background: #eee; left: 31px; margin: 0; border-radius: 2px; }
                .up-tl-item-wrap { position: relative; margin-right: 10px; margin-bottom: 15px; }
                .up-tl-label-wrap { margin-bottom: 10px; }
                .up-tl-label { border-radius: 4px; font-size: 12px; padding: 5px 10px; display: inline-block; background-color: #3c8dbc; color: #fff; font-weight: 600; margin-left: 10px; }
                .up-tl-content-wrap { position: relative; margin-top: 10px; }
                .up-tl-icon { width: 30px; height: 30px; line-height: 30px; font-size: 14px; border-radius: 50%; text-align: center; position: absolute; left: 18px; top: 0; color: #fff; background-color: #3c8dbc; z-index: 2; }
                .up-tl-body-box { margin-left: 60px; border: 1px solid #f4f4f4; border-radius: 3px; background-color: #fff; box-shadow: 0 1px 1px rgba(0,0,0,0.1); position: relative; }
                .up-tl-header { padding: 10px; border-bottom: 1px solid #f4f4f4; display: flex; justify-content: space-between; align-items: center; }
                .up-tl-title { margin: 0; font-size: 14px; color: #3c8dbc; font-weight: 600; }
                .up-tl-btn { border: none; background: transparent; }
                .up-tl-desc { padding: 10px; font-size: 13px; color: #666; }
                .up-tl-clock-icon { width: 30px; height: 30px; line-height: 30px; font-size: 14px; border-radius: 50%; text-align: center; position: absolute; left: 18px; bottom: -30px; color: #bbb; background-color: #eee; z-index: 1; }
            `}</style>
            <div className="content-wrapper up-content-wrapper">
                <section className="content up-content-section">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="mobile-buttons-container">
                                <button className="mobile-box-back-btn" onClick={handleLogout}>
                                    <i className="fa fa-sign-out"></i> Logout
                                </button>
                                <button className="mobile-box-logout-btn" onClick={() => navigate('/user/dashboard')}>
                                    <i className="fa fa-arrow-left"></i> Back
                                </button>
                            </div>
                            <div className="profile-box up-profile-box">
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
                            <div className="tab-container-main up-tab-container">
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
                                        <div className="up-profile-padding">
                                            <div className="profile-section-container">
                                                <table className="data-table">
                                                    <tbody>
                                                        <tr><td>Admission Date</td><td>{studentObj.admission_date || '-'}</td></tr>
                                                        <tr><td>Date of Birth</td><td>{studentObj.dob || '-'}</td></tr>
                                                        <tr><td>Category</td><td>{studentObj.category || studentObj.category_id || '-'}</td></tr>
                                                        <tr><td>Mobile Number</td><td>{studentObj.mobileno || '-'}</td></tr>
                                                        <tr><td>Caste</td><td>{studentObj.cast || '-'}</td></tr>
                                                        <tr><td>Religion</td><td>{studentObj.religion || '-'}</td></tr>
                                                        <tr><td>Email</td><td>{studentObj.email || '-'}</td></tr>
                                                        <tr><td>Note</td><td>{studentObj.note || '-'}</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="profile-section-container">
                                                <div className="section-header-gray">Address Details</div>
                                                <table className="data-table">
                                                    <tbody>
                                                        <tr><td>Current Address</td><td>{studentObj.current_address || '-'}</td></tr>
                                                        <tr><td>Permanent Address</td><td>{studentObj.permanent_address || '-'}</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="profile-section-container">
                                                <div className="section-header-gray">Parent Guardian Detail</div>
                                                <div className="parent-section">
                                                    <div className="parent-data">
                                                        <table className="data-table">
                                                            <tbody>
                                                                <tr><td>Father Name</td><td>{studentObj.father_name || '-'}</td></tr>
                                                                <tr><td>Father Phone</td><td>{studentObj.father_phone || '-'}</td></tr>
                                                                <tr className="section-divider"><td>Father Occupation</td><td>{studentObj.father_occupation || '-'}</td></tr>
                                                                <tr><td>Mother Name</td><td>{studentObj.mother_name || '-'}</td></tr>
                                                                <tr><td>Mother Phone</td><td>{studentObj.mother_phone || '-'}</td></tr>
                                                                <tr className="section-divider"><td>Mother Occupation</td><td>{studentObj.mother_occupation || '-'}</td></tr>
                                                                <tr><td>Guardian Name</td><td>{studentObj.guardian_name || '-'}</td></tr>
                                                                <tr><td>Guardian Email</td><td>{studentObj.guardian_email || '-'}</td></tr>
                                                                <tr><td>Guardian Relation</td><td>{studentObj.guardian_relation || '-'}</td></tr>
                                                                <tr><td>Guardian Phone</td><td>{studentObj.guardian_phone || '-'}</td></tr>
                                                                <tr><td>Guardian Occupation</td><td>{studentObj.guardian_occupation || '-'}</td></tr>
                                                                <tr><td>Guardian Address</td><td>{studentObj.guardian_address || '-'}</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="up-parent-photos">
                                                        <div className="parent-photo-circle"><div className="person-icon"></div></div>
                                                        <div className="parent-photo-circle"><div className="person-icon"></div></div>
                                                        <div className="parent-photo-circle"><div className="person-icon"></div></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="profile-section-container">
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
                                        </div>
                                    )}
                                    {activeTab === 'attendance' && (
                                        <div className="up-attendance-tab">
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
                                                <div className="attendance-card">
                                                    <span className="label">Total Holiday</span>
                                                    <span className="count">{totalHoliday}</span>
                                                    <i className="fa fa-check-square status-icon"></i>
                                                </div>
                                            </div>

                                            <div className="up-attendance-legend">
                                                Present: <span className="up-color-p">P</span> |
                                                Late With Excuse: <span className="up-color-e">E</span> |
                                                Late: <span className="up-color-l">L</span> |
                                                Absent: <span className="up-color-a">A</span> |
                                                Holiday: <span className="up-color-h">H</span> |
                                                Half Day: <span className="up-color-f">F</span>
                                            </div>

                                            <div className="table-responsive up-table-container">
                                                <table className="table table-bordered up-table-calendar">
                                                    <thead>
                                                        <tr>
                                                            <th>Date | Month</th>
                                                            {['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'].map(m => <th key={m}>{m}</th>)}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                            <tr key={day}>
                                                                <td className="up-table-day-col">{day}</td>
                                                                {Array.from({ length: 12 }).map((_, mi) => <td key={mi}></td>)}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'fees' && (
                                        <div className="table-responsive up-fees-tab">
                                            <table className="table table-striped table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th align="left">Fees Group</th>
                                                        <th align="left">Fees Code</th>
                                                        <th align="left">Due Date</th>
                                                        <th align="left">Status</th>
                                                        <th className="text-right">Amount ({currencySymbol})</th>
                                                        <th className="text-left">Payment ID</th>
                                                        <th className="text-left">Mode</th>
                                                        <th className="text-left">Date</th>
                                                        <th className="text-right">Discount ({currencySymbol})</th>
                                                        <th className="text-right">Fine ({currencySymbol})</th>
                                                        <th className="text-right">Paid ({currencySymbol})</th>
                                                        <th className="text-right">Balance ({currencySymbol})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {processedFees.length === 0 && transportFees.length === 0 && (
                                                        <tr>
                                                            <td colSpan="12" className="text-center text-danger">No fees data found.</td>
                                                        </tr>
                                                    )}
                                                    {processedFees.map((fee, feeIndex) => {
                                                        const balance = fee.balance;
                                                        const status = fee.status;
                                                        const statusLabel = status === 'Paid' ? 'paid' : (status === 'Partial' ? 'warning' : 'unpaid');

                                                        return (
                                                            <React.Fragment key={`fee-${feeIndex}`}>
                                                                <tr className={status === 'Paid' ? "sub-row" : "fees-summary-row"}>
                                                                    <td align="left">{fee.name} ({fee.type})</td>
                                                                    <td align="left">{fee.code}</td>
                                                                    <td align="left">{fee.due_date === "0000-00-00" ? "" : fee.due_date}</td>
                                                                    <td align="left"><span className={`status-badge status-${statusLabel}`}>{status}</span></td>
                                                                    <td className="text-right">
                                                                        {amountFormat(fee.amount)}
                                                                        {fee.fine_amount_display > 0 && <span className="text text-danger"> + {amountFormat(fee.fine_amount_display)}</span>}
                                                                    </td>
                                                                    <td></td><td></td><td></td>
                                                                    <td className="text-right">{amountFormat(fee.total_discount)}</td>
                                                                    <td className="text-right">{amountFormat(fee.total_fine)}</td>
                                                                    <td className="text-right">{amountFormat(fee.total_paid)}</td>
                                                                    <td className="text-right">{balance > 0 ? amountFormat(balance) : ""}</td>
                                                                </tr>
                                                                {(fee.feeDetails?.payments || []).map((deposit, dIndex) => (
                                                                    <tr key={`dep-${dIndex}`} className="white-td">
                                                                        <td colSpan="4"></td>
                                                                        <td className="text-right"><i className="fa fa-level-up fa-rotate-90 up-fees-gray-icon"></i></td>
                                                                        <td className="text-left">{fee.student_fees_deposite_id}/{deposit.inv_no}</td>
                                                                        <td className="text-left">{deposit.payment_mode}</td>
                                                                        <td className="text-left">{deposit.date}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_discount)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_fine)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount)}</td>
                                                                        <td></td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        );
                                                    })}

                                                    {transportFees.map((fee, feeIndex) => {
                                                        const balance = parseFloat(fee.fees) + parseFloat(fee.feeDetails?.fineTotal || 0) - parseFloat(fee.feeDetails?.discountTotal || 0) - parseFloat(fee.feeDetails?.paidTotal || 0);
                                                        const status = balance <= 0 ? "Paid" : (fee.feeDetails?.payments?.length > 0 ? "Partial" : "Unpaid");
                                                        const statusLabel = status === 'Paid' ? 'paid' : (status === 'Partial' ? 'warning' : 'unpaid');

                                                        return (
                                                            <React.Fragment key={`trans-${feeIndex}`}>
                                                                <tr className={status === 'Paid' ? "sub-row" : "fees-summary-row"}>
                                                                    <td align="left">Transport Fees</td>
                                                                    <td align="left">{fee.month}</td>
                                                                    <td align="left">{fee.due_date}</td>
                                                                    <td align="left"><span className={`status-badge status-${statusLabel}`}>{status}</span></td>
                                                                    <td className="text-right">{amountFormat(fee.fees)}
                                                                        {fee.fine_amount_display > 0 && <span className="text text-danger"> + {amountFormat(fee.fine_amount_display)}</span>}
                                                                    </td>
                                                                    <td></td><td></td><td></td>
                                                                    <td className="text-right">{amountFormat(fee.feeDetails?.discountTotal)}</td>
                                                                    <td className="text-right">{amountFormat(fee.feeDetails?.fineTotal)}</td>
                                                                    <td className="text-right">{amountFormat(fee.feeDetails?.paidTotal)}</td>
                                                                    <td className="text-right">{balance > 0 ? amountFormat(balance) : ""}</td>
                                                                </tr>
                                                                {(fee.feeDetails?.payments || []).map((deposit, dIndex) => (
                                                                    <tr key={`trans-dep-${dIndex}`} className="white-td">
                                                                        <td colSpan="4"></td>
                                                                        <td className="text-right"><i className="fa fa-level-up fa-rotate-90 up-fees-gray-icon"></i></td>
                                                                        <td className="text-left">{fee.student_fees_deposite_id}/{deposit.inv_no}</td>
                                                                        <td className="text-left">{deposit.payment_mode}</td>
                                                                        <td className="text-left">{deposit.date}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_discount)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_fine)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount)}</td>
                                                                        <td></td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        );
                                                    })}

                                                    {discountFees.map((discount, dIndex) => (
                                                        <tr key={`disc-${dIndex}`} className="dark-light">
                                                            <td align="left">Discount</td>
                                                            <td align="left">{discount.code}</td>
                                                            <td align="left"></td>
                                                            <td align="left">
                                                                {discount.status === 'applied' ? (
                                                                    <span className="text text-success">Discount of {discount.type === 'percentage' ? `${discount.percentage}%` : `${currencySymbol}${amountFormat(discount.amount)}`} Applied</span>
                                                                ) : (
                                                                    <span className="text text-danger">Discount of {discount.type === 'percentage' ? `${discount.percentage}%` : `${currencySymbol}${amountFormat(discount.amount)}`} {discount.status}</span>
                                                                )}
                                                            </td>
                                                            <td colSpan="8"></td>
                                                        </tr>
                                                    ))}

                                                    <tr className="up-fees-grand-total">
                                                        <td colSpan="4" className="text-right">Grand Total</td>
                                                        <td className="text-right">
                                                            {currencySymbol}{amountFormat(totals.amount)}
                                                        </td>
                                                        <td colSpan="3"></td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.discount)}</td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.fine)}</td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.paid)}</td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.balance)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {activeTab === 'documents' && (
                                        <div className="documents-section up-docs-tab">
                                            {documentsData.length > 0 ? (
                                                <table className="table table-bordered table-striped data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Title</th>
                                                            <th>File Name</th>
                                                            <th className="up-docs-action-th">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {documentsData.map((doc, idx) => (
                                                            <tr key={idx}>
                                                                <td>{doc.title}</td>
                                                                <td>{doc.doc}</td>
                                                                <td className="up-docs-action-td">
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
                                                <div className="no-record-box up-no-record-red">
                                                    No Record Found
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'behavioural' && (
                                        <div className="behavioural-section up-behav-tab">
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
                                        <div className="timeline-section up-timeline-tab">
                                            {timelineData.length === 0 ? (
                                                <div className="no-record-box">No record found</div>
                                            ) : (
                                                <ul className="timeline timeline-inverse up-tl-list">
                                                    {/* Vertical line */}
                                                    <div className="up-tl-line"></div>

                                                    {timelineData.map((item, index) => (
                                                        <li key={index} className="up-tl-item-wrap">
                                                            <div className="time-label up-tl-label-wrap">
                                                                <span className="up-tl-label">
                                                                    {item.timeline_date || item.date}
                                                                </span>
                                                            </div>

                                                            <div className="up-tl-content-wrap">
                                                                <i className="fa fa-id-card-o up-tl-icon"></i>

                                                                <div className="timeline-item up-tl-body-box">
                                                                    <div className="timeline-header up-tl-header">
                                                                        <h3 className="timeline-header-title up-tl-title">
                                                                            {item.title}
                                                                        </h3>
                                                                        {item.document && (
                                                                            <a
                                                                                href={`${studentObj.base_url || ''}uploads/student_timeline/${item.document}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-default btn-xs up-tl-btn"
                                                                                title="Download Document"
                                                                            >
                                                                                <i className="fa fa-download text-muted"></i>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <div className="timeline-body up-tl-desc">
                                                                        {item.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                    <li>
                                                        <i className="fa fa-clock-o up-tl-clock-icon"></i>
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Profile;
