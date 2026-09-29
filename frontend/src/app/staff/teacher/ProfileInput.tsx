'use client';

import FileDropZone from '@/components/core/FileDrop/FileDropZone';
import React from 'react';

const ProfileInput = () => {
  const handleFilesSelected = (filetype: string, files: File[]) => {};
  return (
    <FileDropZone
      fileType="landing"
      onFilesSelected={handleFilesSelected}
      title="Cover photo of the student"
    />
  );
};

export default ProfileInput;
