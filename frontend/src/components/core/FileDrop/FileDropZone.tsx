'use client';
import React, { FC, ReactNode, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileDropZone: FC<{
  fileType: string;
  onFilesSelected: (filetype: string, files: File[]) => void;
  title: string;
}> = ({ fileType, onFilesSelected, title }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    onFilesSelected(fileType, acceptedFiles);
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png', '.PNG', '.jpg', '.JPG', '.jpeg', '.JPEG'],
    },
  });

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();

          const reader = new FileReader();
          reader.onload = () => {
            setSelectedImage(reader.result as string);
          };
          if (blob) reader.readAsDataURL(blob);
          onFilesSelected(fileType, [blob as File]);
          break;
        }
      }
    }
  };
  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'active bg-primary/20' : ''}`}
      onPaste={handlePaste}
    >
      <input {...getInputProps()} />
      {selectedImage !== null ? (
        <div className="bg-[rgba(67,67,67,0.03)] w-full aspect-square rounded-md border-[2px] border-[rgba(67,67,67,0.09)] flex flex-col gap-5 justify-center items-center">
          <img
            src={selectedImage as string}
            alt="Selected"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      ) : (
        <div>
          {isDragActive ? (
            <div className="bg-[rgba(67,67,67,0.03)] h-[300px] rounded-md border-[2px] border-[rgba(67,67,67,0.09)] flex flex-col gap-5 justify-center items-center p-2 ">
              <p className="text-[rgba(0,0,0,0.1)]  text-[28px] font-semibold">
                Select or Drop/Copy the file here
              </p>
            </div>
          ) : (
            <div className="bg-[rgba(67,67,67,0.03)] h-[300px] rounded-md border-[2px] border-[rgba(67,67,67,0.09)] flex flex-col gap-5 justify-center  items-center p-2">
              <p className="text-[rgba(0,0,0,0.1)] text-center text-[28px] font-semibold">
                Drag & Drop or Select/Copy
              </p>
              <p className="text-[rgba(73,73,74,0.78)] text-sm font-medium">{title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
