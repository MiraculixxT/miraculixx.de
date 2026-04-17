"use client";

import { useEffect, useState } from "react";
import { accessProtectedAPI } from "@/components/apiRequests";

type ActionState = {
  loading: boolean;
  message: string | null;
  error: string | null;
};

const INITIAL_ACTION_STATE: ActionState = {
  loading: false,
  message: null,
  error: null,
};

export default function StatsAdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState<ActionState>(INITIAL_ACTION_STATE);
  const [refreshCache, setRefreshCache] = useState<ActionState>(INITIAL_ACTION_STATE);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await accessProtectedAPI("stats/admin", {}, "/stats/ig/admin");
        if (cancelled) return;
        if (!response.ok) {
          setLoadError(`Failed to verify admin status (${response.status})`);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(true);
      } catch {
        if (!cancelled) {
          setLoadError("Could not contact the admin API");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function runAction(
    path: string,
    setter: React.Dispatch<React.SetStateAction<ActionState>>,
  ) {
    setter({ loading: true, message: null, error: null });
    try {
      const response = await accessProtectedAPI(path, {}, "/stats/ig/admin", "POST");
      if (!response.ok) {
        setter({ loading: false, message: null, error: `Request failed (${response.status})` });
        return;
      }
      const text = await response.text();
      setter({ loading: false, message: text || "Done", error: null });
    } catch {
      setter({ loading: false, message: null, error: "Request failed" });
    }
  }

  if (checking) {
    return <p className="text-sm text-slate-400">Checking permissions...</p>;
  }

  if (loadError) {
    return <p className="rounded-lg bg-rose-500/10 p-3 text-rose-300">{loadError}</p>;
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="mt-2 text-sm text-slate-400">
          Your account does not have admin permissions for the stats API.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-400">
          Trigger maintenance actions on the Instant Gaming stats backend.
        </p>
      </div>

      <AdminAction
        title="Force update"
        description="Triggers an immediate scrape run, bypassing the normal schedule."
        buttonLabel="Run force-update"
        state={forceUpdate}
        onRun={() => runAction("stats/force-update", setForceUpdate)}
      />

      <AdminAction
        title="Refresh cache"
        description="Invalidates and rebuilds the stats API response cache."
        buttonLabel="Run refresh-cache"
        state={refreshCache}
        onRun={() => runAction("stats/refresh-cache", setRefreshCache)}
      />
    </section>
  );
}

function AdminAction({
  title,
  description,
  buttonLabel,
  state,
  onRun,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  state: ActionState;
  onRun: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <button
          type="button"
          disabled={state.loading}
          onClick={onRun}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.loading ? "Running..." : buttonLabel}
        </button>
      </div>
      {state.message ? (
        <p className="mt-3 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-300">{state.message}</p>
      ) : null}
      {state.error ? (
        <p className="mt-3 rounded-md bg-rose-500/10 p-3 text-sm text-rose-300">{state.error}</p>
      ) : null}
    </div>
  );
}
