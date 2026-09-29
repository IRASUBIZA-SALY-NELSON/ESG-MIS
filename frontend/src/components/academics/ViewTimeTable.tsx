import React from 'react';

interface Lesson {
  id: string;
  planningId: string;
  subject: string;
  course: {
    id: string;
    courseName: string;
  };
  teacher: string;
  className: string;
  timeSlot: {
    id: string;
    dayOfWeek: string;
    startTime: number[];
    endTime: number[];
  };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getColor = (courseName: string) => {
  const colors = [
    'bg-red-200',
    'bg-green-200',
    'bg-blue-200',
    'bg-yellow-200',
    'bg-purple-200',
    'bg-pink-200',
    'bg-orange-200',
    'bg-teal-200',
    'bg-indigo-200',
    'bg-cyan-200',
    'bg-lime-200',
    'bg-amber-200',
    'bg-emerald-200',
    'bg-fuchsia-200',
    'bg-rose-200',
    'bg-sky-200',
  ];
  const index =
    courseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

const formatTime = (time: number[]) => {
  return `${time[0]}:${time[1].toString().padStart(2, '0')}`;
};

const Timetable: React.FC<{ title?: string; lessons: Lesson[] }> = ({ title, lessons }) => {
  const groupedByTime = lessons.reduce(
    (acc, lesson) => {
      const key = `${lesson.timeSlot.startTime.join(':')}-${lesson.timeSlot.endTime.join(':')}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(lesson);
      return acc;
    },
    {} as Record<string, Lesson[]>,
  );

  const sortedTimeKeys = Object.keys(groupedByTime).sort((a, b) => {
    const [aStart] = a.split('-')[0].split(':').map(Number);
    const [bStart] = b.split('-')[0].split(':').map(Number);
    return aStart - bStart;
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="overflow-auto border border-gray-300 rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Time</th>
              {DAYS.map((day) => (
                <th key={day} className="border p-2 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTimeKeys.map((timeKey) => {
              const timeLessons = groupedByTime[timeKey];
              const [start, end] = timeKey.split('-');

              return (
                <tr key={timeKey}>
                  <td className="border p-2 text-center">
                    {start} - {end}
                  </td>
                  {DAYS.map((day) => {
                    const lesson = timeLessons.find(
                      (l) => l.timeSlot.dayOfWeek.toLowerCase() === day.toLowerCase(),
                    );
                    return (
                      <td key={day + timeKey} className="border p-2 h-20 text-center align-top">
                        {lesson && (
                          <div
                            className={`p-2 text-sm font-semibold text-black rounded ${getColor(lesson.course.courseName)}`}
                          >
                            {lesson.subject} <br /> ({lesson.teacher})
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;
