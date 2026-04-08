import { NavLink } from "react-router-dom";
import { BookOpen, LayoutDashboard, Library, Users, ArrowRightLeft, LogOut } from "lucide-react";
import { logout } from "./PasswordGate";

const links = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/buecher", label: "Bücher", icon: Library },
  { to: "/mitglieder", label: "Mitglieder", icon: Users },
  { to: "/ausleihen", label: "Ausleihen", icon: ArrowRightLeft },
];

export default function Navbar() {
  return (
    <>
      {/* Desktop top bar */}
      <header className="sticky top-0 z-50 hidden border-b border-sage-light/30 bg-offwhite/90 backdrop-blur-md md:block">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <NavLink to="/" className="flex items-center gap-2 text-charcoal">
            <BookOpen className="h-5 w-5 text-sage-dark" />
            <span className="font-heading text-lg font-bold">Café Bibliothek</span>
          </NavLink>
          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sage-dark text-cream"
                      : "text-charcoal hover:bg-sage-light/50"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="ml-2 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-warm-gray transition-colors hover:bg-rose-50 hover:text-rose-600"
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sage-light/30 bg-offwhite/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around py-1.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  isActive ? "text-sage-dark" : "text-warm-gray"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium text-warm-gray transition-colors active:text-rose-600"
          >
            <LogOut className="h-5 w-5" />
            Abmelden
          </button>
        </div>
      </nav>
    </>
  );
}
