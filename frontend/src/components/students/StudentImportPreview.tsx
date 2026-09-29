'use client';
import React, { FC } from 'react';
import ExcelImportPreviewer from '@/components/staff/ds/ExcelImportPreviewer';
import { missingRequiredHeaders, unknownHeaders } from './studentImportColumns';

interface Props {
  data: Record<string, unknown>[];
}

const StudentImportPreview: FC<Props> = ({ data }) => {
  const headers = data?.[0] ? Object.keys(data[0]) : [];
  const missing = missingRequiredHeaders(headers);
  const extra = unknownHeaders(headers);

  return (
    <div className="flex w-full flex-col gap-2">
      {missing.length > 0 && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          Missing required columns: {missing.map((column) => column.header).join(', ')}. Download
          the template and keep those header names in row 1.
        </p>
      )}
      {extra.length > 0 && missing.length === 0 && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          These extra columns will be ignored: {extra.join(', ')}.
        </p>
      )}
      {missing.length === 0 && extra.length === 0 && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
          Headers look good. Check the rows below, then post.
        </p>
      )}
      {data?.length ? <ExcelImportPreviewer data={data} /> : null}
    </div>
  );
};

export default StudentImportPreview;
