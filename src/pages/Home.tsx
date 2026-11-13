import "../App.css";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import GeohashMap, { GeohashMapRef } from "../GeohashMap/GeohashMap";
import Geohash from "../GeohashMap/model/Geohash";
import { createGeohashObjects } from "../Algorithms/geohash";
import GeohashInput from "../GeohashInput/GeohashInput";
import StatusBar from "../components/StatusBar";
import CustomZoomControls from "../components/CustomZoomControls";
import CellIndex from "../components/CellIndex/CellIndex";
import {
  DistanceConfig,
  HighlightState,
} from "../components/AdvancedOptions/DistanceAnalysis/utils/distanceTypes";
import {
  calculateDistances,
  clearDistanceCache,
} from "../components/AdvancedOptions/DistanceAnalysis/utils/distanceCalculator";

function Home() {
  // Get geohashes from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const urlGeohashes = urlParams.get("view");
  const defaultGeohashStr = urlGeohashes
    ? urlGeohashes.split(",").join("\n")
    : "gct\ngcp";

  // Parse geohash strings (don't filter here, let StatusBar handle validation)
  const parseGeohashes = (input: string): string[] => {
    const geohashes: string[] = [];

    input.split("\n").forEach((geohash) => {
      const trimmedGeohash = geohash.trim();
      if (trimmedGeohash.length > 0) {
        geohashes.push(trimmedGeohash);
      }
    });

    return geohashes;
  };

  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<GeohashMapRef>(null);

  // Initialize geohashes state first (needed by other hooks)
  const [geohashes, setGeohashes] = useState(() => {
    const inputGeohashes = parseGeohashes(defaultGeohashStr);
    const result = createGeohashObjects(inputGeohashes);
    return result.valid;
  });

  const [allGeohashes, setAllGeohashes] = useState(() => {
    const inputGeohashes = parseGeohashes(defaultGeohashStr);
    const result = createGeohashObjects(inputGeohashes);
    return result.all;
  });

  // Textarea contents live here so a map click can add a neighbour
  const [inputText, setInputText] = useState(defaultGeohashStr);

  // Precision ladder: a hovered cell previews, a clicked one stays pinned
  const [hoveredHash, setHoveredHash] = useState<string | null>(null);
  const [pinnedHash, setPinnedHash] = useState<string | null>(null);
  const [previewPrefix, setPreviewPrefix] = useState<string | null>(null);
  const focusedHash = hoveredHash ?? pinnedHash;

  const handlePin = useCallback((geohash: string) => {
    setPinnedHash((current) => (current === geohash ? null : geohash));
  }, []);

  const handleFlyToPrefix = useCallback((prefix: string) => {
    mapRef.current?.flyToGeohash(prefix);
  }, []);

  // Distance analysis state
  const [distanceConfig, setDistanceConfig] = useState<DistanceConfig>({
    enabled: false,
    mode: "reference",
    referenceGeohash: null,
    units: "km",
  });

  // Advanced options state
  const [advancedOptionsExpanded, setAdvancedOptionsExpanded] = useState(false);

  // Highlight state for interactive distance visualization
  const [highlightState, setHighlightState] = useState<HighlightState>({
    highlightedGeohash: null,
    highlightedLine: null,
  });

  // Load distance config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("geohashviz_distance_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setDistanceConfig(parsed);
      } catch (error) {
        console.error(
          "Error loading distance config from localStorage:",
          error
        );
      }
    }

    const savedExpanded = localStorage.getItem(
      "geohashviz_advanced_options_expanded"
    );
    if (savedExpanded) {
      try {
        setAdvancedOptionsExpanded(JSON.parse(savedExpanded));
      } catch (error) {
        console.error(
          "Error loading advanced options state from localStorage:",
          error
        );
      }
    }
  }, []);

  // Save distance config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      "geohashviz_distance_config",
      JSON.stringify(distanceConfig)
    );
  }, [distanceConfig]);

  // Save advanced options state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      "geohashviz_advanced_options_expanded",
      JSON.stringify(advancedOptionsExpanded)
    );
  }, [advancedOptionsExpanded]);

  // Calculate distances when config or geohashes change
  const distances = useMemo(() => {
    if (!distanceConfig.enabled) {
      return [];
    }

    try {
      return calculateDistances(geohashes, distanceConfig);
    } catch (error) {
      console.error("Error calculating distances:", error);
      return [];
    }
  }, [geohashes, distanceConfig]);

  // Clear distance cache and any pinned cell when geohashes change
  useEffect(() => {
    clearDistanceCache();
    setPinnedHash((current) =>
      current && geohashes.some((g) => g.geohash === current) ? current : null
    );
    setHoveredHash(null);
    setPreviewPrefix(null);
  }, [geohashes]);

  // Clear highlight state when distance config is disabled or geohashes change
  useEffect(() => {
    if (!distanceConfig.enabled) {
      setHighlightState({
        highlightedGeohash: null,
        highlightedLine: null,
      });
    }
  }, [distanceConfig.enabled, geohashes]);

  // Handle geohash click - highlight all lines connected to it
  const handleGeohashClick = (geohash: string) => {
    if (!distanceConfig.enabled) return;

    // Toggle: if already highlighted, clear it; otherwise set it
    if (highlightState.highlightedGeohash === geohash) {
      setHighlightState({
        highlightedGeohash: null,
        highlightedLine: null,
      });
    } else {
      setHighlightState({
        highlightedGeohash: geohash,
        highlightedLine: null,
      });
    }
  };

  // Handle line click - highlight the two connected geohashes
  const handleLineClick = (from: string, to: string) => {
    if (!distanceConfig.enabled) return;

    // Toggle: if this line is already highlighted, clear it; otherwise set it
    if (
      highlightState.highlightedLine &&
      ((highlightState.highlightedLine.from === from &&
        highlightState.highlightedLine.to === to) ||
        (highlightState.highlightedLine.from === to &&
          highlightState.highlightedLine.to === from))
    ) {
      setHighlightState({
        highlightedGeohash: null,
        highlightedLine: null,
      });
    } else {
      setHighlightState({
        highlightedGeohash: null,
        highlightedLine: { from, to },
      });
    }
  };

  // Handle distance config changes
  const handleDistanceConfigChange = (newConfig: DistanceConfig) => {
    // Auto-select first geohash as reference if needed
    if (
      newConfig.mode === "reference" &&
      !newConfig.referenceGeohash &&
      geohashes.length > 0
    ) {
      newConfig = {
        ...newConfig,
        referenceGeohash: geohashes[0].geohash,
      };
    }

    // If current reference geohash is not in valid geohashes, auto-select first
    if (newConfig.mode === "reference" && newConfig.referenceGeohash) {
      const referenceExists = geohashes.some(
        (g) => g.geohash === newConfig.referenceGeohash
      );
      if (!referenceExists && geohashes.length > 0) {
        newConfig = {
          ...newConfig,
          referenceGeohash: geohashes[0].geohash,
        };
      }
    }

    setDistanceConfig(newConfig);
  };

  // Zoom control functions
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (mapRef.current) {
      mapRef.current.fitBounds();
    }
  };

  // Process geohash input and convert to Geohash objects
  const handleSubmit = (value: string): Geohash[] => {
    setIsLoading(true);
    const inputGeohashes = parseGeohashes(value);
    const result = createGeohashObjects(inputGeohashes);
    setAllGeohashes(result.all); // Update all geohashes for StatusBar
    setTimeout(() => setIsLoading(false), 300); // Brief loading state for UX
    return result.valid; // Return only valid geohashes for map
  };

  // Add a neighbour from the map: append it to the list and replot
  const handleAddGeohash = (geohash: string) => {
    const next = inputText.trim() ? `${inputText.trim()}\n${geohash}` : geohash;
    setInputText(next);
    setGeohashes(handleSubmit(next));
    // Close the suggestions so the map shows only what is plotted
    setPinnedHash(null);
  };

  // Update URL when geohashes change
  useEffect(() => {
    if (geohashes.length > 0) {
      const geohashStr = geohashes.map((g) => g.geohash).join(",");
      window.history.replaceState(null, "", `?view=${geohashStr}`);
    }
  }, [geohashes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Shift+F: Zoom to fit
      if (event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        if (mapRef.current && geohashes.length > 0) {
          mapRef.current.fitBounds();
        }
      }

      // ESC: Clear highlights, then the pinned cell
      if (event.key === "Escape" && pinnedHash) {
        setPinnedHash(null);
      }
      if (event.key === "Escape") {
        if (
          highlightState.highlightedGeohash ||
          highlightState.highlightedLine
        ) {
          event.preventDefault();
          setHighlightState({
            highlightedGeohash: null,
            highlightedLine: null,
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [geohashes, highlightState, pinnedHash]);

  const highlightLabel = highlightState.highlightedGeohash ? (
    <strong>{highlightState.highlightedGeohash}</strong>
  ) : highlightState.highlightedLine ? (
    <>
      <strong>{highlightState.highlightedLine.from}</strong> to{" "}
      <strong>{highlightState.highlightedLine.to}</strong>
    </>
  ) : null;

  return (
    <div className="workspace">
      <GeohashInput
        onSubmit={(value) => setGeohashes(handleSubmit(value))}
        value={inputText}
        onValueChange={setInputText}
        advancedOptionsExpanded={advancedOptionsExpanded}
        onAdvancedOptionsToggle={() =>
          setAdvancedOptionsExpanded(!advancedOptionsExpanded)
        }
        distanceConfig={distanceConfig}
        onDistanceConfigChange={handleDistanceConfigChange}
        validGeohashes={geohashes}
      >
        <CellIndex
          geohashes={geohashes}
          activeHash={focusedHash}
          pinnedHash={pinnedHash}
          onHover={setHoveredHash}
          onPin={handlePin}
          onPreviewPrefix={setPreviewPrefix}
          onFlyToPrefix={handleFlyToPrefix}
        />
      </GeohashInput>

      <div className="map-stage">
        {distanceConfig.enabled && highlightLabel && (
          <div className="highlight-indicator">
            <span className="highlight-indicator-text">
              Highlighting {highlightLabel}
            </span>
            <button
              type="button"
              className="highlight-clear-btn"
              onClick={() =>
                setHighlightState({
                  highlightedGeohash: null,
                  highlightedLine: null,
                })
              }
              aria-label="Clear highlight"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
              </svg>
            </button>
          </div>
        )}
        <GeohashMap
          geohashes={geohashes}
          ref={mapRef}
          distanceConfig={distanceConfig}
          distances={distances}
          highlightState={highlightState}
          onGeohashClick={handleGeohashClick}
          onLineClick={handleLineClick}
          focusedGeohash={focusedHash}
          pinnedGeohash={pinnedHash}
          previewPrefix={previewPrefix}
          onAddGeohash={handleAddGeohash}
          onDismissNeighbours={() => setPinnedHash(null)}
          onCellHover={setHoveredHash}
          onCellPin={handlePin}
        />
        <CustomZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitBounds={handleFitBounds}
        />
        <StatusBar geohashes={allGeohashes} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default Home;
