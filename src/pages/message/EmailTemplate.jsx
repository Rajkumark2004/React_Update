import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import '../../../utils/include_files';

const EmailTemplate = () => {
    const navigate = useNavigate();

    // Data States
    const [templates, setTemplates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ id: '', title: '', message: '', files: [] });

    // Initialize mock data
    useEffect(() => {
        setTemplates([
            { id: 1, title: 'Student Admission', message: '<p>Hello {student_name}, Welcome to our school. Your admission number is {admission_no}.</p>', attachment: '' },
            { id: 2, title: 'Fee Reminder', message: '<p>Dear Parent, this is a reminder regarding the pending fees for {student_name}. Please pay by {due_date}.</p>', attachment: 'fees_structure.pdf' },
            { id: 3, title: 'Exam Schedule', message: '<p>The exam schedule for {class} has been released. Please check the notice board for details.</p>', attachment: 'exam_schedule.pdf' },
        ]);
    }, []);

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTemplates.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleAddClick = () => {
        setModalMode('add');
        setFormData({ id: '', title: '', message: '', files: [] });
        setShowModal(true);
    };

    const handleEditClick = (template) => {
        setModalMode('edit');
        setFormData({ id: template.id, title: template.title, message: template.message, files: [] });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this Email Template?')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleSave = (e) => {
        e.preventDefault();

        const templateData = {
            title: formData.title,
            message: formData.message,
            attachment: formData.files.length > 0 ? formData.files.map(f => f.name).join(', ') : (modalMode === 'edit' ? templates.find(t => t.id === formData.id)?.attachment : '')
        };

        if (modalMode === 'add') {
            const newTemplate = {
                ...templateData,
                id: Date.now()
            };
            setTemplates(prev => [...prev, newTemplate]);
            alert('Email Template added successfully');
        } else {
            setTemplates(prev => prev.map(t =>
                t.id === formData.id ? { ...t, ...templateData } : t
            ));
            alert('Email Template updated successfully');
        }
        setShowModal(false);
    };

    const handleTitleChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, title: value }));
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '16px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Email Template List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm" style={{ marginRight: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                        <button onClick={handleAddClick} className="btn btn-primary btn-sm">
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body" style={{ paddingTop: '5px' }}>
                                    <div className="mailbox-messages">
                                        <div className="download_label">Email Template List</div>
                                        <div className="dataTables_wrapper no-footer">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                <div className="dataTables_filter" style={{ textAlign: 'left', width: '300px' }}>
                                                    <input
                                                        type="search"
                                                        placeholder="Search..."
                                                        className="form-control"
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setSearchTerm(e.target.value);
                                                            setCurrentPage(1);
                                                        }}
                                                        style={{ border: '0', borderBottom: '1px solid #f4f4f4', background: 'transparent', boxShadow: 'none' }}
                                                    />
                                                </div>
                                                <div className="dt-buttons btn-group">
                                                    <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy"><span><i className="fa fa-files-o"></i></span></a>
                                                    <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV"><span><i className="fa fa-file-text-o"></i></span></a>
                                                    <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel"><span><i className="fa fa-file-excel-o"></i></span></a>
                                                    <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF"><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                    <a className="btn btn-default buttons-print btn-sm" title="Print"><span><i className="fa fa-print"></i></span></a>
                                                    <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns"><span><i className="fa fa-columns"></i></span></a>
                                                </div>
                                            </div>

                                            <div className="table-responsive">
                                                <table className="table table-hover example" style={{ borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ border: '0', borderBottom: '2px solid #f4f4f4' }}>Title <i className="fa fa-sort text-muted" style={{ fontSize: '10px' }}></i></th>
                                                            <th style={{ border: '0', borderBottom: '2px solid #f4f4f4' }}>Attachment <i className="fa fa-sort text-muted" style={{ fontSize: '10px' }}></i></th>
                                                            <th style={{ border: '0', borderBottom: '2px solid #f4f4f4' }}>Message <i className="fa fa-sort text-muted" style={{ fontSize: '10px' }}></i></th>
                                                            <th className="text-right noExport" style={{ border: '0', borderBottom: '2px solid #f4f4f4' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentItems.map(template => (
                                                            <tr key={template.id}>
                                                                <td className="mailbox-name">{template.title}</td>
                                                                <td className="mailbox-name">{template.attachment || '-'}</td>
                                                                <td className="mailbox-name">
                                                                    <div dangerouslySetInnerHTML={{ __html: template.message }} style={{ maxHeight: '50px', overflow: 'hidden' }}></div>
                                                                </td>
                                                                <td className="mailbox-date text-right no-print">
                                                                    <button
                                                                        className="btn btn-default btn-xs"
                                                                        onClick={() => handleEditClick(template)}
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </button>
                                                                    &nbsp;
                                                                    <button
                                                                        className="btn btn-default btn-xs"
                                                                        onClick={() => handleDelete(template.id)}
                                                                        title="Delete"
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {currentItems.length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" className="text-center" style={{ border: '0' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }}>
                                                                        <div style={{ color: '#f7bbbb', fontFamily: 'Roboto-Bold', fontSize: '14px', marginBottom: '15px' }}>No data available in table</div>
                                                                        <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: '15px', width: '130px' }} />
                                                                        <div style={{ color: '#008000', fontFamily: 'Roboto-Bold', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                                                                            <i className="fa fa-arrow-left" style={{ marginRight: '5px' }}></i> Add new record or search with different criteria.
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="row" style={{ marginTop: '10px' }}>
                                                <div className="col-sm-5">
                                                    <div className="dataTables_info" role="status" aria-live="polite" style={{ fontSize: '11px', color: '#666' }}>
                                                        Records: {filteredTemplates.length === 0 ? '0 to 0 of 0' : `${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, filteredTemplates.length)} of ${filteredTemplates.length}`}
                                                    </div>
                                                </div>
                                                <div className="col-sm-7">
                                                    <div className="pull-right">
                                                        <ul className="pagination" style={{ margin: '0', float: 'right' }}>
                                                            <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) paginate(currentPage - 1); }}>
                                                                    <i className="fa fa-angle-left"></i>
                                                                </a>
                                                            </li>
                                                            {[...Array(totalPages)].map((_, i) => (
                                                                <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); paginate(i + 1); }}>{i + 1}</a>
                                                                </li>
                                                            ))}
                                                            <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) paginate(currentPage + 1); }}>
                                                                    <i className="fa fa-angle-right"></i>
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal fade in" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                <h4 className="modal-title">{modalMode === 'add' ? 'Add Email Template' : 'Edit Email Template'}</h4>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label>Title</label> <small className="req">*</small>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.title}
                                                    onChange={handleTitleChange}
                                                    required
                                                    style={{ border: '0', borderBottom: '1px solid #f4f4f4', background: 'transparent', boxShadow: 'none' }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                                <label>Attachment</label>
                                                <div
                                                    onClick={() => document.getElementById('file-upload').click()}
                                                    style={{
                                                        border: '1px solid #eee',
                                                        padding: '12px',
                                                        cursor: 'pointer',
                                                        background: '#fff',
                                                        marginTop: '5px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        color: '#999',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        multiple
                                                        onChange={(e) => setFormData(prev => ({ ...prev, files: Array.from(e.target.files) }))}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <i className="fa fa-cloud-upload" style={{ marginRight: '8px', fontSize: '16px' }}></i>
                                                    Drag and drop a file here or click
                                                </div>
                                                {formData.files.length > 0 && (
                                                    <div style={{ marginTop: '5px', fontSize: '11px', color: '#666' }}>
                                                        <i className="fa fa-paperclip"></i> {formData.files.map(f => f.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label>Message</label> <small className="req">*</small>
                                                <textarea
                                                    className="form-control"
                                                    rows="10"
                                                    value={formData.message}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                                    required
                                                    style={{ border: '1px solid #f4f4f4', boxShadow: 'none' }}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary pull-right">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default EmailTemplate;
