'use client';

import { useParams, useRouter } from 'next/navigation';
import DebugInfo from '@/components/dev/DebugInfo';
import AppealCommentsChat from '@/components/comments/AppealCommentsChat';

const CommentsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { appealId } = params as { appealId?: string };

  if (!appealId) return null;

  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <DebugInfo />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appeal Conversation</h1>
        <button onClick={() => router.back()} className="btn-outline">
          Back
        </button>
      </div>

      <AppealCommentsChat appealId={appealId} enableStatusUpdate={true} />
    </div>
  );
};

export default CommentsPage;
