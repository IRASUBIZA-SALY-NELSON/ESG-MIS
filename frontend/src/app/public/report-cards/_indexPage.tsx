'use client';
import ViewReportCard from '@/components/academics/ViewReportCard';
import MainModal from '@/components/core/modals/modal';
import AsyncSelect from '@/components/core/selects/AsyncSelect';
import { Student } from '@/types/student.types';
import { AuthApi, baseUrl } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Avatar, Button, Image, Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';

const PublicReportsPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [openReport, setOpenReport] = useState({
    status: false,
    student: null as Student | null,
    academicYearId: '',
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(searchParams.get('token'));
  const [tokenInput, setTokenInput] = useState<string | null>(token ?? null);
  const [acaYearId, setAcadYearId] = useState<string | null>(null);
  const [openError, setOpenError] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/parents/destructure-token/${tokenInput ?? token}`,
      );

      setStudents(res.data.data);
      setToken(tokenInput);
      setError('');
    } catch (error) {
      notifications.show({
        title: 'Failed to get student',
        message: getResError(error),
        color: 'red',
      });
      setError(getResError(error));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      submit(null as any);
    }
  }, []);

  useEffect(() => {
    if (acaYearId) setOpenError('');
  }, [acaYearId]);

  return (
    <div className=" w-full max-w-[800px] flex-col">
      {!token || error ? (
        <div className="flex w-full mt-4 flex-col">
          {error && (
            <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
          )}
          <h1 className=" font-semibold text-center">Search for your student (Enter token)</h1>
          <form
            onSubmit={submit}
            className="flex mx-auto duration-300 mt-2 focus-within:ring-mainPurple focus-within:ring-2 rounded-md w-full max-w-2xl overflow-hidden"
          >
            <input
              type="text"
              className=" h-full p-3 focus-within:ring-mainPurple w-full"
              placeholder="Insert the token to search for student/s"
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <button className="bg-mainPurple text-white px-3 py-2">Submit</button>
          </form>
        </div>
      ) : students.length > 0 ? (
        <div className=" w-full flex gap-y-4 flex-col mt-4 ">
          <h1 className=" font-semibold text-center">Report Cards for The Related Students</h1>
          <div className="flex justify-center items-center gap-x-2">
            <span>Academic Year</span>
            <AsyncSelect
              datasrc={`/academic-years/all`}
              variant="default"
              onChange={(e) => setAcadYearId(e)}
              value={acaYearId ?? ''}
              placeholder="Select academic year"
              useAuth={false}
            />
          </div>
          {openError && (
            <div className="flex items-center justify-center text-red-700 text-sm">{openError}</div>
          )}
          <div className="flex flex-col gap-2">
            {students.map((stud) => (
              <div
                key={stud.id}
                className="flex flex-row border p-2 rounded-md justify-between items-center"
              >
                <div className="flex items-center">
                  <Avatar
                    src={`https://ui-avatars.com/api/?name=${stud?.firstName}+${stud.lastName}&background=random&color=fff`}
                    radius="lg"
                    alt='Student "John Doe"'
                  />
                  <div className="flex flex-col ml-2">
                    <h2 className="font-semibold">
                      {stud.firstName} {stud.lastName}
                    </h2>
                    <span className="text-sm">{stud.email}</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!acaYearId) {
                      setOpenError('Please select academic year');
                      notifications.show({
                        title: 'Failed to get report card',
                        message: 'Please select academic year',
                        color: 'red',
                      });
                      return;
                    }
                    setOpenReport({
                      status: true,
                      student: stud,
                      academicYearId: acaYearId,
                    });
                  }}
                >
                  View Report
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <h1 className=" font-semibold text-center mt-4">{!loading && 'No Student Found'}</h1>
      )}
      {/* <ClipLoader color="#4a4a4a" loading={loading} className=" mx-auto" size={150} /> */}
      {loading && (
        <div className="flex mt-6 flex-col gap-3">
          {new Array(5).fill(0).map((key, i) => (
            <Skeleton key={i} height={79} />
          ))}
        </div>
      )}
      {acaYearId && (
        <MainModal
          isOpen={openReport.status}
          title={`Report Card for ${openReport.student?.firstName} ${openReport.student?.lastName}`}
          onClose={() => {
            setOpenReport({
              status: false,
              student: null,
              academicYearId: '',
            });
          }}
          size="1000"
          closeOnClickOutside={false}
        >
          <ViewReportCard
            student={openReport.student}
            useAuth={false}
            defaultAcademicYearId={openReport.academicYearId}
            reportCardToken={tokenInput ?? token ?? ''}
            documentUrl="/academicMarks/report-card-document/by-parent"
          />
        </MainModal>
      )}
    </div>
  );
};

export default PublicReportsPage;
