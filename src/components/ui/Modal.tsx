import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 h-full w-full max-h-dvh max-w-none border-none bg-offwhite p-0 backdrop:bg-charcoal/40 backdrop:backdrop-blur-sm md:m-auto md:h-auto md:max-h-[85vh] md:w-full md:max-w-lg md:rounded-2xl md:shadow-xl"
    >
      <div className="flex h-full flex-col md:h-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sage-light/40 bg-offwhite px-5 py-3.5">
          <h3 className="font-heading text-lg font-bold text-charcoal">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-cream active:bg-sage-light/50"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </dialog>
  );
}
