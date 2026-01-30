import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AttendanceReportNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    // List based on _attendance.php
    const reports = [
        { name: 'Attendance Report', path: '#', icon: 'fa-file-text-o' }, // Placeholder path
        { name: 'Student Attendance Type Report', path: '#', icon: 'fa-file-text-o' },
        { name: 'Daily Attendance Report', path: '/daily-attendance-report', icon: 'fa-file-text-o' },
        { name: 'Staff Attendance Report', path: '/attendance/staff_attendance_report', icon: 'fa-file-text-o' },
        { name: 'Late Entries Report', path: '#', icon: 'fa-file-text-o' },
    ];

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="box box-primary border0 mb0 margesection">
                    <div className="box-header with-border">
                        <h3 className="box-title"><i className="fa fa-search"></i> Attendance Report</h3>
                        <div className="btn-group pull-right">
                            <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                    </div>
                    <div className="">
                        <ul className="reportlists">
                            {reports.map((report, index) => (
                                <li key={index} className={`col-lg-4 col-md-4 col-sm-6 ${currentPath === report.path ? 'active' : ''}`}>
                                    <Link to={report.path}>
                                        <i className={`fa ${report.icon}`}></i> {report.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReportNav;
