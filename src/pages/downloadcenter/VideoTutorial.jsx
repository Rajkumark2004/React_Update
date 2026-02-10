import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';

const VideoTutorial = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const [tutorials, setTutorials] = useState([
        { id: 1, title: 'Maths Chapter 1', class: 'Class 1', section: 'A', description: 'Introduction to Numbers', video_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', created_by: 'Admin' },
        { id: 2, title: 'Physics Laws', class: 'Class 9', section: 'B', description: 'Newton Rules', video_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', created_by: 'Teacher' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [activeItem, setActiveItem] = useState(null);

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: '/uploads/staff_images/default_male.jpg'
    };
    const sessionYear = currentSession?.session || '2024-25';

    // Helper to extract Youtube ID
    const getYoutubeID = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const [classList] = useState([
        { id: 0, class: 'Nursery' },
        { id: 1, class: 'LKG' },
        { id: 2, class: 'UKG' },
        { id: 3, class: 'Class 1' },
        { id: 4, class: 'Class 2' },
        { id: 5, class: 'Class 3' },
        { id: 6, class: 'Class 4' },
        { id: 7, class: 'Class 5' },
        { id: 8, class: 'Class 6' },
        { id: 9, class: 'Class 7' },
        { id: 10, class: 'Class 8' },
        { id: 11, class: 'Class 9' },
        { id: 12, class: 'Class 10' },
        { id: 13, class: '11' }
    ]);
    const [sectionList] = useState([
        { id: 1, section: 'A' },
        { id: 2, section: 'B' },
        { id: 3, section: 'C' }
    ]);

    const handleAddTutorial = (newTutorial) => {
        setTutorials([...tutorials, { ...newTutorial, id: tutorials.length + 1, created_by: 'Admin' }]);
        setShowAddModal(false);
    };

    return (
        <div className="wrapper">
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/video_tutorial" />

            <div className="content-wrapper" style={{ marginTop: '18px', minHeight: '658px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-info">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Video Tutorial List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm mr-1"><i className="fa fa-arrow-left"></i> Back</button>
                                        <button className="btn btn-sm btn-primary pull-right" onClick={() => setShowAddModal(true)}><i className="fa fa-plus"></i> Add</button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    {/* Search Form */}
                                    <div className="row pb20">
                                        <div className="col-md-12">
                                            <form className="row">
                                                <div className="col-md-6">
                                                    <div className="row">
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label>Class</label>
                                                                <select className="form-control">
                                                                    <option value="">Select</option>
                                                                    {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <div className="form-group">
                                                                <label>Section</label>
                                                                <select className="form-control">
                                                                    <option value="">Select</option>
                                                                    {sectionList.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Search By Title</label>
                                                        <input type="text" className="form-control" placeholder="Search By Title" />
                                                    </div>
                                                    <button type="button" className="btn btn-primary pull-right btn-sm"><i className="fa fa-search"></i> Search</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="mediarow">
                                        <div className="row">
                                            {tutorials.map(item => (
                                                <div key={item.id} className="col-lg-3 col-md-4 col-sm-6 img_div_modal">
                                                    <div className="box box-solid">
                                                        <div className="box-body">
                                                            <img
                                                                src={`https://img.youtube.com/vi/${getYoutubeID(item.video_link)}/hqdefault.jpg`}
                                                                className="img-responsive"
                                                                onClick={() => { setActiveItem(item); setShowViewModal(true); }}
                                                                style={{ cursor: 'pointer', width: '100%', height: '150px', objectFit: 'cover' }}
                                                                alt="Video Thumbnail"
                                                            />
                                                            <h4 className="text-center mt10" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.title}>{item.title}</h4>
                                                            <div className="text-center">
                                                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveItem(item); setShowEditModal(true); }} title="Edit" className="btn btn-default btn-xs"><i className="fa fa-pencil"></i></a>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); setActiveItem(item); setShowDeleteModal(true); }} title="Delete" className="btn btn-default btn-xs" style={{ marginLeft: '5px' }}><i className="fa fa-trash"></i></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* View Modal */}
            {showViewModal && activeItem && (
                <div className="modal fade in" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content fullshadow">
                            <button type="button" className="close" onClick={() => setShowViewModal(false)}>&times;</button>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <iframe width="100%" height="400" src={`https://www.youtube.com/embed/${getYoutubeID(activeItem.video_link)}`} frameBorder="0" allowFullScreen></iframe>
                                    </div>
                                    <div className="col-md-4">
                                        <dl>
                                            <dt>Class</dt><dd>{activeItem.class}</dd>
                                            <dt>Section</dt><dd>{activeItem.section}</dd>
                                            <dt>Title</dt><dd>{activeItem.title}</dd>
                                            <dt>Description</dt><dd>{activeItem.description}</dd>
                                            <dt>Created By</dt><dd>{activeItem.created_by}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <AddModal
                    onClose={() => setShowAddModal(false)}
                    classList={classList}
                    sectionList={sectionList}
                    onSave={handleAddTutorial}
                />
            )}

            <Footer />
        </div>
    );
};

const AddModal = ({ onClose, classList, sectionList, onSave }) => {
    const [formData, setFormData] = useState({
        class: '',
        section: '',
        title: '',
        video_link: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Map ID to Name for display (In real app, backend handles this)
        const selectedClass = classList.find(c => c.id == formData.class)?.class || '';
        const selectedSection = sectionList.find(s => s.id == formData.section)?.section || '';

        onSave({
            ...formData,
            class: selectedClass,
            section: selectedSection
        });
    };

    return (
        <>
            <div className="modal-backdrop fade in"></div>
            <div className="modal fade in" style={{ display: 'block' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={onClose}>&times;</button>
                            <h4 className="modal-title">Add Video Tutorial</h4>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label>Class <small className="req"> *</small></label>
                                            <select name="class" className="form-control" onChange={handleChange} required>
                                                <option value="">Select</option>
                                                {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label>Section <small className="req"> *</small></label>
                                            <select name="section" className="form-control" onChange={handleChange} required>
                                                <option value="">Select</option>
                                                {sectionList.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label>Title <small className="req"> *</small></label>
                                            <input type="text" name="title" className="form-control" onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label>Video Link <small className="req"> *</small></label>
                                            <input type="text" name="video_link" className="form-control" onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea name="description" className="form-control" rows="3" onChange={handleChange}></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-info pull-right">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoTutorial;
