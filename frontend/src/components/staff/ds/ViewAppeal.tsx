import Image from 'next/image';
import React, { useState } from 'react';
import confirmBtn from '@/assets/confirm.svg';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { ClipLoader } from 'react-spinners';

const ViewAppeal = (appeal: any, close: () => void) => {
  const [modalRejecting, setModalRejecting] = useState(false);
  const [modalLoading, setModelLoading] = useState(false);
  const [rejectMsg, setRejectMsg] = useState('');
  const accept = () => {
    setModelLoading(true);

    AuthApi.patch(`/ds-appeals/approve/${appeal.appeal.id}`)
      .then((res) => {
        notifications.show({
          title: 'Appeal Accepted',
          message: `The appeal from  ${appeal.appeal?.disciplineMarksReduction?.student?.firstName} ${appeal.appeal?.disciplineMarksReduction?.student?.lastName} was accepted`,
          color: 'green',
          autoClose: 60000,
        });
        appeal.close();
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal Not Accepted',
          message: `The appeal from  ${appeal.appeal?.disciplineMarksReduction?.student?.firstName} ${appeal.appeal?.disciplineMarksReduction?.student?.lastName} was  not approved`,
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setModelLoading(false);
      });
  };
  const reject = () => {
    setModelLoading(true);
    AuthApi.patch(`/ds-appeals/reject/${appeal.appeal.id}`, { message: rejectMsg })
      .then((res) => {
        notifications.show({
          title: 'Appeal Rejected',
          message: `The appeal from  ${appeal.appeal?.disciplineMarksReduction?.student?.firstName} ${appeal.appeal?.disciplineMarksReduction?.student?.lastName} was rejected `,
          color: 'green',
          autoClose: 60000,
        });
        appeal.close();
      })
      .catch((err) => {
        notifications.show({
          title: 'Appeal Not Rejected',
          message: `The appeal from  ${appeal.appeal?.disciplineMarksReduction?.student?.firstName} ${appeal.appeal?.disciplineMarksReduction?.student?.lastName} was  not rejected`,
          color: 'red',
          autoClose: 60000,
        });
      })
      .finally(() => {
        setModelLoading(false);
      });
  };

  return (
    <div className="p-2 rounded-lg  min-w-[50vw]">
      <p className="font-semibold text-lg text-center">Appeal Description</p>
      <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '70%' }}>First Name: </p>
        <p>
          {appeal.appeal?.disciplineMarksReduction?.student?.firstName}{' '}
          {appeal.appeal?.disciplineMarksReduction?.student?.lastName}
        </p>
      </div>
      <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '70%' }}>Marks</p>
        <p>{appeal.appeal?.disciplineMarksReduction?.marks}</p>
      </div>
      <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '70%' }}>Reason for Appeal</p>
        <p>{appeal.appeal?.description}</p>
      </div>
      {!modalRejecting && appeal.appeal?.status === 'PENDING' && (
        <div className="flex items-center justify-between gap-10">
          <button
            onClick={() => setModalRejecting(true)}
            className="bg-primary rounded-md text-white px-5 py-2"
          >
            Reject
          </button>
          {modalLoading ? (
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
      )}
      {modalRejecting && (
        <div className="flex items-center flex-col">
          <textarea
            placeholder="Message for Rejecting Appeal"
            onChange={(e) => setRejectMsg(e.target.value)}
            className=" w-full  my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]"
          ></textarea>
          {!modalLoading ? (
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

export default ViewAppeal;
