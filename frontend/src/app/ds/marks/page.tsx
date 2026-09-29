'use client';
import clsx from 'clsx';
import React, { useState } from 'react';
import Students from '../../../components/deductions/Students';
import Cases from '../../../components/deductions/Cases';

const DsMarks = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'cases'>('students');
  return (
    <div className="p-5">
      <p>Discipline Marks and Cases</p>
      <div className="flex text-[rgba(1,56,42,0.80)] my-3 -space-x-2 text-xs">
        <button
          onClick={() => activeTab != 'students' && setActiveTab('students')}
          className={clsx(
            'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)]',
            activeTab == 'students' && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
          )}
        >
          Students
        </button>
        <button
          onClick={() => activeTab != 'cases' && setActiveTab('cases')}
          className={clsx(
            'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)]',
            activeTab == 'cases' && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
          )}
        >
          Cases
        </button>
      </div>
      <div>
        {activeTab === 'students' && <Students />}
        {activeTab === 'cases' && <Cases />}
      </div>
    </div>
  );
};

export default DsMarks;
