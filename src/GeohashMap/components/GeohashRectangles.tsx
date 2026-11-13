import React, { useMemo } from "react";
import { Rectangle, Tooltip } from "react-leaflet";
import Geohash from "../model/Geohash";
import "./GeohashRectangles.css";
import {
  BOUNDING_BOX_COLOR,
  BOUNDING_BOX_OPACITY,
  FILL_OPACITY,
  HIGHLIGHT_COLOR,
  REFERENCE_GEOHASH_COLOR,
  traceIn,
} from "../config/styleConfig";
import {
  DistanceConfig,
  DistanceResult,
  HighlightState,
} from "../../components/AdvancedOptions/DistanceAnalysis/utils/distanceTypes";

interface GeohashRectanglesProps {
  geohashes: Geohash[];
  distanceConfig?: DistanceConfig;
  distances?: DistanceResult[];
  highlightState?: HighlightState;
  onGeohashClick?: (geohash: string) => void;
  /** Cell the user is pointing at or has pinned in the index */
  focusedGeohash?: string | null;
  onCellHover?: (geohash: string | null) => void;
  onCellPin?: (geohash: string) => void;
}

// Use stable, deterministic keys to avoid unnecessary re-mounts
const rectangleKey = (geohash: string, index: number): string =>
  `${geohash}-rect-${index}`;
const tooltipKey = (geohash: string, index: number): string =>
  `${geohash}-tt-${index}`;

const isReference = (geohash: Geohash, distanceConfig?: DistanceConfig) =>
  !!distanceConfig?.enabled &&
  distanceConfig.mode === "reference" &&
  geohash.geohash === distanceConfig.referenceGeohash;

const isHighlighted = (geohash: Geohash, highlightState?: HighlightState) => {
  if (highlightState?.highlightedGeohash === geohash.geohash) return true;
  const line = highlightState?.highlightedLine;
  return (
    !!line && (geohash.geohash === line.from || geohash.geohash === line.to)
  );
};

const hasHighlight = (highlightState?: HighlightState) =>
  !!(highlightState?.highlightedGeohash || highlightState?.highlightedLine);

const getTooltipContent = (
  geohash: Geohash,
  distanceConfig?: DistanceConfig
): string =>
  isReference(geohash, distanceConfig)
    ? `${geohash.geohash} (reference)`
    : geohash.geohash;

/**
 * Gets the color for a geohash rectangle
 */
const getRectangleColor = (
  geohash: Geohash,
  distanceConfig?: DistanceConfig,
  highlightState?: HighlightState
): string => {
  if (isHighlighted(geohash, highlightState)) return HIGHLIGHT_COLOR;
  if (isReference(geohash, distanceConfig) && !hasHighlight(highlightState)) {
    return REFERENCE_GEOHASH_COLOR;
  }
  return BOUNDING_BOX_COLOR;
};

/**
 * Gets the border weight for a geohash rectangle
 */
const getRectangleWeight = (
  geohash: Geohash,
  distanceConfig?: DistanceConfig,
  highlightState?: HighlightState,
  focusedGeohash?: string | null
): number => {
  if (isHighlighted(geohash, highlightState)) return 3.5;
  if (focusedGeohash === geohash.geohash) return 3;
  if (isReference(geohash, distanceConfig)) return 2.5;
  return 1.5;
};

/**
 * Gets the opacity for a geohash rectangle: highlighted or focused cells
 * stay solid, the rest recede.
 */
const getRectangleOpacity = (
  geohash: Geohash,
  highlightState?: HighlightState,
  focusedGeohash?: string | null
): number => {
  if (hasHighlight(highlightState)) {
    return isHighlighted(geohash, highlightState) ? 1 : 0.3;
  }
  // A focused cell is emphasised, never by fading the others: every
  // plotted cell must stay readable next to the dashed suggestions
  return focusedGeohash === geohash.geohash ? 1 : BOUNDING_BOX_OPACITY;
};

/**
 * Component that renders rectangular overlays for each geohash on the map
 * Each rectangle includes a tooltip showing the geohash code
 */
const GeohashRectangles: React.FC<GeohashRectanglesProps> = ({
  geohashes,
  distanceConfig,
  highlightState,
  onGeohashClick,
  focusedGeohash,
  onCellHover,
  onCellPin,
}) => {
  const rectangles = useMemo(
    () =>
      geohashes.map((geohash, index) => {
        const opacity = getRectangleOpacity(
          geohash,
          highlightState,
          focusedGeohash
        );
        const emphasised =
          isHighlighted(geohash, highlightState) ||
          focusedGeohash === geohash.geohash;
        const pathOptions = {
          // Keep cell clicks off the map, where a click dismisses suggestions
          bubblingMouseEvents: false,
          color: getRectangleColor(geohash, distanceConfig, highlightState),
          weight: getRectangleWeight(
            geohash,
            distanceConfig,
            highlightState,
            focusedGeohash
          ),
          opacity,
          fillOpacity: emphasised
            ? FILL_OPACITY * 2.2
            : opacity < 0.5
              ? FILL_OPACITY * 0.4
              : FILL_OPACITY,
        };
        const dimmed = opacity < 0.5;

        return (
          <Rectangle
            bounds={geohash.boundingBox}
            pathOptions={pathOptions}
            key={rectangleKey(geohash.geohash, index)}
            eventHandlers={{
              add: (e) =>
                traceIn(e.target.getElement?.(), Math.min(index, 24) * 70),
              click: () => {
                if (distanceConfig?.enabled) {
                  onGeohashClick?.(geohash.geohash);
                } else {
                  onCellPin?.(geohash.geohash);
                }
              },
              mouseover: () => onCellHover?.(geohash.geohash),
              mouseout: () => onCellHover?.(null),
            }}
            className="geohash-rectangle geohash-rectangle-clickable"
          >
            <Tooltip
              key={`${tooltipKey(geohash.geohash, index)}-${emphasised}-${dimmed}`}
              permanent
              direction={"top"}
              className={`custom-tooltip${emphasised ? " is-focus" : ""}${
                dimmed ? " is-dim" : ""
              }`}
            >
              {getTooltipContent(geohash, distanceConfig)}
            </Tooltip>
          </Rectangle>
        );
      }),
    [
      geohashes,
      distanceConfig,
      highlightState,
      onGeohashClick,
      focusedGeohash,
      onCellHover,
      onCellPin,
    ]
  );

  return <>{rectangles}</>;
};

export default React.memo(GeohashRectangles);
