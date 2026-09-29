'use client';
import NewClass from '@/components/classes';
import AssignLesson from '@/components/classes/assignLesson';
import DeleteClass from '@/components/classes/deleteClass';
import EditClass from '@/components/classes/editClass';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import TableSkeleton from '@/components/core/data-table/TableSkeleton';
import { DeleteIcon, EditIcon, EyeIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useDelete from '@/hooks/useDelete';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { ActionIcon, Button } from '@mantine/core';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import ViewAssignedLesson from '@/components/classes/viewAssignedLessons';
import ImportForm from '@/components/core/data-table/ImportForm';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import CreateRole from '@/components/roles/CreateRole';

const defaultAssign = {
  update: false,
  data: null as any,
  view: false,
};

const ClassesPage = () => {
  const { data: content, error, get, loading } = useGet<any>('/classes/all', { defaultData: [] });
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

  const { deleteData, loading: deleteLoading } = useDelete(`/classes/delete`);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

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
      accessorKey: 'roleName',
      header: 'Role Name',
      cell: ({ row }) => <div className="capitalize">{row.getValue('roleName')}</div>,
    },
    {
      accessorKey: 'classTeacher',
      header: 'Headteacher Name',
      cell: ({ row }) => <div className="capitalize ">{row.getValue('classTeacher') ?? '-'}</div>,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 ">
          <ActionIcon variant="transparent" onClick={() => onView(row.original)}>
            <EyeIcon />
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
        <h1 className=" font-semibold text-xl text-gray-500">Roles</h1>
        <Button onClick={openModal} className="rounded-lg bg-primary text-white">
          Create new Role
        </Button>
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
        className="pl-52"
        title={'Create New Role'}
        onClose={closeModal}
        size={'lg'}
        isOpen={modalIsOpen}
        closeOnClickOutside={false}
      >
        <CreateRole onClose={closeModal} refetch={get} />
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
        className="pl-52"
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
        className="pl-52"
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
        size={'xl'}
        isOpen={showImport}
        title="Import Classes"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal="classes"
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <ExcelImportPreviewer data={data} />}
        />
      </MainModal>
      {!loading && content && <DataTable searchKey="role" columns={columns} data={content} />}
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
