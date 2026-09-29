import { Button, Modal, Group, Text } from '@mantine/core';
import { BsFileExcel, BsFilePdf } from 'react-icons/bs';

type ExportType = 'pdf' | 'excel' | null;

interface ExportOptionsDialogProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (type: ExportType) => void;
  loading: boolean;
}

export function ExportOptionsDialog({
  opened,
  onClose,
  onSelect,
  loading,
}: ExportOptionsDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Export Report Cards" centered>
      <Text mb="md">Select export format:</Text>
      <Group justify="center" gap="md">
        <Button
          leftSection={<BsFilePdf size={20} />}
          onClick={() => onSelect('pdf')}
          loading={loading}
          disabled={loading}
          variant="outline"
          color="red"
        >
          Export as PDF
        </Button>
        <Button
          leftSection={<BsFileExcel size={20} />}
          onClick={() => onSelect('excel')}
          loading={loading}
          disabled={loading}
          variant="outline"
          color="green"
        >
          Export as Excel
        </Button>
      </Group>
    </Modal>
  );
}
