import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { setupAxiosInterceptors, handleApiError } from "../utils/apiErrorHandler";

const ActivityContext = createContext();

// ✅ Create Axios instance with interceptors
const apiClient = setupAxiosInterceptors(axios.create({
  baseURL: "https://bkdemo1.clinicpro.cc", // base URL for consistency
  timeout: (60 * 1000), // 10 seconds
  headers: { "Cache-Control": "no-cache" },
}));

export const ActivityProvider = ({ children }) => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const fetchInProgress = useRef(false);

  /**
   * Fetch activity logs from backend with caching (30s throttle)
   */
  const fetchActivityLogsFromBackend = useCallback(async (forceRefresh = false) => {
    if (fetchInProgress.current) {
      console.log("⏳ Fetch already in progress, skipping...");
      return;
    }

    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < (60 * 1000)) {
      console.log("⏱️ Skipping fetch (within 60s cache window)");
      return;
    }

    fetchInProgress.current = true;
    setLoading(true);

    try {
      const { data } = await apiClient.get("/admin/activity-logs"); 
      setActivityLogs(Array.isArray(data) ? data : []);
      setLastFetchTime(now);
    } catch (error) {
      handleApiError(error, "Failed to fetch activity logs");
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [lastFetchTime]);

  /**
   * Manual refresh handler (force fetch)
   */
  const refreshActivityLogs = useCallback(() => {
    fetchActivityLogsFromBackend(true);
    toast.info("🔄 Activity logs refreshed");
  }, [fetchActivityLogsFromBackend]);

  return (
    <ActivityContext.Provider
      value={{
        activityLogs,
        loading,
        fetchActivityLogsFromBackend,
        refreshActivityLogs,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);
