import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';

const SubjectGroupList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [classId, setClassId] = useState('');
    const [selectedSections, setSelectedSections] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [description, setDescription] = useState('');

    // Mock Data
    const [classList, setClassList] = useState([]);
    const [allSections, setAllSections] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [subjectGroupList, setSubjectGroupList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        // Mock Classes
        const mockClasses = [
            { id: 1, class: 'Class 1' },
            { id: 2, class: 'Class 2' },
            { id: 3, class: 'Class 3' },
        ];
        setClassList(mockClasses);

        // Mock Sections (linked to classes)
        const mockAllSections = [
            { id: 1, section: 'A', class_id: 1 },
            { id: 2, section: 'B', class_id: 1 },
            { id: 3, section: 'C', class_id: 2 },
            { id: 4, section: 'D', class_id: 2 },
            { id: 5, section: 'E', class_id: 3 },
            { id: 6, section: 'A', class_id: 3 },
        ];
        setAllSections(mockAllSections);

        // Mock Subjects
        const mockSubjects = [
            { id: 1, name: 'English' },
            { id: 2, name: 'Hindi' },
            { id: 3, name: 'Mathematics' },
            { id: 4, name: 'Science' },
            { id: 5, name: 'Social Studies' },
        ];
        setSubjectList(mockSubjects);

        // Mock Subject Groups (Existing Data)
        const mockSubjectGroups = [
            {
                id: 1,
                name: 'Class 1 General',
                description: 'General subjects for class 1',
                class_id: 1,
                class_name: 'Class 1',
                sections: [
                    { id: 1, section: 'A', class: 'Class 1' },
                    { id: 2, section: 'B', class: 'Class 1' }
                ],
                subjects: [
                    { id: 1, name: 'English' },
                    { id: 3, name: 'Mathematics' }
                ]
            },
            {
                id: 2,
                name: 'Class 2 Science Group',
                description: '',
                class_id: 2,
                class_name: 'Class 2',
                sections: [
                    { id: 3, section: 'C', class: 'Class 2' }
                ],
                subjects: [
                    { id: 4, name: 'Science' },
                    { id: 3, name: 'Mathematics' }
                ]
            }
        ];
        setSubjectGroupList(mockSubjectGroups);

    }, []);

    // Handle Edit Mode
    useEffect(() => {
        if (id && subjectGroupList.length > 0) {
            const groupToEdit = subjectGroupList.find(g => g.id === parseInt(id));
            if (groupToEdit) {
                setIsEditMode(true);
                setName(groupToEdit.name);
                setClassId(groupToEdit.class_id);
                setDescription(groupToEdit.description);

                // Set selections
                setSelectedSections(groupToEdit.sections.map(s => s.id));
                setSelectedSubjects(groupToEdit.subjects.map(s => s.id));
            }
        } else {
            setIsEditMode(false);
            setName('');
            setClassId('');
            setSelectedSections([]);
            setSelectedSubjects([]);
            setDescription('');
        }
    }, [id, subjectGroupList]);

    // Update available sections when class changes
    useEffect(() => {
        if (classId) {
            const sections = allSections.filter(s => s.class_id === parseInt(classId));
            setAvailableSections(sections);
        } else {
            setAvailableSections([]);
        }
    }, [classId, allSections]);


    const handleClassChange = (e) => {
        setClassId(e.target.value);
        setSelectedSections([]); // Reset sections when class changes
    };

    const handleSectionCheckboxChange = (sectionId) => {
        setSelectedSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(id => id !== sectionId);
            } else {
                return [...prev, sectionId];
            }
        });
    };

    const handleSubjectCheckboxChange = (subjectId) => {
        setSelectedSubjects(prev => {
            if (prev.includes(subjectId)) {
                return prev.filter(id => id !== subjectId);
            } else {
                return [...prev, subjectId];
            }
        });
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (!name) { alert('The Name field is required.'); return; }
        if (!classId) { alert('The Class field is required.'); return; }
        if (selectedSections.length === 0) { alert('The Section field is required.'); return; }
        if (selectedSubjects.length === 0) { alert('The Subject field is required.'); return; }

        const selectedClassObj = classList.find(c => c.id === parseInt(classId));
        const selectedSectionsObjs = allSections
            .filter(s => selectedSections.includes(s.id))
            .map(s => ({ ...s, class: selectedClassObj.class }));

        const selectedSubjectsObjs = subjectList
            .filter(s => selectedSubjects.includes(s.id));

        const newGroup = {
            id: isEditMode ? parseInt(id) : Date.now(),
            name: name,
            description: description,
            class_id: parseInt(classId),
            class_name: selectedClassObj.class,
            sections: selectedSectionsObjs,
            subjects: selectedSubjectsObjs
        };

        if (isEditMode) {
            setSubjectGroupList(prev => prev.map(g => g.id === newGroup.id ? newGroup : g));
            alert('Record Updated Successfully');
            navigate('/admin/subjectgroup');
        } else {
            setSubjectGroupList(prev => [...prev, newGroup]);
            alert('Record Saved Successfully');
            // Reset form
            setName('');
            setClassId('');
            setSelectedSections([]);
            setSelectedSubjects([]);
            setDescription('');
        }
    };

    const handleDelete = (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setSubjectGroupList(prev => prev.filter(g => g.id !== deleteId));
        }
    };

    const filteredList = subjectGroupList.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '655px', marginTop: '18px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Subject Group' : 'Add Subject Group'}</h3>
                                </div>
                                <form id="form1" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label><small className="req"> *</small>
                                            <input
                                                autoFocus
                                                type="text"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                            <span className="text-danger"></span>
                                        </div>
                                        <div className="form-group">
                                            <label>Class</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={classId}
                                                onChange={handleClassChange}
                                            >
                                                <option value="">Select</option>
                                                {classList.map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                ))}
                                            </select>
                                            <span className="text-danger"></span>
                                        </div>
                                        <div className="form-group">
                                            <label className="control-label">Sections</label><small className="req"> *</small>
                                            <div className="section_checkbox">
                                                {availableSections.length > 0 ? (
                                                    availableSections.map(sec => (
                                                        <div className="checkbox" key={sec.id}>
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    value={sec.id}
                                                                    checked={selectedSections.includes(sec.id)}
                                                                    onChange={() => handleSectionCheckboxChange(sec.id)}
                                                                />
                                                                {sec.section}
                                                            </label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div>No Section</div>
                                                )}
                                            </div>
                                            <span className="text-danger"></span>
                                        </div>
                                        <div className="form-group">
                                            <label>Subject</label><small className="req"> *</small>
                                            {subjectList.map(subj => (
                                                <div className="checkbox" key={subj.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            value={subj.id}
                                                            checked={selectedSubjects.includes(subj.id)}
                                                            onChange={() => handleSubjectCheckboxChange(subj.id)}
                                                        />
                                                        {subj.name}
                                                    </label>
                                                </div>
                                            ))}
                                            <span className="text-danger"></span>
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Enter ..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            ></textarea>
                                            <span className="text-danger"></span>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="col-md-8">
                            <div className="box box-primary" id="subject_list">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Subject Group List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages">
                                        <div className="download_label">Subject Group List</div>

                                        {/* Matches PHP layout for extra buttons if needed, though hidden for function here we keep structure */}
                                        <a className="btn btn-default btn-xs pull-right" title="Print" style={{ display: 'block' }}><i className="fa fa-print"></i></a>
                                        <a className="btn btn-default btn-xs pull-right" title="Export" style={{ display: 'block', marginRight: '5px' }}> <i className="fa fa-file-excel-o"></i> </a>

                                        <table className="table table-striped table-hover" id="headerTable">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th className="text-left">Class (Section)</th>
                                                    <th>Subject</th>
                                                    <th className="text-right no_print">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredList.map(group => (
                                                    <tr key={group.id}>
                                                        <td className="mailbox-name">
                                                            <a href="#" className="detail_popover">{group.name}</a>
                                                            <div className="fee_detail_popover" style={{ display: 'none' }}>
                                                                {group.description ? (
                                                                    <p className="text text-info">{group.description}</p>
                                                                ) : (
                                                                    <p className="text text-danger">No Description</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="text-left">
                                                            <ol>
                                                                {group.sections.map((sec, idx) => (
                                                                    <li key={idx}>{sec.class}({sec.section})</li>
                                                                ))}
                                                            </ol>
                                                        </td>
                                                        <td>
                                                            <table width="100%">
                                                                <tbody>
                                                                    {group.subjects.map((subj, idx) => (
                                                                        <tr key={idx}><td><div>{subj.name}</div></td></tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        <td className="mailbox-date pull-right no_print">
                                                            <Link to={`/admin/subjectgroup/edit/${group.id}`} className="btn btn-default btn-xs no_print displayinline" title="Edit">
                                                                <i className="fa fa-pencil"></i>
                                                            </Link>
                                                            <a
                                                                href="#"
                                                                className="btn btn-default btn-xs no_print displayinline"
                                                                title="Delete"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleDelete(group.id);
                                                                }}
                                                            >
                                                                <i className="fa fa-remove"></i>
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

export default SubjectGroupList;
