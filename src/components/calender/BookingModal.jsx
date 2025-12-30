import React, { useMemo, useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import Calendar from 'react-calendar';
import { FaUserMd, FaBullhorn, FaWalking, FaLaptop, FaRegClock, FaVideo, FaGlobe, FaCheck, FaCalendarAlt, FaPhone, FaEnvelope, FaBirthdayCake, FaInfoCircle, FaNotesMedical, FaFlask } from 'react-icons/fa';
import { HiGlobeAmericas } from "react-icons/hi2";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from 'react-toastify';
import { useBooking } from '../../contentApi/BookingProvider';
import { generateSortedTimeSlots } from '../../utils/generatedTimeSlots';
import ReactSelect from "react-select";
import { usePatient } from '../../context/PatientContext';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { useAuth } from '../../contentApi/AuthContext';
import './BookingModal.css';

const BookingModal = ({ onClose, selectedDate, skipToCalendar }) => {
  const {
    setAppointmentSource,
    selectedDoctor,
    setSelectedDoctor,
    doctors,
    addBookingRequest,
    fetchAppointments,
    appointmentType,
    setAppointmentType,
  } = useBooking();

  const { patients } = usePatient();
  const { user, role } = useAuth();
  const [step, setStep] = useState('source');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [localDateSelected, setLocalDateSelected] = useState(selectedDate ? new Date(selectedDate) : null);
  const [localTimeSlot, setLocalTimeSlot] = useState('');
  const [showPatientForm, setShowPatientForm] = useState(false);
  // const [patientName, setLocalPatientName] = useState('');
  const [patientPhone, setLocalPatientPhone] = useState('');
  const [patientEmail, setLocalPatientEmail] = useState('');
  const [patientAge, setLocalPatientAge] = useState('');
  const [dob, setDob] = useState('');
  const [ageType, setAgeType] = useState('years');
  const [errors, setErrors] = useState({});
  const [existingPatientMode, setExistingPatientMode] = useState(true);
  const [detectedCountryCode, setDetectedCountryCode] = useState(''); // "IN"
  const [detectedTz, setDetectedTz] = useState("");
  const [tzError, setTzError] = useState('');
  const [detectedCountry, setDetectedCountry] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [tzLoading, setTzLoading] = useState(true);
  const [referralName, setReferralName] = useState('');
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [patientNotes, setPatientNotes] = useState('');
  const [selectedExistingPatient, setSelectedExistingPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [hoveredDoctor, setHoveredDoctor] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedReferralUser, setSelectedReferralUser] = useState(null);
  const [customReferralName, setCustomReferralName] = useState(null);
  const [appointmentMode, setAppointmentMode] = useState('clinic');
  const [activeSlotDuration, setActiveSlotDuration] = useState(null);
  const [clinicalReason, setClinicalReason] = useState('');

  useEffect(() => {
    if (role?.toLowerCase() === 'doctor' && user?.id && doctors.length > 0) {
      const loggedInDoctor = doctors.find(doc =>
        String(doc.id) === String(user.id) ||
        String(doc.id) === String(user.doctorId)
      );

      if (loggedInDoctor) {
        const doctorOption = {
          label: `${loggedInDoctor.firstName} ${loggedInDoctor.lastName}`,
          value: loggedInDoctor.firstName,
          specialty: loggedInDoctor.drSpeciality,
          ...loggedInDoctor,
        };

        setSelectedDoctor(doctorOption);
        console.log("Auto-selected logged-in doctor:", doctorOption);
      }
    }
  }, [doctors, user, role]);

  useEffect(() => {
    let didCancel = false;

    async function loadTimezone() {
      setTzLoading(true);
      setTzError('');
      try {
        // NOTE: this will be blocked on HTTPS without a proxy / server-side fetch
        const res = await fetch('http://ip-api.com/json/');
        if (!res.ok) throw new Error('Failed to fetch timezone');
        const data = await res.json();
        if (!didCancel) {
          setDetectedTz(data.timezone || '');
          setDetectedCountry(data.country || '');
          setDetectedCountryCode(data.countryCode || '');
          setSelectedTimezone(data.timezone || '');
        }
      } catch (err) {
        if (!didCancel) setTzError('Could not detect timezone automatically.');
      } finally {
        if (!didCancel) setTzLoading(false);
      }
    }

    loadTimezone();
    return () => { didCancel = true; };
  }, [])

  // Initialize date when modal opens with selectedDate
  // useEffect(() => {
  //   if (selectedDate) {
  //     const date = new Date(selectedDate);
  //     setLocalDateSelected(date);
  //     // Auto-advance to calendar step if date is pre-selected and doctor is selected
  //     if (skipToCalendar && selectedDoctor) {
  //       setStep('calendar');
  //     } else {
  //       setStep('source');
  //     }
  //   }
  // }, [selectedDate, selectedDoctor]);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setLocalDateSelected(date);

      // 👇 Instead of skipping, reset to step "source" every time modal opens
      setStep('source');
    }
  }, [selectedDate]);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await fetch('https://bkdemo1.clinicpro.cc/appointment/appointments-list');
        if (!response.ok) throw new Error("Failed to fetch appointments");
        let data = await response.json();

        // Filter by role if doctor
        if (role?.toLowerCase() === 'doctor') {
          data = data.filter(
            appt => String(appt.doctor?.id || appt.doctor_id) === String(user?.id)
          );
        }

        setAllAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    loadAppointments();
  }, [role, user]);

  // Clears steps data when click on back button
  const clearStepData = (stepName) => {
    switch (stepName) {
      case "apptType":
        setSelectedSource("");
        setAppointmentSource("");
        setAppointmentType("");
        setClinicalReason("");
        if (!(role?.toLowerCase() === 'doctor' && user?.id)) {
          setSelectedDoctor(null);
        }
        setLocalDateSelected(null);
        setLocalTimeSlot("");
        setShowPatientForm(false);
        break;

      case "clinicalReason":
        setClinicalReason("");
        break;

      case "doctor":
        setAppointmentType("");
        setClinicalReason("");
        if (!(role?.toLowerCase() === 'doctor' && user?.id)) {
          setSelectedDoctor(null);
        }
        setLocalDateSelected(null);
        setLocalTimeSlot("");
        setShowPatientForm(false);
        break;

      case "calendar":
        setLocalDateSelected(null);
        setLocalTimeSlot("");
        setShowPatientForm(false);
        setAppointmentMode('clinic');
        break;

      case "source":
        setSelectedSource("");
        setAppointmentSource("");
        setAppointmentType("");
        setClinicalReason("");
        if (!(role?.toLowerCase() === 'doctor' && user?.id)) {
          setSelectedDoctor(null);
        }
        setLocalDateSelected(null);
        setLocalTimeSlot("");
        setShowPatientForm(false);
        setAppointmentMode('clinic');
        break;

      case "patientForm":
        setFirstName("");
        setLastName("");
        setLocalPatientPhone("");
        setLocalPatientEmail("");
        setLocalPatientAge("");
        setDob("");
        setAgeType("years");
        setReferralName("");
        setPatientNotes("");
        setSelectedExistingPatient(null);
        setSelectedReferralUser(null);
        setCustomReferralName("");
        setPatientAppointments([]);
        setAppointmentMode('clinic');
        setErrors({});
        break;

      default:
        break;
    }
  };

  // Define appointment types based on selected source
  const appointmentTypes = useMemo(() => {
    const allTypes = ['new', 'follow-up'];

    // Hide follow-up for walk-in, campaign-ads, and referral sources
    if (['walk-in', 'campaign-ads', 'referral'].includes(selectedSource)) {
      return allTypes.filter(type => type !== 'follow-up');
    }

    return allTypes;
  }, [selectedSource]);

  const clinicalReasons = ['consultation', 'treatment'];

  // Check if current source is referral
  const isReferralSource = selectedSource === 'referral';

  // const doctorOptions = doctors.map((doctor) => ({
  //   label: `${doctor.firstName} ${doctor.lastName}`,
  //   value: doctor.firstName,
  //   specialty: doctor.drSpeciality,
  //   ...doctor,
  // }));

  const doctorOptions = useMemo(() => {
    let list = doctors;
    // if (role?.toLowerCase() === 'doctor' && user?.id) {
    //   list = doctors.filter(d => String(d.id) === String(user.id));
    // }
    return list.map((doctor) => ({
      label: `${doctor.firstName} ${doctor.lastName}`,
      value: doctor.firstName,
      specialty: doctor.drSpeciality,
      ...doctor,
    }));
  }, [doctors, role, user]);


  const patientOptions = patients.map(p => ({
    label: `#${p.id}  ${p.name} - ${p.age} - ${p.contact} `,
    value: p.id,
    rawPatient: p,
  }));

  // Fetch users list for referral dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with your actual API endpoint to fetch users
        const response = await fetch('https://bkdemo1.clinicpro.cc/users/user-list');
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        // If API fails, you can set some default users or leave empty
        setUsers([]);
      }
    };

    if (isReferralSource) {
      fetchUsers();
    }
  }, [isReferralSource]);

  // Prepare user options for referral dropdown
  const userOptions = useMemo(() => {
    return users.map(user => ({
      label: `${user.firstName} ${user.lastName} - ${user.email || user.phone || ''}`,
      value: user.id,
      rawUser: user,
    }));
  }, [users]);

  // Handle referral user selection
  const handleReferralUserSelect = (selectedOption) => {
    setSelectedReferralUser(selectedOption);
    if (selectedOption) {
      setReferralName(selectedOption.rawUser.firstName + ' ' + selectedOption.rawUser.lastName);
      setCustomReferralName('');
    } else {
      setReferralName('');
    }
  };

  // Handle custom referral name input
  const handleCustomReferralNameChange = (e) => {
    setCustomReferralName(e.target.value);
    setReferralName(e.target.value);
    setSelectedReferralUser(null);
  };

  const isNoDoctor = () => {
    return selectedDoctor && (selectedDoctor.firstName === "No Doctor" || selectedDoctor.label === "No Doctor" || selectedDoctor.id === 111);
  };

  // Function to check if a date is within booking buffer range
  const isDateWithinBookingBuffer = (date) => {
    if (!selectedDoctor) return false;
    if (isNoDoctor()) return true;

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

    if (isNoDoctor()) {
      return "All dates and time slots available";
    }

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

    if (isNoDoctor()) {
      return {
        minDate: new Date(),
        maxDate: addDays(new Date(), 365)
      };
    }

    const startBufferDays = selectedDoctor.startBufferTime || 0;
    const endBufferDays = selectedDoctor.endBufferTime || 365;

    return {
      minDate: addDays(new Date(), startBufferDays),
      maxDate: addDays(new Date(), endBufferDays)
    };
  };

  // Time slots with buffer consideration
  const timeSlots = useMemo(() => {
    if (!localDateSelected || !selectedDoctor) return [];

    // Check if selected date is within buffer
    if (!isDateWithinBookingBuffer(localDateSelected)) {
      return [];
    }

    return generateSortedTimeSlots(selectedDoctor, localDateSelected, allAppointments, appointmentMode);
  }, [selectedDoctor, localDateSelected, allAppointments, appointmentMode]);

  // const timeSlots = useMemo(() => {
  //   return localDateSelected ? generateSortedTimeSlots(selectedDoctor, localDateSelected) : [];
  // }, [selectedDoctor, localDateSelected]);

  // const uniqueTimeSlots = [...new Set(timeSlots)];

  // Update active slot duration
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
  }, [selectedDoctor, localDateSelected, appointmentMode]);


  const iconMap = {
    'online': <FaLaptop className="me-2" />,
    'walk-in': <FaWalking className="me-2" />,
    'campaign-ads': <FaBullhorn className="me-2" />,
    'referral': <FaUserMd className="me-2" />,
  };

  const handleNext = () => {
    if (localTimeSlot) setShowPatientForm(true);
  };

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

  // Function to fetch patient appointments
  const fetchPatientAppointments = (patientId) => {
    if (!patientId) {
      setPatientAppointments([]);
      return;
    }

    setLoadingAppointments(true);
    try {
      const filteredAppointments = allAppointments.filter(
        appointment => appointment.patient.id === patientId
      );

      const sortedAppointments = filteredAppointments.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      setPatientAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error filtering patient appointments:', error);
      setPatientAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Add the email generator function in the component
  const generateEmail = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.warning("Please enter both first name and last name first to generate email.");
      return;
    }

    const first = firstName.trim();
    const last = lastName.trim();

    const randomNum = Math.floor(10 + Math.random() * 90);
    const email = `${first.toLowerCase()}${last.toLowerCase()}${randomNum}@clinicpro.cc`;

    setLocalPatientEmail(email);

    if (errors.patientEmail) {
      setErrors(prev => ({ ...prev, patientEmail: '' }));
    }

    toast.success("Email generated successfully!");
  };

  // Function to calculate age from date of birth
  const calculateAgeFromDOB = (dobValue) => {
    if (!dobValue) {
      setLocalPatientAge("");
      setAgeType("years");
      return;
    }

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

    setLocalPatientAge(calculatedAge);
    setAgeType(calculatedAgeType);
  };

  const handleSelectPatient = (selected) => {
    if (!selected) {
      setSelectedExistingPatient(null);
      setPatientAppointments([]);
      return;
    }
    const patient = selected.rawPatient;
    setSelectedExistingPatient(patient);

    if (existingPatientMode) {
      // ✅ fill patient details automatically
      setFirstName(patient.raw?.user?.firstName || patient.name.split(" ")[0] || "");
      setLastName(patient.raw?.user?.lastName || patient.name.split(" ")[1] || "");
      setLocalPatientPhone(patient.contact || "");
      setLocalPatientEmail(patient.email || "");

      if (patient.age) {
        const ageStr = String(patient.age).trim().toLowerCase();
        const match = ageStr.match(/(\d+)\s*(years|months|days)?/i);

        if (match) {
          setLocalPatientAge(match[1]); // Just the number
          setAgeType(match[2]?.toLowerCase() || 'years'); // The unit
        } else {
          setLocalPatientAge('');
          setAgeType('years');
        }
      } else {
        setLocalPatientAge('');
        setAgeType('years');
      }

      // If patient has DOB data, calculate age from it
      if (patient.dob) {
        setDob(patient.dob);
        calculateAgeFromDOB(patient.dob);
      } else {
        setDob("");
      }

      fetchPatientAppointments(patient.id);
    }
  };

  // Function to format appointment status with badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'bg-success', text: 'Completed' },
      done: { class: 'bg-success', text: 'Done' },
      approved: { class: 'bg-primary', text: 'Approved' },
      pending: { class: 'bg-warning', text: 'Pending' },
      rejected: { class: 'bg-danger', text: 'Rejected' },
      edited: { class: 'bg-info', text: 'Edited' }
    };

    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class} text-white`}>{config.text}</span>;
  };

  // Function to format appointment type
  const formatAppointmentType = (type) => {
    if (!type) return '—';
    return type.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Function to format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleSubmitPatientForm = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!/^[0-9]{10}$/.test(patientPhone)) newErrors.patientPhone = "Valid 10-digit phone required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) newErrors.patientEmail = "Valid email required";
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

    if (!clinicalReason) {
      newErrors.clinicalReason = "Please select a clinical reason";
    }

    // Validate referral name for referral source
    if (isReferralSource && !referralName.trim()) {
      newErrors.referralName = "Referral name is required";
    }

    if (!appointmentMode) {
      newErrors.appointmentMode = "Please select appointment mode";
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
        patientPhone,
        patientEmail,
        patientAge: `${patientAge} ${ageType}`,
        dob: dob,
        notes: patientNotes,
        dateSelected: localDateSelected,
        timeSlot: localTimeSlot,
        doctor: selectedDoctor,
        source: selectedSource,
        appointment_type: appointmentType,
        clinical_reason: clinicalReason,
        appointment_mode: appointmentMode,
        referral_name: selectedSource === "referral" ? referralName : null,
        status: "approved",
      };
      console.log("🚀 Submitting New Patient Appointment:", appointmentData);
      const result = await addBookingRequest(appointmentData);
      if (!result || result.error) {
        throw new Error("Backend error or failed to save appointment.");
      }

      toast.success("Appointment Booked!");
      onClose();
    } catch (error) {
      console.error("Booking failed:", error);
      if (user.role === "super_admin") {
        toast.error("Failed to book appointment. Please try again.");
      }
    }
  };

  {
    appointmentMode && (
      <div className="info-row">
        {appointmentMode === 'clinic' ? <FaUserMd /> : <FaVideo />}
        {appointmentMode === 'clinic' ? ' Clinic Visit' : ' Video Call'}
      </div>
    )
  }

  const calendarRange = getCalendarRange();
  const patientName = `${firstName} ${lastName}`.trim();

  const renderStepContent = () => {
    switch (step) {
      case 'source':
        return (
          <div className="booking-step">
            <h4 className="booking-step-title">Step 1: Select Appointment Source</h4>
            <div className="booking-options-grid">
              {['online', 'walk-in', 'campaign-ads', 'referral'].map((src) => (
                <button
                  key={src}
                  className={`booking-option-btn ${selectedSource === src ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSource(src);
                    setAppointmentSource(src);
                    setStep('apptType');
                  }}
                >
                  {iconMap[src]} {src.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        );

      case 'apptType':
        return (
          <div className="booking-step">
            <h4 className="booking-step-title">Step 2: Select Appointment Type</h4>
            <div className="booking-options-grid">
              {appointmentTypes.map((type) => (
                <button
                  key={type}
                  className={`booking-option-btn ${appointmentType === type ? 'active' : ''}`}
                  onClick={() => {
                    setAppointmentType(type);
                    setStep('clinicalReason');
                  }}
                >
                  {type.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
            <button
              className="btn btn-outline-secondary btn-sm mt-3"
              onClick={() => {
                clearStepData("apptType");
                setStep('source');
              }}
            >
              Back
            </button>
          </div>
        );

      case 'clinicalReason':
        return (
          <div className="booking-step">
            <h4 className="booking-step-title">Step 3: Select Clinical Reason</h4>
            <div className="booking-options-grid">
              {clinicalReasons.map((reason) => (
                <button
                  key={reason}
                  className={`booking-option-btn ${clinicalReason === reason ? 'active' : ''}`}
                  onClick={() => {
                    setClinicalReason(reason);
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
              ))}
            </div>
            <button
              className="btn btn-outline-secondary btn-sm mt-3"
              onClick={() => {
                clearStepData("clinicalReason");
                setStep('apptType');
              }}
            >
              Back
            </button>
          </div>
        );

      case 'doctor':
        return (
          <div className="booking-step">
            <h4 className="booking-step-title">Step 4: Select Doctor</h4>
            <div className="booking-doctors-grid">
              {doctorOptions.map((doc) => (
                <button
                  key={doc.value}
                  className={`booking-doctor-btn ${selectedDoctor?.value === doc.value ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setStep('calendar');
                  }}
                  onMouseEnter={() => setHoveredDoctor(doc.value)}
                  onMouseLeave={() => setHoveredDoctor(null)}
                >
                  <div className="d-flex align-items-center mb-2">
                    {doc.profileImage ? (
                      <div className="avatar-image avatar-md me-2">
                        <img
                          src={doc.profileImage}
                          alt={doc.label}
                          className="img-fluid rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div className="text-white avatar-text user-avatar-text avatar-md no-print me-2 d-flex align-items-center justify-content-center rounded-circle bg-primary"
                        style={{ width: '40px', height: '40px' }}>
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
                      {/* {(doc.startBufferTime > 0 || doc.endBufferTime > 0) && (
                        <div className="very-small text-muted mt-1">
                          <FaInfoCircle className="me-1" />
                          Booking: After {doc.startBufferTime} days, Up to {doc.endBufferTime} days
                        </div>
                      )} */}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-outline-secondary btn-sm mt-3"
              onClick={() => {
                clearStepData("doctor");
                setStep('clinicalReason');
              }}>
              Back
            </button>
          </div>
        );

      case 'calendar':
        const calendarRange = getCalendarRange();
        return (
          <div className="booking-step">
            <h4 className="booking-step-title">Step 5: Select Date & Time</h4>
            {selectedDate && (
              <div className="booking-pre-selected-date">
                <FaCalendarAlt /> Date pre-selected from calendar: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            )}
            {/* Buffer Info */}
            {selectedDoctor && (selectedDoctor.startBufferTime > 0 || selectedDoctor.endBufferTime > 0) && (
              <div className="buffer-info mt-2 p-2 bg-light rounded small mb-3">
                <FaInfoCircle className="text-info me-1" />
                {getBufferInfo()}
              </div>
            )}
            <div className="booking-calendar-container">
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
                  const slots = generateSortedTimeSlots(selectedDoctor, date, allAppointments, appointmentMode);
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
            <div className="calendar-timezone">
              <HiGlobeAmericas className='fs-5' />
              <p className='mb-0'>Time zone</p>
              <select
                className="form-select form-select-sm border-0 shadow-none"
                style={{ maxWidth: 200, outline: "none", boxShadow: "none" }}
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
              >
                {/* Detected timezone as first option */}
                {detectedTz && (
                  <option value={detectedTz}>
                    {detectedTz} {detectedCountry ? `— ${detectedCountry}` : ''}
                  </option>
                )}
                {/* <option value="America/New_York">America/New_York — United States</option>
                      <option value="America/Chicago">America/Chicago — United States</option>
                      <option value="America/Denver">America/Denver — United States</option>
                      <option value="America/Los_Angeles">America/Los_Angeles — United States</option>
                      <option value="Europe/London">Europe/London — United Kingdom</option>
                      <option value="Europe/Berlin">Europe/Berlin — Germany</option>
                      <option value="Europe/Paris">Europe/Paris — France</option>
                      <option value="Asia/Kolkata">Asia/Kolkata — India</option>
                      <option value="Asia/Dubai">Asia/Dubai — UAE</option>
                      <option value="Asia/Singapore">Asia/Singapore — Singapore</option>
                      <option value="Australia/Sydney">Australia/Sydney — Australia</option> */}
              </select>
            </div>
            <button className="btn btn-outline-secondary btn-sm mt-3"
              onClick={() => {
                clearStepData("calendar");
                setStep('doctor');
              }}>
              Back
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h3>Book Appointment</h3>
          <button className="booking-modal-close" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>

        <div className="booking-modal-body">
          {/* Left: Summary */}
          <div className="booking-summary">
            {selectedDoctor && (
              <div className="d-flex flex-column align-items-center text-center">
                {selectedDoctor.profileImage ? (
                  <div className="avatar-image avatar-lg mb-2">
                    <img
                      src={selectedDoctor.profileImage}
                      alt={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      className="img-fluid rounded-circle"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div
                    className="text-white avatar-text user-avatar-text avatar-lg no-print mb-2 d-flex align-items-center justify-content-center rounded-circle bg-primary"
                    style={{ width: '60px', height: '60px' }}
                  >
                    {selectedDoctor.firstName?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="name fw-semibold">
                  {selectedDoctor.firstName} {selectedDoctor.lastName}
                </div>
                <div className="role text-muted small">
                  {selectedDoctor.drSpeciality}
                </div>
                {/* Buffer Info in Summary */}
                {selectedDoctor && (selectedDoctor.startBufferTime > 0 || selectedDoctor.endBufferTime > 0) && (
                  <div className="buffer-info mt-2 p-2 bg-light rounded small">
                    <FaInfoCircle className="text-info me-1" />
                    {getBufferInfo()}
                  </div>
                )}
              </div>
            )}
            {selectedSource && (
              <div className="summary-info"><FaLaptop /> {selectedSource.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
            )}
            {appointmentType && (
              <div className="summary-info">
                <FaRegClock /> {appointmentType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
            )}
            {clinicalReason && (
              <div className="summary-info">
                {clinicalReason === 'consultation' ? <FaNotesMedical /> : <FaFlask />}
                {clinicalReason === 'consultation' ? ' Consultation' : ' Treatment'}
              </div>
            )}
            {appointmentMode && (
              <div className="summary-info">
                {appointmentMode === 'clinic' ? <FaUserMd /> : <FaVideo />}
                {appointmentMode === 'clinic' ? ' Clinic Visit' : ' Video Call'}
              </div>
            )}
            <div className="summary-info"><FaRegClock /> 30 min</div>
            {localDateSelected && (
              <div className="summary-info"><FaCalendarAlt /> {localDateSelected.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
            )}
            {localTimeSlot && (
              <div className="summary-info"><FaRegClock /> {localTimeSlot}</div>
            )}
            {patientName && (
              <div className="summary-info"><FaUserMd /> {patientName}</div>
            )}
            {patientPhone && (
              <div className="summary-info"><FaPhone /> {patientPhone}</div>
            )}
            {patientEmail && (
              <div className="summary-info"><FaEnvelope /> {patientEmail}</div>
            )}
            {patientAge && (
              <div className="summary-info"><FaBirthdayCake /> {patientAge}</div>
            )}
          </div>

          {/* Center: Main Content */}
          <div className="booking-content">
            {showPatientForm ? (
              <div className="booking-modern-center-form">
                <div className="booking-modern-section-header-row">
                  <span className="booking-modern-section-title">Step 6: Provide Patient Details</span>
                </div>
                <div className="d-flex gap-2 mb-3">
                  {!isReferralSource && (
                    <button
                      type="button"
                      className={`btn btn-sm ${existingPatientMode ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setExistingPatientMode(true)}
                    >
                      Select Existing
                    </button>
                  )}
                  <button
                    type="button"
                    className={`btn btn-sm ${!existingPatientMode ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setExistingPatientMode(false)}
                  >
                    Add New
                  </button>
                </div>
                <form onSubmit={handleSubmitPatientForm}>
                  {!isReferralSource && existingPatientMode ? (
                    <>
                      <div className="mb-3">
                        <ReactSelect
                          options={patientOptions}
                          onChange={handleSelectPatient}
                          placeholder="Select patient..."
                          menuPortalTarget={document.body}   // 👈 renders outside modal
                          styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }) // keep it on top
                          }}
                        />
                      </div>
                      {selectedExistingPatient && (
                        <>
                          <textarea
                            className="form-control mb-2"
                            placeholder="Add appointment notes (optional)"
                            value={patientNotes}
                            onChange={(e) => setPatientNotes(e.target.value)}
                            rows={3}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="d-flex mb-2 gap-2">
                        <div>
                          <input
                            className="form-control"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                          {errors.firstName && <div className="text-danger small">{errors.firstName}</div>}
                        </div>
                        <div>
                          <input
                            className="form-control"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                          {errors.lastName && <div className="text-danger small">{errors.lastName}</div>}
                        </div>
                      </div>
                        {/* {selectedSource === "referral" && (
                          <input
                            className="form-control mb-2"
                            placeholder="Referral Name"
                            value={referralName}
                            onChange={(e) => setReferralName(e.target.value)}
                          />
                        )} */}
                        {isReferralSource && (
                          <div className="mb-3">
                            <div className="mb-2">
                              <label className="form-label small text-muted">Select from existing users</label>
                              <ReactSelect
                                options={userOptions}
                                onChange={handleReferralUserSelect}
                                value={selectedReferralUser}
                                placeholder="Select referring user..."
                                isClearable
                              />
                            </div>

                            {/* Custom Referral Input */}
                            <div>
                              <label className="form-label small text-muted">Or enter custom referral name</label>
                              <input
                                className={`form-control ${errors.referralName ? 'is-invalid' : ''}`}
                                placeholder="Enter referral name"
                                value={customReferralName}
                                onChange={handleCustomReferralNameChange}
                                disabled={!!selectedReferralUser}
                              />
                              {errors.referralName && <div className="text-danger small">{errors.referralName}</div>}
                            </div>
                          </div>
                        )}
                        <input
                          className="form-control mb-2"
                          placeholder="Phone"
                          value={patientPhone}
                          onChange={(e) => setLocalPatientPhone(e.target.value)}
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        {errors.patientPhone && <div className="text-danger small">{errors.patientPhone}</div>}
                        {/* <input
                          className="form-control mb-2"
                          placeholder="Email"
                          value={patientEmail}
                          onChange={(e) => setLocalPatientEmail(e.target.value)}
                        />
                        {errors.patientEmail && <div className="text-danger small">{errors.patientEmail}</div>} */}
                        <div className="mb-2">
                          <div className="input-group">
                            <input
                              className={`form-control ${errors.patientEmail ? 'is-invalid' : ''}`}
                              placeholder="Enter email address"
                              value={patientEmail}
                              onChange={(e) => setLocalPatientEmail(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={generateEmail}
                              title="Generate email from name"
                              disabled={!firstName.trim() || !lastName.trim()}
                            >
                              <FiRefreshCw size={14} />
                            </button>
                            {errors.patientEmail && (
                              <div className="invalid-feedback">{errors.patientEmail}</div>
                            )}
                          </div>
                          <small className="text-muted">
                            Click the refresh button to generate email from name
                          </small>
                        </div>
                        {/* DOB-based Age Calculation */}
                        <div className="mb-2">
                          <label className="form-label small text-muted">Date of Birth</label>
                          <input
                            type="date"
                            className="form-control"
                            value={dob}
                            onChange={(e) => {
                              const dobValue = e.target.value;
                              setDob(dobValue);
                              calculateAgeFromDOB(dobValue);
                            }}
                            max={new Date().toISOString().split('T')[0]} // Prevent future dates
                          />
                          <small className="text-muted">
                            Enter date of birth to automatically calculate age
                          </small>
                        </div>
                        {/* Age Display and Type Selection */}
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
                      <textarea className="form-control mb-2" placeholder="Notes (optional)" value={patientNotes} onChange={(e) => setPatientNotes(e.target.value)} rows={3} />
                    </>
                  )}

                  <div className="d-flex justify-content-between mt-3 pb-5">
                    <button
                      type="button"
                      className="btn btn-outline-secondary booking-modern-btn-min"
                      onClick={() => {
                        clearStepData("patientForm");
                        setShowPatientForm(false);
                      }}
                    >
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {renderStepContent()}

                {/* Time Slots (when on calendar step) */}
                {step === 'calendar' && (
                  <div className="booking-timeslots">
                    <div className="timeslots-header">
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
                          {errors.appointmentMode && (
                            <div className="text-danger small mt-2">{errors.appointmentMode}</div>
                          )}
                        </div>
                      )}
                    <div className="timeslots-list">
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
                        {/* Patient Appointment History */}
                        {showPatientForm && selectedExistingPatient && (
                          <div className="booking-modern-patient-appointments p-3">
                            <div className="selected-date-label d-flex align-items-center pb-2">
                              <FaHistory className="me-2" />
                              Patient Appointment History
                              <span className="badge bg-primary ms-2">{patientAppointments.length}</span>
                            </div>
                            <div className="overflow-auto w-100" style={{ maxHeight: '500px' }}>
                              {loadingAppointments ? (
                                <div className="text-center py-4">
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  <div className="mt-2">Loading appointments...</div>
                                </div>
                              ) : patientAppointments.length > 0 ? (
                                patientAppointments.map((appointment) => (
                                  <div key={appointment.id} className="appointment-history-card mb-3 p-3 border rounded">
                                    <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                                      <div className="fw-semibold">
                                        <FaStethoscope className="me-2 text-muted" />
                                        {appointment.doctor.firstName} {appointment.doctor.lastName}
                                      </div>
                                      {getStatusBadge(appointment.status)}
                                    </div>
                                    <div className="mb-2">
                                      <FaCalendarAlt className="me-2 text-muted" />
                                      <span className="fw-medium">{formatDisplayDate(appointment.date)}</span>
                                      <span className="text-muted mx-2">•</span>
                                      <span>{appointment.time}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span className={`badge ${appointment.appointment_type === 'new' ? 'bg-primary' :
                                        appointment.appointment_type === 'follow-up' ? 'bg-success' :
                                          appointment.appointment_type === 'treatment' ? 'bg-info' :
                                            'bg-secondary'
                                        } text-white`}>
                                        {formatAppointmentType(appointment.appointment_type)}
                                      </span>
                                      <small className="text-muted">
                                        Source: {appointment.source}
                                      </small>
                                    </div>
                                    {appointment.notes && (
                                      <div className="mt-2">
                                        <small className="text-muted">Notes: {appointment.notes}</small>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  <FaHistory size={32} className="mb-2" />
                                  <div>No previous appointments found</div>
                                  <small>This patient has no appointment history</small>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal; 