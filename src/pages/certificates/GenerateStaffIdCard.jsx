
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
import Pagination from '../../utils/Pagination';

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
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const allStaffColumns = [
        { key: 'employee_id', label: 'Staff ID', setting: 'enable_staff_id' },
        { key: 'full_name', label: 'Staff Name', setting: 'enable_name' },
        { key: 'designation', label: 'Designation', setting: 'enable_designation' },
        { key: 'department', label: 'Department', setting: 'enable_staff_department' },
        { key: 'father_name', label: 'Father Name', setting: 'enable_fathers_name' },
        { key: 'mother_name', label: 'Mother Name', setting: 'enable_mothers_name' },
        { key: 'date_of_joining', label: 'Date of Joining', setting: 'enable_date_of_joining' },
        { key: 'local_address', label: 'Address', setting: 'enable_permanent_address' },
        { key: 'contact_no', label: 'Phone', setting: 'enable_staff_phone' },
        { key: 'dob', label: 'Date of Birth', setting: 'enable_staff_dob' },
    ];

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    // Build dynamic columns based on idCardSettings visibility and manual hiddenColumns
    const getVisibleColumns = () => {
        return allStaffColumns.filter((col, index) => {
            const settingVisible = !idCardSettings || idCardSettings[col.setting] == 1;
            const manualVisible = !hiddenColumns.includes(index);
            return settingVisible && manualVisible;
        });
    };

    const getExportData = () => {
        const cols = getVisibleColumns();
        const filtered = staffList.filter(s =>
            ((s.name || '') + ' ' + (s.surname || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        const headers = cols.map(c => c.label);
        const rows = filtered.map(staff => cols.map(c => {
            if (c.key === 'full_name') return `${staff.name} ${staff.surname || ''}`;
            return String(staff[c.key] ?? '');
        }));
        return { headers, rows };
    };

    const [formData, setFormData] = useState({
        role_id: '',
        id_card: ''
    });

    const [searchedParams, setSearchedParams] = useState({
        role_id: '',
        id_card: ''
    });

    const [selectedStaff, setSelectedStaff] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredStaff = staffList.filter(s =>
        ((s.name || '') + ' ' + (s.surname || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, staffList?.length]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

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
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
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
                                                    <input
                                                        type="search"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="dt-buttons btn-group pull-right">
                                                    <button className="btn btn-default btn-sm dt-button buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                    <button className="btn btn-default btn-sm dt-button buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Staff_ID_Card_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm dt-button buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Staff_ID_Card_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm dt-button buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Staff_ID_Card_List.pdf', 'Staff ID Card List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm dt-button buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Staff ID Card List'); }}><i className="fa fa-print"></i></button>
                                                    <div className="btn-group">
                                                        <button className="btn btn-default btn-sm dt-button buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                            <i className="fa fa-columns"></i>
                                                        </button>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                {allStaffColumns.map((col, index) => {
                                                                    const settingVisible = !idCardSettings || idCardSettings[col.setting] == 1;
                                                                    if (!settingVisible) return null;
                                                                    return (
                                                                        <li key={index}><label style={{ fontWeight: 'normal', width: '100%', margin: 0, padding: '3px 20px', cursor: 'pointer' }}><input type="checkbox" checked={!hiddenColumns.includes(index)} onChange={() => toggleColumnVisibility(index)} style={{ marginRight: '10px' }} /> {col.label}</label></li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr>
                                                        <th className="text-center"><input type="checkbox" onChange={handleSelectAll} checked={staffList.length > 0 && selectedStaff.length === staffList.length} /></th>
                                                        {getVisibleColumns().map(col => <th key={col.key}>{col.label}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentData.length > 0 ? currentData.map(staff => (
                                                        <tr key={staff.id}>
                                                            <td className="text-center"><input type="checkbox" checked={selectedStaff.includes(staff.id)} onChange={() => handleSelectStaff(staff.id)} /></td>
                                                            {getVisibleColumns().map(col => {
                                                                if (col.key === 'full_name') {
                                                                    return (
                                                                        <td key={col.key}>
                                                                            <Link to={`/admin/staff/profile/${staff.id}`} style={{ color: '#000' }}>
                                                                                {staff.name} {staff.surname}
                                                                            </Link>
                                                                        </td>
                                                                    );
                                                                }
                                                                return <td key={col.key}>{staff[col.key] ?? ''}</td>;
                                                            })}
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={1 + getVisibleColumns().length} className="text-center text-danger">No Record Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="pt15 pb15 no-print">
                                            <Pagination
                                                totalItems={filteredStaff.length}
                                                itemsPerPage={itemsPerPage}
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
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
