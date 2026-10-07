import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { LoadingState, ErrorState } from '../../components/States';
import CourseFilter from './CourseFilter';
import AssignmentsManager from './AssignmentsManager';
import { useTeacherCourses } from './useTeacherCourses';

export default function TeacherAssignments() {
  const [params, setParams] = useSearchParams();
  const courseId = params.get('course') || '';
  const courses = useTeacherCourses();

  return (
    <>
      <PageHeader title="Assignments" meta="Create assignments, review submissions and enter marks." />
      {courses.loading && <LoadingState />}
      {courses.error && <ErrorState error={courses.error} onRetry={courses.reload} />}
      {courses.data && (
        <>
          <div className="toolbar">
            <CourseFilter courses={courses.data} value={courseId} onChange={(v) => setParams(v ? { course: v } : {}, { replace: true })} />
          </div>
          <AssignmentsManager key={courseId || 'all'} courseId={courseId || undefined} showCourse={!courseId} />
        </>
      )}
    </>
  );
}
