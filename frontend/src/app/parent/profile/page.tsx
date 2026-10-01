'use client';
import { useParentData } from '@/components/parent/api';
import { ChildSummary } from '@/components/parent/types';
import { termLabel } from '@/components/parent/ui';
import { useUserContext } from '@/context/Usercontext';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { PasswordInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FormEvent, useEffect, useState } from 'react';

export default function ParentProfilePage() {
  const { profile, setProfile, setUser } = useUserContext();
  const children = useParentData<ChildSummary[]>('/parent-portal/children');
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phoneNumber: (profile as { phoneNumber?: string }).phoneNumber ?? '',
      });
    }
  }, [profile]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await AuthApi.patch(`/auth/profile/${profile.id}`, form);
      setProfile(res.data.data.person);
      setUser(res.data.data.user);
      notifications.show({ title: 'Saved', message: 'Details updated.', color: 'teal' });
    } catch (error) {
      notifications.show({ title: 'Could not save', message: getResError(error), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const pwError =
    pw.newPassword && pw.newPassword.length < 8
      ? 'At least 8 characters'
      : pw.confirm && pw.confirm !== pw.newPassword
        ? 'Passwords do not match'
        : null;

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pwError) return;
    setChanging(true);
    try {
      await AuthApi.put('/auth/change-password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      notifications.show({ title: 'Password changed', message: 'Use it next time you log in.', color: 'teal' });
    } catch (error) {
      notifications.show({
        title: 'Could not change password',
        message: getResError(error),
        color: 'red',
      });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold text-primary">Profile</h1>

      <form onSubmit={save} className="bg-white border rounded-2xl p-3 flex flex-col gap-3">
        <TextInput
          label="First name"
          required
          size="md"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.currentTarget.value })}
        />
        <TextInput
          label="Last name"
          required
          size="md"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.currentTarget.value })}
        />
        <TextInput label="Email" size="md" value={profile?.email ?? ''} disabled />
        <TextInput
          label="Phone"
          size="md"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.currentTarget.value })}
        />
        <button
          type="submit"
          disabled={saving}
          className="min-h-12 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>

      <div className="bg-white border rounded-2xl p-3">
        <p className="font-medium text-primary mb-2">Children</p>
        {children.data && children.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {children.data.map((c) => (
              <li key={c.id} className="flex justify-between text-sm">
                <span>{c.fullName}</span>
                <span className="text-gray-500">{c.className ?? termLabel(c.relationship)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No child linked yet.</p>
        )}
      </div>

      <form onSubmit={changePassword} className="bg-white border rounded-2xl p-3 flex flex-col gap-3">
        <p className="font-medium text-primary">Password</p>
        <PasswordInput
          label="Current"
          required
          size="md"
          value={pw.currentPassword}
          onChange={(e) => setPw({ ...pw, currentPassword: e.currentTarget.value })}
        />
        <PasswordInput
          label="New"
          required
          size="md"
          value={pw.newPassword}
          onChange={(e) => setPw({ ...pw, newPassword: e.currentTarget.value })}
          error={pw.newPassword && pw.newPassword.length < 8 ? 'At least 8 characters' : undefined}
        />
        <PasswordInput
          label="Confirm"
          required
          size="md"
          value={pw.confirm}
          onChange={(e) => setPw({ ...pw, confirm: e.currentTarget.value })}
          error={pw.confirm && pw.confirm !== pw.newPassword ? 'Passwords do not match' : undefined}
        />
        <button
          type="submit"
          disabled={changing || !!pwError || !pw.currentPassword}
          className="min-h-12 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
        >
          {changing ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </div>
  );
}
