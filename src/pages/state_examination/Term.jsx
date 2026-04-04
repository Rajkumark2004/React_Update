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
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '710px' }}>
                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Term List</h3>
                                    <div className="box-tools pull-right">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => { resetForm(); setShowModal(true); }}
                                        >
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                        <div className="btn-group pull-right mml15">
                                            <button onClick={() => window.history.back()} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        <style>
                                            {`
                                                @media (max-width: 767px) {
                                                    .mobile-stack {
                                                        display: flex;
                                                        flex-direction: column;
                                                        align-items: center;
                                                        gap: 15px;
                                                    }
                                                    .mobile-stack > div {
                                                        width: 100% !important;
                                                        text-align: center !important;
                                                    }
                                                    .mobile-stack .pull-right, .mobile-stack .pull-left {
                                                        float: none !important;
                                                    }
                                                    .mobile-stack .dt-buttons {
                                                        justify-content: center;
                                                    }
                                                }
                                            `}
                                        </style>
                                        <div className="row mobile-stack" style={{ marginBottom: '10px' }}>
                                            <div className="col-md-6 col-sm-12">
                                                <div className="pull-left" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
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
                                                    <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                        <i className="fa fa-files-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Term_List.xls'); }}>
                                                        <i className="fa fa-file-excel-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Term_List.csv'); }}>
                                                        <i className="fa fa-file-text-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Term_List.pdf', 'Term List'); }}>
                                                        <i className="fa fa-file-pdf-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Term List'); }}>
                                                        <i className="fa fa-print"></i>
                                                    </button>
                                                    <div className="btn-group">
                                                        <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                            <i className="fa fa-columns"></i>
                                                        </button>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Name</label>
                                                                </li>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Code</label>
                                                                </li>
                                                                <li>
                                                                    <label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Description</label>
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive overflow-visible-lg">
                                            <table className="table table-striped table-bordered table-hover term-list">
                                                <thead>
                                                    <tr>
                                                        {!hiddenColumns.includes(0) && <th>Name</th>}
                                                        {!hiddenColumns.includes(1) && <th>Code</th>}
                                                        {!hiddenColumns.includes(2) && <th>Description</th>}
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map(term => (
                                                        <tr key={term.id}>
                                                            {!hiddenColumns.includes(0) && <td className="mailbox-name">{term.name}</td>}
                                                            {!hiddenColumns.includes(1) && <td className="mailbox-name">{term.term_code}</td>}
                                                            {!hiddenColumns.includes(2) && <td className="mailbox-name">{term.description}</td>}
                                                            <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                                                <button
                                                                    className="btn btn-default btn-xs"
                                                                    title="Edit"
                                                                    onClick={() => handleEdit(term)}
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-default btn-xs"
                                                                    title="Delete"
                                                                    onClick={() => handleDelete(term.id)}
                                                                >
                                                                    <i className="fa fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {currentItems.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">No data found</td>
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
