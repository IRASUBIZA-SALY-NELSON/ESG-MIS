import { Metadata } from 'next';
import TimeTableIndex from './_indexPage';

export const metadata: Metadata = {
  title: 'TimeTable - RCAMIS',
  description: 'View and manage terms',
};

const TimeTablePage = async () => {
  return <TimeTableIndex />;
};

export default TimeTablePage;
