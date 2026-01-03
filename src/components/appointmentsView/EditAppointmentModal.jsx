// components/EditAppointmentModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useBooking } from "../../contentApi/BookingProvider";
import Calendar from 'react-calendar';
import { FaInfoCircle, FaUserMd, FaVideo } from 'react-icons/fa';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { useAuth } from '../../contentApi/AuthContext';
import './AppointmentCalendar.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDatePicker from "../shared/CustomCalendar";
import { generateSortedTimeSlots } from "@/utils/generatedTimeSlots";

const EditAppointmentModal = ({ appointment, onClose, onSave, initialSelectedDate }) => {
  const { doctors } = useBooking();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    contact: "",
    doctor_id: "",
    date: "",
    time: "",
    type: "",
    status: "",
    source: "",
    appointment_mode: "clinic"
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [originalStatus, setOriginalStatus] = useState("");
  const [allAppointmentsList, setAllAppointments] = useState([]);
  const [appointmentMode, setAppointmentMode] = useState('clinic');
  const { user, role } = useAuth();

  const appointmentTypes = ["follow-up", "treatment", "new"];
  const statusOptions = ["done", "approved", "rejected", "pending"];
  const sourceOptions = ["online", "walk-in", "campaign-ads", "referral", "website"];

  // Fetch all appointments when component mounts
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await fetch('https://bkdemo1.clinicpro.cc/appointment/appointments-list');
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const data = await response.json();
        setAllAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAllAppointments([]);
      }
    };

    loadAppointments();
  }, []);

  useEffect(() => {
    if (appointment) {
      setAppointmentMode(appointment.appointment_mode || 'clinic');
      setFormData(prev => ({
        ...prev,
        appointment_mode: appointment.appointment_mode || 'clinic'
      }));
    }
  }, [appointment]);

  // Update doctorOptions to include buffer time and slots data
  const doctorOptions = React.useMemo(() => {
    if (!doctors || !Array.isArray(doctors)) return [];
    let filteredDoctors = doctors;
    // Role-based filtering
    // if (role === 'doctor' && user) {
    //   // For doctors, only show their own profile
    //   filteredDoctors = doctors.filter(doctor =>
    //     doctor.id === user.id ||
    //     doctor.email === user.email ||
    //     `${doctor.firstName} ${doctor.lastName}`.trim() === user.name
    //   );
    // }
    // For admin and receptionist, show all doctors (no filtering needed)
    return filteredDoctors.map(doctor => {
      const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
      return {
        value: doctor.id,
        label: doctorName,
        id: doctor.id,
        name: doctorName,
        availability: doctor.availability || [],
        startBufferTime: doctor.startBufferTime || 0,
        endBufferTime: doctor.endBufferTime || 365,
        slotsPerPerson: doctor.slotsPerPerson || 1
      };
    }).filter(doctor => doctor.value);
  }, [doctors]);

  const getSlotsForDate = (doctor, dateStr, mode) => {
    if (!doctor || !dateStr) return [];

    const dateObj = new Date(dateStr + "T00:00:00");

    return generateSortedTimeSlots(
      doctor,
      dateObj,
      allAppointmentsList,
      mode
    ).filter(slot => !slot.disabled);
  };

  const isDateWithinBookingBuffer = (dateStr, doctor) => {
    if (!doctor || !dateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);

    const startBufferDays = doctor.startBufferTime || 0;
    const endBufferDays = doctor.endBufferTime || 365;

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + startBufferDays);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + endBufferDays);

    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);

    return selectedDate >= minDate && selectedDate <= maxDate;
  };

  const isDateSelectable = (doctor, dateStr, mode) => {
    if (!doctor || !dateStr) return false;
    if (!isDateWithinBookingBuffer(dateStr, doctor)) {
      return false;
    }
    const slots = generateTimeSlots(doctor, dateStr, mode);
    return slots.some(
      slot => slot.available && slot.remainingSlots > 0
    );
  };

  // Function to get buffer information for display
  const getBufferInfo = (doctor = selectedDoctor) => {
    if (!doctor) return null;

    const startBufferDays = doctor.startBufferTime || 0;
    const endBufferDays = doctor.endBufferTime || 365;

    const today = new Date();
    const minDate = addDays(today, startBufferDays);
    const maxDate = addDays(today, endBufferDays);

    if (startBufferDays === 0 && endBufferDays === 365) {
      return "Booking available for all future dates";
    }

    return `Booking available from ${format(minDate, 'MMM dd, yyyy')} to ${format(maxDate, 'MMM dd, yyyy')}`;
  };

  // Function to get min and max dates for calendar
  const getCalendarRange = (doctor = selectedDoctor) => {
    if (!doctor) {
      return { minDate: new Date(), maxDate: addDays(new Date(), 365) };
    }

    const startBufferDays = doctor.startBufferTime || 0;
    const endBufferDays = doctor.endBufferTime || 365;

    return {
      minDate: addDays(new Date(), startBufferDays),
      maxDate: addDays(new Date(), endBufferDays)
    };
  };

  // Function to count booked slots for a specific time
  const countBookedSlots = (date, time, doctorId, mode = appointmentMode) => {
    if (!allAppointmentsList || allAppointmentsList.length === 0) return 0;

    const targetDate = new Date(date);
    const targetTime = formatTimeForInput(time);

    return allAppointmentsList.filter(appt => {
      if (appt.doctor_id !== doctorId && appt.doctor?.id !== doctorId) return false;

      if (appt.appointment_mode !== mode) return false;

      const apptDate = new Date(appt.date);
      const apptTime = formatTimeForInput(appt.time);

      // Exclude the current appointment being edited from the count
      // This allows the slot to become available when the appointment is moved
      const isCurrentAppointment = appt.id === formData.id;

      return (
        apptDate.toDateString() === targetDate.toDateString() &&
        apptTime === targetTime &&
        appt.status !== 'rejected' && // Don't count rejected appointments
        !isCurrentAppointment // Exclude current appointment from count
      );
    }).length;
  };

  // Function to check if a time slot is available considering slots per person
  const isTimeSlotAvailable = (date, time, doctor = selectedDoctor, mode = appointmentMode) => {
    if (!doctor) return false;

    const bookedSlots = countBookedSlots(date, time, doctor.id, mode);
    const maxSlots = doctor.slotsPerPerson || 1;

    return bookedSlots < maxSlots;
  };

  // Function to convert DD-MM-YYYY to YYYY-MM-DD for JavaScript Date
  const convertToJSDate = (dateString) => {
    if (!dateString) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month}-${day}`;
    }

    return dateString;
  };

  // Function to create a local Date object from YYYY-MM-DD string
  const createLocalDate = (dateString) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return null;
    }
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date) ? null : date;
  };

  // Enhanced time slot generation with buffer and slots per person
  const generateTimeSlots = (doctor, selectedDate, mode = appointmentMode) => {
    if (!doctor || !selectedDate || !doctor.availability) return [];

    // Check if selected date is within buffer
    if (!isDateWithinBookingBuffer(selectedDate, doctor)) {
      return [];
    }

    const today = new Date();
    const jsDate = convertToJSDate(selectedDate);
    const selectedDay = createLocalDate(jsDate);

    if (!selectedDay) {
      console.error('Invalid date:', selectedDate);
      return [];
    }

    const dayName = selectedDay.toLocaleDateString('en-US', { weekday: 'long' });

    // Find ALL doctor's availability entries for the selected day
    const dayAvailabilities = doctor.availability.filter(avail =>
      avail.day.toLowerCase() === dayName.toLowerCase() &&
      !avail.closed &&
      avail.startTime &&
      avail.endTime &&
      (
        mode === 'video' ? avail.is_video_time : avail.is_clinic_time
      )
    );

    // If no available slots for this day
    if (dayAvailabilities.length === 0) {
      return [];
    }

    const slots = [];
    const now = new Date();

    // Check if selected date is today or in the future
    const isToday = selectedDay.toDateString() === today.toDateString();
    const isFutureDate = selectedDay > today;

    // Process each availability entry for the day
    dayAvailabilities.forEach(dayAvailability => {
      try {
        const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
        const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);

        const slotDuration = dayAvailability.slotDuration || 30;

        let currentTime = new Date(selectedDay);
        currentTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(selectedDay);
        endTime.setHours(endHour, endMinute, 0, 0);

        // Ensure end time is after start time
        if (currentTime >= endTime) {
          return;
        }

        while (currentTime < endTime) {
          const timeString = currentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          const timeValue = currentTime.toTimeString().slice(0, 5);

          // Check if slot is available considering slots per person
          const isAvailable = isTimeSlotAvailable(selectedDate, timeValue, doctor, mode);

          // Only check for past slots if it's today
          let shouldIncludeSlot = true;

          if (isToday) {
            const isPast = currentTime < now;
            shouldIncludeSlot = !isPast;
          }

          if (shouldIncludeSlot && isAvailable) {
            // Avoid duplicate slots
            if (!slots.some(slot => slot.value === timeValue)) {
              const bookedSlots = countBookedSlots(selectedDate, timeValue, doctor.id, mode);
              const maxSlots = doctor.slotsPerPerson || 1;
              const remainingSlots = maxSlots - bookedSlots;

              slots.push({
                value: timeValue,
                label: timeString,
                rawTime: new Date(currentTime),
                available: true,
                bookedSlots,
                maxSlots,
                remainingSlots,
                mode: mode
              });
            }
          }

          // Move to next slot
          currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
        }
      } catch (error) {
        console.error('Error generating time slots for availability:', dayAvailability, error);
      }
    });

    // Sort slots by time
    const sortedSlots = slots.sort((a, b) => a.value.localeCompare(b.value));
    return sortedSlots;
  };

  // Function to convert time to HTML time input format (HH:MM)
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';

    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
      try {
        const date = new Date(`2000-01-01 ${timeString}`);
        if (!isNaN(date)) {
          return date.toTimeString().slice(0, 5);
        }
      } catch (e) {
        console.warn('Could not parse time:', timeString);
      }
    }

    return timeString;
  };

  const formatTimeForAPI = (time24) => {
    if (!time24) return '';

    if (time24.toLowerCase().includes('am') || time24.toLowerCase().includes('pm')) {
      return time24;
    }

    const [hours, minutes] = time24.split(':');
    const hourInt = parseInt(hours, 10);

    if (hourInt === 0) {
      return `12:${minutes} AM`;
    } else if (hourInt === 12) {
      return `12:${minutes} PM`;
    } else if (hourInt > 12) {
      return `${hourInt - 12}:${minutes} PM`;
    } else {
      return `${hourInt}:${minutes} AM`;
    }
  };

  useEffect(() => {
    if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
    }
  }, [initialSelectedDate]);

  useEffect(() => {
    if (appointment) {
      const formattedTime = formatTimeForInput(appointment.time);
      const currentDoctor = doctorOptions.find(doctor =>
        doctor.name === appointment.doctor || doctor.label === appointment.doctor
      );

      console.log('Editing appointment:', appointment);
      console.log('Found current doctor:', currentDoctor);

      const patientName = appointment.patientName || appointment.name ||
        (appointment.firstName && appointment.lastName ?
          `${appointment.firstName} ${appointment.lastName}` : 'Unknown Patient');

      const originalAppointmentStatus = appointment.status || 'pending';
      setOriginalStatus(originalAppointmentStatus);

      setFormData({
        id: appointment.id || '',
        name: patientName,
        email: appointment.patientEmail || appointment.email || '',
        contact: appointment.patientPhone || appointment.contact || '',
        doctor_id: currentDoctor?.value || appointment.doctor_id || '',
        date: appointment.date || '',
        time: formattedTime,
        type: appointment.type || 'new',
        status: originalAppointmentStatus,
        source: appointment.source || 'website',
        appointment_mode: appointment.appointment_mode || 'clinic'
      });

      if (currentDoctor) {
        setSelectedDoctor(currentDoctor);

        if (appointment.date) {
          const slots = generateTimeSlots(currentDoctor, appointment.date, appointment.appointment_mode || 'clinic');
          setAvailableTimeSlots(slots);
        } else {
          setAvailableTimeSlots([]);
        }
      } else {
        setSelectedDoctor(null);
        setAvailableTimeSlots([]);
      }

      if (appointment.date) {
        const jsDate = convertToJSDate(appointment.date);
        const calendarDate = createLocalDate(jsDate);
        if (calendarDate) {
          setSelectedDate(calendarDate);
        }
      }
    }
  }, [appointment, doctorOptions]);

  // Update available time slots when date changes
  useEffect(() => {
    if (formData.date && selectedDoctor) {
      console.log('Date changed to:', formData.date, 'Mode:', appointmentMode);
      const slots = generateTimeSlots(selectedDoctor, formData.date, appointmentMode);
      setAvailableTimeSlots(slots);

      if (formData.time && !slots.some(slot => slot.value === formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [formData.date, selectedDoctor, appointmentMode, allAppointmentsList]);

  // Update selected doctor when doctor_id changes
  useEffect(() => {
    if (formData.doctor_id) {
      const doctorId = parseInt(formData.doctor_id);
      const doctor = doctorOptions.find(doc => doc.value === doctorId || doc.value == formData.doctor_id);
      setSelectedDoctor(doctor || null);

      if (formData.date && doctor) {
        const slots = generateTimeSlots(doctor, formData.date, appointmentMode);
        setAvailableTimeSlots(slots);

        if (formData.time && !slots.some(slot => slot.value === formData.time)) {
          setFormData(prev => ({ ...prev, time: '' }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          time: ''
        }));
        setAvailableTimeSlots([]);
      }
    } else {
      setSelectedDoctor(null);
      setAvailableTimeSlots([]);
    }
  }, [formData.doctor_id, doctorOptions, appointmentMode]);

  const handleAppointmentModeChange = (mode) => {
    setAppointmentMode(mode);
    setFormData(prev => ({
      ...prev,
      appointment_mode: mode,
      time: '' // Clear time when mode changes
    }));
  };

  const handleInputChange = (field, value) => {
    console.log('handleInputChange called:', { field, value });
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    const doctor = doctorOptions.find(doc => doc.value == doctorId);
    setSelectedDoctor(doctor || null);
    handleInputChange('doctor_id', doctorId);
    handleInputChange('time', "");

    if (formData.date && doctor) {
      if (!isDateWithinBookingBuffer(formData.date, doctor)) {
        handleInputChange('time', "");
        handleInputChange('date', "");
      }
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    handleInputChange('date', formattedDate);
    handleInputChange('time', "");
  };

  const handleSubmit = () => {
    // Validate time slot
    if (formData.date && formData.time) {
      const slots = generateTimeSlots(selectedDoctor, formData.date, appointmentMode);
      const selectedSlot = slots.find(slot => slot.value === formData.time);

      if (!selectedSlot) {
        alert('Please select a valid time slot from the available options.');
        return;
      }

      // Check if slot is still available (considering concurrent bookings)
      if (!selectedSlot.available || selectedSlot.remainingSlots <= 0) {
        alert('This time slot is no longer available. Please select another time.');
        return;
      }
    }

    const apiTime = formatTimeForAPI(formData.time);

    const updatePayload = {
      ...formData,
      time: apiTime,
      doctor_id: parseInt(formData.doctor_id),
      appointment_id: parseInt(formData.id),
      status: formData.status || originalStatus,
      appointment_mode: appointmentMode
    };

    const { name, email, contact, ...apiPayload } = updatePayload;

    console.log('Sending update payload:', apiPayload);

    onSave(apiPayload);
    toast.success("Appointment updated");
    onClose();
  };

  const getAvailableDays = (doctor = selectedDoctor, mode = appointmentMode) => {
    if (!doctor || !doctor.availability) return [];

    const days = doctor.availability
      .filter(avail => !avail.closed && avail.startTime && avail.endTime && (mode === "video" ? avail.is_video_time : avail.is_clinic_time))
      .map(avail => avail.day.toLowerCase());

    return days;
  };

  const calendarRange = getCalendarRange(selectedDoctor);

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Appointment</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="modal-body">
                {appointment && (
                  <div className="row g-3">
                    {/* Patient Info (Read-only) */}
                    <div className="col-12">
                      <div className="card bg-light p-3">
                        <h6 className="mb-2">Patient Information</h6>
                        <div className="row small">
                          <div className="col-6">
                            <strong>Name:</strong> {formData.name}
                          </div>
                          <div className="col-6">
                            <strong>Contact:</strong> {formData.contact}
                          </div>
                          <div className="col-12 mt-1">
                            <strong>Email:</strong> {formData.email}
                          </div>
                          <div className="col-12 mt-1">
                            <strong>Source:</strong> {formData.source || "website"}
                          </div>
                          <div className="col-12 mt-1">
                            <strong>Current Mode:</strong>
                            <span className={`badge ms-2 ${formData.appointment_mode === 'clinic' ? 'bg-primary' : 'bg-info'} text-white text-capitalize`}>
                              {formData.appointment_mode === 'clinic' ? 'Clinic Visit' : 'Video Call'}
                            </span>
                          </div>
                          <div className="col-12 mt-1">
                            <strong>Current Status:</strong>
                            <span className={`badge ms-2 ${originalStatus === 'approved' ? 'bg-success' :
                              originalStatus === 'pending' ? 'bg-warning' :
                                originalStatus === 'rejected' ? 'bg-danger' :
                                  originalStatus === 'done' ? 'bg-info' : 'bg-secondary'
                              } text-white text-capitalize`}>
                              {originalStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label mb-3">Appointment Mode <span className="text-danger">*</span></label>
                      <div className="d-flex gap-3">
                        <button
                          type="button"
                          className={`btn flex-grow-1 py-3 ${appointmentMode === 'clinic' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleAppointmentModeChange('clinic')}
                        >
                          <FaUserMd size={13} className="me-2" />
                          Clinic Visit
                        </button>
                        <button
                          type="button"
                          className={`btn flex-grow-1 py-3 ${appointmentMode === 'video' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleAppointmentModeChange('video')}
                        >
                          <FaVideo size={13} className="me-2" />
                          Video Call
                        </button>
                      </div>
                      <small className="text-muted">
                        {appointmentMode === 'clinic'
                          ? 'Patient will visit the clinic in-person'
                          : 'Patient will join via video call'}
                      </small>
                    </div>

                    {/* Doctor Field */}
                    <div className="col-md-6">
                      <label className="form-label">Doctor <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.doctor_id}
                        onChange={handleDoctorChange}
                        required
                      >
                        <option value="">Select Doctor</option>
                        {doctorOptions.map((doctor, index) => (
                          <option key={doctor.id || index} value={doctor.value}>
                            {doctor.label}
                            {doctor.startBufferTime > 0 && ` (Buffer: ${doctor.startBufferTime}d)`}
                          </option>
                        ))}
                      </select>

                      {/* Buffer Info Display */}
                      {selectedDoctor && (selectedDoctor.startBufferTime > 0 || selectedDoctor.endBufferTime > 0) && (
                        <div className="buffer-info mt-2 p-2 bg-light rounded small">
                          <FaInfoCircle className="text-info me-1" />
                          {getBufferInfo(selectedDoctor)}
                          {selectedDoctor.slotsPerPerson > 1 && (
                            <div className="mt-1">
                              <strong>Slots per time:</strong> {selectedDoctor.slotsPerPerson}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Date Field - Calendar */}
                    <div className="col-md-6">
                      {selectedDoctor ? (
                        <>
                          <label className="form-label">Appointment Date <span className="text-danger">*</span></label>

                          {/* Buffer Notice */}
                          {/* {selectedDoctor && (selectedDoctor.startBufferTime > 0 || selectedDoctor.endBufferTime > 0) && (
                            <div className="buffer-info mt-2 p-2 bg-light rounded small">
                              <FaInfoCircle className="text-info me-1" />
                              {getBufferInfo(selectedDoctor)}
                            </div>
                          )} */}

                          <CustomDatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            startBufferDate={selectedDoctor?.startBufferTime || 0}
                            endBufferDate={selectedDoctor?.endBufferTime || 365}
                            minDate={calendarRange.minDate}
                            maxDate={calendarRange.maxDate}
                            placeholder="Select appointment date"
                            className="form-control-sm"
                            disabled={!selectedDoctor}
                            selectedDoctor={selectedDoctor}
                            isDateAvailable={(dateStr) => isDateSelectable(selectedDoctor, dateStr, appointmentMode)}
                          />

                          {/* <div className="appointment-calendar">
                            <Calendar
                              onChange={handleDateChange}
                              value={selectedDate}
                              minDate={calendarRange.minDate}
                              maxDate={calendarRange.maxDate}
                              tileDisabled={({ date }) => {
                                const dateString = (() => {
                                  const year = date.getFullYear();
                                  const month = String(date.getMonth() + 1).padStart(2, '0');
                                  const day = String(date.getDate()).padStart(2, '0');
                                  return `${year}-${month}-${day}`;
                                })();

                                // Disable dates outside buffer range
                                if (!isDateWithinBookingBuffer(dateString, selectedDoctor)) {
                                  return true;
                                }

                                // Disable dates with no available slots
                                const slots = generateTimeSlots(selectedDoctor, dateString);
                                return slots.length === 0;
                              }}
                              tileClassName={({ date, view }) => {
                                if (view !== 'month') return null;

                                const dateString = (() => {
                                  const year = date.getFullYear();
                                  const month = String(date.getMonth() + 1).padStart(2, '0');
                                  const day = String(date.getDate()).padStart(2, '0');
                                  return `${year}-${month}-${day}`;
                                })();

                                if (!isDateWithinBookingBuffer(dateString, selectedDoctor)) {
                                  return 'buffer-disabled';
                                }

                                return null;
                              }}
                              className="w-100"
                            />
                          </div> */}
                          {selectedDoctor && (selectedDoctor.startBufferTime > 0 || selectedDoctor.endBufferTime > 0) && (
                            <div className="buffer-info mt-2 p-2 bg-light rounded small">
                              <FaInfoCircle className="text-info me-1" />
                              {getBufferInfo(selectedDoctor)}
                            </div>
                          )}

                          {selectedDoctor && (
                            <small className="text-muted d-block mt-1">
                              Available days for {appointmentMode === 'clinic' ? 'clinic' : 'video'} visits: {getAvailableDays(selectedDoctor, appointmentMode).join(', ')}
                            </small>
                          )}
                        </>
                      ) : (
                        <div className="alert alert-info">
                          Please select a doctor first to see available dates.
                        </div>
                      )}
                    </div>

                    {/* Time Field - Enhanced with slots information */}
                    <div className="col-md-6">
                      <label className="form-label">Appointment Time <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        required
                        disabled={!formData.date || availableTimeSlots.length === 0}
                      >
                        <option value="">Select Time</option>
                        {availableTimeSlots.map((slot, index) => (
                          <option
                            key={index}
                            value={slot.value}
                            disabled={!slot.available || slot.remainingSlots <= 0}
                          >
                            {slot.label}
                            {slot.maxSlots > 1 && ` (${slot.remainingSlots}/${slot.maxSlots} available)`}
                            {(!slot.available || slot.remainingSlots <= 0) && ' - Fully booked'}
                          </option>
                        ))}
                      </select>

                      {!formData.date ? (
                        <small className="text-warning">Please select a date first</small>
                      ) : availableTimeSlots.length === 0 ? (
                          <small className="text-warning">
                            No available {appointmentMode === 'clinic' ? 'clinic' : 'video'} time slots for selected date
                          </small>
                      ) : (
                        <small className="text-muted">
                              {availableTimeSlots.filter(slot => slot.available && slot.remainingSlots > 0).length} available {appointmentMode === 'clinic' ? 'clinic' : 'video'} slot(s)
                        </small>
                      )}

                      {/* Selected slot info */}
                      {formData.time && availableTimeSlots.length > 0 && (
                        <div className="mt-2">
                          {availableTimeSlots
                            .filter(slot => slot.value === formData.time)
                            .map((slot, index) => (
                              <div key={index} className="slot-info small text-muted">
                                <FaInfoCircle className="me-1" />
                                {slot.maxSlots > 1 ? (
                                  <span>
                                    {slot.remainingSlots} of {slot.maxSlots} {appointmentMode} slots available at this time
                                  </span>
                                ) : (
                                    <span>1 {appointmentMode} slot available at this time</span>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>

                    {/* Type Field */}
                    <div className="col-md-6">
                      <label className="form-label">Appointment Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        required
                      >
                        <option value="">Select Type</option>
                        {appointmentTypes.map((type, index) => (
                          <option key={index} value={type} className="text-capitalize">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Source Field */}
                    <div className="col-md-6">
                      <label className="form-label">Source</label>
                      <select
                        className="form-select"
                        value={formData.source}
                        onChange={(e) => handleInputChange('source', e.target.value)}
                      >
                        <option value="">Select Source</option>
                        {sourceOptions.map((source, index) => (
                          <option key={index} value={source} className="text-capitalize">
                            {source}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!formData.time || !formData.date || !formData.doctor_id}
                >
                  Update Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;