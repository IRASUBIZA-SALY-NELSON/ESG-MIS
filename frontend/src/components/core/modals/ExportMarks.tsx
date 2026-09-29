import { Button } from '@mantine/core';
import { getCookie } from 'cookies-next';
import { useUserContext } from '@/context/Usercontext';
import { BsFilePdf } from 'react-icons/bs';
import { BsFileExcel } from 'react-icons/bs';
import { backend } from '@/utils/constants';
import React, { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
  tableName?: string;
  classId: string;
  courseId: string;
  termId: string;
  courseName?: string;
  className?: string;
  academicYearId?: string;
}

const ExportMarks = ({
  onClose,
  tableName,
  classId,
  courseId,
  termId,
  courseName,
  className,
  academicYearId,
}: Props) => {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(
    academicYearId || '',
  );
  const [selectedTermId, setSelectedTermId] = useState<string>(termId || '');
  const [academicYears, setAcademicYears] = useState<Array<{ id: string; name: string }>>([]);
  const [terms, setTerms] = useState<Array<{ id: string; name: string }>>([]);
  const { profile } = useUserContext();

  const downloadFile = async (url: string, filename: string, setLoading: (v: boolean) => void) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
        },
      });
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const excelUrl = `${backend}/exporting/term/${termId}/class/${classId}/course/${courseId}/export-excel`;
  const safeName = (tableName ?? 'Marks').replace(/\s+/g, '_');

  const handleClientPdf = async () => {
    setLoadingPdf(true);
    try {
      const ayId = selectedAcademicYearId || academicYearId || '';
      const tId = selectedTermId || termId || '';
      const params = new URLSearchParams({
        classId,
        courseId,
        termId: tId,
        ...(ayId ? { academicYearId: ayId } : {}),
      } as any);
      const res = await fetch(
        `${backend}/academicMarks/all/filtered-by-all-with-class?${params.toString()}`,
        { headers: { Authorization: `Bearer ${getCookie('token')}` } },
      );
      if (!res.ok) throw new Error(`Marks fetch failed (${res.status})`);
      const raw = await res.json();
      const extracted = raw?.data?.body?.data ?? raw?.data ?? raw?.content ?? raw;
      const marks: any[] = Array.isArray(extracted) ? extracted : [];
      const byStudent: Record<
        string,
        {
          regNo: string;
          name: string;
          cat?: number;
          exam?: number;
          catMax?: number;
          examMax?: number;
        }
      > = {};
      marks.forEach((m) => {
        const sid = m?.student?.id;
        if (!sid) return;
        const key = sid as string;
        byStudent[key] = byStudent[key] || {
          regNo: m?.student?.studentId ?? '',
          name: `${m?.student?.firstName ?? ''} ${m?.student?.lastName ?? ''}`.trim(),
        };
        if ((m?.markType ?? '').toUpperCase() === 'CAT') {
          byStudent[key].cat = m?.marks ?? 0;
          byStudent[key].catMax = m?.weight ?? 0;
        }
        if ((m?.markType ?? '').toUpperCase() === 'EXAM') {
          byStudent[key].exam = m?.marks ?? 0;
          byStudent[key].examMax = m?.weight ?? 0;
        }
      });
      const rows = Object.values(byStudent).map((s, idx) => {
        const cat = s.cat ?? 0;
        const catMax = s.catMax ?? 0;
        const exam = s.exam ?? 0;
        const examMax = s.examMax ?? 0;
        const total = (cat as number) + (exam as number);
        const totalMax = (catMax as number) + (examMax as number);

        return [
          String(idx + 1),
          s.regNo || '',
          s.name || '',
          cat.toString(),
          catMax.toString(),
          exam.toString(),
          examMax.toString(),
          total.toString(),
          totalMax.toString(),
        ];
      });

      const termRes = await fetch(`${backend}/terms/${tId}`, {
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });
      let term: any = null;
      if (termRes.ok) {
        const rawTerm = await termRes.json();
        term = rawTerm?.data?.body?.data ?? rawTerm?.data ?? rawTerm;
      }

      // Infer teacher from first mark that has teacher info
      // Teacher fetching: Priority 1 = Class Course Teacher (API), Priority 2 = Logged In User, Priority 3 = Teacher from Marks
      let teacherName = '';
      let teacherTel = '';

      // 1. Try fetching assigned teacher (Filtered by Class)
      try {
        const tRes = await fetch(
          `${backend}/teacher-class-course/teacher/course/${courseId}/term/${termId}`,
          { headers: { Authorization: `Bearer ${getCookie('token')}` } },
        );
        if (tRes.ok) {
          const rawT = await tRes.json();
          const list = rawT?.data?.body?.data ?? rawT?.data ?? rawT;
          if (Array.isArray(list)) {
            // Find the teacher assigned to this specific class
            const assignedEntry = list.find((item: any) => item?.myClazz?.id === classId);
            const t = assignedEntry?.teacher;
            if (t) {
              teacherName = `${t?.firstName ?? ''} ${t?.lastName ?? ''}`.trim();
              teacherTel = t?.phoneNumber ?? '';
            }
          }
        }
      } catch {
        /* empty */
      }

      // 2. Fallback to Logged In User (if teacher not found yet)
      if (!teacherName && profile) {
        // We assume if they are exporting marks, they might be the teacher or relevant staff
        teacherName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
        teacherTel = profile?.phoneNumber ?? '';
      }

      // 3. Fallback to marks teacher if still nothing found
      if (!teacherName) {
        const teacherFromMarks = marks.find((m: any) => m?.teacher)?.teacher;
        if (teacherFromMarks) {
          teacherName =
            `${teacherFromMarks?.firstName ?? ''} ${teacherFromMarks?.lastName ?? ''}`.trim();
          teacherTel = teacherFromMarks?.phoneNumber ?? '';
        }
      }

      // Get academic year name if possible
      let academicYearName = '';
      if (ayId) {
        try {
          const ayRes = await fetch(`${backend}/academicYears/${ayId}`, {
            headers: { Authorization: `Bearer ${getCookie('token')}` },
          });
          if (ayRes.ok) {
            const rawAy = await ayRes.json();
            const ay = rawAy?.data?.body?.data ?? rawAy?.data ?? rawAy;
            academicYearName = ay?.name ?? ay?.academicYearName ?? '';
          }
        } catch {
          /* exception */
        }
      }

      const normTerm = (v: string | undefined) =>
        (v || '')
          .toString()
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const meta = {
        academicYear:
          academicYearName ||
          (academicYears.find((a) => a.id === ayId)?.name ?? '') ||
          term?.academicYear?.name ||
          term?.academicYearName ||
          '',
        termName:
          normTerm(terms.find((t) => t.id === tId)?.name ?? '') ||
          normTerm(term?.name ?? term?.termName ?? ''),
        className: className ?? '',
        courseName: courseName ?? '',
        teacherName,
        teacherTel,
      };

      const { generateMarksPdf } = await import('@/utils/pdf/generateMarksPdf');
      const blob = await generateMarksPdf({ rows, meta, logoPath: '/logo.png' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      onClose();
    } catch (e) {
      console.error('Client PDF generation failed', e);
    } finally {
      setLoadingPdf(false);
    }
  };

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await fetch(`${backend}/academic-years/all`, {
          headers: { Authorization: `Bearer ${getCookie('token')}` },
        });
        if (res.ok) {
          const raw = await res.json();
          const list = raw?.data?.body?.data ?? raw?.data ?? raw;
          setAcademicYears(list);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const fetchTerms = async (ay?: string) => {
      try {
        const url = ay ? `${backend}/terms/all/academic-year/${ay}` : `${backend}/terms/all`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${getCookie('token')}` },
        });
        if (res.ok) {
          const raw = await res.json();
          const list = raw?.data?.body?.data ?? raw?.data ?? raw;
          setTerms(list);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchAcademicYears();
    fetchTerms(selectedAcademicYearId || academicYearId);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const ay = selectedAcademicYearId || academicYearId || '';
        if (!ay) return;
        const res = await fetch(`${backend}/terms/all/academic-year/${ay}`, {
          headers: { Authorization: `Bearer ${getCookie('token')}` },
        });
        if (res.ok) {
          const raw = await res.json();
          const list = raw?.data?.body?.data ?? raw?.data ?? raw;
          setTerms(list);
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [selectedAcademicYearId]);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex w-full flex-col gap-3">
        <div className="flex gap-3 items-center justify-center">
          <div className="flex flex-col text-sm">
            <label className="mb-1">Academic Year</label>
            <select
              className="border rounded px-2 py-2 min-w-[220px]"
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col text-sm">
            <label className="mb-1">Term</label>
            <select
              className="border rounded px-2 py-2 min-w-[220px]"
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              disabled={!selectedAcademicYearId}
            >
              <option value="">Select Term</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name
                    ?.replace(/_/g, ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex w-full justify-center gap-3">
          <Button
            className="flex items-center"
            color="green"
            loading={loadingExcel}
            disabled={loadingExcel || loadingPdf}
            onClick={() => downloadFile(excelUrl, `${safeName}.xlsx`, setLoadingExcel)}
          >
            <BsFileExcel className="mr-2" />
            Download Excel
          </Button>
          <Button
            className="flex items-center"
            color="red"
            loading={loadingPdf}
            disabled={loadingExcel || loadingPdf || !selectedAcademicYearId || !selectedTermId}
            onClick={handleClientPdf}
          >
            <BsFilePdf className="mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportMarks;
