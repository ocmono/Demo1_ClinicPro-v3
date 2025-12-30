import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiSave } from "react-icons/fi";
import { useBooking } from "../../../contentApi/BookingProvider";

const ClinicConfiguration = () => {
  const {
    calendarStartDate,
    setCalendarStartDate,
    calendarEndDate,
    setCalendarEndDate,
    saveCalendarDatesToBackend,  // Add this from context
  } = useBooking();

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const success = await saveCalendarDatesToBackend(calendarStartDate, calendarEndDate);
    if (!success) {
      // ❌ If failed, reset back old values if needed (optional)
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="clinic-configuration-container">
      <h2 className="clinic-configuration-title">
        🛠️ Clinic Calendar Configuration
      </h2>
      <div className="calendar-settings-form">
        <div className="calendar-settings-field">
          <label className="calendar-settings-label">Start Date:</label>
          <input
            type="date"
            value={calendarStartDate}
            onChange={(e) => setCalendarStartDate(e.target.value)}
            className="calendar-settings-input"
          />
        </div>
        <div className="calendar-settings-field">
          <label className="calendar-settings-label">End Date:</label>
          <input
            type="date"
            value={calendarEndDate}
            onChange={(e) => setCalendarEndDate(e.target.value)}
            className="calendar-settings-input"
          />
        </div>
        <button 
          onClick={handleSave}
          className="calendar-save-button"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ClinicConfiguration;
