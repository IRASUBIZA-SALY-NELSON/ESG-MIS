import { PageProps } from '@/types/base.type';
import { AuthApi } from '@/utils/constants';
import { getTokenData } from '@/utils/fetch';
import { notFound } from 'next/navigation';
import ReportsIndex from './_index_page';
import { cookies } from 'next/headers';

export const revalidate = 60;

export const metadata = {
  title: 'Student Report Card',
  description: 'Student Report Card',
};

const getReportCardInfo = async (academicYearId: string, userId: string) => {
  try {
    const res = await AuthApi.get('/academicMarks/report-card/by-loggedIn-student', {
      params: {
        academicYearId,
        userId,
      },
      headers: {
        Authorization: `Bearer ${cookies().get('token')?.value}`,
      },
    });
    const finalData = res.data.data;
    return { data: finalData, error: null };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Unable to load the report card.';
    return { data: null, error: message };
  }
};

async function StudentReportPage({ params }: PageProps) {
  const academicYearId = params?.id;
  const token = cookies().get('token');
  const studentInfo = getTokenData(token?.value);

  if (!academicYearId || !studentInfo) return notFound();

  const userId = studentInfo.userId;

  const { data: reportCardInfo, error } = await getReportCardInfo(academicYearId, userId);
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Unable to load report card</h1>
          <p className="mt-2 text-[#000000B2]">{error}</p>
        </div>
      </div>
    );
  }
  if (!reportCardInfo) return notFound();

  return <ReportsIndex reportCardInfo={reportCardInfo} userId={userId} />;
}

export default StudentReportPage;
