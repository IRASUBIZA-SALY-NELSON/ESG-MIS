import { PageProps } from '@/types/base.type';
import { AuthApi } from '@/utils/constants';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import AppealCommentsChat from '@/components/comments/AppealCommentsChat';

export const revalidate = 60;

export const metadata = {
  title: 'My Appeal',
  description: 'View a single appeal submitted by the logged in student',
};

const getAppealAndComments = async (appealId: string) => {
  try {
    const token = cookies().get('token')?.value;

    const [appealRes, commentsRes] = await Promise.all([
      AuthApi.get(`/academicAppeals/${appealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      AuthApi.get(`/academicAppeals/${appealId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const appeal = appealRes.data?.data ?? appealRes.data;
    const rawComments = commentsRes.data?.data ?? commentsRes.data;

    let comments: any[] = [];
    if (Array.isArray(rawComments)) comments = rawComments;
    else if (Array.isArray(rawComments?.data)) comments = rawComments.data;
    else if (Array.isArray(rawComments?.comments)) comments = rawComments.comments;

    return { appeal, comments };
  } catch (error) {
    return { appeal: null, comments: [] };
  }
};

export default async function StudentAppealPage({ params }: PageProps) {
  const appealId = params?.appealId as string | undefined;
  if (!appealId) return notFound();

  const { appeal, comments } = await getAppealAndComments(appealId);

  if (!appeal) return notFound();

  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appeal Details</h1>
      </div>

      {/* Appeal Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
            <p className="text-lg">
              {appeal.student?.firstName} {appeal.student?.lastName}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Course</h3>
            <p className="text-lg">{appeal.course?.courseName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date Submitted</h3>
            <p className="text-lg">{new Date(appeal.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                appeal.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : appeal.status === 'REVIEWING'
                    ? 'bg-blue-100 text-blue-800'
                    : appeal.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
              }`}
            >
              {appeal.status}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="text-lg mt-1">{appeal.description}</p>
        </div>
      </div>

      {/* Comments - interactive chat component for students */}
      <AppealCommentsChat
        appealId={appealId}
        initialComments={comments}
        enableStatusUpdate={false}
      />
    </div>
  );
}
