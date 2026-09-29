import { describe, expect, it } from 'vitest';
import {
  STUDENT_IMPORT_COLUMNS,
  columnMatches,
  missingRequiredHeaders,
  unknownHeaders,
} from './studentImportColumns';

describe('student import columns', () => {
  it('treats First Name and firstName as the same required column', () => {
    const first = STUDENT_IMPORT_COLUMNS.find((column) => column.header === 'First Name');
    expect(first).toBeTruthy();
    expect(columnMatches(first!, 'firstName')).toBe(true);
    expect(columnMatches(first!, 'First Name')).toBe(true);
  });

  it('reports missing required headers', () => {
    const missing = missingRequiredHeaders(['Email', 'Gender']);
    expect(missing.map((column) => column.header)).toEqual(['First Name', 'Last Name']);
  });

  it('ignores unknown extra columns without treating them as required', () => {
    expect(unknownHeaders(['First Name', 'Last Name', 'Email', 'Gender', 'Nickname'])).toEqual([
      'Nickname',
    ]);
  });
});
