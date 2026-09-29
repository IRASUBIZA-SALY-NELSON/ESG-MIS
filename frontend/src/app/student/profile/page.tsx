/* eslint-disable react/no-unescaped-entities */
'use client';
import EditProfile from '@/components/Profile/EditProfile';
import useGet from '@/hooks/useGet';
import { EParentType, IStudentDetails } from '@/types/student.types';
import { getFile } from '@/utils/constants';
import { Avatar, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { deleteCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Profile = () => {
  const [user, setUserProfile] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const navigate = useRouter();
  const profileString = localStorage.getItem('rcaappuser');
  const profile = profileString ? JSON.parse(profileString) : null;
  const { data, error, loading } = useGet<IStudentDetails>(`auth/profile`);
  const [opened, { close, open }] = useDisclosure(false);

  const handleLogout = () => {
    localStorage.removeItem('rcaappuser');
    deleteCookie('token');
    navigate.push('/');
    deleteCookie('role');
    deleteCookie('token');
  };

  const father = data?.parent.find((par) => par.parentType === EParentType.FATHER);
  const mother = data?.parent.find((par) => par.parentType === EParentType.MOTHER);

  return (
    <div className="w-full h-full overflow-x-hidden overflow-y-auto p-2 text-sm flex flex-col gap-y-2">
      <p className="text-gray-700 font-medium mx-1 my-2 text-center text-lg">Your Profile</p>

      <div className="flex w-[200px] h-[200px] aspect-square mx-auto">
        {/* <Avatar
          src={(getFile(profile?.profilePicture) as string) ?? '/logo.png'}
          alt="Profile"
          size={200}
        /> */}
        <Image
          src={(getFile(profile?.profilePicture) as string) ?? '/logo.png'}
          alt="Profile"
          width={200}
          height={200}
          className="object-cover border-2 object-center overflow-hidden rounded-md"
        />
      </div>
      {/* Change profile modal */}
      <Modal opened={opened} onClose={close} closeOnClickOutside size={'auto'}>
        <h5 className="text-center w-full font-bold">Edit Your Profile Info</h5>
        <EditProfile />
      </Modal>
      {/*  */}
      <div className="my-2 flex items-center justify-center">
        <div className=" relative">
          <button
            className={`py-3  text-[80%] px-3 pr-6 transition-colors duration-500  rounded-lg ${
              activeTab != 0
                ? 'bg-[#DCEBE3] text-[#01382A]'
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => {
              if (activeTab !== 0) {
                setActiveTab(0);
              }
            }}
          >
            Personal Information
          </button>
          <button
            className={`py-3  text-[80%]  px-3 md:px-auto transition-colors duration-500 rounded-lg ml-[-13px] border-l-[2px] border-l-[#ccc]  ${
              activeTab != 1
                ? 'bg-[#DCEBE3] text-[#01382A] '
                : ' bg-primary text-white font-medium z-50'
            }`}
            onClick={() => {
              if (activeTab !== 1) {
                setActiveTab(1);
              }
            }}
          >
            Academic Information
          </button>
        </div>
      </div>
      {activeTab === 0 ? (
        <div>
          <div className="w-full flex flex-col md:flex-row justify-center gap-3">
            <div className="w-full md:w-[38%]">
              <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>First Name: </p>
                <p>{data?.person?.firstName}</p>
              </div>

              <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Email: </p>
                <p>{data?.person?.email}</p>
              </div>
              <div className=" w-full flex flex-col my-1 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Gender: </p>
                <p>{data?.person?.gender}</p>
              </div>
              <div className=" w-full flex flex-col my-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Father&apos;s Name: </p>
                <p>{father?.firstName || 'Not set'}</p>
              </div>
              <div className=" w-full flex flex-col my-1 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Father&apos;s Email: </p>
                <p>{father?.email || 'not set'}</p>
              </div>
              <div className="flex justify-between mt-12">
                {/* <button
                  className="mt-5 float-right bg-primary px-4 py-2 rounded-lg text-white  border-[2px] border-[rgba(67,67,67,0.09)] w-fit"
                  onClick={open}
                >
                  Edit Profile
                </button> */}
              </div>
            </div>
            <div className="w-full md:w-[38%] flex flex-col">
              <div className=" w-full flex flex-col my-1 mt-2 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Last Name: </p>
                <p>{data?.person?.lastName || 'Not Set'}</p>
              </div>
              <div className=" w-full flex flex-col my-1 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Class: </p>
                <p>{data?.person?.currentClazz?.className}</p>
              </div>
              <div className=" w-full flex flex-col my-1 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Mother&apos;s Name: </p>
                <p>{mother?.firstName || 'Not set'}</p>
              </div>
              <div className=" w-full flex flex-col my-1 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Mother&apos;s Email: </p>
                <p>{mother?.email || 'Not Set'}</p>
              </div>
              <div className=" w-full flex flex-col my-1 px-3 py-3 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>District of Residence </p>
                <p>{data?.person?.address?.district || 'Not Set'}</p>
              </div>
              <div className="flex justify-between">
                <div></div>
                <button
                  className="mt-5 float-right bg-[#db3838] px-4 py-2 rounded-lg text-white  border-[2px] border-[rgba(67,67,67,0.09)] w-fit"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
              <div className="h-[200px] w-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="w-[77%] mx-auto flex justify-center gap-x-8 ">
            <div className={'basis-[80%] flex flex-col items-center gap-y-4 mt-4'}>
              <div className=" w-[100%] flex flex-col px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Student Name: </p>
                <p>{data?.person?.firstName + ' ' + data?.person?.lastName}</p>
              </div>

              <div className=" w-[100%] flex flex-col px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '70%' }}>Student Email: </p>
                <p>{profile?.email}</p>
              </div>
              <div className="flex w-full gap-x-4">
                <div className=" w-[100%] flex flex-col px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '70%' }}>Class of Student: </p>
                  <p>{data?.person?.currentClazz?.className}</p>
                </div>
                {/* <div className=" w-[100%] flex flex-col px-3 py-1 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '70%' }}>Promotion in-take: </p>
                  <p>{profile?.createdAt}</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col gap-y-4"></div>
    </div>
  );
};

export default Profile;
