import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const OnlineCourseCategory = () => {
    const navigate = useNavigate();

    // State
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ category_name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    // Fetch Categories function
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.getOnlineCourseCategoryList();
            if (response && response.status && response.data && response.data.category_list) {
                setCategories(response.data.category_list);
            } else {
                setCategories([]);
                setError(response.message || 'Failed to fetch categories');
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError('An error occurred while fetching categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredCategories.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Category");

        const rows = filteredCategories.map(cat => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(cat.category_name);
            return row;
        });

        return { headers, rows };
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (newCategory.category_name.trim() === '') {
            setError('Category Name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.addOnlineCourseCategory(newCategory);
            if (response && (response.status === true || response.status === 'success')) {
                toast.success(response.message || 'Category added successfully');
                setNewCategory({ category_name: '' });
                setShowModal(false);
                setError(null);
                fetchCategories(); // Refresh the list
            } else {
                toast.error(response.message || 'Failed to add category');
            }
        } catch (err) {
            console.error("Error adding category:", err);
            toast.error('An error occurred while adding the category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Styling to match the PHP/AdminLTE look */}
            <style>{`
                .content-wrapper { min-height: 90vh; }
                .box-header .box-title { font-size: 18px; margin: 0; line-height: 1; }
                .box-header.ptbnull { padding-top: 0; padding-bottom: 0; }
                .box-title.titlefix { margin-top: 5px; }
                .pull-right { float: right!important; }
                .btn-primary { background-color: #337ab7; border-color: #2e6da4; color: #fff; }
                .btn-sm { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; }
                .table-striped>tbody>tr:nth-of-type(odd) { background-color: #f9f9f9; }
                .table-bordered { border: 1px solid #f4f4f4; }
                .noExport { display: block; } /* Basic utility */
                
                /* Modal Styling Overlay */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 1050;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding-top: 50px;
                }
                .modal-dialog {
                    width: 600px;
                    margin: 30px auto;
                    background: #fff;
                    border-radius: 6px;
                    box-shadow: 0 5px 15px rgba(0,0,0,.5);
                    position: relative;
                }
                .modal-header {
                    padding: 15px;
                    border-bottom: 1px solid #e5e5e5;
                }
                .modal-title { margin: 0; line-height: 1.42857143; font-size: 18px; font-weight: 500; }
                .modal-body { position: relative; padding: 15px; }
                .modal-footer {
                    padding: 15px;
                    text-align: right;
                    border-top: 1px solid #e5e5e5;
                }
                .close { float: right; font-size: 21px; font-weight: 700; line-height: 1; color: #000; text-shadow: 0 1px 0 #fff; opacity: .2; border: none; background: none; cursor: pointer; }
                .form-control {
                    display: block;
                    width: 100%;
                    height: 34px;
                    padding: 6px 12px;
                    font-size: 14px;
                    line-height: 1.42857143;
                    color: #555;
                    background-color: #fff;
                    background-image: none;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                .dt-buttons .btn { border: none; background: transparent; box-shadow: none; border-bottom: 1px solid #ccc; border-radius: 0; }
                .dt-buttons .btn:hover { background: #f0f0f0; }
                .mailbox-messages input[type="search"] { border: none; border-bottom: 1px solid #ccc; box-shadow: none; border-radius: 0; outline: none; }
                .mailbox-messages input[type="search"]:focus { border-bottom: 1px solid #3c8dbc; }
                .req { color: red; }
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
            `}</style>

            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="nav-tabs-custom theme-shadow box box-primary" style={{ marginTop: '0px' }}>
                                <div className="box-header ptbnull" style={{ padding: '10px' }}>
                                    <h3 className="box-title titlefix pt5">Online Course Category</h3>
                                    <div className="box-tools pull-right">
                                        <button className="btn btn-primary btn-sm question-btn" onClick={() => setShowModal(true)}>
                                            <i className="fa fa-plus"></i> Add Category
                                        </button>
                                    </div>
                                </div>
                                <div className="tab-content">
                                    <div className="tab-pane active" id="tab_1">
                                        <div className="box-body p0">
                                            <div className="mailbox-messages">
                                                <div className="row mobile-stack" style={{ marginBottom: '10px', padding: '10px' }}>
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
                                                        <div className="dt-buttons btn-group pull-right">
                                                            <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Category_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Category_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Category_List.pdf', 'Category List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Category List'); }}><i className="fa fa-print"></i></button>

                                                            <div className="btn-group">
                                                                <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                                    <i className="fa fa-columns"></i>
                                                                </button>
                                                                {showColumnsDropdown && (
                                                                    <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                        <li>
                                                                            <label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Category</label>
                                                                        </li>
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="table-responsive overflow-visible">
                                                    <table className="table table-striped table-bordered table-hover example">
                                                        <thead>
                                                            <tr>
                                                                {!hiddenColumns.includes(0) && <th>Category</th>}
                                                                <th className="pull-right noExport">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentItems.map((cat) => (
                                                                <tr key={cat.id}>
                                                                    {!hiddenColumns.includes(0) && <td>{cat.category_name}</td>}
                                                                    <td className="pull-right noExport">
                                                                        <Link to={`/admin/onlinecourse/list/${cat.id}`} className="btn btn-default btn-xs">
                                                                            <i className="fa fa-list"></i>
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {currentItems.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="2" className="text-center">No data found</td>
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
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
            <div className="control-sidebar-bg"></div>

            {/* Modal for Add Category */}
            {showModal && (
                <div className="modal-overlay" role="dialog" onClick={() => setShowModal(false)}>
                    <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                <h4 className="modal-title">Category</h4>
                            </div>
                            <form onSubmit={handleAddCategory}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label htmlFor="category_name">Category Name</label><small className="req"> *</small>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="category_name"
                                                    name="category_name"
                                                    value={newCategory.category_name}
                                                    onChange={(e) => setNewCategory({ ...newCategory, category_name: e.target.value })}
                                                />
                                                <span className="text text-danger">{error}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <><i className='fa fa-spinner fa-spin'></i> Saving</> : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineCourseCategory;
