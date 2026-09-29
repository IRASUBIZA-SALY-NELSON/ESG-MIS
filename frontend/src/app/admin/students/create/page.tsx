'use client';
import React, { useState } from 'react';
import ProfileInput from '../../../../components/Profile/ProfileInput';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getCookie } from 'cookies-next';
import { AuthApi } from '@/utils/constants';
import Image from 'next/image';
import backBtn from '../../../../assets/back.svg';
import { Fieldset } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ClipLoader } from 'react-spinners';
import CustomTextInput from '@/components/core/Input/CustomTextInput';
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('addressDTO.cell', selectedCell);
    formData.append('addressDTO.country', data.country);
    formData.append('addressDTO.district', selectedDistrict);
    formData.append('addressDTO.province', selectedProvince);
    formData.append('addressDTO.sector', selectedSector);
    formData.append('addressDTO.village', selectedVillage);
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

    AuthApi.post(`/students/create`, formData)
      .then((res) => {
        notifications.show({
          title: 'Success',
          message: res.data?.message,
          color: 'green',
          autoClose: 3000,
        });
        router.push('/admin/students');
      })
      .catch((err) => {
        notifications.show({
          title: 'Failed to Create Student',
          message: err.message,
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
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
          Register New Student
        </h2>
      </div>
      <p className="text-[rgba(67,67,67,0.43)] my-2 capitalize">Add a new Student to the School</p>
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
            <input
              type="submit"
              value={'Register Student '}
              className="bg-primary rounded-md text-white px-5 py-2 cursor-pointer"
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default NewStudent;
