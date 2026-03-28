/* ── Data models for the Café Literalität lending library ── */

export type Genre =
  | "Roman"
  | "Lyrik"
  | "Sachbuch"
  | "Krimi"
  | "Kinderbuch"
  | "Kunst"
  | "Philosophie"
  | "Sonstiges";

export const genres: Genre[] = [
  "Roman",
  "Lyrik",
  "Sachbuch",
  "Krimi",
  "Kinderbuch",
  "Kunst",
  "Philosophie",
  "Sonstiges",
];

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  genre: Genre;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  addedDate: string; // ISO
}

export interface Member {
  id: number;
  name: string;
  email: string;
  joinedDate: string; // ISO
  active: boolean;
}

export type LoanStatus = "active" | "overdue" | "returned";

export interface Loan {
  id: number;
  bookId: number;
  memberId: number;
  loanDate: string;   // ISO
  dueDate: string;    // ISO
  returnDate: string | null;
  status: LoanStatus;
}
