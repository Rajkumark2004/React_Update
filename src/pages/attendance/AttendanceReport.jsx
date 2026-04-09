import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import AttendanceSidebar from '../../components/AttendanceSidebar';
import { api } from '../../services/api';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
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

    const columns = [
        { key: 'sno', label: 'S.NO' },
        { key: 'admission_no', label: 'Admission No' },
        { key: 'roll_no', label: 'Roll Number' },
        { key: 'name', label: 'Name' },
        { key: 'attendance', label: 'Attendance' },
        { key: 'note', label: 'Note' }
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

    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);


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
                                                        exportFileName="attendance_report"
                                                        exportTitle="Attendance Report"
                                                    />
                                                </div>

                                                <div className="mailbox-controls">
                                                    <div className="pull-right"></div>
                                                </div>
                                                <div className="download_label">Attendance List</div>
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-striped example">
                                                        <thead>
                                                            <tr>
                                                                {visibleColumns.has('sno') && <th>S.NO</th>}
                                                                {visibleColumns.has('admission_no') && <th>Admission No</th>}
                                                                {visibleColumns.has('roll_no') && <th>Roll Number</th>}
                                                                {visibleColumns.has('name') && <th>Name</th>}
                                                                {visibleColumns.has('attendance') && <th>Attendance</th>}
                                                                {visibleColumns.has('note') && <th>Note</th>}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentRecords.map((student, index) => {
                                                                const attLabel = student.att_type || 'Unknown';
                                                                const attClass = getClassForType(attLabel);
                                                                return (
                                                                    <tr key={index}>
                                                                        {visibleColumns.has('sno') && <td>{indexOfFirstItem + index + 1}</td>}
                                                                        {visibleColumns.has('admission_no') && <td>{student.admission_no}</td>}
                                                                        {visibleColumns.has('roll_no') && <td>{student.roll_no}</td>}
                                                                        {visibleColumns.has('name') && <td>{student.firstname} {student.lastname}</td>}
                                                                        {visibleColumns.has('attendance') && <td>
                                                                            <small className={attClass}>
                                                                                {attLabel}
                                                                            </small>
                                                                        </td>}
                                                                        {visibleColumns.has('note') && <td>{student.remark}</td>}
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
