'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthApi } from '@/utils/constants';
import { getCookie } from 'cookies-next';
import { notifications } from '@mantine/notifications';
import { Button, Textarea } from '@mantine/core';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import DebugInfo from '@/components/dev/DebugInfo';
import AppealCommentsChat from '@/components/comments/AppealCommentsChat';

interface Appeal {
  id: string;
  appealID: string;
  description: string;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  student: {
    firstName: string;
    lastName: string;
  };
  course: {
    courseName: string;
  };
  createdAt: string;
}

const AppealDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { appealId } = params;

  const [loading, setLoading] = useState(false);
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [modalAction, setModalAction] = useState<'reviewing' | 'approved' | 'rejected' | null>(
    null,
  );
  const [rejectMessage, setRejectMessage] = useState('');

  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const [loadingAppeal, setLoadingAppeal] = useState(false);
  const [appealError, setAppealError] = useState<any>(null);

  const fetchAppeal = async () => {
    if (!appealId) return;
    setLoadingAppeal(true);
    setAppealError(null);
    try {
      const response = await AuthApi.get(`/academicAppeals/${appealId}`, {
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });
      // Some endpoints wrap actual data in response.data.data
      setAppeal(response.data?.data ?? response.data);
    } catch (err) {
      setAppealError(err);
      notifications.show({ title: 'Error', message: 'Failed to load appeal', color: 'red' });
    } finally {
      setLoadingAppeal(false);
    }
  };

  const handleStatusChange = async (action: 'reviewing' | 'approved' | 'rejected') => {
    setModalAction(action);
    open();
  };

  const executeStatusChange = async () => {
    if (!modalAction) return;

    setLoading(true);
    try {
      let response;

      switch (modalAction) {
        case 'reviewing':
          response = await AuthApi.get(`/academicAppeals/reviewing/${appealId}`, {
            headers: { Authorization: `Bearer ${getCookie('token')}` },
          });
          break;
        case 'approved':
          response = await AuthApi.get(`/academicAppeals/approve/${appealId}`, {
            headers: { Authorization: `Bearer ${getCookie('token')}` },
          });
          break;
        case 'rejected':
          response = await AuthApi.put(
            `/academicAppeals/reject/${appealId}`,
            { message: rejectMessage },
            { headers: { Authorization: `Bearer ${getCookie('token')}` } },
          );
          break;
      }
      notifications.show({
        title: 'Success',
        message: `Appeal ${modalAction} successfully`,
        color: 'green',
      });

      close();
      setRejectMessage('');
      fetchAppeal(); // Refresh appeal data
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${modalAction} appeal`,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appealId) {
      fetchAppeal();
    }
  }, [appealId]);

  if (loadingAppeal) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading appeal details...</div>
      </div>
    );
  }

  if (appealError || !appeal) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg text-red-500">Failed to load appeal details</div>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-2 overflow-y-auto pr-1">
      <DebugInfo />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appeal Details</h1>
        <Button onClick={() => router.back()} variant="outline">
          Back to Appeals
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
            <p className="text-lg">
              {appeal.student.firstName} {appeal.student.lastName}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Course</h3>
            <p className="text-lg">{appeal.course.courseName}</p>
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

      {/* Status Actions */}
      {appeal.status === 'PENDING' || appeal.status === 'REVIEWING' ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {appeal.status === 'PENDING' && (
              <Button onClick={() => handleStatusChange('reviewing')} color="blue">
                Set to Reviewing
              </Button>
            )}
            <Button onClick={() => handleStatusChange('approved')} color="green">
              Approve Appeal
            </Button>
            <Button onClick={() => handleStatusChange('rejected')} color="red">
              Reject Appeal
            </Button>
          </div>
        </div>
      ) : null}

      {/* Comments Section (chat) */}
      <AppealCommentsChat appealId={appealId as string} enableStatusUpdate={true} />

      {/* Status Change Confirmation Modal */}
      <Modal opened={modalOpened} onClose={close} title="Confirm Action" centered>
        <div>
          {modalAction === 'rejected' ? (
            <div>
              <Textarea
                placeholder="Reason for rejection"
                value={rejectMessage}
                onChange={(e: any) => setRejectMessage(e.target.value)}
                minRows={3}
                className="mb-4"
              />
            </div>
          ) : (
            <p className="mb-4">Are you sure you want to {modalAction} this appeal?</p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={executeStatusChange}
              color={
                modalAction === 'rejected' ? 'red' : modalAction === 'approved' ? 'green' : 'blue'
              }
              loading={loading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppealDetailPage;
