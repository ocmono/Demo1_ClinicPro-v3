import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  fetchWithAuth,
  setupAxiosInterceptors,
  handleApiError,
} from "../utils/apiErrorHandler";

const VaccineContext = createContext();

// Constants
const API_BASE_URL = "https://bkdemo1.clinicpro.cc";
const VACCINE_SCHEDULE_BASE_URL = `${API_BASE_URL}/vaccine-schedule`;
const CACHE_DURATION = 60000;

// Setup axios with interceptors for automatic 401 handling
const apiClient = setupAxiosInterceptors(axios.create());

// Cache manager
const createCacheManager = () => {
  let cache = {
    vaccines: { data: null, timestamp: 0 },
    patientVaccines: { data: null, timestamp: 0 },
    vaccineSchedules: { data: null, timestamp: 0 },
    productsVaccines: { data: null, timestamp: 0 },
  };

  const isCacheValid = (cacheKey) => {
    return (
      cache[cacheKey]?.data &&
      Date.now() - cache[cacheKey].timestamp < CACHE_DURATION
    );
  };

  const getCache = (cacheKey) => {
    return isCacheValid(cacheKey) ? cache[cacheKey].data : null;
  };

  const setCache = (cacheKey, data) => {
    cache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };
  };

  const clearCache = (cacheKey = null) => {
    if (cacheKey) {
      cache[cacheKey] = { data: null, timestamp: 0 };
    } else {
      cache = {
        vaccines: { data: null, timestamp: 0 },
        patientVaccines: { data: null, timestamp: 0 },
        vaccineSchedules: { data: null, timestamp: 0 },
        productsVaccines: { data: null, timestamp: 0 },
      };
    }
  };

  return { getCache, setCache, clearCache, isCacheValid };
};

