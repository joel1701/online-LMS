import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, ROLE_HOME } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './layouts/PortalLayout';
import { LoadingState } from './components/States';

import Login from './pages/auth/Login';
import NotFound from './pages/shared/NotFound';
import Profile from './pages/shared/Profile';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentAssignmentDetail from './pages/student/StudentAssignmentDetail';
import StudentTests from './pages/student/StudentTests';
import TakeTest from './pages/student/TakeTest';
import TestResult from './pages/student/TestResult';
import StudentGrades from './pages/student/StudentGrades';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherCourseDetail from './pages/teacher/TeacherCourseDetail';
import TeacherMaterials from './pages/teacher/TeacherMaterials';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import AssignmentForm from './pages/teacher/AssignmentForm';
import AssignmentSubmissions from './pages/teacher/AssignmentSubmissions';
import TeacherTests from './pages/teacher/TeacherTests';
import TestBuilder from './pages/teacher/TestBuilder';
import TestResults from './pages/teacher/TestResults';
import TeacherPerformance from './pages/teacher/TeacherPerformance';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import CourseForm from './pages/admin/CourseForm';

function HomeRedirect() {
  const { user, checking } = useAuth();
  if (checking) return <LoadingState label="Checking your session…" />;
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />;
}

const guard = (roles) => (
  <ProtectedRoute roles={roles}>
    <PortalLayout />
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route path="/student" element={guard(['student'])}>
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="courses/:courseId" element={<StudentCourseDetail />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="assignments/:assignmentId" element={<StudentAssignmentDetail />} />
        <Route path="tests" element={<StudentTests />} />
        <Route path="tests/:testId/take" element={<TakeTest />} />
        <Route path="tests/:testId/result" element={<TestResult />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound inPortal />} />
      </Route>

      <Route path="/teacher" element={guard(['teacher'])}>
        <Route index element={<TeacherDashboard />} />
        <Route path="courses" element={<TeacherCourses />} />
        <Route path="courses/:courseId" element={<TeacherCourseDetail />} />
        <Route path="materials" element={<TeacherMaterials />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="assignments/new" element={<AssignmentForm />} />
        <Route path="assignments/:assignmentId/edit" element={<AssignmentForm />} />
        <Route path="assignments/:assignmentId/submissions" element={<AssignmentSubmissions />} />
        <Route path="tests" element={<TeacherTests />} />
        <Route path="tests/new" element={<TestBuilder />} />
        <Route path="tests/:testId/edit" element={<TestBuilder />} />
        <Route path="tests/:testId/results" element={<TestResults />} />
        <Route path="performance" element={<TeacherPerformance />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound inPortal />} />
      </Route>

      <Route path="/admin" element={guard(['admin'])}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/new" element={<CourseForm />} />
        <Route path="courses/:courseId/edit" element={<CourseForm />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound inPortal />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
