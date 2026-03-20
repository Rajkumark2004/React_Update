import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import '../../utils/include_files';

const BulkDelete = () => {
    const navigate = useNavigate();

    // UI state for inputs
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // UI state for search results
    const [hasSearched, setHasSearched] = useState(false);

    // Checkbox UI states
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Fetch classes on component mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.getBulkDeleteClasses();
                if (response && response.data && Array.isArray(response.data.classlist)) {
                    setClasses(response.data.classlist);
                }
            } catch (err) {
                console.warn('Failed to fetch classes:', err);
            }
        };
        fetchClasses();
    }, []);

    const handleClassChange = async (e) => {
        const selectedClassId = e.target.value;
        setClassId(selectedClassId);
        setSectionId(''); // Reset section
        setSections([]); // Clear sections
        setStudents([]); // Clear current table
        setHasSearched(false);

        if (selectedClassId) {
            try {
                const response = await api.getSectionsByClass(selectedClassId);
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!classId) return;

        setLoading(true);
        try {
            const response = await api.searchBulkDeleteStudents(classId, sectionId);
            let sData = [];
            if (response && response.data && Array.isArray(response.data.students)) {
                sData = response.data.students;
            } else if (response && response.data && Array.isArray(response.data)) {
                sData = response.data;
            } else if (Array.isArray(response)) {
                sData = response;
            }
            setStudents(sData);
            setHasSearched(true);
            setSelectedStudents([]);
            setIsAllSelected(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
            setHasSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student to delete.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete the selected students?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.deleteBulkStudents(selectedStudents);
            if (response && response.status) {
                toast.success(response.message || 'Students deleted successfully');
                // Remove deleted students from the list
                setStudents(students.filter(student => !selectedStudents.includes(student.id)));
                setSelectedStudents([]);
                setIsAllSelected(false);
            } else {
                toast.error(response.message || 'Failed to delete students');
            }
        } catch (error) {
            console.error('Error deleting students:', error);
            toast.error('An error occurred while deleting students.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setIsAllSelected(checked);
        if (checked) {
            setSelectedStudents(students.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (e, id) => {
        const checked = e.target.checked;
        let newSelected = [...selectedStudents];
        if (checked) {
            newSelected.push(id);
        } else {
            newSelected = newSelected.filter(sid => sid !== id);
        }
        setSelectedStudents(newSelected);
        setIsAllSelected(newSelected.length === students.length && students.length > 0);
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="box-body pb0">
                                    <div className="row">
                                        <form role="form" onSubmit={handleSearch}>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Class</label>
                                                    <select 
                                                        className="form-control" 
                                                        value={classId} 
                                                        onChange={handleClassChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {classes.map((cls) => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <select 
                                                        className="form-control"
                                                        value={sectionId}
                                                        onChange={(e) => setSectionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {sections.map((sec) => (
                                                            <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle" disabled={loading}>
                                                        {loading ? <><i className="fa fa-spinner fa-spin"></i> Searching...</> : <><i className="fa fa-search"></i> Search</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {hasSearched && (
                                    <div className="box-body pt0">
                                        <div className="row">
                                            <div className="col-md-12 col-sm-12">
                                                <div className="mt10">
                                                    <div className="checkbox bordertop pt15">
                                                        <label style={{ fontWeight: 700 }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isAllSelected}
                                                                onChange={handleSelectAll} 
                                                            /> <b>Select All</b>
                                                        </label>
                                                        
                                                        {students.length > 0 && (
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-primary pull-right btn-sm"
                                                                onClick={handleDelete}
                                                                disabled={loading}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="table-responsive pt15 clearboth">
                                                        <div className="download_label">Bulk Delete</div>
                                                        <table className="table table-striped table-bordered table-hover example" cellSpacing="0" width="100%">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Admission No</th>
                                                                    <th>Student Name</th>
                                                                    <th>Class</th>
                                                                    <th>Date Of Birth</th>
                                                                    <th>Gender</th>
                                                                    <th>Category</th>
                                                                    <th>Mobile Number</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {students.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan="8" className="text-center">
                                                                            No data available in table
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    students.map((student) => (
                                                                        <tr key={student.id}>
                                                                            <td>
                                                                                <input 
                                                                                    type="checkbox" 
                                                                                    checked={selectedStudents.includes(student.id)}
                                                                                    onChange={(e) => handleSelectStudent(e, student.id)}
                                                                                />
                                                                            </td>
                                                                            <td>{student.admission_no}</td>
                                                                            <td>
                                                                                <Link to={`/student/view/${student.id}`}>{student.full_name || (student.firstname + ' ' + (student.lastname || ''))}</Link>
                                                                            </td>
                                                                            <td className="white-space-nowrap">
                                                                                {student.class_section || student.class}
                                                                            </td>
                                                                            <td>{student.dob}</td>
                                                                            <td>{student.gender}</td>
                                                                            <td>{student.category}</td>
                                                                            <td>{student.mobile_no || student.mobileno || student.mobile}</td>
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

export default BulkDelete;
