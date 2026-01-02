import React, { useState, useContext, useCallback, useMemo } from "react";
import {
  FiCalendar,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiFilter,
} from "react-icons/fi";
import PerfectScrollbar from "react-perfect-scrollbar";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../contentApi/BookingProvider";
import { AppointmentContext } from "../../context/AppointmentContext";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { usePatient } from "../../context/PatientContext";
import PatientModal from "../patients/PatientModal";
import { toast } from "react-toastify";
import { RiArrowUpDownLine } from "react-icons/ri";
import { useVaccine } from "@/context/VaccineContext";

import "./CalenderSidebar.css";
import AppointmentSection from "./calenderSidebar/AppointmentSection";
import AppointmentCard from "./calenderSidebar/AppointmentCard";
import CompleteAppointmentModal from "./calenderSidebar/CompleteAppointmentModal";

// Constants
const STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  DONE: "done",
};

// Utility functions
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d) ? "" : d.toISOString().split("T")[0];
};

const normalizeStatus = (status) => (status || "").toLowerCase().trim();

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const time = timeStr.toString().toUpperCase().trim();
  let [timePart, modifier] = time.split(/(AM|PM)/);

  if (!modifier) {
    if (time.includes("AM")) {
      modifier = "AM";
      timePart = time.replace("AM", "").trim();
    } else if (time.includes("PM")) {
      modifier = "PM";
      timePart = time.replace("PM", "").trim();
    }
  }

  let [hours, minutes] = timePart.split(":").map((part) => parseInt(part) || 0);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const getVaccineDisplayStatus = (vaccine, todayDate) => {
  if (vaccine.status === "completed") return "completed";

  const scheduleDate = normalizeDate(vaccine.schedule_date);

  if (scheduleDate && scheduleDate < todayDate) {
    return "overdue";
  }

  return "scheduled";
};

// Custom hooks
const sortAppointments = (appointments, sortOrder) => {
  return [...appointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA.getTime() !== dateB.getTime()) {
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    const timeA = parseTime(a.time);
    const timeB = parseTime(b.time);
    return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
  });
};

const formatAppointmentDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const day = days[d.getDay()];
  const date = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2);

  return `${day}-${date}${month}-${year}`;
};

const sortVaccines = (list, sortKey) => {
  const items = [...list];

  switch (sortKey) {
    case "date_desc":
      return items.sort(
        (a, b) => new Date(b.schedule_date) - new Date(a.schedule_date)
      );
    case "dose_asc":
      return items.sort((a, b) => (a.dose_number || 0) - (b.dose_number || 0));
    case "dose_desc":
      return items.sort((a, b) => (b.dose_number || 0) - (a.dose_number || 0));
    case "date_asc":
    default:
      return items.sort(
        (a, b) => new Date(a.schedule_date) - new Date(b.schedule_date)
      );
  }
};

const usePatientMatcher = () => {
  const { patients: allPatients } = usePatient();

  return useCallback((appointment) => {
    if (appointment.patient_id) return appointment;

    const matchingPatient = allPatients?.find(p =>
      (p.name === appointment.patientName && p.contact === appointment.patientPhone) ||
      p.name === appointment.patientName ||
      p.contact === appointment.patientPhone
    );

    return matchingPatient
      ? { ...appointment, patient_id: matchingPatient.patient_id || matchingPatient.id }
      : appointment;
  }, [allPatients]);
};

const usePrescriptionFinder = (allPrescriptions) => {
  return useCallback((enhancedAppt) => {
    return allPrescriptions?.find(p =>
      (p.patient_id && enhancedAppt.patient_id && p.patient_id.toString() === enhancedAppt.patient_id.toString()) ||
      (p.patient_id && enhancedAppt.id && p.patient_id.toString() === enhancedAppt.id.toString()) ||
      (p.patient_name && enhancedAppt.patientName &&
        p.patient_name.toLowerCase() === enhancedAppt.patientName.toLowerCase() &&
        p.patient_phone && enhancedAppt.patientPhone &&
        p.patient_phone === enhancedAppt.patientPhone)
    );
  }, [allPrescriptions]);
};

