import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';
import pdfIcon from '../../backend/images/pdficon.png';
import txtIcon from '../../backend/images/txticon.png';
import uploadFileIcon from '../../backend/images/upload-file.png';
import loadingGif from '../../backend/images/loading.gif';

const UploadContent = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
    const [showAddModal, setShowAddModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showShareURLModal, setShowShareURLModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [sidebarFormVisible, setSidebarFormVisible] = useState(false);
    const [activeItem, setActiveItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Mock data based on PHP file
    const contentTypes = [
        { id: '1', name: 'Test' },
        { id: '2', name: 'Exam' },

    ];

    const roles = [
        { id: '1', name: 'Admin' },
        { id: '2', name: 'Teacher' },
        { id: '3', name: 'Accountant' },
        { id: '4', name: 'Librarian' },
        { id: '5', name: 'Receptionist' },
    ];

    const [contents, setContents] = useState([
        { id: '1', name: 'Mathematics Assignment', type: 'Assignments', size: '2.5 MB', date: '2024-03-20', typeId: '1', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'math_assignment.pdf' },
        { id: '2', name: 'Science Notes', type: 'Study Material', size: '1.8 MB', date: '2024-03-18', typeId: '2', fileType: 'docx', path: 'uploads/school_content/material/', real_name: 'science_notes.docx' },
        { id: '3', name: 'English Syllabus', type: 'Syllabus', size: '1.2 MB', date: '2024-03-15', typeId: '3', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'english_syllabus.pdf' },
        { id: '4', name: 'School Bus Route', type: 'Other Download', size: '0.5 MB', date: '2024-03-10', typeId: '4', fileType: 'jpg', path: 'uploads/school_content/material/', real_name: 'bus_route.jpg' },
        { id: '5', name: 'History Chapter 1', type: 'Study Material', size: '3.1 MB', date: '2024-03-05', typeId: '2', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'history_ch1.pdf' },
        { id: '6', name: 'Geography Map', type: 'Other Download', size: '0.8 MB', date: '2024-03-01', typeId: '4', fileType: 'jpg', path: 'uploads/school_content/material/', real_name: 'geo_map.jpg' },
        { id: '7', name: 'Physics Formulas', type: 'Study Material', size: '1.5 MB', date: '2024-02-28', typeId: '2', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'physics_formulas.pdf' },
        { id: '8', name: 'Chemistry Periodic Table', type: 'Study Material', size: '0.9 MB', date: '2024-02-25', typeId: '2', fileType: 'jpg', path: 'uploads/school_content/material/', real_name: 'periodic_table.jpg' },
        { id: '9', name: 'Annual Sports Day Circular', type: 'Other Download', size: '0.2 MB', date: '2024-02-20', typeId: '4', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'sports_day.pdf' },
        { id: '10', name: 'Computer Science Project', type: 'Assignments', size: '4.2 MB', date: '2024-02-15', typeId: '1', fileType: 'docx', path: 'uploads/school_content/material/', real_name: 'cs_project.docx' },
        { id: '11', name: 'Art Competition Rules', type: 'Other Download', size: '0.3 MB', date: '2024-02-10', typeId: '4', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'art_rules.pdf' },
        { id: '12', name: 'Holiday Homework', type: 'Assignments', size: '1.1 MB', date: '2024-02-05', typeId: '1', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'holiday_hw.pdf' },
        { id: '13', name: 'Exam Schedule', type: 'Syllabus', size: '0.1 MB', date: '2024-02-01', typeId: '3', fileType: 'pdf', path: 'uploads/school_content/material/', real_name: 'exam_schedule.pdf' },
    ]);

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch (e) {
            console.error('Logout API failed', e);
        }
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const sessionYear = currentSession?.session || '2024-25';

    const toggleItemSelection = (id, name, e) => {
        e.stopPropagation();
        setSelectedItems(prev => {
            const exists = prev.find(item => item.id === id);
            let newSelection;
            if (exists) {
                newSelection = prev.filter(item => item.id !== id);
            } else {
                newSelection = [...prev, { id, filename: name }];
            }

            if (newSelection.length === 0) {
                setActiveItem(null);
                setSidebarFormVisible(false);
            }
            return newSelection;
        });
    };

    const handleItemClick = (item) => {
        setActiveItem(item);
        setSidebarFormVisible(true);
        // Remove this to prevent clearing selection when clicking the item card/row
        // setSelectedItems([]); 
    };

    const handleAddClick = () => {
        setShowAddModal(true);
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/content/upload" />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Content List</h3>
                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-sm btn-primary" onClick={handleAddClick}>
                                            <i className="fa fa-cloud-upload"></i> Upload
                                        </button>
                                        <button onClick={handleBack} className="btn btn-primary btn-sm ml-lg-1">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                <div className="box-body">
                                    <div className="row pb20">
                                        <div className="col-lg-6 col-md-6 col-sm-8 col-xs-8">
                                            <form id="searchform">
                                                <div className="input-group input-group-sm">
                                                    <input type="text" name="table_search" className="form-control pull-right post_search_text" placeholder="Search" />
                                                    <div className="input-group-btn">
                                                        <button type="submit" className="btn btn-default post_search_submit">
                                                            <i className="fa fa-search"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-4 col-xs-4 pt5">
                                            <div className="pull-right">
                                                <div className="btn-group">
                                                    <button className={`btn btn-default btn-sm ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
                                                        <span className="fa fa-1-2x fa-th-list"></span>
                                                    </button>
                                                    <button className={`btn btn-default btn-sm ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Card View">
                                                        <span className="fa fa-1-2x fa-th"></span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {(() => {
                                        const indexOfLastItem = currentPage * itemsPerPage;
                                        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                        const currentItems = contents.slice(indexOfFirstItem, indexOfLastItem);
                                        const totalPages = Math.ceil(contents.length / itemsPerPage);

                                        return (
                                            <div style={{ position: 'relative', minHeight: '300px' }}>
                                                {isLoading && <div className="modal_loader_div"></div>}
                                                <div className="row">
                                                    <div className="col-md-9">
                                                        <div className="pagination-container">
                                                            {viewMode === 'grid' ? (
                                                                <div className="row">
                                                                    {currentItems.map(item => (
                                                                        <div key={item.id} className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
                                                                            <div className={`top_list_div ${activeItem?.id === item.id ? 'active' : ''}`} onClick={() => handleItemClick(item)}>
                                                                                <div className="image_content">
                                                                                    <img src={item.fileType === 'pdf' ? pdfIcon : txtIcon} alt={item.name} />
                                                                                    <div className="checkbox-content">
                                                                                        <input type="checkbox" className="share_checkbox" checked={selectedItems.some(i => i.id === item.id)} onClick={(e) => e.stopPropagation()} onChange={(e) => toggleItemSelection(item.id, item.name, e)} />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="content_info">
                                                                                    <div className="content_title" title={item.name}>{item.name}</div>
                                                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                                                        <div className="content_date">{item.date}</div>
                                                                                        <div className="inline-anchor">
                                                                                            <a href="#" className="text-default download_file mr-2" title="Download" onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Downloading...'); }}><i className="fa fa-download"></i></a>
                                                                                            <a href="#" className="text-danger delete_file" title="Delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); setActiveItem(item); }}><i className="fa fa-trash-o"></i></a>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="table-responsive">
                                                                    <table className="table table-hover table_contents">
                                                                        <thead>
                                                                            <tr>
                                                                                <th width="30"><input type="checkbox" /></th>
                                                                                <th>Content Title</th>
                                                                                <th>Type</th>
                                                                                <th>Date</th>
                                                                                <th>Size</th>
                                                                                <th className="text-right">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {currentItems.map(item => (
                                                                                <tr key={item.id} className={activeItem?.id === item.id ? 'active' : ''} onClick={() => handleItemClick(item)}>
                                                                                    <td>
                                                                                        <input type="checkbox" className="share_checkbox_list" checked={selectedItems.some(i => i.id === item.id)} onClick={(e) => e.stopPropagation()} onChange={(e) => toggleItemSelection(item.id, item.name, e)} />
                                                                                    </td>
                                                                                    <td>{item.name}</td>
                                                                                    <td>{item.type}</td>
                                                                                    <td>{item.date}</td>
                                                                                    <td>{item.size}</td>
                                                                                    <td className="text-right">
                                                                                        <a href="#" className="btn btn-xs btn-default mr-1" title="Download" onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Downloading...'); }}><i className="fa fa-download"></i></a>
                                                                                        <a href="#" className="btn btn-xs btn-default text-danger" title="Delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); setActiveItem(item); }}><i className="fa fa-trash-o"></i></a>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="pagination-nav">
                                                            {totalPages > 1 && (
                                                                <ul className="pagination">
                                                                    <li className={currentPage === 1 ? 'disabled' : ''} onClick={() => currentPage > 1 && setCurrentPage(1)}>
                                                                        <a><i className="fa fa-angle-double-left"></i></a>
                                                                    </li>
                                                                    <li className={currentPage === 1 ? 'disabled' : ''} onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}>
                                                                        <a>Previous</a>
                                                                    </li>
                                                                    {[...Array(totalPages)].map((_, i) => (
                                                                        <li key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>
                                                                            <a>{i + 1}</a>
                                                                        </li>
                                                                    ))}
                                                                    <li className={currentPage === totalPages ? 'disabled' : ''} onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}>
                                                                        <a>Next</a>
                                                                    </li>
                                                                    <li className={currentPage === totalPages ? 'disabled' : ''} onClick={() => currentPage < totalPages && setCurrentPage(totalPages)}>
                                                                        <a><i className="fa fa-angle-double-right"></i></a>
                                                                    </li>
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="col-md-3">
                                                        <div className="documents_sidebar">
                                                            <div className="d-preview text-center p-2">
                                                                <div className="d-preview-position">
                                                                    {selectedItems.length > 0 ? (
                                                                        <>
                                                                            <img src={txtIcon} alt="Multiple Files" />
                                                                            <div className="d-preview-count">
                                                                                <i className="fa fa-plus"></i> {selectedItems.length.toString().padStart(2, '0')} Files Selected
                                                                            </div>
                                                                        </>
                                                                    ) : activeItem ? (
                                                                        <img src={activeItem.fileType === 'pdf' ? pdfIcon : txtIcon} alt={activeItem.name} />
                                                                    ) : (
                                                                        <img src={uploadFileIcon} className="add_image" onClick={handleAddClick} alt="Upload" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="documents_sidebar_info p-2">
                                                                {!sidebarFormVisible && selectedItems.length === 0 && (
                                                                    <div className="sidear-info">
                                                                        <table className="table no-border">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>Total Documents</td>
                                                                                    <td className="total_files">{contents.length}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Size</td>
                                                                                    <td className="total_size">6.0 MB</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}

                                                                {(sidebarFormVisible || selectedItems.length > 0) && (
                                                                    <div className="sidebar-form-content">
                                                                        <div className="btn-group">
                                                                            <button type="button" className="btn btn-sm btn-default btn-white" onClick={() => setShowShareModal(true)} title="Share"><i className="fa fa-share-alt"></i></button>
                                                                            <button type="button" className="btn btn-sm btn-default btn-white" onClick={() => setShowShareURLModal(true)} title="Generate URL"><i className="fa fa-globe"></i></button>
                                                                        </div>
                                                                        <button className="btn btn-sm btn-default btn-white pull-right side_delete_btn" onClick={() => setShowDeleteModal(true)} title="Delete"><i className="fa fa-trash"></i></button>

                                                                        {activeItem && selectedItems.length === 0 && (
                                                                            <form className="pt20" id="side_form">
                                                                                <input type="hidden" name="id" value={activeItem.id} />
                                                                                <div className="form-group row">
                                                                                    <label className="control-label col-sm-4 col-xs-4">File Name <small className="req"> *</small></label>
                                                                                    <div className="col-sm-8 col-xs-8">
                                                                                        <input type="text" className="form-control" defaultValue={activeItem.name} name="name" />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="form-group row">
                                                                                    <label className="control-label col-sm-4 col-xs-4">Content Type <small className="req"> *</small></label>
                                                                                    <div className="col-sm-8 col-xs-8">
                                                                                        <select className="form-control" name="content_type" defaultValue={activeItem.typeId}>
                                                                                            <option value="">Select</option>
                                                                                            {contentTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="clearfix"></div>
                                                                                <button type="submit" className="btn btn-sm btn-primary pull-right">Save</button>
                                                                                <div className="clearfix"></div>
                                                                            </form>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Modals */}
            {showAddModal && <AddModal onClose={() => setShowAddModal(false)} contentTypes={contentTypes} />}
            {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} selectedItems={selectedItems.length > 0 ? selectedItems : [activeItem]} roles={roles} />}
            {showShareURLModal && <ShareURLModal onClose={() => setShowShareURLModal(false)} selectedItems={selectedItems.length > 0 ? selectedItems : [activeItem]} />}
            {showDeleteModal && <DeleteModal onClose={() => setShowDeleteModal(false)} items={selectedItems.length > 0 ? selectedItems : [activeItem]} />}
            {showViewModal && <ViewModal onClose={() => setShowViewModal(false)} item={activeItem} />}

            <Footer />
            <style>{`
                .top_list_div {
                    border: 1px solid #ddd;
                    padding: 10px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                }
                .top_list_div:hover, .top_list_div.active {
                    border-color: #3c8dbc;
                    box-shadow: 0 0 5px rgba(60,141,188,0.5);
                }
                .image_content {
                    text-align: center;
                    padding: 10px;
                    background: #f9f9f9;
                    position: relative;
                }
                .image_content img {
                    max-width: 100%;
                    height: 80px;
                }
                .checkbox-content {
                    position: absolute;
                    top: 5px;
                    left: 5px;
                }
                .content_info {
                    padding: 10px 0;
                }
                .content_title {
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .content_date {
                    font-size: 12px;
                    color: #777;
                }
                .inline-anchor a {
                    color: #777;
                    font-size: 14px;
                }
                .inline-anchor a:hover {
                    color: #3c8dbc;
                }
                .inline-anchor a.text-danger:hover {
                    color: #dd4b39;
                }
                .mr-2 { margin-right: 0.5rem; }
                /* Standard Bootstrap 3 pagination is handled by class "pagination". 
                   We remove the custom flex override to let it behave naturally (inline-block/floated). */
                .pagination li {
                    cursor: pointer;
                }
                .documents_sidebar {
                    border-left: 1px solid #eee;
                    padding-left: 15px;
                }
                .d-preview {
                    background: #f4f4f4;
                    margin-bottom: 15px;
                    border-radius: 4px;
                }
                .d-preview-position img {
                    max-width: 100%;
                    height: 100px;
                }
                .d-preview-count {
                    font-size: 12px;
                    margin-top: 5px;
                    color: #333;
                }
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1040;
                    background-color: #000;
                    opacity: 0.5;
                }
                .modal {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1050;
                    display: none;
                    overflow: hidden;
                    outline: 0;
                }
                .modal.in {
                    display: block;
                    overflow-x: hidden;
                    overflow-y: auto;
                }
                .btn-white {
                    background-color: #fff;
                    border-color: #ccc;
                }
                .displaynone {
                    display: none;
                }
                .orline {
                    position: relative;
                    text-align: center;
                    margin: 10px 0;
                }
                .orline:before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    border-top: 1px solid #ddd;
                    z-index: 1;
                }
                .orline span {
                    background: #fff;
                    padding: 0 10px;
                    position: relative;
                    z-index: 2;
                    color: #999;
                    font-style: italic;
                }
                .well {
                    background-color: #f5f5f5;
                    border: 1px solid #e3e3e3;
                    border-radius: 4px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .wellscroll {
                    max-height: 200px;
                    overflow-y: auto;
                }
                .nav-tabs-radio {
                    margin-bottom: 15px;
                }
                .bs-dropdown-to-select-group .dropdown-menu {
                    width: 100%;
                }
                .dual-list {
                    margin-top: 10px;
                }
                .list-right .well {
                    min-height: 260px;
                }
                .modal_loader_div {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255,255,255,0.7) url(${loadingGif}) no-repeat center center;
                    z-index: 1000;
                }
            `}</style>
        </div >
    );
};

// Sub-components for Modals

const AddModal = ({ onClose, contentTypes }) => (
    <>
        <div className="modal-backdrop fade in"></div>
        <div className="modal fade in" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form id="fileupload">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={onClose}>×</button>
                            <h4 className="modal-title">Upload</h4>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-xs-12 col-sm-6">
                                    <div className="form-group">
                                        <label>Content Type <small className="req"> *</small></label>
                                        <select className="form-control" name="content_type">
                                            <option value="">Select</option>
                                            {contentTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-12 col-sm-5">
                                    <div className="form-group">
                                        <label>Upload Your File</label>
                                        <input type="file" name="upload[]" className="form-control" data-height="26" />
                                    </div>
                                </div>
                                <div className="col-xs-12 col-sm-2 text-center">
                                    <div className="orline" style={{ marginTop: '25px' }}><span>or</span></div>
                                </div>
                                <div className="col-xs-12 col-sm-5">
                                    <div className="form-group">
                                        <label>Upload YouTube Video Link</label>
                                        <input type="text" name="url" className="form-control" placeholder="URL" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </>
);

const ShareModal = ({ onClose, selectedItems, roles }) => {
    const [sendTo, setSendTo] = useState('group');
    const [category, setCategory] = useState('Select');

    return (
        <>
            <div className="modal-backdrop fade in"></div>
            <div className="modal fade in" style={{ display: 'block' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <form id="share_form">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={onClose}>×</button>
                                <h4 className="modal-title">Share Selected</h4>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="form-group">
                                            <label>Title <small className="req"> *</small></label>
                                            <input type="text" name="title" className="form-control" />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Share Date <small className="req"> *</small></label>
                                                    <input type="date" name="share_date" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Valid Upto</label>
                                                    <input type="date" name="valid_upto" className="form-control" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea className="form-control" name="description" rows="3"></textarea>
                                        </div>
                                        <h4>Selected Document</h4>
                                        <div className="content_list_uploaded">
                                            <ul className="list-group">
                                                {selectedItems.map(item => (
                                                    <li key={item.id} className="list-group-item">{item.filename || item.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="nav-tabs-radio">
                                            <label>Send To <small className="req"> *</small></label>
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <label className="radio-inline"><input type="radio" value="group" checked={sendTo === 'group'} onChange={() => setSendTo('group')} name="send_to" />Group</label>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="radio-inline"><input type="radio" value="class" checked={sendTo === 'class'} onChange={() => setSendTo('class')} name="send_to" />Class</label>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="radio-inline"><input type="radio" value="individual" checked={sendTo === 'individual'} onChange={() => setSendTo('individual')} name="send_to" />Individual</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="tab-content">
                                            {sendTo === 'group' && (
                                                <div className="well minheight303">
                                                    <div className="checkbox mt0"><label><input type="checkbox" name="user[]" value="student" /> <b>Students</b></label></div>
                                                    <div className="checkbox"><label><input type="checkbox" name="user[]" value="parent" /> <b>Guardians</b></label></div>
                                                    {roles.map(role => (
                                                        <div key={role.id} className="checkbox"><label><input type="checkbox" name="user[]" value={role.id} /> <b>{role.name}</b></label></div>
                                                    ))}
                                                </div>
                                            )}
                                            {sendTo === 'class' && (
                                                <div>
                                                    <div className="form-group">
                                                        <select className="form-control" id="class_id" name="class_id">
                                                            <option value="">Select</option>
                                                        </select>
                                                    </div>
                                                    <div className="dual-list list-right">
                                                        <div className="well minheight260">
                                                            <div className="wellscroll">
                                                                <b>Section</b> <small className="req"> *</small>
                                                                <ul className="list-group section_list listcheckbox"></ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {sendTo === 'individual' && (
                                                <div>
                                                    <div className="form-group">
                                                        <div className="input-group">
                                                            <div className="input-group-btn bs-dropdown-to-select-group">
                                                                <button type="button" className="btn btn-default btn-searchsm dropdown-toggle" data-toggle="dropdown">
                                                                    <span>{category}</span> <span className="caret"></span>
                                                                </button>
                                                                <ul className="dropdown-menu">
                                                                    <li onClick={() => setCategory('Students')}><a>Students</a></li>
                                                                    <li onClick={() => setCategory('Guardians')}><a>Guardians</a></li>
                                                                    <li onClick={() => setCategory('Staff')}><a>Staff</a></li>
                                                                </ul>
                                                            </div>
                                                            <input type="text" className="form-control" placeholder="Search..." id="search-query" />
                                                            <span className="input-group-btn">
                                                                <button className="btn btn-primary btn-searchsm add-btn" type="button">Add</button>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="dual-list list-right">
                                                        <div className="well minheight260">
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="input-group">
                                                                        <input type="text" name="SearchDualList" className="form-control" placeholder="Search..." />
                                                                        <div className="input-group-btn"><span className="btn btn-default input-group-addon bright"><i className="fa fa-search"></i></span></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ul className="list-group send_list mt10"></ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

const ShareURLModal = ({ onClose, selectedItems }) => (
    <>
        <div className="modal-backdrop fade in"></div>
        <div className="modal fade in" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form id="shareurl">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={onClose}>×</button>
                            <h4 className="modal-title">Generate URL</h4>
                        </div>
                        <div className="modal-body minheight199">
                            <div className="from_content">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label>Title <small className="req"> *</small></label>
                                            <input type="text" name="title" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Share Date <small className="req"> *</small></label>
                                            <input type="date" name="share_date" className="form-control" />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Valid Upto</label>
                                            <input type="date" name="valid_upto" className="form-control" />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">Generate URL</button>
                            </div>
                            <div className="url_content_list mt20">
                                <h4>Selected Document</h4>
                                <div className="content_list_uploaded">
                                    <ul className="list-group">
                                        {selectedItems.map(item => (
                                            <li key={item.id} className="list-group-item">{item.filename || item.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </>
);

const DeleteModal = ({ onClose, items }) => (
    <>
        <div className="modal-backdrop fade in"></div>
        <div className="modal fade in" style={{ display: 'block' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={onClose}>×</button>
                        <h4 className="modal-title">Confirm Delete</h4>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to delete the following items?</p>
                        <div className="delete_files_list">
                            <ul className="list-group">
                                {items.map(item => item && (
                                    <li key={item.id} className="list-group-item">{item.filename || item.name}</li>
                                ))}
                            </ul>
                        </div>
                        <p>This procedure is irreversible. Do you want to proceed?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger btn-ok">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    </>
);

const ViewModal = ({ onClose, item }) => (
    <>
        <div className="modal-backdrop fade in"></div>
        <div className="modal fade in bg-transparent-alpha" style={{ display: 'block' }}>
            <div className="modal-dialog full-width mt0">
                <div className="modal-content m-0 bg-transparent modal-body-scroll">
                    <div className="modal-gradient">
                        <div className="modal-header p0 border0">
                            <div className="d-flex pdficon" style={{ display: 'flex', alignItems: 'center' }}>
                                <a style={{ color: '#fff', marginRight: '10px', fontSize: '20px' }} onClick={onClose}><i className="fa fa-arrow-left"></i></a>
                                <span className="text-white text-nowrap2 model_file_name" style={{ color: '#fff' }}>{item?.name}</span>
                            </div>
                            <a href="#" className="pdfdownload-icon" style={{ position: 'absolute', right: '50px', top: '15px', color: '#fff' }}><i className="fa fa-download"></i></a>
                            <button type="button" className="popupclose" onClick={onClose} style={{ position: 'absolute', right: '15px', top: '10px', background: 'none', border: 'none', color: '#fff', fontSize: '30px' }}>&times;</button>
                        </div>
                    </div>
                    <div className="h-50" style={{ height: '50px' }}></div>
                    <div className="modal-body p0 w-75 mx-auto text-center w-sm-100">
                        {item?.fileType === 'pdf' ? (
                            <embed src={`/${item.path}${item.real_name}`} width="100%" height="600px" />
                        ) : (
                            <img src={txtIcon} className="img-fluid" alt={item?.name} style={{ maxHeight: '80vh' }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
);

export default UploadContent;
