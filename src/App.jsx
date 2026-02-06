import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardTest from './pages/dashboard/dashboard_test';

import LoginPage from './pages/auth/LoginPage';
import SettingsMenu from './components/SettingsMenu';

import GeneralSettings from './pages/settings/general_settings_options/GeneralSettings';
import LogoSettings from './pages/settings/general_settings_options/LogoSettings';
import LoginPageBackgroundSettings from './pages/settings/general_settings_options/LoginPageBackgroundSettings';
import MobileAppSettings from './pages/settings/general_settings_options/MobileAppSettings';
import FrontCMSSettings from './pages/settings/general_settings_options/FrontCMSSettings';
import SessionSettings from './pages/settings/SessionSettings';
import SmsSettings from './pages/settings/SmsSettings';
import EmailSettings from './pages/settings/EmailSettings';
import PrintHeaderFooterSettings from './pages/settings/PrintHeaderFooterSettings';
import StudentSearch from './pages/student/StudentSearch';

import StudentAdmission from './pages/student/StudentAdmission';
import OnlineStudentList from './pages/student/OnlineStudentList';
import OnlineStudentEdit from './pages/student/OnlineStudentEdit';
import StudentEdit from './pages/student/StudentEdit';
import StudentView from './pages/student/StudentView';
import DisabledStudents from './pages/student/DisabledStudents';
import DisableReason from './pages/student/DisableReason';
import DisableReasonEdit from './pages/student/DisableReasonEdit';
import StudentAttendance from './pages/attendance/StudentAttendance.jsx';
import DailyAttendanceReport from './pages/attendance/DailyAttendanceReport';
import StaffAttendanceReport from './pages/attendance/approve_leave/StaffAttendanceReport';
import AttendanceReport from './pages/attendance/AttendanceReport.jsx';
import StaffAttendanceList from './pages/HR/StaffAttendanceList';
import StaffLeaveRequest from './pages/HR/StaffLeaveRequest';
import LeaveRequest from './pages/HR/LeaveRequest';
import LeaveTypes from './pages/HR/LeaveTypes';
import Designation from './pages/HR/Designation';
import Department from './pages/HR/Department';
import EnquiryView from './pages/helpdesk/admissionenquiry/EnquiryView';
import ApproveLeave from './pages/attendance/approve_leave/ApproveLeave';
import HomeworkList from './pages/homework/HomeworkList';
import DailyAssignmentList from './pages/homework/DailyAssignmentList';
import StudentDiaryList from './pages/homework/StudentDiaryList';
import StaffProfile from './pages/HR/StaffProfile';
import StaffEdit from './pages/HR/StaffEdit';
import StaffSearch from './pages/HR/StaffSearch';
import CBSEExamList from './pages/state_examination/CBSEExamList';
import CBSEGradeList from './pages/state_examination/CBSEGradeList';
import CBSESettings from './pages/state_examination/CBSESettings';
import Assessment from './pages/state_examination/Assessment';
import Term from './pages/state_examination/Term';
import Template from './pages/state_examination/Template';
import Report from './pages/state_examination/Report';
import PrintMarksheet from './pages/state_examination/PrintMarksheet';
import StudentMarksheetPrint from './pages/state_examination/StudentMarksheetPrint';
import ExamTimetable from './pages/state_examination/ExamTimetable';
import ExamSubjects from './pages/state_examination/ExamSubjects';
import ExamRank from './pages/state_examination/ExamRank';
import ExamWiseRank from './pages/state_examination/ExamWiseRank';
import GenerateAdmitCard from './pages/state_examination/GenerateAdmitCard';
import AssignExamStudent from './pages/state_examination/AssignExamStudent';
import Rank from './pages/state_examination/Rank';
import SourceView from './pages/helpdesk/setupfrontoffice/SourceView';
import ReferenceView from './pages/helpdesk/setupfrontoffice/ReferenceView';
import SourceEdit from './pages/helpdesk/setupfrontoffice/SourceEdit';
import ReferenceEdit from './pages/helpdesk/setupfrontoffice/ReferenceEdit';
import FeeType from './pages/fee/feetype/FeeType';
import FeeTypeEdit from './pages/fee/feetype/FeeTypeEdit';
import FeeGroup from './pages/fee/feegroup/FeeGroup';
import FeeGroupEdit from './pages/fee/feegroup/FeeGroupEdit';
import FeeMaster from './pages/fee/feemaster/FeeMaster';
import FeeMasterEdit from './pages/fee/feemaster/FeeMasterEdit';
import AssignFeeMaster from './pages/fee/feemaster/AssignFeeMaster';
import IncomeHead from './pages/income/IncomeHead';
import IncomeHeadEdit from './pages/income/IncomeHeadEdit';
import IncomeList from './pages/income/IncomeList';
import IncomeEdit from './pages/income/IncomeEdit';
import ExpenseHead from './pages/expense/ExpenseHead';
import ExpenseHeadEdit from './pages/expense/ExpenseHeadEdit';
import ExpenseList from './pages/expense/ExpenseList';
import ExpenseEdit from './pages/expense/ExpenseEdit';
import StudentFeeSearch from './pages/fee/collect-fees/StudentFeeSearch';
import StudentAddFee from './pages/fee/collect-fees/StudentAddFee';
import FeeCarryForward from './pages/fee/feecarry/FeeCarryForward';
import FeeReminderSetting from './pages/fee/feereminder/FeeReminderSetting';
import FeesReceipt24 from './pages/fee/feereceipt/FeesReceipt24';
import PrintStudentGroupFees24 from './pages/fee/feereceipt/PrintStudentGroupFees24';
import PrintFeesByGroupArrayPage from './pages/fee/collect-fees/PrintFeesByGroupArrayPage';
import SearchPayment from './pages/fee/searchpayment/SearchPayment';

