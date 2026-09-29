/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { clientUrl } from '@/utils/constants';
import { ETerm } from '@/types/marks.type';
import { getTerm } from './ReportCard';
import { coursesData, grades } from './data';

export default ({ info }: any) => {
  const getW = (num: number) => `w-[${(num / 21) * 100}%]`;
  const getWs = (num: number) => `${(num / 21) * 100}%`;
  const Td = (props: React.HTMLProps<HTMLTableCellElement>) => {
    const { children, className, style, ...rest } = props;
    return (
      <td
        className={`border-2 border-collapse border-black px-2 text-center ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </td>
    );
  };

  const courses = info ? Object.keys(info?.reportCard?.FIRST_TERM ?? {}) : [];
  const ETerms: ETerm[] = [ETerm.FIRST_TERM, ETerm.SECOND_TERM, ETerm.THIRD_TERM];
  const getTermInfo = (ti: number) => (ETerms[ti] in info ? info.reportCard[ETerms[ti]] : null);

  const getMarkByType = (course: string, term: number, type: string) => {
    const termInfo = getTermInfo(term);
    if (!termInfo) return null;
    const courseMark = termInfo[course];
    if (!courseMark) return null;
    const markInfo = courseMark.find((c: any) => c.markType === type);
    if (!markInfo) return null;
    return markInfo.marks;
  };
  return (
    <div className="flex flex-col min-w-[1000px] bg-white p-11">
      <div className="flex w-full flex-col border-[3px] border-black py-9">
        <div className="flex px-9 w-full justify-between">
          <div className="flex font-semibold flex-col gap-y-4">
            <h1>REPUBLIC OF RWANDA</h1>
            <h1>MINISTRY OF EDUCATION</h1>
            <h1>ECOLE DES SCIENCES DE GISENYI</h1>
            <img className="w-20" src={`${clientUrl}/logo.png`} />
            <p>Telephone:(+250)788548000</p>
            <p>Email: papiasni@gmail.com</p>
          </div>
          <div className=" w-44 h-fit object-cover aspect-[6/7] border border-black overflow-hidden">
            <img className="object-cover min-h-full min-w-full" src={`${clientUrl}/photo.png`} />
          </div>
          <div className="flex flex-col font-semibold space-y-1">
            <p className="headerTextTw">Academic Year :2023-2023</p>
            <div className="flex flex-row items-center">
              <p className="headerTextTw">Class: </p>
              <p className="headerTextTw">Year 3A</p>
            </div>
            <p className="headerTextTw">Name: NIYONSENGA Valens</p>
          </div>
        </div>
        <h1 className=" w-full text-center font-medium underline underline-offset-4">TRANSCRIPT</h1>
        <div className="flex flex-col mt-8 w-full font-medium">
          <div className="flex-row flex w-full border border-black border-x-0">
            <div
              style={{ width: getWs(6) }}
              className={`flex flex-col items-center justify-center ${getW(
                6,
              )} p-3 border-l-0 border-black`}
            >
              <p className="text-center">COURSES</p>
            </div>
            {[1, 2, 3].map((term) => (
              <div
                style={{ width: getWs(6) }}
                key={term}
                className={`flex flex-col ${getW(6)} border-l border-black`}
              >
                <p className="text-center py-1">{getTerm(term)}</p>
                <div className="flex flex-row border-t border-black">
                  <div className={`flex flex-col w-1/3 border-l-0 border-black`}>
                    <p className="text-center py-1">CAT</p>
                  </div>
                  <div className={`flex flex-col w-1/3 border-l border-black`}>
                    <p className="text-center py-1">EXAM</p>
                  </div>
                  <div className={`flex flex-col w-1/3 border-l border-black`}>
                    <p className="text-center py-1">TOT</p>
                  </div>
                </div>
              </div>
            ))}
            <div
              style={{ width: getWs(3) }}
              className={`flex flex-col ${getW(3)} border-l border-black`}
            >
              <p className="text-center py-1">YEAR</p>
              <div className="flex flex-row border-t border-black">
                <div className={`flex flex-col w-2/3 border-l-0 border-black`}>
                  <p className="text-center py-1">TOT</p>
                </div>
                <div className={`flex flex-col w-1/3 border-l border-black`}>
                  <p className="text-center py-1">%</p>
                </div>
              </div>
            </div>
            <div
              style={{ width: getWs(2) }}
              className={`flex justify-center items-center flex-col ${getW(
                2,
              )} border-l py-2.5 border-black`}
            >
              <p className="text-center py-1">GRADE</p>
            </div>
          </div>
          {/* discipline mark */}
          <div className="flex-row flex w-full border-black border-b">
            <p style={{ width: getWs(6) }} className={`text-left ${getW(6)} p-1`}>
              DISCIPLINE
            </p>
            {[1, 2, 3].map((term) => (
              <div
                key={term}
                style={{ width: getWs(6) }}
                className={`flex flex-row ${getW(6)} border-l border-black`}
              >
                <p className="text-center w-full py-1"></p>
                <p className="text-center w-full py-1"></p>
                <p className="text-center w-full py-1"></p>
                <p className="text-center w-full py-1"></p>
                <p className="text-center w-full py-1"></p>
                <p className="text-center border-l bg-[#AAAAAA] w-full py-1">40</p>
              </div>
            ))}
            <div
              style={{ width: getWs(3) }}
              className={`flex flex-row ${getW(3)} border-l border-black`}
            >
              <p className="text-center w-full py-1"></p>
              <p className="text-center w-full bg-[#AAAAAA] py-1">120</p>
              <p className="text-center border-l w-full py-1"></p>
            </div>
            <div
              style={{ width: getWs(2) }}
              className={`flex flex-row ${getW(2)} border-l py-2.5 border-black`}
            ></div>
          </div>
          <p className="text-center w-full py-1">MARKS</p>
        </div>
        <div className="flex-row text-xs font-medium flex w-full justify-between mt-4">
          <div className="flex-row flex w-3/4 border-black border border-l-0">
            <div className="flex flex-col w-1/4 text-center">
              <p className="text-center p-2.5">GRADE SCALE</p>
              <p className="text-center whitespace-nowrap p-2.5 border-t border-black">
                SCORE RANGE
              </p>
            </div>
            {grades.map((grade) => (
              <div
                key={grade.grade}
                className="flex flex-col w-1/6 border-l border-black text-center"
              >
                <p className="text-center p-2.5">{grade.grade}</p>
                <p className="text-center p-2.5 border-t border-black">{`${grade.max}-${grade.min}`}</p>
              </div>
            ))}
          </div>
          {/* cat + exam explanation */}
          <div className="flex-row flex w-[30%] ml-2 border-black border border-r-0">
            <div className="flex flex-col w-1/4 text-center">
              <p className="text-center py-2.5">CAT</p>
              <p className="text-center py-2.5 border-t border-black">EXAM</p>
            </div>
            <div className="flex flex-col w-3/4 border-l border-black text-center">
              <p className="text-center py-2.5">{'Continuous Assessment Test'}</p>
              <p className="text-center py-2.5 border-t border-black">{`End Term Exam`}</p>
            </div>
          </div>
        </div>
        <div className="flex-col text-sm font-medium w-full justify-between mt-4 p-3">
          <p className="underline">Decision of the deliberation</p>
          <div className="flex-row flex w-full gap-x-8 justify-between">
            {[1, 2].map((val) => (
              <div key={val} className="flex flex-col w-1/3">
                <p className="underline mt-5">{val}. FIRST SITTING</p>
                <div className="flex flex-col gap-y-1 mt-4">
                  <div className="flex flex-row items-center w-full justify-between">
                    <p className="text-left">Promoted </p>
                    <div className="px-3 py-1.5 border-2 border-black"></div>
                  </div>
                  <div className="flex flex-row items-center w-full justify-between">
                    <p className="text-left">Proposed to Second Sitting </p>
                    <div className="px-3 py-1.5 border-2 border-black"></div>
                  </div>
                  <div className="flex flex-row items-center w-full justify-between">
                    <p className="text-left">Proposed to Repeat </p>
                    <div className="px-3 py-1.5 border-2 border-black"></div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-col w-1/3 pt-24 gap-y-2">
              <p>Done at Rubavu ...../...../2021</p>
              <p>The Principle</p>
              <p>Signature and Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
