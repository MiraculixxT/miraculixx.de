import Link from "next/link";

export default function StatisticsHome() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header>
          <p className="text-sm uppercase tracking-widest text-indigo-300">Statistics</p>
          <h1 className="mt-2 text-4xl font-bold">Data analysis playground</h1>
          <p className="mt-2 text-slate-300">Analyze your Instant Gaming snapshots with charts and sortable game lists.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Link href="/stats/ig" className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-indigo-500">
            <h2 className="text-2xl font-semibold">Instant Gaming dashboard</h2>
            <p className="mt-2 text-slate-300">Follow game count, discount percentages and absolute discount trends over time.</p>
          </Link>

          <Link
            href="/stats/ig/games"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-indigo-500"
          >
            <h2 className="text-2xl font-semibold">Instant Gaming games table</h2>
            <p className="mt-2 text-slate-300">Filter and sort snapshot rows by discount %, absolute discount and price.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}