import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/Usercontext';
import { getStudentMarksById } from '@/utils/funcs';

const AppealsForDs = () => {
  const { profile } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<any[]>();
  const [err, setErr] = useState<any>();

  useEffect(() => {
    if (profile) {
      getStudentMarksById(profile.id)
        .then((res) => {
          setMarks(res.data);
        })
        .catch(() => {
          setErr(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const lastFiveMarks = marks?.slice(0, 5);

  return loading ? (
    <div className="text-center mt-8">Loading...</div>
  ) : (
    <div>
      {marks && marks.length === 0 ? (
        <div className="text-center mt-8">No Marks So Far</div>
      ) : (
        <table className=" w-full my-3">
          <thead className=" text-mainPurple">
            <tr className="bg-[#E7F2EC] ">
              <th className="p-2 font-semibold py-3  rounded-l-xl">Lesson</th>
              <th className="p-2 font-semibold py-3 ">Marks</th>
              <th className="p-2 font-semibold py-3 ">Weight</th>
              <th className="p-2 font-semibold py-3 ">Status</th>
              <th className="p-2 font-semibold py-3  rounded-r-xl">Comment</th>
            </tr>
          </thead>
          <tbody>
            {lastFiveMarks?.map((mark, index) => (
              <tr
                key={index}
                className={`rounded-md overflow-hidden text-center ${
                  index % 2 !== 0 ? 'bg-[#4343430f]' : 'bg-[#43434308]'
                }  border-2 border-[#F5FAF7]`}
              >
                <td className="p-2 py-3 rounded-l-xl">{mark?.course?.courseName}</td>
                <td className="p-2 py-3">{mark?.marks}</td>
                <td className="p-2 py-3">{mark?.weight}</td>
                <td className="p-2 py-3">{mark?.marksStatus}</td>
                <td className="p-2 py-3 rounded-r-xl">{mark?.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppealsForDs;
