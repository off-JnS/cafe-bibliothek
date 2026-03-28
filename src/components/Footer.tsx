import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="hidden border-t border-sage-light/30 bg-offwhite py-6 md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5 text-sm text-warm-gray">
        <BookOpen className="h-4 w-4 text-sage" />
        <span>Café Literalität — Bibliothek</span>
      </div>
    </footer>
  );
}
