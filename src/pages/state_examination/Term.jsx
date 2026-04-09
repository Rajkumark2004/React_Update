import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import api from '../../services/api';
import { useSession } from '../../context/SessionContext';
import TableToolbar from '../../utils/TableToolbar';
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

    const tableColumns = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'description', label: 'Description' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(
        () => new Set(tableColumns.map(c => c.key))
    );

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const getExportData = () => {
        const visibleCols = tableColumns.filter(c => visibleColumns.has(c.key));
        const headers = visibleCols.map(c => c.label);

        const fieldMap = {
            name: t => t.name,
            code: t => t.term_code,
            description: t => t.description
        };

        const rows = filteredTerms.map(term =>
            visibleCols.map(c => String(fieldMap[c.key]?.(term) ?? ''))
        );

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
                                                .hide-scrollbar::-webkit-scrollbar {
                                                    display: none;
                                                }
                                                .hide-scrollbar {
                                                    -ms-overflow-style: none;
                                                    scrollbar-width: none;
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
                                                    .modal-body-responsive {
                                                        padding: 20px 20px 20px 20px !important;
                                                    }
                                                    .modal-header-responsive {
                                                        padding: 20px 20px 20px 20px !important;
                                                        border-bottom: none !important;
                                                    }
                                                    .modal-footer-responsive {
                                                        padding: 0px 20px 20px 20px !important;
                                                    }
                                                    .modal-dialog {
                                                        width: 95% !important;
                                                        margin: 10px auto !important;
                                                    }
                                                }
                                            `}
                                    </style>
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={tableColumns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="Term_List"
                                        exportTitle="Term List"
                                    />
                                    <div className="mailbox-messages" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        <table className="table no-margin" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                                                    {visibleColumns.has('name') && <th style={{ width: '20%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Name</th>}
                                                    {visibleColumns.has('code') && <th style={{ width: '20%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Code</th>}
                                                    {visibleColumns.has('description') && <th style={{ width: '50%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Description</th>}
                                                    <th style={{ width: '10%', fontWeight: '600', padding: '12px 8px', color: '#000', textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map(term => (
                                                    <tr key={term.id} className="hover-main-entry" style={{ borderBottom: '1px solid #f4f4f4', transition: 'background-color 0.2s' }}>
                                                        {visibleColumns.has('name') && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}><strong>{term.name}</strong></td>}
                                                        {visibleColumns.has('code') && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{term.term_code}</td>}
                                                        {visibleColumns.has('description') && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{term.description}</td>}
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
                <div className="modal fade in hide-scrollbar" style={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050, overflowY: 'auto' }}>
                    <div className="modal-dialog modal-dialog2 modal-md" style={{ margin: '30px auto' }}>
                        <div className="modal-content">
                            <div className="modal-header modal-header-responsive" style={{ background: '#7e3abd', color: 'white' }}>
                                <button type="button" className="close" onClick={() => setShowModal(false)} style={{ color: 'white', opacity: 1, marginRight: '20px' }}>&times;</button>
                                <h4 className="modal-title" style={{ color: 'white', fontWeight: 'bold' }}>{isEditing ? "Edit Term" : "Add Term"}</h4>
                            </div>
                            <form id="add_form" onSubmit={handleSubmit}>
                                <div className="modal-body modal-body-responsive" style={{ padding: '30px 20px 30px 40px' }}>
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
                                            style={{ resize: 'none' }}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer modal-footer-responsive" style={{ borderTop: 'none', paddingBottom: '20px' }}>
                                    <button type="submit" className="btn pull-right" style={{ backgroundColor: '#7e3abd', color: 'white', borderRadius: '20px', padding: '8px 25px', fontSize: '14px', fontWeight: 'bold', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
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
