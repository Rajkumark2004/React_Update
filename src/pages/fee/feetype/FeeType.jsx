import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';

const FeeType = () => {
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const [feetypeList, setFeetypeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        code: '',
        description: ''
    });
    // Loading state for list fetch?
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeeTypeList();
    }, []);

    const fetchFeeTypeList = async () => {
        try {
            const response = await api.getFeeTypeList();
            // Assuming response is an array or has data property
            // user php: foreach ($feetypeList as $feetype)
            // api usually returns { status: true, data: [...] } or just [...]
            if (response && response.data) {
                setFeetypeList(response.data);
            } else if (Array.isArray(response)) {
                setFeetypeList(response);
            } else {
                setFeetypeList([]);
            }
        } catch (error) {
            console.error('Error fetching fee types:', error);
            toast.error('Failed to fetch fee types');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                name: formData.type
            };
            const response = await api.addFeeType(payload);
            if (response.status) {
                toast.success('Fee Type added successfully');
                setFormData({ type: '', code: '', description: '' });
                fetchFeeTypeList();
            } else {
                toast.error(response.message || 'Failed to add fee type');
            }
        } catch (error) {
            console.error('Error adding fee type:', error);
            toast.error(error.message || 'Failed to add fee type');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteFeeType(id);
                if (response.status) {
                    toast.success('Fee Type deleted successfully');
                    fetchFeeTypeList();
                } else {
                    toast.error(response.message || 'Failed to delete fee type');
                }
            } catch (error) {
                console.error('Error deleting fee type:', error);
                toast.error('Failed to delete fee type');
            }
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Fees Type : {sessionYear}</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label> <small className="req">*</small>
                                            <input
                                                autoFocus
                                                name="type"
                                                type="text"
                                                className="form-control"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Fees Code</label> <small className="req">*</small>
                                            <input
                                                name="code"
                                                type="text"
                                                className="form-control"
                                                value={formData.code}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={loading}>
                                            {loading ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Fees Type List : {sessionYear}</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Fees Type List</div>
                                    <div className="row mb-2" style={{ marginBottom: '10px' }}>
                                        <div className="col-sm-6">
                                            <div className="dataTables_filter pull-left">
                                                <label>Search:<input
                                                    type="search"
                                                    className="form-control input-sm"
                                                    placeholder=""
                                                    style={{ display: 'inline-block', width: 'auto', marginLeft: '0.5em' }}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                /></label>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="pull-right dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy">
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel">
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV">
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF">
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-print" onClick={() => window.print()} title="Print">
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns">
                                                    <i className="fa fa-columns"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Fees Code</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-center">
                                                            <i className="fa fa-spinner fa-spin"></i> Loading...
                                                        </td>
                                                    </tr>
                                                ) : feetypeList.length === 0 ? (
                                                    <tr><td colSpan="3" className="text-center">No data available in table</td></tr>
                                                ) : feetypeList
                                                    .filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                    .map((feetype) => (
                                                        <tr key={feetype.id}>
                                                            <td className="mailbox-name">
                                                                <span
                                                                    data-toggle="tooltip"
                                                                    title={feetype.description || 'No Description'}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {feetype.type}
                                                                </span>
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {feetype.code}
                                                            </td>
                                                            <td className="mailbox-date pull-right">
                                                                <Link
                                                                    to={`/admin/feetype/edit/${feetype.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => { e.preventDefault(); handleDelete(feetype.id); }}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Delete"
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-5">
                                            <div className="dataTables_info">
                                                Showing {feetypeList.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length)} of {feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length} entries
                                            </div>
                                        </div>
                                        <div className="col-sm-7">
                                            <div className="dataTables_paginate paging_simple_numbers">
                                                <ul className="pagination">
                                                    <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>Previous</a>
                                                    </li>
                                                    {Array.from({ length: Math.ceil(feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length / itemsPerPage) }, (_, i) => (
                                                        <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>{i + 1}</a>
                                                        </li>
                                                    ))}
                                                    <li className={`paginate_button next ${currentPage === Math.ceil(feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length / itemsPerPage) ? 'disabled' : ''}`}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < Math.ceil(feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length / itemsPerPage)) setCurrentPage(currentPage + 1); }}>Next</a>
                                                    </li>
                                                </ul>
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

export default FeeType;
