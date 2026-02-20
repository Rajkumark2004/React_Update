import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import AttendanceReportNav from './AttendanceReportNav';
import '../../utils/include_files';

const DailyAttendanceReport = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});

    // Mock Data
    const initialData = [
        { class_section: "Class 1 (A)", total_present: 42, total_absent: 3, present_percent: "93.33", absent_percent: "6.67" },
        { class_section: "Class 1 (B)", total_present: 38, total_absent: 2, present_percent: "95.00", absent_percent: "5.00" },
        { class_section: "Class 2 (A)", total_present: 40, total_absent: 0, present_percent: "100.00", absent_percent: "0.00" },
        { class_section: "Class 3 (A)", total_present: 35, total_absent: 5, present_percent: "87.50", absent_percent: "12.50" },
        { class_section: "Class 4 (B)", total_present: 39, total_absent: 1, present_percent: "97.50", absent_percent: "2.50" },
        { class_section: "Class 5 (A)", total_present: 45, total_absent: 5, present_percent: "90.00", absent_percent: "10.00" },
        { class_section: "Class 6 (A)", total_present: 48, total_absent: 2, present_percent: "96.00", absent_percent: "4.00" },
        { class_section: "Class 10 (A)", total_present: 58, total_absent: 2, present_percent: "96.67", absent_percent: "3.33" },
    ];

    const [resultList, setResultList] = useState(initialData);

    const handleSearch = (e) => {
        e.preventDefault();
        setErrors({});

        let newErrors = {};
        if (!date) {
            newErrors.date = "The Date field is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        console.log("Search for date:", date);
        // In a real app, this would fetch data. 
        // For now, we keep the mock data.
    };

    // Filter logic
    const filteredList = resultList.filter(item =>
        item.class_section.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate totals based on filtered data
    const totals = filteredList.reduce((acc, curr) => ({
        all_present: acc.all_present + parseInt(curr.total_present),
        all_absent: acc.all_absent + parseInt(curr.total_absent),
        count: acc.count + 1
    }), { all_present: 0, all_absent: 0, count: 0 });

    const totalStudents = totals.all_present + totals.all_absent;
    const all_present_percent = totalStudents ? ((totals.all_present / totalStudents) * 100).toFixed(2) : 0;
    const all_absent_percent = totalStudents ? ((totals.all_absent / totalStudents) * 100).toFixed(2) : 0;

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
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label >Date</label><small className="req"> *</small>
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
                                                    <button type="submit" name="search" value="search" className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                        <i className="fa fa-search"></i> Search
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
                                                            <td>{value.class_section}</td>
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
                                                                <h5 className="description-header">Class (Section) : <span className="description-text">{value.class_section}</span></h5>
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
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default DailyAttendanceReport;