// Main Component
const CalenderSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  selectedDate,
  showAllData,
  onClose,
  appointments,
  allAppointments,
  doneVisits,
  selectedDoctors = [],
  onDoctorFilterChange,
  onClearDoctorFilter,
  onViewAllClick,
}) => {
  // State
  const [expandedSections, setExpandedSections] = useState({
    appointments: true,
    pending: true,
    approved: true,
    done: true,
    cancelled: true,
    filters: false,
    vaccines: true,
  });

  const [sortOrders, setSortOrders] = useState({
    approved: "asc",
    completed: "asc",
    cancelled: "asc",
    pending: "asc",
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedApptForComplete, setSelectedApptForComplete] = useState(null);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [showDoctorFilter, setShowDoctorFilter] = useState(false);
  const [vaccineSortOpen, setVaccineSortOpen] = useState(false);
  const [vaccineSort, setVaccineSort] = useState("date_asc");

  // Hooks
  const navigate = useNavigate();
  const { markVisitDone, setDoneVisits, updateStatus } = useContext(AppointmentContext);
  const { vaccineSchedules, updateVaccineScheduleStatus } = useVaccine();
  const { setDateSelected, setCurrentStep, setLaunchedFromCalendar } = useBooking();
  const { setPrescriptionFormData, allPrescriptions } = usePrescription();
  const { patients: allPatients } = usePatient();

  // Custom hooks
  const enhanceAppointment = usePatientMatcher();
  const findPrescription = usePrescriptionFinder(allPrescriptions);

  // Get unique doctors from appointments
  const uniqueDoctors = useMemo(() => {
    return [...new Set(
      allAppointments
        .map(appt => appt.doctor)
        .filter(Boolean)
    )].sort();
  }, [allAppointments]);

  // Derived state
  const displayDate = selectedDate || format(new Date(), "yyyy-MM-dd");
  const todayDate = normalizeDate(new Date());

  const normalizeLocalDate = (dateStr) => {
    if (!dateStr) return "";

    // ✅ already a date string, do NOT re-parse
    if (typeof dateStr === "string" && dateStr.length === 10) {
      return dateStr;
    }

    const d = new Date(dateStr);
    if (isNaN(d)) return "";

    // convert to local date (same as FullCalendar)
    const local = new Date(
      d.getTime() - d.getTimezoneOffset() * 60000
    );

    return local.toISOString().split("T")[0];
  };

  const vaccinesForSidebar = useMemo(() => {
    if (!vaccineSchedules?.length) return [];

    const filtered = showAllData
      ? vaccineSchedules
      : vaccineSchedules.filter(
        v =>
          normalizeLocalDate(v.schedule_date) ===
          normalizeLocalDate(displayDate)
      );

    return sortVaccines(filtered, vaccineSort);
  }, [vaccineSchedules, displayDate, showAllData, vaccineSort]);

  const patientMap = useMemo(() => {
    const map = new Map();
    allPatients?.forEach(p => {
      const key = p.patient_id || p.id;
      if (key) map.set(key.toString(), p);
    });
    return map;
  }, [allPatients]);

  const getPatientName = (vaccine) => {
    if (vaccine.patient_name) return vaccine.patient_name;

    const patient =
      patientMap.get(vaccine.patient_id?.toString()) ||
      patientMap.get(vaccine.patientId?.toString());

    return patient?.name || "Unknown Patient";
  };

  // Filtered and sorted appointments
  const filteredAppointments = useMemo(() => {
    const filterByDate = (appt) => showAllData || normalizeDate(appt.date) === normalizeDate(displayDate);

    return {
      approved: appointments.filter(appt =>
        normalizeStatus(appt.status) === STATUS.APPROVED && filterByDate(appt)
      ),
      completed: appointments.filter(appt =>
        (normalizeStatus(appt.status) === STATUS.DONE || doneVisits.includes(appt.id)) && filterByDate(appt)
      ),
      cancelled: appointments.filter(appt =>
        normalizeStatus(appt.status) === STATUS.REJECTED && filterByDate(appt)
      ),
      pending: appointments.filter(appt =>
        normalizeStatus(appt.status) === STATUS.PENDING && filterByDate(appt)
      ),
    };
  }, [appointments, doneVisits, displayDate, showAllData]);

  const sortedAppointments = useMemo(() => ({
    approved: sortAppointments(filteredAppointments.approved, sortOrders.approved),
    completed: sortAppointments(filteredAppointments.completed, sortOrders.completed),
    cancelled: sortAppointments(filteredAppointments.cancelled, sortOrders.cancelled),
    pending: sortAppointments(filteredAppointments.pending, sortOrders.pending),
  }), [filteredAppointments, sortOrders]);

  // Handlers
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toggleSortOrder = useCallback((type) => {
    setSortOrders(prev => ({
      ...prev,
      [type]: prev[type] === "asc" ? "desc" : "asc"
    }));
  }, []);

  const toggleDoctorFilter = useCallback(() => {
    setShowDoctorFilter(prev => !prev);
  }, []);

  // const handleDoctorSelect = useCallback((doctor) => {
  //   onDoctorFilterChange(doctor);
  //   setShowDoctorFilter(false);
  // }, [onDoctorFilterChange]);

  // const handleClearDoctorFilter = useCallback(() => {
  //   onDoctorFilterChange(null);
  //   setShowDoctorFilter(false);
  // }, [onDoctorFilterChange]);

  const hasAnyAppointmentsForDate = useMemo(() => {
    return (
      sortedAppointments.approved.length > 0 ||
      sortedAppointments.completed.length > 0 ||
      sortedAppointments.cancelled.length > 0 ||
      sortedAppointments.pending.length > 0
    );
  }, [sortedAppointments]);

  const handleAddAppointmentClick = useCallback(() => {
    setLaunchedFromCalendar(true);
    setDateSelected(new Date(selectedDate || new Date()));
    setCurrentStep("source");
    onClose?.();
    setSidebarOpen(false);
  }, [selectedDate, setLaunchedFromCalendar, setDateSelected, setCurrentStep, onClose, setSidebarOpen]);

  const handleCreatePrescription = useCallback((appointment) => {
    const enhancedAppt = enhanceAppointment(appointment);

    let selectedPatient = allPatients?.find(p =>
      p.patient_id === enhancedAppt.patient_id ||
      p.id === enhancedAppt.patient_id ||
      (p.name === enhancedAppt.patientName && p.contact === enhancedAppt.patientPhone)
    );

    if (!selectedPatient) {
      selectedPatient = {
        id: enhancedAppt.patient_id || enhancedAppt.id,
        patient_id: enhancedAppt.patient_id || enhancedAppt.id,
        name: enhancedAppt.patientName,
        contact: enhancedAppt.patientPhone,
        email: enhancedAppt.patientEmail || `${enhancedAppt.patientName?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      };
    }

    const patientIdToUse = selectedPatient.patient_id || selectedPatient.id;
    localStorage.setItem('prescriptionFromCalendar', JSON.stringify({
      patientId: patientIdToUse,
      patientData: selectedPatient
    }));

    setPrescriptionFormData(prev => ({ ...prev, patient: selectedPatient }));
    navigate(`/prescriptions/create-prescription?patientId=${patientIdToUse}`);
  }, [enhanceAppointment, allPatients, setPrescriptionFormData, navigate]);

  const viewPatientProfile = useCallback((appointment) => {
    const patient = allPatients?.find(p =>
      (p.name === appointment.patientName && p.contact === appointment.patientPhone) ||
      p.name === appointment.patientName ||
      p.contact === appointment.patientPhone
    );

    if (patient) {
      setSelectedPatient(patient);
      setModalMode("view");
      setEditModalOpen(true);
    } else {
      const basicPatient = {
        id: appointment.id,
        name: appointment.patientName,
        contact: appointment.patientPhone,
        email: appointment.patientEmail || `${appointment.patientName?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      };
      setSelectedPatient(basicPatient);
      setModalMode("view");
      setEditModalOpen(true);
    }
  }, [allPatients]);

  const handleCompleteVaccine = useCallback(
    async (vaccineId) => {
      try {
        // 🔁 Adjust API call if needed
        await updateVaccineScheduleStatus(vaccineId, "completed");
        toast.success("Vaccine marked as completed");
      } catch (error) {
        toast.error("Failed to update vaccine status");
      }
    },
    []
  );

  const viewPrescription = useCallback((appointment) => {
    const enhancedAppt = enhanceAppointment(appointment);
    const prescription = findPrescription(enhancedAppt);

    if (prescription) {
      const prescriptionId = prescription.id || prescription._id;
      navigate(`/prescription/view/${prescriptionId}`);
    } else {
      toast.info("No prescription found for this patient");
    }
  }, [enhanceAppointment, findPrescription, navigate]);

  const openCompleteModal = useCallback((appt) => {
    const enhancedAppt = enhanceAppointment(appt);
    setSelectedApptForComplete(enhancedAppt);
    setHasPrescription(!!findPrescription(enhancedAppt));
    setShowCompleteModal(true);
  }, [enhanceAppointment, findPrescription]);

  const handleConfirmComplete = useCallback(() => {
    if (selectedApptForComplete) {
      markVisitDone(selectedApptForComplete.id);
      setShowCompleteModal(false);
    }
  }, [selectedApptForComplete, markVisitDone]);

  const handleCreatePrescriptionAndComplete = useCallback(() => {
    if (selectedApptForComplete) {
      handleCreatePrescription(selectedApptForComplete);
      setShowCompleteModal(false);
    }
  }, [selectedApptForComplete, handleCreatePrescription]);

  const handleViewPrescriptionInModal = useCallback(() => {
    if (selectedApptForComplete) {
      viewPrescription(selectedApptForComplete);
      setShowCompleteModal(false);
    }
  }, [selectedApptForComplete, viewPrescription]);

  const approvePending = useCallback(async (appointmentId) => {
    try {
      await updateStatus(appointmentId, STATUS.APPROVED);
    } catch (error) {
      toast.error("Failed to approve appointment");
    }
  }, [updateStatus]);

  const rejectPending = useCallback(async (appointmentId) => {
    try {
      await updateStatus(appointmentId, STATUS.REJECTED);
    } catch (error) {
      toast.error("Failed to reject appointment");
    }
  }, [updateStatus]);

  const undoToApproved = useCallback(async (appointmentId) => {
    try {
      await updateStatus(appointmentId, STATUS.APPROVED);
      setDoneVisits(prev => prev.filter(id => id !== appointmentId));
    } catch (error) {
      // Error handling is done in updateStatus
    }
  }, [updateStatus, setDoneVisits]);

  const vaccineOverviewCount = useMemo(() => {
    if (!vaccineSchedules?.length) return 0;

    if (showAllData) {
      return vaccineSchedules.length;
    }

    return vaccineSchedules.filter(
      v => normalizeLocalDate(v.schedule_date) === normalizeLocalDate(displayDate)
    ).length;
  }, [vaccineSchedules, displayDate, showAllData]);

  // Summary data
  const summaryData = useMemo(() => [
    { title: "Pending", count: sortedAppointments.pending.length, icon: FiClock, className: "pending" },
    { title: "Total", count: Object.values(sortedAppointments).reduce((sum, arr) => sum + arr.length, 0), icon: FiCalendar, className: "today" },
    { title: "Rejected", count: sortedAppointments.cancelled.length, icon: FiClock, className: "tomorrow" },
    { title: "Completed", count: sortedAppointments.completed.length, icon: FiCalendar, className: "weekly" },
    { title: "Approved", count: sortedAppointments.approved.length, icon: FiCalendar, className: "monthly" },
    { title: "Vaccines", count: vaccineOverviewCount, icon: FiCalendar, className: "vaccine" },
  ], [sortedAppointments, vaccineOverviewCount]);

  return (
    <div className={`content-sidebar content-sidebar-xl calendar-sidebar ${sidebarOpen ? "app-sidebar-open" : ""}`}>
      <div className="sidebar-content-wrapper">
        <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
          <h4 className="fw-bolder mb-0">Calendar</h4>
          <button className="app-sidebar-close-trigger d-flex btn btn-link" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <div className="content-sidebar-body">
          <PerfectScrollbar>
            <div id="lnb-calendars" className="lnb-calendars">
              {/* Appointments Summary */}
              <div className="calendar-sidebar-item">
                <div className="section-header" onClick={() => toggleSection("appointments")}>
                  <h6 className="fs-12 fw-bold text-uppercase text-primary mb-0 d-flex align-items-center justify-content-between">
                    <span>Appointments Overview</span>
                    {expandedSections.appointments ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                  </h6>
                </div>
                {expandedSections.appointments && (
                  <div className="section-content">
                    <div className="appointments-summary-grid">
                      {summaryData.map((item, index) => (
                        <div key={index} className={`appointment-summary-card ${item.className}`}>
                          <div className="card-icon"><item.icon size={18} /></div>
                          <div className="card-content">
                            <div className="card-title">{item.title}</div>
                            <div className="card-count">{item.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor Filter Section - UPDATED */}
              {uniqueDoctors.length > 0 && (
                <div className="calendar-sidebar-item">
                  <div className="section-header" onClick={toggleDoctorFilter}>
                    <h6 className="fs-12 fw-bold text-uppercase text-primary mb-0 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <FiFilter className="me-1" size={14} />
                        <span>Filter by Doctor</span>
                      </div>
                      {showDoctorFilter ? <FiChevronDown /> : <FiChevronRight />}
                    </h6>
                  </div>

                  {showDoctorFilter && (
                    <div className="section-content p-3">
                      {/* Show All */}
                      {/* <label className="d-flex align-items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={selectedDoctors.length === 0}
                          onChange={() => onDoctorFilterChange([])}
                        />
                        <span className="text-muted">Show All Doctors</span>
                      </label> */}

                      <div className="doctor-multiselect-list">
                        {uniqueDoctors.map((doctor) => {
                          const checked = selectedDoctors.includes(doctor);

                          return (
                            <label
                              key={doctor}
                              className="doctor-checkbox-item d-flex align-items-center mb-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="form-check-input me-2 mt-0"
                                checked={checked}
                                onChange={() => {
                                  if (checked) {
                                    onDoctorFilterChange(
                                      selectedDoctors.filter(d => d !== doctor)
                                    );
                                  } else {
                                    onDoctorFilterChange([...selectedDoctors, doctor]);
                                  }
                                }}
                              />
                              <span>Dr. {doctor}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!hasAnyAppointmentsForDate && !showAllData && (
                <div className="calendar-empty-state text-center p-4">
                  <FiCalendar size={40} className="text-muted mb-2" />
                  <h6 className="mb-1">No appointments for this day</h6>
                  <p className="text-muted mb-0">
                    You don’t have any appointments scheduled on this date.
                  </p>
                </div>
              )}

              {/* Appointment Sections */}
              <AppointmentSection
                title="Approved Appointments"
                appointments={sortedAppointments.approved}
                expanded={expandedSections.approved}
                onToggle={() => toggleSection("approved")}
                sortOrder={sortOrders.approved}
                onSortToggle={() => toggleSortOrder("approved")}
                className="text-success"
              >
                {sortedAppointments.approved.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={enhanceAppointment(appt)}
                    onViewProfile={viewPatientProfile}
                    onCreatePrescription={handleCreatePrescription}
                    onComplete={openCompleteModal}
                    onViewPrescription={viewPrescription}
                    onRevert={undoToApproved}
                    status={STATUS.APPROVED}
                    userRole="doctor"
                  />
                ))}
              </AppointmentSection>

              <AppointmentSection
                title="Completed Appointments"
                appointments={sortedAppointments.completed}
                expanded={expandedSections.done}
                onToggle={() => toggleSection("done")}
                sortOrder={sortOrders.completed}
                onSortToggle={() => toggleSortOrder("completed")}
                className="text-info"
              >
                {sortedAppointments.completed.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={enhanceAppointment(appt)}
                    onViewProfile={viewPatientProfile}
                    onViewPrescription={viewPrescription}
                    onRevert={undoToApproved}
                    status={STATUS.DONE}
                    userRole="doctor"
                  />
                ))}
              </AppointmentSection>

              <AppointmentSection
                title="Cancelled Appointments"
                appointments={sortedAppointments.cancelled}
                expanded={expandedSections.cancelled}
                onToggle={() => toggleSection("cancelled")}
                sortOrder={sortOrders.cancelled}
                onSortToggle={() => toggleSortOrder("cancelled")}
                className="text-danger"
              >
                {sortedAppointments.cancelled.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={enhanceAppointment(appt)}
                    onViewProfile={viewPatientProfile}
                    status={STATUS.REJECTED}
                    userRole="doctor"
                  />
                ))}
              </AppointmentSection>

              <AppointmentSection
                title="Pending Appointments"
                appointments={sortedAppointments.pending}
                expanded={expandedSections.pending}
                onToggle={() => toggleSection("pending")}
                sortOrder={sortOrders.pending}
                onSortToggle={() => toggleSortOrder("pending")}
                className="text-warning"
              >
                {sortedAppointments.pending.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={enhanceAppointment(appt)}
                    onViewProfile={viewPatientProfile}
                    onApprove={approvePending}
                    onReject={rejectPending}
                    status={STATUS.PENDING}
                    userRole="doctor"
                  />
                ))}
              </AppointmentSection>
            </div>

            <CompleteAppointmentModal
              isOpen={showCompleteModal}
              onClose={() => setShowCompleteModal(false)}
              appointment={selectedApptForComplete}
              hasPrescription={hasPrescription}
              onViewPrescription={handleViewPrescriptionInModal}
              onCreatePrescription={handleCreatePrescriptionAndComplete}
              onComplete={handleConfirmComplete}
            />
            {vaccinesForSidebar.length > 0 && (
              <div className="calendar-sidebar-item">
                <div
                  className="section-header"
                  onClick={() => {
                    // Add toggle functionality for vaccine section
                    if (!expandedSections.vaccines) {
                      setExpandedSections(prev => ({ ...prev, vaccines: true }));
                    }
                  }}
                >
                  <h6 className="fs-12 fw-bold text-uppercase text-primary mb-0 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <span className="me-2">💉</span>
                      <span>Vaccine Schedules ({vaccinesForSidebar.length})</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm p-0 ms-1 border-0 bg-transparent"
                        style={{ color: '#0d6efd', textDecoration: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle sort dropdown or implement sort functionality
                          setVaccineSortOpen(!vaccineSortOpen);
                        }}
                        title="Sort vaccine schedules"
                      >
                        <RiArrowUpDownLine size={12} />
                      </button>
                      <div onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSections(prev => ({ ...prev, vaccines: !prev.vaccines }));
                      }}>
                        {expandedSections.vaccines ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                      </div>
                    </div>
                  </h6>
                </div>

                {expandedSections.vaccines && (
                  <>
                    {/* Sort Dropdown - appears when sort button is clicked */}
                    {vaccineSortOpen && (
                      <div className="section-content p-2">
                        <div className="vaccine-sort-dropdown">
                          <div
                            className={`vaccine-sort-option ${vaccineSort === 'date_asc' ? 'active' : ''}`}
                            onClick={() => {
                              setVaccineSort('date_asc');
                              setVaccineSortOpen(false);
                            }}
                          >
                            Date (Earliest First)
                          </div>
                          <div
                            className={`vaccine-sort-option ${vaccineSort === 'date_desc' ? 'active' : ''}`}
                            onClick={() => {
                              setVaccineSort('date_desc');
                              setVaccineSortOpen(false);
                            }}
                          >
                            Date (Latest First)
                          </div>
                          <div
                            className={`vaccine-sort-option ${vaccineSort === 'dose_asc' ? 'active' : ''}`}
                            onClick={() => {
                              setVaccineSort('dose_asc');
                              setVaccineSortOpen(false);
                            }}
                          >
                            Dose (Lowest First)
                          </div>
                          <div
                            className={`vaccine-sort-option ${vaccineSort === 'dose_desc' ? 'active' : ''}`}
                            onClick={() => {
                              setVaccineSort('dose_desc');
                              setVaccineSortOpen(false);
                            }}
                          >
                            Dose (Highest First)
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vaccine Cards */}
                    <div className="section-content">
                      {vaccinesForSidebar.map((v) => (
                        <div
                          key={v.id}
                          className="appointment-card mb-1 vaccine-card"
                        >
                          <div className="appointment-card-content">
                            <div className="appointment-main-info">
                              <span className="appointment-id">
                                #{v.patient_id}
                              </span>

                              <span className="patient-name">
                                {getPatientName(v)}
                              </span>
                            </div>

                            <div className="appointment-time mb-0">
                              Dose {v.dose_number}
                            </div>
                            <div className="appointment-time mb-0">
                              {formatAppointmentDate(v.schedule_date)}
                            </div>
                            {(() => {
                              const displayStatus = getVaccineDisplayStatus(v, todayDate);

                              return (
                                <span
                                  className={`badge ${displayStatus === "completed"
                                    ? "bg-success"
                                    : displayStatus === "overdue"
                                      ? "bg-danger"
                                      : "bg-warning"
                                    }`}
                                >
                                  {displayStatus.toUpperCase()}
                                </span>
                              );
                            })()}
                            <div className="appointment-actions">
                              {(() => {
                                const displayStatus = getVaccineDisplayStatus(v, todayDate);

                                return displayStatus !== "completed" ? (
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => handleCompleteVaccine(v.id)}
                                    title="Mark as Completed"
                                  >
                                    <FiCheck size={12} />
                                  </button>
                                ) : null;
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </PerfectScrollbar>
        </div>
      </div>

      {editModalOpen && (
        <PatientModal
          patient={selectedPatient}
          mode={modalMode}
          close={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default React.memo(CalenderSidebar);