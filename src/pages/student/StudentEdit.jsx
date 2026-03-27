import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import SiblingModal from '../../components/SiblingModal';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';

const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://newlayout.wisibles.com/uploads/student_images/no_image.png';
    return `https://newlayout.wisibles.com/${imagePath}`;
};

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
        image: null,
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

        // Sibling Details
        sibling_id: '',
        sibling_name: '',

        // Student Identifiers
        student_id: '',
        student_session_id: '',

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
    const [categories, setCategories] = useState([]);
    const [houseList, setHouseList] = useState([]);
    const [bloodgroupList, setBloodgroupList] = useState([]);
    const [siblings, setSiblings] = useState([]);

    // Transport & Hostel Lists
    const [hostels, setHostels] = useState([]);
    const [hostelRooms, setHostelRooms] = useState([]);
    const [vehRoutes, setVehRoutes] = useState({});
    const [pickupPoints, setPickupPoints] = useState([]);
    const [transportFeesList, setTransportFeesList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [initialPhotoUrls, setInitialPhotoUrls] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch classes and sections on component mount
    useEffect(() => {
        const fetchStudentData = async () => {
            if (!id) return;
            try {
                const studentRes = await api.getStudentEditDetails(id);
                if (studentRes && (studentRes.status === true || studentRes.status === 'success') && studentRes.student_data) {
                    const data = studentRes.student_data.student;

                    if (Array.isArray(studentRes.student_data.classlist)) {
                        setClasses(studentRes.student_data.classlist);
                    }
                    if (Array.isArray(studentRes.student_data.categorylist)) {
                        setCategories(studentRes.student_data.categorylist);
                    }
                    const hList = studentRes.student_data.houseList || [];
                    if (Array.isArray(hList)) {
                        setHouseList(hList);
                    }
                    if (studentRes.student_data.bloodgroupList) {
                        const bgList = studentRes.student_data.bloodgroupList;
                        setBloodgroupList(Array.isArray(bgList) ? bgList : Object.values(bgList));
                    }

                    if (data && data.class_id) {
                        try {
                            const response = await api.getSectionsByClass(data.class_id);
                            if (response && response.data) setSections(response.data);
                            else if (response && Array.isArray(response)) setSections(response);
                        } catch (err) {
                            console.error('Error fetching sections:', err);
                        }
                    }

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
                        house: data.house_id ? String(data.house_id) : 
                               (data.school_house_id ? String(data.school_house_id) : 
                               (data.student_house_id ? String(data.student_house_id) : 
                               (data.house && !isNaN(data.house) ? String(data.house) : 
                               (data.house && hList.length > 0 ? (hList.find(h => h.house_name === data.house)?.id || '') : '')))),
                        blood_group: data.blood_group || '',
                        class_id: data.class_id ? String(data.class_id) : '',
                        section_id: data.section_id ? String(data.section_id) : '',
                        category_id: data.category_id ? String(data.category_id) : '',

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

                        sibling_id: data.sibling_id || '',
                        sibling_name: data.sibling_name || '',

                        student_id: data.id || id,
                        student_session_id: data.student_session_id || '',
                    }));

                    // Infer autofill states based on existing address data
                    if (data.current_address && data.guardian_address && data.current_address === data.guardian_address) {
                        setAutofillCurrent(true);
                    }
                    if (data.permanent_address && data.current_address && data.permanent_address === data.current_address) {
                        setAutofillPermanent(true);
                    }

                    // Store initial photo URLs for Dropify
                    setInitialPhotoUrls({
                        image: getImageUrl(data.image),
                        father_pic: getImageUrl(data.father_pic),
                        mother_pic: getImageUrl(data.mother_pic),
                        guardian_pic: getImageUrl(data.guardian_pic),
                        first_doc: data.first_doc ? getImageUrl(`uploads/student_documents/${data.id}/${data.first_doc}`) : '',
                        second_doc: data.second_doc ? getImageUrl(`uploads/student_documents/${data.id}/${data.second_doc}`) : '',
                        third_doc: data.third_doc ? getImageUrl(`uploads/student_documents/${data.id}/${data.third_doc}`) : '',
                        fourth_doc: data.fourth_doc ? getImageUrl(`uploads/student_documents/${data.id}/${data.fourth_doc}`) : '',
                    });

                    // Use siblings from studentRes if available
                    if (studentRes.student_data.siblings) {
                        setSiblings(studentRes.student_data.siblings);
                    }

                    // Populate Transport & Hostel Lists from studentRes if available
                    if (studentRes.student_data.vehroutelist) {
                        setVehRoutes(studentRes.student_data.vehroutelist);
                    }
                    if (Array.isArray(studentRes.student_data.hostelList)) {
                        setHostels(studentRes.student_data.hostelList);
                    }

                    // Initial fetch for rooms if hostel_id is already set
                    const initialHostelId = data.hostel_id || data.hostel;
                    if (initialHostelId) {
                        try {
                            const roomRes = await api.getHostelRooms(initialHostelId);
                            if (roomRes && roomRes.data) setHostelRooms(roomRes.data);
                        } catch (err) { console.error('Error fetching initial rooms:', err); }
                    }
                }

                // If transport/hostel lists weren't in studentRes, fetch from pre-data
                try {
                    const preRes = await api.getStudentCreatePreData();
                    if (preRes && preRes.status === 'success' && preRes.data) {
                        const d = preRes.data;
                        if (d.vehroutelist) setVehRoutes(d.vehroutelist);
                        if (Array.isArray(d.hostelList)) setHostels(d.hostelList);
                        if (Array.isArray(d.transport_fees)) setTransportFeesList(d.transport_fees);
                        if (d.bloodgroupList && bloodgroupList.length === 0) {
                            const bg = Array.isArray(d.bloodgroupList) ? d.bloodgroupList : Object.values(d.bloodgroupList);
                            setBloodgroupList(bg);
                        }
                        if (Array.isArray(d.houseList) && houseList.length === 0) setHouseList(d.houseList);
                    }
                } catch (preErr) { console.warn("Failed to fetch pre-data:", preErr); }

                // If siblings weren't in main response or we want to ensure latest
                if (studentRes.student_data && !studentRes.student_data.siblings) {
                    const siblingRes = await api.getSiblingDetails(id);
                    if (siblingRes && siblingRes.status) {
                        let siblingData = [];
                        if (Array.isArray(siblingRes.data)) {
                            siblingData = siblingRes.data;
                        } else if (siblingRes.data && typeof siblingRes.data === 'object' && siblingRes.data.id) {
                            siblingData = [siblingRes.data];
                        } else if (siblingRes.data && (siblingRes.data.siblings || siblingRes.data.sibling)) {
                            const nested = siblingRes.data.siblings || siblingRes.data.sibling;
                            siblingData = Array.isArray(nested) ? nested : [nested];
                        } else if (siblingRes.siblings || siblingRes.sibling) {
                            const direct = siblingRes.siblings || siblingRes.sibling;
                            siblingData = Array.isArray(direct) ? direct : [direct];
                        }
                        setSiblings(siblingData);
                    }
                }
            } catch (err) {
                console.error("Error fetching student details:", err);
                setErrorMessage('Failed to load student details');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchStudentData();
    }, [id]);

    const handleInputChange = async (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));

            // Trigger section fetch if class changes
            if (name === 'class_id') {
                setSections([]); // Clear sections
                setFormData(prev => ({ ...prev, section_id: '' })); // Reset section selection

                if (value) {
                    try {
                        const response = await api.getSectionsByClass(value);
                        if (response && response.data) {
                            setSections(response.data);
                        } else if (response && Array.isArray(response)) {
                            setSections(response);
                        }
                    } catch (error) {
                        console.error('Error fetching sections by class:', error);
                    }
                }
            }

            // Trigger hostel room fetch if hostel changes
            if (name === 'vehroute_id' || name === 'route_list') {
                // Future: fetch pickup points when route is selected
            }

            if (name === 'hostel_id' || name === 'hostel') {
                setHostelRooms([]);
                setFormData(prev => ({ ...prev, hostel_room_id: '', room_no: '' }));
                if (value) {
                    try {
                        const response = await api.getHostelRooms(value);
                        if (response && response.data) setHostelRooms(response.data);
                    } catch (error) {
                        console.error('Error fetching hostel rooms:', error);
                    }
                }
            }
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

            // Convert YYYY-MM-DD → DD/MM/YYYY for date fields the API expects
            const dateFields = ['dob', 'admission_date', 'measurement_date'];
            // Append all fields
            const skipFields = ['adhar_no', 'samagra_id', 'username', 'password', 'user_id'];
            Object.keys(formData).forEach(key => {
                if (skipFields.includes(key)) return;
                const value = formData[key];

                // Only append if value is not empty (null, undefined, empty string, or empty array)
                const isEmpty = (val) => {
                    if (val === null || val === undefined) return true;
                    if (typeof val === 'string' && val.trim() === '') return true;
                    if (Array.isArray(val) && val.length === 0) return true;
                    return false;
                };

                if (!isEmpty(value)) {
                    if (value instanceof File) {
                        dataToSend.append(key, value);
                    } else if (Array.isArray(value)) {
                        value.forEach(val => dataToSend.append(`${key}[]`, val));
                    } else {
                        // Mapping back specific fields
                        if (key === 'national_identification_no') {
                            dataToSend.append('adhar_no', value);
                            return;
                        }
                        if (key === 'local_identification_no') {
                            dataToSend.append('samagra_id', value);
                            return;
                        }
                        if (key === 'measurement_date') {
                            dataToSend.append('measure_date', value);
                            return;
                        }
                        if (key === 'route_list') {
                            dataToSend.append('vehroute_id', value);
                            return;
                        }
                        if (key === 'hostel') {
                            dataToSend.append('hostel_id', value);
                            return;
                        }
                        // Note: house is sent as 'house' by default (key reflects state name)
                        // to match StudentAdmission.jsx behavior which is known to work.

                        const imageFields = ['image', 'father_pic', 'mother_pic', 'guardian_pic', 'first_doc', 'second_doc', 'third_doc', 'fourth_doc'];
                        if (imageFields.includes(key) && !(value instanceof File)) {
                            return;
                        }

                        dataToSend.append(key, value);
                    }
                }
            });

            // Explicitly ensure student_id and student_session_id are present
            if (formData.student_id) {
                dataToSend.append('id', formData.student_id);
            }
            if (formData.student_session_id) {
                dataToSend.append('student_session_id', formData.student_session_id);
            }

            const res = await api.updateStudent(id, dataToSend); // Use updateStudent

            if (res.status || res.success) {
                toast.success('Student updated successfully!');
                navigate(-1);
            } else {
                toast.error(res.message || 'Failed to update student');
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
        if (!siblingData) return;

        // Add to siblings list for display
        setSiblings(prev => [...prev, siblingData]);

        setFormData(prev => ({
            ...prev,
            religion: siblingData.religion || '',
            cast: siblingData.cast || '',
            blood_group: siblingData.blood_group || '',
            category_id: siblingData.category_id || '',
            father_name: siblingData.father_name || '',
            father_phone: siblingData.father_phone || siblingData.guardian_phone || '',
            father_occupation: siblingData.father_occupation || '',
            mother_name: siblingData.mother_name || '',
            mother_phone: siblingData.mother_phone || '',
            mother_occupation: siblingData.mother_occupation || '',
            guardian_is: siblingData.guardian_is || (siblingData.guardian_relation ? siblingData.guardian_relation.toLowerCase() : 'father'),
            guardian_name: siblingData.guardian_name || '',
            guardian_relation: siblingData.guardian_relation || '',
            guardian_phone: siblingData.guardian_phone || '',
            guardian_occupation: siblingData.guardian_occupation || '',
            guardian_email: siblingData.guardian_email || '',
            guardian_address: siblingData.guardian_address || '',
            current_address: siblingData.current_address || '',
            permanent_address: siblingData.permanent_address || '',
            bank_account_no: siblingData.bank_account_no || '',
            bank_name: siblingData.bank_name || '',
            ifsc_code: siblingData.ifsc_code || '',
            national_identification_no: siblingData.adhar_no || '',
            local_identification_no: siblingData.samagra_id || '',
            sibling_id: siblingData.id || '',
            sibling_name: `${siblingData.firstname} ${siblingData.lastname}`.trim()
        }));
        toast.success(`Parent details populated from sibling: ${siblingData.firstname}`);
    };

    const handleRemoveSibling = (siblingId) => {
        setSiblings(prev => prev.filter(s => String(s.id) !== String(siblingId)));
        if (String(formData.sibling_id) === String(siblingId)) {
            setFormData(prev => ({
                ...prev,
                sibling_id: '',
                sibling_name: ''
            }));
        }
        toast.success('Sibling removed from this record');
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
                                        <div className="box-tools pull-right impbtntitle" style={{ zIndex: 0, position: 'relative' }}>
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
                                                            {classes.map(cls => <option key={cls.id} value={String(cls.id)}>{cls.class}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Section <small className="req"> *</small></label>
                                                        <select name="section_id" className="form-control" value={formData.section_id} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            {sections.map(sec => <option key={sec.section_id || sec.id} value={String(sec.section_id || sec.id)}>{sec.section}</option>)}
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
                                                            {categories.map((cat) => (
                                                                <option key={cat.id} value={String(cat.id)}>{cat.category}</option>
                                                            ))}
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
                                                        <input className="dropify" type='file' name='image' data-default-file={initialPhotoUrls.image} onChange={handleInputChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Blood Group</label>
                                                        <select className="form-control" name="blood_group" value={formData.blood_group} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            {bloodgroupList.map((bg, idx) => (
                                                                <option key={idx} value={bg}>
                                                                    {bg}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>House</label>
                                                        <select className="form-control" name="house" value={formData.house} onChange={handleInputChange}>
                                                            <option value="">Select</option>
                                                            {houseList.map((house) => (
                                                                <option key={house.id} value={String(house.id)}>
                                                                    {house.house_name}
                                                                </option>
                                                            ))}
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

                                                {siblings && siblings.length > 0 && (
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <h4 className="pagetitleh2" style={{ marginTop: '0' }}>Existing Siblings</h4>
                                                            <div className="row">
                                                                {siblings.map((sibling) => (
                                                                    <div className="col-md-4" key={sibling.id || sibling.student_session_id}>
                                                                        <div className="box box-widget widget-user-2" style={{ border: '1px solid #eee', marginBottom: '15px', borderRadius: '4px' }}>
                                                                            <div className="widget-user-header bg-gray-light" style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
                                                                                <div className="widget-user-image" style={{ marginRight: '15px', flexShrink: 0 }}>
                                                                                    <img
                                                                                        className="img-circle"
                                                                                        src={getImageUrl(sibling.image)}
                                                                                        alt="Sibling"
                                                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid #fff' }}
                                                                                    />
                                                                                </div>
                                                                                <div className="widget-user-details" style={{ flexGrow: 1, overflow: 'hidden' }}>
                                                                                    <div className="pull-right">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-default btn-xs text-red"
                                                                                            title="Remove"
                                                                                            onClick={() => handleRemoveSibling(sibling.id)}
                                                                                            style={{ border: "none", background: "transparent" }}
                                                                                        >
                                                                                            <i className="fa fa-trash-o" style={{ fontSize: "16px" }}></i>
                                                                                        </button>
                                                                                    </div>
                                                                                    <h5 style={{ margin: '0', fontSize: '12px', color: '#888', fontWeight: '600' }}>
                                                                                        {sibling.class} ({sibling.section})
                                                                                    </h5>
                                                                                    <h4 style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                        {sibling.firstname} {sibling.lastname}
                                                                                    </h4>
                                                                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#555' }}>
                                                                                        Adm No: <strong>{sibling.admission_no}</strong>
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Parent Guardian Detail */}
                                            <h4 className="pagetitleh2">Parent Guardian Details</h4>
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
                                                        <input className="dropify" type='file' name='father_pic' data-default-file={initialPhotoUrls.father_pic} onChange={handleInputChange} />
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
                                                            <input className="dropify" type='file' name='mother_pic' data-default-file={initialPhotoUrls.mother_pic} onChange={handleInputChange} />
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
                                                            <input className="dropify" type='file' name='guardian_pic' data-default-file={initialPhotoUrls.guardian_pic} onChange={handleInputChange} />
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
                                                                    <input name="ifsc_code"
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={formData.ifsc_code}
                                                                        onChange={handleInputChange} />
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
                                                                <div className="form-group">
                                                                    <label>RTE</label>
                                                                    <select className="form-control" name="rte" value={formData.rte} onChange={handleInputChange}>
                                                                        <option value="Yes">Yes</option>
                                                                        <option value="No">No</option>
                                                                    </select>
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
                                                                        {Object.values(vehRoutes).map(route => (
                                                                            <optgroup key={route.id} label={route.route_title}>
                                                                                {route.vehicles && route.vehicles.map(vehicle => (
                                                                                    <option key={vehicle.vec_route_id} value={String(vehicle.vec_route_id)}>
                                                                                        {vehicle.vehicle_no} ({vehicle.vehicle_model})
                                                                                    </option>
                                                                                ))}
                                                                            </optgroup>
                                                                        ))}
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
                                                                    {/* Map month checkboxes like StudentAdmission */}
                                                                    <div className="checkbox-list" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                                                                        {transportFeesList.map((tf, index) => (
                                                                            <div className="checkbox" key={index} style={{ marginTop: '0', marginBottom: '5px' }}>
                                                                                <label>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        name="fees_month"
                                                                                        value={tf.month}
                                                                                        checked={Array.isArray(formData.fees_month) && formData.fees_month.includes(tf.month)}
                                                                                        onChange={(e) => {
                                                                                            const { value, checked } = e.target;
                                                                                            setFormData(prev => {
                                                                                                const currentMonths = Array.isArray(prev.fees_month) ? prev.fees_month : [];
                                                                                                const nextMonths = checked
                                                                                                    ? [...currentMonths, value]
                                                                                                    : currentMonths.filter(m => m !== value);
                                                                                                return { ...prev, fees_month: nextMonths };
                                                                                            });
                                                                                        }}
                                                                                    />
                                                                                    {tf.month}
                                                                                </label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
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
                                                                        {hostels.map(h => (
                                                                            <option key={h.id} value={String(h.id)}>{h.hostel_name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Room No</label>
                                                                    <select className="form-control" name="hostel_room_id" value={formData.hostel_room_id || formData.room_no} onChange={handleInputChange}>
                                                                        <option value="">Select</option>
                                                                        {hostelRooms.map(room => (
                                                                            <option key={room.id} value={String(room.id)}>{room.room_no} ({room.room_type})</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>                                                     {/* Upload Documents Details */}
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
                                                                    <input className="dropify" type="file" name="first_doc" data-default-file={initialPhotoUrls.first_doc} onChange={handleInputChange} />
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
                                                                    <input className="dropify" type="file" name="second_doc" data-default-file={initialPhotoUrls.second_doc} onChange={handleInputChange} />
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
                                                                    <input className="dropify" type="file" name="third_doc" data-default-file={initialPhotoUrls.third_doc} onChange={handleInputChange} />
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
                                                                    <input className="dropify" type="file" name="fourth_doc" data-default-file={initialPhotoUrls.fourth_doc} onChange={handleInputChange} />
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
                    )
                    }
                </section >
            </div >
            <Footer />
            {isSiblingModalOpen && <SiblingModal isOpen={isSiblingModalOpen} onClose={() => setIsSiblingModalOpen(false)} onAddSibling={handleAddSibling} />}
        </div >
    );
};

export default StudentEdit;

