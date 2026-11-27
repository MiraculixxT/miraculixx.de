import type {CSSProperties, ReactNode} from "react";

export default function Display({id, index, title, led, meta, children}: {
    id: string; index: string; title: string; led: string; meta?: ReactNode; children: ReactNode
}) {
    return (
        <section id={id} className="notch mb-12 scroll-mt-6 bg-[#1a1530] p-2 sm:p-3">
            <div className="flex items-center justify-between gap-4 px-1 pb-3 font-pixel text-[10px] text-site-muted">
                <span className="flex items-center gap-3"><span className="led" style={{"--led": led} as CSSProperties}/>{index} · {title}</span>
                {meta && <span className="text-right">{meta}</span>}
            </div>
            <div className="overflow-hidden border-4 border-[#07050e]">{children}</div>
        </section>
    );
}
