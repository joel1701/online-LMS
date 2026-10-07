import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { LoadingState, ErrorState } from '../../components/States';
import CourseFilter from './CourseFilter';
import MaterialsManager from './MaterialsManager';
import { useTeacherCourses } from './useTeacherCourses';

export default function TeacherMaterials() {
  const [params, setParams] = useSearchParams();
  const courseId = params.get('course') || '';
  const courses = useTeacherCourses();

  return (
    <>
      <PageHeader title="Study Materials" meta="Lecture notes, slides and reference links shared with your students." />
      {courses.loading && <LoadingState />}
      {courses.error && <ErrorState error={courses.error} onRetry={courses.reload} />}
      {courses.data && (
        <>
          <div className="toolbar">
            <CourseFilter courses={courses.data} value={courseId} onChange={(v) => setParams(v ? { course: v } : {}, { replace: true })} />
          </div>
          <MaterialsManager key={courseId || 'all'} courses={courses.data} courseId={courseId || undefined} />
        </>
      )}
    </>
  );
}
