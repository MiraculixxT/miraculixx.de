"use client";

import { useState } from "react";
import { accessProtectedAPI } from "@/components/apiRequests";

const PAGE_PATH = "/worlds/admin";

type ActionState = {
  loading: boolean;
  message: string | null;
  error: string | null;
};

const IDLE: ActionState = { loading: false, message: null, error: null };

type ModRow = { name: string; modId: string; link: string };
type PackRow = { name: string; download: string; included: boolean };

type ManualForm = {
  id: string;
  title: string;
  download: string;
  description: string;
  icon: string;
  mc: string;
  categories: string;
  version: string;
  downloads: string;
  updated: string;
  website: string;
  trailer: string;
  readme: string;
  gallery: string;
  requiredMods: ModRow[];
  requiredPacks: PackRow[];
};

const EMPTY_FORM: ManualForm = {
  id: "",
  title: "",
  download: "",
  description: "",
  icon: "",
  mc: "",
  categories: "",
  version: "",
  downloads: "",
  updated: "",
  website: "",
  trailer: "",
  readme: "",
  gallery: "",
  requiredMods: [],
  requiredPacks: [],
};

const KNOWN_CATEGORIES = ["adventure", "parkour", "survival", "puzzle", "horror", "minigames", "build"];

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function describeFailure(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    if (parsed?.error?.message) return `${parsed.error.code ?? response.status}: ${parsed.error.message}`;
  } catch {
    /* not an error envelope */
  }
  return text ? `Request failed (${response.status}): ${text}` : `Request failed (${response.status})`;
}

function buildPayload(form: ManualForm) {
  const payload: Record<string, unknown> = {
    id: form.id.trim(),
    title: form.title.trim(),
    download: form.download.trim(),
  };

  const optionalText: [keyof ManualForm, string][] = [
    ["description", "description"],
    ["icon", "icon"],
    ["version", "version"],
    ["website", "website"],
    ["trailer", "trailer"],
    ["readme", "readme"],
  ];
  for (const [field, key] of optionalText) {
    const value = String(form[field]).trim();
    if (value) payload[key] = value;
  }

  const mc = splitList(form.mc);
  if (mc.length) payload.mc = mc;
  const categories = splitList(form.categories);
  if (categories.length) payload.categories = categories;
  const gallery = splitList(form.gallery);
  if (gallery.length) payload.gallery = gallery;

  if (form.downloads.trim()) payload.downloads = Number(form.downloads);
  if (form.updated.trim()) payload.updated = Number(form.updated);

  const mods = form.requiredMods
    .filter((mod) => mod.name.trim())
    .map((mod) => ({
      name: mod.name.trim(),
      ...(mod.modId.trim() ? { modId: mod.modId.trim() } : {}),
      ...(mod.link.trim() ? { link: mod.link.trim() } : {}),
    }));
  if (mods.length) payload.requiredMods = mods;

  const packs = form.requiredPacks
    .filter((pack) => pack.name.trim())
    .map((pack) => ({
      name: pack.name.trim(),
      ...(pack.download.trim() ? { download: pack.download.trim() } : {}),
      ...(pack.included ? { included: true } : {}),
    }));
  if (packs.length) payload.requiredPacks = packs;

  return payload;
}

