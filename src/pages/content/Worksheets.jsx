import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ContentSidebar from './ContentSidebar';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';
import { buildExportData } from '../../utils/tableExport';

const Worksheets = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';


    // Mock data based on worksheets.php structure
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);

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

    const filteredList = list.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const columns = [
        { key: 'content_title', label: 'Content Title' },
        { key: 'type', label: 'Type' },
        { key: 'date', label: 'Date' },
        { key: 'available_for', label: 'Available For' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const formatCell = (row, key) => {
        if (key === 'content_title') return row.title || '';
        if (key === 'type') return row.type || '';
        if (key === 'date') return row.date || '';
        if (key === 'available_for') return row.is_public === "Yes" ? "ALL Classes" : `${row.class} (${row.section_names})`;
        return '';
    };

    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);

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
                                    <div style={{ padding: '8px 10px', borderBottom: '1px solid #f4f4f4' }}>
                                        <TableToolbar
                                            searchTerm={searchTerm}
                                            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                            recordsPerPage={recordsPerPage}
                                            onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                            columns={columns}
                                            visibleColumns={visibleColumns}
                                            onToggleColumn={handleToggleColumn}
                                            getExportData={getExportData}
                                            exportFileName="Worksheets"
                                            exportTitle="Worksheets"
                                        />
                                    </div>
                                    <div className="mailbox-messages table-responsive overflow-visible">
                                        <div className="download_label">Worksheets</div>
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {visibleColumns.has('content_title') && <th>Content Title</th>}
                                                    {visibleColumns.has('type') && <th>Type</th>}
                                                    {visibleColumns.has('date') && <th>Date</th>}
                                                    {visibleColumns.has('available_for') && <th>Available For</th>}
                                                    <th className="text-right no-print noExport">Action</th>
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
                                                    currentItems.map((data) => (
                                                        <tr key={data.id}>
                                                            {visibleColumns.has('content_title') && <td className="mailbox-name">
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(data.id, data.title); }} className="detail_popover">{data.title}</a>
                                                                <div className="fee_detail_popover" style={{ display: 'block', fontSize: '12px', marginTop: '5px' }}>
                                                                    {data.note === "" || data.note === null ? (
                                                                        <p className="text text-danger">No Description</p>
                                                                    ) : (
                                                                        <p className="text text-info">{data.note}</p>
                                                                    )}
                                                                </div>
                                                            </td>}
                                                            {visibleColumns.has('type') && <td className="mailbox-name">
                                                                {data.type}
                                                            </td>}
                                                            {visibleColumns.has('date') && <td className="mailbox-name">
                                                                {data.date}
                                                            </td>}
                                                            {visibleColumns.has('available_for') && <td className="mailbox-name">
                                                                {data.is_public === "Yes" ? "ALL Classes" : `${data.class} (${data.section_names})`}
                                                            </td>}
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
                                    <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                        <Pagination 
                                            totalItems={totalItems} 
                                            itemsPerPage={recordsPerPage} 
                                            currentPage={currentPage}
                                            onPageChange={(page) => setCurrentPage(page)}
                                        />
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
