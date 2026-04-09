import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { buildExportData } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';
import TableToolbar from '../../utils/TableToolbar';

const SectionList = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [sectionName, setSectionName] = useState('');

    // Data States
    const [sectionList, setSectionList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    // Fetch Initial Data
    useEffect(() => {
        const fetchSections = async () => {
            setLoading(true);
            try {
                const data = await api.getSections();
                if (data && data.status === 'success') {
                    setSectionList(data.sectionlist || []);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
                toast.error('Failed to load sections');
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, []);

    // Handle Edit Mode
    useEffect(() => {
        const fetchSectionDetails = async () => {
            if (id) {
                setLoading(true);
                try {
                    const data = await api.getSectionForEdit(id);
                    if (data && data.status === 'success') {
                        setIsEditMode(true);
                        setSectionName(data.section.section);
                    }
                } catch (error) {
                    console.error('Error fetching section details:', error);
                    toast.error('Failed to load section details');
                } finally {
                    setLoading(false);
                }
            } else {
                setIsEditMode(false);
                setSectionName('');
            }
        };
        fetchSectionDetails();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!sectionName) {
            toast.error('The Section Name field is required.');
            return;
        }

        try {
            if (isEditMode) {
                const payload = { section: sectionName };
                const response = await api.updateSection(id, payload);
                if (response.status === 'success') {
                    toast.success('Record Updated Successfully');
                    setSectionName('');
                    navigate('/admin/section');
                    // Refresh data
                    const data = await api.getSections();
                    if (data && data.status === 'success') {
                        setSectionList(data.sectionlist || []);
                    }
                }
            } else {
                // Add new
                const payload = { section: sectionName };
                const response = await api.addSection(payload);
                if (response.status === 'success') {
                    toast.success('Record Saved Successfully');
                    setSectionName('');
                    // Refresh data
                    const data = await api.getSections();
                    if (data && data.status === 'success') {
                        setSectionList(data.sectionlist || []);
                    }
                }
            }
        } catch (error) {
            console.error('Error saving section:', error);
            toast.error(error.message || 'Failed to save record');
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Section will also delete all students under this section so be careful as this action is irreversible.')) {
            try {
                const response = await api.deleteSection(deleteId);
                if (response.status === 'success') {
                    toast.success('Record Deleted Successfully');
                    // Refresh data
                    const data = await api.getSections();
                    if (data && data.status === 'success') {
                        setSectionList(data.sectionlist || []);
                    }
                    if (isEditMode && parseInt(id) === deleteId) {
                        navigate('/admin/section');
                    }
                }
            } catch (error) {
                console.error('Error deleting section:', error);
                toast.error(error.message || 'Failed to delete record');
            }
        }
    };

    const filteredList = sectionList.filter(item =>
        item.section.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const columns = [
        { key: 'section', label: 'Section' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const formatCell = (row, key) => row[key] || '-';

    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Academics
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Add/Edit Section Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Section' : 'Add Section'}</h3>
                                    <div className="btn-group pull-right visible-xs-block visible-sm-block">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
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
                                    <div className="btn-group pull-right hidden-xs hidden-sm">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                    <div className="box-body">
                                        <TableToolbar
                                            searchTerm={searchTerm}
                                            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                            recordsPerPage={recordsPerPage}
                                            onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                            columns={columns}
                                            visibleColumns={visibleColumns}
                                            onToggleColumn={toggleColumn}
                                            getExportData={getExportData}
                                            exportFileName="section_list"
                                            exportTitle="Section List"
                                        />

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <div className="download_label">Section List</div>
                                        <div className="dataTables_wrapper no-footer">
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {!visibleColumns.has('section') ? null : <th style={{ textAlign: 'left' }}>Section</th>}
                                                        <th style={{ textAlign: 'right' }} className="noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map(section => (
                                                        <tr key={section.id}>
                                                            {!visibleColumns.has('section') ? null : <td className="mailbox-name" style={{ textAlign: 'left' }}>{section.section}</td>}
                                                            <td style={{ textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
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
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {currentItems.length === 0 && (
                                                        <tr>
                                                            <td colSpan="2" className="text-center">No Result Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
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

export default SectionList;
