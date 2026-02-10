import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ContentSidebar from './ContentSidebar';
import { useSession } from '../../context/SessionContext';

const Search = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([
        { title: 'Math Worksheet', type: 'Assignments', date: '2024-03-01', file: '#' },
        { title: 'Syllabus 2024', type: 'Syllabus', date: '2024-02-15', file: '#' }
    ]);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchTerm);
        // Simulate search filter
        // In a real app, this would make an API call or filter the list
    };

    return (
        <div className="wrapper">
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/content/search" />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1>
                        <i className="fa fa-search"></i> Search Content
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-3">
                            <ContentSidebar />
                        </div>
                        <div className="col-md-9">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Search</h3>
                                </div>
                                <div className="box-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Search By Title</label>
                                                    <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>&nbsp;</label>
                                                    <button type="submit" className="btn btn-primary btn-block">Search</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="box box-info">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Results</h3>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Type</th>
                                                    <th>Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.title}</td>
                                                        <td>{item.type}</td>
                                                        <td>{item.date}</td>
                                                        <td>
                                                            <a href={item.file} className="btn btn-default btn-xs" title="Download">
                                                                <i className="fa fa-download"></i>
                                                            </a>
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
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default Search;
