import { useState, useMemo, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Undo2 } from "lucide-react";
import SearchBar from "../components/ui/SearchBar";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Loading from "../components/ui/Loading";
import { useDebounce } from "../hooks/useDebounce";
import {
  refreshLoanStatuses,
  checkoutBook,
  returnBook,
  getBooks,
  getMembers,
} from "../services/libraryStore";
import type { Book, Member, Loan, LoanStatus } from "../data/models";

const statusFilters: Array<{ label: string; value: LoanStatus | "all" }> = [
  { label: "Alle", value: "all" },
  { label: "Aktiv", value: "active" },
  { label: "Überfällig", value: "overdue" },
  { label: "Zurück", value: "returned" },
];

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LoanStatus | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    const [l, b, m] = await Promise.all([
      refreshLoanStatuses(),
      getBooks(),
      getMembers(),
    ]);
    setLoans(l);
    setBooks(b);
    setMembers(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    let list =
      filter === "all" ? loans : loans.filter((l) => l.status === filter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((l) => {
        const book = books.find((b) => b.id === l.bookId);
        const member = members.find((m) => m.id === l.memberId);
        return (
          (book?.title.toLowerCase().includes(q) ?? false) ||
          (member?.name.toLowerCase().includes(q) ?? false)
        );
      });
    }
    return list.sort((a, b) => b.loanDate.localeCompare(a.loanDate));
  }, [loans, filter, debouncedSearch, books, members]);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const bookId = Number(fd.get("bookId"));
    const memberId = Number(fd.get("memberId"));
    const days = Number(fd.get("days")) || 30;
    const result = await checkoutBook(bookId, memberId, days);
    if (!result) {
      alert("Keine Exemplare verfügbar.");
      return;
    }
    setModalOpen(false);
    refresh();
  };

  const handleReturn = async (loanId: number) => {
    await returnBook(loanId);
    refresh();
  };

  if (loading) return <Loading />;

  const availableBooks = books.filter((b) => b.availableCopies > 0);
  const activeMembers = members.filter((m) => m.active);

  return (
    <>
      <Helmet>
        <title>Ausleihen — Café Bibliothek</title>
      </Helmet>

      <section className="px-4 pt-6 pb-8 md:px-8">
        <div className="mx-auto max-w-2xl md:max-w-5xl">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-xl font-bold text-charcoal">
              Ausleihen
            </h1>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Neu
            </Button>
          </div>

          {/* Search + status filter */}
          <div className="mt-4 space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buch oder Mitglied…"
            />
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {statusFilters.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => setFilter(sf.value)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    filter === sf.value
                      ? "bg-sage-dark text-cream"
                      : "bg-cream text-charcoal active:bg-sage-light/50"
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: card list */}
          <ul className="mt-5 space-y-3 md:hidden">
            {filtered.map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              const member = members.find((m) => m.id === loan.memberId);
              return (
                <li
                  key={loan.id}
                  className={`rounded-2xl p-4 shadow-sm ${loan.status === "overdue" ? "bg-rose-50" : "bg-cream"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-charcoal">
                        {book?.title ?? "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-warm-gray">
                        {member?.name ?? "—"}
                      </p>
                      <p className="mt-1 text-[11px] text-warm-gray">
                        {loan.loanDate} → {loan.dueDate}
                      </p>
                    </div>
                    <Badge status={loan.status} />
                  </div>
                  {loan.status !== "returned" && (
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-sage-dark py-2 text-xs font-semibold text-cream active:bg-sage-dark/90"
                    >
                      <Undo2 className="h-3.5 w-3.5" /> Zurückgeben
                    </button>
                  )}
                  {loan.status === "returned" && loan.returnDate && (
                    <p className="mt-2 text-center text-[11px] text-warm-gray">
                      Zurück am {loan.returnDate}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="mt-5 hidden overflow-x-auto rounded-2xl bg-cream shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sage-light/40 text-xs uppercase tracking-wider text-warm-gray">
                  <th className="px-5 py-3">Buch</th>
                  <th className="px-5 py-3">Mitglied</th>
                  <th className="px-5 py-3">Ausgeliehen</th>
                  <th className="px-5 py-3">Fällig</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-light/20">
                {filtered.map((loan) => {
                  const book = books.find((b) => b.id === loan.bookId);
                  const member = members.find((m) => m.id === loan.memberId);
                  return (
                    <tr
                      key={loan.id}
                      className={`transition-colors hover:bg-sage-light/10 ${loan.status === "overdue" ? "bg-rose-50/40" : ""}`}
                    >
                      <td className="px-5 py-3 font-medium text-charcoal">
                        {book?.title ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-warm-gray">
                        {member?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-warm-gray">
                        {loan.loanDate}
                      </td>
                      <td className="px-5 py-3 text-warm-gray">
                        {loan.dueDate}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={loan.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {loan.status !== "returned" ? (
                          <button
                            onClick={() => handleReturn(loan.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-sage-dark px-3 py-1.5 text-xs font-semibold text-cream hover:bg-sage-dark/90"
                          >
                            <Undo2 className="h-3 w-3" /> Zurückgeben
                          </button>
                        ) : (
                          <span className="text-xs text-warm-gray">
                            {loan.returnDate}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-sm text-warm-gray">
              Keine Ausleihen gefunden.
            </p>
          )}
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Neue Ausleihe"
      >
        <form onSubmit={handleCheckout} className="space-y-4">
          <select
            name="bookId"
            required
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          >
            <option value="">— Buch wählen —</option>
            {availableBooks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.availableCopies})
              </option>
            ))}
          </select>
          <select
            name="memberId"
            required
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          >
            <option value="">— Mitglied wählen —</option>
            {activeMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            name="days"
            type="number"
            min={1}
            defaultValue={30}
            placeholder="Tage"
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          />
          <Button type="submit" className="w-full justify-center">
            Ausleihen
          </Button>
        </form>
      </Modal>
    </>
  );
}
