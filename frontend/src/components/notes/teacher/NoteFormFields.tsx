'use client';
import { Autocomplete, Checkbox, Select, SimpleGrid, Switch, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { plural, termName } from '../helpers';
import { TeachingContext } from '../types';

export interface NoteFormValues {
  courseId: string | null;
  classIds: string[];
  termId: string | null;
  topic: string;
  description: string;
  readBy: string | null;
  allowDownload: boolean;
  pinned: boolean;
}

export const emptyForm = (context?: TeachingContext, courseId?: string | null): NoteFormValues => {
  const course =
    context?.courses.find((c) => c.id === courseId) ??
    (context?.courses.length === 1 ? context.courses[0] : undefined);
  return {
    courseId: course?.id ?? null,
    classIds: course?.classes.map((c) => c.id) ?? [],
    termId: context?.currentTermId ?? null,
    topic: '',
    description: '',
    readBy: null,
    allowDownload: true,
    pinned: false,
  };
};

export const audienceSize = (context: TeachingContext | undefined, values: NoteFormValues) =>
  context?.courses
    .find((c) => c.id === values.courseId)
    ?.classes.filter((c) => values.classIds.includes(c.id))
    .reduce((sum, c) => sum + c.students, 0) ?? 0;

/** Course, classes, term, topic, description, read-by and access switches — shared by upload and edit. */
export default function NoteFormFields({
  context,
  values,
  onChange,
  topics,
  showDescription = true,
}: {
  context: TeachingContext;
  values: NoteFormValues;
  onChange: (v: NoteFormValues) => void;
  topics: string[];
  showDescription?: boolean;
}) {
  const set = (patch: Partial<NoteFormValues>) => onChange({ ...values, ...patch });
  const course = context.courses.find((c) => c.id === values.courseId);

  return (
    <div className="flex flex-col gap-3">
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Select
          label="Course"
          placeholder="Choose a course"
          required
          data={context.courses.map((c) => ({ value: c.id, label: c.name }))}
          value={values.courseId}
          onChange={(v) => {
            const next = context.courses.find((c) => c.id === v);
            set({ courseId: v, classIds: next?.classes.map((c) => c.id) ?? [] });
          }}
          allowDeselect={false}
          searchable
          nothingFoundMessage="No course"
        />
        <Select
          label="Term"
          data={context.terms.map((t) => ({
            value: t.id,
            label: `${termName(t.name)}${t.academicYear ? ` · ${t.academicYear}` : ''}${t.current ? ' (current)' : ''}`,
          }))}
          value={values.termId}
          onChange={(v) => set({ termId: v })}
          allowDeselect={false}
        />
      </SimpleGrid>

      <div>
        <div className="text-sm font-medium mb-1">
          Share with <span className="text-red-500">*</span>
        </div>
        {!course ? (
          <div className="text-sm text-gray-500 border rounded-md px-3 py-2 bg-gray-50">
            Choose a course to see the classes you teach it to.
          </div>
        ) : (
          <div className="flex flex-row flex-wrap gap-2">
            {course.classes.map((c) => {
              const checked = values.classIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex flex-row items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                    checked ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onChange={(e) =>
                      set({
                        classIds: e.currentTarget.checked
                          ? [...values.classIds, c.id]
                          : values.classIds.filter((id) => id !== c.id),
                      })
                    }
                    color="#024F3A"
                  />
                  <span className="text-sm font-medium text-primary">{c.name}</span>
                  <span className="text-xs text-gray-500">{plural(c.students, 'student')}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Autocomplete
          label="Unit / topic"
          placeholder="e.g. Unit 3 — Derivatives"
          data={topics}
          value={values.topic}
          onChange={(v) => set({ topic: v })}
        />
        <DateInput
          label="Study by (optional)"
          description="Students see this date and a reminder when it gets close"
          placeholder="No deadline"
          value={values.readBy}
          onChange={(v) => set({ readBy: v })}
          clearable
          valueFormat="DD MMM YYYY"
        />
      </SimpleGrid>

      {showDescription && (
        <Textarea
          label="Message to students (optional)"
          placeholder="What is in these notes and what should students do with them?"
          autosize
          minRows={2}
          maxRows={5}
          maxLength={4000}
          value={values.description}
          onChange={(e) => set({ description: e.currentTarget.value })}
        />
      )}

      <div className="flex flex-row flex-wrap gap-x-8 gap-y-2">
        <Switch
          label="Students can download"
          description="Off = view-only in the browser"
          checked={values.allowDownload}
          onChange={(e) => set({ allowDownload: e.currentTarget.checked })}
          color="teal"
        />
        <Switch
          label="Pin to the top"
          description="Shown first on students' notes page"
          checked={values.pinned}
          onChange={(e) => set({ pinned: e.currentTarget.checked })}
          color="teal"
        />
      </div>
    </div>
  );
}

export const formToMeta = (v: NoteFormValues) => ({
  courseId: v.courseId,
  classIds: v.classIds,
  termId: v.termId,
  topic: v.topic.trim() || null,
  description: v.description.trim() || null,
  readBy: v.readBy || null,
  allowDownload: v.allowDownload,
  pinned: v.pinned,
});

export const PublishHint = ({ students, classes }: { students: number; classes: string[] }) => (
  <span className="text-sm text-gray-600">
    {classes.length ? (
      <>
        Visible to <b className="text-primary">{plural(students, 'student')}</b> in{' '}
        {classes.join(', ')}
      </>
    ) : (
      <span className="text-orange-600">Choose at least one class</span>
    )}
  </span>
);
