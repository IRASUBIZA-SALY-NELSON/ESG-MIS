'use client';
import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { BiImport } from 'react-icons/bi';
import AsyncSelect from '../core/selects/AsyncSelect';
import MainModal from '../core/modals/modal';
import ImportForm from '../core/data-table/ImportForm';
import PreviewDsExcel from '@/components/staff/ds/ExcelImportPreviewer';
const ShuffleClass = ({ data, onClose }: any) => {
  const [acaYearId, setAcadYearId] = useState<string | null>(null);
  const [termId, setTermId] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = React.useState({
    termId: '',
    studentsExcel: '',
  });
  const onImport = () => {
    setShowImport(true);
  };

  return (
    <form className=" w-full flex p-5 flex-col gap-y-3">
      <AsyncSelect
        datasrc={`/academic-years/all`}
        variant="default"
        onChange={(e) => setAcadYearId(e)}
        value={acaYearId ?? ''}
        placeholder="Select academic year"
        useAuth={false}
      />
      {acaYearId && (
        <AsyncSelect
          datasrc={`/terms/all/academic-year/${acaYearId}`}
          variant="default"
          onChange={(e) => setTermId(e)}
          value={termId ?? ''}
          placeholder="Select term"
        />
      )}
      {error.termId && <p className="text-red-500 text-sm">{error.termId}</p>}
      <Button className=" gap-x-2 bg-mainPurple" onClick={onImport} variant="filled">
        <BiImport size={20} className="mr-2" />
        Import
      </Button>
      <MainModal
        size={'xl'}
        isOpen={showImport}
        title="Import Students"
        onClose={() => setShowImport(false)}
        closeOnClickOutside={false}
      >
        <ImportForm
          portal={`reshuffle-classes?termId=${termId}`}
          formatUrl="https://docs.google.com/spreadsheets/d/1BNjkMsQ6wc59ChMY9HQDztMKZk8u_YG2gxDDpvn5vyk/edit?usp=sharing"
          onClose={() => setShowImport(false)}
          renderPreview={(data) => <PreviewDsExcel data={data} />}
        />
      </MainModal>
      <Button
        variant="filled"
        className=" mt-4"
        mx={'auto'}
        type="submit"
        loading={loading}
        disabled={loading}
      >
        Reshuffle
      </Button>
    </form>
  );
};
export default ShuffleClass;
