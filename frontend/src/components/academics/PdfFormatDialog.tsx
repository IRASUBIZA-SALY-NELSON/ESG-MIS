import { Button, Modal, Group, Text, Stack } from '@mantine/core';
import { BsFolder, BsFilePdf } from 'react-icons/bs';

type PdfFormatType = 'zip' | 'single' | null;

interface PdfFormatDialogProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (type: PdfFormatType) => void;
  loading: boolean;
}

export function PdfFormatDialog({ opened, onClose, onSelect, loading }: PdfFormatDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Select PDF Format" centered>
      <Text mb="md">Choose how you want the report cards exported:</Text>
      <Group justify="center" gap="md" grow>
        <Button
          leftSection={<BsFolder size={20} />}
          onClick={() => onSelect('zip')}
          loading={loading}
          disabled={loading}
          variant="outline"
          color="blue"
          style={{ height: 'auto', padding: '20px' }}
        >
          <Stack gap={4} align="center">
            <Text fw={500}>Zipped Folder</Text>
            <Text size="xs" c="dimmed" ta="center">
              Individual PDFs in a zip file
            </Text>
          </Stack>
        </Button>
        <Button
          leftSection={<BsFilePdf size={20} />}
          onClick={() => onSelect('single')}
          loading={loading}
          disabled={loading}
          variant="outline"
          color="red"
          style={{ height: 'auto', padding: '20px' }}
        >
          <Stack gap={4} align="center">
            <Text fw={500}>Single PDF File</Text>
            <Text size="xs" c="dimmed" ta="center">
              All report cards in one PDF
            </Text>
          </Stack>
        </Button>
      </Group>
    </Modal>
  );
}
