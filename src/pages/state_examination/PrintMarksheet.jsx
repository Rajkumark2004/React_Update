import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';
import Pagination from '../../utils/Pagination';

const PrintMarksheet = () => {
    const { sessionYear } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [studentList, setStudentList] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [templates, setTemplates] = useState([]);

    const [formData, setFormData] = useState({
        class_id: '',
        class_section_id: '',
        template: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch initial marksheet data (classlist, sessionlist, etc.)
                const response = await api.getCBSEMarksheetData({});
                console.log("PrintMarksheet Initial Data Response:", response);

                if (response && response.status && response.data) {
                    if (response.data.classlist) {
                        setClasses(response.data.classlist);
                    }
                    if (response.data.marksheet) {
                        setTemplates(response.data.marksheet);
                    }
                } else {
                    console.warn("Unexpected API response structure:", response);
                }
            } catch (error) {
                console.error("Failed to fetch initial data", error);
                // Fallback
                setClasses(mockClasses);
            }
        };

        fetchInitialData();
    }, []);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'class_id') {
            setFormData(prev => ({ ...prev, class_id: value, class_section_id: '' }));
            setSections([]); // Clear sections
            // Maybe clear templates too if strict filtering?
            // setTemplates([]); 

            if (value) {
                try {
                    const response = await api.getSectionsByClass(value);
                    if (response && response.data) {
                        setSections(response.data);
                    } else if (response && Array.isArray(response)) {
                        setSections(response);
                    }
                } catch (error) {
                    console.error("Failed to fetch sections", error);
                    setSections([]);
                }
            }
        }

        if (name === 'class_section_id' && formData.class_id && value) {
            try {
                // Use new API endpoint with class_section_id (which is 'value' here as section dropdown uses s.id)
                console.log("Fetching templates for class_section_id:", value);
                const response = await api.getCBSETemplatesBySection(value);
                console.log("Filtered Templates Response:", response);
                if (response.status && response.data) {
                    if (Array.isArray(response.data)) {
                        setTemplates(response.data);
                    } else if (response.data.result && Array.isArray(response.data.result)) { // Handle deeper nesting
                        setTemplates(response.data.result);
                    } else {
                        // Fallback if data is object
                        console.warn("Unexpected template data format (object):", response.data);
                        // If it's an object acting as a list, we might want Object.values, but usually it's []
                        setTemplates([]);
                    }
                } else if (response.result && Array.isArray(response.result)) {
                    setTemplates(response.result);
                } else if (Array.isArray(response)) {
                    setTemplates(response);
                } else {
                    setTemplates([]);
                }
            } catch (error) {
                console.error("Failed to fetch filtered templates", error);
                setTemplates([]);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                class_id: formData.class_id,
                class_section_id: formData.class_section_id,
                template: formData.template,
                search: 'search_filter'
            };
            const response = await api.getCBSEMarksheetData(payload);

            if (response.status && response.data && response.data.studentList) {
                setStudentList(response.data.studentList);
            } else if (response.status && response.data && response.data.students) {
                setStudentList(response.data.students);
            } else if (response.studentList) {
                setStudentList(response.studentList);
            } else {
                setStudentList([]);
            }
        } catch (error) {
            console.error("Search Error:", error);
            setStudentList([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(studentList.map(s => s.student_session_id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleStudentSelect = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handlePrint = (student) => {
        if (!formData.template) {
            alert("Please select a template first.");
            return;
        }

        const url = `https://newlayout.wisibles.com/welcome/printmarksheet/${student.student_session_id}/${formData.template}`;
        window.open(url, '_blank');
    };

    const handleBulkDownload = async () => {
        if (!formData.template) {
            alert("Please select a template first.");
            return;
        }
        if (selectedStudents.length === 0) {
            alert("Please select at least one student.");
            return;
        }

        try {
            const payload = {
                marksheet_template: formData.template,
                student_session_id: selectedStudents
            };

            // Fetch marks and template data in parallel
            const [marksResponse, templateResponse] = await Promise.all([
                api.getMarksSuraj2(payload),
                api.getCBSETemplateData(formData.template).catch(() => null)
            ]);

            if (marksResponse.status && marksResponse.data) {
                // Bundle marks + template + student list for the print page
                const printData = {
                    marks: marksResponse.data,
                    template: templateResponse?.data || templateResponse || {},
                    students: studentList || []
                };
                localStorage.setItem('studentMarksheetData', JSON.stringify(printData));
                window.open('/cbseexam/result/print-suraj', '_blank');
            } else {
                alert("Failed to fetch bulk marksheet data.");
            }
        } catch (error) {
            console.error("Bulk Print Error:", error);
            alert("Error generating bulk marksheets.");
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-map-o"></i> Examinations <small>Student Fee1</small></h1>
                </section>

                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
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
                                                <select name="class_section_id" className="form-control" value={formData.class_section_id} onChange={handleInputChange} required>
                                                    <option value="">Select</option>
                                                    {sections.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Template</label><small className="req"> *</small>
                                                <select name="template" className="form-control" value={formData.template} onChange={handleInputChange} required>
                                                    <option value="">Select</option>
                                                    {Array.isArray(templates) && templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <button type="submit" className="btn btn-primary pull-right btn-sm" disabled={isLoading}>
                                                    {isLoading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-search"></i>} Search
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {studentList && studentList.length > 0 && (
                                    <div className="box-header ptbnull" style={{ borderTop: '1px solid #f4f4f4', padding: '10px' }}>
                                        <button className="btn btn-info btn-sm" id="download_selected_btn">Download Selected PDFs</button>
                                        <button
                                            className="btn btn-info btn-sm pull-right"
                                            title="Bulk Download"
                                            onClick={handleBulkDownload}
                                        >
                                            Bulk Download
                                        </button>
                                    </div>
                                )}

                                {studentList && (
                                    <div className="box-body">
                                        <div className="box-header ptbnull" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <h3 className="box-title titlefix"><i className="fa fa-users"></i> Student List</h3>
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
                                        </div>
                                        <div className="table-responsive mailbox-messages">
                                            <table className="table table-striped table-bordered table-hover" width="100%">
                                                <thead>
                                                    <tr>
                                                        <th><input type="checkbox" onChange={handleSelectAll} checked={selectedStudents.length === studentList.length && studentList.length > 0} /></th>
                                                        <th>Admission No</th>
                                                        <th>Student Name</th>
                                                        <th>Father Name</th>
                                                        <th>Date of Birth</th>
                                                        <th>Gender</th>
                                                        <th>Mobile No</th>
                                                        <th className="text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const totalItems = studentList.length;
                                                        const safeRpp = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
                                                        const idxLast = currentPage * safeRpp;
                                                        const idxFirst = idxLast - safeRpp;
                                                        const currentStudents = studentList.slice(idxFirst, idxLast);
                                                        return currentStudents.length === 0 ? (
                                                            <tr><td colSpan="8" className="text-center text-danger">No Record Found</td></tr>
                                                        ) : (
                                                            currentStudents.map(student => (
                                                                <tr key={student.id}>
                                                                    <td className="text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedStudents.includes(student.student_session_id)}
                                                                            onChange={() => handleStudentSelect(student.student_session_id)}
                                                                        />
                                                                    </td>
                                                                    <td>{student.admission_no}</td>
                                                                    <td>
                                                                        <Link to={`/student/view/${student.id}`}>{`${student.firstname} ${student.middlename || ''} ${student.lastname}`}</Link>
                                                                    </td>
                                                                    <td>{student.father_name}</td>
                                                                    <td>{student.dob}</td>
                                                                    <td>{student.gender}</td>
                                                                    <td>{student.mobileno}</td>
                                                                    <td className="text-right">
                                                                        <button className="btn btn-default btn-xs" title="Download" onClick={() => handlePrint(student)}><i className="fa fa-download"></i></button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        );
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                            <Pagination
                                                totalItems={studentList.length}
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

export default PrintMarksheet;
