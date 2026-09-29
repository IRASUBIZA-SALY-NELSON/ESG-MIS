import React from 'react';
import StudentsTable from './StudentsTable';

const OneClass = () => {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <div className="flex flex-col sm:flex-row justify-between">
        <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">Year 2 students</h2>
        <p className="text-[rgba(67,67,67,0.43)] my-2">Discipline Marks for students in year 2</p>
      </div>
      <div className="block sm:hidden  text-sm">
        <div className="flex justify-between my-1">
          <div></div>
          <div className="flex flex-row gap-3">
            <button className="bg-primary rounded-md text-white px-5 py-2">Create New Term</button>
            <button className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-5 py-2">
              Release All the Report Cards
            </button>
          </div>
        </div>
        <input
          type="text"
          className="bg-[rgba(67,67,67,0.09)] px-3 py-2 rounded-md border-[2px] border-[rgba(67,67,67,0.03)] w-full "
          placeholder="Search Student by Name"
        />
      </div>
      <div className="hidden sm:flex flex-row justify-between my-5">
        <input
          type="text"
          className="bg-[rgba(67,67,67,0.09)] px-3 py-2 rounded-md border-[2px] border-[rgba(67,67,67,0.03)] w-[30vw]"
          placeholder="Search Student by Name"
        />
        <div className="flex flex-row gap-3">
          <button className="bg-primary rounded-md text-white px-5 py-2">Download Excel</button>
          <button className="bg-[rgba(10,107,79,0.5)] rounded-md text-[rgba(10,107,79)] px-5 py-2">
            Upload Excel for all students
          </button>
        </div>
      </div>
      <StudentsTable />
    </div>
  );
};

export default OneClass;
