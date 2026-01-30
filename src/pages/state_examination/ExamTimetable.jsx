import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { useSession } from '../../context/SessionContext';

const ExamTimetable = () => {
    const { sessionYear } = useSession();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExamTimetable();
    }, []);

    const fetchExamTimetable = async () => {
        setLoading(true);
        try {
            const response = await api.getExamTimetable();
            console.log('API Response:', response);

            if (response && response.status && response.data) {
                setExams(response.data);
            } else {
                setExams([]);
            }
        } catch (err) {
            console.error('Error fetching exam timetable:', err);
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    const printDiv = (tagid) => {
        const element = document.getElementById(tagid);
        if (!element) return;

        const tagname = element.tagName.toLowerCase();
        const divToPrint = element.innerHTML;
        const head = `<html><head>${document.head.innerHTML}</head>`;
        const allcontent = head + `<body><${tagname}>${divToPrint}</${tagname}></body></html>`;

        const frame = document.createElement('iframe');
        frame.name = 'frame1';
        frame.style.position = 'absolute';
        frame.style.top = '-1000000px';
        document.body.appendChild(frame);

        const frameDoc = frame.contentWindow || frame.contentDocument.document || frame.contentDocument;
        frameDoc.document.open();
        frameDoc.document.write(allcontent);
        frameDoc.document.close();

        setTimeout(() => {
            window.frames['frame1'].focus();
            window.frames['frame1'].print();
            frame.remove();
        }, 500);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('en-GB', options);
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content" style={{ marginTop: '20px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Exam Schedule</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    {loading ? (
                                        <div className="text-center">Loading...</div>
                                    ) : exams.length > 0 ? (
                                        exams.map((exam, i) => (
                                            <div key={exam.id}>
                                                <a
                                                    className="btn btn-default btn-xs pull-right mt8 mr-1"
                                                    id="print"
                                                    onClick={() => printDiv(`print_${i}`)}
                                                    style={{ marginBottom: '10px' }}
                                                >
                                                    <i className="fa fa-print"></i>
                                                </a>

                                                <div id={`print_${i}`}>
                                                    <h4 className="pagetitleh2 border-b-none" style={{
                                                        fontSize: '20px',
                                                        fontWeight: '500',
                                                        marginTop: '10px',
                                                        marginBottom: '15px',
                                                        paddingBottom: '10px'
                                                    }}>
                                                        {exam.name}
                                                    </h4>

                                                    {exam.time_table && exam.time_table.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <table className="table table-hover table-bordered table-stripped table-b" style={{ marginBottom: '30px' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Subject</th>
                                                                        <th className="text text-center">Date</th>
                                                                        <th className="text text-center">Start Time</th>
                                                                        <th className="text text-center">Duration (Minute)</th>
                                                                        <th className="text text-center">Room No</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {exam.time_table.map((timeTable, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>
                                                                                {timeTable.subject_name} ({timeTable.subject_code})
                                                                            </td>
                                                                            <td className="text text-center">
                                                                                {formatDate(timeTable.date)}
                                                                            </td>
                                                                            <td className="text text-center">
                                                                                {timeTable.time_from}
                                                                            </td>
                                                                            <td className="text text-center">
                                                                                {timeTable.duration}
                                                                            </td>
                                                                            <td className="text text-center">
                                                                                {timeTable.room_no}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="alert alert-danger">
                                            No record found
                                        </div>
                                    )}
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

export default ExamTimetable;
