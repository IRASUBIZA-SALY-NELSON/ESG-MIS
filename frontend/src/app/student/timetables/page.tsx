import PdfViewer from '@/components/timetable';
const StudentTimetable = () => {
  return (
    <div className="w-full flex flex-col gap-y-4">
      <h1 className="text-[#000000B2] font-semibold mx-1">Timetable</h1>

      <div>
        <PdfViewer url="/temp.pdf" />
      </div>
    </div>
  );
};
export default StudentTimetable;
