import SperrmuellMapClient from "./SperrmuellMap.client";

export default function SperrmuellPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header>
          <p className="text-sm uppercase tracking-widest text-indigo-300">Sperrmüll Karte</p>
          <h1 className="mt-2 text-4xl font-bold">Sperrmüll-Termine in Bonn</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Wähle einen Punkt auf der Karte, lege einen Radius und Zeitraum fest – die Karte
            zeigt alle Straßen mit Sperrmüll-Abholung in der Nähe. Datenquelle: offene Daten der
            Stadt Bonn (bonnorange AöR).
          </p>
        </header>
        <SperrmuellMapClient />
      </div>
    </main>
  );
}
