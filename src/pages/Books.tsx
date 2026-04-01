import { useState, useMemo, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, BookOpen } from "lucide-react";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import CameraCapture from "../components/ui/CameraCapture";
import Loading from "../components/ui/Loading";
import { useDebounce } from "../hooks/useDebounce";
import { getBooks, addBook, deleteBook } from "../services/libraryStore";
import { genres, type Genre, type Book } from "../data/models";

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [genreFilter, setGenreFilter] = useState<Genre | "Alle">("Alle");
  const [modalOpen, setModalOpen] = useState(false);
  const [coverData, setCoverData] = useState("");

  const refresh = useCallback(async () => {
    const data = await getBooks();
    setBooks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    let list = books;
    if (genreFilter !== "Alle")
      list = list.filter((b) => b.genre === genreFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.includes(q),
      );
    }
    return list;
  }, [books, debouncedSearch, genreFilter]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addBook({
      title: fd.get("title") as string,
      author: fd.get("author") as string,
      isbn: fd.get("isbn") as string,
      genre: fd.get("genre") as Genre,
      coverImage: coverData,
      totalCopies: Number(fd.get("totalCopies")) || 1,
    });
    setModalOpen(false);
    setCoverData("");
    refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Buch wirklich löschen?")) return;
    await deleteBook(id);
    refresh();
  };

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Bücher — Café Bibliothek</title>
      </Helmet>

      <section className="px-4 pt-6 pb-8 md:px-8">
        <div className="mx-auto max-w-2xl md:max-w-5xl">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-xl font-bold text-charcoal">
              Bücher
            </h1>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Neu
            </Button>
          </div>

          {/* Search + genre filter */}
          <div className="mt-4 space-y-3">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Titel, Autor oder ISBN…"
            />
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {["Alle", ...genres].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenreFilter(g as Genre | "Alle")}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    genreFilter === g
                      ? "bg-sage-dark text-cream"
                      : "bg-cream text-charcoal active:bg-sage-light/50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Book grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((book) => (
              <div
                key={book.id}
                className="card-auto-visible group flex flex-col overflow-hidden rounded-2xl bg-cream shadow-sm transition-shadow active:shadow-lg"
              >
                {/* Cover or placeholder */}
                <div className="relative aspect-[2/3] overflow-hidden bg-sage-light/20">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-sage-light" />
                    </div>
                  )}
                  <span className="absolute top-1.5 right-1.5 rounded-full bg-offwhite/90 px-2 py-0.5 text-[10px] font-semibold text-sage-dark backdrop-blur-sm">
                    {book.genre}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {book.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-warm-gray">
                    {book.author}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span
                      className={`text-[11px] font-medium ${
                        book.availableCopies === 0
                          ? "text-rose-600"
                          : "text-sage-dark"
                      }`}
                    >
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-[11px] text-warm-gray/50 active:text-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-sm text-warm-gray">
              Keine Bücher gefunden.
            </p>
          )}
        </div>
      </section>

      {/* Add book modal — full screen on mobile */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCoverData("");
        }}
        title="Neues Buch"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex gap-4">
            <CameraCapture value={coverData} onChange={setCoverData} />
            <div className="flex-1 space-y-3">
              <input
                name="title"
                required
                placeholder="Titel *"
                className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
              />
              <input
                name="author"
                required
                placeholder="Autor *"
                className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
              />
            </div>
          </div>
          <input
            name="isbn"
            placeholder="ISBN"
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              name="genre"
              className="rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <input
              name="totalCopies"
              type="number"
              min={1}
              defaultValue={1}
              placeholder="Anzahl"
              className="rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
            />
          </div>
          <Button type="submit" className="w-full justify-center">
            Speichern
          </Button>
        </form>
      </Modal>
    </>
  );
}
