import type {Sprite} from "./sprites";

export default function PixelSprite({sprite, scale = 4, className}: { sprite: Sprite; scale?: number; className?: string }) {
    const w = sprite.rows[0].length, h = sprite.rows.length;
    return (
        <svg width={w * scale} height={h * scale} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" className={className} aria-hidden>
            {sprite.rows.flatMap((row, y) => [...row].map((c, x) =>
                sprite.palette[c] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={sprite.palette[c]}/> : null
            ))}
        </svg>
    );
}
