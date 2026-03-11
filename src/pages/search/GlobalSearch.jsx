import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import '../../utils/include_files';
import { useTableSort } from '../../hooks/useTableSort';

const GlobalSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [activeTab, setActiveTab] = useState('list');
    const [searchQuery, setSearchQuery] = useState(query);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);

    const { sortedData: sortedStudents, requestSort, getSortIcon } = useTableSort(students);

    useEffect(() => {
        if (query) {
            handleSearch(query);
            setSearchQuery(query);
        }
        setInitialLoading(false);
    }, [query]);

    const handleSearch = async (textToSearch) => {
        if (!textToSearch.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await api.searchStudentsGlobal(textToSearch);

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
                name: student.full_name || student.firstname + ' ' + (student.lastname || ''),
                class: student.class_section || student.class,
                father_name: student.father_name,
                dob: student.dob,
                gender: student.gender,
                category: student.category || '',
                mobile: student.mobile_no || student.mobileno,
                image: student.image ? `https://newlayout.wisibles.com/${student.image}` : (student.gender === 'Female' ? "/uploads/student_images/default_female.jpg" : "/uploads/student_images/default_male.jpg")
            }));

            // Remove duplicates
            const uniqueStudents = Array.from(new Map(mappedStudents.map(item => [item.id, item])).values());

            setStudents(uniqueStudents);
            setTotalRecords(response.total || uniqueStudents.length);
        } catch (err) {
            console.error('Search Error:', err);
            toast.error(err.message || 'Failed to fetch search results');
            setStudents([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchQuery });
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-search"></i> Search Results
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
                                        <h3 className="box-title"><i className="fa fa-search"></i> Search</h3>
                                    </div>
                                    <div className="box-body">
                                        <form role="form" onSubmit={onSubmit} className="row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search By Student Name, Roll Number, Enroll Number, National Id, Local Id Etc."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <button type="submit" className="btn btn-primary btn-sm checkbox-toggle" disabled={loading}>
                                                    {loading ? (
                                                        <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                    ) : (
                                                        <><i className="fa fa-search"></i> Search</>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Results Section */}
                                {(students.length > 0 || query) && (
                                    <div className="nav-tabs-custom border0 navnoshadow">
                                        <ul className="nav nav-tabs">
                                            <li className={activeTab === 'list' ? 'active' : ''}>
                                                <a href="#tab_1" data-toggle="tab" onClick={(e) => { e.preventDefault(); setActiveTab('list'); }}>
                                                    <i className="fa fa-list"></i> List View
                                                </a>
                                            </li>
                                            <li className={activeTab === 'details' ? 'active' : ''}>
                                                <a href="#tab_2" data-toggle="tab" onClick={(e) => { e.preventDefault(); setActiveTab('details'); }}>
                                                    <i className="fa fa-newspaper-o"></i> Details View
                                                </a>
                                            </li>
                                        </ul>
                                        <div className="tab-content">
                                            <div className={`tab-pane ${activeTab === 'list' ? 'active' : ''} table-responsive no-padding`} id="tab_1">
                                                <table className="table table-striped table-bordered table-hover student-list">
                                                    <thead>
                                                        <tr>
                                                            <th className="sorting" onClick={() => requestSort('admission_no')} style={{ cursor: 'pointer' }}>
                                                                Admission No {getSortIcon('admission_no')}
                                                            </th>
                                                            <th className="sorting" onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                                                                Student Name {getSortIcon('name')}
                                                            </th>
                                                            <th className="sorting" onClick={() => requestSort('class')} style={{ cursor: 'pointer' }}>
                                                                Class {getSortIcon('class')}
                                                            </th>
                                                            <th className="sorting" onClick={() => requestSort('father_name')} style={{ cursor: 'pointer' }}>
                                                                Father Name {getSortIcon('father_name')}
                                                            </th>
                                                            <th className="sorting" onClick={() => requestSort('dob')} style={{ cursor: 'pointer' }}>
                                                                Date Of Birth {getSortIcon('dob')}
                                                            </th>
                                                            <th>Gender</th>
                                                            <th>Category</th>
                                                            <th>Mobile Number</th>
                                                            <th className="text-right noExport">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {students.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="8" className="text-center">
                                                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                                        <div style={{ color: '#ffb3b3ff', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                                        <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                                        <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            sortedStudents.map((student) => (
                                                                <tr key={student.id}>
                                                                    <td>{student.admission_no}</td>
                                                                    <td><Link to={`/student/view/${student.id}`}>{student.name}</Link></td>
                                                                    <td>{student.class}</td>
                                                                    <td>{student.father_name}</td>
                                                                    <td>{student.dob}</td>
                                                                    <td>{student.gender}</td>
                                                                    <td>{student.category}</td>
                                                                    <td>{student.mobile}</td>
                                                                    <td className="text-right">
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
                                            <div className={`tab-pane ${activeTab === 'details' ? 'active' : ''}`} id="tab_2">
                                                {students.length === 0 ? (
                                                    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', minHeight: '200px' }}>
                                                        <div style={{ color: '#999', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                        <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                        <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                                    </div>
                                                ) : (
                                                    students.map((student) => (
                                                        <div className="carousel-row" key={student.id}>
                                                            <div className="slide-row" style={{ display: 'flex', padding: '15px', background: '#f9f9f9', marginBottom: '15px', border: '1px solid #e3e3e3', borderRadius: '4px' }}>
                                                                <div className="carousel slide slide-carousel">
                                                                    <div className="carousel-inner">
                                                                        <div className="item active" style={{ width: '150px', height: '150px', marginRight: '20px' }}>
                                                                            <Link to={`/student/view/${student.id}`}>
                                                                                <img
                                                                                    className="img-responsive img-thumbnail width150"
                                                                                    alt={student.name}
                                                                                    src={student.image}
                                                                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                                                                    onError={(e) => { e.target.src = "/images/default_image.jpg"; }}
                                                                                />
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="slide-content" style={{ flex: 1 }}>
                                                                    <h4 style={{ marginTop: 0 }}><Link to={`/student/view/${student.id}`}>{student.name}</Link></h4>
                                                                    <div className="row">
                                                                        <div className="col-xs-6 col-md-6">
                                                                            <address>
                                                                                <strong><b>Class: </b>{student.class}</strong><br />
                                                                                <b>Admission No: </b>{student.admission_no}<br />
                                                                                <b>Date Of Birth: </b>{student.dob}<br />
                                                                                <b>Gender:&nbsp;</b>{student.gender}<br />
                                                                                <b>Category:&nbsp;</b>{student.category}<br />
                                                                            </address>
                                                                        </div>
                                                                        <div className="col-xs-6 col-md-6">
                                                                            <b>Father Name:&nbsp;</b>{student.father_name}<br />
                                                                            <b>Mobile Number: </b> <abbr title="Phone"><i className="fa fa-phone-square"></i>&nbsp;</abbr> {student.mobile}<br />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="slide-footer" style={{ alignSelf: 'flex-start' }}>
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
                                            <div className="mailbox-controls">
                                                <div className="pull-left">
                                                    {students.length === 0 ? "Records 0 to 0 of 0" : `Records 1 to ${students.length} of ${totalRecords}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default GlobalSearch;
