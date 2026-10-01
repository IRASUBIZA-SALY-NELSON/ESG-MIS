import { Button, Modal, Group, Text } from '@mantine/core';
import { BsFilePdf } from 'react-icons/bs';

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
    <Modal opened={opened} onClose={onClose} title="Export reports" centered>
      <Text mb="md">Both downloads are PDFs.</Text>
      <Group justify="center" gap="md">
        <Button
          leftSection={<BsFilePdf size={20} />}
          onClick={() => onSelect('pdf')}
          loading={loading}
          disabled={loading}
          variant="outline"
          color="dark"
        >
          Report cards
        </Button>
        <Button
          leftSection={<BsFilePdf size={20} />}
          onClick={() => onSelect('excel')}
          loading={loading}
          disabled={loading}
          variant="outline"
          color="dark"
        >
          Class ranking
        </Button>
      </Group>
    </Modal>
  );
}
