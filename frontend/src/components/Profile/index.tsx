'use client';
import { useUserContext } from '@/context/Usercontext';
import { deleteCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

const AccountProfile = () => {
  const { profile } = useUserContext();
  const navigate = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('rcaappuser');
    localStorage.removeItem('token');
    deleteCookie('role');
    deleteCookie('token');
    navigate.push('/');
  };
  return (
    <div className="w-full h-full overflow-x-hidden p-2 text-sm">
      <header className="text-[#000000B2] font-semibold mx-1 my-2">Account Profile</header>

      <div className="w-full flex flex-col justify-between mt-2">
        <Image
          src={(profile?.profilePicture as string) ?? '/logo.png'}
          width={100}
          height={100}
          alt={`${profile?.firstName}'s Image`}
          className="w-[10rem] h-[10rem] rounded-[100%] self-center border border-[rgba(67,67,67,0.09)] bg-[rgba(67,67,67,0.03)]  rounded-lg my-2"
        ></Image>
        <div className="w-full flex flex-col md:flex-row justify-center gap-3">
          <div className="w-full md:w-[38%]">
            <p className="text-[rgba(67,67,67,0.43)] mt-[-1rem] pt-3">Personal Info</p>
            <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>First Name: </p>
              <p>{profile?.firstName || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Last Name: </p>
              <p>{profile?.lastName || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Email: </p>
              <p>{profile?.email || 'Not set'}</p>
            </div>

            <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Phone Number: </p>
              <p>{profile?.phoneNumber || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>National ID: </p>
              <p>{profile?.nationalId || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Member Since: </p>
              <p>{profile?.createdAt || 'Not set'}</p>
            </div>
          </div>

          <div className="w-full md:w-[38%] flex flex-col">
            <p className="text-[rgba(67,67,67,0.43)] mt-[-1rem] pt-4">Residencial info</p>
            <div className=" w-full flex flex-col my-[0.3rem] px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Province: </p>
              <p>{profile?.address.province || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-[0.3rem] px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>District: </p>
              <p>{profile?.address.district || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-[0.3rem] px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Sector: </p>
              <p>{profile?.address.sector || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-[0.3rem] px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Cell: </p>
              <p>{profile?.address.cell || 'Not set'}</p>
            </div>
            <div className=" w-full flex flex-col my-[0.3rem] px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
              <p style={{ fontSize: '70%' }}>Cell: </p>
              <p>{profile?.address.village || 'Not set'}</p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-[#db3838] self-end justify-self-end mt-5 md:mt-22 mb-12 text-white rounded-md  border-[2px] border-[rgba(67,67,67,0.09)] px-7 py-3"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
