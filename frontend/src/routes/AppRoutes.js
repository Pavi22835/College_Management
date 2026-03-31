import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import DashboardLayout from '../components/Layout/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminStudents from '../pages/admin/Students';
import AdminStaff from '../pages/admin/StaffRoles/Staff';
import AdminStaffHOD from '../pages/admin/StaffRoles/StaffHOD';
import AdminStaffFaculty from '../pages/admin/StaffRoles/StaffFaculty';
import AdminStaffMentor from '../pages/admin/StaffRoles/StaffMentor';
import AdminCourses from '../pages/admin/Courses';
import AdminAttendance from '../pages/admin/Attendance';
import AdminTrash from '../pages/admin/Trash';
import AdminLogs from '../pages/admin/Logs';
import AdminUsers from '../pages/admin/Users';
import AdminDepartments from '../pages/admin/Departments';
import AdminReports from '../pages/admin/Reports';
import AcademicCalendar from '../pages/admin/AcademicCalendar';
import FeeManagement from '../pages/admin/FeeManagement';

// Teacher Pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffCourses from '../pages/staff/Courses';
import StaffStudents from '../pages/staff/Students';
import StaffAttendance from '../pages/staff/Attendance';
import StaffReports from '../pages/staff/Reports';
import StaffCommunication from '../pages/staff/Communication';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentCourses from '../pages/student/Courses';
import StudentAttendance from '../pages/student/Attendance';
import StudentGrades from '../pages/student/Grades';
import StudentAssignments from '../pages/student/Assignments';
import StudentSchedule from '../pages/student/Schedule';
import StudentCommunication from '../pages/student/Communication';
import StudentProfile from '../pages/student/Profile';

// Shared Page
import NotFound from '../pages/shared/NotFound';

// Route Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import StaffRoute from './StaffRoute';
import StudentRoute from './StudentRoute';

// Loading component
import Spinner from '../components/common/Spinner';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  console.log('📍 AppRoutes - Rendering...');
  console.log('📍 AppRoutes - User:', user);
  console.log('📍 AppRoutes - User role:', user?.role);
  console.log('📍 AppRoutes - Loading:', loading);

  if (loading) {
    console.log('⏳ AppRoutes - Showing spinner (loading)');
    return <Spinner />;
  }

  // If no user, show ONLY login routes
  if (!user) {
    console.log('🔓 AppRoutes - No user, showing login page');
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const role = user.role?.toUpperCase();
  console.log('📍 AppRoutes - User is authenticated with role:', role);

  // If user has no role (shouldn't happen, but just in case)
  if (!role) {
    console.log('⚠️ AppRoutes - User has no role, logging out');
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Admin Routes */}
      {role === 'ADMIN' && (
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminRoute>
              <DashboardLayout />
            </AdminRoute>
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          
          {/* Staff Management Routes - with subcategories */}
          <Route path="staff" element={<AdminStaff />} />
          <Route path="staff/hod" element={<AdminStaffHOD />} />
          <Route path="staff/faculty" element={<AdminStaffFaculty />} />
          <Route path="staff/mentor" element={<AdminStaffMentor />} />
          
          <Route path="courses" element={<AdminCourses />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="academic-calendar" element={<AcademicCalendar />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="trash" element={<AdminTrash />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>
      )}

      {/* Staff Routes (Teachers) */}
      {role === 'STAFF' && (
        <Route path="/staff" element={
          <PrivateRoute>
            <StaffRoute>
              <DashboardLayout />
            </StaffRoute>
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="courses" element={<StaffCourses />} />
          <Route path="students" element={<StaffStudents />} />
          <Route path="attendance" element={<StaffAttendance />} />
          <Route path="reports" element={<StaffReports />} />
          <Route path="communication" element={<StaffCommunication />} />
        </Route>
      )}

      {/* Student Routes */}
      {role === 'STUDENT' && (
        <Route path="/student" element={
          <PrivateRoute>
            <StudentRoute>
              <DashboardLayout />
            </StudentRoute>
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="communication" element={<StudentCommunication />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      )}

      {/* Root redirect */}
      <Route path="/" element={
        role ? <Navigate to={`/${role.toLowerCase()}/dashboard`} replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Login route - if user is already logged in, redirect to dashboard */}
      <Route path="/login" element={user ? <Navigate to={`/${role.toLowerCase()}/dashboard`} replace /> : <Login />} />
      
      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;