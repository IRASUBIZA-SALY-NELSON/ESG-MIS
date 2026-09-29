import { Button, Tabs } from '@mantine/core';
import { FC, useState } from 'react';
import { BiTable } from 'react-icons/bi';
import {
  BsCalendar2,
  BsCalendar2RangeFill,
  BsFileExcel,
  BsFilePdf,
  BsReverseListColumnsReverse,
} from 'react-icons/bs';
import { DatePicker } from '@mantine/dates';
import { exportToExcel } from '@/utils/funcs';

interface Props {
  data: any[];
  exportPdf?: () => void;
  exportExcel?: (data: any) => void;
  exportAllToExcel?: () => void;
  title?: string;
  onClose: () => void;
  isFiltered?: boolean;
  appliedFilter?: (data: any, courseId?: string) => any;
  tableName?: string;
}

const ExportForm: FC<Props> = ({
  appliedFilter,
  title,
  onClose,
  data,
  exportAllToExcel,
  isFiltered,
  tableName,
}) => {
  const filteredData = isFiltered ? appliedFilter : data;
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  return (
    <div className=" w-full flex gap-y-3 flex-col">
      <p className=" text-center font-semibold text-sm">Select What To Export</p>
      <Tabs defaultValue="table">
        <Tabs.List>
          <Tabs.Tab className=" w-1/4" value="table" leftSection={<BiTable />}>
            Current Table
          </Tabs.Tab>
          <Tabs.Tab className=" w-1/4" value="all" leftSection={<BsReverseListColumnsReverse />}>
            All Data
          </Tabs.Tab>
          <Tabs.Tab className=" w-1/4" value="date" leftSection={<BsCalendar2 />}>
            Select Date
          </Tabs.Tab>
          <Tabs.Tab className=" w-1/4" value="range" leftSection={<BsCalendar2RangeFill />}>
            Select Range
          </Tabs.Tab>
        </Tabs.List>
        {/* all data */}
        <Tabs.Panel value="all">
          <div className="flex mt-3 w-full flex-col gap-y-3 items-center">
            <span className=" text-sm text-gray-800">
              Export all {title ?? 'data'} available in the database
            </span>
            <div className="flex items-center gap-x-3">
              <Button
                className="flex items-center"
                color="green"
                onClick={() => {
                  exportAllToExcel?.();
                  onClose();
                }}
              >
                <BsFileExcel className="mr-2" />
                Export Excel
              </Button>
              {/* <Button className="flex items-center" color="red">
                <BsFilePdf className="mr-2" />
                Export PDF
              </Button> */}
            </div>
          </div>
        </Tabs.Panel>
        {/* selected table data */}
        <Tabs.Panel value="table">
          <div className="flex w-full mt-3 flex-col gap-y-3 items-center">
            <span className=" text-sm text-gray-800">
              Export the current table data selected by the filters
            </span>
            <div className="flex items-center gap-x-3">
              <Button
                className="flex items-center"
                color="green"
                onClick={() => {
                  exportToExcel(
                    tableName ?? 'Tables',
                    filteredData,
                    '.xlsx',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                  );
                }}
              >
                <BsFileExcel className="mr-2" />
                Export Excel
              </Button>
              {/* <Button className="flex items-center" color="red">
                <BsFilePdf className="mr-2" />
                Export PDF
              </Button> */}
            </div>
          </div>
        </Tabs.Panel>
        {/* select date */}
        <Tabs.Panel value="date">
          <div className="flex w-full mt-3 flex-col gap-y-3 items-center">
            <span className=" text-sm text-gray-800">Export data from a specific date</span>
            <DatePicker value={date} onChange={setDate} />
            <div className="flex items-center gap-x-3">
              <Button
                className="flex items-center"
                color="green"
                onClick={() => {
                  exportToExcel(
                    'Tables',
                    data,
                    '.xlsx',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                  );
                }}
              >
                <BsFileExcel className="mr-2" />
                Export Excel
              </Button>
              {/* <Button className="flex items-center" color="red">
                <BsFilePdf className="mr-2" />
                Export PDF
              </Button> */}
            </div>
          </div>
        </Tabs.Panel>
        {/* select range */}
        <Tabs.Panel value="range">
          <div className="flex w-full mt-3 flex-col gap-y-3 items-center">
            <span className=" text-sm text-gray-800">
              Export data from a specific date range (from date - to date)
            </span>
            <DatePicker type="range" value={range} onChange={setRange} />
            <div className="flex items-center gap-x-3">
              <Button
                className="flex items-center"
                color="green"
                onClick={() => {
                  exportToExcel(
                    'Tables',
                    data,
                    '.xlsx',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                  );
                }}
              >
                <BsFileExcel className="mr-2" />
                Export Excel
              </Button>
              {/* <Button className="flex items-center" color="red">
                <BsFilePdf className="mr-2" />
                Export PDF
              </Button> */}
            </div>
          </div>
        </Tabs.Panel>
      </Tabs>
      {/* clos button */}
      <div className="flex w-full justify-center">
        <Button onClick={onClose} color="blue" variant="light">
          Close
        </Button>
      </div>
    </div>
  );
};

export default ExportForm;
