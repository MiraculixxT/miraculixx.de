'use client';
import {useEffect, useRef, useState} from "react";
import {BLOCKY, BLOCKY_STEP, COIN, type Sprite} from "./sprites";

const SCALE = 2, H = 48, FLOOR = 8, SPEED = 42, GRAVITY = 420, JUMP = 135;

function bake(s: Sprite, flip = false) {
    const w = s.rows[0].length, c = document.createElement("canvas");
    c.width = w;
    c.height = s.rows.length;
    const ctx = c.getContext("2d")!;
    s.rows.forEach((row, y) => [...row].forEach((ch, x) => {
        if (!s.palette[ch]) return;
        ctx.fillStyle = s.palette[ch];
        ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }));
    return c;
}

const KEYS: Record<string, "l" | "r" | "j"> = {ArrowLeft: "l", a: "l", ArrowRight: "r", d: "r", ArrowUp: "j", w: "j", " ": "j"};

export default function FooterGame() {
    const wrap = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [coins, setCoins] = useState(0);

    useEffect(() => {
        const el = wrap.current!, cv = canvas.current!, ctx = cv.getContext("2d")!;
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const frames = [BLOCKY, BLOCKY_STEP].map(s => [bake(s), bake(s, true)]);
        const coin = bake(COIN);
        let W = 0;
        const resize = () => {
            W = Math.max(64, Math.ceil(el.clientWidth / SCALE));
            cv.width = W;
            cv.height = H;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        const spawn = () => ({x: 16 + Math.random() * Math.max(1, W - 32), y: 12 + Math.random() * 12, back: 0});
        const p = {x: W * 0.55, y: 0, vy: 0, dir: 1, walk: 0};
        const items = [spawn(), spawn(), spawn()];
        const keys = new Set<string>();
        let target: number | null = null, lastInput = -Infinity, idleUntil = 0, last = performance.now(), raf = 0, visible = true;

        const jump = () => { if (p.y === 0) p.vy = JUMP; };
        const onKey = (e: KeyboardEvent, down: boolean) => {
            const k = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
            if (!k || document.activeElement !== el) return;
            e.preventDefault();
            lastInput = performance.now();
            target = null;
            if (k === "j") { if (down) jump(); } else if (down) keys.add(k); else keys.delete(k);
        };
        const down = (e: KeyboardEvent) => onKey(e, true), up = (e: KeyboardEvent) => onKey(e, false);
        const onPointer = (e: PointerEvent) => {
            target = (e.clientX - el.getBoundingClientRect().left) / SCALE;
            lastInput = performance.now();
            jump();
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        el.addEventListener("pointerdown", onPointer);
        const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
        io.observe(el);

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
            last = now;
            if (!visible) return;

            if (!reduce && now - lastInput > 5000 && target === null && now > idleUntil) target = 10 + Math.random() * (W - 20);
            let move = (keys.has("r") ? 1 : 0) - (keys.has("l") ? 1 : 0);
            if (target !== null) {
                if (Math.abs(target - p.x) < 2) {
                    target = null;
                    idleUntil = now + 1500 + Math.random() * 3500;
                } else move = Math.sign(target - p.x);
            }
            if (!reduce && now - lastInput > 5000 && move !== 0 && Math.random() < 0.004) jump();

            p.x = Math.min(W - 6, Math.max(6, p.x + move * SPEED * dt));
            if (move) { p.dir = move; p.walk += dt; } else p.walk = 0;
            p.vy -= GRAVITY * dt;
            p.y = Math.max(0, p.y + p.vy * dt);
            if (p.y === 0) p.vy = 0;

            for (const c of items) {
                if (c.back) { if (now > c.back) Object.assign(c, spawn()); continue; }
                if (Math.abs(c.x - p.x) < 7 && c.y + 4 > p.y && c.y < p.y + 16) {
                    c.back = now + 2500;
                    setCoins(n => n + 1);
                }
            }

            ctx.clearRect(0, 0, W, H);
            const top = H - FLOOR;
            ctx.fillStyle = "#2b2150";
            ctx.fillRect(0, top, W, FLOOR);
            ctx.fillStyle = "#3d3070";
            ctx.fillRect(0, top, W, 1);
            ctx.fillStyle = "#1a1433";
            ctx.fillRect(0, top + 4, W, 1);
            for (let x = 0; x < W; x += 8) {
                ctx.fillRect(x, top + 1, 1, 3);
                ctx.fillRect(x + 4, top + 5, 1, 3);
            }
            for (const c of items) if (!c.back) ctx.drawImage(coin, Math.round(c.x - 4), Math.round(top - c.y - 8 + Math.sin(now / 300 + c.x) * 1.5));
            const f = frames[move && p.y === 0 ? Math.floor(p.walk * 8) % 2 : 0][p.dir < 0 ? 1 : 0];
            ctx.drawImage(f, Math.round(p.x - 6), Math.round(top - 16 - p.y));
        };
        tick(last);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
            el.removeEventListener("pointerdown", onPointer);
        };
    }, []);

    return (
        <div ref={wrap} tabIndex={0} aria-label="Tiny game: arrow keys to move, space to jump" className="site-game group relative h-24 w-full cursor-pointer outline-none">
            <canvas ref={canvas} className="absolute inset-0 h-full w-full [image-rendering:pixelated]"/>
            <span className="absolute right-3 top-2 font-silk text-[10px] text-site-dim opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
                ← → / space · coins {coins}
            </span>
        </div>
    );
}
