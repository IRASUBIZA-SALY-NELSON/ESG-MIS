'use client';
import React from 'react';
import Image from 'next/image';
import backBtn from '../../../../../../assets/back.svg';
import FileDropZone from '@/components/core/FileDrop/FileDropZone';
import Link from 'next/link';

const Edit = () => {
  const handleFilesSelected = (filetype: string, files: File[]) => {};
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
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2 ">Edit DS</h2>
      </div>
      <div className="my-5 grid grid-cols-2 gap-5">
        <FileDropZone
          fileType="landing"
          onFilesSelected={handleFilesSelected}
          title="Photo of the Teacher"
        />
        <div className="w-[50%] md:w-full">
          <input
            type="text"
            placeholder="Student Name"
            className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)]"
          />
          <input
            type="text"
            placeholder="Student Email"
            className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)]"
          />
          <div className="grid grid-cols-2 my-2 gap-2">
            <input
              type="text"
              placeholder="Class of Student"
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)]"
            />
            <input
              type="text"
              placeholder="Promotion in-take"
              className=" px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)]"
            />
          </div>
          <textarea
            placeholder="Description of the student"
            className=" my-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)] w-full px-3 py-2"
          ></textarea>
        </div>
        <div className="w-[50%] md:w-full">
          <input
            type="text"
            placeholder="Province Of Residence"
            className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)]"
          />
        </div>
        <div className="w-[50%] md:w-full">
          <input
            type="text"
            placeholder="District Of Residence"
            className=" w-full  my-2 px-3 py-2 text-black  bg-[rgba(67,67,67,0.03)]  rounded-md border-[2px] border-[rgba(67,67,67,0.09)]"
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Link href={'/admin/workers/teachers'}>
          <div className="bg-[rgba(10,107,79,0.5)] rounded-md text-primary px-5 py-2">Cancel</div>
        </Link>
        <button className="bg-primary rounded-md text-white px-5 py-2">Edit</button>
      </div>
    </div>
  );
};

export default Edit;
