import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const SiblingModal = ({ isOpen, onClose, onAddSibling }) => {
    const [searchParams, setSearchParams] = useState({
        class_id: '',
        section_id: '',
        student_id: ''
    });
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    // Fetch classes and sections when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchDropdownData = async () => {
                try {
                    const classesRes = await api.getClasses();
                    if (classesRes && classesRes.status && classesRes.data) {
                        // Classes are in data.class_sections
                        if (classesRes.data.class_sections && Array.isArray(classesRes.data.class_sections)) {
                            setClasses(classesRes.data.class_sections);
                        }
                    }
                } catch (err) {
                    console.warn('Failed to fetch classes:', err);
                }

                try {
                    const sectionsRes = await api.getSections();
                    if (sectionsRes && sectionsRes.status && sectionsRes.data) {
                        setSections(sectionsRes.data);
                    }
                } catch (err) {
                    console.warn('Failed to fetch sections:', err);
                }
            };
            fetchDropdownData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCopy = () => {
        // In a real app, this would fetch the sibling's data and pass it back
        // For now, we'll just mock it or pass the selected ID
        onAddSibling(searchParams);
        onClose();
    };

    return (
        <>
            <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={onClose}>×</button>
                            <h4 className="modal-title">Sibling Matching</h4>
                        </div>
                        <div className="modal-body popup_details">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Class</label>
                                        <select className="form-control" value={searchParams.class_id} onChange={(e) => setSearchParams({ ...searchParams, class_id: e.target.value })}>
                                            <option value="">Select</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Section</label>
                                        <select className="form-control" value={searchParams.section_id} onChange={(e) => setSearchParams({ ...searchParams, section_id: e.target.value })}>
                                            <option value="">Select</option>
                                            {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.section}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Student</label>
                                        <select className="form-control" value={searchParams.student_id} onChange={(e) => setSearchParams({ ...searchParams, student_id: e.target.value })}>
                                            <option value="">Select</option>
                                            <option value="1">John Doe</option>
                                            <option value="2">Jane Smith</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={handleCopy}>Add</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade in"></div>
        </>
    );
};

export default SiblingModal;