// Unified API request handler
const createApiHandler = (apiClient) => {
  const request = async (endpoint, options = {}) => {
    try {
      const response = await apiClient({
        url: endpoint,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  };

  return { request };
};

export const VaccineProvider = ({ children }) => {
  const [vaccines, setVaccines] = useState([]);
  const [patientVaccines, setPatientVaccines] = useState([]);
  const [vaccineSchedules, setVaccineSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoadedSchedules, setHasLoadedSchedules] = useState(false);

  const cacheManager = useRef(createCacheManager()).current;
  const apiHandler = useRef(createApiHandler(apiClient)).current;

  // Format vaccine data consistently
  const formatVaccineData = (vaccineData) => ({
    ...vaccineData,
    dose_number: parseInt(vaccineData.dose_number) || 1,
    min_age_days: parseInt(vaccineData.min_age_days) || 0,
    max_age_days: parseInt(vaccineData.max_age_days) || 0,
    mandatory: Boolean(vaccineData.mandatory),
    repeat_interval_days: parseInt(vaccineData.repeat_interval_days) || 0,
  });

  // Enhanced error handler with fallbacks
  const handleRequestError = (error, operation, fallbackData = []) => {
    console.error(`Failed to ${operation}:`, error);

    // Check if it's a 404 error and provide specific guidance
    if (error.response?.status === 404) {
      toast.error(
        `API endpoint not found. Please check the server configuration.`
      );
    } else {
      handleApiError(error, `Failed to ${operation}`);
    }

    return fallbackData;
  };

  // Fetch vaccines with caching and better error handling
  const fetchVaccines = async (forceRefresh = false) => {
    // Return cached data if available and not forced refresh
    if (!forceRefresh) {
      const cachedData = cacheManager.getCache("vaccines");
      if (cachedData) {
        console.log("Returning cached vaccines data");
        setVaccines(cachedData);
        return { success: true, data: cachedData, fromCache: true };
      }
    }

    try {
      setLoading(true);
      // Try multiple possible endpoints
      let data;

      try {
        // First try the products/vaccines endpoint
        data = await apiHandler.request("/products/vaccines");
      } catch (firstError) {
        console.log("First endpoint failed, trying fallback...", firstError);
        // Fallback to vaccination endpoint
        try {
          data = await apiHandler.request("/vaccination/get-all-schedules");
        } catch (secondError) {
          console.log("All vaccine endpoints failed");
          throw secondError;
        }
      }

      const vaccinesArray = Array.isArray(data) ? data : [];

      setVaccines(vaccinesArray);
      cacheManager.setCache("vaccines", vaccinesArray);

      console.log("Fetched fresh vaccines data:", vaccinesArray.length);
      return { success: true, data: vaccinesArray, fromCache: false };
    } catch (err) {
      const fallbackData = handleRequestError(err, "fetch vaccines", []);
      setVaccines(fallbackData);

      // Fallback to cache even if expired when network fails
      const cachedData = cacheManager.getCache("vaccines");
      if (cachedData) {
        console.log("Network failed, returning expired cache");
        setVaccines(cachedData);
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          cacheExpired: true,
        };
      }

      return { success: false, error: err.message, data: fallbackData };
    } finally {
      setLoading(false);
    }
  };

  // Get vaccines from products endpoint with caching
  const getVaccines = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Try multiple endpoints to find vaccines
      let vaccinesData = [];

      try {
        // First try the products/vaccines endpoint
        const response = await fetchWithAuth(
          `${API_BASE_URL}/products/vaccines`
        );
        if (response.ok) {
          vaccinesData = await response.json();
        }
      } catch (firstError) {
        console.log("First vaccine endpoint failed, trying alternatives...");

        // Try vaccination schedules as fallback
        try {
          const data = await apiRequest("/vaccination/get-all-schedules");
          vaccinesData = Array.isArray(data) ? data : [];
        } catch (secondError) {
          console.log("All vaccine endpoints failed");
          // Return empty array but don't throw
        }
      }

      const vaccinesArray = Array.isArray(vaccinesData) ? vaccinesData : [];

      console.log("Vaccines fetched successfully:", vaccinesArray.length);
      setVaccines(vaccinesArray);
      cacheManager.setCache("productsVaccines", vaccinesArray);

      return { success: true, data: vaccinesArray, fromCache: false };
    } catch (error) {
      console.error("Error fetching vaccines:", error);

      // Fallback to cache
      const cachedData = cacheManager.getCache("productsVaccines");
      if (cachedData) {
        setVaccines(cachedData);
        return { success: true, data: cachedData, fromCache: true };
      }

      return { success: false, error: error.message, data: [] };
    } finally {
      setLoading(false);
    }
  };

  // Add vaccine
  const addVaccine = async (newVaccine) => {
    const payload = formatVaccineData(newVaccine);

    try {
      setLoading(true);
      const data = await apiHandler.request("/vaccination/create-schedule", {
        method: "POST",
        data: payload,
      });

      // Update local state and clear cache
      setVaccines((prev) => [...prev, data]);
      cacheManager.clearCache("vaccines");

      toast.success("Vaccine added successfully!");
      return { success: true, data };
    } catch (err) {
      handleApiError(err, "Failed to add vaccine");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Edit vaccine
  const editVaccine = async (index, updatedVaccine) => {
    const payload = formatVaccineData(updatedVaccine);

    try {
      setLoading(true);
      const data = await apiHandler.request(
        `/vaccination/edit-schedule/${updatedVaccine.id}`,
        {
          method: "PUT",
          data: payload,
        }
      );

      // Update local state and clear cache
      setVaccines((prev) => {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      });
      cacheManager.clearCache("vaccines");

      toast.success("Vaccine updated successfully!");
      return { success: true, data };
    } catch (err) {
      handleApiError(err, "Failed to update vaccine");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete vaccine
  const deleteVaccine = async (index) => {
    const id = vaccines[index]?.id;
    if (!id) {
      toast.error("Vaccine ID not found.");
      return { success: false, error: "Vaccine ID not found" };
    }

    try {
      setLoading(true);
      await apiHandler.request(`/vaccination/delete-schedule/${id}`, {
        method: "DELETE",
      });

      // Update local state and clear cache
      setVaccines((prev) => prev.filter((_, i) => i !== index));
      cacheManager.clearCache("vaccines");

      toast.success("Vaccine deleted successfully!");
      return { success: true };
    } catch (err) {
      handleApiError(err, "Failed to delete vaccine");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient vaccines with caching and better error handling
  const fetchPatientVaccines = async (forceRefresh = false) => {
    // Return cached data if available and not forced refresh
    if (!forceRefresh) {
      const cachedData = cacheManager.getCache("patientVaccines");
      if (cachedData) {
        console.log("Returning cached patient vaccines data");
        setPatientVaccines(cachedData);
        return { success: true, data: cachedData, fromCache: true };
      }
    }

    try {
      setLoading(true);
      // Try multiple possible endpoints for patient vaccines
      let data;

      try {
        data = await apiHandler.request("/vaccination/all-patients");
      } catch (firstError) {
        console.log(
          "Patient vaccines endpoint failed, trying alternatives...",
          firstError
        );
        // Try alternative endpoints if available
        try {
          data = await apiHandler.request("/patients/vaccines");
        } catch (secondError) {
          console.log("All patient vaccine endpoints failed");
          throw secondError;
        }
      }

      const patientVaccinesArray = Array.isArray(data) ? data : [];

      setPatientVaccines(patientVaccinesArray);
      cacheManager.setCache("patientVaccines", patientVaccinesArray);

      console.log(
        "Fetched fresh patient vaccines data:",
        patientVaccinesArray.length
      );
      return { success: true, data: patientVaccinesArray, fromCache: false };
    } catch (err) {
      const fallbackData = handleRequestError(
        err,
        "fetch patient vaccines",
        []
      );
      setPatientVaccines(fallbackData);

      // Fallback to cache
      const cachedData = cacheManager.getCache("patientVaccines");
      if (cachedData) {
        console.log("Network failed, returning expired patient vaccines cache");
        setPatientVaccines(cachedData);
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          cacheExpired: true,
        };
      }

      return { success: false, error: err.message, data: fallbackData };
    } finally {
      setLoading(false);
    }
  };

  // Add patient vaccine
  const addPatientVaccine = async (patientData) => {
    try {
      setLoading(true);
      const data = await apiHandler.request("/vaccination/register-patient", {
        method: "POST",
        data: patientData,
      });

      // Clear patient vaccines cache
      cacheManager.clearCache("patientVaccines");

      toast.success("Patient vaccine added successfully!");
      return { success: true, data };
    } catch (err) {
      handleApiError(err, "Failed to add patient vaccine");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Edit patient vaccine
  const editPatientVaccine = async (patientData) => {
    try {
      setLoading(true);
      const payload = {
        patient_name: patientData.patient_name,
        parent_name: patientData.parent_name,
        contact_number: patientData.contact_number,
        address: patientData.address,
        notes: patientData.notes,
        status: patientData.status,
      };

      console.log("Sending payload:", payload);

      const data = await apiHandler.request(
        `/vaccination/edit-patients/${patientData.id}`,
        {
          method: "PUT",
          data: payload,
        }
      );

      // Clear patient vaccines cache
      cacheManager.clearCache("patientVaccines");

      toast.success("Patient vaccine updated successfully!");
      return { success: true, data };
    } catch (err) {
      handleApiError(err, "Failed to update patient vaccine");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete patient vaccine
  const deletePatientVaccine = async (patientId) => {
    try {
      setLoading(true);
      await apiHandler.request(`/vaccination/delete-patients/${patientId}`, {
        method: "DELETE",
      });

      // Update local state and clear cache
      setPatientVaccines((prev) =>
        prev.filter((patient) => patient.id !== patientId)
      );
      cacheManager.clearCache("patientVaccines");

      toast.success("Patient vaccine deleted successfully!");
      return { success: true };
    } catch (err) {
      handleApiError(err, "Failed to delete patient vaccine");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateVaccine = (updated) => {
    setVaccines((prev) =>
      prev.map((vaccine) => (vaccine.id === updated.id ? updated : vaccine))
    );
    cacheManager.clearCache("vaccines");
  };

  // Vaccine Schedule API Functions with Caching

  // 1. Schedule a new vaccine
  const scheduleVaccine = async (scheduleData) => {
    try {
      setLoading(true);
      const payload = {
        patient_id: scheduleData.patient_id,
        vaccine_id: parseInt(scheduleData.vaccine_id),
        dose_number: parseInt(scheduleData.dose_number),
        schedule_date: scheduleData.schedule_date,
        status: scheduleData.status || "scheduled",
        notes: scheduleData.notes || "",
      };

      const data = await apiHandler.request(
        `${VACCINE_SCHEDULE_BASE_URL}/schedule`,
        {
          method: "POST",
          data: payload,
        }
      );

      // Update local state and clear cache
      setVaccineSchedules((prev) => [...prev, data]);
      cacheManager.clearCache("vaccineSchedules");

      toast.success("Vaccine scheduled successfully!");
      return data;
    } catch (error) {
      handleApiError(error, "Failed to schedule vaccine");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 2. Get list of all vaccine schedules with caching
  const getVaccineSchedules = async (forceRefresh = false) => {
    // Return cached data if available and not forced refresh
    if (!forceRefresh && hasLoadedSchedules && vaccineSchedules.length > 0) {
      const cachedData = cacheManager.getCache("vaccineSchedules");
      if (cachedData) {
        return { success: true, data: cachedData, fromCache: true };
      }
    }

    try {
      setLoading(true);
      setError(null);

      let data;
      try {
        data = await apiHandler.request(`${VACCINE_SCHEDULE_BASE_URL}/list`);
      } catch (scheduleError) {
        console.log(
          "Vaccine schedule endpoint failed, trying fallback...",
          scheduleError
        );
        // Try alternative endpoint
        try {
          data = await apiHandler.request("/vaccination/schedules");
        } catch (fallbackError) {
          console.log("All schedule endpoints failed");
          throw fallbackError;
        }
      }

      setHasLoadedSchedules(true);
      setVaccineSchedules(data);
      cacheManager.setCache("vaccineSchedules", data);

      return { success: true, data: data, fromCache: false };
    } catch (error) {
      const fallbackData = handleRequestError(
        error,
        "fetch vaccine schedules",
        []
      );
      setError(error.message);

      // Fallback to cache
      const cachedData = cacheManager.getCache("vaccineSchedules");
      if (cachedData) {
        console.log(
          "Network failed, returning expired vaccine schedules cache"
        );
        setVaccineSchedules(cachedData);
        setHasLoadedSchedules(true);
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          cacheExpired: true,
        };
      }

      // Set empty array instead of throwing to prevent loops
      setVaccineSchedules(fallbackData);
      setHasLoadedSchedules(true);
      return { success: false, error: error.message, data: fallbackData };
    } finally {
      setLoading(false);
    }
  };

  // 3. Update vaccine schedule status
  const updateVaccineScheduleStatus = async (scheduleId, statusData) => {
    try {
      setLoading(true);

      const data = await apiHandler.request(
        `${VACCINE_SCHEDULE_BASE_URL}/update-status/${scheduleId}`,
        {
          method: "PUT",
          params: {
            status: statusData.status,
            notes: statusData.notes || "",
          },
        }
      );

      // Update local state and clear cache
      setVaccineSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId ? { ...schedule, ...data } : schedule
        )
      );
      cacheManager.clearCache("vaccineSchedules");

      toast.success(`Vaccine schedule status updated to ${statusData.status}!`);
      return data;
    } catch (error) {
      handleApiError(error, "Failed to update schedule status");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete vaccine schedule
  const deleteVaccineSchedule = async (scheduleId) => {
    try {
      setLoading(true);
      await apiHandler.request(
        `${VACCINE_SCHEDULE_BASE_URL}/delete/${scheduleId}`,
        {
          method: "DELETE",
        }
      );

      // Update local state and clear cache
      setVaccineSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleId)
      );
      cacheManager.clearCache("vaccineSchedules");

      toast.success("Vaccine schedule deleted successfully!");
      return true;
    } catch (error) {
      handleApiError(error, "Failed to delete vaccine schedule");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getSchedulesByPatient = (patientId) => {
    return vaccineSchedules.filter(
      (schedule) => schedule.patient_id === patientId
    );
  };

  const getSchedulesByStatus = (status) => {
    return vaccineSchedules.filter((schedule) => schedule.status === status);
  };

  const getOverdueSchedules = () => {
    const today = new Date();
    return vaccineSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.schedule_date);
      return schedule.status === "scheduled" && scheduleDate < today;
    });
  };

  // Clear all cache
  const clearCache = () => {
    cacheManager.clearCache();
    console.log("All vaccine cache cleared");
  };

  // Auto-refresh cache every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto-refreshing vaccine cache...");
      fetchVaccines(true); // Force refresh vaccines
      fetchPatientVaccines(true); // Force refresh patient vaccines
      getVaccineSchedules(true); // Force refresh schedules
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Initial data fetches with error boundaries
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.allSettled([
          fetchVaccines(),
          fetchPatientVaccines(),
          getVaccineSchedules(),
        ]);
      } catch (error) {
        console.error("Error initializing vaccine data:", error);
      }
    };

    initializeData();
  }, []);

  return (
    <VaccineContext.Provider
      value={{
        // State
        vaccines,
        patientVaccines,
        vaccineSchedules,
        loading,
        error,

        // Vaccine functions
        fetchVaccines,
        addVaccine,
        editVaccine,
        deleteVaccine,
        updateVaccine,
        getVaccines,

        // Patient vaccine functions
        fetchPatientVaccines,
        addPatientVaccine,
        editPatientVaccine,
        deletePatientVaccine,

        // Vaccine schedule functions
        scheduleVaccine,
        getVaccineSchedules,
        updateVaccineScheduleStatus,
        deleteVaccineSchedule,

        // Helper functions
        getSchedulesByPatient,
        getSchedulesByStatus,
        getOverdueSchedules,

        // Cache management
        clearCache,
      }}
    >
      {children}
    </VaccineContext.Provider>
  );
};

export const useVaccine = () => {
  const context = useContext(VaccineContext);
  if (!context) {
    throw new Error("useVaccine must be used within a VaccineProvider");
  }
  return context;
};