export default function WorldsAdminPage() {
  const [form, setForm] = useState<ManualForm>(EMPTY_FORM);
  const [upsert, setUpsert] = useState<ActionState>(IDLE);
  const [deleteId, setDeleteId] = useState("");
  const [remove, setRemove] = useState<ActionState>(IDLE);
  const [scan, setScan] = useState<ActionState>(IDLE);
  const [refresh, setRefresh] = useState<ActionState>(IDLE);

  function set<K extends keyof ManualForm>(key: K, value: ManualForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitManual(event: React.FormEvent) {
    event.preventDefault();
    if (!form.id.trim() || !form.title.trim() || !form.download.trim()) {
      setUpsert({ loading: false, message: null, error: "id, title and download are required" });
      return;
    }

    setUpsert({ loading: true, message: null, error: null });
    try {
      const response = await accessProtectedAPI(
        "worlds/manual",
        { "Content-Type": "application/json" },
        PAGE_PATH,
        "PUT",
        JSON.stringify(buildPayload(form)),
      );
      if (!response.ok) {
        setUpsert({ loading: false, message: null, error: await describeFailure(response) });
        return;
      }
      const entry = await response.json();
      setUpsert({ loading: false, message: `Stored "${entry.title ?? form.id}" (${entry.id ?? form.id})`, error: null });
    } catch {
      setUpsert({ loading: false, message: null, error: "Request failed" });
    }
  }

  async function deleteManual() {
    const id = deleteId.trim();
    if (!id) {
      setRemove({ loading: false, message: null, error: "Enter an id" });
      return;
    }
    if (!window.confirm(`Permanently delete manual world "${id}"? This also removes its detail entry.`)) return;

    setRemove({ loading: true, message: null, error: null });
    try {
      const response = await accessProtectedAPI(
        `worlds/manual/${encodeURIComponent(id)}`,
        {},
        PAGE_PATH,
        "DELETE",
      );
      if (!response.ok) {
        setRemove({ loading: false, message: null, error: await describeFailure(response) });
        return;
      }
      setRemove({ loading: false, message: `Removed ${id}`, error: null });
      setDeleteId("");
    } catch {
      setRemove({ loading: false, message: null, error: "Request failed" });
    }
  }

  async function post(path: string, setter: React.Dispatch<React.SetStateAction<ActionState>>) {
    setter({ loading: true, message: null, error: null });
    try {
      const response = await accessProtectedAPI(path, {}, PAGE_PATH, "POST");
      if (!response.ok) {
        setter({ loading: false, message: null, error: await describeFailure(response) });
        return;
      }
      const text = await response.text();
      setter({ loading: false, message: text || "Done", error: null });
    } catch {
      setter({ loading: false, message: null, error: "Request failed" });
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h1 className="text-2xl font-semibold">Worlds Admin</h1>
          <p className="mt-1 text-sm text-slate-400">
            Curate manual worlds and run maintenance on the world index.
          </p>
        </div>

        <form onSubmit={submitManual} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Create or overwrite a manual world</h2>
          <p className="mt-1 text-sm text-slate-400">
            Upsert keyed by id. An existing id is overwritten in full — omitted fields are cleared, not merged.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="id *" value={form.id} onChange={(v) => set("id", v)} maxLength={64} placeholder="stable-client-id" />
            <Field label="title *" value={form.title} onChange={(v) => set("title", v)} />
            <Field
              label="download * (direct world zip)"
              value={form.download}
              onChange={(v) => set("download", v)}
              className="sm:col-span-2"
              placeholder="https://.../world.zip"
            />
            <Field label="description" value={form.description} onChange={(v) => set("description", v)} className="sm:col-span-2" />
            <Field label="icon URL" value={form.icon} onChange={(v) => set("icon", v)} />
            <Field label="website" value={form.website} onChange={(v) => set("website", v)} />
            <Field label="trailer" value={form.trailer} onChange={(v) => set("trailer", v)} />
            <Field label="version" value={form.version} onChange={(v) => set("version", v)} />
            <Field label="mc versions (comma separated)" value={form.mc} onChange={(v) => set("mc", v)} placeholder="1.21.1, 1.21.4" />
            <Field
              label="categories (comma separated)"
              value={form.categories}
              onChange={(v) => set("categories", v)}
              placeholder={KNOWN_CATEGORIES.join(", ")}
            />
            <Field label="downloads" value={form.downloads} onChange={(v) => set("downloads", v)} type="number" placeholder="0" />
            <Field label="updated (epoch millis)" value={form.updated} onChange={(v) => set("updated", v)} type="number" placeholder="0" />
          </div>

          <TextArea label="gallery URLs (one per line)" value={form.gallery} onChange={(v) => set("gallery", v)} rows={3} />
          <TextArea label="readme (markdown)" value={form.readme} onChange={(v) => set("readme", v)} rows={6} />

          <RowEditor
            title="Required mods"
            addLabel="Add mod"
            rows={form.requiredMods}
            onAdd={() => set("requiredMods", [...form.requiredMods, { name: "", modId: "", link: "" }])}
            onRemove={(index) => set("requiredMods", form.requiredMods.filter((_, i) => i !== index))}
            render={(mod, index) => (
              <>
                <Field
                  label="name *"
                  value={mod.name}
                  onChange={(v) => set("requiredMods", form.requiredMods.map((row, i) => (i === index ? { ...row, name: v } : row)))}
                />
                <Field
                  label="modId"
                  value={mod.modId}
                  onChange={(v) => set("requiredMods", form.requiredMods.map((row, i) => (i === index ? { ...row, modId: v } : row)))}
                />
                <Field
                  label="link"
                  value={mod.link}
                  onChange={(v) => set("requiredMods", form.requiredMods.map((row, i) => (i === index ? { ...row, link: v } : row)))}
                />
              </>
            )}
          />

          <RowEditor
            title="Required resource packs"
            addLabel="Add pack"
            rows={form.requiredPacks}
            onAdd={() => set("requiredPacks", [...form.requiredPacks, { name: "", download: "", included: false }])}
            onRemove={(index) => set("requiredPacks", form.requiredPacks.filter((_, i) => i !== index))}
            render={(pack, index) => (
              <>
                <Field
                  label="name *"
                  value={pack.name}
                  onChange={(v) => set("requiredPacks", form.requiredPacks.map((row, i) => (i === index ? { ...row, name: v } : row)))}
                />
                <Field
                  label="download"
                  value={pack.download}
                  onChange={(v) => set("requiredPacks", form.requiredPacks.map((row, i) => (i === index ? { ...row, download: v } : row)))}
                />
                <label className="flex items-end gap-2 pb-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={pack.included}
                    onChange={(event) =>
                      set(
                        "requiredPacks",
                        form.requiredPacks.map((row, i) => (i === index ? { ...row, included: event.target.checked } : row)),
                      )
                    }
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                  />
                  ships inside the zip
                </label>
              </>
            )}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={upsert.loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {upsert.loading ? "Saving..." : "Save world"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setUpsert(IDLE);
              }}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Reset form
            </button>
          </div>
          <Result state={upsert} />
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Delete a manual world</h2>
          <p className="mt-1 text-sm text-slate-400">
            Only reaches manual entries — scraped rows reappear on the next collection run.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              value={deleteId}
              onChange={(event) => setDeleteId(event.target.value)}
              placeholder="world id"
              className="min-w-56 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              disabled={remove.loading}
              onClick={deleteManual}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {remove.loading ? "Deleting..." : "Delete"}
            </button>
          </div>
          <Result state={remove} />
        </div>

        <AdminAction
          title="Trigger Modrinth scan"
          description="Fire-and-forget; the same scan runs daily at 01:00. Aborts on the first failed Modrinth request."
          buttonLabel="Run scan"
          state={scan}
          onRun={() => post("worlds/scan", setScan)}
        />

        <AdminAction
          title="Refresh cache"
          description="Clears the detail cache and rebuilds the brotli index blob. Collects nothing."
          buttonLabel="Run refresh-cache"
          state={refresh}
          onRun={() => post("worlds/refresh-cache", setRefresh)}
        />
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="mt-3 flex flex-col gap-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs outline-none focus:border-indigo-500"
      />
    </label>
  );
}

function RowEditor<T>({
  title,
  addLabel,
  rows,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  addLabel: string;
  rows: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (row: T, index: number) => React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
        >
          {addLabel}
        </button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          {render(row, index)}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="self-end rounded-md border border-rose-800 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function Result({ state }: { state: ActionState }) {
  if (state.message) {
    return <p className="mt-3 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-300">{state.message}</p>;
  }
  if (state.error) {
    return <p className="mt-3 rounded-md bg-rose-500/10 p-3 text-sm text-rose-300">{state.error}</p>;
  }
  return null;
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
      <Result state={state} />
    </div>
  );
}