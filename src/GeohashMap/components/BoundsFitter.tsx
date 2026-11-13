import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import Geohash from "../model/Geohash";
import { glideToBounds } from "../config/styleConfig";

const BoundsFitter: React.FC<{ geohashes: Geohash[] }> = ({ geohashes }) => {
  const map = useMap();

  useEffect(() => {
    if (geohashes.length > 0) {
      const bounds = new LatLngBounds(geohashes[0].boundingBox);
      geohashes.forEach((geohash) => {
        bounds.extend(geohash.boundingBox[0]);
        bounds.extend(geohash.boundingBox[1]);
      });

      // Glide from wherever the map is to the plotted cells
      glideToBounds(map, bounds, { padding: [60, 60], maxZoom: 15 }, 1.2);
    }
  }, [map, geohashes]);

  return null;
};

export default BoundsFitter;
