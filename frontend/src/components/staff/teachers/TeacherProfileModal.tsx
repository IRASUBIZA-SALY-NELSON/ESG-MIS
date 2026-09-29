import useGet from '@/hooks/useGet';
import { ICourse } from '@/types/course.type';
import { Teacher } from '@/types/teacher.type';
import Image from 'next/image';
import { title } from 'process';
import { FC } from 'react';

interface TeacherProfileModalProps {
  closeUserModal: () => void;
  currentUser: Teacher | null | undefined;
}

const TeacherProfileModal: FC<TeacherProfileModalProps> = ({ closeUserModal, currentUser }) => {
  return (
    <div className="p-2 rounded-lg  w-[70vw]  text-center relative">
      <div className="flex gap-5">
        <div className="w-[25%]">
          <Image
            src={
              currentUser?.profilePicture ||
              'https://w7.pngwing.com/pngs/481/915/png-transparent-computer-icons-user-avatar-woman-avatar-computer-business-conversation-thumbnail.png'
            }
            alt=""
            className="w-[100%]"
            width={100}
            height={100}
          />
        </div>
        <div className="w-[75%]">
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Full Name: </p>
            <p style={{ fontSize: '80%' }}>
              {currentUser?.firstName + ' ' + currentUser?.lastName}
            </p>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Email: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.email}</p>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '60%' }}>Gender: </p>
              <p style={{ fontSize: '80%' }}>{currentUser?.gender}</p>
            </div>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Phone: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.phoneNumber || 'Not set'}</p>
          </div>
        </div>
      </div>
      <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '60%' }}>Province of Residence: </p>
        <p style={{ fontSize: '80%' }}>{currentUser?.address?.province}</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>District: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.address?.district}</p>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Sector: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.address?.sector}</p>
          </div>
        </div>
        <div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Cell: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.address?.cell}</p>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Village: </p>
            <p style={{ fontSize: '80%' }}>{currentUser?.address?.village}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;
