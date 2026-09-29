'use client';
import React, { useState } from 'react';
import clsx from 'clsx';

const StudentsTable = () => {
  const students = [
    {
      id: 1,
      name: 'John Doe',
      email: 'Jane Doe@gmail.com',
      term1: 10,
      term2: 10,
      term3: 10,
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'Bob Smith@gmail.com',
      term1: 10,
      term2: 10,
      term3: 10,
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'Bob Smith@gmail.com',
      term1: 10,
      term2: 10,
      term3: 10,
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'Bob Smith@gmail.com',
      term1: 10,
      term2: 10,
      term3: 10,
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'Bob Smith@gmail.com',
      term1: 10,
      term2: 10,
      term3: 10,
    },
    {
      id: 2,
      name: 'Alice Smith',
      email: 'Bob Smith@gmail.com',
      term1: 10,
      term2: 10,
      term3: 10,
    },
  ];
  const [activeClass, setActiveClass] = useState(0);
  return (
    <div>
      <div className="flex text-[rgba(1,56,42,0.80)] my-3 -space-x-2">
        <button
          onClick={() => activeClass != 0 && setActiveClass(0)}
          className={clsx(
            'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)]',
            activeClass == 0 && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
          )}
        >
          A
        </button>
        <button
          onClick={() => activeClass != 1 && setActiveClass(1)}
          className={clsx(
            'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)] border-l-[rgba(67,67,67,0.09)] border-l-4',
            activeClass == 1 && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
          )}
        >
          B
        </button>
        <button
          onClick={() => activeClass != 2 && setActiveClass(2)}
          className={clsx(
            'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)] border-l-[rgba(67,67,67,0.09)] border-l-4',
            activeClass == 2 && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
          )}
        >
          C
        </button>
        <button
          onClick={() => activeClass != 3 && setActiveClass(3)}
          className={clsx(
            'py-2.5 px-5 rounded-md transition-all duration-300s bg-[rgba(231,242,236)] border-l-[rgba(67,67,67,0.09)] border-l-4',
            activeClass == 3 && 'bg-[rgba(1,56,42,0.80)] text-white z-20',
          )}
        >
          D
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg text-[rgba(67,67,67,0.71)]">
          <thead>
            <tr className="bg-[rgba(231,242,236)] text-[rgba(2,79,58,0.8)] py-10 rounded-md">
              <th className="p-2 border-[#F5FAF7] border-y-[5px]  rounded-l-xl">#</th>
              <th className="p-2 border-[#F5FAF7] border-y-[5px]">Student Name</th>
              <th className="p-2 border-[#F5FAF7] border-y-[5px]">Student Email</th>
              <th className="p-2 border-[#F5FAF7] border-y-[5px]">Term 1</th>
              <th className="p-2 border-[#F5FAF7] border-y-[5px]">Term 2</th>
              <th className="p-2 border-[#F5FAF7] border-y-[5px]">Term 3</th>
            </tr>
          </thead>

          {students.map((student, index) => (
            <tr
              key={index}
              // className="my-5 border-[2px] border-[#F5FAF7] rounded-lg text-center "
              className={
                index % 2 === 0
                  ? 'bg-[rgba(67,67,67,0.03)] my-20 text-center rounded-lg'
                  : 'bg-[rgba(67,67,67,0.06)] text-center rounded-lg'
              }
            >
              <td className="p-2 border-[#F5FAF7] border-y-[5px]  rounded-l-xl">{student.id}</td>
              <td className="p-2 border-[#F5FAF7] border-y-[5px]">{student.name}</td>
              <td className="p-2 border-[#F5FAF7] border-y-[5px]">{student.email}</td>
              <td className="p-2 border-[#F5FAF7] border-y-[5px]">{student.term1} / 40</td>
              <td className="p-2 border-[#F5FAF7] border-y-[5px]">{student.term2} / 40</td>
              <td className="p-2 border-[#F5FAF7] border-y-[5px]">{student.term3} / 40</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;
