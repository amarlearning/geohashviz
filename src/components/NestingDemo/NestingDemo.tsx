import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { formatSize, precisionLadder } from "../../Algorithms/geohash";
import { prefersReducedMotion } from "../../GeohashMap/config/styleConfig";
import "./NestingDemo.css";

interface NestingDemoProps {
  geohash?: string;
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const STAGE = 320;
const STEP_MS = 2200;

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Fit a cols:rows grid into the square stage, centred */
const frameFor = (cols: number, rows: number): Frame => {
  const w = cols >= rows ? STAGE : (STAGE * cols) / rows;
  const h = rows >= cols ? STAGE : (STAGE * rows) / cols;
  return { x: (STAGE - w) / 2, y: (STAGE - h) / 2, w, h };
};

/**
 * A geohash drawn the way it is read: each character splits the current
 * square into a 32-cell grid and picks one, then the view dives into it.
 */
const NestingDemo: React.FC<NestingDemoProps> = ({ geohash = "gcpvj" }) => {
  const rungs = useMemo(() => precisionLadder(geohash), [geohash]);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const [step, setStep] = useState(reduced ? rungs.length - 1 : 0);
  const [playing, setPlaying] = useState(!reduced);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % rungs.length),
      step === rungs.length - 1 ? STEP_MS * 1.6 : STEP_MS
    );
    return () => window.clearTimeout(id);
  }, [playing, step, rungs.length]);

  const rung = rungs[step];
  const frame = frameFor(rung.cols, rung.rows);
  const cw = frame.w / rung.cols;
  const ch = frame.h / rung.rows;

  // Where this frame was a single cell in the previous one: zoom out of it
  let from = "translate(0px, 0px) scale(1)";
  if (step > 0) {
    const prev = rungs[step - 1];
    const pf = frameFor(prev.cols, prev.rows);
    const px = pf.x + (prev.col * pf.w) / prev.cols;
    const py = pf.y + (prev.row * pf.h) / prev.rows;
    const s = pf.w / prev.cols / frame.w;
    from = `translate(${px - frame.x * s}px, ${py - frame.y * s}px) scale(${s})`;
  }

  const lines: string[] = [];
  for (let c = 1; c < rung.cols; c++) {
    lines.push(`M${frame.x + c * cw} ${frame.y}v${frame.h}`);
  }
  for (let r = 1; r < rung.rows; r++) {
    lines.push(`M${frame.x} ${frame.y + r * ch}h${frame.w}`);
  }

  return (
    <figure className="nesting-demo">
      <svg
        className="nesting-stage"
        viewBox={`-2 -2 ${STAGE + 4} ${STAGE + 4}`}
        role="img"
        aria-label={`The geohash ${geohash} drawn one character at a time. Now showing ${rung.prefix}: a ${rung.cols} by ${rung.rows} grid, cell ${formatSize(rung.size)}.`}
      >
        <g
          key={step}
          className="nesting-frame"
          style={{ "--from": from } as Vars}
        >
          <rect
            className="nesting-ground"
            x={frame.x}
            y={frame.y}
            width={frame.w}
            height={frame.h}
          />
          <path className="nesting-lines" d={lines.join("")} />
          <rect
            className="nesting-cell"
            x={frame.x + rung.col * cw}
            y={frame.y + rung.row * ch}
            width={cw}
            height={ch}
          />
          <rect
            className="nesting-border"
            x={frame.x}
            y={frame.y}
            width={frame.w}
            height={frame.h}
          />
        </g>
      </svg>

      <figcaption className="nesting-caption">
        <span className="nesting-hash" aria-hidden="true">
          {geohash.split("").map((c, i) => (
            <span
              key={i}
              className={
                i < step ? "is-done" : i === step ? "is-now" : "is-next"
              }
            >
              {c}
            </span>
          ))}
        </span>
        <span className="nesting-facts" key={step}>
          {rung.cols} × {rung.rows} grid, cell {formatSize(rung.size)}
        </span>
        {!reduced && (
          <button
            type="button"
            className="nesting-toggle"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause animation" : "Play animation"}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              {playing ? (
                <path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" />
              ) : (
                <path d="M3 2l7 4-7 4z" fill="currentColor" />
              )}
            </svg>
          </button>
        )}
      </figcaption>
    </figure>
  );
};

export default NestingDemo;
