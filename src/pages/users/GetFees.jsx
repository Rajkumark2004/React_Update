
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';

const GetFees = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "KARTHIK",
        role: "Student",
        id: "1009",
        avatar: "https://avatar.iran.liara.run/public/boy?username=KARTHIK"
    });

    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);

    const [selectedFees, setSelectedFees] = useState([]);
    const feesItems = [
        { id: 1, group: "NURSERY (TEST)", code: "TEST", status: "Unpaid", amount: "150,000.00", balance: "150,000.00" },
        { id: 2, group: "NURSERY (TEST)", code: "TEST", status: "Paid", amount: "1.00", paid: "1.00", balance: "0.00", subRow: { id: "251/1", mode: "Cash", date: "23/02/2026", amount: "1.00" } },
        { id: 3, group: "NURSERY (uniform)", code: "uniform", status: "Paid", amount: "500.00", paid: "500.00", balance: "0.00", subRow: { id: "250/1", mode: "Cash", date: "23/02/2026", amount: "500.00" } },
        { id: 4, group: "NURSERY (July)", code: "JLTF", status: "Unpaid", amount: "15,000.00", balance: "15,000.00" },
        { id: 5, group: "NURSERY (AUG)", code: "ATF", status: "Unpaid", amount: "150.00", balance: "150.00" },
        { id: 6, group: "NURSERY (OCT)", code: "OTF", dualAmount: "1,500.00 + 0.00", dueDate: "10/10/2024", status: "Unpaid", balance: "1,500.00" },
        { id: 7, group: "NURSERY (SEP)", code: "STF", dualAmount: "1,500.00 + 0.00", dueDate: "10/10/2024", status: "Unpaid", balance: "1,500.00" },
        { id: 8, group: "NURSERY (NOV)", code: "NTF", dualAmount: "1,500.00 + 0.00", dueDate: "10/11/2024", status: "Unpaid", balance: "1,500.00" },
        { id: 9, group: "NURSERY (DEC)", code: "DTF", dualAmount: "1,500.00 + 0.00", dueDate: "10/12/2024", status: "Unpaid", balance: "1,500.00" },
        { id: 10, group: "NURSERY (JAN)", code: "JTF", dualAmount: "1,500.00 + 0.00", dueDate: "10/01/2025", status: "Unpaid", balance: "1,500.00" },
        { id: 11, group: "NURSERY (FEB)", code: "FTF", dualAmount: "1,500.00 + 0.00", dueDate: "10/02/2025", status: "Unpaid", balance: "1,500.00" },
        { id: 12, group: "NURSERY (MAR)", code: "MTF", dualAmount: "1,500.00 + 0.00", dueDate: "10/03/2025", status: "Unpaid", balance: "1,500.00" },
        { id: 13, group: "NURSERY (hostel1)", code: "hs", dualAmount: "1,000.00 + 0.00", dueDate: "31/05/2025", status: "Unpaid", balance: "1,000.00" }
    ];

    const toggleSelectAll = () => {
        const allIds = feesItems.map(f => f.id);
        if (selectedFees.length === allIds.length) {
            setSelectedFees([]);
        } else {
            setSelectedFees(allIds);
        }
    };

    const toggleFeeSelection = (id) => {
        if (selectedFees.includes(id)) {
            setSelectedFees(selectedFees.filter(fid => fid !== id));
        } else {
            setSelectedFees([...selectedFees, id]);
        }
    };

    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Dashboard', url: '/user/user/dashboard' },
        { id: 2, icon: 'certificate.png', label: 'Gallery', url: '/user/content/gallery' },
        { id: 3, icon: 'student.png', label: 'My Profile', url: '/user/user/profile' },
        { id: 4, icon: 'Fees.png', label: 'Fees', url: '/user/user/getfees' },
        { id: 5, icon: 'messages.png', label: 'Circular', url: '/user/notification' },
        { id: 6, icon: 'homework.png', label: 'Student Assessment', url: '/user/studentdairy' },
        { id: 7, icon: 'attendance.png', label: 'Class Timetable', url: '/user/timetable' },
        { id: 8, icon: 'homework.png', label: 'Lesson Plan', url: '/user/syllabus' },
        { id: 9, icon: 'reports.png', label: 'Syllabus Status', url: '/user/syllabus/status' },
        { id: 10, icon: 'addhomework.png', label: 'Homework', url: '#' },
        { id: 11, icon: 'courses.png', label: 'Courses', url: '#' },
        { id: 12, icon: 'applyleave.png', label: 'Apply Leave', url: '#' },
        { id: 13, icon: 'visitorbook.png', label: 'Visitor Book', url: '#' },
        { id: 14, icon: 'download_resouces.png', label: 'Download Center', url: '#' },
        { id: 15, icon: 'attendance.png', label: 'Attendance', url: '#' },
        { id: 16, icon: 'helpdesk.png', label: 'State Examination', url: '#' },
        { id: 17, icon: 'messages.png', label: 'Notice Board', url: '#' },
        { id: 18, icon: 'teachersrating.png', label: 'Teachers Reviews', url: '#' },
        { id: 19, icon: 'transport.png', label: 'Transport Route', url: '#' },
        { id: 20, icon: 'my_day_today.png', label: 'My Day Today', url: '#' },
        { id: 21, icon: 'hostle.png', label: 'Hostel Rooms', url: '#' }
    ];

    const mobileNavItems = [
        { id: 1, icon: 'helpdesk.png', label: 'SIS', url: '#' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '#' },
        { id: 4, icon: 'settings.png', label: 'More', url: '#' },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const languages = [
        { code: 'en', name: 'English', flag: 'https://flagcdn.com/w20/us.png' },
        { code: 'ta', name: 'Tamil', flag: 'https://flagcdn.com/w20/in.png' },
        { code: 'te', name: 'Telugu', flag: 'https://flagcdn.com/w20/in.png' }
    ];

    const themeColor = "#9c68e4";

    const studentData = {
        name: "KARTHIK",
        father_name: "T. Srinivasulu",
        mobile_no: "6302945737",
        category: "BC-E",
        class_section: "Nursery (B)",
        admission_no: "1009",
        roll_no: "4",
        rte: ""
    };

    return (
        <div className="wrapper">
            <style>{`
                .main-sidebar {
                    background-color: ${themeColor} !important;
                    width: 80px !important;
                    transition: none !important;
                    padding-top: 50px !important;
                    z-index: 1000 !important;
                    border: none !important;
                }
                
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }

                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                    padding-top: 0px !important;
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
                
                header.main-header {
                   max-height: 50px !important;
                   z-index: 1010 !important;
                   overflow: visible !important;
                }

                .main-header .navbar {
                    background-color: #ffffff !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
                    margin-left: 80px !important;
                    height: 50px !important;
                    overflow: visible !important;
                }

                .main-header .logo {
                    background-color: #ffffff !important;
                    border-right: 1px solid #f0f0f0 !important;
                    width: 160px !important;
                    height: 50px !important;
                    padding: 0 10px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    z-index: 1015 !important;
                }
                .main-header .logo img {
                    width: 130px !important;
                    height: auto !important;
                    display: block !important;
                }

                /* Hide search bars, default nav icons, and sessionul */
                .search-form, .search-form2, .sessionul, 
                .navbar-custom-menu .nav > li:not(.user-menu) {
                    display: none !important;
                }

                .custom-nav-right {
                    display: flex;
                    align-items: center;
                }
                
                .custom-nav-item {
                    padding: 0 12px;
                    color: #555;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    height: 50px;
                    position: relative;
                }
                
                .custom-nav-item:hover { background: transparent !important; }
                .custom-nav-item i { font-size: 18px; }
                .flag-icon { width: 22px; height: 14px; border: 1px solid #eee; }

                /* Tooltip Implementation */
                .custom-nav-item::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: -35px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    white-space: nowrap;
                    visibility: hidden;
                    opacity: 0;
                    z-index: 1100;
                    pointer-events: none;
                }
                .custom-nav-item:hover::after {
                    visibility: visible;
                    opacity: 1;
                }

                .lang-dropdown {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #fff;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border-radius: 4px;
                    width: 130px;
                    z-index: 1060;
                    margin-top: 5px;
                }
                .lang-dropdown.open { display: block; }
                .lang-item {
                    padding: 10px 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #555;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f9f9f9;
                }
                .lang-item:hover { background: #eff1f3; }
                .lang-item img { width: 18px; height: auto; }

                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 0px !important;
                    margin-top: 50px !important;
                    min-height: calc(100vh - 50px);
                }

                /* GetFees Specific Styles */
                .page-header { background: #fff; padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
                .page-header h2 { margin: 0; font-size: 18px; color: #333; }
                .btn-back { background: #9854cb; color: #fff; border: none; padding: 5px 15px; border-radius: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
                
                .student-info-card { background: #fff; border: 1px solid #eee; border-radius: 4px; margin: 15px; padding: 15px; display: flex; gap: 20px; align-items: center; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .student-photo-circle { width: 100px; height: 100px; background: #fbce4a; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .student-photo-circle .person-icon { width: 60px; height: 60px; background: url('https://cdn-icons-png.flaticon.com/512/1077/1077114.png') no-repeat center; background-size: contain; opacity: 0.35; filter: grayscale(1); }
                
                .info-table { flex: 1; border-collapse: collapse; }
                .info-table td { padding: 4px 10px; font-size: 13px; color: #333; }
                .info-table .label { font-weight: bold; width: 150px; }
                .info-table .value { color: #555; }

                .action-bar { padding: 0 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .btn-print { background: #9854cb; color: #fff; border: none; padding: 5px 15px; border-radius: 15px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
                .btn-pay { background: #f0ad4e; color: #fff; border: none; padding: 5px 15px; border-radius: 15px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
                .date-display { font-size: 12px; color: #777; font-weight: bold; }

                .fees-table { width: 100%; border-collapse: collapse; font-size: 12px; background: #fff; }
                .fees-table th { background: #f9f9f9; padding: 10px 8px; text-align: left; border-bottom: 2px solid #eee; color: #333; font-weight: 600; }
                .fees-table td { padding: 8px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
                .fees-summary-row { background: #fde8e8 !important; }
                .status-badge { padding: 2px 6px; border-radius: 4px; color: #fff; font-size: 10px; font-weight: bold; }
                .status-unpaid { background: #e91e63; }
                .status-paid { background: #5cb85c; }
                .sub-row { background: #ffffff !important; font-size: 11px; color: #777; }
                .btn-pay-sm { background: #9854cb; color: #fff; border: none; padding: 7px 12px; border-radius: 15px; font-size: 10px; cursor: pointer; display: flex; align-items: center; gap: 3px; }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                }
            `}</style>

            <div style={{
                position: 'fixed',
                top: 0,
                right: '48px',
                height: '50px',
                zIndex: 1050,
                display: 'flex',
                alignItems: 'center',
                background: 'transparent'
            }} className="hide-mobile">
                <div className="custom-nav-right">
                    <div className="custom-nav-item" data-tooltip="English" ref={langDropdownRef} onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
                        <img src="https://flagcdn.com/w20/us.png" className="flag-icon" alt="English" />
                        <div className={`lang-dropdown ${isLangDropdownOpen ? 'open' : ''}`}>
                            {languages.map((lang) => (
                                <div key={lang.code} className="lang-item" onClick={() => setIsLangDropdownOpen(false)}>
                                    <img src={lang.flag} alt={lang.name} />
                                    <span>{lang.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="custom-nav-item" data-tooltip="Currency" style={{ fontWeight: 'bold' }}>INR</div>
                    <div className="custom-nav-item" data-tooltip="Switch Class"><i className="fa fa-exchange"></i></div>
                    <div className="custom-nav-item" data-tooltip="Calendar"><i className="fa fa-calendar"></i></div>
                    <div className="custom-nav-item" data-tooltip="Task"><i className="fa fa-check-square-o"></i></div>
                    <div className="custom-nav-item" data-tooltip="Chat"><i className="fa fa-whatsapp"></i></div>
                </div>
            </div>

            <Header userData={userData} handleLogout={handleLogout} />
            <Sidebar sidebarMenus={sidebarMenus} mobileNavItems={mobileNavItems} sessionYear={sessionYear} currentUrl="/user/user/getfees" />

            <div className="content-wrapper">
                <section className="content" style={{ padding: '15px' }}>
                    <div style={{ background: '#fff', borderTop: '1px solid #d2d6de', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', borderRadius: '3px' }}>
                        <div style={{ padding: '10px 15px', borderBottom: '1px solid #f4f4f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>Student Fees</h3>
                            <button className="btn-back" onClick={() => navigate(-1)}>
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>

                        <div style={{ padding: '15px' }}>
                            <div className="student-info-card" style={{ margin: '0 0 15px 0' }}>
                                <div className="student-photo-circle">
                                    <div className="person-icon"></div>
                                </div>
                                <table className="info-table">
                                    <tbody>
                                        <tr>
                                            <td className="label">Name</td><td className="value">{studentData.name}</td>
                                            <td className="label">Class (Section)</td><td className="value">{studentData.class_section}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">Father Name</td><td className="value">{studentData.father_name}</td>
                                            <td className="label">Admission No</td><td className="value">{studentData.admission_no}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">Mobile Number</td><td className="value">{studentData.mobile_no}</td>
                                            <td className="label">Roll Number</td><td className="value">{studentData.roll_no}</td>
                                        </tr>
                                        <tr>
                                            <td className="label">Category</td><td className="value">{studentData.category}</td>
                                            <td className="label">RTE</td><td className="value">{studentData.rte}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="action-bar" style={{ padding: '0', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-print"><i className="fa fa-print"></i> Print Selected</button>
                                    <button className="btn-pay"><i className="fa fa-money"></i> Pay Selected</button>
                                </div>
                                <div className="date-display">Date: 24/02/2026</div>
                            </div>

                            <div className="table-responsive">
                                <table className="fees-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}>
                                                <input
                                                    type="checkbox"
                                                    onChange={toggleSelectAll}
                                                    checked={selectedFees.length === feesItems.length && feesItems.length > 0}
                                                />
                                            </th>
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
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feesItems.map((item) => (
                                            <React.Fragment key={item.id}>
                                                <tr className={item.status === "Unpaid" ? "fees-summary-row" : ""}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFees.includes(item.id)}
                                                            onChange={() => toggleFeeSelection(item.id)}
                                                        />
                                                    </td>
                                                    <td>{item.group}</td>
                                                    <td>{item.code}</td>
                                                    <td>{item.dueDate || ""}</td>
                                                    <td><span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                                                    <td>{item.dualAmount || item.amount}</td>
                                                    <td></td><td></td><td></td>
                                                    <td>{item.discount || "0.00"}</td>
                                                    <td>{item.fine || "0.00"}</td>
                                                    <td>{item.paid || "0.00"}</td>
                                                    <td>{item.balance}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        {item.status === "Unpaid" && (
                                                            <button className="btn-pay-sm"><i className="fa fa-money"></i> Pay</button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {item.subRow && (
                                                    <tr className="sub-row">
                                                        <td colSpan="5"></td>
                                                        <td style={{ textAlign: 'right' }}><i className="fa fa-level-up fa-rotate-90"></i> {item.subRow.id}</td>
                                                        <td></td>
                                                        <td>{item.subRow.mode}</td>
                                                        <td>{item.subRow.date}</td>
                                                        <td>0.00</td><td>0.00</td><td>{item.subRow.amount}</td><td></td>
                                                        <td style={{ textAlign: 'right' }}><i className="fa fa-print"></i></td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        <tr className="grand-total-row">
                                            <td colSpan="5" style={{ textAlign: 'right' }}>Grand Total</td>
                                            <td>₹337,151.00 + 0.00</td>
                                            <td colSpan="3"></td>
                                            <td>₹0.00</td>
                                            <td>₹0.00</td>
                                            <td>₹501.00</td>
                                            <td>₹336,650.00</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
                <div style={{ height: '40px' }}></div>
            </div>
            <Footer />
        </div >
    );
};

export default GetFees;
