import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OnlineCourseCategory = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ category_name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock User Data (similar to other pages)
    const [loggedInUser, setLoggedInUser] = useState(null);

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
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) { }
        }
        fetchCategories();
    }, []);

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const sessionYear = currentSession?.session || '2024-25';



    const handleLogout = async () => {
        try { await api.logout(); } catch (e) { }
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search triggered');
    };

    const handleExport = (type) => {
        if (type === 'Print') {
            window.print();
        } else {
            toast.success(`${type} export triggered (Simulation)`);
        }
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
        <div className="wrapper">
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
            `}</style>

            <Header appName="School Management System" userData={userData} pendingTasks={[]} handleLogout={handleLogout} />
            <Sidebar handleSearch={handleSearch} sessionYear={sessionYear} currentUrl="/admin/onlinecourse" />

            <div className="content-wrapper">
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="nav-tabs-custom theme-shadow box box-primary" style={{ marginTop: '20px' }}>
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
                                                <div style={{ padding: '10px', display: 'inline-block' }}>
                                                    <label>Search: <input type="search" className="form-control input-sm" placeholder="" aria-controls="example" style={{ display: 'inline-block', width: 'auto' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></label>
                                                </div>

                                                <div className="dt-buttons btn-group pull-right" style={{ padding: '10px', marginBottom: '10px' }}>
                                                    <button className="btn btn-default btn-sm" title="Copy" onClick={() => handleExport('Copy')}><i className="fa fa-copy"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Excel" onClick={() => handleExport('Excel')}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="CSV" onClick={() => handleExport('CSV')}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="PDF" onClick={() => handleExport('PDF')}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => handleExport('Print')}><i className="fa fa-print"></i></button>
                                                    <div className="btn-group">
                                                        <button className="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Columns">
                                                            <i className="fa fa-columns"></i>
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li><a href="#">Category</a></li>
                                                            <li><a href="#">Action</a></li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                <div className="table-responsive overflow-visible">
                                                    <table className="table table-striped table-bordered table-hover example">
                                                        <thead>
                                                            <tr>
                                                                <th>Category</th>
                                                                <th className="pull-right noExport">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredCategories.map((cat) => (
                                                                <tr key={cat.id}>
                                                                    <td>{cat.category_name}</td>
                                                                    <td className="pull-right noExport">
                                                                        <Link to={`/admin/onlinecourse/list/${cat.id}`} className="btn btn-default btn-xs">
                                                                            <i className="fa fa-list"></i>
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
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
                <div className="modal-overlay" role="dialog">
                    <div className="modal-dialog modal-md">
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