// Academics Pages
import ClassList from './pages/academics/ClassList';
import SectionList from './pages/academics/SectionList';
import SubjectList from './pages/academics/SubjectList';
import SubjectEdit from './pages/academics/SubjectEdit';
import ClassTimetable from './pages/academics/ClassTimetable';
import AssignClassTeacher from './pages/academics/AssignClassTeacher';
import SubjectTeacher from './pages/academics/SubjectTeacher';
import StdTransfer from './pages/academics/StdTransfer';
import SubjectGroupList from './pages/academics/SubjectGroupList';
import TeacherTimetable from './pages/academics/TeacherTimetable';
import TimetableCreate from './pages/academics/TimetableCreate';
import NoticeBoardAdd from './pages/message/NoticeBoardAdd.jsx';
import NoticeBoardEdit from './pages/message/NoticeBoardEdit.jsx';

// Transport Pages
import CreateRoute from './pages/transport/CreateRoute';
import VehicleList from './pages/transport/VehicleList';
import VehicleRoute from './pages/transport/VehicleRoute';
import PickupPointList from './pages/transport/PickupPointList';
import AssignPickupPoint from './pages/transport/AssignPickupPoint';
import TransportFeesMaster from './pages/transport/TransportFeesMaster';
import StudentTransportFees from './pages/transport/StudentTransportFees';

// Message Pages
import BulkMail from './pages/message/BulkMail';
import EmailSmsLog from './pages/message/EmailSmsLog';
import EmailTemplate from './pages/message/EmailTemplate';
import NotificationList from './pages/message/NotificationList';
import NotificationAdd from './pages/message/NotificationAdd';
import SMSTemplate from './pages/message/SMSTemplate';
import ScheduleLog from './pages/message/ScheduleLog';
import SendReminders from './pages/message/SendReminders';
import NotificationAddEdit from './pages/message/NotificationAddEdit';
import ScheduleEdit from './pages/message/ScheduleEdit';
import NoticeBoard from './pages/message/NoticeBoard';
import { SendWhatsApp, WhatsAppLog, WhatsAppScheduleLog } from './pages/message/sendWhatsapp';
import { ComposeEmail, ComposeSMS, EmailSMSLog, EmailSMSScheduleLog, EmailTemplate as MailEmailTemplate, SMSTemplate as MailSMSTemplate } from './pages/message/mailsms';
import OnlineCourseCategory from './pages/courses/OnlineCourseCategory';
import OnlineCourseList from './pages/courses/OnlineCourseList';

