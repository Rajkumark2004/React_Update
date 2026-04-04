import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import AttendanceSidebar from '../../components/AttendanceSidebar';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const AttendanceReport = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD for date input
    });
    const [errors, setErrors] = useState({});

    // New states for search and export
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const columns = [
        { key: 'sno', label: 'S.NO' },
        { key: 'admission_no', label: 'Admission No' },
        { key: 'roll_no', label: 'Roll Number' },
        { key: 'name', label: 'Name' },
        { key: 'attendance', label: 'Attendance' },
        { key: 'note', label: 'Note' }
    ];


    const filteredList = studentList.filter(student => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (student.admission_no || '').toLowerCase().includes(searchLower) ||
            (student.roll_no || '').toLowerCase().includes(searchLower) ||
            (`${student.firstname || ''} ${student.lastname || ''}`).toLowerCase().includes(searchLower) ||
            (student.att_type || '').toLowerCase().includes(searchLower) ||
            (student.remark || '').toLowerCase().includes(searchLower)
        );
    });

    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentRecords = filteredList.slice(indexOfFirstItem, indexOfLastItem);



    const formatCell = (row, key) => {
        if (key === 'sno') return filteredList.indexOf(row) + 1;
        if (key === 'admission_no') return row.admission_no || '';
        if (key === 'roll_no') return row.roll_no || '';
        if (key === 'name') return `${row.firstname || ''} ${row.lastname || ''}`.trim();
        if (key === 'attendance') return row.att_type || 'Unknown';
        if (key === 'note') return row.remark || '';
        return '';
    };

    const getVisibleColumnsSet = () => new Set(columns.filter((_, i) => !hiddenColumns.includes(i)).map(c => c.key));

    const handleCopy = () => {
        const { headers, rows } = buildExportData(columns, getVisibleColumnsSet(), filteredList, formatCell);
        copyToClipboard(headers, rows);
    };

    const handleCSV = () => {
        const { headers, rows } = buildExportData(columns, getVisibleColumnsSet(), filteredList, formatCell);
        downloadCSV(headers, rows, 'attendance_report.csv');
    };

    const handleExcel = () => {
        const { headers, rows } = buildExportData(columns, getVisibleColumnsSet(), filteredList, formatCell);
        downloadExcel(headers, rows, 'attendance_report.xls');
    };

    const handlePDF = () => {
        const { headers, rows } = buildExportData(columns, getVisibleColumnsSet(), filteredList, formatCell);
        downloadPDF(headers, rows, 'attendance_report.pdf', 'Attendance Report');
    };

    const handlePrint = () => {
        const { headers, rows } = buildExportData(columns, getVisibleColumnsSet(), filteredList, formatCell);
        printTable(headers, rows, 'Attendance Report');
    };


    // Derive CSS class from attendance type name
    const getClassForType = (typeName) => {
        const name = (typeName || '').toLowerCase();
        if (name.includes('present')) return 'label label-success';
        if (name.includes('late')) return 'label label-primary';
        if (name.includes('absent')) return 'label label-danger';
        if (name.includes('holiday')) return 'label label-default';
        if (name.includes('half')) return 'label label-info';
        return 'label label-warning';
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            // Use getStudentCreate which returns the classlist reliably
            const response = await api.getStudentCreate();
            if (response && response.status === 'success' && response.data && response.data.classlist) {
                setClassList(response.data.classlist);
            } else {
                setClassList([]);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        setSectionList([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status === 'success' && response.data) {
                    setSectionList(response.data);
                } else if (Array.isArray(response)) {
                    setSectionList(response);
                } else if (response && response.sections) {
                    setSectionList(response.sections);
                } else {
                    setSectionList(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setStudentList([]);
        setErrors({});

        const newErrors = {};
        if (!formData.class_id) newErrors.class_id = 'The Class field is required';
        if (!formData.section_id) newErrors.section_id = 'The Section field is required';
        if (!formData.date) newErrors.date = 'The Date field is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            // Convert YYYY-MM-DD → DD-MM-YYYY for the API (same as StudentAttendance)
            const formattedDate = formData.date ? formData.date.split('-').reverse().join('-') : '';
            const data = await api.searchAttendance(formData.class_id, formData.section_id, formattedDate);

            if (data.status && data.students) {
                setStudentList(data.students);
                if (data.students.length === 0) {
                    toast.error('No attendance records found');
                } else {
                    toast.success('Attendance records loaded');
                }
            } else {
                toast.error(data.message || 'Attendance not submitted for this class');
            }
        } catch (error) {
            toast.error(error.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-calendar-check-o"></i> Attendance <small>by date</small>
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
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                        <div className="btn-group pull-right">
                                            <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <form onSubmit={handleSearch}>
                                        <div className="box-body">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Class <small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={formData.class_id}
                                                            onChange={handleClassChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {classList.map(cls => (
                                                                <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                            ))}
                                                        </select>
                                                        {errors.class_id && <span className="text-danger">{errors.class_id}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Section <small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={formData.section_id}
                                                            onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                                                        >
                                                            <option value="">Select</option>
                                                            {sectionList.map(sec => (
                                                                <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                            ))}
                                                        </select>
                                                        {errors.section_id && <span className="text-danger">{errors.section_id}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Attendance Date <small className="req"> *</small></label>
                                                        <div className="input-group" style={{ position: 'relative', width: '100%', borderBottom: '1px solid #ccc' }}>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={formData.date}
                                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: 0, paddingBottom: '4px' }}
                                                            />
                                                        </div>
                                                        {errors.date && <span className="text-danger">{errors.date}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                            <i className="fa fa-search"></i> Search
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    {studentList.length > 0 && (
                                        <div className="">
                                            <div className="box-header ptbnull"></div>
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-users"></i> Attendance List</h3>
                                            </div>
                                            <div className="box-body">
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
                                                                    <option value="-1">All</option>
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
                                                                    width: '180px',
                                                                    border: 'none',
                                                                    borderBottom: '1px solid #ccc',
                                                                    borderRadius: '0',
                                                                    boxShadow: 'none',
                                                                    backgroundColor: 'transparent',
                                                                    paddingLeft: '0',
                                                                    outline: 'none',
                                                                    textAlign: isMobile ? 'center' : 'left'
                                                                }}
                                                                value={searchTerm}
                                                                onChange={(e) => {
                                                                    setSearchTerm(e.target.value);
                                                                    setCurrentPage(1);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={isMobile ? "text-center" : "col-sm-6 text-right"}>
                                                        <div className="dt-buttons btn-group">
                                                            <button className="btn btn-default btn-sm" onClick={handleCopy} title="Copy" style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                                <i className="fa fa-files-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" onClick={handleExcel} title="Excel">
                                                                <i className="fa fa-file-excel-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" onClick={handleCSV} title="CSV">
                                                                <i className="fa fa-file-text-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" onClick={handlePDF} title="PDF">
                                                                <i className="fa fa-file-pdf-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" onClick={handlePrint} title="Print">
                                                                <i className="fa fa-print"></i>
                                                            </button>
                                                            <div className="btn-group">
                                                                <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                                                    <i className="fa fa-columns"></i>
                                                                </button>
                                                                {showColumnsDropdown && (
                                                                    <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                                        {columns.map((col, idx) => (
                                                                            <label key={idx} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left' }}>
                                                                                <input type="checkbox" checked={!hiddenColumns.includes(idx)} onChange={() => toggleColumnVisibility(idx)} style={{ marginRight: '6px' }} />
                                                                                {col.label}
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mailbox-controls">
                                                    <div className="pull-right"></div>
                                                </div>
                                                <div className="download_label">Attendance List</div>
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-striped example">
                                                        <thead>
                                                            <tr>
                                                                {!hiddenColumns.includes(0) && <th>S.NO</th>}
                                                                {!hiddenColumns.includes(1) && <th>Admission No</th>}
                                                                {!hiddenColumns.includes(2) && <th>Roll Number</th>}
                                                                {!hiddenColumns.includes(3) && <th>Name</th>}
                                                                {!hiddenColumns.includes(4) && <th>Attendance</th>}
                                                                {!hiddenColumns.includes(5) && <th>Note</th>}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentRecords.map((student, index) => {
                                                                const attLabel = student.att_type || 'Unknown';
                                                                const attClass = getClassForType(attLabel);
                                                                return (
                                                                    <tr key={index}>
                                                                        {!hiddenColumns.includes(0) && <td>{indexOfFirstItem + index + 1}</td>}
                                                                        {!hiddenColumns.includes(1) && <td>{student.admission_no}</td>}
                                                                        {!hiddenColumns.includes(2) && <td>{student.roll_no}</td>}
                                                                        {!hiddenColumns.includes(3) && <td>{student.firstname} {student.lastname}</td>}
                                                                        {!hiddenColumns.includes(4) && <td>
                                                                            <small className={attClass}>
                                                                                {attLabel}
                                                                            </small>
                                                                        </td>}
                                                                        {!hiddenColumns.includes(5) && <td>{student.remark}</td>}
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="pt15 pb15">
                                                    <Pagination 
                                                        totalItems={totalItems} 
                                                        itemsPerPage={recordsPerPage} 
                                                        currentPage={currentPage}
                                                        onPageChange={(page) => setCurrentPage(page)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
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

export default AttendanceReport;
