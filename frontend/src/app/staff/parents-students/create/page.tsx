'use client';
import React, { useState } from 'react';
import ProfileInput from '../ProfileInput';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import { backend } from '@/utils/constants';
import toast from 'react-hot-toast';
const NewStudent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const schema = yup.object().shape({
    name: yup.string().required('Please provide the name for the student'),
    email: yup
      .string()
      .email('Provide a valid email')
      .required('Please provide the email for the student'),
    province: yup.string().required('Please provide the province for the student'),
    intake: yup.string().required('Please provide the year which the student was intaken'),
    district: yup.string().required('Please provide the district for the student'),
    sector: yup.string().required('Please provide the sector for the student'),
    cell: yup.string().required('Please provide the cell for the student'),
    dOb: yup.date().required('Please provide the date of birth for the student'),
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
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Register New Student</h2>
      <p className="text-[rgba(67,67,67,0.43)] my-2 capitalize">Add a new Student to the School</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-10 grid grid-cols-2 gap-5">
          <ProfileInput />
          <div className="w-[50%] md:w-full">
            <input
              type="text"
              placeholder="Student Name"
              className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('name')}
            />
            <p className="text-red-500">{errors.name?.message}</p>
            <input
              type="text"
              placeholder="Student Email"
              className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('email')}
            />
            <p className="text-red-500">{errors.email?.message}</p>
            <input
              type="text"
              placeholder="Student Intake"
              className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('intake')}
            />
            <p className="text-red-500">{errors.intake?.message}</p>
            <p>Date of Birth</p>
            <input
              type="date"
              placeholder="Class of Student"
              className=" w-full px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('dOb')}
            />
            <p className="text-red-500">{errors.dOb?.message}</p>
          </div>
        </div>
        <div className="my-10">
          <div className="grid grid-cols-2 my-2 gap-2">
            <input
              type="text"
              placeholder="Province of Residence"
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('province')}
            />
            <input
              type="text"
              placeholder="District of Residence"
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('district')}
            />
            <input
              type="text"
              placeholder="Sector of Residence"
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('sector')}
            />
            <input
              type="text"
              placeholder="Cell of Residence"
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('cell')}
            />
          </div>
          <p className="text-red-500">
            {errors.province?.message ||
              errors.district?.message ||
              errors.cell?.message ||
              errors.cell?.message}
          </p>
          <p>Parent Details</p>
          <div className="grid grid-cols-2 gap-x-5">
            <div className="flex flex-col ">
              <input
                type="text"
                placeholder="Father's Name"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('fatherName')}
              />
              <input
                type="text"
                placeholder="Father's Email"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('fatherEmail')}
              />
              <p className="text-red-500">{errors.fatherEmail?.message}</p>
              <input
                type="text"
                placeholder="Father's Phone Number"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('fatherPhone')}
              />
            </div>
            <div className="flex flex-col ">
              <input
                type="text"
                placeholder="Mother's Name"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('motherName')}
              />
              <input
                type="text"
                placeholder="Mother's Email"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('motherEmail')}
              />
              <p className="text-red-500">{errors.motherEmail?.message}</p>
              <input
                type="text"
                placeholder="Mother's Phone Number"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('motherPhone')}
              />
            </div>
          </div>
        </div>
        <div className="my-10">
          <p>Guardian</p>
          <div className="grid grid-cols-2 gap-x-5">
            <div className="flex flex-col ">
              <input
                type="text"
                placeholder="Guardian's Name"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('guardianName')}
              />
              <input
                type="text"
                placeholder="Guardian's Email"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('guardianEmail')}
              />
              <p className="text-red-500">{errors.guardianEmail?.message}</p>
              <input
                type="text"
                placeholder="Guardian's Phone Number"
                className="   my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('guardianPhone')}
              />
            </div>
          </div>
        </div>
        <div className="my-10 flex flex-row gap-10">
          <button
            type="button"
            className="bg-[rgba(67,67,67,0.03)]  text-black rounded-md  border-[2px] border-[rgba(67,67,67,0.09)] px-5 py-2"
          >
            Cancel Registration
          </button>
          <input
            type="submit"
            value={'Register Student '}
            className="bg-primary rounded-md text-white px-5 py-2 cursor-pointer"
          />
        </div>
      </form>
    </div>
  );
};

export default NewStudent;
