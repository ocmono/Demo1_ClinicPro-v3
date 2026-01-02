// CalenderContent.jsx
import { useEffect, useRef, useState, useContext, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import CalenderSidebar from "./CalenderSidebar";
import {FiAlignLeft,FiCalendar,FiX} from "react-icons/fi";
import {format,startOfWeek,endOfWeek,startOfMonth,endOfMonth,addDays,isBefore,startOfDay} from "date-fns";
import { AppointmentContext } from "../../context/AppointmentContext";
import { useAuth } from "../../contentApi/AuthContext";
import { FaSyringe } from "react-icons/fa";
import BookingModal from "./BookingModal";
import { useVaccine } from "@/context/VaccineContext";
import "../calender/CalenderContent.css";

// Constants
const STATUS_CONFIG = {
  approved: { class: 'accepted', priority: 2 },
  pending: { class: 'pending', priority: 1 },
  done: { class: 'done', priority: 3 },
  rejected: { class: 'rejected', priority: 4 }
};

// Utility functions
const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d) ? '' : d.toISOString().split('T')[0];
};

const normalizeStatus = (status) => (status || '').toLowerCase().trim();

const isPastDate = (date) => {
  return isBefore(new Date(date), startOfDay(new Date()));
};

// Custom hook for appointment data - UPDATED
const useAppointmentData = (selectedDoctors = []) => {
  const { appointments: allAppointments, doneVisits } = useContext(AppointmentContext);
  const { user, role } = useAuth();

  const filteredAppointments = useMemo(() => {
    let filtered = allAppointments;
    
    // Filter by doctor role first
    if (role === 'doctor' && user) {
      filtered = allAppointments.filter(appt =>
        appt.doctor_id === user.id ||
        appt.doctor?.id === user.id ||
        appt.doctor === user.name ||
        `${appt.doctor_firstName} ${appt.doctor_lastName}` === user.name
      );
    }
    
    // Apply doctor filter if selected
    if (selectedDoctors.length > 0) {
      filtered = filtered.filter(appt => selectedDoctors.includes(appt.doctor));
    }
    
    return filtered;
  }, [allAppointments, role, user, selectedDoctors]);

  const appointmentCounts = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const approvedAppointments = allAppointments.filter(
      (appt) => normalizeStatus(appt.status) === "approved"
    );

    return {
      today: approvedAppointments.filter((appt) => normalizeDate(appt.date) === todayStr).length,
      tomorrow: approvedAppointments.filter((appt) => normalizeDate(appt.date) === tomorrowStr).length,
      weekly: approvedAppointments.filter((appt) => {
        const appointmentDate = new Date(appt.date);
        return appointmentDate >= weekStart && appointmentDate <= weekEnd;
      }).length,
      monthly: approvedAppointments.filter((appt) => {
        const appointmentDate = new Date(appt.date);
        return appointmentDate >= monthStart && appointmentDate <= monthEnd;
      }).length,
    };
  }, [allAppointments]);

  return { filteredAppointments, appointmentCounts, doneVisits };
};

