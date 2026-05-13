import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Calendar, Phone, Eye, Check } from 'lucide-react';
import Loader from '../../components/Loader';
import SISLayout from './SISLayout';
import { useSISCounts } from '../../context/SISCountContext';
import { api } from '../../services/api';
import '../../utils/include_files';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import { buildExportData } from '../../utils/tableExport';
import { renderName, renderGender } from '../../utils/TableFormatters';
import './StudentSearch.css';

const DisabledStudents = () => {
    const { updateCount } = useSISCounts();
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        search_text: ''
    });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    // Columns
    const columns = [
        { key: 'admission_no', label: 'Admission No' },
        { key: 'name', label: 'Student Name', width: '200px' },
        { key: 'class', label: 'Class', width: '140px' },
        { key: 'father_name', label: 'Father Name' },
        { key: 'dob', label: 'Date Of Birth' },
        { key: 'gender', label: 'Gender' },
        { key: 'category', label: 'Category' },
        { key: 'mobile', label: 'Mobile Number' }
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

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.getStudentSearchInfo();
                if (response && response.data && Array.isArray(response.data.classlist)) {
                    setClasses(response.data.classlist);
                }
            } catch (err) {
                console.warn('Failed to fetch classes:', err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchClasses();
        handleSearch(); // Auto fetch on mount
    }, []);

    // Update layout count when students list changes
    useEffect(() => {
        updateCount('disabled', students.length);
    }, [students.length, updateCount]);

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({
            ...prev,
            class_id: classId,
            section_id: ''
        }));
        setSections([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.data) {
                    setSections(response.data);
                } else if (response && Array.isArray(response)) {
                    setSections(response);
                }
            } catch (error) { }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFormData({ class_id: '', section_id: '', search_text: '' });
        setStudents([]);
        setTotalRecords(0);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        setLoading(true);
        try {
            let response;
            if (formData.class_id) {
                response = await api.getDisabledStudentList({ class_id: formData.class_id, section_id: formData.section_id });
            } else {
                response = await api.searchDisabledStudents(formData.search_text || '');
            }

            let studentData = [];
            if (response.data && Array.isArray(response.data)) {
                studentData = response.data;
            } else if (Array.isArray(response)) {
                studentData = response;
            }

            if (formData.search_text) {
                const searchLower = formData.search_text.toLowerCase();
                studentData = studentData.filter(student => {
                    const fullName = (student.full_name || `${student.firstname || ''} ${student.lastname || ''}`).toLowerCase();
                    const adminNo = (student.admission_no || '').toLowerCase();
                    return fullName.includes(searchLower) || adminNo.includes(searchLower);
                });
            }

            const mappedStudents = studentData.map(student => ({
                id: student.id,
                admission_no: student.admission_no || '-',
                name: student.full_name || (student.firstname ? student.firstname + ' ' + (student.lastname || '') : '-'),
                class: student.class_section || student.class || '-',
                father_name: student.father_name || '-',
                dob: student.dob || '-',
                gender: student.gender || '-',
                category: student.category || '-',
                mobile: student.mobile_no || student.mobileno || '-',
                reason: student.disable_reason || ''
            }));

            setStudents(mappedStudents);
            setTotalRecords(mappedStudents.length);
        } catch (err) {
            toast.error(err.message || 'Failed to fetch disabled students');
            setStudents([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleEnableStudent = async (studentId, studentName) => {
        if (window.confirm(`Are you sure you want to enable student ${studentName}?`)) {
            try {
                const response = await api.enableStudent(studentId);
                if (response.status === "success") {
                    toast.success("Student enabled successfully");
                    setStudents(prev => prev.filter(s => s.id !== studentId));
                    setTotalRecords(prev => prev - 1);
                } else {
                    toast.error(response.message || "Failed to enable student");
                }
            } catch (err) {
                toast.error("Failed to enable student");
            }
        }
    };

    const getExportData = () => buildExportData(columns, visibleColumns, students, (row, key) => row[key]);

    const totalPages = Math.ceil(students.length / recordsPerPage);
    const currentStudents = students.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    return (
        <SISLayout activeTab="disabled">
            {initialLoading ? (
                <Loader />
            ) : (
                <div className="sis-content-container">
                    <div className="sis-search-bar-container">
                        <div className="sis-search-bar-header">
                            <h3 className="sis-search-title">Disabled Students</h3>
                        </div>
                        <form onSubmit={handleSearch} className="sis-search-form">
                            <div className="sis-search-main-input-wrapper">
                                <i className="fa fa-search sis-search-icon"></i>
                                <input
                                    type="text"
                                    name="search_text"
                                    className="sis-search-input"
                                    placeholder="Search by student name, admission no..."
                                    value={formData.search_text}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="btn btn-default sis-filter-toggle-btn"
                                    onClick={() => setShowFilters(!showFilters)}
                                    style={{ marginRight: '8px' }}
                                >
                                    <i className="fa fa-filter"></i> Filter
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ marginRight: '4px' }}>
                                    Search
                                </button>
                            </div>

                            {showFilters && (
                                <div className="sis-advanced-filters">
                                    <div className="sis-filter-row">
                                        <div className="sis-filter-col">
                                            <select
                                                name="class_id"
                                                className="sis-filter-select"
                                                value={formData.class_id}
                                                onChange={handleClassChange}
                                            >
                                                <option value="">All Classes</option>
                                                {classes.map((cls) => (
                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sis-filter-col">
                                            <select
                                                name="section_id"
                                                className="sis-filter-select"
                                                value={formData.section_id}
                                                onChange={handleInputChange}
                                                disabled={!formData.class_id}
                                            >
                                                <option value="">All Sections</option>
                                                {sections.map((sec) => (
                                                    <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '1px' }}>
                                            <button type="submit" className="btn btn-primary sis-apply-btn" style={{ height: '40px', width: '100px' }}>
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="sis-list-container">
                        <div className="sis-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Disabled Students ({students.length})</h3>
                            {students.length > 0 && (
                                <PremiumTableToolbar
                                    columns={columns}
                                    visibleColumns={visibleColumns}
                                    onToggleColumn={handleToggleColumn}
                                    getExportData={getExportData}
                                    exportFileName="disabled_students"
                                    exportTitle="Disabled Students"
                                    recordsPerPage={recordsPerPage}
                                    onRecordsPerPageChange={(num) => {
                                        setRecordsPerPage(num);
                                        setCurrentPage(1);
                                    }}
                                />
                            )}
                        </div>

                        <div className="sis-list-body" style={{ padding: '0' }}>
                            {loading ? (
                                <div className="text-center p-4"><Loader type="table" rows={5} /></div>
                            ) : students.length === 0 ? (
                                <div className="sis-empty-state">
                                    <p>No data available in table</p>
                                    <img src="/images/addnewitem.svg" alt="No Data" />
                                    <p className="text-success">&lt;- Add new record or search with different criteria</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered table-hover example" style={{ margin: 0 }}>
                                        <thead>
                                            <tr className="modern-table-header">
                                                {columns.map(col => visibleColumns.has(col.key) && (
                                                    <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>
                                                ))}
                                                <th className="text-right noExport">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentStudents.map((student) => (
                                                <tr key={student.id} className="modern-table-row">
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <td key={col.key}>
                                                            {col.key === 'name' ? (
                                                                renderName(student[col.key], student.id)
                                                            ) : col.key === 'gender' ? (
                                                                renderGender(student[col.key])
                                                            ) : col.key === 'dob' ? (
                                                                <div className="cell-icon-wrapper">
                                                                    <Calendar size={14} className="cell-icon" />
                                                                    <span>{student[col.key]}</span>
                                                                </div>
                                                            ) : col.key === 'mobile' ? (
                                                                <div className="cell-icon-wrapper">
                                                                    <Phone size={14} className="cell-icon" />
                                                                    <span>{student[col.key]}</span>
                                                                </div>
                                                            ) : (
                                                                student[col.key]
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td className="text-right noExport">
                                                        <div className="action-btns-wrapper">
                                                            <Link to={`/student/view/${student.id}`} className="action-btn-circle btn-view-circle" title="View">
                                                                <Eye size={14} />
                                                            </Link>
                                                            <button className="action-btn-circle" style={{ background: '#16a34a', color: '#ffffff' }} title="Enable Student" onClick={() => handleEnableStudent(student.id, student.name)}>
                                                                <Check size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {!loading && students.length > 0 && (
                            <div style={{
                                padding: '20px 24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#ffffff',
                                borderTop: '1px solid #f1f5f9',
                                borderBottomLeftRadius: '12px',
                                borderBottomRightRadius: '12px'
                            }}>
                                <div style={{ color: '#64748b', fontSize: '14px' }}>
                                    Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, students.length)} of {students.length} entries
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-default btn-sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage === 1 ? '#cbd5e1' : '#475569' }}
                                    >
                                        <i className="fa fa-angle-left"></i>
                                    </button>
                                    <button className="btn btn-sm" style={{
                                        borderRadius: '6px',
                                        background: '#7c3aed',
                                        color: '#ffffff',
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '600'
                                    }}>
                                        {currentPage}
                                    </button>
                                    <button
                                        className="btn btn-default btn-sm"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage >= totalPages ? '#cbd5e1' : '#475569' }}
                                    >
                                        <i className="fa fa-angle-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </SISLayout>
    );
};

export default DisabledStudents;
