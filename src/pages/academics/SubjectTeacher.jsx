import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { buildExportData } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';
import TableToolbar from '../../utils/TableToolbar';

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

    const columns = [
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'teacher', label: 'Staff Name' },
        { key: 'subject_name', label: 'Subject' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const formatCell = (row, key) => {
        if (key === 'teacher') return `${row.name} ${row.surname} (${row.employee_id})`;
        return row[key] || '-';
    };

    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);

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
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={toggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="subject_teacher_list"
                                        exportTitle="Teacher List"
                                    />

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Teacher List</div>
                                        <div className="dataTables_wrapper no-footer">
                                                    <table className="table table-striped table-bordered table-hover example">
                                                        <thead>
                                                            <tr>
                                                                {!visibleColumns.has('class') ? null : <th style={{ textAlign: 'left' }}>Class</th>}
                                                                {!visibleColumns.has('section') ? null : <th style={{ textAlign: 'left' }}>Section</th>}
                                                                {!visibleColumns.has('teacher') ? null : <th style={{ textAlign: 'left' }}>Staff Name</th>}
                                                                {!visibleColumns.has('subject_name') ? null : <th style={{ textAlign: 'left' }}>Subject</th>}
                                                                <th style={{ textAlign: 'right' }} className="noExport">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentItems.map(item => (
                                                                <tr key={item.stid}>
                                                                    {!visibleColumns.has('class') ? null : <td className="mailbox-name" style={{ textAlign: 'left' }}>{item.class}</td>}
                                                                    {!visibleColumns.has('section') ? null : <td style={{ textAlign: 'left' }}>{item.section}</td>}
                                                                    {!visibleColumns.has('teacher') ? null : <td style={{ textAlign: 'left' }}>{item.name} {item.surname} ({item.employee_id})</td>}
                                                                    {!visibleColumns.has('subject_name') ? null : <td style={{ textAlign: 'left' }}>{item.subject_name}</td>}
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
