'use client';
import Link from 'next/link';
import { Button } from '@mantine/core';
import { GoIssueOpened } from 'react-icons/go';
import { AiOutlineReload } from 'react-icons/ai';

export default function Component() {
  return (
    <section
      key="1"
      className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900"
    >
      {/* <div className="w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
        <img
          alt="Error 500"
          className="aspect-[1/1] overflow-hidden rounded-lg object-contain object-center"
          height="256"
          src="/placeholder.svg"
          width="256"
        />
      </div> */}
      <div className="space-y-3 mt-4 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-800 dark:text-gray-200">
          Oops! Something went wrong.
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed dark:text-gray-400">
          We're currently experiencing technical difficulties. Our team is working on it. Please try
          again later.
        </p>
      </div>
      <div className="flex justify-center space-x-4 mt-6">
        <Link
          className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
          href="/"
        >
          Go to Home
        </Link>
        <Button onClick={() => window.location.reload()} variant="outline">
          <AiOutlineReload size={20} />
          Retry
        </Button>
        <Button variant="outline">
          <Link
            className="flex items-center gap-x-2"
            href={'https://github.com/RCA-MIS/rca-mis-issues/issues/new/choose'}
            target="_blank"
          >
            <GoIssueOpened size={20} />
            Report an issue
          </Link>
        </Button>
      </div>
    </section>
  );
}
