//doctorsidebar
import React, { useState, useContext, useEffect, useMemo } from "react";
import {FiCalendar,FiX,FiCheck,FiCheckCircle,FiXCircle,FiChevronDown,FiChevronRight,FiChevronLeft,FiClock,FiUser,FiPhone,FiPlus,FiFileText,FiRotateCcw} from "react-icons/fi";
import PerfectScrollbar from "react-perfect-scrollbar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addDays,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import { RiArrowUpDownLine } from "react-icons/ri";
import { upcomingScheduleList } from "@/utils/fackData/upcomingScheduleList";
import ImageGroup from "@/components/shared/ImageGroup";
import "./CalenderSidebar.css";
import { useBooking } from "../../contentApi/BookingProvider";
import { AppointmentContext } from "../../context/AppointmentContext";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { usePatient } from "../../context/PatientContext";
import PatientModal from "../patients/PatientModal";
import { toast } from "react-toastify";
import { useAuth } from "../../contentApi/AuthContext";
import AppointmentCard from "./calenderSidebar/AppointmentCard";


// Utility: Normalize date to YYYY-MM-DD
function normalizeDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toISOString().split('T')[0];
}

// Utility: Normalize status
function normalizeStatus(status) {
    return (status || '').toLowerCase().trim();
}

// Helper: Format date as TUE-28JUL-25
function formatAppointmentDate(dateStr) {
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
}

// Parse time to minutes
const parseTime = (timeStr) => {
    if (!timeStr) return 0;

    const time = timeStr.toString().toUpperCase().trim();
    let [timePart, modifier] = time.split(/(AM|PM)/);

    if (!modifier && time.includes('AM')) {
        modifier = 'AM';
        timePart = time.replace('AM', '').trim();
    } else if (!modifier && time.includes('PM')) {
        modifier = 'PM';
        timePart = time.replace('PM', '').trim();
    }

    let [hours, minutes] = timePart.split(':').map(part => parseInt(part) || 0);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
};

