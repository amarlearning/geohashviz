import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import Geohash from "./model/Geohash";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM_LEVEL,
  MAX_BOUNDS,
  MIN_ZOOM_LEVEL,
} from "./config/mapConfig";
import BoundsFitter from "./components/BoundsFitter";
import GeohashRectangles from "./components/GeohashRectangles";
import PrecisionOverlay from "./components/PrecisionOverlay";
import { glideToBounds } from "./config/styleConfig";
import { getBoundingBox } from "../Algorithms/geohash";
import DistanceLines from "../components/AdvancedOptions/DistanceAnalysis/DistanceLines";
import {
  DistanceConfig,
  DistanceResult,
  HighlightState,
} from "../components/AdvancedOptions/DistanceAnalysis/utils/distanceTypes";

interface LeafletContainerProps {
  geohashes: Geohash[];
  distanceConfig?: DistanceConfig;
  distances?: DistanceResult[];
  highlightState?: HighlightState;
  onGeohashClick?: (geohash: string) => void;
  onLineClick?: (from: string, to: string) => void;
  focusedGeohash?: string | null;
  /** Clicked cell: its 8 neighbours are drawn and can be added */
  pinnedGeohash?: string | null;
  previewPrefix?: string | null;
  onAddGeohash?: (geohash: string) => void;
  onDismissNeighbours?: () => void;
  onCellHover?: (geohash: string | null) => void;
  onCellPin?: (geohash: string) => void;
}

export interface GeohashMapRef {
  fitBounds: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  /** Glide to a geohash or prefix cell */
  flyToGeohash: (geohash: string) => void;
}

/**
 * Main map container component that displays geohashes on an OpenStreetMap layer
 * Handles map initialization and contains child components for bounds fitting
 * and geohash visualization
 */
const GeohashMap = forwardRef<GeohashMapRef, LeafletContainerProps>(
  (
    {
      geohashes,
      distanceConfig,
      distances,
      highlightState,
      onGeohashClick,
      onLineClick,
      focusedGeohash,
      pinnedGeohash,
      previewPrefix,
      onAddGeohash,
      onDismissNeighbours,
      onCellHover,
      onCellPin,
    },
    ref
  ) => {
    const mapInstanceRef = useRef<any>(null);
    const plottedHashes = useMemo(
      () => geohashes.map((g) => g.geohash),
      [geohashes]
    );

    useImperativeHandle(ref, () => ({
      fitBounds: () => {
        if (mapInstanceRef.current && geohashes.length > 0) {
          const bounds = new LatLngBounds(geohashes[0].boundingBox);
          geohashes.forEach((geohash) => {
            bounds.extend(geohash.boundingBox[0]);
            bounds.extend(geohash.boundingBox[1]);
          });

          glideToBounds(
            mapInstanceRef.current,
            bounds,
            { padding: [60, 60], maxZoom: 15 },
            0.9
          );
        }
      },
      zoomIn: () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.zoomIn();
        }
      },
      zoomOut: () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.zoomOut();
        }
      },
      flyToGeohash: (geohash: string) => {
        if (!mapInstanceRef.current) return;
        const b = getBoundingBox(geohash);
        const bounds = new LatLngBounds(
          [b.sw.lat, b.sw.lon],
          [b.ne.lat, b.ne.lon]
        );
        glideToBounds(
          mapInstanceRef.current,
          bounds,
          { padding: [80, 80], maxZoom: 18 },
          1.1
        );
      },
    }));
    return (
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM_LEVEL}
        minZoom={MIN_ZOOM_LEVEL}
        maxBounds={MAX_BOUNDS}
        className="map-container"
        zoomControl={false}
        ref={mapInstanceRef}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <BoundsFitter geohashes={geohashes} />
        <PrecisionOverlay
          pinnedGeohash={pinnedGeohash}
          previewPrefix={previewPrefix}
          plotted={plottedHashes}
          onAddGeohash={onAddGeohash}
          onDismiss={onDismissNeighbours}
        />
        <GeohashRectangles
          geohashes={geohashes}
          focusedGeohash={focusedGeohash}
          onCellHover={onCellHover}
          onCellPin={onCellPin}
          distanceConfig={distanceConfig}
          distances={distances}
          highlightState={highlightState}
          onGeohashClick={onGeohashClick}
        />
        {distances && distances.length > 0 && distanceConfig && (
          <DistanceLines
            geohashes={geohashes}
            config={distanceConfig}
            distances={distances}
            highlightState={highlightState}
            onLineClick={onLineClick}
          />
        )}
      </MapContainer>
    );
  }
);

export default GeohashMap;
