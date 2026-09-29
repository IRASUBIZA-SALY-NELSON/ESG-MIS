import useGet from '@/hooks/useGet';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { cn } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import AsyncSelect from '../core/selects/AsyncSelect';

interface IAcademicFilterProps {
  getAcademicYear?: (academicYear: IAcademicYear | undefined) => void;
  getTerm?: (term: ITerm | undefined) => void;
  className?: string;
  //* implement all props if one these below is provided
  setTerms?: (terms: ITerm[]) => void;
  setAcademicYears?: (academicYears: IAcademicYear[]) => void;
  academicYearId?: string;
  termId?: string;
  //* end of co-related props
}

/**
 * @author Ndungutse Charles
 * @param props
 * @returns JSX.Element
 */
const AcademicFilter = (props: IAcademicFilterProps) => {
  const {
    getAcademicYear,
    getTerm,
    className,
    setAcademicYears,
    setTerms,
    academicYearId,
    termId,
  } = props;
  const [academicYear, setAcademicYear] = useState<string | undefined>(academicYearId);
  const [term, setTerm] = useState<string | undefined>(termId);

  useEffect(() => {
    if (academicYearId) setAcademicYear(academicYearId);
    if (termId) setTerm(termId);
  }, [academicYearId, termId]);

  return (
    <div className={cn('flex items-center w-full justify-between', className)}>
      <div className="flex justify-between md:flex-row flex-col md:items-center gap-x-2">
        <span className=" font-medium text-sm px-2">Academic Year</span>
        <AsyncSelect
          datasrc={`/academic-years/all`}
          variant="default"
          value={academicYear ?? ''}
          placeholder="Select academic year"
          setActive={(e) => {
            !academicYearId && setAcademicYear(e?.id); // very risky
            getAcademicYear?.(e);
          }}
          setData={(data) => {
            setAcademicYears?.(data);
          }}
        />
      </div>
      {academicYear && (
        <div className="flex justify-between md:flex-row flex-col md:items-center gap-x-2">
          <span className=" font-medium text-sm px-2">Term</span>
          <AsyncSelect
            datasrc={`/terms/all/academic-year/${academicYear}`}
            variant="default"
            value={term ?? ''}
            placeholder="Select term"
            setActive={(e) => {
              !termId && setTerm(e?.id);
              getTerm?.(e);
            }}
            setData={(data) => {
              setTerms?.(data);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AcademicFilter;
