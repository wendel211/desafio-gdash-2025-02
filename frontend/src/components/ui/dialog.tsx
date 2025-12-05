import { useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

export function DialogTrigger({
  asChild,
  children,
  onClick,
}: {
  asChild?: boolean;
  children: any;
  onClick?: () => void;
}) {
  const Child = children;

  return asChild ? (
    <div
      onClick={onClick}
      className="cursor-pointer inline-block"
    >
      {Child}
    </div>
  ) : (
    <button onClick={onClick}>{children}</button>
  );
}

export function DialogContent({
  children,
  className = "",
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Fechar com a tecla ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && onClose) onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6 animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold">{children}</h2>;
}

export function DialogDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-end gap-2">{children}</div>;
}
