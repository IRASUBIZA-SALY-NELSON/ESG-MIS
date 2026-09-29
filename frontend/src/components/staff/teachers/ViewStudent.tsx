import Image from 'next/image';
import React, { FC } from 'react';
import { BiX } from 'react-icons/bi';

interface Props {
  closeUserModal: () => void;
  closeStudentModal: () => void;
  profile: any;
}

const ViewStudent: FC<Props> = ({ closeUserModal, closeStudentModal, profile }) => {
  return (
    <div className="p-2 rounded-lg bg-[#F5FAF7] max-w-[80vw] min-w-[70vw]  text-center relative">
      <button
        onClick={closeUserModal}
        className="absolute -right-1 -top-1 bg-[#F5FAF7] p-3 rounded-full"
      >
        <BiX className="w-5 h-5" onClick={closeStudentModal} />
      </button>
      <p className="my-5 font-semibold text-lg text-center">Student's Profile</p>
      <div className="flex gap-5">
        <div className="w-[25%]">
          <BiX className="w-20 h-20 rounded-full bg-[#F5FAF7] text-[#00000060]" />
        </div>
        <div className="w-[75%]">
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Name: </p>
            <p style={{ fontSize: '80%' }}>{profile.firstName}</p>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Email: </p>
            <p style={{ fontSize: '80%' }}>{profile.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '60%' }}>Gender: </p>
              <p style={{ fontSize: '80%' }}>{profile.gender}</p>
            </div>
            <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '60%' }}>Register Code: </p>
              <p style={{ fontSize: '80%' }}>{profile?.registerCode}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
        <p style={{ fontSize: '60%' }}>Province Of Residence: </p>
        <p style={{ fontSize: '80%' }}>{profile.firstName.split(' ')[0]}</p>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Disctrict: </p>
            <p style={{ fontSize: '80%' }}>John Doe</p>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Cell: </p>
            <p style={{ fontSize: '80%' }}>John Doe</p>
          </div>
        </div>
        <div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Sector: </p>
            <p style={{ fontSize: '80%' }}>John Doe</p>
          </div>
          <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
            <p style={{ fontSize: '60%' }}>Village: </p>
            <p style={{ fontSize: '80%' }}>John Doe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;
