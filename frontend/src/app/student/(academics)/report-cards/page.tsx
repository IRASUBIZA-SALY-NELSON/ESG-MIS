'use client';

const ReportCards = () => {
  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-2 h-[80vh] text-sm border-[2px] rounded-lg">
      {/* <div className="flex w-full flex-col overflow-x-auto">
        <ReportCardComp />
      </div> */}
      <div className="w-full h-full min-h-[30vh] flex flex-col justify-center items-center">
        <h1 className=" md:text-xl font-medium text-center">
          Select Academic Year to view report card
        </h1>
      </div>
    </div>
  );
};

export default ReportCards;
