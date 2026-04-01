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

export const defaultGenres: Genre[] = [
  "Roman",
  "Lyrik",
  "Sachbuch",
  "Krimi",
  "Kinderbuch",
  "Kunst",
  "Philosophie",
  "Sonstiges",
];

const CUSTOM_GENRES_KEY = "cafe-bibliothek-custom-genres";

function loadCustomGenres(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_GENRES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getAllGenres(): string[] {
  return [...defaultGenres, ...loadCustomGenres()];
}

export function addCustomGenre(genre: string): void {
  const custom = loadCustomGenres();
  const trimmed = genre.trim();
  if (!trimmed || getAllGenres().includes(trimmed)) return;
  custom.push(trimmed);
  localStorage.setItem(CUSTOM_GENRES_KEY, JSON.stringify(custom));
}

export function removeCustomGenre(genre: string): void {
  const custom = loadCustomGenres().filter((g) => g !== genre);
  localStorage.setItem(CUSTOM_GENRES_KEY, JSON.stringify(custom));
}

export function isCustomGenre(genre: string): boolean {
  return loadCustomGenres().includes(genre);
}

/** @deprecated Use getAllGenres() instead */
export const genres = defaultGenres;

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
  phone: string;
  address: string;
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
