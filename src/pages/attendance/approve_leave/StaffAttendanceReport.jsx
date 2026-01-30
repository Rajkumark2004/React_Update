import React, { useState } from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import AttendanceReportNav from '../AttendanceReportNav';
import '../../../utils/include_files';

const StaffAttendanceReport = () => {
    const [role, setRole] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [showResult, setShowResult] = useState(false);

    // Mock Data
    const roles = ["Admin", "Teacher", "Accountant", "Librarian", "Receptionist", "Super Admin"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = [2023, 2024, 2025, 2026];

    // Mock Staff Data with Indian Names
    const staffData = [
        { id: 101, name: "Rajesh Kumar", role: "Teacher", present: 22, late: 2, absent: 1, half_day: 0, holiday: 5, gross_percent: 96 },
        { id: 102, name: "Priya Sharma", role: "Teacher", present: 24, late: 0, absent: 0, half_day: 1, holiday: 5, gross_percent: 98 },
        { id: 103, name: "Amit Patel", role: "Accountant", present: 20, late: 0, absent: 5, half_day: 0, holiday: 5, gross_percent: 80 },
        { id: 104, name: "Sunita Gupta", role: "Librarian", present: 23, late: 1, absent: 1, half_day: 0, holiday: 5, gross_percent: 92 },
        { id: 105, name: "Vikram Singh", role: "Admin", present: 25, late: 0, absent: 0, half_day: 0, holiday: 5, gross_percent: 100 },
        { id: 106, name: "Anita Desai", role: "Receptionist", present: 21, late: 3, absent: 1, half_day: 0, holiday: 5, gross_percent: 88 },
    ];

    // Generate days for the selected month (assuming 30 days for simplicity in mock)
    const daysInMonth = 30;
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Mock daily status generator
    const getStatusForDay = (staffId, day) => {
        // Randomly assign status for demo purposes
        const rand = Math.random();
        // Specific logic to match the summary counts would be complex, just randomizing for visual
        if (day % 7 === 0) return { label: 'H', class: 'btn-danger' }; // Holiday logic (approx)
        if (rand > 0.9) return { label: 'A', class: 'btn-danger' };
        if (rand > 0.85) return { label: 'L', class: 'btn-warning' };
        if (rand > 0.8) return { label: 'F', class: 'btn-warning' };
        return { label: 'P', class: 'btn-success' };
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowResult(true);
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>
                <section className="content">
                    <AttendanceReportNav />
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box removeboxmius">
                                <div className="box-header ptbnull"></div>
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                </div>
                                <form id='form1' onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Role</label>
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        className="form-control"
                                                        value={role}
                                                        onChange={(e) => setRole(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {roles.map((r, i) => (
                                                            <option key={i} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Month</label><small className="req"> *</small>
                                                    <select
                                                        id="month"
                                                        name="month"
                                                        className="form-control"
                                                        value={month}
                                                        onChange={(e) => setMonth(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {months.map((m, i) => (
                                                            <option key={i} value={i + 1}>{m}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Year</label>
                                                    <select
                                                        id="year"
                                                        name="year"
                                                        className="form-control"
                                                        value={year}
                                                        onChange={(e) => setYear(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {years.map((y, i) => (
                                                            <option key={i} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <button type="submit" name="search" value="search" className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                        <i className="fa fa-search"></i> Search
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {showResult && (
                                    <div id="attendencelist">
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-header with-border">
                                            <div className="row">
                                                <div className="col-md-4 col-sm-4">
                                                    <h3 className="box-title"><i className="fa fa-users"></i> Staff Attendance Report</h3>
                                                </div>
                                                <div className="col-md-8 col-sm-8">
                                                    <div className="pull-right">
                                                        <b>Present: P</b>&nbsp;&nbsp;
                                                        <b>Late: L</b>&nbsp;&nbsp;
                                                        <b>Absent: A</b>&nbsp;&nbsp;
                                                        <b>Half Day: F</b>&nbsp;&nbsp;
                                                        <b>Holiday: H</b>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="box-body table-responsive">
                                            <div className="download_label">Staff Attendance Report</div>
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        <th>Staff / Date</th>
                                                        <th><br /><span data-toggle="tooltip" title="Gross Present Percentage"> (%)</span></th>
                                                        <th colspan=""><br /><span data-toggle="tooltip" title="Total Present">P</span></th>
                                                        <th colspan=""><br /><span data-toggle="tooltip" title="Total Late">L</span></th>
                                                        <th colspan=""><br /><span data-toggle="tooltip" title="Total Absent">A</span></th>
                                                        <th colspan=""><br /><span data-toggle="tooltip" title="Total Half Day">F</span></th>
                                                        <th colspan=""><br /><span data-toggle="tooltip" title="Total Holiday">H</span></th>

                                                        {daysArray.map(day => (
                                                            <th key={day} className="tdcls text text-center">
                                                                {day}<br />
                                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day % 7]}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {staffData.map((staff, index) => {
                                                        let labelClass = "label label-default";
                                                        if (staff.gross_percent >= 95) labelClass = "label label-success";
                                                        else if (staff.gross_percent < 75) labelClass = "label label-danger";

                                                        return (
                                                            <tr key={staff.id}>
                                                                <td className="tdclsname">
                                                                    <span className="detail_popover">
                                                                        <a href="#" style={{ color: '#333' }}>{staff.name}</a>
                                                                    </span>
                                                                    <div style={{ fontSize: '11px', color: '#888' }}>ID: {staff.id}</div>
                                                                </td>
                                                                <th><label className={labelClass}>{staff.gross_percent}</label></th>
                                                                <th>{staff.present}</th>
                                                                <th>{staff.late}</th>
                                                                <th>{staff.absent}</th>
                                                                <th>{staff.half_day}</th>
                                                                <th>{staff.holiday}</th>

                                                                {daysArray.map(day => {
                                                                    const status = getStatusForDay(staff.id, day);
                                                                    // Simple text for now, PHP used spans with remarks popup
                                                                    return (
                                                                        <th key={day} className="tdcls text text-center">
                                                                            {status.label}
                                                                        </th>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
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

export default StaffAttendanceReport;
