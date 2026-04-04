import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import Pagination from '../../utils/Pagination';

const DisableReasonEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [results, setResults] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(10);

    const indexOfLastItem = currentPage * recordsPerPage;
    const indexOfFirstItem = indexOfLastItem - recordsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);
    const totalItems = results.length;

    // Responsive state
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch List for sidebar table
                const listResponse = await api.getDisableReasonsList();
                if (listResponse && listResponse.data) {
                    setResults(listResponse.data);
                } else if (Array.isArray(listResponse)) {
                    setResults(listResponse);
                }

                // Fetch Details for form
                const detailsResponse = await api.getDisableReasonDetails(id);
                if (detailsResponse.status && detailsResponse.data) {
                    // Map 'reason' from API to 'name' in form state
                    setFormData({ name: detailsResponse.data.reason });
                } else {
                    toast.error('Failed to load reason details');
                }

            } catch (error) {
                console.error("Error fetching data", error);
                toast.error("Error loading data");
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, [id]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.updateDisableReason(id, formData);
            if (response.status) {
                toast.success(response.message || 'Record Updated Successfully');
                navigate('/admin/disable-reason');
            } else {
                toast.error(response.error || 'Failed to update record');
            }
        } catch (error) {
            console.error('Error updating disable reason:', error);
            toast.error('An error occurred while updating');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteDisableReason(id);
                if (response.status) {
                    toast.success(response.message || 'Record Deleted Successfully');
                    // Remove from local list
                    setResults(results.filter(item => item.id !== id));
                } else {
                    toast.error(response.error || 'Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting disable reason:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    // Permissions (Mock)
    const canEdit = true;
    const canDelete = true;

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className={isMobile ? "col-xs-12" : "col-md-4"}>
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-users"></i> Edit Disable Reason</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label htmlFor="name">Disable Reason</label><small className="req"> *</small>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        className="form-control"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        disabled={pageLoading}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={loading}>Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Column */}
                        <div className={isMobile ? "col-xs-12" : "col-md-8"}>
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title"><i className="fa fa-users"></i> Disable Reason List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        {pageLoading ? <Loader /> : (
                                            <div className="table-responsive">
                                                <table className="table table-hover table-striped table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th>Disable Reason</th>
                                                            <th className="text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentItems.map((value) => (
                                                            <tr key={value.id}>
                                                                <td style={{ wordBreak: 'break-word' }}>{value.reason}</td>
                                                                <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                                                    {canEdit && (
                                                                        <Link
                                                                            to={`/admin/disable_reason/edit/${value.id}`}
                                                                            className="btn btn-default btn-xs"
                                                                            title="Edit"
                                                                            style={{ marginRight: '5px' }}
                                                                        >
                                                                            <i className="fa fa-pencil"></i>
                                                                        </Link>
                                                                    )}
                                                                    {canDelete && (
                                                                        <a
                                                                            href="#"
                                                                            className="btn btn-default btn-xs"
                                                                            title="Delete"
                                                                            onClick={(e) => { e.preventDefault(); handleDelete(value.id); }}
                                                                        >
                                                                            <i className="fa fa-remove"></i>
                                                                        </a>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {!pageLoading && totalItems > 0 && (
                                            <div className="pt15 pb15">
                                                <Pagination 
                                                    totalItems={totalItems} 
                                                    itemsPerPage={recordsPerPage} 
                                                    currentPage={currentPage}
                                                    onPageChange={(page) => setCurrentPage(page)}
                                                />
                                            </div>
                                        )}
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

export default DisableReasonEdit;
