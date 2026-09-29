'use client';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import {
  ActionIcon,
  Badge,
  Button,
  Checkbox,
  Modal,
  MultiSelect,
  PasswordInput,
  Select,
  Table,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FormEvent, useMemo, useState } from 'react';
import { FiEdit2, FiLink, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useParentData } from '../api';
import { ParentAccount } from '../types';
import { EmptyBlock, ErrorBlock, LoadingBlock, Section, StatusBadge, termLabel } from '../ui';

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentClazz?: { className?: string };
}

const RELATIONSHIPS = [
  { value: 'MOTHER', label: 'Mother' },
  { value: 'FATHER', label: 'Father' },
  { value: 'GUARDIAN', label: 'Guardian' },
];

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  nationalId: '',
  gender: 'FEMALE',
  password: '',
  relationship: 'GUARDIAN',
  studentIds: [] as string[],
  primaryContact: true,
};

const notifyError = (title: string, error: unknown) =>
  notifications.show({ title, message: getResError(error), color: 'red' });

export default function ParentsManager() {
  const parents = useParentData<ParentAccount[]>('/parents/all');
  const students = useParentData<StudentOption[]>('/students/all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ParentAccount | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    status: 'ACTIVE',
    password: '',
  });
  const [linking, setLinking] = useState<ParentAccount | null>(null);
  const [linkForm, setLinkForm] = useState({
    studentId: null as string | null,
    relationship: 'GUARDIAN',
    primaryContact: false,
  });
  const [deleting, setDeleting] = useState<ParentAccount | null>(null);

  const studentOptions = useMemo(
    () =>
      (students.data ?? []).map((s) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName}${s.currentClazz?.className ? ` · ${s.currentClazz.className}` : ''}`,
      })),
    [students.data],
  );

  const filtered = (parents.data ?? []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.phoneNumber ?? '').includes(q) ||
      p.children.some((c) => c.fullName.toLowerCase().includes(q))
    );
  });

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (!form.password) delete body.password;
      await AuthApi.post('/parents/create', body);
      notifications.show({
        title: 'Parent account created',
        message: form.password
          ? `${form.email} can now log in.`
          : `${form.email} can now log in with the default password Esg@2026.`,
        color: 'teal',
      });
      setCreateOpen(false);
      setForm(emptyForm);
      parents.refresh();
    } catch (error) {
      notifyError('Could not create parent', error);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p: ParentAccount) => {
    setEditing(p);
    setEditForm({
      firstName: p.firstName,
      lastName: p.lastName,
      phoneNumber: p.phoneNumber ?? '',
      status: p.status ?? 'ACTIVE',
      password: '',
    });
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...editForm };
      if (!editForm.password) delete body.password;
      await AuthApi.put(`/parents/update/${editing.id}`, body);
      notifications.show({ title: 'Parent updated', message: editing.email, color: 'teal' });
      setEditing(null);
      parents.refresh();
    } catch (error) {
      notifyError('Could not update parent', error);
    } finally {
      setSaving(false);
    }
  };

  const saveLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!linking || !linkForm.studentId) return;
    setSaving(true);
    try {
      await AuthApi.post(`/parents/${linking.id}/link`, linkForm);
      notifications.show({ title: 'Student linked', message: linking.fullName, color: 'teal' });
      setLinking(null);
      setLinkForm({ studentId: null, relationship: 'GUARDIAN', primaryContact: false });
      parents.refresh();
    } catch (error) {
      notifyError('Could not link student', error);
    } finally {
      setSaving(false);
    }
  };

  const unlink = async (parent: ParentAccount, studentId: string, studentName: string) => {
    if (
      !window.confirm(
        `Unlink ${studentName} from ${parent.fullName}? The parent will lose access to this student.`,
      )
    ) {
      return;
    }
    try {
      await AuthApi.delete(`/parents/${parent.id}/link/${studentId}`);
      parents.refresh();
    } catch (error) {
      notifyError('Could not unlink student', error);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await AuthApi.delete(`/parents/delete/${deleting.id}`);
      notifications.show({ title: 'Parent deleted', message: deleting.email, color: 'teal' });
      setDeleting(null);
      parents.refresh();
    } catch (error) {
      notifyError('Could not delete parent', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary">Parent accounts</h2>
          <p className="text-sm text-gray-600">
            Create parent logins and link them to students. A parent only sees the students linked
            here.
          </p>
        </div>
        <Button leftSection={<FiPlus />} color="#024F3A" onClick={() => setCreateOpen(true)}>
          New parent
        </Button>
      </div>

      <Section
        action={
          <TextInput
            placeholder="Search by name, email, phone or child"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="w-full md:w-80"
          />
        }
        title={parents.data ? `${parents.data.length} parent account(s)` : 'Parents'}
      >
        {parents.loading && <LoadingBlock />}
        {parents.error && <ErrorBlock message={parents.error} onRetry={() => parents.refresh()} />}
        {parents.data && filtered.length === 0 && <EmptyBlock>No parent matches.</EmptyBlock>}
        {filtered.length > 0 && (
          <Table.ScrollContainer minWidth={820}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Parent</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Children</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th className="text-right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td className="font-medium">{p.fullName}</Table.Td>
                    <Table.Td>
                      <p>{p.email}</p>
                      <p className="text-xs text-gray-500">{p.phoneNumber ?? '—'}</p>
                    </Table.Td>
                    <Table.Td>
                      <div className="flex flex-row flex-wrap gap-1">
                        {p.children.length === 0 && (
                          <span className="text-xs text-gray-400">None linked</span>
                        )}
                        {p.children.map((c) => (
                          <Badge
                            key={c.id}
                            variant="light"
                            color={c.primaryContact ? 'indigo' : 'gray'}
                            radius="sm"
                            rightSection={
                              <FiX
                                className="cursor-pointer"
                                aria-label={`Unlink ${c.fullName}`}
                                onClick={() => unlink(p, c.id, c.fullName)}
                              />
                            }
                          >
                            {c.fullName} · {termLabel(c.relationship)}
                          </Badge>
                        ))}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge status={p.status} />
                    </Table.Td>
                    <Table.Td>
                      <div className="flex flex-row gap-1 justify-end">
                        <Tooltip label="Link a student">
                          <ActionIcon variant="subtle" color="blue" onClick={() => setLinking(p)}>
                            <FiLink />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon variant="subtle" color="dark" onClick={() => openEdit(p)}>
                            <FiEdit2 />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon variant="subtle" color="red" onClick={() => setDeleting(p)}>
                            <FiTrash2 />
                          </ActionIcon>
                        </Tooltip>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Section>

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New parent account"
        size="lg"
      >
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            label="First name"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.currentTarget.value })}
          />
          <TextInput
            label="Last name"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.currentTarget.value })}
          />
          <TextInput
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
          />
          <TextInput
            label="Phone number"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.currentTarget.value })}
          />
          <TextInput
            label="National ID"
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.currentTarget.value })}
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(v) => setForm({ ...form, gender: v ?? 'FEMALE' })}
            data={[
              { value: 'FEMALE', label: 'Female' },
              { value: 'MALE', label: 'Male' },
            ]}
            allowDeselect={false}
          />
          <MultiSelect
            label="Children"
            className="md:col-span-2"
            searchable
            placeholder={students.loading ? 'Loading students…' : 'Select one or more students'}
            data={studentOptions}
            value={form.studentIds}
            onChange={(v) => setForm({ ...form, studentIds: v })}
          />
          <Select
            label="Relationship"
            value={form.relationship}
            onChange={(v) => setForm({ ...form, relationship: v ?? 'GUARDIAN' })}
            data={RELATIONSHIPS}
            allowDeselect={false}
          />
          <PasswordInput
            label="Password"
            description="Leave empty to use the default password Esg@2026"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
            error={form.password && form.password.length < 8 ? 'At least 8 characters' : undefined}
          />
          <Checkbox
            className="md:col-span-2"
            label="Primary contact for the selected children"
            checked={form.primaryContact}
            onChange={(e) => setForm({ ...form, primaryContact: e.currentTarget.checked })}
          />
          <div className="md:col-span-2 flex flex-row justify-end gap-2">
            <Button variant="default" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} color="#024F3A">
              Create account
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        opened={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.fullName ?? ''}`}
      >
        <form onSubmit={saveEdit} className="flex flex-col gap-3">
          <TextInput
            label="First name"
            required
            value={editForm.firstName}
            onChange={(e) => setEditForm({ ...editForm, firstName: e.currentTarget.value })}
          />
          <TextInput
            label="Last name"
            required
            value={editForm.lastName}
            onChange={(e) => setEditForm({ ...editForm, lastName: e.currentTarget.value })}
          />
          <TextInput
            label="Phone number"
            value={editForm.phoneNumber}
            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.currentTarget.value })}
          />
          <Select
            label="Status"
            value={editForm.status}
            onChange={(v) => setEditForm({ ...editForm, status: v ?? 'ACTIVE' })}
            data={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
            allowDeselect={false}
          />
          <PasswordInput
            label="Reset password"
            description="Leave empty to keep the current password"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.currentTarget.value })}
          />
          <div className="flex flex-row justify-end gap-2">
            <Button variant="default" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} color="#024F3A">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        opened={!!linking}
        onClose={() => setLinking(null)}
        title={`Link a student to ${linking?.fullName ?? ''}`}
      >
        <form onSubmit={saveLink} className="flex flex-col gap-3">
          <Select
            label="Student"
            searchable
            required
            data={studentOptions.filter((o) => !linking?.children.some((c) => c.id === o.value))}
            value={linkForm.studentId}
            onChange={(v) => setLinkForm({ ...linkForm, studentId: v })}
          />
          <Select
            label="Relationship"
            value={linkForm.relationship}
            onChange={(v) => setLinkForm({ ...linkForm, relationship: v ?? 'GUARDIAN' })}
            data={RELATIONSHIPS}
            allowDeselect={false}
          />
          <Checkbox
            label="Primary contact"
            checked={linkForm.primaryContact}
            onChange={(e) => setLinkForm({ ...linkForm, primaryContact: e.currentTarget.checked })}
          />
          <div className="flex flex-row justify-end gap-2">
            <Button variant="default" onClick={() => setLinking(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} color="#024F3A" disabled={!linkForm.studentId}>
              Link student
            </Button>
          </div>
        </form>
      </Modal>

      <Modal opened={!!deleting} onClose={() => setDeleting(null)} title="Delete parent account">
        <p className="text-sm">
          Delete <b>{deleting?.fullName}</b> ({deleting?.email})? Their links to students and their
          messages will be removed. Students are not affected.
        </p>
        <div className="flex flex-row justify-end gap-2 mt-4">
          <Button variant="default" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button color="red" loading={saving} onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
