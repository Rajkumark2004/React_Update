import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import '../../utils/include_files';
import { useTableSort } from '../../hooks/useTableSort';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const BulkDelete = () => {
    const navigate = useNavigate();

    // UI state for inputs
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI state for search results
    const [hasSearched, setHasSearched] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    // Checkbox UI states
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Responsive state
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Column definitions
    const columns = [
        { key: 'admission_no', label: 'Admission No', sortKey: 'admission_no' },
        { key: 'full_name', label: 'Student Name', sortKey: 'full_name' },
        { key: 'class_display', label: 'Class', sortKey: 'class_display' },
        { key: 'dob', label: 'Date Of Birth', sortKey: 'dob' },
        { key: 'gender', label: 'Gender' },
        { key: 'category', label: 'Category' },
        { key: 'mobile_display', label: 'Mobile Number' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // Sorting Hook
    const { sortedData: sortedStudents, requestSort, getSortIcon } = useTableSort(students, {
        asc: <i className="fa fa-angle-up pull-right"></i>,
        desc: <i className="fa fa-angle-down pull-right"></i>,
        default: <i className="fa fa-angle-up pull-right" style={{ color: '#ccc', opacity: 0.5 }}></i>
    });

    // Fetch classes on component mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.getBulkDeleteClasses();
                if (response && response.data && Array.isArray(response.data.classlist)) {
                    setClasses(response.data.classlist);
                }
            } catch (err) {
                console.warn('Failed to fetch classes:', err);
            }
        };
        fetchClasses();
    }, []);

    const handleClassChange = async (e) => {
        const selectedClassId = e.target.value;
        setClassId(selectedClassId);
        setSectionId(''); // Reset section
        setSections([]); // Clear sections
        setStudents([]); // Clear current table
        setHasSearched(false);

        if (selectedClassId) {
            try {
                const response = await api.getSectionsByClass(selectedClassId);
                if (response && response.data) {
                    setSections(response.data);
                } else if (response && Array.isArray(response)) {
                    setSections(response);
                }
            } catch (error) {
                console.error('Error fetching sections by class:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!classId) return;

        setLoading(true);
        try {
            const response = await api.searchBulkDeleteStudents(classId, sectionId);
            let sData = [];
            if (response && response.data && Array.isArray(response.data.students)) {
                sData = response.data.students;
            } else if (response && response.data && Array.isArray(response.data)) {
                sData = response.data;
            } else if (Array.isArray(response)) {
                sData = response;
            }

            // Map students to include display-friendly keys
            const mappedStudents = sData.map(s => ({
                ...s,
                full_name: s.full_name || (s.firstname + ' ' + (s.lastname || '')),
                class_display: s.class && s.section ? `${s.class} (${s.section})` : (s.class_section || s.class),
                mobile_display: s.mobile_no || s.mobileno || s.mobile
            }));

            setStudents(mappedStudents);
            setHasSearched(true);
            setSelectedStudents([]);
            setIsAllSelected(false);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
            setHasSearched(true);
        } finally {
            setLoading(false);
        }
    };

    // Filtering and Pagination Logic
    const filteredStudents = sortedStudents.filter(student => {
        const searchText = searchTerm.toLowerCase();
        const fullName = (student.full_name || '').toLowerCase();
        const admissionNo = (student.admission_no || '').toLowerCase();
        return fullName.includes(searchText) || admissionNo.includes(searchText);
    });

    const totalItems = filteredStudents.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);



    // Export helpers
    const getExportData = () => buildExportData(columns, visibleColumns, filteredStudents, (row, key) => row[key]);

    const handleDelete = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student to delete.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete the selected students?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.deleteBulkStudents(selectedStudents);
            if (response && response.status) {
                toast.success(response.message || 'Students deleted successfully');
                // Remove deleted students from the list
                setStudents(students.filter(student => !selectedStudents.includes(student.id)));
                setSelectedStudents([]);
                setIsAllSelected(false);
            } else {
                toast.error(response.message || 'Failed to delete students');
            }
        } catch (error) {
            console.error('Error deleting students:', error);
            toast.error('An error occurred while deleting students.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setIsAllSelected(checked);
        if (checked) {
            setSelectedStudents(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (e, id) => {
        const checked = e.target.checked;
        let newSelected = [...selectedStudents];
        if (checked) {
            newSelected.push(id);
        } else {
            newSelected = newSelected.filter(sid => sid !== id);
        }
        setSelectedStudents(newSelected);
        setIsAllSelected(newSelected.length === filteredStudents.length && filteredStudents.length > 0);
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                <div className="box-body pb0">
                                    <div className="row">
                                        <form role="form" onSubmit={handleSearch}>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Class</label>
                                                    <select
                                                        className="form-control"
                                                        value={classId}
                                                        onChange={handleClassChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {classes.map((cls) => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <select
                                                        className="form-control"
                                                        value={sectionId}
                                                        onChange={(e) => setSectionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {sections.map((sec) => (
                                                            <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle" style={{ padding: '6px 16px', marginBottom: '10px' }} disabled={loading}>
                                                        {loading ? <><i className="fa fa-spinner fa-spin"></i> Searching...</> : <><i className="fa fa-search"></i> Search</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {hasSearched && (
                                    <div className="box-body pt0">
                                        <div className="row">
                                            <div className="col-md-12 col-sm-12">
                                                <div className="mt10">
                                                    <div className="checkbox bordertop pt15" style={{ marginBottom: '10px', display: 'flow-root' }}>
                                                        <label style={{ fontWeight: 700 }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isAllSelected}
                                                                onChange={handleSelectAll}
                                                            /> <b>Select All</b>
                                                        </label>

                                                        {students.length > 0 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary pull-right btn-sm"
                                                                onClick={handleDelete}
                                                                disabled={loading}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Responsive Toolbar */}
                                                    <div
                                                        className="row mb-2"
                                                        style={{
                                                            marginTop: '10px',
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
                                                            {filteredStudents.length > 0 && (
                                                                <div className="dt-buttons btn-group">
                                                                    <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                                        <i className="fa fa-files-o"></i>
                                                                    </button>
                                                                    <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'bulk_delete_list.xls'); }}>
                                                                        <i className="fa fa-file-excel-o"></i>
                                                                    </button>
                                                                    <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'bulk_delete_list.csv'); }}>
                                                                        <i className="fa fa-file-text-o"></i>
                                                                    </button>
                                                                    <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'bulk_delete_list.pdf', 'Bulk Delete List'); }}>
                                                                        <i className="fa fa-file-pdf-o"></i>
                                                                    </button>
                                                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Bulk Delete List'); }}>
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
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="table-responsive overflow-visible-lg pt15 clearboth">
                                                        <div className="download_label">Bulk Delete</div>
                                                        <table className="table table-striped table-bordered table-hover example" cellSpacing="0" width="100%">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                                        <th key={col.key} className={col.sortKey ? "sorting" : ""} style={col.sortKey ? { cursor: 'pointer' } : {}} onClick={col.sortKey ? () => requestSort(col.sortKey) : undefined}>
                                                                            {col.label} {col.sortKey && getSortIcon(col.sortKey)}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {currentItems.length === 0 ? (
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
                                                                            <td>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedStudents.includes(student.id)}
                                                                                    onChange={(e) => handleSelectStudent(e, student.id)}
                                                                                />
                                                                            </td>
                                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                                <td key={col.key} style={{ wordBreak: 'break-word' }}>
                                                                                    {col.key === 'full_name' ? (
                                                                                        <Link to={`/student/view/${student.id}`}>{student[col.key]}</Link>
                                                                                    ) : col.key === 'class_display' ? (
                                                                                        <span className="white-space-nowrap">{student[col.key]}</span>
                                                                                    ) : (
                                                                                        student[col.key]
                                                                                    )}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Responsive Pagination Footer */}
                                {hasSearched && filteredStudents.length > 0 && (
                                    <div className="box-footer">
                                        <div className="pt15 pb15">
                                            <Pagination 
                                                totalItems={totalItems} 
                                                itemsPerPage={recordsPerPage} 
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default BulkDelete;
