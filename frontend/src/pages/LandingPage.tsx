import { useKeycloak } from "@react-keycloak/web";
import { Navigate, useLocation } from "react-router-dom";

interface LocationState {
  from?: string;
}

export function LandingPage() {
  const { keycloak, initialized } = useKeycloak();
  const location = useLocation();

  // Already signed in? Skip the landing entirely.
  if (initialized && keycloak.authenticated) {
    return <Navigate to="/tasks" replace />;
  }

  function handleSignIn() {
    const fromPath = (location.state as LocationState | null)?.from;
    const redirectUri = `${window.location.origin}${fromPath ?? "/tasks"}`;
    keycloak.login({ redirectUri });
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="flex-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold shrink-0">
              ✓
            </span>
            <span className="font-semibold text-slate-900 tracking-tight">
              Task Manager
            </span>
          </div>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={!initialized}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            Sign in
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-xl text-center flex flex-col items-center gap-5 sm:gap-7">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl font-semibold text-slate-900 tracking-tight leading-[1.05]">
            Track tasks.
            <br />
            Get them done.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-md leading-relaxed">
            A focused board for your work. Sign in once and your tasks follow
            you.
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={!initialized}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {initialized ? "Get started" : "Connecting..."}
          </button>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
