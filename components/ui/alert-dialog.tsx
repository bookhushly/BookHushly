'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useFocusTrap, mergeRefs } from '@/components/ui/use-focus-trap';

// ─── Context ─────────────────────────────────────────────────────────────────
interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) throw new Error('AlertDialog components must be used within <AlertDialog>');
  return ctx;
}

// ─── Animation ───────────────────────────────────────────────────────────────
function useModalAnimation(open: boolean) {
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
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  return { mounted, visible };
}

// ─── Root ─────────────────────────────────────────────────────────────────────
interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AlertDialog({ open: controlledOpen, onOpenChange, children, defaultOpen = false }: AlertDialogProps) {
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
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────
const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const { setOpen } = useAlertDialog();

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
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

// ─── Portal ───────────────────────────────────────────────────────────────────
function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;
  return createPortal(children, document.body);
}

// ─── Overlay ─────────────────────────────────────────────────────────────────
const AlertDialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('fixed inset-0 z-50 bg-black/80 transition-opacity duration-200', className)}
      {...props}
    />
  )
);
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

// ─── Content ─────────────────────────────────────────────────────────────────
// AlertDialog intentionally does NOT close on overlay click — forces explicit choice.
const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useAlertDialog();
  const { mounted, visible } = useModalAnimation(open);
  const innerRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(innerRef, visible);

  // Escape key is intentionally disabled for alert dialogs (forces explicit choice)

  // Body scroll lock
  React.useEffect(() => {
    if (mounted) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay style={{ opacity: visible ? 1 : 0 }} />
      <div
        ref={mergeRefs(innerRef, ref)}
        role="alertdialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
          'transition-all duration-200 focus:outline-none',
          className
        )}
        style={{
          opacity: visible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.95})`,
        }}
        {...props}
      >
        {children}
      </div>
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = 'AlertDialogContent';

// ─── Header ───────────────────────────────────────────────────────────────────
const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

// ─── Footer ───────────────────────────────────────────────────────────────────
const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

// ─── Title ────────────────────────────────────────────────────────────────────
const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-medium', className)} {...props} />
  )
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

// ─── Description ─────────────────────────────────────────────────────────────
const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
AlertDialogDescription.displayName = 'AlertDialogDescription';

// ─── Action (closes dialog) ───────────────────────────────────────────────────
const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, children, ...props }, ref) => {
  const { setOpen } = useAlertDialog();
  return (
    <button
      ref={ref}
      type="button"
      className={cn(buttonVariants(), className)}
      onClick={(e) => { onClick?.(e); setOpen(false); }}
      {...props}
    >
      {children}
    </button>
  );
});
AlertDialogAction.displayName = 'AlertDialogAction';

// ─── Cancel ───────────────────────────────────────────────────────────────────
const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, children, ...props }, ref) => {
  const { setOpen } = useAlertDialog();
  return (
    <button
      ref={ref}
      type="button"
      className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
      onClick={(e) => { onClick?.(e); setOpen(false); }}
      {...props}
    >
      {children}
    </button>
  );
});
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
