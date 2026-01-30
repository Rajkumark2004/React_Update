import React, { useState } from 'react';
import SettingsMenu from "../../components/SettingsMenu";
import "../../utils/include_files.js";
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';

const PrintHeaderFooterSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('fees_receipt');
    const [formData, setFormData] = useState({
        fees_receipt: { header_image: null, footer_content: '', current_image: '/header_fee_receipt.png' },
        payslip: { header_image: null, footer_content: '', current_image: '/wisibles_printlogo.jpeg' },
        online_admission: { header_image: null, footer_content: '', current_image: '/online_admission_receipt.png' },
        online_exam: { header_image: null, footer_content: '', current_image: '/online_exam.png' }
    });

    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleFileProcess = (tab, file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setFormData(prev => ({
                ...prev,
                [tab]: { ...prev[tab], header_image: file, current_image: e.target.result }
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (tab, e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileProcess(tab, file);
        }
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

        if (!currentData.header_image) {
            setMessage({ type: 'warning', text: 'Please select an image to upload.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Map tab to logo type for backend
            const logoTypeMap = {
                fees_receipt: 'fees_receipt_logo',
                payslip: 'payslip_logo',
                online_admission: 'online_admission_logo',
                online_exam: 'online_exam_logo'
            };

            const response = await api.uploadSchoolLogo(currentData.header_image, logoTypeMap[activeTab]);
            setMessage({ type: 'success', text: response.message || 'Logo uploaded successfully!' });

            // Update the current image with the new URL
            setFormData(prev => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], current_image: response.image_url, header_image: null }
            }));
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload logo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (tab, e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileProcess(tab, file);
        }
    };

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
                            <label>Header Image (2230px X 300px)<small className="req"> *</small></label>
                            <div
                                className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(tabKey, e)}
                                onClick={() => document.getElementById(`fileInput-${tabKey}`).click()}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                style={{
                                    border: '2px dashed #ccc',
                                    borderRadius: '5px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isDragging ? '#e9ecef' : '#f9f9f9',
                                    marginBottom: '10px',
                                    position: 'relative',
                                    minHeight: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {formData[tabKey].current_image ? (
                                    <>
                                        <img
                                            src={formData[tabKey].current_image}
                                            alt="Header Preview"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                opacity: (isHovered || isDragging) ? 0.5 : 1,
                                                transition: 'opacity 0.3s'
                                            }}
                                        />
                                        {(isHovered || isDragging) && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: '#333',
                                                fontWeight: 'bold',
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                padding: '10px 20px',
                                                borderRadius: '5px'
                                            }}>
                                                Drag and drop or click to replace
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p>Drag and drop an image here, or click to select</p>
                                )}
                                <input
                                    id={`fileInput-${tabKey}`}
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => handleFileChange(tabKey, e)}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>
                            <span className="text-danger"></span>
                        </div>
                        <div className="form-group">
                            <label>Footer Content</label>
                            <textarea
                                className="form-control"
                                style={{ height: '250px' }}
                                value={formData[tabKey].footer_content}
                                onChange={(e) => handleTextChange(tabKey, e.target.value)}
                            />
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
            <div style={{ width: '100%', marginTop: '20px' }}>
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
                                className="btn btn-primary btn-sm pull-right"
                                style={{ borderRadius: '20px', padding: '6px 14px', marginTop: '-37px', marginRight: '15px', position: 'relative', zIndex: 1000 }}
                                onClick={() => navigate('/settings')}
                            >
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                            <div className="tab-content">
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
