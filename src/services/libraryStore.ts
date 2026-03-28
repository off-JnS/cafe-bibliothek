/**
 * Library store — CRUD operations backed by localStorage.
 * Designed with a clean interface so it can be swapped for a REST API later.
 */

import type { Book, Member, Loan, LoanStatus } from "../data/models";
import { seedBooks, seedMembers, seedLoans } from "../data/seed";

const KEYS = {
  books: "cafe-lib-books",
  members: "cafe-lib-members",
  loans: "cafe-lib-loans",
} as const;

/* ── Helpers ──────────────────────────────────────────────── */

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch { /* corrupt data — reset */ }
  return fallback;
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId<T extends { id: number }>(arr: T[]): number {
  return arr.length === 0 ? 1 : Math.max(...arr.map((i) => i.id)) + 1;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── Books ────────────────────────────────────────────────── */

export function getBooks(): Book[] {
  return load<Book>(KEYS.books, seedBooks);
}

export function getBook(id: number): Book | undefined {
  return getBooks().find((b) => b.id === id);
}

export function addBook(book: Omit<Book, "id" | "addedDate" | "availableCopies">): Book {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: nextId(books),
    availableCopies: book.totalCopies,
    addedDate: today(),
  };
  books.push(newBook);
  save(KEYS.books, books);
  return newBook;
}

export function updateBook(id: number, updates: Partial<Omit<Book, "id">>): Book | undefined {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  books[idx] = { ...books[idx], ...updates };
  save(KEYS.books, books);
  return books[idx];
}

export function deleteBook(id: number): boolean {
  const books = getBooks();
  const filtered = books.filter((b) => b.id !== id);
  if (filtered.length === books.length) return false;
  save(KEYS.books, filtered);
  return true;
}

/* ── Members ──────────────────────────────────────────────── */

export function getMembers(): Member[] {
  return load<Member>(KEYS.members, seedMembers);
}

export function getMember(id: number): Member | undefined {
  return getMembers().find((m) => m.id === id);
}

export function addMember(member: Omit<Member, "id" | "joinedDate" | "active">): Member {
  const members = getMembers();
  const newMember: Member = {
    ...member,
    id: nextId(members),
    joinedDate: today(),
    active: true,
  };
  members.push(newMember);
  save(KEYS.members, members);
  return newMember;
}

export function updateMember(id: number, updates: Partial<Omit<Member, "id">>): Member | undefined {
  const members = getMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  members[idx] = { ...members[idx], ...updates };
  save(KEYS.members, members);
  return members[idx];
}

/* ── Loans ────────────────────────────────────────────────── */

export function getLoans(): Loan[] {
  return load<Loan>(KEYS.loans, seedLoans);
}

/** Refresh status of all loans based on today's date */
export function refreshLoanStatuses(): Loan[] {
  const loans = getLoans();
  const todayStr = today();
  let changed = false;
  for (const loan of loans) {
    if (!loan.returnDate && loan.dueDate < todayStr && loan.status !== "overdue") {
      loan.status = "overdue";
      changed = true;
    }
  }
  if (changed) save(KEYS.loans, loans);
  return loans;
}

export function checkoutBook(bookId: number, memberId: number, daysToLend = 30): Loan | null {
  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book || book.availableCopies <= 0) return null;

  // decrease available copies
  book.availableCopies -= 1;
  save(KEYS.books, books);

  const loanDate = today();
  const due = new Date();
  due.setDate(due.getDate() + daysToLend);
  const dueDate = due.toISOString().slice(0, 10);

  const loans = getLoans();
  const newLoan: Loan = {
    id: nextId(loans),
    bookId,
    memberId,
    loanDate,
    dueDate,
    returnDate: null,
    status: "active",
  };
  loans.push(newLoan);
  save(KEYS.loans, loans);
  return newLoan;
}

export function returnBook(loanId: number): Loan | null {
  const loans = getLoans();
  const loan = loans.find((l) => l.id === loanId);
  if (!loan || loan.returnDate) return null;

  loan.returnDate = today();
  loan.status = "returned";
  save(KEYS.loans, loans);

  // increase available copies
  const books = getBooks();
  const book = books.find((b) => b.id === loan.bookId);
  if (book) {
    book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
    save(KEYS.books, books);
  }

  return loan;
}

export function getActiveLoans(): Loan[] {
  return refreshLoanStatuses().filter((l) => l.status !== "returned");
}

export function getOverdueLoans(): Loan[] {
  return refreshLoanStatuses().filter((l) => l.status === "overdue");
}

/** Get loan count per status */
export function getLoanStats(): Record<LoanStatus, number> {
  const loans = refreshLoanStatuses();
  return {
    active: loans.filter((l) => l.status === "active").length,
    overdue: loans.filter((l) => l.status === "overdue").length,
    returned: loans.filter((l) => l.status === "returned").length,
  };
}

/** Reset all data to seed defaults */
export function resetData() {
  localStorage.removeItem(KEYS.books);
  localStorage.removeItem(KEYS.members);
  localStorage.removeItem(KEYS.loans);
}
