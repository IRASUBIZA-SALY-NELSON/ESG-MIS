import { ITerm } from '@/types/other.type';
import { AuthApi, baseUrl } from '@/utils/constants';
import { enumToCamelCase } from '@/utils/funcs/func1';
import { InputWrapper, Select, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { FC, useState } from 'react';
import MainModal from '../core/modals/modal';
import useGet from '@/hooks/useGet';
import { getCookie } from 'cookies-next';
import { IClass } from '@/types/class.type';

interface Props {
  action: 'release' | 'export';
  academicYear: any;
  setOpenRelease: React.Dispatch<React.SetStateAction<any>>;
}

const ReportReleasing: FC<Props> = ({ academicYear, setOpenRelease, action }) => {
  const [markType, setMarkType] = useState<string | null>('EXAM');
  const [activeTab, setActiveTab] = useState<string>('academic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termId, setTermId] = useState<string | null>('');
  const [classId, setClassId] = useState<string | null>('');
  const [term, setTerm] = useState<ITerm | null>(null);
  const [warn, setWarn] = useState(false);
  const { data: terms, get: fetchTerms } = useGet<ITerm[]>(
    `/terms/all/academic-year/${academicYear.id}`,
    {
      defaultData: [],
    },
  );
  const { data: classes, get: fetchClasses } = useGet<IClass[]>(
    `/classes/all/year/${academicYear.id}`,
    {
      defaultData: [],
    },
  );

  const exportExcel = async () => {
    setLoading(true);
    if (termId === '') {
      setError('Select term to release report cards');
      return;
    }
    if (classId === '') {
      setError('Select term to release report cards');
      return;
    }

    try {
      let blob;

      if (activeTab.toUpperCase() === 'ACADEMIC') {
        const res = await fetch(
          `${baseUrl}/api/v1/exporting/students-percentages?classId=${classId}&termId=${termId}&type=${activeTab}`,
          {
            headers: {
              Authorization: `Bearer ${getCookie('token')}`,
            },
          },
        );
        blob = await res.blob();
      } else {
        const response = await AuthApi.get(
          `/exporting/students/performance/?termId=${termId}&academicYearId=${academicYear.id}${
            classId ? `&classId=${classId}` : ''
          }&markType=${activeTab.toUpperCase()}`,
          {
            responseType: 'blob',
          },
        );
        blob = response.data;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const classIt = classes?.find((classIt) => classIt.id === classId);
      link.download = `${classIt?.className}-${activeTab}performance.xlsx`;
      link.click();
      link.remove();
      setOpenRelease(null);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'There has been an error in generating the excel, you may please reload!',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRelease = () => {
    setError('');
    if (termId === '') {
      setError('Select term to release report cards');
      return;
    }
    if (!markType) {
      setError('Select mark type to release report cards');
      return;
    }
    if (markType === term?.termMarksStatus) {
      setError(
        `Report cards for ${markType} in ${enumToCamelCase(term.name.replace('_', ' '))} have already been released`,
      );
      return;
    }
    setWarn(true);
  };

  const releaseReport = async () => {
    setError('');
    if (termId === '') {
      setError('Select term to release report cards');
      return;
    }
    if (!markType) {
      setError('Select mark type to release report cards');
      return;
    }
    if (markType === term?.termMarksStatus) {
      setError(
        `Report cards for ${markType} in ${enumToCamelCase(term.name.replace('_', ' '))} have already been released`,
      );
      return;
    }
    try {
      setLoading(true);
      const res = await AuthApi.patch(`/terms/update/mark-status/${termId}?status=${markType}`);

      notifications.show({
        title: 'Report Cards Released',
        message: 'Report cards have been released successfully',
        color: 'green',
      });
      setOpenRelease(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error releasing report cards',
        color: 'red',
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex pb-5 flex-col justify-center items-center">
      {action == 'export' && (
        <div className="flex items-center w-full mt-3">
          <h2 className=" text-sm mr-3">Mark Type: </h2>
          <button
            type="button"
            className={`py-2  text-[80%] px-5 rounded-lg ${
              activeTab != 'academic'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setActiveTab('academic')}
          >
            ACADEMIC
          </button>
          <button
            type="button"
            className={`py-2 ml-[-10px] text-[80%] px-5 rounded-lg ${
              activeTab != 'discipline'
                ? 'bg-[#43434305] text-[bg-primary] '
                : 'bg-primary text-white font-bold'
            }`}
            onClick={() => setActiveTab('discipline')}
          >
            DISCIPLINE
          </button>
        </div>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <InputWrapper
        label="Select term"
        className=" w-full mt-2"
        description="Select term to release report cards"
      >
        <Select
          data={terms?.map((term) => ({
            value: term.id,
            label: enumToCamelCase(term.name.replace('_', ' ')),
          }))}
          value={termId}
          onChange={(id) => {
            setTermId(id);
            const term = terms?.find((term) => term.id === id);

            setTerm(term ?? null);
          }}
          placeholder="Select term"
        />
      </InputWrapper>
      {action === 'export' && (
        <InputWrapper
          label="Select class"
          className=" w-full mt-2"
          description="Select class to export performance"
        >
          <Select
            data={classes?.map((cls) => ({
              value: cls.id,
              label: enumToCamelCase(cls.className),
            }))}
            value={classId}
            onChange={(id) => {
              setClassId(id);
              const cls = terms?.find((cls) => cls.id === id);
            }}
            placeholder="Select class"
          />
        </InputWrapper>
      )}
      {action === 'release' && (
        <>
          {termId && term?.termMarksStatus === 'EXAM' && (
            <p className=" text-mainPurple text-sm mt-2 w-full text-start">
              Currently {term?.termMarksStatus} in {enumToCamelCase(term?.name ?? '')} is released
            </p>
          )}
          <InputWrapper
            label="Select type (CAT, EXAM)"
            className=" w-full mt-1"
            description="Select mark type to release report cards"
          >
            <Select
              data={['CAT', 'EXAM']}
              value={markType}
              onChange={setMarkType}
              // defaultValue={}
              placeholder="Select type (CAT, EXAM)"
            />
          </InputWrapper>
          <p className=" text-mainPurple mt-2 text-center text-sm">
            Note: If you select 'EXAM' as mark status CAT marks will be released automatically
          </p>
        </>
      )}
      <div className="flex gap-4 mt-4">
        <Button onClick={() => setOpenRelease(false)} variant="outline">
          Cancel
        </Button>
        <Button
          onClick={action === 'release' ? onRelease : exportExcel}
          loading={loading}
          disabled={loading}
        >
          {action === 'release' ? 'Release' : 'Export Excel'}
        </Button>
      </div>
      <MainModal isOpen={warn} onClose={() => setWarn(false)}>
        <div className="flex flex-col justify-center items-center">
          <p className=" font-semibold text-center">
            Are you sure you want to release report cards for {markType} in{' '}
            {enumToCamelCase(term?.name ?? '')}?
            <span className="text-mainPurple font-bold block text-sm text-start mt-2">
              Make Sure all marks in each class are entered in each class because some might receive
              incomplete report cards
            </span>
          </p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => setWarn(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={releaseReport} loading={loading} disabled={loading}>
              Release
            </Button>
          </div>
        </div>
      </MainModal>
    </div>
  );
};

export default ReportReleasing;
