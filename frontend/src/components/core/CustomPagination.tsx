import { Table } from '@tanstack/react-table';
import React from 'react';

const CustomPagination = ({ table }: { table: Table<any> }) => {
  return (
    <div className="flex text-sm items-center gap-2 justify-center">
      <button
        className=" px-3 py-1 rounded-md bg-primary disabled:bg-primary-300 text-white"
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        {'<<'}
      </button>
      <button
        className=" px-3 py-1 rounded-md bg-primary disabled:bg-primary-300 text-white"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        {'<'}
      </button>
      <button
        className=" px-3 py-1 rounded-md bg-primary disabled:bg-primary-300 text-white"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        {'>'}
      </button>
      <button
        className=" px-3 py-1 rounded-md bg-primary disabled:bg-primary-300 text-white"
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        {'>>'}
      </button>
    </div>
  );
};

export default CustomPagination;
