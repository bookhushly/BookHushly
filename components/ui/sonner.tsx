'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-right"
      duration={4000}
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-md group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-gray-500 group-[.toast]:text-sm',
          actionButton:
            'group-[.toast]:bg-violet-600 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:rounded-lg group-[.toast]:text-xs',
          closeButton:
            'group-[.toaster]:border-gray-200 group-[.toaster]:bg-white group-[.toaster]:text-gray-400 hover:group-[.toaster]:text-gray-600',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
