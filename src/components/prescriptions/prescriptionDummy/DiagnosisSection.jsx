import React, { useState, useRef, useEffect, useMemo } from "react";
import { FiPlus, FiFileText } from "react-icons/fi";

/* ===================== CONSTANTS ===================== */

const DURATION_OPTIONS = [
  { value: "day" },
  { value: "week" },
  { value: "month" },
  { value: "year" },
];

/* ===================== HELPERS ===================== */

const validateDurationNumber = (value) => {
  return /^[0-9]*$/.test(value);
};

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

/* ===================== DATE/DURATION CALCULATION HELPERS ===================== */

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

/* ===================== COMPONENT ===================== */

const DiagnosisSection = ({
  diagnosisData = [],
  diagnosisSuggestions = [],
  errors,
  onAddRow,
  onFieldChange,
  onRemoveRow,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [filteredSuggestions, setFiltered] = useState([]);
  const [dropdownPosition, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const inputRefs = useRef([]);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  /* ---------- BASE STYLES ---------- */

  const cellBase = {
    border: "1px solid #ecedf4",
    padding: "1px 8px",
    backgroundColor: "#fff",
    fontSize: "0.875rem",
  };

  const headerBase = {
    border: "1px solid #ecedf4",
    padding: "8px",
    backgroundColor: "#fafbfc",
  };

  const allSuggestions = useMemo(
    () => [...new Set(diagnosisSuggestions)],
    [diagnosisSuggestions]
  );

  /* ---------- FILTER SUGGESTIONS ---------- */

  const filterSuggestions = (index) => {
    const value = diagnosisData[index]?.diagnosis?.trim().toLowerCase() || "";
    const list = value
      ? allSuggestions.filter((s) => s.toLowerCase().includes(value))
      : allSuggestions.slice(0, 15);

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
  };

  const handleInputChange = (index, value) => {
    onFieldChange(index, "diagnosis", value);
    filterSuggestions(index);
    updateDropdownPos(index);
  };

  const handleSelectSuggestion = (text) => {
    if (activeIndex !== null) {
      onFieldChange(activeIndex, "diagnosis", text);
      setActiveIndex(null);
    }
  };

  /* ---------- OUTSIDE CLICK ---------- */

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRefs.current.some((r) => r && r.contains(e.target))
      ) {
        setActiveIndex(null);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  /* ---------- RESIZE ---------- */

  useEffect(() => {
    if (activeIndex === null) return;
    const resize = () => updateDropdownPos(activeIndex);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [activeIndex]);

  /* ================================================= */

  return (
    <div className="w-100" ref={containerRef} style={{ position: "relative" }}>
      {/* Header */}
      <div className="stretch border-0 stretch-full mb-3">
        <div
          className="card-header d-flex align-items-center justify-content-between"
          style={{ border: 0, paddingLeft: 0 }}
        >
          <h5 className="card-title mb-0 fw-bold">
            <span className="d-inline-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: "#f3e8ff",
                  color: "#7c3aed",
                }}
              >
                <FiFileText size={15} />
              </span>
              Diagnosis
            </span>
          </h5>

          <div className="d-flex align-items-center gap-2">
            {errors?.diagnosis && (
              <small className="text-danger">{errors.diagnosis}</small>
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
        <div
          className="card-body custom-card-action p-0"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <div className="table-responsive">
            <table
              className="table align-middle mb-0"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th style={{ ...headerBase, width: 50 }} className="text-center">
                    #
                  </th>
                  <th style={headerBase}>Diagnosis</th>
                  <th style={headerBase}>Duration</th>
                  <th style={headerBase}>Date</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>

              <tbody>
                {diagnosisData.map((row, index) => {
                  const parsedDuration = parseDuration(row.duration);

                  return (
                    <tr key={index}>
                      <td
                        className="text-center fw-bold"
                        style={{ ...cellBase, width: 50 }}
                      >
                        {index + 1}
                      </td>

                      {/* Diagnosis */}
                      <td style={{ ...cellBase, minWidth: 200 }}>
                        <div ref={(el) => (inputRefs.current[index] = el)}>
                          <input
                            className="form-control border-0"
                            placeholder="Type diagnosis"
                            style={{
                              backgroundColor: "transparent",
                              boxShadow: "none",
                              fontSize: "0.875rem",
                            }}
                            value={row.diagnosis || ""}
                            onChange={(e) =>
                              handleInputChange(index, e.target.value)
                            }
                            onFocus={() => handleInputFocus(index)}
                          />
                        </div>
                      </td>

                      {/* Duration (UPDATED with auto-fill) */}
                      <td style={cellBase}>
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
                              if (
                                value === "" ||
                                validateDurationNumber(value)
                              ) {
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
                            className="form-select border-0 p-0"
                            style={{
                              fontSize: "0.875rem",
                              background: "transparent",
                              flex: 1,
                            }}
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
                            {DURATION_OPTIONS.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.value}s
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Date (UPDATED with auto-fill) */}
                      <td style={cellBase}>
                        <input
                          type="date"
                          className="form-control border-0"
                          style={{
                            backgroundColor: "transparent",
                            fontSize: "0.875rem",
                          }}
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

                      <td className="text-end">
                        <button
                          type="button"
                          onClick={() => onRemoveRow(index)}
                          disabled={diagnosisData.length === 1}
                          className="btn btn-link p-0"
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
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {activeIndex !== null && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, 320),
            zIndex: 9999,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            padding: 8,
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {filteredSuggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                style={{
                  background: "#f1f3f5",
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  fontSize: 12,
                  color: "#333",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
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

export default DiagnosisSection;