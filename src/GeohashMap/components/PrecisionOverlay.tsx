import React, { useMemo, useState } from "react";
import { Rectangle, Tooltip, useMapEvents } from "react-leaflet";
import { LatLngBoundsExpression } from "leaflet";
import {
  GeohashBounds,
  getBoundingBox,
  neighbourCells,
} from "../../Algorithms/geohash";
import { COLORS } from "../config/styleConfig";

interface PrecisionOverlayProps {
  /** Cell whose 8 neighbours are drawn: the pinned one, never a hover */
  pinnedGeohash?: string | null;
  /** Ladder rung being hovered: its coarser cell is outlined */
  previewPrefix?: string | null;
  /** Hashes already plotted; their neighbours are not drawn twice */
  plotted?: string[];
  onAddGeohash?: (geohash: string) => void;
  /** Clicking empty map closes the suggestions */
  onDismiss?: () => void;
}

const toLeaflet = (b: GeohashBounds): LatLngBoundsExpression => [
  [b.sw.lat, b.sw.lon],
  [b.ne.lat, b.ne.lon],
];

/**
 * Around the pinned cell, draw the 8 cells that physically touch it, with
 * their full hashes. These are what a proximity query has to search, and
 * on a parent's edge they start with different characters. Click one to
 * add it to the plotted list.
 */
const PrecisionOverlay: React.FC<PrecisionOverlayProps> = ({
  pinnedGeohash,
  previewPrefix,
  plotted = [],
  onAddGeohash,
  onDismiss,
}) => {
  // Re-read the cell's on-screen size whenever the view settles
  const [zoom, setZoom] = useState<number | null>(null);
  const map = useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
    click: () => onDismiss?.(),
  });

  const cellPx = useMemo(() => {
    if (!pinnedGeohash) return 0;
    try {
      const b = getBoundingBox(pinnedGeohash);
      const a = map.latLngToContainerPoint([b.sw.lat, b.sw.lon]);
      const c = map.latLngToContainerPoint([b.ne.lat, b.ne.lon]);
      return Math.min(Math.abs(c.x - a.x), Math.abs(c.y - a.y));
    } catch {
      return 0;
    }
    // zoom is the trigger; the map instance is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedGeohash, zoom, map]);

  const neighbours = useMemo(() => {
    if (!pinnedGeohash) return [];
    try {
      const taken = new Set(plotted.map((h) => h.toLowerCase()));
      return neighbourCells(pinnedGeohash).filter((n) => !taken.has(n.geohash));
    } catch {
      return [];
    }
  }, [pinnedGeohash, plotted]);

  const preview = useMemo(() => {
    if (!previewPrefix) return null;
    try {
      return getBoundingBox(previewPrefix);
    } catch {
      return null;
    }
  }, [previewPrefix]);

  const showCells = cellPx >= 12;
  const labelChars = pinnedGeohash?.length ?? 0;
  const showLabels = cellPx >= labelChars * 8 + 16;

  return (
    <>
      {showCells &&
        neighbours.map((n) => (
          <Rectangle
            key={`nb-${pinnedGeohash}-${n.geohash}-${showLabels}`}
            bounds={toLeaflet(n.bounds)}
            pathOptions={{
              color: COLORS.OVERPRINT.MAIN,
              // Suggestions: thin dashed outline, no wash, so they never
              // read as plotted cells
              weight: 1,
              opacity: 0.7,
              dashArray: "3 5",
              fillColor: COLORS.OVERPRINT.MAIN,
              fillOpacity: 0,
              bubblingMouseEvents: false,
              className: "neighbour-cell",
            }}
            eventHandlers={{
              click: () => onAddGeohash?.(n.geohash),
            }}
          >
            {showLabels ? (
              <Tooltip
                permanent
                direction="center"
                className="neighbour-label"
                interactive={false}
              >
                <span className="neighbour-hash">{n.geohash}</span>
                <span className="neighbour-add">+ Add</span>
              </Tooltip>
            ) : (
              <Tooltip direction="top" className="neighbour-label is-hover">
                <span className="neighbour-hash">{n.geohash}</span>
                <span className="neighbour-add">Click to add</span>
              </Tooltip>
            )}
          </Rectangle>
        ))}
      {preview && (
        <Rectangle
          key={`preview-${previewPrefix}`}
          bounds={toLeaflet(preview)}
          interactive={false}
          pathOptions={{
            color: COLORS.OVERPRINT.DARK,
            weight: 2,
            opacity: 0.9,
            dashArray: "8 5",
            fillOpacity: 0.04,
            className: "prefix-preview",
          }}
        />
      )}
    </>
  );
};

export default PrecisionOverlay;
