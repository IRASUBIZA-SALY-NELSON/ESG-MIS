import useGet from '@/hooks/useGet';
import { MARK_TYPE } from '@/types/marks.type';
import { AuthApi, backend } from '@/utils/constants';
import { exportToExcel, handleFilter } from '@/utils/funcs';
import { Button } from '@mantine/core';
import { getCookie } from 'cookies-next';
import React, { useState } from 'react';
import { BsFileExcel } from 'react-icons/bs';
import toast from 'react-hot-toast';

interface Props {
  data?: any[];
  onClose: () => void;
  tableName?: string;
  classId: string | null;
  term_id: string | null;
  weight?: number | null;
  courseId?: string | null;
}

const ExportTemplate = ({ onClose, tableName, term_id, classId, weight, courseId }: Props) => {
  const [markType, setMarkType] = useState<MARK_TYPE>(MARK_TYPE.CAT);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${backend}/exporting/students/marking-template?classId=${classId}&termId=${term_id}&markType=${markType}&weight=${weight}&courseId=${courseId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getCookie('token')}`,
          },
        },
      );

      if (res.status === 404 || res.status === 400) {
        toast.error('No students found for the selected criteria.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setLoading(false);
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.blob();

      // Check if the blob has content
      if (data.size === 0) {
        toast.error('No data available for export.');
        setLoading(false);
        return;
      }

      // Save file
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tableName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while exporting the file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      <p className=" text-center">Select mark type to be initialized</p>
      <div className="flex w-full justify-center">
        <>
          <button
            className={`py-2  text-[80%] px-5 rounded-lg ${
              markType != 'CAT'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setMarkType(MARK_TYPE.CAT)}
          >
            CAT
          </button>
          <button
            className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
              markType != 'EXAM'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setMarkType(MARK_TYPE.EXAM)}
          >
            EXAM
          </button>
          <button
            className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
              markType != MARK_TYPE.SECOND_SITTING
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setMarkType(MARK_TYPE.SECOND_SITTING)}
          >
            SECOND SITTING
          </button>
        </>
      </div>
      <Button
        className="flex items-center wf-fit mx-auto"
        color="green"
        loading={loading}
        disabled={loading}
        onClick={handleExport}
      >
        <BsFileExcel className="mr-2" />
        Export Excel
      </Button>
    </div>
  );
};

export default ExportTemplate;
