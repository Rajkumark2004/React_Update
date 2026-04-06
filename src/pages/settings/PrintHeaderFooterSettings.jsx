import React, { useState, useEffect, useRef } from 'react';
import SettingsMenu from "../../components/SettingsMenu";
import "../../utils/include_files.js";
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';
import DropzoneUploader from "../../utils/DropzoneUploader";

const PrintHeaderFooterSettings = () => {
    const navigate = useNavigate();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const [activeTab, setActiveTab] = useState('fees_receipt');
    const [formData, setFormData] = useState({
        fees_receipt: { header_image: null, footer_content: '', current_image: '/header_fee_receipt.png' },
        payslip: { header_image: null, footer_content: '', current_image: '/wisibles_printlogo.jpeg' },
        online_admission: { header_image: null, footer_content: '', current_image: '/online_admission_receipt.png' },
        online_exam: { header_image: null, footer_content: '', current_image: '/online_exam.png' }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [refreshKey, setRefreshKey] = useState(Date.now());

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await api.getPrintHeaderFooterSettings();
            if (response.status === 'success' && response.result) {
                const newFormData = { ...formData };
                const baseUrl = 'https://newlayout.wisibles.com/uploads/print_headerfooter';

                response.result.forEach(item => {
                    let tabKey = '';
                    if (item.print_type === 'staff_payslip') tabKey = 'payslip';
                    else if (item.print_type === 'student_receipt') tabKey = 'fees_receipt';
                    else if (item.print_type === 'online_admission_receipt') tabKey = 'online_admission';
                    else if (item.print_type === 'online_exam') tabKey = 'online_exam';

                    if (tabKey) {
                        newFormData[tabKey] = {
                            ...newFormData[tabKey],
                            footer_content: item.footer_content || '',
                            current_image: item.header_image ? `${baseUrl}/${item.print_type}/${item.header_image}` : newFormData[tabKey].current_image
                        };
                    }
                });
                setFormData(newFormData);
                setRefreshKey(Date.now()); // Re-render and re-init Dropify with fetched URLs
            }
        } catch (error) {
            console.error('Error fetching print settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleFileDrop = (tab, file, objectUrl) => {
        setFormData(prev => ({
            ...prev,
            [tab]: { ...prev[tab], header_image: file, current_image: objectUrl }
        }));
    };

    const handleFileClear = (tab) => {
        setFormData(prev => ({
            ...prev,
            [tab]: { ...prev[tab], header_image: null, current_image: null }
        }));
    };

    const handleTextChange = (tab, value) => {
        setFormData(prev => ({
            ...prev,
            [tab]: { ...prev[tab], footer_content: value }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const currentData = formData[activeTab];

        // Ensure footer content is present if needed, or allow empty.
        // User requirements imply we focus on correct mapping.

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const typeMap = {
                fees_receipt: 'student_receipt',
                payslip: 'staff_payslip',
                online_admission: 'online_admission_receipt',
                online_exam: 'online_exam'
            };

            const messageKeyMap = {
                fees_receipt: 'message1',
                payslip: 'message',
                online_admission: 'admission_message',
                online_exam: 'message'
            };

            const apiType = typeMap[activeTab];
            const messageKey = messageKeyMap[activeTab];

            const formDataToSend = new FormData();
            formDataToSend.append('type', apiType);
            formDataToSend.append(messageKey, currentData.footer_content);

            if (currentData.header_image instanceof File) {
                formDataToSend.append('header_image', currentData.header_image);
            }

            const response = await api.updatePrintHeaderFooterSettings(formDataToSend);

            if (response.status === 'success') {
                setMessage({ type: 'success', text: response.msg || 'Settings saved successfully!' });
                setRefreshKey(Date.now()); // Bust cache and re-init dropify
                fetchSettings();
            } else {
                setMessage({ type: 'error', text: response.msg || response.message || 'Failed to save settings.' });
            }

        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save settings.' });
        } finally {
            setIsLoading(false);
        }
    };

    // (Drag and drop helpers removed in favor of Dropify)

    const fieldStyle = isMobile ? { paddingLeft: '15px', paddingRight: '15px' } : {};

    const renderTabContent = (tabKey, title) => (
        <div className={`tab-pane ${activeTab === tabKey ? 'active' : ''}`}>
            {message.text && (
                <div className={`alert alert-${message.type === 'error' ? 'danger' : message.type}`} style={{ marginBottom: '15px' }}>
                    {message.text}
                </div>
            )}
            <form role="form" className="" onSubmit={handleSave}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label style={fieldStyle}>Header Image (2230px X 300px)<small className="req"> *</small></label>
                            <div key={`${tabKey}-${refreshKey}`} style={fieldStyle}>
                                <DropzoneUploader
                                    defaultImage={formData[tabKey].current_image}
                                    onDrop={(file, objectUrl) => handleFileDrop(tabKey, file, objectUrl)}
                                    onClear={() => handleFileClear(tabKey)}
                                    height={150}
                                    accept={{ 'image/*': [] }}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={fieldStyle}>Footer Content</label>
                            <div style={fieldStyle}>
                                <textarea
                                    className="form-control"
                                    style={{ height: '250px' }}
                                    value={formData[tabKey].footer_content}
                                    onChange={(e) => handleTextChange(tabKey, e.target.value)}
                                />
                            </div>
                            <span className="text-danger"></span>
                        </div>
                    </div>
                    <div className="col-lg-12">
                        <div className="pull-right">
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Uploading...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );

    return (
        <SettingsMenu>
            <div style={{ width: '100%', marginTop: '0px' }}>
                <style>{`
                    @media (max-width: 767px) {
                        .nav-tabs-custom > .nav-tabs { 
                            display: flex; 
                            flex-direction: column; 
                            margin-right: 0 !important; 
                        }
                        .nav-tabs-custom > .nav-tabs > li { float: none; display: block; }
                        .nav-tabs-custom > .nav-tabs > li.header { text-align: center; margin-bottom: 10px; }
                        .pull-right.back-btn-mobile { margin-top: 10px !important; margin-bottom: 10px; float: none !important; display: inline-block; margin-left: 15px; }
                    }
                `}</style>
                <div className="row">
                    <div className="col-md-12">
                        <div className="nav-tabs-custom box box-primary theme-shadow">
                            <ul className="nav nav-tabs pull-right flex-sm-wrap d-xs-flex" style={{ marginRight: '8%' }}>
                                <li className={activeTab === 'online_exam' ? 'active' : ''}>
                                    <a href="#tab_2" onClick={() => handleTabClick('online_exam')}>Online Exam</a>
                                </li>
                                <li className={activeTab === 'online_admission' ? 'active' : ''}>
                                    <a href="#tab_1" onClick={() => handleTabClick('online_admission')}>Online Admission Receipt</a>
                                </li>
                                <li className={activeTab === 'payslip' ? 'active' : ''}>
                                    <a href="#tab_4" onClick={() => handleTabClick('payslip')}>Payslip</a>
                                </li>
                                <li className={activeTab === 'fees_receipt' ? 'active' : ''}>
                                    <a href="#tab_3" onClick={() => handleTabClick('fees_receipt')}>Fees Receipt</a>
                                </li>
                                <li className="pull-left header">
                                    Print Header Footer
                                </li>
                            </ul>
                            <button
                                className={`btn btn-primary btn-sm pull-right ${isMobile ? 'back-btn-mobile' : ''}`}
                                style={{ borderRadius: '20px', padding: '6px 14px', marginTop: '-37px', marginRight: '10px', position: 'relative', zIndex: 0 }}
                                onClick={() => navigate('/settings')}
                            >
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                            <div className="tab-content" style={{ marginTop: isMobile ? '20px' : '0' }}>
                                {activeTab === 'fees_receipt' && renderTabContent('fees_receipt', 'Fees Receipt')}
                                {activeTab === 'payslip' && renderTabContent('payslip', 'Payslip')}
                                {activeTab === 'online_admission' && renderTabContent('online_admission', 'Online Admission Receipt')}
                                {activeTab === 'online_exam' && renderTabContent('online_exam', 'Online Exam')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsMenu >
    );
};

export default PrintHeaderFooterSettings;
