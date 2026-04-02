import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';

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

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const headers = ['Section'];

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(col => col !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const exportHeaders = headers.filter((_, i) => !hiddenColumns.includes(i));
        const exportRows = filteredList.map(item => {
            const rowData = [];
            if (!hiddenColumns.includes(0)) rowData.push(item.section);
            return rowData;
        });
        return { headers: exportHeaders, rows: exportRows };
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '655px', marginTop: '0px' }}>
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
                                                    <input
                                                        type="search"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{
                                                            border: 'none',
                                                            borderBottom: '1px solid #ccc',
                                                            outline: 'none',
                                                            padding: '5px 0',
                                                            background: 'transparent',
                                                            width: 'auto'
                                                        }}
                                                    />
                                                </div>
                                                <div className="dt-buttons btn-group">
                                                    <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><span><i className="fa fa-files-o"></i></span></a>
                                                    <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Section_List.csv'); }}><span><i className="fa fa-file-text-o"></i></span></a>
                                                    <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Section_List.xls'); }}><span><i className="fa fa-file-excel-o"></i></span></a>
                                                    <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Section_List.pdf'); }}><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                    <a className="btn btn-default buttons-print btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Section List'); }}><span><i className="fa fa-print"></i></span></a>
                                                    <div className="btn-group">
                                                        <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><span><i className="fa fa-columns"></i></span></a>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Section</label>
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {!hiddenColumns.includes(0) && <th>Section</th>}
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.map(section => (
                                                        <tr key={section.id}>
                                                            {!hiddenColumns.includes(0) && <td className="mailbox-name">{section.section}</td>}
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
