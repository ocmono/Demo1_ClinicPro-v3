import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiActivity } from "react-icons/fi";

/* ---------- DURATION HELPERS ---------- */

const DURATION_OPTIONS = [
  { value: "day" },
  { value: "week" },
  { value: "month" },
  { value: "year" },
];

const validateDurationNumber = (value) => /^[0-9]+$/.test(value);

const formatDuration = (value, unit) => {
  if (!value || !unit) return "";
  return `${value} ${unit}${value > 1 ? "s" : ""}`;
};

const parseDuration = (duration) => {
  if (!duration) return { durationValue: "", durationUnit: "day" };

  const parts = duration.split(" ");
  return {
    durationValue: parts[0] || "",
    durationUnit: parts[1]?.replace("s", "") || "day",
  };
};

/* ---------- DATE/DURATION CALCULATION HELPERS ---------- */

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const convertDurationToDays = (value, unit) => {
  if (!value || !unit) return 0;
  const num = parseInt(value, 10);
  if (isNaN(num)) return 0;

  const multipliers = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };

  return num * (multipliers[unit] || 1);
};

const calculateDateFromDuration = (duration) => {
  if (!duration) return "";

  const parsed = parseDuration(duration);
  if (!parsed.durationValue) return "";

  const days = convertDurationToDays(parsed.durationValue, parsed.durationUnit);
  if (days === 0) return "";

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);

  return startDate.toISOString().split("T")[0];
};

const calculateDurationFromDate = (date) => {
  if (!date) return "";

  const today = new Date();
  const startDate = new Date(date);
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "";

  if (diffDays < 7) {
    return formatDuration(diffDays.toString(), "day");
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return formatDuration(weeks.toString(), "week");
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return formatDuration(months.toString(), "month");
  } else {
    const years = Math.floor(diffDays / 365);
    return formatDuration(years.toString(), "year");
  }
};

/* ================================================= */

