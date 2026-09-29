'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AuthApi } from '@/utils/constants';
import { getCookie } from 'cookies-next';
import { notifications } from '@mantine/notifications';
import { Button, Textarea } from '@mantine/core';

interface Comment {
  id?: string;
  _id?: string;
  content: string;
  createdAt: string;
  createdBy?: any;
}

interface Props {
  appealId: string;
  initialComments?: Comment[];
}

export default function StudentAppealComments({ appealId, initialComments = [] }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await AuthApi.get('/auth/profile', {
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });
      const data = res.data?.data ?? res.data;
      setProfile(data);
    } catch (e) {
      // silent
    }
  };

  const fetchComments = async () => {
    if (!appealId) return;
    try {
      // load newest page (page 0) by default
      const res = await AuthApi.get(`/academicAppeals/${appealId}/comments`, {
        params: { page: 0, limit: 10 },
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });

      const raw = res.data?.data ?? res.data;
      let list: any[] = [];

      // common paginated shapes: { content: [], totalPages, page }, { data: [] }, or raw array
      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw?.data)) list = raw.data;
      else if (Array.isArray(raw?.comments)) list = raw.comments;
      else if (Array.isArray(raw?.content)) list = raw.content;
      else if (Array.isArray(raw?.items)) list = raw.items;

      setComments(list);
      setPage(0);

      // determine if there's more (simple heuristic)
      if (typeof raw?.totalPages === 'number') {
        setHasMore(raw.totalPages > 1);
      } else if (Array.isArray(list)) {
        setHasMore(list.length === 10); // if we got a full page, more may exist
      } else {
        setHasMore(false);
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
        params: { page: nextPage, limit: 10 },
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });

      const raw = res.data?.data ?? res.data;
      let list: any[] = [];
      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw?.data)) list = raw.data;
      else if (Array.isArray(raw?.comments)) list = raw.comments;
      else if (Array.isArray(raw?.content)) list = raw.content;
      else if (Array.isArray(raw?.items)) list = raw.items;

      if (list.length > 0) {
        setComments((cur) => [...list, ...cur]);
        setPage(nextPage);
      }

      // update hasMore
      if (typeof raw?.totalPages === 'number') {
        setHasMore(nextPage + 1 < raw.totalPages);
      } else {
        setHasMore(list.length === 10);
      }

      // preserve scroll position so the user stays where they were
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
    // ensure we have the freshest comments
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appealId]);

  useEffect(() => {
    // scroll to bottom on comments change
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [comments]);

  const isFromMe = (comment: Comment) => {
    const uid = profile?.userId ?? profile?.id ?? profile?._id;
    const createdId = comment.createdBy?.userId ?? comment.createdBy?.id ?? comment.createdBy?._id;
    if (uid && createdId) return String(uid) === String(createdId);
    // fallback to name match
    if (profile && comment.createdBy) {
      return (
        (profile.firstName &&
          profile.lastName &&
          profile.firstName === comment.createdBy.firstName &&
          profile.lastName === comment.createdBy.lastName) ||
        false
      );
    }
    return false;
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const dto = { content: newComment };
      const res = await AuthApi.post(`/academicAppeals/${appealId}/make-comments`, dto, {
        headers: { Authorization: `Bearer ${getCookie('token')}` },
      });

      // optimistic refresh: re-fetch comments
      await fetchComments();
      setNewComment('');
      notifications.show({ title: 'Sent', message: 'Comment sent to teacher', color: 'green' });
    } catch (err) {
      console.error('Failed to send comment', err);
      notifications.show({ title: 'Error', message: 'Failed to send comment', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Conversation</h2>

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
              return (
                <div key={key} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      fromMe
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <div className="text-sm mb-1">
                      {!fromMe && (
                        <span className="font-semibold mr-2">
                          {c.createdBy?.firstName} {c.createdBy?.lastName}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap">{c.content}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Textarea
          placeholder="Write a message to your teacher..."
          value={newComment}
          onChange={(e: any) => setNewComment(e.target.value)}
          minRows={2}
          className="flex-1"
        />
        <div className="flex items-end">
          <Button onClick={handleSend} loading={loading} disabled={!newComment.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
