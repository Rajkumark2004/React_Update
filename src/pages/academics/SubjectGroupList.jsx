import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

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
    const [availableSections, setAvailableSections] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [subjectGroupList, setSubjectGroupList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            let data;
            if (id) {
                data = await api.getSubjectGroupDetails(id);
            } else {
                data = await api.getSubjectGroupList();
            }

            if (data && (data.status === 'success' || data.status === true)) {
                // Common data mapping
                if (data.data) {
                    // For details response structure
                    const details = data.data;
                    setClassList(details.classlist || []);
                    setSubjectList(details.subjectlist || []);
                    // For list response structure (it matches generally but list might be under subjectgroupList)
                    // But for edit, we might primarily need the single group details to populate form
                    // The list on the right might still need all groups?
                    // The user said "when I click on edit, i need the fields in edit/id to be filled from this apis response"
                    // The list on the right typically shows all items. If getSubjectGroupDetails ONLY returns one item in `subjectgroup`, 
                    // then the list on the right might be empty or just show that one.
                    // However, often edit pages still show the full list. 
                    // If the user *only* wants to fill the form, we should probably fetch the List SEPARATELY if getSubjectGroupDetails doesn't return the full list.
                    // Looking at the response: "subjectgroup": [{...}] (array of 1).
                    // So if we use this data for `subjectGroupList` state, the table will only show 1 row.
                    // This is acceptable behavior for "details/edit" view usually, or we might need to fetch `getSubjectGroupList` AND `getSubjectGroupDetails` if we want the full list + details.
                    // Given the request focuses on "fields in edit/id to be filled", I'll prioritize populating the form.
                    // If the list becomes single-item, so be it, unless I see a reason to fetch both.
                    // Let's check `getSubjectGroupList` response again. It had `subjectgroupList`.
                    // This new response has `subjectgroup` inside `data`.

                    setSubjectGroupList(details.subjectgroup || (data.subjectgroupList || []));
                } else {
                    // Fallback for getSubjectGroupList standard response
                    setSubjectGroupList(data.subjectgroupList || []);
                    setClassList(data.classlist || []);
                    setSubjectList(data.subjectlist || []);
                }
            } else {
                toast.error(data.message || 'Failed to load initial data');
            }
        } catch (error) {
            console.error('Error fetching subject group data:', error);
            toast.error('Failed to load subject groups');
        } finally {
            setLoading(false);
        }
    };

    // Handle Edit Mode Population
    useEffect(() => {
        if (id && subjectGroupList.length > 0) {
            // Find the group related to this ID. 
            // Since we fetched specifically for this ID if (id) is present in fetchInitialData (mostly), 
            // the list might only contain this one, or if we fetched all, we find it.
            const groupToEdit = subjectGroupList.find(g => String(g.id) === String(id));

            if (groupToEdit) {
                setIsEditMode(true);
                setName(groupToEdit.name);
                setClassId(groupToEdit.class_id);
                setDescription(groupToEdit.description);

                // Set selections
                // The API response for details has `sections` array with `section_id`?
                // Looking at user provided response:
                // "sections": [ { ..., "class_id": "10", "section_id": "1", ... } ]
                // So yes, map `section_id`.

                const sectionIds = groupToEdit.sections ? groupToEdit.sections.map(s => String(s.section_id)) : [];

                // "group_subject": [ { ..., "subject_id": "1", ... } ]
                const subjectIds = groupToEdit.group_subject ? groupToEdit.group_subject.map(s => String(s.subject_id)) : [];

                setSelectedSections(sectionIds);
                setSelectedSubjects(subjectIds);

                // Fetch sections for the selected class to populate checkboxes
                if (groupToEdit.class_id) {
                    fetchSectionsForClass(groupToEdit.class_id);
                }
            }
        } else if (!id) {
            // Reset if no ID (Add Mode)
            setIsEditMode(false);
            setName('');
            setClassId('');
            setSelectedSections([]);
            setSelectedSubjects([]);
            setDescription('');
            setAvailableSections([]);
        }
    }, [id, subjectGroupList]); // Re-run when ID changes or list loads

    const fetchSectionsForClass = async (cId) => {
        try {
            const data = await api.getSectionsByClass(cId);
            if (data && (data.status === true || data.status === 'success')) {
                setAvailableSections(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleClassChange = async (e) => {
        const selectedId = e.target.value;
        setClassId(selectedId);
        setSelectedSections([]);
        setAvailableSections([]);

        if (selectedId) {
            fetchSectionsForClass(selectedId);
        }
    };

    const handleSectionCheckboxChange = (sectionId) => {
        setSelectedSections(prev => {
            const idStr = String(sectionId);
            if (prev.includes(idStr)) {
                return prev.filter(id => id !== idStr);
            } else {
                return [...prev, idStr];
            }
        });
    };

    const handleSubjectCheckboxChange = (subjectId) => {
        setSelectedSubjects(prev => {
            const idStr = String(subjectId);
            if (prev.includes(idStr)) {
                return prev.filter(id => id !== idStr);
            } else {
                return [...prev, idStr];
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name) { toast.error('The Name field is required.'); return; }
        if (!classId) { toast.error('The Class field is required.'); return; }
        if (selectedSections.length === 0) { toast.error('The Section field is required.'); return; }
        if (selectedSubjects.length === 0) { toast.error('The Subject field is required.'); return; }

        const payload = {
            name,
            class_id: classId,
            description: description,
            subject: selectedSubjects,
            sections: selectedSections
        };

        try {
            let response;
            if (isEditMode) {
                // payload.id = id; // Not needed in body if URL has it, checking requirement
                // User payload example does NOT have id in body.
                response = await api.editSubjectGroup(id, payload);
            } else {
                response = await api.addSubjectGroup(payload);
            }

            if (response.status === 'success' || response.status === true) {
                toast.success(isEditMode ? 'Record Updated Successfully' : 'Record Saved Successfully');
                if (isEditMode) {
                    navigate('/admin/subjectgroup');
                } else {
                    // Reset form
                    setName('');
                    setClassId('');
                    setSelectedSections([]);
                    setSelectedSubjects([]);
                    setDescription('');
                    setAvailableSections([]);
                }
                fetchInitialData();
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving subject group:', error);
            toast.error('An error occurred while saving');
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteSubjectGroup(deleteId);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Deleted Successfully');
                    fetchInitialData();
                } else {
                    toast.error(response.message || 'Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting subject group:', error);
                toast.error('An error occurred while deleting');
            }
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
                                                                    checked={selectedSections.includes(String(sec.id))}
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
                                                            checked={selectedSubjects.includes(String(subj.id))}
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
                                                            <ol className="p-0" style={{ paddingLeft: '15px' }}>
                                                                {group.sections && group.sections.map((sec, idx) => (
                                                                    <li key={idx}>{sec.class}({sec.section})</li>
                                                                ))}
                                                            </ol>
                                                        </td>
                                                        <td>
                                                            <table width="100%">
                                                                <tbody>
                                                                    {group.group_subject && group.group_subject.map((subj, idx) => (
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
