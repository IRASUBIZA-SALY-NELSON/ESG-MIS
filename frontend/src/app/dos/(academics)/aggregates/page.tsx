'use client';
import ExportForm from '@/components/core/data-table/ExportForm';
import MainModal from '@/components/core/modals/modal';
import StudentProfile from '@/components/students/StudentProfile';
import useGet from '@/hooks/useGet';
import { Student } from '@/types/student.types';
import { Button } from '@mantine/core';
import React, { useState } from 'react';
import { BiExport } from 'react-icons/bi';
import 'react-loading-skeleton/dist/skeleton.css';
import closeStudentModal from '@/assets/close.svg';
import AcademicTermClassSort from '@/components/core/filters/AcademicTermClassSort';

const AdminParentStudent = () => {
  const { data: students } = useGet<Student[]>('/students/all/paginated', {
    defaultData: [],
    paginated: true,
  });
  const [currentStudent, setCurrentStudent] = useState<any | null>();
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [showExport, setShowExport] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  function closeUserModal() {
    setUserModalOpen(false);
  }

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm mb-12">
      <div className="flex flex-row justify-between my-5">
        <h2 className="text-xl font-medium  text-[rgba(0,0,0,0.7)] my-2">Performance</h2>
      </div>

      <div className="flex flex-col pb-3 gap-y-1 w-full ">
        <AcademicTermClassSort setData={setFilteredStudents} data={students!} />
        <div className="flex items-center mt-8 justify-end gap-3 w-full ">
          <div className="w-full flex justify-center items-center mt-auto gap-x-3">
            <Button className=" bg-mainPurple" onClick={() => setShowExport(true)} variant="filled">
              <BiExport size={20} className="" />
              <span className=" sm:hidden ml-2 lg:inline">Export Performance</span>
            </Button>
          </div>
        </div>
      </div>
      {/* modals */}
      <MainModal
        isOpen={userModalOpen}
        onClose={closeUserModal}
        title="Student Details"
        size={'lg'}
      >
        <StudentProfile
          closeUserModal={closeUserModal}
          currentStudent={currentStudent}
          closeStudentModal={closeStudentModal}
        />
      </MainModal>
      <MainModal title="Export data" isOpen={showExport} onClose={() => setShowExport(false)}>
        <ExportForm data={students!} onClose={() => setShowExport(false)} />
      </MainModal>
    </div>
  );
};

export default AdminParentStudent;
