import React from "react";
import "./StatusBar.css";

interface StatusBarProps {
  geohashes: any[];
  isLoading?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  geohashes,
  isLoading = false,
}) => {
  const totalCount = geohashes.length;

  // Check for duplicates
  const uniqueGeohashes = new Set(geohashes.map((g) => g.geohash));
  const duplicateCount = totalCount - uniqueGeohashes.size;

  // Check for invalid/malformed geohashes
  const validGeohashes = geohashes.filter((g) => {
    if (!g.geohash || g.geohash.length === 0) return false;

    // Check length (geohashes are typically 1-12 characters)
    if (g.geohash.length > 12) return false;

    // Check for valid base32 characters only (no 'a', 'i', 'l', 'o')
    if (!/^[0-9bcdefghjkmnpqrstuvwxyz]+$/i.test(g.geohash)) return false;

    return true;
  });
  const invalidCount = totalCount - validGeohashes.length;

  const statusClass =
    invalidCount > 0 ? "is-error" : duplicateCount > 0 ? "is-warn" : "is-ok";

  return (
    <div
      className={`status-bar${isLoading ? " is-loading" : ""}`}
      role="status"
    >
      <div className="status-item">
        <span className="status-label">Total</span>
        <span className="status-value" key={`t${totalCount}`}>
          {totalCount}
        </span>
      </div>

      {duplicateCount > 0 && (
        <div className="status-item is-warn">
          <span className="status-label">Duplicates</span>
          <span className="status-value" key={`d${duplicateCount}`}>
            {duplicateCount}
          </span>
        </div>
      )}

      {invalidCount > 0 && (
        <div className="status-item is-error">
          <span className="status-label">Invalid</span>
          <span className="status-value" key={`i${invalidCount}`}>
            {invalidCount}
          </span>
        </div>
      )}

      {duplicateCount === 0 && invalidCount === 0 && (
        <div className={`status-item ${statusClass}`}>
          <span className="status-label">Status</span>
          <span className="status-value">Clean</span>
        </div>
      )}

      {isLoading && (
        <div className="status-item">
          <span className="status-label">Plotting…</span>
        </div>
      )}

      <div className="status-item status-keys">
        <kbd className="keyboard-shortcut">Shift F</kbd>
        <span className="status-label">fit</span>
        <kbd className="keyboard-shortcut">Esc</kbd>
        <span className="status-label">clear highlight</span>
      </div>
    </div>
  );
};

export default StatusBar;
