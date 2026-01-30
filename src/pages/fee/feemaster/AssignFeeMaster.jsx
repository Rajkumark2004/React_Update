import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const AssignFeeMaster = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Dropdown Data
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [genderList, setGenderList] = useState({});
    const [rteStatusList, setRteStatusList] = useState({});

    // Fee Group Data (for display)
    const [feeGroupList, setFeeGroupList] = useState([]);

    // Form State
    const [filters, setFilters] = useState({
        class_id: '',
        section_id: '',
        category_id: '',
        gender: '',
        rte: ''
    });

    // Student List State
    const [studentList, setStudentList] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const newSelection = {};
        studentList.forEach(student => {
            if (student.student_fees_master_id != 0 && student.student_fees_master_id != null) {
                newSelection[student.student_session_id] = true;
            }
        });
        setSelectedStudents(newSelection);
    }, [studentList]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await api.assignFeeMaster(id);
            // Based on user JSON:
            // response.data.classlist
            // response.data.genderList
            // response.data.RTEstatusList
            // response.data.categorylist
            // response.data.feegroupList (Wait, user JSON has feegroupList: [] empty? PHP shows it iterates feegroupList to show fees code/amount)
            // The JSON provided has "feegroupList": [], which might be empty because of the specific ID or context?
            // Re-reading PHP: foreach ($feegroupList as $feegroup) -> likely fetches the fee group details for *this* master ID?
            // Wait, the API is `admin/feemaster/assign/27`. 
            // In the PHP code, it iterates `$feegroupList`.
            // In the user JSON, `feegroupList` is empty array `[]`. Maybe the ID 27 has no groups? 
            // Or maybe I need to interpret the JSON carefully.
            // Let's implement robust checking.

            if (response && response.data) {
                if (response.data.classlist) setClassList(response.data.classlist);
                if (response.data.genderList) setGenderList(response.data.genderList);
                if (response.data.RTEstatusList) setRteStatusList(response.data.RTEstatusList);
                if (response.data.categorylist) setCategoryList(response.data.categorylist);
                if (response.data.feegroupList) setFeeGroupList(response.data.feegroupList);
            }
        } catch (error) {
            console.error('Error fetching assign data:', error);
            toast.error('Failed to load initial data');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFilters(prev => ({ ...prev, class_id: classId, section_id: '' }));
        if (classId) {
            try {
                // Using exact logic from StudentAttendance.jsx
                const response = await api.getSections();

                if (response && response.data) {
                    setSectionList(response.data);
                } else if (response && Array.isArray(response)) {
                    setSectionList(response);
                } else {
                    setSectionList([]);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
                setSectionList([]);
            }
        } else {
            setSectionList([]);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // User request payload: { "fee_group_id":"16", "class_id":"13", ...filters }
            // id from params is fee_group_id (based on context of "Assign Fee Master" page for a specific group/master)

            const payload = {
                fee_group_id: id,
                ...filters
            };

            console.log('=== SEARCH DEBUG ===');
            console.log('Payload:', payload);

            const response = await api.searchAssignStudents(payload);

            console.log('Response received:', response);
            console.log('Response type:', typeof response);
            console.log('Response.status:', response?.status);
            console.log('Response.data:', response?.data);
            console.log('Is data array?:', Array.isArray(response?.data));

            // User response format: { status: true, count: 4, data: [...] }
            if (response && response.status === true && Array.isArray(response.data)) {
                console.log('Setting studentList with', response.data.length, 'students');
                setStudentList(response.data);
            } else if (response && Array.isArray(response.data)) {
                // Fallback if status key missing but data present
                console.log('Fallback: Setting studentList with', response.data.length, 'students');
                setStudentList(response.data);
            } else {
                console.log('No valid data found, clearing list');
                setStudentList([]);
                if (response && response.status === false) {
                    toast.error(response.message || "No records found");
                }
            }
        } catch (error) {
            console.error('Error searching students:', error);
            toast.error('Failed to search students');
        } finally {
            setLoading(false);
        }
    };

    // Checkbox logic
    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        const newSelection = {};
        if (checked) {
            studentList.forEach(student => {
                newSelection[student.student_session_id] = true;
            });
        }
        setSelectedStudents(newSelection);
    };

    const handleStudentSelect = (studentId) => {
        setSelectedStudents(prev => {
            const newState = { ...prev };
            if (newState[studentId]) {
                delete newState[studentId];
            } else {
                newState[studentId] = true;
            }
            return newState;
        });
    };

    const handleSave = async () => {
        const selectedIds = Object.keys(selectedStudents).filter(key => selectedStudents[key]);
        if (selectedIds.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        if (!window.confirm('Are you sure you want to assign fees to selected students?')) return;

        setLoading(true);
        try {
            // Build payload matching PHP form structure from screenshot:
            // fee_session_groups: 16
            // student_session_id[]: 11, 58, 61 (array)
            // student_fees_master_id_11: 49
            // student_fees_master_id_58: 0
            // student_fees_master_id_61: 0
            // student_ids[]: 11, 58, 61 (array)

            const payload = {
                fee_session_groups: id, // The fee group ID from URL params
                'student_session_id[]': selectedIds.map(sid => parseInt(sid)),
                'student_ids[]': selectedIds.map(sid => parseInt(sid))
            };

            // Add the dynamic student_fees_master_id keys for each selected student
            selectedIds.forEach(sid => {
                const student = studentList.find(s => s.student_session_id == sid);
                if (student) {
                    payload[`student_fees_master_id_${sid}`] = student.student_fees_master_id || 0;
                } else {
                    payload[`student_fees_master_id_${sid}`] = 0;
                }
            });

            console.log('Saving fee assignment payload:', payload);

            const response = await api.assignFeeMasterSave(payload);

            if (response.status === true || response.status === "success") {
                toast.success(response.message || 'Fees assigned successfully');
                // Refresh the student list
                handleSearch();
            } else {
                toast.error(response.message || 'Failed to save');
            }

        } catch (error) {
            console.error('Error saving assignment:', error);
            toast.error('Failed to save assignment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> Fees Collection</h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                </div>
                                <div className="box-body">
                                    <form onSubmit={handleSearch} className="row">
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Class</label>
                                                <select name="class_id" className="form-control" value={filters.class_id} onChange={handleClassChange}>
                                                    <option value="">Select</option>
                                                    {classList.map((c, index) => <option key={`${c.id}-${index}`} value={c.id}>{c.class}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-3">
                                            <div className="form-group">
                                                <label>Section</label>
                                                <select name="section_id" className="form-control" value={filters.section_id} onChange={handleFilterChange}>
                                                    <option value="">Select</option>
                                                    {sectionList.map((s, index) => <option key={`${s.id}-${index}`} value={s.id}>{s.section}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-2">
                                            <div className="form-group">
                                                <label>Category</label>
                                                <select name="category_id" className="form-control" value={filters.category_id} onChange={handleFilterChange}>
                                                    <option value="">Select</option>
                                                    {categoryList.map((item, index) => (
                                                        <option key={`${item.id}-${index}`} value={item.id}>{item.category}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-2">
                                            <div className="form-group">
                                                <label>Gender</label>
                                                <select name="gender" className="form-control" value={filters.gender} onChange={handleFilterChange}>
                                                    <option value="">Select</option>
                                                    {Object.entries(genderList).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-2">
                                            <div className="form-group">
                                                <label>RTE</label>
                                                <select name="rte" className="form-control" value={filters.rte} onChange={handleFilterChange}>
                                                    <option value="">Select</option>
                                                    {Object.entries(rteStatusList).map(([key, value]) => (
                                                        <option key={key} value={key}>{value}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <button type="submit" name="search" value="search_filter" className="btn btn-primary pull-right btn-sm checkbox-toggle">
                                                    <i className="fa fa-search"></i> Search
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                {studentList.length > 0 || !initialLoading ? ( /* Show search results if available or if search completed */
                                    <>
                                        {/* Fee Group Details Header - Displayed if search returns result or based on initial load logic if applicable. 
                                            Actually PHP shows feegroupList ALWAYS if set. 
                                            Based on our fetchInitialData, we setFeeGroupList. 
                                        */}
                                        <div className="box-header ptbnull"></div>
                                        <div className="">
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-users"></i> Assign Fees Group</h3>
                                            </div>
                                            <div className="box-body">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <div className="table-responsive">
                                                            {feeGroupList.length > 0 ? (
                                                                feeGroupList.map(feegroup => (
                                                                    <div key={feegroup.id}>
                                                                        <h4 className="mt2">
                                                                            {feegroup.is_system === "1" ? feegroup.group_name : feegroup.group_name} {/* lang logic omitted */}
                                                                        </h4>
                                                                        <table className="table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Fees Code</th>
                                                                                    <th className="text-right">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {feegroup.feetypes && feegroup.feetypes.length > 0 ? (
                                                                                    feegroup.feetypes.map(type => (
                                                                                        <tr key={type.id} className="mailbox-name">
                                                                                            <td>{type.code}</td>
                                                                                            <td className="text-right">₹{type.amount}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                ) : (
                                                                                    <tr><td colSpan="2" className="text-danger text-center">No Record Found</td></tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="alert alert-info">No Fee Groups found for this Master ID</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-8">
                                                        <div className="table-responsive">
                                                            <table className="table table-striped">
                                                                <tbody>
                                                                    <tr>
                                                                        <th>
                                                                            <div className="checkbox mb0 mt0">
                                                                                <label className="labelbold">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        onChange={handleSelectAll}
                                                                                        checked={studentList.length > 0 && Object.keys(selectedStudents).length === studentList.length}
                                                                                    /> All
                                                                                </label>
                                                                            </div>
                                                                        </th>
                                                                        <th>Admission No</th>
                                                                        <th>Student Name</th>
                                                                        <th>Class</th>
                                                                        <th>Father Name</th>
                                                                        <th>Category</th>
                                                                        <th>Gender</th>
                                                                    </tr>
                                                                    {studentList.length === 0 ? (
                                                                        <tr><td colSpan="7" className="text-danger text-center">No Record Found</td></tr>
                                                                    ) : (
                                                                        studentList.map(student => (
                                                                            <tr key={student.student_session_id}>
                                                                                <td>
                                                                                    <input
                                                                                        className="checkbox"
                                                                                        type="checkbox"
                                                                                        checked={!!selectedStudents[student.student_session_id]}
                                                                                        onChange={() => handleStudentSelect(student.student_session_id)}
                                                                                    />
                                                                                </td>
                                                                                <td>{student.admission_no}</td>
                                                                                <td>{student.firstname} {student.middlename} {student.lastname}</td>
                                                                                <td>{student.class}({student.section})</td>
                                                                                <td>{student.father_name}</td>
                                                                                <td>{student.category}</td>
                                                                                <td>{student.gender}</td>
                                                                            </tr>
                                                                        ))
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        {studentList.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={handleSave}
                                                                className="allot-fees btn btn-primary btn-sm pull-right"
                                                                disabled={loading}
                                                            >
                                                                {loading ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section >
            </div >
            <Footer />
        </div >
    );
};

export default AssignFeeMaster;
