import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const SendWhatsApp = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('group');
    const [loading, setLoading] = useState(false);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [roles, setRoles] = useState([]);

    // Group Tab State
    const [groupForm, setGroupForm] = useState({
        message_type: '',
        video_link: '',
        message: '',
        users: [],
        send_type: 'send_now',
        schedule_date_time: ''
    });

    // Individual Tab State
    const [individualForm, setIndividualForm] = useState({
        message_type: '',
        video_link: '',
        message: '',
        send_type: 'send_now',
        schedule_date_time: ''
    });
    const [searchCategory, setSearchCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedSearchResult, setSelectedSearchResult] = useState(null);
    const [selectedTableFilter, setSelectedTableFilter] = useState('');
    const [messageToOptions, setMessageToOptions] = useState([]);

    // Class Tab State
    const [classForm, setClassForm] = useState({
        message_type: '',
        video_link: '',
        message: '',
        class_id: '',
        sections: [],
        send_type: 'send_now',
        schedule_date_time: ''
    });

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.getWhatsAppCompose();
                if (response && response.status === true && response.data) {
                    // Set class list
                    if (response.data.classlist) {
                        setClassList(response.data.classlist);
                    }

                    // Set roles (exclude Super Admin)
                    if (response.data.roles) {
                        setRoles(response.data.roles.filter(r => r.name !== 'Super Admin'));
                    }
                }
            } catch (error) {
                console.error('Error fetching WhatsApp compose data:', error);
            }
        };
        fetchData();
    }, []);

    // Live search for Individual tab
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery && searchCategory) {
                setSearchLoading(true);
                try {
                    const response = await api.searchMailSMS(searchQuery, searchCategory);
                    if (response && response.status === true) {
                        setSearchResults(response.data || []);
                    } else {
                        setSearchResults([]);
                    }
                } catch (error) {
                    console.error('Error searching:', error);
                    setSearchResults([]);
                } finally {
                    setSearchLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        };
        performSearch();
    }, [searchQuery, searchCategory]);

    // Build messageToOptions from roles
    useEffect(() => {
        const options = [
            { id: 'student', name: 'Students' },
            { id: 'parent', name: 'Guardians' },
            ...roles.map(r => ({ id: r.id, name: r.name }))
        ];
        setMessageToOptions(options);
    }, [roles]);

    // Fetch sections when class changes
    const handleClassChange = async (classId) => {
        setClassForm(prev => ({ ...prev, class_id: classId, sections: [] }));
        setSectionList([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status === 'success') {
                    setSectionList(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    // Character counter
    const getCharCount = (text) => text ? text.length : 0;

    // Handle Group Form Submit
    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        if (!groupForm.message_type) {
            toast.error('Please select message type');
            return;
        }
        if (!groupForm.message) {
            toast.error('Please enter message');
            return;
        }
        if (groupForm.users.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        setLoading(true);
        try {
            // Build payload
            const payload = {
                message_type_group: groupForm.message_type,
                video_link_grp: groupForm.message_type === 'video' ? groupForm.video_link : '',
                group_message: groupForm.message,
                user: groupForm.users,
                send_type: groupForm.send_type
            };

            // Add schedule date/time if scheduling
            if (groupForm.send_type === 'schedule' && groupForm.schedule_date_time) {
                const dateTime = new Date(groupForm.schedule_date_time);
                payload.schedule_date = dateTime.toISOString().split('T')[0]; // YYYY-MM-DD
                payload.schedule_time = dateTime.toTimeString().split(' ')[0]; // HH:MM:SS
            }

            const response = await api.sendWhatsAppGroup(payload);

            if (response && response.status === true) {
                toast.success('WhatsApp message sent successfully');
                setGroupForm({
                    message_type: '',
                    video_link: '',
                    message: '',
                    users: [],
                    send_type: 'send_now',
                    schedule_date_time: ''
                });
            } else {
                toast.error(response.message || 'Failed to send message');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    // Handle Individual Form Submit
    const handleIndividualSubmit = async (e) => {
        e.preventDefault();
        if (!individualForm.message_type) {
            toast.error('Please select message type');
            return;
        }
        if (!individualForm.message) {
            toast.error('Please enter message');
            return;
        }
        if (selectedRecipients.length === 0) {
            toast.error('Please add at least one recipient');
            return;
        }

        setLoading(true);
        try {
            // Build user_list from selectedRecipients
            const userList = selectedRecipients.map(recipient => ({
                category: recipient.category,
                record_id: recipient.record_id || recipient.id,
                email: recipient.email || '',
                guardianEmail: recipient.guardianEmail || '',
                mobileno: recipient.mobileno || '',
                app_key: ''
            }));

            // Build payload
            const payload = {
                message_type_individual: individualForm.message_type,
                video_link_indv: individualForm.message_type === 'video' ? individualForm.video_link : '',
                individual_message: individualForm.message,
                selected_value: searchCategory || 'student',
                individual_send_type: individualForm.send_type,
                user_list: [userList] // Nested array structure as per API
            };

            // Add schedule date/time if scheduling
            if (individualForm.send_type === 'schedule' && individualForm.schedule_date_time) {
                const dateTime = new Date(individualForm.schedule_date_time);
                payload.schedule_date = dateTime.toISOString().split('T')[0]; // YYYY-MM-DD
                payload.schedule_time = dateTime.toTimeString().split(' ')[0]; // HH:MM:SS
            }

            const response = await api.sendWhatsAppIndividual(payload);

            if (response && response.status === true) {
                toast.success('WhatsApp message sent successfully');
                setIndividualForm({
                    message_type: '',
                    video_link: '',
                    message: '',
                    send_type: 'send_now',
                    schedule_date_time: ''
                });
                setSelectedRecipients([]);
                setSearchQuery('');
                setSearchCategory('');
            } else {
                toast.error(response.message || 'Failed to send message');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    // Handle Class Form Submit
    const handleClassSubmit = async (e) => {
        e.preventDefault();
        if (!classForm.message_type) {
            toast.error('Please select message type');
            return;
        }
        if (!classForm.message) {
            toast.error('Please enter message');
            return;
        }
        if (!classForm.class_id) {
            toast.error('Please select a class');
            return;
        }

        setLoading(true);
        try {
            // Build payload
            const payload = {
                message_type_class: classForm.message_type,
                video_link_cls: classForm.message_type === 'video' ? classForm.video_link : '',
                class_message: classForm.message,
                class_id: parseInt(classForm.class_id),
                user: classForm.sections, // Section IDs
                class_send_type: classForm.send_type
            };

            // Add schedule date/time if scheduling
            if (classForm.send_type === 'schedule' && classForm.schedule_date_time) {
                const dateTime = new Date(classForm.schedule_date_time);
                payload.schedule_date = dateTime.toISOString().split('T')[0]; // YYYY-MM-DD
                payload.schedule_time = dateTime.toTimeString().split(' ')[0]; // HH:MM:SS
            }

            const response = await api.sendWhatsAppClass(payload);

            if (response && response.status === true) {
                toast.success('WhatsApp message sent successfully');
                setClassForm({
                    message_type: '',
                    video_link: '',
                    message: '',
                    class_id: '',
                    sections: [],
                    send_type: 'send_now',
                    schedule_date_time: ''
                });
                setSectionList([]);
            } else {
                toast.error(response.message || 'Failed to send message');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    // Toggle user selection for group
    const toggleGroupUser = (value) => {
        setGroupForm(prev => {
            const users = prev.users.includes(value)
                ? prev.users.filter(u => u !== value)
                : [...prev.users, value];
            return { ...prev, users };
        });
    };

    // Toggle section selection for class
    const toggleSection = (sectionId) => {
        setClassForm(prev => {
            const sections = prev.sections.includes(sectionId)
                ? prev.sections.filter(s => s !== sectionId)
                : [...prev.sections, sectionId];
            return { ...prev, sections };
        });
    };

    // Handle selecting a recipient from search results
    const handleSelectRecipient = (result) => {
        let displayName = '';
        if (searchCategory === 'student') {
            displayName = `${result.firstname || result.name || ''} ${result.lastname || ''} (${result.admission_no || ''})`;
        } else if (searchCategory === 'parent') {
            displayName = `${result.guardian_name || result.name || ''} (${result.guardian_phone || ''})`;
        } else {
            displayName = `${result.name || result.firstname || ''} ${result.lastname || ''}`;
        }

        const newRecipient = {
            id: result.id,
            name: displayName.trim(),
            category: searchCategory
        };

        setSelectedRecipients(prev => {
            const exists = prev.some(r => r.id === result.id && r.category === searchCategory);
            if (!exists) {
                return [...prev, newRecipient];
            }
            return prev;
        });
        setSearchQuery('');
        setSearchResults([]);
        setSelectedSearchResult(null);
    };

    // Get display name for search result
    const getResultDisplayName = (result) => {
        if (searchCategory === 'student') {
            return `${result.firstname || result.name || ''} ${result.lastname || ''} (${result.admission_no || ''})`.trim();
        } else if (searchCategory === 'parent') {
            return `${result.guardian_name || result.name || ''} (${result.guardian_phone || ''})`;
        } else {
            return `${result.name || result.firstname || ''} ${result.lastname || ''}`.trim();
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>
                {`
                @media (max-width: 600px) {
                    .nav-tabs-reorder {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        justify-content: flex-end !important;
                        padding-right: 0px !important;
                    }
                    .nav-tabs-reorder li:nth-child(2) {
                        order: 10 !important;
                        width: 100% !important;
                        float: none !important;
                        padding: 10px 15px !important;
                        border-top: none !important;
                    }
                    .nav-tabs-reorder li:nth-child(1) { order: 4 !important; } 
                    .nav-tabs-reorder li:nth-child(3) { order: 3 !important; } 
                    .nav-tabs-reorder li:nth-child(4) { order: 2 !important; } 
                    .nav-tabs-reorder li:nth-child(5) { order: 1 !important; } 
                    
                    .nav-tabs-reorder li {
                        float: none !important;
                        margin: 0 !important;
                    }
                    .nav-tabs-reorder li a {
                        padding: 10px 8px !important;
                        font-size: 13px !important;
                    }
                }

                @media (max-width: 600px) {
                    .mobile-footer-v2 {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 8px !important;
                        width: 100% !important;
                        padding: 10px 0 !important;
                    }
                    .mobile-radio-group {
                        display: flex !important;
                        gap: 20px !important;
                        margin-bottom: 0 !important;
                    }
                    .mobile-date-label {
                        font-weight: 500 !important;
                        margin-bottom: 2px !important;
                        display: block !important;
                        font-size: 13px !important;
                    }
                    .mobile-date-input-container {
                        width: 100% !important;
                        margin-bottom: 5px !important;
                    }
                    .btn-premium-purple {
                        background-color: #9754ca!important;
                        color: white !important;
                        border-radius: 25px !important;
                        padding: 6px 20px !important;
                        border: none !important;
                        margin-top: 7px !important;
                        font-weight: 500 !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        gap: 10px !important;
                        box-shadow: 0 4px 6px rgba(155, 89, 182, 0.2) !important;
                    }
                }
                `}
            </style>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            {/* Custom Tabs */}
                            <div className="nav-tabs-custom theme-shadow">
                                <ul className="nav nav-tabs pull-right nav-tabs-reorder">
                                    <li className="pull-right header">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </li>
                                    <li className="pull-left header w-xs-100">Send Whatsapp Message</li>
                                    <li className={activeTab === 'class' ? 'active' : ''}>
                                        <a href="#tab_class" onClick={(e) => { e.preventDefault(); setActiveTab('class'); }}>Class</a>
                                    </li>
                                    <li className={activeTab === 'individual' ? 'active' : ''}>
                                        <a href="#tab_individual" onClick={(e) => { e.preventDefault(); setActiveTab('individual'); }}>Individual</a>
                                    </li>
                                    <li className={activeTab === 'group' ? 'active' : ''}>
                                        <a href="#tab_group" onClick={(e) => { e.preventDefault(); setActiveTab('group'); }}>Group</a>
                                    </li>
                                </ul>

                                <div className="tab-content">
                                    {/* Group Tab */}
                                    <div className={`tab-pane ${activeTab === 'group' ? 'active' : ''}`} id="tab_group">
                                        <form onSubmit={handleGroupSubmit}>
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <div className="form-group">
                                                        <label>Message Type<small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={groupForm.message_type}
                                                            onChange={(e) => setGroupForm(prev => ({ ...prev, message_type: e.target.value }))}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="text">Text</option>
                                                            <option value="video">Video</option>
                                                        </select>
                                                    </div>

                                                    {groupForm.message_type === 'video' && (
                                                        <div className="form-group">
                                                            <label>Video Link</label>
                                                            <input
                                                                type="url"
                                                                className="form-control"
                                                                value={groupForm.video_link}
                                                                onChange={(e) => setGroupForm(prev => ({ ...prev, video_link: e.target.value }))}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="form-group">
                                                        <label>Message<small className="req"> *</small></label>
                                                        <textarea
                                                            className="form-control compose-textarea"
                                                            rows="12"
                                                            value={groupForm.message}
                                                            onChange={(e) => setGroupForm(prev => ({ ...prev, message: e.target.value }))}
                                                        ></textarea>
                                                        <span className="text-muted pull-right">Character Count: {getCharCount(groupForm.message)}</span>
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Message To<small className="req"> *</small></label>
                                                        <div className="well" style={{ minHeight: '303px' }}>
                                                            <div className="checkbox" style={{ marginTop: 0 }}>
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={groupForm.users.includes('student')}
                                                                        onChange={() => toggleGroupUser('student')}
                                                                    /> <b>Students</b>
                                                                </label>
                                                            </div>
                                                            <div className="checkbox">
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={groupForm.users.includes('parent')}
                                                                        onChange={() => toggleGroupUser('parent')}
                                                                    /> <b>Guardians</b>
                                                                </label>
                                                            </div>
                                                            {roles.map(role => (
                                                                <div className="checkbox" key={role.id}>
                                                                    <label>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={groupForm.users.includes(role.id.toString())}
                                                                            onChange={() => toggleGroupUser(role.id.toString())}
                                                                        /> <b>{role.name}</b>
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="box-footer">
                                                <div className="pull-right mobile-footer-v2" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div className="mobile-radio-group">
                                                        <label className="radio-inline">
                                                            <input
                                                                type="radio"
                                                                name="group_send_type"
                                                                value="send_now"
                                                                checked={groupForm.send_type === 'send_now'}
                                                                onChange={(e) => setGroupForm(prev => ({ ...prev, send_type: e.target.value }))}
                                                            /> Send Now
                                                        </label>
                                                        <label className="radio-inline">
                                                            <input
                                                                type="radio"
                                                                name="group_send_type"
                                                                value="schedule"
                                                                checked={groupForm.send_type === 'schedule'}
                                                                onChange={(e) => setGroupForm(prev => ({ ...prev, send_type: e.target.value }))}
                                                            /> Schedule
                                                        </label>
                                                    </div>
                                                    {groupForm.send_type === 'schedule' && (
                                                        <div className="mobile-date-input-container">
                                                            <label className="mobile-date-label hidden-lg hidden-md">Schedule Date Time <span className="text-danger">*</span></label>
                                                            <div className="input-group" style={{ width: '100%' }}>
                                                                <input
                                                                    type="datetime-local"
                                                                    className="form-control"
                                                                    value={groupForm.schedule_date_time}
                                                                    onChange={(e) => setGroupForm(prev => ({ ...prev, schedule_date_time: e.target.value }))}
                                                                    style={{ display: 'inline-block', width: 'auto' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button type="submit" className="btn btn-primary btn-premium-purple" disabled={loading}>
                                                        {loading ? <><i className="fa fa-spinner fa-spin"></i> Sending</> : <><i className="fa fa-envelope-o"></i> Submit</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Individual Tab */}
                                    <div className={`tab-pane ${activeTab === 'individual' ? 'active' : ''}`} id="tab_individual">
                                        <form onSubmit={handleIndividualSubmit}>
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <div className="form-group">
                                                        <label>Message Type<small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={individualForm.message_type}
                                                            onChange={(e) => setIndividualForm(prev => ({ ...prev, message_type: e.target.value }))}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="text">Text</option>
                                                            <option value="video">Video</option>
                                                        </select>
                                                    </div>

                                                    {individualForm.message_type === 'video' && (
                                                        <div className="form-group">
                                                            <label>Video Link</label>
                                                            <input
                                                                type="url"
                                                                className="form-control"
                                                                value={individualForm.video_link}
                                                                onChange={(e) => setIndividualForm(prev => ({ ...prev, video_link: e.target.value }))}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="form-group">
                                                        <label>Message<small className="req"> *</small></label>
                                                        <textarea
                                                            className="form-control compose-textarea"
                                                            rows="12"
                                                            value={individualForm.message}
                                                            onChange={(e) => setIndividualForm(prev => ({ ...prev, message: e.target.value }))}
                                                        ></textarea>
                                                        <span className="text-muted pull-right">Character Count: {getCharCount(individualForm.message)}</span>
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Message To<small className="req"> *</small></label>
                                                        <select className="form-control" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                                                            <option value="">Select</option>
                                                            {messageToOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="input-group">
                                                        <input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                                        <span className="input-group-btn"><button className="btn btn-primary" type="button" onClick={() => { if (selectedSearchResult) { handleSelectRecipient(selectedSearchResult); } }}>Add</button></span>
                                                    </div>
                                                    {(searchLoading || searchQuery) && (
                                                        <div className="well" style={{ minHeight: '150px', maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                                                            {searchLoading && <div className="text-center"><i className="fa fa-spinner fa-spin"></i> Searching...</div>}
                                                            {!searchLoading && searchResults.length === 0 && searchQuery && <div className="text-muted">No results found</div>}
                                                            {!searchLoading && searchResults.length > 0 && (
                                                                <ul className="list-group">
                                                                    {searchResults.map((r, i) => (
                                                                        <li key={i}
                                                                            className={`list-group-item ${selectedSearchResult?.id === r.id ? 'active' : ''}`}
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => setSelectedSearchResult(r)}>
                                                                            {getResultDisplayName(r)}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Selected Recipients Table */}
                                                    <div style={{ marginTop: '15px' }}>
                                                        <b>Selected Recipients ({selectedRecipients.length})</b>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Filter selected..."
                                                            value={selectedTableFilter}
                                                            onChange={(e) => setSelectedTableFilter(e.target.value)}
                                                            style={{ marginTop: '5px', marginBottom: '5px' }}
                                                        />
                                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                            <table className="table table-bordered table-striped table-condensed">
                                                                <thead>
                                                                    <tr>
                                                                        <th>#</th>
                                                                        <th>Name</th>
                                                                        <th>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {selectedRecipients
                                                                        .filter(r => r.name.toLowerCase().includes(selectedTableFilter.toLowerCase()))
                                                                        .map((r, i) => (
                                                                            <tr key={i}>
                                                                                <td>{i + 1}</td>
                                                                                <td>{r.name}</td>
                                                                                <td>
                                                                                    <button type="button" className="btn btn-xs btn-danger" onClick={() => setSelectedRecipients(prev => prev.filter((_, idx) => idx !== i))}>
                                                                                        <i className="fa fa-remove"></i>
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    {selectedRecipients.length === 0 && (
                                                                        <tr><td colSpan="3" className="text-center text-muted">No recipients selected</td></tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="box-footer">
                                                <div className="pull-right mobile-footer-v2" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div className="mobile-radio-group">
                                                        <label className="radio-inline">
                                                            <input
                                                                type="radio"
                                                                name="individual_send_type"
                                                                value="send_now"
                                                                checked={individualForm.send_type === 'send_now'}
                                                                onChange={(e) => setIndividualForm(prev => ({ ...prev, send_type: e.target.value }))}
                                                            /> Send Now
                                                        </label>
                                                        <label className="radio-inline">
                                                            <input
                                                                type="radio"
                                                                name="individual_send_type"
                                                                value="schedule"
                                                                checked={individualForm.send_type === 'schedule'}
                                                                onChange={(e) => setIndividualForm(prev => ({ ...prev, send_type: e.target.value }))}
                                                            /> Schedule
                                                        </label>
                                                    </div>
                                                    {individualForm.send_type === 'schedule' && (
                                                        <div className="mobile-date-input-container">
                                                            <label className="mobile-date-label hidden-lg hidden-md">Schedule Date Time <span className="text-danger">*</span></label>
                                                            <div className="input-group" style={{ width: '100%' }}>
                                                                <input
                                                                    type="datetime-local"
                                                                    className="form-control"
                                                                    value={individualForm.schedule_date_time}
                                                                    onChange={(e) => setIndividualForm(prev => ({ ...prev, schedule_date_time: e.target.value }))}
                                                                    style={{ display: 'inline-block', width: 'auto' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button type="submit" className="btn btn-primary btn-premium-purple" disabled={loading}>
                                                        {loading ? <><i className="fa fa-spinner fa-spin"></i> Sending</> : <><i className="fa fa-envelope-o"></i> Submit</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Class Tab */}
                                    <div className={`tab-pane ${activeTab === 'class' ? 'active' : ''}`} id="tab_class">
                                        <form onSubmit={handleClassSubmit}>
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <div className="form-group">
                                                        <label>Message Type<small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={classForm.message_type}
                                                            onChange={(e) => setClassForm(prev => ({ ...prev, message_type: e.target.value }))}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="text">Text</option>
                                                            <option value="video">Video</option>
                                                        </select>
                                                    </div>

                                                    {classForm.message_type === 'video' && (
                                                        <div className="form-group">
                                                            <label>Video Link</label>
                                                            <input
                                                                type="url"
                                                                className="form-control"
                                                                value={classForm.video_link}
                                                                onChange={(e) => setClassForm(prev => ({ ...prev, video_link: e.target.value }))}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="form-group">
                                                        <label>Message<small className="req"> *</small></label>
                                                        <textarea
                                                            className="form-control compose-textarea"
                                                            rows="12"
                                                            value={classForm.message}
                                                            onChange={(e) => setClassForm(prev => ({ ...prev, message: e.target.value }))}
                                                        ></textarea>
                                                        <span className="text-muted pull-right">Character Count: {getCharCount(classForm.message)}</span>
                                                    </div>
                                                </div>

                                                <div className="col-md-4">
                                                    <div className="row">
                                                        <div className="form-group col-xs-10 col-sm-12 col-md-12 col-lg-12">
                                                            <label>Message To<small className="req"> *</small></label>
                                                            <select
                                                                className="form-control"
                                                                value={classForm.class_id}
                                                                onChange={(e) => handleClassChange(e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                {classList.map(cls => (
                                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="dual-list list-right">
                                                        <div className="well" style={{ minHeight: '260px' }}>
                                                            <div className="wellscroll">
                                                                <b>Section</b>
                                                                <ul className="list-group section_list listcheckbox">
                                                                    {sectionList.map(section => (
                                                                        <li key={section.section_id} className="checkbox">
                                                                            <a href="#" className="small">
                                                                                <label>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={classForm.sections.includes(section.section_id)}
                                                                                        onChange={() => toggleSection(section.section_id)}
                                                                                    />
                                                                                    {section.section}
                                                                                </label>
                                                                            </a>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="box-footer">
                                                <div className="pull-right mobile-footer-v2" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div className="mobile-radio-group">
                                                        <label className="radio-inline">
                                                            <input
                                                                type="radio"
                                                                name="class_send_type"
                                                                value="send_now"
                                                                checked={classForm.send_type === 'send_now'}
                                                                onChange={(e) => setClassForm(prev => ({ ...prev, send_type: e.target.value }))}
                                                            /> Send Now
                                                        </label>
                                                        <label className="radio-inline">
                                                            <input
                                                                type="radio"
                                                                name="class_send_type"
                                                                value="schedule"
                                                                checked={classForm.send_type === 'schedule'}
                                                                onChange={(e) => setClassForm(prev => ({ ...prev, send_type: e.target.value }))}
                                                            /> Schedule
                                                        </label>
                                                    </div>
                                                    {classForm.send_type === 'schedule' && (
                                                        <div className="mobile-date-input-container">
                                                            <label className="mobile-date-label hidden-lg hidden-md">Schedule Date Time <span className="text-danger">*</span></label>
                                                            <div className="input-group" style={{ width: '100%' }}>
                                                                <input
                                                                    type="datetime-local"
                                                                    className="form-control"
                                                                    value={classForm.schedule_date_time}
                                                                    onChange={(e) => setClassForm(prev => ({ ...prev, schedule_date_time: e.target.value }))}
                                                                    style={{ display: 'inline-block', width: 'auto' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button type="submit" className="btn btn-primary btn-premium-purple" disabled={loading}>
                                                        {loading ? <><i className="fa fa-spinner fa-spin"></i> Sending</> : <><i className="fa fa-envelope-o"></i> Submit</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
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

export default SendWhatsApp;
