import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const SubjectEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('');

    // Subject Types (radio options)
    const [subjectTypes, setSubjectTypes] = useState([]);

    // Data States
    const [subjectList, setSubjectList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // If we have an ID, fetch specific details using new API
            if (id) {
                const data = await api.getSubjectDetails(id);
                if (data && (data.status === 'success' || data.status === true)) {
                    // Populate Form from data.data.subject
                    if (data.data && data.data.subject) {
                        const subject = data.data.subject;
                        setName(subject.name);
                        setCode(subject.code);
                        setType(subject.type);
                    }

                    // Populate List from data.data.subjectlist
                    if (data.data && data.data.subjectlist) {
                        setSubjectList(data.data.subjectlist);
                    }

                    // Populate Types from data.data.subject_types
                    if (data.data && data.data.subject_types) {
                        const typesArray = Object.entries(data.data.subject_types).map(([key, value]) => ({
                            key,
                            value
                        }));
                        setSubjectTypes(typesArray);
                    }
                } else {
                    toast.error(data.message || 'Failed to load subject details');
                }
            } else {
                // Fallback or "Add" mode behavior if this component is ever reused without ID
                // For now, consistent with previous logic or redirect
                toast.error('No Subject ID provided');
                navigate('/admin/subject');
            }
        } catch (error) {
            console.error('Error fetching subject data:', error);
            toast.error('Failed to load subject data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error('The Subject Name field is required.');
            return;
        }
        if (!type) {
            toast.error('The Subject Type field is required.');
            return;
        }

        const payload = {
            id: id,
            name: name,
            type: type,
            code: code
        };

        try {
            const response = await api.updateSubject(id, payload);
            if (response.status === 'success' || response.status === true) {
                toast.success('Record Updated Successfully');
                navigate('/admin/subject');
            } else {
                toast.error(response.message || 'Failed to update subject');
            }
        } catch (error) {
            console.error('Error updating subject:', error);
            toast.error('An error occurred while updating.');
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteSubject(deleteId);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Deleted Successfully');
                    fetchData(); // Refresh list
                    if (String(deleteId) === String(id)) {
                        navigate('/admin/subject'); // If deleted current edit item
                    }
                } else {
                    toast.error(response.message || 'Failed to delete subject');
                }
            } catch (error) {
                console.error('Error deleting subject:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const filteredList = subjectList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Academics
                    </h1>
                </section>
                <section className="content">
                    <div className="row">
                        {/* Edit Subject Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Subject</h3>
                                </div>
                                <form onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Subject Name</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                            <span className="text-danger"></span>
                                        </div>

                                        <div className="form-group">
                                            {subjectTypes.map((t) => (
                                                <label className="radio-inline" key={t.key}>
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={t.key}
                                                        checked={type === t.key}
                                                        onChange={(e) => setType(e.target.value)}
                                                    />
                                                    {t.value}
                                                </label>
                                            ))}
                                            <span className="text-danger"></span>
                                        </div>

                                        <div className="form-group">
                                            <br />
                                            <label>Subject Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
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

                        {/* Subject List Table - Right Panel */}
                        <div className="col-md-8">
                            <div className="box box-primary" id="sublist">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Subject List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate('/admin/subject')} className="btn btn-primary btn-xs" title="Back">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages">
                                        <div className="download_label">Subject List</div>
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th>Subject Code</th>
                                                    <th>Subject Type</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredList.map(subject => (
                                                    <tr key={subject.id}>
                                                        <td className="mailbox-name">{subject.name}</td>
                                                        <td className="mailbox-name">{subject.code}</td>
                                                        <td className="mailbox-name">
                                                            {subjectTypes.find(t => t.key === subject.type)?.value || subject.type}
                                                        </td>
                                                        <td className="mailbox-date pull-right no-print">
                                                            <Link
                                                                to={`/admin/subject/edit/${subject.id}`}
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
                                                                    handleDelete(subject.id);
                                                                }}
                                                            >
                                                                <i className="fa fa-remove"></i>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredList.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center">No Result Found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
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

export default SubjectEdit;
