import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import '../../utils/include_files';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const RoleList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState('');
    const [roleList, setRoleList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10; // Roles list is usually short, 10 is fine

    const columns = [
        { index: 0, label: 'Role' },
        { index: 1, label: 'Type' }
    ];

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Role");
        if (!hiddenColumns.includes(1)) headers.push("Type");

        const rows = filteredList.map(role => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(role.name);
            if (!hiddenColumns.includes(1)) row.push(role.is_system ? 'System' : '');
            return row;
        });

        return { headers, rows };
    };

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
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredList.slice(indexOfFirstRecord, indexOfLastRecord);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        {/* Left Side: Add/Edit Role form */}
                        <div className="col-md-4">
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
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
                                        <div className="dt-buttons btn-group">
                                            <button className="btn btn-default btn-sm dt-button buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                            <button className="btn btn-default btn-sm dt-button buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Role_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                            <button className="btn btn-default btn-sm dt-button buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Role_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                            <button className="btn btn-default btn-sm dt-button buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Role_List.pdf', 'Role List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                            <button className="btn btn-default btn-sm dt-button buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Role List'); }}><i className="fa fa-print"></i></button>
                                            <div className="btn-group">
                                                <button className="btn btn-default btn-sm dt-button buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
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
                                        <table className="table" style={{ width: '100%', marginBottom: '10px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #f4f4f4' }}>
                                                    {!hiddenColumns.includes(0) && <th style={{ textAlign: 'left', padding: '10px 5px', color: '#333', fontSize: '13px', borderBottom: '1px solid #eee' }}>Role <i className="fa fa-sort" style={{ fontSize: '10px', color: '#ccc' }}></i></th>}
                                                    {!hiddenColumns.includes(1) && <th style={{ textAlign: 'left', padding: '10px 5px', color: '#333', fontSize: '13px', borderBottom: '1px solid #eee' }}>Type <i className="fa fa-sort-desc" style={{ fontSize: '10px', color: '#ccc' }}></i></th>}
                                                    <th style={{ textAlign: 'right', padding: '10px 5px', color: '#333', fontSize: '13px', borderBottom: '1px solid #eee', width: '100px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentRecords.map((role) => (
                                                    <tr key={role.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                                                        {!hiddenColumns.includes(0) && <td style={{ padding: '8px', color: '#333', fontSize: '13px' }}>{role.name}</td>}
                                                        {!hiddenColumns.includes(1) && <td style={{ padding: '8px', color: '#333', fontSize: '13px' }}>
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
