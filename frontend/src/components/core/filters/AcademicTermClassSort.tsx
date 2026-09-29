import { Select } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import AsyncSelect from '../selects/AsyncSelect';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';

interface Props {
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  data: any[];
}

const AcademicTermClassSort = ({ setData, data: defaultData }: Props) => {
  const [acaYearId, setAcadYearId] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');
  const { data: classes } = useGet<IClass[]>('/classes/all', { defaultData: [] }); // TODO: get classes by academic year and term
  const { data, loading, error, getPaginated } = useGet<any[]>(
    `/students/all/by-class-and-academic-year
`,
    {
      query: {
        classId,
        termId,
      },
      onMount: false,
      paginated: true,
      pagination: {
        limit: 100,
      },
    },
  );

  useEffect(() => {
    if (classId === 'all') {
      setData(defaultData);
      return;
    }
    // if active class is empty, academic year is empty, term is empty, return
    if (classId === '' || acaYearId === '' || termId === '') return;
    // get students by class and academic year and term
    getPaginated();
  }, [classId, acaYearId, termId]);

  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data]);

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex md:flex-row flex-col">
        <AsyncSelect
          datasrc={`/academic-years/all`}
          variant="default"
          label="Academic Year"
          onChange={(e) => setAcadYearId(e)}
          value={acaYearId ?? ''}
          placeholder="Select academic year"
          //     setActive={(e) => setAcademicYear(e)}
        />
        {acaYearId && (
          <AsyncSelect
            datasrc={`/terms/all/academic-year/${acaYearId}`}
            variant="default"
            label="Term"
            onChange={(e) => setTermId(e)}
            value={termId ?? ''}
            placeholder="Select term"
            //       setActive={(e) => setTerm(e)}
          />
        )}
      </div>
      <div className=" gap-x-3 flex items-center">
        <span className=" px-2 text-gray-600">Select Class</span>
        <Select
          // label="View"
          placeholder="Select Class"
          size="sm"
          w={150}
          data={[
            {
              group: 'Class',
              items: [
                ...classes!.map((classIt) => ({
                  label: classIt.className,
                  value: `class${classIt.id}`,
                })),
              ],
            },
          ]}
          searchable
          defaultValue={'all'}
          onChange={(e) => {
            if (!e || !e.includes('class')) return;
            setClassId(e.replace('class', ''));
          }}
        />
      </div>
    </div>
  );
};

export default AcademicTermClassSort;
