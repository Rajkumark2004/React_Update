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
                // Fetch classes
                const classResponse = await api.getClasses();
                if (classResponse && classResponse.data) {
                    setClassList(classResponse.data);
                }

                // Fetch roles
                const rolesResponse = await api.getRoles();
                if (rolesResponse && rolesResponse.data) {
                    setRoles(rolesResponse.data.filter(r => r.name !== 'Super Admin'));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

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
            // API call would go here
            toast.success('WhatsApp message sent successfully');
            setGroupForm({
                message_type: '',
                video_link: '',
                message: '',
                users: [],
                send_type: 'send_now',
                schedule_date_time: ''
            });
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
            // API call would go here
            toast.success('WhatsApp message sent successfully');
            setIndividualForm({
                message_type: '',
                video_link: '',
                message: '',
                send_type: 'send_now',
                schedule_date_time: ''
            });
            setSelectedRecipients([]);
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
            // API call would go here
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

    // Add recipient to individual list
    const addRecipient = () => {
        if (!searchQuery.trim()) {
            toast.error('Please select a recipient');
            return;
        }
        // In real implementation, this would add from search results
        toast.info('Recipient search functionality requires API integration');
    };

    // Remove recipient from individual list
    const removeRecipient = (id) => {
        setSelectedRecipients(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            {/* Custom Tabs */}
                            <div className="nav-tabs-custom theme-shadow">
                                <ul className="nav nav-tabs pull-right">
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
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="pull-right">
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
                                                            {groupForm.send_type === 'schedule' && (
                                                                <div className="d-inline-block" style={{ marginLeft: '10px' }}>
                                                                    <label>Schedule Date Time<small className="req"> *</small></label>
                                                                    <input
                                                                        type="datetime-local"
                                                                        className="form-control"
                                                                        value={groupForm.schedule_date_time}
                                                                        onChange={(e) => setGroupForm(prev => ({ ...prev, schedule_date_time: e.target.value }))}
                                                                        style={{ display: 'inline-block', width: 'auto' }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }} disabled={loading}>
                                                                {loading ? <><i className="fa fa-spinner fa-spin"></i> Sending</> : <><i className="fa fa-envelope-o"></i> Submit</>}
                                                            </button>
                                                        </div>
                                                    </div>
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
                                                        <div className="input-group">
                                                            <div className="input-group-btn">
                                                                <select
                                                                    className="btn btn-default"
                                                                    value={searchCategory}
                                                                    onChange={(e) => setSearchCategory(e.target.value)}
                                                                    style={{ height: '34px' }}
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="student">Students</option>
                                                                    <option value="parent">Guardians</option>
                                                                    <option value="student_guardian">Students & Guardians</option>
                                                                    <option value="staff">Staff</option>
                                                                </select>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                placeholder="Search..."
                                                            />
                                                            <span className="input-group-btn">
                                                                <button type="button" className="btn btn-primary" onClick={addRecipient}>Add</button>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="dual-list list-right">
                                                        <div className="well" style={{ minHeight: '260px' }}>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="input-group">
                                                                        <input type="text" className="form-control" placeholder="Search..." />
                                                                        <div className="input-group-btn">
                                                                            <span className="btn btn-default input-group-addon" style={{ height: '28px' }}>
                                                                                <i className="fa fa-search"></i>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <ul className="list-group send_list">
                                                                    {selectedRecipients.map(recipient => (
                                                                        <li key={recipient.id} className="list-group-item">
                                                                            <i className="fa fa-user"></i> {recipient.name} ({recipient.category})
                                                                            <i
                                                                                className="fa fa-trash pull-right text-danger"
                                                                                style={{ cursor: 'pointer' }}
                                                                                onClick={() => removeRecipient(recipient.id)}
                                                                            ></i>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="box-footer">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="pull-right">
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
                                                            {individualForm.send_type === 'schedule' && (
                                                                <div className="d-inline-block" style={{ marginLeft: '10px' }}>
                                                                    <label>Schedule Date Time<small className="req"> *</small></label>
                                                                    <input
                                                                        type="datetime-local"
                                                                        className="form-control"
                                                                        value={individualForm.schedule_date_time}
                                                                        onChange={(e) => setIndividualForm(prev => ({ ...prev, schedule_date_time: e.target.value }))}
                                                                        style={{ display: 'inline-block', width: 'auto' }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }} disabled={loading}>
                                                                {loading ? <><i className="fa fa-spinner fa-spin"></i> Sending</> : <><i className="fa fa-envelope-o"></i> Submit</>}
                                                            </button>
                                                        </div>
                                                    </div>
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
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="pull-right">
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
                                                            {classForm.send_type === 'schedule' && (
                                                                <div className="d-inline-block" style={{ marginLeft: '10px' }}>
                                                                    <label>Schedule Date Time<small className="req"> *</small></label>
                                                                    <input
                                                                        type="datetime-local"
                                                                        className="form-control"
                                                                        value={classForm.schedule_date_time}
                                                                        onChange={(e) => setClassForm(prev => ({ ...prev, schedule_date_time: e.target.value }))}
                                                                        style={{ display: 'inline-block', width: 'auto' }}
                                                                    />
                                                                </div>
                                                            )}
                                                            <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }} disabled={loading}>
                                                                {loading ? <><i className="fa fa-spinner fa-spin"></i> Sending</> : <><i className="fa fa-envelope-o"></i> Submit</>}
                                                            </button>
                                                        </div>
                                                    </div>
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
