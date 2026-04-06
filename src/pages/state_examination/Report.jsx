import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';


const Report = () => {
    const { sessionYear } = useSession();
    const [reportType, setReportType] = useState('menu'); // 'menu', 'examsubject', 'templatewise', 'consolidated'
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        exam_id: '',
        class_id: '',
        section_id: '',
        template_id: ''
    });

    const [results, setResults] = useState(null);
    const [resultHtml, setResultHtml] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [exams, setExams] = useState([]);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'class_id') {
            // Reset sections and section_id when class changes
            setSections([]);
            setFormData(prev => ({ ...prev, section_id: '', template_id: '' }));

            if (value) {
                try {
                    const response = await api.getSectionsByClass(value);
                    if (response.status && response.data) {
                        setSections(response.data);
                    } else if (Array.isArray(response)) {
                        setSections(response);
                    }
                } catch (error) {
                    console.error("Fetch Sections Error:", error);
                    toast.error("Error loading sections");
                }
            }
        }

        if (name === 'section_id') {
            // Reset template_id when section changes
            setTemplates([]);
            setFormData(prev => ({ ...prev, template_id: '' }));

            if (value) {
                try {
                    const response = await api.getCBSETemplatesBySection(value);
                    if (response.status && response.data) {
                        if (Array.isArray(response.data)) {
                            setTemplates(response.data);
                        } else if (response.data.result && Array.isArray(response.data.result)) {
                            setTemplates(response.data.result);
                        }
                    } else if (response.result && Array.isArray(response.result)) {
                        setTemplates(response.result);
                    } else if (Array.isArray(response)) {
                        setTemplates(response);
                    }
                } catch (error) {
                    console.error("Fetch Templates Error:", error);
                    toast.error("Error loading templates");
                }
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (reportType === 'templatewise') {
            try {
                setSearchLoading(true);
                setResultHtml('');
                const payload = {
                    class_id: parseInt(formData.class_id),
                    class_section_id: parseInt(formData.section_id), // section_id corresponds to class_section_id in backend
                    template_id: parseInt(formData.template_id)
                };

                const response = await api.getCBSETemplateWiseResult(payload);
                if (response.status && response.data && response.data.result) {
                    setResultHtml(response.data.result.pg || '');
                    setResults(response.data); // Keep results object for header info if needed
                } else {
                    toast.error("No results found or error in response");
                }
            } catch (error) {
                console.error("Search Template Result Error:", error);
                toast.error("Error fetching report results");
            } finally {
                setSearchLoading(false);
            }
        } else if (reportType === 'examsubject') {
            try {
                setSearchLoading(true);
                setResultHtml('');
                const payload = {
                    exam_id: parseInt(formData.exam_id)
                };

                const response = await api.getCBSEExamSubjectResult(payload);
                if (response.status && response.data) {
                    setResults(response.data);
                } else {
                    toast.error("No results found or error in response");
                }
            } catch (error) {
                console.error("Search Exam Subject Result Error:", error);
                toast.error("Error fetching report results");
            } finally {
                setSearchLoading(false);
            }
        } else if (reportType === 'consolidated') {
            try {
                setSearchLoading(true);
                setResults(null);
                const payload = {
                    class_id: parseInt(formData.class_id),
                    section_id: parseInt(formData.section_id)
                };

                const response = await api.getConsolidatedReportResults(payload);
                if (response.status && response.data) {
                    setResults(response.data);
                } else {
                    toast.error("No results found or error in response");
                }
            } catch (error) {
                console.error("Search Consolidated Result Error:", error);
                toast.error("Error fetching consolidated report");
            } finally {
                setSearchLoading(false);
            }
        } else {
            // Existing mock search for other types
            setResults({
                students: [
                    { id: 1, firstname: 'John', lastname: 'Doe', admission_no: '1001', father_name: 'Robert Doe', rank: '1', subjects: {} }
                ],
                subjects: [
                    { subject_id: 1, subject_name: 'Mathematics', subject_code: 'MAT' }
                ],
                exam_assessments: [
                    { id: 1, name: 'PT', code: 'PT1', maximum_marks: 20 }
                ]
            });
        }
    };

    const fetchReportData = async (type) => {
        if (type === 'templatewise') {
            try {
                const response = await api.getCBSETemplateReportIndex();
                if (response.status && response.data) {
                    if (response.data.classlist) {
                        setClasses(response.data.classlist);
                    }
                } else {
                    toast.error("Failed to fetch report data");
                }
            } catch (error) {
                console.error("Fetch Report Data Error:", error);
                toast.error("Error loading report data");
            }
        } else if (type === 'examsubject') {
            try {
                const response = await api.getCBSEExamSubjectList();
                if (response.status && response.data) {
                    setExams(response.data);
                } else {
                    toast.error("Failed to fetch exam data");
                }
            } catch (error) {
                console.error("Fetch Exam Subject Error:", error);
                toast.error("Error loading exam data");
            }
        } else if (type === 'consolidated') {
            try {
                // Using getCBSEExamList to get classList as per current pattern in CBSEExamList
                const response = await api.getCBSEExamList();
                if (response && response.status && response.data) {
                    if (response.data.classlist) {
                        setClasses(response.data.classlist);
                    }
                }
            } catch (error) {
                console.error("Fetch Consolidated Data Error:", error);
                toast.error("Error loading class data");
            }
        }
    };

    const resetReport = () => {
        setReportType('menu');
        setResults(null);
        setFormData({ exam_id: '', class_id: '', section_id: '', template_id: '' });
    };


    const renderMenu = () => (
        <div className="row">
            <div className="col-md-12">
                <div className="box box-primary border0 mb0 margesection">
                    <div className="box-header with-border">
                        <h3 className="box-title"><i className="fa fa-search"></i> Reports</h3>
                        <div className="btn-group pull-right">
                            <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                    </div>
                    <div className="box-body">
                        <ul className="reportlists">
                            <li className={`col-lg-4 col-md-4 col-sm-6 ${reportType === 'examsubject' ? 'active' : ''}`}>
                                <a href="#" onClick={(e) => { e.preventDefault(); setReportType('examsubject'); fetchReportData('examsubject'); }}>
                                    <i className="fa fa-file-text-o"></i> Subject Marks Report
                                </a>
                            </li>
                            <li className={`col-lg-4 col-md-4 col-sm-6 ${reportType === 'templatewise' ? 'active' : ''}`}>
                                <a href="#" onClick={(e) => { e.preventDefault(); setReportType('templatewise'); fetchReportData('templatewise'); }}>
                                    <i className="fa fa-file-text-o"></i> Template Marks Report
                                </a>
                            </li>
                            <li className={`col-lg-4 col-md-4 col-sm-6 ${reportType === 'consolidated' ? 'active' : ''}`}>
                                <a href="#" onClick={(e) => { e.preventDefault(); setReportType('consolidated'); fetchReportData('consolidated'); }}>
                                    <i className="fa fa-file-text-o"></i> Consolidated Report
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSubjectMarksReport = () => (
        <div className="row" style={{ marginTop: '0px' }}>
            <div className="col-md-12">
                <div className="box removeboxmius">
                    <div className="box-header with-border">
                        <h3 className="box-title"><i className="fa fa-search"></i> Subject Wise Marks Report</h3>
                    </div>
                    <div className="box-body">
                        <form onSubmit={handleSearch} className="row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Exam</label><small className="req"> *</small>
                                    <select name="exam_id" className="form-control" value={formData.exam_id} onChange={handleInputChange} required>
                                        <option value="">Select</option>
                                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="form-group" style={{ textAlign: 'right', marginTop: '10px' }}>
                                    <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '20px', padding: '6px 20px' }} disabled={searchLoading}>
                                        {searchLoading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-search"></i>} Search
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    {results && results.students && (
                        <div className="box-body">
                            <div className="report-toolbar-stack" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <div className="btn-group">
                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => window.print()}><i className="fa fa-print"></i></button>
                                    <button className="btn btn-default btn-sm" title="Download Excel"><i className="fa fa-file-excel-o"></i></button>
                                </div>
                            </div>
                            <div className="table-responsive report-table-responsive">
                                <table className="table no-margin" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                                            <th rowSpan="2" style={{ padding: '12px 8px', fontWeight: '600', color: '#000', whiteSpace: 'nowrap' }}>Student</th>
                                            <th rowSpan="2" style={{ padding: '12px 8px', fontWeight: '600', color: '#000', whiteSpace: 'nowrap' }}>Admission No</th>
                                            <th rowSpan="2" style={{ padding: '12px 8px', fontWeight: '600', color: '#000', whiteSpace: 'nowrap' }}>Father Name</th>
                                            {results.subjects.map(s => (
                                                <th key={s.subject_id} colSpan={results.exam_assessments.length} className="text-center" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>
                                                    {s.subject_name} {s.subject_code ? `(${s.subject_code})` : ''}
                                                </th>
                                            ))}
                                            <th rowSpan="2" className="text-center" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>Total Marks</th>
                                            <th rowSpan="2" className="text-center" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>Percentage (%)</th>
                                            <th rowSpan="2" className="text-center" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>Grade</th>
                                            <th rowSpan="2" className="text-center" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>Rank</th>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                                            {results.subjects.map(s =>
                                                results.exam_assessments.map(a => (
                                                    <th key={`${s.subject_id}_${a.id}`} className="text-center" style={{ padding: '8px', fontSize: '11px', color: '#555' }}>
                                                        {a.name} ({a.code})<br />(Max - {a.maximum_marks})
                                                    </th>
                                                ))
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.students.map(st => (
                                            <tr key={st.student_id} className="hover-report-row" style={{ borderBottom: '1px solid #f4f4f4' }}>
                                                <td style={{ padding: '12px 8px', verticalAlign: 'top' }}><strong>{st.firstname} {st.middlename || ''} {st.lastname}</strong></td>
                                                <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>{st.admission_no}</td>
                                                <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>{st.father_name}</td>
                                                {results.subjects.map(s => results.exam_assessments.map(a => {
                                                    const markObj = st.subjects?.[s.subject_id]?.exam_assessments?.[a.id];
                                                    return (
                                                        <td key={`${st.student_id}_${s.subject_id}_${a.id}`} className="text-center" style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                                                            {markObj ? (markObj.is_absent === '1' ? 'Absent' : markObj.marks) : '-'}
                                                        </td>
                                                    );
                                                }))}
                                                <td className="text-center" style={{ padding: '12px 8px', verticalAlign: 'top' }}>{st.total_marks || '0/0'}</td>
                                                <td className="text-center" style={{ padding: '12px 8px', verticalAlign: 'top' }}>{st.percentage || '0.00'}</td>
                                                <td className="text-center" style={{ padding: '12px 8px', verticalAlign: 'top' }}>{st.grade || '-'}</td>
                                                <td className="text-center" style={{ padding: '12px 8px', verticalAlign: 'top' }}>{st.rank || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTemplateWiseReport = () => (
        <div className="row" style={{ marginTop: '0px' }}>
            <div className="col-md-12">
                <div className="box removeboxmius">
                    <div className="box-header with-border">
                        <h3 className="box-title"><i className="fa fa-search"></i> Template Marks Report</h3>
                    </div>
                    <div className="box-body">
                        <form onSubmit={handleSearch} className="row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Class</label><small className="req"> *</small>
                                    <select name="class_id" className="form-control" value={formData.class_id} onChange={handleInputChange} required>
                                        <option value="">Select</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Section</label><small className="req"> *</small>
                                    <select name="section_id" className="form-control" value={formData.section_id} onChange={handleInputChange} required>
                                        <option value="">Select</option>
                                        {sections.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Template</label><small className="req"> *</small>
                                    <select name="template_id" className="form-control" value={formData.template_id} onChange={handleInputChange} required>
                                        <option value="">Select</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="form-group" style={{ textAlign: 'right', marginTop: '10px' }}>
                                    <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '20px', padding: '6px 20px' }} disabled={searchLoading}>
                                        {searchLoading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-search"></i>} Search
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    {resultHtml && (
                        <div className="box-body">
                            <div className="report-toolbar-stack" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <div className="btn-group">
                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => window.print()}><i className="fa fa-print"></i></button>
                                    <button className="btn btn-default btn-sm" title="Download Excel"><i className="fa fa-file-excel-o"></i></button>
                                </div>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: resultHtml }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderConsolidatedReportResults = () => {
        if (!results || !results.subjects || !results.exam_term_assessment || !results.students) return null;

        const subjects = results.subjects;
        const examTermAssessments = results.exam_term_assessment;
        const students = results.students;

        // Flatten assessments for each subject to create headers
        const subjectHeaders = Object.keys(subjects).map(subId => {
            const subjectName = subjects[subId];
            const examsForSubject = examTermAssessments.filter(exam => exam.subject_assessments[subId]);

            return {
                id: subId,
                name: subjectName,
                exams: examsForSubject.map(exam => ({
                    exam_id: exam.exam_id,
                    exam_name: exam.exam_name,
                    term_name: exam.term_name,
                    assessments: Object.values(exam.subject_assessments[subId].assessments)
                }))
            };
        });

        return (
            <div className="box-body">
                <div className="report-toolbar-stack" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <div className="btn-group">
                        <button className="btn btn-default btn-sm" title="Print" onClick={() => window.print()}><i className="fa fa-print"></i></button>
                        <button className="btn btn-default btn-sm" title="Download Excel"><i className="fa fa-file-excel-o"></i></button>
                    </div>
                </div>
                <div className="table-responsive report-table-responsive">
                    <table className="table no-margin" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                                <th rowSpan="3" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>Student</th>
                                <th rowSpan="3" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>Admission No</th>
                                {subjectHeaders.map(sub => (
                                    <th key={sub.id} colSpan={sub.exams.reduce((acc, ex) => acc + ex.assessments.length, 0)} className="text-center" style={{ padding: '12px 8px', fontWeight: '600', color: '#000' }}>
                                        {sub.name}
                                    </th>
                                ))}
                            </tr>
                            <tr style={{ borderBottom: '1px solid #ddd' }}>
                                {subjectHeaders.map(sub => sub.exams.map((ex, idx) => (
                                    <th key={`${sub.id}_${ex.exam_id}`} colSpan={ex.assessments.length} className="text-center" style={{ padding: '8px', fontSize: '11px', color: '#555' }}>
                                        {ex.exam_name} ({ex.term_name})
                                    </th>
                                )))}
                            </tr>
                            <tr style={{ borderBottom: '1px solid #ddd' }}>
                                {subjectHeaders.map(sub => sub.exams.map(ex => ex.assessments.map(as => (
                                    <th key={`${sub.id}_${ex.exam_id}_${as.assessment_type_id}`} className="text-center" style={{ padding: '8px', fontSize: '10px', color: '#777' }}>
                                        {as.assessment_type_name}<br />(Max: {as.maximum_marks})
                                    </th>
                                ))))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(st => (
                                <tr key={st.student_id} className="hover-report-row" style={{ borderBottom: '1px solid #f4f4f4' }}>
                                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}><strong>{st.firstname} {st.lastname}</strong></td>
                                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>{st.admission_no}</td>
                                    {subjectHeaders.map(sub => sub.exams.map(ex => ex.assessments.map(as => {
                                        const markData = st.exams?.[ex.exam_id]?.subjects?.[sub.id]?.assessments?.[as.assessment_type_id];
                                        return (
                                            <td key={`${st.student_id}_${sub.id}_${ex.exam_id}_${as.assessment_type_id}`} className="text-center" style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                                                {markData ? (markData.is_absent === '1' ? 'A' : (markData.marks || '-')) : '-'}
                                            </td>
                                        );
                                    })))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderConsolidatedReport = () => (
        <div className="row" style={{ marginTop: '0px' }}>
            <div className="col-md-12">
                <div className="box removeboxmius">
                    <div className="box-header with-border">
                        <h3 className="box-title"><i className="fa fa-search"></i> Consolidated Report</h3>
                    </div>
                    <div className="box-body">
                        <form onSubmit={handleSearch} className="row">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Class</label><small className="req"> *</small>
                                    <select name="class_id" className="form-control" value={formData.class_id} onChange={handleInputChange} required>
                                        <option value="">Select</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class || c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Section</label><small className="req"> *</small>
                                    <select name="section_id" className="form-control" value={formData.section_id} onChange={handleInputChange} required>
                                        <option value="">Select</option>
                                        {sections.map(s => <option key={s.id} value={s.id}>{s.section || s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <div className="form-group" style={{ textAlign: 'right', marginTop: '10px' }}>
                                    <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '20px', padding: '6px 20px' }} disabled={searchLoading}>
                                        {searchLoading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-search"></i>} Search
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    {results && reportType === 'consolidated' && renderConsolidatedReportResults()}
                </div>
            </div>
        </div>
    );

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>
                {`
                    @media (max-width: 767px) {
                        .report-toolbar-stack {
                            display: flex;
                            justify-content: flex-end !important;
                            width: 100%;
                            margin-bottom: 10px;
                        }
                        .report-table-responsive {
                            border: 1px solid #ddd;
                            border-radius: 4px;
                        }
                    }
                    .hover-report-row:hover {
                        background-color: #fcfcfc !important;
                    }
                `}
            </style>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> State Examination</h1>
                </section>
                <section className="content" style={{ marginTop: '0px' }}>
                    {renderMenu()}
                    {reportType === 'examsubject' && renderSubjectMarksReport()}
                    {reportType === 'templatewise' && renderTemplateWiseReport()}
                    {reportType === 'consolidated' && renderConsolidatedReport()}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default Report;
