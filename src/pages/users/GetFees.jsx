import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api_users } from '../../services/api_users';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { printUserFeeReceipt } from './PrintUserFeeReceipt';
import { printUserFeesGroupArrayReceipt } from './PrintUserFeesGroupArrayReceipt';

const GetFees = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [feePayments, setFeePayments] = useState([]);
    const [studentDueFee, setStudentDueFee] = useState([]);
    const [transportFees, setTransportFees] = useState([]);
    const [studentDiscountFee, setStudentDiscountFee] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState('₹');

    const [userData, setUserData] = useState({
        name: "Student",
        role: "Student",
        id: "",
        avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
        adminLogoUrl: ""
    });

    const [totals, setTotals] = useState({
        total_amount: 0,
        total_deposite_amount: 0,
        total_fine_amount: 0,
        total_fees_fine_amount: 0,
        total_discount_amount: 0,
        total_balance_amount: 0
    });

    const [selectedFeesList, setSelectedFeesList] = useState([]);

    useEffect(() => {
        fetchFeesData();
    }, []);

    const fetchFeesData = async () => {
        try {
            setLoading(true);
            const res = await api_users.getFees();
            if (res && res.status && res.data) {
                const data = res.data;
                const studentData = data.student || {};

                // Currency
                if (data.sch_setting && data.sch_setting.currency_symbol) {
                    setCurrencySymbol(data.sch_setting.currency_symbol);
                }

                setStudent(studentData);

                setUserData({
                    name: `${studentData.firstname || ''} ${studentData.lastname || ''}`.trim() || 'Student',
                    role: 'Student',
                    id: studentData.id,
                    avatar: studentData.image ? `${data.sch_setting?.base_url || ''}uploads/student_images/${studentData.image}` : "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
                    adminLogoUrl: data.sch_setting?.admin_logo ? `${data.sch_setting.base_url}uploads/school_content/admin_logo/${data.sch_setting.admin_logo}` : ""
                });

                setStudentDiscountFee(data.student_discount_fee || []);
                setFeePayments(data.fee_payments || []);

                // Process Fees
                let totalAmount = 0;
                let totalDepositeAmount = 0;
                let totalFineAmount = 0;
                let totalFeesFineAmount = 0;
                let totalDiscountAmount = 0;
                let totalBalanceAmount = 0;

                const currentDate = new Date();

                const processedFees = (data.student_due_fee || []).map((group, groupIdx) => {
                    return {
                        ...group,
                        fees: (group.fees || []).map((fee, feeIdx) => {
                            let amountDetail = [];
                            try {
                                if (fee.amount_detail) {
                                    let parsed = fee.amount_detail;
                                    if (typeof parsed === 'string') {
                                        parsed = JSON.parse(parsed);
                                    }
                                    if (Array.isArray(parsed)) {
                                        amountDetail = parsed;
                                    } else if (parsed && typeof parsed === 'object') {
                                        amountDetail = Object.values(parsed);
                                    }
                                }
                            } catch (e) {
                                amountDetail = [];
                            }

                            let feePaid = 0;
                            let feeDiscount = 0;
                            let feeFine = 0;

                            amountDetail.forEach(d => {
                                feePaid += parseFloat(d.amount || 0);
                                feeDiscount += parseFloat(d.amount_discount || 0);
                                feeFine += parseFloat(d.amount_fine || 0);
                            });

                            let fineAmount = 0;
                            if (fee.due_date && fee.due_date !== "0000-00-00") {
                                const dueDate = new Date(fee.due_date);
                                if (dueDate < currentDate) {
                                    fineAmount = parseFloat(fee.fine_amount || 0);
                                    totalFeesFineAmount += fineAmount;
                                }
                            }

                            totalAmount += parseFloat(fee.amount || 0);
                            totalDiscountAmount += feeDiscount;
                            totalDepositeAmount += feePaid;
                            totalFineAmount += feeFine;

                            let feeTypeBalance = parseFloat(fee.amount || 0) - (feePaid + feeDiscount);
                            totalBalanceAmount += feeTypeBalance;

                            const isCollected = fee.student_fees_deposite_id && fee.student_fees_deposite_id != 0;
                            let status = "Unpaid";
                            if (feeTypeBalance <= 0) {
                                status = "Paid";
                            } else if (amountDetail.length > 0) {
                                status = "Partial";
                            }

                            return {
                                ...fee,
                                amount_detail: amountDetail,
                                total_paid: feePaid,
                                total_discount: feeDiscount,
                                total_fine: feeFine,
                                balance: feeTypeBalance < 0 ? 0 : feeTypeBalance,
                                status: status,
                                fine_amount_display: fineAmount,
                                uniqueId: `fee-${groupIdx}-${feeIdx}-${fee.id || 'x'}`
                            };
                        })
                    };
                });

                const processedTransportFees = (data.transport_fees || []).map((transportFee, idx) => {
                    let amountDetail = [];
                    try {
                        if (transportFee.amount_detail) {
                            let parsed = transportFee.amount_detail;
                            if (typeof parsed === 'string') {
                                parsed = JSON.parse(parsed);
                            }
                            if (Array.isArray(parsed)) {
                                amountDetail = parsed;
                            } else if (parsed && typeof parsed === 'object') {
                                amountDetail = Object.values(parsed);
                            }
                        }
                    } catch (e) { amountDetail = []; }

                    let feePaid = 0;
                    let feeDiscount = 0;
                    let feeFine = 0;
                    amountDetail.forEach(d => {
                        feePaid += parseFloat(d.amount || 0);
                        feeDiscount += parseFloat(d.amount_discount || 0);
                        feeFine += parseFloat(d.amount_fine || 0);
                    });

                    let feeTypeBalance = parseFloat(transportFee.fees || 0) - (feePaid + feeDiscount);

                    let fineAmount = 0;
                    if (transportFee.due_date && transportFee.due_date !== "0000-00-00") {
                        const dueDate = new Date(transportFee.due_date);
                        if (dueDate < currentDate) {
                            fineAmount = parseFloat(transportFee.fine_amount || 0);
                            totalFeesFineAmount += fineAmount;
                        }
                    }

                    totalAmount += parseFloat(transportFee.fees || 0);
                    totalDiscountAmount += feeDiscount;
                    totalDepositeAmount += feePaid;
                    totalFineAmount += feeFine;
                    totalBalanceAmount += feeTypeBalance;

                    return {
                        ...transportFee,
                        amount_detail: amountDetail,
                        uniqueId: `trans-${idx}-${transportFee.id || 'x'}`
                    };
                });

                setStudentDueFee(processedFees);
                setTransportFees(processedTransportFees);
                setTotals({
                    total_amount: totalAmount,
                    total_deposite_amount: totalDepositeAmount,
                    total_fine_amount: totalFineAmount,
                    total_fees_fine_amount: totalFeesFineAmount,
                    total_discount_amount: totalDiscountAmount,
                    total_balance_amount: totalBalanceAmount
                });
            }
        } catch (error) {
            console.error("Error fetching fees data", error);
            toast.error("Failed to fetch fees data");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "https://newlayout.wisibles.com/uploads/student_images/default_male.jpg";
        return `https://newlayout.wisibles.com/${image}`;
    };

    const amountFormat = (amount) => {
        if (amount === null || amount === undefined) return "0.00";
        return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const toggleFeeSelection = (feeId, feeData) => {
        setSelectedFeesList(prev => {
            const exists = prev.find(item => item.uniqueId === feeId);
            if (exists) {
                return prev.filter(item => item.uniqueId !== feeId);
            } else {
                return [...prev, { uniqueId: feeId, ...feeData }];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allFees = [];
            (studentDueFee || []).forEach(group => {
                (group.fees || []).forEach(fee => {
                    const balance = parseFloat(fee.balance || 0);
                    allFees.push({
                        uniqueId: fee.uniqueId,
                        balance: balance,
                        fee_category: 'fees',
                        student_fees_master_id: fee.student_fees_master_id || fee.id || 0,
                        fee_groups_feetype_id: fee.fee_groups_feetype_id || 0,
                        fee_session_group_id: fee.fee_session_group_id || 0,
                        groupName: group.name || 'Fee Group',
                        feeTypeName: fee.type || '',
                        feeTypeCode: fee.code || '',
                        fine_amount: fee.fine_amount_display || 0
                    });
                });
            });
            (transportFees || []).forEach(fee => {
                let amountDetail = fee.amount_detail || [];
                let paid = 0; let discount = 0;
                amountDetail.forEach(d => { paid += parseFloat(d.amount || 0); discount += parseFloat(d.amount_discount || 0); });
                const balance = parseFloat(fee.fees || 0) - (paid + discount);
                allFees.push({
                    uniqueId: fee.uniqueId,
                    balance: balance,
                    fee_category: 'transport',
                    student_fees_master_id: 0,
                    fee_groups_feetype_id: 0,
                    fee_session_group_id: 0,
                    trans_fee_id: fee.id || 0,
                    groupName: 'Transport Fees',
                    feeTypeName: fee.month || 'Transport',
                    feeTypeCode: fee.month || '',
                    fine_amount: fee.fine_amount_display || 0
                });
            });
            setSelectedFeesList(allFees);
        } else {
            setSelectedFeesList([]);
        }
    };

    const handlePrintSelected = async () => {
        if (selectedFeesList.length === 0) {
            toast.error("Please select at least one fee.");
            return;
        }

        try {
            const payload = {
                fees: selectedFeesList.map(fee => ({
                    fee_category: fee.fee_category || 'fees',
                    fee_groups_feetype_id: fee.fee_groups_feetype_id || 0,
                    fee_master_id: fee.student_fees_master_id || 0,
                    fee_session_group_id: fee.fee_session_group_id || 0
                }))
            };

            const response = await api_users.printFeesByGroupArray(payload);
            if (response && response.status && response.data) {
                printUserFeesGroupArrayReceipt(response.data);
            } else {
                toast.error(response?.message || 'Failed to fetch receipts data');
            }
        } catch (error) {
            console.error('Error printing selected receipts:', error);
            toast.error('An error occurred while printing selected fees');
        }
    };

    const handlePaySelected = () => {
        if (selectedFeesList.length === 0) {
            toast.error("Please select fees to pay.");
            return;
        }
        navigate('/user/gateway/ccavenue', {
            state: {
                student_id: student.id || student.student_id,
                selectedFees: selectedFeesList,
                student: student,
                currencySymbol: currencySymbol,
                userData: userData
            }
        });
    };

    const handlePayClick = (fee) => {
        navigate('/user/gateway/ccavenue', {
            state: {
                student_id: student.id || student.student_id,
                selectedFees: [{
                    ...fee,
                    fee_category: fee.fee_category || 'fees',
                    student_fees_master_id: fee.student_fees_master_id || fee.id || 0,
                    fee_groups_feetype_id: fee.fee_groups_feetype_id || 0
                }],
                student: student,
                currencySymbol: currencySymbol,
                userData: userData
            }
        });
    };

    const handlePrintFee = async (fee_category, main_invoice, sub_invoice) => {
        try {
            const dataToPrint = {
                fee_category: fee_category,
                main_invoice: main_invoice,
                sub_invoice: sub_invoice,
                student_session_id: student?.id || student?.student_id || student?.student_session_id
            };
            const response = await api_users.printFeesByName(dataToPrint);
            if (response && response.status && response.data) {
                printUserFeeReceipt(response.data);
            } else {
                toast.error(response?.message || 'Failed to fetch receipt data');
            }
        } catch (error) {
            console.error('Error printing receipt:', error);
            toast.error('An error occurred while printing');
        }
    };

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

    return (
        <>
            <style>{`
                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form { display: none !important; }

                /* NAVBAR USER MENU DROPDOWN FIX */
                .navbar-custom-menu { overflow: visible !important; }
                .navbar-custom-menu .nav { overflow: visible !important; }
                .navbar-custom-menu .nav > li:not(.user-menu) { display: none !important; }
                .navbar-custom-menu .nav > li.user-menu { display: block !important; overflow: visible !important; }
                
                .dropdown-user {
                    display: none;
                    z-index: 9999 !important;
                    position: absolute !important;
                    right: 0 !important;
                    top: 100% !important;
                }
                .user-menu.open .dropdown-user { display: block !important; }

                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper {
                    margin-left: 80px !important;
                    padding: 0px 0px 0px 5px;
                }
                .main-footer {
                    margin-left: 80px !important;
                    padding-left: 5px !important;
                }
                .sidebar { height: calc(100vh - 50px) !important; overflow-y: auto !important; overflow-x: hidden !important; padding-bottom: 20px !important; }
                .sidebar::-webkit-scrollbar { width: 5px; }
                .sidebar::-webkit-scrollbar-track { background: transparent; }
                .sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
                .sidebar-menu > li > a { padding: 12px 5px !important; text-align: center !important; }
                .sidebar-menu li img { filter: brightness(0) invert(1) !important; width: 24px !important; margin: 0 auto !important; }
                .sidebar-menu > li > a span { color: #ffffff !important; font-weight: 500 !important; margin-top: 5px !important; display: block !important; font-size: 10px !important; line-height: 1.2 !important; }
                .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a { background: rgba(255, 255, 255, 0.1) !important; }
                .fixedmenu { display: none !important; }

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    .content-wrapper { padding: 5px !important; margin: 0 !important; background: #f7f8fa !important; }
                    .box-primary {
                        margin: 60px 0px 15px 0px !important;
                        border-radius: 0 !important;
                        background: #fff !important;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                        border: 1px solid #ddd !important;
                        overflow: hidden !important;
                    }
                    .custom-fee-header {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        width: 100% !important;
                    }
                    
                    .hide-on-mobile { display: none !important; }
                    
                    .fee-card-list {
                        display: block !important;
                        padding: 10px 10px !important;
                    }
                    .fee-card {
                        background: #fff !important;
                        border: 1px solid #ddd !important;
                        border-radius: 8px !important;
                        margin-bottom: 20px !important;
                        overflow: hidden !important;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
                    }
                    .fee-card-header {
                        background: #eee !important;
                        padding: 10px 15px !important;
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        border-bottom: 1px solid #ddd !important;
                    }
                    .fee-card-header h4 {
                        margin: 0 !important;
                        font-size: 19px !important;
                        font-weight: 400 !important;
                        color: #333 !important;
                        padding-right: 10px !important;
                    }
                    .fee-card-print-btn {
                        background: #9854cb !important;
                        color: #fff !important;
                        border: none !important;
                        padding: 4px 18px !important;
                        border-radius: 20px !important;
                        font-size: 13px !important;
                        flex-shrink: 0 !important;
                    }
                    .fee-card-body {
                        padding: 18px 15px !important;
                        position: relative !important;
                    }
                    .fee-card-row {
                        display: block !important;
                        margin-bottom: 6px !important;
                        font-size: 15px !important;
                        color: #333 !important;
                    }
                    .fee-card-row .label {
                        font-weight: 400 !important;
                        color: #333 !important;
                        background: none !important;
                        padding: 0 !important;
                        display: inline !important;
                        font-size: 13px !important;
                    }
                    .fee-card-row .value {
                        color: #333 !important;
                        margin-left: 3px !important;
                        font-size: 13px !important;
                    }
                    .fee-card-row .fine-text {
                        color: #ff0000 !important;
                        font-weight: 500 !important;
                    }
                    .fee-card-status {
                        position: absolute !important;
                        right: 15px !important;
                        top: 45px !important;
                    }
                    .fee-status-badge {
                        padding: 3px 8px !important;
                        border-radius: 4px !important;
                        color: #fff !important;
                        font-size: 12px !important;
                        font-weight: 500 !important;
                    }
                    .fee-status-badge.paid { background: #5cb85c !important; }
                    .fee-status-badge.unpaid { background: #d9534f !important; }
                    .fee-status-badge.partial { background: #f0ad4e !important; }

                    .payment-details-section {
                        margin-top: 25px !important;
                        padding-top: 5px !important;
                    }
                    .payment-details-title {
                        font-size: 20px !important;
                        color: #333 !important;
                        margin-bottom: 15px !important;
                        text-align: left !important;
                        border-bottom: 1px solid #ddd !important;
                        padding-bottom: 8px !important;
                        font-weight: 400 !important;
                    }
                }
                
                @media (min-width: 770px) {
                    .fee-card-list { display: none !important; }
                }

                /* Fees Page Header Styles */
                .custom-fee-header {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    background-color: #fff !important;
                    border-bottom: 1px solid #eee !important;
                    padding: 12px 15px !important;
                    width: 100% !important;
                    margin: 0 !important;
                    float: none !important;
                }
                .custom-fee-title {
                    margin: 0 !important;
                    font-size: 20px !important;
                    font-weight: 500 !important;
                    color: #333 !important;
                    text-align: left !important;
                    flex: 1 !important;
                }
                .custom-back-btn {
                    background-color: #9854cb !important;
                    color: #fff !important;
                    border: none !important;
                    padding: 4px 10px !important;
                    border-radius: 20px !important;
                    font-size: 14px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                    flex-shrink: 0 !important;
                    transition: all 0.3s ease !important;
                    margin-left: auto !important;
                }
                .custom-back-btn:hover {
                    background-color: #7b3da1 !important;
                    color: #fff !important;
                    transform: scale(1.02);
                }
                .custom-back-btn i {
                    font-size: 11px !important;
                }

                /* General GetFees CSS */
                .gf-content-wrapper { min-height: 850px; }
                .gf-loader-container { padding: 100px; }
                .gf-box-body { padding-top: 0; }
                .gf-profile-col { width: 150px; }
                .gf-profile-img { width: 115px; height: 115px; object-fit: cover; }
                .gf-divider { background: #dadada; height: 1px; width: 100%; clear: both; margin-bottom: 10px; }
                .gf-btn-primary { background-color: #9854cb; color: #fff; border: none; }
                .gf-btn-primary-ml { background-color: #9854cb; color: #fff; border: none; margin-left: 5px; }
                .gf-th-check { width: 10px; }
                .gf-icon-gray { color: #999; }
                .gf-tr-footer { background-color: #f4f4f4; font-weight: bold; }
                .gf-payment-item { margin-bottom: 15px; }

            `}</style>

            <div className="content-wrapper gf-content-wrapper">
                <section className="content">
                    {loading ? (
                        <div className="text-center gf-loader-container">
                            <Loader />
                        </div>
                    ) : !student ? (
                        <div className="content">Student not found</div>
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="custom-fee-header">
                                        <h3 className="custom-fee-title">Student Fees</h3>
                                        <button className="btn btn-sm custom-back-btn" onClick={() => navigate('/user/dashboard')}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <div className="box-body gf-box-body">
                                        <div className="row hide-on-mobile">
                                            <div className="col-md-12">
                                                <div className="sfborder-top-border">
                                                    <div className="col-md-2 gf-profile-col">
                                                        <img
                                                            src={getImageUrl(student.image)}
                                                            className="img-responsive img-rounded img-thumbnail mt5 mb10 gf-profile-img"
                                                            alt="User"
                                                        />
                                                    </div>
                                                    <div className="col-md-10">
                                                        <div className="row">
                                                            <table className="table table-striped mb0 font13">
                                                                <tbody>
                                                                    <tr>
                                                                        <th className="bozero">Name</th>
                                                                        <td className="bozero">{student.firstname} {student.lastname}</td>
                                                                        <th className="bozero">Class (Section)</th>
                                                                        <td className="bozero">{student.class} ({student.section})</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Father Name</th>
                                                                        <td>{student.father_name}</td>
                                                                        <th>Admission No</th>
                                                                        <td>{student.admission_no}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Mobile Number</th>
                                                                        <td>{student.mobileno}</td>
                                                                        <th>Roll Number</th>
                                                                        <td>{student.roll_no}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Category</th>
                                                                        <td>{student.category}</td>
                                                                        {student.rte === 'Yes' && (
                                                                            <>
                                                                                <th>RTE</th>
                                                                                <td><b className="text-danger">{student.rte}</b></td>
                                                                            </>
                                                                        )}
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="gf-divider"></div>
                                            </div>
                                        </div>

                                        <div className="row no-print mb10 hide-on-mobile">
                                            <div className="col-md-6 mDMb10">
                                                <div className="btn-group">
                                                    <button type="button" className="btn btn-sm gf-btn-primary" onClick={handlePrintSelected}>
                                                        <i className="fa fa-print"></i> Print Selected
                                                    </button>
                                                    <button type="button" className="btn btn-sm gf-btn-primary-ml" onClick={handlePaySelected}>
                                                        <i className="fa fa-money"></i> Pay Selected
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mDMb10 text-right">
                                                <span className="pt5">Date: {new Date().toLocaleDateString('en-GB')}</span>
                                            </div>
                                        </div>

                                        <div className="table-responsive hide-on-mobile">
                                            <div className="download_label">Student Fees: {student.firstname} {student.lastname} ({student.admission_no})</div>
                                            <table className="table table-striped table-bordered table-hover example table-fixed-header">
                                                <thead className="header">
                                                    <tr>
                                                        <th className="gf-th-check">
                                                            <input type="checkbox" id="select_all" onChange={handleSelectAll} />
                                                        </th>
                                                        <th align="left">Fees Group</th>
                                                        <th align="left">Fees Code</th>
                                                        <th align="left" className="text-left">Due Date</th>
                                                        <th align="left" className="text-left">Status</th>
                                                        <th className="text-right">Amount <span>({currencySymbol})</span></th>
                                                        <th className="text-left">Payment ID</th>
                                                        <th className="text-left">Mode</th>
                                                        <th className="text-left">Date</th>
                                                        <th className="text-right">Discount <span>({currencySymbol})</span></th>
                                                        <th className="text-right">Fine <span>({currencySymbol})</span></th>
                                                        <th className="text-right">Paid <span>({currencySymbol})</span></th>
                                                        <th className="text-right">Balance <span>({currencySymbol})</span></th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(studentDueFee || []).map((group, groupIndex) =>
                                                        (group.fees || []).map((fee, feeIndex) => {
                                                            const balance = parseFloat(fee.balance);
                                                            const status = fee.status;
                                                            const statusLabel = status === 'Paid' ? 'success' : (status === 'Partial' ? 'warning' : 'danger');
                                                            const uniqueId = fee.uniqueId;
                                                            const isSelected = selectedFeesList.some(item => item.uniqueId === uniqueId);
                                                            return (
                                                                <React.Fragment key={`${groupIndex}-${feeIndex}`}>
                                                                    <tr className={status === 'Paid' ? "dark-gray" : "danger font12"}>
                                                                        <td>
                                                                            <input type="checkbox" className="checkbox checkboxes" checked={isSelected} onChange={() => toggleFeeSelection(uniqueId, { balance: balance, fee_category: 'fees', student_fees_master_id: fee.student_fees_master_id || fee.id || 0, fee_groups_feetype_id: fee.fee_groups_feetype_id || 0, fee_session_group_id: fee.fee_session_group_id || 0, groupName: group.name || 'Fee Group', feeTypeName: fee.type || '', feeTypeCode: fee.code || '', fine_amount: fee.fine_amount_display || 0 })} />
                                                                        </td>
                                                                        <td align="left">{fee.is_system ? `${fee.name} (${fee.type})` : `${fee.name} (${fee.type})`}</td>
                                                                        <td align="left">{fee.code}</td>
                                                                        <td align="left">{fee.due_date === "0000-00-00" ? "" : fee.due_date}</td>
                                                                        <td align="left"><span className={`label label-${statusLabel}`}>{status}</span></td>
                                                                        <td className="text-right">
                                                                            {amountFormat(fee.amount)}
                                                                            {fee.fine_amount_display > 0 && (
                                                                                <span className="text text-danger detail_popover"> + {amountFormat(fee.fine_amount_display)}</span>
                                                                            )}
                                                                        </td>
                                                                        <td></td><td></td><td></td>
                                                                        <td className="text-right">{amountFormat(fee.total_discount)}</td>
                                                                        <td className="text-right">{amountFormat(fee.total_fine)}</td>
                                                                        <td className="text-right">{amountFormat(fee.total_paid)}</td>
                                                                        <td className="text-right">{balance > 0 ? amountFormat(balance) : ""}</td>
                                                                        <td className="text-right">
                                                                            {balance > 0 && (
                                                                                <button className="btn btn-xs gf-btn-primary" onClick={() => handlePayClick(fee)}><i className="fa fa-money"></i> Pay</button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                    {(fee.amount_detail || []).map((deposit, dIndex) => (
                                                                        <tr key={`dep-${dIndex}`} className="white-td">
                                                                            <td colSpan="5"></td>
                                                                            <td className="text-right"><i className="fa fa-level-up fa-rotate-90 gf-icon-gray"></i></td>
                                                                            <td className="text-left">{fee.student_fees_deposite_id}/{deposit.inv_no}</td>
                                                                            <td className="text-left">{deposit.payment_mode}</td>
                                                                            <td className="text-left">{deposit.date}</td>
                                                                            <td className="text-right">{amountFormat(deposit.amount_discount)}</td>
                                                                            <td className="text-right">{amountFormat(deposit.amount_fine)}</td>
                                                                            <td className="text-right">{amountFormat(deposit.amount)}</td>
                                                                            <td colSpan="2" className="text-right">
                                                                                <button
                                                                                    className="btn btn-xs btn-default inline-print"
                                                                                    onClick={() => handlePrintFee('fees', fee.student_fees_deposite_id || fee.id, deposit.inv_no)}
                                                                                    title="Print"
                                                                                >
                                                                                    <i className="fa fa-print"></i>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    )}

                                                    {(transportFees || []).map((fee, feeIndex) => {
                                                        let amountDetail = fee.amount_detail || [];
                                                        let feePaid = fee.total_paid || 0;
                                                        let feeDiscount = fee.total_discount || 0;
                                                        let feeFine = fee.total_fine || 0;
                                                        let balance = parseFloat(fee.fees) - (feePaid + feeDiscount);
                                                        let status = balance <= 0 ? "Paid" : (amountDetail.length > 0 ? "Partial" : "Unpaid");
                                                        let statusLabel = status === 'Paid' ? 'success' : (status === 'Partial' ? 'warning' : 'danger');
                                                        let fineAmountDisplay = fee.fine_amount_display || 0;
                                                        let uniqueId = fee.uniqueId;
                                                        let isSelected = selectedFeesList.some(item => item.uniqueId === uniqueId);
                                                        return (
                                                            <React.Fragment key={uniqueId}>
                                                                <tr className={status === 'Paid' ? "dark-gray" : "danger font12"}>
                                                                    <td>
                                                                        <input type="checkbox" className="checkbox" checked={isSelected} onChange={() => toggleFeeSelection(uniqueId, { balance: balance, fee_category: 'transport', student_fees_master_id: 0, fee_groups_feetype_id: 0, fee_session_group_id: 0, trans_fee_id: fee.id || 0, groupName: 'Transport Fees', feeTypeName: fee.month || 'Transport', feeTypeCode: fee.month || '', fine_amount: fee.fine_amount_display || 0 })} />
                                                                    </td>
                                                                    <td align="left">Transport Fees</td>
                                                                    <td align="left">{fee.month}</td>
                                                                    <td align="left">{fee.due_date}</td>
                                                                    <td align="left"><span className={`label label-${statusLabel}`}>{status}</span></td>
                                                                    <td className="text-right">{amountFormat(fee.fees)}
                                                                        {fineAmountDisplay > 0 && <span className="text text-danger"> + {amountFormat(fineAmountDisplay)}</span>}
                                                                    </td>
                                                                    <td></td><td></td><td></td>
                                                                    <td className="text-right">{amountFormat(feeDiscount)}</td>
                                                                    <td className="text-right">{amountFormat(feeFine)}</td>
                                                                    <td className="text-right">{amountFormat(feePaid)}</td>
                                                                    <td className="text-right">{balance > 0 ? amountFormat(balance) : ""}</td>
                                                                    <td className="text-right">
                                                                        {balance > 0 && <button className="btn btn-xs gf-btn-primary" onClick={() => handlePayClick(fee)}><i className="fa fa-money"></i> Pay</button>}
                                                                    </td>
                                                                </tr>
                                                                {amountDetail.map((deposit, dIndex) => (
                                                                    <tr key={`trans-dep-${dIndex}`} className="white-td">
                                                                        <td colSpan="5"></td>
                                                                        <td className="text-right"><i className="fa fa-level-up fa-rotate-90 gf-icon-gray"></i></td>
                                                                        <td className="text-left">{fee.student_fees_deposite_id}/{deposit.inv_no}</td>
                                                                        <td className="text-left">{deposit.payment_mode}</td>
                                                                        <td className="text-left">{deposit.date}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_discount)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_fine)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount)}</td>
                                                                        <td colSpan="2" className="text-right">
                                                                            <button
                                                                                className="btn btn-xs btn-default inline-print"
                                                                                onClick={() => handlePrintFee('transport', fee.student_fees_deposite_id || fee.id, deposit.inv_no)}
                                                                                title="Print"
                                                                            >
                                                                                <i className="fa fa-print"></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        );
                                                    })}

                                                    {(studentDiscountFee || []).map((discount, dIndex) => (
                                                        <tr key={`disc-${dIndex}`} className="dark-light">
                                                            <td></td>
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
                                                            <td colSpan="9"></td>
                                                        </tr>
                                                    ))}

                                                    <tr className="gf-tr-footer">
                                                        <td colSpan="5" className="text-right">Grand Total</td>
                                                        <td className="text-right">
                                                            {currencySymbol}{amountFormat(totals.total_amount)}
                                                            <span className="text-danger"> + {amountFormat(totals.total_fees_fine_amount)}</span>
                                                        </td>
                                                        <td colSpan="3"></td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.total_discount_amount)}</td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.total_fine_amount)}</td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.total_deposite_amount)}</td>
                                                        <td className="text-right">{currencySymbol}{amountFormat(totals.total_balance_amount)}</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="fee-card-list visible-xs">
                                            {studentDueFee.map((group, gIdx) =>
                                                group.fees.map((fee, fIdx) => (
                                                    <div className="fee-card" key={`card-${gIdx}-${fIdx}`}>
                                                        <div className="fee-card-header">
                                                            <h5>{group.name} ({fee.code})</h5>
                                                            <button className="fee-card-print-btn" onClick={() => handlePrintFee('fees', fee.student_fees_deposite_id || fee.id, 'all')}>Print</button>
                                                        </div>
                                                        <div className="fee-card-body">
                                                            <div className="fee-card-status">
                                                                <span className={`fee-status-badge ${fee.status.toLowerCase()}`}>
                                                                    {fee.status}
                                                                </span>
                                                            </div>
                                                            <div className="fee-card-row">
                                                                <span className="label">Fees Code :</span>
                                                                <span className="value">{fee.code}</span>
                                                            </div>
                                                            <div className="fee-card-row">
                                                                <span className="label">Due Date :</span>
                                                                <span className="value">{fee.due_date === "0000-00-00" ? "" : fee.due_date}</span>
                                                            </div>
                                                            <div className="fee-card-row">
                                                                <span className="label">Amount :</span>
                                                                <span className="value">
                                                                    {amountFormat(fee.amount)}
                                                                    {fee.fine_amount_display > 0 && <span className="fine-text"> + {amountFormat(fee.fine_amount_display)}</span>}
                                                                </span>
                                                            </div>
                                                            <div className="fee-card-row">
                                                                <span className="label">Fine :</span>
                                                                <span className="value">{amountFormat(fee.total_fine)}</span>
                                                            </div>
                                                            <div className="fee-card-row">
                                                                <span className="label">Discount :</span>
                                                                <span className="value">{amountFormat(fee.total_discount)}</span>
                                                            </div>
                                                            <div className="fee-card-row">
                                                                <span className="label">Paid Amt :</span>
                                                                <span className="value">{amountFormat(fee.total_paid)}</span>
                                                            </div>
                                                            <div className="fee-card-row">
                                                                <span className="label">Balance :</span>
                                                                <span className="value">{fee.balance > 0 ? amountFormat(fee.balance) : ""}</span>
                                                            </div>

                                                            {fee.amount_detail && fee.amount_detail.length > 0 && (
                                                                <div className="payment-details-section">
                                                                    <h4 className="payment-details-title">Payment Details</h4>
                                                                    {fee.amount_detail.map((deposit, dIdx) => (
                                                                        <div key={`dep-card-${dIdx}`} className="payment-item gf-payment-item">
                                                                            <div className="fee-card-row">
                                                                                <span className="label">Payment ID :</span>
                                                                                <span className="value">{fee.student_fees_deposite_id}/{deposit.inv_no}</span>
                                                                            </div>
                                                                            <div className="fee-card-row">
                                                                                <span className="label">Mode :</span>
                                                                                <span className="value">{deposit.payment_mode}</span>
                                                                            </div>
                                                                            <div className="fee-card-row">
                                                                                <span className="label">Payment Date :</span>
                                                                                <span className="value">{deposit.date}</span>
                                                                            </div>
                                                                            <div className="fee-card-row">
                                                                                <span className="label">Discount :</span>
                                                                                <span className="value">{amountFormat(deposit.amount_discount)}</span>
                                                                            </div>
                                                                            <div className="fee-card-row">
                                                                                <span className="label">Fine :</span>
                                                                                <span className="value">{amountFormat(deposit.amount_fine)}</span>
                                                                            </div>
                                                                            <div className="fee-card-row">
                                                                                <span className="label">Amount :</span>
                                                                                <span className="value">{amountFormat(deposit.amount)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {transportFees.map((fee, tIdx) => (
                                                <div className="fee-card" key={`trans-card-${tIdx}`}>
                                                    <div className="fee-card-header">
                                                        <h4>Transport Fees ({fee.month})</h4>
                                                        <button className="fee-card-print-btn" onClick={() => handlePrintFee('transport', fee.student_fees_deposite_id || fee.id, 'all')}>Print</button>
                                                    </div>
                                                    <div className="fee-card-body">
                                                        <div className="fee-card-status">
                                                            <span className={`fee-status-badge ${parseFloat(fee.fees) - (fee.total_paid + fee.total_discount) <= 0 ? 'paid' : 'unpaid'}`}>
                                                                {parseFloat(fee.fees) - (fee.total_paid + fee.total_discount) <= 0 ? 'Paid' : 'Unpaid'}
                                                            </span>
                                                        </div>
                                                        <div className="fee-card-row">
                                                            <span className="label">Fees Code :</span>
                                                            <span className="value">{fee.month}</span>
                                                        </div>
                                                        <div className="fee-card-row">
                                                            <span className="label">Due Date :</span>
                                                            <span className="value">{fee.due_date}</span>
                                                        </div>
                                                        <div className="fee-card-row">
                                                            <span className="label">Amount :</span>
                                                            <span className="value">
                                                                {amountFormat(fee.fees)}
                                                                {fee.fine_amount_display > 0 && <span className="fine-text"> + {amountFormat(fee.fine_amount_display)}</span>}
                                                            </span>
                                                        </div>
                                                        <div className="fee-card-row">
                                                            <span className="label">Fine :</span>
                                                            <span className="value">{amountFormat(fee.total_fine)}</span>
                                                        </div>
                                                        <div className="fee-card-row">
                                                            <span className="label">Discount :</span>
                                                            <span className="value">{amountFormat(fee.total_discount)}</span>
                                                        </div>
                                                        <div className="fee-card-row">
                                                            <span className="label">Paid Amt :</span>
                                                            <span className="value">{amountFormat(fee.total_paid)}</span>
                                                        </div>
                                                        <div className="fee-card-row">
                                                            <span className="label">Balance :</span>
                                                            <span className="value">{amountFormat(parseFloat(fee.fees) - (fee.total_paid + fee.total_discount))}</span>
                                                        </div>

                                                        {fee.amount_detail && fee.amount_detail.length > 0 && (
                                                            <div className="payment-details-section">
                                                                <h3 className="payment-details-title">Payment Details</h3>
                                                                {fee.amount_detail.map((deposit, dIdx) => (
                                                                    <div key={`trans-dep-card-${dIdx}`} className="payment-item gf-payment-item">
                                                                        <div className="fee-card-row">
                                                                            <span className="label">Payment ID :</span>
                                                                            <span className="value">{fee.student_fees_deposite_id}/{deposit.inv_no}</span>
                                                                        </div>
                                                                        <div className="fee-card-row">
                                                                            <span className="label">Mode :</span>
                                                                            <span className="value">{deposit.payment_mode}</span>
                                                                        </div>
                                                                        <div className="fee-card-row">
                                                                            <span className="label">Payment Date :</span>
                                                                            <span className="value">{deposit.date}</span>
                                                                        </div>
                                                                        <div className="fee-card-row">
                                                                            <span className="label">Discount :</span>
                                                                            <span className="value">{amountFormat(deposit.amount_discount)}</span>
                                                                        </div>
                                                                        <div className="fee-card-row">
                                                                            <span className="label">Fine :</span>
                                                                            <span className="value">{amountFormat(deposit.amount_fine)}</span>
                                                                        </div>
                                                                        <div className="fee-card-row">
                                                                            <span className="label">Amount :</span>
                                                                            <span className="value">{amountFormat(deposit.amount)}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default GetFees;