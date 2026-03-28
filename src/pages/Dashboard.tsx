import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { BookOpen, Users, ArrowRightLeft, AlertTriangle } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { getBooks, getMembers, getLoanStats, refreshLoanStatuses } from "../services/libraryStore";

export default function Dashboard() {
  const books = useMemo(() => getBooks(), []);
  const members = useMemo(() => getMembers(), []);
  const stats = useMemo(() => getLoanStats(), []);
  const overdueLoans = useMemo(() => {
    const loans = refreshLoanStatuses();
    return loans
      .filter((l) => l.status === "overdue")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, []);

  const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0);

  return (
    <>
      <Helmet>
        <title>Dashboard — Café Bibliothek</title>
      </Helmet>

      <section className="px-4 pt-6 pb-8 md:px-8">
        <div className="mx-auto max-w-2xl md:max-w-5xl">
          {/* Greeting */}
          <h1 className="font-heading text-2xl font-bold text-charcoal">Hallo! ☕</h1>
          <p className="mt-1 text-sm text-warm-gray">Deine Bibliothek auf einen Blick.</p>

          {/* Stat cards — 2×2 grid, tappable */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Bücher"
              value={totalBooks}
              to="/buecher"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Mitglieder"
              value={members.filter((m) => m.active).length}
              to="/mitglieder"
            />
            <StatCard
              icon={<ArrowRightLeft className="h-5 w-5" />}
              label="Ausgeliehen"
              value={stats.active}
              to="/ausleihen"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Überfällig"
              value={stats.overdue}
              accent="text-rose-600"
              to="/ausleihen"
            />
          </div>

          {/* Overdue alert list — owner's main concern */}
          {overdueLoans.length > 0 && (
            <div className="mt-6 rounded-2xl bg-rose-50 p-4">
              <h2 className="text-sm font-bold text-rose-700">⚠ Überfällige Ausleihen</h2>
              <ul className="mt-3 space-y-3">
                {overdueLoans.map((loan) => {
                  const book = books.find((b) => b.id === loan.bookId);
                  const member = members.find((m) => m.id === loan.memberId);
                  return (
                    <li key={loan.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-charcoal">{book?.title ?? "—"}</p>
                        <p className="text-xs text-warm-gray">{member?.name} · fällig {loan.dueDate}</p>
                      </div>
                      <Badge status={loan.status} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Quick action */}
          <div className="mt-6">
            <Button to="/ausleihen" className="w-full justify-center">
              Neue Ausleihe
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
