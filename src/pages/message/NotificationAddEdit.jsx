import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const NotificationAddEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        publish_date: new Date().toISOString().split('T')[0],
        class_id: '',
        section_id: '',
        message: '',
        file: null
    });

    // Data states
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock data initialization
    useEffect(() => {
        setClasses([
            { id: 1, class: 'Nursery' },
            { id: 2, class: 'L.K.G' },
            { id: 3, class: 'U.K.G' },
            { id: 4, class: 'Class 1' },
            { id: 5, class: 'Class 2' }
        ]);

        if (isEditMode) {
            // Mock fetching existing notification
            setFormData({
                title: 'Summer Vacation Start',
                date: '2026-05-20',
                publish_date: '2026-05-20',
                class_id: '4',
                section_id: '1',
                message: 'The summer vacation will start from 1st June 2026. The school will reopen on 1st July 2026.',
                file: null
            });
            setSections([{ id: 1, section: 'A' }, { id: 2, section: 'B' }]);
        }
    }, [id, isEditMode]);

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setFormData({ ...formData, class_id: classId, section_id: '' });
        // Mock fetching sections
        if (classId) {
            setSections([
                { id: 1, section: 'A' },
                { id: 2, section: 'B' },
                { id: 3, section: 'C' }
            ]);
        } else {
            setSections([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Form Submitted:', formData);
            setLoading(false);
            alert(`Circular ${isEditMode ? 'updated' : 'added'} successfully!`);
            navigate('/admin/notification');
        }, 1000);
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '16px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <form id="form1" onSubmit={handleSubmit} className="form-horizontal">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">
                                            <i className="fa fa-commenting-o"></i> {isEditMode ? 'Edit Circular' : 'New Circular'}
                                        </h3>
                                        <div className="box-tools pull-right">
                                            <button type="button" onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="col-sm-2 control-label">Title <small className="req">*</small></label>
                                                    <div className="col-sm-10">
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            className="form-control"
                                                            value={formData.title}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Circular Date <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <input
                                                            type="date"
                                                            name="date"
                                                            className="form-control"
                                                            value={formData.date}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Publish On <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <input
                                                            type="date"
                                                            name="publish_date"
                                                            className="form-control"
                                                            value={formData.publish_date}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Class <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <select
                                                            name="class_id"
                                                            className="form-control"
                                                            value={formData.class_id}
                                                            onChange={handleClassChange}
                                                            required
                                                        >
                                                            <option value="">Select</option>
                                                            {classes.map(c => (
                                                                <option key={c.id} value={c.id}>{c.class}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Section <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <select
                                                            name="section_id"
                                                            className="form-control"
                                                            value={formData.section_id}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="">Select</option>
                                                            {sections.map(s => (
                                                                <option key={s.id} value={s.id}>{s.section}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="col-sm-2 control-label">Attachment</label>
                                                    <div className="col-sm-10">
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            onChange={handleFileChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="col-sm-2 control-label">Message <small className="req">*</small></label>
                                                    <div className="col-sm-10">
                                                        <textarea
                                                            name="message"
                                                            className="form-control"
                                                            style={{ height: '200px' }}
                                                            value={formData.message}
                                                            onChange={handleInputChange}
                                                            required
                                                        ></textarea>
                                                        <p className="help-block">You can use a WYSIWYG editor here in the future.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <div className="pull-right">
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                <i className="fa fa-envelope-o"></i> {loading ? 'Sending...' : (isEditMode ? 'Update' : 'Send')}
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

export default NotificationAddEdit;
