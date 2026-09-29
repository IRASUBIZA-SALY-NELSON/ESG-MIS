'use client';
import React, { useState, useEffect } from 'react';
import { AuthApi } from '@/utils/constants';
import { ICourse } from '@/types/course.type';
import backBtn from '@/assets/back.svg';
import Image from 'next/image';
import MainModal from '@/components/core/modals/modal';
import { useParams } from 'next/navigation';
import AddDocResource from '@/components/staff/teachers/AddDocResource';
import { getAcademicYears } from '@/utils/funcs';
import pdf from '@/assets/pdf.svg';
import docx from '@/assets/docx.svg';
import { ClipLoader } from 'react-spinners';

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

interface FormDataParams {
  termId: string;
  courseId: string;
  classId: string;
}

const OneCourseDocs: React.FC = () => {
  const params = useParams();

  const { id, classId, termId } = params;
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [pastPapers, setPastPapers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [papersYears, setPapersYears] = useState<any[]>([]);
  const [papersTerms, setPapersTerms] = useState<any[]>([]);

  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType('');
  };
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
    const fetchData = async () => {
      try {
        const courseResponse = await AuthApi.get(`/courses/id/${id}`);
        setCourse(courseResponse.data.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch course data.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    setPageLoading(true);
    const fetchNotesAndPapers = async () => {
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
    };
    setPageLoading(false);
    fetchNotesAndPapers();
  }, [id, course, modalOpen]);

  const Loader = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="p-4">
      {loading && <Loader />}
      {error && <div>Error: {error}</div>}
      {!loading && course && (
        <>
          <div className="flex justify-between items-center mb-4">
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
            <button
              className="text-white bg-mainPurple px-4 py-2 rounded-md "
              onClick={() => openModal('notes')}
            >
              Add Notes
            </button>
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
                                  <p className="font-medium text-sm pl-4">
                                    {term.name.replace('_', ' ')}
                                  </p>
                                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 p-4">
                                    {pastPapers
                                      .filter((paper) => paper.term.id === term.id)
                                      .map((paper, i) => {
                                        return (
                                          <div
                                            key={i}
                                            className=" p-3 bg-gray-100 rounded-md flex items-center justify-center flex-col"
                                          >
                                            {paper.fileName.includes('docx') ? (
                                              <Image src={docx} alt="" className="w-20" />
                                            ) : (
                                              <Image src={pdf} alt="" className="w-20" />
                                            )}
                                            <div className="flex justify-between">
                                              <p className="text-xs my-3">
                                                {paper.fileName.length > 50
                                                  ? paper.fileName.slice(0, 30) + '...'
                                                  : paper.fileName}
                                              </p>
                                              <div className="flex gap-2"></div>
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
      <MainModal
        title={modalType === 'notes' ? 'Add Notes' : 'Add Past Papers'}
        isOpen={modalOpen}
        onClose={closeModal}
      >
        <AddDocResource
          close={closeModal}
          type={'notes'}
          params={{
            termId: termId as any,
            courseId: id as any,
            classId: classId as any,
          }}
        />
      </MainModal>
    </div>
  );
};

export default OneCourseDocs;
