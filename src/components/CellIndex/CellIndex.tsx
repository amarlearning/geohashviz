import React, { CSSProperties, useMemo } from "react";
import Geohash from "../../GeohashMap/model/Geohash";
import {
  cellSize,
  formatSize,
  getBoundingBox,
  precisionLadder,
  LadderRung,
} from "../../Algorithms/geohash";
import "./CellIndex.css";

interface CellIndexProps {
  geohashes: Geohash[];
  /** Cell shown in the ladder: the hovered one, else the pinned one */
  activeHash: string | null;
  pinnedHash: string | null;
  onHover: (geohash: string | null) => void;
  onPin: (geohash: string) => void;
  onPreviewPrefix: (prefix: string | null) => void;
  onFlyToPrefix: (prefix: string) => void;
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Each character flips in on its own beat, like a split-flap board */
const HashChars: React.FC<{ hash: string; row?: number }> = ({
  hash,
  row = 0,
}) => (
  <span className="hash-chars" aria-label={hash}>
    {hash.split("").map((ch, i) => (
      <span
        key={i}
        className="hash-ch"
        aria-hidden="true"
        style={{ "--c": i, "--r": row } as Vars}
      >
        {ch}
      </span>
    ))}
  </span>
);

/** The parent's grid with the one cell this character picks */
const RungGrid: React.FC<{ rung: LadderRung; index: number }> = ({
  rung,
  index,
}) => {
  const unit = 5;
  const w = rung.cols * unit;
  const h = rung.rows * unit;
  const lines: string[] = [];
  for (let c = 1; c < rung.cols; c++) lines.push(`M${c * unit} 0V${h}`);
  for (let r = 1; r < rung.rows; r++) lines.push(`M0 ${r * unit}H${w}`);
  return (
    <svg
      className="rung-grid"
      width={w + 1}
      height={h + 1}
      viewBox={`-0.5 -0.5 ${w + 1} ${h + 1}`}
      aria-hidden="true"
    >
      <rect className="rung-grid-frame" width={w} height={h} />
      <path className="rung-grid-lines" d={lines.join("")} />
      <rect
        className="rung-grid-cell"
        x={rung.col * unit}
        y={rung.row * unit}
        width={unit}
        height={unit}
        style={{ "--i": index } as Vars}
      />
    </svg>
  );
};

const CellIndex: React.FC<CellIndexProps> = ({
  geohashes,
  activeHash,
  pinnedHash,
  onHover,
  onPin,
  onPreviewPrefix,
  onFlyToPrefix,
}) => {
  const ladder = useMemo(
    () => (activeHash ? precisionLadder(activeHash) : []),
    [activeHash]
  );

  return (
    <section className="cell-index" aria-labelledby="cell-index-heading">
      <div className="panel-heading-row">
        <h2 id="cell-index-heading" className="panel-heading">
          Cells
        </h2>
        <span className="panel-count" key={geohashes.length}>
          {geohashes.length}
        </span>
      </div>

      {geohashes.length === 0 ? (
        <p className="panel-empty">
          Nothing plotted yet. Paste geohashes above, one per line, or load the
          sample.
        </p>
      ) : (
        <ul className="cell-list" onMouseLeave={() => onHover(null)}>
          {geohashes.map((g, row) => {
            const size = cellSize(getBoundingBox(g.geohash));
            const pinned = pinnedHash === g.geohash;
            return (
              <li key={`${g.geohash}-${row}`}>
                <button
                  type="button"
                  className={`cell-row${pinned ? " is-pinned" : ""}${
                    activeHash === g.geohash ? " is-active" : ""
                  }`}
                  aria-pressed={pinned}
                  onMouseEnter={() => onHover(g.geohash)}
                  onFocus={() => onHover(g.geohash)}
                  onBlur={() => onHover(null)}
                  onClick={() => onPin(g.geohash)}
                  style={{ "--r": row } as Vars}
                >
                  <HashChars hash={g.geohash} row={row} />
                  <span className="cell-size">{formatSize(size)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {pinnedHash && (
        <p className="neighbour-hint">
          The dashed cells around <code>{pinnedHash}</code> are the 8 that touch
          it. Click one on the map to add it.
        </p>
      )}

      {geohashes.length > 0 && (
        <div className="ladder" aria-live="polite">
          {activeHash ? (
            <>
              <h3 className="ladder-heading">
                How <code>{activeHash}</code> narrows down
              </h3>
              <ol
                className="ladder-list"
                key={activeHash}
                onMouseLeave={() => onPreviewPrefix(null)}
              >
                {ladder.map((rung, i) => (
                  <li key={rung.prefix} style={{ "--i": i } as Vars}>
                    <button
                      type="button"
                      className="rung"
                      onMouseEnter={() => onPreviewPrefix(rung.prefix)}
                      onFocus={() => onPreviewPrefix(rung.prefix)}
                      onBlur={() => onPreviewPrefix(null)}
                      onClick={() => onFlyToPrefix(rung.prefix)}
                      aria-label={`Zoom to ${rung.prefix}, ${formatSize(rung.size)}`}
                    >
                      <RungGrid rung={rung} index={i} />
                      <span className="rung-prefix">
                        <span className="rung-known">
                          {rung.prefix.slice(0, -1)}
                        </span>
                        <span className="rung-new">
                          {rung.prefix.slice(-1)}
                        </span>
                      </span>
                      <span className="rung-size">{formatSize(rung.size)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="ladder-hint">
              Point at a cell to see how each character narrows it down. Click
              one to show its neighbours.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default CellIndex;
