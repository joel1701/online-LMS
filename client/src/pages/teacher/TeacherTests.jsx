import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { LoadingState, ErrorState } from '../../components/States';
import CourseFilter from './CourseFilter';
import TestsManager from './TestsManager';
import { useTeacherCourses } from './useTeacherCourses';

export default function TeacherTests() {
  const [params, setParams] = useSearchParams();
  const courseId = params.get('course') || '';
  const courses = useTeacherCourses();

  return (
    <>
      <PageHeader title="Tests" meta="Online multiple-choice tests. Drafts are not visible to students until published." />
      {courses.loading && <LoadingState />}
      {courses.error && <ErrorState error={courses.error} onRetry={courses.reload} />}
      {courses.data && (
        <>
          <div className="toolbar">
            <CourseFilter courses={courses.data} value={courseId} onChange={(v) => setParams(v ? { course: v } : {}, { replace: true })} />
          </div>
          <TestsManager key={courseId || 'all'} courseId={courseId || undefined} showCourse={!courseId} />
        </>
      )}
    </>
  );
}
