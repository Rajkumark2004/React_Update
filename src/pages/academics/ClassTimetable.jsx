import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';

const ClassTimetable = () => {
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const data = await api.getClassReportPreData();
            console.log('Class Report Pre-Data Response:', data);
            if (data && data.status === 'success') {
                setClassList(data.classlist || []);
            }
        } catch (error) {
            console.error('Error fetching class report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (classId) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setSectionList([]);
        if (!classId) return;

        try {
            const data = await api.getSectionsByClass(classId);
            console.log('Sections API Response:', data);

            // Response structure is {status: true, data: [...] }
            if (data && data.status && Array.isArray(data.data)) {
                setSectionList(data.data);
            } else if (Array.isArray(data)) {
                setSectionList(data);
            } else {
                setSectionList([]);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedSection) return;

        setSearchLoading(true);
        try {
            const sessionId = localStorage.getItem('activeSessionId') || localStorage.getItem('defaultSessionId') || '9';
            const payload = {
                class_id: selectedClass,
                section_id: selectedSection,
                session_id: sessionId,
                search: 'search'
            };
            const data = await api.getClassTimetable(payload);
            console.log('Timetable Response:', data);

            if (data && data.status) {
                setTimetable(data.timetable || data.result || null);
            } else {
                setTimetable(data.timetable || data || null);
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Academics</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/admin/timetable/classreport" className="active"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/1.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Class Timetable</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/timetable/mytimetable"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/2.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Teachers Timetable</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/teacher/assign_class_teacher"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/3.png" alt="icon3" className="img-fluid" style={{ width: '20px' }} /> Assign Class Teacher</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/stdtransfer"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/4.png" alt="icon4" className="img-fluid" style={{ width: '20px' }} /> Promote Students</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/subjectgroup"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/5.png" alt="icon5" className="img-fluid" style={{ width: '20px' }} /> Subject Group</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/subject"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/6.png" alt="icon6" className="img-fluid" style={{ width: '20px' }} /> Subjects</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/classes"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/7.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Class</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/section"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/8.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Sections</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/teacher/assign_subject_teacher"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/9.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Assign Subject Teacher</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-10">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="box-tools pull-right">
                                        <Link to="/admin/timetable/create" className="btn btn-sm btn-primary">
                                            <i className="fa fa-plus"></i> Add
                                        </Link>
                                    </div>
                                </div>
                                <form onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={selectedClass}
                                                        onChange={(e) => handleClassChange(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {loading ? <option disabled>Loading...</option> :
                                                            classList.map((cls) => (
                                                                <option key={cls.id || cls.class_id} value={cls.id || cls.class_id}>{cls.class || cls.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Section</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={selectedSection}
                                                        onChange={(e) => setSelectedSection(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {sectionList.length === 0 && selectedClass && !loading ? <option disabled>No sections found</option> :
                                                            sectionList.map((sec) => (
                                                                <option key={sec.section_id || sec.id} value={sec.section_id || sec.id}>{sec.section || sec.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-primary pull-right btn-sm" disabled={searchLoading || !selectedClass || !selectedSection}>
                                            {searchLoading ? <><i className="fa fa-spinner fa-spin"></i> Searching...</> : <><i className="fa fa-search"></i> Search</>}
                                        </button>
                                    </div>
                                </form>

                                {timetable && (
                                    <>
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover table-striped">
                                                    <thead>
                                                        <tr>
                                                            {Object.keys(timetable).map((day) => (
                                                                <th key={day} className="text" style={{ textTransform: 'capitalize' }}>{day}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            {Object.keys(timetable).map((day) => (
                                                                <td key={day} className="text" width="14%" style={{ verticalAlign: 'top' }}>
                                                                    {!timetable[day] || timetable[day].length === 0 ? (
                                                                        <div className="attachment-block block-b-noraml clearfix" style={{ padding: '10px', borderRadius: '4px' }}>
                                                                            <b className="text text-danger"><i className="fa fa-times-circle text-danger"></i> Not Scheduled</b><br />
                                                                        </div>
                                                                    ) : (
                                                                        timetable[day].map((item, index) => (
                                                                            <div key={index} className="attachment-block attachment-block-normal clearfix" style={{ padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                                                                                <div className="relative attachment-left-space" style={{ marginBottom: '5px' }}>
                                                                                    <i className="fa fa-book"></i> <strong style={{ fontWeight: '500' }}>Subject:</strong> {item.subject_name} {item.code && `(${item.code})`}
                                                                                </div>
                                                                                <div className="relative attachment-left-space" style={{ marginBottom: '5px' }}>
                                                                                    <i className="fa fa-clock-o"></i> {item.time_from} <b className="text text-center">-</b> <strong>{item.time_to}</strong>
                                                                                </div>
                                                                                <div className="relative attachment-left-space">
                                                                                    <i className="fa fa-building"></i> <strong style={{ fontWeight: '500' }}>Room No:</strong> {item.room_no}
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
            <style jsx>{`
                .tablists {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .tablists li {
                    border-bottom: 1px solid #f4f4f4;
                }
                .tablists li a {
                    display: block;
                    padding: 10px;
                    color: #444;
                    text-decoration: none;
                }
                .tablists li.active a {
                    background: #f4f4f4;
                    font-weight: bold;
                    border-left: 3px solid #3c8dbc;
                }
                .attachment-block {
                    border: 1px solid #f4f4f4;
                    padding: 5px;
                    margin-bottom: 10px;
                    background: #f7f7f7;
                }
                .attachment-block-normal {
                    border-left: 3px solid #3c8dbc;
                }
                .block-b-noraml {
                    border-left: 3px solid #dd4b39;
                }
                .req {
                    color: red;
                }
            `}</style>
        </div>
    );
};

export default ClassTimetable;
