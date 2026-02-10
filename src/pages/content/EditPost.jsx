import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ContentSidebar from './ContentSidebar';
import { useSession } from '../../context/SessionContext';

const EditPost = () => {
    const { id } = useParams();
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

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: ''
    });

    useEffect(() => {
        // Simulate fetching post data
        console.log('Fetching post for ID:', id);
        // Mock data
        setFormData({
            title: 'Mock Post Title',
            date: '2024-03-01',
            description: 'Mock post description'
        });
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Update Post', formData);
        alert('Post Updated Successfully (Mock)');
        navigate('/admin/content/createcontent');
    };

    return (
        <div className="wrapper">
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/content/editpost" />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1>
                        <i className="fa fa-pencil"></i> Edit Post
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
                                    <h3 className="box-title">Edit Post</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Post Title</label> <small className="req"> *</small>
                                            <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Date</label> <small className="req"> *</small>
                                            <input type="date" className="form-control" name="date" value={formData.date} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="5"></textarea>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default EditPost;
