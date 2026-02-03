import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const SectionList = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [sectionName, setSectionName] = useState('');

    // Data States
    const [sectionList, setSectionList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Initialize mock data
    useEffect(() => {
        const mockSections = [
            { id: 1, section: 'A' },
            { id: 2, section: 'B' },
            { id: 3, section: 'C' },
            { id: 4, section: 'D' },
            { id: 5, section: 'E' },
            { id: 6, section: 'F' },
        ];
        setSectionList(mockSections);
    }, []);

    // Handle Edit Mode
    useEffect(() => {
        if (id && sectionList.length > 0) {
            const sectionToEdit = sectionList.find(s => s.id === parseInt(id));
            if (sectionToEdit) {
                setIsEditMode(true);
                setSectionName(sectionToEdit.section);
            }
        } else {
            setIsEditMode(false);
            setSectionName('');
        }
    }, [id, sectionList]);

    const handleSave = (e) => {
        e.preventDefault();

        if (!sectionName) {
            alert('The Section Name field is required.');
            return;
        }

        const newSection = {
            id: isEditMode ? parseInt(id) : Date.now(),
            section: sectionName
        };

        if (isEditMode) {
            setSectionList(prev => prev.map(s => s.id === newSection.id ? newSection : s));
            alert('Record Updated Successfully');
            navigate('/admin/section');
        } else {
            setSectionList(prev => [...prev, newSection]);
            alert('Record Saved Successfully');
            // Reset form
            setSectionName('');
        }
    };

    const handleDelete = (deleteId) => {
        if (window.confirm('Section will also delete all students under this section so be careful as this action is irreversible.')) {
            setSectionList(prev => prev.filter(s => s.id !== deleteId));
        }
    };

    const filteredList = sectionList.filter(item =>
        item.section.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '655px', marginTop: '18px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Academics <small>Student Fees</small>
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Add/Edit Section Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Section' : 'Add Section'}</h3>
                                </div>
                                <form id="employeeform" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Section Name</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                id="section"
                                                name="section"
                                                type="text"
                                                className="form-control"
                                                placeholder=""
                                                value={sectionName}
                                                onChange={(e) => setSectionName(e.target.value)}
                                            />
                                            <span className="text-danger"></span>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Section List Table - Right Panel */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Section List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Section List</div>

                                        {/* DataTables Controls */}
                                        <div className="dataTables_wrapper no-footer">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                <div className="dataTables_filter" style={{ textAlign: 'left' }}>
                                                    <label>Search:
                                                        <input
                                                            type="search"
                                                            placeholder=""
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            style={{ marginLeft: '0.5em', display: 'inline-block', width: 'auto' }}
                                                        />
                                                    </label>
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

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        <th>Section</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map(section => (
                                                        <tr key={section.id}>
                                                            <td className="mailbox-name">{section.section}</td>
                                                            <td className="mailbox-date pull-right">
                                                                <Link
                                                                    to={`/admin/section/edit/${section.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a
                                                                    href="#"
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDelete(section.id);
                                                                    }}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filteredList.length === 0 && (
                                                        <tr>
                                                            <td colSpan="2" className="text-center">No Result Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>

                                            <div className="row">
                                                <div className="col-md-5">
                                                    <div className="dataTables_info">
                                                        Records: 1 to {filteredList.length} of {sectionList.length}
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
            <Footer />
        </div>
    );
};

export default SectionList;
