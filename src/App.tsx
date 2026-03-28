import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Books = lazy(() => import("./pages/Books"));
const Members = lazy(() => import("./pages/Members"));
const Loans = lazy(() => import("./pages/Loans"));

const Spinner = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-light border-t-sage-dark" />
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<Spinner />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="buecher"
          element={
            <Suspense fallback={<Spinner />}>
              <Books />
            </Suspense>
          }
        />
        <Route
          path="mitglieder"
          element={
            <Suspense fallback={<Spinner />}>
              <Members />
            </Suspense>
          }
        />
        <Route
          path="ausleihen"
          element={
            <Suspense fallback={<Spinner />}>
              <Loans />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
