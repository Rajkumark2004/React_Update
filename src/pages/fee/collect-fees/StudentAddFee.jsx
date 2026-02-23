import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReceiptContent, convertToWords } from '../feereceipt/ReceiptContent';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';
import StudentCollectFeeModal from './StudentCollectFeeModal';
import ApplyDiscountModal from './ApplyDiscountModal';
import CancelInvoiceModal from './CancelInvoiceModal';

const StudentAddFee = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [feePayments, setFeePayments] = useState([]); // New state for receipts
    const [studentDueFee, setStudentDueFee] = useState([]);
    const [transportFees, setTransportFees] = useState([]);
    const [studentDiscountFee, setStudentDiscountFee] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState('₹'); // Default, usually from settings
    // PHP $oldFee equivalent: Not present in provided JSON, but added for structure match
    const [oldFee, setOldFee] = useState(null);
    const [studentProcessingFee, setStudentProcessingFee] = useState(false); // $student_processing_fee in PHP

    const [totals, setTotals] = useState({
        total_amount: 0,
        total_deposite_amount: 0,
        total_fine_amount: 0,
        total_fees_fine_amount: 0,
        total_discount_amount: 0,
        total_balance_amount: 0
    });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [selectedPaymentToCancel, setSelectedPaymentToCancel] = useState(null);
    const [discountAmount, setDiscountAmount] = useState('');
    const [schSetting, setSchSetting] = useState(null);

    useEffect(() => {
        fetchStudentFees();
    }, [id]);

    const fetchStudentFees = async () => {
        try {
            setLoading(true);
            const response = await api.getStudentFees(id);

            if (response && response.status === true) {
                const data = response.data;
                const studentData = data.student || {};

                // Set Currency Symbol
                if (data.sch_setting && data.sch_setting.currency_symbol) {
                    setCurrencySymbol(data.sch_setting.currency_symbol);
                } else if (data.currency_symbol) {
                    setCurrencySymbol(data.currency_symbol);
                }

                if (data.sch_setting) {
                    setSchSetting(data.sch_setting);
                }

                setStudent(studentData);
                // setTransportFees moved to after processing
                setStudentDiscountFee(data.student_discount_fee || []);
                setStudentProcessingFee(data.student_processing_fee || false);
                setOldFee(data.old_fee || null);
                setFeePayments(data.fee_payments || []); // Set receipts data

                // Process Fees & Calculate Totals logic to match PHP loop
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
                                console.error("Error parsing amount_detail", e);
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

                            // Fine Calculation Logic from PHP
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

                            // Balance = Amount - (Paid + Discount)
                            let feeTypeBalance = parseFloat(fee.amount || 0) - (feePaid + feeDiscount);
                            totalBalanceAmount += feeTypeBalance;

                            // Determine Status
                            const isCollected = fee.student_fees_deposite_id && fee.student_fees_deposite_id != 0;
                            let status = "Unpaid";
                            if (feeTypeBalance <= 0) { // Changed condition to match PHP strictly: if ($feetype_balance == 0) -> Paid
                                status = "Paid";
                            } else if (amountDetail.length > 0) { // if (!empty($fee_value->amount_detail)) -> Partial
                                status = "Partial";
                            }

                            return {
                                ...fee,
                                amount_detail: amountDetail,
                                total_paid: feePaid,
                                total_discount: feeDiscount,
                                total_fine: feeFine,
                                balance: feeTypeBalance < 0 ? 0 : feeTypeBalance, // Should technically allow negative? PHP doesn't explicit clamp, but usually balance >= 0
                                status: status,
                                fine_amount_display: fineAmount, // For displaying the red + amount
                                uniqueId: `fee-${groupIdx}-${feeIdx}-${fee.id || 'x'}`
                            };
                        })
                    };
                });

                // Process Transport Fees Totals
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

            } else {
                toast.error(response.message || "Failed to fetch student fees");
            }
        } catch (error) {
            console.error("Error fetching student fees:", error);
            toast.error("Failed to fetch student fees");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "https://newlayout.wisibles.com/uploads/student_images/default_male.jpg"; // Default placeholder
        return `https://newlayout.wisibles.com/${image}`;
    };

    const amountFormat = (amount) => {
        if (amount === null || amount === undefined) return "0.00";
        return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // State for selected fees for bulk action
    const [selectedFeesList, setSelectedFeesList] = useState([]);

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
            // Collect all student fees
            (studentDueFee || []).forEach(group => {
                (group.fees || []).forEach(fee => {
                    const balance = parseFloat(fee.balance);
                    if (balance > 0) {
                        const uniqueId = fee.uniqueId;
                        allFees.push({
                            uniqueId: uniqueId,
                            fee_session_group_id: group.fee_session_group_id || group.id || 0,
                            fee_master_id: fee.id,
                            fee_groups_feetype_id: fee.fee_groups_feetype_id,
                            fee_category: 'fees',
                            trans_fee_id: 0,
                            balance: balance,
                            groupName: group.name || 'Fee Group',
                            feeTypeName: fee.type || '',
                            feeTypeCode: fee.code || '',
                            fine_amount: fee.fine_amount_display || 0
                        });
                    }
                });
            });
            // Collect all transport fees
            (transportFees || []).forEach(fee => {
                let paid = 0;
                let discount = 0;

                let amountDetail = [];
                try {
                    if (fee.amount_detail && typeof fee.amount_detail === 'string') {
                        amountDetail = JSON.parse(fee.amount_detail);
                    } else if (fee.amount_detail && typeof fee.amount_detail === 'object') {
                        amountDetail = Array.isArray(fee.amount_detail) ? fee.amount_detail : Object.values(fee.amount_detail);
                    }
                } catch (e) { amountDetail = []; }

                amountDetail.forEach(d => { paid += parseFloat(d.amount); discount += parseFloat(d.amount_discount); });
                const balance = parseFloat(fee.fees) - (paid + discount);

                if (balance > 0) {
                    const uniqueId = fee.uniqueId;
                    allFees.push({
                        uniqueId: uniqueId,
                        fee_session_group_id: 0,
                        fee_master_id: 0,
                        fee_groups_feetype_id: 0,
                        fee_category: 'transport',
                        trans_fee_id: fee.id,
                        balance: balance,
                        groupName: 'Transport Fees',
                        feeTypeName: fee.month || 'Transport',
                        feeTypeCode: fee.month || '',
                        fine_amount: 0
                    });
                }
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
            // Construct payload client-side for PrintFeesByGroupArray
            // This avoids API roundtrip that might lose selected context or require complex backend logic reconstruction
            const feearray = selectedFeesList.map(item => ({
                ...item,
                amount: item.balance, // Use balance as the amount to pay/print
                type: item.feeTypeName,
                code: item.feeTypeCode,
                fine_amount: item.fine_amount,
                fee_category: item.fee_category
            }));

            const printData = {
                feearray: feearray,
                student: student,
                sch_setting: schSetting
            };

            localStorage.setItem('printFeesByGroupArrayData', JSON.stringify(printData));
            window.open('/studentfee/printFeesByGroupArray', '_blank');

        } catch (error) {
            console.error(error);
            toast.error("Failed to generate print view");
        }
    };

    const handleRevert = async (payment) => {
        if (!window.confirm("Are you sure you want to revert this fee payment?")) return;
        try {
            console.log('Revert Payment Object:', payment);
            // Handle different object structures (payment list vs fee deposits list)
            const mainInvoiceId = payment.id || payment.student_fees_deposite_id || payment.payment_id;

            if (!mainInvoiceId) {
                toast.error("Invalid payment ID");
                return;
            }

            const payload = {
                main_invoice: mainInvoiceId,
                sub_invoice: payment.sub_invoice_id || payment.inv_no || 1
            };
            const res = await api.deleteStudentFee(payload);
            if (res.status === "success" || res.status === 1 || res.success) { // Flexible check
                toast.success("Fee payment reverted successfully");
                fetchStudentFees();
            } else {
                toast.error(res.message || "Failed to revert fee");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error reverting fee");
        }
    };

    const handleCancelInvoiceClick = (payment) => {
        setSelectedPaymentToCancel(payment);
        setShowCancelModal(true);
    };

    const handlePrintSingle = async (fee) => {
        try {
            const feeCategory = fee.category || fee.fee_category || 'fees';
            const isTransport = feeCategory === 'transport';

            const item = {
                amount: fee.balance,
                type: isTransport ? (fee.month || 'Transport Fee') : (fee.type || fee.feeTypeName),
                code: isTransport ? (fee.month || '') : (fee.code || fee.feeTypeCode),
                fine_amount: fee.fine_amount_display || fee.fine_amount || 0,
                fee_category: feeCategory,
                fee_master_id: isTransport ? 0 : fee.id,
                transport_fees_id: isTransport ? fee.id : 0,
                fee_session_group_id: fee.fee_session_group_id || 0,
                fee_groups_feetype_id: fee.fee_groups_feetype_id || 0
            };

            const printData = {
                feearray: [item],
                student: student,
                sch_setting: schSetting
            };

            localStorage.setItem('printFeesByGroupArrayData', JSON.stringify(printData));
            window.open('/studentfee/printFeesByGroupArray', '_blank');

        } catch (error) {
            console.error(error);
            toast.error("Failed to generate print view");
        }
    };

    const handleCollectSelected = async () => {
        if (selectedFeesList.length === 0) {
            toast.error("Please select fees to collect.");
            return;
        }

        try {
            // Match PHP logic: totalbalanceAmount is the grand total balance from the whole table
            const totalBalance = totals.total_balance_amount;

            const array_to_collect_fees = selectedFeesList.map(item => ({
                fee_category: item.fee_category,
                trans_fee_id: item.trans_fee_id,
                fee_session_group_id: item.fee_session_group_id,
                fee_master_id: item.fee_master_id,
                fee_groups_feetype_id: item.fee_groups_feetype_id,
                totalbalanceAmount: totalBalance
            }));

            // Fetch collection details from API
            const response = await api.getCollectFee({ data: JSON.stringify(array_to_collect_fees) });

            // If response has view (HTML), for now we'll handle it by calculating totals 
            // and passing them to the React modal. In a full React conversion, 
            // the API would return JSON data.

            const totalToCollect = selectedFeesList.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);

            setSelectedFee({
                name: `Selected Fees (${selectedFeesList.length})`,
                balance: totalToCollect,
                is_batch: true,
                selectedItems: selectedFeesList,
                apiResponse: response // Pass raw response if needed
            });
            setShowModal(true);
        } catch (error) {
            console.error(error);
            toast.error("Error preparing fee collection");
        }
    };


    const handleCollectFee = (fee, type = 'fees') => {
        setSelectedFee({
            ...fee,
            student_fees_master_id: type === 'fees' ? fee.id : 0,
            fee_groups_feetype_id: fee.fee_groups_feetype_id || 0,
            transport_fees_id: type === 'transport' ? fee.id : 0,
            fee_category: type,
            balance: fee.balance
        });
        setShowModal(true);
    };

    const handleProcessingFees = () => {
        toast.error("Processing Fees feature coming soon");
    };

    const handlePayDiscount = async () => {
        if (selectedFeesList.length === 0) {
            toast.error("Please select at least one fee to apply discount.");
            return;
        }

        try {
            const array_to_collect_fees = selectedFeesList.map(item => ({
                fee_category: item.fee_category,
                trans_fee_id: item.trans_fee_id,
                fee_session_group_id: item.fee_session_group_id,
                fee_master_id: item.fee_master_id,
                fee_groups_feetype_id: item.fee_groups_feetype_id,
                fee_remaing_amount: item.balance
            }));

            // Fetch collection details from API 1 for Discount
            const response = await api.getCollectFee1({ data: JSON.stringify(array_to_collect_fees) });

            const totalToCollect = selectedFeesList.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);

            setSelectedFee({
                name: `Selected Fees (${selectedFeesList.length})`,
                balance: totalToCollect,
                is_batch: true,
                selectedItems: selectedFeesList,
                apiResponse: response,
                enteredDiscount: discountAmount
            });
            setShowDiscountModal(true);
        } catch (error) {
            console.error(error);
            toast.error("Error preparing discount application");
        }
    };

    const handleGenerateChallan = () => {
        toast.error("Generate Challan feature coming soon");
    };

    // Print Receipt Logic (Ported from FeesReceipt24)
    const handlePrintReceipt = async (payment) => {
        try {
            // Check if printing logic needs specific API or if we can construct from payment
            const response = await api.printStudentGroupFees24(payment.id);
            if (response && response.status === 1) {
                const { student: studentData, sch_setting } = response.data;
                const receiptHtml = renderToStaticMarkup(
                    <ReceiptContent student={studentData} sch_setting={sch_setting} />
                );

                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.width = '0px';
                iframe.style.height = '0px';
                iframe.style.border = 'none';
                document.body.appendChild(iframe);

                const frameDoc = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.document ? iframe.contentDocument.document : iframe.contentDocument;
                frameDoc.document.open();
                frameDoc.document.write('<html><head><title>Print Receipt</title>');
                frameDoc.document.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">');
                frameDoc.document.write('<style>');
                frameDoc.document.write(`
                    @media print {
                        .col-sm-6 { width: 50%; float: left; }
                        .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-12 { float: left; }
                        .col-sm-12 { width: 100%; }
                        .col-sm-3 { width: 25%; }
                        .col-sm-4 { width: 33.33%; }
                        .col-sm-2 { width: 16.66%; }
                        .col-sm-1 { width: 8.33%; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        table { width: 100%; border-collapse: collapse; }
                        td, th { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
                        .no-print { display: none !important; }
                    }
                    .header { margin-bottom: 20px; }
                    .table { width: 100%; max-width: 100%; margin-bottom: 20px; }
                    .table-bordered { border: 1px solid #ddd; }
                `);
                frameDoc.document.write('</style>');
                frameDoc.document.write('</head><body>');
                frameDoc.document.write(receiptHtml);
                frameDoc.document.write('</body></html>');
                frameDoc.document.close();

                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    document.body.removeChild(iframe);
                }, 500);

            } else {
                toast.error('Failed to fetch receipt data');
            }
        } catch (error) {
            console.error('Error printing receipt:', error);
            toast.error('An error occurred while printing');
        }
    };

    if (loading) {
        return (
            <div className="wrapper theme-white-skin">
                <Header />
                <Sidebar />
                <div className="content-wrapper" style={{ minHeight: '850px' }}>
                    <section className="content">
                        <div className="text-center" style={{ padding: "100px" }}>
                            <Loader />
                        </div>
                    </section>
                </div>
                <Footer />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="wrapper theme-white-skin">
                <Header />
                <Sidebar />
                <div className="content-wrapper" style={{ minHeight: '850px' }}>
                    <div className="content">Student not found</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                {/* section content-header (empty in PHP) */}

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h3 className="box-title">Student Fees</h3>
                                        </div>
                                        <div className="col-md-8">
                                            <div className="btn-group pull-right">
                                                <Link to="/studentfee" className="btn btn-primary btn-xs">
                                                    <i className="fa fa-arrow-left"></i> Back
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-body" style={{ paddingTop: 0 }}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="sfborder-top-border">
                                                <div className="col-md-2">
                                                    <img
                                                        src={getImageUrl(student.image)}
                                                        className="img-responsive img-rounded img-thumbnail mt5 mb10"
                                                        alt="User"
                                                        style={{ width: '115px', height: '115px' }}
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
                                            <div style={{ background: '#dadada', height: '1px', width: '100%', clear: 'both', marginBottom: '10px' }}></div>
                                        </div>
                                    </div>



                                    {/* Action Buttons Row */}
                                    <div className="row no-print mb10">
                                        <div className="col-md-3 mDMb10">
                                            <div className="float-rtl-right float-left">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-info printSelected"
                                                    onClick={handlePrintSelected}
                                                >
                                                    <i className="fa fa-print"></i> Print Selected
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-warning collectSelected"
                                                    style={{ marginLeft: '5px' }}
                                                    onClick={handleCollectSelected}
                                                >
                                                    <i className="fa fa-money"></i> Collect Selected
                                                </button>
                                                {studentProcessingFee && (
                                                    <button
                                                        className="btn btn-sm btn-info getProcessingfees"
                                                        style={{ marginLeft: '5px' }}
                                                        onClick={handleProcessingFees}
                                                    >
                                                        <i className="fa fa-money"></i> Processing Fees
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-3 mDMb10">
                                            <div className="float-rtl-right">
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        name="payGroupofDiscount"
                                                        className="form-control"
                                                        id="payGroupofDiscount"
                                                        placeholder="Enter Discount Here"
                                                        value={discountAmount}
                                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4 mDMb10">
                                            <div className="float-rtl-right float-left">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-info addDiscountToGroups"
                                                    onClick={handlePayDiscount}
                                                >
                                                    <i className="fa fa-money"></i> Pay Discount
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary generatechallan"
                                                    style={{ marginLeft: '5px' }}
                                                    onClick={handleGenerateChallan}
                                                >
                                                    <i className="fa fa-money"></i> Generate Challan
                                                </button>
                                            </div>
                                        </div>

                                        <div className="col-md-2 mDMb10">
                                            <div className="float-rtl-right">
                                                <span className="pull-right pt5">Date: {new Date().toLocaleDateString('en-GB')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Old Fee Section (Conditional) */}
                                    {oldFee && (
                                        <div className="row" style={{ padding: '20px' }}>
                                            <div className="col-md-3">
                                                <div className="card text-center">
                                                    <div className="card-body">
                                                        <h5 className="card-title font-weight-bold">Old Fees</h5>
                                                        <p className="card-text">{currencySymbol} {amountFormat(oldFee.total_amount)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card text-center">
                                                    <div className="card-body">
                                                        <h5 className="card-title font-weight-bold">Fees Paid</h5>
                                                        <p className="card-text">{currencySymbol} {amountFormat(oldFee.total_paid_balence)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card text-center">
                                                    <div className="card-body">
                                                        <h5 className="card-title font-weight-bold">Fees Discount</h5>
                                                        <p className="card-text">{currencySymbol} {amountFormat(oldFee.total_fee_discount)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="card text-center">
                                                    <div className="card-body">
                                                        <h5 className="card-title font-weight-bold">Balance Fees</h5>
                                                        <p className={`card-text ${oldFee.total_balence_amount == 0 ? "text-success" : "text-danger"}`}>
                                                            {currencySymbol} {amountFormat(oldFee.total_balence_amount)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fee List Table */}
                                    <div className="table-responsive">
                                        <div className="download_label">
                                            Student Fees: {student.firstname} {student.lastname} ({student.admission_no})
                                        </div>
                                        <table className="table table-striped table-bordered table-hover example table-fixed-header">
                                            <thead className="header">
                                                <tr>
                                                    <th style={{ width: '10px' }}>
                                                        <input
                                                            type="checkbox"
                                                            id="select_all"
                                                            onChange={handleSelectAll}
                                                        />
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
                                                {/* Student Due Fees Loop */}
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
                                                                        {/* Checkbox: show if balance > 0 */}
                                                                        {balance > 0 && (
                                                                            <input
                                                                                type="checkbox"
                                                                                className="checkbox checkboxes"
                                                                                checked={isSelected}
                                                                                onChange={() => toggleFeeSelection(uniqueId, {
                                                                                    fee_session_group_id: group.fee_session_group_id || group.id || 0,
                                                                                    fee_master_id: fee.id,
                                                                                    fee_groups_feetype_id: fee.fee_groups_feetype_id,
                                                                                    fee_category: 'fees',
                                                                                    trans_fee_id: 0,
                                                                                    balance: balance,
                                                                                    groupName: group.name || 'Fee Group',
                                                                                    feeTypeName: fee.type || '',
                                                                                    feeTypeCode: fee.code || '',
                                                                                    fine_amount: fee.fine_amount_display || 0
                                                                                })}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td align="left" className="text-rtl-right">
                                                                        {fee.is_system ? `${fee.name} (${fee.type})` : `${fee.name} (${fee.type})`}
                                                                    </td>
                                                                    <td align="left" className="text-rtl-right">
                                                                        {fee.code}
                                                                    </td>
                                                                    <td align="left" className="text-left">
                                                                        {fee.due_date === "0000-00-00" ? "" : fee.due_date}
                                                                    </td>
                                                                    <td align="left" className="text-left width85">
                                                                        <span className={`label label-${statusLabel}`}>{status}</span>
                                                                    </td>
                                                                    <td className="text-right">
                                                                        {amountFormat(fee.amount)}
                                                                        {fee.fine_amount_display > 0 && (
                                                                            <span className="text text-danger detail_popover" title="Fine"> + {amountFormat(fee.fine_amount_display)}</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="text-left"></td>
                                                                    <td className="text-left"></td>
                                                                    <td className="text-left"></td>
                                                                    <td className="text-right">{amountFormat(fee.total_discount)}</td>
                                                                    <td className="text-right">{amountFormat(fee.total_fine)}</td>
                                                                    <td className="text-right">{amountFormat(fee.total_paid)}</td>
                                                                    <td className="text-right">
                                                                        {balance > 0 ? amountFormat(balance) : ""}
                                                                    </td>
                                                                    <td width="100">
                                                                        <div className="btn-group pull-right">
                                                                            {/* Plus button hidden as per request
                                                                            {balance > 0 && (
                                                                                <button
                                                                                    className="btn btn-xs btn-default myCollectFeeBtn"
                                                                                    title="Add Fees"
                                                                                    onClick={() => handleCollectFee(fee, 'fees')}
                                                                                >
                                                                                    <i className="fa fa-plus"></i>
                                                                                </button>
                                                                            )}
                                                                            */}
                                                                            <button
                                                                                className="btn btn-xs btn-default printInv"
                                                                                title="Print"
                                                                                onClick={() => handlePrintSingle(fee)}
                                                                            >
                                                                                <i className="fa fa-print"></i>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {/* Payment History Rows */}
                                                                {(fee.amount_detail || []).map((deposit, dIndex) => (
                                                                    <tr key={`dep-${dIndex}`} className="white-td">
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td className="text-right">
                                                                            <img src="https://newlayout.wisibles.com/backend/images/table-arrow.png" alt="" />
                                                                        </td>
                                                                        <td className="text-left">
                                                                            <a href="#" className="detail_popover" title={deposit.description || "No Description"}>{fee.student_fees_deposite_id}/{deposit.inv_no}</a>
                                                                        </td>
                                                                        <td className="text-left">{deposit.payment_mode}</td>
                                                                        <td className="text-left">{deposit.date}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_discount)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_fine)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount)}</td>
                                                                        <td></td>
                                                                        <td className="text-right">
                                                                            <div className="btn-group pull-right">
                                                                                <button
                                                                                    className="btn btn-default btn-xs"
                                                                                    title="Revert"
                                                                                    onClick={() => handleRevert({ ...deposit, student_fees_deposite_id: fee.student_fees_deposite_id })}
                                                                                >
                                                                                    <i className="fa fa-undo"></i>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        );
                                                    })
                                                )}

                                                {/* Transport Fees Loop */}
                                                {(transportFees || []).map((fee, feeIndex) => {
                                                    // Re-calculate balance locally for render check (though logic in fetchStudentFees should be robust)
                                                    let amountDetail = [];
                                                    try {
                                                        if (fee.amount_detail && typeof fee.amount_detail === 'string') {
                                                            amountDetail = JSON.parse(fee.amount_detail);
                                                        } else if (fee.amount_detail && typeof fee.amount_detail === 'object') {
                                                            amountDetail = Array.isArray(fee.amount_detail) ? fee.amount_detail : Object.values(fee.amount_detail);
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

                                                    const balance = parseFloat(fee.fees) - (feePaid + feeDiscount);
                                                    const status = balance <= 0 ? "Paid" : (amountDetail.length > 0 ? "Partial" : "Unpaid");
                                                    const statusLabel = status === 'Paid' ? 'success' : (status === 'Partial' ? 'warning' : 'danger');

                                                    // Calculate fine for display
                                                    let fineAmountDisplay = 0;
                                                    if (fee.due_date && fee.due_date !== "0000-00-00" && new Date(fee.due_date) < new Date()) {
                                                        fineAmountDisplay = parseFloat(fee.fine_amount || 0);
                                                        // Note: PHP has additional logic for fine_type='percentage' here if needed
                                                    }

                                                    const uniqueId = fee.uniqueId;
                                                    const isSelected = selectedFeesList.some(item => item.uniqueId === uniqueId);

                                                    return (
                                                        <React.Fragment key={uniqueId}>
                                                            <tr className={status === 'Paid' ? "dark-gray" : "danger font12"}>
                                                                <td>
                                                                    {balance > 0 && (
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox checkboxes"
                                                                            checked={isSelected}
                                                                            onChange={() => toggleFeeSelection(uniqueId, {
                                                                                fee_session_group_id: 0,
                                                                                fee_master_id: 0,
                                                                                fee_groups_feetype_id: 0,
                                                                                fee_category: 'transport',
                                                                                trans_fee_id: fee.id,
                                                                                balance: balance,
                                                                                groupName: 'Transport Fees',
                                                                                feeTypeName: fee.month || 'Transport',
                                                                                feeTypeCode: fee.month || '',
                                                                                fine_amount: fineAmountDisplay || 0
                                                                            })}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td align="left" className="text-rtl-right">Transport Fees</td>
                                                                <td align="left" className="text-rtl-right">{fee.month}</td>
                                                                <td align="left" className="text-left">{fee.due_date}</td>
                                                                <td align="left" className="text-left width85">
                                                                    <span className={`label label-${statusLabel}`}>{status}</span>
                                                                </td>
                                                                <td className="text-right">
                                                                    {amountFormat(fee.fees)}
                                                                    {fineAmountDisplay > 0 && (
                                                                        <span className="text text-danger detail_popover" title="Fine"> + {amountFormat(fineAmountDisplay)}</span>
                                                                    )}
                                                                </td>
                                                                <td className="text-left"></td>
                                                                <td className="text-left"></td>
                                                                <td className="text-left"></td>
                                                                <td className="text-right">{amountFormat(feeDiscount)}</td>
                                                                <td className="text-right">{amountFormat(feeFine)}</td>
                                                                <td className="text-right">{amountFormat(feePaid)}</td>
                                                                <td className="text-right">
                                                                    {balance > 0 ? amountFormat(balance) : ""}
                                                                </td>
                                                                <td width="100">
                                                                    <div className="btn-group pull-right">
                                                                        {balance > 0 && (
                                                                            <button
                                                                                className="btn btn-xs btn-default myCollectFeeBtn"
                                                                                title="Add Fees"
                                                                                onClick={() => handleCollectFee({
                                                                                    ...fee,
                                                                                    balance: balance,
                                                                                    amount: fee.fees
                                                                                }, 'transport')}
                                                                            >
                                                                                <i className="fa fa-plus"></i>
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            className="btn btn-xs btn-default printInv"
                                                                            title="Print"
                                                                            onClick={() => handlePrintSingle({ ...fee, category: 'transport' })}
                                                                        >
                                                                            <i className="fa fa-print"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {/* Transport Payment History */}
                                                            {
                                                                amountDetail.map((deposit, dIndex) => (
                                                                    <tr key={`trans-dep-${dIndex}`} className="white-td">
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td className="text-right">
                                                                            <img src="https://newlayout.wisibles.com/backend/images/table-arrow.png" alt="" />
                                                                        </td>
                                                                        <td className="text-left">
                                                                            <a href="#" className="detail_popover" title={deposit.description}>{fee.student_fees_deposite_id}/{deposit.inv_no}</a>
                                                                        </td>
                                                                        <td className="text-left">{deposit.payment_mode}</td>
                                                                        <td className="text-left">{deposit.date}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_discount)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount_fine)}</td>
                                                                        <td className="text-right">{amountFormat(deposit.amount)}</td>
                                                                        <td></td>
                                                                        <td className="text-right">
                                                                            <div className="btn-group pull-right">
                                                                                <button
                                                                                    className="btn btn-default btn-xs"
                                                                                    title="Revert"
                                                                                    onClick={() => handleRevert(deposit)}
                                                                                >
                                                                                    <i className="fa fa-undo"></i>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </React.Fragment>
                                                    );
                                                })}

                                                {/* Discount Fees Loop (Displayed at bottom) */}
                                                {(studentDiscountFee || []).map((discount, dIndex) => (
                                                    <tr key={`disc-${dIndex}`} className="dark-light">
                                                        <td></td>
                                                        <td align="left" className="text-rtl-right">Discount</td>
                                                        <td align="left" className="text-rtl-right">{discount.code}</td>
                                                        <td align="left"></td>
                                                        <td align="left" className="text-left">
                                                            {discount.status === 'applied' ? (
                                                                <a href="#" className="text text-success">
                                                                    Discount of {discount.type === 'percentage' ? `${discount.percentage}%` : `${currencySymbol}${amountFormat(discount.amount)}`} Applied : {discount.payment_id}
                                                                </a>
                                                            ) : (
                                                                <span className="text text-danger">
                                                                    Discount of {discount.type === 'percentage' ? `${discount.percentage}%` : `${currencySymbol}${amountFormat(discount.amount)}`} {discount.status}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td>
                                                            <div className="btn-group pull-right">
                                                                {discount.status === "applied" && (
                                                                    <button
                                                                        className="btn btn-default btn-xs"
                                                                        title="Revert"
                                                                        onClick={() => handleRevert(discount)}
                                                                    >
                                                                        <i className="fa fa-undo"></i>
                                                                    </button>
                                                                )}
                                                                <button className="btn btn-xs btn-default" title="Apply Discount">
                                                                    <i className="fa fa-check"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}

                                                <tr style={{ backgroundColor: '#f4f4f4', fontWeight: 'bold' }}>
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

                                    {/* Student Fee Receipts Table */}
                                    {feePayments && feePayments.length > 0 && (
                                        <div className="row" style={{ marginTop: '20px' }}>
                                            <div className="col-md-12">
                                                <h4 className="box-title">Student Fee Receipts</h4>
                                                <div className="table-responsive">
                                                    <table className="table table-striped table-bordered table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>S.No</th>
                                                                <th>Receipt No</th>
                                                                <th>Admission No</th>
                                                                <th>Name</th>
                                                                <th>Class</th>
                                                                <th>Reference No</th>
                                                                <th>Payment Date</th>
                                                                <th>Payment Mode</th>
                                                                <th>Fee Type</th>
                                                                <th>Amount ({currencySymbol})</th>
                                                                <th>Status</th>
                                                                <th>Description</th>
                                                                <th className="text-right">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {feePayments.map((payment, index) => (
                                                                <tr key={payment.id}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{`24/25-${String(payment.id).padStart(5, '0')}`}</td>
                                                                    <td>{payment.admission_no}</td>
                                                                    <td>
                                                                        {`${payment.firstname || ''} ${payment.middlename || ''} ${payment.lastname || ''}`.trim()}
                                                                    </td>
                                                                    <td>{payment.class} ({payment.section})</td>
                                                                    <td>{payment.reference_no}</td>
                                                                    <td>{new Date(payment.created_at).toLocaleDateString('en-GB')}</td>
                                                                    <td>{payment.mode}</td>
                                                                    <td>{payment.fee_types}</td>
                                                                    <td>{currencySymbol}{amountFormat(payment.amount)}</td>
                                                                    <td>
                                                                        {payment.status == 1 ? (
                                                                            <span className="label label-danger">Cancel</span>
                                                                        ) : (
                                                                            <span className="label label-success">Active</span>
                                                                        )}
                                                                    </td>
                                                                    <td>{payment.description}</td>
                                                                    <td className="text-right">
                                                                        <div className="pull-right" style={{ display: 'flex', gap: '5px' }}>
                                                                            <button
                                                                                className="btn btn-xs btn-default"
                                                                                onClick={() => handlePrintReceipt(payment)}
                                                                                title="Print"
                                                                            >
                                                                                <i className="fa fa-print"></i>
                                                                            </button>
                                                                            {payment.status !== '1' && (
                                                                                <button
                                                                                    className="btn btn-xs btn-default"
                                                                                    onClick={() => handleCancelInvoiceClick(payment)}
                                                                                    title="Disable"
                                                                                >
                                                                                    <i className="fa fa-times"></i>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div >
            <Footer />
            <StudentCollectFeeModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                student={student}
                feeData={selectedFee}
                onSuccess={fetchStudentFees}
            />
            <ApplyDiscountModal
                show={showDiscountModal}
                handleClose={() => setShowDiscountModal(false)}
                student={student}
                feeData={selectedFee}
                onSuccess={fetchStudentFees}
            />
            <CancelInvoiceModal
                show={showCancelModal}
                handleClose={() => { setShowCancelModal(false); setSelectedPaymentToCancel(null); }}
                payment={selectedPaymentToCancel}
                onSuccess={fetchStudentFees}
            />
        </div >
    );
};

export default StudentAddFee;
