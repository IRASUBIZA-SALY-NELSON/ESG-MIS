'use client';
import { Tabs } from '@mantine/core';
import { useState } from 'react';
import DsMarksReportCases from './DsMarksReportCases';
import DsMarksReportStudents from './DsMarksReportStudents';

const DsMarksReport = () => {
  const [tab, setTab] = useState<'students' | 'cases'>('students');
  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className=" text-lg font-semibold">Ds Marks Report</h1>
      <Tabs
        onChange={(e) => {
          setTab(e as any);
        }}
        defaultValue={'students'}
        className=""
      >
        <Tabs.List>
          <Tabs.Tab value="students">Students</Tabs.Tab>
          <Tabs.Tab value="cases">Cases</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="students" className="mt-3">
          <DsMarksReportStudents />
        </Tabs.Panel>
        <Tabs.Panel value="cases">
          <DsMarksReportCases />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default DsMarksReport;
