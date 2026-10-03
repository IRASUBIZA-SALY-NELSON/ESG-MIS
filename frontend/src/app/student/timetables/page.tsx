import { redirect } from 'next/navigation';

/** Legacy URL — real timetable lives at /student/timetable (no build-time PDF rendering). */
export default function StudentTimetablesRedirect() {
  redirect('/student/timetable');
}
