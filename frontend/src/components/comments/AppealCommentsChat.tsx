'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AuthApi } from '@/utils/constants';
import { getCookie } from 'cookies-next';
import { notifications } from '@mantine/notifications';
import { Button, Textarea } from '@mantine/core';
import { Select } from '@mantine/core';

interface Comment {
  id?: string;
  _id?: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorType: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
  };
}

interface Props {
  appealId: string;
  initialComments?: Comment[];
  // if true, render a status selector the sender can optionally send with a comment
  enableStatusUpdate?: boolean;
}

export default function AppealCommentsChat({
  appealId,
  initialComments = [],
  enableStatusUpdate = false,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const storageKey = `appeal:${appealId}:lastSeen`;

  const fetchProfile = async () => {
    try {
      const res = await AuthApi.get('/auth/profile', {
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });
      const data = res.data?.data ?? res.data;
      setProfile(data);
    } catch (e) {
      // ignore
    }
  };

  const parseListFromRaw = (raw: any) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.comments)) return raw.comments;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.items)) return raw.items;
    return [];
  };

  const fetchComments = async () => {
    if (!appealId) return;
    try {
      const res = await AuthApi.get(`/academicAppeals/${appealId}/comments`, {
        params: { page: 0, limit: 5 },
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });

      const raw = res.data?.data ?? res.data;
      const list = parseListFromRaw(raw);
      console.log('Fetched comments:', list);
      setComments(list);
      setPage(0);

      if (typeof raw?.totalPages === 'number') {
        setHasMore(raw.totalPages > 1);
      } else {
        setHasMore(list.length === 10);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
      notifications.show({ title: 'Error', message: 'Failed to load comments', color: 'red' });
    }
  };

  const fetchOlder = async () => {
    if (!appealId) return;
    const nextPage = page + 1;
    try {
      const container = containerRef.current;
      const prevScrollHeight = container?.scrollHeight ?? 0;

      const res = await AuthApi.get(`/academicAppeals/${appealId}/comments`, {
        params: { page: nextPage, limit: 5 },
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });

      const raw = res.data?.data ?? res.data;
      const list = parseListFromRaw(raw);

      if (list.length > 0) {
        setComments((cur) => [...list, ...cur]);
        setPage(nextPage);
      }

      if (typeof raw?.totalPages === 'number') {
        setHasMore(nextPage + 1 < raw.totalPages);
      } else {
        setHasMore(list.length === 10);
      }

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = (container.scrollHeight ?? 0) - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error('Failed to fetch older comments', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to load older messages',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appealId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [comments]);

  const isFromMe = (comment: Comment) => {
    const uid = profile?.userId ?? profile?.id ?? profile?._id;
    const author = comment.authorName ?? '';

    // If the comment includes an explicit author id/name matching the profile id
    if (uid && String(author) === String(uid)) return true;

    // If authorName is a full name, compare to profile full name
    const profileFullName = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (profileFullName && String(author).toLowerCase() === profileFullName.toLowerCase())
      return true;

    // Fallback: check if authorName contains the profile first name
    if (
      profile?.firstName &&
      String(author).toLowerCase().includes(String(profile.firstName).toLowerCase())
    )
      return true;

    // If we still can't determine and the API provided an authorType, and the profile has a role,
    // use that as a last-resort heuristic as you suggested (note: this may mark other users of same role as "me").
    if (comment.authorType && profile?.role) {
      try {
        return String(comment.authorType).toLowerCase() === String(profile.role).toLowerCase();
      } catch (e) {
        // ignore and continue
      }
    }

    return false;
  };

  const getAuthorDisplay = (c: Comment) => {
    return (
      (c.authorName ?? `${c.createdBy?.firstName ?? ''} ${c.createdBy?.lastName ?? ''}`.trim()) ||
      'Unknown'
    );
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const dto: any = { content: newComment };
      if (enableStatusUpdate && selectedStatus) dto.resultingStatus = selectedStatus;

      await AuthApi.post(`/academicAppeals/${appealId}/make-comments`, dto, {
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });

      await fetchComments();
      setNewComment('');
      setSelectedStatus(null);
      const now = new Date().toISOString();
      try {
        localStorage.setItem(storageKey, now);
      } catch (e) {
        console.log('Error: ', e);
      }

      notifications.show({ title: 'Sent', message: 'Comment sent', color: 'green' });
    } catch (err) {
      console.error('Failed to send comment', err);
      notifications.show({ title: 'Error', message: 'Failed to send comment', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = () => {
    try {
      const lastSeen = localStorage.getItem(storageKey);
      if (!lastSeen) return comments.filter((c) => !isFromMe(c)).length;
      const last = new Date(lastSeen).getTime();
      return comments.filter((c) => !isFromMe(c) && new Date(c.createdAt).getTime() > last).length;
    } catch (e) {
      return comments.filter((c) => !isFromMe(c)).length;
    }
  };

  const markAsRead = () => {
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
      setComments((c) => [...c]);
    } catch (e) {
      console.log('Error: ', e);
    }
  };

  const unread = getUnreadCount();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Conversation{' '}
          {unread > 0 && (
            <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </h2>
        {unread > 0 && (
          <button className="text-sm text-primary underline" onClick={markAsRead}>
            Mark as read
          </button>
        )}
      </div>
      <div className="mb-2">
        {hasMore && (
          <div className="flex justify-center mb-2">
            <button
              onClick={fetchOlder}
              className="text-sm text-primary underline"
              aria-label="Load older messages"
            >
              Load older messages
            </button>
          </div>
        )}
        <div ref={containerRef} className="max-h-[50vh] overflow-y-auto space-y-3 px-2 py-1 mb-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No messages yet</p>
          ) : (
            comments.map((c) => {
              const fromMe = isFromMe(c);
              const key = c.id ?? c._id ?? `${c.createdAt}-${Math.random()}`;
              const author = getAuthorDisplay(c);
              const initials = getInitials(author);
              return (
                <div
                  key={key}
                  className={`flex items-end w-full ${fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* avatar for other users (left) */}
                  {!fromMe && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {initials}
                      </div>
                    </div>
                  )}

                  <div
                    className={`px-4 py-2 rounded-lg break-words ${
                      fromMe
                        ? 'bg-primary text-white rounded-bl-none rounded-tl-lg rounded-tr-lg'
                        : 'bg-gray-100 text-gray-900 rounded-br-none rounded-tr-lg rounded-bl-lg'
                    } max-w-[80%]`}
                    style={
                      fromMe
                        ? { boxShadow: '0 4px 12px rgba(59,130,246,0.12)' }
                        : { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }
                    }
                  >
                    <div className="text-sm mb-1 flex items-baseline justify-between">
                      {!fromMe && <span className="font-semibold mr-2 text-black">{author}</span>}
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{c.content}</div>
                  </div>

                  {/* small avatar on the right for own messages */}
                  {fromMe && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="w-6 h-6 rounded-full bg-primary/70 flex items-center justify-center text-xs font-semibold text-white">
                        {profile
                          ? profile.firstName
                            ? profile.firstName[0].toUpperCase()
                            : 'ME'
                          : 'ME'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Textarea
          placeholder="Write a message..."
          value={newComment}
          onChange={(e: any) => setNewComment(e.target.value)}
          minRows={2}
          className="flex-1"
        />

        <div className="flex flex-col gap-2 items-end">
          {/* {enableStatusUpdate && (
            <Select
              placeholder="Update status (optional)"
              data={[
                { value: 'REVIEWING', label: 'Reviewing' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
              value={selectedStatus}
              onChange={(v: any) => setSelectedStatus(v)}
              className="min-w-[200px]"
            />
          )} */}
          <Button onClick={handleSend} loading={loading} disabled={!newComment.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
