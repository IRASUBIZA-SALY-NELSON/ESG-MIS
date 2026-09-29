'use client';
import React, { useState, useEffect } from 'react';
import { AuthApi } from '@/utils/constants';
import { ICourse } from '@/types/course.type';
import backBtn from '@/assets/back.svg';
import Image from 'next/image';
import MainModal from '@/components/core/modals/modal';
import { useParams } from 'next/navigation';
import AddDocResource from '@/components/staff/teachers/AddDocResource';
import UpdateDocResource from '@/components/staff/teachers/UpdateDocResource';
import { getAcademicYears } from '@/utils/funcs';
import pdf from '@/assets/pdf.svg';
import docx from '@/assets/docx.svg';
import { ClipLoader } from 'react-spinners';
import viewFile from '@/assets/viewFile.svg';
import deleteFile from '@/assets/deleteFile.svg';
import downloadFile from '@/assets/downloadFile.svg';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { EditIcon } from '@/components/core/icons/icons1';

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
  const [pastPapers, setPastPapers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [deleteFileModal, setDeleteFileModal] = useState<{
    modal: boolean;
    file: any;
  }>({ modal: false, file: null });
  const [updateFileModal, setUpdateFileModal] = useState<{
    modal: boolean;
    file: any;
  }>({ modal: false, file: null });
  const [papersYears, setPapersYears] = useState<any[]>([]);
  const [papersTerms, setPapersTerms] = useState<any[]>([]);
  const [deleteFileModalLoading, setDeleteFileModalLoading] = useState(false);

  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType('');
  };
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

  const handleDeleteFile = () => {
    setDeleteFileModalLoading(true);
    AuthApi.delete(`/past-papers/delete/${deleteFileModal.file.id}`)
      .then((res) => {
        notifications.show({
          title: 'Deleted File',
          message: 'Successfully deleted file',
          color: 'blue',
        });
        // Refresh the papers list
        const fetchNotesAndPapers = async () => {
          try {
            const papersResponse = await AuthApi.get(`/past-papers/course/${id}`);
            setPastPapers(papersResponse.data.data);
            setPapersYears(getAllAcademicYears(papersResponse.data.data));
            setPapersTerms(getAllTerms(papersResponse.data.data));
          } catch (error) {
            setError('Failed to fetch notes and papers.');
          }
        };
        fetchNotesAndPapers();
      })
      .catch((err) => {
        notifications.show({
          title: 'Did not delete File',
          message: 'File was not deleted',
          color: 'red',
        });
      })
      .finally(() => {
        setDeleteFileModalLoading(false);
      });
    setDeleteFileModal({ modal: false, file: null });
  };

  const handleUpdateSuccess = () => {
    const fetchNotesAndPapers = async () => {
      setPageLoading(true);
      try {
        const papersResponse = await AuthApi.get(`/past-papers/course/${id}`);
        setPastPapers(papersResponse.data.data);
        setPapersYears(getAllAcademicYears(papersResponse.data.data));
        setPapersTerms(getAllTerms(papersResponse.data.data));
      } catch (error) {
        setError('Failed to fetch notes and papers.');
      }
      setPageLoading(false);
    };
    fetchNotesAndPapers();
  };

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
  }, [id, course, modalOpen, deleteFileModal.modal, updateFileModal.modal]);

  const Loader = () => (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader color="blue" size={20} />
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
              onClick={() => openModal('past-papers')}
            >
              Add Past Papers
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
                                                {paper.fileName.length > 25
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
                                                <Link
                                                  href={`/staff/docs/past-papers/view/${paper.id}`}
                                                >
                                                  <Image
                                                    src={viewFile}
                                                    alt="View file"
                                                    className="w-5 bg-gray-200 cursor-pointer"
                                                    title="View file"
                                                  />
                                                </Link>
                                                <a
                                                  href={paper.downloadLink}
                                                  download={paper.fileName}
                                                  className="cursor-pointer"
                                                  title="Download file"
                                                >
                                                  <Image
                                                    src={downloadFile}
                                                    alt="Download file"
                                                    className="w-5 bg-gray-200"
                                                  />
                                                </a>
                                                <button
                                                  onClick={() =>
                                                    setUpdateFileModal({
                                                      modal: true,
                                                      file: paper,
                                                    })
                                                  }
                                                  title="Update/Replace file"
                                                  className="cursor-pointer"
                                                >
                                                  <EditIcon />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    setDeleteFileModal({
                                                      modal: true,
                                                      file: paper,
                                                    })
                                                  }
                                                  title="Delete file"
                                                  className="cursor-pointer"
                                                >
                                                  <Image
                                                    src={deleteFile}
                                                    alt="Delete file"
                                                    className="w-5 bg-gray-200"
                                                  />
                                                </button>
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
      <MainModal
        title={modalType === 'notes' ? 'Add Notes' : 'Add Past Papers'}
        isOpen={modalOpen}
        onClose={closeModal}
      >
        <AddDocResource
          close={closeModal}
          type={'past-papers'}
          params={{
            termId: termId as any,
            courseId: id as any,
            classId: classId as any,
          }}
        />
      </MainModal>
      <MainModal
        title={'Delete File'}
        isOpen={deleteFileModal.modal}
        onClose={() => setDeleteFileModal({ modal: false, file: null })}
      >
        <div className="flex flex-col items-center">
          <p>Are you sure you want to delete file named</p>
          <p className="text-xs">
            {deleteFileModal.file?.fileName.length > 50
              ? deleteFileModal.file?.fileName.slice(0, 30) + '...'
              : deleteFileModal.file?.fileName}
          </p>
          <div className="grid grid-cols-2 gap-5 mt-4">
            <button
              onClick={() => setDeleteFileModal({ modal: false, file: null })}
              className="px-4 py-2 text-sm bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFile}
              disabled={deleteFileModalLoading}
              className="px-4 py-2 text-sm bg-mainPurple text-white rounded-md"
            >
              {deleteFileModalLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </MainModal>
      <MainModal
        title={'Update/Replace File'}
        isOpen={updateFileModal.modal}
        onClose={() => setUpdateFileModal({ modal: false, file: null })}
      >
        <UpdateDocResource
          close={() => setUpdateFileModal({ modal: false, file: null })}
          paperId={updateFileModal.file?.id}
          currentFileName={updateFileModal.file?.fileName || ''}
          onSuccess={handleUpdateSuccess}
        />
      </MainModal>
    </div>
  );
};

export default OneCourseDocs;
