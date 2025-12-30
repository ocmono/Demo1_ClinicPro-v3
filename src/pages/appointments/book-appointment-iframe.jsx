import { useMemo, useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { FaUserMd, FaNotesMedical, FaFlask, FaBullhorn, FaWalking, FaLaptop, FaVideo, FaStethoscope, FaRegClock, FaInfoCircle, FaGlobe, FaCheck, FaCalendarAlt, FaPhone, FaEnvelope, FaBirthdayCake, FaCalendarPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useBooking } from '../../contentApi/BookingProvider';
import { generateSortedTimeSlots } from '../../utils/generatedTimeSlots';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import './BookingModern.css';

function getQueryParam(name) {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

const IFRAME_SOURCE = 'website';

function generateGoogleCalendarUrl({ title, details, location, start, end }) {
  const format = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${format(start)}/${format(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function generateICS({ title, details, location, start, end }) {
  const pad = (n) => n < 10 ? '0' + n : n;
  const format = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function parseTimeToDate(date, timeStr) {
  if (!date || !timeStr) return null;
  const dateCopy = new Date(date);
  let h = 0, m = 0;
  // 24-hour format: '14:00'
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    [h, m] = timeStr.split(':').map(Number);
  } else {
    // 12-hour format: '2:00 PM' or '02:00 PM'
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([APMapm]{2})$/);
    if (match) {
      h = Number(match[1]);
      m = Number(match[2]);
      const ampm = match[3].toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
    } else {
      return null;
    }
  }
  dateCopy.setHours(h, m, 0, 0);
  return isNaN(dateCopy.getTime()) ? null : dateCopy;
}

const calculateAgeFromDOB = (dobValue) => {
  if (!dobValue) return { calculatedAge: "", calculatedAgeType: "years" };

  const birthDate = new Date(dobValue);
  let calculatedAge = "";
  let calculatedAgeType = "years";

  if (!isNaN(birthDate)) {
    const today = new Date();
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const birthDateOfMonth = birthDate.getDate();

    // Calculate age in months
    const ageInMonths = (currentYear - birthYear) * 12 + (currentMonth - birthMonth);

    // Calculate age in days for very young infants
    const timeDiff = today.getTime() - birthDate.getTime();
    const ageInDays = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (ageInDays <= 30) {
      // If less than or equal to 30 days, show in days
      calculatedAge = ageInDays.toString();
      calculatedAgeType = "days";
    } else if (ageInMonths < 24) {
      // If less than 2 years, show in months
      calculatedAge = ageInMonths.toString();
      calculatedAgeType = "months";

      // Check if born in current month - show in days
      if (currentYear === birthYear && currentMonth === birthMonth) {
        calculatedAge = ageInDays.toString();
        calculatedAgeType = "days";
      }
      // Check if born in current year but not current month
      else if (currentYear === birthYear) {
        calculatedAge = ageInMonths.toString();
        calculatedAgeType = "months";
      }
    } else {
      // If 2 years or more, show in years
      let ageInYears = currentYear - birthYear;

      // Adjust if birthday hasn't occurred yet this year
      if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDate < birthDateOfMonth)) {
        ageInYears--;
      }

      calculatedAge = ageInYears.toString();
      calculatedAgeType = "years";
    }
  }

  return { calculatedAge, calculatedAgeType };
};

const AppointmentsBookIframe = () => {
  const {
    setAppointmentSource,
    selectedDoctor,
    setSelectedDoctor,
    doctors,
    addAppointmentRequest,
  } = useBooking();

  // Read theme and logo from query params
  const [theme, setTheme] = useState('light');
  const [logo, setLogo] = useState('');
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentMode, setAppointmentMode] = useState('clinic');
  const [treatmentReason, setTreatmentReason] = useState('');

  useEffect(() => {
    setTheme(getQueryParam('theme') || 'light');
    setLogo(getQueryParam('logo') || '');
  }, [setAppointmentSource]);

  const [step, setStep] = useState('apptType');
  const [localDateSelected, setLocalDateSelected] = useState(null);
  const [localTimeSlot, setLocalTimeSlot] = useState('');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [patientName, setLocalPatientName] = useState('');
  const [patientPhone, setLocalPatientPhone] = useState('');
  const [patientEmail, setLocalPatientEmail] = useState('');
  const [patientAge, setLocalPatientAge] = useState('');
  const [ageType, setAgeType] = useState('years');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [appointmentSummary, setAppointmentSummary] = useState(null);
  const [hoveredDoctor, setHoveredDoctor] = useState(null);
  const [activeSlotDuration, setActiveSlotDuration] = useState(null);

  useEffect(() => {
    setAppointmentSource(IFRAME_SOURCE);
  }, [setAppointmentSource]);

  // const iconMap = {
  //   'online': <FaLaptop className="me-2" />,
  //   'walk-in': <FaWalking className="me-2" />,
  //   'campaign-ads': <FaBullhorn className="me-2" />,
  //   'referral': <FaUserMd className="me-2" />,
  //   'website': <FaGlobe className="me-2" />,
  // };

  // useEffect(() => {
  //   setAppointmentSource(IFRAME_SOURCE);
  // }, [setAppointmentSource]);

  const doctorOptions = doctors.map((doctor) => ({
    label: `${doctor.firstName} ${doctor.lastName}`,
    value: doctor.firstName,
    specialty: doctor.drSpeciality,
    ...doctor,
  }));

  const appointmentTypes = ['new', 'follow-up'];
  const treatmentReasons = ['consultation', 'treatment'];
  // Function to check if a date is within booking buffer range
  const isDateWithinBookingBuffer = (date) => {
    if (!selectedDoctor) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const startBufferDays = selectedDoctor.startBufferTime || 0;
    const endBufferDays = selectedDoctor.endBufferTime || 365; // Default to 1 year if not specified

    // Calculate the allowed booking range
    const minBookingDate = addDays(today, startBufferDays);
    const maxBookingDate = addDays(today, endBufferDays);

    minBookingDate.setHours(0, 0, 0, 0);
    maxBookingDate.setHours(0, 0, 0, 0);

    return selectedDate >= minBookingDate && selectedDate <= maxBookingDate;
  };

  // Function to get buffer information for display
  const getBufferInfo = () => {
    if (!selectedDoctor) return null;

    const startBufferDays = selectedDoctor.startBufferTime || 0;
    const endBufferDays = selectedDoctor.endBufferTime || 365;

    const today = new Date();
    const minDate = addDays(today, startBufferDays);
    const maxDate = addDays(today, endBufferDays);

    if (startBufferDays === 0 && endBufferDays === 365) {
      return "Booking available for all future dates";
    }

    return `Booking available from ${format(minDate, 'MMM dd, yyyy')} to ${format(maxDate, 'MMM dd, yyyy')}`;
  };

  // Function to get min and max dates for calendar
  const getCalendarRange = () => {
    if (!selectedDoctor) {
      return { minDate: new Date(), maxDate: addDays(new Date(), 365) };
    }

    const startBufferDays = selectedDoctor.startBufferTime || 0;
    const endBufferDays = selectedDoctor.endBufferTime || 365;

    return {
      minDate: addDays(new Date(), startBufferDays),
      maxDate: addDays(new Date(), endBufferDays)
    };
  };

  const timeSlots = useMemo(() => {
    if (!localDateSelected || !selectedDoctor) return [];
    // Check if selected date is within buffer
    if (!isDateWithinBookingBuffer(localDateSelected)) {
      return [];
    }
    return generateSortedTimeSlots(selectedDoctor, localDateSelected, allAppointments, appointmentMode);
  }, [selectedDoctor, localDateSelected, allAppointments, appointmentMode]);

  // const uniqueTimeSlots = [...new Set(timeSlots)];
  useEffect(() => {
    if (!selectedDoctor || !localDateSelected) {
      setActiveSlotDuration(null);
      return;
    }

    if (!selectedDoctor.availability) {
      setActiveSlotDuration(null);
      return;
    }

    const dayName = localDateSelected.toLocaleDateString('en-US', {
      weekday: 'long'
    });

    const matchedAvailability = selectedDoctor.availability.find(a =>
      !a.closed &&
      a.day.toLowerCase() === dayName.toLowerCase() &&
      (
        appointmentMode === 'video'
          ? a.is_video_time
          : a.is_clinic_time
      )
    );

    setActiveSlotDuration(matchedAvailability?.slotDuration || null);
  }, [
    selectedDoctor,
    localDateSelected,
    appointmentMode
  ]);

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
      }
    };

    loadAppointments();
  }, []);

  const handleNext = () => {
    if (localTimeSlot) setShowPatientForm(true);
  };

  const clearStepData = (stepName) => {
    switch (stepName) {
      case "apptType":
        setAppointmentType("");
        setTreatmentReason("");
        setSelectedDoctor(null);
        setLocalDateSelected(null);
        setLocalTimeSlot("");
        setShowPatientForm(false);
        break;

      case "treatmentReason":
        setTreatmentReason("");
        break;

      case "doctor":
        setAppointmentType("");
        setTreatmentReason("");
        setSelectedDoctor(null);
        setLocalDateSelected(null);
        setLocalTimeSlot("");
        setShowPatientForm(false);
        break;

      case "calendar":
        setLocalDateSelected(null);
        setLocalTimeSlot("");
        setShowPatientForm(false);
        break;

      case "patientForm":
        setShowPatientForm(false);
        break;

      default:
        break;
    }
  };

  const handleSubmitPatientForm = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!/^[0-9]{10}$/.test(patientPhone)) newErrors.patientPhone = "Valid 10-digit phone required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) newErrors.patientEmail = "Valid email required";
    if (!patientAge || patientAge < 1 || patientAge > 120) newErrors.patientAge = "Age must be between 1 and 120";

    if (!dob) {
      newErrors.dob = "Date of Birth is required";
    } else {
      const dobDate = new Date(dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of Birth cannot be in the future";
      }
    }

    if (!patientAge) {
      newErrors.patientAge = "Age is required";
    } else if (isNaN(patientAge) || parseInt(patientAge) < 0) {
      newErrors.patientAge = "Please enter a valid age";
    } else if (ageType === 'days' && parseInt(patientAge) > 365) {
      newErrors.patientAge = "Age in days cannot exceed 365";
    } else if (ageType === 'months' && parseInt(patientAge) > 240) {
      newErrors.patientAge = "Age in months cannot exceed 240 (20 years)";
    } else if (ageType === 'years' && parseInt(patientAge) > 120) {
      newErrors.patientAge = "Age in years cannot exceed 120";
    }

    if (!selectedDoctor || !localDateSelected || !localTimeSlot) {
      toast.error("Please complete all steps before submitting.");
      return;
    }

    // Check if selected date is still within buffer
    if (!isDateWithinBookingBuffer(localDateSelected)) {
      toast.error("Selected date is no longer available for booking.");
      return;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const appointmentData = {
        patientName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        dob,
        patientPhone,
        patientEmail,
        patientAge: `${patientAge} ${ageType}`,
        dateSelected: localDateSelected,
        timeSlot: localTimeSlot,
        doctor: selectedDoctor,
        source: IFRAME_SOURCE,
        appointment_type: appointmentType,
        appointmentType: appointmentType,
        clinical_reason: treatmentReason,
        appointment_mode: appointmentMode,
        status: "pending",
      };
      const result = await addAppointmentRequest(appointmentData);
      if (!result || result.error) {
        throw new Error("Backend error or failed to save appointment.");
      }
      // Instead of reload, show summary and thank you
      setAppointmentSummary({
        firstName,
        lastName,
        patientPhone,
        patientEmail,
        patientAge: `${patientAge} ${ageType}`,
        appointmentType,
        treatmentReason,
        appointmentMode,
        date: localDateSelected,
        time: localTimeSlot,
        doctor: selectedDoctor,
      });
      setSuccess(true);
      toast.success("Appointment Booked!");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  // Calendar event helpers
  let calendarLinks = null;
  if (success && appointmentSummary) {
    // Parse time robustly
    let start = parseTimeToDate(appointmentSummary.date, appointmentSummary.time);
    if (start) {
      // Default to 30 min duration
      const duration = activeSlotDuration || 30;
      let end = new Date(start.getTime() + 30 * 60000);
      const title = `Clinic Appointment with Dr. ${appointmentSummary.doctor?.firstName || ''} ${appointmentSummary.doctor?.lastName || ''}`;
      const details = `Appointment for ${appointmentSummary.patientName}. Phone: ${appointmentSummary.patientPhone}. Email: ${appointmentSummary.patientEmail}`;
      const location = appointmentSummary.appointmentMode === 'video' ? 'Video Call' : 'Clinic';
      const googleUrl = generateGoogleCalendarUrl({ title, details, location, start, end });
      const icsContent = generateICS({ title, details, location, start, end });
      const icsBlob = new Blob([icsContent], { type: 'text/calendar' });
      const icsUrl = URL.createObjectURL(icsBlob);
      calendarLinks = { googleUrl, icsUrl };
    }
  }

  // Theme classes
  const themeClass = theme === 'dark' ? 'bg-dark text-light' : theme === 'brand' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-white';
  const calendarRange = getCalendarRange();

  useEffect(() => {
    setLocalTimeSlot('');
  }, [appointmentMode, localDateSelected]);

  const handleDobChange = (e) => {
    const dobValue = e.target.value;
    setDob(dobValue);

    if (dobValue) {
      const { calculatedAge, calculatedAgeType } = calculateAgeFromDOB(dobValue);
      setLocalPatientAge(calculatedAge);
      setAgeType(calculatedAgeType);
    } else {
      // Clear age if DOB is cleared
      setLocalPatientAge("");
      setAgeType("years");
    }
  };

  const resetForm = () => {
    setStep('apptType');
    setAppointmentType('');
    setTreatmentReason('');
    setSelectedDoctor(null);
    setLocalDateSelected(null);
    setLocalTimeSlot('');
    setShowPatientForm(false);
    setFirstName('');
    setLastName('');
    setDob('');
    setLocalPatientPhone('');
    setLocalPatientEmail('');
    setLocalPatientAge('');
    setAgeType('years');
    setErrors({});
    setAppointmentSummary(null);
  };

  return (
    <div className={`booking-modern-iframe-container ${themeClass}`} style={{ background: 'unset', minHeight: '100vh', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="booking-modern-container" style={{ maxWidth: 990, width: '100%', height: 'auto', minHeight: 0, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', borderRadius: 16, overflow: 'auto', background: 'unset' }}>
        {/* Logo at top if provided */}
        {logo && (
          <div className="text-center py-3">
            <img src={logo} alt="Clinic Logo" style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }} />
          </div>
        )}
        {success && appointmentSummary ? (
          <div className="d-flex align-items-center justify-content-center w-100" style={{ minHeight: "50vh" }}>
            <div className="p-4 text-center">
              <FaCheck size={48} className="text-success mb-3" />
              <h3 className="mb-3">Thank you for booking your appointment!</h3>
              <div className="mb-3">Your appointment has been scheduled. Here are the details:</div>
              <div className="card mb-3 mx-auto" style={{ maxWidth: 400 }}>
                <div className="card-body text-start">
                  <div><strong>Patient:</strong> {appointmentSummary.firstName} {appointmentSummary.lastName}</div>
                  {appointmentSummary.dob && (
                    <div><strong>Date of Birth:</strong> {new Date(appointmentSummary.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  )}
                  <div><strong>Age:</strong> {appointmentSummary.patientAge}</div>
                  <div><strong>Phone:</strong> {appointmentSummary.patientPhone}</div>
                  <div><strong>Email:</strong> {appointmentSummary.patientEmail}</div>
                  <div><strong>Doctor:</strong> Dr. {appointmentSummary.doctor?.firstName} {appointmentSummary.doctor?.lastName}</div>
                  <div><strong>Date:</strong> {appointmentSummary.date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div><strong>Time:</strong> {appointmentSummary.time}</div>
                  <div><strong>Type:</strong> {appointmentSummary.appointmentType.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</div>
                  {appointmentSummary.treatmentReason && (
                    <div><strong>Clinical Reason:</strong> {appointmentSummary.treatmentReason.charAt(0).toUpperCase() + appointmentSummary.treatmentReason.slice(1)}</div>
                  )}
                  <div><strong>Mode:</strong> {appointmentSummary.appointmentMode === 'video' ? 'Video Call' : 'Clinic Visit'}</div>
                </div>
              </div>
              <div className=" d-flex justify-content-center mb-3">
                <a href={calendarLinks?.googleUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary me-2">
                  <FaCalendarPlus className="me-1" /> Add to Google Calendar
                </a>
                <a href={calendarLinks?.icsUrl} download="appointment.ics" className="btn btn-outline-secondary">
                  <FaCalendarPlus className="me-1" /> Add to iOS/Outlook/Other
                </a>
              </div>
              <div className="text-muted">You will also receive a reminder from the clinic if enabled.</div>
            </div>
          </div>
        ) : (
            <>
              {/* Left: Profile/Summary */}
              <div className="booking-modern-profile">
                {selectedDoctor && (
                  <div className="d-flex flex-column align-items-center text-center">
                    {selectedDoctor.profileImage ? (
                      <div className="avatar-image avatar-lg mb-2">
                        <img src={selectedDoctor.profileImage} alt={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`} className="img-fluid rounded-circle" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div className="text-white avatar-text user-avatar-text avatar-lg no-print mb-2 d-flex align-items-center justify-content-center rounded-circle bg-primary" style={{ width: '60px', height: '60px' }}>
                        {selectedDoctor.firstName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="name fw-semibold">{selectedDoctor.firstName} {selectedDoctor.lastName}</div>
                    <div className="role text-muted small mb-0">{selectedDoctor.drSpeciality}</div>
                    {selectedDoctor && (selectedDoctor.startBufferTime > 0 || selectedDoctor.endBufferTime > 0) && (
                      <div className="buffer-info mt-2 p-2 bg-light rounded small mb-2">
                        <FaInfoCircle className="text-info me-1" />
                        {getBufferInfo()}
                      </div>
                    )}
                  </div>
                )}
                {/* Always show Website as the source */}
                <div className="info-row"><FaGlobe /> Website</div>
                <div className="info-row"><FaRegClock /> {activeSlotDuration ? `${activeSlotDuration} min` : '30 min'}</div>
                {appointmentType && (
                  <div className="info-row"><FaStethoscope /> {appointmentType.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</div>
                )}
                {treatmentReason && (
                  <div className="info-row">
                    {treatmentReason === 'consultation' ? <FaNotesMedical /> : <FaFlask />}
                    {treatmentReason === 'consultation' ? ' Consultation' : ' Treatment'}
                  </div>
                )}
                {appointmentMode && (
                  <div className="info-row">
                    {appointmentMode === 'clinic' ? <FaUserMd /> : <FaVideo />}
                    {appointmentMode === 'clinic' ? ' Clinic Visit' : ' Video Call'}
                  </div>
                )}
                {localDateSelected && (
                  <div className="info-row"><FaCalendarAlt /> {localDateSelected.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                )}
                {localTimeSlot && (
                  <div className="info-row"><FaRegClock /> {localTimeSlot}</div>
                )}
                {patientName && (
                  <div className="info-row"><FaUserMd /> {patientName}</div>
                )}
                {patientPhone && (
                  <div className="info-row"><FaPhone /> {patientPhone}</div>
                )}
                {patientEmail && (
                  <div className="info-row"><FaEnvelope /> {patientEmail}</div>
                )}
                {patientAge && (
                  <div className="info-row"><FaBirthdayCake /> {patientAge}</div>
                )}
              </div>
              {/* Center: Calendar or Patient Details */}
              <div className="booking-modern-center">
                {showPatientForm ? (
                  <div className="booking-modern-center-form">
                    <div className="booking-modern-section-header-row">
                      <span className="booking-modern-section-title">Step 4: Provide Patient Details</span>
                    </div>
                    <form onSubmit={handleSubmitPatientForm}>
                      <div className="d-flex mb-2 gap-2">
                        <div>
                          <input className="form-control" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                          {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
                        </div>
                        <div>
                          <input className="form-control" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                          {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small mb-1">Date of Birth</label>
                        <input
                          type="date"
                          className={`form-control ${errors.dob ? 'is-invalid' : ''}`}
                          value={dob}
                          onChange={handleDobChange}
                          max={new Date().toISOString().split('T')[0]} // Max date is today
                        />
                        {errors.dob && <div className="text-danger small">{errors.dob}</div>}
                      </div>
                      <div className="mb-2">
                        <div className="row g-2">
                          <div className="col-8">
                            <input
                              className={`form-control ${errors.patientAge ? 'is-invalid' : ''}`}
                              type="number"
                              placeholder={ageType === 'days' ? 'Age in days' : ageType === 'months' ? 'Age in months' : 'Age in years'}
                              value={patientAge}
                              onChange={(e) => setLocalPatientAge(e.target.value)}
                              min="0"
                              max={ageType === 'days' ? "365" : ageType === 'months' ? "240" : "120"}
                            />
                            {errors.patientAge && <div className="text-danger small">{errors.patientAge}</div>}
                          </div>
                          <div className="col-4">
                            <select
                              className="form-select"
                              value={ageType}
                              onChange={(e) => setAgeType(e.target.value)}
                            >
                              <option value="years">Years</option>
                              <option value="months">Months</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                        </div>
                        <small className="text-muted">
                          {ageType === 'days'
                            ? 'For infants under 1 year'
                            : ageType === 'months'
                              ? 'For children under 12 years'
                              : 'For ages 1 year and above'
                          }
                        </small>
                      </div>
                      <input className="form-control mb-2" placeholder="Phone" value={patientPhone} onChange={(e) => setLocalPatientPhone(e.target.value)} />
                      {errors.patientPhone && <div className="text-danger small">{errors.patientPhone}</div>}
                      <input className="form-control mb-2" placeholder="Email" value={patientEmail} onChange={(e) => setLocalPatientEmail(e.target.value)} />
                      {errors.patientEmail && <div className="text-danger small">{errors.patientEmail}</div>}
                      {/* <input className="form-control mb-2" type="number" placeholder="Age" value={patientAge} onChange={(e) => setLocalPatientAge(e.target.value)} />
                      {errors.patientAge && <div className="text-danger small">{errors.patientAge}</div>} */}
                      <div className="d-flex justify-content-between mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-secondary booking-modern-btn-min"
                          onClick={() => {
                            clearStepData("patientForm");
                            setShowPatientForm(false)
                          }}
                        >
                          Back
                        </button>
                        <button type="submit" className="btn btn-primary">Submit</button>
                      </div>
                    </form>
                  </div>
                ) : step === 'calendar' ? (
                  <>
                      <div className="booking-modern-section-header-row d-flex flex-column">
                        <span className="booking-modern-section-title">Select a Date & Time</span>
                        {selectedDoctor && (selectedDoctor.startBufferTime > 0 || selectedDoctor.endBufferTime > 0) && (
                          <div className="buffer-notice small text-muted mt-1">
                            <FaInfoCircle className="me-1" />
                            {getBufferInfo()}
                          </div>
                        )}
                    </div>
                    <div className="calendar-container">
                      <Calendar
                        onChange={(date) => {
                          setLocalDateSelected(date);
                          setLocalTimeSlot('');
                          setShowPatientForm(false);
                        }}
                        value={localDateSelected}
                          minDate={calendarRange.minDate}
                          maxDate={calendarRange.maxDate}
                          tileDisabled={({ date, view }) => {
                            if (view !== 'month') return false;

                            // Disable dates outside buffer range
                            if (!isDateWithinBookingBuffer(date)) {
                              return true;
                            }

                            // Disable dates with no available slots
                            const slots = generateSortedTimeSlots(selectedDoctor, date, allAppointments);
                          return slots.length === 0;
                          }}
                          tileClassName={({ date, view }) => {
                            if (view !== 'month') return null;

                            if (!isDateWithinBookingBuffer(date)) {
                              return 'buffer-disabled';
                            }

                            return null;
                          }}
                        />
                      </div>
                      <div className="calendar-timezone"><FaGlobe /> Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                      <div className="booking-modern-back-bottom">
                        <button
                          type="button"
                          className="btn btn-outline-secondary booking-modern-btn-min"
                          onClick={() => setStep('doctor')}
                        >
                          Back
                        </button>
                      </div>
                    </>
                  ) : step === 'treatmentReason' ? (
                    <div className="booking-modern-row">
                      <div className="booking-modern-section-header-row">
                        <span className="booking-modern-section-title">Step 2: Select Clinical Reason</span>
                        <small className="text-muted">Please select the reason for your treatment appointment</small>
                      </div>
                      <div className="row">
                        {treatmentReasons.map((reason) => (
                          <div className="col-6 col-md-4 mb-3" key={reason}>
                            <button
                              className={`btn btn-outline-primary w-100 py-3 ${treatmentReason === reason ? 'active bg-primary text-white' : ''}`}
                              onClick={() => {
                                setTreatmentReason(reason);
                                setStep('doctor');
                              }}
                            >
                              <div className="d-flex flex-column align-items-center">
                                {reason === 'consultation' ? (
                                  <>
                                    <FaNotesMedical size={24} className="mb-2" />
                                    <div>Consultation</div>
                                  </>
                                ) : (
                                  <>
                                    <FaFlask size={24} className="mb-2" />
                                    <div>Treatment</div>
                                  </>
                                )}
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="booking-modern-back-bottom">
                        <button
                          type="button"
                          className="btn btn-outline-secondary booking-modern-btn-min"
                          onClick={() => {
                            clearStepData("treatmentReason");
                            setStep('apptType');
                          }}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  ) : step === 'doctor' ? (
                      // No source step, go directly to doctor step
                      <div className="booking-modern-row">
                        <div className="booking-modern-section-header-row">
                            <span className="booking-modern-section-title">
                              Step 3: Select Doctor
                            </span>
                        </div>
                        <div className="row">
                          {doctorOptions.map((doc) => (
                            <div className="col-6 col-md-4 mb-3" key={doc.value}>
                              <button
                                className={`btn btn-outline-secondary w-100 text-start p-3 ${selectedDoctor?.value === doc.value ? 'active bg-primary text-white' : ''}`}
                                onClick={() => { setSelectedDoctor(doc); setStep('calendar'); }}
                              >
                                <div className="d-flex align-items-center mb-2">
                                  {doc.profileImage ? (
                                    <div className="avatar-image avatar-md me-2">
                                      <img src={doc.profileImage} alt={doc.label} className="img-fluid rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                    </div>
                                  ) : (
                                    <div className="text-white avatar-text user-avatar-text avatar-md no-print me-2 d-flex align-items-center justify-content-center rounded-circle bg-primary" style={{ width: '40px', height: '40px' }}>
                                      {doc.label.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <strong>{doc.label}</strong>
                                    <div
                                      className={`small pt-1 ${selectedDoctor?.value === doc.value || hoveredDoctor === doc.value
                                        ? 'text-white'
                                        : 'text-muted'
                                        }`}
                                    >
                                      {doc.specialty}
                                    </div>
                                  </div>
                                  {/* {(doc.startBufferTime > 0 || doc.endBufferTime > 0) && (
                                      <div className="very-small text-muted mt-1">
                                        <FaInfoCircle className="me-1" />
                                        Booking: {doc.startBufferTime === 0 ? 'Today' : `After ${doc.startBufferTime} days`} to {doc.endBufferTime} days
                                      </div>
                                    )} */}
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="booking-modern-back-bottom">
                          <button
                            type="button"
                            className="btn btn-outline-secondary booking-modern-btn-min"
                              onClick={() => {
                                setStep('treatmentReason');
                            }}
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    ) : step === "apptType" && (
                      <div className="booking-modern-row">
                        <div className="booking-modern-section-header-row">
                          <span className="booking-modern-section-title">Step 1: Select Appointment Type</span>
                        </div>
                        <div className="row">
                          {appointmentTypes.map((type) => (
                            <div className="col-6 col-md-4 mb-3" key={type}>
                              <button
                                className={`btn btn-outline-primary w-100 py-3 ${appointmentType === type ? 'active bg-primary text-white' : ''}`}
                                onClick={() => {
                                  setAppointmentType(type);
                                  setStep('treatmentReason');
                                }}
                              >
                                {type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              </button>
                            </div>
                          ))}
                          </div>
                          {errors.appointmentType && (
                            <div className="text-danger small text-center mb-2">{errors.appointmentType}</div>
                          )}
                        </div>
                )}
              </div>
              {/* Right: Time Slots */}
              {step === 'calendar' && !showPatientForm && (
                <div className="booking-modern-times">
                  <div className="selected-date-label">
                    {localDateSelected ? localDateSelected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                    {localDateSelected && !isDateWithinBookingBuffer(localDateSelected) && (
                      <div className="text-danger small mt-1">
                        <FaInfoCircle className="me-1" />
                        This date is outside booking window
                      </div>
                    )}
                  </div>
                  {localDateSelected && (
                    <div className="appointment-mode-selection mb-4">
                      <h6 className="mb-3">Select Appointment Mode:</h6>
                      <div className="d-flex gap-3">
                        <button
                          className={`btn flex-grow-1 py-3 ${appointmentMode === 'clinic' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setAppointmentMode('clinic')}
                          type="button"
                        >
                          <FaUserMd size={13} className="me-2" />
                          Clinic Visit
                        </button>
                        <button
                          className={`btn flex-grow-1 py-3 ${appointmentMode === 'video' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setAppointmentMode('video')}
                          type="button"
                        >
                          <FaVideo size={13} className="me-2" />
                          Video Call
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="overflow-auto w-100" style={{ maxHeight: '500px' }}>
                    {localDateSelected && isDateWithinBookingBuffer(localDateSelected) ? (
                      timeSlots.length > 0 ? (
                        timeSlots.map(({ dateObj, label, disabled }) => {
                          const slotDate = new Date(localDateSelected);
                          slotDate.setHours(dateObj.getHours(), dateObj.getMinutes(), 0, 0);

                          const now = new Date();
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const selectedDay = new Date(localDateSelected);
                          selectedDay.setHours(0, 0, 0, 0);

                          let isPast = false;

                          if (selectedDay < today) {
                            isPast = true;
                          } else if (selectedDay.getTime() === today.getTime()) {
                            isPast = slotDate.getTime() <= now.getTime();
                          }

                          const finalDisabled = isPast || disabled;

                          return (
                            <div key={label} className="d-flex align-items-center mb-2 gap-2">
                              <button
                                className={`btn flex-grow-1 time-slot-btn 
                                ${localTimeSlot === label ? "btn-primary" : "btn-outline-primary"} 
                                ${finalDisabled ? "btn-secondary disabled" : ""}`}
                                onClick={() => !finalDisabled && setLocalTimeSlot(label)}
                                type="button"
                                disabled={finalDisabled}
                                title={disabled ? "This slot is fully booked" : isPast ? "This slot has passed" : ""}
                              >
                                {label}
                                {disabled && <span className="badge bg-danger ms-1">Full</span>}
                              </button>
                              {localTimeSlot === label && !finalDisabled && (
                                <button
                                  className="btn btn-success booking-modern-confirm-btn d-flex align-items-center gap-1 ms-0"
                                  onClick={handleNext}
                                  type="button"
                                >
                                  <span className="booking-modern-confirm-icon"><FaCheck /></span>
                                  Confirm
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-muted">
                          <FaCalendarAlt size={32} className="mb-2" />
                          <div>No available time slots</div>
                          <small>Doctor is not available on this date</small>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <FaCalendarAlt size={32} className="mb-2" />
                        <div>Date not available</div>
                        <small>Selected date is outside booking window</small>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
        )}
      </div>
    </div>
  );
};

export default AppointmentsBookIframe; 