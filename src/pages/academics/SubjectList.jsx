import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';

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

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Subject");
        if (!hiddenColumns.includes(1)) headers.push("Subject Code");
        if (!hiddenColumns.includes(2)) headers.push("Subject Type");

        const rows = filteredList.map(subject => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(subject.name);
            if (!hiddenColumns.includes(1)) row.push(subject.code);
            if (!hiddenColumns.includes(2)) row.push(subjectTypes.find(t => t.key === subject.type)?.value || subject.type);
            return row;
        });

        return { headers, rows };
    };

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
                                    <div className="dt-controls-between">
                                        {/* Search Left */}
                                        <div id="DataTables_Table_0_filter" className="dataTables_filter">
                                            <input
                                                type="search"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                            />
                                        </div>

                                        {/* Export Icons Right */}
                                        <div className="dt-buttons btn-group">
                                            <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><span><i className="fa fa-files-o"></i></span></a>
                                            <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Subject_List.csv'); }}><span><i className="fa fa-file-text-o"></i></span></a>
                                            <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Subject_List.xls'); }}><span><i className="fa fa-file-excel-o"></i></span></a>
                                            <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Subject_List.pdf'); }}><span><i className="fa fa-file-pdf-o"></i></span></a>
                                            <a className="btn btn-default buttons-print btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Subject List'); }}><span><i className="fa fa-print"></i></span></a>
                                            <div className="btn-group">
                                                <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><span><i className="fa fa-columns"></i></span></a>
                                                {showColumnsDropdown && (
                                                    <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                        <li>
                                                            <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Subject</label>
                                                        </li>
                                                        <li>
                                                            <label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Subject Code</label>
                                                        </li>
                                                        <li>
                                                            <label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Subject Type</label>
                                                        </li>
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="table-responsive mailbox-messages">
                                        <div className="download_label">Subject List</div>
                                        <div className="dataTables_wrapper no-footer">

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {!hiddenColumns.includes(0) && <th style={{ textAlign: 'left' }}>Subject</th>}
                                                        {!hiddenColumns.includes(1) && <th style={{ textAlign: 'left' }}>Subject Code</th>}
                                                        {!hiddenColumns.includes(2) && <th style={{ textAlign: 'left' }}>Subject Type</th>}
                                                        <th style={{ textAlign: 'right' }} className="no-print noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map(subject => (
                                                        <tr key={subject.id}>
                                                            {!hiddenColumns.includes(0) && <td className="mailbox-name" style={{ textAlign: 'left' }}>{subject.name}</td>}
                                                            {!hiddenColumns.includes(1) && <td className="mailbox-name" style={{ textAlign: 'left' }}>{subject.code}</td>}
                                                            {!hiddenColumns.includes(2) && <td className="mailbox-name" style={{ textAlign: 'left' }}>
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
                                                    {filteredList.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">No Result Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>

                                            </div> {/* Closes dataTables_wrapper */}
                                    </div> {/* Closes table-responsive */}

                                    {/* Bottom Control Bar Moved Outside */}
                                    <div className="dt-info-left">
                                        <div className="dataTables_info">
                                            Records: 1 to {filteredList.length} of {subjectList.length}
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

export default SubjectList;
