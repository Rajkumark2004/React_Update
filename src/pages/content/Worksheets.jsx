import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ContentSidebar from './ContentSidebar';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';

const Worksheets = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';


    // Mock data based on worksheets.php structure
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.getWorksheets();
            setList(response.data || []);
        } catch (error) {
            console.error('Error fetching worksheets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id, title) => {
        try {
            await api.downloadContent(id, title);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download content');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this worksheet?')) {
            try {
                await api.deleteContent(id);
                fetchData();
                alert('Worksheet deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete worksheet: ' + error.message);
            }
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-download"></i> Download Center
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-3">
                            <ContentSidebar />
                        </div>
                        <div className="col-md-9">
                            <div className="box box-primary" id="other_download">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Worksheets</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-controls">
                                        <div className="pull-right">
                                        </div>
                                    </div>
                                    <div className="mailbox-messages table-responsive">
                                        <div className="download_label">Worksheets</div>
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Content Title</th>
                                                    <th>Type</th>
                                                    <th>Date</th>
                                                    <th>Available For</th>
                                                    <th className="text-right no-print">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">Loading...</td>
                                                    </tr>
                                                ) : list.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-danger">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    list.map((data) => (
                                                        <tr key={data.id}>
                                                            <td className="mailbox-name">
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(data.id, data.title); }} className="detail_popover">{data.title}</a>
                                                                <div className="fee_detail_popover" style={{ display: 'block', fontSize: '12px', marginTop: '5px' }}>
                                                                    {data.note === "" || data.note === null ? (
                                                                        <p className="text text-danger">No Description</p>
                                                                    ) : (
                                                                        <p className="text text-info">{data.note}</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {data.type}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {data.date}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {data.is_public === "Yes" ? "ALL Classes" : `${data.class} (${data.section_names})`}
                                                            </td>
                                                            <td className="mailbox-date pull-right no-print">
                                                                <a href="#" className="btn btn-default btn-xs" data-toggle="tooltip" title="Download" onClick={(e) => { e.preventDefault(); handleDownload(data.id, data.title); }}>
                                                                    <i className="fa fa-download"></i>
                                                                </a>
                                                                <a href={`/admin/content/edit/${data.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit" style={{ marginLeft: '5px' }}>
                                                                    <i className="fa fa-pencil"></i>
                                                                </a>
                                                                <a href="#" className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={(e) => { e.preventDefault(); handleDelete(data.id); }} style={{ marginLeft: '5px' }}>
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
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

export default Worksheets;
