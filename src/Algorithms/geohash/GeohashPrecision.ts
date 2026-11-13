import { getBoundingBox } from "./GeohashBoundingBox";
import { BASE32_CHARS } from "./GeohashEncoder";
import { GeohashBounds } from "./GeohashTypes";

const KM_PER_DEG = 111.32;

const WORLD: GeohashBounds = {
  sw: { lat: -90, lon: -180 },
  ne: { lat: 90, lon: 180 },
};

export interface CellSize {
  widthKm: number;
  heightKm: number;
}

export interface LadderRung {
  prefix: string;
  bounds: GeohashBounds;
  size: CellSize;
  /** Grid this character divides its parent into */
  cols: number;
  rows: number;
  /** Which cell of that grid the character picks (row 0 is north) */
  col: number;
  row: number;
}

export type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export interface Neighbour {
  direction: Direction;
  geohash: string;
  bounds: GeohashBounds;
}

const boundsOf = (prefix: string): GeohashBounds =>
  prefix.length === 0 ? WORLD : getBoundingBox(prefix);

export function cellSize(bounds: GeohashBounds): CellSize {
  const midLat = (bounds.sw.lat + bounds.ne.lat) / 2;
  return {
    widthKm:
      (bounds.ne.lon - bounds.sw.lon) *
      KM_PER_DEG *
      Math.cos((midLat * Math.PI) / 180),
    heightKm: (bounds.ne.lat - bounds.sw.lat) * KM_PER_DEG,
  };
}

export function formatLength(km: number): string {
  if (km >= 100) return `${Math.round(km).toLocaleString()} km`;
  if (km >= 1) return `${km.toFixed(1)} km`;
  if (km >= 0.01) return `${Math.round(km * 1000)} m`;
  return `${(km * 100000).toFixed(1)} cm`;
}

export function formatSize(size: CellSize): string {
  return `${formatLength(size.widthKm)} × ${formatLength(size.heightKm)}`;
}

/**
 * One rung per character: the cell it selects and where that cell sits in
 * its parent's grid. Even-indexed characters start on a longitude bit
 * (8 columns by 4 rows); odd-indexed ones start on latitude (4 by 8).
 */
export function precisionLadder(geohash: string): LadderRung[] {
  const hash = geohash.toLowerCase();
  const rungs: LadderRung[] = [];
  for (let i = 1; i <= hash.length; i++) {
    const parent = boundsOf(hash.slice(0, i - 1));
    const bounds = boundsOf(hash.slice(0, i));
    const lonFirst = (i - 1) % 2 === 0;
    const cols = lonFirst ? 8 : 4;
    const rows = lonFirst ? 4 : 8;
    const cellW = (parent.ne.lon - parent.sw.lon) / cols;
    const cellH = (parent.ne.lat - parent.sw.lat) / rows;
    rungs.push({
      prefix: hash.slice(0, i),
      bounds,
      size: cellSize(bounds),
      cols,
      rows,
      col: Math.round((bounds.sw.lon - parent.sw.lon) / cellW),
      row: Math.round((parent.ne.lat - bounds.ne.lat) / cellH),
    });
  }
  return rungs;
}

/** Encode a point as a geohash of the given length. */
export function encodeGeohash(
  lat: number,
  lon: number,
  precision: number
): string {
  let latMin = -90,
    latMax = 90,
    lonMin = -180,
    lonMax = 180;
  let hash = "";
  let bits = 0;
  let idx = 0;
  let evenBit = true;
  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lonMin + lonMax) / 2;
      if (lon >= mid) {
        idx = idx * 2 + 1;
        lonMin = mid;
      } else {
        idx = idx * 2;
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        idx = idx * 2 + 1;
        latMin = mid;
      } else {
        idx = idx * 2;
        latMax = mid;
      }
    }
    evenBit = !evenBit;
    if (++bits === 5) {
      hash += BASE32_CHARS.charAt(idx);
      bits = 0;
      idx = 0;
    }
  }
  return hash;
}

const OFFSETS: [Direction, number, number][] = [
  ["nw", 1, -1],
  ["n", 1, 0],
  ["ne", 1, 1],
  ["w", 0, -1],
  ["e", 0, 1],
  ["sw", -1, -1],
  ["s", -1, 0],
  ["se", -1, 1],
];

/**
 * The cells physically touching this one at the same precision. Unlike the
 * cells that share its prefix, these can start with different characters
 * when the cell sits on its parent's edge. Wraps across the antimeridian;
 * rows past a pole are left out.
 */
export function neighbourCells(geohash: string): Neighbour[] {
  const hash = geohash.toLowerCase();
  const b = getBoundingBox(hash);
  const h = b.ne.lat - b.sw.lat;
  const w = b.ne.lon - b.sw.lon;
  const lat = (b.sw.lat + b.ne.lat) / 2;
  const lon = (b.sw.lon + b.ne.lon) / 2;
  const result: Neighbour[] = [];
  for (const [direction, dy, dx] of OFFSETS) {
    const nLat = lat + dy * h;
    if (nLat > 90 || nLat < -90) continue;
    let nLon = lon + dx * w;
    if (nLon > 180) nLon -= 360;
    if (nLon < -180) nLon += 360;
    const n = encodeGeohash(nLat, nLon, hash.length);
    result.push({ direction, geohash: n, bounds: getBoundingBox(n) });
  }
  return result;
}
