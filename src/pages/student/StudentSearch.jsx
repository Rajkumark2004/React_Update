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


const BASE_URL = 'https://newlayout.wisibles.com';

const getImageUrl = (imagePath, gender) => {
    if (imagePath && imagePath !== "") {
        return `${BASE_URL}/${imagePath}`;
    }
    if (gender === 'Female') return `${BASE_URL}/uploads/student_images/default_female.jpg`;
    return `${BASE_URL}/uploads/student_images/default_male.jpg?1769064211`;
};


const StudentSearch = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        search_text: ''
    });
    const [students, setStudents] = useState([]);
    // const [masterStudents, setMasterStudents] = useState([]); // Removed internal search state
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState(null); // 'filter' or 'keyword'
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

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

    // Sorting Hook
    const { sortedData: sortedStudents, requestSort, getSortIcon } = useTableSort(students, {
        asc: <i className="fa fa-angle-up pull-right"></i>,
        desc: <i className="fa fa-angle-down pull-right"></i>,
        default: <i className="fa fa-angle-up pull-right" style={{ color: '#ccc', opacity: 0.5 }}></i>
    });

    // Column definitions
    const columns = [
        { key: 'admission_no', label: 'Admission No', sortKey: 'admission_no' },
        { key: 'name', label: 'Student Name', sortKey: 'name' },
        { key: 'class', label: 'Class', sortKey: 'class' },
        { key: 'father_name', label: 'Father Name', sortKey: 'father_name' },
        { key: 'dob', label: 'Date Of Birth', sortKey: 'dob' },
        { key: 'gender', label: 'Gender' },
        { key: 'category', label: 'Category' },
        { key: 'mobile', label: 'Mobile Number' }
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

    // Client-side table filter
    const filteredStudents = sortedStudents.filter(s =>
        tableSearchTerm === '' || Object.values(s).some(val => String(val).toLowerCase().includes(tableSearchTerm.toLowerCase()))
    );

    // Calculate pagination
    const totalItems = filteredStudents.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

    const changePage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // Export helpers
    const getExportData = () => buildExportData(columns, visibleColumns, filteredStudents, (row, key) => row[key]);


    // Fetch classes on component mount
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
    }, []);

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({
            ...prev,
            class_id: classId,
            section_id: '' // Reset section when class changes
        }));
        setSections([]); // Clear sections

        if (classId) {
            try {
                // Fetch sections for the selected class
                const response = await api.getSectionsByClass(classId);
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



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSearch = async (e, type) => {
        e.preventDefault();
        if (loading || initialLoading) return;
        setError('');

        setLoading(true);
        setSearchType(type);
        try {
            let params = {};
            let classId = '';
            let sectionId = '';

            if (type === 'filter') {
                if (!formData.class_id) {
                    toast.error('Please select a class');
                    setLoading(false);
                    return;
                }
                classId = formData.class_id;
                sectionId = formData.section_id;
                params = { srch_type: 'search_filter' };
            } else if (type === 'keyword') {
                // Keyword search is global, ignore class/section dropdowns
                classId = '';
                sectionId = '';
                params = {
                    srch_type: 'search_full',
                    search: formData.search_text
                };
            }

            const response = await api.getStudentList(
                classId,
                sectionId,
                params
            );

            // Handle response data structure
            let studentData = [];
            if (response.data && Array.isArray(response.data)) {
                studentData = response.data;
            } else if (Array.isArray(response)) {
                studentData = response;
            }

            const mappedStudents = studentData.map(student => ({
                id: student.id,
                student_session_id: student.student_session_id,
                admission_no: student.admission_no,
                // Handle different name fields if API varies
                name: student.full_name || (student.firstname ? student.firstname + ' ' + (student.lastname || '') : ''),
                class: student.class_section || student.class,
                father_name: student.father_name,
                dob: student.dob,
                gender: student.gender,
                category: student.category || '',
                mobile: student.mobile_no || student.mobileno,
                image: student.image || '',
                samagra_id: student.samagra_id || student.local_identification_no || student.local_id || '-',
                guardian_name: student.guardian_name || '-',
                guardian_phone: student.guardian_phone || student.guardian_phone_no || '-',
                current_address: student.current_address || student.address || '-',
                custom_fields: student.custom_fields || []
            }));

            // Remove duplicates based on ID to prevent key errors
            const uniqueStudents = Array.from(new Map(mappedStudents.map(item => [item.id, item])).values());

            setStudents(uniqueStudents);
            setCurrentPage(1); // Reset page on new search
            setTotalRecords(response.total || uniqueStudents.length);
        } catch (err) {
            console.error('Search Error:', err);
            toast.error(err.message || 'Failed to fetch students');
            setStudents([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
            setSearchType(null);
        }
    };


    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                {/* Content Header (Page header) */}
                <section className="content-header">
                    <h1>
                        <i className="fa fa-user-plus"></i> Student Information
                        <small></small>
                    </h1>
                </section>

                {/* Main content */}
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-2 hide-mobile">
                                <div className="box border0">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Student Information</h3>
                                    </div>
                                    <ul className="tablists">
                                        <li><Link to="/student/search" className="active"><img src="/images/student_details.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Student Details</Link></li>
                                        <li><Link to="/student/create"><img src="/images/student_admission.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Student Admission</Link></li>
                                        <li><Link to="/admin/onlinestudent"><img src="/images/online_admission.png" alt="icon3" className="img-fluid" style={{ width: '20px' }} /> Online Admission</Link></li>
                                        <li><Link to="/student/disabled"><img src="/images/disabled_students.png" alt="icon4" className="img-fluid" style={{ width: '20px' }} /> Disabled Students</Link></li>
                                        <li><Link to="/student/bulkdelete"><img src="/images/bulk_delete.png" alt="icon6" className="img-fluid" style={{ width: '20px' }} /> Bulk Delete</Link></li>
                                        {/* <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/student_details.png" alt="icon5" className="img-fluid" style={{ width: '20px' }} /> Multi Class Student</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/student_category.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Student Categories</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/student_house.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Student House</a></li>*/}
                                        <li><Link to="/admin/disable-reason"><img src="/images/disabled_reason.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Disable Reason</Link></li>
                                        {/*  <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/admission_intake.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Admissions Intake</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/behavioural_note.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Behavioural Note</a></li>
                                        <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/my_day_today.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> My Day Today</a></li>*/}
                                    </ul>
                                </div>
                            </div>

                            <div className="col-md-10">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    </div>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <form role="form" className="class_search_form" onSubmit={(e) => handleSearch(e, 'filter')}>
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label>Class</label> <small className="req"> *</small>
                                                                <select
                                                                    autoFocus=""
                                                                    id="class_id"
                                                                    name="class_id"
                                                                    className="form-control"
                                                                    value={formData.class_id}
                                                                    onChange={handleClassChange}
                                                                >
                                                                    <option value="">Select</option>
                                                                    {classes.map((cls) => (
                                                                        <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                                    ))}
                                                                </select>
                                                                <span className="text-danger" id="error_class_id"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label>Section</label>
                                                                <select
                                                                    id="section_id"
                                                                    name="section_id"
                                                                    className="form-control"
                                                                    value={formData.section_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select</option>
                                                                    {sections.map((sec) => (
                                                                        <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                                    ))}
                                                                </select>
                                                                <span className="text-danger"></span>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-12">
                                                            <div className="form-group">

                                                                <button type="submit" name="search" value="search_filter" className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                                    {loading && searchType === 'filter' ? (
                                                                        <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                                    ) : (
                                                                        <><i className="fa fa-search"></i> Search</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <form role="form" className="class_search_form" onSubmit={(e) => handleSearch(e, 'keyword')}>
                                                            <div className="form-group">
                                                                <label>Search By Keyword</label>
                                                                <input
                                                                    type="text"
                                                                    name="search_text"
                                                                    id="search_text"
                                                                    className="form-control"
                                                                    value={formData.search_text}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Search By Student Name, Roll Number, Enroll Number, National Id, Local Id Etc."
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <button type="submit" name="search" value="search_full" className="btn btn-primary pull-right btn-sm checkbox-toggle">
                                                                    {loading && searchType === 'keyword' ? (
                                                                        <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                                    ) : (
                                                                        <><i className="fa fa-search"></i> Search</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
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
                                            <a href="#tab_1" data-toggle="tab" aria-expanded="true" onClick={() => setActiveTab('list')}>
                                                <i className="fa fa-list"></i> List View
                                            </a>
                                        </li>
                                        <li className={activeTab === 'details' ? 'active' : ''}>
                                            <a href="#tab_2" data-toggle="tab" aria-expanded="false" onClick={() => setActiveTab('details')}>
                                                <i className="fa fa-newspaper-o"></i> Details View
                                            </a>
                                        </li>
                                    </ul>
                                    <div className="tab-content">
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
                                                            value={tableSearchTerm}
                                                            onChange={(e) => {
                                                                setTableSearchTerm(e.target.value);
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
                                                            <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'student_list.xls'); }}>
                                                                <i className="fa fa-file-excel-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'student_list.csv'); }}>
                                                                <i className="fa fa-file-text-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'student_list.pdf', 'Student List'); }}>
                                                                <i className="fa fa-file-pdf-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Student List'); }}>
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
                                            <div className="table-responsive overflow-visible-lg">
                                                <table className="table table-striped table-bordered table-hover student-list">
                                                    <thead>
                                                        <tr>
                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                <th key={col.key} className={col.sortKey ? "sorting" : ""} style={col.sortKey ? { cursor: 'pointer' } : {}} onClick={col.sortKey ? () => requestSort(col.sortKey) : undefined}>
                                                                    {col.label} {col.sortKey && getSortIcon(col.sortKey)}
                                                                </th>
                                                            ))}
                                                            <th className="text-right noExport">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan={visibleColumns.size + 1} className="text-center">
                                                                    <Loader type="table" rows={10} />
                                                                </td>
                                                            </tr>
                                                        ) : filteredStudents.length === 0 ? (
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
                                                                            {col.key === 'name' ? <Link to={`/student/view/${student.id}`}>{student[col.key]}</Link> : student[col.key]}
                                                                        </td>
                                                                    ))}
                                                                    <td className="text-right noExport">
                                                                        <Link to={`/student/view/${student.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="View">
                                                                            <i className="fa fa-reorder"></i>
                                                                        </Link>
                                                                        <Link to={`/student/edit/${student.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
                                                                            <i className="fa fa-pencil"></i>
                                                                        </Link>
                                                                        <Link to={`/studentfee/addfee/${student.student_session_id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Add Fees">
                                                                            ₹
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
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
                                                            <div className="carousel slide slide-carousel">
                                                                <div className="carousel-inner">
                                                                    <div className="item active">
                                                                        <Link to={`/student/view/${student.id}`}>
                                                                            <img
                                                                                className="img-responsive img-thumbnail width150"
                                                                                alt={student.name}
                                                                                src={getImageUrl(student.image, student.gender)}
                                                                                onError={(e) => {
                                                                                    e.target.onerror = null;
                                                                                    e.target.src = getImageUrl('', student.gender);
                                                                                }}
                                                                            />
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="slide-content">
                                                                <h4><Link to={`/student/view/${student.id}`}> {student.name}</Link></h4>
                                                                <div className="row">
                                                                    <div className="col-xs-6 col-md-6">
                                                                        <address>
                                                                            <strong><b>Class: </b>{student.class}</strong><br />
                                                                            <b>Admission No: </b>{student.admission_no}<br />
                                                                            <b>Date Of Birth: </b>{student.dob}<br />
                                                                            <b>Gender:&nbsp;</b>{student.gender}<br />
                                                                        </address>
                                                                    </div>
                                                                    <div className="col-xs-6 col-md-6">
                                                                        <b>Local Identification Number:&nbsp;</b>{student.samagra_id}<br />
                                                                        <b>Guardian Name:&nbsp;</b>{student.guardian_name}<br />
                                                                        <b>Guardian Phone:&nbsp;</b><i className="fa fa-phone-square"></i> {student.guardian_phone}<br />
                                                                        <b>Current Address:&nbsp;</b>{student.current_address}<br />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="slide-footer">
                                                                <span className="pull-right buttons">
                                                                    <Link to={`/student/view/${student.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="View">
                                                                        <i className="fa fa-reorder"></i>
                                                                    </Link>
                                                                    <Link to={`/student/edit/${student.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
                                                                        <i className="fa fa-pencil"></i>
                                                                    </Link>
                                                                    <Link to={`/studentfee/addfee/${student.student_session_id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Collect Fees">
                                                                        ₹
                                                                    </Link>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
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
                                                        {totalPages > 0 && totalPages < 1000 && [...Array(totalPages)].map((_, i) => {
                                                            const p = i + 1;
                                                            return (
                                                                <li key={i} className={`paginate_button ${currentPage === p ? 'active' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); changePage(p); }}>{p}</a>
                                                                </li>
                                                            );
                                                        })}
                                                        <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); changePage(currentPage + 1); }}><i className="fa fa-angle-right"></i></a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
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

export default StudentSearch;
