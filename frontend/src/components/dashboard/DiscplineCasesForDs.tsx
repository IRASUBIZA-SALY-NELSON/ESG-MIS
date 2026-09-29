import { useUserContext } from '@/context/Usercontext';
import { AuthApi } from '@/utils/constants';
import { useEffect, useState } from 'react';

const DiscplineCasesForDS = () => {
  const { profile } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<any[]>();
  const [err, setErr] = useState<any>();

  useEffect(() => {
    if (profile) {
      const fetchData = async () => {
        try {
          const yearResponse = await AuthApi.get('/academic-years/all');
          const yearsData = yearResponse.data.data;
          const termResponse = await AuthApi.get(`/terms/all/academic-year/${yearsData[0].id}`);
          const termsData = termResponse.data.data;
          const staff = JSON.parse((await localStorage.getItem('rcaappuser')) as any);
          const deductionsResponse = await AuthApi.get(`/deductions/academic-year/term/staff`, {
            params: {
              'academic-year': yearsData[0].id,
              term: termsData[0].id,
              staff: staff.userTypesDTOList[0].user_id,
            },
          });
          const deductionsData = deductionsResponse.data.data;
          setMarks(deductionsData);
        } catch (error) {
          setErr(true);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
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
              <th className="p-2 font-semibold py-3  rounded-l-xl">Reason</th>
              <th className="p-2 font-semibold py-3 ">Student</th>
              <th className="p-2 font-semibold py-3 ">Marks</th>
              <th className="p-2 font-semibold py-3 ">At</th>
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
                <td className="p-2 py-3 rounded-l-xl">{mark?.reason}</td>
                <td className="p-2 py-3">
                  {mark.student.firstName + ' ' + mark?.student.lastName}
                </td>
                <td className="p-2 py-3">{mark?.marks}</td>
                <td className="p-2 py-3">
                  {new Date(mark.createdAt).toLocaleDateString()}{' '}
                  {new Date(mark.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DiscplineCasesForDS;
