'use client';

import { PaginationState } from '@/types/data-table.type';
import { Input, Pagination, Select } from '@mantine/core';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PaginationForm from './PaginateForm';
import TableSkeleton from './TableSkeleton';

interface Props {
  data: any;
  columns: ColumnDef<any>[];
  searchKey?: string;
  searchElement?: React.ReactNode;
  paginationProps?: PaginationState;
  actionElement?: React.ReactNode;
  minW?: string;
  tableClass?: string;
  renderCustomElement?: (table: Table<any>) => React.ReactNode;
  noDataMessage?: React.ReactNode;
  loading?: boolean;
  loader?: React.ReactNode;
  limit?: number;
}

export function DataTable({
  data,
  columns,
  searchKey,
  searchElement,
  paginationProps,
  actionElement,
  minW,
  tableClass,
  renderCustomElement,
  noDataMessage,
  loading,
  limit,
  loader,
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: paginationProps?.paginateOpts.page ?? 0,
    pageSize: paginationProps?.paginateOpts.limit ?? limit ?? 10,
  });

  const router = useRouter();
  const pathname = usePathname();

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const target = e.target as HTMLElement;

    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') return;
    if (target.closest('button')) return;
    if (target.closest('a')) return;

    const appealId = (e.currentTarget as HTMLElement).dataset.appealId;
    if (!appealId) return;

    if (!pathname?.includes('appeals')) return;

    let base = '/appeals';
    if (pathname?.includes('/staff')) base = '/staff/appeals';
    else if (pathname?.includes('/student')) base = '/student/appeals';

    router.push(`${base}/${encodeURIComponent(appealId)}`);
  };

  const newColumns: ColumnDef<any>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(v) => table.toggleAllPageRowsSelected(!!v.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="mx-auto"
          checked={row.getIsSelected()}
          onChange={(v) => row.toggleSelected(!!v.target.checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'numbering',
      header: '#',
      cell: ({ row }) => <div className="capitalize">{row.index + 1}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    ...columns,
  ];

  const table = useReactTable({
    data,
    columns: newColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    debugTable: false,
    onPaginationChange: setPagination,
    manualPagination: paginationProps?.isPaginated,
    enableGlobalFilter: true,
  });

  const isPaginated = paginationProps?.isPaginated ?? false;

  const onPaginate = (page: number) => {
    if (isPaginated) {
      paginationProps?.setPaginateOpts({
        ...paginationProps?.paginateOpts,
        page,
      });
      return;
    }
    table?.setPageIndex(page);
  };
  return (
    <div className="w-full text-sm">
      {renderCustomElement && renderCustomElement(table)}
      <div className="flex w-full justify-between gap-x-2">
        {searchElement ? (
          searchElement
        ) : searchKey ? (
          <div className="flex w-full items-center py-4">
            <Input
              type="text"
              placeholder={`Search ...`}
              value={table.getState().globalFilter ?? ''}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="lg:max-w-xs max-w-[16em] w-full rounded-md duration-300"
            />
          </div>
        ) : (
          <div></div>
        )}
        {actionElement && actionElement}
      </div>

      {loading ? (
        (loader ?? <TableSkeleton columns={columns} />)
      ) : (
        <>
          <div className={`w-full overflow-auto ${tableClass}`}>
            <table style={{ minWidth: minW ?? 700 }} className="w-full">
              <thead className="text-mainPurple">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr className="bg-[#E7F2EC]" key={headerGroup.id}>
                    {headerGroup.headers.map((header, i) => (
                      <td
                        className={clsx(
                          'p-2 font-semibold py-3 whitespace-nowrap',
                          i === 0 && 'rounded-l-xl pl-4',
                          i === headerGroup.headers.length - 1 && 'rounded-r-xl pr-4',
                        )}
                        key={`${header.id}-${i}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const enableRowNav = pathname?.includes('appeals');
                    // Extract appeal ID safely
                    const appealId =
                      row.original?.appealID ??
                      row.original?.appealId ??
                      row.original?.id ??
                      row.original?._id;

                    return (
                      <tr
                        key={row.id}
                        className={clsx(
                          'rounded-md overflow-hidden transition-colors hover:bg-[#4343431a]',
                          row.index % 2 !== 0 ? 'bg-[#4343430f]' : 'bg-[#43434308]',
                          'border-2 border-[#F5FAF7]',
                          enableRowNav && 'cursor-pointer',
                        )}
                        data-appeal-id={appealId} // <-- Critical for navigation
                        onClick={enableRowNav ? handleRowClick : undefined} // Only on appeals pages
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell, i) => (
                          <td
                            key={`${cell.id}-${i}`}
                            className={clsx(
                              'p-2 py-2',
                              row.getIsSelected() ? 'bg-mainPurple text-white font-semibold' : '',
                              i === 0 && 'rounded-l-xl pl-4',
                              i === row.getVisibleCells().length - 1 && 'rounded-r-xl pr-4',
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="h-24 text-center text-gray-700 text-lg"
                    >
                      {noDataMessage ?? 'No Data So far ...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          </div>

          <div className="flex w-full justify-center">
            <Pagination
              total={
                isPaginated
                  ? (paginationProps?.paginateOpts?.totalPages ?? 1)
                  : table.getPageCount()
              }
              onNextPage={() => {
                if (isPaginated) {
                  paginationProps?.setPaginateOpts({
                    ...paginationProps?.paginateOpts,
                    page: (paginationProps?.paginateOpts?.page ?? 0) + 1,
                  });
                  return;
                }
                table?.nextPage();
              }}
              value={
                isPaginated
                  ? (paginationProps?.paginateOpts?.page ?? 0) + 1
                  : table.getState().pagination.pageIndex + 1
              }
              onPreviousPage={() => {
                if (isPaginated) {
                  paginationProps?.setPaginateOpts({
                    ...paginationProps?.paginateOpts,
                    page: (paginationProps?.paginateOpts?.page ?? 0) - 1,
                  });
                  return;
                }
                table?.previousPage();
              }}
              onChange={(page) => {
                onPaginate(page - 1);
              }}
            />
          </div>

          <div className="flex sm:flex-row flex-col text-sm items-center mt-3 gap-2 justify-center">
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {isPaginated
                  ? (paginationProps?.paginateOpts.page ?? 0) + 1
                  : table.getState().pagination.pageIndex + 1}
                {' of '}
                {isPaginated ? paginationProps?.paginateOpts.totalPages : table.getPageCount()}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              | Go to page:
              <PaginationForm
                pageIndex={
                  isPaginated
                    ? (paginationProps?.paginateOpts.page ?? 0) + 1
                    : table.getState().pagination.pageIndex + 1
                }
                onPaginate={onPaginate}
              />
            </span>
            <div className="flex items-center gap-x-2">
              <span>Show</span>
              <Select
                size="xs"
                placeholder="Pick Page Size"
                data={[5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500].map(String)}
                value={
                  isPaginated
                    ? String(paginationProps?.paginateOpts?.limit ?? 0)
                    : table.getState().pagination.pageSize.toString()
                }
                onChange={(value) => {
                  const newValue = value?.replace('', '');
                  if (!newValue) return;
                  if (isPaginated) {
                    paginationProps?.setPaginateOpts({
                      ...paginationProps?.paginateOpts,
                      limit: Number(newValue),
                    });
                    return;
                  }
                  table?.setPageSize(Number(newValue));
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
