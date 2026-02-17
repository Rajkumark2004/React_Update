import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const StaffReport = () => {
    const navigate = useNavigate();

    // Form states
    const [searchType, setSearchType] = useState('today');
    const [staffStatus, setStaffStatus] = useState('active');
    const [role, setRole] = useState('');
    const [designation, setDesignation] = useState('');

    // Table search state
    const [tableSearch, setTableSearch] = useState('');

    // Data states
    const [reportData, setReportData] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- MOCK DATA ---
    const searchTypeList = {
        'today': 'Today',
        'this_week': 'This Week',
        'last_week': 'Last Week',
        'this_month': 'This Month',
        'last_month': 'Last Month',
        'this_year': 'This Year',
        'last_year': 'Last Year',
        'period': 'Period',
    };

    const statusList = {
        'active': 'Active',
        'disabled': 'Disabled',
    };

    const rolesList = [
        { id: '1', name: 'Super Admin' },
        { id: '2', name: 'Admin' },
        { id: '3', name: 'Teacher' },
        { id: '4', name: 'Accountant' },
        { id: '5', name: 'Librarian' },
    ];

    const designationList = [
        { id: '1', designation: 'Senior Teacher' },
        { id: '2', designation: 'Junior Teacher' },
        { id: '3', designation: 'Accountant' },
        { id: '4', designation: 'HR' },
    ];

    const mockStaffData = [
        {
            employee_id: '1001',
            user_type: 'Teacher',
            designation: 'Senior Teacher',
            department: 'Science',
            name: 'Rajesh',
            surname: 'Kumar',
            father_name: 'Suresh Kumar',
            mother_name: 'Sita Devi',
            email: 'rajesh@example.com',
            gender: 'Male',
            dob: '1985-05-15',
            date_of_joining: '2020-01-10',
            contact_no: '9876543210',
            emergency_contact_no: '9876543211',
            marital_status: 'Married',
            local_address: '123, Main Street, Delhi',
            permanent_address: '123, Main Street, Delhi',
            qualification: 'M.Sc, B.Ed',
            work_exp: '10 Years',
            note: 'Experienced teacher',
            epf_no: 'EPF12345',
            basic_salary: '50000.00',
            contract_type: 'Permanent',
            shift: 'Day',
            location: 'Building A',
            leaves: 'Casual Leave : 5, Sick Leave : 3',
            account_title: 'Rajesh Kumar',
            bank_account_no: '1234567890',
            bank_name: 'SBI',
            ifsc_code: 'SBIN0001234',
            bank_branch: 'Main Branch',
            facebook: 'http://facebook.com/rajesh',
            twitter: 'http://twitter.com/rajesh',
            linkedin: 'http://linkedin.com/in/rajesh',
            instagram: 'http://instagram.com/rajesh'
        },
        {
            employee_id: '1002',
            user_type: 'Admin',
            designation: 'HR',
            department: 'Administration',
            name: 'Priya',
            surname: 'Sharma',
            father_name: 'Ramesh Sharma',
            mother_name: 'Anita Sharma',
            email: 'priya@example.com',
            gender: 'Female',
            dob: '1990-08-20',
            date_of_joining: '2021-03-15',
            contact_no: '9876543220',
            emergency_contact_no: '9876543221',
            marital_status: 'Single',
            local_address: '456, Park Road, Mumbai',
            permanent_address: '456, Park Road, Mumbai',
            qualification: 'MBA',
            work_exp: '5 Years',
            note: '',
            epf_no: 'EPF67890',
            basic_salary: '45000.00',
            contract_type: 'Permanent',
            shift: 'Day',
            location: 'Building B',
            leaves: 'Casual Leave : 4, Sick Leave : 2',
            account_title: 'Priya Sharma',
            bank_account_no: '0987654321',
            bank_name: 'HDFC',
            ifsc_code: 'HDFC0005678',
            bank_branch: 'Worli Branch',
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
        }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setReportData(mockStaffData);
            setSearched(true);
            setLoading(false);
        }, 800);
    };

    const filteredResults = reportData.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
    );

    const handleCopy = () => {
        const headers = 'Staff ID\tRole\tDesignation\tDepartment\tName\tEmail\tPhone\tDate of Joining';
        const text = filteredResults.map(row =>
            `${row.employee_id}\t${row.user_type}\t${row.designation}\t${row.department}\t${row.name} ${row.surname}\t${row.email}\t${row.contact_no}\t${row.date_of_joining}`
        ).join('\n');
        navigator.clipboard.writeText(headers + '\n' + text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <style>{`
                .staff-table th, .staff-table td {
                    padding: 10px 15px !important;
                    white-space: nowrap;
                }
                .staff-table td:nth-child(5), .staff-table th:nth-child(5) {
                    white-space: normal;
                    min-width: 150px;
                }
            `}</style>

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-search"></i> Human Resource Report</h3>
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
                                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <ul className="reportlists" style={{ listStyle: 'none', padding: '15px 0', borderBottom: '1px solid #eee', overflow: 'hidden' }}>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" className="active" style={{ color: '#337ab7', fontWeight: '600' }}>
                                                <i className="fa fa-file-text-o"></i> Staff Report
                                            </a>
                                        </li>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/payroll/payrollreport'); }} style={{ color: '#555' }}>
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
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label>Search Type By Date Of Joining</label>
                                                <select className="form-control" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                                    {Object.entries(searchTypeList).map(([key, val]) => (
                                                        <option key={key} value={key}>{val}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label>Status</label>
                                                <select className="form-control" value={staffStatus} onChange={(e) => setStaffStatus(e.target.value)}>
                                                    {Object.entries(statusList).map(([key, val]) => (
                                                        <option key={key} value={key}>{val}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label>Role</label>
                                                <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                                                    <option value="">Select</option>
                                                    {rolesList.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label>Designation</label>
                                                <select className="form-control" value={designation} onChange={(e) => setDesignation(e.target.value)}>
                                                    <option value="">Select</option>
                                                    {designationList.map(d => (
                                                        <option key={d.id} value={d.id}>{d.designation}</option>
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
                                                <i className="fa fa-money"></i> Staff Report
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
                                            <table className="table table-striped table-bordered table-hover staff-table">
                                                <thead>
                                                    <tr>
                                                        <th>Staff ID</th>
                                                        <th>Role</th>
                                                        <th>Designation</th>
                                                        <th>Department</th>
                                                        <th>Name</th>
                                                        <th>Father Name</th>
                                                        <th>Mother Name</th>
                                                        <th>Email</th>
                                                        <th>Gender</th>
                                                        <th>Date Of Birth</th>
                                                        <th>Date Of Joining</th>
                                                        <th>Phone</th>
                                                        <th>Emergency Contact Number</th>
                                                        <th>Marital Status</th>
                                                        <th>Current Address</th>
                                                        <th>Permanent Address</th>
                                                        <th>Qualification</th>
                                                        <th>Work Experience</th>
                                                        <th>Note</th>
                                                        <th>EPF No</th>
                                                        <th>Basic Salary</th>
                                                        <th>Contract Type</th>
                                                        <th>Work Shift</th>
                                                        <th>Work Location</th>
                                                        <th>Leaves</th>
                                                        <th>Account Title</th>
                                                        <th>Bank Account Number</th>
                                                        <th>Bank Name</th>
                                                        <th>IFSC Code</th>
                                                        <th>Bank Branch Name</th>
                                                        <th>Social Media Link</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredResults.length === 0 ? (
                                                        <tr><td colSpan="31" className="text-center">No data available in table</td></tr>
                                                    ) : (
                                                        filteredResults.map((staff, idx) => (
                                                            <tr key={idx}>
                                                                <td>{staff.employee_id}</td>
                                                                <td>{staff.user_type}</td>
                                                                <td>{staff.designation}</td>
                                                                <td>{staff.department}</td>
                                                                <td>{staff.name} {staff.surname}</td>
                                                                <td>{staff.father_name}</td>
                                                                <td>{staff.mother_name}</td>
                                                                <td>{staff.email}</td>
                                                                <td>{staff.gender}</td>
                                                                <td>{staff.dob}</td>
                                                                <td>{staff.date_of_joining}</td>
                                                                <td>{staff.contact_no}</td>
                                                                <td>{staff.emergency_contact_no}</td>
                                                                <td>{staff.marital_status}</td>
                                                                <td>{staff.local_address}</td>
                                                                <td>{staff.permanent_address}</td>
                                                                <td>{staff.qualification}</td>
                                                                <td>{staff.work_exp}</td>
                                                                <td>{staff.note}</td>
                                                                <td>{staff.epf_no}</td>
                                                                <td>{staff.basic_salary}</td>
                                                                <td>{staff.contract_type}</td>
                                                                <td>{staff.shift}</td>
                                                                <td>{staff.location}</td>
                                                                <td>{staff.leaves}</td>
                                                                <td>{staff.account_title}</td>
                                                                <td>{staff.bank_account_no}</td>
                                                                <td>{staff.bank_name}</td>
                                                                <td>{staff.ifsc_code}</td>
                                                                <td>{staff.bank_branch}</td>
                                                                <td>
                                                                    {staff.facebook && <a href={staff.facebook} target="_blank" rel="noreferrer"><i className="fa fa-facebook" style={{ marginRight: '5px' }}></i></a>}
                                                                    {staff.twitter && <a href={staff.twitter} target="_blank" rel="noreferrer"><i className="fa fa-twitter" style={{ marginRight: '5px' }}></i></a>}
                                                                    {staff.linkedin && <a href={staff.linkedin} target="_blank" rel="noreferrer"><i className="fa fa-linkedin" style={{ marginRight: '5px' }}></i></a>}
                                                                    {staff.instagram && <a href={staff.instagram} target="_blank" rel="noreferrer"><i className="fa fa-instagram"></i></a>}
                                                                </td>
                                                            </tr>
                                                        ))
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

export default StaffReport;
