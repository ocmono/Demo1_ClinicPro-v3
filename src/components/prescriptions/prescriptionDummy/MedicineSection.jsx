import React, { useCallback, useMemo, useState } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { BiCapsule } from "react-icons/bi";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";

/* -------------------- OPTIONS -------------------- */

const WHEN_OPTIONS = [
  { label: "Before Food", value: "before_food" },
  { label: "After Food", value: "after_food" },
  { label: "Before Breakfast", value: "before_breakfast" },
  { label: "After Breakfast", value: "after_breakfast" },
  { label: "Before Lunch", value: "before_lunch" },
  { label: "After Lunch", value: "after_lunch" },
  { label: "Before Dinner", value: "before_dinner" },
  { label: "After Dinner", value: "after_dinner" },
  { label: "Empty Stomach", value: "empty_stomach" },
  { label: "Bed Time", value: "bed_time" },
  { label: "SOS", value: "sos" },
];

const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Alternate Day", value: "alternate_day" },
  { label: "Weekly", value: "weekly" },
  { label: "Fort Night", value: "fort_night" },
  { label: "Monthly", value: "monthly" },
];

const DURATION_OPTIONS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

/* -------------------- STYLES -------------------- */

const headerCell = {
  border: "1px solid #ecedf4",
  padding: "8px",
  backgroundColor: "#fafbfc",
};

const bodyCell = {
  border: "1px solid #ecedf4",
  padding: "1px 8px",
  backgroundColor: "#fff",
};
  
const actionCell = {
  width: 44,
  minWidth: 44,
  maxWidth: 44,
  border: "none",
  backgroundColor: "#fff",
  padding: 0,
};

const selectStyles = {
  control: (base) => ({
    ...base,
    border: 0,
    boxShadow: "none",
    background: "transparent",
    minHeight: 28,
    fontSize: "0.75rem",
  }),
  valueContainer: (b) => ({ ...b, padding: "0 6px" }),
  dropdownIndicator: (b) => ({ ...b, padding: 4 }),
  indicatorSeparator: () => ({ display: "none" }),
  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
  option: (b) => ({ ...b, fontSize: "0.75rem" }),
  singleValue: (b) => ({ ...b, fontSize: "0.75rem" }),
  placeholder: (b) => ({ ...b, fontSize: "0.75rem" }),
  menu: (b) => ({ ...b, minWidth: "150px" }),
};

const creatableSelectStyles = {
  ...selectStyles,
  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
  clearIndicator: () => ({ display: "none" }), // Hides the X button
};

/* -------------------- COMPONENT -------------------- */

