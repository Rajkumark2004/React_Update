import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SettingsMenu from "../../components/SettingsMenu";
import { api } from "../../services/api";
import "../../index.css";
import '../../utils/include_files';
import toast from 'react-hot-toast';
import { usePermissions } from '../../context/PermissionContext';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
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

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(50);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'action', label: 'Action' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const getExportData = (filtered, type, statusKey) => {
        const formatCell = (row, key) => {
            if (key === 'name') return row.name;
            if (key === 'action') return row[statusKey] == 1 ? 'Active' : 'Inactive';
            return '';
        };
        return buildExportData(columns, visibleColumns, filtered, formatCell);
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


    const filterList = (list) => {
        if (!searchTerm) return list;
        return list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const renderTable = (list, type, statusKey, filename) => {
        const filtered = filterList(list);
        const safeRecordsPerPage = recordsPerPage === -1 ? filtered.length || 1 : recordsPerPage;
        const indexOfLastItem = currentPage * safeRecordsPerPage;
        const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
        const currentData = filtered.slice(indexOfFirstItem, indexOfLastItem);

        return (
            <div>
                <TableToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    recordsPerPage={recordsPerPage}
                    onRecordsPerPageChange={setRecordsPerPage}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    onToggleColumn={handleToggleColumn}
                    getExportData={() => getExportData(filtered, type, statusKey)}
                    exportFileName={filename}
                    exportTitle={filename}
                />

                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                {visibleColumns.has('name') && <th>Name</th>}
                                {visibleColumns.has('action') && <th style={{ width: "120px", textAlign: "center" }}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item) => (
                                <tr key={item.id}>
                                    {visibleColumns.has('name') && <td>{item.name}</td>}
                                    {visibleColumns.has('action') && <td style={{ textAlign: "center" }}>
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
                        itemsPerPage={recordsPerPage}
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
