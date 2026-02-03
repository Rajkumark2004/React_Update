import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const ScheduleEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        schedule_date_time: '',
        send_mail: false,
        send_sms: false,
        is_group: false,
        is_individual: false,
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            // Mock fetching schedule data
            setFormData({
                title: 'Summer Vacation Notification',
                message: 'This is a scheduled message about summer vacations.',
                schedule_date_time: '2026-05-20T10:00',
                send_mail: true,
                send_sms: true,
                is_group: true,
                is_individual: false,
            });
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Schedule Updated:', formData);
            setLoading(false);
            alert('Schedule updated successfully!');
            navigate('/admin/mail/schedule_log');
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
                                            <i className="fa fa-reorder"></i> Edit Schedule
                                        </h3>
                                        <div className="box-tools pull-right">
                                            <button type="button" onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <div className="box-body">
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
                                        <div className="form-group">
                                            <label className="col-sm-2 control-label">Message <small className="req">*</small></label>
                                            <div className="col-sm-10">
                                                <textarea
                                                    name="message"
                                                    className="form-control"
                                                    style={{ height: '150px' }}
                                                    value={formData.message}
                                                    onChange={handleInputChange}
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-2 control-label">Schedule Date Time <small className="req">*</small></label>
                                            <div className="col-sm-4">
                                                <input
                                                    type="datetime-local"
                                                    name="schedule_date_time"
                                                    className="form-control"
                                                    value={formData.schedule_date_time}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <div className="pull-right">
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                <i className="fa fa-save"></i> {loading ? 'Saving...' : 'Save'}
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

export default ScheduleEdit;
