import React, { useEffect, useState } from 'react';
import { Skeleton } from '@mantine/core';
import NoDataGif from '@/assets/noData.gif';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import Image from 'next/image';
import drop from '@/assets/dropdown.svg';

interface Column<T> {
  name: string;
  getter: (data: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  title: string;
  filter?: any;
  selectedFilter?: any;
  onFilterchange?: (id: string) => void;
}

const DashboardTable = <T,>({
  columns,
  data,
  loading,
  title,
  filter,
  selectedFilter,
  onFilterchange,
}: Props<T>) => {
  const [lastFiveMarks, setLastFiveMarks] = useState<T[]>([]);
  const [termsFilter, setTermsFilter] = useState(selectedFilter);

  useEffect(() => {
    // setTermsFilter(selectedFilter?.name);
    setLastFiveMarks(Array.isArray(data) ? data.slice(0, 5) : []);
  }, [data]);

  const renderCell = (column: Column<T>, mark: T) => {
    try {
      const value = column.getter(mark);
      return value ?? '-';
    } catch {
      return '-';
    }
  };

  return (
    <div className="flex-grow">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        {filter && onFilterchange && (
          <div className="">
            <Dropdown className="bg-[#DCEBE3]">
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="border-[1px] border-primary rounded-lg py-3 px-4 text-[80%]"
                >
                  Filter by <span className="ml-2 text-primary font-bold">{termsFilter}</span>
                  <Image src={drop} alt="" className="w-3 h-3 ml-2" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="rounded-lg">
                {filter?.map((term: any, i: number) => {
                  return (
                    <DropdownItem
                      key={i}
                      value={term?.name}
                      className=" hover:bg-[#0A6B4F89]"
                      onClick={() => {
                        setTermsFilter(term.name.replace('_', ' '));
                        onFilterchange(term?.id);
                      }}
                    >
                      {term?.name}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex flex-col gap-1 my-4">
          <Skeleton height={40} /> <Skeleton height={40} /> <Skeleton height={40} />{' '}
          <Skeleton height={40} /> <Skeleton height={40} /> <Skeleton height={40} />{' '}
        </div>
      ) : (
        <div>
          {lastFiveMarks.length === 0 ? (
            <div className="flex flex-col  items-center justify-center ">
              <Image src={NoDataGif} alt="" width={200} height={200} className="w-[200px] h-auto" />
              <p className="text-sm text-gray-500">
                Currently, there is no performance data to display for this term.
              </p>
            </div>
          ) : (
            <>
              <table className="w-full my-3">
                <thead className="text-mainPurple">
                  <tr className="bg-[#E7F2EC]">
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={`p-2 font-semibold py-3 ${index === 0 ? 'rounded-l-xl' : ''}`}
                      >
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lastFiveMarks.map((mark, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`rounded-md overflow-hidden text-center ${
                        rowIndex % 2 !== 0 ? 'bg-[#4343430f]' : 'bg-[#43434308]'
                      }  border-2 border-[#F5FAF7]`}
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`p-2 py-3 ${colIndex === 0 ? 'rounded-l-xl' : ''}`}
                        >
                          {renderCell(column, mark)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardTable;
