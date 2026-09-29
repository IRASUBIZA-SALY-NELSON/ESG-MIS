'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AuthApi } from '@/utils/constants';
import { ICourse } from '@/types/course.type';
import backBtn from '@/assets/back.svg';
import Image from 'next/image';
import { ClipLoader } from 'react-spinners';
import viewFile from '@/assets/viewFile.svg';
import downloadFile from '@/assets/downloadFile.svg';
import pdf from '@/assets/pdf.svg';
import docx from '@/assets/docx.svg';
import Link from 'next/link';

interface PDF {
  name: string;
  file: string;
}

interface Term {
  name: string;
  pdfs: PDF[];
}

interface Year {
  name: string;
  terms: Term[];
}

const OneCourseDocs: React.FC = () => {
  const params = useParams();
  const { id } = params;
  const [course, setCourse] = useState<ICourse | null>(null);
  const [pastPapers, setPastPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [papersYears, setPapersYears] = useState<any[]>([]);
  const [papersTerms, setPapersTerms] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<{
    id: null | string;
    hover: boolean;
  }>({
    id: null,
    hover: false,
  });
  const handleMouseEnter = (id: string) => {
    setIsHovered({ id, hover: true });
  };
  const handleMouseLeave = () => {
    setIsHovered({ id: null, hover: false });
  };

  useEffect(() => {
    if (id) {
      AuthApi.get(`/courses/id/${id}`).then((res) => {
        setCourse(res.data.data);
        setLoading(false);
      });
    }
  }, [id]);
  function getAllAcademicYears(items: any) {
    const academicYears: any[] = [];
    items.forEach((item: any) => {
      const academicYear = item.term.academicYear;
      if (!academicYears.some((year) => year?.id === academicYear?.id)) {
        academicYears.push(academicYear);
      }
    });

    return academicYears;
  }

  function getAllTerms(items: any): any[] {
    const terms: any[] = [];
    items.forEach((item: any) => {
      const term = item.term;
      if (!terms.some((t) => t.id === term.id)) {
        terms.push(term);
      }
    });

    return terms;
  }
  useEffect(() => {
    const fetchNotesAndPapers = async () => {
      setPageLoading(true);
      if (course) {
        try {
          const papersResponse = await AuthApi.get(`/past-papers/course/${id}`);

          setPastPapers(papersResponse.data.data);
          setPapersYears(getAllAcademicYears(papersResponse.data.data));
          setPapersTerms(getAllTerms(papersResponse.data.data));
        } catch (error) {
          setError('Failed to fetch notes and papers.');
        }
      }
      setPageLoading(false);
    };
    fetchNotesAndPapers();
  }, [id, course]);

  const Loader = () => (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader color="blue" size={20} />
    </div>
  );

  return (
    <div className="p-4">
      {loading && <Loader />}

      {!loading && course && (
        <>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                window.history.back();
              }}
            >
              <Image src={backBtn} alt="" />
            </button>
            <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
              {course.courseName}
            </h2>
          </div>
          {pageLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              {' '}
              <ClipLoader color="blue" size={15} />
            </div>
          ) : (
            <>
              <div className={`transition-max-height duration-500 overflow-hidden `}>
                {pastPapers.length > 0 ? (
                  <>
                    {papersYears.map((year, i) => {
                      return (
                        <div key={i} className="p-4">
                          <p className="font-semibold text-lg">
                            {year?.startYear + '-' + year?.endYear}
                          </p>
                          {papersTerms
                            .filter((term) => term.academicYear.id === year.id)
                            .map((term, i) => {
                              return (
                                <div key={i}>
                                  <p className="font-medium text-sm py-4 uppercase">
                                    {term.name.replace('_', ' ')}
                                  </p>
                                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
                                    {pastPapers
                                      .filter((paper) => paper.term.id === term.id)
                                      .map((paper, i) => {
                                        return (
                                          <div
                                            key={i}
                                            onMouseEnter={() => handleMouseEnter(paper.id)}
                                            onMouseLeave={() => handleMouseLeave()}
                                            className=" p-3 py-5 bg-gray-100 rounded-md flex items-center justify-center flex-col relative"
                                          >
                                            {paper.fileName.includes('docx') ? (
                                              <Image src={docx} alt="" className="w-20" />
                                            ) : (
                                              <Image src={pdf} alt="" className="w-20" />
                                            )}
                                            <div className="flex justify-between">
                                              <p className="text-xs my-3 px-3">
                                                {paper.fileName.length > 30
                                                  ? paper.fileName.slice(0, 25) +
                                                    ' ' +
                                                    paper.fileName.slice(25, 50) +
                                                    ' ' +
                                                    paper.fileName.slice(50, 75)
                                                  : paper.fileName}
                                              </p>
                                            </div>
                                            <div
                                              className={`${
                                                isHovered.id === paper.id ? ' block' : 'hidden'
                                              } bg-gray-200 z-20 absolute bottom-0 w-full p-2`}
                                            >
                                              <div className="flex gap-2 items-center justify-end w-full">
                                                {/* <Link href={`/public/docs/past-papers/${paper.id}`}>
                                                  <Image
                                                    src={viewFile}
                                                    alt=""
                                                    className="w-5 bg-gray-200"
                                                  />
                                                </Link> */}
                                                <a
                                                  href={paper.downloadLink}
                                                  className="cursor-pointer"
                                                  download={paper.fileName}
                                                >
                                                  <Image
                                                    src={downloadFile}
                                                    alt=""
                                                    className="w-5 bg-gray-200"
                                                  />
                                                </a>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 font-semibold">
                    No Past Papers So Far
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OneCourseDocs;
