'use client';
import FileDropZone from '@/components/core/FileDrop/FileDropZone';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { yupResolver } from '@hookform/resolvers/yup';
import { notifications } from '@mantine/notifications';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ClipLoader } from 'react-spinners';
import * as yup from 'yup';
import backBtn from '../../../../../assets/back.svg';
import CustomTextInput from '@/components/core/Input/CustomTextInput';
import { Fieldset } from '@mantine/core';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Provinces, Districts, Sectors, Cells, Villages } = require('rwanda');
const NewTeacher = () => {
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>();
  const schema = yup.object().shape({
    firstName: yup.string().required('Please provide the first name for the teacher'),
    lastName: yup.string().required('Please provide the last name for the teacher'),
    nationalId: yup.string().required('Please provide the national id number for the teacher'),
    email: yup
      .string()
      .email('Provide a valid email')
      .required('Please provide the email for the teacher'),
    gender: yup.string().required('Please provide the gender for the Teacher'),
    teacherId: yup.string().required('Please provide the teacher Id'),
    phone: yup.string().required("Please provide the teacher's phone Number"),
    country: yup.string().required('Please provide the country for the teacher'),
    // province: yup.string().required('Please provide the province for the teacher'),
    // district: yup.string().required('Please provide the district for the teacher'),
    // sector: yup.string().required('Please provide the sector for the teacher'),
    // cell: yup.string().required('Please provide the cell for the teacher'),
    // village: yup.string().required('Please provide the village for the teacher'),
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

    const address = {
      cell: selectedCell,
      country: data.country,
      district: selectedDistrict,
      province: selectedProvince,
      sector: selectedSector,
      village: selectedVillage,
    };

    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('gender', data.gender);
    formData.append('phoneNumber', data.phone);
    formData.append('registrationCode', data.registerCode);
    formData.append('username', data.firstName + ' ' + data.lastName);
    formData.append('nationalId', data.nationalId);
    // formData.append('addressDTO', JSON.stringify(address));
    formData.append('addressDTO.country', data.country);
    formData.append('addressDTO.province', selectedProvince);
    formData.append('addressDTO.district', selectedDistrict);
    formData.append('addressDTO.sector', selectedSector);
    formData.append('addressDTO.cell', selectedCell);
    formData.append('addressDTO.village', selectedVillage);
    if (selectedFile) {
      formData.append('profile', selectedFile);
    }
    AuthApi.post(`/teachers/create`, formData)
      .then((res) => {
        notifications.show({
          title: 'Success',
          message: res.data?.message,
          color: 'green',
          autoClose: 3000,
        });
        window.history.back();
      })
      .catch((err) => {
        const error = getResError(err);
        notifications.show({
          title: 'Failed to create Teacher',
          message: error,
          color: 'red',
          autoClose: 3000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleFilesSelectedDrop = (filetype: string, files: File[]) => {
    setSelectedFile(files[0]);
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
          Register New Teacher
        </h2>
      </div>
      <p className="text-[rgba(67,67,67,0.43)] my-2 capitalize">Add a new Teacher staff</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2">
        <Fieldset
          legend={<span className="font-semibold text-mainPurple">Personal information</span>}
          bg={'none'}
          className=" border-mainPurple"
        >
          <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FileDropZone
              fileType="landing"
              onFilesSelected={handleFilesSelectedDrop}
              title="Photo of the Teacher"
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
                  className="w-full my-1 px-3 py-1 text-black bg-[rgba(67,67,67,0.03)] rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('gender')}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Teacher Id"
                  className="my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                  {...register('teacherId')}
                />
              </div>
              <p className="text-red-500">{errors.gender?.message || errors.teacherId?.message}</p>
              <input
                type="text"
                placeholder="National Id"
                className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('nationalId')}
              />
              <p className="text-red-500">{errors.nationalId?.message}</p>
              <input
                type="text"
                placeholder="Phone number"
                className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] outline-none"
                {...register('phone')}
              />
              <p className="text-red-500">{errors.phone?.message}</p>
            </div>
          </div>
        </Fieldset>
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
        <p className="text-red-500  my -3">
          {errors.country?.message}
          {/* errors.province?.message ||
            errors.district?.message ||
            errors.sector?.message ||
            errors.cell?.message ||
            errors.village?.message} */}
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Link href={'/admin/workers/teachers'}>
            <div className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2">Cancel</div>
          </Link>
          {loading ? (
            <div className="bg-primary rounded-md text-white px-9 py-2">
              <ClipLoader color="white" size={15} />
            </div>
          ) : (
            <button type="submit" className="bg-primary rounded-md text-white px-5 py-2">
              Create
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewTeacher;
