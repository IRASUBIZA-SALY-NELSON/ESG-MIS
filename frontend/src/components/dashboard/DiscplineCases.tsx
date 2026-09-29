import React, { useEffect, useState } from 'react';
import { useUserContext } from '@/context/Usercontext';
import { getStudentDeductionsById } from '@/utils/funcs';
import { AuthApi } from '@/utils/constants';

const DisciplineCases = () => {
  const { profile } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<any[]>();
  const [err, setErr] = useState<any>();

  useEffect(() => {
    if (profile) {
      getStudentDeductionsById(profile.id)
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

  const lastFiveMarks = marks?.slice(0, 10);

  return loading ? (
    <div className="text-center mt-8">Loading...</div>
  ) : (
    <div>
      {marks && marks.length === 0 ? (
        <div className="text-center mt-8">No Discipline Cases So Far</div>
      ) : (
        <table className=" w-full my-3">
          <thead className=" text-mainPurple">
            <tr className="bg-[#E7F2EC] ">
              <th className="p-2 font-semibold py-3  rounded-l-xl">Student</th>
              <th className="p-2 font-semibold py-3 ">Marks</th>
              <th className="p-2 font-semibold py-3 ">Reason</th>
              <th className="p-2 font-semibold py-3 ">Date</th>
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
                <td className="p-2 py-3 rounded-l-xl">
                  {mark?.student.firstName + ' ' + mark?.student.lastName}
                </td>
                <td className="p-2 py-3">{mark?.marks}</td>
                <td className="p-2 py-3">{mark?.reason}</td>
                <td className="p-2 py-3">{new Date(mark.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DisciplineCases;
