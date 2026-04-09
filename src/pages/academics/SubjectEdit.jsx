import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';
const SubjectEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('');

    // Subject Types (radio options)
    const [subjectTypes, setSubjectTypes] = useState([]);

    // Data States
    const [subjectList, setSubjectList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // If we have an ID, fetch specific details using new API
            if (id) {
                const data = await api.getSubjectDetails(id);
                if (data && (data.status === 'success' || data.status === true)) {
                    // Populate Form from data.data.subject
                    if (data.data && data.data.subject) {
                        const subject = data.data.subject;
                        setName(subject.name);
                        setCode(subject.code);
                        setType(subject.type);
                    }

                    // Populate List from data.data.subjectlist
                    if (data.data && data.data.subjectlist) {
                        setSubjectList(data.data.subjectlist);
                    }

                    // Populate Types from data.data.subject_types
                    if (data.data && data.data.subject_types) {
                        const typesArray = Object.entries(data.data.subject_types).map(([key, value]) => ({
                            key,
                            value
                        }));
                        setSubjectTypes(typesArray);
                    }
                } else {
                    toast.error(data.message || 'Failed to load subject details');
                }
            } else {
                // Fallback or "Add" mode behavior if this component is ever reused without ID
                // For now, consistent with previous logic or redirect
                toast.error('No Subject ID provided');
                navigate('/admin/subject');
            }
        } catch (error) {
            console.error('Error fetching subject data:', error);
            toast.error('Failed to load subject data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);
 
    // Handlers
    const handleNameChange = (e) => {
        const val = e.target.value.slice(0, 50);
        setName(val);
        if (errors.name) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
        }
    };
 
    const handleCodeChange = (e) => {
        const val = e.target.value.slice(0, 20);
        setCode(val);
        if (errors.code) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.code;
                return newErrors;
            });
        }
    };
 
    const handleTypeChange = (e) => {
        setType(e.target.value);
        if (errors.type) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.type;
                return newErrors;
            });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrors({});
 
        let hasError = false;
        const newErrors = {};
 
        if (!name) {
            newErrors.name = 'The Subject Name field is required.';
            hasError = true;
        }
        if (!type) {
            newErrors.type = 'The Subject Type field is required.';
            hasError = true;
        }
 
        if (hasError) {
            setErrors(newErrors);
            return;
        }
 
        const payload = {
            id: id,
            name: name,
            type: type,
            code: code
        };
 
        setSubmitting(true);
        try {
            const response = await api.updateSubject(id, payload);
            if (response.status === 'success' || response.status === true) {
                toast.success('Record Updated Successfully');
                navigate('/admin/subject');
            } else if (response.status === 'fail' && response.errors) {
                setErrors(response.errors);
                const firstError = Object.values(response.errors)[0];
                toast.error(firstError || 'Validation failed');
            } else {
                toast.error(response.message || 'Failed to update subject');
            }
        } catch (error) {
            console.error('Error updating subject:', error);
            toast.error('An error occurred while updating.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteSubject(deleteId);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Deleted Successfully');
                    fetchData(); // Refresh list
                    if (String(deleteId) === String(id)) {
                        navigate('/admin/subject'); // If deleted current edit item
                    }
                } else {
                    toast.error(response.message || 'Failed to delete subject');
                }
            } catch (error) {
                console.error('Error deleting subject:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const filteredList = subjectList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const columns = [
        { key: 'subject', label: 'Subject' },
        { key: 'subject_code', label: 'Subject Code' },
        { key: 'subject_type', label: 'Subject Type' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const formatCell = (row, key) => {
        if (key === 'subject') return row.name || '';
        if (key === 'subject_code') return row.code || '';
        if (key === 'subject_type') return subjectTypes.find(t => t.key === row.type)?.value || row.type || '';
        return '';
    };

    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Academics
                    </h1>
                </section>
                <section className="content">
                    <div className="row">
                        {/* Edit Subject Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Subject</h3>
                                    <div className="btn-group pull-right visible-xs-block visible-sm-block">
                                        <button onClick={() => navigate('/admin/subject')} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Subject Name</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={handleNameChange}
                                            />
                                            {errors.name && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.name}</span>}
                                        </div>

                                        <div className="form-group">
                                            {subjectTypes.map((t) => (
                                                <label className="radio-inline" key={t.key}>
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={t.key}
                                                        checked={type === t.key}
                                                        onChange={handleTypeChange}
                                                    />
                                                    {t.value}
                                                </label>
                                            ))}
                                            <br />
                                            {errors.type && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.type}</span>}
                                        </div>

                                        <div className="form-group">
                                            <br />
                                            <label>Subject Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={code}
                                                onChange={handleCodeChange}
                                            />
                                            {errors.code && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.code}</span>}
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={submitting}>
                                            {submitting ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Subject List Table - Right Panel */}
                        <div className="col-md-8">
                            <div className="box box-primary" id="sublist">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Subject List</h3>
                                    <div className="btn-group pull-right hidden-xs hidden-sm">
                                        <button onClick={() => navigate('/admin/subject')} className="btn btn-primary btn-xs" title="Back">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div style={{ padding: '8px 10px', borderBottom: '1px solid #f4f4f4' }}>
                                        <TableToolbar
                                            searchTerm={searchTerm}
                                            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                            recordsPerPage={recordsPerPage}
                                            onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                            columns={columns}
                                            visibleColumns={visibleColumns}
                                            onToggleColumn={handleToggleColumn}
                                            getExportData={getExportData}
                                            exportFileName="Subject_List"
                                            exportTitle="Subject List"
                                        />
                                    </div>

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Subject List</div>
                                        <div className="dataTables_wrapper no-footer">
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.has('subject') && <th style={{ textAlign: 'left' }}>Subject</th>}
                                                        {visibleColumns.has('subject_code') && <th style={{ textAlign: 'left' }}>Subject Code</th>}
                                                        {visibleColumns.has('subject_type') && <th style={{ textAlign: 'left' }}>Subject Type</th>}
                                                        <th style={{ textAlign: 'right' }} className="noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map(subject => (
                                                        <tr key={subject.id}>
                                                            {visibleColumns.has('subject') && <td className="mailbox-name" style={{ textAlign: 'left' }}>{subject.name}</td>}
                                                            {visibleColumns.has('subject_code') && <td className="mailbox-name" style={{ textAlign: 'left' }}>{subject.code}</td>}
                                                            {visibleColumns.has('subject_type') && <td className="mailbox-name" style={{ textAlign: 'left' }}>
                                                                {subjectTypes.find(t => t.key === subject.type)?.value || subject.type}
                                                            </td>}
                                                            <td style={{ textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                                    <Link
                                                                        to={`/admin/subject/edit/${subject.id}`}
                                                                        className="btn btn-default btn-xs"
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </Link>
                                                                    <a
                                                                        href="#"
                                                                        className="btn btn-default btn-xs"
                                                                        title="Delete"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleDelete(subject.id);
                                                                        }}
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {currentItems.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">No Result Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                        <Pagination 
                                            totalItems={totalItems} 
                                            itemsPerPage={recordsPerPage} 
                                            currentPage={currentPage}
                                            onPageChange={(page) => setCurrentPage(page)}
                                        />
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

export default SubjectEdit;
