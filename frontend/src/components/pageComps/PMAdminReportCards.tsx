'use client';
import ViewReportCard from '@/components/academics/ViewReportCard';
import { DataTable } from '@/components/core/data-table';
import MainModal from '@/components/core/modals/modal';
import { AuthApi, baseUrl } from '@/utils/constants';
import useGet from '@/hooks/useGet';
import { IClass } from '@/types/class.type';
import { IAcademicYear, ITerm } from '@/types/other.type';
import { Student } from '@/types/student.types';
import { ActionIcon, Button, Input, Select, Modal, Table, Text, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { HiDocumentReport } from 'react-icons/hi';
import { ClipLoader } from 'react-spinners';
import ReportReleasingExportPerformance from './ReportReleasing';
import { getCookie } from 'cookies-next';
import { CiSearch } from 'react-icons/ci';
import { ExportOptionsDialog } from '@/components/academics/ExportOptionsDialog';
import { PdfFormatDialog } from '@/components/academics/PdfFormatDialog';
import { pdf } from '@react-pdf/renderer';
import ReportCard from '@/components/academics/report-cards/ReportCard';
import { genReportCardQrCode } from '@/utils/funcs/func3';
import { IReportCard, DsReport } from '@/types/marks.type';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { PDFDocument } from 'pdf-lib';

import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { Document, Page, Text as PDFText, View, StyleSheet } from '@react-pdf/renderer';
import TranscriptPage from '@/app/student/(academics)/report-cards/[id]/transcript/_transcript_page';
interface Props {
  canRelease?: boolean;
}

type ReportAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outline';
  className?: string;
};

