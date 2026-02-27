import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import SiblingModal from '../../components/SiblingModal';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import '../../utils/include_files';

const StudentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSiblingModalOpen, setIsSiblingModalOpen] = useState(false);
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        admission_no: '',
        roll_no: '',
        class_id: '',
        section_id: '',
        firstname: '',
        middlename: '',
        lastname: '',
        gender: '',
        dob: '',
        category_id: '',
        religion: '',
        cast: '',
        mobileno: '',
        email: '',
        admission_date: '',
        student_photo: null,
        blood_group: '',
        house: '',
        height: '',
        weight: '',
        measurement_date: '',
        class_of_admission: '',

        // Parent Details
        father_name: '',
        father_phone: '',
        father_occupation: '',
        father_pic: null,
        mother_name: '',
        mother_phone: '',
        mother_occupation: '',
        mother_pic: null,

        // Guardian Details
        guardian_is: 'father',
        guardian_name: '',
        guardian_relation: '',
        guardian_phone: '',
        guardian_occupation: '',
        guardian_email: '',
        guardian_address: '',
        guardian_pic: null,

        // Address
        current_address: '',
        permanent_address: '',
        city: '', // Added based on recent request
        state: '', // Added based on recent request
        pincode: '', // Added based on recent request

        // Miscellaneous
        bank_account_no: '',
        bank_name: '',
        ifsc_code: '',
        national_identification_no: '', // Check mapping: adhar_no?
        local_identification_no: '', // Check mapping: samagra_id?
        rte: 'No',
        previous_school: '',
        note: '',

        // Transport & Hostel
        route_list: '',
        pickup_point: '',
        fees_month: [],
        hostel: '',
        room_no: '',

        // Child ID
        child_id: '',

        // Upload Documents
        first_title: '', first_doc: null,
        second_title: '', second_doc: null,
        third_title: '', third_doc: null,
        fourth_title: '', fourth_doc: null
    });

    const [autofillCurrent, setAutofillCurrent] = useState(false);
    const [autofillPermanent, setAutofillPermanent] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch classes and sections on component mount
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const classesRes = await api.getClasses();
                if (classesRes && classesRes.status && classesRes.data) {
                    if (classesRes.data.class_sections && Array.isArray(classesRes.data.class_sections)) {
                        setClasses(classesRes.data.class_sections);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch classes:', err);
            }

            try {
                const sectionsRes = await api.getSections();
                if (sectionsRes && sectionsRes.status && sectionsRes.data) {
                    setSections(sectionsRes.data);
                }
            } catch (err) {
                console.warn('Failed to fetch sections:', err);
            }
        };

        const fetchStudentData = async () => {
            if (!id) return;
            try {
                const studentRes = await api.getStudentEditDetails(id);
                if (studentRes && (studentRes.status === true || studentRes.status === 'success') && studentRes.student_data) {
                    const data = studentRes.student_data;
                    setFormData(prev => ({
                        ...prev,
                        ...data,
                        // Ensure null values are handled and map specific fields
                        admission_date: data.admission_date || '',
                        dob: data.dob || '',
                        measurement_date: data.measurement_date || '',
                        religion: data.religion || '',
                        cast: data.cast || '',
                        mobileno: data.mobileno || '',
                        email: data.email || '',
                        current_address: data.current_address || '',
                        permanent_address: data.permanent_address || '',
                        city: data.city || '',
                        state: data.state || '',
                        pincode: data.pincode || '',

                        bank_account_no: data.bank_account_no || '',
                        bank_name: data.bank_name || '',
                        ifsc_code: data.ifsc_code || '',
                        national_identification_no: data.adhar_no || '', // Map adhar_no to national_identification_no
                        local_identification_no: data.samagra_id || '', // Map samagra_id to local_identification_no
                        rte: data.rte || 'No',
                        previous_school: data.previous_school || '',
                        note: data.note || '',

                        father_name: data.father_name || '',
                        father_phone: data.father_phone || '',
                        father_occupation: data.father_occupation || '',
                        mother_name: data.mother_name || '',
                        mother_phone: data.mother_phone || '',
                        mother_occupation: data.mother_occupation || '',

                        guardian_is: data.guardian_is ? data.guardian_is.toLowerCase() : 'father',
                        guardian_name: data.guardian_name || '',
                        guardian_relation: data.guardian_relation || '',
                        guardian_phone: data.guardian_phone || '',
                        guardian_occupation: data.guardian_occupation || '',
                        guardian_email: data.guardian_email || '',
                        guardian_address: data.guardian_address || '',

                        height: data.height || '',
                        weight: data.weight || '',
                        house: data.school_house_id || '',
                        blood_group: data.blood_group || '',
                        class_id: data.class_id || '',
                        section_id: data.section_id || '',
                        category_id: data.category_id || '',

                        child_id: data.child_id || '',
                        class_of_admission: data.class_of_admission || '',

                        // Transport
                        vehroute_id: data.vehroute_id || '',
                        route_id: data.route_id || '',
                        vehicle_id: data.vehicle_id || '',
                        route_pickup_point_id: data.route_pickup_point_id || '',
                        transport_fees: data.transport_fees || '',

                        // Hostel
                        hostel_id: data.hostel_id || '',
                        hostel_room_id: data.hostel_room_id || '',
                    }));
                }
            } catch (err) {
                console.error("Error fetching student details:", err);
                setErrorMessage('Failed to load student details');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchDropdownData();
        fetchStudentData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleGuardianChange = (e) => {
        const val = e.target.value;
        setFormData(prev => {
            let newData = { ...prev, guardian_is: val };
            if (val === 'father') {
                newData.guardian_name = prev.father_name;
                newData.guardian_phone = prev.father_phone;
                newData.guardian_occupation = prev.father_occupation;
                newData.guardian_relation = 'Father';
            } else if (val === 'mother') {
                newData.guardian_name = prev.mother_name;
                newData.guardian_phone = prev.mother_phone;
                newData.guardian_occupation = prev.mother_occupation;
                newData.guardian_relation = 'Mother';
            } else {
                // Keep existing or clear? Let's clear for other to imply manual entry
                newData.guardian_name = '';
                newData.guardian_phone = '';
                newData.guardian_occupation = '';
                newData.guardian_relation = '';
            }
            return newData;
        });
    };

    const handleAutofillGuardianAddress = (e) => {
        const checked = e.target.checked;
        setAutofillCurrent(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, current_address: prev.guardian_address }));
        }
    };

    const handleAutofillPermanentAddress = (e) => {
        const checked = e.target.checked;
        setAutofillPermanent(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, permanent_address: prev.current_address }));
        }
    };

    // Update addresses if autofill is checked and source changes
    useEffect(() => {
        if (autofillCurrent) {
            setFormData(prev => ({ ...prev, current_address: prev.guardian_address }));
        }
    }, [formData.guardian_address, autofillCurrent]);

    useEffect(() => {
        if (autofillPermanent) {
            setFormData(prev => ({ ...prev, permanent_address: prev.current_address }));
        }
    }, [formData.current_address, autofillPermanent]);

    // Initialize Dropify
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    $('.dropify').dropify();
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [showMoreDetails, initialLoading]); // Re-run when details shown or loading finishes

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const dataToSend = new FormData();
            // Append all fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    if (formData[key] instanceof File) {
                        dataToSend.append(key, formData[key]);
                    } else if (Array.isArray(formData[key])) {
                        formData[key].forEach(val => dataToSend.append(`${key}[]`, val));
                    } else {
                        // Mapping dates directly without conversion since API expects YYYY-MM-DD now

                        // Map back specific fields if needed
                        if (key === 'national_identification_no') {
                            dataToSend.append('adhar_no', formData[key]); // Map back to API expectation
                            return;
                        }
                        if (key === 'local_identification_no') {
                            dataToSend.append('samagra_id', formData[key]); // Map back to API expectation
                            return;
                        }

                        dataToSend.append(key, formData[key]);
                    }
                }
            });

            const res = await api.updateStudent(id, dataToSend); // Use updateStudent

            if (res.status || res.success) {
                setSuccessMessage('Student updated successfully!');
                window.scrollTo(0, 0);
            } else {
                setErrorMessage(res.message || 'Failed to update student');
                window.scrollTo(0, 0);
            }

        } catch (error) {
            console.error('Submission Error:', error);
            setErrorMessage(error.message || 'Failed to update student');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    // Callback for sibling modal
    const handleAddSibling = (siblingData) => {
        console.log("Sibling added:", siblingData);
        // Implement logic to pre-fill parent/address data from sibling if needed
        if (siblingData) {
            setFormData(prev => ({
                ...prev,
                father_name: siblingData.father_name || prev.father_name,
                father_phone: siblingData.father_phone || prev.father_phone,
                father_occupation: siblingData.father_occupation || prev.father_occupation,
                mother_name: siblingData.mother_name || prev.mother_name,
                mother_phone: siblingData.mother_phone || prev.mother_phone,
                mother_occupation: siblingData.mother_occupation || prev.mother_occupation,
                guardian_name: siblingData.guardian_name || prev.guardian_name,
                guardian_is: siblingData.guardian_is ? siblingData.guardian_is.toLowerCase() : prev.guardian_is,
                guardian_phone: siblingData.guardian_phone || prev.guardian_phone,
                guardian_email: siblingData.guardian_email || prev.guardian_email,
                guardian_address: siblingData.guardian_address || prev.guardian_address,
                current_address: siblingData.current_address || prev.current_address,
                permanent_address: siblingData.permanent_address || prev.permanent_address,
            }));
        }
    };

    // UI Render - Copied from StudentAdmission but adapted
    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper">
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Edit Student</h3>
                                        <div className="box-tools pull-right impbtntitle" style={{ zIndex: 1000, position: 'relative' }}>
                                            <div className="btn-group pull-right mml15">
                                                <button onClick={() => navigate('/student/search')} className="btn btn-primary btn-sm"><i className="fa fa-arrow-left"></i> Back</button>
                                            </div>
                                        </div>
                                    </div>
                                    <form id="form1" className="" method="post" acceptCharset="utf-8" encType="multipart/form-data" onSubmit={handleSubmit}>
                                        <div className="box-body">
                                            {successMessage && (
                                                <div className="alert alert-success alert-dismissible">
                                                    <button type="button" className="close" onClick={() => setSuccessMessage('')}>×</button>
                                                    <h4><i className="icon fa fa-check"></i> Success!</h4>
                                                    <p>{successMessage}</p>
                                                </div>
                                            )}

                                            {errorMessage && (
                                                <div className="alert alert-danger alert-dismissible">
                                                    <button type="button" className="close" onClick={() => setErrorMessage('')}>×</button>
                                                    <h4><i className="icon fa fa-ban"></i> Error!</h4>
                                                    {errorMessage}
                                                </div>
                                            )}

                                            {/* Core Profile */}
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Admission No <small className="req"> *</small></label>
                                                        <input autoFocus="" name="admission_no" type="text" className="form-control" value={formData.admission_no} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Roll Number</label>
                                                        <input name="roll_no" type="text" className="form-control" value={formData.roll_no} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Class <small className="req"> *</small></label>
                                                        <select name="class_id" className="form-control" value={formData.class_id} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Section <small className="req"> *</small></label>
                                                        <select name="section_id" className="form-control" value={formData.section_id} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.section}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>First Name <small className="req"> *</small></label>
                                                        <input name="firstname" type="text" className="form-control" value={formData.firstname} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Last Name</label>
                                                        <input name="lastname" type="text" className="form-control" value={formData.lastname} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Gender <small className="req"> *</small></label>
                                                        <select className="form-control" name="gender" value={formData.gender} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Date Of Birth <small className="req"> *</small></label>
                                                        <input name="dob" type="date" className="form-control" value={formData.dob} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Category</label>
                                                        {/* Mock categories for now, usually fetched */}
                                                        <select name="category_id" className="form-control" value={formData.category_id} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="1">General</option>
                                                            <option value="2">OBC</option>
                                                            <option value="3">SC</option>
                                                            <option value="4">ST</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Religion</label>
                                                        <input name="religion" type="text" className="form-control" value={formData.religion} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Caste</label>
                                                        <input name="cast" type="text" className="form-control" value={formData.cast} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Mobile Number</label>
                                                        <input name="mobileno" type="text" className="form-control" value={formData.mobileno} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Email</label>
                                                        <input name="email" type="text" className="form-control" value={formData.email} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Admission Date</label>
                                                        <input name="admission_date" type="date" className="form-control" value={formData.admission_date} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Class Of Admission</label>
                                                        <input name="class_of_admission" type="text" className="form-control" value={formData.class_of_admission} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Student Photo</label>
                                                        <input className="dropify" type='file' name='student_photo' onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Blood Group</label>
                                                        <select className="form-control" name="blood_group" value={formData.blood_group} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="A+">A+</option>
                                                            <option value="A-">A-</option>
                                                            <option value="B+">B+</option>
                                                            <option value="B-">B-</option>
                                                            <option value="O+">O+</option>
                                                            <option value="O-">O-</option>
                                                            <option value="AB+">AB+</option>
                                                            <option value="AB-">AB-</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>House</label>
                                                        <select className="form-control" name="house" value={formData.house} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            <option value="Red">Red</option>
                                                            <option value="Blue">Blue</option>
                                                            <option value="Green">Green</option>
                                                            <option value="Yellow">Yellow</option>
                                                            {/* If house is ID, might need mapping loop if houses fetched */}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Height</label>
                                                        <input name="height" type="text" className="form-control" value={formData.height} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Weight</label>
                                                        <input name="weight" type="text" className="form-control" value={formData.weight} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Measurement Date</label>
                                                        <input name="measurement_date" type="date" className="form-control" value={formData.measurement_date} onChange={handleInputChange} />
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Child ID <small className="req"> *</small></label>
                                                            <input name="child_id" type="text" className="form-control" value={formData.child_id} onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                    {/* Sibling button removed or kept depending on requirements, kept for now */}
                                                    <div className="col-md-3 pt25">
                                                        <button type="button" className="btn btn-sm mysiblings anchorbtn" onClick={() => setIsSiblingModalOpen(true)}>
                                                            <i className="fa fa-plus"></i> Add Sibling
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Parent Guardian Detail */}
                                            <h4 className="pagetitleh2">Parent Guardian Detail</h4>
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Father Name</label>
                                                        <input name="father_name" type="text" className="form-control" value={formData.father_name} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Father Phone</label>
                                                        <input name="father_phone" type="text" className="form-control" value={formData.father_phone} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Father Occupation</label>
                                                        <input name="father_occupation" type="text" className="form-control" value={formData.father_occupation} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Father Photo</label>
                                                        <input className="dropify" type='file' name='father_pic' onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Mother Name</label>
                                                        <input name="mother_name" type="text" className="form-control" value={formData.mother_name} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Mother Phone</label>
                                                        <input name="mother_phone" type="text" className="form-control" value={formData.mother_phone} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Mother Occupation</label>
                                                        <input name="mother_occupation" type="text" className="form-control" value={formData.mother_occupation} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Mother Photo</label>
                                                        <input className="dropify" type='file' name='mother_pic' onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="form-group col-md-12">
                                                    <label>If Guardian Is <small className="req"> *</small>&nbsp;&nbsp;&nbsp;</label>
                                                    <label className="radio-inline">
                                                        <input type="radio" name="guardian_is" value="father" checked={formData.guardian_is === 'father'} onChange={handleGuardianChange} /> Father
                                                    </label>
                                                    <label className="radio-inline">
                                                        <input type="radio" name="guardian_is" value="mother" checked={formData.guardian_is === 'mother'} onChange={handleGuardianChange} /> Mother
                                                    </label>
                                                    <label className="radio-inline">
                                                        <input type="radio" name="guardian_is" value="other" checked={formData.guardian_is === 'other'} onChange={handleGuardianChange} /> Other
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Guardian Name <small className="req"> *</small></label>
                                                                <input name="guardian_name" type="text" className="form-control" value={formData.guardian_name} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Guardian Relation</label>
                                                                <input name="guardian_relation" type="text" className="form-control" value={formData.guardian_relation} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Guardian Phone <small className="req"> *</small></label>
                                                                <input name="guardian_phone" type="text" className="form-control" value={formData.guardian_phone} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Guardian Occupation</label>
                                                                <input name="guardian_occupation" type="text" className="form-control" value={formData.guardian_occupation} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Guardian Email</label>
                                                        <input name="guardian_email" type="text" className="form-control" value={formData.guardian_email} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Guardian Photo</label>
                                                        <input className="dropify" type='file' name='guardian_pic' onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Guardian Address</label>
                                                        <textarea name="guardian_address" className="form-control" rows="2" value={formData.guardian_address} onChange={handleInputChange}></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Add More Details Toggle */}
                                            <div className="box-group">
                                                <div className="panel box border0 mb0">
                                                    <div className="addmoredetail-title">
                                                        <button
                                                            type="button"
                                                            className="btn btn-link boxplus"
                                                            onClick={() => setShowMoreDetails(!showMoreDetails)}
                                                            style={{ textDecoration: 'none', color: '#444', fontWeight: 'bold' }}
                                                        >
                                                            <i className={`fa fa-fw ${showMoreDetails ? 'fa-minus' : 'fa-plus'}`}></i>
                                                            {showMoreDetails ? ' Hide More Details' : ' Add More Details'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {showMoreDetails && (
                                                <div className="show-more-details-section">
                                                    <h4 className="pagetitleh2">Student Address Details</h4>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="checkbox">
                                                                <label>
                                                                    <input type="checkbox" checked={autofillCurrent} onChange={handleAutofillGuardianAddress} /> If Guardian Address is Current Address
                                                                </label>
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Current Address</label>
                                                                <textarea name="current_address" rows="2" className="form-control" value={formData.current_address} onChange={handleInputChange}></textarea>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="checkbox">
                                                                <label>
                                                                    <input type="checkbox" checked={autofillPermanent} onChange={handleAutofillPermanentAddress} /> If Permanent Address is Current Address
                                                                </label>
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Permanent Address</label>
                                                                <textarea name="permanent_address" rows="2" className="form-control" value={formData.permanent_address} onChange={handleInputChange}></textarea>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>City</label>
                                                                <input type="text" className="form-control" name="city" value={formData.city} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>State</label>
                                                                <input type="text" className="form-control" name="state" value={formData.state} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Pincode</label>
                                                                <input type="text" className="form-control" name="pincode" value={formData.pincode} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Misc */}
                                                    <h4 className="pagetitleh2">Miscellaneous Details</h4>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Bank Account Number</label>
                                                                <input name="bank_account_no" type="text" className="form-control" value={formData.bank_account_no} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Bank Name</label>
                                                                <input name="bank_name" type="text" className="form-control" value={formData.bank_name} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>IFSC Code</label>
                                                                <input name="ifsc_code" type="text" className="form-control" value={formData.ifsc_code} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>National Identification No</label>
                                                                <input name="national_identification_no" type="text" className="form-control" value={formData.national_identification_no} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Local Identification No</label>
                                                                <input name="local_identification_no" type="text" className="form-control" value={formData.local_identification_no} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label>RTE</label>
                                                            <div className="radio">
                                                                <label className="radio-inline">
                                                                    <input type="radio" name="rte" value="Yes" checked={formData.rte === 'Yes'} onChange={handleInputChange} /> Yes
                                                                </label>
                                                                <label className="radio-inline">
                                                                    <input type="radio" name="rte" value="No" checked={formData.rte === 'No'} onChange={handleInputChange} /> No
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Previous School Details</label>
                                                                <textarea name="previous_school" rows="2" className="form-control" value={formData.previous_school} onChange={handleInputChange}></textarea>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Note</label>
                                                                <textarea name="note" rows="2" className="form-control" value={formData.note} onChange={handleInputChange}></textarea>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Transport & Hostel Details */}
                                                    <h4 className="pagetitleh2">Transport Details</h4>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Route List</label>
                                                                <select className="form-control" name="vehroute_id" value={formData.vehroute_id || formData.route_list} onChange={handleInputChange}>
                                                                    <option value="">Select</option>
                                                                    <optgroup label="Route A">
                                                                        <option value="VH001">Vehicle 1 (VH001)</option>
                                                                        <option value="VH002">Vehicle 2 (VH002)</option>
                                                                    </optgroup>
                                                                    <optgroup label="Route B">
                                                                        <option value="VH003">Vehicle 3 (VH003)</option>
                                                                    </optgroup>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Pickup Point</label>
                                                                <select className="form-control" name="route_pickup_point_id" value={formData.route_pickup_point_id || formData.pickup_point} onChange={handleInputChange}>
                                                                    <option value="">Select</option>
                                                                    <option value="Point A">Point A</option>
                                                                    <option value="Point B">Point B</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Fees Month</label>
                                                                <select className="form-control" name="fees_month" value={formData.fees_month} onChange={handleInputChange} multiple={true}>
                                                                    <option value="January">January</option>
                                                                    <option value="February">February</option>
                                                                    <option value="March">March</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <h4 className="pagetitleh2">Hostel Details</h4>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Hostel</label>
                                                                <select className="form-control" name="hostel_id" value={formData.hostel_id || formData.hostel} onChange={handleInputChange}>
                                                                    <option value="">Select</option>
                                                                    <option value="Hostel A">Hostel A</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Room No</label>
                                                                <select className="form-control" name="hostel_room_id" value={formData.hostel_room_id || formData.room_no} onChange={handleInputChange}>
                                                                    <option value="">Select</option>
                                                                    <option value="101">101 (AC)</option>
                                                                    <option value="102">102 (Non-AC)</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Upload Documents Details */}
                                                    <h4 className="pagetitleh2">Upload Documents</h4>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Title</label>
                                                                <input type="text" className="form-control" name="first_title" value={formData.first_title} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Documents</label>
                                                                <input className="dropify" type="file" name="first_doc" onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Title</label>
                                                                <input type="text" className="form-control" name="second_title" value={formData.second_title} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Documents</label>
                                                                <input className="dropify" type="file" name="second_doc" onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Title</label>
                                                                <input type="text" className="form-control" name="third_title" value={formData.third_title} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Documents</label>
                                                                <input className="dropify" type="file" name="third_doc" onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Title</label>
                                                                <input type="text" className="form-control" name="fourth_title" value={formData.fourth_title} onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Documents</label>
                                                                <input className="dropify" type="file" name="fourth_doc" onChange={handleInputChange} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="box-footer">
                                            <button type="submit" className="btn btn-info pull-right">{loading ? 'Saving...' : 'Save'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
            {isSiblingModalOpen && <SiblingModal isOpen={isSiblingModalOpen} onClose={() => setIsSiblingModalOpen(false)} onAddSibling={handleAddSibling} />}
        </div>
    );
};

export default StudentEdit;