import { api } from './services/api';
import { SessionProvider } from './context/SessionContext';
import { LogoProvider } from './context/LogoContext';

import { Toaster } from 'react-hot-toast';

// Protected Route Component
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <LogoProvider>
      <SessionProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                zIndex: 99999,
              },
              // Ensure container itself is high up
              containerStyle: {
                zIndex: 99999
              }
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <GeneralSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/logo"
              element={
                <ProtectedRoute>
                  <LogoSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/login-page-background"
              element={
                <ProtectedRoute>
                  <LoginPageBackgroundSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/mobile-app"
              element={
                <ProtectedRoute>
                  <MobileAppSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <SessionSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sms-settings"
              element={
                <ProtectedRoute>
                  <SmsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/smsnotifications"
              element={
                <ProtectedRoute>
                  <SmsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/email-settings"
              element={
                <ProtectedRoute>
                  <EmailSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/print-header-footer"
              element={
                <ProtectedRoute>
                  <PrintHeaderFooterSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/front-cms"
              element={
                <ProtectedRoute>
                  <FrontCMSSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/search"
              element={
                <ProtectedRoute>
                  <StudentSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/create"
              element={
                <ProtectedRoute>
                  <StudentAdmission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/edit/:id"
              element={
                <ProtectedRoute>
                  <StudentEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/view/:id"
              element={
                <ProtectedRoute>
                  <StudentView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/onlinestudent"
              element={
                <ProtectedRoute>
                  <OnlineStudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/onlinestudent/edit/:id"
              element={
                <ProtectedRoute>
                  <OnlineStudentEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/disabled"
              element={
                <ProtectedRoute>
                  <DisabledStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/disable-reason"
              element={
                <ProtectedRoute>
                  <DisableReason />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/disable_reason/edit/:id"
              element={
                <ProtectedRoute>
                  <DisableReasonEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-attendance"
              element={
                <ProtectedRoute>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-attendance-report"
              element={
                <ProtectedRoute>
                  <DailyAttendanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/staff_attendance_report"
              element={
                <ProtectedRoute>
                  <StaffAttendanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-by-date"
              element={
                <ProtectedRoute>
                  <AttendanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff/attendance"
              element={
                <ProtectedRoute>
                  <StaffAttendanceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approve_leave"
              element={
                <ProtectedRoute>
                  <ApproveLeave />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leaverequest"
              element={
                <ProtectedRoute>
                  <StaffLeaveRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff/leaverequest"
              element={
                <ProtectedRoute>
                  <LeaveRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leavetypes"
              element={
                <ProtectedRoute>
                  <LeaveTypes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/designation"
              element={
                <ProtectedRoute>
                  <Designation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/department"
              element={
                <ProtectedRoute>
                  <Department />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enquiry"
              element={
                <ProtectedRoute>
                  <EnquiryView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homework"
              element={
                <ProtectedRoute>
                  <StudentDiaryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-assignment"
              element={
                <ProtectedRoute>
                  <DailyAssignmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/student-diary"
              element={
                <ProtectedRoute>
                  <StudentDiaryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff/profile/:id"
              element={
                <ProtectedRoute>
                  <StaffProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff/edit/:id"
              element={
                <ProtectedRoute>
                  <StaffEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff/search"
              element={
                <ProtectedRoute>
                  <StaffSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cbseexam"
              element={
                <ProtectedRoute>
                  <CBSEExamList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rank"
              element={
                <ProtectedRoute>
                  <Rank />
                </ProtectedRoute>
              }
            />
            {/* State Examination (CBSE) Routes */}
            <Route path="/cbseexam/exam" element={<ProtectedRoute><CBSEExamList /></ProtectedRoute>} />
            <Route path="/cbseexam/examschedule" element={<ProtectedRoute><ExamTimetable /></ProtectedRoute>} />
            <Route path="/cbseexam/examgrade" element={<ProtectedRoute><CBSEGradeList /></ProtectedRoute>} />
            <Route path="/cbseexam/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/cbseexam/term" element={<ProtectedRoute><Term /></ProtectedRoute>} />
            <Route path="/cbseexam/template" element={<ProtectedRoute><Template /></ProtectedRoute>} />
            <Route path="/cbseexam/template" element={<ProtectedRoute><Template /></ProtectedRoute>} />
            <Route path="/cbseexam/result/marksheet" element={<ProtectedRoute><PrintMarksheet /></ProtectedRoute>} />
            <Route path="/cbseexam/result/print-suraj" element={<ProtectedRoute><StudentMarksheetPrint /></ProtectedRoute>} />
            <Route path="/cbseexam/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
            <Route path="/cbseexam/settings" element={<ProtectedRoute><CBSESettings /></ProtectedRoute>} />
            <Route path="/cbseexam/exam/subjects/:id" element={<ProtectedRoute><ExamSubjects /></ProtectedRoute>} />
            <Route path="/cbseexam/exam/examwiserank/:id" element={<ProtectedRoute><ExamWiseRank /></ProtectedRoute>} />
            <Route path="/cbseexam/exam/examwiseadmitcard/:id" element={<ProtectedRoute><GenerateAdmitCard /></ProtectedRoute>} />
            <Route path="/cbseexam/exam/assign/:id" element={<ProtectedRoute><AssignExamStudent /></ProtectedRoute>} />
            <Route path="/cbseexam/examrank" element={<ProtectedRoute><ExamRank /></ProtectedRoute>} />
            <Route
              path="/admin/source"
              element={
                <ProtectedRoute>
                  <SourceView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/source/edit/:id"
              element={
                <ProtectedRoute>
                  <SourceEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reference"
              element={
                <ProtectedRoute>
                  <ReferenceView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reference/edit/:id"
              element={
                <ProtectedRoute>
                  <ReferenceEdit />
                </ProtectedRoute>
              }
            />
            {/* Fee Module Routes */}
            <Route path="/studentfee" element={<ProtectedRoute><StudentFeeSearch /></ProtectedRoute>} />
            <Route path="/studentfee/addfee/:id" element={<ProtectedRoute><StudentAddFee /></ProtectedRoute>} />
            <Route path="/admin/feetype" element={<ProtectedRoute><FeeType /></ProtectedRoute>} />
            <Route path="/admin/feetype/edit/:id" element={<ProtectedRoute><FeeTypeEdit /></ProtectedRoute>} />
            <Route path="/admin/feegroup" element={<ProtectedRoute><FeeGroup /></ProtectedRoute>} />
            <Route path="/admin/feegroup/edit/:id" element={<ProtectedRoute><FeeGroupEdit /></ProtectedRoute>} />
            <Route path="/admin/feemaster" element={<ProtectedRoute><FeeMaster /></ProtectedRoute>} />
            <Route path="/admin/feemaster/edit/:id" element={<ProtectedRoute><FeeMasterEdit /></ProtectedRoute>} />
            <Route path="/admin/feemaster/assign/:id" element={<ProtectedRoute><AssignFeeMaster /></ProtectedRoute>} />
            <Route path="/admin/incomehead" element={<ProtectedRoute><IncomeHead /></ProtectedRoute>} />
            <Route path="/admin/incomehead/edit/:id" element={<ProtectedRoute><IncomeHeadEdit /></ProtectedRoute>} />
            <Route path="/admin/income" element={<ProtectedRoute><IncomeList /></ProtectedRoute>} />
            <Route path="/admin/income/edit/:id" element={<ProtectedRoute><IncomeEdit /></ProtectedRoute>} />
            <Route path="/admin/expensehead" element={<ProtectedRoute><ExpenseHead /></ProtectedRoute>} />
            <Route path="/admin/expensehead/edit/:id" element={<ProtectedRoute><ExpenseHeadEdit /></ProtectedRoute>} />
            <Route path="/admin/expense" element={<ProtectedRoute><ExpenseList /></ProtectedRoute>} />
            <Route path="/admin/expense/edit/:id" element={<ProtectedRoute><ExpenseEdit /></ProtectedRoute>} />
            <Route path="/admin/feesforward" element={<ProtectedRoute><FeeCarryForward /></ProtectedRoute>} />
            <Route path="/admin/feereminder/setting" element={<ProtectedRoute><FeeReminderSetting /></ProtectedRoute>} />
            <Route path="/admin/feesreceipt/feesreceipt_24" element={<ProtectedRoute><FeesReceipt24 /></ProtectedRoute>} />
            <Route path="/fee/print_receipt_24/:receipt_id" element={<ProtectedRoute><PrintStudentGroupFees24 /></ProtectedRoute>} />
            <Route path="/studentfee/printFeesByGroupArray" element={<ProtectedRoute><PrintFeesByGroupArrayPage /></ProtectedRoute>} />
            <Route path="/studentfee/searchpayment" element={<ProtectedRoute><SearchPayment /></ProtectedRoute>} />

            {/* Transport Routes */}
            <Route path="/admin/route" element={<ProtectedRoute><CreateRoute /></ProtectedRoute>} />
            <Route path="/admin/vehicle" element={<ProtectedRoute><VehicleList /></ProtectedRoute>} />
            <Route path="/admin/vehroute" element={<ProtectedRoute><VehicleRoute /></ProtectedRoute>} />
            <Route path="/admin/vehroute/edit/:id" element={<ProtectedRoute><VehicleRoute /></ProtectedRoute>} />
            <Route path="/admin/pickuppoint" element={<ProtectedRoute><PickupPointList /></ProtectedRoute>} />
            <Route path="/admin/routepickuppoint" element={<ProtectedRoute><AssignPickupPoint /></ProtectedRoute>} />
            <Route path="/admin/transportFeeMaster" element={<ProtectedRoute><TransportFeesMaster /></ProtectedRoute>} />
            <Route path="/admin/studenttransportfee" element={<ProtectedRoute><StudentTransportFees /></ProtectedRoute>} />

            {/* Academics Routes */}
            <Route path="/admin/classes" element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route path="/admin/classes/edit/:id" element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route path="/admin/section" element={<ProtectedRoute><SectionList /></ProtectedRoute>} />
            <Route path="/admin/section/edit/:id" element={<ProtectedRoute><SectionList /></ProtectedRoute>} />
            <Route path="/admin/subject" element={<ProtectedRoute><SubjectList /></ProtectedRoute>} />
            <Route path="/admin/subject/edit/:id" element={<ProtectedRoute><SubjectEdit /></ProtectedRoute>} />
            <Route path="/admin/timetable/classreport" element={<ProtectedRoute><ClassTimetable /></ProtectedRoute>} />
            <Route path="/admin/timetable/mytimetable" element={<ProtectedRoute><TeacherTimetable /></ProtectedRoute>} />
            <Route path="/admin/teacher/assign_class_teacher" element={<ProtectedRoute><AssignClassTeacher /></ProtectedRoute>} />
            <Route path="/admin/teacher/update_class_teacher/:class_id/:section_id" element={<ProtectedRoute><AssignClassTeacher /></ProtectedRoute>} />
            <Route path="/admin/teacher/assign_subject_teacher" element={<ProtectedRoute><SubjectTeacher /></ProtectedRoute>} />
            <Route path="/admin/stdtransfer" element={<ProtectedRoute><StdTransfer /></ProtectedRoute>} />
            <Route path="/admin/subjectgroup" element={<ProtectedRoute><SubjectGroupList /></ProtectedRoute>} />
            <Route path="/admin/subjectgroup/edit/:id" element={<ProtectedRoute><SubjectGroupList /></ProtectedRoute>} />
            <Route path="/admin/timetable/create" element={<ProtectedRoute><TimetableCreate /></ProtectedRoute>} />

            {/* Message Routes */}
            <Route path="/admin/mail" element={<ProtectedRoute><BulkMail /></ProtectedRoute>} />
            <Route path="/admin/mail/email_sms_log" element={<ProtectedRoute><EmailSmsLog /></ProtectedRoute>} />
            <Route path="/admin/mail/email_template" element={<ProtectedRoute><EmailTemplate /></ProtectedRoute>} />
            <Route path="/admin/notification" element={<ProtectedRoute><NoticeBoard /></ProtectedRoute>} />
            <Route path="/admin/notification/add" element={<ProtectedRoute><NoticeBoardAdd /></ProtectedRoute>} />
            <Route path="/admin/notification/edit/:id" element={<ProtectedRoute><NoticeBoardEdit /></ProtectedRoute>} />
            <Route path="/admin/mail/sms_template" element={<ProtectedRoute><SMSTemplate /></ProtectedRoute>} />
            <Route path="/admin/mail/schedule_log" element={<ProtectedRoute><ScheduleLog /></ProtectedRoute>} />
            <Route path="/admin/mail/send_reminders" element={<ProtectedRoute><SendReminders /></ProtectedRoute>} />
            <Route path="/admin/notification_class/index" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />
            <Route path="/admin/notification_class/add" element={<ProtectedRoute><NotificationAdd /></ProtectedRoute>} />
            <Route path="/admin/notification_class/edit/:id" element={<ProtectedRoute><NotificationAddEdit /></ProtectedRoute>} />
            <Route path="/admin/mailsms/edit_schedule/:id" element={<ProtectedRoute><ScheduleEdit /></ProtectedRoute>} />

            {/* SendWhatsApp Routes */}
            <Route path="/admin/sendwhatsapp/compose_sms" element={<ProtectedRoute><SendWhatsApp /></ProtectedRoute>} />
            <Route path="/admin/sendwhatsapp" element={<ProtectedRoute><WhatsAppLog /></ProtectedRoute>} />
            <Route path="/admin/sendwhatsapp/schedule" element={<ProtectedRoute><WhatsAppScheduleLog /></ProtectedRoute>} />

            {/* MailSMS Routes */}
            <Route path="/admin/mailsms/compose" element={<ProtectedRoute><ComposeEmail /></ProtectedRoute>} />
            <Route path="/admin/mailsms/compose_sms" element={<ProtectedRoute><ComposeSMS /></ProtectedRoute>} />
            <Route path="/admin/mailsms" element={<ProtectedRoute><EmailSMSLog /></ProtectedRoute>} />
            <Route path="/admin/mailsms/schedule" element={<ProtectedRoute><EmailSMSScheduleLog /></ProtectedRoute>} />
            <Route path="/admin/mailsms/email_template" element={<ProtectedRoute><MailEmailTemplate /></ProtectedRoute>} />
            <Route path="/admin/mailsms/sms_template" element={<ProtectedRoute><MailSMSTemplate /></ProtectedRoute>} />

            <Route path="/admin/communicate" element={<Navigate to="/admin/notification" replace />} />

            {/* Course Routes */}
            <Route path="/admin/onlinecourse" element={<ProtectedRoute><OnlineCourseCategory /></ProtectedRoute>} />
            <Route path="/admin/onlinecourse/list/:id" element={<ProtectedRoute><OnlineCourseList /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </LogoProvider>
  );
}

export default App;
