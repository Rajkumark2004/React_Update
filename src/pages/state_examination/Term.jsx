import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import api from '../../services/api';
import { useSession } from '../../context/SessionContext';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const Term = () => {
    const { sessionYear } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        term_code: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);

    const [terms, setTerms] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getCBSETermList();
                if (response.status && response.data) {
                    setTerms(response.data);
                }
            } catch (error) {
                console.error("Error fetching term data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Name");
        if (!hiddenColumns.includes(1)) headers.push("Code");
        if (!hiddenColumns.includes(2)) headers.push("Description");

        const rows = filteredTerms.map(term => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(term.name);
            if (!hiddenColumns.includes(1)) row.push(term.term_code);
            if (!hiddenColumns.includes(2)) row.push(term.description);
            return row;
        });

        return { headers, rows };
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                term_code: formData.term_code,
                description: formData.description
            };

            if (isEditing) {
                payload.id = formData.id;
            }

            const response = await api.addCBSETerm(payload);
            if (response.status) {
                toast.success(response.message || (isEditing ? "Record Updated Successfully" : "Record Saved Successfully"));
                // Refresh the term list
                const listResponse = await api.getCBSETermList();
                if (listResponse.status && listResponse.data) {
                    setTerms(listResponse.data);
                }
                setShowModal(false);
                resetForm();
            } else {
                toast.error(response.message || "debug");
            }
        } catch (error) {
            console.error("Error saving term:", error);
            //toast.error("Failed to save record");
        }
    };

    const handleEdit = async (term) => {
        try {
            const response = await api.getCBSETermData(term.id);
            if (response.status && response.data) {
                setFormData({
                    id: response.data.id,
                    name: response.data.name,
                    term_code: response.data.term_code,
                    description: response.data.description || ''
                });
                setIsEditing(true);
                setShowModal(true);
            } else {
                toast.error("Failed to fetch term details");
            }
        } catch (error) {
            console.error("Error fetching term data:", error);
            toast.error("Failed to fetch term details");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const response = await api.deleteCBSETerm(id);
                if (response.status) {
                    toast.success("Record Removed Successfully");
                    // Refresh the term list
                    const listResponse = await api.getCBSETermList();
                    if (listResponse.status && listResponse.data) {
                        setTerms(listResponse.data);
                    }
                } else {
                    toast.error(response.message || "Failed to delete record");
                }
            } catch (error) {
                console.error("Error deleting term:", error);
                toast.error("Failed to delete record");
            }
        }
    };

    const resetForm = () => {
        setFormData({ id: '', name: '', term_code: '', description: '' });
        setIsEditing(false);
    };


    const filteredTerms = terms.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.term_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredTerms.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredTerms.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Term List</h3>
                                    <div className="box-tools pull-right">
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary"
                                                onClick={() => { resetForm(); setShowModal(true); }}
                                                style={{ borderRadius: '20px', padding: '5px 12px' }}
                                            >
                                                <i className="fa fa-plus"></i> Add
                                            </button>
                                            <button 
                                                onClick={() => window.history.back()} 
                                                className="btn btn-primary btn-sm"
                                                style={{ borderRadius: '20px', padding: '5px 12px' }}
                                            >
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-body">
                                        <style>
                                            {`
                                                .action-button-boxed {
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    width: 24px;
                                                    height: 24px;
                                                    background: #fff;
                                                    border: none;
                                                    cursor: pointer;
                                                    transition: all 0.2s;
                                                }
                                                .action-button-boxed:hover {
                                                    background: #f1f1f1;
                                                }
                                                .hover-main-entry:hover {
                                                    background-color: #fcfcfc !important;
                                                }
                                                @media (max-width: 767px) {
                                                    .mailbox-messages {
                                                        border: 1px solid #ddd;
                                                        border-radius: 4px;
                                                        margin-top: 10px;
                                                    }
                                                    .mobile-stack {
                                                        display: flex;
                                                        flex-direction: column;
                                                        align-items: center !important;
                                                        gap: 15px !important;
                                                        text-align: center !important;
                                                        width: 100% !important;
                                                        margin: 0 auto !important;
                                                    }
                                                    .mobile-stack > div {
                                                        width: 100% !important;
                                                        display: flex !important;
                                                        justify-content: center !important;
                                                        text-align: center !important;
                                                        margin-bottom: 5px;
                                                    }
                                                    .mobile-stack .pull-left,
                                                    .mobile-stack .pull-right {
                                                        float: none !important;
                                                        display: flex !important;
                                                        justify-content: center !important;
                                                        align-items: center !important;
                                                        margin: 0 auto !important;
                                                        width: 100% !important;
                                                    }
                                                    .mobile-table-header {
                                                        display: none;
                                                    }
                                                    .mailbox-messages table.table th {
                                                        background-color: #f9f9f9 !important;
                                                        border-bottom: 1px solid #eee !important;
                                                    }
                                                    .mailbox-messages table.table td {
                                                        border-left: none !important;
                                                        border-right: none !important;
                                                        border-bottom: 1px solid #eee !important;
                                                    }
                                                    .mailbox-messages table.table tr:last-child td {
                                                        border-bottom: none !important;
                                                    }
                                                }
                                            `}
                                        </style>
                                        <div style={{ padding: '10px 0' }}>
                                            <div className="row mobile-stack" style={{ marginBottom: '5px' }}>
                                                <div className="col-md-6 col-sm-12">
                                                    <div className="pull-left mb5" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                                        <div className="dataTables_length">
                                                            <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                                Records:
                                                                <select
                                                                    value={recordsPerPage}
                                                                    onChange={(e) => {
                                                                        setRecordsPerPage(Number(e.target.value));
                                                                        setCurrentPage(1);
                                                                    }}
                                                                    className="form-control input-sm"
                                                                    style={{ width: '80px', margin: '0 10px' }}
                                                                >
                                                                    <option value="10">10</option>
                                                                    <option value="25">25</option>
                                                                    <option value="50">50</option>
                                                                    <option value="100">100</option>
                                                                    <option value="-1">All</option>
                                                                </select>
                                                            </label>
                                                        </div>
                                                        <input
                                                            type="search"
                                                            placeholder="Search..."
                                                            value={searchTerm}
                                                            onChange={(e) => {
                                                                setSearchTerm(e.target.value);
                                                                setCurrentPage(1);
                                                            }}
                                                            style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6 col-sm-12">
                                                    <div className="pull-right dt-buttons btn-group">
                                                        <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                        <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Term_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                        <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Term_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                        <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Term_List.pdf', 'Term List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                                        <button className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Term List'); }}><i className="fa fa-print"></i></button>
                                                        <div className="btn-group">
                                                            <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><i className="fa fa-columns"></i></button>
                                                            {showColumnsDropdown && (
                                                                <div className="dt-button-collection" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '150px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                                    <label style={{ display: 'block', cursor: 'pointer', padding: '5px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left', margin: 0 }}>
                                                                        <input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} style={{ marginRight: '8px' }} /> Name
                                                                    </label>
                                                                    <label style={{ display: 'block', cursor: 'pointer', padding: '5px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left', margin: 0 }}>
                                                                        <input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} style={{ marginRight: '8px' }} /> Code
                                                                    </label>
                                                                    <label style={{ display: 'block', cursor: 'pointer', padding: '5px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left', margin: 0 }}>
                                                                        <input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} style={{ marginRight: '8px' }} /> Description
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mailbox-messages" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                            <table className="table no-margin" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                                                        {!hiddenColumns.includes(0) && <th style={{ width: '20%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Name</th>}
                                                        {!hiddenColumns.includes(1) && <th style={{ width: '20%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Code</th>}
                                                        {!hiddenColumns.includes(2) && <th style={{ width: '50%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Description</th>}
                                                        <th style={{ width: '10%', fontWeight: '600', padding: '12px 8px', color: '#000', textAlign: 'right' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map(term => (
                                                        <tr key={term.id} className="hover-main-entry" style={{ borderBottom: '1px solid #f4f4f4', transition: 'background-color 0.2s' }}>
                                                            {!hiddenColumns.includes(0) && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}><strong>{term.name}</strong></td>}
                                                            {!hiddenColumns.includes(1) && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{term.term_code}</td>}
                                                            {!hiddenColumns.includes(2) && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{term.description}</td>}
                                                            <td style={{ verticalAlign: 'top', textAlign: 'right', padding: '15px 8px', borderTop: 'none' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', whiteSpace: 'nowrap' }}>
                                                                    <div onClick={() => handleEdit(term)} className="action-button-boxed" title="Edit">
                                                                        <i className="fa fa-pencil" style={{ color: '#555', fontSize: '12px' }}></i>
                                                                    </div>
                                                                    <div onClick={() => handleDelete(term.id)} className="action-button-boxed" title="Delete">
                                                                        <i className="fa fa-remove" style={{ color: '#000', fontSize: '13px', fontWeight: 'bold' }}></i>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {currentItems.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="text-center" style={{ padding: '20px' }}>No data found</td>
                                                        </tr>
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

            {showModal && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                    <div className="modal-dialog modal-dialog2 modal-md">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                <h4 className="modal-title">{isEditing ? "Edit Term" : "Add Term"}</h4>
                            </div>
                            <form id="add_form" onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <input type="hidden" name="id" value={formData.id} />
                                    <div className="form-group">
                                        <label>Name</label><small className="req"> *</small>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Code</label><small className="req"> *</small>
                                        <input
                                            type="text"
                                            name="term_code"
                                            className="form-control"
                                            value={formData.term_code}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb0">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            cols="115"
                                            rows="3"
                                            className="form-control"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer clearboth">
                                    <button type="submit" className="btn btn-primary pull-right">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade in" onClick={() => setShowModal(false)}></div>}
            <Footer />
        </div>
    );
};

export default Term;
