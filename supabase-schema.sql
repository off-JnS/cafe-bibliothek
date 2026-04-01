-- ============================================================
-- Café Bibliothek — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Tables ───────────────────────────────────────────────────

CREATE TABLE books (
  id             SERIAL PRIMARY KEY,
  isbn           TEXT    NOT NULL DEFAULT '',
  title          TEXT    NOT NULL,
  author         TEXT    NOT NULL,
  genre          TEXT    NOT NULL DEFAULT 'Sonstiges',
  cover_image    TEXT    NOT NULL DEFAULT '',
  total_copies   INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  added_date     DATE    NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE members (
  id          SERIAL  PRIMARY KEY,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  joined_date DATE    NOT NULL DEFAULT CURRENT_DATE,
  active      BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE loans (
  id          SERIAL  PRIMARY KEY,
  book_id     INTEGER NOT NULL REFERENCES books(id)   ON DELETE CASCADE,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  loan_date   DATE    NOT NULL DEFAULT CURRENT_DATE,
  due_date    DATE    NOT NULL,
  return_date DATE,
  status      TEXT    NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'overdue', 'returned'))
);

-- 2) Row Level Security (permissive — no auth required) ──────

ALTER TABLE books   ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_books"   ON books   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_loans"   ON loans   FOR ALL USING (true) WITH CHECK (true);

-- 3) Seed data ────────────────────────────────────────────────

INSERT INTO books (id, isbn, title, author, genre, cover_image, total_copies, available_copies, added_date) VALUES
  (1,  '978-3-518-22525-0', 'Steppenwolf',                          'Hermann Hesse',         'Roman',       'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 2, 1, '2025-09-01'),
  (2,  '978-3-596-90578-0', 'Der Vorleser',                         'Bernhard Schlink',      'Roman',       'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 3, 2, '2025-09-05'),
  (3,  '978-3-446-25395-6', 'Tschick',                              'Wolfgang Herrndorf',    'Roman',       'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', 2, 2, '2025-10-12'),
  (4,  '978-3-458-17251-2', 'Siddharta',                            'Hermann Hesse',         'Philosophie', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop', 1, 0, '2025-10-20'),
  (5,  '978-3-499-25714-3', 'Die Vermessung der Welt',              'Daniel Kehlmann',       'Roman',       'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop', 2, 1, '2025-11-01'),
  (6,  '978-3-518-36804-1', 'Homo Faber',                           'Max Frisch',            'Roman',       'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop', 1, 1, '2025-11-10'),
  (7,  '978-3-423-12607-9', 'Das Parfum',                           'Patrick Süskind',       'Krimi',       'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop', 2, 2, '2025-11-15'),
  (8,  '978-3-257-06115-8', 'Der Richter und sein Henker',          'Friedrich Dürrenmatt',  'Krimi',       'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop', 1, 1, '2025-12-01'),
  (9,  '978-3-518-46854-3', 'Klara und die Sonne',                  'Kazuo Ishiguro',        'Roman',       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', 2, 1, '2026-01-10'),
  (10, '978-3-446-27008-3', 'Die Geschichte der Bienen',             'Maja Lunde',            'Sachbuch',    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop', 1, 0, '2026-01-20'),
  (11, '978-3-423-14554-4', 'Jim Knopf und Lukas der Lokomotivführer','Michael Ende',         'Kinderbuch',  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop', 2, 2, '2026-02-05'),
  (12, '978-3-458-36404-6', 'Gedichte',                             'Rainer Maria Rilke',    'Lyrik',       'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&h=600&fit=crop', 1, 1, '2026-02-14'),
  (13, '978-3-596-52219-5', 'Kunst sehen und verstehen',            'Michael Bockemühl',     'Kunst',       'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=600&fit=crop', 1, 1, '2026-03-01'),
  (14, '978-3-499-27178-1', 'Factfulness',                          'Hans Rosling',          'Sachbuch',    'https://images.unsplash.com/photo-1553729459-afe8f2e2ed08?w=400&h=600&fit=crop', 2, 2, '2026-03-10'),
  (15, '978-3-462-05032-2', 'Der Tunnel',                           'Friedrich Dürrenmatt',  'Sonstiges',   'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 1, 1, '2026-03-15');

INSERT INTO members (id, name, email, joined_date, active) VALUES
  (1, 'Anna Müller',   'anna@example.de',   '2025-09-10', true),
  (2, 'Jonas Weber',   'jonas@example.de',  '2025-10-01', true),
  (3, 'Lena Schmidt',  'lena@example.de',   '2025-11-15', true),
  (4, 'Milo Hoffmann', 'milo@example.de',   '2026-01-05', true),
  (5, 'Sophie Braun',  'sophie@example.de', '2026-02-20', false);

INSERT INTO loans (id, book_id, member_id, loan_date, due_date, return_date, status) VALUES
  (1, 1,  1, '2026-02-10', '2026-03-10', '2026-03-08', 'returned'),
  (2, 4,  2, '2026-02-20', '2026-03-20', NULL,         'overdue'),
  (3, 9,  3, '2026-03-05', '2026-04-05', NULL,         'active'),
  (4, 10, 1, '2026-03-01', '2026-03-22', NULL,         'overdue'),
  (5, 2,  4, '2026-03-15', '2026-04-15', NULL,         'active'),
  (6, 5,  2, '2026-03-18', '2026-04-18', NULL,         'active');

-- 4) Reset sequences to match seed IDs ───────────────────────

SELECT setval('books_id_seq',   (SELECT MAX(id) FROM books));
SELECT setval('members_id_seq', (SELECT MAX(id) FROM members));
SELECT setval('loans_id_seq',   (SELECT MAX(id) FROM loans));
