import React, { useState, useEffect } from 'react';
import SettingsMenu from "../../components/SettingsMenu";
import "../../utils/include_files.js";
import api from '../../services/api';

import { useNavigate } from 'react-router-dom';

const EmailSettings = () => {
    const navigate = useNavigate();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const [loading, setLoading] = useState(false);
    const [emailType, setEmailType] = useState('send_email');
    const [formData, setFormData] = useState({
        smtp_username: '',
        smtp_password: '',
        smtp_server: '',
        smtp_port: '',
        smtp_security: 'tls',
        smtp_auth: 'true',

        aws_email: '',
        access_key: '',
        secret_access_key: '',
        region: ''
    });
    const [showTestModal, setShowTestModal] = useState(false);
    const [testEmail, setTestEmail] = useState('');

    useEffect(() => {
        fetchEmailConfig();
    }, []);

    const fetchEmailConfig = async () => {
        setLoading(true);
        try {
            const response = await api.getEmailConfig();
            if (response.status === 'success' && response.emaillist) {
                const data = response.emaillist;
                setEmailType(data.email_type);

                setFormData({
                    smtp_username: data.smtp_username || '',
                    smtp_password: data.smtp_password || '',
                    smtp_server: data.smtp_server || '',
                    smtp_port: data.smtp_port || '',
                    smtp_security: data.ssl_tls || 'tls',
                    smtp_auth: data.smtp_auth || 'true',
                    aws_email: data.email_type === 'aws_ses' ? (data.smtp_username || '') : '',
                    access_key: data.api_key || '',
                    secret_access_key: data.api_secret || '',
                    region: data.region || ''
                });
            }
        } catch (error) {
            console.error('Error fetching email config:', error);
        } finally {
            setLoading(false);
        }
    };

    // ... existing logic ...

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        let payload = {
            email_type: emailType
        };

        if (emailType === 'smtp') {
            payload = {
                ...payload,
                smtp_username: formData.smtp_username,
                smtp_password: formData.smtp_password,
                smtp_server: formData.smtp_server,
                smtp_port: formData.smtp_port,
                smtp_security: formData.smtp_security,
                smtp_auth: formData.smtp_auth
            };
        } else if (emailType === 'aws_ses') {
            payload = {
                ...payload,
                access_key: formData.access_key,
                secret_access_key: formData.secret_access_key,
                region: formData.region,
                aws_email: formData.aws_email
            };
        }

        try {
            await api.updateEmailConfig(payload);
            alert('Email Settings Saved Successfully');
        } catch (error) {
            console.error('Error saving email settings:', error);
            alert(error.message || 'Error saving email settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = (e) => {
        e.preventDefault();
        alert(`Sending test email to ${testEmail}... API integration needed.`);
        setShowTestModal(false);
    };

    const fieldStyle = isMobile ? { paddingLeft: '15px', paddingRight: '15px' } : {};

    return (
        <SettingsMenu>
            <div className="row">
                <div className="col-md-12">
                    <div className="box box-primary">
                        <div className="box-header with-border">
                            <h3 className="box-title"><i className="fa fa-envelope"></i> Email Setting</h3>
                            <button
                                className="btn btn-primary btn-sm pull-right"
                                style={{ borderRadius: '20px', padding: '6px 14px' }}
                                onClick={() => navigate('/settings')}
                            >
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                        <form className="form-horizontal" onSubmit={handleSave}>
                            <div className="box-body">
                                <div className="form-group">
                                    <label className="col-sm-3 control-label" style={fieldStyle}>Email Engine</label>
                                    <div className="col-sm-6" style={fieldStyle}>
                                        <select className="form-control" value={emailType} onChange={(e) => setEmailType(e.target.value)}>
                                            <option value="send_email">Send Email</option>
                                            <option value="smtp">SMTP</option>
                                            <option value="aws_ses">AWS SES</option>
                                        </select>
                                    </div>
                                </div>

                                {emailType === 'smtp' && (
                                    <>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>SMTP Username</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="text" className="form-control" value={formData.smtp_username} onChange={(e) => handleInputChange('smtp_username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>SMTP Password</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="password" className="form-control" value={formData.smtp_password} onChange={(e) => handleInputChange('smtp_password', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>SMTP Server</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="text" className="form-control" value={formData.smtp_server} onChange={(e) => handleInputChange('smtp_server', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>SMTP Port</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="text" className="form-control" value={formData.smtp_port} onChange={(e) => handleInputChange('smtp_port', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>SMTP Security</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <select className="form-control" value={formData.smtp_security} onChange={(e) => handleInputChange('smtp_security', e.target.value)}>
                                                    <option value="tls">TLS</option>
                                                    <option value="ssl">SSL</option>
                                                    <option value="none">None</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>SMTP Auth</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <select className="form-control" value={formData.smtp_auth} onChange={(e) => handleInputChange('smtp_auth', e.target.value)}>
                                                    <option value="true">ON</option>
                                                    <option value="false">OFF</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {emailType === 'aws_ses' && (
                                    <>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>Email</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="text" className="form-control" value={formData.aws_email} onChange={(e) => handleInputChange('aws_email', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>Access Key ID</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="text" className="form-control" value={formData.access_key} onChange={(e) => handleInputChange('access_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>Secret Access Key</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="password" className="form-control" value={formData.secret_access_key} onChange={(e) => handleInputChange('secret_access_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label" style={fieldStyle}>Region</label>
                                            <div className="col-sm-6" style={fieldStyle}>
                                                <input type="text" className="form-control" value={formData.region} onChange={(e) => handleInputChange('region', e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="box-footer">
                                <button type="button" className="btn btn-info pull-left" onClick={() => setShowTestModal(true)}>Test Email</button>
                                <button type="submit" className="btn btn-primary pull-right">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Test Email Modal */}
            {showTestModal && (
                <div className="modal fade in" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowTestModal(false)}>×</button>
                                <h4 className="modal-title">Test Email</h4>
                            </div>
                            <form onSubmit={handleTestEmail}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Email <small className="req">*</small></label>
                                        <input type="email" className="form-control" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary">Send</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </SettingsMenu>
    );
};

export default EmailSettings;
