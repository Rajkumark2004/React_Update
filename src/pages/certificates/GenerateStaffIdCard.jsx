
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import StaffIdCard from '../../components/StaffIdCard';

const GenerateStaffIdCard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [roles, setRoles] = useState([]);
    const [idCards, setIdCards] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await api.getGenerateStaffIdCard();
            if (response.status && response.data) {
                setRoles(response.data.staffRolelist || []);
                setIdCards(response.data.idcardlist || []);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    // Mock Data for Staff List
    const [staffList, setStaffList] = useState([]);
    const [idCardSettings, setIdCardSettings] = useState(null); // Settings from generated ID card API hook
    const [searched, setSearched] = useState(false);
    const [generatedData, setGeneratedData] = useState(null); // To store data for PDF generation
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    // Build dynamic columns based on idCardSettings visibility
    const getVisibleColumns = () => {
        const cols = [];
        if (!idCardSettings || idCardSettings.enable_staff_id == 1) cols.push({ key: 'employee_id', label: 'Staff ID' });
        if (!idCardSettings || idCardSettings.enable_name == 1) cols.push({ key: 'full_name', label: 'Staff Name' });
        if (!idCardSettings || idCardSettings.enable_designation == 1) cols.push({ key: 'designation', label: 'Designation' });
        if (!idCardSettings || idCardSettings.enable_staff_department == 1) cols.push({ key: 'department', label: 'Department' });
        if (!idCardSettings || idCardSettings.enable_fathers_name == 1) cols.push({ key: 'father_name', label: 'Father Name' });
        if (!idCardSettings || idCardSettings.enable_mothers_name == 1) cols.push({ key: 'mother_name', label: 'Mother Name' });
        if (!idCardSettings || idCardSettings.enable_date_of_joining == 1) cols.push({ key: 'date_of_joining', label: 'Date of Joining' });
        if (!idCardSettings || idCardSettings.enable_permanent_address == 1) cols.push({ key: 'local_address', label: 'Address' });
        if (!idCardSettings || idCardSettings.enable_staff_phone == 1) cols.push({ key: 'contact_no', label: 'Phone' });
        if (!idCardSettings || idCardSettings.enable_staff_dob == 1) cols.push({ key: 'dob', label: 'Date of Birth' });
        return cols;
    };

    const getExportData = () => {
        const cols = getVisibleColumns();
        const filtered = staffList.filter(s =>
            (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const headers = cols.map(c => c.label);
        const rows = filtered.map(staff => cols.map(c => {
            if (c.key === 'full_name') return `${staff.name} ${staff.surname || ''}`;
            return String(staff[c.key] ?? '');
        }));
        return { headers, rows };
    };
    const mockStaffData = [
        { id: 101, employee_id: 'EMP001', name: 'James', surname: 'Wilson', role: 'Admin', designation: 'Teacher', department: 'Mathematics', father_name: 'Robert Wilson', mother_name: 'Mary Wilson', date_of_joining: '2022-01-10', local_address: '123 Street, City', contact_no: '9876543210', dob: '1990-05-15' },
        { id: 102, employee_id: 'EMP002', name: 'Sarah', surname: 'Johnson', role: 'Librarian', designation: 'Librarian', department: 'Library', father_name: 'David Johnson', mother_name: 'Linda Johnson', date_of_joining: '2021-11-20', local_address: '456 Lane, City', contact_no: '9876543211', dob: '1988-08-22' },
        { id: 103, employee_id: 'EMP003', name: 'Michael', surname: 'Brown', role: 'Accountant', designation: 'Accountant', department: 'Finance', father_name: 'William Brown', mother_name: 'Patricia Brown', date_of_joining: '2023-03-05', local_address: '789 Road, City', contact_no: '9876543212', dob: '1992-12-10' }
    ];

    const [formData, setFormData] = useState({
        role_id: '',
        id_card: ''
    });

    const [searchedParams, setSearchedParams] = useState({
        role_id: '',
        id_card: ''
    });

    const [selectedStaff, setSelectedStaff] = useState([]);

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
    const sessionYear = currentSession?.session || '2024-25';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchedParams({ ...formData });

        try {
            const data = await api.searchStaffForIdCard(formData.role_id, formData.id_card);
            if (data && data.status) {
                // Ensure array formats regardless if data wraps staffs / resultlist
                const returnedStaffs = data.data.staffs || data.data.resultlist || [];
                setStaffList(returnedStaffs);
                setIdCardSettings(data.data.id_card && data.data.id_card.length > 0 ? data.data.id_card[0] : null);
                setSearched(true);
            } else {
                setStaffList([]);
                setIdCardSettings(null);
                setSearched(true);
                // alert('No staff found');
            }

        } catch (error) {
            console.error("Error searching staff:", error);
            setStaffList([]);
            setIdCardSettings(null);
            setSearched(true);
        }
    };


    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStaff(staffList.map(s => s.id));
        } else {
            setSelectedStaff([]);
        }
    };

    const handleSelectStaff = (id) => {
        setSelectedStaff(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (selectedStaff.length === 0) {
            alert('No record selected');
            return;
        }

        setGeneratingPdf(true);
        try {
            const payload = {
                id_card: formData.id_card,
                data: selectedStaff.map(id => ({ staff_id: id }))
            };

            const response = await api.generateStaffIdCard(payload);
            if (response.status && response.data) {
                // Map API response to match what StaffIdCard component expects
                const mappedData = {
                    id_card: response.data.id_card && response.data.id_card.length > 0 ? response.data.id_card[0] : {},
                    staff: response.data.staffs || [],
                    sch_setting: response.data.sch_setting && response.data.sch_setting.length > 0 ? response.data.sch_setting[0] : {}
                };
                setGeneratedData(mappedData);
                // PDF generation triggering is handled by useEffect
            } else {
                alert(response.message || 'Failed to generate ID cards');
                setGeneratingPdf(false);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('An error occurred during generation');
            setGeneratingPdf(false);
        }
    };

    useEffect(() => {
        if (generatedData) {
            generatePDF();
        }
    }, [generatedData]);

    const generatePDF = async () => {
        setGeneratingPdf(true);
        // Wait for a moment to ensure new DOM elements are rendered
        await new Promise(resolve => setTimeout(resolve, 1000));

        const cards = document.getElementsByClassName('staff-id-card-print');
        if (!cards || cards.length === 0) {
            console.error("No cards found to print");
            setGeneratingPdf(false);
            return;
        }

        // Check for vertical card setting
        const isVertical = generatedData.id_card.enable_vertical_card === "1";
        const orientation = isVertical ? 'p' : 'l';

        const doc = new jsPDF(orientation, 'mm', 'a4');
        const pageWidth = isVertical ? 210 : 297;
        const pageHeight = isVertical ? 297 : 210;

        // Standard CR80 dimensions: 85.6mm x 53.98mm
        const cardWidth = isVertical ? 54 : 86;
        const cardHeight = isVertical ? 86 : 54;

        const marginX = 10;
        const marginY = 10;
        const gapX = 5;
        const gapY = 5;

        // Calculate columns and rows based on page size and card dimensions
        const cols = Math.floor((pageWidth - 2 * marginX) / (cardWidth + gapX));
        const rows = Math.floor((pageHeight - 2 * marginY) / (cardHeight + gapY));
        const itemsPerPage = cols * rows;

        for (let i = 0; i < cards.length; i++) {
            if (i > 0 && i % itemsPerPage === 0) {
                doc.addPage();
            }

            const card = cards[i];
            try {
                const canvas = await html2canvas(card, {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');

                const indexOnPage = i % itemsPerPage;
                const col = indexOnPage % cols;
                const row = Math.floor(indexOnPage / cols);

                const x = marginX + col * (cardWidth + gapX);
                const y = marginY + row * (cardHeight + gapY);

                doc.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);

            } catch (err) {
                console.error("Error processing card " + i, err);
            }
        }

        doc.save('staff_id_cards.pdf');

        setGeneratedData(null);
        setGeneratingPdf(false);
        alert("Staff ID Cards PDF generated successfully!");
    };

    return (
        <div className="wrapper" style={{ marginTop: '0px' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/generatestaffidcard" />

            <div className="content-wrapper" style={{ minHeight: '600px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-newspaper-o"></i> Certificate</h1>
                </section>
                <section className="content" style={{ minHeight: '608px' }}>
                    <div className="row">


                        {/* Search Criteria */}
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Role</label><small className="req" style={{ color: 'red' }}> *</small>
                                                    <select name="role_id" className="form-control" value={formData.role_id} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {roles.map(role => <option key={role.id} value={role.id}>{role.type}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>ID Card Template</label><small className="req" style={{ color: 'red' }}> *</small>
                                                    <select name="id_card" className="form-control" value={formData.id_card} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {idCards.map(card => <option key={card.id} value={card.id}>{card.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <button type="submit" className="btn btn-primary btn-sm pull-right"><i className="fa fa-search"></i> Search</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {searched && (
                                    <div className="box-body">
                                        <div style={{ borderTop: '1px solid #f4f4f4', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 className="box-title" style={{ fontSize: '20px' }}><i className="fa fa-users"></i> Staff List</h3>
                                            <button
                                                className="btn btn-info btn-sm printSelected pull-right"
                                                onClick={handleGenerate}
                                                title="Generate Certificate"
                                                disabled={generatingPdf}
                                            >
                                                {generatingPdf ? 'Generating...' : 'Generate'}
                                            </button>
                                        </div>

                                        <div className="row pb10">
                                            <div className="col-sm-6">
                                                <div className="pull-left">
                                                    <label style={{ fontWeight: 'normal' }}>Search:
                                                        <input
                                                            type="search"
                                                            className="form-control input-sm"
                                                            placeholder=""
                                                            style={{ display: 'inline-block', width: 'auto', marginLeft: '5px' }}
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="dt-buttons btn-group pull-right">
                                                    <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Staff_ID_Card_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Staff_ID_Card_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Staff_ID_Card_List.pdf', 'Staff ID Card List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Staff ID Card List'); }}><i className="fa fa-print"></i></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr>
                                                        <th className="text-center"><input type="checkbox" onChange={handleSelectAll} checked={staffList.length > 0 && selectedStaff.length === staffList.length} /></th>
                                                        {(!idCardSettings || idCardSettings.enable_staff_id == 1) && <th>Staff ID</th>}
                                                        {(!idCardSettings || idCardSettings.enable_name == 1) && <th>Staff Name</th>}
                                                        {(!idCardSettings || idCardSettings.enable_designation == 1) && <th>Designation</th>}
                                                        {(!idCardSettings || idCardSettings.enable_staff_department == 1) && <th>Department</th>}
                                                        {(!idCardSettings || idCardSettings.enable_fathers_name == 1) && <th>Father Name</th>}
                                                        {(!idCardSettings || idCardSettings.enable_mothers_name == 1) && <th>Mother Name</th>}
                                                        {(!idCardSettings || idCardSettings.enable_date_of_joining == 1) && <th>Date of Joining</th>}
                                                        {(!idCardSettings || idCardSettings.enable_permanent_address == 1) && <th>Address</th>}
                                                        {(!idCardSettings || idCardSettings.enable_staff_phone == 1) && <th>Phone</th>}
                                                        {(!idCardSettings || idCardSettings.enable_staff_dob == 1) && <th>Date of Birth</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).length > 0 ? staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).map(staff => (
                                                        <tr key={staff.id}>
                                                            <td className="text-center"><input type="checkbox" checked={selectedStaff.includes(staff.id)} onChange={() => handleSelectStaff(staff.id)} /></td>
                                                            {(!idCardSettings || idCardSettings.enable_staff_id == 1) && <td>{staff.employee_id}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_name == 1) && (
                                                                <td>
                                                                    <Link to={`/admin/staff/profile/${staff.id}`} style={{ color: '#000' }}>
                                                                        {staff.name} {staff.surname}
                                                                    </Link>
                                                                </td>
                                                            )}
                                                            {(!idCardSettings || idCardSettings.enable_designation == 1) && <td>{staff.designation}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_staff_department == 1) && <td>{staff.department}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_fathers_name == 1) && <td>{staff.father_name}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_mothers_name == 1) && <td>{staff.mother_name}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_date_of_joining == 1) && <td>{staff.date_of_joining}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_permanent_address == 1) && <td>{staff.local_address}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_staff_phone == 1) && <td>{staff.contact_no}</td>}
                                                            {(!idCardSettings || idCardSettings.enable_staff_dob == 1) && <td>{staff.dob}</td>}
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            {/* calculate dynamic colspan */}
                                                            <td colSpan={1 + [
                                                                !idCardSettings || idCardSettings.enable_staff_id == 1,
                                                                !idCardSettings || idCardSettings.enable_name == 1,
                                                                !idCardSettings || idCardSettings.enable_designation == 1,
                                                                !idCardSettings || idCardSettings.enable_staff_department == 1,
                                                                !idCardSettings || idCardSettings.enable_fathers_name == 1,
                                                                !idCardSettings || idCardSettings.enable_mothers_name == 1,
                                                                !idCardSettings || idCardSettings.enable_date_of_joining == 1,
                                                                !idCardSettings || idCardSettings.enable_permanent_address == 1,
                                                                !idCardSettings || idCardSettings.enable_staff_phone == 1,
                                                                !idCardSettings || idCardSettings.enable_staff_dob == 1,
                                                            ].filter(Boolean).length} className="text-center text-danger">No Record Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="row mt10">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info">
                                                    Records: 1 to {staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).length} of {staffList.filter(s =>
                                                        (s.name + ' ' + s.surname).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ).length}
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="pull-right">
                                                    <ul className="pagination pagination-sm" style={{ margin: 0 }}>
                                                        <li className="disabled"><span>&lt;</span></li>
                                                        <li className="active"><span>1</span></li>
                                                        <li className="disabled"><span>&gt;</span></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hidden Render Area for PDF Generation */}
                {generatedData && (
                    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                        {generatedData.staff.map((staff, index) => (
                            <div key={index} className="staff-id-card-print">
                                <StaffIdCard
                                    staff={staff}
                                    cardSettings={generatedData.id_card}
                                    schoolSettings={generatedData.sch_setting}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default GenerateStaffIdCard;