const MedicineSection = ({
  medicines = [],
  medicineOptions = [],
  onAddRow,
  onRemoveRow,
  onMedicineChange,
  onNotesChange,
  onFieldChange,
  errors = {},
  isRefreshingMedicines = false,
  onRefreshMedicines,
}) => {
  const autoResize = useCallback((e) => {
    e.target.style.height = "28px";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  // Helper function to extract price from medicine object
  const getMedicinePrice = useCallback((medicine) => {
    if (!medicine) return 0;
    
    // Try different possible price locations
    const price = medicine.price || medicine.variation?.price || medicine.variationPrice || 0;
    
    // Convert to number and ensure it's valid
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    
    return isNaN(numPrice) || numPrice < 0 ? 0 : numPrice;
  }, []);

  const totalPrice = useMemo(
    () =>
      medicines.reduce(
        (sum, r) => sum + getMedicinePrice(r.medicine),
        0
      ),
    [medicines, getMedicinePrice]
  );

  const handleChange = (index, field, value) =>
    onFieldChange?.(index, field, value);

  /* -------- DOSE (M-A-D) LOGIC -------- */

  const toggleDose = (index, pos) => {
    const current = medicines[index]?.dose || "0-0-0";
    const parts = current.split("-").map(Number);

    parts[pos] = parts[pos] === 1 ? 0 : 1;

    handleChange(index, "dose", parts.join("-"));
  };

  // Duration validation - only numbers allowed
  const validateDurationNumber = (value) => {
    if (value === "") return true;
    const numValue = Number(value);
    return !isNaN(numValue) && numValue >= 0;
  };

  const renderDoseButton = (active, label, tooltip, onClick, showWarning = false) => (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className="btn btn-sm border rounded-pill"
      style={{
        padding: "2px 6px",
        fontSize: "0.7rem",
        backgroundColor: active ? "#e0f2fe" : showWarning ? "#fee2e2" : "#fff",
        color: active ? "#0ea5e9" : showWarning ? "#dc2626" : "#555",
        borderColor: active ? "#7dd3fc" : showWarning ? "#fca5a5" : undefined,
      }}
    >
      {label}
    </button>
  );

  // Helper function to get display value for duration
  const getDurationDisplay = (duration) => {
    if (!duration) return "";
    
    // Check if it's already a formatted string like "5 days"
    if (typeof duration === 'string' && duration.includes(' ')) {
      return duration;
    }
    
    // For backward compatibility with existing data
    if (duration.durationValue && duration.durationUnit) {
      return `${duration.durationValue} ${duration.durationUnit}`;
    }
    
    return duration;
  };

  // Parse duration string into value and unit
  const parseDuration = (durationString) => {
    if (!durationString) return { durationValue: "", durationUnit: "" };
    
    // Split by space or number followed by text
    const match = durationString.toString().match(/^(\d*\.?\d+)?\s*([a-zA-Z]*)$/);
    if (match) {
      return {
        durationValue: match[1] || "",
        durationUnit: match[2] || ""
      };
    }
    
    return { durationValue: "", durationUnit: "" };
  };

  // Format duration for display
  const formatDuration = (value, unit) => {
    if (!value && !unit) return "";
    if (!value) return unit;
    if (!unit) return value;
    return `${value} ${unit}`;
  };

  // Convert text value to ReactSelect option object
  const getWhenOption = (value) => {
    if (!value) return null;
    
    // Check if value exists in WHEN_OPTIONS
    const existingOption = WHEN_OPTIONS.find(opt => 
      opt.label === value || opt.value === value
    );
    
    if (existingOption) {
      return existingOption;
    }
    
    // Create custom option for non-standard values
    return { label: value, value: value.toLowerCase().replace(/\s+/g, '_') };
  };

  // Convert text value to ReactSelect option object for frequency
  const getFrequencyOption = (value) => {
    if (!value) return null;
    
    // Check if value exists in FREQUENCY_OPTIONS
    const existingOption = FREQUENCY_OPTIONS.find(opt => 
      opt.label === value || opt.value === value
    );
    
    if (existingOption) {
      return existingOption;
    }
    
    // Create custom option for non-standard values
    return { label: value, value: value.toLowerCase().replace(/\s+/g, '_') };
  };

  return (
    <div className="w-100">
      <div className="mb-3">
        {/* ---------- HEADER ---------- */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold d-flex align-items-center gap-2 mb-0">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{
                width: 26,
                height: 26,
                backgroundColor: "#e0f2fe",
                color: "#0ea5e9",
              }}
            >
              <BiCapsule size={16} />
            </span>
            Medicines
          </h5>
          <div className="d-flex align-items-center gap-2">
          {errors.medicines && (
              <small className="text-danger"> {errors.medicines}</small>
            )}
            <button
              type="button"
              onClick={onRefreshMedicines}
              disabled={isRefreshingMedicines}
              className="btn btn-light btn-icon btn-xs rounded-circle border"
              style={{ width: 24, height: 24, padding: 0 }}
            >
              <FiRefreshCw size={13} />
            </button>
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

        {/* ---------- TABLE ---------- */}
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ background: "#f5f5f5" }}>
            <thead>
              <tr>
                <th style={{ ...headerCell, width: 50 }}>#</th>
                <th style={{ ...headerCell, minWidth: 180 }}>Medicine</th>
                <th style={{ ...headerCell, minWidth: 80 }}>Price</th>
                <th style={{ ...headerCell, minWidth: 90 }}>Dose</th>
                <th style={{ ...headerCell, minWidth: 110 }}>When</th>
                <th style={{ ...headerCell, minWidth: 120 }}>Frequency</th>
                <th style={{ ...headerCell, minWidth: 110 }}>Duration</th>
                <th style={{ ...headerCell, minWidth: 140 }}>Notes</th>
                <th style={actionCell} />
              </tr>
            </thead>

            <tbody>
              {medicines.map((row, index) => {
                const price = getMedicinePrice(row.medicine);
                const [m, a, d] = (row.dose || "0-0-0").split("-").map(Number);
                const parsedDuration = parseDuration(row.duration || "");
                const whenOption = getWhenOption(row.when);
                const frequencyOption = getFrequencyOption(row.frequency);

                return (
                  <tr key={index}>
                    <td style={bodyCell} className="text-center fw-bold">
                      {index + 1}
                    </td>

                    {/* Medicine */}
                    <td style={bodyCell}>
                      <ReactSelect
                        options={medicineOptions}
                        value={row.medicine}
                        onChange={(o) => onMedicineChange?.(o, index)}
                        placeholder="Select Medicine"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={selectStyles}
                        isSearchable
                        isClearable={false} // No clear button for medicine
                      />
                    </td>

                    {/* Price */}
                    <td style={bodyCell} className="text-center">{price ? `₹${price.toFixed(2)}` : "—"}</td>

                    {/* Dose (M-A-D) */}
                    <td style={bodyCell}>
                      <div className="d-flex gap-1 justify-content-center">
                        {(() => {
                          const hasMedicine = !!row.medicine;
                          const hasAnyDose = m === 1 || a === 1 || d === 1;
                          const showWarning = hasMedicine && !hasAnyDose;
                          
                          return (
                            <>
                              {renderDoseButton(m === 1, "M", "Morning", () =>
                                toggleDose(index, 0), showWarning
                              )}
                              {renderDoseButton(a === 1, "A", "Afternoon", () =>
                                toggleDose(index, 1), showWarning
                              )}
                              {renderDoseButton(d === 1, "D", "Dinner", () =>
                                toggleDose(index, 2), showWarning
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>

                    {/* When - ReactSelect with creatable option */}
                    <td style={bodyCell}>
                      <CreatableSelect
                        options={WHEN_OPTIONS}
                        value={whenOption}
                        onChange={(option) => {
                          handleChange(index, "when", option?.label || "");
                        }}
                        onCreateOption={(inputValue) => {
                          handleChange(index, "when", inputValue);
                        }}
                        placeholder="Select or type"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={creatableSelectStyles}
                        isClearable={false} // No clear button - allows backspace
                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                        isSearchable
                      />
                    </td>

                    {/* Frequency - ReactSelect with creatable option */}
                    <td style={bodyCell}>
                      <CreatableSelect
                        options={FREQUENCY_OPTIONS}
                        value={frequencyOption}
                        onChange={(option) => {
                          handleChange(index, "frequency", option?.label || "");
                        }}
                        onCreateOption={(inputValue) => {
                          handleChange(index, "frequency", inputValue);
                        }}
                        placeholder="Select or type"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={creatableSelectStyles}
                        isClearable={false} // No clear button - allows backspace
                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                        isSearchable
                      />
                    </td>

                    {/* Duration - Number input with unit dropdown */}
                    <td style={bodyCell}>
                      <div className="d-flex gap-1 align-items-center">
                        <input
                          type="text"
                          className="form-control border-0 p-0 text-end"
                          style={{
                            fontSize: "0.75rem",
                            background: "transparent",
                            width: "30px",
                          }}
                          value={parsedDuration.durationValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || validateDurationNumber(value)) {
                              const newDuration = formatDuration(value, parsedDuration.durationUnit);
                              handleChange(index, "duration", newDuration);
                            }
                          }}
                          placeholder="no of"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <select
                          className="form-select form-select-sm border-0 p-0"
                          style={{
                            fontSize: "0.75rem",
                            background: "transparent",
                            flex: 1,
                          }}
                          value={parsedDuration.durationUnit}
                          onChange={(e) => {
                            const unit = e.target.value;
                            const newDuration = formatDuration(parsedDuration.durationValue, unit);
                            handleChange(index, "duration", newDuration);
                          }}
                        >
                          {DURATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.value}s
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Notes */}
                    <td style={bodyCell}>
                      <textarea
                        rows={1}
                        className="form-control border-0"
                        style={{ background: "transparent", resize: "none", fontSize: "0.75rem" }}
                        value={row.notes || ""}
                        onChange={(e) => {
                          onNotesChange?.(e, index);
                          autoResize(e);
                        }}
                        placeholder="Additional notes"
                      />
                    </td>

                    {/* Remove */}
                    <td className="text-end" style={{ width: 50 }}>
                      <button
                        type="button"
                        onClick={() => onRemoveRow?.(index)}
                        className="btn btn-link p-0 "
                        style={{ fontSize: 18, color: "#666", textDecoration: "none" }}
                        disabled={medicines.length === 1}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}

              {/* TOTAL */}
              <tr className="fw-bold">
                <td  className="py-2" colSpan={2} style={bodyCell} />
                <td  className="py-2 text-center" style={bodyCell}>₹{totalPrice.toFixed(2)}</td>
                <td  className="py-2" colSpan={5} style={bodyCell} />
                <td  className="py-2" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicineSection;