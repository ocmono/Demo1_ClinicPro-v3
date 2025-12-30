// contentApi/BookingProvider.js
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { fetchWithAuth } from "../utils/apiErrorHandler";

// 1. Create Context
export const BookingContext = createContext();

// 2. Custom Hook to Consume Context
export const useBooking = () => useContext(BookingContext);

// 3. Provider Component
export const BookingProvider = ({ children }) => {
  /** ==================================================
   * Step Tracker - Controls which modal is active
   * ================================================== */
  const [currentStep, setCurrentStep] = useState(""); // Tracks the current step in the modal (doctor | date | timeslot | info)
  const onClose = () => setCurrentStep(""); // Function to close the modal by resetting step

  // Resets all booking-related data after submission
  const resetBooking = () => {
    setSelectedDoctor(null);
    setDateSelected(null);
    setselectedTimeSlot("");
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setPatientAge("");
    setLaunchedFromCalendar(false);
    setAppointmentSource("");
    setCurrentStep(""); // Reset currentStep to close all modals after booking
  };

  /** ============================================
   * Step 1: Doctor Selection
   * ============================================ */
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Stores the selected doctor object { label: "Dr Name", value: "slug" }
  //for adding source .
  const [appointmentSource, setAppointmentSource] = useState(null); // default fallback
  const [appointmentType, setAppointmentType] = useState("");
  const { token } = useAuth();

  /** ============================================
   * Fetching doctors from database or mock data
   * ============================================ */
  const [doctors, setDoctors] = useState([]); // Stores list of doctors fetched from backend or mock data
  const fetchDoctors = async () => {
    try {
      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/doctor/doctor-list"
      ); // Replace with your actual endpoint
      if (!response.ok) throw new Error("Failed to fetch doctors");

      const apidoctorData = await response.json(); // Parse the JSON response
      setDoctors(apidoctorData); // Set the fetched doctor data to state
      console.log(
        "Doctor data for appointment booking modal :- ",
        apidoctorData
      );
      // Removed toast to prevent spam
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Removed error toast to prevent spam
    }
  };
  useEffect(() => {
    fetchDoctors();
    // fetchDoctors(); // Already present, no need to call twice
    fetchCalendarDatesFromBackend();
  }, []);

  /** ============================================
   * Step 2: Date Selection (JS Date Object)
   * ====================== ====================== */
  const [dateSelected, setDateSelected] = useState(null);

  /** ============================================
   * Step 3: Time Slot Selection
   * ============================================ */
  const [selectedTimeSlot, setselectedTimeSlot] = useState(""); // Stores the selected time slot string (e.g. "10:00 AM")

  /** ============================================
   * Step 4: Patient Info Submission
   * ============================================ */
  const [patientName, setPatientName] = useState(""); // Patient's Name
  const [patientPhone, setPatientPhone] = useState(""); // Patient's Phone
  const [patientEmail, setPatientEmail] = useState(""); // Patient's Email
  const [patientAge, setPatientAge] = useState(""); // Patient's Age

  /** ============================================
   * Final Step: Submission & Local Storage
   * ============================================ */
  const [appoinmentsRequested, setAppoinmentsRequested] = useState([]); // Stores locally submitted appointments for review/debugging

  const formatDateLocal = (dateObj) => {
    if (!(dateObj instanceof Date)) return "";
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to validate and submit the appointment request
  const addAppointmentRequest = async (appointmentData) => {
    // Use appointmentData if provided, otherwise fallback to context state
    const doctor = appointmentData?.doctor || selectedDoctor;
    const date = appointmentData?.dateSelected || dateSelected;
    const time = appointmentData?.timeSlot || selectedTimeSlot;
    const firstName = appointmentData?.firstName || "";
    const lastName = appointmentData?.lastName || "";
    const phone = appointmentData?.patientPhone || patientPhone;
    const email = appointmentData?.patientEmail || patientEmail;
    const age = appointmentData?.patientAge || patientAge;
    const dob = appointmentData?.dob || "";
    const source = appointmentData?.source || appointmentSource;
    const type = appointmentData?.appointment_type || appointmentData?.appointmentType || appointmentType;
    const appointment_mode = appointmentData?.appointment_mode || null;
    const clinical_reason = appointmentData?.clinical_reason || appointmentData?.treatment_reason || null;

    // Validate that all fields are filled
    if (
      !doctor?.label ||
      !doctor?.value ||
      !date ||
      !time ||
      !firstName ||
      !lastName ||
      !phone ||
      !email
    ) {
      toast.error(
        "Missing required info: doctor, date, time, patient firstname, patient lastname, patient email, or patient phone number.",
        {
          position: "bottom-right",
          style: {
            backgroundColor: "#ffebee", // Light red
            color: "#c62828", // Dark red text
            fontWeight: "bold",
            borderRadius: "15px",
          },
          icon: "🚨",
          autoClose: 4000,
        }
      );
      return { error: true };
    }

    const status = appointmentData?.status || "pending";

    // Prepare appointment data
    const newAppointment = {
      doctor_id: doctor.id,  // <-- use id instead of label/slug
      date: formatDateLocal(date),
      time: time,            // should already be "HH:mm:ss" from your slot selector
      source: source || "website",
      appointment_type: type,
      patient_first_name: firstName,
      patient_last_name: lastName,
      patient_email: email,
      patient_phone: phone,
      patient_age: String(age), // backend expects string
      patient_dob: dob,
      appointment_mode: appointment_mode,
      clinical_reason: clinical_reason,
      status,
    };

    console.log("📝 Final Appointment Request Data:", newAppointment);

    try {
      // Send appointment data to backend API
      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/appointment/request-appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAppointment),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      const result = await response.json(); // Backend response
      // Update local state with the new appointment
      setAppoinmentsRequested((prev) => [...prev, { ...newAppointment, id: result.id, status: result.status }]);
      console.log("✅ Appointment Request submitted to backend:", result);

      // Success notification
      toast.success(
        `Appointment booked with ${doctor.label
        } on ${date.toDateString()} at ${time}`,
        {
          position: "bottom-right",
          style: {
            backgroundColor: "#e0f7fa", // Light teal
            color: "#00796b", // Dark teal text
            fontWeight: "bold",
            borderRadius: "15px",
          },
          icon: "✅",
          autoClose: 4000,
        }
      );

      // Reset booking form
      resetBooking(); // This will also close the modal
      return result;
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment", {
        position: "bottom-right",
        autoClose: 4000,
      });
      return { error: true };
    }
  };

  const addBookingRequest = async (appointmentData) => {
    // Use appointmentData if provided, otherwise fallback to context state
    const doctor = appointmentData?.doctor || selectedDoctor;
    const date = appointmentData?.dateSelected || dateSelected;
    const time = appointmentData?.timeSlot || selectedTimeSlot;
    const firstName = appointmentData?.firstName || "";
    const lastName = appointmentData?.lastName || "";
    const phone = appointmentData?.patientPhone || patientPhone;
    const email = appointmentData?.patientEmail || patientEmail;
    const age = appointmentData?.patientAge || patientAge;
    const source = appointmentData?.source || appointmentSource;
    const type = appointmentData?.appointmentType || appointmentType;
    const notes = appointmentData?.notes ?? null;
    const dob = appointmentData?.dob || "";
    const referral_name = appointmentData?.referral_name ?? null;
    const appointment_mode = appointmentData?.appointment_mode ?? null;
    const clinical_reason = appointmentData?.clinical_reason || appointmentData?.treatment_reason || null;

    // Validate that all fields are filled
    if (
      !doctor?.label ||
      !doctor?.value ||
      !date ||
      !time ||
      !firstName ||
      !lastName ||
      !phone ||
      !email
    ) {
      toast.error(
        "Missing required info: doctor, date, time, patient firstname, patient lastname, patient email, or patient phone number.",
        {
          position: "bottom-right",
          style: {
            backgroundColor: "#ffebee", // Light red
            color: "#c62828", // Dark red text
            fontWeight: "bold",
            borderRadius: "15px",
          },
          icon: "🚨",
          autoClose: 4000,
        }
      );
      return { error: true };
    }

    const status = appointmentData?.status || "pending";

    // Prepare appointment data
    const newAppointment = {
      doctor_id: doctor.id,  // <-- use id instead of label/slug
      date: formatDateLocal(date),
      time: time,            // should already be "HH:mm:ss" from your slot selector
      source: source || "website",
      appointment_type: type,
      notes,
      patient_first_name: firstName,
      patient_last_name: lastName,
      patient_email: email,
      patient_phone: phone,
      patient_age: String(age), // backend expects string
      patient_dob: dob,
      referral_name,
      appointment_mode,
      clinical_reason,
      status,
    };

    console.log("📝 Final Appointment Request Data:", newAppointment);
    try {
      // Send appointment data to backend API
      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/appointment/book-appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAppointment),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      const result = await response.json(); // Backend response
      // Update local state with the new appointment
      setAppoinmentsRequested((prev) => [...prev, { ...newAppointment, id: result.id, status: result.status }]);
      console.log("✅ Appointment Request submitted to backend:", result);

      // Success notification
      toast.success(
        `Appointment booked with ${doctor.label
        } on ${date.toDateString()} at ${time}`,
        {
          position: "bottom-right",
          style: {
            backgroundColor: "#e0f7fa", // Light teal
            color: "#00796b", // Dark teal text
            fontWeight: "bold",
            borderRadius: "15px",
          },
          icon: "✅",
          autoClose: 4000,
        }
      );

      // Reset booking form
      resetBooking(); // This will also close the modal
      return result;
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Failed to create appointment", {
        position: "bottom-right",
        autoClose: 4000,
      });
      return { error: true };
    }
  };

  /** ============================================
   * Buffer times -For calendar in DateModal.jsx
   * usage - Admin can adjust the dates of calendar
   * ============================================ */
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // format:YYYY-MM-DD
  });

  const [calendarEndDate, setCalendarEndDate] = useState(() => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    return futureDate.toISOString().split("T")[0]; // format:YYYY-MM-DD
  });

  // 1️⃣ Save calendar dates to backend
  const saveCalendarDatesToBackend = async (startDate, endDate) => {
    try {
      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/doctor/save-calendar-config",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save calendar configuration");
      }

      toast.success("Calendar dates saved successfully!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Error saving calendar dates");
      return false;
    }
  };

  // 2️⃣ Fetch calendar dates from backend
  const fetchCalendarDatesFromBackend = async () => {
    try {
      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/doctor/calendar-config"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch calendar configuration");
      }

      const data = await response.json();
      setCalendarStartDate(data.start_date);
      setCalendarEndDate(data.end_date);
      // toast.info("Calendar dates loaded.");
    } catch (error) {
      console.error(error);
      // toast.error("Error loading calendar configuration");
    }
  };
  const [launchedFromCalendar, setLaunchedFromCalendar] = useState(false);

  /** ============================================
   * Provide all states & functions to children
   * ============================================ */
  return (
    <BookingContext.Provider
      value={{
        // Modal Navigation
        currentStep,
        setCurrentStep,
        onClose,
        resetBooking,

        // Step 1: Doctor
        selectedDoctor,
        setSelectedDoctor,

        // Step 2: Date
        dateSelected,
        setDateSelected,

        // Step 3: Time
        selectedTimeSlot,
        setselectedTimeSlot,

        // Step 4: Patient Info
        patientEmail,
        patientName,
        patientPhone,
        setPatientEmail,
        setPatientName,
        setPatientPhone,
        patientAge,
        setPatientAge,

        // Final Submission
        appoinmentsRequested,
        setAppoinmentsRequested,
        addAppointmentRequest,
        addBookingRequest,

        // Dynamic Doctor List
        doctors,
        setDoctors,

        //Dynamic buffer times
        calendarStartDate,
        setCalendarEndDate,
        setCalendarStartDate,
        calendarEndDate,
        fetchCalendarDatesFromBackend,
        saveCalendarDatesToBackend,
        //sending fetch doctor function if the doctor is added
        fetchDoctors,

        //appontment from calendar
        launchedFromCalendar,
        setLaunchedFromCalendar,

        appointmentSource,
        setAppointmentSource,

        appointmentType,
        setAppointmentType
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};