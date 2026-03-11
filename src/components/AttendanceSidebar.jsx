import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AttendanceSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="box border0">
            <div className="box-header with-border">
                <h3 className="box-title">Attendance</h3>
            </div>
            <ul className="tablists">
                <li className={currentPath === '/student-attendance' ? 'active' : ''}>
                    <Link to="/student-attendance" className={currentPath === '/student-attendance' ? 'active' : ''}>
                        <i className="fa fa-calendar-check-o" style={{ marginRight: '5px' }}></i> Student Attendance
                    </Link>
                </li>
                <li className={currentPath === '/attendance-by-date' ? 'active' : ''}>
                    <Link to="/attendance-by-date" className={currentPath === '/attendance-by-date' ? 'active' : ''}>
                        <i className="fa fa-calendar" style={{ marginRight: '5px' }}></i> Attendance By Date
                    </Link>
                </li>
                <li className={currentPath === '/approve_leave' ? 'active' : ''}>
                    <Link to="/approve_leave" className={currentPath === '/approve_leave' ? 'active' : ''}>
                        <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/attendance/3.png" style={{ width: '15px', marginRight: '5px' }} alt="" /> Approve Leave
                    </Link>
                </li>
                {/* Add other links as per PHP if needed, e.g. Late Entries */}
                {/* Replaced images with Icons as per original images not found */}
            </ul>
        </div>
    );
};

export default AttendanceSidebar;
