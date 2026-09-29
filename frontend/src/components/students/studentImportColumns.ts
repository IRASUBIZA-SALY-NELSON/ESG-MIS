export type StudentImportColumn = {
  header: string;
  required?: boolean;
  example: string;
  note: string;
  group: 'student' | 'class' | 'father' | 'mother' | 'guardian';
  aliases?: string[];
};

export const STUDENT_IMPORT_COLUMNS: StudentImportColumn[] = [
  {
    header: 'First Name',
    required: true,
    example: 'Keza',
    note: 'Student given name',
    group: 'student',
    aliases: ['firstName', 'firstname', 'givenName'],
  },
  {
    header: 'Last Name',
    required: true,
    example: 'Uwase',
    note: 'Student family name',
    group: 'student',
    aliases: ['lastName', 'lastname', 'surname', 'familyName'],
  },
  {
    header: 'Email',
    required: true,
    example: 'keza.uwase@esg.test',
    note: 'Must be unique. Becomes the login username',
    group: 'student',
    aliases: ['studentEmail', 'student email'],
  },
  {
    header: 'Gender',
    required: true,
    example: 'Female',
    note: 'Male or Female',
    group: 'student',
    aliases: ['sex'],
  },
  {
    header: 'Phone',
    example: '0788000111',
    note: 'Student phone, if they have one',
    group: 'student',
    aliases: ['phoneNumber', 'phone number', 'tel'],
  },
  {
    header: 'National ID',
    example: '1199870123456789',
    note: 'Optional national ID number',
    group: 'student',
    aliases: ['nationalId', 'nationalid', 'nid'],
  },
  {
    header: 'Class Code',
    example: 'S4PCM',
    note: 'Existing class code or class name, e.g. S4PCM',
    group: 'class',
    aliases: ['class', 'classCode', 'className', 'currentClass'],
  },
  {
    header: 'Father Name',
    example: 'Jean Bosco',
    note: 'Creates or links a parent account',
    group: 'father',
    aliases: ['fatherName', "father's name", 'fathersName'],
  },
  {
    header: 'Father Email',
    example: 'jean.bosco@esg.test',
    note: 'Reuse this email if the father already exists',
    group: 'father',
    aliases: ['fatherEmail', "father's email"],
  },
  {
    header: 'Father Phone',
    example: '0788000222',
    note: 'Optional',
    group: 'father',
    aliases: ['fatherPhone', 'fatherPhoneNumber'],
  },
  {
    header: 'Father National ID',
    example: '',
    note: 'Optional',
    group: 'father',
    aliases: ['fatherNationalId'],
  },
  {
    header: 'Mother Name',
    example: 'Alice Mukamana',
    note: 'Creates or links a parent account',
    group: 'mother',
    aliases: ['motherName', "mother's name"],
  },
  {
    header: 'Mother Email',
    example: 'alice.mukamana@esg.test',
    note: 'Reuse this email if the mother already exists',
    group: 'mother',
    aliases: ['motherEmail'],
  },
  {
    header: 'Mother Phone',
    example: '0788000333',
    note: 'Optional',
    group: 'mother',
    aliases: ['motherPhone', 'motherPhoneNumber'],
  },
  {
    header: 'Mother National ID',
    example: '',
    note: 'Optional',
    group: 'mother',
    aliases: ['motherNationalId'],
  },
  {
    header: 'Guardian Name',
    example: '',
    note: 'Use when the student is not with father or mother',
    group: 'guardian',
    aliases: ['guardianName'],
  },
  {
    header: 'Guardian Email',
    example: '',
    note: 'Optional',
    group: 'guardian',
    aliases: ['guardianEmail'],
  },
  {
    header: 'Guardian Phone',
    example: '',
    note: 'Optional',
    group: 'guardian',
    aliases: ['guardianPhone', 'guardianPhoneNumber'],
  },
  {
    header: 'Guardian National ID',
    example: '',
    note: 'Optional',
    group: 'guardian',
    aliases: ['guardianNationalId'],
  },
  {
    header: 'Guardian Gender',
    example: 'Male',
    note: 'Male or Female',
    group: 'guardian',
    aliases: ['guardianGender'],
  },
];

export function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function columnMatches(column: StudentImportColumn, header: string) {
  const needle = normalizeHeader(header);
  return [column.header, ...(column.aliases ?? [])].some((alias) => normalizeHeader(alias) === needle);
}

export function missingRequiredHeaders(fileHeaders: string[]) {
  return STUDENT_IMPORT_COLUMNS.filter(
    (column) => column.required && !fileHeaders.some((header) => columnMatches(column, header)),
  );
}

export function unknownHeaders(fileHeaders: string[]) {
  return fileHeaders.filter(
    (header) => !STUDENT_IMPORT_COLUMNS.some((column) => columnMatches(column, header)),
  );
}
