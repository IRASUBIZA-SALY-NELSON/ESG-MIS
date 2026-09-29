'use client';
import NewClass from '@/components/classes';
import AssignLesson from '@/components/classes/assignLesson';
import DeleteClass from '@/components/classes/deleteClass';
import EditClass from '@/components/classes/editClass';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import RefreshExportComponent from '@/components/core/data-table/RefreshExport';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { DeleteIcon, EditIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useDelete from '@/hooks/useDelete';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { ImShuffle } from 'react-icons/im';
import ViewAssignedLesson from '@/components/classes/viewAssignedLessons';
import ImportForm from '@/components/core/data-table/ImportForm';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import ShuffleClass from '@/components/classes/shuffleClass';
import drop from '@/assets/dropdown.svg';
import { IAcademicYear } from '@/types/other.type';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Button as NextUiButton,
} from '@nextui-org/react';
import Image from 'next/image';

const defaultAssign = {
  update: false,
  data: null as any,
  view: false,
};

const ClassesPage = () => {
  const [activeYear, setActiveYear] = useState<IAcademicYear | null>(null);
  const {
    data: years,
    loading: yearsLoading,
    error: yearsError,
    get: getYears,
  } = useGet<IAcademicYear[]>('/academic-years/all', {
    defaultData: [],
  });
  const {
    data: content,
    error,
    get,
    loading,
  } = useGet<any>(activeYear ? `/classes/all/year/${activeYear.id}` : undefined, {
    defaultData: [],
  });
  useEffect(() => {
    if (years) {
      const activeYear = years.find((year) => year.status === 'ACTIVE');
      activeYear ? setActiveYear(activeYear) : setActiveYear(null);
    }
  }, [years]);
  useEffect(() => {
    if (activeYear) {
      get();
    }
  }, [activeYear]);
  const [isShuffle, setIsShuffle] = useState({
    status: false,
    data: null as any,
  });
  const [isEdit, setIsEdit] = useState({
    status: false,
    data: null as any,
  });
  const [isView, setIsView] = useState({
    status: false,
    data: null as any,
  });
  const [isDelete, setIsDelete] = useState({
    status: false,
    data: null as any,
  });
  const [isAssign, setIsAssign] = useState(defaultAssign);
  const onEdit = (data: any) => {
    setIsEdit({
      status: true,
      data,
    });
  };

  const onDelete = (data: any) => {
    setIsDelete({
      status: true,
      data,
    });
  };
  const onAssign = (data: any) => {
    setIsAssign({
      update: true,
      data,
      view: false,
    });
  };
  const onView = (data: any) => {
    setIsAssign({
      update: false,
      data,
      view: true,
    });
  };
  const onShuffle = (data: any) => {
    setIsShuffle({
      status: true,
      data,
    });
  };

  const { deleteData, loading: deleteLoading } = useDelete(`/classes/delete`);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showShuffleModal, setShowShuffleModal] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState<boolean>(false);

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
  };

  const columns: ColumnDef<IClass>[] = [
    {
      accessorKey: 'className',
      header: 'Class Name',
      cell: ({ row }) => <div className="capitalize">{row.getValue('className')}</div>,
    },
    {
      accessorKey: 'classTeacher',
      header: 'Headteacher Name',
      cell: ({ row }) => (
        <div className="capitalize">
          {(row.original.classTeacher?.firstName ?? '-') +
            ' ' +
            (row.original.classTeacher?.lastName ?? '-')}
        </div>
      ),
    },
    {
      accessorKey: 'studentsNumber',
      header: 'Student No',
      cell: ({ row }) => <div className="capitalize">{row.getValue('studentsNumber')}</div>,
    },
    {
      accessorKey: 'assignLessons',
      header: 'Assign Lessons',
      cell: ({ row }) => (
        <ActionIcon variant="transparent" onClick={() => onAssign(row.original)}>
          <FiEdit3 className={'text-[#0357BD]'} size={20} />
        </ActionIcon>
      ),
    },
    {
      accessorKey: 'lessons',
      header: 'Lessons',
      cell: ({ row }) => (
        <ActionIcon variant="transparent" onClick={() => onView(row.original)}>
          <EyeIcon />
        </ActionIcon>
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <ActionIcon variant="transparent" onClick={() => onShuffle(row.original)}>
            <ImShuffle className={'text-[#0357BD]'} size={20} />
          </ActionIcon>
          <ActionIcon variant="transparent" onClick={() => onEdit(row.original)}>
            <EditIcon />
          </ActionIcon>

          <ActionIcon variant="transparent" onClick={() => onDelete(row.original)}>
            <DeleteIcon />
          </ActionIcon>
        </div>
      ),
    },
  ];
  return (
    <div className="flex flex-col w-full gap-y-3">
      <div className="flex py-3 items-center justify-between w-full">
        <h1 className=" font-semibold">Classes</h1>
        <div className="flex items-center justify-center gap-2">
          {activeYear == years?.find((year) => year.status === 'ACTIVE') && (
            <Button onClick={openModal} className="rounded-lg bg-primary text-white">
              Create new class
            </Button>
          )}
          {years && (
            <Dropdown className="bg-[#DCEBE3]">
              <DropdownTrigger>
                <NextUiButton className="border-[1px] border-primary rounded-lg p-3  text-[80%]">
                  Filter by{' '}
                  <span className="ml-2 text-primary font-bold">
                    {activeYear?.name || 'Select Year'}
                  </span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </NextUiButton>
              </DropdownTrigger>
              <DropdownMenu>
                {years.map((year, i) => (
                  <DropdownItem
                    key={i}
                    value={year.name}
                    className="hover:bg-[#0A6B4F89]"
                    onClick={() => setActiveYear(year)}
                  >
                    {year.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
      <MainModal
        title="New Class"
        onClose={closeModal}
        size={'lg'}
        isOpen={modalIsOpen}
        closeOnClickOutside={false}
      >
        <NewClass refetch={get} onClose={closeModal} />
      </MainModal>
      <MainModal
        title="Edit Class"
        onClose={() => {
          closeEditModal();
          setIsEdit({
            status: false,
            data: null,
          });
        }}
        size={'lg'}
        isOpen={editModalIsOpen || isEdit.status}
        closeOnClickOutside={false}
      >
        <EditClass
          data={isEdit.data}
          refetch={get}
          onClose={() => {
            closeEditModal();
            setIsEdit({
              status: false,
              data: null,
            });
          }}
        />
      </MainModal>
      <MainModal
        onClose={() => setIsDelete({ status: false, data: null })}
        size={'lg'}
        isOpen={isDelete.status}
      >
        <DeleteClass
          gradeName={isDelete.data && isDelete.data.className}
          onCancel={() => setIsDelete({ status: false, data: null })}
          onDelete={() => {
            deleteData(isDelete.data.id);
            setIsDelete({ status: false, data: null });
            get();
          }}
        />
      </MainModal>
      <MainModal
        className="pl-11"
        title="Assign Lessons"
        onClose={() => setIsAssign(defaultAssign)}
        size={'lg'}
        isOpen={isAssign.update || isAssign.view}
      >
        <AssignLesson
          data={isAssign.data}
          onClose={() => {
            get();
            setIsAssign(defaultAssign);
          }}
          disabled={isAssign.view}
        />
      </MainModal>
      <MainModal
        className="pl-11"
        title="View Assigned Lessons"
        onClose={() =>
          setIsView({
            status: false,
            data: null,
          })
        }
        size={'lg'}
        isOpen={isView.status}
      >
        <ViewAssignedLesson
          data={isView.data}
          onClose={() =>
            setIsView({
              status: false,
              data: null,
            })
          }
        />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showExport}
        title="Export Class Data"
        onClose={() => setShowExport(false)}
        closeOnClickOutside={false}
      >
        <ExportForm data={content!} onClose={() => setShowExport(false)} />
      </MainModal>
      <MainModal
        size={'lg'}
        isOpen={showShuffleModal || isShuffle.status}
        title="Reshuffle Class"
        onClose={() => setIsShuffle({ status: false, data: null })}
        closeOnClickOutside={false}
      >
        <ShuffleClass data={isShuffle.data} onClose={() => setShowShuffleModal(false)} />
      </MainModal>
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Classes"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal="classes"
          formatUrl="https://docs.google.com/spreadsheets/d/1giMyGIzPK-TSBkFC7K8tRw-LK8OZYIx7JuKlh5-ySmk/edit?usp=sharing"
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <ExcelImportPreviewer data={data} />}
        />
      </MainModal>
      {!loading && content && (
        <DataTable
          searchKey="className"
          columns={columns}
          data={content}
          actionElement={
            <RefreshExportComponent
              onImport={() => setShowImport(true)}
              onExport={() => setShowExport(true)}
              onRefresh={get}
              loading={loading}
            />
          }
        />
      )}
      {loading && <TableSkeleton columns={columns} />}
      {error && (
        <div className="flex flex-col irtems-center w-full">
          <span className="flex items-center justify-center text-red-700 text-sm">{error}</span>
          <Button onClick={get} mt={3} className="flex w-fit items-center gap-x-2" px={3}>
            <AiOutlineReload size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
export default ClassesPage;
