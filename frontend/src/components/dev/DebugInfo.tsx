'use client';

import React, { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { AuthApi } from '@/utils/constants';

export default function DebugInfo() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = getCookie('token') as string | undefined | null;
    setToken(t ?? null);

    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await AuthApi.get('/auth/profile');
        const data = res.data?.data ?? res.data;
        if (mounted) setProfile(data);
        // also log to console for easier server-side correlation
        // mask token in console (show first 8 chars)
        console.info('[DebugInfo] token:', t ? `${String(t).slice(0, 8)}...` : null);
        console.info('[DebugInfo] profile:', data);
      } catch (e) {
        console.warn('[DebugInfo] failed to fetch profile', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  if (!process.env.NEXT_PUBLIC_ENABLE_DEBUG) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded shadow p-3 text-xs text-gray-700 max-w-sm">
      <div className="font-semibold mb-1">Debug Info</div>
      <div className="truncate">
        <strong>Token:</strong> {token ? `${String(token).slice(0, 12)}...` : 'none'}
      </div>
      <div>
        <strong>Profile:</strong>{' '}
        {loading
          ? 'loading...'
          : profile
            ? (profile.username ?? profile.email ?? JSON.stringify(profile))
            : 'none'}
      </div>
    </div>
  );
}
