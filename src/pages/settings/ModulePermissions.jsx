import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsMenu from "../../components/SettingsMenu";
import { api } from "../../services/api";
import "../../index.css";
import '../../utils/include_files';
import toast from 'react-hot-toast';
import { usePermissions } from '../../context/PermissionContext';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const ModulePermissions = () => {
    const navigate = useNavigate();
    const { refreshPermissions } = usePermissions();
    const [activeTab, setActiveTab] = useState("system");
    const [loading, setLoading] = useState(true);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const [permissionList, setPermissionList] = useState([]);
    const [studentPermissionList, setStudentPermissionList] = useState([]);
    const [parentPermissionList, setParentPermissionList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const columns = [
        { index: 0, label: 'Name' },
        { index: 1, label: 'Action' }
    ];

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = (filtered, type, statusKey) => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Name");
        if (!hiddenColumns.includes(1)) headers.push("Action");

        const rows = filtered.map(item => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(item.name);
            if (!hiddenColumns.includes(1)) row.push(item[statusKey] == 1 ? 'Active' : 'Inactive');
            return row;
        });

        return { headers, rows };
    };

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

    const handlePrint = (filtered, type, statusKey, title) => {
        const { headers, rows } = getExportData(filtered, type, statusKey);
        printTable(headers, rows, title);
    };

    const filterList = (list) => {
        if (!searchTerm) return list;
        return list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const renderTable = (list, type, statusKey, filename) => {
        const filtered = filterList(list);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentData = filtered.slice(indexOfFirstItem, indexOfLastItem);

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0' }}>
                    <input
                        type="search"
                        className="form-control input-sm"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            textAlign: isMobile ? 'center' : 'left',
                            fontSize: '13px'
                        }}
                    />
                    <div className="dt-buttons btn-group" style={{ display: isMobile ? 'flex' : 'block', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                        <button className="btn btn-default btn-sm dt-button buttons-copy buttons-html5" style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }} title="Copy" onClick={() => { const { headers, rows } = getExportData(filtered, type, statusKey); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                        <button className="btn btn-default btn-sm dt-button buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(filtered, type, statusKey); downloadExcel(headers, rows, `${filename}.xls`); }}><i className="fa fa-file-excel-o"></i></button>
                        <button className="btn btn-default btn-sm dt-button buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(filtered, type, statusKey); downloadCSV(headers, rows, `${filename}.csv`); }}><i className="fa fa-file-text-o"></i></button>
                        <button className="btn btn-default btn-sm dt-button buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(filtered, type, statusKey); downloadPDF(headers, rows, `${filename}.pdf`, filename); }}><i className="fa fa-file-pdf-o"></i></button>
                        <button className="btn btn-default btn-sm dt-button buttons-print" title="Print" onClick={() => handlePrint(filtered, type, statusKey, filename)}><i className="fa fa-print"></i></button>
                        <div className="btn-group">
                            <button className="btn btn-default btn-sm dt-button buttons-collection buttons-colvis" style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }} title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                <i className="fa fa-columns"></i>
                            </button>
                            {showColumnsDropdown && (
                                <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                    {columns.map(col => (
                                        <li key={col.index}><label style={{ fontWeight: 'normal', width: '100%', margin: 0, padding: '3px 20px', cursor: 'pointer' }}><input type="checkbox" checked={!hiddenColumns.includes(col.index)} onChange={() => toggleColumnVisibility(col.index)} style={{ marginRight: '10px' }} /> {col.label}</label></li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                {!hiddenColumns.includes(0) && <th>Name</th>}
                                {!hiddenColumns.includes(1) && <th style={{ width: "120px", textAlign: "center" }}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item) => (
                                <tr key={item.id}>
                                    {!hiddenColumns.includes(0) && <td>{item.name}</td>}
                                    {!hiddenColumns.includes(1) && <td style={{ textAlign: "center" }}>
                                        <label className="custom-switch">
                                            <input
                                                type="checkbox"
                                                checked={item[statusKey] == 1}
                                                onChange={(e) => handleToggle(item.id, e.target.checked, type)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pt15 pb15">
                    <Pagination
                        totalItems={filtered.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>
        );
    };

    return (
        <SettingsMenu hideSidebars={true}>
            <div style={{ width: "100%", marginTop: "0px" }}>
                <style>{`
                    @media (max-width: 767px) {
                        .nav-tabs-custom > .nav-tabs { display: flex; flex-direction: column; }
                        .nav-tabs-custom > .nav-tabs > li { float: none; display: block; }
                        .nav-tabs-custom > .nav-tabs > li.header { text-align: center; margin-bottom: 10px; }
                        .box-header.with-border { flex-direction: column; gap: 10px; }
                        .box-header.with-border h4 { margin-top: 10px !important; margin-bottom: 10px !important; }
                    }
                `}</style>
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
