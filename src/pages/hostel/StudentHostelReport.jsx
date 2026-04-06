import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import { useTableSort } from '../../hooks/useTableSort';

const StudentHostelReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [classlist, setClassList] = useState([]);
    const [sectionlist, setSectionList] = useState([]);
    const [hostellist, setHostelList] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [searchForm, setSearchForm] = useState({
        class_id: '',
        section_id: '',
        hostel_name: ''
    });

    // Columns
    const columns = [
        { key: 'class_section', label: 'Class Section', sortKey: 'class_section' },
        { key: 'admission_no', label: 'Admission No', sortKey: 'admission_no' },
        { key: 'student_name', label: 'Student Name', sortKey: 'student_name' },
        { key: 'mobile_number', label: 'Mobile Number', sortKey: 'mobile_number' },
        { key: 'guardian_phone', label: 'Guardian Phone', sortKey: 'guardian_phone' },
        { key: 'hostel_name', label: 'Hostel Name', sortKey: 'hostel_name' },
        { key: 'room_no', label: 'Room Number / Name', sortKey: 'room_no' },
        { key: 'room_type', label: 'Room Type', sortKey: 'room_type' },
        { key: 'cost_per_bed', label: 'Cost Per Bed', sortKey: 'cost_per_bed' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) newVisible.delete(key);
        else newVisible.add(key);
        setVisibleColumns(newVisible);
    };

    const { sortedData, requestSort, sortConfig, getSortIcon } = useTableSort(studentData);

    const filteredStudentData = sortedData.filter(student =>
        Object.values(student).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Export Data formatting
    const formatCell = (row, key) => {
        return row[key] || '';
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, filteredStudentData, formatCell);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Load sections when class changes
        if (searchForm.class_id) {
            fetchSectionsByClass(searchForm.class_id);
        } else {
            setSectionList([]);
            setSearchForm(prev => ({ ...prev, section_id: '' }));
        }
    }, [searchForm.class_id]);

    const fetchInitialData = async () => {
        try {
            const response = await api.getStudentHostelDetails();

            if (response && response.status && response.data) {
                setClassList(response.data.classlist || []);
                setHostelList(response.data.hostellist || []);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load data');
        }
    };

    const fetchSectionsByClass = async (classId) => {
        try {
            // TODO: Replace with actual API call
            // const sections = await api.getSectionsByClass(classId);

            // Mock data for now
            setSectionList([]);
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error('Failed to load sections');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        // Validation
        if (!searchForm.class_id) {
            toast.error('Please select class');
            return;
        }
        if (!searchForm.section_id) {
            toast.error('Please select section');
            return;
        }

        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await api.searchStudentHostelDetails(searchForm);
            // setStudentData(response.data || []);

            // Mock empty data for now
            setStudentData([]);
            toast.success('Search completed');
        } catch (error) {
            console.error('Error searching:', error);
            toast.error('Failed to search student hostel details');
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
                        <i className="fa fa-building-o"></i> Hostel
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">
                                        <i className="fa fa-search"></i> Select Criteria
                                    </h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSearch} id="class_search_form">
                                    <div className="box-body row">
                                        <div className="col-sm-4 col-md-4">
                                            <div className="form-group">
                                                <label>Class<small className="req"> *</small></label>
                                                <select
                                                    name="class_id"
                                                    value={searchForm.class_id}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                    autoFocus
                                                >
                                                    <option value="">Select</option>
                                                    {classlist.map(cls => (
                                                        <option key={cls.id} value={cls.id}>
                                                            {cls.class}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="text-danger" id="error_class_id"></span>
                                            </div>
                                        </div>

                                        <div className="col-sm-4 col-md-4">
                                            <div className="form-group">
                                                <label>Section<small className="req"> *</small></label>
                                                <select
                                                    name="section_id"
                                                    value={searchForm.section_id}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                >
                                                    <option value="">Select</option>
                                                    {sectionlist.map(section => (
                                                        <option key={section.section_id} value={section.section_id}>
                                                            {section.section}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="text-danger" id="error_section_id"></span>
                                            </div>
                                        </div>

                                        <div className="col-sm-4 col-md-4">
                                            <div className="form-group">
                                                <label>Hostel Name</label>
                                                <select
                                                    name="hostel_name"
                                                    value={searchForm.hostel_name}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                >
                                                    <option value="">Select</option>
                                                    {hostellist.map((hostel, index) => (
                                                        <option key={index} value={hostel.hostel_name}>
                                                            {hostel.hostel_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <div className="col-sm-12">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-sm checkbox-toggle pull-right"
                                                    disabled={loading}
                                                >
                                                    <i className="fa fa-search"></i> {loading ? 'Searching...' : 'Search'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Results Table */}
                                <div className="">
                                    <div className="box-header ptbnull"></div>
                                    <div className="box-header ptbnull">
                                        <h3 className="box-title titlefix">
                                            <i className="fa fa-users"></i> Student Hostel Report
                                        </h3>
                                    </div>
                                    <div className="box-body table-responsive">
                                        <TableToolbar
                                            searchTerm={searchTerm}
                                            onSearchChange={setSearchTerm}
                                            showRecordsPerPage={false}
                                            columns={columns}
                                            visibleColumns={visibleColumns}
                                            onToggleColumn={toggleColumn}
                                            getExportData={getExportData}
                                            exportFileName="student_hostel_report"
                                            exportTitle="Student Hostel Report"
                                        />
                                        <table
                                            className="table table-striped table-bordered table-hover hostel-list"
                                            data-export-title="Student Hostel Report"
                                        >
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} onClick={() => requestSort(col.sortKey)} style={{ cursor: 'pointer' }} className={col.key === 'cost_per_bed' ? 'text-right' : ''}>
                                                            {col.label} {getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStudentData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size} className="text-center">
                                                            {loading ? 'Loading...' : 'No Record Found'}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredStudentData.map((student, index) => (
                                                        <tr key={index}>
                                                            {visibleColumns.has('class_section') && <td>{student.class_section}</td>}
                                                            {visibleColumns.has('admission_no') && <td>{student.admission_no}</td>}
                                                            {visibleColumns.has('student_name') && <td>{student.student_name}</td>}
                                                            {visibleColumns.has('mobile_number') && <td>{student.mobile_number}</td>}
                                                            {visibleColumns.has('guardian_phone') && <td>{student.guardian_phone}</td>}
                                                            {visibleColumns.has('hostel_name') && <td>{student.hostel_name}</td>}
                                                            {visibleColumns.has('room_no') && <td>{student.room_no}</td>}
                                                            {visibleColumns.has('room_type') && <td>{student.room_type}</td>}
                                                            {visibleColumns.has('cost_per_bed') && <td className="text-right">{student.cost_per_bed}</td>}
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
                </section>
            </div>

            <Footer />

            <style>{`
                .carousel-row {
                    margin-bottom: 10px;
                }
                .slide-row {
                    padding: 0;
                    background-color: #ffffff;
                    min-height: 150px;
                    border: 1px solid #e7e7e7;
                    overflow: hidden;
                    height: auto;
                    position: relative;
                }
                .slide-carousel {
                    width: 20%;
                    float: left;
                    display: inline-block;
                }
                .slide-carousel .carousel-indicators {
                    margin-bottom: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, .5);
                }
                .slide-carousel .carousel-indicators li {
                    border-radius: 0;
                    width: 20px;
                    height: 6px;
                }
                .slide-carousel .carousel-indicators .active {
                    margin: 1px;
                }
                .slide-content {
                    position: absolute;
                    top: 0;
                    left: 20%;
                    display: block;
                    float: left;
                    width: 80%;
                    max-height: 76%;
                    padding: 1.5% 2% 2% 2%;
                    overflow-y: auto;
                }
                .slide-content h4 {
                    margin-bottom: 3px;
                    margin-top: 0;
                }
                .slide-footer {
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    width: 78%;
                    height: 20%;
                    margin: 1%;
                }
                .slide-content::-webkit-scrollbar {
                    width: 5px;
                }
                .slide-content::-webkit-scrollbar-thumb:vertical {
                    margin: 5px;
                    background-color: #999;
                    -webkit-border-radius: 5px;
                }
                .slide-content::-webkit-scrollbar-button:start:decrement,
                .slide-content::-webkit-scrollbar-button:end:increment {
                    height: 5px;
                    display: block;
                }
            `}</style>
        </div>
    );
};

export default StudentHostelReport;
