import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';
import '../../utils/include_files';

const OnlineCourseCategory = () => {
    const navigate = useNavigate();

    // State
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ category_name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // UI State
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    // Column definitions
    const columns = [
        { key: 'category_name', label: 'Category' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const formatCell = (row, key) => {
        return row[key] || '-';
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, categories, formatCell);
    };

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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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
                .btn-primary { background-color:#9754ca; border-color: #9754ca; color: #fff; margin-top: 3px;border-radius: 20px !important; }
                .btn-sm { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 20px !important; }
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
                .dt-buttons.btn-group {
                    border: 1px solid #ccc;
                    border-radius: 20px;
                    padding: 0;
                    background: #f9f9f9;
                    display: inline-flex;
                    align-items: center;
                    overflow: visible;
                }
               .dt-buttons.btn-group > .btn:first-child { border-top-left-radius: 20px !important; border-bottom-left-radius: 20px !important; }
               .dt-buttons.btn-group > .btn:last-child,
                .dt-buttons.btn-group > .btn-group:last-child > .btn { border-top-right-radius: 20px !important; border-bottom-right-radius: 20px !important; }
                .dt-buttons.btn-group .btn {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 4px 10px !important;
                    border-right: 1px solid #ccc !important;
                    border-radius: 0 !important;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dt-buttons.btn-group .btn:last-child {
                    border-right: none !important;
                }
                .dt-buttons.btn-group .btn:hover {
                    background: #f0f0f0 !important;
                }
                .mailbox-messages input[type="search"] { border: none; border-bottom: 1px solid #ccc; box-shadow: none; border-radius: 0; outline: none;  margin-bottom: 12px;}
                .mailbox-messages input[type="search"]:focus { border-bottom: 1px solid #3c8dbc; }
                .req { color: red; }
                @media (max-width: 767px) {
                    .course-category-toolbar {
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        border-bottom: none !important;
                        gap: 5px !important;
                    }
                    .course-category-toolbar .al-search-col {
                        margin-bottom: 5px;
                    }
                    .course-category-toolbar .al-search-col,
                    .course-category-toolbar .al-btn-col {
                        display: flex !important;
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .course-category-toolbar .al-btn-col {
                        margin-bottom: 10px;
                    }
                        .mailbox-messages input[type="search"] {
                        margin-bottom: 0px;
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
                                <div className="box-header ptbnull" style={{ padding: '5px 5px 10px 10px' }}>
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
                                                <TableToolbar
                                                    searchTerm={searchTerm}
                                                    onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                                    recordsPerPage={recordsPerPage}
                                                    onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                                    columns={columns}
                                                    visibleColumns={visibleColumns}
                                                    onToggleColumn={toggleColumn}
                                                    getExportData={getExportData}
                                                    exportFileName="category_list"
                                                    exportTitle="Category List"
                                                />

                                                <div className="table-responsive overflow-visible" style={{ overflowX: 'auto' }}>
                                                    <table className="table table-striped table-bordered table-hover example">
                                                        <thead>
                                                            <tr>
                                                                {!visibleColumns.has('category_name') ? null : <th>Category</th>}
                                                                <th className="pull-right noExport">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {loading && categories.length === 0 ? (
                                                                <tr><td colSpan={visibleColumns.size + 1} className="text-center">Loading...</td></tr>
                                                            ) : currentItems.length > 0 ? (
                                                                currentItems.map((cat) => (
                                                                    <tr key={cat.id}>
                                                                        {!visibleColumns.has('category_name') ? null : <td>{cat.category_name}</td>}
                                                                        <td className="pull-right noExport">
                                                                            <Link to={`/admin/onlinecourse/list/${cat.id}`} className="btn btn-default btn-xs">
                                                                                <i className="fa fa-list"></i>
                                                                            </Link>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr><td colSpan={visibleColumns.size + 1} className="text-center">No data found</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                                    <Pagination
                                                        totalItems={totalItems}
                                                        itemsPerPage={safeRecordsPerPage}
                                                        currentPage={currentPage}
                                                        onPageChange={handlePageChange}
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
                <>
                    <div className="modal fade in" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-md" role="document">
                            <div className="modal-content modal-media-content">
                                <div className="modal-header modal-media-header">
                                    <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                    <h4 className="modal-title box-title">Category</h4>
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
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            {loading ? <><i className='fa fa-spinner fa-spin'></i> Saving</> : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}
        </div>
    );
};

export default OnlineCourseCategory;
