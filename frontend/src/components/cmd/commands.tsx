import React from 'react';
import { directories, rot19, rot19Decrypt } from './utils';
import { getAcademicYears, getCoursesForLoggedIn, getTermsInYear } from '@/utils/funcs';
import { parseIntoObject, parseIntoObjectTerm } from '@/utils/funcs/func1';
import CMDTable from './components/Table';
import { AuthApi } from '@/utils/constants';

const commands = [
  {
    name: 'clear',
    description:
      'Clear the clutter from your terminal and gain a clear view of your digital domain. 🌪️✨',
    usage: 'clear',
    example: 'clear',
  },
  {
    name: 'exit',
    description: 'Return to your starting point.',
    usage: 'exit',
    example: 'exit',
  },
  {
    name: 'ls',
    description: 'Navigate through your files and directories, revealing hidden treasures. 🔍📜',
    usage: 'ls',
    example: 'ls',
  },
  {
    name: 'thisYear',
    description: 'Summon the knowledge of the current academic year. 🌌📅',
    usage: 'thisYear',
    example: 'thisYear',
  },
  {
    name: 'thisTerm',
    description: 'Unlock the secrets of the current academic term. 📚🔮',
    usage: 'thisTerm',
    example: 'thisTerm',
  },
  {
    name: 'appeal',
    description: 'Reclaim academic or disciplinary marks. 🕵️‍♂️📄',
    usage: 'appeal [options]',
    example: 'appeal   -a -m "Request for academic appeal" -c "123"',
    flags: [
      {
        name: 'Course',
        identifier: 'c',
        description: 'Specify the ID of the marks to appeal.',
      },
      {
        name: 'Academic',
        identifier: 'a',
        description: 'Mark as academic appeal.',
      },
      {
        name: 'Discipline',
        identifier: 'd',
        description: 'Mark as disciplinary appeal.',
      },
      {
        name: 'Message',
        identifier: 'm',
        description: 'Provide a message for the appeal.',
      },
    ],
  },
  {
    name: 'cd',
    description: 'Navigate between directories effortlessly. 🚀📂',
    usage: 'cd [directory]',
    example: 'cd Documents',
  },
  {
    name: 'cat',
    description: 'Peek into files and reveal their hidden truths. 🕵️‍♂️📄',
    usage: 'cat [file]',
    example: 'cat document.txt',
  },
  {
    name: 'file',
    description: 'Get information about a file. 📁🔍',
    usage: 'file [file]',
    example: 'file document.txt',
  },
  {
    name: 'pwd',
    description: 'Reveal your current location in the digital realm. 🧭🌐',
    usage: 'pwd',
    example: 'pwd',
  },
  {
    name: 'myCourses',
    description: 'Access your academic courses. 📚✨',
    usage: 'myCourses',
    example: 'myCourses',
  },
];

export interface CommandOutputs {
  clear: ({ setOutput }: { setOutput: React.Dispatch<React.SetStateAction<any[]>> }) => void;
  exit: () => void;
  ls: ({ me, currentPath }: { me: any; currentPath: string[] }) => React.JSX.Element;
  thisYear: ({ me, currentPath }: { me: any; currentPath: string[] }) => Promise<React.JSX.Element>;
  thisTerm: ({ me, currentPath }: { me: any; currentPath: string[] }) => Promise<React.JSX.Element>;
  cd: ({
    me,
    currentPath,
    setCurrentPath,
    args,
  }: {
    me: any;
    currentPath: string[];
    setCurrentPath: React.Dispatch<React.SetStateAction<string[]>>;
    args: string;
  }) => React.JSX.Element;
  file: ({
    me,
    currentPath,
    args,
  }: {
    me: any;
    currentPath: string[];
    args: string;
  }) => Promise<React.JSX.Element>;
  cat: ({
    me,
    currentPath,
    args,
  }: {
    me: any;
    currentPath: string[];
    args: string;
  }) => Promise<React.JSX.Element>;
  myCourses: ({
    me,
    currentPath,
    args,
  }: {
    me: any;
    currentPath: string[];
    args: string;
  }) => Promise<React.JSX.Element>;
  appeal: ({
    me,
    currentPath,
    args,
    command,
  }: {
    me: any;
    currentPath: string[];
    args: string;
    command: string;
  }) => Promise<React.JSX.Element>;
  man: ({
    me,
    currentPath,
    args,
  }: {
    me: any;
    currentPath: string[];
    args: string;
  }) => Promise<React.JSX.Element>;
  pwd: ({
    me,
    currentPath,
    args,
  }: {
    me: any;
    currentPath: string[];
    args: string;
  }) => Promise<React.JSX.Element>;
}

