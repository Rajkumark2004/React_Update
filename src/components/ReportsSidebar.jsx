import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportsSidebar = ({ activeGroup }) => {
    const navigate = useNavigate();

    const baseUrl = 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/reports/';
    const reportGroups = [
        { name: 'SIS', label: 'SIS', img: '1.png' },
        { name: 'Finance', label: 'Finance', img: '2.png' },
        { name: 'Attendance', label: 'Attendance', img: '3.png' },
        { name: 'Examinations', label: 'Examinations', img: '4.png' },
        { name: 'Lesson Plans', label: 'Lesson Plan', img: '6.png' },
        { name: 'Human Resource', label: 'Human Resource', img: '7.png' },
        { name: 'Transport', label: 'Transport', img: '11.png' },
        { name: 'Hostel', label: 'Hostel', img: '12.png' },
        { name: 'Alumni', label: 'Alumni', img: '13.png' },
        { name: 'User Log', label: 'User Log', img: '14.png' },
        { name: 'Audit Trail Log', label: 'Audit Trail Log', img: '15.png' },
    ];

    const routeMap = {
        'SIS': '/admin/reports/student_information',
        'Finance': '/admin/reports/finance',
        'Attendance': '/admin/reports/attendance',
        'Examinations': '/admin/reports/rank',
        'Lesson Plans': '/admin/reports/lesson_plan',
        'Human Resource': '/admin/reports/staff',
        'Transport': '/admin/reports/transport',
        'Hostel': '/admin/reports/hostel',
        'Alumni': '/admin/reports/alumni',
        'User Log': '/admin/reports/user_log',
        'Audit Trail Log': '/admin/reports/audit_trail'
    };

    const handleGroupClick = (group) => {
        if (routeMap[group]) {
            navigate(routeMap[group]);
        }
    };

    return (
        <div className="internal-sidebar-box">
            <div className="sidebar-title">Reports</div>
            <ul className="internal-nav">
                {reportGroups.map((group, idx) => (
                    <li key={idx} className={activeGroup === group.name ? 'active' : ''} onClick={() => handleGroupClick(group.name)}>
                        <img src={`${baseUrl}${group.img}`} alt={group.name} />
                        {group.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReportsSidebar;
