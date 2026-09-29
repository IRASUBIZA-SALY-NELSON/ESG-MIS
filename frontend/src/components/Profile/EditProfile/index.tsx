'use client';
import React, { useEffect, useState } from 'react';
import ProfileInput from '@/components/Profile/ProfileInput';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ClipLoader } from 'react-spinners';
import { AuthApi } from '@/utils/constants';
import { notifications } from '@mantine/notifications';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { getCookie } from 'cookies-next';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import backBtn from '@/assets/back.svg';
import { useUserContext } from '@/context/Usercontext';
import useGet from '@/hooks/useGet';
// const { Provinces, Districts, Sectors, Cells, Villages } = require('rwanda');

const EditProfile = () => {
  const { data: student, error, loading } = useGet(`auth/profile`);
  const [pageLoading, setPageLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const { profile } = useUserContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const schema = yup.object().shape({
    firstName: yup.string(),
    lastName: yup.string(),
    email: yup.string().optional(),
    gender: yup.string().optional(),
    nationalId: yup.string().optional(),
    phone: yup.string().optional(),
    country: yup.string().optional(),
    province: yup.string().optional(),
    district: yup.string().optional(),
    sector: yup.string().optional(),
    cell: yup.string().optional(),
    village: yup.string().optional(),
    fatherEmail: yup.string().email('Please provide a valid email').optional(),
    motherEmail: yup.string().email('Please provide a valid email').optional(),
    guardianEmail: yup.string().email('Please provide a valid email').optional(),
    fatherName: yup.string().optional(),
    motherName: yup.string().optional(),
    guardianName: yup.string().optional(),
    fatherPhone: yup.string().optional(),
    motherPhone: yup.string().optional(),
    guardianPhone: yup.string().optional(),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const handleFilesSelected = (filetype: string, files: File[]) => {
    setSelectedFile(files[0]);
  };
  const onSubmit = async (data: any) => {
    setLoader(true);
    const token = getCookie('token');

    const formData = new FormData();
    formData.append('addressDTO.cell', data.cell);
    formData.append('addressDTO.country', data.country);
    formData.append('addressDTO.district', data.district);
    formData.append('addressDTO.province', data.province);
    formData.append('addressDTO.sector', data.sector);
    formData.append('addressDTO.village', data.village);
    // father
    formData.append('createParentsDTO.father.email', data.fatherEmail);
    formData.append('createParentsDTO.father.fullName', data.fatherName);
    formData.append('createParentsDTO.father.nationalId', data.fatherNationalId);
    formData.append('createParentsDTO.father.phoneNumber', data.fatherPhone);
    formData.append('createParentsDTO.father.gender', 'MALE');
    formData.append('createParentsDTO.father.parentType', 'FATHER');
    // mother
    formData.append('createParentsDTO.mother.email', data.motherEmail);
    formData.append('createParentsDTO.mother.fullName', data.motherName);
    formData.append('createParentsDTO.mother.nationalId', data.motherNationalId);
    formData.append('createParentsDTO.mother.phoneNumber', data.motherPhone);
    formData.append('createParentsDTO.mother.gender', 'FEMALE');
    formData.append('createParentsDTO.mother.parentType', 'MOTHER');
    // guardian
    formData.append('createParentsDTO.guardian.email', data.guardianEmail);
    formData.append('createParentsDTO.guardian.fullName', data.guardianName);
    formData.append('createParentsDTO.guardian.nationalId', data.guardianNationalId);
    formData.append('createParentsDTO.guardian.phoneNumber', data.guardianPhone);
    formData.append('createParentsDTO.guardian.gender', data.guardianGender);
    formData.append('createParentsDTO.guardian.parentType', 'GUARDIAN');
    //personal info
    formData.append('email', data.email);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('gender', data.gender);
    formData.append('nationalId', data.nationalId);
    formData.append('phoneNumber', data.phone);
    formData.append('username', `${data.firstName}${Math.floor(100 + Math.random() * 900)}`);
    if (selectedFile) {
      formData.append('profile', selectedFile);
    }

    AuthApi.put(`/students/update/${student.user.id}`, formData)
      .then((res) => {
        notifications.show({
          title: 'Success',
          message: res.data.message,
          color: 'green',
          autoClose: 3000,
        });
        router.push('/admin/students');
      })
      .catch((err) => {
        notifications.show({
          title: 'Failed to update student',
          message: '',
          color: 'red',
          autoClose: 3000,
        });
      })
      .finally(() => {
        setLoader(false);
      });
  };
  return (
    <div className="w-[85vw] h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10 mb-5  grid grid-cols-1 sm:grid-cols-2 gap-5">
          {loading ? <Skeleton height={300} /> : <ProfileInput setSelectFile={setSelectedFile} />}
          <div className="w-full">
            {loading ? (
              <div className="flex flex-row gap-2">
                <div className="w-[50%]">
                  <Skeleton height={30} />
                </div>
                <div className="w-[50%]">
                  <Skeleton height={30} />
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col sm:flex-row sm:gap-2">
                <input
                  type="text"
                  placeholder="First Name"
                  defaultValue={student?.person.firstName}
                  className=" w-full  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('firstName')}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  defaultValue={student?.person.lastName}
                  className=" w-full  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px]  outline-none"
                  {...register('lastName')}
                />
              </div>
            )}
            {loading ? (
              <div className="w-full flex  gap-2">
                <div className="w-[35%]">
                  <Skeleton height={30} />
                </div>
                <div className="w-[65%]">
                  <Skeleton height={30} />
                </div>
              </div>
            ) : (
              <div className="w-full flex  gap-2">
                <input
                  type="text"
                  placeholder="Gender"
                  defaultValue={student?.person.gender}
                  className=" w-[35%]  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('gender')}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  defaultValue={student?.person.phoneNumber}
                  className=" w-[65%]  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('phone')}
                />
              </div>
            )}
            {loading ? (
              <div className="my-1">
                <Skeleton height={30} />
              </div>
            ) : (
              <input
                type="text"
                placeholder="National Id"
                defaultValue={student?.person.nationalId}
                className=" w-full  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('nationalId')}
              />
            )}
            <p className="text-red-500">
              {errors.lastName?.message ||
                errors.firstName?.message ||
                errors.gender?.message ||
                errors.email?.message ||
                errors.nationalId?.message ||
                errors.phone?.message}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
            <div>
              <Skeleton height={30} />
            </div>
            <div>
              <Skeleton height={30} />
            </div>
            <div>
              <Skeleton height={30} />
            </div>
            <div>
              <Skeleton height={30} />
            </div>
            <div>
              <Skeleton height={30} />
            </div>
            <div>
              <Skeleton height={30} />
            </div>
          </div>
        ) : (
          <div className="">
            <p>Location Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
              <input
                type="text"
                placeholder="Country of Residence"
                defaultValue={student?.person.address.country}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('country')}
              />
              <input
                type="text"
                placeholder="Province of Residence"
                defaultValue={student?.person.address.province}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('province')}
              />
              <input
                type="text"
                placeholder="District of Residence"
                defaultValue={student?.person.address.district}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('district')}
              />
              <input
                type="text"
                placeholder="Sector of Residence"
                defaultValue={student?.person.address.sector}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('sector')}
              />
              <input
                type="text"
                placeholder="Cell of Residence"
                defaultValue={student?.person.address.cell}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('cell')}
              />
              <input
                type="text"
                placeholder="Village of Residence"
                defaultValue={student?.person.address.village}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('village')}
              />
            </div>
            <p className="text-red-500">
              {errors.country?.message ||
                errors.province?.message ||
                errors.district?.message ||
                errors.cell?.message ||
                errors.cell?.message ||
                errors.village?.message}
            </p>
            <p>Parent Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Father's Name"
                  defaultValue={
                    student?.parents?.father != null
                      ? student?.parents?.father?.firstName +
                        ' ' +
                        student?.parents?.father?.firstName
                      : undefined
                  }
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('fatherName')}
                />
                <input
                  type="text"
                  placeholder="Father's Email"
                  defaultValue={student?.parents?.father?.email}
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('fatherEmail')}
                />
                <input
                  type="text"
                  placeholder="Father's Phone Number"
                  defaultValue={student?.parents?.father?.phoneNumber}
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('fatherPhone')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Mother's Name"
                  defaultValue={
                    student?.parents?.mother != null
                      ? student?.parents?.mother?.firstName +
                        ' ' +
                        student?.parents?.mother?.firstName
                      : undefined
                  }
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('motherName')}
                />
                <input
                  type="text"
                  placeholder="Mother's Email"
                  defaultValue={student?.parents?.mother?.email}
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('motherEmail')}
                />
                <input
                  type="text"
                  placeholder="Mother's Phone Number"
                  defaultValue={student?.parents?.mother?.phoneNumber}
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('motherPhone')}
                />
              </div>
            </div>
            <p className="text-red-500">
              {errors.fatherName?.message ||
                errors.motherName?.message ||
                errors.fatherEmail?.message ||
                errors.motherEmail?.message ||
                errors.fatherPhone?.message ||
                errors.motherPhone?.message}
            </p>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
            <div className="flex flex-col gap-2">
              <div>
                <Skeleton height={30} />
              </div>
              <div>
                <Skeleton height={30} />
              </div>
              <div>
                <Skeleton height={30} />
              </div>
            </div>
            <div></div>
          </div>
        ) : (
          <div className="">
            <p>Guardian</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col  gap-2">
                <input
                  type="text"
                  placeholder="Guardian's Name"
                  defaultValue={
                    student?.parents?.guardian != null
                      ? student?.parents?.guardian?.firstName +
                        ' ' +
                        student?.parents?.guardian?.firstName
                      : undefined
                  }
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('guardianName')}
                />
                <input
                  type="text"
                  placeholder="Guardian's Email"
                  defaultValue={student?.parents?.guardian?.email}
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('guardianEmail')}
                />
                <input
                  type="text"
                  placeholder="Guardian's Phone Number"
                  defaultValue={student?.parents?.guardian?.phone}
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('guardianPhone')}
                />
              </div>
            </div>
          </div>
        )}
        <p className="text-red-500">
          {errors.guardianName?.message ||
            errors.guardianEmail?.message ||
            errors.guardianPhone?.message}
        </p>
        {!loading && (
          <div className="my-10 flex flex-row gap-10">
            <button
              type="button"
              className="bg-[rgba(67,67,67,0.03)]  text-black rounded-md  border-[2px] border-[rgba(67,67,67,0.09)] px-5 py-2"
            >
              Cancel
            </button>
            {loader ? (
              <div className="bg-primary rounded-md text-white px-12 py-2 cursor-not-allowed">
                <ClipLoader size={15} color="white" />
              </div>
            ) : (
              <input
                type="submit"
                value={'Update Student '}
                className="bg-primary rounded-md text-white px-5 py-2 cursor-pointer"
              />
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default EditProfile;
