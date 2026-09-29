'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AuthApi } from '@/utils/constants';
import { ICourse } from '@/types/course.type';
import backBtn from '@/assets/back.svg';
import Image from 'next/image';

interface PDF {
  name: string;
  file: string;
}

interface Term {
  name: string;
  pdfs: PDF[];
}

interface Year {
  name: string;
  terms: Term[];
}

const OneCourseDocs: React.FC = () => {
  const params = useParams();
  const { id } = params;
  const [course, setCourse] = useState<ICourse | null>(null);
  const [pastPapers, setPastPapers] = useState<any>();
  const [activeTab, setActiveTab] = useState<'notes' | 'papers'>('notes');
  const [loading, setLoading] = useState<boolean>(true);
  const [years] = useState<Year[]>([
    {
      name: '2023-2024',
      terms: [
        {
          name: 'First Term',
          pdfs: [
            { name: 'PDF 1', file: 'pdf1.pdf' },
            { name: 'PDF 2', file: 'pdf2.pdf' },
          ],
        },
        {
          name: 'Second Term',
          pdfs: [
            { name: 'PDF 3', file: 'pdf3.pdf' },
            { name: 'PDF 4', file: 'pdf4.pdf' },
          ],
        },
        {
          name: 'Third Term',
          pdfs: [
            { name: 'PDF 5', file: 'pdf5.pdf' },
            { name: 'PDF 6', file: 'pdf6.pdf' },
          ],
        },
      ],
    },
  ]);

  useEffect(() => {
    if (id) {
      AuthApi.get(`/courses/id/${id}`).then((res) => {
        setCourse(res.data.data);
        setLoading(false);
      });

      AuthApi.get(`/past-papers/course/${id}`)
        .then((res) => {
          setPastPapers(res.data.data);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
        });
    }
  }, [id]);

  const Loader = () => (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="p-4">
      {loading && <Loader />}

      {!loading && course && (
        <>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                window.history.back();
              }}
            >
              <Image src={backBtn} alt="" />
            </button>
            <h2 className="text-[17px] font-medium  text-[rgba(0,0,0,0.7)] my-2">
              {course.courseName}
            </h2>
          </div>
          <div className="flex mb-4">
            <button
              className={`flex-1 px-4 py-2 bg-[#F5FAF7] ${
                activeTab === 'notes'
                  ? 'border-b-2 border-mainPurple'
                  : 'border-b-2 border-transparent'
              } transition-colors duration-300 focus:outline-none`}
              onClick={() => setActiveTab('notes')}
            >
              Notes
            </button>
            <button
              className={`flex-1 px-4 py-2 bg-[#F5FAF7] ${
                activeTab === 'papers'
                  ? 'border-b-2 border-mainPurple'
                  : 'border-b-2 border-transparent'
              } transition-colors duration-300 focus:outline-none`}
              onClick={() => setActiveTab('papers')}
            >
              Past Papers
            </button>
          </div>

          <div
            className={`transition-max-height duration-500 overflow-hidden ${
              activeTab === 'notes' ? 'max-h-full block' : 'max-h-0 hidden'
            }`}
          >
            {years.map((year) => (
              <div key={year.name}>
                <h2 className="text-lg font-semibold">{year.name}</h2>
                {year.terms.map((term) => (
                  <div key={term.name.replace('_', ' ')}>
                    <h3 className="text-md font-medium mt-2">{term.name.replace('_', ' ')}</h3>
                    {term.pdfs.map((pdf) => (
                      <div key={pdf.name} className="ml-4">
                        <a href={pdf.file} target="_blank" rel="noopener noreferrer">
                          {pdf.name}
                        </a>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div
            className={`transition-max-height duration-500 overflow-hidden ${
              activeTab === 'papers' ? 'max-h-full block' : 'max-h-0 hidden'
            }`}
          >
            {years.map((year) => (
              <div key={year.name}>
                <h2 className="text-lg font-semibold">{year.name}</h2>
                {year.terms.map((term) => (
                  <div key={term.name.replace('_', ' ')}>
                    <h3 className="text-md font-medium mt-2">{term.name.replace('_', ' ')}</h3>
                    {term.pdfs.map((pdf) => (
                      <div key={pdf.name} className="ml-4">
                        <a href={pdf.file} target="_blank" rel="noopener noreferrer">
                          {pdf.name}
                        </a>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OneCourseDocs;
