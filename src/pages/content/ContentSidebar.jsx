import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ContentSidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const isActive = (path) => currentPath === path;

    return (
        <div className="box box-primary">
            <div className="box-body box-profile">
                <h3 className="profile-username text-center">Download Center</h3>
                <ul className="list-group list-group-unbordered">
                    <li className="list-group-item">
                        <Link to="/admin/content/createcontent" className={isActive('/admin/content/createcontent') ? 'active' : ''} style={{ color: isActive('/admin/content/createcontent') ? '#444' : 'inherit', fontWeight: isActive('/admin/content/createcontent') ? 'bold' : 'normal' }}>
                            <i className="fa fa-upload" style={{ marginRight: '5px' }}></i> Upload Content
                        </Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/admin/content/assignment" className={isActive('/admin/content/assignment') ? 'active' : ''} style={{ color: isActive('/admin/content/assignment') ? '#444' : 'inherit', fontWeight: isActive('/admin/content/assignment') ? 'bold' : 'normal' }}>
                            <i className="fa fa-file-text-o" style={{ marginRight: '5px' }}></i> Assignments
                        </Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/admin/content/studymaterial" className={isActive('/admin/content/studymaterial') ? 'active' : ''} style={{ color: isActive('/admin/content/studymaterial') ? '#444' : 'inherit', fontWeight: isActive('/admin/content/studymaterial') ? 'bold' : 'normal' }}>
                            <i className="fa fa-file-text-o" style={{ marginRight: '5px' }}></i> Study Material
                        </Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/admin/content/syllabus" className={isActive('/admin/content/syllabus') ? 'active' : ''} style={{ color: isActive('/admin/content/syllabus') ? '#444' : 'inherit', fontWeight: isActive('/admin/content/syllabus') ? 'bold' : 'normal' }}>
                            <i className="fa fa-file-text-o" style={{ marginRight: '5px' }}></i> Syllabus
                        </Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/admin/content/other" className={isActive('/admin/content/other') ? 'active' : ''} style={{ color: isActive('/admin/content/other') ? '#444' : 'inherit', fontWeight: isActive('/admin/content/other') ? 'bold' : 'normal' }}>
                            <i className="fa fa-file-text-o" style={{ marginRight: '5px' }}></i> Other Downloads
                        </Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/admin/content/worksheets" className={isActive('/admin/content/worksheets') ? 'active' : ''} style={{ color: isActive('/admin/content/worksheets') ? '#444' : 'inherit', fontWeight: isActive('/admin/content/worksheets') ? 'bold' : 'normal' }}>
                            <i className="fa fa-file-text-o" style={{ marginRight: '5px' }}></i> Worksheets
                        </Link>
                    </li>
                    <li className="list-group-item">
                        <Link to="/admin/video_tutorial" className={isActive('/admin/video_tutorial') ? 'active' : ''} style={{ color: isActive('/admin/video_tutorial') ? '#444' : 'inherit', fontWeight: isActive('/admin/video_tutorial') ? 'bold' : 'normal' }}>
                            <i className="fa fa-video-camera" style={{ marginRight: '5px' }}></i> Video Tutorial
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ContentSidebar;
