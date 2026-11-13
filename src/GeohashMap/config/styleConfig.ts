/**
 * Map overprint colours. Leaflet paints SVG paths from JS, so these mirror
 * the tokens in src/index.css (--color-accent, --color-water).
 */
export const COLORS = {
  OVERPRINT: {
    MAIN: "#b0237a",
    DARK: "#8c1b61",
  },
  WATER: {
    MAIN: "#1f66a8",
  },
  INK: {
    MAIN: "#474c54",
  },
} as const;

export const GEOHASH_STYLE = {
  /** Cell outline: national-grid magenta overprint */
  BOUNDING_BOX_COLOR: COLORS.OVERPRINT.MAIN,
  BOUNDING_BOX_OPACITY: 0.9,
  FILL_OPACITY: 0.1,
} as const;

/** Reference and highlighted cells take survey blue */
export const REFERENCE_GEOHASH_COLOR = COLORS.WATER.MAIN;
export const HIGHLIGHT_COLOR = COLORS.WATER.MAIN;
export const DISTANCE_LINE_COLOR = COLORS.INK.MAIN;

export const BOUNDING_BOX_COLOR = GEOHASH_STYLE.BOUNDING_BOX_COLOR;
export const BOUNDING_BOX_OPACITY = GEOHASH_STYLE.BOUNDING_BOX_OPACITY;
export const FILL_OPACITY = GEOHASH_STYLE.FILL_OPACITY;

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Draw a freshly added Leaflet path: the stroke traces itself, then the fill
 * lands. Inline dash values are removed afterwards so zoom redraws stay clean.
 */
export const traceIn = (
  el: Element | undefined | null,
  delayMs: number,
  className = "trace-in"
): void => {
  if (!el || prefersReducedMotion()) return;
  const path = el as SVGPathElement;
  if (typeof path.getTotalLength !== "function") return;
  const len = Math.ceil(path.getTotalLength());
  if (!len) return;
  path.style.setProperty("--len", `${len}px`);
  path.style.strokeDasharray = `${len}px`;
  path.style.animationDelay = `${delayMs}ms`;
  path.classList.add(className);
  path.addEventListener(
    "animationend",
    () => {
      path.classList.remove(className);
      path.style.removeProperty("stroke-dasharray");
      path.style.removeProperty("--len");
      path.style.removeProperty("animation-delay");
    },
    { once: true }
  );
};

type FitOptions = { padding: [number, number]; maxZoom: number };
interface FlyableMap {
  getSize: () => { x: number; y: number };
  fitBounds: (b: any, o: FitOptions) => unknown;
  flyToBounds: (b: any, o: FitOptions & { duration: number }) => unknown;
}

/**
 * Glide to bounds; fall back to a plain fit when motion is reduced or the map
 * has no size yet (flyTo divides by the viewport and throws on zero).
 */
export const glideToBounds = (
  map: FlyableMap,
  bounds: unknown,
  opts: FitOptions,
  duration: number
): void => {
  const size = map.getSize();
  if (prefersReducedMotion() || !size.x || !size.y) {
    map.fitBounds(bounds, opts);
    return;
  }
  try {
    map.flyToBounds(bounds, { ...opts, duration });
  } catch {
    map.fitBounds(bounds, opts);
  }
};
