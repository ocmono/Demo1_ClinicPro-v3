import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import isEqual from "lodash/isEqual";
import { useAuth } from "../contentApi/AuthContext";
import { fetchWithAuth, handleApiError } from "../utils/apiErrorHandler";

// Context for managing appointment data across components
export const AppointmentContext = createContext();

// Hook for easy access to appointment context
export const useAppointments = () => useContext(AppointmentContext);

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [doneVisits, setDoneVisits] = useState([]);
  const [calendarView, setCalendarView] = useState("doctor"); // 'doctor' or 'receptionist'
  const { token } = useAuth();

  // Toggle calendar view function
  const toggleCalendarView = () => {
    setCalendarView((prev) => (prev === "doctor" ? "receptionist" : "doctor"));
  };

  // Fetch appointments on mount and every 30 seconds
  useEffect(() => {
    fetchAppointments();
    const intervalId = setInterval(fetchAppointments,  60 * 1000); // 60 seconds
    return () => clearInterval(intervalId);
  }, []);

  // Request a new appointment
  const requestAppointment = async (data) => {
    try {
      let status = "pending";
      if (data.source === "online") {
        status = "approved";
      } else if (data.source === "iframe" || data.source === "website") {
        status = "pending";
      }

      const payload = {
        ...data,
        status, // send status explicitly
      };

      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/appointment/request-appointment`,
        {
          method: "POST",
          // headers: {
          //   "Content-Type": "application/json",
          //   Authorization: `Bearer ${token}`
          // },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Failed to request appointment");

      if (payload.status === "approved" && result?.id) {
        await fetchWithAuth(
          `https://bkdemo1.clinicpro.cc/appointment/update-status/${result.id}?status=approved`,
          {
            method: "PUT",
            // headers: {
            //   "Content-Type": "application/json",
            //   Authorization: `Bearer ${token}`,
            // },
          }
        );
        result.status = "approved"; // patch local
      }

      toast.success("Appointment requested successfully!");
      fetchAppointments(); // Refresh list
      return result;
    } catch (error) {
      console.error("Error requesting appointment:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // Fetch appointments from API and update state
  const fetchAppointments = async () => {
    try {
      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/appointment/appointments-list`
      );
      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();

      const transformedData = data.map((item) => ({
        id: item.id,
        date: item.date,
        time: item.time,
        status: item.status?.toLowerCase(),
        created_at: item.created_at,
        source: item.source,
        appointment_type: item.appointment_type,
        doctorId: item.doctor.id,
        doctor: `${item.doctor.firstName} ${item.doctor.lastName}`,
        doctorEmail: item.doctor.email,
        doctorSpeciality: item.doctor.doctor_profile?.drSpeciality || "",
        appointment_mode: item.appointment_mode,
        patientId: item.patient.id,
        patientName: `${item.patient.firstName} ${item.patient.lastName}`,
        patientEmail: item.patient.email,
        patientPhone: item.patient.phone,
        patientAge: item.patient.age,
      }));

      // Track completed visits
      const doneVisitsIds = transformedData
        .filter((a) => a.status?.toLowerCase() === "done")
        .map((a) => a.id);

      setDoneVisits((prev) =>
        isEqual(prev, doneVisitsIds) ? prev : doneVisitsIds
      );

      setAppointments((prev) =>
        isEqual(prev, transformedData) ? prev : transformedData
      );
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Convert backend API response format to frontend format
  // const transformBackendToFrontend = (appointment) => ({
  //   id: appointment.id,
  //   name: appointment.patient_name,
  //   email: appointment.patient_email,
  //   contact: appointment.patient_phone,
  //   doctor: appointment.doctor_name,
  //   date: appointment.date,
  //   time: appointment.time,
  //   status: appointment.status,
  // });

  // Update appointment status (Accepted/Rejected/Done)
  const updateStatus = async (id, status) => {
    try {
      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/appointment/update-status/${id}?status=${encodeURIComponent(
          status.toLowerCase()
        )}`,
        {
          method: "PUT",
          // headers: {
          //   "Content-Type": "application/json",
          //   Authorization: `Bearer ${token}`
          // },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Status update failed");

      // Optimistic update
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, status } : appt))
      );

      toast.success(`Status updated to ${status}`);
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      handleApiError(error, `Failed to update status to ${status}`);
      toast.error(error.message);
      return false;
    }
  };

  const updateAppointment = async (appointmentId, updatedData) => {
    try {
      const cleanPayload = {
        doctor_id: parseInt(updatedData.doctor_id), // Ensure number
        appointment_id: parseInt(appointmentId), // Ensure number
        source: updatedData.source || "website",
        appointment_type: updatedData.appointment_type,
        date: updatedData.date,
        time: updatedData.time
      };
      console.log('Sending update payload:', cleanPayload);
      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/appointment/update-appointment/${appointmentId}`,
        {
          method: "PUT",
          // headers: {
          //   "Content-Type": "application/json",
          //   Authorization: `Bearer ${token}`
          // },
          body: JSON.stringify(cleanPayload),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Failed to update appointment");

      // Optimistic update
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? {
            ...appt,
            date: cleanPayload.date,
            time: cleanPayload.time,
            doctor: updatedData.doctor_name || appt.doctor, // Keep doctor name for display
            type: cleanPayload.appointment_type
          } : appt
        )
      );

      toast.success("Appointment updated successfully!");
      return result;
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.message);
      throw error;
    }
  };

  const fetchAppointmentsByPatient = async (patientId) => {
    try {
      if (!patientId) {
        console.warn("No patient ID provided for fetching appointments");
        setPatientAppointments([]);
        return [];
      }

      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/appointment/patient/${patientId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Patient has no appointments
          setPatientAppointments([]);
          return [];
        }
        throw new Error("Failed to fetch patient appointments");
      }

      const data = await response.json();

      // Debug: Log the response to see the actual structure
      console.log('Patient appointments API response:', data);

      // Handle different response formats
      let appointmentsArray = [];

      if (data && Array.isArray(data.appointments)) {
        // This is your case - response has appointments array
        appointmentsArray = data.appointments;
        console.log('Found appointments array with', data.appointments.length, 'items');
      } else if (Array.isArray(data)) {
        // If response is directly an array
        appointmentsArray = data;
      } else {
        // If no appointments found or unexpected format
        console.warn('Unexpected response format for patient appointments:', data);
        appointmentsArray = [];
      }


      const transformedData = appointmentsArray.map((item) => {
        console.log('Processing appointment item:', item);
        return {
          id: item.appointment_id || item.id,
          date: item.date,
          time: item.time,
          status: item.status?.toLowerCase(),
          created_at: item.created_at,
          source: item.source,
          appointment_type: item.appointment_type,
          doctorId: item.doctor_id,
          doctor: item.doctor_name || `Doctor ${item.doctor_id}`,
          doctorEmail: item.doctor?.email,
          doctorSpeciality: item.doctor?.doctor_profile?.drSpeciality || "",
          patientId: data.patient_id || patientId,
          patientName: `${item.patient?.firstName} ${item.patient?.lastName}`,
          patientEmail: item.patient?.email,
          patientPhone: item.patient?.phone,
          patientAge: item.patient?.age,
        }
      });

      console.log('Transformed patient appointments:', transformedData);
      setPatientAppointments(transformedData);
      return transformedData;
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      toast.error("Failed to load patient appointments");
      setPatientAppointments([]);
      throw error;
    }
  }

  // Mark appointment as completed
  const markVisitDone = async (id) => {
    if (doneVisits.includes(id)) return;
    const success = await updateStatus(id, "done");
    if (success) setDoneVisits((prev) => [...prev, id]);
  };

  // Reset appointment to pending status
  const revertStatus = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: "pending" } : appt
      )
    );
    setDoneVisits((prev) => prev.filter((doneId) => doneId !== id));
  };

  // Remove appointment from done visits
  const undoVisit = (id) => {
    setDoneVisits((prev) => prev.filter((doneId) => doneId !== id));
  };

  // Clear patient appointments (useful when switching patients)
  const clearPatientAppointments = () => {
    setPatientAppointments([]);
  };


  // Calculate appointment statistics
  const approvedCount = appointments.filter(
    (a) => a.status?.toLowerCase() === "approved"
  ).length;
  const rejectedCount = appointments.filter(
    (a) => a.status?.toLowerCase() === "rejected"
  ).length;

  // Group appointments by date with status counts
  const appointmentCountsByDate = appointments.reduce((acc, appt) => {
    const { date, status } = appt;
    if (!acc[date]) acc[date] = { Approved: 0, Rejected: 0 };
    if (status?.toLowerCase() === "approved") acc[date].Approved++;
    if (status?.toLowerCase() === "rejected") acc[date].Rejected++;
    return acc;
  }, {});

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        patientAppointments,
        fetchAppointmentsByPatient,
        requestAppointment,
        clearPatientAppointments,
        updateStatus,
        updateAppointment,
        revertStatus,
        undoVisit,
        markVisitDone,
        fetchAppointments,
        approvedCount,
        rejectedCount,
        appointmentCountsByDate,
        doneVisits,
        calendarView,
        toggleCalendarView,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};
