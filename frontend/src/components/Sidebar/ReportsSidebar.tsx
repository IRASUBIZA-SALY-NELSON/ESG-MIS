'use client';
import { useRouter } from 'next13-progressbar';
import { useEffect, useState } from 'react';
import CustomInput from '../core/input';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AsyncSelect from '../core/selects/AsyncSelect';

interface Drop {
  dropHeader: string;
  dropItems: object[];
  id: number;
}
const ReportSidebar = () => {
  const params = useParams();
  const [acadId, setAcadId] = useState((params.id as string) ?? '');
  const router = useRouter();
  const { reportCard } = useApp();

  useEffect(() => {
    if (!acadId) return;

    setAcadId(acadId);
    router.push(`/student/report-cards/${acadId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acadId]);

  return (
    <div className="w-full flex items-center justify-between border-[1px] border-[#43434305] rounded-lg  ">
      <header className="text-[#0000007a] px-4 font-semibold text-left   text-[13px]">
        Report Card to Show
      </header>

      <div className=" flex items-center sm:flex-row flex-col">
        <span className=" text-sm whitespace-nowrap">Academic Year</span>
        <AsyncSelect
          // label="Academic Year"
          placeholder="Select Academic Year"
          onChange={(e) => {
            setAcadId(e as string);
          }}
          width={300}
          variant="default"
          // error={error.academicYear}
          datasrc="/academic-years/all"
          value={acadId ?? reportCard?.academicYearInfo.id}
        />
      </div>
    </div>
  );
};

export default ReportSidebar;
