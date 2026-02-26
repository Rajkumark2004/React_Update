
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { api_users } from '../../services/api_users';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';

const GetFees = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [loading, setLoading] = useState(true);
    const [feesData, setFeesData] = useState([]);
    const [studentData, setStudentData] = useState({});
    const [userData, setUserData] = useState({
        name: "KARTHIK",
        role: "Student",
        id: "1009",
        avatar: "https://avatar.iran.liara.run/public/boy?username=KARTHIK",
        adminLogoUrl: ""
    });
    const [selectedFees, setSelectedFees] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState("₹");

    useEffect(() => {
        fetchFeesData();
    }, []);

    const fetchFeesData = async () => {
        try {
            setLoading(true);
            const res = await api_users.getFees();
            if (res && res.status && res.data) {
                // Set Student Data
                if (res.data.student) {
                    const stu = res.data.student;
                    setStudentData({
                        name: `${stu.firstname || ''} ${stu.lastname || ''}`.trim() || 'Student',
                        father_name: stu.father_name || '-',
                        mobile_no: stu.mobileno || '-',
                        category: stu.cast || '-',
                        class_section: `${stu.class || ''} (${stu.section || ''})`,
                        admission_no: stu.admission_no || '-',
                        roll_no: stu.roll_no || '-',
                        rte: stu.rte || '-',
                        avatar: stu.image ? `${res.data.sch_setting?.base_url || ''}uploads/student_images/${stu.image}` : "https://cdn-icons-png.flaticon.com/512/1077/1077114.png"
                    });
                    setUserData({
                        name: `${stu.firstname || ''} ${stu.lastname || ''}`.trim() || 'Student',
                        role: 'Student',
                        id: stu.id,
                        avatar: stu.image ? `${res.data.sch_setting?.base_url || ''}uploads/student_images/${stu.image}` : "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
                        adminLogoUrl: res.data.sch_setting?.admin_logo ? `${res.data.sch_setting.base_url}uploads/school_content/admin_logo/${res.data.sch_setting.admin_logo}` : ""
                    });
                }

                // Currency
                if (res.data.sch_setting && res.data.sch_setting.currency_symbol) {
                    setCurrencySymbol(res.data.sch_setting.currency_symbol);
                }

                // Set Fees Data
                if (res.data.student_due_fee) {
                    setFeesData(res.data.student_due_fee);
                }
            }
        } catch (error) {
            console.error("Error fetching fees data", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to parse amount detail from backend
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

    // Flatten logic for selection 
    const allFeeIds = [];
    feesData.forEach((group, grpIndex) => {
        if (group.fees && group.fees.length > 0) {
            group.fees.forEach((fee, itemIdx) => {
                const amt = parseFloat(fee.amount || 0);
                const { paid, discount, fine } = parseAmountDetail(fee.amount_detail);
                const feePaid = parseFloat(paid);
                const feeDiscount = parseFloat(discount);
                const feeFine = parseFloat(fine);
                const balance = amt + feeFine - feeDiscount - feePaid;

                if (balance > 0) {
                    allFeeIds.push(`fee_${grpIndex}_${itemIdx}_${fee.id || 'x'}`);
                }
            });
        }
    });

    const toggleSelectAll = () => {
        if (selectedFees.length === allFeeIds.length) {
            setSelectedFees([]);
        } else {
            setSelectedFees(allFeeIds);
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

    // Grand Totals 
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

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
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

            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />
            <Sidebar sessionYear={sessionYear} currentUrl="/user/getfees" />

            <div className="content-wrapper" style={{ minHeight: "626px", marginTop: "0px" }}>
                {loading ? (
                    <section className="content" style={{ padding: '15px' }}>
                        <div style={{ textAlign: 'center', padding: '50px' }}>Loading fees data...</div>
                    </section>
                ) : (
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
                                                        checked={selectedFees.length === allFeeIds.length && allFeeIds.length > 0}
                                                    />
                                                </th>
                                                <th>Fees Group</th>
                                                <th>Fees Code</th>
                                                <th>Due Date</th>
                                                <th>Status</th>
                                                <th>Amount ({currencySymbol})</th>
                                                <th>Payment ID</th>
                                                <th>Mode</th>
                                                <th>Date</th>
                                                <th>Discount ({currencySymbol})</th>
                                                <th>Fine ({currencySymbol})</th>
                                                <th>Paid ({currencySymbol})</th>
                                                <th>Balance ({currencySymbol})</th>
                                                <th style={{ textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feesData.length > 0 ? (
                                                feesData.map((group, grpIndex) => (
                                                    <React.Fragment key={group.id || grpIndex}>
                                                        {group.fees && group.fees.length > 0 ? (
                                                            group.fees.map((item, itemIdx) => {
                                                                const feeId = `fee_${grpIndex}_${itemIdx}_${item.id || 'x'}`;
                                                                const amt = parseFloat(item.amount || 0);
                                                                const { paid, mode, date, discount, fine, paymentId } = parseAmountDetail(item.amount_detail);

                                                                const paidAmt = parseFloat(paid);
                                                                const disAmt = parseFloat(discount);
                                                                const fineAmt = parseFloat(fine);
                                                                const balance = amt + fineAmt - disAmt - paidAmt;

                                                                const isPaid = balance <= 0 && paidAmt > 0;
                                                                const isPartial = balance > 0 && paidAmt > 0;

                                                                let statusText = "Unpaid";
                                                                let statusClass = "status-unpaid";
                                                                if (isPaid) {
                                                                    statusText = "Paid";
                                                                    statusClass = "status-paid";
                                                                } else if (isPartial) {
                                                                    statusText = "Partial";
                                                                    statusClass = "status-warning";
                                                                }

                                                                // Sub row data (the actual payment parts)
                                                                let subRows = [];
                                                                if (item.amount_detail && item.amount_detail !== "0" && typeof item.amount_detail === 'string') {
                                                                    try {
                                                                        const parsedDetails = JSON.parse(item.amount_detail);
                                                                        subRows = Object.values(parsedDetails);
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }

                                                                return (
                                                                    <React.Fragment key={feeId}>
                                                                        <tr className={isPaid ? "" : "fees-summary-row"}>
                                                                            <td>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedFees.includes(feeId)}
                                                                                    onChange={() => toggleFeeSelection(feeId)}
                                                                                />
                                                                            </td>
                                                                            <td>{group.name}</td>
                                                                            <td>{item.code}</td>
                                                                            <td>{item.due_date && item.due_date !== '0000-00-00' ? item.due_date : ""}</td>
                                                                            <td><span className={`status-badge ${statusClass}`}>{statusText}</span></td>
                                                                            <td>{amt.toFixed(2)}</td>
                                                                            <td>{paymentId}</td>
                                                                            <td>{mode}</td>
                                                                            <td>{date}</td>
                                                                            <td>{discount}</td>
                                                                            <td>{fine}</td>
                                                                            <td>{paid}</td>
                                                                            <td>{balance.toFixed(2)}</td>
                                                                            <td style={{ textAlign: 'right' }}>
                                                                                {!isPaid && (
                                                                                    <button className="btn-pay-sm"><i className="fa fa-money"></i> Pay</button>
                                                                                )}
                                                                            </td>
                                                                        </tr>

                                                                        {subRows.map((sub, sIdx) => (
                                                                            <tr key={`sub_${feeId}_${sIdx}`} className="sub-row">
                                                                                <td colSpan="5"></td>
                                                                                <td style={{ textAlign: 'right' }}><i className="fa fa-level-up fa-rotate-90"></i> {sub.inv_no}</td>
                                                                                <td></td>
                                                                                <td>{sub.payment_mode}</td>
                                                                                <td>{sub.date}</td>
                                                                                <td>{sub.amount_discount || '0.00'}</td>
                                                                                <td>{sub.amount_fine || '0.00'}</td>
                                                                                <td>{sub.amount || '0.00'}</td>
                                                                                <td></td>
                                                                                <td style={{ textAlign: 'right' }}><i className="fa fa-print"></i></td>
                                                                            </tr>
                                                                        ))}
                                                                    </React.Fragment>
                                                                );
                                                            })
                                                        ) : null}
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>No Fees Data Found</td>
                                                </tr>
                                            )}
                                            {feesData.length > 0 && (
                                                <tr className="grand-total-row">
                                                    <td colSpan="5" style={{ textAlign: 'right' }}>Grand Total</td>
                                                    <td>{currencySymbol}{grandTotalAmount.toFixed(2)}</td>
                                                    <td colSpan="3"></td>
                                                    <td>{currencySymbol}{grandTotalDiscount.toFixed(2)}</td>
                                                    <td>{currencySymbol}{grandTotalFine.toFixed(2)}</td>
                                                    <td>{currencySymbol}{grandTotalPaid.toFixed(2)}</td>
                                                    <td>{currencySymbol}{grandTotalBalance.toFixed(2)}</td>
                                                    <td></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                <div style={{ height: '40px' }}></div>
            </div >
            <Footer />
        </div >
    );
};

export default GetFees;
