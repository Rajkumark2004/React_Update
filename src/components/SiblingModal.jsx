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
    const [students, setStudents] = useState([]);

    // Fetch classes when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchDropdownData = async () => {
                try {
                    const response = await api.getStudentCreatePreData();
                    if (response && response.status === 'success' && response.data && Array.isArray(response.data.classlist)) {
                        setClasses(response.data.classlist);
                    }
                } catch (err) {
                    console.warn('Failed to fetch classes:', err);
                }
            };
            fetchDropdownData();
        }
    }, [isOpen]);

    const handleClassChange = async (e) => {
        const value = e.target.value;
        setSearchParams(prev => ({ ...prev, class_id: value, section_id: '' }));
        setSections([]);

        if (value) {
            try {
                const response = await api.getSectionsByClass(value);
                if (response && response.data) {
                    setSections(response.data);
                } else if (response && Array.isArray(response)) {
                    setSections(response);
                }
            } catch (error) {
                console.error('Error fetching sections by class:', error);
            }
        }
    };

    const handleSectionChange = async (e) => {
        const value = e.target.value;
        setSearchParams(prev => ({ ...prev, section_id: value, student_id: '' }));
        setStudents([]);

        if (value) {
            try {
                const response = await api.getStudentsByClassSection(value);
                if (response && response.data && response.data.student_list) {
                    setStudents(response.data.student_list);
                } else if (response && response.data && Array.isArray(response.data)) {
                    setStudents(response.data);
                } else {
                    setStudents([]);
                }
            } catch (error) {
                console.error('Error fetching students by class section:', error);
                setStudents([]);
            }
        }
    };

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
                                        <select className="form-control" value={searchParams.class_id} onChange={handleClassChange}>
                                            <option value="">Select</option>
                                            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Section</label>
                                        <select className="form-control" value={searchParams.section_id} onChange={handleSectionChange}>
                                            <option value="">Select</option>
                                            {sections.map(sec => <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label>Student</label>
                                        <select className="form-control" value={searchParams.student_id} onChange={(e) => setSearchParams({ ...searchParams, student_id: e.target.value })}>
                                            <option value="">Select</option>
                                            {students.map(student => (
                                                <option key={student.id} value={student.id}>
                                                    {student.firstname} {student.lastname}
                                                </option>
                                            ))}
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
