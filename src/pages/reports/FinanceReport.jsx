import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { copyToClipboard, downloadCSV, downloadExcel, printTable, downloadPDF } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const FinanceReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const [activeReport, setActiveReport] = useState(location.state?.activeReport || 'Daily Collection Report');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearched, setIsSearched] = useState(false);
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const [dailyCollectionData, setDailyCollectionData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [detailData, setDetailData] = useState([]);
    const [selectedDateDetails, setSelectedDateDetails] = useState(null);
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [feeTypeList, setFeeTypeList] = useState([]);
    const [paymentTypes, setPaymentTypes] = useState({});
    const [balanceFeesData, setBalanceFeesData] = useState([]);
    const [balanceFeesHeaders, setBalanceFeesHeaders] = useState([]);
    const [noDueData, setNoDueData] = useState([]);
    const [onlineFeesData, setOnlineFeesData] = useState([]);
    const [dayCollectionData, setDayCollectionData] = useState([]);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                await api.getFinancePageData();
            } catch (error) {
                console.error('Error fetching finance page data:', error);
            }
        };
        fetchPageData();
    }, []);

    useEffect(() => {
        if (activeReport === 'Daily Collection Report') {
            const fetchDailyCollection = async () => {
                try {
                    await api.getDailyCollectionReport();
                } catch (error) {
                    console.error('Error fetching daily collection report:', error);
                }
            };
            fetchDailyCollection();
        }
    }, [activeReport]);

    useEffect(() => {
        if (activeReport === 'Balance Fees Report') {
            const fetchBalanceFeesData = async () => {
                try {
                    const response = await api.getStudentAcademicReport();
                    if (response?.status && response?.data) {
                        setClassList(response.data.classlist || []);
                        setFeeTypeList(response.data.fee_typeList || []);
                        setPaymentTypes(response.data.payment_type || {});
                    }
                } catch (error) {
                    console.error('Error fetching balance fees report data:', error);
                }
            };
            fetchBalanceFeesData();
        }
    }, [activeReport]);

    // Form filter states
    useEffect(() => {
        if (activeReport === 'No Due Certificate') {
            const fetchNoDueData = async () => {
                try {
                    const response = await api.getStudentAcademicFeeReceipt();
                    if (response?.status && response?.classlist) {
                        setClassList(response.classlist || []);
                    }
                } catch (error) {
                    console.error('Error fetching No Due Certificate data:', error);
                }
            };
            fetchNoDueData();
        }
    }, [activeReport]);

    useEffect(() => {
        if (activeReport === 'Online Fees Collection Report') {
            const fetchOnlineFeesData = async () => {
                try {
                    const response = await api.getOnlineFeesReport();
                    if (response?.status && response?.searchlist) {
                        setPaymentTypes(response.searchlist || {});
                    }
                } catch (error) {
                    console.error('Error fetching Online Fees Collection Report data:', error);
                }
            };
            fetchOnlineFeesData();
        }
    }, [activeReport]);

    useEffect(() => {
        if (activeReport === 'Day Collection Report') {
            const fetchDayCollectionData = async () => {
                try {
                    await api.getReportDayCollection();
                } catch (error) {
                    console.error('Error fetching Day Collection Report data:', error);
                }
            };
            fetchDayCollectionData();
        }
    }, [activeReport]);

    useEffect(() => {
        if (activeReport === 'Student Day Sheet Report') {
            const fetchStudentDaySheetInitial = async () => {
                try {
                    const response = await api.getStudentDayAcademicReport();
                    if (response?.status && response?.classlist) {
                        setClassList(response.classlist);
                    }
                } catch (error) {
                    console.error('Error fetching Student Day Sheet initial data:', error);
                }
            };
            fetchStudentDaySheetInitial();
        }
    }, [activeReport]);

    // Form filter states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');

    const handleClassChange = async (e) => {
        const selectedClassId = e.target.value;
        setClassId(selectedClassId);
        setSectionId(''); // Reset section when class changes
        setSectionList([]);

        if (selectedClassId) {
            try {
                const response = await api.getSectionsByClass(selectedClassId);
                if (response?.status && response?.data) {
                    setSectionList(response.data); // Assuming response.data is the array of sections
                } else if (Array.isArray(response)) {
                    setSectionList(response);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    const [searchType, setSearchType] = useState('today');
    const [studentId, setStudentId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchDuration, setSearchDuration] = useState('today');
    const [collectBy, setCollectBy] = useState('');
    const [groupBy, setGroupBy] = useState('');
    const [incomeHead, setIncomeHead] = useState('');
    const [expenseHead, setExpenseHead] = useState('');
    const [selectedFeeGroups, setSelectedFeeGroups] = useState([]);
    const [showFeeGroupDropdown, setShowFeeGroupDropdown] = useState(false);
    const [studentDaySheetData, setStudentDaySheetData] = useState([]);
    const [studentDaySheetHeaders, setStudentDaySheetHeaders] = useState([]);

    const financeReports = [
        [/* "Balance Fees Statement", */ "Daily Collection Report" /*, "Fees Statement" */],
        ["Balance Fees Report", "No Due Certificate" /*, "Fees Collection Report" */],
        ["Online Fees Collection Report" /*, "Balance Fees Report With Remark", "Income Report" */],
        [/* "Expense Report", "Payroll Report", "Income Group Report" */],
        [/* "Expense Group Report", "Online Admission Fees Collection Report", */ "Day Collection Report"],
        ["Student Day Sheet Report"]
    ];

    const defaultBalanceFeesHeaders = ["S.No.", "Ad no", "Student Name", "Father Name", "Father Phone", "Admission Fee", "Pending Amount(₹)"];

    const reportConfigs = {
        'Balance Fees Statement': {
            filters: ['class', 'section'],
            headers: ["Fees Group", "Fees Code", "Due Date", "Status", "Amount (₹)", "Payment ID", "Mode", "Date", "Discount (₹)", "Fine (₹)", "Paid (₹)", "Balance (₹)"],
            showStudentInfo: true,
            hidePagination: true,
            hideHeaderIcons: true,
            hideSearch: true,
            showPrintPurple: true
        },
        'Daily Collection Report': {
            filters: ['date_from', 'date_to'],
            headers: ["Date", "Total Transactions", "Amount", "Action"]
        },
        'Fees Statement': {
            filters: ['class', 'section', 'student'],
            headers: ["Fees Group", "Fees Code", "Due Date", "Status", "Amount", "Payment ID", "Mode", "Date", "Discount", "Fine", "Paid", "Balance"],
            showProfile: true,
            hidePagination: true
        },
        'Balance Fees Report': {
            filters: ['class', 'section', 'fees_group', 'search_type'],
            headers: balanceFeesHeaders.length > 0 ? balanceFeesHeaders : defaultBalanceFeesHeaders,
            hideLeftPrint: true,
            showExcelPrintOnly: true
        },
        'No Due Certificate': {
            filters: ['class', 'section'],
            headers: ["Admission No", "Student Name", "Class", "Section", "Balance"],
        },
        'Fees Collection Report': {
            filters: ['search_duration', 'class', 'section', 'collect_by', 'group_by'],
            headers: ["S. No", "Date", "Admission No", "Name", "Class", "Fee Type", "Collect By", "Mode", "Paid (₹)", "Discount (₹)", "Fine (₹)", "Total (₹)"],
            hidePrint: true,
            showExcelPrintOnly: true
        },
        'Online Fees Collection Report': {
            filters: ['search_type'],
            headers: ["Payment ID", "Date", "Admission No", "Name", "Class", "Fee Type", "Mode", "Amount (₹)", "Discount (₹)", "Fine (₹)", "Total (₹)"],
            hideLeftPrint: true
        },
        'Balance Fees Report With Remark': {
            filters: ['class', 'section'],
            headers: ["Student Name (Admission No)", "Class", "Fees", "Amount (₹)", "Paid (₹)", "Balance (₹)", "Guardian Phone", "Remark"],
            hideLeftPrint: true,
            hideSearch: true,
            hideHeaderIcons: true
        },
        'Income Report': {
            filters: ['search_type'],
            headers: ["Name", "Invoice Number", "Income Head", "Date", "Amount (₹)"],
            hideLeftPrint: true
        },
        'Expense Report': {
            filters: ['search_type'],
            headers: ["Date", "Expense Head", "Name", "Invoice Number", "Amount (₹)"],
            hideLeftPrint: true
        },
        'Payroll Report': {
            filters: ['search_type'],
            headers: ["Name", "Role", "Designation", "Month - Year", "Payslip #", "Basic Salary (₹)", "Earning (₹)", "Deduction (₹)", "Gross Salary (₹)", "Tax (₹)", "Net Salary (₹)"]
        },
        'Income Group Report': {
            filters: ['search_type', 'search_income_head'],
            headers: ["Income Head", "Income ID", "Name", "Date", "Invoice Number", "Amount (₹)"]
        },
        'Expense Group Report': {
            filters: ['search_type', 'search_expense_head'],
            headers: ["Expense Head", "Expense ID", "Name", "Date", "Invoice Number", "Amount (₹)"]
        },
        'Online Admission Fees Collection Report': {
            filters: ['search_type'],
            headers: ["Transaction ID", "Date", "Student Name", "Class", "Amount"]
        },
        'Day Collection Report': {
            filters: ['date_from', 'date_to'],
            headers: ["S.No", "Admission No", "Student Name", "Class", "Receipt No", "Reference No", "Mode", "Amount (₹)", "Payment Date", "Collected By", "Fee Type"]
        },
        'Student Day Sheet Report': {
            filters: ['date_from', 'date_to', 'class', 'section'],
            headers: studentDaySheetHeaders.length > 0 ? studentDaySheetHeaders : ["S No", "Class", "Student Name", "Payment ID", "July", "TEST", "SEP", "FEB", "DEC", "AUG", "Previous Session Balance", "OCT", "NOV", "JAN", "MAR", "hostel1", "uniform", "Total Fees", "Mode", "Collected By"]
        }
    };

    const currentConfig = reportConfigs[activeReport] || { filters: ['class', 'section'], headers: ["S.No", "Description", "Amount"] };

    const rawMockData = useMemo(() => [
        { sno: 1, fees_group: 'NURSERY (July)', fees_code: 'JLTF', due_date: '', status: 'Unpaid', amount: 15000.00, amount_extra: '', payment_id: '', mode: '', date: '', discount: 0.00, fine: 0.00, paid: 0.00, balance: 15000.00, pending: '15000.00', student_name: 'NANDHU', admission_no: '1005', class: 'Nursery', section: 'A', father_name: 'Said Hussainpeer Khadri' },
        { sno: 2, fees_group: 'NURSERY (AUG)', fees_code: 'ATF', due_date: '', status: 'Unpaid', amount: 150.00, amount_extra: '', payment_id: '', mode: '', date: '', discount: 0.00, fine: 0.00, paid: 0.00, balance: 150.00, pending: '150.00' },
        { sno: 3, fees_group: 'NURSERY (JAN)', fees_code: 'JTF', due_date: '', status: 'Unpaid', amount: 10000.00, amount_extra: '', payment_id: '', mode: '', date: '', discount: 0.00, fine: 0.00, paid: 0.00, balance: 10000.00, pending: '10000.00' },
        { sno: 4, fees_group: 'NURSERY (TEST)', fees_code: 'TEST', due_date: '', status: 'Unpaid', amount: 1.00, amount_extra: '', payment_id: '', mode: '', date: '', discount: 0.00, fine: 0.00, paid: 0.00, balance: 1.00, pending: '1.00' },
        { sno: 5, fees_group: 'NURSERY (TEST)', fees_code: 'TEST', due_date: '', status: 'Unpaid', amount: 150000.00, amount_extra: '', payment_id: '', mode: '', date: '', discount: 0.00, fine: 0.00, paid: 0.00, balance: 150000.00, pending: '150000.00' },
        { sno: 6, date_col: '13/02/2026', total_transactions: 4, total: 222.00, action: 'View' },
        { sno: 7, date_col: '14/02/2026', total_transactions: 0, total: 0.00, action: 'View' },
        { sno: 8, date_col: '15/02/2026', total_transactions: 0, total: 0.00, action: 'View' },
        { sno: 9, date_col: '16/02/2026', total_transactions: 0, total: 0.00, action: 'View' },
        { sno: 10, date_col: '17/02/2026', total_transactions: 0, total: 0.00, action: 'View' },
        { sno: 11, date_col: '18/02/2026', total_transactions: 0, total: 0.00, action: 'View' },
        { sno: 12, date_col: '19/02/2026', total_transactions: 0, total: 0.00, action: 'View' },
        { sno: 13, date_col: '20/02/2026', total_transactions: 0, total: 0.00, action: 'View' }

    ], []);

    const displayData = useMemo(() => {
        let currentData = [];
        if (activeReport === 'Daily Collection Report' && isSearched) {
            currentData = dailyCollectionData || [];
        } else if (activeReport === 'Balance Fees Report' && isSearched) {
            currentData = balanceFeesData || [];
        } else if (activeReport === 'No Due Certificate' && isSearched) {
            currentData = noDueData || [];
        } else if (activeReport === 'Online Fees Collection Report' && isSearched) {
            currentData = onlineFeesData || [];
        } else if (activeReport === 'Day Collection Report' && isSearched) {
            if (dayCollectionData && typeof dayCollectionData === 'object' && !Array.isArray(dayCollectionData)) {
                currentData = Object.values(dayCollectionData).flat();
            } else {
                currentData = dayCollectionData || [];
            }
        } else if (activeReport === 'Student Day Sheet Report' && isSearched) {
            currentData = studentDaySheetData || [];
        } else {
            currentData = rawMockData || [];
        }

        return Array.isArray(currentData) ? currentData : Object.values(currentData);
    }, [activeReport, isSearched, dailyCollectionData, balanceFeesData, noDueData, onlineFeesData, dayCollectionData, studentDaySheetData, rawMockData]);

    const filteredData = useMemo(() => {
        return displayData.filter(row => {
            if (!searchTerm) return true;
            const searchStr = searchTerm.toLowerCase();
            const fullName = `${row.firstname || ''} ${row.lastname || ''}`.trim();
            const alternateName = row.name || row.student_name || '';

            return (
                (alternateName.toLowerCase().includes(searchStr)) ||
                (fullName.toLowerCase().includes(searchStr)) ||
                (row.admission_no && row.admission_no.toLowerCase().includes(searchStr)) ||
                (row.fees_group && row.fees_group.toLowerCase().includes(searchStr)) ||
                (row.payment_id && row.payment_id.toLowerCase().includes(searchStr)) ||
                (row.reference_no && row.reference_no.toLowerCase().includes(searchStr)) ||
                (row.collected_by && row.collected_by.toLowerCase().includes(searchStr)) ||
                (row.receipt_no && row.receipt_no.toLowerCase().includes(searchStr)) ||
                (row.id && String(row.id).toLowerCase().includes(searchStr))
            );
        });
    }, [searchTerm, displayData]);

    const filteredDayCollectionGrouped = useMemo(() => {
        if (activeReport !== 'Day Collection Report') return null;
        const grouped = {};
        filteredData.forEach(row => {
            const mode = row.mode || 'Other';
            if (!grouped[mode]) grouped[mode] = [];
            grouped[mode].push(row);
        });
        return grouped;
    }, [filteredData, activeReport]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => ({
            amount: (acc.amount || 0) + parseFloat(curr.amount || 0),
            discount: (acc.discount || 0) + parseFloat(curr.discount || curr.amount_discount || 0),
            fine: (acc.fine || 0) + parseFloat(curr.fine || curr.amount_fine || 0),
            paid: (acc.paid || 0) + parseFloat(curr.paid || 0),
            balance: (acc.balance || 0) + parseFloat(curr.balance || 0),
            total: (acc.total || 0) + (parseFloat(curr.total || 0) || (parseFloat(curr.amount || 0) + parseFloat(curr.amount_fine || 0))),
            net: (acc.net || 0) + parseFloat(curr.net || 0),
            basic: (acc.basic || 0) + parseFloat(curr.basic || 0),
            earning: (acc.earning || 0) + parseFloat(curr.earning || 0),
            deduction: (acc.deduction || 0) + parseFloat(curr.deduction || 0),
            gross: (acc.gross || 0) + parseFloat(curr.gross || 0),
            tax: (acc.tax || 0) + parseFloat(curr.tax || 0),
            pending: (acc.pending || 0) + (parseFloat(curr.pending) || 0)
        }), { amount: 0, discount: 0, fine: 0, paid: 0, balance: 0, total: 0, net: 0, basic: 0, earning: 0, deduction: 0, gross: 0, tax: 0, pending: 0 });
    }, [filteredData]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeReport, isSearched, searchTerm, filteredData.length]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleReportClick = (report) => {
        setActiveReport(report);
        setSearchTerm('');
        setIsSearched(false);
        setHiddenColumns([]);
        setShowColumnsDropdown(false);

        // Clear all filter selections per user request
        setClassId('');
        setSectionId('');
        setSearchType('today');
        setStudentId('');
        setDateFrom('');
        setDateTo('');
        setSearchDuration('today');
        setCollectBy('');
        setGroupBy('');
        setIncomeHead('');
        setExpenseHead('');
        setSelectedFeeGroups([]);

        // Clear all data arrays
        setDailyCollectionData([]);
        setBalanceFeesData([]);
        setNoDueData([]);
        setOnlineFeesData([]);
        setDayCollectionData([]);
        setStudentDaySheetData([]);
    };

    // Export helpers for finance reports
    const getRowValue = (header, row, index) => {
        const maps = {
            'Daily Collection Report': {
                'Date': (r) => r.date_col,
                'Total Transactions': (r) => r.total_transactions,
                'Amount': (r) => r.total,
                'Action': (r) => 'View'
            },
            'Balance Fees Report': {
                'S.No.': (r, i) => i + 1,
                'Ad no': (r) => r.admission_no,
                'Student Name': (r) => r.name,
                'Father Name': (r) => r.father_name,
                'Father Phone': (r) => r.father_phone,
                'Total': (r) => r.totalfee,
                'Deposit': (r) => r.deposit,
                'Discount': (r) => r.discount,
                'Fine': (r) => r.fine,
                'Balance': (r) => r.balance
            },
            'No Due Certificate': {
                'Admission No': (r) => r.admission_no,
                'Student Name': (r) => r.name,
                'Class': (r) => r.class,
                'Section': (r) => r.section,
                'Balance': (r) => r.balance
            },
            'Online Fees Collection Report': {
                'Payment ID': (r) => r.id,
                'Date': (r) => r.date,
                'Admission No': (r) => r.admission_no,
                'Name': (r) => `${r.firstname} ${r.lastname}`,
                'Class': (r) => `${r.class} (${r.section})`,
                'Fee Type': (r) => r.type,
                'Mode': (r) => r.payment_mode,
                'Amount (₹)': (r) => r.amount,
                'Discount (₹)': (r) => r.amount_discount,
                'Fine (₹)': (r) => r.amount_fine,
                'Total (₹)': (r) => parseFloat(r.amount || 0) + parseFloat(r.amount_fine || 0)
            },
            'Day Collection Report': {
                'S.No': (r, i) => i + 1,
                'Admission No': (r) => r.admission_no,
                'Student Name': (r) => `${r.firstname} ${r.lastname}`,
                'Class': (r) => `${r.class} (${r.section})`,
                'Receipt No': (r) => r.id,
                'Reference No': (r) => r.reference_no,
                'Mode': (r) => r.mode,
                'Amount (₹)': (r) => r.amount,
                'Payment Date': (r) => r.created_at || r.date,
                'Collected By': (r) => r.collected_by,
                'Fee Type': (r) => r.fee_types
            },
            'Student Day Sheet Report': {
                'S No': (r, i) => i + 1,
                'Admission No': (r) => r.admission_no,
                'Class': (r) => `${r.class} (${r.section})`,
                'Student Name': (r) => `${r.firstname} ${r.lastname || ''}`.trim(),
                'Payment ID': (r) => `${r.id}/${r.inv_no}`,
                'Total Fees': (r) => r.amount,
                'Mode': (r) => r.payment_mode,
                'Collected By': (r) => r.received_byname?.name
            },
            'Balance Fees Statement': {
                'Fees Group': (r) => r.fees_group,
                'Fees Code': (r) => r.fees_code,
                'Due Date': (r) => r.due_date,
                'Status': (r) => r.status,
                'Amount (₹)': (r) => r.amount,
                'Payment ID': (r) => r.payment_id,
                'Mode': (r) => r.mode,
                'Date': (r) => r.date,
                'Discount (₹)': (r) => r.discount,
                'Fine (₹)': (r) => r.fine,
                'Paid (₹)': (r) => r.paid,
                'Balance (₹)': (r) => r.balance
            },
            'Fees Statement': {
                'Fees Group': (r) => r.fees_group,
                'Fees Code': (r) => r.fees_code,
                'Due Date': (r) => r.due_date,
                'Status': (r) => r.status,
                'Amount': (r) => r.amount,
                'Payment ID': (r) => r.payment_id,
                'Mode': (r) => r.mode,
                'Date': (r) => r.date,
                'Discount': (r) => r.discount,
                'Fine': (r) => r.fine,
                'Paid': (r) => r.paid,
                'Balance': (r) => r.balance
            },
            'Income Report': {
                'Name': (r) => r.student_name,
                'Invoice Number': (r) => r.invoice_no,
                'Income Head': (r) => r.income_head,
                'Date': (r) => r.date,
                'Amount (₹)': (r) => r.amount
            },
            'Expense Report': {
                'Date': (r) => r.date,
                'Expense Head': (r) => r.fee_type,
                'Name': (r) => r.student_name,
                'Invoice Number': (r) => r.invoice_no,
                'Amount (₹)': (r) => r.amount
            },
            'Payroll Report': {
                'Name': (r) => r.student_name,
                'Role': (r) => r.role,
                'Designation': (r) => r.designation,
                'Month - Year': (r) => r.month_year,
                'Payslip #': (r) => r.payslip,
                'Basic Salary (₹)': (r) => r.basic,
                'Earning (₹)': (r) => r.earning,
                'Deduction (₹)': (r) => r.deduction,
                'Gross Salary (₹)': (r) => r.gross,
                'Tax (₹)': (r) => r.tax,
                'Net Salary (₹)': (r) => r.net
            },
            'Income Group Report': {
                'Income Head': (r) => r.income_head,
                'Income ID': (r) => r.income_id,
                'Name': (r) => r.student_name,
                'Date': (r) => r.date,
                'Invoice Number': (r) => r.invoice_no,
                'Amount (₹)': (r) => r.amount
            },
            'Expense Group Report': {
                'Expense Head': (r) => r.fee_type,
                'Expense ID': (r) => r.expense_id,
                'Name': (r) => r.student_name,
                'Date': (r) => r.date,
                'Invoice Number': (r) => r.invoice_no,
                'Amount (₹)': (r) => r.amount
            }
        };

        const reportMap = maps[activeReport];
        if (reportMap && reportMap[header]) {
            return reportMap[header](row, index);
        }

        // Fallback for dynamic headers in Student Day Sheet Report
        if (activeReport === 'Student Day Sheet Report' && row.feetypePaidAmount?.[header] !== undefined) {
            return row.feetypePaidAmount[header];
        }

        // Fallback for dynamic headers in Balance Fees Report
        if (activeReport === 'Balance Fees Report') {
            return row[header] || row[header.toLowerCase()] || row[header.toUpperCase()] || '0';
        }

        return row[header] || '-';
    };

    const getExportData = () => {
        const allHeaders = currentConfig.headers || [];
        const headers = allHeaders.filter((_, idx) => !hiddenColumns.includes(idx));
        const rows = filteredData.map((row, index) =>
            allHeaders
                .map((h, hIdx) => ({ value: getRowValue(h, row, index), index: hIdx }))
                .filter(item => !hiddenColumns.includes(item.index))
                .map(item => String(item.value ?? ''))
        );
        return { headers, rows };
    };
    const handleExport = (action) => {
        const { headers, rows } = getExportData();
        if (action === 'copy') copyToClipboard(headers, rows);
        if (action === 'excel') downloadExcel(headers, rows, `${activeReport}.xls`);
        if (action === 'csv') downloadCSV(headers, rows, `${activeReport}.csv`);
        if (action === 'pdf') downloadPDF(headers, rows, `${activeReport}.pdf`, activeReport);
        if (action === 'print') printTable(headers, rows, activeReport);
    };

    const handleModalExport = (action) => {
        if (!detailData || detailData.length === 0) return;

        const headers = ['Date', 'Admission No', 'Name', 'Father Name', 'Class', 'Payment Mode', 'Payment ID', 'Collected By', 'Fine', 'Amount', 'Total'];

        const filtered = detailData.filter(student => {
            if (!modalSearchTerm) return true;
            const term = modalSearchTerm.toLowerCase();
            const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
            const classSection = `${student.class} (${student.section})`.toLowerCase();

            if (student.admission_no?.toLowerCase().includes(term) ||
                fullName.includes(term) ||
                student.father_name?.toLowerCase().includes(term) ||
                classSection.includes(term)) {
                return true;
            }

            try {
                let amountDetail = typeof student.amount_detail === 'string' ? JSON.parse(student.amount_detail) : student.amount_detail;
                amountDetail = Object.values(amountDetail)[0] || {};

                if (amountDetail.payment_mode?.toLowerCase().includes(term) ||
                    amountDetail.hidden_trans_id?.toLowerCase().includes(term) ||
                    amountDetail.inv_no?.toLowerCase().includes(term) ||
                    amountDetail.collected_by?.toLowerCase().includes(term)) {
                    return true;
                }
            } catch (e) { }
            return false;
        });

        const rows = filtered.map(student => {
            let amountDetail = {};
            try {
                amountDetail = typeof student.amount_detail === 'string' ? JSON.parse(student.amount_detail) : student.amount_detail;
                amountDetail = Object.values(amountDetail)[0] || {};
            } catch (e) { }

            const fine = parseFloat(amountDetail.amount_fine || 0);
            const amount = parseFloat(amountDetail.amount || 0);
            const total = amount + fine;

            let detailDate = amountDetail.date || '';
            if (detailDate && detailDate.includes('-')) {
                const [y, m, d] = detailDate.split('-');
                detailDate = `${d}/${m}/${y}`;
            }

            // Explicitly map columns based on headers: ['Date', 'Admission No', 'Name', 'Father Name', 'Class', 'Payment Mode', 'Payment ID', 'Collected By', 'Fine', 'Amount', 'Total']
            return [
                detailDate,
                student.admission_no,
                `${student.firstname} ${student.lastname}`.trim(),
                student.father_name,
                `${student.class} (${student.section})`,
                amountDetail.payment_mode,
                `${student.student_fees_deposite_id}/${amountDetail.inv_no}`,
                amountDetail.collected_by,
                fine.toFixed(2),
                amount.toFixed(2),
                total.toFixed(2)
            ].map(v => String(v ?? ''));
        });

        const grandTotal = filtered.reduce((acc, student) => {
            try {
                let amountDetail = typeof student.amount_detail === 'string' ? JSON.parse(student.amount_detail) : student.amount_detail;
                amountDetail = Object.values(amountDetail)[0] || {};
                return acc + parseFloat(amountDetail.amount || 0) + parseFloat(amountDetail.amount_fine || 0);
            } catch (e) { return acc; }
        }, 0);

        rows.push(['', '', '', '', '', '', '', 'Grand Total', '', '', grandTotal.toFixed(2)]);

        const filename = `Collection_List_${selectedDateDetails?.date_col?.replace(/\//g, '_') || 'Details'}`;

        if (action === 'copy') copyToClipboard(headers, rows);
        if (action === 'excel') downloadExcel(headers, rows, `${filename}.xls`);
        if (action === 'csv') downloadCSV(headers, rows, `${filename}.csv`);
        if (action === 'pdf') downloadPDF(headers, rows, `${filename}.pdf`, `Collection List - ${selectedDateDetails?.date_col}`);
        if (action === 'print') printTable(headers, rows, `Collection List - ${selectedDateDetails?.date_col}`);
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (activeReport === 'Daily Collection Report') {
            try {
                // Determine formatted date strings based on input type
                // If date input is type="date", value is YYYY-MM-DD
                // API expects DD/MM/YYYY
                const formatDate = (dateStr) => {
                    if (!dateStr) return '';
                    const [year, month, day] = dateStr.split('-');
                    return `${day}/${month}/${year}`;
                };

                const payload = {
                    date_from: formatDate(dateFrom),
                    date_to: formatDate(dateTo)
                };

                const response = await api.searchDailyCollectionReport(payload);

                if (response?.status && response?.data?.fees_data) {
                    const feesData = response.data.fees_data;
                    const dataArray = [];
                    const feesDataMap = {};

                    // Helper to format date as DD/MM/YYYY
                    const formatToDDMMYYYY = (dateObj) => {
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const year = dateObj.getFullYear();
                        return `${day}/${month}/${year}`;
                    };

                    // Map API data by date string for easy lookup
                    Object.entries(feesData).forEach(([timestamp, data]) => {
                        const dateObj = new Date(parseInt(timestamp) * 1000);
                        const dateStr = formatToDDMMYYYY(dateObj);
                        feesDataMap[dateStr] = { ...data, original_timestamp: timestamp };
                    });

                    // Helper to create date object from YYYY-MM-DD (from input)
                    const createDate = (dateStr) => {
                        if (!dateStr) return new Date();
                        const [year, month, day] = dateStr.split('-').map(Number);
                        return new Date(year, month - 1, day);
                    };

                    const start = createDate(dateFrom);
                    const end = createDate(dateTo);

                    // Iterate from start to end date inclusive
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        const dateStr = formatToDDMMYYYY(d);
                        const data = feesDataMap[dateStr] || { count: 0, amount: 0 };

                        dataArray.push({
                            date_col: dateStr,
                            total_transactions: data.count,
                            total: data.amount,
                            action: 'View',
                            original_timestamp: data.original_timestamp, // Store original timestamp
                            fees_ids: data.student_fees_deposite_ids ? data.student_fees_deposite_ids.join(',') : ''
                        });
                    }
                    setDailyCollectionData(dataArray);
                } else {
                    setDailyCollectionData([]);
                }
            } catch (error) {
                console.error('Error searching daily collection report:', error);
                setDailyCollectionData([]);
            }
        }

        if (activeReport === 'Balance Fees Report') {
            try {
                let feeGroupPayload = [];
                if (selectedFeeGroups.length > 0) {
                    feeGroupPayload = selectedFeeGroups.map(id => parseInt(id));
                } else {
                    // If no fee group selected, send all available IDs
                    feeGroupPayload = feeTypeList.map(f => parseInt(f.id));
                }

                const payload = {
                    search_type: searchType, // 'balance', 'paid', 'all' are values from paymentTypes
                    class_id: parseInt(classId),
                    section_id: parseInt(sectionId),
                    feegroup: feeGroupPayload
                };

                const response = await api.searchStudentAcademicReport(payload);

                if (response?.status && response?.data) {
                    const { students, feeTypes } = response.data;

                    // Update headers dynamically
                    // Default headers: S.No, Ad no, Name, Father Name, Father Phone ... [Dynamic Fee Types] ... Total
                    const baseHeaders = ["S.No.", "Ad no", "Student Name", "Father Name", "Father Phone"];
                    const dynamicHeaders = feeTypes || []; // Array of strings like "July", "AUG"
                    const endHeaders = ["Total", "Deposit", "Discount", "Fine", "Balance"];

                    setBalanceFeesHeaders([...baseHeaders, ...dynamicHeaders, ...endHeaders]);

                    // Flatten student data
                    // students is object: { "Class 1 ( A )": [ studentObj, ... ] }
                    let flattenedStudents = [];
                    if (students && typeof students === 'object') {
                        Object.values(students).forEach(classStudents => {
                            if (Array.isArray(classStudents)) {
                                flattenedStudents = [...flattenedStudents, ...classStudents];
                            }
                        });
                    }
                    setBalanceFeesData(flattenedStudents);
                    setIsSearched(true);
                } else {
                    setBalanceFeesData([]);
                    setIsSearched(true);
                }
            } catch (error) {
                console.error('Error searching balance fees report:', error);
                setBalanceFeesData([]);
                setIsSearched(true);
            }
        }


        if (activeReport === 'No Due Certificate') {
            try {
                const payload = {
                    class_id: parseInt(classId),
                    section_id: parseInt(sectionId),
                    due_date: new Date().toISOString().split('T')[0]
                };
                const response = await api.searchStudentAcademicFeeReceipt(payload);
                if (response?.status && response?.result) {
                    const result = response.result;
                    let flattenedStudents = [];
                    if (result && typeof result === 'object') {
                        Object.values(result).forEach(classStudents => {
                            if (Array.isArray(classStudents)) {
                                flattenedStudents = [...flattenedStudents, ...classStudents];
                            }
                        });
                    }
                    setNoDueData(flattenedStudents);
                } else {
                    setNoDueData([]);
                }
            } catch (error) {
                console.error('Error searching No Due Certificate:', error);
                setNoDueData([]);
            }
        }

        if (activeReport === 'Online Fees Collection Report') {
            try {
                const payload = {
                    search_type: searchType
                };
                const response = await api.searchOnlineFeesReport(payload);
                if (response?.status && response?.data) {
                    const data = response.data;
                    setOnlineFeesData(Array.isArray(data) ? data : Object.values(data));
                } else {
                    setOnlineFeesData([]);
                }
            } catch (error) {
                console.error('Error searching Online Fees Collection Report:', error);
                setOnlineFeesData([]);
            }
        }

        if (activeReport === 'Day Collection Report') {
            try {
                const formatDate = (dateStr) => {
                    if (!dateStr) return '';
                    const [year, month, day] = dateStr.split('-');
                    return `${day}/${month}/${year}`;
                };

                const payload = {
                    date_from: formatDate(dateFrom),
                    date_to: formatDate(dateTo)
                };
                const response = await api.searchReportDayCollection(payload);
                if (response?.status && response?.fees_data) {
                    setDayCollectionData(response.fees_data);
                } else {
                    setDayCollectionData([]);
                }
            } catch (error) {
                console.error('Error searching Day Collection Report:', error);
                setDayCollectionData([]);
            }
        }

        if (activeReport === 'Student Day Sheet Report') {
            if (!classId || !dateFrom || !dateTo) {
                toast.error('Please select Class and Date Range');
                return;
            }
            if (!sectionId) {
                toast.error('Section is required');
                return;
            }

            try {
                // Ensure format DD/MM/YYYY
                const formatDateSlash = (dateStr) => {
                    if (!dateStr) return '';
                    const [year, month, day] = dateStr.split('-');
                    return `${day}/${month}/${year}`;
                };

                const payload = {
                    class_id: parseInt(classId),
                    section_id: parseInt(sectionId),
                    date_from: formatDateSlash(dateFrom),
                    date_to: formatDateSlash(dateTo)
                };

                const response = await api.searchStudentDayAcademicReport(payload);

                if (response?.status) {
                    // 1. Process headers
                    // Static: S.No, Admission No, Student Name, Class, Payment ID
                    const staticHeadersStart = ["S.No", "Admission No", "Student Name", "Class", "Payment ID"];
                    const dynamicHeaders = response.feeTypes || [];
                    const staticHeadersEnd = ["Total", "Mode", "Collected By"];
                    setStudentDaySheetHeaders([...staticHeadersStart, ...dynamicHeaders, ...staticHeadersEnd]);

                    // 2. Process data
                    // Response data is object keyed by ID. We flatten it.
                    let flattenedData = [];
                    if (response.data && typeof response.data === 'object') {
                        flattenedData = Object.values(response.data);
                    }
                    setStudentDaySheetData(flattenedData);
                } else {
                    setStudentDaySheetData([]);
                    // alert(response?.message || 'No data found');
                }
            } catch (error) {
                console.error('Error searching Student Day Sheet Report:', error);
                setStudentDaySheetData([]);
            }
        }

        setIsSearched(true);
    };

    const handleViewClick = async (row) => {
        if (!row.fees_ids) {
            alert('No transactions to view.');
            return;
        }

        try {
            // Use stored original_timestamp if available, otherwise calculate
            let timestamp = row.original_timestamp;
            if (!timestamp) {
                const [day, month, year] = row.date_col.split('/').map(Number);
                timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000);
            }

            const payload = {
                date: timestamp,
                fees_id: row.fees_ids
            };

            const response = await api.getDailyCollectionDetail(payload);
            if (response?.status && response?.data?.student_list) {
                setDetailData(response.data.student_list);
                setSelectedDateDetails(row);
                setModalSearchTerm(''); // Reset search term when opening modal
                setShowModal(true);
            } else {
                alert('No details found.');
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            alert('Failed to fetch details.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setDetailData([]);
        setSelectedDateDetails(null);
        setModalSearchTerm('');
    };

    const renderDetailTable = () => {
        if (!detailData || detailData.length === 0) return <p>No data available</p>;

        let grandTotal = 0;

        return (
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Admission No</th>
                            <th>Name</th>
                            <th>Father Name</th>
                            <th>Class</th>
                            <th>Payment Mode</th>
                            <th>Payment ID</th>
                            <th>Collected By</th>
                            <th className="text-right">Fine</th>
                            <th className="text-right">Amount</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailData.filter(student => {
                            if (!modalSearchTerm) return true;
                            const term = modalSearchTerm.toLowerCase();
                            const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
                            const classSection = `${student.class} (${student.section})`.toLowerCase();

                            // Check student fields
                            if (student.admission_no?.toLowerCase().includes(term) ||
                                fullName.includes(term) ||
                                student.father_name?.toLowerCase().includes(term) ||
                                classSection.includes(term)) {
                                return true;
                            }

                            // Check amount_detail fields if possible
                            // Note: amount_detail parsing happens inside map, so we might need to parse here or just filter mainly on student info
                            // To be thorough, let's try to parse
                            try {
                                let amountDetail = typeof student.amount_detail === 'string' ? JSON.parse(student.amount_detail) : student.amount_detail;
                                amountDetail = Object.values(amountDetail)[0] || {};

                                if (amountDetail.payment_mode?.toLowerCase().includes(term) ||
                                    amountDetail.hidden_trans_id?.toLowerCase().includes(term) || // payment id often here
                                    amountDetail.inv_no?.toLowerCase().includes(term) ||
                                    amountDetail.collected_by?.toLowerCase().includes(term)) {
                                    return true;
                                }
                            } catch (e) {
                                // ignore parse error during filter
                            }

                            return false;
                        }).map((student, index) => {
                            let amountDetail = {};
                            try {
                                amountDetail = typeof student.amount_detail === 'string' ? JSON.parse(student.amount_detail) : student.amount_detail;
                                amountDetail = Object.values(amountDetail)[0] || {};
                            } catch (e) {
                                console.error("Error parsing amount_detail", e);
                            }

                            const fine = parseFloat(amountDetail.amount_fine || 0);
                            const amount = parseFloat(amountDetail.amount || 0);
                            const total = amount + fine;
                            grandTotal += total;

                            // Format detail date from YYYY-MM-DD to DD/MM/YYYY if present
                            let detailDate = amountDetail.date || '';
                            if (detailDate && detailDate.includes('-')) {
                                const [y, m, d] = detailDate.split('-');
                                detailDate = `${d}/${m}/${y}`;
                            }

                            return (
                                <tr key={index}>
                                    <td>{detailDate}</td>
                                    <td>{student.admission_no}</td>
                                    <td>{`${student.firstname} ${student.lastname}`.trim()}</td>
                                    <td>{student.father_name}</td>
                                    <td>{`${student.class} (${student.section})`}</td>
                                    <td>{amountDetail.payment_mode}</td>
                                    <td>{`${student.student_fees_deposite_id}/${amountDetail.inv_no}`}</td>
                                    <td>{amountDetail.collected_by}</td>
                                    <td className="text-right">₹{fine.toFixed(2)}</td>
                                    <td className="text-right">₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="text-right">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td colSpan="9" className="text-right"><strong>Grand Total</strong></td>
                            <td colSpan="2" className="text-right"><strong>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const renderRow = (row, index) => {
        const cells = [];
        if (activeReport === 'Balance Fees Statement' || activeReport === 'Fees Statement') {
            cells.push(
                <td className="text-left" key="0">{row.fees_group}</td>,
                <td className="text-left" key="1">{row.fees_code}</td>,
                <td className="text-left" key="2">{row.due_date}</td>,
                <td className="text-left" key="3"><span className={`label ${row.status === 'Paid' ? 'label-success' : row.status === 'Partial' ? 'label-warning' : 'label-danger'}`}>{row.status}</span></td>,
                <td className="text-right" key="4">
                    {(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {row.amount_extra && <span style={{ color: 'red' }}>{row.amount_extra}</span>}
                </td>,
                <td className="text-left" key="5">{row.payment_id}</td>,
                <td className="text-left" key="6">{row.mode}</td>,
                <td className="text-left" key="7">{row.date}</td>,
                <td className="text-right" key="8">{(row.discount || 0).toFixed(2)}</td>,
                <td className="text-right" key="9">{(row.fine || 0).toFixed(2)}</td>,
                <td className="text-right" key="10">{(row.paid || 0).toFixed(2)}</td>,
                <td className="text-right" key="11">{(row.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            );
        } else if (activeReport === 'Student Day Sheet Report') {
            const dynamicHeaders = studentDaySheetHeaders.length > 8 ? studentDaySheetHeaders.slice(5, studentDaySheetHeaders.length - 3) : [];
            cells.push(
                <td key="0">{index + 1}</td>,
                <td key="1">{row.admission_no}</td>,
                <td key="2">{`${row.firstname} ${row.lastname || ''}`.trim()}</td>,
                <td key="3">{row.class} ({row.section})</td>,
                <td key="4">{row.id}/{row.inv_no}</td>,
                ...dynamicHeaders.map((header, dIdx) => (
                    <td key={5 + dIdx}>{parseFloat(row.feetypePaidAmount?.[header] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                )),
                <td key={5 + dynamicHeaders.length}>{parseFloat(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>,
                <td key={6 + dynamicHeaders.length}>{row.payment_mode}</td>,
                <td key={7 + dynamicHeaders.length}>{row.received_byname?.name}</td>
            );
        } else if (activeReport === 'Daily Collection Report') {
            cells.push(
                <td className="text-center" key="0">{row.date_col}</td>,
                <td className="text-center" key="1">{row.total_transactions || 0}</td>,
                <td className="text-center" key="2">₹{(row.total || 0).toFixed(2)}</td>,
                <td className="text-center" key="3">
                    <i className="fa fa-eye" style={{ color: '#9429b8', cursor: 'pointer' }} onClick={() => handleViewClick(row)}></i>
                </td>
            );
        } else if (activeReport === 'Balance Fees Report') {
            const dynamicBalanceHeaders = currentConfig.headers.slice(5, currentConfig.headers.length - 5);
            cells.push(
                <td className="text-left" key="0">{index + 1}</td>,
                <td className="text-left" key="1">{row.admission_no}</td>,
                <td className="text-left" key="2">{row.name}</td>,
                <td className="text-left" key="3">{row.father_name}</td>,
                <td className="text-left" key="4">{row.father_phone}</td>,
                ...dynamicBalanceHeaders.map((header, i) => (
                    <td key={5 + i} className="text-right">
                        {(row[header] || row[header.toLowerCase()] || row[header.toUpperCase()] || 0).toString()}
                    </td>
                )),
                <td className="text-right" key={5 + dynamicBalanceHeaders.length}>{(row.totalfee || 0).toFixed(2)}</td>,
                <td className="text-right" key={6 + dynamicBalanceHeaders.length}>{(row.deposit || 0).toFixed(2)}</td>,
                <td className="text-right" key={7 + dynamicBalanceHeaders.length}>{(row.discount || 0).toFixed(2)}</td>,
                <td className="text-right" key={8 + dynamicBalanceHeaders.length}>{(row.fine || 0).toFixed(2)}</td>,
                <td className="text-right" key={9 + dynamicBalanceHeaders.length}>{(row.balance || 0).toFixed(2)}</td>
            );
        } else if (activeReport === 'No Due Certificate') {
            cells.push(
                <td className="text-left" key="0">{row.admission_no}</td>,
                <td className="text-left" key="1">{row.name}</td>,
                <td className="text-left" key="2">{row.class}</td>,
                <td className="text-left" key="3">{row.section}</td>,
                <td className="text-right" key="4">{(row.balance || 0).toFixed(2)}</td>
            );
        } else if (activeReport === 'Online Fees Collection Report') {
            cells.push(
                <td className="text-left" key="0">{row.id}</td>,
                <td className="text-left" key="1">{row.date}</td>,
                <td className="text-left" key="2">{row.admission_no}</td>,
                <td className="text-left" key="3">{`${row.firstname} ${row.lastname}`}</td>,
                <td className="text-left" key="4">{`${row.class} (${row.section})`}</td>,
                <td className="text-left" key="5">{row.type}</td>,
                <td className="text-left" key="6">{row.payment_mode}</td>,
                <td className="text-right" key="7">{(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>,
                <td className="text-right" key="8">{(row.amount_discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>,
                <td className="text-right" key="9">{(row.amount_fine || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>,
                <td className="text-right" key="10">{(parseFloat(row.amount || 0) + parseFloat(row.amount_fine || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            );
        } else if (activeReport === 'Day Collection Report') {
            cells.push(
                <td className="text-left" key="0">{index + 1}</td>,
                <td className="text-left" key="1">{row.admission_no}</td>,
                <td className="text-left" key="2">{`${row.firstname} ${row.lastname}`}</td>,
                <td className="text-left" key="3">{`${row.class} (${row.section})`}</td>,
                <td className="text-left" key="4">{row.id}</td>,
                <td className="text-left" key="5">{row.reference_no}</td>,
                <td className="text-left" key="6">{row.mode}</td>,
                <td className="text-right" key="7">{(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>,
                <td className="text-left" key="8">{row.created_at || row.date}</td>,
                <td className="text-left" key="9">{row.collected_by}</td>,
                <td className="text-left" key="10">{row.fee_types}</td>
            );
        } else if (activeReport === 'Balance Fees Report With Remark') {
            cells.push(
                <td className="text-left" key="0">{row.student_name} ({row.admission_no})</td>,
                <td className="text-left" key="1">{row.class}</td>,
                <td className="text-left" key="2">{row.fees_group}</td>,
                <td className="text-right" key="3">{(row.amount || 0).toFixed(2)}</td>,
                <td className="text-right" key="4">{(row.paid || 0).toFixed(2)}</td>,
                <td className="text-right" key="5">{(row.balance || 0).toFixed(2)}</td>,
                <td className="text-left" key="6">{row.guardian_phone}</td>,
                <td className="text-left" key="7">{row.remark}</td>
            );
        } else if (activeReport === 'Income Report') {
            cells.push(
                <td className="text-left" key="0">{row.student_name}</td>,
                <td className="text-left" key="1">{row.invoice_no}</td>,
                <td className="text-left" key="2">{row.income_head}</td>,
                <td className="text-left" key="3">{row.date}</td>,
                <td className="text-right" key="4">{(row.amount || 0).toFixed(2)}</td>
            );
        } else if (activeReport === 'Expense Report') {
            cells.push(
                <td className="text-left" key="0">{row.date}</td>,
                <td className="text-left" key="1">{row.fee_type}</td>,
                <td className="text-left" key="2">{row.student_name}</td>,
                <td className="text-left" key="3">{row.invoice_no}</td>,
                <td className="text-right" key="4">{(row.amount || 0).toFixed(2)}</td>
            );
        } else if (activeReport === 'Payroll Report') {
            cells.push(
                <td className="text-left" key="0">{row.student_name}</td>,
                <td className="text-left" key="1">{row.role}</td>,
                <td className="text-left" key="2">{row.designation}</td>,
                <td className="text-left" key="3">{row.month_year}</td>,
                <td className="text-left" key="4">{row.payslip}</td>,
                <td className="text-right" key="5">{(row.basic || 0).toFixed(2)}</td>,
                <td className="text-right" key="6">{(row.earning || 0).toFixed(2)}</td>,
                <td className="text-right" key="7">{(row.deduction || 0).toFixed(2)}</td>,
                <td className="text-right" key="8">{(row.gross || 0).toFixed(2)}</td>,
                <td className="text-right" key="9">{(row.tax || 0).toFixed(2)}</td>,
                <td className="text-right" key="10">{(row.net || 0).toFixed(2)}</td>
            );
        } else if (activeReport === 'Income Group Report') {
            cells.push(
                <td className="text-left" key="0">{row.income_head}</td>,
                <td className="text-left" key="1">{row.income_id}</td>,
                <td className="text-left" key="2">{row.student_name}</td>,
                <td className="text-left" key="3">{row.date}</td>,
                <td className="text-left" key="4">{row.invoice_no}</td>,
                <td className="text-right" key="5">{(row.amount || 0).toFixed(2)}</td>
            );
        } else if (activeReport === 'Expense Group Report') {
            cells.push(
                <td className="text-left" key="0">{row.fee_type}</td>,
                <td className="text-left" key="1">{row.expense_id}</td>,
                <td className="text-left" key="2">{row.student_name}</td>,
                <td className="text-left" key="3">{row.date}</td>,
                <td className="text-left" key="4">{row.invoice_no}</td>,
                <td className="text-right" key="5">{(row.amount || 0).toFixed(2)}</td>
            );
        } else if (activeReport === 'Fees Collection Report') {
            cells.push(
                <td className="text-center" key="0">{index + 1}</td>,
                <td className="text-center" key="1">{row.date}</td>,
                <td className="text-center" key="2">{row.admission_no}</td>,
                <td className="text-center" key="3">{row.student_name}</td>,
                <td className="text-center" key="4">{row.class}</td>,
                <td className="text-center" key="5">{row.fee_type}</td>,
                <td className="text-center" key="6">{row.collected_by}</td>,
                <td className="text-center" key="7">{row.mode}</td>,
                <td className="text-center" key="8">₹{(row.paid || 0).toFixed(2)}</td>,
                <td className="text-center" key="9">₹{(row.discount || 0).toFixed(2)}</td>,
                <td className="text-center" key="10">₹{(row.fine || 0).toFixed(2)}</td>,
                <td className="text-center" key="11">₹{(row.total || 0).toFixed(2)}</td>
            );
        } else {
            cells.push(
                <td className="text-center" key="0">{index + 1}</td>,
                <td className="text-center" key="1">{row.description || row.student_name}</td>,
                <td className="text-center" key="2">{row.amount || row.balance}</td>
            );
        }
        return cells.filter((_, idx) => !hiddenColumns.includes(idx));
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            {/* Modal for Daily Collection Details */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        width: isMobile ? '98%' : '90%',
                        maxWidth: '1200px',
                        maxHeight: isMobile ? '95vh' : '90vh',
                        overflowY: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        padding: isMobile ? '12px' : '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: isMobile ? '14px' : '18px' }}>Collection List</h4>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <div><strong>Collection Date: </strong> {selectedDateDetails?.date_col}</div>
                        </div>
                        <div
                            className="row mb-2"
                            style={{
                                marginBottom: '10px',
                                display: isMobile ? 'flex' : 'block',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'center' : 'stretch',
                                gap: isMobile ? '15px' : '0'
                            }}
                        >
                            <div
                                className={isMobile ? '' : 'col-sm-6'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: isMobile ? '15px' : '20px',
                                    justifyContent: isMobile ? 'center' : 'flex-start',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <div className="dataTables_filter">
                                    <input
                                        type="search"
                                        className="form-control input-sm"
                                        placeholder="Search..."
                                        style={{
                                            marginLeft: isMobile ? '0' : '10px',
                                            display: 'inline-block',
                                            width: '180px',
                                            border: 'none',
                                            borderBottom: '1px solid #ccc',
                                            borderRadius: '0',
                                            boxShadow: 'none',
                                            backgroundColor: 'transparent',
                                            paddingLeft: '0',
                                            outline: 'none',
                                            textAlign: isMobile ? 'center' : 'left'
                                        }}
                                        value={modalSearchTerm}
                                        onChange={(e) => setModalSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={isMobile ? 'text-center' : 'col-sm-6 text-right'}>
                                <div className="dt-buttons btn-group" style={{ float: 'right' }}>
                                    <button className="btn btn-default btn-sm" title="Copy" onClick={() => handleModalExport('copy')} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                        <i className="fa fa-files-o"></i>
                                    </button>
                                    <button className="btn btn-default btn-sm" title="Excel" onClick={() => handleModalExport('excel')}>
                                        <i className="fa fa-file-excel-o"></i>
                                    </button>
                                    <button className="btn btn-default btn-sm" title="CSV" onClick={() => handleModalExport('csv')}>
                                        <i className="fa fa-file-text-o"></i>
                                    </button>
                                    <button className="btn btn-default btn-sm" title="PDF" onClick={() => handleModalExport('pdf')}>
                                        <i className="fa fa-file-pdf-o"></i>
                                    </button>
                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => handleModalExport('print')} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                        <i className="fa fa-print"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {renderDetailTable()}
                    </div>
                </div>
            )}
            <style>{`
                .content-wrapper { background: #f4f4f4; padding: 0px; margin-top: 0px; }
                .main-report-box { 
                    background: #fff; 
                    border-radius: 4px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
                    padding: 15px;
                    overflow: hidden;
                    flex: 1;
                }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
                .page-header h3 { margin: 0; font-size: 19px; font-weight: 400; color: #333; }
                
                .reportlists { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: transparent; border: none; margin-bottom: 15px; }
                .reportlists li { background: #fff; list-style: none; border: none; margin: 0; }
                .reportlists li a { 
                    color: #333; 
                    text-decoration: none; 
                    display: flex; 
                    align-items: center; 
                    padding: 8px 10px; 
                    font-size: 13px; 
                    transition: all 0.2s; 
                    border: none;
                    cursor: pointer;
                    background: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .reportlists li a.active { background-color: #e2f0ff !important; color: #000; font-weight: 500; }

                .select-criteria-header { font-size: 17px; font-weight: 500; padding: 10px 0; border-bottom: 1px solid #eee; margin-bottom: 10px; color: #333; border-top: 1px solid #eee; margin-top: 15px; }
                .filters-area { margin-bottom: 20px; }
                
                .form-control {
                    width: 100%;
                    border: none !important;
                    border-bottom: 1px solid #d2d6de !important;
                    border-radius: 0;
                    box-shadow: none !important;
                    background: transparent;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    height: 28px;
                    font-size: 12.5px;
                }
                .form-control:focus { border-bottom: 1px solid #3c8dbc !important; outline: none !important; }
                .form-group label { font-size: 12px; font-weight: 600; color: #444; margin-bottom: 5px; display: block; }
                .req { color: red; margin-left: 2px; }

                .box-profile { border: 1px solid #eee; padding: 15px; border-radius: 4px; background: #fafafa; margin-bottom: 15px; display: flex; gap: 20px; }
                .profile-pic { width: 100px; height: 100px; background: #eee; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .profile-pic img { width: 100%; height: 100%; object-fit: cover; }
                .profile-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px; flex-grow: 1; }
                .profile-column { display: grid; grid-template-rows: repeat(4, auto); gap: 8px; }
                .profile-item b { margin-right: 5px; }

                .dt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; width: 100%; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                .dt-buttons { display: flex; gap: 2px; }
                .dt-button { padding: 2px 6px; border: none; background: transparent; font-size: 14px; color: #333; cursor: pointer; }
                .dt-button:hover { background: #f9f9f9; color: #000; }

                .dt-search { position: relative; }
                .dt-search input { 
                    border: none; 
                    border-bottom: 1px solid #d2d6de; 
                    padding: 4px 6px; 
                    font-size: 13px; 
                    width: 180px; 
                    outline: none;
                    background: transparent;
                }

                .table-responsive { overflow-x: auto; margin-bottom: 10px; scrollbar-width: thin; }
                .table-custom { width: 100%; border-collapse: collapse; }
                .table-custom th, .table-custom td { 
                    box-sizing: border-box; 
                    padding: 12px 20px; 
                    white-space: nowrap;
                    vertical-align: middle;
                }
                .table-custom th { 
                    border-bottom: 2px solid #eee; 
                    font-size: 13px; 
                    font-weight: 600; 
                    color: #444; 
                    background: #fff; 
                    text-align: left; /* Default, overridden by .text-right */
                    position: relative;
                }
                .table-custom td { 
                    border-bottom: 1px solid #f2f2f2; 
                    font-size: 13px; 
                    color: #555; 
                }
                .table-custom tr:hover { background: #f9f9f9; }

                .total-row { background: #fdfdfd; font-weight: bold; border-top: 2px solid #eee; }

                .pagination-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 10px; color: #444; border-top: 1px solid #eee; padding-top: 4px; }
                .pagination-list { display: flex; list-style: none; padding: 0; margin: 0; gap: 0; }
                .pagination-list li { border: 1px solid #ddd; padding: 0px 4px; cursor: pointer; background: transparent; font-size: 9px; }
                .pagination-list li.active { background: #9429b8; color: #fff; border-color: #9429b8; }
                .pagination-list li:hover:not(.active) { background: #f4f4f4; }

                .btn-purple { background-color: #9429b8; border-color: #9429b8; color: #fff !important; padding: 10px 24px; border-radius: 20px; font-size: 13px; border: none !important; outline: none !important; box-shadow: none !important; cursor: pointer; transition: 0.3s; }
                .btn-purple:hover { background-color: #7b2199; }
                
                .btn-back { background-color: #9429b8; border-color: #9429b8; color: #fff !important; padding: 10px 24px; border-radius: 20px; font-size: 13px; border: none; cursor: pointer; transition: 0.3s; }
                .btn-back:hover { background-color: #7b2199; }

                .label { padding: 3px 8px; border-radius: 3px; font-size: 11px; color: #fff; font-weight: 500; }
                .label-success { background: #00a65a; }
                .label-danger { background: #dd4b39; }
                .label-warning { background: #f39c12; }
                .text-right { text-align: right; padding-right: 15px !important; }
                .text-left { text-align: left; }
                .text-center { text-align: center !important; }
                .table-custom td { text-align: center !important; }

                .pagination-list li.active { background: transparent !important; color: #9429b8 !important; border-color: #9429b8 !important; font-weight: bold; }
                .pagination-wrapper { font-size: 11px; }
                .pagination-list li { padding: 3px 10px; font-size: 12px; }

                .student-details-oneline { display: flex; justify-content: space-between; font-size: 13px; color: #333; margin-bottom: 25px; padding: 10px 0; border-top: 1px solid #f4f4f4; border-bottom: 1px solid #f4f4f4; }
                .student-details-oneline span b { margin-right: 8px; color: #555; }
                
                .btn-print-purple { background: #9429b8; color: #fff !important; border: none; padding: 10px 24px; border-radius: 20px; font-size: 13px; cursor: pointer; transition: 0.3s; margin-bottom: 15px; display: inline-flex; align-items: center; gap: 8px; }
                .btn-print-purple:hover { background: #7b2199; }

                /* Mobile responsive styles */
                @media (max-width: 767px) {
                    .reportlists { grid-template-columns: 1fr !important; gap: 4px; }
                    .reportlists li a { font-size: 12px; padding: 10px 12px; white-space: normal; }
                    .filters-area .row { flex-direction: column !important; gap: 10px !important; }
                    .filters-area .row > div { flex: 1 1 100% !important; width: 100% !important; }
                    .select-criteria-header { font-size: 15px; text-align: center; }
                    .table-custom td, .table-custom th { font-size: 12px; padding: 6px 8px !important; }
                    .student-details-oneline { flex-direction: column; gap: 5px; }
                    .box-profile { flex-direction: column; align-items: center; }
                    .profile-grid { grid-template-columns: 1fr; }
                }

                @media print {
                    .no-print { display: none !important; }
                    .content-wrapper { padding: 0; margin: 0; }
                    .main-report-box { box-shadow: none; }
                }
            `}</style>

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content" style={{ overflow: 'visible' }}>
                    <div className="main-report-box" style={{ overflow: 'visible' }}>
                        <div className="page-header no-print">
                            <h3>Finance</h3>
                            <button onClick={() => navigate(-1)} className="btn-back">
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>

                        <ul className="reportlists no-print">
                            {financeReports.flat().map((report, idx) => (
                                <li key={idx}>
                                    <a className={activeReport === report ? "active" : ""} onClick={(e) => { e.preventDefault(); handleReportClick(report); }}>
                                        <i className="fa fa-file-text-o"></i> {report}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <form onSubmit={handleSearch} className="no-print">
                            <div className="select-criteria-header">Select Criteria</div>
                            <div className="filters-area" style={{ overflow: 'visible' }}>
                                <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                    {currentConfig.filters.includes('date_from') && (
                                        <div style={{ flex: (activeReport === 'Daily Collection Report' || activeReport === 'Day Collection Report') ? '0 0 400px' : (activeReport === 'Student Day Sheet Report' ? '1 1 200px' : '0 0 150px') }}><div className="form-group"><label>Date From <span className="req">*</span></label><input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required /></div></div>
                                    )}
                                    {currentConfig.filters.includes('date_to') && (
                                        <div style={{ flex: (activeReport === 'Daily Collection Report' || activeReport === 'Day Collection Report') ? '0 0 400px' : (activeReport === 'Student Day Sheet Report' ? '1 1 200px' : '0 0 150px') }}><div className="form-group"><label>Date To <span className="req">*</span></label><input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required /></div></div>
                                    )}
                                    {currentConfig.filters.includes('class') && (
                                        <div style={{ flex: activeReport === 'Student Day Sheet Report' ? '1 1 20%' : '1 1 200px' }}><div className="form-group"><label>Class <span className="req">*</span></label><select className="form-control" value={classId} onChange={handleClassChange} required><option value="">Select</option>{classList.length > 0 ? classList.map(cls => (<option key={cls.id} value={cls.id}>{cls.class}</option>)) : (<><option value="1">Class 1</option><option value="2">Class 2</option></>)}</select></div></div>
                                    )}
                                    {currentConfig.filters.includes('section') && (
                                        <div style={{ flex: activeReport === 'Student Day Sheet Report' ? '1 1 20%' : '1 1 200px' }}><div className="form-group"><label>Section {activeReport === 'Student Day Sheet Report' && <span className="req">*</span>}</label><select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)} required={activeReport === 'Student Day Sheet Report'}><option value="">Select</option>{sectionList.map(sec => (<option key={sec.id} value={sec.section_id || sec.id}>{sec.section}</option>))}</select></div></div>
                                    )}
                                    {currentConfig.filters.includes('student') && (
                                        <div style={{ flex: '1 1 200px' }}><div className="form-group"><label>Student <span className="req">*</span></label><select className="form-control" value={studentId} onChange={(e) => setStudentId(e.target.value)} required><option value="">Select</option><option value="1001">SAI (1001)</option><option value="1005">NANDHU (1005)</option></select></div></div>
                                    )}
                                    {currentConfig.filters.includes('search_type') && (
                                        <div style={{ flex: '0 0 400px' }}><div className="form-group"><label>Search Type <span className="req">*</span></label><select className="form-control" value={searchType} onChange={(e) => setSearchType(e.target.value)} required>{Object.keys(paymentTypes).length > 0 ? Object.entries(paymentTypes).map(([key, val]) => (<option key={key} value={key}>{val}</option>)) : (<><option value="today">Today</option><option value="month">This Month</option></>)}</select></div></div>
                                    )}
                                    {currentConfig.filters.includes('search_duration') && (
                                        <div style={{ flex: '1 1 200px' }}><div className="form-group"><label>Search Duration <span className="req">*</span></label><select className="form-control" value={searchDuration} onChange={(e) => setSearchDuration(e.target.value)} required><option value="today">Today</option></select></div></div>
                                    )}
                                    {currentConfig.filters.includes('collect_by') && (
                                        <div style={{ flex: '1 1 200px' }}><div className="form-group"><label>Collect By</label><select className="form-control" value={collectBy} onChange={(e) => setCollectBy(e.target.value)}><option value="">Select</option><option value="admin">Admin</option></select></div></div>
                                    )}
                                    {currentConfig.filters.includes('group_by') && (
                                        <div style={{ flex: '1 1 200px' }}><div className="form-group"><label>Group By</label><select className="form-control" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}><option value="">Select</option><option value="date">Date</option></select></div></div>
                                    )}
                                    {currentConfig.filters.includes('fees_group') && (
                                        <div style={{ flex: '1 1 200px', position: 'relative' }}>
                                            <div className="form-group">
                                                <label>Fees Group</label>
                                                <div
                                                    className="form-control"
                                                    onClick={() => setShowFeeGroupDropdown(!showFeeGroupDropdown)}
                                                    style={{ cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                                                >
                                                    {selectedFeeGroups.length > 0
                                                        ? `${selectedFeeGroups.length} Selected`
                                                        : 'Select Fees Group'}
                                                </div>
                                                {showFeeGroupDropdown && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        right: 0,
                                                        zIndex: 9999,
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #ccc',
                                                        maxHeight: '200px',
                                                        overflowY: 'auto',
                                                        padding: '10px',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFeeGroups.length === feeTypeList.length && feeTypeList.length > 0}
                                                                onChange={() => {
                                                                    if (selectedFeeGroups.length === feeTypeList.length) {
                                                                        setSelectedFeeGroups([]);
                                                                    } else {
                                                                        setSelectedFeeGroups(feeTypeList.map(f => f.id));
                                                                    }
                                                                }}
                                                                style={{ marginRight: '8px' }}
                                                            />
                                                            <label style={{ margin: 0, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => {
                                                                if (selectedFeeGroups.length === feeTypeList.length) {
                                                                    setSelectedFeeGroups([]);
                                                                } else {
                                                                    setSelectedFeeGroups(feeTypeList.map(f => f.id));
                                                                }
                                                            }}>
                                                                Select All
                                                            </label>
                                                        </div>
                                                        {feeTypeList.map(fee => (
                                                            <div key={fee.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedFeeGroups.includes(fee.id)}
                                                                    onChange={() => {
                                                                        setSelectedFeeGroups(prev => {
                                                                            if (prev.includes(fee.id)) {
                                                                                return prev.filter(id => id !== fee.id);
                                                                            } else {
                                                                                return [...prev, fee.id];
                                                                            }
                                                                        });
                                                                    }}
                                                                    style={{ marginRight: '8px' }}
                                                                />
                                                                <label style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }} onClick={() => {
                                                                    setSelectedFeeGroups(prev => {
                                                                        if (prev.includes(fee.id)) {
                                                                            return prev.filter(id => id !== fee.id);
                                                                        } else {
                                                                            return [...prev, fee.id];
                                                                        }
                                                                    });
                                                                }}>
                                                                    {fee.type}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {currentConfig.filters.includes('search_income_head') && (
                                        <div style={{ flex: '0 0 400px' }}><div className="form-group"><label>Search Income Head</label><select className="form-control" value={incomeHead} onChange={(e) => setIncomeHead(e.target.value)}><option value="">Select</option></select></div></div>
                                    )}
                                    {currentConfig.filters.includes('search_expense_head') && (
                                        <div style={{ flex: '0 0 400px' }}><div className="form-group"><label>Search Expense Head</label><select className="form-control" value={expenseHead} onChange={(e) => setExpenseHead(e.target.value)}><option value="">Select</option></select></div></div>
                                    )}
                                    <div style={{ alignSelf: 'flex-end', marginBottom: '5px' }}>
                                        <button type="submit" className="btn-purple"><i className="fa fa-search"></i> Search</button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {isSearched && (
                            <div className="animate-in fade-in duration-300">
                                <div className="select-criteria-header" style={{ marginTop: '20px' }}>
                                    {activeReport}
                                    <div style={{ flex: 1 }}></div>
                                </div>

                                {currentConfig.showPrintPurple && !currentConfig.hideLeftPrint && (
                                    <button className="btn-print-purple no-print" onClick={() => window.print()}>
                                        <i className="fa fa-print"></i> Print
                                    </button>
                                )}

                                {activeReport === 'Balance Fees Report With Remark' && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }} className="no-print">
                                        <button className="btn-purple" onClick={() => window.print()} style={{ borderRadius: '20px', padding: '8px 20px' }}>
                                            <i className="fa fa-print"></i> Print
                                        </button>
                                    </div>
                                )}

                                {currentConfig.showStudentInfo && (
                                    <div className="student-details-oneline">
                                        <span><b>Admission No:</b> 1005</span>
                                        <span><b>Name:</b> NANDHU</span>
                                        <span><b>Father Name:</b> Said Hussainpeer Khadri</span>
                                        <span><b>Class (Section):</b> Nursery (A)</span>
                                    </div>
                                )}

                                {currentConfig.showProfile && (
                                    <div className="box-profile">
                                        <div className="profile-pic">
                                            <i className="fa fa-user" style={{ fontSize: '40px', color: '#ccc' }}></i>
                                        </div>
                                        <div className="profile-grid">
                                            <div className="profile-column">
                                                <div className="profile-item"><b>Name:</b> SAI</div>
                                                <div className="profile-item"><b>Father Name:</b> P. RAMA RAO</div>
                                                <div className="profile-item"><b>Mobile No:</b> 9876543210</div>
                                                <div className="profile-item"><b>Category:</b> General</div>
                                            </div>
                                            <div className="profile-column">
                                                <div className="profile-item"><b>Class:</b> Class 1</div>
                                                <div className="profile-item"><b>Admission No:</b> 1001</div>
                                                <div className="profile-item"><b>Roll No:</b> 10</div>
                                                <div className="profile-item"><b>RTE:</b> No</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!currentConfig.hideHeaderIcons && !currentConfig.hideTable && (
                                    <div
                                        className="row mb-2 no-print"
                                        style={{
                                            marginBottom: '10px',
                                            display: isMobile ? 'flex' : 'block',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'center' : 'stretch',
                                            gap: isMobile ? '15px' : '0'
                                        }}
                                    >
                                        <div
                                            className={isMobile ? '' : 'col-sm-6'}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: isMobile ? '15px' : '20px',
                                                justifyContent: isMobile ? 'center' : 'flex-start',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            <div className="dataTables_length">
                                                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                    Records:
                                                    <select
                                                        value={itemsPerPage}
                                                        onChange={(e) => {
                                                            setItemsPerPage(Number(e.target.value));
                                                            setCurrentPage(1);
                                                        }}
                                                        className="form-control input-sm"
                                                        style={{ width: '80px', margin: '0 10px' }}
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                        <option value="-1">All</option>
                                                    </select>
                                                </label>
                                            </div>
                                            {!currentConfig.hideSearch && (
                                                <div className="dataTables_filter">
                                                    <input
                                                        type="search"
                                                        className="form-control input-sm"
                                                        placeholder="Search..."
                                                        style={{
                                                            marginLeft: isMobile ? '0' : '10px',
                                                            display: 'inline-block',
                                                            width: '180px',
                                                            border: 'none',
                                                            borderBottom: '1px solid #ccc',
                                                            borderRadius: '0',
                                                            boxShadow: 'none',
                                                            backgroundColor: 'transparent',
                                                            paddingLeft: '0',
                                                            outline: 'none',
                                                            textAlign: isMobile ? 'center' : 'left'
                                                        }}
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setSearchTerm(e.target.value);
                                                            setCurrentPage(1);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className={isMobile ? 'text-center' : 'col-sm-6 text-right'}>
                                            {filteredData.length > 0 && (
                                                <div className="dt-buttons btn-group" style={{ float: isMobile ? 'none' : 'right' }}>
                                                    {!currentConfig.showExcelPrintOnly && (
                                                        <button className="btn btn-default btn-sm" title="Copy" onClick={() => handleExport('copy')} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                            <i className="fa fa-files-o"></i>
                                                        </button>
                                                    )}
                                                    {!currentConfig.hideExportButtons && (
                                                        <>
                                                            <button className="btn btn-default btn-sm" title="Excel" onClick={() => handleExport('excel')} style={currentConfig.showExcelPrintOnly ? { borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' } : {}}>
                                                                <i className="fa fa-file-excel-o"></i>
                                                            </button>
                                                            {!currentConfig.showExcelPrintOnly && (
                                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => handleExport('csv')}>
                                                                    <i className="fa fa-file-text-o"></i>
                                                                </button>
                                                            )}
                                                            <button className="btn btn-default btn-sm" title="PDF" onClick={() => handleExport('pdf')}>
                                                                <i className="fa fa-file-pdf-o"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                    {(activeReport === 'Daily Collection Report' || (!currentConfig.hidePrint && activeReport !== 'Daily Collection Report')) && (
                                                        <button className="btn btn-default btn-sm" title="Print" onClick={() => handleExport('print')}>
                                                            <i className="fa fa-print"></i>
                                                        </button>
                                                    )}
                                                    {!currentConfig.showExcelPrintOnly && (
                                                        <div className="btn-group">
                                                            <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                                                <i className="fa fa-columns"></i>
                                                            </button>
                                                            {showColumnsDropdown && (
                                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                                    {currentConfig.headers.map((header, idx) => (
                                                                        <label key={idx} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left' }}>
                                                                            <input type="checkbox" checked={!hiddenColumns.includes(idx)} onChange={() => toggleColumnVisibility(idx)} style={{ marginRight: '6px' }} /> {header}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {!currentConfig.hideTable && (
                                    activeReport === 'Day Collection Report' && !Array.isArray(dayCollectionData) ? (
                                        <div className="table-responsive">
                                            {Object.keys(filteredDayCollectionGrouped || {}).map(mode => {
                                                const modeData = filteredDayCollectionGrouped[mode];
                                                // Calculate total for this section
                                                const modeTotal = Array.isArray(modeData) ? modeData.reduce((sum, row) => sum + (parseFloat(row.amount) || 0) + (parseFloat(row.amount_fine) || 0), 0) : 0;

                                                if (!Array.isArray(modeData) || modeData.length === 0) return null;

                                                // Normalize mode name (e.g. "cash" -> "Cash")
                                                const displayMode = mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();

                                                return (
                                                    <div key={mode} style={{ marginBottom: '30px' }}>
                                                        <h4 style={{ marginTop: '0', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee', color: '#444' }}>{displayMode}</h4>
                                                        <table className="table-custom">
                                                            <thead>
                                                                <tr>
                                                                    {currentConfig.headers.map((header, idx) => (
                                                                        !hiddenColumns.includes(idx) && <th key={idx} className="text-center">{header}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {modeData.map((row, index) => (
                                                                    <tr key={index}>{renderRow(row, index)}</tr>
                                                                ))}
                                                                <tr className="total-row">
                                                                    <td colSpan={currentConfig.headers.length - hiddenColumns.length} className="text-right" style={{ fontWeight: '600' }}>
                                                                        Total {displayMode}: ₹{modeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table-custom">
                                                <thead>
                                                    <tr>
                                                        {currentConfig.headers.map((header, idx) => (
                                                            !hiddenColumns.includes(idx) && <th key={idx} className="text-center">{header}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentData.map((row, index) => (
                                                        <tr key={indexOfFirstItem + index}>{renderRow(row, indexOfFirstItem + index)}</tr>
                                                    ))}
                                                    {(activeReport === 'Balance Fees Statement' || activeReport === 'Fees Statement') && (
                                                        <tr className="total-row">
                                                            <td colSpan={currentConfig.headers.length - hiddenColumns.length - (activeReport === 'Fees Statement' ? 8 : 4)} className="text-center" style={{ fontWeight: '600' }}>Grand Total</td>
                                                            {!hiddenColumns.includes(4) && (
                                                                <td className="text-center">
                                                                    {activeReport === 'Balance Fees Statement' ? (
                                                                        <>₹{(totals.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span style={{ color: 'red' }}> + 0.00</span></>
                                                                    ) : (totals.amount || 0).toFixed(2)}
                                                                </td>
                                                            )}
                                                            {activeReport === 'Balance Fees Statement' ? (
                                                                !hiddenColumns.includes(8) && <td className="text-center">₹{(totals.discount || 0).toFixed(2)}</td>
                                                            ) : (
                                                                <>
                                                                    {!hiddenColumns.includes(5) && <td></td>}
                                                                    {!hiddenColumns.includes(6) && <td></td>}
                                                                    {!hiddenColumns.includes(7) && <td></td>}
                                                                    {!hiddenColumns.includes(8) && <td className="text-center">₹{(totals.discount || 0).toFixed(2)}</td>}
                                                                </>
                                                            )}
                                                            {!hiddenColumns.includes(9) && <td className="text-center">₹{(totals.fine || 0).toFixed(2)}</td>}
                                                            {!hiddenColumns.includes(10) && <td className="text-center">₹{(totals.paid || 0).toFixed(2)}</td>}
                                                            {!hiddenColumns.includes(11) && <td className="text-center">₹{(totals.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
                                                        </tr>
                                                    )}
                                                    {activeReport === 'Daily Collection Report' && (
                                                        <tr className="total-row">
                                                            <td colSpan={Math.max(1, currentConfig.headers.length - hiddenColumns.length - 2)} className="text-center" style={{ fontWeight: '600' }}>Total Amount</td>
                                                            {!hiddenColumns.includes(2) && <td className="text-center">₹{(totals.total || 0).toFixed(2)}</td>}
                                                            {!hiddenColumns.includes(3) && <td></td>}
                                                        </tr>
                                                    )}
                                                    {activeReport === 'Fees Statement' && (
                                                        <tr className="total-row">
                                                            <td colSpan="11" className="text-center">Total Pending Amount</td>
                                                            <td className="text-center">{(totals.pending || 0).toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                    {activeReport === 'Balance Fees Report' && (
                                                        <tr className="total-row">
                                                            <td colSpan="18" className="text-center">Total Pending Amount</td>
                                                            <td className="text-center">{(totals.pending || 0).toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                    {activeReport === 'Online Fees Collection Report' && (
                                                        <tr className="total-row">
                                                            <td colSpan="7" className="text-center">Grand Total</td>
                                                            <td className="text-center">₹{(totals.amount || 0).toFixed(2)}</td>
                                                            <td className="text-center">₹{(totals.discount || 0).toFixed(2)}</td>
                                                            <td className="text-center">₹{(totals.fine || 0).toFixed(2)}</td>
                                                            <td className="text-center">₹{(totals.total || 0).toFixed(2)}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                )}

                                {!currentConfig.hidePagination && !currentConfig.hideTable && filteredData.length > 0 && (
                                    <div className="pt15 pb15 no-print">
                                        <Pagination
                                            totalItems={filteredData.length}
                                            itemsPerPage={itemsPerPage}
                                            currentPage={currentPage}
                                            onPageChange={(page) => setCurrentPage(page)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
            {/* Modal for Daily Collection Details */}
            {
                showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            width: isMobile ? '98%' : '90%',
                            maxWidth: '1200px',
                            maxHeight: isMobile ? '95vh' : '90vh',
                            overflowY: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            padding: isMobile ? '12px' : '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <h4 style={{ margin: 0, fontSize: isMobile ? '14px' : '18px' }}>Collection List</h4>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <strong>Collection Date: </strong> {selectedDateDetails?.date_col}
                            </div>
                            <div
                                className="row mb-2"
                                style={{
                                    marginBottom: '10px',
                                    display: isMobile ? 'flex' : 'block',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'center' : 'stretch',
                                    gap: isMobile ? '15px' : '0'
                                }}
                            >
                                <div
                                    className={isMobile ? '' : 'col-sm-6'}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: isMobile ? '15px' : '20px',
                                        justifyContent: isMobile ? 'center' : 'flex-start',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div className="dataTables_filter">
                                        <input
                                            type="search"
                                            className="form-control input-sm"
                                            placeholder="Search..."
                                            style={{
                                                marginLeft: isMobile ? '0' : '10px',
                                                display: 'inline-block',
                                                width: '180px',
                                                border: 'none',
                                                borderBottom: '1px solid #ccc',
                                                borderRadius: '0',
                                                boxShadow: 'none',
                                                backgroundColor: 'transparent',
                                                paddingLeft: '0',
                                                outline: 'none',
                                                textAlign: isMobile ? 'center' : 'left'
                                            }}
                                            value={modalSearchTerm}
                                            onChange={(e) => setModalSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={isMobile ? 'text-center' : 'col-sm-6 text-right'}>
                                    <div className="dt-buttons btn-group" style={{ float: 'right' }}>
                                        <button className="btn btn-default btn-sm" title="Copy" onClick={() => handleModalExport('copy')} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                            <i className="fa fa-files-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-sm" title="Excel" onClick={() => handleModalExport('excel')}>
                                            <i className="fa fa-file-excel-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-sm" title="CSV" onClick={() => handleModalExport('csv')}>
                                            <i className="fa fa-file-text-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-sm" title="PDF" onClick={() => handleModalExport('pdf')}>
                                            <i className="fa fa-file-pdf-o"></i>
                                        </button>
                                        <button className="btn btn-default btn-sm" title="Print" onClick={() => handleModalExport('print')} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                            <i className="fa fa-print"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {renderDetailTable()}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FinanceReport;
