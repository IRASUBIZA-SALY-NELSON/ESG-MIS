import { Metadata } from 'next';
import TermIndex from './_indexPage';

export const revalidate = 15; // seconds

export const metadata: Metadata = {
  title: 'Terms - RCAMIS',
  description: 'View and manage terms',
};

const TermPage = async () => {
  return <TermIndex terms={[]} />;
};

export default TermPage;
