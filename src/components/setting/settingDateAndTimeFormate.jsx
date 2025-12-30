import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contentApi/AuthContext";
import useThrottleClick from "../../hooks/useThrottleButton";
import PageHeaderSetting from "../shared/pageHeader/PageHeaderSetting";
import Footer from "../shared/Footer";
import PerfectScrollbar from "react-perfect-scrollbar";

// Constants moved outside component to prevent recreation
const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "12/31/2024" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "31/12/2024" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2024-12-31" },
];

const TIME_FORMATS = [
  { value: "12h", label: "12-hour (2:30 PM)" },
  { value: "24h", label: "24-hour (14:30)" },
];

const TIMEZONES = [
  "America/New_York",
  "America/Chicago", 
  "America/Denver",
  "America/Los_Angeles",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Kolkata",
];

const DEFAULT_SETTINGS = {
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
};

const DateFormatSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Throttle hooks for both buttons
  const saveThrottle = useThrottleClick({
    maxClicks: 3,
    disableDuration: 10000,
    resetOnDisable: true,
  });

  const resetThrottle = useThrottleClick({
    maxClicks: 2,
    disableDuration: 5000,
    resetOnDisable: true,
  });

  // Load saved settings on component mount
  const loadSavedSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem("dateTimeSettings");
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  // Initialize settings
  useState(() => {
    loadSavedSettings();
  });

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Fixed preview generation that respects the selected format
  const preview = useMemo(() => {
    const now = new Date();
    
    // Format date based on selected format
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      switch (settings.dateFormat) {
        case "DD/MM/YYYY":
          return `${day}/${month}/${year}`;
        case "YYYY-MM-DD":
          return `${year}-${month}-${day}`;
        default: // MM/DD/YYYY
          return `${month}/${day}/${year}`;
      }
    };

    // Format time based on selected format
    const formatTime = (date) => {
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      if (settings.timeFormat === "12h") {
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${period}`;
      } else {
        return `${String(hours).padStart(2, '0')}:${minutes}`;
      }
    };

    return {
      date: formatDate(now),
      time: formatTime(now),
    };
  }, [settings.dateFormat, settings.timeFormat]); // Only recalculate when formats change

  const handleSave = useCallback(async (e) => {
    e.preventDefault();

    if (saveThrottle.isDisabled) return;

    setSaving(true);

    try {
      localStorage.setItem("dateTimeSettings", JSON.stringify(settings));

      if (user) {
        // Add your API call here to save to user profile
        // await saveUserSettings(settings);
      }

      toast.success("Date & time settings saved successfully!");
      updateGlobalFormatters(settings);
    } catch (error) {
      // toast.error("Failed to save settings");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  }, [settings, saveThrottle.isDisabled, user]);

  const updateGlobalFormatters = useCallback((settings) => {
    window.dateTimeSettings = settings;
    window.dispatchEvent(
      new CustomEvent("dateTimeSettingsChanged", {
        detail: settings,
      })
    );
  }, []);

  const handleReset = useCallback(() => {
    if (resetThrottle.isDisabled) return;

    setSettings(DEFAULT_SETTINGS);
    toast.info("Settings reset to defaults");
    localStorage.removeItem("dateTimeSettings");
  }, [resetThrottle.isDisabled]);

  // Memoized button text generators
  const getSaveButtonText = useCallback(() => {
    if (saving) return "Saving...";
    if (saveThrottle.isDisabled) return `Wait ${saveThrottle.remainingClicks}/3`;
    return "Save Settings";
  }, [saving, saveThrottle.isDisabled, saveThrottle.remainingClicks]);

  const getResetButtonText = useCallback(() => {
    if (resetThrottle.isDisabled) return `Wait ${resetThrottle.remainingClicks}/2`;
    return "Reset to Defaults";
  }, [resetThrottle.isDisabled, resetThrottle.remainingClicks]);

  return (
    <div className="content-area setting-form">
      <PerfectScrollbar>
        <PageHeaderSetting />
        <div className="content-area-body">
          <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Date & Time Format</h5>
                  <p className="text-muted mb-0">
                    Set your preferred date and time display
                  </p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSave}>
                    <div className="row">
                      {/* Date Format */}
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Date Format</label>
                          <select
                            className="form-select"
                            value={settings.dateFormat}
                            onChange={(e) =>
                              handleSettingChange("dateFormat", e.target.value)
                            }
                          >
                            {DATE_FORMATS.map((format) => (
                              <option key={format.value} value={format.value}>
                                {format.label} ({format.example})
                              </option>
                            ))}
                          </select>
                          <div className="form-text">
                            Choose how dates should be displayed
                          </div>
                        </div>
                      </div>

                      {/* Time Format */}
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Time Format</label>
                          <select
                            className="form-select"
                            value={settings.timeFormat}
                            onChange={(e) =>
                              handleSettingChange("timeFormat", e.target.value)
                            }
                          >
                            {TIME_FORMATS.map((format) => (
                              <option key={format.value} value={format.value}>
                                {format.label}
                              </option>
                            ))}
                          </select>
                          <div className="form-text">
                            Choose between 12-hour or 24-hour time format
                          </div>
                        </div>
                      </div>

                      {/* Timezone */}
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">Timezone</label>
                          <select
                            className="form-select"
                            value={settings.timezone}
                            onChange={(e) =>
                              handleSettingChange("timezone", e.target.value)
                            }
                          >
                            {TIMEZONES.map((tz) => (
                              <option key={tz} value={tz}>
                                {tz.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                          <div className="form-text">
                            Set your preferred timezone
                          </div>
                        </div>
                      </div>

                      {/* Live Preview - Now shows actual format changes */}
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">Live Preview</label>
                          <div className="card bg-light">
                            <div className="card-body text-center">
                              <div className="row">
                                <div className="col-6">
                                  <small className="text-muted">Date Preview</small>
                                  <div className="fw-bold text-primary fs-5">
                                    {preview.date}
                                  </div>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Time Preview</small>
                                  <div className="fw-bold text-success fs-5">
                                    {preview.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="form-text">
                            This shows how your current settings will display dates and times
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/settings')}
                      >
                        Back to Settings
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={resetThrottle.handleClick(handleReset)}
                        disabled={saving || resetThrottle.isDisabled}
                      >
                        {getResetButtonText()}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving || saveThrottle.isDisabled}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Saving...
                          </>
                        ) : (
                          getSaveButtonText()
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Information Sidebar */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Information</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info">
                    <h6 className="alert-heading">About Date & Time Formats</h6>
                    <p className="mb-2">
                      These settings control how dates and times are displayed.
                    </p>
                    <hr />
                    <h6 className="mt-3">Current Settings:</h6>
                    <ul className="list-unstyled mb-0">
                      <li>📅 <strong>{settings.dateFormat}</strong> date format</li>
                      <li>⏰ <strong>{settings.timeFormat === '12h' ? '12-hour' : '24-hour'}</strong> time format</li>
                      <li>🌍 <strong>{settings.timezone.replace('_', ' ')}</strong> timezone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PerfectScrollbar>
    </div>
  );
};

// Optimized formatter functions
// Simplified formatter functions
export const getDateTimeFormatters = () => {
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem("dateTimeSettings") || "{}");
  } catch {
    settings = {};
  }

  return {
    formatDate: (date) => {
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      switch (settings.dateFormat || "MM/DD/YYYY") {
        case "DD/MM/YYYY":
          return `${day}/${month}/${year}`;
        case "YYYY-MM-DD":
          return `${year}-${month}-${day}`;
        default: // MM/DD/YYYY
          return `${month}/${day}/${year}`;
      }
    },

    formatTime: (date) => {
      if (!date) return "";
      const d = new Date(date);
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');

      if ((settings.timeFormat || "12h") === "24h") {
        return `${String(hours).padStart(2, '0')}:${minutes}`;
      } else {
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${period}`;
      }
    },

    formatDateTime: (date) => {
      const formatters = getDateTimeFormatters();
      return `${formatters.formatDate(date)} ${formatters.formatTime(date)}`;
    },

    getSettings: () => ({ ...settings }),
  };
};
export default DateFormatSettings;