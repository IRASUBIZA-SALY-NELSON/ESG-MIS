import useGet from '@/hooks/useGet';
import { MultiSelect, Select } from '@mantine/core';
import React, { FC, useEffect } from 'react';

interface Props {
  label?: string;
  placeholder?: string;
  value?: string[];
  datasrc: string;
  accessorKey?: string;
  labelKey?: string;
  onChange?: (e: any) => void;
  disabled?: boolean;
  loading?: boolean;
  getLabel?: (data: any) => string;
}

const AsyncMultiSelect: FC<Props> = ({
  label,
  labelKey,
  accessorKey,
  placeholder,
  value,
  datasrc,
  onChange,
  disabled,
  loading: loadingProps,
  getLabel,
}) => {
  const [selected, setSelected] = React.useState<string[]>(value ?? []);
  const { data, loading } = useGet<any[]>(datasrc, { defaultData: [], swr: true });
  const [selectedData, setSelectedData] = React.useState<any[]>([]);

  useEffect(() => {
    const selectData = data?.map((item) => ({
      value: item[accessorKey ?? 'id']?.toString(),
      label: getLabel ? getLabel(item) : item[labelKey ?? 'name']?.toString(),
    }));
    setSelectedData(selectData ?? []);
    setSelected(value ?? []);
  }, [accessorKey, data, labelKey, value]);
  const loadingData = [{ value: 'loading', label: 'Loading...', disabled: true }];
  return (
    <MultiSelect
      label={label}
      placeholder={placeholder}
      variant="unstyled"
      px={6}
      searchable
      data={loading || loadingProps ? loadingData : selectedData}
      value={loading || loadingProps ? ['loading...'] : selected}
      nothingFoundMessage="No data found"
      onChange={(e) => {
        // const selected = data?.find((item) => item[accessorKey ?? 'id'] === e);

        setSelected(e!);
        onChange?.(e);
      }}
      disabled={disabled}
    />
  );
};

export default AsyncMultiSelect;
