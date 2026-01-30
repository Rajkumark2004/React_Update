import React, { useState } from 'react';
import SettingsMenu from "../../components/SettingsMenu";
import "../../utils/include_files.js";

import { useNavigate } from 'react-router-dom';

const EmailSettings = () => {
    const navigate = useNavigate();
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        alert('Saving email settings... API integration needed.');
        console.log('Saved Settings:', { emailType, ...formData });
    };

    const handleTestEmail = (e) => {
        e.preventDefault();
        alert(`Sending test email to ${testEmail}... API integration needed.`);
        setShowTestModal(false);
    };

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
                                    <label className="col-sm-3 control-label">Email Engine</label>
                                    <div className="col-sm-6">
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
                                            <label className="col-sm-3 control-label">SMTP Username</label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" value={formData.smtp_username} onChange={(e) => handleInputChange('smtp_username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">SMTP Password</label>
                                            <div className="col-sm-6">
                                                <input type="password" className="form-control" value={formData.smtp_password} onChange={(e) => handleInputChange('smtp_password', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">SMTP Server</label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" value={formData.smtp_server} onChange={(e) => handleInputChange('smtp_server', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">SMTP Port</label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" value={formData.smtp_port} onChange={(e) => handleInputChange('smtp_port', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">SMTP Security</label>
                                            <div className="col-sm-6">
                                                <select className="form-control" value={formData.smtp_security} onChange={(e) => handleInputChange('smtp_security', e.target.value)}>
                                                    <option value="tls">TLS</option>
                                                    <option value="ssl">SSL</option>
                                                    <option value="none">None</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">SMTP Auth</label>
                                            <div className="col-sm-6">
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
                                            <label className="col-sm-3 control-label">Email</label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" value={formData.aws_email} onChange={(e) => handleInputChange('aws_email', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Access Key ID</label>
                                            <div className="col-sm-6">
                                                <input type="text" className="form-control" value={formData.access_key} onChange={(e) => handleInputChange('access_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Secret Access Key</label>
                                            <div className="col-sm-6">
                                                <input type="password" className="form-control" value={formData.secret_access_key} onChange={(e) => handleInputChange('secret_access_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Region</label>
                                            <div className="col-sm-6">
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
