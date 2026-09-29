'use client';
import React, { useState } from 'react';
import ProfileInput from '../../../../components/Profile/ProfileInput';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getResError } from '@/utils/fetch';
import { AuthApi } from '@/utils/constants';
import Image from 'next/image';
import backBtn from '../../../../assets/back.svg';
import { Fieldset } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ClipLoader } from 'react-spinners';
import CustomTextInput from '@/components/core/Input/CustomTextInput';
import DraftNotice from '@/components/core/DraftNotice';
import { rwandaLocationExtras, useFormDraft } from '@/hooks/useFormDraft';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Provinces, Districts, Sectors, Cells, Villages } = require('rwanda');

const NewStudent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    fatherEmail: yup.string().email('Please provide a valid email').optional(),
    motherEmail: yup.string().email('Please provide a valid email').optional(),
    guardianEmail: yup.string().email('Please provide a valid email').optional(),
    fatherName: yup.string().optional(),
    motherName: yup.string().optional(),
    guardianName: yup.string().optional(),
    fatherPhone: yup.string().optional(),
    motherPhone: yup.string().optional(),
    guardianPhone: yup.string().optional(),
    guardianGender: yup.string().optional(),
    fatherNationalId: yup.string().optional(),
    motherNationalId: yup.string().optional(),
    guardianNationalId: yup.string().optional(),
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

  const onSubmit = async (data: any) => {
    setLoading(true);
    const parent = (
      name?: string,
      email?: string,
      phone?: string,
      nationalId?: string,
      extra?: Record<string, string | undefined>,
    ) => {
      if (!name && !email) return undefined;
      return {
        fullName: name || undefined,
        email: email || undefined,
        phoneNumber: phone || undefined,
        nationalId: nationalId || undefined,
        ...extra,
      };
    };
    const body = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gender: data.gender,
      phoneNumber: data.phone || undefined,
      nationalId: data.nationalId || undefined,
      username: data.email,
      father: parent(data.fatherName, data.fatherEmail, data.fatherPhone, data.fatherNationalId),
      mother: parent(data.motherName, data.motherEmail, data.motherPhone, data.motherNationalId),
      guardian: parent(data.guardianName, data.guardianEmail, data.guardianPhone, data.guardianNationalId, {
        gender: data.guardianGender,
      }),
    };

    try {
      const res = await AuthApi.post(`/students/create`, body);
      notifications.show({
        title: 'Success',
        message: res.data?.message,
        color: 'green',
        autoClose: 3000,
      });
      clear();
      router.push('/admin/students');
    } catch (err) {
      notifications.show({
        title: 'Failed to Create Student',
        message: getResError(err, 'Could not create the student'),
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
          Register New Student
        </h2>
      </div>
      <p className="text-[rgba(67,67,67,0.43)] my-2 capitalize">Add a new Student to the School</p>
      <DraftNotice
        savedAt={savedAt}
        onDiscard={() => {
          clear();
          reset();
          setSelectedProvince('');
          setSelectedDistrict('');
          setSelectedSector('');
          setSelectedCell('');
          setSelectedVillage('');
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
        <Fieldset
          legend={<span className="font-semibold text-mainPurple">Personal information</span>}
          bg={'none'}
          className=" border-mainPurple"
        >
          <div className="mt-10 mb-5  grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProfileInput setSelectFile={setSelectedFile} />
            <div className="w-full gap-2 flex flex-col">
              <div className="w-full flex flex-col sm:flex-row sm:gap-2">
                <CustomTextInput
                  type="text"
                  placeholder="First Name"
                  label="First Name"
                  register={register('firstName')}
                />
                <CustomTextInput
                  label="Last Name"
                  type="text"
                  placeholder="Last Name"
                  register={register('lastName')}
                />
              </div>
              <CustomTextInput
                type="text"
                placeholder="Student Email"
                label="Email"
                register={register('email')}
              />
              <div className="w-full flex  gap-2">
                <select
                  className="w-[35%] my-1 px-3 py-2 text-black bg-[rgba(67,67,67,0.03)] rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('gender')}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone Number"
                  className=" w-[65%]  my-1 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('phone')}
                />
              </div>
              <CustomTextInput
                type="text"
                placeholder="National Id"
                label="National Id"
                register={register('nationalId')}
              />
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
        </Fieldset>
        <div className="flex flex-col gap-2">
          <Fieldset
            legend={<span className="font-semibold text-mainPurple">Location Details</span>}
            bg={'none'}
            className=" border-mainPurple"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 my-2 gap-2">
              <CustomTextInput
                type="text"
                placeholder="Country of Residence"
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
                className=" px-3 h-fit mt-auto py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
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
              {/* to change */}
              {/* <input
              type="text"
              placeholder="Village of Residence"
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
              {...register('village')}
            /> */}
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
          <p className="text-red-500">
            {errors.country?.message}
            {/* {
              errors.selectedProvince?.message ||
              errors.selectedDistrict?.message ||
              errors.selectedCell?.message ||
              errors.selectedVillage?.message} */}
          </p>
          <Fieldset
            legend={<span className="font-semibold text-mainPurple">Parents Details</span>}
            bg={'none'}
            className=" border-mainPurple"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <CustomTextInput
                  type="text"
                  placeholder="Father's Name"
                  label="Father's Name"
                  register={register('fatherName')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Father's National id"
                  label="Father's National id"
                  register={register('fatherNationalId')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Father's Email"
                  label="Father's Email"
                  register={register('fatherEmail')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Father's Phone Number"
                  label="Father's Phone Number"
                  register={register('fatherPhone')}
                />
              </div>
              <div className="flex flex-col gap-2">
                <CustomTextInput
                  type="text"
                  placeholder="Mother's Name"
                  label="Mother's Name"
                  register={register('motherName')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Mother's National id"
                  label="Mother's National id"
                  register={register('motherNationalId')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Mother's Email"
                  label="Mother's Email"
                  register={register('motherEmail')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Mother's Phone Number"
                  label="Mother's Phone Number"
                  register={register('motherPhone')}
                />
              </div>
            </div>
          </Fieldset>
          <p className="text-red-500">
            {errors.fatherName?.message ||
              errors.motherName?.message ||
              errors.fatherEmail?.message ||
              errors.motherEmail?.message ||
              errors.fatherPhone?.message ||
              errors.motherPhone?.message}
          </p>
        </div>
        <div className="">
          <Fieldset
            legend={<span className="font-semibold text-mainPurple">Guardian Details</span>}
            bg={'none'}
            className=" border-mainPurple"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col  gap-2">
                <CustomTextInput
                  type="text"
                  placeholder="Guardian's Name"
                  label="Guardian's Name"
                  register={register('guardianName')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Guardian's National id"
                  label="Guardian's National id"
                  register={register('guardianNationalId')}
                />
                <select
                  className="px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)]"
                  {...register('guardianGender')}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex flex-col  gap-2">
                <CustomTextInput
                  type="text"
                  placeholder="Guardian's Email"
                  label="Guardian's Email"
                  register={register('guardianEmail')}
                />
                <CustomTextInput
                  type="text"
                  placeholder="Guardian's Phone Number"
                  label="Guardian's Phone Number"
                  register={register('guardianPhone')}
                />
              </div>
            </div>
          </Fieldset>
        </div>
        <p className="text-red-500">
          {errors.guardianName?.message ||
            errors.guardianEmail?.message ||
            errors.guardianPhone?.message}
        </p>
        <div className="my-10 flex flex-row gap-10">
          <button
            type="button"
            className="bg-[rgba(67,67,67,0.03)]  text-black rounded-md  border-[2px] border-[rgba(67,67,67,0.09)] px-5 py-2"
          >
            Cancel Registration
          </button>
          {loading ? (
            <div className="bg-primary rounded-md text-white px-12 py-2 cursor-not-allowed">
              <ClipLoader size={15} color="white" />
            </div>
          ) : (
            <button
              type="submit"
              className="bg-primary rounded-md text-white px-5 py-2 cursor-pointer"
            >
              Register Student
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewStudent;
