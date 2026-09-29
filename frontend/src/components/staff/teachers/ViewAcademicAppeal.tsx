import Image from 'next/image';
import React, { useState } from 'react';
import confirmBtn from '@/assets/confirm.svg';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { ClipLoader } from 'react-spinners';

const ViewAcademicAppeal = (appeal: any, close: () => void) => {
  const [modalRejecting, setModalRejecting] = useState(false);
  const [modalLoading, setModelLoading] = useState('');
  const [rejectMsg, setRejectMsg] = useState('');

  const accept = () => {
    setModelLoading('accepting');
    AuthApi.get(`/academicAppeals/approve/${appeal.appeal.id}`, appeal.appeal)
      .then((res) => {
        notifications.show({
          title: 'Appeal Accepted',
          message: `The appeal from  ${appeal.appeal?.student?.firstName} ${appeal.appeal?.student?.lastName} was accepted`,
          color: 'green',
          autoClose: 60000,
        });
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal Not Accepted',
          message: `The appeal from  ${appeal.appeal?.student?.firstName} ${appeal.appeal?.student?.lastName} was  not canceled`,
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setModelLoading('');
      });
  };

  const reviewing = () => {
    setModelLoading('reviewing');
    AuthApi.get(`/academicAppeals/reviewing/${appeal.appeal.id}`)
      .then((res) => {
        notifications.show({
          title: 'Appeal set to reviewing stage',
          message: `The appeal from  ${appeal?.appeal?.student?.firstName} ${appeal?.appeal?.student?.lastName} was set to the reviewing stage successfully`,
          color: 'green',
          autoClose: 60000,
        });
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal  not set to reviewing stage',
          message: 'There was an error setting the appeal to reviewing stage',
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setModelLoading('');
      });
  };

  const reject = () => {
    setModelLoading('rejecting');
    AuthApi.put(`/academicAppeals/reject/${appeal.appeal.id}`, { message: rejectMsg })
      .then((res) => {
        notifications.show({
          title: 'Appeal Rejected',
          message: `The appeal from  ${appeal.appeal?.student?.firstName} ${appeal.appeal?.student?.lastName} was rejected `,
          color: 'green',
          autoClose: 60000,
        });
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal Not Rejected',
          message: `The appeal from  ${appeal.appeal?.student?.firstName} ${appeal.appeal?.student?.lastName} was  not rejected`,
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setModelLoading('');
      });
  };
  return (
    <div className="p-2 rounded-lg bg-[#F5FAF7] min-w-full">
      <p className="my-5 font-semibold text-lg text-center">Appeal Description</p>
      <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '70%' }}>Student Name: </p>
        <p style={{ fontSize: '90%' }}>
          {appeal.appeal?.student?.firstName} {appeal.appeal?.student?.lastName}
        </p>
      </div>
      <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '70%' }}>Reason for Appeal</p>
        <p style={{ fontSize: '90%' }}>{appeal.appeal?.description}</p>
      </div>
      {(!modalRejecting && appeal.appeal?.status === 'PENDING') ||
        (appeal.appeal?.status === 'REVIEWING' && (
          <div
            className={`grid ${appeal.appeal.status === 'REVIEWING' ? 'grid-cols-2' : 'grid-cols-3 '} gap-5 text-sm mt-4`}
          >
            {appeal.appeal?.status !== 'REVIEWING' && (
              <>
                {modalLoading === 'reviewing' ? (
                  <div className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-5 py-2 flex items-center justify-center">
                    <ClipLoader size={15} color="white" />
                  </div>
                ) : (
                  <button
                    onClick={reviewing}
                    className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-5 py-2"
                  >
                    Set to Reviewing
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setModalRejecting(true)}
              className="bg-primary rounded-md text-white px-5 py-2"
            >
              Reject
            </button>
            {modalLoading === 'accepting' ? (
              <div className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-5 py-2 flex items-center justify-center">
                <ClipLoader size={15} color="white" />
              </div>
            ) : (
              <button
                onClick={accept}
                className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-5 py-2"
              >
                Accept
              </button>
            )}
          </div>
        ))}
      {modalRejecting && (
        <div className="flex items-center flex-col">
          <textarea
            placeholder="Message for Rejecting Appeal"
            onChange={(e) => setRejectMsg(e.target.value)}
            className=" w-full  my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]"
          ></textarea>
          {!(modalLoading === 'rejecting') ? (
            <button
              onClick={() => {
                reject();
                close();
              }}
              className="bg-primary rounded-md text-white px-5 py-2 flex gap-2 items-center"
            >
              <Image src={confirmBtn} alt="" />
              <p>Confirm</p>
            </button>
          ) : (
            <div className="bg-primary rounded-md text-white px-5 py-2 flex gap-2 items-center  w-[200px] justify-center">
              <ClipLoader size={15} color="white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewAcademicAppeal;
