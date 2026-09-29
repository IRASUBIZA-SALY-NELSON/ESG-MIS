'use client';

import FileDropZone from '@/components/core/FileDrop/FileDropZone';
import React from 'react';

interface Props {
  setSelectFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const ProfileInput = ({ setSelectFile }: Props) => {
  const handleFilesSelected = (filetype: string, files: File[]) => {
    setSelectFile(files[0]);
  };
  return (
    <FileDropZone
      fileType="landing"
      onFilesSelected={handleFilesSelected}
      title="Cover photo of the student"
    />
  );
};

export default ProfileInput;