// Custom hook for calendar interactions - UPDATED
const useCalendarInteractions = () => {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [showAllData, setShowAllData] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState(null);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const clickTimeout = useRef(null);
  const lastClickTime = useRef(0);

  const clearClickTimeout = useCallback(() => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
  }, []);

  const handleDateClick = useCallback((info) => {
    if (!info?.date) return;
    
    const currentTime = Date.now();
    const isDoubleClick = currentTime - lastClickTime.current < 300; // 300ms threshold for double click
    
    lastClickTime.current = currentTime;
    clearClickTimeout();

    if (isDoubleClick) {
      // Double click - open booking modal
      if (!isPastDate(info.date)) {
        const localDate = new Date(info.date.getTime() - info.date.getTimezoneOffset() * 60000);
        setBookingDate({ start: localDate, end: localDate });
        setShowBookingModal(true);
      }
    } else {
      // Single click - change selected date
      clickTimeout.current = setTimeout(() => {
        const localDate = new Date(info.date.getTime() - info.date.getTimezoneOffset() * 60000);
        const dateStr = localDate.toISOString().split("T")[0];
        setSelectedDate(dateStr);
        setShowAllData(false);
        clickTimeout.current = null;
      }, 200); // Wait 200ms to confirm it's not a double click
    }
  }, [clearClickTimeout]);

  const handleSelect = useCallback((info) => {
    if (!info?.start || isPastDate(info.start)) return;

    setShowAllData(false);
    const selectedDate = new Date(info.start);
    const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
    setSelectedDate(localDate.toISOString().split("T")[0]);
  }, []);

  const handleViewAllClick = useCallback(() => {
    setShowAllData(true);
    setSelectedDate(null);
  }, []);

  const handleDoctorFilterChange = useCallback((doctorsArray) => {
    setSelectedDoctors(doctorsArray);
  }, []);

  useEffect(() => {
    console.log("Selected Doctors:", selectedDoctors);
  }, [selectedDoctors]);

  const clearDoctorFilter = useCallback(() => {
    setSelectedDoctors([]);
  }, []);

  return {
    selectedDate,
    showAllData,
    showBookingModal,
    bookingDate,
    selectedDoctors,
    setSelectedDate,
    setShowBookingModal,
    setBookingDate,
    setSelectedDoctors,
    handleDateClick,
    handleSelect,
    handleViewAllClick,
    handleDoctorFilterChange,
    clearDoctorFilter,
    clearClickTimeout
  };
};
const CalenderContent = () => {
  const calendarRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const navigate = useNavigate();
  const { appointments: allAppointments } = useContext(AppointmentContext);
  const { vaccineSchedules } = useVaccine();

  // Use the updated hooks with doctor filter
  const {
    selectedDate,
    showAllData,
    showBookingModal,
    bookingDate,
    selectedDoctors,
    setShowBookingModal,
    handleDateClick,
    handleSelect,
    handleViewAllClick,
    handleDoctorFilterChange,
    clearDoctorFilter,
    clearClickTimeout
  } = useCalendarInteractions();

  const { filteredAppointments, appointmentCounts, doneVisits } = useAppointmentData(selectedDoctors);

  // Modified handleViewAllClick to also clear doctor filter
  const handleViewAllWithClear = useCallback(() => {
    clearDoctorFilter(); // Clear the doctor filter
    handleViewAllClick(); // Show all data
  }, [clearDoctorFilter, handleViewAllClick]);

  const normalizeLocalDate = (dateStr) => {
    if (!dateStr) return "";

    // ✅ If backend already sends YYYY-MM-DD, use it directly
    if (typeof dateStr === "string" && dateStr.length === 10) {
      return dateStr;
    }

    const d = new Date(dateStr);
    if (isNaN(d)) return "";

    // Convert UTC → local safely
    const local = new Date(
      d.getTime() - d.getTimezoneOffset() * 60000
    );

    return local.toISOString().split("T")[0];
  };

  // Day cell content renderer
  const dayCellContent = useCallback((args) => {
    const date = args.date;
    const formattedDate = format(date, "yyyy-MM-dd");

    const appointmentsForDate = filteredAppointments.filter(
      (appt) => normalizeDate(appt.date) === formattedDate
    );

    const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, status) => {
      const count = appointmentsForDate.filter((appt) => {
        const normalized = normalizeStatus(appt.status);
        if (status === 'approved') {
          return normalized === status && !doneVisits.includes(appt.id);
        }
        if (status === 'done') {
          return normalized === status || doneVisits.includes(appt.id);
        }
        return normalized === status;
      }).length;
      acc[status] = count;
      return acc;
    }, {});

    const appointmentCircles = Object.entries(STATUS_CONFIG)
      .sort(([,a], [,b]) => a.priority - b.priority)
      .map(([status, config]) => 
        statusCounts[status] > 0 
          ? `<div class="status-circle ${config.class}" title="${statusCounts[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}">${statusCounts[status]}</div>`
          : ''
      )
      .join('');

    const vaccineCount = (vaccineSchedules || []).filter(
      (v) => normalizeLocalDate(v.schedule_date) === formattedDate
    ).length;

    const vaccineCircle =
      vaccineCount > 0
        ? `<div class="status-circle vaccine">${vaccineCount}</div>`
        : '';

    return {
      html: `
        <div class="fc-daygrid-day-number">${args.dayNumberText}</div>
        ${
        vaccineCount > 0
          ? `
          <div class="vaccine-badge">
            <span class="vaccine-icon">💉</span>
            <span class="vaccine-count">${vaccineCount}</span>
          </div>
        `
          : ''
        }
        <div class="appointment-status-circles">${appointmentCircles}</div>
      `,
    };
  }, [filteredAppointments, doneVisits]);

  // Day cell class names
  const dayCellClassNames = useCallback((arg) => {
    const cellDate = new Date(arg.date.getTime() - arg.date.getTimezoneOffset() * 60000);
    const cellDateStr = cellDate.toISOString().split('T')[0];
    
    const classes = [];
    if (cellDateStr === selectedDate) classes.push("selected-date");
    if (isPastDate(cellDate)) classes.push("fc-day-disabled");
    
    return classes;
  }, [selectedDate]);

  // Calendar dates set handler
  const handleDatesSet = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      setCurrentMonth(format(currentDate, "MMMM yyyy"));
    }
  }, []);

  const doctorLabel = useMemo(() => {
    if (!selectedDoctors.length) return "All Doctors";
    if (selectedDoctors.length === 1) return `Dr. ${selectedDoctors[0]}`;
    if (selectedDoctors.length === 2)
      return `Dr. ${selectedDoctors[0]}, Dr. ${selectedDoctors[1]}`;
    return `${selectedDoctors.length} Doctors`;
  }, [selectedDoctors]);

  const headerTitle = useMemo(() => {
    const doctorBadge = (
      <span className="doctor-filter-badge ms-2">
        ({doctorLabel})
      </span>
    );

    if (showAllData) {
      return (
        <span className="all-appointments-display d-flex align-items-center">
          <FiCalendar size={20} className="me-2" />
          <h5 className="mb-0">All Appointments</h5>
          {doctorBadge}
        </span>
      );
    }
    
    if (selectedDate) {
      return (
        <span className="selected-date-display">
          <FiCalendar size={20} className="me-2" />
          {new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {doctorBadge}
        </span>
      );
    }
    
    return (
      <span className="current-month-display">
        <FiCalendar size={20} className="me-2" />
        {currentMonth}
        {doctorBadge}
      </span>
    );
  }, [showAllData, selectedDate, currentMonth, doctorLabel]);

  return (
    <>
      <CalenderSidebar
        handleEventBtnClick={() => {}}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedDate={selectedDate}
        showAllData={showAllData}
        onClose={() => {}}
        appointments={filteredAppointments}
        allAppointments={allAppointments} 
        appointmentCounts={appointmentCounts}
        doneVisits={doneVisits}
        onViewAllClick={handleViewAllWithClear} // Use the combined function
        handleDateClick={handleDateClick}
        selectedDoctors={selectedDoctors}
        onDoctorFilterChange={handleDoctorFilterChange}
        onClearDoctorFilter={clearDoctorFilter}
      />
      
      <div className="content-area">
        <div className="content-area-body p-0 react-full-calender">
          <div className="content-area-header sticky-top">
            <div className="page-header-left d-flex align-items-center">
              <button
                className="app-sidebar-open-trigger me-3 border-0 bg-transparent"
                onClick={() => setSidebarOpen(true)}
              >
                <FiAlignLeft className="fs-20" />
              </button>
              <div className="calendar-header-content">
                <div className="calendar-title-section">
                  <h1 className="calendar-title">{headerTitle}</h1>
                </div>
              </div>
            </div>
            
            <div className="page-header-right ms-auto">
              <div className="hstack gap-2">
                {/* Only show View All button - it will handle both functions */}
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={handleViewAllWithClear} // Use the combined function
                >
                  <FiCalendar size={16} />
                  View All
                </button>
                
                <button
                  onClick={() => navigate("/appointments/book-appointment")}
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                >
                  <FiCalendar size={16} />
                  Add Appointment
                </button>
              </div>
            </div>
          </div>


          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'today',
              center: 'title',
              right: "prev,next"
            }}
            dayCellContent={dayCellContent}
            selectable={true}
            selectMirror={true}
            select={handleSelect}
            dateClick={handleDateClick}
            weekends={true}
            firstDay={0}
            datesSet={(arg) => {
              clearClickTimeout();
              handleDatesSet(arg);
            }}
            dayMaxEventRows={3}
            dayHeaderClassNames="fc-day-header"
            dayCellClassNames={dayCellClassNames}
            height="auto"
            contentHeight="auto"
          />

          {showBookingModal && (
            <BookingModal
              onClose={() => setShowBookingModal(false)}
              selectedDate={bookingDate?.start}
              skipToCalendar={true}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CalenderContent;