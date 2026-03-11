import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import AttendanceReportNav from './AttendanceReportNav';
import { api } from '../../services/api';
import '../../utils/include_files';

const DailyAttendanceReport = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [resultList, setResultList] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setInitialLoading(true);
            const response = await api.getDailyAttendanceReport();
            if (response && response.status && response.data) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : (response.data.result || response.data.list || []);
                setResultList(list);
            }
        } catch (error) {
            console.error('Error loading daily attendance report:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage({ type: '', text: '' });

        if (!date) {
            setErrors({ date: 'The Date field is required' });
            return;
        }

        setLoading(true);
        try {
            // Convert YYYY-MM-DD → DD-MM-YYYY for the API (same as StudentAttendance)
            const formattedDate = date.split('-').reverse().join('-');
            const response = await api.searchDailyAttendanceReport({ date: formattedDate });

            if (response && response.status) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.result || response.data?.list || []);
                setResultList(list);
                if (list.length === 0) {
                    setMessage({ type: 'info', text: 'No attendance data found for this date.' });
                }
            } else {
                setMessage({ type: 'error', text: response?.message || 'No data found for this date' });
                setResultList([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setMessage({ type: 'error', text: error.message || 'Search failed' });
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredList = resultList.filter(item =>
        (item.class_section || item.class || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate totals based on filtered data
    const totals = filteredList.reduce((acc, curr) => ({
        all_present: acc.all_present + parseInt(curr.total_present || 0),
        all_absent: acc.all_absent + parseInt(curr.total_absent || 0),
    }), { all_present: 0, all_absent: 0 });

    const totalStudents = totals.all_present + totals.all_absent;
    const all_present_percent = totalStudents ? ((totals.all_present / totalStudents) * 100).toFixed(2) : '0.00';
    const all_absent_percent = totalStudents ? ((totals.all_absent / totalStudents) * 100).toFixed(2) : '0.00';

    // Helper to read class section label from various API response shapes
    const getClassSection = (item) => item.class_section || `${item.class || ''} ${item.section ? `(${item.section})` : ''}`.trim();

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-calendar-check-o"></i> Attendance <small> By Date</small>
                    </h1>
                </section>
                <section className="content">
                    <AttendanceReportNav />
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box removeboxmius">
                                    <div className="box-header ptbnull"></div>
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    </div>
                                    <form id='form1' onSubmit={handleSearch}>
                                        <div className="box-body">
                                            <div className="row">
                                                {message.text && (
                                                    <div className={`col-md-12 alert alert-${message.type === 'error' ? 'danger' : message.type === 'info' ? 'info' : 'success'}`}>
                                                        {message.text}
                                                    </div>
                                                )}
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Date</label><small className="req"> *</small>
                                                        <div className="input-group" style={{ position: 'relative', width: '100%', borderBottom: '1px solid #ccc' }}>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date}
                                                                onChange={(e) => setDate(e.target.value)}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: 0, paddingBottom: '4px' }}
                                                            />
                                                        </div>
                                                        {errors.date && <span className="text-danger">{errors.date}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <button
                                                            type="submit"
                                                            name="search"
                                                            value="search"
                                                            className="btn btn-primary btn-sm pull-right checkbox-toggle"
                                                            disabled={loading}
                                                        >
                                                            {loading
                                                                ? <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                                : <><i className="fa fa-search"></i> Search</>
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    <div className="">
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title titlefix"><i className="fa fa-money"></i> Daily Attendance Report</h3>
                                        </div>

                                        {/* Desktop View */}
                                        <div className="box-body table-responsive hide-mobile">
                                            <div className="download_label">Daily Attendance Report</div>

                                            {/* Search Input */}
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{ marginBottom: '15px', maxWidth: '300px' }}
                                                />
                                            </div>

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        <th>Class (Section)</th>
                                                        <th>Total Present</th>
                                                        <th>Total Absent</th>
                                                        <th>Present %</th>
                                                        <th>Absent %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.length > 0 ? (
                                                        filteredList.map((value, index) => (
                                                            <tr key={index}>
                                                                <td>{getClassSection(value)}</td>
                                                                <td>{value.total_present}</td>
                                                                <td>{value.total_absent}</td>
                                                                <td>{value.present_percent}</td>
                                                                <td>{value.absent_percent}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-danger">No data available</td>
                                                        </tr>
                                                    )}
                                                    {filteredList.length > 0 && (
                                                        <tr style={{ fontWeight: 'bold' }}>
                                                            <td>Total</td>
                                                            <td>{totals.all_present}</td>
                                                            <td>{totals.all_absent}</td>
                                                            <td>{all_present_percent}</td>
                                                            <td>{all_absent_percent}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="box-body hide-desktop">
                                            <div className="col-md-12">
                                                {filteredList.length > 0 ? (
                                                    filteredList.map((value, index) => (
                                                        <div key={index} className="bgtgray">
                                                            <div className="col-sm-3 col-lg-2 col-md-3">
                                                                <div className="description-block">
                                                                    <h5 className="description-header">Class (Section) : <span className="description-text">{getClassSection(value)}</span></h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-1 pull">
                                                                <div className="description-block">
                                                                    <h5 className="description-header">Total Present : <span className="description-text">{value.total_present}</span></h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-1 pull">
                                                                <div className="description-block">
                                                                    <h5 className="description-header">Total Absent : <span className="description-text">{value.total_absent}</span></h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-4 col-lg-4 col-md-4 border-right">
                                                                <div className="description-block">
                                                                    <h5 className="description-header">Present % : <span className="description-text">{value.present_percent}</span></h5>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-2 col-lg-2 col-md-2 border-right">
                                                                <div className="description-block">
                                                                    <h5 className="description-header">Absent % : <span className="description-text">{value.absent_percent}</span></h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="alert alert-danger text-center">No data available</div>
                                                )}
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

export default DailyAttendanceReport;
