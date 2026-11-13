import React from "react";
import "./QuickActions.css";

interface QuickActionsProps {
  onClear: () => void;
  onSample: () => void;
  onExport?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onClear,
  onSample,
  onExport,
}) => {
  return (
    <div className="quick-actions">
      <button
        className="btn-quiet quick-action-btn sample-btn"
        type="button"
        onClick={onSample}
        title="Load sample geohashes"
      >
        Sample
      </button>

      <button
        className="btn-quiet quick-action-btn clear-btn"
        type="button"
        onClick={onClear}
        title="Clear all geohashes"
      >
        Clear
      </button>

      {onExport && (
        <button
          className="btn-quiet quick-action-btn export-btn"
          type="button"
          onClick={onExport}
          title="Export geohashes"
        >
          Export
        </button>
      )}
    </div>
  );
};

export default QuickActions;
