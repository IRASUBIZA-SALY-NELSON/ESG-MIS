'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useFormDraft, rwandaLocationExtras } from '@/hooks/useFormDraft';
import DraftNotice from '@/components/core/DraftNotice';
import { yupResolver } from '@hookform/resolvers/yup';
import { getCookie } from 'cookies-next';
import { AuthApi, backend } from '@/utils/constants';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import backBtn from '../../../../../assets/back.svg';
import FileDropZone from '@/components/core/FileDrop/FileDropZone';
import { Fieldset } from '@mantine/core';
import CustomTextInput from '@/components/core/Input/CustomTextInput';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Provinces, Districts, Sectors, Cells, Villages } = require('rwanda');
const NewAccountant = () => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const schema = yup.object().shape({
    firstName: yup.string().required('Please provide the first name for the accountant'),
    lastName: yup.string().required('Please provide the last name for the accountant'),
    nationalId: yup.string().required('Please provide the national id number for the accountant'),
    email: yup
      .string()
      .email('Provide a valid email')
      .required('Please provide the email for the accountant'),
    gender: yup.string().required('Please provide the gender for the Teacher'),
    registerCode: yup.string().required('Please provide the register code'),
    phone: yup.string().required("Please provide the accountant's phone Number"),
    country: yup.string().required('Please provide the country for the accountant'),
    password: yup.string().required('Please provide the password'),
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
  const { savedAt, clear } = useFormDraft(
    form,
    rwandaLocationExtras(
      {
        selectedProvince,
        selectedDistrict,
        selectedSector,
        selectedCell,
        selectedVillage,
      },
      {
        selectedProvince: setSelectedProvince,
        selectedDistrict: setSelectedDistrict,
        selectedSector: setSelectedSector,
        selectedCell: setSelectedCell,
        selectedVillage: setSelectedVillage,
      },
    ),
  );
  const handleFilesSelected = (filetype: string, files: File[]) => {
    setSelectedFile(files[0]);
  };
  const onSubmit = async (data: any) => {
    setLoading(true);
    const token = getCookie('token');
    const address = {
      cell: data.cell,
      country: data.country,
      district: data.district,
      province: data.province,
      sector: data.sector,
      village: data.village,
    };

    const newAccountant = {
      email: data.email,
      firstName: data.firstName,
      gender: data.gender,
      lastName: data.lastName,
      nationalId: data.nationalId,
      occupation: 'ACCOUNTANT',
      phoneNumber: data.phone,
      registrationCode: data.registerCode,
      role: 'ACCOUNTANT',
      username: data.firstName + ' ' + data.lastName,
      addressDTO: {
        country: data.country,
        province: selectedProvince,
        district: selectedDistrict,
        sector: selectedSector,
        cell: selectedCell,
        village: selectedVillage,
      },
    };
    AuthApi.post(`/staff-members/create`, newAccountant)
      .then((res) => {
        clear();
        toast.success('Accountant Registered');
        window.history.back();
      })
      .catch((err) => {
        toast.error('Accountant was not created');
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
          Register New Accountant
        </h2>
      </div>
      <p className="text-[rgba(67,67,67,0.43)] my-2 capitalize">Add a new Accountant</p>
      <DraftNotice
        savedAt={savedAt}
        onDiscard={() => {
          clear();
          reset();
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
        <Fieldset
          legend={<span className="font-semibold text-mainPurple">Personal information</span>}
          bg={'none'}
        >
          <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FileDropZone
              fileType="landing"
              onFilesSelected={handleFilesSelectedDrop}
              title="Photo of the Accountant"
            />
            <div className="w-full flex gap-y-1 flex-col">
              <div className="grid grid-cols-2 gap-3">
                <CustomTextInput
                  type="text"
                  placeholder="First Name"
                  label="First Name"
                  register={register('firstName')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Last Name"
                  label="Last Name"
                  register={register('lastName')}
                />
              </div>
              <p className="text-red-500">
                {errors.firstName?.message || errors.lastName?.message}
              </p>
              <CustomTextInput
                type="text"
                placeholder="Email"
                label="Email"
                register={register('email')}
              />
              <p className="text-red-500">{errors.email?.message}</p>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full my-1 px-3 py-2 text-black bg-[rgba(67,67,67,0.03)] rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('gender')}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <CustomTextInput
                  type="text"
                  placeholder="Register Code"
                  label="Register Code"
                  register={register('registerCode')}
                />
              </div>
              <p className="text-red-500">
                {errors.gender?.message || errors.registerCode?.message}
              </p>
              <CustomTextInput
                type="text"
                placeholder="National Id"
                label="National Id"
                register={register('nationalId')}
              />
              <p className="text-red-500">{errors.nationalId?.message}</p>
              <CustomTextInput
                type="text"
                placeholder="Phone number"
                label="Phone number"
                register={register('phone')}
              />
              <p className="text-red-500">{errors.phone?.message}</p>
            </div>
          </div>
        </Fieldset>
        <Fieldset
          legend={<span className="font-semibold text-mainPurple">Location Details</span>}
          bg={'none'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2  sm:gap-3">
            <CustomTextInput
              type="text"
              placeholder="Country"
              label="Country"
              register={register('country')}
            />
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict('');
                setSelectedSector('');
                setSelectedCell('');
                setSelectedVillage('');
              }}
              className=" border border-black-300/10 font-regular  outline-none  w-full py-[14px] px-3 rounded-md text-[black]"
            >
              <option value="">Select Province</option>
              {Provinces().map((province: string, index: any) => (
                <option key={index} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedSector('');
              }}
              disabled={!selectedProvince}
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
            >
              <option value="">Select District</option>
              {Districts(selectedProvince).map((district: string, index: any) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>

            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setSelectedCell('"');
              }}
              disabled={!selectedDistrict}
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
            >
              <option value="">Select Sector</option>
              {Sectors(selectedProvince, selectedDistrict)?.map((sector: string, index: any) => (
                <option key={index} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            <select
              value={selectedCell}
              onChange={(e) => {
                setSelectedCell(e.target.value);
                setSelectedVillage('');
              }}
              disabled={!selectedSector}
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
            >
              <option value="">Select Cell</option>
              {Cells(selectedProvince, selectedDistrict, selectedSector)?.map(
                (cell: string, index: any) => (
                  <option key={index} value={cell}>
                    {cell}
                  </option>
                ),
              )}
            </select>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              disabled={!selectedCell}
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
            >
              <option value="">Select Village</option>
              {Villages(selectedProvince, selectedDistrict, selectedSector, selectedCell)?.map(
                (village: string, index: any) => (
                  <option key={index} value={village}>
                    {village}
                  </option>
                ),
              )}
            </select>
          </div>
        </Fieldset>
        <p className="text-red-500  my -3">{errors.country?.message}</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Link href={'/admin/workers/teachers'}>
            <div className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2">Cancel</div>
          </Link>
          <button type="submit" className="bg-primary rounded-md text-white px-5 py-2">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAccountant;