const DoctorSidebar = ({
    sidebarOpen,
    setSidebarOpen,
    selectedDate,
    showAllData,
    onClose,
    appointments,
    appointmentCounts,
    doneVisits,
    handleDateClick,
}) => {
    const [expandedSections, setExpandedSections] = useState({
        appointments: true,
        pending: true,
        approved: true,
        done: true,
        cancelled: true,
        miniCalendar: true,
    });

    const [sortOrder, setSortOrder] = useState("asc");
    const [miniCalendarDate, setMiniCalendarDate] = useState(
        selectedDate ? new Date(selectedDate) : new Date()
    );

    const [miniCalendarApi, setMiniCalendarApi] = useState(null);
    const [currentMonth, setCurrentMonth] = useState("");
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedApptForComplete, setSelectedApptForComplete] = useState(null);
    const [hasPrescription, setHasPrescription] = useState(false);
    const { user, role } = useAuth();

    // Debug logging for doctor login
    useEffect(() => {
        if (role === 'doctor' && user) {
            console.log("Doctor logged in - DoctorSidebar:", {
                user,
                role,
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                userRole: user.role
            });
        }
    }, []);

    const { markVisitDone, setDoneVisits, updateStatus, revertStatus } = useContext(AppointmentContext);
    const {
        setDateSelected,
        setCurrentStep,
        setLaunchedFromCalendar,
        setAppointmentSource,
    } = useBooking();

    const { setPrescriptionFormData, patients, allPrescriptions } = usePrescription();
    const { patients: allPatients } = usePatient();
    const navigate = useNavigate();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [modalMode, setModalMode] = useState("view");
    const [currentTime, setCurrentTime] = useState(new Date());

    // Use displayDate that defaults to current date if no date is selected
    const displayDate = selectedDate || format(new Date(), "yyyy-MM-dd");

    // Update current time every minute to refresh the current appointment indicator
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Set current date by default when sidebar opens
    useEffect(() => {
        if (sidebarOpen && !selectedDate && handleDateClick && !showAllData) {
            const today = new Date();
            const syntheticEvent = {
                date: today,
                dayEl: null,
                jsEvent: null,
                view: null,
            };

            console.log("Setting default date to current date:", format(today, "yyyy-MM-dd"));

            setTimeout(() => {
                handleDateClick(syntheticEvent);
            }, 50);
        }
    }, [sidebarOpen]);

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Sort appointments by both date and time
    const sortAppointmentsByDateAndTime = (appointmentsArray) => {
        return [...appointmentsArray].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (dateA.getTime() !== dateB.getTime()) {
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            }

            const timeA = parseTime(a.time);
            const timeB = parseTime(b.time);

            return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        })
    }

    // Toggle sort order
    const toggleSortOrder = () => {
        setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    };

    const handleAddAppointmentClick = () => {
        setLaunchedFromCalendar(true);
        setDateSelected(new Date(selectedDate || new Date()));
        setAppointmentSource("");
        setCurrentStep("source");
        setShowBookingModal(true);
        setselectedTimeSlot("");
        if (onClose) onClose();
        if (setSidebarOpen) setSidebarOpen(false);
    };

    const getFilteredAppointments = () => {
        if (role?.toLowerCase() === "doctor" && user) {
            const userDoctorId = Number(user.doctorId || user.id);
            const userDoctorName = (user.name || `${user.firstName || ""} ${user.lastName || ""}`).trim().toLowerCase();

            const filtered = appointments.filter((appt) => {
                const apptDoctorId = Number(appt.doctorId || appt.doctor_id || appt.doctor?.id);
                const apptDoctorName = (appt.doctor || `${appt.doctor_firstName || ""} ${appt.doctor_lastName || ""}`).trim().toLowerCase();

                return apptDoctorId === userDoctorId || apptDoctorName === userDoctorName;
            });

            console.log("DoctorSidebar -> Filtered Appointments for Doctor:", {
                userDoctorId,
                userDoctorName,
                filteredCount: filtered.length,
            });

            return filtered;
        }

        return appointments;
    };

    const filteredAppointments = getFilteredAppointments();

    const enhanceAppointmentWithPatientId = (appointment, allPatients) => {
        if (appointment.patient_id) {
            return appointment;
        }

        const matchingPatient = allPatients?.find(p => {
            if (p.name === appointment.patientName && p.contact === appointment.patientPhone) {
                return true;
            }
            if (p.name === appointment.patientName) {
                return true;
            }
            if (p.contact === appointment.patientPhone) {
                return true;
            }
            return false;
        });

        if (matchingPatient) {
            return {
                ...appointment,
                patient_id: matchingPatient.patient_id || matchingPatient.id
            };
        }

        return appointment;
    };

    // Handle Create Prescription button click
    const handleCreatePrescription = (appointment) => {
        console.log("Creating prescription for appointment:", appointment);

        let selectedPatient = null;

        if (patients && patients.length > 0) {
            selectedPatient = patients.find(
                (p) =>
                    p.patient_id === appointment.patient_id ||
                    p.id === appointment.patient_id ||
                    (p.name && appointment.patientName &&
                        p.name.toLowerCase() === appointment.patientName.toLowerCase() &&
                        p.contact && appointment.patientPhone &&
                        p.contact === appointment.patientPhone) ||
                    (p.name && appointment.patientName &&
                        p.name.toLowerCase() === appointment.patientName.toLowerCase()) ||
                    (p.contact && appointment.patientPhone &&
                        p.contact === appointment.patientPhone)
            );
        }

        if (!selectedPatient && allPatients && allPatients.length > 0) {
            selectedPatient = allPatients.find(
                (p) =>
                    p.patient_id === appointment.patient_id ||
                    p.id === appointment.patient_id ||
                    (p.name === appointment.patientName && p.contact === appointment.patientPhone) ||
                    p.name === appointment.patientName
            );
        }

        if (!selectedPatient) {
            selectedPatient = {
                id: appointment.patient_id || appointment.id,
                patient_id: appointment.patient_id || appointment.id,
                patientName: appointment.patientName,
                name: appointment.patientName,
                patientEmail: appointment.patientEmail || `${appointment.patientName?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                email: appointment.patientEmail || `${appointment.patientName?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                patientPhone: appointment.patientPhone,
                contact: appointment.patientPhone,
                patientAge: appointment.patientAge || "N/A",
                age: appointment.patientAge || "N/A",
                gender: appointment.gender || "Not specified",
                doctor: appointment.doctor || "Doctor Not Assigned",
                doctorSlug: appointment.doctorSlug || "",
                doctorSpeciality: appointment.doctorSpeciality || "",
                bloodGroup: appointment.bloodGroup || "Not specified",
                weight: appointment.weight || "Not specified",
                address: appointment.address || "Not specified",
                allergies: appointment.allergies || "No allergies",
                source: appointment.source || "Appointment",
                image_urls: appointment.image_urls || [],
                appointment_time: appointment.time || "",
                appointment_date: appointment.date || "",
            };
        }

        const patientIdToUse = selectedPatient.patient_id || selectedPatient.id;

        localStorage.setItem('prescriptionFromCalendar', JSON.stringify({
            patientId: patientIdToUse,
            patientData: selectedPatient
        }));

        setPrescriptionFormData((prev) => ({
            ...prev,
            patient: selectedPatient,
        }));

        navigate(`/prescriptions/create-prescription?patientId=${patientIdToUse}`);
    };

    // Handle View Patient Profile button click
    const viewPatientProfile = (appointment) => {
        let patient = null;

        patient = allPatients.find(p =>
            p.name === appointment.patientName &&
            p.contact === appointment.patientPhone
        );

        if (!patient) {
            patient = allPatients.find(p => p.name === appointment.patientName);
        }

        if (!patient) {
            patient = allPatients.find(p => p.contact === appointment.patientPhone);
        }

        if (!patient && appointment.email) {
            patient = allPatients.find(p => p.email === appointment.patientEmail);
        }

        if (patient) {
            setSelectedPatient(patient);
            setModalMode("view");
            setEditModalOpen(true);
        } else {
            const basicPatient = {
                id: appointment.id,
                name: appointment.patientName,
                email: appointment.patientEmail || `${appointment.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                contact: appointment.patientPhone,
                age: appointment.patientAge || "N/A",
                gender: appointment.gender || "Not specified",
                doctor: appointment.doctor || "Doctor Not Assigned",
                doctorSlug: appointment.doctorSlug || "",
                doctorSpeciality: appointment.doctorSpeciality || "",
                bloodGroup: appointment.bloodGroup || "Not specified",
                weight: appointment.weight || "Not specified",
                address: appointment.address || "Not specified",
                allergies: appointment.allergies || "No allergies",
                source: appointment.source || "Appointment",
                image_urls: appointment.image_urls || [],
                appointment_time: appointment.time || "",
                appointment_date: appointment.date || "",
            };
            setSelectedPatient(basicPatient);
            setModalMode("view");
            setEditModalOpen(true);
        }
    };

    // Handle View Prescription button click
    const viewPrescription = (appointment) => {
        const enhancedAppt = enhanceAppointmentWithPatientId(appointment, allPatients);

        const prescription = allPrescriptions?.find(p => {
            if (p.patient_id && enhancedAppt.patient_id &&
                p.patient_id.toString() === enhancedAppt.patient_id.toString()) {
                return true;
            }
            if (p.patient_id && enhancedAppt.id &&
                p.patient_id.toString() === enhancedAppt.id.toString()) {
                return true;
            }
            if (p.patient_name && enhancedAppt.patientName &&
                p.patient_name.toLowerCase() === enhancedAppt.patientName.toLowerCase() &&
                p.patient_phone && enhancedAppt.patientPhone &&
                p.patient_phone === enhancedAppt.patientPhone) {
                return true;
            }
            if (p.patient_name && enhancedAppt.patientName &&
                p.patient_name.toLowerCase() === enhancedAppt.patientName.toLowerCase()) {
                return true;
            }
            if (p.patient_phone && enhancedAppt.patientPhone &&
                p.patient_phone === enhancedAppt.patientPhone) {
                return true;
            }
            if (p.patient_email && enhancedAppt.patientEmail &&
                p.patient_email.toLowerCase() === enhancedAppt.patientEmail.toLowerCase()) {
                return true;
            }
            return false;
        });

        if (prescription) {
            const prescriptionId = prescription.id || prescription._id;
            navigate(`/prescription/view/${prescriptionId}`);
        } else {
            toast.info("No prescription found for this patient");
        }
    };

    // Approve a pending appointment
    const approvePending = async (appointmentId) => {
        try {
            const success = await updateStatus(appointmentId, "approved");
            if (success) {
                toast.success("Appointment approved");
            }
        } catch (error) {
            toast.error("Failed to approve appointment");
        }
    };

    // Reject a pending appointment
    const rejectPending = async (appointmentId) => {
        try {
            const success = await updateStatus(appointmentId, "rejected");
            if (success) {
                toast.success("Appointment rejected");
            }
        } catch (error) {
            toast.error("Failed to reject appointment");
        }
    };

    // Handle Undo to Approved button click
    const undoToApproved = async (appointmentId) => {
        try {
            const success = await updateStatus(appointmentId, "approved");
            if (success) {
                setDoneVisits(prev => prev.filter(id => id !== appointmentId));
            }
        } catch (error) {
            // Error handling is done in updateStatus
        }
    };

    const openCompleteModal = (appt) => {
        const enhancedAppt = enhanceAppointmentWithPatientId(appt, allPatients);
        setSelectedApptForComplete(enhancedAppt);

        const prescription = allPrescriptions?.find(p => {
            if (p.patient_id && enhancedAppt.patient_id &&
                p.patient_id.toString() === enhancedAppt.patient_id.toString()) {
                return true;
            }
            if (p.patient_id && enhancedAppt.id &&
                p.patient_id.toString() === enhancedAppt.id.toString()) {
                return true;
            }
            if (p.patient_name && enhancedAppt.patientName &&
                p.patient_name.toLowerCase() === enhancedAppt.patientName.toLowerCase() &&
                p.patient_phone && enhancedAppt.patientPhone &&
                p.patient_phone === enhancedAppt.patientPhone) {
                return true;
            }
            return false;
        });

        setHasPrescription(!!prescription);
        setShowCompleteModal(true);
    };

    const handleConfirmComplete = () => {
        if (!selectedApptForComplete) return;
        markVisitDone(selectedApptForComplete.id);
        setShowCompleteModal(false);
    };

    const handleViewPrescription = () => {
        const enhancedAppt = enhanceAppointmentWithPatientId(selectedApptForComplete, allPatients);

        const prescription = allPrescriptions?.find(p => {
            if (p.patient_id && enhancedAppt.patient_id &&
                p.patient_id.toString() === enhancedAppt.patient_id.toString()) {
                return true;
            }
            if (p.patient_id && enhancedAppt.id &&
                p.patient_id.toString() === enhancedAppt.id.toString()) {
                return true;
            }
            if (p.patient_name && enhancedAppt.patientName &&
                p.patient_name.toLowerCase() === enhancedAppt.patientName.toLowerCase() &&
                p.patient_phone && enhancedAppt.patientPhone &&
                p.patient_phone === enhancedAppt.patientPhone) {
                return true;
            }
            return false;
        });

        if (prescription) {
            const prescriptionId = prescription.id || prescription._id;
            navigate(`/prescription/view/${prescriptionId}`);
            setShowCompleteModal(false);
        } else {
            toast.info("No prescription found for this patient");
        }
    };

    const handleCreatePrescriptionAndComplete = () => {
        if (selectedApptForComplete) {
            const enhancedAppt = enhanceAppointmentWithPatientId(selectedApptForComplete, allPatients);
            handleCreatePrescription(enhancedAppt);
            markVisitDone(enhancedAppt.id);
            setShowCompleteModal(false);
        }
    };

    // Update all filtering to use displayDate
    const approvedAppointments = sortAppointmentsByDateAndTime(filteredAppointments.filter(
        (appt) => {
            const statusMatch = normalizeStatus(appt.status) === "approved";
            const dateMatch = showAllData || normalizeDate(appt.date) === normalizeDate(displayDate);
            return statusMatch && dateMatch;
        }
    ));

    const completedAppointments = sortAppointmentsByDateAndTime(filteredAppointments.filter(
        (appt) => {
            const statusMatch = normalizeStatus(appt.status) === "done" || doneVisits.includes(appt.id);
            const dateMatch = showAllData || normalizeDate(appt.date) === normalizeDate(displayDate);
            return statusMatch && dateMatch;
        }
    ));

    const cancelledAppointments = sortAppointmentsByDateAndTime(filteredAppointments.filter(
        (appt) => {
            const statusMatch = normalizeStatus(appt.status) === "rejected";
            const dateMatch = showAllData || normalizeDate(appt.date) === normalizeDate(displayDate);
            return statusMatch && dateMatch;
        }
    ));

    const pendingAppointments = sortAppointmentsByDateAndTime(filteredAppointments.filter(
        (appt) => {
            const statusMatch = normalizeStatus(appt.status) === "pending";
            const dateMatch = showAllData || normalizeDate(appt.date) === normalizeDate(displayDate);
            return statusMatch && dateMatch;
        }
    ));

    // Helper function to get status class for appointment ID
    const getStatusClass = (appointment) => {
        const status = normalizeStatus(appointment.status);
        if (status === "approved") return "approved";
        if (status === "pending") return "pending";
        if (status === "rejected") return "cancelled";
        if (status === "done" || doneVisits.includes(appointment.id)) return "done";
        return "approved";
    };

    return (
        <div
            className={`content-sidebar content-sidebar-xl calendar-sidebar ${sidebarOpen ? "app-sidebar-open" : ""
                }`}
        >
            <div className="sidebar-content-wrapper">
                <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
                    <h4 className="fw-bolder mb-0">Calendar</h4>
                    <button
                        className="app-sidebar-close-trigger d-flex btn btn-link"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FiX />
                    </button>
                </div>

                <div className="content-sidebar-body">
                    <PerfectScrollbar>
                        <div id="lnb-calendars" className="lnb-calendars">
                            {/* Enhanced Appointments Summary Section */}
                            <div className="calendar-sidebar-item">
                                <div
                                    className="section-header"
                                    onClick={() => toggleSection("appointments")}
                                >
                                    <h6 className="fs-12 fw-bold text-uppercase text-primary mb-0 d-flex align-items-center justify-content-between">
                                        <span>Appointments Overview</span>
                                        {expandedSections.appointments ? (
                                            <FiChevronDown size={16} />
                                        ) : (
                                            <FiChevronRight size={16} />
                                        )}
                                    </h6>
                                </div>
                                <div
                                    className={`section-content ${expandedSections.appointments ? "expanded" : ""
                                        }`}
                                >
                                    <div className="appointments-summary-grid">
                                        <div className="appointment-summary-card pending">
                                            <div className="card-icon">
                                                <FiClock size={18} />
                                            </div>
                                            <div className="card-content">
                                                <div className="card-title">Pending</div>
                                                <div className="card-count">{pendingAppointments.length}</div>
                                            </div>
                                        </div>
                                        <div className="appointment-summary-card today">
                                            <div className="card-icon">
                                                <FiCalendar size={18} />
                                            </div>
                                            <div className="card-content">
                                                <div className="card-title">Total</div>
                                                <div className="card-count">{pendingAppointments.length + approvedAppointments.length +
                                                    completedAppointments.length + cancelledAppointments.length}</div>
                                            </div>
                                        </div>
                                        <div className="appointment-summary-card tomorrow">
                                            <div className="card-icon">
                                                <FiClock size={18} />
                                            </div>
                                            <div className="card-content">
                                                <div className="card-title">Rejected</div>
                                                <div className="card-count">{cancelledAppointments.length}</div>
                                            </div>
                                        </div>
                                        <div className="appointment-summary-card weekly">
                                            <div className="card-icon">
                                                <FiCalendar size={18} />
                                            </div>
                                            <div className="card-content">
                                                <div className="card-title">Completed</div>
                                                <div className="card-count">{completedAppointments.length}</div>
                                            </div>
                                        </div>
                                        <div className="appointment-summary-card monthly">
                                            <div className="card-icon">
                                                <FiCalendar size={18} />
                                            </div>
                                            <div className="card-content">
                                                <div className="card-title">Approved</div>
                                                <div className="card-count">{approvedAppointments.length}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Approved Appointments Section */}
                            {approvedAppointments.length > 0 && (
                                <div className="calendar-sidebar-item">
                                    <div
                                        className="section-header"
                                        onClick={() => toggleSection("approved")}
                                    >
                                        <h6 className="fs-12 fw-bold text-uppercase text-success mb-0 d-flex align-items-center justify-content-between">
                                            <span>Approved Appointments</span>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm p-0 ms-1 border-0 bg-transparent"
                                                    style={{
                                                        color: '#0d6efd',
                                                        textDecoration: 'none'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSortOrder();
                                                    }}
                                                    title={`Sort by time (${sortOrder === "asc" ? "Earliest First" : "Latest First"})`}
                                                >
                                                    <RiArrowUpDownLine size={12} />
                                                </button>
                                                {expandedSections.approved ? (
                                                    <FiChevronDown size={16} />
                                                ) : (
                                                    <FiChevronRight size={16} />
                                                )}
                                            </div>
                                        </h6>
                                    </div>
                                    {expandedSections.approved && (
                                        <>
                                            <div className="approved-appointments-header">
                                                {approvedAppointments.length === 0 && (
                                                    <div className="no-appointments">
                                                        <div className="empty-state">
                                                            <FiCalendar size={48} className="empty-icon" />
                                                            <p className="empty-text">
                                                                {selectedDate
                                                                    ? "No approved appointments for this date"
                                                                    : "No approved appointments"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {approvedAppointments.map((appt) => {
                                                const enhancedAppt = enhanceAppointmentWithPatientId(appt, allPatients);
                                                return (
                                                    <AppointmentCard
                                                        key={enhancedAppt.id}
                                                        appointment={enhancedAppt}
                                                        status="approved"
                                                        onViewProfile={viewPatientProfile}
                                                        onCreatePrescription={handleCreatePrescription}
                                                        onComplete={openCompleteModal}
                                                        onViewPrescription={viewPrescription}
                                                        onRevert={undoToApproved}
                                                        onApprove={approvePending}
                                                        onReject={rejectPending}
                                                        showActions={true}
                                                    />
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Enhanced Done Appointments Section */}
                            {completedAppointments.length > 0 && (
                                <div className="calendar-sidebar-item">
                                    <div
                                        className="section-header"
                                        onClick={() => toggleSection("done")}
                                    >
                                        <h6 className="fs-12 fw-bold text-uppercase text-info mb-0 d-flex align-items-center justify-content-between">
                                            <span>Completed Appointments</span>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm p-0 ms-1 border-0 bg-transparent"
                                                    style={{
                                                        color: '#0d6efd',
                                                        textDecoration: 'none'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSortOrder();
                                                    }}
                                                    title={`Sort by Time(${sortOrder === "asc" ? "Earliest First" : "Latest First"})`}
                                                >
                                                    <RiArrowUpDownLine size={12} />
                                                </button>
                                                {expandedSections.done ? (
                                                    <FiChevronDown size={16} />
                                                ) : (
                                                    <FiChevronRight size={16} />
                                                )}
                                            </div>
                                        </h6>
                                    </div>
                                    {expandedSections.done && (
                                        <>
                                            <div className="done-appointments-header">
                                                {completedAppointments.length === 0 && (
                                                    <div className="no-appointments">
                                                        <div className="empty-state">
                                                            <FiCheckCircle size={48} className="empty-icon" />
                                                            <p className="empty-text">
                                                                {selectedDate
                                                                    ? "No completed appointments for this date"
                                                                    : "No completed appointments"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {completedAppointments.map((appt) => {
                                                const enhancedAppt = enhanceAppointmentWithPatientId(appt, allPatients);
                                                return (
                                                    <AppointmentCard
                                                        key={enhancedAppt.id}
                                                        appointment={enhancedAppt}
                                                        status="done"
                                                        onViewProfile={viewPatientProfile}
                                                        onCreatePrescription={handleCreatePrescription}
                                                        onComplete={openCompleteModal}
                                                        onViewPrescription={viewPrescription}
                                                        onRevert={undoToApproved}
                                                        onApprove={approvePending}
                                                        onReject={rejectPending}
                                                        showActions={true}
                                                    />
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Enhanced Cancelled Appointments Section */}
                            {cancelledAppointments.length > 0 && (
                                <div className="calendar-sidebar-item">
                                    <div
                                        className="section-header"
                                        onClick={() => toggleSection("cancelled")}
                                    >
                                        <h6 className="fs-12 fw-bold text-uppercase text-danger mb-0 d-flex align-items-center justify-content-between">
                                            <span>Cancelled Appointments</span>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm p-0 ms-1 border-0 bg-transparent"
                                                    style={{
                                                        color: '#0d6efd',
                                                        textDecoration: 'none'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSortOrder();
                                                    }}
                                                    title={`Sort by time (${sortOrder === "asc" ? "Earliest First" : "Latest First"})`}
                                                >
                                                    <RiArrowUpDownLine size={12} />
                                                </button>
                                                {expandedSections.cancelled ? (
                                                    <FiChevronDown size={16} />
                                                ) : (
                                                    <FiChevronRight size={16} />
                                                )}
                                            </div>
                                        </h6>
                                    </div>
                                    {expandedSections.cancelled && (
                                        <>
                                            <div className="cancelled-appointments-header">
                                                {cancelledAppointments.length === 0 && (
                                                    <div className="no-appointments">
                                                        <div className="empty-state">
                                                            <FiXCircle size={48} className="empty-icon" />
                                                            <p className="empty-text">
                                                                {selectedDate
                                                                    ? "No cancelled appointments for this date"
                                                                    : "No cancelled appointments"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {cancelledAppointments.map((appt) => (
                                                <AppointmentCard
                                                    key={appt.id}
                                                    appointment={appt}
                                                    status="rejected"
                                                    onViewProfile={viewPatientProfile}
                                                    onCreatePrescription={handleCreatePrescription}
                                                    onComplete={openCompleteModal}
                                                    onViewPrescription={viewPrescription}
                                                    onRevert={revertStatus}
                                                    onApprove={approvePending}
                                                    onReject={rejectPending}
                                                    showActions={true}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Pending Appointments Section */}
                            {pendingAppointments.length > 0 && (
                                <div className="calendar-sidebar-item">
                                    <div
                                        className="section-header"
                                        onClick={() => toggleSection("pending")}
                                    >
                                        <h6 className="fs-12 fw-bold text-uppercase text-warning mb-0 d-flex align-items-center justify-content-between">
                                            <span>Pending Appointments</span>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm p-0 ms-1 border-0 bg-transparent"
                                                    style={{
                                                        color: '#0d6efd',
                                                        textDecoration: 'none'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSortOrder();
                                                    }}
                                                    title={`Sort by time (${sortOrder === "asc" ? "Earliest First" : "Latest First"})`}
                                                >
                                                    <RiArrowUpDownLine size={12} />
                                                </button>
                                                {expandedSections.pending ? (
                                                    <FiChevronDown size={16} />
                                                ) : (
                                                    <FiChevronRight size={16} />
                                                )}
                                            </div>
                                        </h6>
                                    </div>

                                    {expandedSections.pending && (
                                        <>
                                            <div className="pending-appointments-header">
                                                {pendingAppointments.length === 0 && (
                                                    <div className="no-appointments">
                                                        <div className="empty-state">
                                                            <FiClock size={48} className="empty-icon" />
                                                            <p className="empty-text">
                                                                {selectedDate
                                                                    ? "No pending appointments for this date"
                                                                    : "No pending appointments"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {pendingAppointments.map((appt) => (
                                                <AppointmentCard
                                                    key={appt.id}
                                                    appointment={appt}
                                                    status="pending"
                                                    onViewProfile={viewPatientProfile}
                                                    onCreatePrescription={handleCreatePrescription}
                                                    onComplete={openCompleteModal}
                                                    onViewPrescription={viewPrescription}
                                                    onRevert={revertStatus}
                                                    onApprove={approvePending}
                                                    onReject={rejectPending}
                                                    showActions={true}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Complete Appointment Modal */}
                        {showCompleteModal && selectedApptForComplete && (
                            <div className="custom-modal-overlay">
                                <div className="custom-modal">
                                    <div className="modal-header">
                                        <h5>Complete Appointment</h5>
                                        <button className="btn-close" onClick={() => setShowCompleteModal(false)}>
                                            <FiX />
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <p>
                                            Before completing appointment for <b>{selectedApptForComplete.patientName}</b>,
                                            {hasPrescription
                                                ? " you can view the existing prescription."
                                                : " no prescription found. Do you want to create one?"}
                                        </p>
                                    </div>
                                    <div className="modal-footer d-flex gap-2 justify-content-end">
                                        {hasPrescription ? (
                                            <>
                                                <button className="btn btn-outline-info" onClick={handleViewPrescription}>
                                                    <FiFileText className="me-1" /> View Prescription
                                                </button>
                                                <button className="btn btn-success" onClick={handleConfirmComplete}>
                                                    <FiCheck className="me-1" /> Mark Complete
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={handleCreatePrescriptionAndComplete}
                                                >
                                                    <FiPlus className="me-1" /> Create Prescription
                                                </button>
                                                <button className="btn btn-success" onClick={handleConfirmComplete}>
                                                    <FiCheck className="me-1" /> Complete Anyway
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
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

export default DoctorSidebar;