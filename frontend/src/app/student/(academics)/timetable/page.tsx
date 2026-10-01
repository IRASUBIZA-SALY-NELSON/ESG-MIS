import { Metadata } from 'next';
import TimeTableIndex from './_indexPage';

export const metadata: Metadata = {
  title: 'Timetable - ESG',
  description: 'View timetable',
};

const TimeTablePage = async () => {
  return <TimeTableIndex />;
};

export default TimeTablePage;
