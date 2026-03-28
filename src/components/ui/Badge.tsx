import type { LoanStatus } from "../../data/models";

const styles: Record<LoanStatus, string> = {
  active:   "bg-blue-100 text-blue-700",
  overdue:  "bg-rose-100 text-rose-700",
  returned: "bg-sage-light text-sage-dark",
};

const labels: Record<LoanStatus, string> = {
  active:   "Aktiv",
  overdue:  "Überfällig",
  returned: "Zurückgegeben",
};

interface Props {
  status: LoanStatus;
  className?: string;
}

export default function Badge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
