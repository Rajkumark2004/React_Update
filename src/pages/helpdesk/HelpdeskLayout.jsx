import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useHelpdeskCounts } from '../../context/HelpdeskCountContext';
import './HelpdeskLayout.css';

const HelpdeskLayout = ({ children, activeTab }) => {
    const { counts, activeMetric, setActiveMetric } = useHelpdeskCounts();
    const navigate = useNavigate();

    const handleDirectNavigate = (e, metric) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveMetric(metric);
        navigate(`/admin/${metric}`);
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
                <section className="helpdesk-header-section">
                    <div className="helpdesk-header-content">
                        <div className="helpdesk-titles">
                            <h1>Help Desk</h1>
                            <p>Manage admission enquiries, visitors, and complains</p>
                        </div>
                    </div>

                    <div className="helpdesk-summary-cards">
                        {/* 1. Admission Enquiry */}
                        <Link to="/admin/enquiry" className={`helpdesk-card ${activeTab === 'enquiry' ? 'active' : ''}`}>
                            <div className="helpdesk-card-header">
                                <span className="helpdesk-card-title">Admission Enquiry</span>
                                <i className="fa fa-university helpdesk-card-icon" style={{ color: activeTab === 'enquiry' ? '#3b82f6' : '#94a3b8' }}></i>
                            </div>
                            <div className="helpdesk-card-value">{counts.totalEnquiries}</div>
                            <div className="helpdesk-card-subtitle">Total enquiries</div>
                        </Link>

                        {/* 2. Visitor Book */}
                        <Link to="/admin/visitors" className={`helpdesk-card ${activeTab === 'visitors' ? 'active' : ''}`}>
                            <div className="helpdesk-card-header">
                                <span className="helpdesk-card-title">Visitor Book</span>
                                <i className="fa fa-book helpdesk-card-icon" style={{ color: activeTab === 'visitors' ? '#10b981' : '#94a3b8' }}></i>
                            </div>
                            <div className="helpdesk-card-value">{counts.totalVisitors}</div>
                            <div className="helpdesk-card-subtitle">Total visitors</div>
                        </Link>

                        {/* 3. Complain */}
                        <Link to="/admin/complain" className={`helpdesk-card ${activeTab === 'complain' ? 'active' : ''}`}>
                            <div className="helpdesk-card-header">
                                <span className="helpdesk-card-title">Complain</span>
                                <i className="fa fa-exclamation-circle helpdesk-card-icon" style={{ color: activeTab === 'complain' ? '#f59e0b' : '#94a3b8' }}></i>
                            </div>
                            <div className="helpdesk-card-value">{counts.totalComplaints || 0}</div>
                            <div className="helpdesk-card-subtitle">Total complaints</div>
                        </Link>

                        {/* 4. Setup Front Office (Combined & Stable Style) */}
                        <div className="helpdesk-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '140px' }}>
                            <div className="helpdesk-card-header" style={{ marginBottom: '10px' }}>
                                <span className="helpdesk-card-title">Setup Front Office</span>
                                <i className={`fa ${activeMetric === 'source' ? 'fa-bullhorn' : 'fa-external-link'} helpdesk-card-icon`} style={{ color: '#7c3aed' }}></i>
                            </div>
                            
                            <Link
                                to={activeMetric === 'source' ? "/admin/source" : "/admin/reference"}
                                style={{ textDecoration: 'none', flex: 1 }}
                            >
                                <div className="helpdesk-card-value">
                                    {activeMetric === 'source' ? counts.totalSources : counts.totalReferences}
                                </div>
                                <div className="helpdesk-card-subtitle">
                                    Total {activeMetric === 'source' ? 'Sources' : 'References'}
                                </div>
                            </Link>

                            <div className="metric-toggle-group" style={{ 
                                marginTop: '4px', 
                                alignSelf: 'flex-end',
                                background: '#f8fafc',
                                padding: '2px',
                                borderRadius: '8px'
                            }}>
                                <button
                                    className={`metric-toggle-btn ${activeMetric === 'source' ? 'active' : ''}`}
                                    onClick={(e) => handleDirectNavigate(e, 'source')}
                                    style={{ fontSize: '11px', padding: '4px 10px' }}
                                >
                                    Source
                                </button>
                                <button
                                    className={`metric-toggle-btn ${activeMetric === 'reference' ? 'active' : ''}`}
                                    onClick={(e) => handleDirectNavigate(e, 'reference')}
                                    style={{ fontSize: '11px', padding: '4px 10px' }}
                                >
                                    Reference
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="content">
                    {children}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default HelpdeskLayout;
