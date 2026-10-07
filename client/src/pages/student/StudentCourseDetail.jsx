import { Link, useParams, useSearchParams } from 'react-router-dom';
import { announcementApi, assignmentApi, courseApi, gradeApi, materialApi, testApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import Tabs, { TabPanel } from '../../components/Tabs';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import CourseOverview from '../shared/CourseOverview';
import MaterialList from '../shared/MaterialList';
import AnnouncementList from '../shared/AnnouncementList';
import CourseGradeBreakdown from './CourseGradeBreakdown';
import { formatDateTime, formatShortDateTime, marks } from '../../utils/format';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'materials', label: 'Materials' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'tests', label: 'Tests' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'grades', label: 'Grades' },
];

function AssignmentsTab({ courseId }) {
  const { data, loading, error, reload } = useApi(() => assignmentApi.list({ courseId }), [courseId]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (data.length === 0) return <EmptyState title="No assignments yet" text="Assignments posted by your instructor will appear here." />;
  return (
    <section className="panel">
      <DataTable
        rows={data}
        columns={[
          {
            key: 'title',
            header: 'Assignment',
            stackTitle: true,
            render: (a) => (
              <>
                <Link to={`/student/assignments/${a.id}`} className="table__primary">{a.title}</Link>
                <span className="table__sub clamp-1">{a.description}</span>
              </>
            ),
          },
          { key: 'dueDate', header: 'Due', className: 'nowrap', render: (a) => formatShortDateTime(a.dueDate) },
          { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
          { key: 'marks', header: 'Marks', className: 'num nowrap', render: (a) => (a.status === 'graded' ? marks(a.submission.marks, a.maxMarks) : <span className="muted">— / {a.maxMarks}</span>) },
        ]}
      />
    </section>
  );
}

function TestsTab({ courseId }) {
  const { data, loading, error, reload } = useApi(() => testApi.list({ courseId }), [courseId]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (data.length === 0) return <EmptyState title="No tests scheduled" text="Online tests for this course will appear here once published." />;
  return (
    <section className="panel">
      <DataTable
        rows={data}
        columns={[
          { key: 'title', header: 'Test', stackTitle: true, render: (t) => <span className="table__primary">{t.title}</span> },
          {
            key: 'window',
            header: 'Available',
            render: (t) => (
              <span className="small">
                {formatDateTime(t.availableFrom)}
                <span className="table__sub">until {formatDateTime(t.availableUntil)}</span>
              </span>
            ),
          },
          { key: 'duration', header: 'Duration', className: 'nowrap', render: (t) => `${t.durationMinutes} min` },
          { key: 'marks', header: 'Marks', className: 'num nowrap', render: (t) => (t.state === 'completed' ? marks(t.attempt.score, t.totalMarks) : t.totalMarks) },
          { key: 'state', header: 'Status', render: (t) => <StatusBadge status={t.state} /> },
          {
            key: 'action',
            header: '',
            className: 'actions',
            render: (t) =>
              t.state === 'available' || t.state === 'in-progress' ? (
                <Link to={`/student/tests/${t.id}/take`} className="btn btn--primary btn--sm">{t.state === 'in-progress' ? 'Resume' : 'Start'}</Link>
              ) : t.state === 'completed' ? (
                <Link to={`/student/tests/${t.id}/result`} className="btn btn--link">View result</Link>
              ) : null,
          },
        ]}
      />
    </section>
  );
}

function MaterialsTab({ courseId }) {
  const { data, loading, error, reload } = useApi(() => materialApi.list({ courseId }), [courseId]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return <MaterialList materials={data} />;
}

function AnnouncementsTab({ courseId }) {
  const { data, loading, error, reload } = useApi(() => announcementApi.list({ courseId }), [courseId]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return <AnnouncementList announcements={data} />;
}

function GradesTab({ courseId }) {
  const { data, loading, error, reload } = useApi(() => gradeApi.mine({ courseId }), [courseId]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data.rows.length) return <EmptyState title="No grade information" />;
  return <CourseGradeBreakdown grade={data.rows[0]} />;
}

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview';
  const { data: course, loading, error, reload } = useApi(() => courseApi.get(courseId), [courseId]);

  const crumbs = [{ label: 'My Courses', to: '/student/courses' }, { label: course ? course.code : 'Course' }];

  if (loading) return <><PageHeader title="Course" breadcrumbs={crumbs} /><LoadingState /></>;
  if (error) return <><PageHeader title="Course" breadcrumbs={crumbs} /><ErrorState error={error} onRetry={reload} /></>;

  return (
    <>
      <PageHeader
        eyebrow={<span className="course-code">{course.code}</span>}
        title={course.title}
        documentTitle={`${course.code} ${course.title}`}
        breadcrumbs={crumbs}
        meta={`${course.teacher ? course.teacher.name : 'Instructor to be assigned'} · ${course.credits} credits · ${course.term}`}
      />
      <Tabs tabs={TABS} active={tab} onChange={(id) => setParams(id === 'overview' ? {} : { tab: id }, { replace: true })} label="Course sections" idPrefix="course-tab" />
      <TabPanel active={tab} idPrefix="course-tab">
        {tab === 'overview' && <CourseOverview course={course} />}
        {tab === 'materials' && <MaterialsTab courseId={courseId} />}
        {tab === 'assignments' && <AssignmentsTab courseId={courseId} />}
        {tab === 'tests' && <TestsTab courseId={courseId} />}
        {tab === 'announcements' && <AnnouncementsTab courseId={courseId} />}
        {tab === 'grades' && <GradesTab courseId={courseId} />}
      </TabPanel>
    </>
  );
}