interface Appeal {
  type: 'Discipline' | 'Academic';
  message: string;
  course: string;
}

export const commandOutputs: CommandOutputs = {
  clear: ({ setOutput }: { setOutput: React.Dispatch<React.SetStateAction<any[]>> }) => {
    setOutput([]);
  },
  exit: () => {
    window.location.href = '/student';
  },
  ls: ({ me, currentPath }) => {
    let currentDirectory = directories;
    for (const path of currentPath) {
      if (path !== '') {
        currentDirectory = currentDirectory?.contents.find(
          (item: any) => item.name === path,
        ) as any;
      }
    }
    const items = currentDirectory.contents;
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          ls
        </p>
        {items?.map((item: any, index: number) => {
          return (
            <div key={index} className="flex items-center gap-3 ">
              {item.logo && <item.logo size={20} />}
              {item.name}
            </div>
          );
        })}
      </div>
    );
  },
  cd: ({ me, currentPath, setCurrentPath, args }) => {
    let currentDirectory = directories;
    const newPath = [...currentPath];
    for (const path of currentPath) {
      if (path !== '') {
        currentDirectory = currentDirectory?.contents.find(
          (item: any) => item.name === path,
        ) as any;
      }
    }
    const toGo = args.split('/');

    for (const path of toGo) {
      if (path === '.' || path === '') {
        continue;
      } else if (path === '..') {
        newPath.pop();
      } else {
        const nextDirectory = currentDirectory?.contents.find(
          (item: any) => item.name === path,
        ) as any;
        if (!nextDirectory) {
          return (
            <div>
              <p>
                <span className="text-mainPurple font-bold">
                  {' '}
                  rca@{me ? me.username : ' '}
                  {': '}
                </span>
                <span className="text-[rgba(3,87,189,0.47)] font-bold">
                  {currentPath.join('/')}
                  {' $'}
                </span>{' '}
                cd {args}
              </p>
              <p>
                No directory named <span className="text-red-500">"{path}"</span>
              </p>
            </div>
          );
        }
        if (nextDirectory.type === 'directory') {
          currentDirectory = nextDirectory;
          newPath.push(path);
        } else {
          return (
            <div>
              <p>
                <span className="text-mainPurple font-bold">
                  {' '}
                  rca@{me ? me.username : ' '}
                  {': '}
                </span>
                <span className="text-[rgba(3,87,189,0.47)] font-bold">
                  {currentPath.join('/')}
                  {' $'}
                </span>{' '}
                cd {args}
              </p>
              <p>
                cd: not a directory: <span className="text-red-500">"{path}"</span>
              </p>
            </div>
          );
        }
      }
    }
    const path = [...currentPath];
    setCurrentPath(newPath);
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {path.join('/')}
            {' $'}
          </span>{' '}
          cd {args}
        </p>
      </div>
    );
  },
  cat: async ({ me, currentPath, args }) => {
    let currentDirectory = directories;
    for (const path of currentPath) {
      if (path !== '') {
        currentDirectory = currentDirectory?.contents.find(
          (item: any) => item.name === path,
        ) as any;
      }
    }
    if (args[0].includes('/') && args.split('/').length > 2) {
      const paths = args[0].split('/');
      for (let i = 0; i < paths.length - 1; i++) {
        if (paths[i] !== '') {
          currentDirectory = currentDirectory?.contents.find(
            (item: any) => item.name === paths[i],
          ) as any;
        }
      }
    }
    const file = currentDirectory.contents.find(
      (item) => item.name === args.split('/')[args.split('/').length - 1],
    );
    if (!file) {
      return (
        <div>
          <p>
            <span className="text-mainPurple font-bold">
              {' '}
              rca@{me ? me.username : ' '}
              {': '}
            </span>
            <span className="text-[rgba(3,87,189,0.47)] font-bold">
              {currentPath.join('/')}
              {' $'}
            </span>{' '}
            cat {args}
          </p>
          <p className="text-red-500">No file named "{args}"</p>
        </div>
      );
    }
    const fileContents = await file.actions?.find((act) => act.name === 'desc')?.action();
    const columns = file.actions?.find((act) => act.name === 'desc')?.columns;
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          cat {args}
        </p>
        {fileContents?.length == 0 ? (
          <div className="">
            <p className="text-sm italic">Yo, ain't nothin' here but tumbleweeds, fam.</p>
          </div>
        ) : (
          columns && <CMDTable columns={columns} data={fileContents} />
        )}
      </div>
    );
  },
  file: async ({ me, currentPath, args }) => {
    let currentDirectory = directories;
    for (const path of currentPath) {
      if (path !== '') {
        currentDirectory = currentDirectory?.contents.find(
          (item: any) => item.name === path,
        ) as any;
      }
    }
    if (args[0].includes('/') && args[0].split('/').length > 2) {
      const paths = args[0].split('/');
      for (let i = 0; i < paths.length - 1; i++) {
        if (paths[i] !== '') {
          currentDirectory = currentDirectory?.contents.find(
            (item: any) => item.name === paths[i],
          ) as any;
        }
      }
    }
    const file = currentDirectory.contents.find(
      (item) => item.name === args[0].split('/')[args[0].split('/').length - 1],
    );
    if (!file) {
      return (
        <div>
          <p>
            <span className="text-mainPurple font-bold">
              {' '}
              rca@{me ? me.username : ' '}
              {': '}
            </span>
            <span className="text-[rgba(3,87,189,0.47)] font-bold">
              {currentPath.join('/')}
              {' $'}
            </span>{' '}
            cat {args[0]}
          </p>
          <p className="text-red-500">No file named "{args[0]}"</p>
        </div>
      );
    }
    const fileContents = await file.actions?.find((act) => act.name === 'desc')?.action();
    const columns = file.actions?.find((act) => act.name === 'desc')?.columns;
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          file {args[0]}
        </p>
        <p className="">
          <span className="font-bold text-[rgba(3,87,189,0.47)] ">{file.name} </span>: {file.type}
        </p>
      </div>
    );
  },
  myCourses: async ({ me, currentPath, args }) => {
    const courses = await getCoursesForLoggedIn();

    const objects = courses.data;
    const columns = [
      {
        name: 'Name',
        get: (row: any) => {
          return <p>{row.courseName}</p>;
        },
      },
      {
        name: 'Weight',
        get: (row: any) => {
          return <p>{row.courseWeight}</p>;
        },
      },
      {
        name: 'Credits',
        get: (row: any) => {
          return <p>{row.courseCredits}</p>;
        },
      },
    ];
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          myCourses
        </p>
        {Object.keys(objects).length == 0 ? (
          <div>
            <p className="italic text-sm">Yo, ain't no courses you be studyin' yet, homie.</p>
          </div>
        ) : (
          Object.keys(objects).map((acadYear, i) => {
            return (
              <div key={acadYear} className="flex w-full flex-col gap-y-1.5">
                <h5 className="font-semibold text-lg">
                  {parseIntoObject(acadYear).AcademicYearName}
                </h5>
                <div className="flex flex-col-reverse">
                  {Object.keys(objects[acadYear]).map((term) => (
                    <div key={term} className="flex w-full flex-col">
                      <h1 className="px-2 capitalize">
                        {parseIntoObjectTerm(term).termName.toLowerCase().split('_').join(' ')}
                      </h1>
                      <CMDTable columns={columns} data={objects[acadYear][term]} />
                      {/* <div>
                        {objects[acadYear][term].map((course: any) => (
                          <div className={``} key={i}>
                            <p className="text-mainPurple">----------------------------------</p>
                            <h6 className=" border-x border-mainPurple text-[17px] font-bold text-center w-full">
                              {course.courseName}
                            </h6>
                            <h6 className=" border-x border-mainPurple text-[17px] font-bold text-center w-full">
                              {course.id}
                            </h6>
                            <h6 className=" border-x border-mainPurple text-[17px] font-bold text-center w-full">
                              {course.id.split('').reverse().join('')}
                            </h6>
                            <p className="text-mainPurple">----------------------------------</p>
                          </div>
                        ))}
                      </div> */}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  },
  appeal: async ({ me, currentPath, args, command }) => {
    const finalArgs = args.split('-').slice(1);
    const appl: Appeal = {
      type: 'Academic',
      message: '',
      course: '',
    };
    for (const arg of finalArgs ?? []) {
      const flag = arg[0];
      const command = commands.find((com) => com.name === 'appeal');
      if (command) {
        const action = command?.flags?.find((flg) => flg.identifier === flag);
        switch (action?.name) {
          case 'Discipline':
            appl.type = action.name;
            break;
          case 'Academic':
            appl.type = action.name;
            appl.course = '';
            break;
          case 'Message':
            appl.message = arg.substring(3, arg.length - 2);
            break;
          case 'Course':
            appl.course = rot19Decrypt(arg.substring(2).replace(/^"(.*)"$/, '$1'))
              .replaceAll('.', '-')
              .split('')
              .reverse()
              .join('');
            break;
          default:
            break;
        }
      }
    }
    if (appl.message.length == 0) {
      return (
        <div>
          <p>
            <span className="text-mainPurple font-bold">
              {' '}
              rca@{me ? me.username : ' '}
              {': '}
            </span>
            <span className="text-[rgba(3,87,189,0.47)] font-bold">
              {currentPath.join('/')}
              {' $'}
            </span>{' '}
            {command}
          </p>
          <p className="text-red-500">
            Err: <span className="text-black">Please provide a message for the appeal</span>
          </p>
          <div className="text-sm pl-10">
            <p>Example</p>
            <p className="ml-5">appeal -m "Your message goes here"</p>
          </div>
        </div>
      );
    }
    if (appl.course.trim().length <= 1) {
      return (
        <div>
          <p>
            <span className="text-mainPurple font-bold">
              {' '}
              rca@{me ? me.username : ' '}
              {': '}
            </span>
            <span className="text-[rgba(3,87,189,0.47)] font-bold">
              {currentPath.join('/')}
              {' $'}
            </span>{' '}
            {command}
          </p>
          <p className="text-red-500">
            Err:{' '}
            <span className="text-black">
              Please provide the {appl.type === 'Academic' ? 'marks id' : 'discipline case id'} for
              the appeal
            </span>
          </p>
          <div className="text-sm pl-10">
            <p>Example</p>
            <p className="ml-5">
              appeal -c "{appl.type === 'Academic' ? 'marks id' : 'discipline case id'} goes here"
            </p>
          </div>
        </div>
      );
    }
    if (appl.type === 'Academic') {
      try {
        await AuthApi.post('/academicAppeals/create?category=SINGLE_SUBJECT', {
          markId: appl.course,
          description: appl.message,
        });
        return (
          <div>
            <p>
              <span className="text-mainPurple font-bold">
                {' '}
                rca@{me ? me.username : ' '}
                {': '}
              </span>
              <span className="text-[rgba(3,87,189,0.47)] font-bold">
                {currentPath.join('/')}
                {' $'}
              </span>{' '}
              {command}
            </p>
            <p className="">
              <span className="text-gree-500">✓ </span>Appeal Made
            </p>
          </div>
        );
      } catch (error: any) {
        return (
          <div>
            <p>
              <span className="text-mainPurple font-bold">
                {' '}
                rca@{me ? me.username : ' '}
                {': '}
              </span>
              <span className="text-[rgba(3,87,189,0.47)] font-bold">
                {currentPath.join('/')}
                {' $'}
              </span>{' '}
              {command}
            </p>
            <p className="">
              <span className="text-red-500 mr-2">❌</span>
              <span>Failed to make appeal. Reason: {error.toString()}</span>
            </p>
          </div>
        );
      }
    } else if (appl.type === 'Discipline') {
      try {
        await AuthApi.post('/ds-appeals/create?category=TERM_MARKS', {
          deductionId: appl.course,
          description: appl.message,
        });
        return (
          <div>
            <p>
              <span className="text-mainPurple font-bold">
                {' '}
                rca@{me ? me.username : ' '}
                {': '}
              </span>
              <span className="text-[rgba(3,87,189,0.47)] font-bold">
                {currentPath.join('/')}
                {' $'}
              </span>{' '}
              {command}
            </p>
            <p className="">
              <span className="text-gree-500">✓ </span>Appeal Made
            </p>
          </div>
        );
      } catch (error: any) {
        return (
          <div>
            <p>
              <span className="text-mainPurple font-bold">
                {' '}
                rca@{me ? me.username : ' '}
                {': '}
              </span>
              <span className="text-[rgba(3,87,189,0.47)] font-bold">
                {currentPath.join('/')}
                {' $'}
              </span>{' '}
              {command}
            </p>
            <p className="">
              <span className="text-red-500 mr-2">❌</span>
              <span>Failed to make appeal. Reason: {error.toString()}</span>
            </p>
          </div>
        );
      }
    }
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          {command}
        </p>
        <p className="">
          <span className="text-red-500 mr-2">❌</span>
          <span>Appeal not made! System glitch detected. We're on it!</span>
        </p>
      </div>
    );
  },
  man: async ({ me, currentPath, args }) => {
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          man {args}
        </p>
        {args ? (
          <p className="pl-5">
            {!commands.find((com) => com.name === args) ? (
              <span className="text-red-500">Command {args} not found</span>
            ) : (
              <>
                <p className="pl-5 ">
                  <span className="text-[rgba(3,87,189,0.47)] font-bold ">
                    {commands.find((com) => com.name === args)?.name}
                  </span>{' '}
                  : {commands.find((com) => com.name === args)?.description}
                </p>
                <div className="pl-8">
                  {commands &&
                    commands.find((com) => com.name === args)?.flags &&
                    commands
                      ?.find((com) => com.name === args)
                      ?.flags?.map((flg, flgIndex) => (
                        <p key={flgIndex} className="pl-5 ">
                          <span className="text-[rgba(3,87,189,0.47)] font-bold ">
                            -{flg.identifier}
                          </span>{' '}
                          : {flg.description}
                        </p>
                      ))}
                  <div className="pl-4">
                    <p>
                      <span className="text-mainPurple text-sm font-semibold">Usage</span>
                      {'     '}
                      {commands.find((com) => com.name === args)?.usage}
                    </p>
                    <p>
                      <span className="text-mainPurple text-sm font-semibold">Example</span>
                      {'     '}
                      {commands.find((com) => com.name === args)?.example}
                    </p>
                  </div>
                </div>
              </>
            )}
          </p>
        ) : (
          commands.map((com, i) => {
            return (
              <div key={i} className="my-3 border-t py-1.5">
                <p className="pl-5 ">
                  <span className="text-[rgba(3,87,189,0.47)] font-bold ">{com.name}</span> :{' '}
                  {com.description}
                </p>
                <div className="pl-8">
                  {com.flags &&
                    com.flags.map((flg, flgIndex) => (
                      <p key={flgIndex} className="pl-5 ">
                        <span className="text-[rgba(3,87,189,0.47)] font-bold ">
                          -{flg.identifier}
                        </span>{' '}
                        : {flg.description}
                      </p>
                    ))}
                  <div className="pl-4">
                    <p>
                      <span className="text-mainPurple text-sm font-semibold">Usage</span>
                      {'     '}
                      {com.usage}
                    </p>
                    <p>
                      <span className="text-mainPurple text-sm font-semibold">Example</span>
                      {'     '}
                      {com.example}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  },
  pwd: async ({ me, currentPath, args }) => {
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          pwd {args[0]}
        </p>
        <p className="pl-5 font-bold ">{currentPath.length === 1 ? '/' : currentPath.join('/')}</p>
      </div>
    );
  },
  thisYear: async ({ me, currentPath }) => {
    const academicYearsResponse = await getAcademicYears();

    const year = academicYearsResponse.data[academicYearsResponse.data.length - 1];
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          thisYear
        </p>
        <p>{year.name}</p>
      </div>
    );
  },
  thisTerm: async ({ me, currentPath }) => {
    const academicYearsResponse = await getAcademicYears();
    const academicYearId = academicYearsResponse.data[0]?.id;
    const termsInYearResponse = await getTermsInYear(academicYearId);

    const term = termsInYearResponse.data[termsInYearResponse.data.length - 1];
    return (
      <div>
        <p>
          <span className="text-mainPurple font-bold">
            {' '}
            rca@{me ? me.username : ' '}
            {': '}
          </span>
          <span className="text-[rgba(3,87,189,0.47)] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>{' '}
          thisTerm
        </p>
        <p>{term.name.replace('_', ' ')}</p>
      </div>
    );
  },
};
