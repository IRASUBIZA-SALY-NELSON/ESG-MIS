'use client';
import Link from 'next/link';
import { FiMail, FiPhone } from 'react-icons/fi';
import { useParentData } from '../api';
import { ClassContacts, Contact } from '../types';
import { EmptyBlock, ErrorBlock, LoadingBlock, termLabel } from '../ui';

const ContactCard = ({ contact, title }: { contact: Contact; title?: string }) => (
  <div className="border rounded-2xl p-3 bg-white flex flex-col gap-2">
    <div>
      <p className="text-xs text-gray-500">{title ?? termLabel(contact.role)}</p>
      <p className="font-medium text-primary">{contact.fullName}</p>
      {contact.courses.length > 0 && (
        <p className="text-sm text-gray-600">{contact.courses.join(', ')}</p>
      )}
    </div>
    <div className="flex gap-2">
      {contact.phoneNumber && (
        <a
          href={`tel:${contact.phoneNumber}`}
          className="flex-1 min-h-11 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          <FiPhone /> Call
        </a>
      )}
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="flex-1 min-h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2"
        >
          <FiMail /> Email
        </a>
      )}
    </div>
  </div>
);

export default function TeachersTab({ studentId }: { studentId: string }) {
  const { data, loading, error, refresh } = useParentData<ClassContacts>(
    `/parent-portal/children/${studentId}/teachers`,
  );
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} onRetry={() => refresh()} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/parent/concerns?studentId=${studentId}`}
        className="min-h-12 rounded-xl bg-primary text-white font-medium flex items-center justify-center"
      >
        Message the school
      </Link>

      {data.classTeacher ? (
        <ContactCard contact={data.classTeacher} title="Class teacher" />
      ) : (
        <EmptyBlock>No class teacher yet.</EmptyBlock>
      )}

      {data.courseTeachers.map((c) => (
        <ContactCard key={c.id} contact={c} />
      ))}

      {data.schoolContacts.map((c) => (
        <ContactCard key={c.id} contact={c} />
      ))}
    </div>
  );
}
