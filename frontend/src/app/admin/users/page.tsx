'use client';
import { DataTable } from '@/components/core/data-table';
import ExportForm from '@/components/core/data-table/ExportForm';
import SortButton from '@/components/core/data-table/sort-button';
import { DarkEye, DeleteIcon, EditIcon } from '@/components/core/icons/icons1';
import MainModal from '@/components/core/modals/modal';
import useGet from '@/hooks/useGet';
import { AuthApi } from '@/utils/constants';
import { exportToExcel } from '@/utils/funcs';
import { ActionIcon, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BiExport } from 'react-icons/bi';
import { CiSearch } from 'react-icons/ci';
import 'react-loading-skeleton/dist/skeleton.css';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showExport, setShowExport] = useState(false);

  // Fetch users using the hook.
  // Assumes the backend returns { content: [...], totalItems: ..., ... } inside the ApiResponse data
  // paginated: true in useGet usually expects `content`.
  const {
    data: users,
    getPaginated,
    loading,
    paginateOpts,
    setPaginateOpts,
    error,
  } = useGet<any[]>('/users/all', {
    defaultData: [],
    paginated: true,
    pagination: {
      limit: 10,
    },
    query: {
      // we can pass q or query params here, but getPaginated handles page/limit
    },
  });

  const {
    getPaginated: searchUsers,
    data: searchResults,
    loading: searchLoading,
  } = useGet<any[]>('/users/search', {
    defaultData: [],
    paginated: true,
    query: {
      query: searchQuery,
    },
  });

  useEffect(() => {
    if (searchQuery) {
      searchUsers();
    } else {
      getPaginated();
    }
  }, [paginateOpts.page, paginateOpts.limit, searchQuery]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  const handleUpdate = async () => {
    if (!userToEdit) return;

    // Password validation
    if (userToEdit.newPassword && userToEdit.newPassword !== userToEdit.confirmPassword) {
      notifications.show({ title: 'Error', message: 'Passwords do not match', color: 'red' });
      return;
    }

    try {
      const payload: any = {
        email: userToEdit.user.email,
        username: userToEdit.user.username,
        accountStatus: userToEdit.user.accountStatus,
      };

      if (userToEdit.newPassword) {
        payload.password = userToEdit.newPassword;
      }

      await AuthApi.put(`/users/update/${userToEdit.user.id}`, payload);
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });
      setEditModalOpen(false);
      if (searchQuery) searchUsers();
      else getPaginated();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update user',
        color: 'red',
      });
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await AuthApi.delete(`/users/delete/${userToDelete.user.id}`);
      notifications.show({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
      });
      setDeleteModalOpen(false);
      if (searchQuery) searchUsers();
      else getPaginated();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to delete user',
        color: 'red',
      });
    }
  };

  const handleExportAll = async () => {
    try {
      const res = await AuthApi.get('/users/all?page=0&limit=10000');
      const allData = res.data.data.content;
      const formatted = allData.map((row: any) => ({
        'First Name': row.person?.firstName || '-',
        'Last Name': row.person?.lastName || '-',
        Email: row.user?.email || '-',
        Role: row.roles && row.roles.length > 0 ? row.roles[0].roleName : '-',
        Gender: row.person?.gender || '-',
        Phone: row.person?.phoneNumber || '-',
        Status: row.user?.accountStatus || '-',
      }));
      exportToExcel(
        'All Users',
        formatted,
        '.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      );
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: 'Failed to export users', color: 'red' });
    }
  };

  const displayData = searchQuery ? searchResults : users;
  const isLoading = searchQuery ? searchLoading : loading;

  const columns: ColumnDef<any>[] = [
    {
      header: ({ column }) => <SortButton column={column} name="First Name" />,
      accessorFn: (row) => row.person?.firstName || '-',
      id: 'firstName',
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: ({ column }) => <SortButton column={column} name="Last Name" />,
      accessorFn: (row) => row.person?.lastName || '-',
      id: 'lastName',
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: 'Email',
      accessorFn: (row) => row.user?.email || '-',
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: 'Role',
      accessorFn: (row) => (row.roles && row.roles.length > 0 ? row.roles[0].roleName : '-'),
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: 'Gender',
      accessorFn: (row) => row.person?.gender || '-',
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: 'Phone',
      accessorFn: (row) => row.person?.phoneNumber || '-',
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: 'Status',
      accessorFn: (row) => row.user?.accountStatus || '-',
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-x-2">
          <ActionIcon
            variant="transparent"
            onClick={() => {
              setUserToView(row.original);
              setViewModalOpen(true);
            }}
          >
            <DarkEye />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            onClick={() => {
              setUserToEdit(row.original);
              setEditModalOpen(true);
            }}
          >
            <EditIcon />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            onClick={() => {
              setUserToDelete(row.original);
              setDeleteModalOpen(true);
            }}
          >
            <DeleteIcon />
          </ActionIcon>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex flex-row justify-between my-5">
        <h2 className="text-[17px] font-medium text-[rgba(0,0,0,0.7)] my-2">Users Management</h2>
        <div className="flex items-center gap-2">
          <Button disabled={!displayData} onClick={() => setShowExport(true)}>
            <BiExport size={20} />
            <span className="ml-2">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-10 mb-5">
        <div className="relative w-[20rem]">
          <span className="absolute top-4 left-4">
            <CiSearch size={25} color="" />
          </span>
          <input
            name="search"
            className="w-full p-3 py-4 pl-12 text-base text-black placeholder:text-black rounded-full bg-[#005DE908] border-none outline-none"
            placeholder="Search by Email or Username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={displayData ?? []}
        loading={isLoading}
        noDataMessage="No users found"
        paginationProps={{
          isPaginated: true,
          setPaginateOpts,
          paginateOpts,
        }}
        limit={10}
      />

      <MainModal title="Export Users" isOpen={showExport} onClose={() => setShowExport(false)}>
        <ExportForm
          data={(displayData ?? []).map((row: any) => ({
            'First Name': row.person?.firstName || '-',
            'Last Name': row.person?.lastName || '-',
            Email: row.user?.email || '-',
            Role: row.roles && row.roles.length > 0 ? row.roles[0].roleName : '-',
            Gender: row.person?.gender || '-',
            Phone: row.person?.phoneNumber || '-',
            Status: row.user?.accountStatus || '-',
          }))}
          exportAllToExcel={handleExportAll}
          onClose={() => setShowExport(false)}
        />
      </MainModal>

      <MainModal
        title="Confirm Delete"
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="p-4 flex flex-col items-center">
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
          <div className="flex gap-4 mt-4">
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </MainModal>

      <MainModal
        title="User Details"
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        size="lg"
      >
        <div className="p-6 grid grid-cols-2 gap-4">
          {userToView && (
            <>
              <div>
                <h3 className="font-semibold">First Name</h3>
                <p>{userToView.person?.firstName || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Last Name</h3>
                <p>{userToView.person?.lastName || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>{userToView.user?.email || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Role</h3>
                <p>
                  {userToView.roles && userToView.roles.length > 0
                    ? userToView.roles[0].roleName
                    : '-'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>{userToView.person?.phoneNumber || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Gender</h3>
                <p>{userToView.person?.gender || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <p>{userToView.user?.accountStatus || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Username</h3>
                <p>{userToView.user?.username || '-'}</p>
              </div>
            </>
          )}
        </div>
      </MainModal>

      <MainModal title="Edit User" isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="p-4 flex flex-col gap-4">
          {userToEdit && (
            <>
              <div className="border-b pb-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-700">General Information</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  value={userToEdit.user?.email || ''} // Handle potential null/undefined
                  onChange={(e) =>
                    setUserToEdit({
                      ...userToEdit,
                      user: { ...userToEdit.user, email: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  value={userToEdit.user?.username || ''}
                  onChange={(e) =>
                    setUserToEdit({
                      ...userToEdit,
                      user: { ...userToEdit.user, username: e.target.value },
                    })
                  }
                />
              </div>

              <div className="border-b pb-2 mb-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-700">Password Management</h3>
                <p className="text-xs text-red-500 mb-2">
                  Warning: Changing this will overwrite the user's current password.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  placeholder="Leave blank to keep current password"
                  value={userToEdit.newPassword || ''}
                  onChange={(e) => setUserToEdit({ ...userToEdit, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  placeholder="Confirm new password"
                  value={userToEdit.confirmPassword || ''}
                  onChange={(e) =>
                    setUserToEdit({ ...userToEdit, confirmPassword: e.target.value })
                  }
                />
              </div>

              <div className="border-b pb-2 mb-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-700">Account Status</h3>
                <p className="text-xs text-red-500 mb-2">
                  Warning: Deactivating a user will prevent them from logging in.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                  value={userToEdit.user?.accountStatus || 'ACTIVE'}
                  onChange={(e) =>
                    setUserToEdit({
                      ...userToEdit,
                      user: { ...userToEdit.user, accountStatus: e.target.value },
                    })
                  }
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DEACTIVATED">DEACTIVATED</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={handleUpdate}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </MainModal>
    </div>
  );
};

export default AdminUsers;
