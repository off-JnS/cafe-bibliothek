import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import Button from "./ui/Button";

const LIBRARY_PASSWORD = "cafe2026";
export const SESSION_KEY = "cafe-bibliothek-auth";

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

interface Props {
  children: ReactNode;
}

export default function PasswordGate({ children }: Props) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === LIBRARY_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-offwhite px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl bg-cream p-8 shadow-lg"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-light">
            <Lock className="h-7 w-7 text-sage-dark" />
          </div>
          <h1 className="font-heading text-xl font-bold text-charcoal">
            Café Bibliothek
          </h1>
          <p className="text-center text-sm text-warm-gray">
            Bitte Passwort eingeben, um fortzufahren.
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Passwort"
          autoFocus
          className={`w-full rounded-lg border bg-offwhite px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-sage-dark ${
            error ? "border-rose-400" : "border-sage-light"
          }`}
        />

        {error && (
          <p className="text-center text-xs font-medium text-rose-600">
            Falsches Passwort. Bitte erneut versuchen.
          </p>
        )}

        <Button type="submit" className="w-full justify-center">
          Eintreten
        </Button>
      </form>
    </div>
  );
}
