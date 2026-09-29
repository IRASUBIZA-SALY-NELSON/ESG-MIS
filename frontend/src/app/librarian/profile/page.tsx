'use client';
import { Section } from '@/components/library/ui';
import { useUserContext } from '@/context/Usercontext';
import { AuthApi } from '@/utils/constants';
import { getResError } from '@/utils/fetch';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FormEvent, useEffect, useState } from 'react';

export default function LibrarianProfilePage() {
  const { profile, setProfile, setUser } = useUserContext();
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phoneNumber: (profile as any).phoneNumber ?? '',
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
      notifications.show({
        title: 'Profile updated',
        message: 'Your details were saved.',
        color: 'teal',
      });
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
      notifications.show({
        title: 'Password changed',
        message: 'Use the new password next time you log in.',
        color: 'teal',
      });
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
    <div className="flex flex-col gap-4 py-2 max-w-4xl">
      <h2 className="text-xl font-semibold text-primary">My profile</h2>

      <Section title="Personal details">
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            value={profile?.email ?? ''}
            disabled
            description="Contact the administrator to change it"
          />
          <TextInput
            label="Phone number"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.currentTarget.value })}
          />
          <div className="md:col-span-2">
            <Button type="submit" loading={saving} color="#024F3A">
              Save details
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Change password">
        <form
          onSubmit={changePassword}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start"
        >
          <PasswordInput
            label="Current password"
            required
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.currentTarget.value })}
          />
          <PasswordInput
            label="New password"
            required
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.currentTarget.value })}
            error={
              pw.newPassword && pw.newPassword.length < 8 ? 'At least 8 characters' : undefined
            }
          />
          <PasswordInput
            label="Confirm new password"
            required
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.currentTarget.value })}
            error={
              pw.confirm && pw.confirm !== pw.newPassword ? 'Passwords do not match' : undefined
            }
          />
          <div className="md:col-span-3">
            <Button
              type="submit"
              loading={changing}
              color="#024F3A"
              disabled={!!pwError || !pw.currentPassword}
            >
              Change password
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
