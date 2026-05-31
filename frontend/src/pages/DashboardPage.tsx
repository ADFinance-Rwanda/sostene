import { useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAnalyticsSummary,
  getTasksByStatus,
  getTasksCreatedOverTime,
} from "../api/client";
import type { AnalyticsSummary, StatusBucket, TimeBucket } from "../api/types";
import { STATUS_COLORS, STATUS_LABELS } from "../lib/taskLabels";
import { getErrorMessage } from "../lib/errors";

type AsyncData<T> = { data: T | null; loading: boolean; error: string | null };

const initial = { data: null, loading: true, error: null };

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Wrapper that shows a spinner / error / content for one dashboard section.
function Section({
  title,
  loading,
  error,
  children,
}: {
  title: string;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5">
      <h2 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-3 sm:mb-4">
        {title}
      </h2>
      <div className="w-full" style={{ minHeight: 280 }}>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
            <div className="h-7 w-7 rounded-full border-[3px] border-slate-200 border-t-indigo-600 animate-spin" />
            <p>Loading…</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { keycloak } = useKeycloak();

  const [summary, setSummary] = useState<AsyncData<AnalyticsSummary>>(initial);
  const [byStatus, setByStatus] = useState<AsyncData<StatusBucket[]>>(initial);
  const [overTime, setOverTime] = useState<AsyncData<TimeBucket[]>>(initial);

  useEffect(() => {
    let cancelled = false;

    // Each section loads independently so one failure doesn't blank the page.
    function load<T>(
      fetcher: () => Promise<T>,
      setter: (s: AsyncData<T>) => void,
      fallbackMsg: string,
    ) {
      fetcher()
        .then(
          (data) => !cancelled && setter({ data, loading: false, error: null }),
        )
        .catch(
          (err) =>
            !cancelled &&
            setter({
              data: null,
              loading: false,
              error: getErrorMessage(err, fallbackMsg),
            }),
        );
    }

    load(getAnalyticsSummary, setSummary, "Failed to load summary");
    load(getTasksByStatus, setByStatus, "Failed to load tasks by status");
    load(
      () => getTasksCreatedOverTime(30),
      setOverTime,
      "Failed to load timeline",
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const profile = keycloak.tokenParsed as
    | { name?: string; preferred_username?: string; email?: string }
    | undefined;
  const userName =
    profile?.name ?? profile?.preferred_username ?? profile?.email ?? "there";

  const stats = [
    { label: "Total tasks", value: summary.data?.total ?? 0 },
    { label: "Completed", value: summary.data?.done ?? 0 },
    { label: "In progress", value: summary.data?.in_progress ?? 0 },
    {
      label: "Completion %",
      value: `${summary.data?.completion_percentage ?? 0}%`,
    },
  ];

  const pieData = (byStatus.data ?? []).map((b) => ({
    name: STATUS_LABELS[b.status],
    value: b.count,
    status: b.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">
          Welcome back, {userName}
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Here's an overview of your tasks.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 flex flex-col gap-1"
          >
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {summary.loading ? "—" : summary.error ? "!" : s.value}
            </span>
            <span className="text-xs sm:text-sm text-slate-500">{s.label}</span>
          </div>
        ))}
        {summary.error && (
          <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {summary.error}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Section
          title="Tasks by status"
          loading={byStatus.loading}
          error={byStatus.error}
        >
          {pieData.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No tasks yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  label={(entry) => `${entry.value}`}
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section
          title="Tasks created over the last 30 days"
          loading={overTime.loading}
          error={overTime.error}
        >
          {(overTime.data ?? []).length === 0 ? (
            <p className="text-center text-slate-400 py-8">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={overTime.data ?? []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  minTickGap={20}
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  width={28}
                />
                <Tooltip
                  labelFormatter={(label) => formatShortDate(String(label))}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  fill="url(#colorCount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>
    </div>
  );
}
