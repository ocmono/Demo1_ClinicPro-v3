import { useEffect, useRef, useState, useContext, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
// import CalenderModal from "./CalenderModal";
import DoctorSidebar from "./DoctorSidebar";
import AddEventForm from "./AddEventForm";
import EditEventForm from "./EditEventForm";
import {
  FiAlignLeft,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import {
  format,
  isValid,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
} from "date-fns";
import getIcon from "@/utils/getIcon";
import { initEvents } from "./initEvents";
import EventDetails from "./EventDetails";
import PerfectScrollbar from "react-perfect-scrollbar";
import Checkbox from "@/components/shared/Checkbox";
import { AppointmentContext } from "../../context/AppointmentContext";
import "../calender/CalenderContent.css";
import { useAuth } from "../../contentApi/AuthContext";
import CalenderModal from "./CalenderModal";
import BookingModal from "./BookingModal";

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

// Event category options for calendar events
const eventCategoryOptions = [
  { value: "approved", bgColor: "#28a745", color: "#fff", icon: "feather-check" },
  { value: "pending", bgColor: "#ffc107", color: "#000", icon: "feather-clock" },
  { value: "rejected", bgColor: "#dc3545", color: "#fff", icon: "feather-x" },
  { value: "done", bgColor: "#17a2b8", color: "#fff", icon: "feather-check-circle" },
];

function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
}

const DoctorCalendar = () => {
  const calendarRef = useRef(null);
  const calenderModalRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calenderFilter, setcalenderFilter] = useState({
    label: "Monthly",
    icon: "feather-grid",
  });
  const [events, setEvents] = useState(initEvents);
  const [isWeekMonday, setIsWeekMonday] = useState(0);
  const [showWeekends, setShowWeekends] = useState(true);
  const [currentMonth, setCurrentMonth] = useState("");
  console.log("current Month", currentMonth);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState(null);
  const clickTimeout = useRef(null);
  const [showAllData, setShowAllData] = useState(false);

  // Get appointment data and context
  const { appointments, doneVisits } = useContext(AppointmentContext);
  const [appointmentCounts, setAppointmentCounts] = useState({
    today: 0,
    tomorrow: 0,
    weekly: 0,
    monthly: 0,
  });
  const { user, role } = useAuth();

  // Debug logging for doctor login
  useEffect(() => {
    if (role === 'doctor' && user) {
      console.log("Doctor logged in - CalendarContent:", {
        user,
        role,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role
      });
    }
  }, [user, role]);

  // Filter appointments based on
  const getFilteredAppointments = () => {
    if (role?.toLowerCase() === "doctor" && user) {
      const userDoctorId = Number(user.doctorId || user.id);
      const userDoctorName = (user.name || `${user.firstName || ""} ${user.lastName || ""}`).trim().toLowerCase();

      const filtered = appointments.filter((appt) => {
        const apptDoctorId = Number(appt.doctorId || appt.doctor_id || appt.doctor?.id);
        const apptDoctorName = (
          appt.doctor ||
          `${appt.doctor_firstName || ""} ${appt.doctor_lastName || ""}`
        ).trim().toLowerCase();

        return apptDoctorId === userDoctorId || apptDoctorName === userDoctorName;
      });

      console.log("DoctorCalendar ✅ Filtered Appointments:", {
        userDoctorId,
        userDoctorName,
        total: appointments.length,
        matched: filtered.length,
      });

      return filtered;
    }

    // Admins & receptionists see all appointments
    return appointments;
  };

  const filteredAppointments = useMemo(() => {
    return getFilteredAppointments();
  }, [appointments, user, role]);

  useEffect(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Use filtered appointments for counts (role-based)
    const approvedAppointments = filteredAppointments.filter(
      (appt) => normalizeStatus(appt.status) === "approved"
    );

    const counts = {
      today: approvedAppointments.filter((appt) => normalizeDate(appt.date) === todayStr)
        .length,
      tomorrow: approvedAppointments.filter((appt) => normalizeDate(appt.date) === tomorrowStr)
        .length,
      weekly: approvedAppointments.filter((appt) => {
        const appointmentDate = new Date(appt.date);
        return appointmentDate >= weekStart && appointmentDate <= weekEnd;
      }).length,
      monthly: approvedAppointments.filter((appt) => {
        const appointmentDate = new Date(appt.date);
        return appointmentDate >= monthStart && appointmentDate <= monthEnd;
      }).length,
    };

    setAppointmentCounts(counts);
  }, [filteredAppointments]);

  useEffect(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    setSelectedDate(todayStr);
  }, []);

  const [newEventDate, setNewEventDate] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectAll, setSelectAll] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState({
    Office: true,
    Family: true,
    Friend: true,
    Travel: true,
    Private: true,
    Holidays: true,
    Company: true,
    Birthdays: true,
  });

  // Custom day cell renderer with appointment status circles
  const renderDayCellContent = (dateInfo) => {
    const date = dateInfo.date;
    const formattedDate = format(date, "yyyy-MM-dd");

    // Use filtered appointments for this date (doctor-specific)
    const appointmentsForDate = filteredAppointments.filter(
      (appt) => normalizeDate(appt.date) === formattedDate
    );

    // Count approved but not done
    const remainingApproved = appointmentsForDate.filter(
      (appt) => normalizeStatus(appt.status) === "approved" && !doneVisits.includes(appt.id)
    ).length;

    // Count done visits
    const doneCount = appointmentsForDate.filter((appt) =>
      normalizeStatus(appt.status) === "done" || doneVisits.includes(appt.id)
    ).length;

    // Count rejected
    const rejectedCount = appointmentsForDate.filter(
      (appt) => normalizeStatus(appt.status) === "rejected"
    ).length;

    // Count pending
    const pendingCount = appointmentsForDate.filter(
      (appt) => normalizeStatus(appt.status) === "pending"
    ).length;

    // Debug: log appointments with unknown status
    appointmentsForDate.forEach(appt => {
      const s = normalizeStatus(appt.status);
      if (s !== "approved" && s !== "pending" && s !== "done" && s !== "rejected") {
        console.warn("Unknown appointment status:", appt);
      }
    });

    return (
      <div className="fc-daygrid-day-top">
        <div className="fc-daygrid-day-number">{date.getDate()}</div>
        <div className="appointment-status-circles">
          {pendingCount > 0 && (
            <div className="status-circle pending" title={`${pendingCount} Pending`}>
              {pendingCount}
            </div>
          )}
          {remainingApproved > 0 && (
            <div
              className="status-circle accepted"
              title={`${remainingApproved} Approved`}
            >
              {remainingApproved}
            </div>
          )}
          {doneCount > 0 && (
            <div className="status-circle done" title={`${doneCount} Done`}>
              {doneCount}
            </div>
          )}
          {rejectedCount > 0 && (
            <div className="status-circle rejected" title={`${rejectedCount} Rejected`}>
              {rejectedCount}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleEventBtnClick = (e) => {
    e.preventDefault();
    const date = new Date();
    setNewEventDate({ start: date, end: date });
  };

  const clearClickTimeout = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
  };

  const handleDateChange = (date) => {
    // Prevent opening modal for past dates
    if (isPastDate(date)) {
      console.log("Past date clicked, booking disabled:", date);
      return; // ❌ Block booking modal
    }

    const syntheticEvent = {
      date: date,
      dayEl: null,
      jsEvent: null,
      view: null,
    };

    if (onClose) onClose();
    if (setSidebarOpen) setSidebarOpen(false);

    handleDateClick(syntheticEvent);
  };

  const handleDateClick = (info) => {
    if (!info?.date) return;

    setShowAllData(false);

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;

      if (!isPastDate(info.date)) {
        const localDate = new Date(info.date.getTime() - info.date.getTimezoneOffset() * 60000);
        setBookingDate({ start: localDate, end: localDate });
        setShowBookingModal(true);
      }
    } else {
      clickTimeout.current = setTimeout(() => {
        const localDate = new Date(info.date.getTime() - info.date.getTimezoneOffset() * 60000);
        setSelectedDate(localDate.toISOString().split("T")[0]);
        setIsDataModalOpen(true);
        clickTimeout.current = null;
      }, 250);
    }
  };

  const handleSelect = (info) => {
    if (!info?.start || isPastDate(info.start)) {
      console.log("❌ Past slot selected, booking blocked:", info?.start);
      return;
    }

    // Reset showAllData when a specific date is selected
    setShowAllData(false);

    const selectedDate = new Date(info.start);
    // Adjust for timezone offset
    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    );
    const newSelectedDate = localDate.toISOString().split("T")[0];

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      // Unselect any existing selection
      calendarApi.unselect();
    }

    setSelectedDate(newSelectedDate);
    setIsDataModalOpen(true);
  };

  // open modal click up the event title
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  // Delete event
  const handleDeleteEvent = () => {
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    setIsModalOpen(false);
  };

  // Handle View All Appointments click
  const handleViewAllClick = () => {
    setShowAllData(true); // Show all data
    setSelectedDate(null); // Clear the selected date to show all appointments
    setIsDataModalOpen(false); // Close any open modals
  };

  // Open edit modal
  const handleEditEvent = () => {
    setIsEditModalOpen(true);
    setIsModalOpen(false);
  };

  // Edit event (to be called on edit modal confirmation)
  const handleEditSubmit = (updatedEvent) => {
    const newEvents = events.map((event) => {
      if (event.id === updatedEvent._def.publicId) {
        return {
          ...event,
          title: updatedEvent.title,
          category: updatedEvent.category,
          start: updatedEvent.start,
          end: updatedEvent.end,
          details: {
            location: updatedEvent.details.location,
            position: updatedEvent.details.position,
            details: updatedEvent.details.details,
          },
          allDay: updatedEvent.allDay,
        };
      }
      return event;
    });

    setEvents(newEvents);
    setIsEditModalOpen(false);
  };

  // title date customize
  const handleDatesSet = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate(); // this gives the *center* date of the current view
      setCurrentMonth(format(currentDate, "MMMM yyyy"));
    }
  };


  const formatEventTime = (eventStart) => {
    if (eventStart && isValid(eventStart)) {
      const hours = eventStart.getHours();
      const minutes = eventStart.getMinutes();
      const seconds = eventStart.getSeconds();

      if (hours === 0 && minutes === 0 && seconds === 0) {
        return false;
      } else {
        return format(eventStart, "hh:mm a");
      }
    } else {
      return "Invalid date";
    }
  };

  const renderEventContent = (eventInfo) => {
    const category = eventCategoryOptions.find(
      (cat) => cat.value === eventInfo.event.extendedProps.category
    );
    const eventStart = eventInfo.event.start;
    const status = eventInfo.event.extendedProps.status;

    let dotColor = "";
    if (status === "approved") {
      dotColor = "green";
    } else if (status === "rejected") {
      dotColor = "red";
    } else {
      dotColor = "gray";
    }

    return (
      <span
        className="event-title-name"
        style={{
          backgroundColor: category.bgColor,
          color: category.color,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          className="status-dot"
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: dotColor,
            marginRight: "5px",
          }}
        ></span>
        {getIcon(category.icon)}
        <b>{formatEventTime(eventStart)}</b>
        <span>{eventInfo.event.title}</span>
      </span>
    );
  };

  return (
    <>
      <DoctorSidebar
        handleEventBtnClick={handleEventBtnClick}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedDate={selectedDate}
        showAllData={showAllData} // Pass the new prop
        onClose={() => setIsDataModalOpen(false)}
        appointments={filteredAppointments}
        appointmentCounts={appointmentCounts}
        doneVisits={doneVisits}
        onViewAllClick={handleViewAllClick}
        handleDateClick={handleDateClick} // Make sure this is passed
      />
      <div className="content-area">
        <PerfectScrollbar>
          <div className="content-area-body p-0 react-full-calender">
            <div className="content-area-header sticky-top">
              <div className="page-header-left d-flex align-items-center">
                <a
                  href="#"
                  className="app-sidebar-open-trigger me-3"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FiAlignLeft className="fs-20" />
                </a>
                <div className="calendar-header-content">
                  <div className="calendar-title-section">
                    <h1 className="calendar-title">
                      {showAllData ? (
                        <span className="all-appointments-display d-flex align-items-center">
                          <FiCalendar size={20} className="me-2" />
                          <h5 className="mb-0">All Appointments</h5>
                        </span>
                      ) : selectedDate ? (
                        <span className="selected-date-display">
                          <FiCalendar size={20} className="me-2" />
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="current-month-display">
                          <FiCalendar size={20} className="me-2" />
                          {currentMonth}
                        </span>
                      )}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="page-header-right ms-auto">
                <div className="hstack gap-2">
                  {/* View All Button - only show when a date is selected */}
                  {selectedDate && (
                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      onClick={handleViewAllClick}
                    >
                      <FiCalendar size={16} />
                      View All
                    </button>
                  )}
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
              plugins={[
                dayGridPlugin,
                interactionPlugin,
                timeGridPlugin,
                listPlugin,
              ]}
              initialView="dayGridMonth"
              views={{
                dayGridTwoWeek: {
                  type: "dayGrid",
                  duration: { weeks: 2 },
                  buttonText: "2 weeks",
                },
                dayGridThreeWeek: {
                  type: "dayGrid",
                  duration: { weeks: 3 },
                  buttonText: "3 weeks",
                },
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ""
                // right: "customMonth,customWeek,customDay"
              }}
              dayCellContent={(args) => {
                const date = args.date;
                const formattedDate = format(date, "yyyy-MM-dd");


                // Filter all appointments for this date
                const appointmentsForDate = filteredAppointments.filter(
                  (appt) => normalizeDate(appt.date) === formattedDate
                );

                const remainingApproved = appointmentsForDate.filter(
                  (appt) => normalizeStatus(appt.status) === "approved" && !doneVisits.includes(appt.id)
                ).length;

                const doneCount = appointmentsForDate.filter((appt) =>
                  normalizeStatus(appt.status) === "done" || doneVisits.includes(appt.id)
                ).length;

                const rejectedCount = appointmentsForDate.filter(
                  (appt) => normalizeStatus(appt.status) === "rejected"
                ).length;

                const pendingCount = appointmentsForDate.filter(
                  (appt) => normalizeStatus(appt.status) === "pending"
                ).length;

                // Return default number + counters
                return {
                  html: `
                  <div class="fc-daygrid-day-number">${args.dayNumberText}</div>
                  <div class="appointment-status-circles">
                    ${pendingCount ? `<div class="status-circle pending" title="${pendingCount} Pending">${pendingCount}</div>` : ""}
                    ${remainingApproved ? `<div class="status-circle accepted" title="${remainingApproved} Approved">${remainingApproved}</div>` : ""}
                    ${doneCount ? `<div class="status-circle done" title="${doneCount} Done">${doneCount}</div>` : ""}
                    ${rejectedCount ? `<div class="status-circle rejected" title="${rejectedCount} Rejected">${rejectedCount}</div>` : ""}
                  </div>
                `,
                };
              }}

              eventContent={renderEventContent}
              selectable={true}
              selectMirror={true}
              select={handleSelect}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              weekends={showWeekends}
              firstDay={isWeekMonday}
              datesSet={(arg) => {
                clearClickTimeout();   // ✅ clear timeout when changing view
                handleDatesSet(arg);
              }}
              dayMaxEventRows={3}
              dayHeaderClassNames="fc-day-header"
              dayCellClassNames={(arg) => {
                const cellDate = new Date(
                  arg.date.getTime() - arg.date.getTimezoneOffset() * 60000
                );

                const cellDateStr = cellDate.toISOString().split("T")[0];

                let classes = [];

                // 🔹 Highlight selected date
                if (cellDateStr === selectedDate) {
                  classes.push("selected-date");
                }

                // 🔹 Grey out past dates
                if (isPastDate(cellDate)) {
                  classes.push("fc-day-disabled");
                }

                return classes;
              }}
              height="auto"
              contentHeight="auto"
            />

            {/* Booking Modal for double-click */}
            {showBookingModal && (
              <BookingModal
                onClose={() => setShowBookingModal(false)}
                selectedDate={bookingDate?.start}
                skipToCalendar={true}
              />
            )}
          </div>
        </PerfectScrollbar>
      </div>
    </>
  );
};

export default DoctorCalendar;