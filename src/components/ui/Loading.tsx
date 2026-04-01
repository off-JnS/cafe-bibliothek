import { Loader2 } from "lucide-react";

interface Props {
  /** Text shown below the spinner */
  label?: string;
}

export default function Loading({ label = "Laden…" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-warm-gray">
      <Loader2 className="h-8 w-8 animate-spin text-sage-dark" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}
