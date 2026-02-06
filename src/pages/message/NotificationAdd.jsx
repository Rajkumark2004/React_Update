import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../../utils/include_files';

const NotificationAdd = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [publishDate, setPublishDate] = useState('');
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);

    const [classList, setClassList] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial data fetch (Classes)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await api.getClasses();
                if (response && response.status === 'success') {
                    const classes = [...(response.classsectionlist || [])].reverse();
                    setClassList(classes);
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };
        fetchInitialData();
    }, []);

    // Update Sections when Class Changes
    useEffect(() => {
        const fetchSections = async () => {
            if (classId) {
                try {
                    const response = await api.getSectionsByClass(classId);
                    if (response && response.status === 'success') {
                        const sections = response.data || [];
                        setSectionOptions(sections);
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                }
            } else {
                setSectionOptions([]);
            }
            setSectionId('');
        };
        fetchSections();
    }, [classId]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title || !date || !publishDate || !classId || !sectionId || !message) {
            toast.error('Please fill all required fields');
            return;
        }

        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const [year, month, day] = dateStr.split('-');
            return `${day}-${month}-${year}`;
        };

        const formData = new FormData();
        formData.append('title', title);
        formData.append('date', formatDate(date));
        formData.append('publish_date', formatDate(publishDate));
        formData.append('class_id', classId);
        formData.append('section_id', sectionId);
        formData.append('message', message);
        if (file) {
            formData.append('file', file);
        }

        setLoading(true);
        try {
            const response = await api.addNotification(formData);
            if (response.status === true || response.status === 'success' || response.message === 'Record Saved Successfully') {
                toast.success(response.message || 'Record Saved Successfully');
                navigate('/admin/notification_class/index');
            } else {
                toast.error(response.message || 'Failed to send circular');
            }
        } catch (error) {
            console.error('Error saving notification:', error);
            toast.error(error.message || 'An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <form onSubmit={handleSave} encType="multipart/form-data">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">
                                            <i className="fa fa-commenting-o"></i> New Circular
                                        </h3>
                                    </div>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>Title</label><small className="req"> *</small>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={title}
                                                                onChange={(e) => setTitle(e.target.value)}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Circular Date</label><small className="req"> *</small>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date}
                                                                onChange={(e) => setDate(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Publish On</label><small className="req"> *</small>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={publishDate}
                                                                onChange={(e) => setPublishDate(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Class</label><small className="req"> *</small>
                                                            <select
                                                                className="form-control"
                                                                value={classId}
                                                                onChange={(e) => setClassId(e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Section</label><small className="req"> *</small>
                                                            <select
                                                                className="form-control"
                                                                value={sectionId}
                                                                onChange={(e) => setSectionId(e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                {sectionOptions.map(s => <option key={s.section_id} value={s.section_id}>{s.section}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>Attachment</label>
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                onChange={(e) => setFile(e.target.files[0])}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>Message</label><small className="req"> *</small>
                                                            <textarea
                                                                className="form-control"
                                                                style={{ height: '300px' }}
                                                                value={message}
                                                                onChange={(e) => setMessage(e.target.value)}
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <div className="pull-right">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-envelope-o"></i>} Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default NotificationAdd;
