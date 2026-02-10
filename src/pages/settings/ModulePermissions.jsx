import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import SettingsMenu from "../../components/SettingsMenu";

const ModulePermissions = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('system');

    // Mock Data mimicking the PHP structure
    const [permissionList, setPermissionList] = useState([
        { id: 1, name: 'System Settings', is_active: 1 },
        { id: 2, name: 'Student Information', is_active: 1 },
        { id: 3, name: 'Fees Collection', is_active: 0 },
        { id: 4, name: 'Income', is_active: 1 },
        { id: 5, name: 'Expenses', is_active: 1 },
        { id: 6, name: 'Academics', is_active: 1 },
        { id: 7, name: 'Human Resource', is_active: 1 },
        { id: 8, name: 'Communicate', is_active: 1 },
        { id: 9, name: 'Download Center', is_active: 1 },
        { id: 10, name: 'Homework', is_active: 1 },
        { id: 11, name: 'Library', is_active: 1 },
        { id: 12, name: 'Inventory', is_active: 1 },
        { id: 13, name: 'Transport', is_active: 1 },
        { id: 14, name: 'Hostel', is_active: 1 },
        { id: 15, name: 'Certificate', is_active: 1 },
        { id: 16, name: 'Front CMS', is_active: 1 },
        { id: 17, name: 'Alumni', is_active: 1 },
        { id: 18, name: 'Reports', is_active: 1 },
    ]);

    const [studentPermissionList, setStudentPermissionList] = useState([
        { id: 1, name: 'Fees', student: 1 },
        { id: 2, name: 'Timetable', student: 1 },
        { id: 3, name: 'Attendance', student: 1 },
        { id: 4, name: 'Examinations', student: 1 },
        { id: 5, name: 'Notice Board', student: 1 },
        { id: 6, name: 'Teachers Reviews', student: 1 },
        { id: 7, name: 'Library', student: 1 },
        { id: 8, name: 'Homework', student: 1 },
        { id: 9, name: 'Download Center', student: 1 },
        { id: 10, name: 'Online Exams', student: 1 },
        { id: 11, name: 'Leave Request', student: 1 },
        { id: 12, name: 'Main Library', student: 1 },
    ]);

    const [parentPermissionList, setParentPermissionList] = useState([
        { id: 1, name: 'Fees', parent: 1 },
        { id: 2, name: 'Timetable', parent: 1 },
        { id: 3, name: 'Attendance', parent: 1 },
        { id: 4, name: 'Examinations', parent: 1 },
        { id: 5, name: 'Notice Board', parent: 1 },
        { id: 6, name: 'Teachers Reviews', parent: 1 },
        { id: 7, name: 'Library', parent: 1 },
        { id: 8, name: 'Homework', parent: 1 },
        { id: 9, name: 'Download Center', parent: 1 },
        { id: 10, name: 'Online Exams', parent: 1 },
        { id: 11, name: 'Leave Request', parent: 1 },
    ]);

    const handleToggle = (id, role, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        // In a real app, we'd call the API here.
        // For now, update local state directly.

        if (role === 'system') {
            setPermissionList(prev => prev.map(item => item.id === id ? { ...item, is_active: newStatus } : item));
        } else if (role === 'student') {
            setStudentPermissionList(prev => prev.map(item => item.id === id ? { ...item, student: newStatus } : item));
        } else if (role === 'parent') {
            setParentPermissionList(prev => prev.map(item => item.id === id ? { ...item, parent: newStatus } : item));
        }

        console.log(`Toggled ${role} permission for ID ${id} to ${newStatus}`);
    };

    const renderTable = (list, role, statusKey) => (
        <div className="table-responsive">
            <div className="download_label">Modules</div>
            <table className="table table-striped table-bordered table-hover example" cellSpacing="0" width="100%">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th className="text-right noExport">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((item) => (
                        <tr key={item.id}>
                            <td className="text-rtl-right" width="100%">{item.name}</td>
                            <td className="relative">
                                <div className="material-switch pull-right">
                                    <input
                                        id={`${role}${item.id}`}
                                        name={`switch_${role}_${item.id}`}
                                        type="checkbox"
                                        className="chk"
                                        checked={item[statusKey] === 1}
                                        onChange={() => handleToggle(item.id, role, item[statusKey])}
                                    />
                                    <label htmlFor={`${role}${item.id}`} className="label-success"></label>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <SettingsMenu>
            <div style={{ width: '100%', marginTop: '20px' }}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="nav-tabs-custom theme-shadow">
                            <ul className="nav nav-tabs pull-right flex-sm-wrap d-xs-flex" style={{ borderBottom: '1px solid #ddd' }}>
                                <li className="pull-right header">
                                    <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm" style={{ borderRadius: '20px', padding: '6px 14px', marginTop: '-37px', marginRight: '15px' }}>
                                        <i className="fa fa-arrow-left"></i> Back
                                    </button>
                                </li>
                                <li className={activeTab === 'parent' ? 'active' : ''}>
                                    <a href="#tab_parent" onClick={(e) => { e.preventDefault(); setActiveTab('parent'); }}>Parent</a>
                                </li>
                                <li className={activeTab === 'student' ? 'active' : ''}>
                                    <a href="#tab_students" onClick={(e) => { e.preventDefault(); setActiveTab('student'); }}>Student</a>
                                </li>
                                <li className={activeTab === 'system' ? 'active' : ''}>
                                    <a href="#tab_system" onClick={(e) => { e.preventDefault(); setActiveTab('system'); }}>System</a>
                                </li>
                                <li className="pull-left header"> Modules</li>
                            </ul>
                            <div className="tab-content">
                                <div className={`tab-pane ${activeTab === 'system' ? 'active' : ''}`} id="tab_system">
                                    {renderTable(permissionList, 'system', 'is_active')}
                                </div>
                                <div className={`tab-pane ${activeTab === 'student' ? 'active' : ''}`} id="tab_students">
                                    {renderTable(studentPermissionList, 'student', 'student')}
                                </div>
                                <div className={`tab-pane ${activeTab === 'parent' ? 'active' : ''}`} id="tab_parent">
                                    {renderTable(parentPermissionList, 'parent', 'parent')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsMenu>
    );
};

export default ModulePermissions;
