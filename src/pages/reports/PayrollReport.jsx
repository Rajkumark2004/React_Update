import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const PayrollReport = () => {
    const navigate = useNavigate();

    // Form states
    const [role, setRole] = useState('select');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    // Table search state
    const [tableSearch, setTableSearch] = useState('');

    // Data states
    const [reportData, setReportData] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- MOCK DATA ---
    const rolesList = [
        { id: '1', type: 'Super Admin' },
        { id: '2', type: 'Admin' },
        { id: '3', type: 'Teacher' },
        { id: '4', type: 'Accountant' },
        { id: '5', type: 'Librarian' },
    ];

    const monthList = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const yearList = [
        { year: '2025' },
        { year: '2024' },
        { year: '2023' },
    ];

    const mockPayrollData = [
        {
            id: '101', // Payslip #
            employee_id: '9001',
            name: 'Rajesh',
            surname: 'Kumar',
            user_type: 'Teacher',
            designation: 'Senior Teacher',
            month: 'March',
            year: '2025',
            basic: 50000,
            total_allowance: 5000,
            total_deduction: 2000,
            tax: 1500,
            net_salary: 51500,
            payment_mode: 'Bank Transfer'
        },
        {
            id: '102',
            employee_id: '9002',
            name: 'Priya',
            surname: 'Sharma',
            user_type: 'Admin',
            designation: 'HR',
            month: 'March',
            year: '2025',
            basic: 45000,
            total_allowance: 4000,
            total_deduction: 1500,
            tax: 1200,
            net_salary: 46300,
            payment_mode: 'Cash'
        },
        {
            id: '103',
            employee_id: '9005',
            name: 'Aman',
            surname: 'Verma',
            user_type: 'Accountant',
            designation: 'Head Accountant',
            month: 'March',
            year: '2025',
            basic: 40000,
            total_allowance: 3000,
            total_deduction: 1000,
            tax: 1000,
            net_salary: 41000,
            payment_mode: 'Cheque'
        }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (year === '') {
            alert('Year is required');
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setReportData(mockPayrollData);
            setSearched(true);
            setLoading(false);
        }, 800);
    };

    const filteredResults = reportData.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
    );

    // Calculate Grand Totals
    const totals = filteredResults.reduce((acc, curr) => ({
        basic: acc.basic + curr.basic,
        allowance: acc.allowance + curr.total_allowance,
        deduction: acc.deduction + curr.total_deduction,
        tax: acc.tax + curr.tax,
        net: acc.net + curr.net_salary,
        gross: acc.gross + (curr.basic + curr.total_allowance - curr.total_deduction)
    }), { basic: 0, allowance: 0, deduction: 0, tax: 0, net: 0, gross: 0 });

    const handleCopy = () => {
        const headers = 'Name\tRole\tDesignation\tMonth-Year\tPayslip #\tBasic Salary\tEarning\tDeduction\tGross Salary\tTax\tNet Salary';
        const text = filteredResults.map(row =>
            `${row.name} ${row.surname}\t${row.user_type}\t${row.designation}\t${row.month}-${row.year}\t${row.id}\t${row.basic}\t${row.total_allowance}\t${row.total_deduction}\t${row.basic + row.total_allowance - row.total_deduction}\t${row.tax}\t${row.net_salary}`
        ).join('\n');
        navigator.clipboard.writeText(headers + '\n' + text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <style>{`
                .payroll-table th, .payroll-table td {
                    padding: 10px 15px !important;
                    white-space: nowrap;
                }
                .total-bg {
                    background-color: #f4f4f4;
                    font-weight: bold;
                }
                .detail-popover {
                    cursor: pointer;
                    color: #3c8dbc;
                }
                .detail-popover:hover {
                    text-decoration: underline;
                }
            `}</style>

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-search"></i> Payroll Report</h3>
                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                            <i className="fa fa-arrow-left"></i> Back
                        </button>
                    </div>
                    {/* Navigation Tabs */}
                    <div className="row" style={{ marginTop: '16px' }}>
                        <div className="col-md-12">
                            <div className="box box-primary border0 mb0 margesection">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Human Resource Report</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <ul className="reportlists" style={{ listStyle: 'none', padding: '15px 0', borderBottom: '1px solid #eee', overflow: 'hidden' }}>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/report/staff_report'); }} style={{ color: '#555' }}>
                                                <i className="fa fa-file-text-o"></i> Staff Report
                                            </a>
                                        </li>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" className="active" style={{ color: '#337ab7', fontWeight: '600' }}>
                                                <i className="fa fa-file-text-o"></i> Payroll Report
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="box removeboxmius">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                </div>
                                <form onSubmit={handleSearch}>
                                    <div className="box-body row">
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Role</label>
                                                <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                                                    <option value="select">Select</option>
                                                    {rolesList.map(r => (
                                                        <option key={r.id} value={r.type}>{r.type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Month</label>
                                                <select className="form-control" value={month} onChange={(e) => setMonth(e.target.value)}>
                                                    <option value="">Select</option>
                                                    {monthList.map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-4">
                                            <div className="form-group">
                                                <label>Year<small className="req"> *</small></label>
                                                <select className="form-control" value={year} onChange={(e) => setYear(e.target.value)} required>
                                                    <option value="">Select</option>
                                                    {yearList.map(y => (
                                                        <option key={y.year} value={y.year}>{y.year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <button type="submit" className="btn btn-primary btn-sm checkbox-toggle pull-right">
                                                <i className="fa fa-search"></i> Search
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                {loading && (
                                    <div className="box-body text-center" style={{ padding: '20px' }}>
                                        <div>Loading report...</div>
                                    </div>
                                )}

                                {searched && (
                                    <div className="box-body">
                                        <div className="box-header ptbnull" style={{ paddingLeft: 0 }}>
                                            <h3 className="box-title titlefix" style={{ fontSize: '18px', margin: '15px 0' }}>
                                                <i className="fa fa-users"></i> Payroll Report
                                            </h3>
                                        </div>

                                        {/* Table toolbar */}
                                        <div className="row mb10">
                                            <div className="col-sm-12">
                                                <div className="pull-left">
                                                    <div className="form-group mb0" style={{ paddingBottom: '5px' }}>
                                                        <i className="fa fa-search" style={{ color: '#999', marginRight: '5px' }}></i>
                                                        <input
                                                            type="text"
                                                            className="form-control input-sm"
                                                            placeholder="Search..."
                                                            style={{ width: '200px', border: 'none', display: 'inline-block', background: 'transparent', boxShadow: 'none' }}
                                                            value={tableSearch}
                                                            onChange={(e) => setTableSearch(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pull-right">
                                                    <div className="dt-buttons btn-group" style={{ paddingBottom: '2px' }}>
                                                        <button className="btn btn-default dt-button" title="Copy" onClick={handleCopy} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-copy"></i></button>
                                                        <button className="btn btn-default dt-button" title="Excel" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-excel-o"></i></button>
                                                        <button className="btn btn-default dt-button" title="CSV" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-text-o"></i></button>
                                                        <button className="btn btn-default dt-button" title="PDF" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-pdf-o"></i></button>
                                                        <button className="btn btn-default dt-button" title="Print" onClick={() => window.print()} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-print"></i></button>
                                                        <button className="btn btn-default dt-button" title="Columns" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-columns"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover payroll-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Role</th>
                                                        <th>Designation</th>
                                                        <th>Month - Year</th>
                                                        <th>Payslip #</th>
                                                        <th className="text-right">Basic Salary</th>
                                                        <th className="text-right">Earning</th>
                                                        <th className="text-right">Deduction</th>
                                                        <th className="text-right">Gross Salary</th>
                                                        <th className="text-right">Tax</th>
                                                        <th className="text-right">Net Salary</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredResults.length === 0 ? (
                                                        <tr><td colSpan="11" className="text-center">No data available in table</td></tr>
                                                    ) : (
                                                        <>
                                                            {filteredResults.map((row, idx) => (
                                                                <tr key={idx}>
                                                                    <td>
                                                                        <span className="detail-popover" title={`Staff ID: ${row.employee_id}`}>
                                                                            {row.name} {row.surname}
                                                                        </span>
                                                                    </td>
                                                                    <td>{row.user_type}</td>
                                                                    <td>{row.designation}</td>
                                                                    <td>{row.month} - {row.year}</td>
                                                                    <td>
                                                                        <span className="detail-popover" title={`Mode: ${row.payment_mode}`}>
                                                                            {row.id}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-right">{row.basic.toFixed(2)}</td>
                                                                    <td className="text-right">{row.total_allowance.toFixed(2)}</td>
                                                                    <td className="text-right">{row.total_deduction.toFixed(2)}</td>
                                                                    <td className="text-right">{(row.basic + row.total_allowance - row.total_deduction).toFixed(2)}</td>
                                                                    <td className="text-right">{row.tax.toFixed(2)}</td>
                                                                    <td className="text-right">{row.net_salary.toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                            <tr className="total-bg">
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td className="text-right">Grand Total</td>
                                                                <td className="text-right">{totals.basic.toFixed(2)}</td>
                                                                <td className="text-right">{totals.allowance.toFixed(2)}</td>
                                                                <td className="text-right">{totals.deduction.toFixed(2)}</td>
                                                                <td className="text-right">{totals.gross.toFixed(2)}</td>
                                                                <td className="text-right">{totals.tax.toFixed(2)}</td>
                                                                <td className="text-right">{totals.net.toFixed(2)}</td>
                                                            </tr>
                                                        </>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Record count and pagination */}
                                        <div className="row" style={{ marginTop: '10px' }}>
                                            <div className="col-sm-5">
                                                <div className="dataTables_info" style={{ paddingLeft: '10px', fontSize: '12px' }}>
                                                    Records: {filteredResults.length > 0 ? 1 : 0} to {filteredResults.length} of {filteredResults.length}
                                                    {tableSearch && reportData.length !== filteredResults.length && ` (filtered from ${reportData.length} total)`}
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="dataTables_paginate paging_simple_numbers" style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                    <ul className="pagination" style={{ margin: '0', float: 'right', fontSize: '12px' }}>
                                                        <li className="paginate_button previous disabled">
                                                            <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&lt;</a>
                                                        </li>
                                                        <li className="paginate_button active">
                                                            <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px' }}>1</a>
                                                        </li>
                                                        <li className="paginate_button next disabled">
                                                            <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&gt;</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default PayrollReport;
