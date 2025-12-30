import { createContext, useEffect, useContext, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utils/apiErrorHandler";

/* ================================
   1. Create Context & Custom Hook
================================ */
const defaultClinicManagementContext = {
  clinicSpecialities: [],
  setClinicSpecialities: () => { },
  fetchSpecialities: () => { },

  // Doctor
  doctorForm: {},
  setDoctorForm: () => { }, 
  saveDoctorInDB: async () => { },
  updateDoctorInDB: async () => { },

  // Symptoms
  symptomsBySpeciality: {},
  fetchSymptoms: async () => { },
  saveSymptomsToBackend: async () => { },

  // Lab Tests
  labTestsBySpeciality: {},
  fetchLabTests: async () => { },
};

export const ClinicManagementContext =
  createContext(defaultClinicManagementContext);

// Custom hook to easily consume the context
export const useClinicManagement = () => {
  const context = useContext(ClinicManagementContext);

  if (!context) {
    throw new Error(
      "useClinicManagement must be used inside ClinicManagementProvider"
    );
  }

  return context;
};

/* ================================
   2. Clinic Management Provider
================================ */
export const ClinicManagementProvider = ({ children }) => {
  /* ---------------------------------
     Clinic Specialties State & Functions
  --------------------------------- */
  const [clinicSpecialities, setClinicSpecialities] = useState([]); // Holds the list of clinic specialties (Dermatologist, Trichologist, etc.)

  // Removes a specialty from the state list
  // const removeSpeciality = (specialtyToRemove) => {
  //   try {
  //     setClinicSpecialties((prev) =>
  //       prev.filter((spec) => spec !== specialtyToRemove)
  //     );
  //     toast.success("Deleted the speciality", { autoClose: 4000 });
  //   } catch {
  //     toast.error("Unable to delete the speciality", { autoClose: 4000 });
  //   }
  // };

  /* ---------------------------------
     Doctor Form State & Functions
  --------------------------------- */
  const [doctorForm, setDoctorForm] = useState({
    firstName: "", // Doctor's first name
    lastName: "", // Doctor's last name
    drSpeciality: "", // Doctor's selected specialty (mapped to drSpeciality when sending)
    gender: "", // Doctor's gender
    drPhone: "", // Doctor's phone number
    drEmail: "", // Doctor's email
    drQualification: "", // Doctor's qualification (selected from
    //dropdown)
    password: "",
    startBufferTime: "",
    endBufferTime: "",
  });

  /* ---------------------------------
     Doctor Weekly Availability (Days & Slots)
  --------------------------------- */
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Initializes weekly availability with default open slots for each day
  const [weeklyAvailability, setWeeklyAvailability] = useState(
    daysOfWeek.map((day) => ({
      day,
      closed: false, // By default, the day is open
      slots: [{ startTime: "" || null, endTime: "" || null, slotDuration: 30 }], // Default one slot
    }))
  );

  // Toggles whether a particular day is closed
  const handleClosedToggle = (dayIndex) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].closed = !updated[dayIndex].closed;
    setWeeklyAvailability(updated);
  };

  // Handles changes in time slot details (startTime, endTime, slotDuration)
  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].slots[slotIndex][field] = value;
    setWeeklyAvailability(updated);
  };

  // Adds a new time slot for a given day
  const addSlot = (dayIndex) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].slots.push({
      startTime: "",
      endTime: "",
      slotDuration: 30,
    });
    setWeeklyAvailability(updated);
  };

  // Removes a specific time slot from a given day
  const removeSlot = (dayIndex, slotIndex) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].slots.splice(slotIndex, 1);
    setWeeklyAvailability(updated);
  };

  // Resets all availability back to default
  const resetWeeklyAvailability = () => {
    setWeeklyAvailability(
      daysOfWeek.map((day) => ({
        day,
        closed: false,
        slots: [{ startTime: "", endTime: "", slotDuration: 30 }],
      }))
    );
  };

  /* ---------------------------------
     Fetching Specialties from Backend
  --------------------------------- */
  useEffect(() => {
    fetchSpecialities();
  }, []);

  const fetchSpecialities = async () => {
    try {
      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/speciality/speciality-list"
      ); // Fetches specialities from backend
      console.log("Response status:===", response.status); // Log the response status code
      // const text = await response.text();
      // console.log("Response text:", text);
      if (!response.ok) throw new Error("Failed to fetch specialties");
      const data = await response.json();
      console.log("fetchSpecialities =====================", data);
      // toast.success("Fetched specailties from backend");
      setClinicSpecialities(data); // Updates the specialties state
    } catch (error) {
      // toast.error("Error fetching specialities", { autoClose: 4000 });
      console.error("Error fetching specialities:", error);
    }
  };
  /* ---------------------------------
     Adding specialty to backend
  --------------------------------- */
  const addSpeciality = async (newSpeciality) => {
    try {
      // Prepare the payload based on what we're sending
      const payload = typeof newSpeciality === 'string'
        ? { speciality: newSpeciality }
        : {
          speciality: newSpeciality.speciality,
          description: newSpeciality.description || '',
          status: newSpeciality.status || 'Active'
        };

      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/speciality/add-speciality",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload), // Send appropriate payload
        }
      );

      if (!response.ok) throw new Error("Failed to add speciality");

      // Parse the JSON response from the backend
      const addedSpeciality = await response.json();

      // Create the full specialty object for local state
      const fullSpecialty = {
        id: addedSpeciality.id || Date.now(), // Use returned ID or timestamp fallback
        speciality: addedSpeciality.speciality || newSpeciality.speciality,
        description: newSpeciality.description || '',
        category: newSpeciality.category || 'Medical',
        appointmentDuration: newSpeciality.appointmentDuration || '30',
        requirements: newSpeciality.requirements || '',
        status: newSpeciality.status || 'Active',
        doctorCount: 0,
        createdAt: new Date().toLocaleDateString()
      };

      // Update the state with the complete specialty object
      setClinicSpecialities((prev) => [...prev, fullSpecialty]);

      toast.success("Speciality added successfully!");
    } catch (error) {
      // toast.error("Error adding speciality", { autoClose: 4000 });
      console.error("Error adding speciality:", error);
      throw error; // Re-throw for form error handling
    }
  };

  /* ---------------------------------
     Removing specialty
  --------------------------------- */
  const removeSpeciality = async (specialityId) => {
    try {
      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/speciality/delete-speciality/${specialityId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to remove speciality");

      setClinicSpecialities((prev) =>
        prev.filter((speciality) => speciality.id !== specialityId)
      );
      toast.success("Speciality removed successfully!");
    } catch (error) {
      // toast.error("Error removing speciality", { autoClose: 4000 });
      console.error("Error removing speciality:", error);
    }
  };

  /* ---------------------------------
     Sending Specialties to Backend (Sync)
  --------------------------------- */
  const updateSpeciality = async (specialityId, updatedSpeciality) => {
    try {
      // Prepare the payload based on what we're sending
      const payload = typeof updatedSpeciality === 'string'
        ? { speciality: updatedSpeciality }
        : {
          speciality: updatedSpeciality.speciality,
          description: updatedSpeciality.description || '',
          status: updatedSpeciality.status || 'Active'
        };

      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/speciality/update-speciality/${specialityId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update speciality");

      // Update the local state with complete specialty object
      setClinicSpecialities((prev) =>
        prev.map((speciality) =>
          speciality.id == specialityId
            ? {
              ...speciality,
              speciality: updatedSpeciality.speciality || updatedSpeciality,
              description: updatedSpeciality.description || speciality.description || '',
              category: updatedSpeciality.category || speciality.category || 'Medical',
              appointmentDuration: updatedSpeciality.appointmentDuration || speciality.appointmentDuration || '30',
              requirements: updatedSpeciality.requirements || speciality.requirements || '',
              status: updatedSpeciality.status || speciality.status || 'Active'
            }
            : speciality
        )
      );
      toast.success("Speciality updated successfully!");
    } catch (error) {
      // toast.error("Error updating speciality", { autoClose: 4000 });
      console.error("Error updating speciality:", error);
      throw error; // Re-throw for form error handling
    }
  };

  /* ---------------------------------
     Sending Doctor Data to Backend
  --------------------------------- */
  const saveDoctorInDB = async (doctorData = null) => {
    try {
      // Use passed data or fall back to context state
      const formData = doctorData || doctorForm;
      const availability = doctorData?.availability || weeklyAvailability;

      // Step 1: Flatten availability structure
      const flatAvailability = availability.flatMap((dayObj) => {
        if (dayObj.closed) {
          return [
            {
              day: dayObj.day,
              closed: true,
              startTime: null,
              endTime: null,
              slotDuration: null,
            },
          ];
        }

        // Helper function to format time to the required "HH:mm:ss.sssZ" format
        const formatTimeToISO = (time) => {
          if (!time || time === "" || time === "--:-- --") return null; // Handle empty or placeholder times

          try {
            const [hours, minutes] = time.split(":"); // Split the time string into hours and minutes

            // Validate hours and minutes
            const h = parseInt(hours);
            const m = parseInt(minutes);

            if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
              console.warn(`Invalid time format: ${time}`);
              return null;
            }

            // Create a new Date object for a fixed date, only using time
            const date = new Date();
            date.setUTCHours(h);
            date.setUTCMinutes(m);
            date.setUTCSeconds(0);
            date.setMilliseconds(0); // Set milliseconds to 0

            // Get the time in the "HH:mm:ss.sssZ" format
            const hh = String(h).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            return `${hh}:${mm}:00`;; // This gives you "HH:mm:ss.sssZ"
          } catch (error) {
            console.warn(`Error formatting time ${time}:`, error);
            return null;
          }
        };

        // Filter out slots with invalid or missing times
        const validSlots = dayObj.slots.filter(slot => {
          const hasValidStart = slot.startTime && slot.startTime !== "" && slot.startTime !== "--:-- --";
          const hasValidEnd = slot.endTime && slot.endTime !== "" && slot.endTime !== "--:-- --";
          return hasValidStart && hasValidEnd;
        });

        // If no valid slots, mark day as closed
        if (validSlots.length === 0) {
          return [
            {
              day: dayObj.day,
              closed: true,
              startTime: null,
              endTime: null,
              slotDuration: null,
            },
          ];
        }

        return validSlots.map((slot) => ({
          day: dayObj.day,
          closed: false,
          startTime: formatTimeToISO(slot.startTime),
          endTime: formatTimeToISO(slot.endTime),
          slotDuration: slot.slotDuration || 30,
        }));
      });

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'drSpeciality', 'gender', 'drPhone', 'drEmail', 'drQualification'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Preparing doctor data with additional computed fields
      const doctorWithSlug = {
        ...formData,
        // Ensure all required fields are properly formatted
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        drSpeciality: formData.drSpeciality.trim(),
        gender: formData.gender.trim(),
        drPhone: formData.drPhone.trim(),
        drEmail: formData.drEmail.trim().toLowerCase(),
        drQualification: formData.drQualification.trim(),
        password: formData.password,

        // Add alternative field names that backend might expect
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        doctor_name: `Dr. ${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.drEmail.trim().toLowerCase(),
        phone: formData.drPhone.trim(),
        specialty: formData.drSpeciality.trim(),
        speciality: formData.drSpeciality.trim(),
        qualification: formData.drQualification.trim(),

        // Additional fields that backend might require
        status: formData.status || "Active",
        experience: String(formData.experience || "0"),
        // address: formData.address || "",
        // city: formData.city || "", 
        // state: formData.state || "",
        // zipCode: formData.zipCode || "",
        // bio: formData.bio || "",

        // Alternative field names for backend compatibility
        doctor_status: formData.status || "Active",
        years_of_experience: String(formData.experience || "0"),
        // doctor_address: formData.address || "",
        // doctor_city: formData.city || "",
        // doctor_state: formData.state || "",
        // doctor_zip: formData.zipCode || "",
        // doctor_bio: formData.bio || "",

        keyword: formData.firstName ? formData.firstName.toLowerCase().replace(/\s+/g, "-") : "", // Generate slug keyword from first name
        availability: flatAvailability, // Include weekly availability
        startBufferTime: String(formData.startBufferTime || "0"),
        endBufferTime: String(formData.endBufferTime || "0"),

        // Add unique identifier and timestamp
        uniqueId: `dr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if we have at least one valid availability slot
      const validSlots = flatAvailability.filter(slot => !slot.closed && slot.startTime && slot.endTime);
      if (validSlots.length === 0) {
        throw new Error("Please configure at least one valid time slot for the doctor's availability");
      }

      console.log("=== DOCTOR SUBMISSION DEBUG ===");
      console.log("Original availability data:", availability);
      console.log("Processed availability:", flatAvailability);
      console.log("Valid availability slots:", validSlots.length);
      console.log("Final doctor payload:", doctorWithSlug);
      console.log("Required fields check:", {
        firstName: !!formData.firstName,
        lastName: !!formData.lastName,
        drSpeciality: !!formData.drSpeciality,
        gender: !!formData.gender,
        drPhone: !!formData.drPhone,
        drEmail: !!formData.drEmail,
        drQualification: !!formData.drQualification
      });
      console.log("=== END DEBUG ===");

      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/doctor/add-doctor", // Backend endpoint for doctor creation
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doctorWithSlug),
        }
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        console.error("API Error Response:", errorData);
        console.error("Request payload:", doctorWithSlug);

        // Extract error message from various possible formats
        let errorMessage;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else if (errorData?.details) {
          errorMessage = errorData.details;
        } else if (errorData?.errors) {
          errorMessage = Array.isArray(errorData.errors) ? errorData.errors.join(', ') : JSON.stringify(errorData.errors);
        } else {
          errorMessage = JSON.stringify(errorData);
        }

        throw new Error(`Backend error (${response.status}): ${errorMessage}`);
      }

      const result = await response.json();
      console.log("Doctor saved successfully:", result);
      toast.success("Doctor added successfully!", { autoClose: 4000 });

      return result;
    } catch (error) {
      console.error("Error adding Doctor:", error);
      // toast.error(`Error adding Doctor: ${error.message}`, { autoClose: 4000 });
      throw error;
    }
  };

  const updateDoctorInDB = async (doctorId, data) => {
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();

      console.log("=== updateDoctorInDB DEBUG ===");
      console.log("1. Received data:", data);
      console.log("2. drSpeciality:", data.drSpeciality, "Type:", typeof data.drSpeciality, "Is Array:", Array.isArray(data.drSpeciality));
      console.log("3. qualification:", data.qualification, "Type:", typeof data.qualification, "Is Array:", Array.isArray(data.qualification));

      // 🔹 Handle signature (base64 → file)
      if (data.sign && typeof data.sign === "string" && data.sign.startsWith("data:image")) {
        console.log("4. Processing signature...");
        const arr = data.sign.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const extension = mime.split("/")[1] || "png";
        const timestamp = Date.now();

        const filename = `doctor-signature-${doctorId}-${timestamp}.${extension}`;

        const file = new File([u8arr], filename, { type: mime });

        formData.append("sign", file);
      }

      // 🔹 Availability (ARRAY → JSON STRING)
      if (Array.isArray(data.availability)) {
        console.log("6. Processing availability array...");
        formData.append("availability", JSON.stringify(data.availability));
        console.log("7. Availability JSON string:", JSON.stringify(data.availability));
      }

      // 🔹 Arrays → append each value
      ["drSpeciality", "qualification"].forEach((key) => {
        if (Array.isArray(data[key])) {
          console.log(`8. Processing ${key} array with ${data[key].length} items:`, data[key]);
          data[key].forEach((v, i) => {
            if (v && v.trim()) { // Only add non-empty values
              formData.append(key, v.toString());
              console.log(`9. Added ${key}[${i}]: ${v}`);
            }
          });
        } else if (data[key]) {
          // Handle single value
          console.log(`10. Processing ${key} as single value:`, data[key]);
          formData.append(key, data[key].toString());
        } else {
          console.log(`11. ${key} is empty or undefined`);
        }
      });

      // 🔹 Remaining primitive fields
      Object.entries(data).forEach(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          key === "sign" ||
          key === "availability" ||
          key === "drSpeciality" ||
          key === "qualification"
        ) return;

        console.log(`12. Adding ${key}: ${value}`);
        formData.append(key, value.toString());
      });

      // 🧪 Debug
      console.log("UPDATE DOCTOR FORMDATA:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await fetch(
        `https://bkdemo1.clinicpro.cc/doctor/update-doctor/${doctorId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      console.log("14. Response status:", res.status);
      console.log("15. Response status text:", res.statusText);

      if (!res.ok) {
        const err = await res.json().catch(() => null);

        console.error("❌ Backend validation error:", err);

        let message = "Doctor update failed";

        if (typeof err?.detail === "string") {
          message = err.detail;
        } else if (Array.isArray(err?.detail)) {
          message = err.detail
            .map(e => e.msg || JSON.stringify(e))
            .join(", ");
        } else if (typeof err?.detail === "object") {
          message = JSON.stringify(err.detail);
        }

        throw new Error(message);
      }

      return await res.json();
    } catch (err) {
      console.error("❌ updateDoctorInDB error:", err);
      throw err;
    }
  };


  /* ---------------------------------------------------------
     -----------------Symptom Management Codes -------
  ----------------------------------------------------------- */
  const [symptomsBySpeciality, setSymptomsBySpeciality] = useState({});

  // ✅ 1. Fetch Symptoms from Backend
  const fetchSymptoms = async (specialityId) => {
    try {
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/speciality/configure-speciality/${specialityId}`
      );

      if (!res.ok) throw new Error("Failed to fetch symptoms");
      const data = await res.json();

      let diagnoses = Array.isArray(data.diagnosis) ? data.diagnosis : [];

      diagnoses = dedupeDiagnosis(normalizeDiagnosis(diagnoses));

      setSymptomsBySpeciality((prev) => ({
        ...prev,
        [specialityId]: dedupeDiagnosis(normalizeDiagnosis(diagnoses)),
      }));

      toast.success("Symptoms loaded!");
    } catch (err) {
      console.error("❌ fetchSymptoms error:", err);
      // toast.error("Failed to fetch symptoms");
      setSymptomsBySpeciality((prev) => ({
        ...prev,
        [specialityId]: [],
      }));
    }
  };

  const normalizeDiagnosis = (list) => {
    if (!Array.isArray(list)) return [];

    return list.map((d) => ({
      name: d.name.trim(),
      symptoms: Array.from(
        new Set(
          (d.symptoms || [])
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        )
      ),
    }));
  };

  const dedupeDiagnosis = (list) => {
    const map = {};

    list.forEach((d) => {
      const key = d.name.trim().toLowerCase();

      if (!map[key]) {
        map[key] = { name: d.name.trim(), symptoms: [] };
      }

      map[key].symptoms.push(...(d.symptoms || []));
    });

    return Object.values(map).map((d) => ({
      name: d.name,
      symptoms: Array.from(new Set(d.symptoms.map((s) => s.trim()))),
    }));
  };

  // ✅ 2. ADD NEW Diagnosis/Symptoms (POST endpoint)
  const addDiagnosis = async (specialityId, diagnosisData) => {
    try {
      // For POST, we need to send only the NEW diagnosis
      const payload = {
        specialityId: parseInt(specialityId),
        diagnosis: [diagnosisData] // Send only the new diagnosis
      };

      console.log("📤 Adding diagnosis:", payload);

      const res = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/speciality/configure-speciality",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        throw new Error("Failed to add diagnosis");
      }

      const responseData = await res.json();
      console.log("✅ Diagnosis added:", responseData);

      // Refresh from backend to get updated list
      await fetchSymptoms(specialityId);

      return responseData;
    } catch (err) {
      console.error("❌ addDiagnosis error:", err);
      // toast.error("Failed to add diagnosis");
      throw err;
    }
  };

  // ✅ 3. UPDATE ALL Diagnoses (PUT endpoint - replaces everything)
  const updateAllDiagnoses = async (specialityId, diagnosisArray) => {
    try {
      const uniqueDiagnoses = [];
      const seenNames = new Set();

      diagnosisArray.forEach(diagnosis => {
        const normalizedName = diagnosis.name.trim().toLowerCase();
        if (!seenNames.has(normalizedName)) {
          seenNames.add(normalizedName);
          uniqueDiagnoses.push({
            name: diagnosis.name.trim(),
            symptoms: Array.isArray(diagnosis.symptoms)
              ? [...new Set(diagnosis.symptoms.map(s => s.trim()).filter(s => s.length > 0))]
              : []
          });
        }
      });

      const payload = {
        specialityId: parseInt(specialityId),
        diagnosis: uniqueDiagnoses // Send ALL diagnoses (complete replacement)
      };

      console.log("📤 Updating all diagnoses (unique only):", payload);

      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/speciality/update-speciality-configure/${specialityId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        throw new Error("Failed to update diagnoses");
      }

      const responseData = await res.json();
      console.log("✅ All diagnoses updated:", responseData);

      // Update local state immediately
      setSymptomsBySpeciality((prev) => ({
        ...prev,
        [specialityId]: uniqueDiagnoses,
      }));

      toast.success("✅ Diagnoses updated successfully!");
      return responseData;
    } catch (err) {
      console.error("❌ updateAllDiagnoses error:", err);
      // toast.error("Failed to update diagnoses");
      throw err;
    }
  };

  // ✅ 4. DELETE ALL Diagnoses (DELETE endpoint)
  const deleteAllDiagnoses = async (specialityId) => {
    try {
      const payload = {
        specialityId: parseInt(specialityId)
      };

      console.log("🗑️ Deleting all diagnoses for specialty:", specialityId);

      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/speciality/delete-speciality-configure/${specialityId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        throw new Error("Failed to delete diagnoses");
      }

      const responseData = await res.json();
      console.log("✅ All diagnoses deleted:", responseData);

      // Clear local state
      setSymptomsBySpeciality((prev) => ({
        ...prev,
        [specialityId]: [],
      }));

      toast.success("✅ All diagnoses deleted!");
      return responseData;
    } catch (err) {
      console.error("❌ deleteAllDiagnoses error:", err);
      // toast.error("Failed to delete diagnoses");
      throw err;
    }
  };

  const saveSymptomsToBackend = async (specialityId, diagnosisList) => {
    try {
      let cleaned = normalizeDiagnosis(diagnosisList);
      cleaned = dedupeDiagnosis(cleaned);

      const existing = symptomsBySpeciality[specialityId] || [];
    const payload = {
      specialityId: Number(specialityId),
      diagnosis: cleaned
    };

      // FIRST TIME → POST
      if (!existing || existing.length === 0) {
        console.log("🟢 Using POST (first time)");
        const res = await fetchWithAuth(
          "https://bkdemo1.clinicpro.cc/speciality/configure-speciality",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        if (!res.ok) throw new Error(await res.text());
        toast.success("Speciality created successfully!");
        await fetchSymptoms(specialityId);
        return;
      }

      // AFTER FIRST TIME → PUT
      console.log("🟡 Using PUT (update)");
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/speciality/update-speciality-configure/${specialityId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error(await res.text());
      toast.success("Speciality updated successfully!");
      await fetchSymptoms(specialityId);

    } catch (err) {
      console.error("❌ saveSymptomsToBackend error:", err);
      // toast.error("Failed to save speciality config");
      throw err;
    }
  };

  const addSingleDiagnosis = async (specialityId, diagnosisName) => {
    try {
      const diagnosisData = {
        name: diagnosisName.trim(),
        symptoms: []
      };

      return await addDiagnosis(specialityId, diagnosisData);
    } catch (err) {
      throw err;
    }
  };

  const removeSymptomFromDiagnosis = async (specialityId, diagnosisName, symptomIndex) => {
    try {
      const currentDiagnoses = symptomsBySpeciality[specialityId] || [];

      // Find the diagnosis and remove the symptom
      const updatedDiagnoses = currentDiagnoses.map(d => {
        if (d.name === diagnosisName) {
          const updatedSymptoms = [...(d.symptoms || [])];
          updatedSymptoms.splice(symptomIndex, 1);
          return { ...d, symptoms: updatedSymptoms };
        }
        return d;
      });

      // Save the updated list
      await updateAllDiagnoses(specialityId, updatedDiagnoses);

      toast.success("✅ Symptom removed successfully!");
    } catch (err) {
      console.error("❌ removeSymptomFromDiagnosis error:", err);
      // toast.error("Failed to remove symptom");
      throw err;
    }
  };

  const addSymptomToDiagnosis = async (specialityId, diagnosisName, symptomName) => {
    try {
      // First, get current state
      const currentDiagnoses = symptomsBySpeciality[specialityId] || [];

      // Update backend FIRST
      const updatedDiagnoses = currentDiagnoses.map(d => {
        if (d.name === diagnosisName) {
          const updatedSymptoms = [...(d.symptoms || []), symptomName.trim()];
          return { ...d, symptoms: updatedSymptoms };
        }
        return d;
      });

      // Save to backend
      await updateAllDiagnoses(specialityId, updatedDiagnoses);

      toast.success("✅ Symptom added successfully!");
    } catch (err) {
      console.error("❌ addSymptomToDiagnosis error:", err);
      // toast.error("Failed to add symptom");
      throw err; // Re-throw for component error handling
    }
  };

  const removeDiagnosis = async (specialityId) => {
    try {
      console.log("🗑️ Deleting ALL diagnoses for speciality:", specialityId);

      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/speciality/delete-speciality-configure/${specialityId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to delete diagnoses");
      }

      // ✅ Clear local state
      setSymptomsBySpeciality(prev => ({
        ...prev,
        [specialityId]: [],
      }));

      toast.success("✅ All diagnoses deleted successfully!");
    } catch (err) {
      console.error("❌ removeDiagnosis error:", err);
      // toast.error("Failed to delete diagnoses");
      throw err;
    }
  };

  /* --------------------------------
     lab test component provider
  --------------------------------- */
  const [labTestsBySpeciality, setLabTestsBySpeciality] = useState({});
  // const fetchLabTests = async (specialityId) => {
  //   try {
  //     const res = await fetch(
  //       `https://bkdemo1.clinicpro.cc/doctor/lab-tests/${specialtyId}`
  //     );
  //     const data = await res.json();
  //     setLabTestsBySpecialty((prev) => ({
  //       ...prev,
  //       [specialtyId]: data || [],
  //     }));
  //   } catch (err) {
  //     console.error("❌ Failed to fetch lab tests:", err);
  //     setLabTestsBySpecialty((prev) => ({
  //       ...prev,
  //       [specialtyId]: [],
  //     }));
  //   }
  // };
  const fetchLabTests = async (specialityId) => {
    try {
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/tests/speciality/${specialityId}`
      );
      const data = await res.json();

      const labTests = Array.isArray(data)
        ? data
        : Array.isArray(data.labTests)
          ? data.labTests
          : [];

      setLabTestsBySpeciality((prev) => ({
        ...prev,
        [specialityId]: labTests,
      }));
      toast.success("✅ Lab tests loaded successfully");
    } catch (err) {
      console.error("❌ Failed to fetch lab tests:", err);
      setLabTestsBySpeciality((prev) => ({
        ...prev,
        [specialityId]: [],
      }));
    }
  };

  const USE_BACKEND = true;

  const addLabTest = async (specialityId, newTest) => {
    if (!newTest?.test_name?.trim()) {
      console.log("❌ Test name cannot be empty");
      // toast.error("❌ Test name cannot be empty");
      return;
    }

    if (!USE_BACKEND) {
      setLabTestsBySpeciality((prev) => {
        const existing = prev[specialityId] || [];

        // 🔍 Check for duplicate
        const isDuplicate = existing.some(
          (test) =>
            test.test_name.toLowerCase().trim() ===
            newTest.test_name.toLowerCase().trim()
        );

        if (isDuplicate) {
          console.log("❌ Lab test already exists");
          // toast.error("❌ Lab test already exists");
          return prev; // no change
        }

        return {
          ...prev,
          [specialityId]: [...existing, { id: Date.now(), ...newTest }],
        };
      });
      return;
    }

    // ✅ Backend enabled
    const payload = {
      speciality_id: parseInt(specialityId),
      test_name: newTest.test_name.trim(),
    };

    console.log("📤 Sending payload to /tests/add-test:", payload);

    // 🔍 Check for duplicates before sending
    const currentTests = labTestsBySpeciality[specialityId] || [];
    const isDuplicate = currentTests.some(
      (test) =>
        test.test_name.toLowerCase().trim() ===
        newTest.test_name.toLowerCase().trim()
    );

    if (isDuplicate) {
      console.log("❌ Lab test already exists");
      // toast.error("❌ Lab test already exists");
      return;
    }

    try {
      const response = await fetchWithAuth("https://bkdemo1.clinicpro.cc/tests/add-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`Add failed: ${errMsg}`);
      }

      toast.success("✅ Lab Test added successfully");
      await fetchLabTests(specialityId);
    } catch (err) {
      console.error("❌ Add lab test failed:", err);
      // toast.error("Failed to add lab test");
    }
  };

  // const deleteLabTest = async (specialtyId, testId) => {
  //   if (!USE_BACKEND) {
  //     setLabTestsBySpecialty((prev) => {
  //       const updatesLabTest = (prev[specialtyId] || []).filter(
  //         (t) => t.id !== testId
  //       );
  //       return {
  //         ...prev,
  //         [specialtyId]: updatesLabTest,
  //       };
  //     });
  //   }
  //   try {
  //     const response = await fetch(
  //       `https://bkdemo1.clinicpro.cc/doctor/delete-lab-test/${testId}`,
  //       {
  //         method: "DELETE",
  //       }
  //     );

  //     if (!response.ok) throw new Error("Delete failed");

  //     fetchLabTests(specialtyId);
  //   } catch (err) {
  //     console.error("❌ Delete lab test failed:", err);
  //   }
  // };

  const deleteLabTest = async (specialityId, testId) => {
    if (!USE_BACKEND) {
      setLabTestsBySpeciality((prev) => {
        const updatedTests = (prev[specialityId] || []).filter(
          (t) => t.id !== testId
        );
        return {
          ...prev,
          [specialityId]: updatedTests,
        };
      });
      return;
    }

    try {
      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/tests/delete-test/${testId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Delete failed");
      toast.success("✅ Lab tests deleted successfully");
      await fetchLabTests(specialityId); // Refresh after delete
    } catch (err) {
      console.error("❌ Delete lab test failed:", err);
    }
  };

  // const updateLabTest = async (specialtyId, test) => {
  //   if (!USE_BACKEND) {
  //     // ✅ Mock local update in state
  //     setLabTestsBySpecialty((prev) => {
  //       const updatedTests = (prev[specialtyId] || []).map((t) =>
  //         t.id === test.id ? { ...t, name: test.name } : t
  //       );
  //       return {
  //         ...prev,
  //         [specialtyId]: updatedTests,
  //       };
  //     });
  //     return;
  //   }

  //   // ✅ Real backend call
  //   try {
  //     const response = await fetch(
  //       `https://bkdemo1.clinicpro.cc/doctor/update-lab-test/${test.id}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(test),
  //       }
  //     );

  //     if (!response.ok) throw new Error("Update failed");

  //     fetchLabTests(specialtyId); // Re-fetch for sync
  //   } catch (err) {
  //     console.error("❌ Update lab test failed:", err);
  //   }
  // };
  const updateLabTest = async (specialityId, test) => {
    try {
      const payload = {
        id: test.id,
        test_name: test.test_name,
      };
      console.log("📤 Update Payload:", payload);

      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/tests/update-tests",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();
      console.log("Update response:", responseData);

      if (!response.ok) {
        throw new Error("Update failed: " + JSON.stringify(responseData));
      }

      toast.success("✅ Lab test updated successfully");
      await fetchLabTests(specialityId);
    } catch (error) {
      console.error("❌ Lab test update error:", error.message);
      // toast.error("Failed to update lab test");
    }
  };

  /* ---------------------------------
     Context Provider Return
  --------------------------------- */
  return (
    <ClinicManagementContext.Provider
      value={{
        // Doctor Form Management
        doctorForm,
        setDoctorForm,
        weeklyAvailability,
        setWeeklyAvailability,
        handleClosedToggle,
        handleSlotChange,
        addSlot,
        removeSlot,
        resetWeeklyAvailability,
        updateDoctorInDB,

        // Clinic Specialties Management
        clinicSpecialities,
        setClinicSpecialities,
        removeSpeciality,
        updateSpeciality,
        addSpeciality,

        // Backend Actions

        saveDoctorInDB,

        //Symptom management Actions
        fetchSymptoms,
        symptomsBySpeciality,
        setSymptomsBySpeciality,
        addDiagnosis: addSingleDiagnosis,
        updateAllDiagnoses,
        deleteAllDiagnoses,
        saveSymptomsToBackend,

        addSymptomToDiagnosis,
        removeSymptomFromDiagnosis,
        removeDiagnosis,
        dedupeDiagnosis,
        normalizeDiagnosis,

        //lab test
        labTestsBySpeciality,
        fetchLabTests,
        addLabTest,
        deleteLabTest,
        updateLabTest,
        fetchSpecialities,
      }}
    >
      {children}
    </ClinicManagementContext.Provider>
  );
};
