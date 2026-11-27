import type {ReactNode} from "react";

export default function MessagePanel({title, children, loading}: { title: string; children?: ReactNode; loading?: boolean }) {
    return (
        <div className="flex justify-center py-24">
            <div className="notch w-full max-w-lg bg-site-panel p-8 text-center">
                <h1 className="font-pixel text-lg text-white">{title}{loading && <span className="animate-pulse">…</span>}</h1>
                {children && <div className="mt-5 text-site-soft">{children}</div>}
            </div>
        </div>
    );
}

export const panelButton = "notch mt-4 block w-full bg-site-raised px-4 py-3 font-silk text-sm text-white transition hover:bg-site-line";
