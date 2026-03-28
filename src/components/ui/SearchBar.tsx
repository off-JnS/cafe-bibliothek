import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Suchen…" }: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-sage-light bg-cream py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-warm-gray/60 outline-none transition-shadow focus:ring-2 focus:ring-sage-dark focus:ring-offset-2"
      />
    </div>
  );
}
