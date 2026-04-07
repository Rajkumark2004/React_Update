import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import '../../utils/include_files';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const RoleList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState('');
    const [roleList, setRoleList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);

    const columns = [
        { key: 'name', label: 'Role' },
        { key: 'type', label: 'Type' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const formatCell = (row, key) => {
        if (key === 'name') return row.name;
        if (key === 'type') return row.is_system ? 'System' : '';
        return '';
    };

    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);

    // Fetch Roles
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.getRoles();
            if (response.status === 'success' && response.listroute) {
                // Ensure is_system is treated as a number for consistency if needed, 
                // but API returns string "1"/"0", so we can parse it or compare as string.
                // existing code uses role.is_system ? ... which works for 1/0 numbers, 
                // but for "1"/"0" strings "0" is truthy.
                // Let's map it to integer to be safe and consistent with previous mock data.
                const mappedRoles = response.listroute.map(role => ({
                    ...role,
                    id: parseInt(role.id),
                    is_system: parseInt(role.is_system)
                }));
                setRoleList(mappedRoles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    // Handle Edit Mode
    useEffect(() => {
        if (id && roleList.length > 0) {
            const roleToEdit = roleList.find(r => r.id === parseInt(id));
            if (roleToEdit) {
                setIsEditMode(true);
                setRoleName(roleToEdit.name);
            }
        } else {
            setIsEditMode(false);
            setRoleName('');
        }
    }, [id, roleList]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!roleName) {
            alert('The Name field is required.');
            return;
        }

        if (isEditMode) {
            try {
                const response = await api.updateRole(id, { name: roleName });
                if (response.status === 'success') {
                    alert('Record Updated Successfully');
                    setRoleName('');
                    setIsEditMode(false);
                    navigate('/settings/roles');
                    fetchRoles();
                } else {
                    alert(response.message || 'Failed to update role');
                }
            } catch (error) {
                alert('Failed to update role: ' + error.message);
            }
        } else {
            try {
                const response = await api.createRole({ name: roleName });
                if (response.status === 'success') { // Assuming standard success response
                    alert('Record Saved Successfully');
                    setRoleName('');
                    fetchRoles(); // Refresh list
                } else {
                    alert(response.message || 'Failed to save role');
                }
            } catch (error) {
                alert('Failed to save role: ' + error.message);
            }
        }
    };

    const handleDelete = async (deleteId) => {
        const roleToDelete = roleList.find(r => r.id === deleteId);
        if (roleToDelete && roleToDelete.is_system) {
            alert('System roles cannot be deleted.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                const response = await api.deleteRole(deleteId);
                // The API might return status 'success' or just a message. 
                // Based on standard behavior in this app so far.
                if (response.status === 'success' || response.msg) {
                    alert(response.msg || 'Record Deleted Successfully');

                    // If we were editing the deleted role, clear the form
                    if (isEditMode && parseInt(id) === deleteId) {
                        setIsEditMode(false);
                        setRoleName('');
                        navigate('/settings/roles');
                    }

                    fetchRoles(); // Refresh the list
                } else {
                    alert(response.message || 'Failed to delete role');
                }
            } catch (error) {
                alert('Failed to delete role: ' + error.message);
            }
        }
    };

    const filteredList = roleList.filter(item => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Paginated data
    const safeRecordsPerPage = recordsPerPage === -1 ? filteredList.length || 1 : recordsPerPage;
    const indexOfLastRecord = currentPage * safeRecordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - safeRecordsPerPage;
    const currentRecords = filteredList.slice(indexOfFirstRecord, indexOfLastRecord);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        {/* Left Side: Add/Edit Role form */}
                        <div className="col-md-4" style={{ marginBottom: '20px' }}>
                            <div className="box box-primary" style={{ border: 'none', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', background: '#fff' }}>
                                <div className="box-header with-border" style={{ borderBottom: '1px solid #f4f4f4', padding: '15px' }}>
                                    <h3 className="box-title" style={{ fontSize: '18px', color: '#333' }}>{isEditMode ? 'Edit Role' : 'Role'}</h3>
                                </div>
                                <form id="form1" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body" style={{ padding: '20px' }}>
                                        <div className="form-group">
                                            <label htmlFor="name" style={{ fontSize: '13px', color: '#333' }}>Name <span style={{ color: 'red' }}>*</span></label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                value={roleName}
                                                onChange={(e) => setRoleName(e.target.value)}
                                                style={{
                                                    border: 'none',
                                                    borderBottom: '1px solid #337ab7',
                                                    borderRadius: '0',
                                                    boxShadow: 'none',
                                                    padding: '5px 0'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="box-footer" style={{ borderTop: 'none', background: 'transparent', padding: '0 20px 20px 20px' }}>
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{
                                                background: '#9854cb',
                                                color: '#fff',
                                                borderRadius: '20px',
                                                padding: '5px 20px',
                                                fontSize: '13px',
                                                float: 'right',
                                                border: 'none'
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Side: Role List Table */}
                        <div className="col-md-8">
                            <div className="box box-primary" style={{ border: 'none', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', background: '#fff' }}>
                                <div className="box-body" style={{ padding: '15px' }}>
                                    <div className="role-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h3 className="box-title" style={{ fontSize: '18px', color: '#333', margin: 0 }}>Role List</h3>
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="btn"
                                            style={{
                                                background: '#9854cb',
                                                color: '#fff',
                                                borderRadius: '20px',
                                                padding: '4px 15px',
                                                fontSize: '12px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={setRecordsPerPage}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="Role_List"
                                        exportTitle="Role List"
                                    />
                                    <div className="table-responsive">
                                        <table className="table" style={{ width: '100%', marginBottom: '10px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #f4f4f4' }}>
                                                    {visibleColumns.has('name') && <th style={{ textAlign: 'left', padding: '10px 5px', color: '#333', fontSize: '13px', borderBottom: '1px solid #eee' }}>Role <i className="fa fa-sort" style={{ fontSize: '10px', color: '#ccc' }}></i></th>}
                                                    {visibleColumns.has('type') && <th style={{ textAlign: 'left', padding: '10px 5px', color: '#333', fontSize: '13px', borderBottom: '1px solid #eee' }}>Type <i className="fa fa-sort-desc" style={{ fontSize: '10px', color: '#ccc' }}></i></th>}
                                                    <th style={{ textAlign: 'right', padding: '10px 5px', color: '#333', fontSize: '13px', borderBottom: '1px solid #eee', width: '100px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentRecords.map((role) => (
                                                    <tr key={role.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                                                        {visibleColumns.has('name') && <td style={{ padding: '8px', color: '#333', fontSize: '13px' }}>{role.name}</td>}
                                                        {visibleColumns.has('type') && <td style={{ padding: '8px', color: '#333', fontSize: '13px' }}>
                                                            {role.is_system ? 'System' : ''}
                                                        </td>}
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                                            <i
                                                                className="fa fa-tag"
                                                                style={{ cursor: 'pointer', marginRight: '20px', color: '#333' }}
                                                                title="Assign Permission"
                                                                onClick={() => navigate(`/settings/roles/permission/${role.id}`)}
                                                            ></i>
                                                            <i
                                                                className="fa fa-pencil"
                                                                style={{ cursor: 'pointer', marginRight: role.is_system ? '0' : '20px', color: '#333' }}
                                                                title="Edit"
                                                                onClick={() => navigate(`/settings/roles/edit/${role.id}`)}
                                                            ></i>
                                                            {!role.is_system && (
                                                                <i
                                                                    className="fa fa-remove"
                                                                    style={{ cursor: 'pointer', color: '#333' }}
                                                                    title="Delete"
                                                                    onClick={() => handleDelete(role.id)}
                                                                ></i>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pt15 pb15">
                                            <Pagination
                                                totalItems={filteredList.length}
                                                itemsPerPage={recordsPerPage}
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default RoleList;