const PMAdminReportCards = ({ canRelease }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState({
    status: false,
    student: null as Student | null,
    academicYearId: '',
  });
  const [openTranscript, setOpenTranscript] = useState<Student | null>(null);
  const [openRelease, setOpenRelease] = useState<any>('');
  const [_error, setError] = useState('');
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showMarksExportModal, setShowMarksExportModal] = useState<boolean>(false);
  const [selectedMarkType, setSelectedMarkType] = useState<'CAT' | 'EXAM' | ''>('CAT');
  const [selectedMarksExportMode, setSelectedMarksExportMode] = useState<'course' | 'term-summary'>(
    'course',
  );
  const [marksExportFilters, setMarksExportFilters] = useState({
    academicYear: '',
    classId: '',
  });
  const [loadingMarksExport, setLoadingMarksExport] = useState<boolean>(false);
  const [showPdfFormatModal, setShowPdfFormatModal] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [generatingPDF, setGeneratingPDF] = useState<boolean>(false);
  const [generatingAllClassesPDF, setGeneratingAllClassesPDF] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<{ [key: string]: boolean } | null>(
    null,
  );
  const [validationResultspdf, setValidationResultspdf] = useState<{
    [key: string]: boolean;
  } | null>(null);
  const [validationResultsAllClassespdf, setValidationResultsAllClassespdf] = useState<{
    [key: string]: boolean;
  } | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState({
    academicYear: '',
    term: '',
    classId: '',
  });

  const { data: academicYears, get: fetchAcademicYears } = useGet<IAcademicYear[]>(
    '/academic-years/all',
    {
      defaultData: [],
    },
  );
  const { data: terms, get: fetchTerms } = useGet<ITerm[]>(
    selectedFilters.academicYear
      ? `/terms/all/academic-year/${selectedFilters.academicYear}`
      : '/terms/all',
    {
      defaultData: [],
    },
  );
  const { data: classes, get: fetchClasses } = useGet<IClass[]>(
    selectedFilters.academicYear
      ? `/classes/all/year/${selectedFilters.academicYear}`
      : '/classes/all',
    {
      defaultData: [],
    },
  );
  const { data: marksExportClasses, get: fetchMarksExportClasses } = useGet<IClass[]>(
    marksExportFilters.academicYear
      ? `/classes/all/year/${marksExportFilters.academicYear}`
      : undefined,
    {
      defaultData: [],
      onMount: false,
    },
  );

  useEffect(() => {
    if (academicYears && selectedFilters.academicYear) {
      fetchTerms();
      setSelectedFilters((prev) => ({ ...prev, term: '' }));
    }
  }, [selectedFilters.academicYear, academicYears]);
  useEffect(() => {
    if (selectedFilters.academicYear) {
      fetchClasses();
      setSelectedFilters((prev) => ({ ...prev, classId: '' }));
    }
  }, [selectedFilters.academicYear]);
  useEffect(() => {
    if (academicYears)
      setSelectedFilters((prev) => ({
        ...prev,
        academicYear: academicYears?.filter((year) => year.status == 'ACTIVE')[0]?.id || '',
      }));
  }, [academicYears]);
  useEffect(() => {
    if (!academicYears) return;
    setMarksExportFilters((prev) => ({
      ...prev,
      academicYear:
        prev.academicYear || academicYears?.filter((year) => year.status == 'ACTIVE')[0]?.id || '',
    }));
  }, [academicYears]);
  useEffect(() => {
    if (!marksExportFilters.academicYear) return;
    fetchMarksExportClasses();
    setMarksExportFilters((prev) => ({ ...prev, classId: '' }));
  }, [marksExportFilters.academicYear]);

  const {
    data: students,
    getPaginated,
    loading,
    paginateOpts,
    setPaginateOpts,
    setData,
    error,
  } = useGet<Student[]>('/students/student/search', {
    defaultData: [],
    paginated: true,
    pagination: {
      limit: 30,
    },
    query: {
      academicYearId: selectedFilters.academicYear,
      classId: selectedFilters.classId,
      termId: selectedFilters.term,
      searchQuery,
    },
  });

  useEffect(() => {
    getPaginated();
  }, [selectedFilters, searchQuery]);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => <div>{row.getValue('gender')}</div>,
    },
    {
      accessorKey: 'currentClazz',
      header: 'Current Class',
      cell: ({ row }) => <div>{row.getValue<IClass>('currentClazz')?.className}</div>,
    },
    {
      header: 'View Report',
      cell: ({ row }) => (
        <ActionIcon
          variant="transparent"
          onClick={() =>
            setOpenReport({
              status: true,
              student: row.original,
              academicYearId: selectedFilters.academicYear,
            })
          }
        >
          <HiDocumentReport size={25} />
        </ActionIcon>
      ),
    },
    {
      header: 'Transcript',
      cell: ({ row }) => (
        <Button variant="subtle" size="compact-xs" onClick={() => setOpenTranscript(row.original)}>
          Transcript
        </Button>
      ),
    },
  ];

  const onReleaseReportExportPerformance = (action: string) => {
    setError('');
    setOpenRelease(action);
  };

  const onExportMarks = () => {
    setError('');
    setShowMarksExportModal(true);
  };

  const downloadMarksExcel = async () => {
    if (!marksExportFilters.academicYear || !selectedMarkType) {
      notifications.show({
        title: 'Error',
        message: 'Academic year and mark type are required',
        color: 'red',
      });
      return;
    }

    setLoadingMarksExport(true);

    try {
      const academicYear = academicYears?.find(
        (year) => year.id === marksExportFilters.academicYear,
      );
      const selectedClass = marksExportClasses?.find(
        (classItem) => classItem.id === marksExportFilters.classId,
      );

      const params = new URLSearchParams({
        academicYearId: marksExportFilters.academicYear,
        markType: selectedMarkType,
        exportMode: selectedMarksExportMode,
      });
      if (marksExportFilters.classId) {
        params.append('classId', marksExportFilters.classId);
      }

      const response = await AuthApi.get<Blob>(`/exporting/students/marks?${params.toString()}`, {
        responseType: 'blob',
      });

      const contentType = response.headers?.['content-type'];
      const blob = new Blob([response.data], {
        type:
          typeof contentType === 'string'
            ? contentType
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const modeLabel = selectedMarksExportMode === 'term-summary' ? 'TermSummary' : 'Detailed';
      const fileName = `${modeLabel}_${selectedMarkType}_${academicYear?.name ?? 'Year'}_${selectedClass?.className?.replace(/\s+/g, '_') ?? 'AllClasses'}.xlsx`;
      saveAs(blob, fileName);
      setShowMarksExportModal(false);
    } catch (error: any) {
      notifications.show({
        title: 'Export Failed',
        message: error?.response?.data?.message || 'Failed to download marks. Please try again.',
        color: 'red',
      });
    } finally {
      setLoadingMarksExport(false);
    }
  };

  // Show export format selection modal
  const onExportReportCards = () => {
    setError('');
    if (!selectedFilters.academicYear) {
      notifications.show({
        title: 'Error',
        message: 'Select Academic Year to export',
        color: 'red',
      });
      return;
    }
    setShowExportModal(true);
  };

  const handleValidateReportCards = async () => {
    if (!selectedFilters.academicYear || !selectedFilters.classId) {
      notifications.show({
        title: 'Error',
        message: 'Please select academic year and class',
        color: 'red',
      });
      return;
    }

    setValidating(true);
    try {
      const response = await AuthApi.post('/report-cards/validate', {
        academicYearId: selectedFilters.academicYear,
        termId: selectedFilters.term,
        classId: selectedFilters.classId,
      });

      if (response.data?.success) {
        const results = response.data.data.results;
        setValidationResults(results);

        // Count valid/invalid results
        const total = Object.keys(results).length;
        const validCount = Object.values(results).filter(Boolean).length;
        const invalidCount = total - validCount;

        // Always show notification and modal
        const notificationMessage =
          invalidCount === 0
            ? `All ${total} report cards are valid and ready for release!`
            : `Found ${invalidCount} invalid report cards out of ${total}`;

        notifications.show({
          title: invalidCount === 0 ? 'Success' : 'Validation Complete',
          message: notificationMessage,
          color: invalidCount === 0 ? 'green' : 'yellow',
        });

        // Always open the modal to show results
        setValidationModalOpen(true);
      }
    } catch (error: any) {
      console.error('Error validating report cards:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to validate report cards',
        color: 'red',
      });
    } finally {
      setValidating(false);
    }
  };

  // PDF Styles
  const pdfStyles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 10,
      fontFamily: 'Helvetica',
    },
    header: {
      fontSize: 18,
      marginBottom: 15,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    pageNumber: {
      position: 'absolute',
      fontSize: 10,
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'grey',
    },
    subHeader: {
      fontSize: 12,
      marginBottom: 10,
      fontWeight: 'bold',
    },
    summary: {
      backgroundColor: '#fee2e2',
      padding: 10,
      marginBottom: 15,
      borderRadius: 5,
    },
    summaryText: {
      fontSize: 11,
      color: '#991b1b',
      fontWeight: 'bold',
    },
    studentSection: {
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 5,
    },
    studentHeader: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    studentHeaderRed: {
      backgroundColor: '#fee2e2',
    },
    studentHeaderGreen: {
      backgroundColor: '#dcfce7',
    },
    studentName: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    statusBadge: {
      fontSize: 9,
      padding: 4,
      borderRadius: 3,
    },
    statusBadgeRed: {
      backgroundColor: '#fecaca',
      color: '#991b1b',
    },
    statusBadgeGreen: {
      backgroundColor: '#bbf7d0',
      color: '#166534',
    },
    table: {
      marginTop: 5,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    tableHeader: {
      backgroundColor: '#f3f4f6',
      fontWeight: 'bold',
    },
    tableCell: {
      flex: 1,
      fontSize: 8,
    },
  });

  // Helper function to chunk students into pages
  // Estimates: ~2-3 students per page depending on number of subjects
  const chunkStudentsForPages = (students: [string, any][]) => {
    const pages: [string, any][][] = [];
    let currentPage: [string, any][] = [];
    let currentPageHeight = 0;

    // Rough estimates in points (A4 page is ~842 points tall, with 30pt padding = ~782pt usable)
    const HEADER_HEIGHT = 80; // Header + summary
    const STUDENT_HEADER_HEIGHT = 40;
    const TABLE_HEADER_HEIGHT = 25;
    const TABLE_ROW_HEIGHT = 20;
    const STUDENT_MARGIN = 15;
    const MAX_PAGE_HEIGHT = 700; // Leave some margin for safety

    students.forEach(([studentId, studentData]) => {
      const subjectCount = studentData.subjectMarks?.length || 0;
      const studentHeight =
        STUDENT_HEADER_HEIGHT +
        TABLE_HEADER_HEIGHT +
        subjectCount * TABLE_ROW_HEIGHT +
        STUDENT_MARGIN;

      // If this is the first page, account for header
      const pageHeaderHeight = pages.length === 0 && currentPage.length === 0 ? HEADER_HEIGHT : 0;

      if (
        currentPageHeight + studentHeight + pageHeaderHeight > MAX_PAGE_HEIGHT &&
        currentPage.length > 0
      ) {
        // Start a new page
        pages.push(currentPage);
        currentPage = [[studentId, studentData]];
        currentPageHeight = studentHeight;
      } else {
        currentPage.push([studentId, studentData]);
        currentPageHeight += studentHeight;
      }
    });

    // Add the last page if it has content
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  };

  // PDF Document Component

  const handleGeneratePDF = async () => {
    if (!selectedFilters.academicYear || !selectedFilters.classId) {
      notifications.show({
        title: 'Error',
        message: 'Please select academic year and class',
        color: 'red',
      });
      return;
    }

    setGeneratingPDF(true);
    try {
      // First, fetch the validation data
      const response = await AuthApi.post('/report-cards/validate', {
        academicYearId: selectedFilters.academicYear,
        // termId: selectedFilters.term,
        classId: selectedFilters.classId,
      });

      if (response.data?.success) {
        const results = response.data.data.results;

        // Update state for future reference
        setValidationResultspdf(results);

        // Count valid/invalid results
        const total = Object.keys(results).length;
        const validCount = Object.values(results).filter(Boolean).length;
        const invalidCount = total - validCount;

        // Generate PDF immediately using the fresh data from the response
        // Create a temporary PDF document component with the results
        const allStudents = Object.entries(results);
        const totalNeedingSecondSitting = Object.values(results).filter(
          (student: any) => student.needsSecondSitting,
        ).length;

        const selectedClass = classes?.find((c) => c.id === selectedFilters.classId);
        const className = selectedClass?.className || 'Unknown Class';

        const studentPages = chunkStudentsForPages(allStudents);

        const PDFDocumentWithData = () => (
          <Document>
            {studentPages.map((pageStudents, pageIndex) => (
              <Page key={`page-${pageIndex}`} size="A4" style={pdfStyles.page}>
                {/* Header on first page only */}
                {pageIndex === 0 && (
                  <>
                    <PDFText style={pdfStyles.header}>
                      Second Sitting Report - {className} -{' '}
                      {academicYears?.find((y) => y.id === selectedFilters.academicYear)?.name ||
                        ''}
                    </PDFText>
                    <View style={pdfStyles.summary}>
                      <PDFText style={pdfStyles.summaryText}>
                        Total Students: {allStudents.length} | Needs Second Sitting:{' '}
                        {totalNeedingSecondSitting}
                      </PDFText>
                    </View>
                  </>
                )}

                {/* Student records for this page */}
                {pageStudents.map(([studentId, studentData]: [string, any]) => (
                  <View key={studentId} style={pdfStyles.studentSection}>
                    <View
                      style={[
                        pdfStyles.studentHeader,
                        studentData.needsSecondSitting
                          ? pdfStyles.studentHeaderRed
                          : pdfStyles.studentHeaderGreen,
                      ]}
                    >
                      <PDFText style={pdfStyles.studentName}>{studentData.studentName}</PDFText>
                      <PDFText
                        style={[
                          pdfStyles.statusBadge,
                          studentData.needsSecondSitting
                            ? pdfStyles.statusBadgeRed
                            : pdfStyles.statusBadgeGreen,
                        ]}
                      >
                        {studentData.needsSecondSitting ? 'Needs Second Sitting' : 'Valid'}
                      </PDFText>
                    </View>

                    <View style={pdfStyles.table}>
                      <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                        <PDFText style={pdfStyles.tableCell}>Subject</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Marks</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Weight</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Percentage</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Status</PDFText>
                      </View>
                      {studentData.subjectMarks.map((subject: any, subIndex: number) => (
                        <View
                          key={`${studentId}-${subject.courseId}-${subIndex}`}
                          style={pdfStyles.tableRow}
                        >
                          <PDFText style={pdfStyles.tableCell}>{subject.courseName}</PDFText>
                          <PDFText style={pdfStyles.tableCell}>{subject.marks.toFixed(2)}</PDFText>
                          <PDFText style={pdfStyles.tableCell}>{subject.courseWeight}</PDFText>
                          <PDFText style={pdfStyles.tableCell}>
                            {subject.percentage.toFixed(2)}%
                          </PDFText>
                          <PDFText style={pdfStyles.tableCell}>
                            {subject.needsSecondSitting ? 'Needs Second Sitting' : 'Valid'}
                          </PDFText>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {/* Page number */}
                <PDFText
                  style={pdfStyles.pageNumber}
                  render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                  fixed
                />
              </Page>
            ))}
          </Document>
        );

        const blob = await pdf(<PDFDocumentWithData />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `second-sitting-report-${className}-${academicYears?.find((y) => y.id === selectedFilters.academicYear)?.name || ''}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        notifications.show({
          title: 'Success',
          message: 'PDF generated successfully',
          color: 'green',
        });
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to generate PDF',
        color: 'red',
      });
    } finally {
      setGeneratingPDF(false);
    }
  };
  const handleGenerateAllClassesPDF = async () => {
    if (!selectedFilters.academicYear) {
      notifications.show({
        title: 'Error',
        message: 'Please select academic year',
        color: 'red',
      });
      return;
    }
    setGeneratingAllClassesPDF(true);
    try {
      // First, fetch the validation data
      const response = await AuthApi.post('/report-cards/validate-all', {
        academicYearId: selectedFilters.academicYear,
      });

      if (response.data?.success) {
        const results = response.data.data.results;

        // Update state for future reference
        setValidationResultsAllClassespdf(results);

        // Count valid/invalid results
        const total = Object.keys(results).length;
        const validCount = Object.values(results).filter(Boolean).length;
        const invalidCount = total - validCount;

        // Generate PDF immediately using the fresh data from the response
        // Create a temporary PDF document component with the results
        const allStudents = Object.entries(results);
        const totalNeedingSecondSitting = Object.values(results).filter(
          (student: any) => student.needsSecondSitting,
        ).length;

        const selectedClass = classes?.find((c) => c.id === selectedFilters.classId);

        const studentPages = chunkStudentsForPages(allStudents);

        const PDFDocumentWithData = () => (
          <Document>
            {studentPages.map((pageStudents, pageIndex) => (
              <Page key={`page-${pageIndex}`} size="A4" style={pdfStyles.page}>
                {/* Header on first page only */}
                {pageIndex === 0 && (
                  <>
                    <PDFText style={pdfStyles.header}>
                      Second Sitting Report -{' '}
                      {academicYears?.find((y) => y.id === selectedFilters.academicYear)?.name ||
                        ''}
                    </PDFText>
                    <View style={pdfStyles.summary}>
                      <PDFText style={pdfStyles.summaryText}>
                        Total Students: {allStudents.length} | Needs Second Sitting:{' '}
                        {totalNeedingSecondSitting}
                      </PDFText>
                    </View>
                  </>
                )}

                {/* Student records for this page */}
                {pageStudents.map(([studentId, studentData]: [string, any]) => (
                  <View key={studentId} style={pdfStyles.studentSection}>
                    <View
                      style={[
                        pdfStyles.studentHeader,
                        studentData.needsSecondSitting
                          ? pdfStyles.studentHeaderRed
                          : pdfStyles.studentHeaderGreen,
                      ]}
                    >
                      <PDFText style={pdfStyles.studentName}>{studentData.studentName}</PDFText>
                      <PDFText style={pdfStyles.studentName}>{studentData.className}</PDFText>

                      <PDFText
                        style={[
                          pdfStyles.statusBadge,
                          studentData.needsSecondSitting
                            ? pdfStyles.statusBadgeRed
                            : pdfStyles.statusBadgeGreen,
                        ]}
                      >
                        {studentData.needsSecondSitting ? 'Needs Second Sitting' : 'Valid'}
                      </PDFText>
                    </View>

                    <View style={pdfStyles.table}>
                      <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
                        <PDFText style={pdfStyles.tableCell}>Subject</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Marks</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Weight</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Percentage</PDFText>
                        <PDFText style={pdfStyles.tableCell}>Status</PDFText>
                      </View>
                      {studentData.subjectMarks.map((subject: any, subIndex: number) => (
                        <View
                          key={`${studentId}-${subject.courseId}-${subIndex}`}
                          style={pdfStyles.tableRow}
                        >
                          <PDFText style={pdfStyles.tableCell}>{subject.courseName}</PDFText>
                          <PDFText style={pdfStyles.tableCell}>{subject.marks.toFixed(2)}</PDFText>
                          <PDFText style={pdfStyles.tableCell}>{subject.courseWeight}</PDFText>
                          <PDFText style={pdfStyles.tableCell}>
                            {subject.percentage.toFixed(2)}%
                          </PDFText>
                          <PDFText style={pdfStyles.tableCell}>
                            {subject.needsSecondSitting ? 'Needs Second Sitting' : 'Valid'}
                          </PDFText>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {/* Page number */}
                <PDFText
                  style={pdfStyles.pageNumber}
                  render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                  fixed
                />
              </Page>
            ))}
          </Document>
        );

        const blob = await pdf(<PDFDocumentWithData />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `second-sitting-report-${academicYears?.find((y) => y.id === selectedFilters.academicYear)?.name || ''}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        notifications.show({
          title: 'Success',
          message: 'PDF generated successfully',
          color: 'green',
        });
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to generate PDF',
        color: 'red',
      });
    } finally {
      setGeneratingAllClassesPDF(false);
    }
  };
  // Export as Excel (existing functionality)
  const onExportExcel = async () => {
    setShowExportModal(false);
    try {
      setLoadingExport(true);
      const params = new URLSearchParams({ academicYearId: selectedFilters.academicYear });
      if (selectedFilters.classId) params.append('classId', selectedFilters.classId);
      const res = await fetch(
        `${baseUrl}/api/v1/exporting/students/report-cards?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${getCookie('token')}` },
        },
      );
      if (!res.ok) {
        throw new Error('Server error while generating report cards');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const yearName =
        academicYears?.find((y) => y.id === selectedFilters.academicYear)?.name || 'Year';
      const clsName = classes?.find((c) => c.id === selectedFilters.classId)?.className;
      link.download = `ReportCards_${yearName}${clsName ? '_' + clsName : ''}.xlsx`;
      link.click();
      link.remove();
      notifications.show({
        title: 'Success',
        message: 'Report cards exported successfully as Excel',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'There has been an error in generating the excel, you may please reload!',
        color: 'red',
      });
    } finally {
      setLoadingExport(false);
    }
  };

  // Show PDF format selection modal
  const onExportPDF = () => {
    setShowExportModal(false);
    if (!selectedFilters.academicYear || !selectedFilters.classId || !terms || terms.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please ensure Academic Year, Class, and Terms are selected',
        color: 'red',
      });
      return;
    }
    setShowPdfFormatModal(true);
  };

  // Helper function to generate all student PDFs
  const generateAllStudentPdfs = async (): Promise<Array<{ student: Student; pdfBlob: Blob }>> => {
    if (!selectedFilters.academicYear || !selectedFilters.classId || !terms || terms.length === 0) {
      throw new Error('Missing required filters');
    }

    // Use selected term if provided, otherwise use first term
    const selectedTerm = selectedFilters.term
      ? terms.find((t) => t.id === selectedFilters.term)
      : terms[0];

    if (!selectedTerm) {
      throw new Error('Selected term not found');
    }

    // Fetch all students in the class for the term
    const studentsRes = await AuthApi.get('/student-class-term/class/term', {
      params: {
        classId: selectedFilters.classId,
        termId: selectedTerm.id,
      },
    });
    const allStudents: Student[] = studentsRes.data.data || [];

    if (allStudents.length === 0) {
      throw new Error('No students found for the selected class and term');
    }

    // Fetch terms for the academic year
    const termsData = terms;
    const pdfResults: Array<{ student: Student; pdfBlob: Blob }> = [];

    // Generate PDF for each student
    for (let i = 0; i < allStudents.length; i++) {
      const student = allStudents[i];
      try {
        // Fetch report card data
        const reportCardRes = await AuthApi.get('/academicMarks/report-card/by-student', {
          params: {
            academicYearId: selectedFilters.academicYear,
            studentId: student.id,
          },
        });
        const reportCardInfo: IReportCard = reportCardRes.data.data;

        // Fetch student class term data
        const studentClassTermRes = await AuthApi.get(`/student-class-term/student/${student.id}`);
        const studentClassTermData = studentClassTermRes.data.data;

        // Fetch DS marks
        let dsMarks: DsReport | null = null;
        try {
          const dsMarksRes = await AuthApi.get('/deductions/ds-marks/by-studentId', {
            params: {
              studentId: student.id,
              academicYearId: selectedFilters.academicYear,
            },
          });
          dsMarks = dsMarksRes.data.data;
        } catch (err) {
          // DS marks might not exist for all students, continue without them
          console.warn(`No DS marks for student ${student.id}`);
        }

        // Generate QR code
        const qrCode = await genReportCardQrCode({
          studentId: student.id,
          academicYearId: selectedFilters.academicYear,
          token: reportCardInfo.parents?.[0]?.reportCardToken || '',
        });
        console.log('reportCardInfo', reportCardInfo);
        console.log('termsData', termsData);
        console.log('dsMarks', dsMarks);
        console.log('studentClassTermData', studentClassTermData);
        // Generate PDF blob
        const pdfBlob = await pdf(
          <ReportCard
            qrCodeImageUrl={qrCode}
            viewAll={canRelease}
            info={reportCardInfo}
            terms={termsData}
            dsMarks={dsMarks || undefined}
            isPM={true}
            studentClassTermData={studentClassTermData}
          />,
        ).toBlob();

        pdfResults.push({ student, pdfBlob });

        // Update progress
        if ((i + 1) % 5 === 0 || i === allStudents.length - 1) {
          notifications.show({
            title: 'Progress',
            message: `Generated ${i + 1} of ${allStudents.length} report cards...`,
            color: 'blue',
          });
        }
      } catch (err) {
        console.error(`Error generating PDF for student ${student.id}:`, err);
        // Continue with other students even if one fails
      }
    }

    return pdfResults;
  };

  // Export as PDF - Zipped Folder
  const onExportPDFZip = async () => {
    setShowPdfFormatModal(false);
    try {
      setLoadingExport(true);
      notifications.show({
        title: 'Generating PDFs',
        message: 'Please wait while we generate report cards...',
        color: 'blue',
      });

      const pdfResults = await generateAllStudentPdfs();

      if (pdfResults.length === 0) {
        notifications.show({
          title: 'No PDFs Generated',
          message: 'No report cards could be generated',
          color: 'yellow',
        });
        return;
      }

      // Create zip file
      const zip = new JSZip();

      // Add each PDF to zip
      pdfResults.forEach(({ student, pdfBlob }) => {
        const fileName = `${student.firstName}-${student.lastName}-report-card.pdf`;
        zip.file(fileName, pdfBlob);
      });

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download zip file
      const yearName =
        academicYears?.find((y) => y.id === selectedFilters.academicYear)?.name || 'Year';
      const clsName = classes?.find((c) => c.id === selectedFilters.classId)?.className;
      const zipFileName = `ReportCards_${yearName}${clsName ? '_' + clsName : ''}.zip`;
      saveAs(zipBlob, zipFileName);

      notifications.show({
        title: 'Success',
        message: `Successfully exported ${pdfResults.length} report cards as PDF in zip folder`,
        color: 'green',
      });
    } catch (err: any) {
      console.error('Error exporting PDFs:', err);
      notifications.show({
        title: 'Error',
        message:
          err?.message || 'There has been an error in generating the PDFs. Please try again!',
        color: 'red',
      });
    } finally {
      setLoadingExport(false);
    }
  };

  // Export as PDF - Single File
  const onExportPDFSingle = async () => {
    setShowPdfFormatModal(false);
    try {
      setLoadingExport(true);
      notifications.show({
        title: 'Generating PDFs',
        message: 'Please wait while we generate and merge report cards...',
        color: 'blue',
      });

      const pdfResults = await generateAllStudentPdfs();

      if (pdfResults.length === 0) {
        notifications.show({
          title: 'No PDFs Generated',
          message: 'No report cards could be generated',
          color: 'yellow',
        });
        return;
      }

      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Copy pages from each PDF into the merged document
      for (const { student, pdfBlob } of pdfResults) {
        try {
          const pdfBytes = await pdfBlob.arrayBuffer();
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
        } catch (err) {
          console.error(`Error merging PDF for student ${student.id}:`, err);
          // Continue with other students even if one fails
        }
      }

      // Generate the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      // eslint-disable-next-line no-undef
      const mergedPdfBlob = new Blob([mergedPdfBytes as BlobPart], { type: 'application/pdf' });

      // Download the merged PDF
      const yearName =
        academicYears?.find((y) => y.id === selectedFilters.academicYear)?.name || 'Year';
      const clsName = classes?.find((c) => c.id === selectedFilters.classId)?.className;
      const pdfFileName = `ReportCards_${yearName}${clsName ? '_' + clsName : ''}.pdf`;
      saveAs(mergedPdfBlob, pdfFileName);

      notifications.show({
        title: 'Success',
        message: `Successfully exported ${pdfResults.length} report cards as a single PDF file`,
        color: 'green',
      });
    } catch (err: any) {
      console.error('Error exporting merged PDF:', err);
      notifications.show({
        title: 'Error',
        message:
          err?.message || 'There has been an error in generating the merged PDF. Please try again!',
        color: 'red',
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const FilterDropDown = ({
    placeholderText,
    data,
    filterKey,
  }: {
    placeholderText: string;
    data: any[];
    filterKey: keyof typeof selectedFilters;
  }) => {
    const displayValue = selectedFilters[filterKey] === 'All' ? '' : selectedFilters[filterKey];
    return (
      <Select
        data={data}
        placeholder={placeholderText}
        value={displayValue}
        onChange={(value) => setSelectedFilters((prev) => ({ ...prev, [filterKey]: value }))}
        className="w-full md:w-fit px-3 py-2 text-base text-black font-semibold  border-none outline-none"
      />
    );
  };

  const reportActions = [
    {
      label: 'All classes Second Sitting Report',
      onClick: handleGenerateAllClassesPDF,
      disabled: !selectedFilters.academicYear,
      loading: generatingAllClassesPDF,
      variant: 'filled',
      className: 'bg-mainPurple text-white',
    },
    {
      label: 'Export Report Cards',
      onClick: onExportReportCards,
      disabled: loadingExport,
      loading: loadingExport,
      variant: 'filled',
      className: 'bg-mainPurple text-white',
    },
    {
      label: 'Export Marks',
      onClick: onExportMarks,
      loading: loadingMarksExport,
      variant: 'filled',
      className: 'bg-mainPurple text-white',
    },
    {
      label: 'Export Performance',
      onClick: () => onReleaseReportExportPerformance('export'),
      variant: 'filled',
      className: 'bg-mainPurple text-white',
    },
    canRelease
      ? {
          label: 'Report Cards Releasing',
          onClick: () => onReleaseReportExportPerformance('release'),
          variant: 'filled',
          className: 'bg-mainPurple text-white',
        }
      : null,
    {
      label: 'Need Second Sitting',
      onClick: handleValidateReportCards,
      disabled: !selectedFilters.academicYear || !selectedFilters.classId,
      loading: validating,
      variant: 'outline',
    },
    {
      label: 'Second Sitting PDF',
      onClick: handleGeneratePDF,
      disabled: !selectedFilters.academicYear || !selectedFilters.classId,
      loading: generatingPDF,
      variant: 'filled',
      className: 'bg-mainPurple text-white',
    },
    canRelease
      ? {
          label: 'Release Reports',
          onClick: () => onReleaseReportExportPerformance('release'),
          variant: 'filled',
          className: 'bg-primary text-white',
        }
      : null,
  ].filter(Boolean) as ReportAction[];
  const primaryMobileAction = reportActions.find((action) => action.label === 'Release Reports');
  const mobileMenuActions = reportActions.filter((action) => action.label !== 'Release Reports');

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 text-sm">
      <MainModal
        isOpen={openReport.status}
        title={`Report Card for ${openReport.student?.firstName} ${openReport.student?.lastName}`}
        onClose={() =>
          setOpenReport({
            status: false,
            student: null,
            academicYearId: '',
          })
        }
        size="1000"
        closeOnClickOutside={false}
      >
        <ViewReportCard
          student={openReport.student}
          viewAll={canRelease}
          // academicYearId={selectedFilters.academicYear}
        />
      </MainModal>
      <MainModal
        isOpen={Boolean(openTranscript)}
        title={`Transcript for ${openTranscript?.firstName ?? ''} ${openTranscript?.lastName ?? ''}`}
        onClose={() => setOpenTranscript(null)}
        size="1000"
        closeOnClickOutside={false}
      >
        {openTranscript && <TranscriptPage studentId={openTranscript.id} showBackButton={false} />}
      </MainModal>
      {/* {_error && <div className="text-red-500 tex">{_error}</div>} */}
      <ExportOptionsDialog
        opened={showExportModal}
        onClose={() => setShowExportModal(false)}
        onSelect={(type) => {
          if (type === 'excel') {
            onExportExcel();
          } else if (type === 'pdf') {
            onExportPDF();
          }
        }}
        loading={loadingExport}
      />
      <Modal
        opened={showMarksExportModal}
        onClose={() => setShowMarksExportModal(false)}
        title="Export Marks"
        centered
      >
        <div className="space-y-4">
          <Text>Select export filters, layout and mark type for the workbook.</Text>
          <Select
            label="Academic Year"
            data={academicYears?.map((year) => ({ label: year.name, value: year.id })) || []}
            value={marksExportFilters.academicYear}
            onChange={(value) =>
              setMarksExportFilters((prev) => ({ ...prev, academicYear: value ?? '' }))
            }
            placeholder="Choose academic year"
            searchable
            required
          />
          <Select
            label="Class (optional)"
            data={
              marksExportClasses?.map((classItem) => ({
                label: classItem.className,
                value: classItem.id,
              })) || []
            }
            value={marksExportFilters.classId}
            onChange={(value) =>
              setMarksExportFilters((prev) => ({ ...prev, classId: value ?? '' }))
            }
            placeholder="All classes"
            searchable
            clearable
            disabled={!marksExportFilters.academicYear}
          />
          <Select
            label="Export Layout"
            data={[
              { label: 'Detailed layout', value: 'course' },
              { label: 'Term summary', value: 'term-summary' },
            ]}
            value={selectedMarksExportMode}
            onChange={(value) => setSelectedMarksExportMode(value as 'course' | 'term-summary')}
            placeholder="Choose export layout"
            required
          />
          <Select
            label="Mark Type"
            data={[
              { label: 'CAT', value: 'CAT' },
              { label: 'EXAM', value: 'EXAM' },
            ]}
            value={selectedMarkType}
            onChange={(value) => setSelectedMarkType(value as 'CAT' | 'EXAM' | '')}
            placeholder="Choose mark type"
          />
          <div className="flex justify-end gap-2">
            <Button variant="default" onClick={() => setShowMarksExportModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-mainPurple text-white"
              loading={loadingMarksExport}
              onClick={downloadMarksExcel}
              disabled={
                !marksExportFilters.academicYear || !selectedMarksExportMode || !selectedMarkType
              }
            >
              Download Excel
            </Button>
          </div>
        </div>
      </Modal>
      <PdfFormatDialog
        opened={showPdfFormatModal}
        onClose={() => setShowPdfFormatModal(false)}
        onSelect={(type) => {
          if (type === 'zip') {
            onExportPDFZip();
          } else if (type === 'single') {
            onExportPDFSingle();
          }
        }}
        loading={loadingExport}
      />
      <MainModal
        title={openRelease === 'release' ? 'Release Report Cards' : 'Export Performance'}
        tittleP="px-0"
        isOpen={openRelease}
        onClose={() => setOpenRelease(null)}
      >
        <ReportReleasingExportPerformance
          action={openRelease}
          // term={selectedFilters.term as any}
          // terms={terms as any}
          academicYear={academicYears?.find((year) => year.id === selectedFilters.academicYear)}
          setOpenRelease={setOpenRelease}
        />
      </MainModal>

      {/* Validation Results Modal */}
      <Modal
        opened={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        title="Second Sitting Report"
        size="xl"
        className="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-700 font-medium">Needs Second Sitting</div>
              <div className="text-2xl font-bold text-red-700">
                {validationResults
                  ? Object.values(validationResults).filter(
                      (student: any) => student.needsSecondSitting,
                    ).length
                  : 0}
              </div>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {validationResults &&
              Object.entries(validationResults).map(([studentId, studentData]: [string, any]) => (
                <div key={studentId} className="mb-6 border rounded-lg overflow-hidden">
                  <div
                    className={`p-3 ${studentData.needsSecondSitting ? 'bg-red-50' : 'bg-green-50'} border-b`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{studentData.studentName}</h3>
                      {studentData.needsSecondSitting ? (
                        <span className="px-2 py-1 text-sm rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                          <HiXCircle size={16} /> Needs Second Sitting
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                          <HiCheckCircle size={16} /> Valid
                        </span>
                      )}
                    </div>
                  </div>

                  <Table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Weight</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.subjectMarks.map((subject: any, index: number) => (
                        <tr key={`${studentId}-${subject.courseId}-${index}`}>
                          <td>{subject.courseName}</td>
                          <td>{subject.marks.toFixed(2)}</td>
                          <td>{subject.courseWeight}</td>
                          <td>{subject.percentage.toFixed(2)}%</td>
                          <td>
                            {subject.needsSecondSitting ? (
                              <span className="text-red-600 flex items-center gap-1">
                                <HiXCircle size={16} /> Needs Second Sitting
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-1">
                                <HiCheckCircle size={16} /> Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setValidationModalOpen(false)}
              className="bg-mainPurple text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col gap-3 mb-5">
        <p className="text-base font-semibold text-mainPurple">ESG Students Report Cards</p>

        <div className="hidden w-full flex-row flex-wrap justify-end gap-3 sm:flex">
          {reportActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              onClick={action.onClick}
              loading={action.loading}
              disabled={action.disabled}
              className={`rounded-md font-medium px-5 py-2 ${action.className ?? ''}`}
            >
              {action.label}
            </Button>
          ))}
        </div>

        <div className="flex w-full flex-col gap-2 sm:hidden">
          {primaryMobileAction && (
            <Button
              variant={primaryMobileAction.variant}
              onClick={primaryMobileAction.onClick}
              loading={primaryMobileAction.loading}
              disabled={primaryMobileAction.disabled}
              className={`w-full rounded-md font-medium ${primaryMobileAction.className ?? ''}`}
            >
              {primaryMobileAction.label}
            </Button>
          )}
          <Menu shadow="md" width="target" position="bottom-end">
            <Menu.Target>
              <Button variant="outline" className="w-full">
                More Actions
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {mobileMenuActions.map((action) => (
                <Menu.Item
                  key={action.label}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  rightSection={
                    action.loading ? <ClipLoader color="#392C7D" size={14} /> : undefined
                  }
                >
                  {action.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-y-3 gap-x-[30px] mb-5">
        <div className="relative w-full lg:w-[20rem]">
          <span className="absolute top-4 left-4">
            <CiSearch size={25} color="" />
          </span>
          <input
            name="search"
            className="w-full p-3 py-4 pl-12 text-base text-black placeholder:text-black rounded-full bg-[#005DE908] border-none outline-none"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-3 md:flex-row md:justify-end md:gap-x-2 lg:flex-grow">
          <FilterDropDown
            filterKey="academicYear"
            placeholderText="Select Academic Year"
            data={academicYears?.map((year) => ({ label: year.name, value: year.id })) as any}
          />
          {selectedFilters.academicYear && (
            <>
              <FilterDropDown
                filterKey="term"
                placeholderText="Select Term"
                data={
                  terms?.map((term) => ({
                    label: term.name.replace('_', ' '),
                    value: term.id,
                  })) as any
                }
              />
              <FilterDropDown
                filterKey="classId"
                placeholderText="Select Class"
                data={
                  classes?.map((classItem) => ({
                    label: classItem.className,
                    value: classItem.id,
                  })) || []
                }
              />
            </>
          )}
        </div>
      </div>
      <div className="w-full min-w-0 overflow-x-auto">
        <DataTable
          columns={columns}
          data={students ?? []}
          loading={loading}
          noDataMessage="No students found"
          paginationProps={{
            isPaginated: true,
            setPaginateOpts,
            paginateOpts,
          }}
          limit={30}
          minW="900px"
        />
      </div>
    </div>
  );
};

export default PMAdminReportCards;
