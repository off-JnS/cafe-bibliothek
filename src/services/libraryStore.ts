/**
 * Library store — CRUD operations backed by Supabase (PostgreSQL).
 *
 * Every function is async. The DB uses snake_case columns;
 * thin mappers translate to/from the camelCase TS models.
 */

import type { Book, Genre, Loan, LoanStatus, Member } from "../data/models";
import { supabase } from "./supabase";

/* ── Row ↔ Model mappers ─────────────────────────────────── */

interface BookRow {
  id: number;
  isbn: string;
  title: string;
  author: string;
  genre: string;
  cover_image: string;
  total_copies: number;
  available_copies: number;
  added_date: string;
}

interface MemberRow {
  id: number;
  name: string;
  email: string;
  joined_date: string;
  active: boolean;
}

interface LoanRow {
  id: number;
  book_id: number;
  member_id: number;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
}

const toBook = (r: BookRow): Book => ({
  id: r.id,
  isbn: r.isbn,
  title: r.title,
  author: r.author,
  genre: r.genre as Genre,
  coverImage: r.cover_image,
  totalCopies: r.total_copies,
  availableCopies: r.available_copies,
  addedDate: r.added_date,
});

const toMember = (r: MemberRow): Member => ({
  id: r.id,
  name: r.name,
  email: r.email,
  joinedDate: r.joined_date,
  active: r.active,
});

const toLoan = (r: LoanRow): Loan => ({
  id: r.id,
  bookId: r.book_id,
  memberId: r.member_id,
  loanDate: r.loan_date,
  dueDate: r.due_date,
  returnDate: r.return_date,
  status: r.status as LoanStatus,
});

/* ── Helpers ──────────────────────────────────────────────── */

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ── Books ────────────────────────────────────────────────── */

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data as BookRow[]).map(toBook);
}

export async function getBook(id: number): Promise<Book | undefined> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toBook(data as BookRow) : undefined;
}

export async function addBook(
  book: Omit<Book, "id" | "addedDate" | "availableCopies">,
): Promise<Book> {
  const { data, error } = await supabase
    .from("books")
    .insert({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      genre: book.genre,
      cover_image: book.coverImage,
      total_copies: book.totalCopies,
      available_copies: book.totalCopies,
      added_date: today(),
    })
    .select()
    .single();
  if (error) throw error;
  return toBook(data as BookRow);
}

export async function updateBook(
  id: number,
  updates: Partial<Omit<Book, "id">>,
): Promise<Book | undefined> {
  const row: Record<string, unknown> = {};
  if (updates.isbn !== undefined) row.isbn = updates.isbn;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.author !== undefined) row.author = updates.author;
  if (updates.genre !== undefined) row.genre = updates.genre;
  if (updates.coverImage !== undefined) row.cover_image = updates.coverImage;
  if (updates.totalCopies !== undefined) row.total_copies = updates.totalCopies;
  if (updates.availableCopies !== undefined)
    row.available_copies = updates.availableCopies;
  if (updates.addedDate !== undefined) row.added_date = updates.addedDate;

  const { data, error } = await supabase
    .from("books")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data ? toBook(data as BookRow) : undefined;
}

export async function deleteBook(id: number): Promise<boolean> {
  const { error, count } = await supabase
    .from("books")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return (count ?? 1) > 0;
}

/* ── Members ──────────────────────────────────────────────── */

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data as MemberRow[]).map(toMember);
}

export async function getMember(id: number): Promise<Member | undefined> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toMember(data as MemberRow) : undefined;
}

export async function addMember(
  member: Omit<Member, "id" | "joinedDate" | "active">,
): Promise<Member> {
  const { data, error } = await supabase
    .from("members")
    .insert({
      name: member.name,
      email: member.email,
      joined_date: today(),
      active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return toMember(data as MemberRow);
}

export async function updateMember(
  id: number,
  updates: Partial<Omit<Member, "id">>,
): Promise<Member | undefined> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.active !== undefined) row.active = updates.active;
  if (updates.joinedDate !== undefined) row.joined_date = updates.joinedDate;

  const { data, error } = await supabase
    .from("members")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data ? toMember(data as MemberRow) : undefined;
}

/* ── Loans ────────────────────────────────────────────────── */

export async function getLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data as LoanRow[]).map(toLoan);
}

/**
 * Mark any loans past their due date as "overdue" in the DB,
 * then return the full list.
 */
export async function refreshLoanStatuses(): Promise<Loan[]> {
  const todayStr = today();

  // Bulk-update overdue in one query
  await supabase
    .from("loans")
    .update({ status: "overdue" })
    .is("return_date", null)
    .lt("due_date", todayStr)
    .neq("status", "overdue");

  return getLoans();
}

export async function checkoutBook(
  bookId: number,
  memberId: number,
  daysToLend = 30,
): Promise<Loan | null> {
  // 1. Check availability
  const book = await getBook(bookId);
  if (!book || book.availableCopies <= 0) return null;

  // 2. Decrement available copies
  await supabase
    .from("books")
    .update({ available_copies: book.availableCopies - 1 })
    .eq("id", bookId);

  // 3. Create loan
  const loanDate = today();
  const due = new Date();
  due.setDate(due.getDate() + daysToLend);
  const dueDate = due.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("loans")
    .insert({
      book_id: bookId,
      member_id: memberId,
      loan_date: loanDate,
      due_date: dueDate,
      return_date: null,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return toLoan(data as LoanRow);
}

export async function returnBook(loanId: number): Promise<Loan | null> {
  // 1. Get the loan
  const { data: loanRow, error: fetchErr } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .single();
  if (fetchErr || !loanRow) return null;
  const loan = toLoan(loanRow as LoanRow);
  if (loan.returnDate) return null; // already returned

  // 2. Mark returned
  const { data: updated, error: updateErr } = await supabase
    .from("loans")
    .update({ return_date: today(), status: "returned" })
    .eq("id", loanId)
    .select()
    .single();
  if (updateErr) throw updateErr;

  // 3. Increment available copies
  const book = await getBook(loan.bookId);
  if (book) {
    await supabase
      .from("books")
      .update({
        available_copies: Math.min(book.availableCopies + 1, book.totalCopies),
      })
      .eq("id", book.id);
  }

  return toLoan(updated as LoanRow);
}

export async function getActiveLoans(): Promise<Loan[]> {
  const loans = await refreshLoanStatuses();
  return loans.filter((l) => l.status !== "returned");
}

export async function getOverdueLoans(): Promise<Loan[]> {
  const loans = await refreshLoanStatuses();
  return loans.filter((l) => l.status === "overdue");
}

/** Get loan count per status */
export async function getLoanStats(): Promise<Record<LoanStatus, number>> {
  const loans = await refreshLoanStatuses();
  return {
    active: loans.filter((l) => l.status === "active").length,
    overdue: loans.filter((l) => l.status === "overdue").length,
    returned: loans.filter((l) => l.status === "returned").length,
  };
}
