import { useState, useMemo, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, UserCheck, UserX, Pencil, Phone, MapPin } from "lucide-react";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Loading from "../components/ui/Loading";
import { useDebounce } from "../hooks/useDebounce";
import { getMembers, addMember, updateMember } from "../services/libraryStore";
import type { Member } from "../data/models";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [modalOpen, setModalOpen] = useState(false);

  // Edit state
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const refresh = useCallback(async () => {
    const data = await getMembers();
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return members;
    const q = debouncedSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [members, debouncedSearch]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addMember({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || "",
      address: (fd.get("address") as string) || "",
    });
    setModalOpen(false);
    refresh();
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMember) return;
    const fd = new FormData(e.currentTarget);
    await updateMember(editingMember.id, {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || "",
      address: (fd.get("address") as string) || "",
    });
    setEditingMember(null);
    refresh();
  };

  const toggleActive = async (id: number, active: boolean) => {
    await updateMember(id, { active: !active });
    refresh();
  };

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Mitglieder — Café Bibliothek</title>
      </Helmet>

      <section className="px-4 pt-6 pb-8 md:px-8">
        <div className="mx-auto max-w-2xl md:max-w-4xl">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-xl font-bold text-charcoal">
              Mitglieder
            </h1>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Neu
            </Button>
          </div>

          <div className="mt-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Name oder E-Mail…"
            />
          </div>

          {/* Mobile: card list */}
          <ul className="mt-5 space-y-3 md:hidden">
            {filtered.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-2xl bg-cream p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${m.active ? "bg-sage-light text-sage-dark" : "bg-gray-100 text-gray-400"}`}
                  >
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-charcoal">
                      {m.name}
                    </p>
                    <p className="truncate text-xs text-warm-gray">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingMember(m)}
                      className="rounded-full p-1.5 text-warm-gray/60 transition-colors active:bg-sage-light/30 active:text-sage-dark"
                      title="Bearbeiten"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(m.id, m.active)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        m.active
                          ? "bg-sage-light text-sage-dark"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {m.active ? "Aktiv" : "Inaktiv"}
                    </button>
                  </div>
                </div>
                {/* Extra info row */}
                {(m.phone || m.address) && (
                  <div className="flex flex-wrap gap-3 pl-13 text-[11px] text-warm-gray">
                    {m.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {m.phone}
                      </span>
                    )}
                    {m.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {m.address}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-5 hidden overflow-x-auto rounded-2xl bg-cream shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sage-light/40 text-xs uppercase tracking-wider text-warm-gray">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">E-Mail</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">Adresse</th>
                  <th className="px-5 py-3">Beigetreten</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-light/20">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-sage-light/10"
                  >
                    <td className="px-5 py-3 font-medium text-charcoal">
                      {m.name}
                    </td>
                    <td className="px-5 py-3 text-warm-gray">{m.email}</td>
                    <td className="px-5 py-3 text-warm-gray">
                      {m.phone || "—"}
                    </td>
                    <td className="max-w-[160px] truncate px-5 py-3 text-warm-gray">
                      {m.address || "—"}
                    </td>
                    <td className="px-5 py-3 text-warm-gray">{m.joinedDate}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.active ? "bg-sage-light text-sage-dark" : "bg-gray-100 text-gray-500"}`}
                      >
                        {m.active ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {m.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="text-xs text-warm-gray transition-colors hover:text-sage-dark"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => toggleActive(m.id, m.active)}
                          className="text-xs text-warm-gray transition-colors hover:text-sage-dark"
                        >
                          {m.active ? "Deaktivieren" : "Aktivieren"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="mt-12 text-center text-sm text-warm-gray">
              Keine Mitglieder gefunden.
            </p>
          )}
        </div>
      </section>

      {/* Add member modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Neues Mitglied"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <input
            name="name"
            required
            placeholder="Name *"
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-Mail *"
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Telefonnummer"
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          />
          <input
            name="address"
            placeholder="Adresse"
            className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
          />
          <Button type="submit" className="w-full justify-center">
            Speichern
          </Button>
        </form>
      </Modal>

      {/* Edit member modal */}
      <Modal
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Mitglied bearbeiten"
      >
        {editingMember && (
          <form onSubmit={handleEdit} className="space-y-4">
            <input
              name="name"
              required
              defaultValue={editingMember.name}
              placeholder="Name *"
              className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
            />
            <input
              name="email"
              type="email"
              required
              defaultValue={editingMember.email}
              placeholder="E-Mail *"
              className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
            />
            <input
              name="phone"
              type="tel"
              defaultValue={editingMember.phone}
              placeholder="Telefonnummer"
              className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
            />
            <input
              name="address"
              defaultValue={editingMember.address}
              placeholder="Adresse"
              className="w-full rounded-lg border border-sage-light bg-offwhite px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sage-dark"
            />
            <Button type="submit" className="w-full justify-center">
              Änderungen speichern
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
