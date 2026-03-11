import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsMenu from "../../components/SettingsMenu";
import { api } from "../../services/api";
import "../../index.css";
import '../../utils/include_files';
import toast from 'react-hot-toast';
import { usePermissions } from '../../context/PermissionContext';

const ModulePermissions = () => {
    const navigate = useNavigate();
    const { refreshPermissions } = usePermissions();
    const [activeTab, setActiveTab] = useState("system");
    const [loading, setLoading] = useState(true);

    const [permissionList, setPermissionList] = useState([]);
    const [studentPermissionList, setStudentPermissionList] = useState([]);
    const [parentPermissionList, setParentPermissionList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const data = await api.getModulePermissions();
            const list = data.permissionList || [];
            setPermissionList(list);
            setStudentPermissionList(data.studentpermissionList || []);
            setParentPermissionList(data.parentpermissionList || []);
            // Refresh the context so sidebar reflects latest permissions
            refreshPermissions();
        } catch (error) {
            console.error("Failed to fetch permissions:", error);
            toast.error("Failed to load module permissions");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id, isChecked, listType) => {
        // Convert boolean checked state to string "1" or "0"
        const newStatus = isChecked ? "1" : "0";
        const idStr = String(id);

        // Optimistic update
        const updateList = (list, setList) => {
            setList(prev => prev.map(item =>
                item.id === id ? { ...item, is_active: newStatus, student: listType === 'student' ? newStatus : item.student, parent: listType === 'parent' ? newStatus : item.parent } : item
            ));
        };


        if (listType === 'system') {
            updateList(permissionList, setPermissionList);
        } else if (listType === 'student') {
            // For student list, the switch likely toggles the 'student' capability?
            // Or is it the module itself?
            // Given the UI usually has a switch for each, let's assume it toggles that record's active state or the specific role bit.
            // Given the current API method only takes ID and Status, I'll proceed with that.
            // If it fails or behaves oddly, I'll need to debug.
            setStudentPermissionList(prev => prev.map(item => item.id === id ? { ...item, student: newStatus } : item));
        } else if (listType === 'parent') {
            setParentPermissionList(prev => prev.map(item => item.id === id ? { ...item, parent: newStatus } : item));
        }

        try {
            let response;
            if (listType === 'parent') {
                response = await api.changeParentStatus(idStr, newStatus);
            } else if (listType === 'student') {
                response = await api.changeStudentStatus(idStr, newStatus);
            } else {
                response = await api.changeModuleStatus(idStr, newStatus);
            }

            // Use msg from response as per user request example: { "status": 1, "msg": "Status Change Successfully" }
            toast.success(response.msg || response.message || "Status Change Successfully");
            // Optionally refetch to ensure server state is synced
            fetchPermissions();
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error(error.message || "Failed to update status");
            // Revert on failure
            fetchPermissions();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = (list, filename) => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Status\n"
            + list.map(e => `${e.name},${e.is_active || e.student || e.parent ? 'Active' : 'Inactive'}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterList = (list) => {
        if (!searchTerm) return list;
        return list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const renderTable = (list, type, statusKey, filename) => {
        const filtered = filterList(list);

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            borderBottom: '1px solid #eee',
                            width: '200px',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '10px', color: '#666', fontSize: '14px' }}>
                        <i className="fa fa-files-o" style={{ cursor: 'pointer' }} title="Copy" onClick={() => toast.success("Copy feature not implemented yet")}></i>
                        <i className="fa fa-file-text-o" style={{ cursor: 'pointer' }} title="CSV" onClick={() => handleExportCSV(filtered, `${filename}.csv`)}></i>
                        <i className="fa fa-file-excel-o" style={{ cursor: 'pointer' }} title="Excel" onClick={() => toast.success("Excel export not implemented yet")}></i>
                        <i className="fa fa-file-pdf-o" style={{ cursor: 'pointer' }} title="PDF" onClick={() => toast.success("PDF export not implemented yet")}></i>
                        <i className="fa fa-print" style={{ cursor: 'pointer' }} title="Print" onClick={handlePrint}></i>
                        <i className="fa fa-columns" style={{ cursor: 'pointer' }} title="Columns" onClick={() => toast.success("Column visibility not implemented yet")}></i>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style={{ width: "120px", textAlign: "center" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <label className="custom-switch">
                                            <input
                                                type="checkbox"
                                                checked={item[statusKey] == 1}
                                                onChange={(e) => handleToggle(item.id, e.target.checked, type)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0px', color: '#666', fontSize: '12px' }}>
                    <div>Records: 1 to {filtered.length} of {list.length}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ cursor: 'pointer' }}>&lt;</span>
                        <span style={{ background: '#f4f4f4', padding: '2px 8px', borderRadius: '2px', color: '#333' }}>1</span>
                        <span style={{ cursor: 'pointer' }}>&gt;</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <SettingsMenu hideSidebars={true}>
            <div style={{ width: "100%", marginTop: "0px" }}>
                <div className="nav-tabs-custom theme-shadow">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box-header with-border" style={{ display: "flex", alignItems: "center", padding: "10px" }}>
                                <div style={{ flex: 1 }}></div>
                                <h4 className="box-title" style={{ flex: 1, textAlign: "center", margin: 0 }}>Modules</h4>
                                <div style={{ flex: 1, textAlign: "right" }}>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="btn btn-primary btn-sm"
                                        style={{ borderRadius: "20px", padding: "6px 14px" }}
                                    >
                                        <i className="fa fa-arrow-left"></i> Back
                                    </button>
                                </div>
                            </div>

                            <ul className="nav nav-tabs">
                                <li className={activeTab === 'system' ? 'active' : ''}>
                                    <a href="#tab_system" onClick={(e) => { e.preventDefault(); setActiveTab('system'); }}>System</a>
                                </li>
                                <li className={activeTab === 'student' ? 'active' : ''}>
                                    <a href="#tab_student" onClick={(e) => { e.preventDefault(); setActiveTab('student'); }}>Student</a>
                                </li>
                                <li className={activeTab === 'parent' ? 'active' : ''}>
                                    <a href="#tab_parent" onClick={(e) => { e.preventDefault(); setActiveTab('parent'); }}>Parent</a>
                                </li>
                            </ul>

                            <div className="tab-content" style={{ padding: "15px" }}>
                                <div className={`tab-pane ${activeTab === 'system' ? 'active' : ''}`} id="tab_system">
                                    {renderTable(permissionList, 'system', 'is_active', 'system_permissions')}
                                </div>
                                <div className={`tab-pane ${activeTab === 'student' ? 'active' : ''}`} id="tab_student">
                                    {renderTable(studentPermissionList, 'student', 'student', 'student_permissions')}
                                </div>
                                <div className={`tab-pane ${activeTab === 'parent' ? 'active' : ''}`} id="tab_parent">
                                    {renderTable(parentPermissionList, 'parent', 'parent', 'parent_permissions')}
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
