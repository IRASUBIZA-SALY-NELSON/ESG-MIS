'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useFormDraft } from '@/hooks/useFormDraft';
import DraftNotice from '@/components/core/DraftNotice';
import { yupResolver } from '@hookform/resolvers/yup';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { backend } from '@/utils/constants';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { Fieldset } from '@mantine/core';
import backBtn from '../../../../../assets/back.svg';
import FileDropZone from '@/components/core/FileDrop/FileDropZone';
const NewStudent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const schema = yup.object().shape({
    firstName: yup.string().required('Please provide the first name for the new staff member'),
    lastName: yup.string().required('Please provide the last name for the new staff member'),
    nationalId: yup
      .string()
      .required('Please provide the national id number for the new staff member'),
    occupation: yup.string().required('Please provide the occupation of the new staff member'),
    email: yup
      .string()
      .email('Provide a valid email')
      .required('Please provide the email for the new staff member'),
    gender: yup.string().required('Please provide the gender for the new staff member'),
    registerCode: yup.string().required('Please provide the register code'),
    phone: yup.string().required("Please provide the new staff member's phone Number"),
  });
  const form = useForm({
    resolver: yupResolver(schema),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;
  const { savedAt, clear } = useFormDraft(form);
  const handleFilesSelected = (filetype: string, files: File[]) => {
    setSelectedFile(files[0]);
  };
  const onSubmit = async (data: any) => {
    setLoading(true);
    const token = getCookie('token');
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('dateOfBirth', data.dOb);
    formData.append('province', data.province);
    formData.append('district', data.district);
    formData.append('cell', data.cell);
    formData.append('sector', data.sector);
    formData.append('intake', data.intake);
    formData.append('fatherName', data.fatherName);
    formData.append('motherName', data.motherName);
    formData.append('guardianname', data.guardianName);
    formData.append('fatherEmail', data.fatherEmail);
    formData.append('motherEmail', data.motherEmail);
    formData.append('guardianEmail', data.guardianEmail);
    formData.append('fatherPhone', data.fatherPhone);
    formData.append('motherPhone', data.motherPhone);
    formData.append('guardianPhone', data.guardianPhone);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }
    axios
      .post(`${backend}/students/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        clear();
        toast.success('Student Registered');
        router.push('/staff/students');
      })
      .catch((err) => {
        toast.error('Student was not registered');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleFilesSelectedDrop = (filetype: string, files: File[]) => {};
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
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
          Register New Staff Member
        </h2>
      </div>
      <p className="text-[rgba(67,67,67,0.43)] my-2 capitalize">
        Add a new Staff Member to ESG community
      </p>
      <DraftNotice
        savedAt={savedAt}
        onDiscard={() => {
          clear();
          reset();
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-10 grid grid-cols-2 gap-5">
          <FileDropZone
            fileType="landing"
            onFilesSelected={handleFilesSelectedDrop}
            title="Photo of the Staff Member"
          />
          <div className="w-[50%] md:w-full">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                className="my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('firstName')}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('lastName')}
              />
            </div>
            <p className="text-red-500">{errors.firstName?.message || errors.lastName?.message}</p>
            <input
              type="text"
              placeholder="Email"
              className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('email')}
            />
            <p className="text-red-500">{errors.email?.message}</p>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-[35%] my-1 px-3 py-2 text-black bg-[rgba(67,67,67,0.03)] rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('gender')}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Register Code"
                className="my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('registerCode')}
              />
            </div>
            <p className="text-red-500">{errors.gender?.message || errors.registerCode?.message}</p>
            <input
              type="text"
              placeholder="National Id"
              className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('nationalId')}
            />
            <p className="text-red-500">{errors.nationalId?.message}</p>
            <input
              type="text"
              placeholder="Occupation"
              className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('occupation')}
            />
            <p className="text-red-500">{errors.occupation?.message}</p>
            <input
              type="text"
              placeholder="Phone number"
              className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('phone')}
            />
            <p className="text-red-500">{errors.phone?.message}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href={'/admin/workers/teachers'}>
            <div className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2">Cancel</div>
          </Link>
          <button className="bg-primary rounded-md text-white px-5 py-2">Create</button>
        </div>
      </form>
    </div>
  );
};

export default NewStudent;
