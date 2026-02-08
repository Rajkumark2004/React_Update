import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';

const StudentHostelReport = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [classlist, setClassList] = useState([]);
    const [sectionlist, setSectionList] = useState([]);
    const [hostellist, setHostelList] = useState([]);
    const [studentData, setStudentData] = useState([]);

    const [searchForm, setSearchForm] = useState({
        class_id: '',
        section_id: '',
        hostel_name: ''
    });

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
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px', marginTop: '16px' }}>
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
                                        <div className="download_label">Student Hostel Report</div>
                                        <table
                                            className="table table-striped table-bordered table-hover hostel-list"
                                            data-export-title="Student Hostel Report"
                                        >
                                            <thead>
                                                <tr>
                                                    <th>Class Section</th>
                                                    <th>Admission No</th>
                                                    <th>Student Name</th>
                                                    <th>Mobile Number</th>
                                                    <th>Guardian Phone</th>
                                                    <th>Hostel Name</th>
                                                    <th>Room Number / Name</th>
                                                    <th>Room Type</th>
                                                    <th className="text-right">Cost Per Bed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="9" className="text-center">
                                                            {loading ? 'Loading...' : 'No Record Found'}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    studentData.map((student, index) => (
                                                        <tr key={index}>
                                                            <td>{student.class_section}</td>
                                                            <td>{student.admission_no}</td>
                                                            <td>{student.student_name}</td>
                                                            <td>{student.mobile_number}</td>
                                                            <td>{student.guardian_phone}</td>
                                                            <td>{student.hostel_name}</td>
                                                            <td>{student.room_no}</td>
                                                            <td>{student.room_type}</td>
                                                            <td className="text-right">{student.cost_per_bed}</td>
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
