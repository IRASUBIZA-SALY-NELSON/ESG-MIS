'use client';
import React, { useEffect, useState } from 'react';
import ProfileInput from '../../../../../components/Profile/ProfileInput';
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
import backBtn from '../../../../../assets/back.svg';

const Edit = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any | null>();
  const { id } = useParams();
  useEffect(() => {
    AuthApi.get(`/students/id/${id}`)
      .then((res) => {
        setStudent(res.data.data);
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const schema = yup.object().shape({
    firstName: yup.string().required('Please provide the first name for the student'),
    lastName: yup.string().required('Please provide the last name for the student'),
    email: yup
      .string()
      .email('Provide a valid email')
      .required('Please provide the email for the student'),
    gender: yup.string().required('Please provide the gender for the student'),
    nationalId: yup.string().optional(),
    phone: yup.string().optional(),
    country: yup.string().required('Please provide the country for the student'),
    province: yup.string().required('Please provide the province for the student'),
    district: yup.string().required('Please provide the district for the student'),
    sector: yup.string().required('Please provide the sector for the student'),
    cell: yup.string().required('Please provide the cell for the student'),
    village: yup.string().required('Please provide the village for the student'),
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
    setLoading(true);
    const token = getCookie('token');
    const newStudent = {
      addressDTO: {
        cell: data.cell,
        country: data.country,
        district: data.district,
        province: data.province,
        sector: data.sector,
        village: data.village,
      },
      createParentsDTO: {
        // father: null,
        // mother: null,
        father: {
          email: data.fatherEmail,
          firstName: data.fatherName.split(' ')[0],
          gender: 'MALE',
          lastName: data.fatherName.split(' ')[-1],
          parentType: 'FATHER',
        },
      },
      email: data.email,
      firstName: data.firstName,
      gender: data.gender,
      lastName: data.lastName,
      nationalId: data.nationalId,
      phoneNumber: data.phone,
      password: 'string',
      registrationCode: 'KeyAdminKeyAdmin',
      studentId: `RCA0${Math.floor(100 + Math.random() * 900)}MGV`,
      username: `${data.firstName}${Math.floor(100 + Math.random() * 900)}`,
    };
    AuthApi.put(`/students/update/${id}`, newStudent)
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
          message: 'fasdfasdfasd',
          color: 'red',
          autoClose: 3000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => {
            window.history.back();
          }}
        >
          <Image src={backBtn} alt="" />
        </button>
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Edit Student</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10 mb-5  grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pageLoading ? (
            <Skeleton height={300} />
          ) : (
            <ProfileInput setSelectFile={setSelectedFile} />
          )}
          <div className="w-full">
            {pageLoading ? (
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
                  defaultValue={student?.firstName}
                  className=" w-full  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('firstName')}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  defaultValue={student?.lastName}
                  className=" w-full  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px]  outline-none"
                  {...register('lastName')}
                />
              </div>
            )}
            {pageLoading ? (
              <div className="my-1">
                <Skeleton height={30} />
              </div>
            ) : (
              <input
                type="text"
                placeholder="Student Email"
                defaultValue={student?.email}
                className=" w-full  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('email')}
              />
            )}
            {pageLoading ? (
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
                  defaultValue={student?.gender}
                  className=" w-[35%]  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('gender')}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  defaultValue={student?.phoneNumber}
                  className=" w-[65%]  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('phone')}
                />
              </div>
            )}
            {pageLoading ? (
              <div className="my-1">
                <Skeleton height={30} />
              </div>
            ) : (
              <input
                type="text"
                placeholder="National Id"
                defaultValue={student?.nationalId}
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
        {pageLoading ? (
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
                defaultValue={student?.address.country}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('country')}
              />
              <input
                type="text"
                placeholder="Province of Residence"
                defaultValue={student?.address.province}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('province')}
              />
              <input
                type="text"
                placeholder="District of Residence"
                defaultValue={student?.address.district}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('district')}
              />
              <input
                type="text"
                placeholder="Sector of Residence"
                defaultValue={student?.address.sector}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('sector')}
              />
              <input
                type="text"
                placeholder="Cell of Residence"
                defaultValue={student?.address.cell}
                className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('cell')}
              />
              <input
                type="text"
                placeholder="Village of Residence"
                defaultValue={student?.address.village}
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
        {pageLoading ? (
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
        {!pageLoading && (
          <div className="my-10 flex flex-row gap-10">
            <button
              type="button"
              className="bg-[rgba(67,67,67,0.03)]  text-black rounded-md  border-[2px] border-[rgba(67,67,67,0.09)] px-5 py-2"
            >
              Cancel
            </button>
            {loading ? (
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

export default Edit;
