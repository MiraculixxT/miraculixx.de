"use client";

import dynamic from "next/dynamic";

const SperrmuellMap = dynamic(() => import("./SperrmuellMap"), {
  ssr: false,
  loading: () => <div className="h-[70vh] animate-pulse rounded-2xl bg-slate-900" />,
});

export default function SperrmuellMapClient() {
  return <SperrmuellMap />;
}
