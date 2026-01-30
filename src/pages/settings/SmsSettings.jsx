import React, { useState } from 'react';
import SettingsMenu from "../../components/SettingsMenu";
import "../../utils/include_files.js";

import { useNavigate } from 'react-router-dom';

const SmsSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clickatell');

    // State for all gateways
    const [formData, setFormData] = useState({
        clickatell: { username: '', password: '', api_id: '', status: 'disabled' },
        twilio: { account_sid: '', auth_token: '', sender_phone: '', status: 'disabled' },
        msg_nineone: { auth_key: '', sender_id: '', status: 'disabled' },
        text_local: { username: '', hash_key: '', sender_id: '', status: 'disabled' },
        sms_country: { username: '', password: '', auth_key: '', auth_token: '', sender_id: '', status: 'disabled' },
        bulk_sms: { username: '', password: '', status: 'disabled' },
        mobireach: { auth_key: '', sender_id: '', route_id: '', status: 'disabled' },
        nexmo: { api_key: '', api_secret: '', registered_phone: '', status: 'disabled' },
        africastalking: { username: '', api_key: '', short_code: '', status: 'disabled' },
        smseg: { username: '', password: '', sender_id: '', type: '', status: 'disabled' },
        custom: { name: '', status: 'disabled' }
    });

    const handleInputChange = (gateway, field, value) => {
        setFormData(prev => ({
            ...prev,
            [gateway]: { ...prev[gateway], [field]: value }
        }));
    };

    const handleSave = (gateway) => {
        alert(`Saving settings for ${gateway}... API integration needed.`);
        console.log(`Saving ${gateway}:`, formData[gateway]);
    };

    const Gateways = [
        { id: 'clickatell', label: 'Clickatell SMS Gateway' },
        { id: 'twilio', label: 'Twilio SMS Gateway' },
        { id: 'msg_nineone', label: 'MSG91' },
        { id: 'text_local', label: 'Text Local' },
        { id: 'sms_country', label: 'SMS Country' },
        { id: 'bulk_sms', label: 'Bulk SMS' },
        { id: 'mobireach', label: 'Mobireach' },
        { id: 'nexmo', label: 'Nexmo' },
        { id: 'africastalking', label: 'AfricasTalking' },
        { id: 'smseg', label: 'SMS Egypt' },
        { id: 'custom', label: 'Custom SMS Gateway' }
    ];

    return (
        <SettingsMenu>
            <div className="row">
                <div className="col-md-12">
                    <div className="nav-tabs-custom theme-shadow">
                        <div className="box-header with-border">
                            <h3 className="box-title titlefix">SMS Setting</h3>
                            <button
                                className="btn btn-primary btn-sm pull-right"
                                style={{ borderRadius: '20px', padding: '6px 14px' }}
                                onClick={() => navigate('/settings')}
                            >
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>
                        <ul className="nav nav-tabs">
                            {Gateways.map(gw => (
                                <li key={gw.id} className={activeTab === gw.id ? 'active' : ''}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(gw.id); }} data-toggle="tab">
                                        {gw.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="tab-content" style={{ padding: '20px' }}>
                            {/* Clickatell */}
                            {activeTab === 'clickatell' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Clickatell Username <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.clickatell.username} onChange={(e) => handleInputChange('clickatell', 'username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Clickatell Password <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="password" className="form-control" value={formData.clickatell.password} onChange={(e) => handleInputChange('clickatell', 'password', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Clickatell API ID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.clickatell.api_id} onChange={(e) => handleInputChange('clickatell', 'api_id', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.clickatell.status} onChange={(e) => handleInputChange('clickatell', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('clickatell')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://www.clickatell.com/" target="_blank" rel="noreferrer">
                                            <img src="/images/clickatell.png" alt="Clickatell" />
                                            <p>https://www.clickatell.com</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Twilio */}
                            {activeTab === 'twilio' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Twilio Account SID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.twilio.account_sid} onChange={(e) => handleInputChange('twilio', 'account_sid', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Authentication Token <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.twilio.auth_token} onChange={(e) => handleInputChange('twilio', 'auth_token', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Registered Phone Number <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.twilio.sender_phone} onChange={(e) => handleInputChange('twilio', 'sender_phone', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.twilio.status} onChange={(e) => handleInputChange('twilio', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('twilio')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://www.twilio.com/" target="_blank" rel="noreferrer">
                                            <img src="/images/twilio.png" alt="Twilio" />
                                            <p>https://www.twilio.com</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* MSG91 */}
                            {activeTab === 'msg_nineone' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Auth Key <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.msg_nineone.auth_key} onChange={(e) => handleInputChange('msg_nineone', 'auth_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Sender ID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.msg_nineone.sender_id} onChange={(e) => handleInputChange('msg_nineone', 'sender_id', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.msg_nineone.status} onChange={(e) => handleInputChange('msg_nineone', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('msg_nineone')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://msg91.com/" target="_blank" rel="noreferrer">
                                            <img src="/images/msg91.png" alt="Msg91" />
                                            <p>https://msg91.com</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Text Local */}
                            {activeTab === 'text_local' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Username <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.text_local.username} onChange={(e) => handleInputChange('text_local', 'username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Hash Key <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="password" className="form-control" value={formData.text_local.hash_key} onChange={(e) => handleInputChange('text_local', 'hash_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Sender ID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.text_local.sender_id} onChange={(e) => handleInputChange('text_local', 'sender_id', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.text_local.status} onChange={(e) => handleInputChange('text_local', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('text_local')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://www.textlocal.in/" target="_blank" rel="noreferrer">
                                            <img src="/images/textlocal.png" alt="Text Local" />
                                            <p>https://www.textlocal.in</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* SMS Country */}
                            {activeTab === 'sms_country' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Username <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.sms_country.username} onChange={(e) => handleInputChange('sms_country', 'username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Password <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="password" className="form-control" value={formData.sms_country.password} onChange={(e) => handleInputChange('sms_country', 'password', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Auth Key <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.sms_country.auth_key} onChange={(e) => handleInputChange('sms_country', 'auth_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Auth Token <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.sms_country.auth_token} onChange={(e) => handleInputChange('sms_country', 'auth_token', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Sender ID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.sms_country.sender_id} onChange={(e) => handleInputChange('sms_country', 'sender_id', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.sms_country.status} onChange={(e) => handleInputChange('sms_country', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('sms_country')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://www.smscountry.com/" target="_blank" rel="noreferrer">
                                            <img src="/images/sms-country.jpg" alt="SMS Country" />
                                            <p>https://www.smscountry.com</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Bulk SMS */}
                            {activeTab === 'bulk_sms' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Username <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.bulk_sms.username} onChange={(e) => handleInputChange('bulk_sms', 'username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Password <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="password" className="form-control" value={formData.bulk_sms.password} onChange={(e) => handleInputChange('bulk_sms', 'password', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.bulk_sms.status} onChange={(e) => handleInputChange('bulk_sms', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('bulk_sms')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://www.bulksms.com/" target="_blank" rel="noreferrer">
                                            <img src="/images/bulk_sms.png" alt="Bulk SMS" />
                                            <p>https://www.bulksms.com</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Mobireach */}
                            {activeTab === 'mobireach' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Auth Key <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.mobireach.auth_key} onChange={(e) => handleInputChange('mobireach', 'auth_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Sender ID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.mobireach.sender_id} onChange={(e) => handleInputChange('mobireach', 'sender_id', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Route ID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.mobireach.route_id} onChange={(e) => handleInputChange('mobireach', 'route_id', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.mobireach.status} onChange={(e) => handleInputChange('mobireach', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('mobireach')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://user.mobireach.com.bd/" target="_blank" rel="noreferrer">
                                            <img src="/images/mobireach.jpg" alt="Mobireach" />
                                            <p>https://user.mobireach.com.bd/</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Nexmo */}
                            {activeTab === 'nexmo' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Nexmo API Key <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.nexmo.api_key} onChange={(e) => handleInputChange('nexmo', 'api_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Nexmo API Secret <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.nexmo.api_secret} onChange={(e) => handleInputChange('nexmo', 'api_secret', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Registered Phone Number <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.nexmo.registered_phone} onChange={(e) => handleInputChange('nexmo', 'registered_phone', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.nexmo.status} onChange={(e) => handleInputChange('nexmo', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('nexmo')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://dashboard.nexmo.com/sign-up/" target="_blank" rel="noreferrer">
                                            <img src="/images/nexmo.jpg" alt="Nexmo" />
                                            <p>https://dashboard.nexmo.com</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* AfricasTalking */}
                            {activeTab === 'africastalking' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Username <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.africastalking.username} onChange={(e) => handleInputChange('africastalking', 'username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">API Key <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.africastalking.api_key} onChange={(e) => handleInputChange('africastalking', 'api_key', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Short Code <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.africastalking.short_code} onChange={(e) => handleInputChange('africastalking', 'short_code', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.africastalking.status} onChange={(e) => handleInputChange('africastalking', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('africastalking')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://africastalking.com/" target="_blank" rel="noreferrer">
                                            <img src="/images/africastalking.png" alt="AfricasTalking" />
                                            <p>https://africastalking.com/</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* SMS Egypt */}
                            {activeTab === 'smseg' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Username <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.smseg.username} onChange={(e) => handleInputChange('smseg', 'username', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Password <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="password" className="form-control" value={formData.smseg.password} onChange={(e) => handleInputChange('smseg', 'password', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Sender ID <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.smseg.sender_id} onChange={(e) => handleInputChange('smseg', 'sender_id', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Type <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.smseg.type} onChange={(e) => handleInputChange('smseg', 'type', e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option value="local">Local SMS</option>
                                                    <option value="international">International SMS</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.smseg.status} onChange={(e) => handleInputChange('smseg', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('smseg')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <a href="https://smseg.com/" target="_blank" rel="noreferrer">
                                            <img src="/images/smseg.png" alt="SMS Egypt" />
                                            <p>https://smseg.com/</p>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Custom */}
                            {activeTab === 'custom' && (
                                <div className="tab-pane active">
                                    <form className="form-horizontal">
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Gateway Name <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <input type="text" className="form-control" value={formData.custom.name} onChange={(e) => handleInputChange('custom', 'name', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="col-sm-3 control-label">Status <small className="req">*</small></label>
                                            <div className="col-sm-9">
                                                <select className="form-control" value={formData.custom.status} onChange={(e) => handleInputChange('custom', 'status', e.target.value)}>
                                                    <option value="disabled">Disabled</option>
                                                    <option value="enabled">Enabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="box-footer">
                                            <button type="button" className="btn btn-primary pull-right" onClick={() => handleSave('custom')}>Save</button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-3" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <img src="/images/custom-sms.png" alt="Custom SMS" />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </SettingsMenu>
    );
};

export default SmsSettings;
