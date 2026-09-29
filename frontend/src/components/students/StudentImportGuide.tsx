'use client';
import React from 'react';
import { STUDENT_IMPORT_COLUMNS, type StudentImportColumn } from './studentImportColumns';

const GROUPS: { key: StudentImportColumn['group']; title: string }[] = [
  { key: 'student', title: 'Student' },
  { key: 'class', title: 'Class' },
  { key: 'father', title: 'Father' },
  { key: 'mother', title: 'Mother' },
  { key: 'guardian', title: 'Guardian' },
];

const StudentImportGuide = () => {
  return (
    <div className="w-full rounded-md border border-[rgba(2,79,58,0.18)] bg-[#024F3A08] p-3 text-left">
      <p className="text-sm font-semibold text-mainPurple">Excel columns</p>
      <p className="mt-1 text-xs text-[rgba(67,67,67,0.75)]">
        Put these names in the first row. Required columns must be present. Parent columns are
        optional — fill a name or email to create that parent and link them to the student.
      </p>
      <div className="mt-3 max-h-64 overflow-auto rounded-md border border-[rgba(2,79,58,0.12)] bg-white">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#024F3A] text-white">
            <tr>
              <th className="px-2 py-1.5 font-medium">Column</th>
              <th className="px-2 py-1.5 font-medium">Need</th>
              <th className="px-2 py-1.5 font-medium">Example</th>
              <th className="px-2 py-1.5 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.flatMap((group) => {
              const rows = STUDENT_IMPORT_COLUMNS.filter((column) => column.group === group.key);
              return [
                <tr key={group.key} className="bg-[#024F3A12]">
                  <td colSpan={4} className="px-2 py-1 font-semibold text-mainPurple">
                    {group.title}
                  </td>
                </tr>,
                ...rows.map((column) => (
                  <tr key={column.header} className="border-t border-[rgba(67,67,67,0.08)]">
                    <td className="px-2 py-1.5 font-medium whitespace-nowrap">{column.header}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      {column.required ? (
                        <span className="rounded bg-[#FCB90A33] px-1.5 py-0.5 font-semibold text-[#8A5A00]">
                          Required
                        </span>
                      ) : (
                        <span className="text-[rgba(67,67,67,0.65)]">Optional</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-[rgba(67,67,67,0.8)]">
                      {column.example || '—'}
                    </td>
                    <td className="px-2 py-1.5 text-[rgba(67,67,67,0.8)]">{column.note}</td>
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentImportGuide;
