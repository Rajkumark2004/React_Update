import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';

const Rank = () => {
    const { sessionYear } = useSession();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const appName = "Smart School";
    const userData = {
        name: "Joe",
        pimage: "/public/images/userprofile.jpg",
        role: "Super Admin"
    };

    // CBSE Submenu
    const cbseSubmenu = [
        { label: 'Exam', url: '/cbseexam/exam', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/1.png' },
        { label: 'Exam Schedule', url: '/cbseexam/examschedule', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/2.png' },
        { label: 'Print Marksheet', url: '/cbseexam/report', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/3.png' },
        { label: 'Exam Grade', url: '/cbseexam/examgrade', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/4.png' },
        { label: 'Assessment', url: '/cbseexam/assessment', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/8.png' },
        { label: 'Term', url: '/cbseexam/term', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/9.png' },
        { label: 'Template', url: '/cbseexam/template', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/4.png' },
        { label: 'Reports', url: '/cbseexam/report', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/10.png' },
        { label: 'Setting', url: '/cbseexam/settings', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/11.png' },
    ];

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await api.getTemplatesForRank();
            if (response && response.status && response.data && response.data.templates) {
                setTemplates(response.data.templates);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!selectedTemplate) {
            alert('Please select a template');
            return;
        }
        // Navigate to the template rank page or trigger rank generation
        // For now, we can show an alert or navigate
        navigate(`/cbseexam/exam/templaterank/${selectedTemplate}`);
    };

    return (
        <div className="wrapper" style={{ height: 'auto', minHeight: '100%' }}>
            <Header appName={appName} userData={userData} />
            <Sidebar />

            <div className="content-wrapper" style={{ marginTop: '0px' }}>
                <section className="content">
                    <div className="row">
                        {/* Left Sidebar (CBSE Submenu) */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">State Examination</h3>
                                </div>
                                <ul className="tablists">
                                    {cbseSubmenu.map((item, idx) => (
                                        <li key={idx}>
                                            <Link to={item.url} className={item.active ? "active" : ""}>
                                                <img
                                                    src={item.icon}
                                                    alt={item.label}
                                                    className="img-fluid"
                                                    style={{ width: '20px', marginRight: '5px' }}
                                                />
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="col-md-10">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">
                                        <i className="fa fa-list-alt"></i> Template Wise Rank
                                    </h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginTop: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Generate Rank</div>

                                    {loading ? (
                                        <div className="text-center" style={{ padding: '50px' }}>
                                            <i className="fa fa-spinner fa-spin fa-3x"></i>
                                            <p style={{ marginTop: '10px' }}>Loading templates...</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Template <small className="req">*</small></label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedTemplate}
                                                        onChange={(e) => setSelectedTemplate(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {templates.map(template => (
                                                            <option key={template.id} value={template.id}>
                                                                {template.name} ({template.class_sections})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>&nbsp;</label>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-block"
                                                        onClick={handleSearch}
                                                    >
                                                        <i className="fa fa-search"></i> Search
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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

export default Rank;