const SymptomsSection = ({
  symptomsData,
  symptomsSuggestions = [],
  errors,
  onAddRow,
  onFieldChange,
  onRemoveRow,
  onActiveInputChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [filteredSuggestions, setFiltered] = useState([]);
  const [dropdownPosition, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const inputRefs = useRef([]);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  /* ---------- BASE STYLES ---------- */

  const cellBaseStyle = {
    border: "1px solid #ecedf4",
    padding: "1px 8px",
    backgroundColor: "#fff",
    fontSize: "0.875rem",
  };

  const headerBaseStyle = {
    border: "1px solid #ecedf4",
    padding: "8px",
    backgroundColor: "#fafbfc",
  };

  /* ---------- SUGGESTION FILTER ---------- */

  const filterSuggestions = (index) => {
    const value = symptomsData[index]?.symptom?.trim().toLowerCase() || "";
    const list = value
      ? symptomsSuggestions.filter((s) => s.toLowerCase().includes(value))
      : symptomsSuggestions.slice(0, 15);

    setFiltered(list.slice(0, 15));
  };

  /* ---------- DROPDOWN POSITION ---------- */

  const updateDropdownPos = (index) => {
    if (!inputRefs.current[index] || !containerRef.current) return;

    const inputRect = inputRefs.current[index].getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setDropdownPos({
      top: inputRect.bottom - containerRect.top,
      left: inputRect.left - containerRect.left,
      width: inputRect.width,
    });
  };

  const handleInputFocus = (index) => {
    setActiveIndex(index);
    filterSuggestions(index);
    setTimeout(() => updateDropdownPos(index), 10);
    // Notify parent of active input value for medicine panel filtering
    if (onActiveInputChange) {
      const activeValue = symptomsData[index]?.symptom?.trim() || "";
      onActiveInputChange(activeValue);
    }
  };

  const handleInputChange = (index, value) => {
    onFieldChange(index, "symptom", value);
    filterSuggestions(index);
    updateDropdownPos(index);
    // Notify parent of active input value for medicine panel filtering
    if (onActiveInputChange) {
      const trimmedValue = value.trim();
      onActiveInputChange(trimmedValue);
    }
  };

  const handleSelectSuggestion = (text) => {
    if (activeIndex !== null) {
      onFieldChange(activeIndex, "symptom", text);
      setActiveIndex(null);
      // Clear active input value when suggestion is selected
      if (onActiveInputChange) {
        onActiveInputChange("");
      }
    }
  };

  /* ---------- CLOSE DROPDOWN ---------- */

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRefs.current.some((r) => r && r.contains(e.target))
      ) {
        setActiveIndex(null);
        // Clear active input value when clicking outside
        if (onActiveInputChange) {
          onActiveInputChange("");
        }
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onActiveInputChange]);

  /* ================================================= */

  return (
    <div className="w-100" ref={containerRef} style={{ position: "relative" }}>
      {/* Header */}
      <div className="card-header d-flex align-items-center justify-content-between mb-2 p-0 border-0">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
          <span
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 26, height: 26, background: "#fef3c7", color: "#f59e0b" }}
          >
            <FiActivity size={15} />
          </span>
          Symptoms
        </h5>

        <div className="d-flex align-items-center gap-2">
          {errors.symptoms && (
            <small className="text-danger">{errors.symptoms}</small>
          )}
          <button
            type="button"
            onClick={onAddRow}
            className="btn btn-light btn-icon btn-xs rounded-circle border"
            style={{ width: 24, height: 24, padding: 0 }}
          >
            <FiPlus size={13} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table mb-0" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th style={{ ...headerBaseStyle, width: 50 }}>#</th>
              <th style={headerBaseStyle}>Complaints</th>
              <th style={headerBaseStyle}>Frequency</th>
              <th style={headerBaseStyle}>Severity</th>
              <th style={headerBaseStyle}>Duration</th>
              <th style={headerBaseStyle}>Date</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>

          <tbody>
            {symptomsData.map((row, index) => {
              const parsedDuration = parseDuration(row.duration);

              return (
                <tr key={index}>
                  <td style={cellBaseStyle}>{index + 1}</td>

                  {/* Complaint */}
                  <td style={cellBaseStyle}>
                    <div ref={(el) => (inputRefs.current[index] = el)}>
                      <input
                        className="form-control form-control-sm border-0"
                        style={{ background: "transparent", fontSize: "0.875rem" }}
                        placeholder="Type complaint"
                        value={row.symptom || ""}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onFocus={() => handleInputFocus(index)}
                      />
                    </div>
                  </td>

                  {/* Frequency */}
                  <td style={cellBaseStyle}>
                    <select
                      className="form-select form-select-sm border-0"
                      style={{ background: "transparent", fontSize: "0.875rem" }}
                      value={row.frequency}
                      onChange={(e) => onFieldChange(index, "frequency", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="occasional">Occasional</option>
                      <option value="constant">Constant</option>
                    </select>
                  </td>

                  {/* Severity */}
                  <td style={cellBaseStyle}>
                    <select
                      className="form-select form-select-sm border-0"
                      style={{ background: "transparent", fontSize: "0.875rem" }}
                      value={row.severity}
                      onChange={(e) => onFieldChange(index, "severity", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </td>

                  {/* ✅ Duration (NEW) */}
                  <td style={cellBaseStyle}>
                    <div className="d-flex gap-1 align-items-center">
                      <input
                        type="text"
                        className="form-control border-0 p-0 text-end"
                        style={{
                          fontSize: "0.875rem",
                          background: "transparent",
                          width: "40px",
                        }}
                        value={parsedDuration.durationValue}
                        placeholder="no of"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || validateDurationNumber(value)) {
                            const newDuration = formatDuration(
                              value,
                              parsedDuration.durationUnit
                            );
                            onFieldChange(index, "duration", newDuration);
                            
                            // Auto-calculate date if duration is valid
                            if (value && parsedDuration.durationUnit) {
                              const calculatedDate = calculateDateFromDuration(newDuration);
                              if (calculatedDate) {
                                onFieldChange(index, "date", calculatedDate);
                              }
                            } else if (!value) {
                              // Clear date if duration is cleared
                              onFieldChange(index, "date", "");
                            }
                          }
                        }}
                      />

                      <select
                        className="form-select form-select-sm border-0 p-0"
                        style={{ fontSize: "0.875rem", background: "transparent" }}
                        value={parsedDuration.durationUnit}
                        onChange={(e) => {
                          const unit = e.target.value;
                          const newDuration = formatDuration(
                            parsedDuration.durationValue,
                            unit
                          );
                          onFieldChange(index, "duration", newDuration);
                          
                          // Auto-calculate date if duration is valid
                          if (parsedDuration.durationValue && unit) {
                            const calculatedDate = calculateDateFromDuration(newDuration);
                            if (calculatedDate) {
                              onFieldChange(index, "date", calculatedDate);
                            }
                          }
                        }}
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.value}s
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Date */}
                  <td style={cellBaseStyle}>
                    <input
                      type="date"
                      className="form-control form-control-sm border-0"
                      style={{ background: "transparent", fontSize: "0.875rem" }}
                      value={row.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        onFieldChange(index, "date", newDate);
                        
                        // Auto-calculate duration if date is valid
                        if (newDate) {
                          const calculatedDuration = calculateDurationFromDate(newDate);
                          if (calculatedDuration) {
                            onFieldChange(index, "duration", calculatedDuration);
                          }
                        } else {
                          // Clear duration if date is cleared
                          onFieldChange(index, "duration", "");
                        }
                      }}
                    />
                  </td>

                  {/* Remove */}
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => onRemoveRow(index)}
                      disabled={symptomsData.length === 1}
                      style={{
                        fontSize: 18,
                        color: "#666",
                        textDecoration: "none",
                      }}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Suggestions */}
      {activeIndex !== null && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, 350),
            background: "#fff",
            border: "1px solid #e5e7eb",
            padding: 8,
            zIndex: 10,
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {filteredSuggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                style={{
                  background: "#f1f3f5",
                  border: "1px solid #e0e0e0",
                  fontSize: 12,
                  padding: "4px 8px",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomsSection;
