import PreviewTeacherExcel from '@/components/staff/teachers/PreviewTeacherExcel';
import { Button, FileButton, Flex } from '@mantine/core';
import { FC, useState } from 'react';
import { BsFileExcel } from 'react-icons/bs';
import * as XLSX from 'xlsx';
import React from 'react';
import { AuthApi } from '@/utils/constants';
import { AxiosRequestConfig } from 'axios';
import { notifications } from '@mantine/notifications';
import { getResError } from '@/utils/fetch';

interface Props {
  onClose: () => void;
  renderPreview: (excelData: any) => React.ReactNode;
  portal: string;
  formatUrl?: string;
  postOpts?: AxiosRequestConfig<FormData>;
  notes?: string;
  exportComponent?: React.ReactNode;
  title?: string;
}

const ImportForm: FC<Props> = ({
  onClose,
  renderPreview,
  portal,
  formatUrl,
  postOpts,
  notes,
  exportComponent,
  title,
}) => {
  const [excelData, setExcelData] = useState<any>(null);
  const [file, setFile] = useState<any>();
  const [isPreviewed, setIsPreviewed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (file: any) => {
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        workbook.SheetNames.forEach((sheetName) => {
          const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          if (roa.length) {
            setExcelData(roa);
            setIsPreviewed(true);
            setIsPreviewOpen(true);
          }
        });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handlePreviewAndPost = () => {
    const formData = new FormData();
    formData.append('file', file);
    setIsPreviewOpen(false);
    setLoading(true);
    AuthApi.post(`/importing/${portal}`, formData, postOpts)
      .then((response) => {})
      .catch((error) => {
        if (error.response.status === 400) {
          notifications.show({
            title: 'Error',
            message: error.response.data.message,
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Error',
            message: '500:Internal server error',
            color: 'red',
          });
        }
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <div className=" w-full flex gap-y-3 items-start flex-col">
      <p className=" text-center font-semibold w-full">{title ?? 'Import data'}</p>
      <FileButton onChange={handleFileChange} accept=".xlsx, .xls">
        {(props) => (
          <Button {...props} className=" w-fit mx-auto" color="green">
            <BsFileExcel className="mr-2" />
            Select Excel to Import
          </Button>
        )}
      </FileButton>
      {isPreviewOpen && excelData && renderPreview(excelData)}
      <Flex gap={10} mx={'auto'}>
        {isPreviewOpen && (
          <div className="flex w-full justify-center">
            <Button onClick={handleClosePreview} color="blue" variant="light">
              Close Preview
            </Button>
          </div>
        )}
        {isPreviewed && (
          <div className="flex w-full justify-center">
            <Button loading={loading} onClick={handlePreviewAndPost}>
              Post
            </Button>
          </div>
        )}
      </Flex>
      {formatUrl && (
        <h1 className=" text-sm text-center w-full">
          Don't know the format of how your excel should look like?{' '}
          <a className=" text-mainPurple font-semibold" href={formatUrl} target="_blank">
            Download/View Excel Format
          </a>
        </h1>
      )}
      {exportComponent && exportComponent}
      {notes && (
        <h1 className=" text-mainPurple text-sm font-bold text-center w-full">Note:{notes}</h1>
      )}
      {/* clos button */}
      <div className="flex w-full justify-center">
        <Button onClick={onClose} color="blue" variant="light">
          Close
        </Button>
      </div>
    </div>
  );
};

export default ImportForm;
