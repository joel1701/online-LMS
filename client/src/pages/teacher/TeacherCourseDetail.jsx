import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { courseApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import Tabs, { TabPanel } from '../../components/Tabs';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import CourseOverview from '../shared/CourseOverview';
import AnnouncementsManager from '../shared/AnnouncementsManager';
import MaterialsManager from './MaterialsManager';
import AssignmentsManager from './AssignmentsManager';
import TestsManager from './TestsManager';

function StudentsTab({ course }) {
  const [search, setSearch] = useState('');
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return course.students.filter((s) => !term || s.name.toLowerCase().includes(term) || s.universityId.toLowerCase().includes(term));
  }, [course.students, search]);

  return (
    <>
      <div className="toolbar">
        <div className="field toolbar__search">
          <label className="field__label" htmlFor="student-search">Search students</label>
          <input id="student-search" className="input" type="search" placeholder="Name or university ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="toolbar__spacer" />
        <Link to={`/teacher/performance?course=${course.id}`} className="btn btn--secondary">View performance</Link>
      </div>
      <section className="panel">
        {course.students.length === 0 ? (
          <EmptyState title="No students enrolled" text="Enrolment is managed by the Registrar’s Office." />
        ) : rows.length === 0 ? (
          <EmptyState compact title="No matching students" />
        ) : (
          <DataTable
            rows={rows}
            columns={[
              { key: 'universityId', header: 'University ID', render: (s) => <span className="mono">{s.universityId}</span> },
              { key: 'name', header: 'Name', render: (s) => <span className="table__primary">{s.name}</span> },
              { key: 'email', header: 'Email', render: (s) => <a href={`mailto:${s.email}`}>{s.email}</a> },
              { key: 'status', header: 'Account', render: (s) => <StatusBadge status={s.status} /> },
            ]}
          />
        )}
        <div className="panel__foot muted">{course.students.length} enrolled</div>
      </section>
    </>
  );
}

export default function TeacherCourseDetail() {
  const { courseId } = useParams();
  const [params, setParams] = useSearchParams();
  const { data: course, loading, error, reload } = useApi(() => courseApi.get(courseId), [courseId]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students', count: course ? course.studentCount : undefined },
    { id: 'announcements', label: 'Announcements' },
    { id: 'materials', label: 'Materials' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'tests', label: 'Tests' },
  ];
  const tab = tabs.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview';
  const crumbs = [{ label: 'My Courses', to: '/teacher/courses' }, { label: course ? course.code : 'Course' }];

  if (loading) return <><PageHeader title="Course" breadcrumbs={crumbs} /><LoadingState /></>;
  if (error) return <><PageHeader title="Course" breadcrumbs={crumbs} /><ErrorState error={error} onRetry={reload} /></>;

  return (
    <>
      <PageHeader
        eyebrow={<span className="course-code">{course.code}</span>}
        title={course.title}
        documentTitle={`${course.code} ${course.title}`}
        breadcrumbs={crumbs}
        meta={`Semester ${course.semester} · ${course.credits} credits · ${course.studentCount} students · ${course.term}`}
        actions={course.status === 'archived' && <StatusBadge status="archived" />}
      />
      <Tabs tabs={tabs} active={tab} onChange={(id) => setParams(id === 'overview' ? {} : { tab: id }, { replace: true })} label="Course management" idPrefix="tcourse" />
      <TabPanel active={tab} idPrefix="tcourse">
        {tab === 'overview' && <CourseOverview course={course} />}
        {tab === 'students' && <StudentsTab course={course} />}
        {tab === 'announcements' && <AnnouncementsManager courseId={course.id} audience={`students of ${course.code}`} />}
        {tab === 'materials' && <MaterialsManager courses={[course]} courseId={course.id} />}
        {tab === 'assignments' && <AssignmentsManager courseId={course.id} showCourse={false} />}
        {tab === 'tests' && <TestsManager courseId={course.id} showCourse={false} />}
      </TabPanel>
    </>
  );
}
