import React from "react";
import "./GeohashInput.css";
import QuickActions from "../components/QuickActions";
import Geohash from "../GeohashMap/model/Geohash";
import { DistanceConfig } from "../components/AdvancedOptions/DistanceAnalysis/utils/distanceTypes";
import AdvancedOptions from "../components/AdvancedOptions/AdvancedOptions";
import { DistanceAnalysis } from "../components/AdvancedOptions/DistanceAnalysis/DistanceAnalysis";
import ErrorBoundary from "../components/AdvancedOptions/DistanceAnalysis/ErrorBoundary";

interface FormComponentProps {
  onSubmit: (value: string) => void;
  /** Textarea contents, owned by the page so the map can append to it */
  value: string;
  onValueChange: (value: string) => void;
  advancedOptionsExpanded: boolean;
  onAdvancedOptionsToggle: () => void;
  distanceConfig: DistanceConfig;
  onDistanceConfigChange: (config: DistanceConfig) => void;
  validGeohashes: Geohash[];
  /** Rendered between the input and the advanced options: the cell index */
  children?: React.ReactNode;
}

const GeohashInput: React.FC<FormComponentProps> = ({
  onSubmit,
  value,
  onValueChange,
  advancedOptionsExpanded,
  onAdvancedOptionsToggle,
  distanceConfig,
  onDistanceConfigChange,
  validGeohashes,
  children,
}) => {
  const setValue = onValueChange;

  const handleClear = () => {
    setValue("");
    onSubmit("");
  };

  const handleSample = () => {
    const sampleGeohashes = "dr5\ndpz\ndjf\ndnh\ndx1\ndn4";
    setValue(sampleGeohashes);
    onSubmit(sampleGeohashes);
  };

  const submit = () => onSubmit(value);

  return (
    <aside className="geohash-form-container" aria-label="Geohash input">
      <div className="geohash-form-header">
        <h1 className="geohash-form-title">Plot geohashes</h1>
        <p className="geohash-form-description">
          One per line. Each becomes a cell on the map.
        </p>
      </div>

      <textarea
        id="geohash-input"
        rows={5}
        className="geohash-textarea"
        placeholder={"gcpvj\ngcpvh\ngcpuv"}
        aria-label="Geohash input textarea"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
        value={value}
      />

      <div className="geohash-form-actions">
        <button
          type="button"
          className="btn-primary-gh geohash-submit-button"
          onClick={submit}
        >
          Plot cells
          <kbd className="geohash-submit-kbd" aria-hidden="true">
            ⌘↵
          </kbd>
        </button>
        <QuickActions onClear={handleClear} onSample={handleSample} />
      </div>

      {children}

      <AdvancedOptions
        expanded={advancedOptionsExpanded}
        onToggle={onAdvancedOptionsToggle}
      >
        <ErrorBoundary>
          <DistanceAnalysis
            config={distanceConfig}
            onConfigChange={onDistanceConfigChange}
            validGeohashes={validGeohashes}
            disabled={validGeohashes.length < 2}
            disabledReason={
              validGeohashes.length < 2
                ? "Need at least 2 valid geohashes"
                : undefined
            }
          />
        </ErrorBoundary>
      </AdvancedOptions>
    </aside>
  );
};

export default GeohashInput;
