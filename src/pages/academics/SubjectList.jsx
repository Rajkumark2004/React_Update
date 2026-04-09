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

const SubjectList = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [subjectName, setSubjectName] = useState('');
    const [subjectType, setSubjectType] = useState('');
    const [subjectCode, setSubjectCode] = useState('');

    // Subject Types (radio options) - now dynamic
    const [subjectTypes, setSubjectTypes] = useState([]);

    // Data States
    const [subjectList, setSubjectList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    // Fetch Initial Data
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const data = await api.getSubjectList();
            if (data && (data.status === 'success' || data.status === true)) {
                setSubjectList(data.subjectlist || []);

                // Map subject_types object to array for rendering
                if (data.subject_types) {
                    const typesArray = Object.entries(data.subject_types).map(([key, value]) => ({
                        key,
                        value
                    }));
                    setSubjectTypes(typesArray);
                }
            } else {
                toast.error(data.message || 'Failed to load subjects');
            }
        } catch (error) {
            console.error('Error fetching subject list:', error);
            toast.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Handle Edit Mode
    useEffect(() => {
        if (id && subjectList.length > 0) {
            const subjectToEdit = subjectList.find(s => s.id === parseInt(id));
            if (subjectToEdit) {
                setIsEditMode(true);
                setSubjectName(subjectToEdit.name);
                setSubjectCode(subjectToEdit.code);
                setSubjectType(subjectToEdit.type);
            }
        } else {
            setIsEditMode(false);
            setSubjectName('');
            setSubjectCode('');
            setSubjectType('');
        }
    }, [id, subjectList]);

    // Handlers
    const handleNameChange = (e) => {
        const val = e.target.value.slice(0, 50);
        setSubjectName(val);
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
        setSubjectCode(val);
        if (errors.code) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.code;
                return newErrors;
            });
        }
    };

    const handleTypeChange = (e) => {
        setSubjectType(e.target.value);
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

        if (!subjectName) {
            newErrors.name = 'The Subject Name field is required.';
            hasError = true;
        }
        if (!subjectType) {
            newErrors.type = 'The Subject Type field is required.';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            name: subjectName,
            type: subjectType,
            code: subjectCode
        };

        setSubmitting(true);
        try {
            if (isEditMode) {
                // TODO: Implement Edit API when available
                toast.success('Edit functionality pending API integration');
                // navigate('/admin/subject'); 
            } else {
                const response = await api.addSubject(payload);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Saved Successfully');
                    fetchInitialData();
                    // Reset form
                    setSubjectName('');
                    setSubjectCode('');
                    setSubjectType('');
                } else if (response.status === 'fail' && response.errors) {
                    setErrors(response.errors);
                    const firstError = Object.values(response.errors)[0];
                    toast.error(firstError || 'Validation failed');
                } else {
                    toast.error(response.message || 'Failed to save subject');
                }
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            toast.error('An error occurred while saving.');
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
                    fetchInitialData();
                } else {
                    toast.error(response.message || 'Failed to delete subject');
                }
            } catch (error) {
                console.error('Error deleting subject:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

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
                        {/* Add/Edit Subject Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Subject' : 'Add Subject'}</h3>
                                    <div className="btn-group pull-right visible-xs-block visible-sm-block">
                                        <button onClick={() => navigate('/admin/timetable/classreport')} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Subject Name</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                type="text"
                                                className="form-control"
                                                placeholder=""
                                                value={subjectName}
                                                onChange={handleNameChange}
                                            />
                                            {errors.name && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.name}</span>}
                                        </div>

                                        {/* Subject Type Radio Buttons */}
                                        <div className="form-group">
                                            {subjectTypes.map((type) => (
                                                <label className="radio-inline" key={type.key}>
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={type.key}
                                                        checked={subjectType === type.key}
                                                        onChange={handleTypeChange}
                                                    />
                                                    {type.value}
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
                                                placeholder=""
                                                value={subjectCode}
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
                                        <button onClick={() => navigate('/admin/timetable/classreport')} className="btn btn-primary btn-xs">
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

                                    <div className="table-responsive mailbox-messages">
                                        <div className="download_label">Subject List</div>
                                        <div className="dataTables_wrapper no-footer">

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.has('subject') && <th style={{ textAlign: 'left' }}>Subject</th>}
                                                        {visibleColumns.has('subject_code') && <th style={{ textAlign: 'left' }}>Subject Code</th>}
                                                        {visibleColumns.has('subject_type') && <th style={{ textAlign: 'left' }}>Subject Type</th>}
                                                        <th style={{ textAlign: 'right' }} className="no-print noExport">Action</th>
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
                                                            <td className="no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
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

                                            </div> {/* Closes dataTables_wrapper */}
                                    </div> {/* Closes table-responsive */}

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

export default SubjectList;
