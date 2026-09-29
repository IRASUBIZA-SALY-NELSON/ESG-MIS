import { fetcher } from '@/utils/constants';
import { Metadata } from 'next';
import TermIndex from './_indexPage';
import { ITerm } from '@/types/other.type';

export const revalidate = 15; // seconds

export const metadata: Metadata = {
  title: 'Terms - RCAMIS',
  description: 'View and manage terms',
};

// const getTerms = async () => {
//   try {
//     const res = await fetcher('/terms/all');

//     if (res?.status === 500) throw new Error('Server error');
//     return Array.isArray(res.data) ? (res.data as ITerm[]) : [];
//   } catch (error) {

//     return [];
//   }
// };

const TermPage = async () => {
  // const terms = await getTerms();
  return <TermIndex terms={[]} />;
};

export default TermPage;
