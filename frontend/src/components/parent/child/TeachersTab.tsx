'use client';
import { Button } from '@mantine/core';
import Link from 'next/link';
import { FiMail, FiPhone } from 'react-icons/fi';
import { useParentData } from '../api';
import { ClassContacts, Contact } from '../types';
import { EmptyBlock, ErrorBlock, LoadingBlock, Section, termLabel } from '../ui';

const ContactCard = ({ contact, title }: { contact: Contact; title?: string }) => (
  <div className="border rounded-lg p-4 bg-white flex flex-col gap-2">
    <div>
      <p className="text-xs uppercase text-gray-500">{title ?? termLabel(contact.role)}</p>
      <p className="font-medium text-primary">{contact.fullName}</p>
      {contact.courses.length > 0 && (
        <p className="text-sm text-gray-600">{contact.courses.join(', ')}</p>
      )}
    </div>
    <div className="flex flex-col gap-1 text-sm">
      {contact.email && (
        <a
          href={`mailto:${contact.email}`}
          className="flex flex-row items-center gap-2 text-blue-700 hover:underline"
        >
          <FiMail /> {contact.email}
        </a>
      )}
      {contact.phoneNumber && (
        <a
          href={`tel:${contact.phoneNumber}`}
          className="flex flex-row items-center gap-2 text-blue-700 hover:underline"
        >
          <FiPhone /> {contact.phoneNumber}
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          People responsible for your child{data.className ? ` in ${data.className}` : ''}.
        </p>
        <Button component={Link} href={`/parent/concerns?studentId=${studentId}`} color="#024F3A">
          Send a message to the school
        </Button>
      </div>

      <Section title="Class teacher">
        {data.classTeacher ? (
          <ContactCard contact={data.classTeacher} title="Class teacher" />
        ) : (
          <EmptyBlock>No class teacher has been assigned yet.</EmptyBlock>
        )}
      </Section>

      <Section title="Course teachers">
        {data.courseTeachers.length === 0 ? (
          <EmptyBlock>Course teachers have not been assigned yet.</EmptyBlock>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.courseTeachers.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        )}
      </Section>

      <Section title="School office">
        {data.schoolContacts.length === 0 ? (
          <EmptyBlock>No office contact available.</EmptyBlock>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.schoolContacts.map((c) => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
