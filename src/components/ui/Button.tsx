import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  to?: string;
  href?: string;
  variant?: "primary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage-dark focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const sizes = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-7 py-3 text-sm",
};

const styles = {
  primary:
    "bg-sage-dark text-cream hover:bg-sage-dark/90 hover:scale-[1.03] active:scale-[0.98]",
  outline:
    "border-2 border-sage-dark text-sage-dark hover:bg-sage-dark hover:text-cream hover:scale-[1.03] active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 hover:scale-[1.03] active:scale-[0.98]",
  ghost:
    "text-sage-dark hover:bg-sage-light/50",
};

export default function Button({
  to,
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  type = "button",
  onClick,
  disabled,
}: Props) {
  const cls = `${base} ${sizes[size]} ${styles[variant]} ${className}`;

  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
