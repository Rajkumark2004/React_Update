import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import moment from "moment";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Loader from "../../components/Loader";
import { api } from "../../services/api";
import "../../utils/include_files";
import AttendanceGrid from "../../components/student/AttendanceGrid";

const StudentView = () => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00" || dateString === "0000-00-00 00:00:00") return "-";
    const m = moment(dateString, ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", "DD/MM/YYYY"], true);
    return m.isValid() ? m.format("DD/MM/YYYY") : dateString;
  };

  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("activity");
  const [student, setStudent] = useState(null);
  // Data State
  const [fees, setFees] = useState([]);
  const [cbseExams, setCbseExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [attendanceYears, setAttendanceYears] = useState([]);
  const [disableReasons, setDisableReasons] = useState([]);
  const [behaviouralNotes, setBehaviouralNotes] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [attendanceResult, setAttendanceResult] = useState({});
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  const [countAttendance, setCountAttendance] = useState({});
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
  const [siblings, setSiblings] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [studentDiscountFee, setStudentDiscountFee] = useState([]);
  const [feeTotals, setFeeTotals] = useState({
    totalAmount: 0,
    totalPaid: 0,
    totalDiscount: 0,
    totalFine: 0,
    totalBalance: 0,
    totalPenaltyFine: 0,
  });

  // Timeline Modal State
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineFormData, setTimelineFormData] = useState({
    id: null,
    title: "",
    date: new Date().toLocaleDateString("en-GB"),
    description: "",
    visible_check: true,
    file: null,
    document: "",
  });

  // Document Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docFormData, setDocFormData] = useState({
    first_title: "",
    first_doc: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disableFormData, setDisableFormData] = useState({
    reason: "",
    disable_date: new Date().toLocaleDateString("en-GB"), // DD/MM/YYYY format
    note: "",
  });
  const [submittingDisable, setSubmittingDisable] = useState(false);
  const [guardianCredential, setGuardianCredential] = useState(null);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);

  const loadStudentData = async (studentId) => {
    console.log("StudentView: Fetching data for student ID:", studentId);
    try {
      setLoading(true);
      const response = await api.getStudentView(studentId);
      console.log("StudentView: API response:", response);
      if (response.status && response.data) {
        setStudent(response.data.student);

        // Flatten student_due_fee and parse details
        const rawFees = response.data.student_due_fee || [];
        const flattenedFees = rawFees.reduce((acc, group) => {
          if (group.fees && Array.isArray(group.fees)) {
            const processedFees = group.fees.map((fee) => {
              let paid = 0;
              let discount = 0;
              let fine = 0;
              let balance = parseFloat(fee.amount);
              let paymentDetails = [];

              if (fee.amount_detail && fee.amount_detail !== "0") {
                try {
                  const details = JSON.parse(fee.amount_detail);
                  const detailArray = Array.isArray(details) ? details : Object.values(details);
                  detailArray.forEach((detail) => {
                    paid += parseFloat(detail.amount || 0);
                    discount += parseFloat(detail.amount_discount || 0);
                    fine += parseFloat(detail.amount_fine || 0);
                    paymentDetails.push(detail);
                  });
                } catch (e) {
                  console.error("Error parsing amount_detail", e);
                }
              }

              const currentDate = new Date();
              let penaltyFine = 0;
              if (fee.due_date && fee.due_date !== "0000-00-00") {
                const dueDate = new Date(fee.due_date);
                if (dueDate < currentDate) {
                  penaltyFine = parseFloat(fee.fine_amount || 0);
                }
              }

              let feeTypeBalance = parseFloat(fee.amount || 0) - (paid + discount);

              // Determine status including penalty fine
              let status = "Unpaid";
              if (feeTypeBalance + penaltyFine === 0) {
                status = "Paid";
              } else if (paymentDetails.length > 0) {
                status = "Partial";
              }

              const latestPayment =
                paymentDetails.length > 0
                  ? paymentDetails[paymentDetails.length - 1]
                  : {};

              return {
                ...fee,
                paid: paid.toFixed(2),
                discount: discount.toFixed(2),
                fine: fine.toFixed(2),
                penalty_fine: penaltyFine,
                balance: (feeTypeBalance + penaltyFine).toFixed(2),
                status: status,
                payment_id: latestPayment.inv_no ? `${fee.student_fees_deposite_id}/${latestPayment.inv_no}` : (latestPayment.id || "-"),
                payment_mode: latestPayment.payment_mode,
                payment_date: latestPayment.date,
                payment_details: paymentDetails,
              };
            });
            return [...acc, ...processedFees];
          }
          return acc;
        }, []);

        // Process Transport Fees
        const rawTransportFees = response.data.transport_fees || [];
        const processedTransportFees = rawTransportFees.map((fee) => {
          let paid = 0;
          let discount = 0;
          let fine = 0;
          let paymentDetails = [];

          if (fee.amount_detail && fee.amount_detail !== "0") {
            try {
              const details = JSON.parse(fee.amount_detail);
              const detailArray = Array.isArray(details) ? details : Object.values(details);
              detailArray.forEach((detail) => {
                paid += parseFloat(detail.amount || 0);
                discount += parseFloat(detail.amount_discount || 0);
                fine += parseFloat(detail.amount_fine || 0);
                paymentDetails.push(detail);
              });
            } catch (e) {
              console.error("Error parsing transport amount_detail", e);
            }
          }

          const currentDate = new Date();
          let penaltyFine = 0;
          if (fee.due_date && fee.due_date !== "0000-00-00") {
            const dueDate = new Date(fee.due_date);
            if (dueDate < currentDate) {
              penaltyFine = parseFloat(fee.fine_amount || 0);
            }
          }

          let feeTypeBalance = parseFloat(fee.fees || 0) - (paid + discount);

          let status = "Unpaid";
          if (feeTypeBalance + penaltyFine === 0) {
            status = "Paid";
          } else if (paymentDetails.length > 0) {
            status = "Partial";
          }

          const latestPayment =
            paymentDetails.length > 0
              ? paymentDetails[paymentDetails.length - 1]
              : {};

          return {
            id: `transport_${fee.id}`, // Unique ID
            name: `Transport Fee - ${fee.month}`,
            code: "TRP",
            due_date: fee.due_date,
            status: status,
            amount: fee.fees,
            payment_id: latestPayment.inv_no ? `${fee.student_fees_deposite_id || fee.id}/${latestPayment.inv_no}` : (latestPayment.id || "-"),
            student_fees_deposite_id: fee.student_fees_deposite_id || fee.id,
            payment_mode: latestPayment.payment_mode,
            payment_date: latestPayment.date,
            discount: discount.toFixed(2),
            fine: fine.toFixed(2),
            penalty_fine: penaltyFine,
            paid: paid.toFixed(2),
            balance: (feeTypeBalance + penaltyFine).toFixed(2),
            payment_details: paymentDetails,
          };
        });

        const allFees = [...flattenedFees, ...processedTransportFees];
        setFees(allFees);

        // Calculate Totals exactly as GetFees.jsx
        let totalAmount = 0;
        let totalPaid = 0;
        let totalDiscount = 0;
        let totalFine = 0;
        let totalBalance = 0;
        let totalPenaltyFine = 0;

        allFees.forEach(fee => {
          totalAmount += parseFloat(fee.amount || fee.fees || 0);
          totalPaid += parseFloat(fee.paid || 0);
          totalDiscount += parseFloat(fee.discount || 0);
          totalFine += parseFloat(fee.fine || 0);
          totalBalance += parseFloat(fee.balance || 0);
          totalPenaltyFine += fee.penalty_fine || 0;
        });

        setFeeTotals({
          totalAmount,
          totalPaid,
          totalDiscount,
          totalFine,
          totalBalance,
          totalPenaltyFine
        });

        // Currency Symbol
        if (response.data.sch_setting && response.data.sch_setting.currency_symbol) {
          setCurrencySymbol(response.data.sch_setting.currency_symbol);
        }

        setStudentDiscountFee(response.data.student_discount_fee || []);
        setCbseExams(response.data.cbse_exams || []);
        setExamResults(response.data.exam_result || []);
        setDocuments(response.data.student_documents || []);
        setTimeline(response.data.timeline || []);
        setAttendanceYears(response.data.attendance_years || []);
        if (response.data.attendance_years && response.data.attendance_years.length > 0) {
          setAttendanceYear(response.data.attendance_years[0].year);
        }
        setAttendanceTypes(response.data.attendance_types || []);
        setCountAttendance(response.data.countAttendance || {});
        setAttendanceResult(response.data.date_wise_attendance_data || {});
        setBehaviouralNotes(response.data.behavioural_note || []);
        setGuardianCredential(response.data.guardian_credential || null);
        setCategoryList(response.data.category_list || []);
        setSiblings(response.data.siblings || []);
        console.log("StudentView: Siblings loaded:", response.data.siblings);
      } else {
        setError("Failed to load student data");
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      setError(err.message || "Error loading student data");
    } finally {
      setLoading(false);
    }
  };

  // Timeline Handlers
  const handleAddTimeline = () => {
    setTimelineFormData({
      id: null,
      title: "",
      date: new Date().toLocaleDateString("en-GB"),
      description: "",
      visible_check: true,
      file: null,
      document: "",
    });
    setTimelineModalOpen(true);
  };

  const handleEditTimeline = async (timelineId) => {
    try {
      const response = await api.getStudentSingleTimeline(timelineId);
      if (response && response.status === 'success' || response.status === true) {
        const data = response.data;
        setTimelineFormData({
          id: data.id,
          title: data.title || "",
          date: data.timeline_date ? moment(data.timeline_date).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"),
          description: data.description || "",
          visible_check: data.status === 'yes',
          file: null, // Do not prefill file
          document: data.document || "",
        });
        setTimelineModalOpen(true);
      } else {
        toast.error("Failed to load timeline details");
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
      toast.error(error.message || "Failed to fetch timeline details");
    }
  };

  const handleTimelineSubmit = async (e) => {
    e.preventDefault();

    try {
      if (timelineFormData.id) {
        // Edit Mode: Send FormData
        const formData = new FormData();
        formData.append("id", timelineFormData.id);
        formData.append("student_id", student.id);
        formData.append("timeline_title", timelineFormData.title || "");
        formData.append("timeline_desc", timelineFormData.description || "");
        formData.append("timeline_date", moment(timelineFormData.date, ["DD/MM/YYYY", "YYYY-MM-DD", "D/M/YYYY"]).format("DD/MM/YYYY"));

        if (timelineFormData.visible_check) {
          formData.append("visible_check", "yes");
        }

        if (timelineFormData.file) {
          formData.append("timeline_doc", timelineFormData.file);
        } else {
          formData.append("timeline_doc", "");
        }

        console.log("Timeline Edit Submit (FormData):");
        await api.editTimeline(formData);
        toast.success("Timeline updated successfully");
      } else {
        // Add Mode: Send FormData
        const formData = new FormData();
        formData.append("student_id", student.id);
        formData.append("timeline_title", timelineFormData.title || "");
        formData.append("timeline_desc", timelineFormData.description || "");
        formData.append("timeline_date", moment(timelineFormData.date, ["DD/MM/YYYY", "YYYY-MM-DD", "D/M/YYYY"]).format("DD/MM/YYYY"));
        // PHP checkbox: only append visible_check when checked (present = yes, absent = no)
        if (timelineFormData.visible_check) {
          formData.append("visible_check", "yes");
        }

        if (timelineFormData.file) {
          formData.append("timeline_doc", timelineFormData.file);
        } else {
          formData.append("timeline_doc", "");
        }

        console.log("Timeline Add Submit (FormData):");
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }

        await api.addTimeline(formData);
        toast.success("Timeline added successfully");
      }
      setTimelineModalOpen(false);
      loadStudentData(id); // Reload data
    } catch (error) {
      console.error("Error saving timeline:", error);
      toast.error(error.message || "Failed to save timeline");
    }
  };

  const handleDeleteTimeline = async (timelineId) => {
    if (window.confirm("Are you sure you want to delete this timeline?")) {
      try {
        await api.deleteTimeline(timelineId);
        toast.success("Timeline deleted successfully");
        loadStudentData(id);
      } catch (error) {
        console.error("Error deleting timeline:", error);
        toast.error(error.message || "Failed to delete timeline");
      }
    }
  };

  // Document Handlers
  const handleUploadDocument = () => {
    setDocFormData({
      first_title: "",
      first_doc: null,
    });
    setDocModalOpen(true);
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("student_id", student.id);
    formData.append("first_title", docFormData.first_title);
    if (docFormData.first_doc) {
      formData.append("first_doc", docFormData.first_doc);
    } else {
      alert("Please select a file");
      return;
    }

    try {
      await api.addDocument(formData);
      toast.success("Document uploaded successfully");
      setDocModalOpen(false);
      loadStudentData(id);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await api.deleteDocument(docId, student.id);
        toast.success("Document deleted successfully");
        loadStudentData(id);
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error(error.message || "Failed to delete document");
        loadStudentData(id);
      }
    }
  };

  const handleDisableClick = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to disable this student?")) {
      setDisableModalOpen(true);
      if (disableReasons.length === 0) {
        try {
          const response = await api.getDisableReasonsList();
          if (response && response.data) {
            setDisableReasons(response.data);
          }
        } catch (err) {
          console.error("Error fetching disable reasons", err);
        }
      }
    }
  };

  const handleDisableSubmit = async (e) => {
    e.preventDefault();

    if (!disableFormData.reason) {
      alert("The Reason field is required.");
      return;
    }

    setSubmittingDisable(true);
    try {
      const response = await api.disableStudent({
        reason: disableFormData.reason,
        disable_date: disableFormData.disable_date,
        student_id: student.id,
      });

      if (response.status === "success" || response.status === true) {
        alert("Record Saved Successfully");
        setDisableModalOpen(false);
        // Refresh data
        loadStudentData(id);
      } else {
        alert(response.message || "Failed to disable student");
      }
    } catch (error) {
      console.error("Error disabling student:", error);
      alert("An error occurred while disabling the student.");
    } finally {
      setSubmittingDisable(false);
    }
  };

  const handleEnableStudent = async (e) => {
    e.preventDefault();
    const studentName = [student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ');
    if (!window.confirm(`Are you sure you want to enable student "${studentName}"?`)) {
      return;
    }
    try {
      const response = await api.enableStudent(student.id);
      if (response.status === 'success' || response.status === true) {
        toast.success(response.message || 'Student enabled successfully');
        loadStudentData(id);
      } else {
        toast.error(response.message || 'Failed to enable student');
      }
    } catch (error) {
      console.error('Enable student error:', error);
      toast.error(error.message || 'Failed to enable student');
    }
  };

  useEffect(() => {
    loadStudentData(id);
  }, [id]);

  useEffect(() => {
    if (timelineModalOpen || docModalOpen) {
      // Initialize Dropify after a short delay to ensure modal DOM is ready
      const timer = setTimeout(() => {
        if (window.$ && $.fn.dropify) {
          $(".dropify").dropify();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [timelineModalOpen, docModalOpen]);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (imagePath && imagePath !== "") {
      return `https://newlayout.wisibles.com/${imagePath}`;
    }
    // Default to yellow profile pic as requested (specific URL update)
    return "https://newlayout.wisibles.com/uploads/student_images/default_male.jpg?1769064211";
  };

  const isDisabled = student?.is_active === "no";

  if (loading) {
    return (
      <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Sidebar />
        <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
          <section className="content">
            <Loader />
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Sidebar />
        <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
          <section className="content">
            <div className="alert alert-danger" style={{ margin: "20px" }}>
              {error || "Student not found"}
            </div>
            <Link
              to="/student/search"
              className="btn btn-primary"
              style={{ marginLeft: "20px" }}
            >
              <i className="fa fa-arrow-left"></i> Back to Search
            </Link>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .timeline:before {
          background-color: #0073b7 !important;
          left: 42px !important;
        }
      `}</style>
      <Header />
      <Sidebar />
      <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
        <section className="content">
          <div className="row">
            {/* Left Sidebar - Profile Card */}
            <div className="col-lg-3 col-md-3 col-sm-12">
              {/* Profile Card */}
              <div
                className="box box-primary"
                style={isDisabled ? { backgroundColor: "#f0dddd" } : {}}
              >
                <div className="box box-widget widget-user-2 mb0">
                  <div className="widget-user-header bg-gray-light overflow-hidden">
                    <div className="widget-user-image">
                      <img
                        className="profile-user-img img-responsive img-rounded"
                        src={getImageUrl(student.image)}
                        alt="User profile picture"
                      />
                    </div>
                    <h3 className="widget-user-username">
                      {student.firstname} {student.middlename}{" "}
                      {student.lastname}
                    </h3>
                    <h5 className="widget-user-desc mb5">
                      Admission No{" "}
                      <span className="text-aqua">{student.admission_no}</span>
                    </h5>
                    <h5 className="widget-user-desc">
                      Roll Number{" "}
                      <span className="text-aqua">{student.roll_no}</span>
                    </h5>
                  </div>
                </div>

                <div className="box-body box-profile pt0">
                  <ul className="list-group list-group-unbordered">
                    {isDisabled && (
                      <>
                        <li className="list-group-item listnoback">
                          <b>Disable Reason</b>
                          <span className="pull-right text-aqua">
                            {student.disable_reason}
                          </span>
                        </li>
                        <li className="list-group-item listnoback">
                          <b>Disable Note</b>
                          <span className="pull-right text-aqua">
                            {student.dis_note}
                          </span>
                        </li>
                        <li className="list-group-item listnoback">
                          <b>Disable Date</b>
                          <span className="pull-right text-aqua">
                            {formatDate(student.disable_at)}
                          </span>
                        </li>
                      </>
                    )}
                    <li className="list-group-item listnoback border0">
                      <b>Class</b>
                      <a className="pull-right text-aqua">
                        {student.class} ({student.section})
                      </a>
                    </li>
                    <li className="list-group-item listnoback">
                      <b>Section</b>
                      <a className="pull-right text-aqua">{student.section}</a>
                    </li>
                    <li className="list-group-item listnoback">
                      <b>RTE</b>
                      <a className="pull-right text-aqua">
                        {student.rte}
                      </a>
                    </li>
                    <li className="list-group-item listnoback">
                      <b>Gender</b>
                      <a className="pull-right text-aqua">
                        {student.gender}
                      </a>
                    </li>
                    {/* Barcode */}
                    {student.admission_no && (
                      <li className="list-group-item listnoback">
                        <b>Barcode</b>
                        <a className="pull-right text-aqua">
                          <img
                            className="h-36"
                            src={`https://newlayout.wisibles.com/uploads/student_id_card/barcodes/${student.admission_no}.png`}
                            alt="Barcode"
                            style={{ height: "36px", width: "auto" }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </a>
                      </li>
                    )}
                    {student.total_points && (
                      <li className="list-group-item listnoback">
                        <b>Behaviour Score</b>
                        <a className="pull-right text-aqua">
                          {student.total_points}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Siblings Box */}
              {console.log("Rendering Sibling section, siblings count:", siblings.length)}
              {siblings && siblings.length > 0 && (
                <div className="box box-primary">
                  <div className="box-header with-border">
                    <h3 className="box-title">Sibling</h3>
                  </div>
                  <div className="box-body">
                    {siblings.map((sibling, index) => (
                      <div key={index} className="mb20" style={{ borderBottom: index < siblings.length - 1 ? '1px solid #f4f4f4' : 'none', paddingBottom: '10px' }}>
                        <div className="widget-user-2">
                          <div className="widget-user-header bg-gray-light overflow-hidden">
                            <div className="widget-user-image">
                              <img
                                className="profile-user-img img-responsive img-rounded"
                                src={getImageUrl(sibling.image)}
                                alt="Sibling"
                              />
                            </div>
                            <h4 className="widget-user-username">
                              <Link to={`/student/view/${sibling.id}`}>
                                {sibling.firstname} {sibling.lastname}
                              </Link>
                            </h4>
                            <h5 className="widget-user-desc mb5">
                              Admission No{" "}
                              <span className="text-aqua">
                                {sibling.admission_no}
                              </span>
                            </h5>
                            <h5 className="widget-user-desc">
                              Roll Number{" "}
                              <span className="text-aqua">{sibling.roll_no || "-"}</span>
                            </h5>
                          </div>
                          <div className="box-body no-padding">
                            <ul className="list-group list-group-unbordered">
                              <li className="list-group-item">
                                <b>Class</b>{" "}
                                <a className="pull-right text-aqua">
                                  {sibling.class} ({sibling.section})
                                </a>
                              </li>
                              <li className="list-group-item">
                                <b>Gender</b>{" "}
                                <a className="pull-right text-aqua">
                                  {sibling.gender}
                                </a>
                              </li>
                              <li className="list-group-item">
                                <b>RTE</b>{" "}
                                <a className="pull-right text-aqua">
                                  {sibling.rte}
                                </a>
                              </li>
                              {sibling.admission_no && (
                                <li className="list-group-item">
                                  <b>Barcode</b>
                                  <a className="pull-right text-aqua">
                                    <img
                                      className="h-36"
                                      src={`https://newlayout.wisibles.com/uploads/student_id_card/barcodes/${sibling.admission_no}.png`}
                                      alt="Barcode"
                                      style={{ height: "36px", width: "auto" }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  </a>
                                </li>
                              )}
                            </ul>

                            {/* Detailed Sibling Info */}
                            <table className="table3 table-hover table-striped tmb0">
                              <tbody>
                                <tr>
                                  <td width="40%">Date of Birth</td>
                                  <td className="text-aqua">{formatDate(sibling.dob)}</td>
                                </tr>
                                <tr>
                                  <td>Category</td>
                                  <td className="text-aqua">{(categoryList.find(c => String(c.id) === String(sibling.category_id))?.category) || "-"}</td>
                                </tr>
                                <tr>
                                  <td>Mobile Number</td>
                                  <td className="text-aqua">{sibling.mobileno || "-"}</td>
                                </tr>
                                <tr>
                                  <td>Caste</td>
                                  <td className="text-aqua">{sibling.cast || "-"}</td>
                                </tr>
                                <tr>
                                  <td>Religion</td>
                                  <td className="text-aqua">{sibling.religion || "-"}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content - Tabs */}
            <div className="col-lg-9 col-md-9 col-sm-12">
              <div className="nav-tabs-custom theme-shadow" style={{ paddingBottom: '30px' }}>
                <ul className="nav nav-tabs">
                  <li className={activeTab === "activity" ? "active" : ""}>
                    <a
                      href="#activity"
                      data-toggle="tab"
                      onClick={() => setActiveTab("activity")}
                    >
                      Profile
                    </a>
                  </li>
                  <li className={activeTab === "fee" ? "active" : ""}>
                    <a
                      href="#fee"
                      data-toggle="tab"
                      onClick={() => setActiveTab("fee")}
                    >
                      Fees
                    </a>
                  </li>
                  <li className={activeTab === "cbseexam" ? "active" : ""}>
                    <a
                      href="#cbseexam"
                      data-toggle="tab"
                      onClick={() => setActiveTab("cbseexam")}
                    >
                      CBSE Exam
                    </a>
                  </li>

                  <li className={activeTab === "attendance" ? "active" : ""}>
                    <a
                      href="#attendance"
                      data-toggle="tab"
                      onClick={() => setActiveTab("attendance")}
                    >
                      Attendance
                    </a>
                  </li>
                  <li className={activeTab === "documents" ? "active" : ""}>
                    <a
                      href="#documents"
                      data-toggle="tab"
                      onClick={() => setActiveTab("documents")}
                    >
                      Documents
                    </a>
                  </li>
                  <li className={activeTab === "timelineh" ? "active" : ""}>
                    <a
                      href="#timelineh"
                      data-toggle="tab"
                      onClick={() => setActiveTab("timelineh")}
                    >
                      Timeline
                    </a>
                  </li>
                  {/*  <li
                    className={activeTab === "behavioural_note" ? "active" : ""}
                  >
                    <a
                      href="#behavioural_note"
                      data-toggle="tab"
                      onClick={() => setActiveTab("behavioural_note")}
                    >
                      Behavioural Note
                    </a>
                  </li>*/}

                  {/* Action Buttons */}
                  {!isDisabled && (
                    <>
                      <li className="pull-right">
                        <a
                          href="#"
                          className="text-red"
                          data-toggle="tooltip"
                          title="Disable"
                          onClick={handleDisableClick}
                        >
                          <i className="fa fa-thumbs-o-down"></i>
                        </a>
                      </li>
                      <li className="pull-right">
                        <a
                          href="#"
                          className="text-green"
                          data-toggle="tooltip"
                          title="Login Details"
                          onClick={(e) => {
                            e.preventDefault();
                            setCredentialsModalOpen(true);
                          }}
                        >
                          <i className="fa fa-key"></i>
                        </a>
                      </li>
                      <li className="pull-right">
                        <Link
                          to={`/studentfee/addfee/${student.student_session_id}`}
                          data-toggle="tooltip"
                          title="Collect Fees"
                        >
                          <b>₹</b>
                        </Link>
                      </li>
                      <li className="pull-right">
                        <Link
                          to={`/student/edit/${student.id}`}
                          data-toggle="tooltip"
                          title="Edit"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>
                      </li>
                    </>
                  )}
                  {isDisabled && (
                    <li className="pull-right">
                      <a
                        href="#"
                        className="text-green"
                        data-toggle="tooltip"
                        title="Enable"
                        onClick={handleEnableStudent}
                      >
                        <i className="fa fa-thumbs-o-up"></i>
                      </a>
                    </li>
                  )}
                </ul>

                <div className="tab-content">
                  {/* Profile Tab */}
                  <div
                    className={`tab-pane ${activeTab === "activity" ? "active" : ""}`}
                    id="activity"
                  >
                    {/* Basic Info */}
                    <div className="tshadow mb25 bozero">
                      <div className="table-responsive around10 pt0">
                        <table className="table3 table-hover table-striped tmb0">
                          <tbody>
                            <tr>
                              <td width="35%">Admission Date</td>
                              <td className="col-md-5">
                                {formatDate(student.admission_date)}
                              </td>
                            </tr>
                            <tr>
                              <td>Date of Birth</td>
                              <td>{formatDate(student.dob)}</td>
                            </tr>
                            <tr>
                              <td>Category</td>
                              <td>{(categoryList.find(c => String(c.id) === String(student.category_id))?.category)}</td>
                            </tr>
                            <tr>
                              <td>Mobile Number</td>
                              <td>{student.mobileno}</td>
                            </tr>
                            <tr>
                              <td>Caste</td>
                              <td>{student.cast}</td>
                            </tr>
                            <tr>
                              <td>Religion</td>
                              <td>{student.religion}</td>
                            </tr>
                            <tr>
                              <td>Email</td>
                              <td>{student.email}</td>
                            </tr>
                            <tr>
                              <td>Child ID</td>
                              <td>{student.child_id}</td>
                            </tr>
                            <tr>
                              <td>Class Of Admission</td>
                              <td>{student.class_of_admission}</td>
                            </tr>
                            <tr>
                              <td>Note</td>
                              <td>{student.note}</td>
                            </tr>
                            {/* Custom Fields */}
                            {student.custom_fields &&
                              student.custom_fields.length > 0 &&
                              student.custom_fields.map((field, index) => (
                                <tr key={index}>
                                  <td>{field.name}</td>
                                  <td>
                                    {field.type === "link" ? (
                                      <a
                                        href={field.field_value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {field.field_value}
                                      </a>
                                    ) : Array.isArray(field.field_value) ? (
                                      <ul className="student_custom_field">
                                        {field.field_value.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      field.field_value
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="tshadow mb25 bozero">
                      <h3 className="pagetitleh2">Address</h3>
                      <div className="table-responsive around10 pt0">
                        <table className="table3 table-hover table-striped tmb0">
                          <tbody>
                            <tr>
                              <td width="35%">Current Address</td>
                              <td className="col-md-5">
                                {student.current_address}
                              </td>
                            </tr>
                            <tr>
                              <td>Permanent Address</td>
                              <td>{student.permanent_address}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Parent/Guardian Section */}
                    <div className="tshadow mb25 bozero">
                      <h3 className="pagetitleh2">Parent / Guardian Detail</h3>
                      <div className="table-responsive around10 pt10">
                        <table className="table3 table-hover table-striped tmb0">
                          <tbody>
                            {/* Father */}
                            <tr>
                              <td width="35%">Father Name</td>
                              <td className="col-md-5">
                                {student.father_name}
                              </td>
                              <td rowSpan="3">
                                <img
                                  className="profile-user-img img-responsive img-rounded"
                                  src={getImageUrl(student.father_pic)}
                                  alt="Father"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Father Phone</td>
                              <td>{student.father_phone}</td>
                            </tr>
                            <tr>
                              <td>Father Occupation</td>
                              <td>{student.father_occupation}</td>
                            </tr>

                            {/* Mother */}
                            <tr className="bordertop">
                              <td>Mother Name</td>
                              <td>{student.mother_name}</td>
                              <td rowSpan="3">
                                <img
                                  className="profile-user-img img-responsive img-rounded"
                                  src={getImageUrl(student.mother_pic)}
                                  alt="Mother"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Mother Phone</td>
                              <td>{student.mother_phone}</td>
                            </tr>
                            <tr>
                              <td>Mother Occupation</td>
                              <td>{student.mother_occupation}</td>
                            </tr>

                            {/* Guardian */}
                            <tr className="bordertop">
                              <td>Guardian Name</td>
                              <td>{student.guardian_name}</td>
                              <td rowSpan="6">
                                <img
                                  className="profile-user-img img-responsive img-rounded"
                                  src={getImageUrl(student.guardian_pic)}
                                  alt="Guardian"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Guardian Email</td>
                              <td>{student.guardian_email}</td>
                            </tr>
                            <tr>
                              <td>Guardian Relation</td>
                              <td>{student.guardian_relation}</td>
                            </tr>
                            <tr>
                              <td>Guardian Phone</td>
                              <td>{student.guardian_phone}</td>
                            </tr>
                            <tr>
                              <td>Guardian Occupation</td>
                              <td>{student.guardian_occupation}</td>
                            </tr>
                            <tr>
                              <td>Guardian Address</td>
                              <td>{student.guardian_address}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Hostel Details Section */}
                    <div className="tshadow mb25 bozero">
                      <h3 className="pagetitleh2">Hostel Details</h3>
                      <div className="table-responsive around10 pt0">
                        <table className="table3 table-hover table-striped tmb0">
                          <tbody>
                            <tr>
                              <td width="35%">Hostel</td>
                              <td className="col-md-5">{student.hostel_name || '-'}</td>
                            </tr>
                            <tr>
                              <td>Room No</td>
                              <td>{student.room_no || '-'}</td>
                            </tr>
                            <tr>
                              <td>Room Type</td>
                              <td>{student.room_type || '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Transport Details Section */}
                    <div className="tshadow mb25 bozero">
                      <h3 className="pagetitleh2">Transport Details</h3>
                      <div className="table-responsive around10 pt0">
                        <table className="table3 table-hover table-striped tmb0">
                          <tbody>
                            <tr>
                              <td width="35%">Route</td>
                              <td className="col-md-5">{student.route_title || '-'}</td>
                            </tr>
                            <tr>
                              <td>Vehicle Number</td>
                              <td>{student.vehicle_no || '-'}</td>
                            </tr>
                            <tr>
                              <td>Driver Name</td>
                              <td>{student.driver_name || '-'}</td>
                            </tr>
                            <tr>
                              <td>Driver Contact</td>
                              <td>{student.driver_contact || '-'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Miscellaneous Details */}
                    <div className="tshadow mb25 bozero">
                      <h3 className="pagetitleh2">Miscellaneous Details</h3>
                      <div className="table-responsive around10 pt0">
                        <table className="table3 table-hover table-striped tmb0">
                          <tbody>
                            <tr>
                              <td width="35%">Blood Group</td>
                              <td className="col-md-5">
                                {student.blood_group}
                              </td>
                            </tr>
                            <tr>
                              <td>House</td>
                              <td>{student.house_name}</td>
                            </tr>
                            <tr>
                              <td>Height</td>
                              <td>{student.height}</td>
                            </tr>
                            <tr>
                              <td>Weight</td>
                              <td>{student.weight}</td>
                            </tr>
                            <tr>
                              <td>Measurement Date</td>
                              <td>
                                {formatDate(student.measurement_date)}
                              </td>
                            </tr>
                            <tr>
                              <td>Previous School Details</td>
                              <td>{student.previous_school}</td>
                            </tr>
                            <tr>
                              <td>National Identification Number</td>
                              <td>{student.adhar_no}</td>
                            </tr>
                            <tr>
                              <td>Local Identification Number</td>
                              <td>{student.samagra_id}</td>
                            </tr>
                            <tr>
                              <td>Bank Account Number</td>
                              <td>{student.bank_account_no}</td>
                            </tr>
                            <tr>
                              <td>Bank Name</td>
                              <td>{student.bank_name}</td>
                            </tr>
                            <tr>
                              <td>IFSC Code</td>
                              <td>{student.ifsc_code}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Fees Tab */}
                  <div
                    className={`tab-pane ${activeTab === "fee" ? "active" : ""}`}
                    id="fee"
                  >
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered table-hover example">
                        <thead>
                          <tr>
                            <th>Fees Group</th>
                            <th>Fees Code</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th>Payment Id</th>
                            <th>Mode</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Discount</th>
                            <th style={{ textAlign: 'right' }}>Fine</th>
                            <th style={{ textAlign: 'right' }}>Paid</th>
                            <th style={{ textAlign: 'right' }}>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fees.length === 0 ? (
                            <tr>
                              <td
                                colSpan="12"
                                className="text-danger text-center"
                              >
                                No Fees Found
                              </td>
                            </tr>
                          ) : (
                            fees.map((fee, index) => (
                              <React.Fragment key={index}>
                                <tr>
                                  <td>{fee.name}</td>
                                  <td>{fee.code}</td>
                                  <td>{formatDate(fee.due_date)}</td>
                                  <td>
                                    <span
                                      className={`label ${fee.status === "Paid" ? "label-success" : fee.status === "Partial" ? "label-warning" : "label-danger"}`}
                                    >
                                      {fee.status}
                                    </span>
                                  </td>
                                  <td className="text-right">
                                    {fee.amount || fee.fees}
                                    {fee.penalty_fine > 0 && (
                                      <span className="text-danger" style={{ marginLeft: '5px' }} title="Fine">+{fee.penalty_fine.toFixed(2)}</span>
                                    )}
                                  </td>
                                  <td>{fee.payment_id || "-"}</td>
                                  <td>{fee.payment_mode || "-"}</td>
                                  <td>{formatDate(fee.payment_date)}</td>
                                  <td className="text-right">{fee.discount || "0.00"}</td>
                                  <td className="text-right" title="Fine">{fee.fine || "0.00"}</td>
                                  <td className="text-right">{fee.paid || "0.00"}</td>
                                  <td className="text-right">{fee.balance || "0.00"}</td>
                                </tr>
                                {fee.payment_details && fee.payment_details.map((payment, pIndex) => (
                                  <tr key={`payment-${pIndex}`} style={{ backgroundColor: '#fff', color: '#666' }}>
                                    <td colSpan="5"></td>
                                    <td>
                                      <i className="fa fa-level-up fa-rotate-90" style={{ color: '#ccc', marginRight: '5px' }}></i>
                                      {fee.student_fees_deposite_id}/{payment.inv_no}
                                    </td>
                                    <td>{payment.payment_mode}</td>
                                    <td>{formatDate(payment.date)}</td>
                                    <td className="text-right">{parseFloat(payment.amount_discount || 0).toFixed(2)}</td>
                                    <td className="text-right">{parseFloat(payment.amount_fine || 0).toFixed(2)}</td>
                                    <td className="text-right">{parseFloat(payment.amount || 0).toFixed(2)}</td>
                                    <td></td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))
                          )}
                          {studentDiscountFee && studentDiscountFee.length > 0 &&
                            studentDiscountFee.map((discount, dIndex) => (
                              <tr key={`discount-${dIndex}`} style={{ backgroundColor: '#fcf8e3' }}>
                                <td></td>
                                <td>Discount</td>
                                <td>{discount.code}</td>
                                <td></td>
                                <td>
                                  {discount.status === 'applied' ? (
                                    <span className="text-success small">Discount of {currencySymbol}{parseFloat(discount.amount || 0).toFixed(2)} Applied</span>
                                  ) : (
                                    <span className="text-danger small">Discount of {currencySymbol}{parseFloat(discount.amount || 0).toFixed(2)} {discount.status}</span>
                                  )}
                                </td>
                                <td colSpan="7"></td>
                              </tr>
                            ))
                          }
                          {fees.length > 0 && (
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#f4f4f4' }}>
                              <td colSpan="4" className="text-right">Grand Total</td>
                              <td className="text-right">
                                {currencySymbol}{feeTotals.totalAmount.toFixed(2)}
                                {feeTotals.totalPenaltyFine > 0 && (
                                  <span className="text-danger" style={{ marginLeft: '5px' }}>+{currencySymbol}{feeTotals.totalPenaltyFine.toFixed(2)}</span>
                                )}
                              </td>
                              <td colSpan="3"></td>
                              <td className="text-right">{currencySymbol}{feeTotals.totalDiscount.toFixed(2)}</td>
                              <td className="text-right">{currencySymbol}{feeTotals.totalFine.toFixed(2)}</td>
                              <td className="text-right">{currencySymbol}{feeTotals.totalPaid.toFixed(2)}</td>
                              <td className="text-right">{currencySymbol}{feeTotals.totalBalance.toFixed(2)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div
                    className={`tab-pane ${activeTab === "cbseexam" ? "active" : ""}`}
                    id="cbseexam"
                  >
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>Exam</th>
                            <th>Marks</th>
                            <th>Grade</th>
                            <th>Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cbseExams.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-danger text-center">
                                No CBSE Exam Result Found
                              </td>
                            </tr>
                          ) : (
                            cbseExams.map((exam, i) => (
                              <tr key={i}>
                                <td>{exam.name}</td>
                                <td>{exam.total_marks}</td>
                                <td>{exam.grade}</td>
                                <td>{exam.rank}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Attendance Tab */}
                  <div
                    className={`tab-pane ${activeTab === "attendance" ? "active" : ""}`}
                    id="attendance"
                  >
                    <div className="row">
                      {attendanceTypes.map((type) => {
                        const iconMap = {
                          'present': 'fa-check-square-o',
                          'absent': 'fa-times-circle-o',
                          'late': 'fa-clock-o',
                          'half day': 'fa-calendar-minus-o',
                          'holiday': 'fa-sun-o',
                          'late with excuse': 'fa-clock-o'
                        };
                        const iconClass = iconMap[type.type.toLowerCase()] || 'fa-check-square-o';
                        return (
                          <div className="col-lg-3 col-md-4 col-sm-6 col20per" key={type.id}>
                            <div className="staffprofile">
                              <h5>Total {type.type.toUpperCase()}</h5>
                              <h4>{countAttendance[type.type] || 0}</h4>
                              <div className="icon"><i className={`fa ${iconClass}`}></i></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Year</label>
                          <select
                            className="form-control"
                            value={attendanceYear}
                            onChange={(e) => setAttendanceYear(e.target.value)}
                          >
                            <option value="">Select Year</option>
                            {attendanceYears.map((y, i) => (
                              <option key={i} value={y.year}>
                                {y.year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <AttendanceGrid
                          attendanceResult={attendanceResult}
                          year={attendanceYear}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Tab */}
                  <div
                    className={`tab-pane ${activeTab === "documents" ? "active" : ""}`}
                    id="documents"
                  >
                    <div className="timeline-header no-border">
                      <button
                        type="button"
                        className="btn btn-xs btn-primary pull-right"
                        onClick={handleUploadDocument}
                        style={{ marginBottom: '15px' }}
                      >
                        <i className="fa fa-upload"></i> Upload Documents
                      </button>
                      <div
                        className="table-responsive"
                        style={{ clear: "both", marginTop: '10px' }}
                      >
                        <table className="table table-striped table-bordered table-hover">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>File Name</th>
                              <th className="mailbox-date text-right">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="3"
                                  className="text-danger text-center"
                                >
                                  No record found
                                </td>
                              </tr>
                            ) : (
                              documents.map((doc, idx) => (
                                <tr key={idx}>
                                  <td>{doc.title}</td>
                                  <td>{doc.doc}</td>
                                  <td className="text-right">
                                    <a
                                      href={`https://newlayout.wisibles.com/student/download/${student.id}/${doc.id}`}
                                      download
                                      className="btn btn-default btn-xs"
                                      data-toggle="tooltip"
                                      title="Download"
                                    >
                                      <i className="fa fa-download"></i>
                                    </a>
                                    <button
                                      className="btn btn-default btn-xs"
                                      data-toggle="tooltip"
                                      title="Delete"
                                      onClick={() =>
                                        handleDeleteDocument(doc.id)
                                      }
                                      style={{ marginLeft: "5px" }}
                                    >
                                      <i className="fa fa-remove"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Tab */}
                  <div
                    className={`tab-pane ${activeTab === "timelineh" ? "active" : ""}`}
                    id="timelineh"
                  >
                    <div>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary pull-right"
                        onClick={handleAddTimeline}
                      >
                        <i className="fa fa-plus"></i> Add
                      </button>
                    </div>
                    <br />
                    <div className="timeline-header no-border">
                      {timeline.length === 0 ? (
                        <div className="alert alert-info">No record found</div>
                      ) : (
                        <ul
                          className="timeline timeline-inverse"
                          style={{ position: "relative" }}
                        >
                          {timeline.map((item, index) => (
                            <li key={index} className="time-label">
                              <span
                                className="bg-blue"
                                style={{
                                  borderRadius: "4px",
                                  fontSize: "13px",
                                  padding: "5px 10px",
                                  display: "inline-block",
                                }}
                              >
                                {formatDate(item.timeline_date)}
                              </span>
                              <ul
                                className="timeline-items"
                                style={{
                                  listStyle: "none",
                                  paddingLeft: 0,
                                  marginTop: "20px",
                                  position: "relative",
                                }}
                              >
                                <li
                                  style={{
                                    marginBottom: "20px",
                                    position: "relative",
                                  }}
                                >
                                  {/* Custom line just for this block to give gap */}

                                  <i
                                    className="fa fa-id-card-o bg-blue"
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      lineHeight: "30px",
                                      fontSize: "13px",
                                      borderRadius: "50%",
                                      textAlign: "center",
                                      position: "absolute",
                                      left: "29px",
                                      top: "5px",
                                      color: "#fff",
                                      backgroundColor: "#0073b7",
                                      zIndex: 2,
                                    }}
                                  ></i>
                                  <div
                                    className="timeline-item"
                                    style={{
                                      marginLeft: "80px",
                                      border: "1px solid #e1e1e1",
                                      borderRadius: "4px",
                                      backgroundColor: "#fff",
                                      boxShadow: "none",
                                      position: "relative",
                                      zIndex: 2,
                                    }}
                                  >
                                    <div
                                      className="timeline-header"
                                      style={{
                                        padding: "10px 15px",
                                        borderBottom: "1px solid #e1e1e1",
                                        backgroundColor: "#fff",
                                        borderRadius: "3px 3px 0 0",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <h3
                                        className="timeline-title"
                                        style={{
                                          margin: 0,
                                          fontSize: "15px",
                                          color: "#00b4e4",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {item.title}
                                      </h3>
                                      <div className="timeline-actions">
                                        {item.document && (
                                          <a
                                            href={`https://newlayout.wisibles.com/admin/timeline/download/${item.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-default btn-xs"
                                            style={{
                                              border: "none",
                                              background: "transparent",
                                            }}
                                            data-toggle="tooltip"
                                            title="Download Document"
                                          >
                                            <i className="fa fa-download" style={{ color: '#0073b7' }}></i>
                                          </a>
                                        )}
                                        <button
                                          className="btn btn-default btn-xs"
                                          style={{
                                            border: "none",
                                            background: "transparent",
                                          }}
                                          data-toggle="tooltip"
                                          onClick={() => handleEditTimeline(item.id)}
                                          title="Edit"
                                        >
                                          <i className="fa fa-pencil text-muted"></i>
                                        </button>
                                        <button
                                          className="btn btn-default btn-xs"
                                          style={{
                                            border: "none",
                                            background: "transparent",
                                          }}
                                          data-toggle="tooltip"
                                          title="Delete"
                                          onClick={() =>
                                            handleDeleteTimeline(item.id)
                                          }
                                        >
                                          <i className="fa fa-trash text-muted"></i>
                                        </button>
                                      </div>
                                    </div>
                                    <div
                                      className="timeline-body"
                                      style={{
                                        padding: "15px",
                                        fontSize: "13px",
                                        color: "#666",
                                        backgroundColor: "#fafafa",
                                      }}
                                    >
                                      {item.description}
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </li>
                          ))}
                          <li>
                            <i
                              className="fa fa-clock-o bg-blue"
                              style={{
                                width: "30px",
                                height: "30px",
                                lineHeight: "30px",
                                fontSize: "14px",
                                borderRadius: "50%",
                                color: "#fff",
                                backgroundColor: "#0073b7",
                                left: "29px",
                                position: "absolute",
                                zIndex: 2,
                              }}
                            ></i>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Behavioural Note Tab */}
                  <div
                    className={`tab-pane ${activeTab === "behavioural_note" ? "active" : ""}`}
                    id="behavioural_note"
                  >
                    <div className="timeline-header no-border">
                      {behaviouralNotes.length === 0 ? (
                        <div className="alert alert-info">No record found</div>
                      ) : (
                        behaviouralNotes.map((note, index) => (
                          <div key={index}>
                            <table className="table table-striped mb0">
                              <tbody>
                                <tr>
                                  <th width="35%">Staff</th>
                                  <td>{note.collected_by}</td>
                                </tr>
                                <tr>
                                  <th>Date</th>
                                  <td>{formatDate(note.date)}</td>
                                </tr>
                                <tr>
                                  <th>Handwriting</th>
                                  <td colSpan="3">{note.parameter_1}</td>
                                </tr>
                                <tr>
                                  <th>Listening</th>
                                  <td colSpan="3">{note.parameter_2}</td>
                                </tr>
                                <tr>
                                  <th>Behaviour In Class Room</th>
                                  <td colSpan="3">{note.parameter_3}</td>
                                </tr>
                                <tr>
                                  <th>Behaviour With Teachers</th>
                                  <td colSpan="3">{note.parameter_4}</td>
                                </tr>
                                <tr>
                                  <th>
                                    Behaviour With Classmates / Elders And
                                    Youngers
                                  </th>
                                  <td colSpan="3">{note.parameter_5}</td>
                                </tr>
                                <tr>
                                  <th>Behaviour In Campus</th>
                                  <td colSpan="3">{note.parameter_6}</td>
                                </tr>
                                <tr>
                                  <th>Bike</th>
                                  <td colSpan="3">{note.parameter_7}</td>
                                </tr>
                              </tbody>
                            </table>
                            <hr />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Disable Student Modal */}
      {disableModalOpen && (
        <div
          className="modal show"
          style={{ display: "block", paddingRight: "15px" }}
        >
          <div className="modal-dialog">
            <div className="modal-content modal-media-content">
              <div className="modal-header modal-media-header">
                <button
                  type="button"
                  className="close"
                  onClick={() => setDisableModalOpen(false)}
                >
                  &times;
                </button>
                <h4 className="box-title">Disable Student</h4>
              </div>
              <form role="form" onSubmit={handleDisableSubmit}>
                <div className="modal-body pt0 pb0">
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 paddlr">
                      <div className="row">
                        <div className="col-sm-12">
                          <div className="form-group">
                            <label>
                              Reason <small className="req">*</small>
                            </label>
                            <select
                              className="form-control"
                              name="reason"
                              value={disableFormData.reason}
                              onChange={(e) =>
                                setDisableFormData({
                                  ...disableFormData,
                                  reason: e.target.value,
                                })
                              }
                            >
                              <option value="">Select</option>
                              {disableReasons.map((reason) => (
                                <option key={reason.id} value={reason.id}>
                                  {reason.reason}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="form-group">
                            <label>
                              Date <small className="req">*</small>
                            </label>
                            <input
                              name="disable_date"
                              className="form-control date"
                              value={disableFormData.disable_date}
                              readOnly
                              type="text"
                            />
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="form-group">
                            <label>Note</label>
                            <textarea
                              name="note"
                              className="form-control"
                              value={disableFormData.note}
                              onChange={(e) =>
                                setDisableFormData({
                                  ...disableFormData,
                                  note: e.target.value,
                                })
                              }
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="box-footer">
                  <button
                    type="submit"
                    className="btn btn-info pull-right"
                    disabled={submittingDisable}
                  >
                    {submittingDisable ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Overlay */}
          <div
            className="modal-backdrop fade in"
            style={{ zIndex: -1 }}
            onClick={() => setDisableModalOpen(false)}
          ></div>
        </div>
      )}

      {/* Login Credentials Modal */}
      {credentialsModalOpen && student && (
        <div
          className="modal show"
          style={{ display: "block", paddingRight: "15px" }}
        >
          <div className="modal-dialog">
            <div className="modal-content modal-media-content">
              <div className="modal-header modal-media-header">
                <button
                  type="button"
                  className="close"
                  onClick={() => setCredentialsModalOpen(false)}
                >
                  &times;
                </button>
                <h4 className="box-title">Login Details</h4>
              </div>
              <div className="modal-body">
                <h4 className="text-center" style={{ marginBottom: "20px" }}>
                  <strong>
                    {student.firstname} {student.middlename || ""}{" "}
                    {student.lastname || ""}
                  </strong>
                </h4>

                <div
                  className="alert alert-info text-center"
                  style={{ marginBottom: "20px" }}
                >
                  <strong>Login URL:</strong>{" "}
                  <a
                    href="https://alpha.wisibles.com/user/login"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://alpha.wisibles.com/user/login
                  </a>
                </div>

                <table className="table table-bordered">
                  <thead>
                    <tr className="active">
                      <th colSpan="2" className="text-center">
                        Student Login Credentials
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ width: "40%" }}>
                        <strong>Username</strong>
                      </td>
                      <td>{student.username}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Password</strong>
                      </td>
                      <td>{student.password}</td>
                    </tr>
                  </tbody>
                </table>

                <table
                  className="table table-bordered"
                  style={{ marginTop: "15px" }}
                >
                  <thead>
                    <tr className="active">
                      <th colSpan="2" className="text-center">
                        Guardian Login Credentials
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ width: "40%" }}>
                        <strong>Username</strong>
                      </td>
                      <td>{guardianCredential?.username}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Password</strong>
                      </td>
                      <td>{guardianCredential?.password}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() => setCredentialsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          {/* Overlay */}
          <div
            className="modal-backdrop fade in"
            style={{ zIndex: -1 }}
            onClick={() => setCredentialsModalOpen(false)}
          ></div>
        </div>
      )}

      {/* Timeline Modal */}
      {timelineModalOpen && (
        <div
          className="modal show"
          style={{ display: "block", paddingRight: "15px" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  onClick={() => setTimelineModalOpen(false)}
                >
                  &times;
                </button>
                <h4 className="modal-title">Add Timeline</h4>
              </div>
              <form onSubmit={handleTimelineSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>
                      Title <small className="req">*</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={timelineFormData.title}
                      onChange={(e) =>
                        setTimelineFormData({
                          ...timelineFormData,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Date <small className="req">*</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={timelineFormData.date}
                      onChange={(e) =>
                        setTimelineFormData({
                          ...timelineFormData,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      value={timelineFormData.description}
                      onChange={(e) =>
                        setTimelineFormData({
                          ...timelineFormData,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Attach Document</label>
                    <input
                      type="file"
                      className="dropify"
                      data-height="100"
                      data-default-file={timelineFormData.document ? `https://newlayout.wisibles.com/uploads/student_timeline/${timelineFormData.document}` : ""}
                      onChange={(e) =>
                        setTimelineFormData({
                          ...timelineFormData,
                          file: e.target.files[0],
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Visible to this person</label>
                    <div className="checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={timelineFormData.visible_check}
                          onChange={(e) =>
                            setTimelineFormData({
                              ...timelineFormData,
                              visible_check: e.target.checked,
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-info pull-right">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div
            className="modal-backdrop fade in"
            style={{ zIndex: -1 }}
            onClick={() => setTimelineModalOpen(false)}
          ></div>
        </div>
      )}

      {/* Document Modal */}
      {docModalOpen && (
        <div
          className="modal show"
          style={{ display: "block", paddingRight: "15px" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  onClick={() => setDocModalOpen(false)}
                >
                  &times;
                </button>
                <h4 className="modal-title">Upload Document</h4>
              </div>
              <form onSubmit={handleDocumentSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>
                      Title <small className="req">*</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={docFormData.first_title}
                      onChange={(e) =>
                        setDocFormData({
                          ...docFormData,
                          first_title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Document <small className="req">*</small>
                    </label>
                    <input
                      type="file"
                      className="dropify"
                      data-height="100"
                      required
                      onChange={(e) =>
                        setDocFormData({
                          ...docFormData,
                          first_doc: e.target.files[0],
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-info pull-right">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div
            className="modal-backdrop fade in"
            style={{ zIndex: -1 }}
            onClick={() => setDocModalOpen(false)}
          ></div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StudentView;
