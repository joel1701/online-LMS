import { useMemo, useState } from 'react';
import { courseApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import PageHeader from '../../components/PageHeader';
import CourseListItem from '../../components/CourseListItem';
import { LoadingState, ErrorState, EmptyState } from '../../components/States';
import { CURRENT_TERM } from '../../data/navigation';
import { COURSE_GROUPS } from '../../data/courseGroups';

export default function StudentCourses() {
  const { data, loading, error, reload } = useApi(() => courseApi.list(), []);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!data) return [];
    return data.filter((c) => !term || [c.code, c.title, c.teacher && c.teacher.name].some((v) => v && v.toLowerCase().includes(term)));
  }, [data, search]);

  const credits = data ? data.reduce((s, c) => s + c.credits, 0) : 0;

  return (
    <>
      <PageHeader
        title="My Courses"
        meta={data ? `${data.length} courses · ${credits} credits · ${CURRENT_TERM}` : CURRENT_TERM}
      />

      <div className="toolbar">
        <div className="field toolbar__search">
          <label className="field__label" htmlFor="course-search">Search courses</label>
          <input id="course-search" className="input" type="search" placeholder="Code, title or instructor" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {(loading || error || (data && data.length === 0) || (data && data.length > 0 && filtered.length === 0)) && (
        <section className="panel">
          {loading && <LoadingState />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.length === 0 && <EmptyState title="You are not enrolled in any courses" text="Course registration is handled by your department office." />}
          {data && data.length > 0 && filtered.length === 0 && (
            <EmptyState title="No matching courses" text={`Nothing matches “${search}”.`} action={<button type="button" className="btn btn--secondary btn--sm" onClick={() => setSearch('')}>Clear search</button>} />
          )}
        </section>
      )}

      {COURSE_GROUPS.map((g) => {
        const items = filtered.filter((c) => (c.type || 'theory') === g.type);
        if (items.length === 0) return null;
        const groupCredits = items.reduce((s, c) => s + c.credits, 0);
        return (
          <section key={g.type} className="panel" aria-labelledby={`courses-${g.type}`}>
            <div className="panel__head">
              <h2 id={`courses-${g.type}`}>{g.label}</h2>
              <span className="small text-secondary">
                {items.length} {items.length === 1 ? 'course' : 'courses'} · {groupCredits} credits
              </span>
            </div>
            <div className="course-list__head" aria-hidden="true">
              <span>Course</span>
              <span>Progress</span>
              <span>Upcoming work</span>
            </div>
            <ul className="course-list">
              {items.map((c) => (
                <CourseListItem key={c.id} course={c} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
