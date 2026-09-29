import useGet from '@/hooks/useGet';
import Image from 'next/image';
import React, { FC } from 'react';
import { ClipLoader } from 'react-spinners';
import logo from '@/assets/logo 2.png';
import { EParentType, IStudentDetails, Student } from '@/types/student.types';
import { getFile } from '@/utils/constants';

interface Props {
  closeUserModal: () => void;
  currentStudent: Student | null;
  closeStudentModal: any;
}

const StudentProfile: FC<Props> = ({ currentStudent }) => {
  const { data, error, loading, get } = useGet<IStudentDetails>(
    `/students/profile-id/${currentStudent?.id}`,
  );
  const father = data?.parent.find((par) => par.parentType === EParentType.FATHER);
  const mother = data?.parent.find((par) => par.parentType === EParentType.MOTHER);
  return (
    <>
      {loading ? (
        <div className="w-full flex justify-center items-center h-20">
          <ClipLoader size={20} />
        </div>
      ) : (
        <div className="p-2 rounded-lg  max-w-[70vw]  text-center relative">
          <p className="my-3 font-semibold text-lg text-center">Student Profile</p>
          <div className="flex gap-5">
            <div className="w-[25%] rounded-md border-2 overflow-hidden">
              {data && (
                <Image
                  src={getFile(data.user?.profilePicture) ?? logo}
                  alt=""
                  width={400}
                  height={400}
                  className="w-[100%] h-full aspect-square object-cover object-center"
                />
              )}
            </div>
            <div className="w-[75%]">
              <div className="grid grid-cols-2 gap-2 my-1">
                <div className="text-left w-full flex flex-col  px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }} className="text-[#616161]">
                    First Name:{' '}
                  </p>
                  <p style={{ fontSize: '80%' }}>{data?.person?.firstName || 'Not set'}</p>
                </div>
                <div className="text-left w-full flex flex-col  px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }} className="text-[#616161]">
                    Last Name:{' '}
                  </p>
                  <p style={{ fontSize: '80%' }}>{data?.person?.lastName || 'Not set'}</p>
                </div>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Email:{' '}
                </p>
                <p style={{ fontSize: '80%' }}>{data?.person?.email || 'Not set'}</p>
              </div>
              <div className="text-left w-full flex flex-col  px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Phone Number:{' '}
                </p>
                <p style={{ fontSize: '80%' }}>{data?.person?.phoneNumber || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="text-left w-full flex flex-col  px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }} className="text-[#616161]">
                    Gender:{' '}
                  </p>
                  <p style={{ fontSize: '80%' }}>{data?.person?.gender || 'Not set'}</p>
                </div>
                <div className="text-left w-full flex flex-col  px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                  <p style={{ fontSize: '60%' }} className="text-[#616161]">
                    Current Class:{' '}
                  </p>
                  <p style={{ fontSize: '80%' }}>
                    {data?.person.currentClazz?.className || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Father's name:
                </p>
                <p style={{ fontSize: '80%' }}>{father?.firstName || 'Not set'}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Father's email:{' '}
                </p>
                <p style={{ fontSize: '80%' }}>{father?.email || 'Not set'}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Father's phone:{' '}
                </p>
                <p style={{ fontSize: '80%' }}>{father?.phoneNumber || 'Not set'}</p>
              </div>
            </div>
            <div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Mother's name:{' '}
                </p>
                <p style={{ fontSize: '80%' }}>{mother?.firstName || 'Not set'}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Mother's email:{' '}
                </p>
                <p style={{ fontSize: '80%' }}>{mother?.email || 'Not set'}</p>
              </div>
              <div className="text-left w-full flex flex-col my-2 px-3 py-1 text-black placeholder:text-black bg-[rgba(67,67,67,0.03)]  rounded-md border-[1px] border-[rgba(67,67,67,0.09)]">
                <p style={{ fontSize: '60%' }} className="text-[#616161]">
                  Mother's phone:{' '}
                </p>
                <p style={{ fontSize: '80%' }}>{mother?.phoneNumber || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-4 p-3 rounded-md border border-gray-200">
            <h3 className="text-md font-semibold mb-2 text-left">Status Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <p className="text-sm text-gray-600">Current Status:</p>
                <p className="font-medium">
                  {data?.person.studentStatus ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        data.person.studentStatus === 'CURRENT' ||
                        data.person.studentStatus === 'ACTIVE' ||
                        data.person.studentStatus === 'CURRENT_REPEATED'
                          ? 'bg-green-100 text-green-800'
                          : data.person.studentStatus === 'ALUMNI'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {data.person.studentStatus.replace('_', ' ')}
                    </span>
                  ) : (
                    'Not set'
                  )}
                </p>
              </div>

              {(data?.person.studentStatus === 'DROPOUT' ||
                data?.person.studentStatus === 'RELOCATED') && (
                <div className="text-left">
                  <p className="text-sm text-gray-600">
                    {data.person.studentStatus === 'DROPOUT'
                      ? 'Dropout Reason'
                      : 'Relocation Reason'}
                    :
                  </p>
                  <p className="text-sm">
                    {data.person.statusChanges?.[0]?.reason || 'No reason provided'}
                  </p>
                </div>
              )}

              {data?.person.statusChanges?.[0]?.date && (
                <div className="text-left">
                  <p className="text-sm text-gray-600">Status Last Updated:</p>
                  <p className="text-sm">
                    {new Date(data.person.statusChanges[0].date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentProfile;
