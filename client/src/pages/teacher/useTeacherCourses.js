import { courseApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';

export function useTeacherCourses() {
  return useApi(() => courseApi.list(), []);
}
