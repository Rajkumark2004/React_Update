import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const SubjectTeacher = () => {
    const navigate = useNavigate();

    // Form States
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [subjectId, setSubjectId] = useState('');

    // Data States
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [teacherList, setTeacherList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [assignmentList, setAssignmentList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const headers = ['Class', 'Section', 'Staff Name', 'Subject'];

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(col => col !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const exportHeaders = headers.filter((_, i) => !hiddenColumns.includes(i));
        const exportRows = filteredList.map(item => {
            const rowData = [];
            if (!hiddenColumns.includes(0)) rowData.push(item.class);
            if (!hiddenColumns.includes(1)) rowData.push(item.section);
            if (!hiddenColumns.includes(2)) rowData.push(`${item.name} ${item.surname} (${item.employee_id})`);
            if (!hiddenColumns.includes(3)) rowData.push(item.subject_name);
            return rowData;
        });
        return { headers: exportHeaders, rows: exportRows };
    };

    // Fetch Initial Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getAssignSubjectTeacher();
            if (data && (data.status === 'success' || data.status === true)) {
                setClassList(data.classlist || []);
                setSubjectList(data.batch_subjects || []);
                setTeacherList(data.staff_list || []);
                setAssignmentList(data.subject_data || []);
            } else {
                toast.error(data.message || 'Failed to load data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch Sections when Class Changes
    useEffect(() => {
        const fetchSections = async () => {
            if (classId) {
                try {
                    const data = await api.getSectionsByClass(classId);
                    if (data && (data.status === 'success' || data.status === true)) {
                        // Handle potential different response structures for sections
                        const sections = data.sections || data.data || Object.values(data);
                        setSectionList(sections);
                    } else {
                        setSectionList([]);
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    toast.error('Failed to load sections');
                    setSectionList([]);
                }
            } else {
                setSectionList([]);
            }
            setSectionId('');
        };

        fetchSections();
    }, [classId]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!classId || !sectionId || !teacherId || !subjectId) {
            toast.error('Please fill all required fields');
            return;
        }

        const payload = {
            class: classId,
            section: sectionId,
            teacher: teacherId,
            subject_id: subjectId
        };

        try {
            const response = await api.assignSubjectTeacher(payload);
            if (response.status === 'success' || response.status === true) {
                toast.success('Record Saved Successfully');
                // Reset form fields for next entry (keep class/section)
                setTeacherId('');
                setSubjectId('');
                // Refresh list
                fetchData();
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            toast.error('An error occurred while saving');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteSubjectTeacher(id);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Deleted Successfully');
                    fetchData();
                } else {
                    toast.error(response.message || 'Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting assignment:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const filteredList = assignmentList.filter(item =>
        item.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

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
                        {/* Add Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Assign Subject Teacher</h3>
                                    <div className="btn-group pull-right visible-xs-block visible-sm-block">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Class</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={classId}
                                                onChange={(e) => setClassId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Section</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={sectionId}
                                                onChange={(e) => setSectionId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {sectionList.map(s => <option key={s.section_id} value={s.section_id}>{s.section}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Teacher</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={teacherId}
                                                onChange={(e) => setTeacherId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {teacherList.map(t => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name} {t.surname} ({t.employee_id})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Subject</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={subjectId}
                                                onChange={(e) => setSubjectId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {subjectList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Table - Right Panel */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Teacher List</h3>
                                    <div className="btn-group pull-right hidden-xs hidden-sm">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="dt-controls-between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                            <div className="dataTables_length">
                                                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                    Records:
                                                    <select
                                                        value={recordsPerPage}
                                                        onChange={(e) => {
                                                            setRecordsPerPage(Number(e.target.value));
                                                            setCurrentPage(1);
                                                        }}
                                                        className="form-control input-sm"
                                                        style={{ width: '80px', margin: '0 10px' }}
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                        <option value="-1">All</option>
                                                    </select>
                                                </label>
                                            </div>
                                            {/* Search */}
                                            <div id="DataTables_Table_0_filter" className="dataTables_filter" style={{ display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type="search"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Export Icons Right */}
                                        <div className="dt-buttons btn-group">
                                            <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><span><i className="fa fa-files-o"></i></span></a>
                                            <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Subject_Teacher.csv'); }}><span><i className="fa fa-file-text-o"></i></span></a>
                                            <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Subject_Teacher.xls'); }}><span><i className="fa fa-file-excel-o"></i></span></a>
                                            <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Subject_Teacher.pdf'); }}><span><i className="fa fa-file-pdf-o"></i></span></a>
                                            <a className="btn btn-default buttons-print btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Subject Teacher'); }}><span><i className="fa fa-print"></i></span></a>
                                            <div className="btn-group">
                                                <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><span><i className="fa fa-columns"></i></span></a>
                                                {showColumnsDropdown && (
                                                    <div className="dt-button-collection" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '150px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                        <label style={{ display: 'block', cursor: 'pointer', padding: '5px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left', margin: 0 }}>
                                                            <input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} style={{ marginRight: '8px' }} /> Class
                                                        </label>
                                                        <label style={{ display: 'block', cursor: 'pointer', padding: '5px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left', margin: 0 }}>
                                                            <input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} style={{ marginRight: '8px' }} /> Section
                                                        </label>
                                                        <label style={{ display: 'block', cursor: 'pointer', padding: '5px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left', margin: 0 }}>
                                                            <input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} style={{ marginRight: '8px' }} /> Staff Name
                                                        </label>
                                                        <label style={{ display: 'block', cursor: 'pointer', padding: '5px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left', margin: 0 }}>
                                                            <input type="checkbox" checked={!hiddenColumns.includes(3)} onChange={() => toggleColumnVisibility(3)} style={{ marginRight: '8px' }} /> Subject
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Teacher List</div>
                                        <div className="dataTables_wrapper no-footer">
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {!hiddenColumns.includes(0) && <th style={{ textAlign: 'left' }}>Class</th>}
                                                        {!hiddenColumns.includes(1) && <th style={{ textAlign: 'left' }}>Section</th>}
                                                        {!hiddenColumns.includes(2) && <th style={{ textAlign: 'left' }}>Staff Name</th>}
                                                        {!hiddenColumns.includes(3) && <th style={{ textAlign: 'left' }}>Subject</th>}
                                                        <th style={{ textAlign: 'right' }} className="noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map(item => (
                                                        <tr key={item.stid}>
                                                            {!hiddenColumns.includes(0) && <td className="mailbox-name" style={{ textAlign: 'left' }}>{item.class}</td>}
                                                            {!hiddenColumns.includes(1) && <td style={{ textAlign: 'left' }}>{item.section}</td>}
                                                            {!hiddenColumns.includes(2) && <td style={{ textAlign: 'left' }}>{item.name} {item.surname} ({item.employee_id})</td>}
                                                            {!hiddenColumns.includes(3) && <td style={{ textAlign: 'left' }}>{item.subject_name}</td>}
                                                            <td style={{ textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                                    <a
                                                                        href="#"
                                                                        className="btn btn-default btn-xs"
                                                                        title="Delete"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleDelete(item.stid);
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
                                                            <td colSpan="5" className="text-center">No Result Found</td>
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

export default SubjectTeacher;
