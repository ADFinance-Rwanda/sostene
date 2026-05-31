import { useKeycloak } from "@react-keycloak/web";
import { NavLink } from "react-router-dom";

function navLinkClass({ isActive }: { isActive: boolean }) {
  const base = "px-3 py-1.5 rounded-md font-medium transition-colors";
  return isActive
    ? `${base} text-indigo-600 bg-indigo-50`
    : `${base} text-slate-500 hover:text-slate-800 hover:bg-slate-100`;
}

export default function NavBar() {
  const { keycloak } = useKeycloak();
  const profile = keycloak.tokenParsed as
    | { name?: string; preferred_username?: string; email?: string }
    | undefined;
  const displayName =
    profile?.name ?? profile?.preferred_username ?? profile?.email ?? "User";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-6 px-4 sm:px-6 py-3">
        <NavLink
          to="/tasks"
          className="flex items-center gap-2 font-semibold text-slate-900 hover:text-slate-700 shrink-0"
        >
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold shrink-0">
            ✓
          </span>
          <span className="hidden xs:inline sm:inline">Task Manager</span>
        </NavLink>
        <nav className="flex gap-1 flex-1 min-w-0">
          <NavLink to="/tasks" className={navLinkClass}>
            Tasks
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-slate-500 font-medium hidden md:inline max-w-[160px] truncate">
            {displayName}
          </span>
          <button
            type="button"
            onClick={() =>
              keycloak.logout({ redirectUri: window.location.origin })
            }
            className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 sm:px-3 py-1.5 text-sm sm:text-base text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
