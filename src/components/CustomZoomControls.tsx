import React from "react";
import "./CustomZoomControls.css";

interface CustomZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitBounds: () => void;
}

const CustomZoomControls: React.FC<CustomZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitBounds,
}) => {
  return (
    <div className="custom-zoom-controls">
      <button
        type="button"
        className="zoom-btn zoom-in"
        onClick={onZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
      </button>

      <button
        type="button"
        className="zoom-btn zoom-out"
        onClick={onZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 8h10" />
        </svg>
      </button>

      <button
        type="button"
        className="zoom-btn zoom-fit"
        onClick={onFitBounds}
        title="Fit all cells (Shift + F)"
        aria-label="Fit all cells"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 5.5V2h3.5M10.5 2H14v3.5M14 10.5V14h-3.5M5.5 14H2v-3.5" />
          <rect x="6" y="6" width="4" height="4" />
        </svg>
      </button>
    </div>
  );
};

export default CustomZoomControls;
