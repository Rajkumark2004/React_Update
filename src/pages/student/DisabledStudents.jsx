import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import '../../utils/include_files';
import { useTableSort } from '../../hooks/useTableSort';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';

const DisabledStudents = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [students, setStudents] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [disableReasons, setDisableReasons] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [searchText, setSearchText] = useState('');

    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const columns = [
        { key: 'admission_no', label: 'Admission No' },
        { key: 'firstname', label: 'Student Name' },
        { key: 'class', label: 'Class' },
        { key: 'father_name', label: 'Father Name' },
        { key: 'disable_reason', label: 'Disable Reason' },
        { key: 'gender', label: 'Gender' },
        { key: 'mobileno', label: 'Mobile Number' },
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    // Sorting Hook
    const { sortedData: sortedStudents, requestSort, getSortIcon } = useTableSort(students, {
        asc: <i className="fa fa-angle-up pull-right"></i>,
        desc: <i className="fa fa-angle-down pull-right"></i>,
        default: <i className="fa fa-angle-up pull-right" style={{ color: '#ccc', opacity: 0.5 }}></i>
    });

    // Client-side table filter
    const filteredStudents = sortedStudents.filter(s => {
        if (tableSearchTerm === '') return true;
        const term = tableSearchTerm.toLowerCase();
        return [s.admission_no, getFullName(s), s.class, s.section, s.father_name, s.gender, s.mobileno]
            .some(val => String(val ?? '').toLowerCase().includes(term));
    });

    // Pagination Logic
    const totalItems = filteredStudents.length;
    const indexOfLastItem = currentPage * recordsPerPage;
    const indexOfFirstItem = indexOfLastItem - recordsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

    const changePage = (pageNumber) => {
        const totalPages = Math.ceil(totalItems / recordsPerPage);
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // Export helpers
    const getExportData = () => buildExportData(columns, visibleColumns, filteredStudents, (student, key) => {
        if (key === 'firstname') return getFullName(student);
        if (key === 'class') return `${student.class}(${student.section})`;
        if (key === 'disable_reason') return getDisableReason(student.dis_reason);
        return student[key];
    });

    // Fetch classes on component mount
    useEffect(() => {
        fetchClasses();
    }, []);

    // Fetch sections when class changes
    useEffect(() => {
        if (classId) {
            fetchSections(classId);
        } else {
            setSectionList([]);
            setSectionId('');
        }
    }, [classId]);

    const fetchClasses = async () => {
        try {
            const response = await api.getDisabledStudentsPreData();
            if (response && response.status && response.data && response.data.classlist) {
                setClassList(response.data.classlist);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchSections = async (classId) => {
        try {
            const response = await api.getSectionsByClass(classId);
            if (response && response.data) {
                setSectionList(response.data);
            } else if (response && Array.isArray(response)) {
                setSectionList(response);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleClassSearch = async (e) => {
        e.preventDefault();
        if (!classId) {
            toast.error('Please select a class');
            return;
        }
        setLoading(true);
        setCurrentPage(1);
        try {
            const response = await api.getDisabledStudentList({
                class_id: classId,
                section_id: sectionId,
                search_type: 'filter'
            });
            if (response.status) {
                const studentList = response.data || response.students || [];
                setStudents(studentList);

                if (response.disable_reason) {
                    setDisableReasons(response.disable_reason);
                } else if (response.disable_reasons) {
                    setDisableReasons(response.disable_reasons);
                }
            }
            setSearchPerformed(true);
        } catch (error) {
            console.error('Error searching students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeywordSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setCurrentPage(1);
        try {
            const response = await api.searchDisabledStudents(searchText);

            if (response.status) {
                const studentList = response.data || response.students || [];
                setStudents(studentList);

                if (response.disable_reason) {
                    setDisableReasons(response.disable_reason);
                } else if (response.disable_reasons) {
                    setDisableReasons(response.disable_reasons);
                }
            }
            setSearchPerformed(true);
        } catch (error) {
            console.error('Error searching students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get image URL
    const getImageUrl = (imagePath) => {
        if (imagePath) {
            return `https://newlayout.wisibles.com/${imagePath}`;
        }
        return 'https://newlayout.wisibles.com/uploads/student_images/no_image.png';
    };

    // Get full name
    const getFullName = (student) => {
        return [student.firstname, student.middlename, student.lastname]
            .filter(Boolean)
            .join(' ');
    };

    // Get disable reason text
    const getDisableReason = (reasonId) => {
        if (disableReasons[reasonId]) {
            return disableReasons[reasonId].reason || '-';
        }
        return '-';
    };

    // Enable student handler
    const handleEnableStudent = async (studentId, studentName) => {
        if (!window.confirm("Are you sure you want to enable this student?")) {
            return;
        }
        try {
            const response = await api.enableStudent(studentId);
            if (response.status === 'success' || response.status === true) {
                toast.success(response.message || 'Student enabled successfully');
                setStudents(prev => prev.filter(s => s.id !== studentId));
            } else {
                toast.error(response.message || 'Failed to enable student');
            }
        } catch (error) {
            console.error('Enable student error:', error);
            toast.error(error.message || 'Failed to enable student');
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-user-plus"></i> Student Information
                        <small></small>
                    </h1>
                </section>

                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">
                                            <i className="fa fa-search"></i> Select Criteria
                                        </h3>
                                        <div className="btn-group pull-right">
                                            <button onClick={() => window.history.back()} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>

                                    <div className="box-body">
                                        {successMessage && (
                                            <div className="alert alert-success">{successMessage}</div>
                                        )}

                                        <div className="row">
                                            {/* Class/Section Filter */}
                                            <div className="col-md-6">
                                                <div className="row">
                                                    <form onSubmit={handleClassSearch}>
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label>Class <small className="req">*</small></label>
                                                                <select
                                                                    id="class_id"
                                                                    name="class_id"
                                                                    className="form-control"
                                                                    value={classId}
                                                                    onChange={(e) => setClassId(e.target.value)}
                                                                    autoFocus
                                                                >
                                                                    <option value="">Select</option>
                                                                    {classList.map((cls) => (
                                                                        <option key={cls.id} value={cls.id}>
                                                                            {cls.class}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label>Section</label>
                                                                <select
                                                                    id="section_id"
                                                                    name="section_id"
                                                                    className="form-control"
                                                                    value={sectionId}
                                                                    onChange={(e) => setSectionId(e.target.value)}
                                                                >
                                                                    <option value="">Select</option>
                                                                    {sectionList.map((section) => (
                                                                        <option key={section.section_id || section.id} value={section.section_id}>{section.section}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-12">
                                                            <div className="form-group">
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-primary btn-sm pull-right"
                                                                    disabled={loading}
                                                                >
                                                                    <i className="fa fa-search"></i> Search
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>

                                            {/* Keyword Search */}
                                            <div className="col-md-6">
                                                <div className="row">
                                                    <form onSubmit={handleKeywordSearch}>
                                                        <div className="col-sm-12">
                                                            <div className="form-group">
                                                                <label>Search By Keyword</label>
                                                                <input
                                                                    type="text"
                                                                    name="search_text"
                                                                    className="form-control"
                                                                    placeholder="Search by student name"
                                                                    value={searchText}
                                                                    onChange={(e) => setSearchText(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-12">
                                                            <div className="form-group">
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-primary pull-right btn-sm"
                                                                    disabled={loading}
                                                                >
                                                                    <i className="fa fa-search"></i> Search
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Section */}
                                <div className="nav-tabs-custom border0 navnoshadow">
                                    <div className="box-header ptbnull"></div>
                                    <ul className="nav nav-tabs">
                                        <li className={activeTab === 'list' ? 'active' : ''}>
                                            <a href="#tab_1" onClick={(e) => { e.preventDefault(); setActiveTab('list'); }}>
                                                <i className="fa fa-list"></i> List View
                                            </a>
                                        </li>
                                        <li className={activeTab === 'details' ? 'active' : ''}>
                                            <a href="#tab_2" onClick={(e) => { e.preventDefault(); setActiveTab('details'); }}>
                                                <i className="fa fa-newspaper-o"></i> Details View
                                            </a>
                                        </li>
                                    </ul>

                                    <div className="tab-content">
                                        {/* List View Tab */}
                                        <div className={`tab-pane ${activeTab === 'list' ? 'active' : ''} no-padding`} id="tab_1">
                                            <div
                                                className="row mb-2"
                                                style={{
                                                    marginBottom: '10px',
                                                    display: isMobile ? 'flex' : 'block',
                                                    flexDirection: isMobile ? 'column' : 'row',
                                                    alignItems: isMobile ? 'center' : 'stretch',
                                                    gap: isMobile ? '15px' : '0'
                                                }}
                                            >
                                                <div
                                                    className={isMobile ? "" : "col-sm-6"}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: isMobile ? '15px' : '20px',
                                                        justifyContent: isMobile ? 'center' : 'flex-start',
                                                        flexWrap: 'wrap'
                                                    }}
                                                >
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
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className="dataTables_filter">
                                                        <input
                                                            type="search"
                                                            className="form-control input-sm"
                                                            placeholder="Search..."
                                                            style={{
                                                                marginLeft: isMobile ? '0' : '10px',
                                                                display: 'inline-block',
                                                                width: isMobile ? '180px' : '180px',
                                                                border: 'none',
                                                                borderBottom: '1px solid #ccc',
                                                                borderRadius: '0',
                                                                boxShadow: 'none',
                                                                backgroundColor: 'transparent',
                                                                paddingLeft: '0',
                                                                outline: 'none',
                                                                textAlign: isMobile ? 'center' : 'left'
                                                            }}
                                                            value={tableSearchTerm}
                                                            onChange={(e) => {
                                                                setTableSearchTerm(e.target.value);
                                                                setCurrentPage(1);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className={isMobile ? "text-center" : "col-sm-6 text-right"}>
                                                    <div className="dt-buttons btn-group">
                                                        <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                            <i className="fa fa-files-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'disabled_students.xls'); }}>
                                                            <i className="fa fa-file-excel-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'disabled_students.csv'); }}>
                                                            <i className="fa fa-file-text-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'disabled_students.pdf', 'Disabled Students'); }}>
                                                            <i className="fa fa-file-pdf-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Disabled Students'); }}>
                                                            <i className="fa fa-print"></i>
                                                        </button>
                                                        <div className="btn-group">
                                                            <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                                                <i className="fa fa-columns"></i>
                                                            </button>
                                                            {showColumnsDropdown && (
                                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                                    {columns.map(col => (
                                                                        <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left' }}>
                                                                            <input type="checkbox" checked={visibleColumns.has(col.key)} onChange={() => toggleColumn(col.key)} style={{ marginRight: '6px' }} />
                                                                            {col.label}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="table-responsive overflow-visible-lg">
                                                <table className="table table-striped table-bordered table-hover student-list">
                                                <thead>
                                                    <tr>
                                                        {columns.map(col => visibleColumns.has(col.key) && (
                                                            <th key={col.key} className="sorting" style={{ cursor: 'pointer' }} onClick={() => requestSort(col.key)}>
                                                                {col.label} {getSortIcon(col.key)}
                                                            </th>
                                                        ))}
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan={visibleColumns.size + 1} className="text-center">
                                                                <Loader type="table" rows={recordsPerPage} />
                                                            </td>
                                                        </tr>
                                                    ) : currentItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={visibleColumns.size + 1} className="text-center">
                                                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                                    <div style={{ color: '#ffb3b3ff', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                                    <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                                    <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        currentItems.map((student) => (
                                                            <tr key={student.id}>
                                                                {columns.map(col => visibleColumns.has(col.key) && (
                                                                    <td key={col.key} style={{ wordBreak: 'break-word' }}>
                                                                        {col.key === 'firstname' ? (
                                                                            <Link to={`/student/view/${student.id}`}>{getFullName(student)}</Link>
                                                                        ) : col.key === 'class' ? (
                                                                            `${student.class}(${student.section})`
                                                                        ) : col.key === 'disable_reason' ? (
                                                                            <span data-toggle="tooltip" title={student.dis_note || ''} style={{ cursor: 'pointer' }}>
                                                                                {getDisableReason(student.dis_reason)}
                                                                            </span>
                                                                        ) : (student[col.key] || '-')}
                                                                    </td>
                                                                ))}
                                                                <td className="text-right white-space-nowrap noExport">
                                                                    <Link to={`/student/view/${student.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="View" style={{ marginRight: '3px' }}>
                                                                        <i className="fa fa-reorder"></i>
                                                                    </Link>
                                                                    <button className="btn btn-success btn-xs" data-toggle="tooltip" title="Enable Student" onClick={() => handleEnableStudent(student.id, getFullName(student))}>
                                                                        <i className="fa fa-check"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                                </table>
                                            </div>

                                            <div className="box-footer">
                                                <div className="row" style={{ display: isMobile ? 'flex' : 'block', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'stretch', gap: isMobile ? '10px' : '0' }}>
                                                    <div className={isMobile ? "text-center" : "col-sm-5"}>
                                                        <div className="dataTables_info">
                                                            Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                                                        </div>
                                                    </div>
                                                    <div className={isMobile ? "text-center" : "col-sm-7"}>
                                                        <div className={`dataTables_paginate paging_simple_numbers ${isMobile ? '' : 'pull-right'}`}>
                                                            <ul className="pagination" style={{ margin: 0 }}>
                                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); changePage(currentPage - 1); }}><i className="fa fa-angle-left"></i></a>
                                                                </li>
                                                                {Math.ceil(totalItems / recordsPerPage) > 0 && [...Array(Math.ceil(totalItems / recordsPerPage))].map((_, i) => {
                                                                    const p = i + 1;
                                                                    if (Math.ceil(totalItems / recordsPerPage) > 10 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== Math.ceil(totalItems / recordsPerPage)) return null;
                                                                    return (
                                                                        <li key={i} className={`paginate_button ${currentPage === p ? 'active' : ''}`}>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); changePage(p); }}>{p}</a>
                                                                        </li>
                                                                    );
                                                                })}
                                                                <li className={`paginate_button next ${currentPage === Math.ceil(totalItems / recordsPerPage) || totalItems === 0 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); changePage(currentPage + 1); }}><i className="fa fa-angle-right"></i></a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details View Tab */}
                                        <div className={`tab-pane ${activeTab === 'details' ? 'active' : ''}`} id="tab_2">
                                            {loading ? (
                                                <div className="text-center" style={{ padding: '20px' }}>
                                                    <Loader type="table" rows={5} />
                                                </div>
                                            ) : students.length === 0 ? (
                                                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', minHeight: '200px' }}>
                                                    <div style={{ color: '#999', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                    <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                    <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                                </div>
                                            ) : (
                                                students.map((student) => (
                                                    <div className="carousel-row" key={student.id}>
                                                        <div className="slide-row">
                                                            <div id={`carousel-${student.id}`} className="carousel slide slide-carousel" data-ride="carousel">
                                                                <div className="carousel-inner">
                                                                    <div className="item active">
                                                                        <Link to={`/student/view/${student.id}`}>
                                                                            <img
                                                                                className="img-responsive img-thumbnail width150"
                                                                                alt={getFullName(student)}
                                                                                src={getImageUrl(student.image)}
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="slide-content">
                                                                <h4>
                                                                    <Link to={`/student/view/${student.id}`}>
                                                                        {getFullName(student)}
                                                                    </Link>
                                                                </h4>
                                                                <div className="row">
                                                                    <div className="col-xs-6 col-md-6">
                                                                        <address>
                                                                            <strong><b>Class: </b>{student.class}({student.section})</strong><br />
                                                                            <b>Admission No: </b>{student.admission_no || '-'}<br />
                                                                            <b>Date of Birth: </b>{student.dob || '-'}<br />
                                                                            <b>Gender:&nbsp;</b>{student.gender || '-'}<br />
                                                                        </address>
                                                                    </div>
                                                                    <div className="col-xs-6 col-md-6">
                                                                        <b>Local Identification Number:&nbsp;</b>{student.samagra_id || '-'}<br />
                                                                        <b>Guardian Name:&nbsp;</b>{student.guardian_name || '-'}<br />
                                                                        <b>Guardian Phone: </b>
                                                                        <abbr title="Phone"><i className="fa fa-phone-square"></i>&nbsp;</abbr>
                                                                        {student.guardian_phone || '-'}<br />
                                                                        <b>Current Address:&nbsp;</b>{student.current_address || '-'} {student.city || ''}<br />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="slide-footer">
                                                                <span className="pull-right buttons">
                                                                    <Link
                                                                        to={`/student/view/${student.id}`}
                                                                        className="btn btn-default btn-xs"
                                                                        data-toggle="tooltip"
                                                                        title="View"
                                                                    >
                                                                        <i className="fa fa-reorder"></i>
                                                                    </Link>
                                                                    {' '}
                                                                    <button
                                                                        className="btn btn-success btn-xs"
                                                                        data-toggle="tooltip"
                                                                        title="Enable Student"
                                                                        onClick={() => handleEnableStudent(student.id, getFullName(student))}
                                                                    >
                                                                        <i className="fa fa-check"></i>
                                                                    </button>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default DisabledStudents;
