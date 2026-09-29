import { PageProps } from '@/types/base.type';
import { getTokenData } from '@/utils/fetch';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import TranscriptPage from './_transcript_page';

export const metadata = {
  title: 'Student Academic Transcript',
  description: 'Official Academic Transcript — Ecole des Sciences de Gisenyi',
};

async function StudentTranscriptPage({ params }: PageProps) {
  const token = cookies().get('token');
  const studentInfo = getTokenData(token?.value);

  if (!studentInfo?.userId) return notFound();

  return <TranscriptPage userId={studentInfo.userId} />;
}

export default StudentTranscriptPage;
