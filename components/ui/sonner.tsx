'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      duration={4500}
      gap={10}
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast: [
            'group !font-[family-name:var(--font-bricolage),sans-serif]',
            '!bg-white !text-gray-900',
            '!border !border-gray-100',
            '!rounded-2xl',
            '!shadow-[0_4px_24px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]',
            '!p-4 !pr-3',
            '!gap-3',
            // coloured left accent per type
            'data-[type=success]:!border-l-[3px] data-[type=success]:!border-l-green-500',
            'data-[type=error]:!border-l-[3px] data-[type=error]:!border-l-red-500',
            'data-[type=warning]:!border-l-[3px] data-[type=warning]:!border-l-amber-400',
            'data-[type=info]:!border-l-[3px] data-[type=info]:!border-l-blue-500',
          ].join(' '),
          title:       '!text-[13.5px] !font-semibold !text-gray-900 !leading-snug',
          description: '!text-[12px] !text-gray-500 !mt-0.5 !leading-snug',
          icon:        '!shrink-0',
          closeButton: [
            '!border-0 !bg-transparent',
            '!w-6 !h-6 !rounded-lg',
            '!text-gray-400 hover:!text-gray-600 hover:!bg-gray-100',
            '!transition-colors !duration-150',
            '!opacity-0 group-hover:!opacity-100',
          ].join(' '),
          actionButton: [
            '!bg-violet-600 hover:!bg-violet-700 !text-white',
            '!h-7 !px-3 !text-[12px] !font-semibold !rounded-lg !transition-colors',
          ].join(' '),
          cancelButton: [
            '!bg-gray-100 hover:!bg-gray-200 !text-gray-600',
            '!h-7 !px-3 !text-[12px] !font-medium !rounded-lg !transition-colors',
          ].join(' '),
          loader: '!text-violet-600',
          success: '!text-gray-900',
          error:   '!text-gray-900',
          warning: '!text-gray-900',
          info:    '!text-gray-900',
        },
      }}
      icons={{
        success: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
            <svg className="h-3.5 w-3.5 text-green-600" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        ),
        error: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-3.5 w-3.5 text-red-600" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
        ),
        warning: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-3.5 w-3.5 text-amber-600" viewBox="0 0 12 12" fill="none">
              <path d="M6 2.5L6 7M6 9.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
        ),
        info: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-3.5 w-3.5 text-blue-600" viewBox="0 0 12 12" fill="none">
              <path d="M6 5.5v3.5M6 3v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
        ),
        loading: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center">
            <svg className="h-4 w-4 text-violet-600 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          </span>
        ),
      }}
      closeButton
      {...props}
    />
  );
};

export { Toaster };
