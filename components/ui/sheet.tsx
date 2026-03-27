'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusTrap, mergeRefs } from '@/components/ui/use-focus-trap';

// ─── Context ─────────────────────────────────────────────────────────────────
interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error('Sheet components must be used within <Sheet>');
  return ctx;
}

// ─── Animation ───────────────────────────────────────────────────────────────
function useSheetAnimation(open: boolean) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  return { mounted, visible };
}

// ─── Translate helpers per side ───────────────────────────────────────────────
const sideTranslate: Record<string, string> = {
  left: 'translateX(-100%)',
  right: 'translateX(100%)',
  top: 'translateY(-100%)',
  bottom: 'translateY(100%)',
};

const sidePosition: Record<string, string> = {
  left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r',
  right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
  top: 'inset-x-0 top-0 border-b',
  bottom: 'inset-x-0 bottom-0 border-t',
};

// ─── Root ─────────────────────────────────────────────────────────────────────
interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Sheet({ open: controlledOpen, onOpenChange, children, defaultOpen = false }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen! : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setUncontrolledOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────
const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const { setOpen } = useSheet();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => { onClick?.(e); setOpen(true); }}
      {...props}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = 'SheetTrigger';

// ─── Close ───────────────────────────────────────────────────────────────────
const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const { setOpen } = useSheet();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        setOpen(false);
      },
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => { onClick?.(e); setOpen(false); }}
      {...props}
    >
      {children}
    </button>
  );
});
SheetClose.displayName = 'SheetClose';

// ─── Portal ───────────────────────────────────────────────────────────────────
function SheetPortal({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;
  return createPortal(children, document.body);
}

// ─── Overlay ─────────────────────────────────────────────────────────────────
const SheetOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('fixed inset-0 z-50 bg-black/80 transition-opacity duration-300', className)}
      {...props}
    />
  )
);
SheetOverlay.displayName = 'SheetOverlay';

// ─── Content ─────────────────────────────────────────────────────────────────
interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom';
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const { open, setOpen } = useSheet();
    const { mounted, visible } = useSheetAnimation(open);
    const innerRef = React.useRef<HTMLDivElement>(null);
    useFocusTrap(innerRef, visible);

    // Escape key
    React.useEffect(() => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [open, setOpen]);

    // Body scroll lock
    React.useEffect(() => {
      if (mounted) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
      return () => { document.body.style.overflow = ''; };
    }, [mounted]);

    if (!mounted) return null;

    return (
      <SheetPortal>
        <SheetOverlay
          style={{ opacity: visible ? 1 : 0 }}
          onClick={() => setOpen(false)}
        />
        <div
          ref={mergeRefs(innerRef, ref)}
          tabIndex={-1}
          className={cn(
            'fixed z-50 gap-4 bg-background p-6 shadow-lg focus:outline-none',
            sidePosition[side],
            className
          )}
          style={{
            transform: visible ? 'translate(0, 0)' : sideTranslate[side],
            transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
          {...props}
        >
          {children}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = 'SheetContent';

// ─── Header ───────────────────────────────────────────────────────────────────
const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left pr-8', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

// ─── Footer ───────────────────────────────────────────────────────────────────
const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

// ─── Title ────────────────────────────────────────────────────────────────────
const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-medium text-foreground', className)} {...props} />
  )
);
SheetTitle.displayName = 'SheetTitle';

// ─── Description ─────────────────────────────────────────────────────────────
const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
SheetDescription.displayName = 'SheetDescription';

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
