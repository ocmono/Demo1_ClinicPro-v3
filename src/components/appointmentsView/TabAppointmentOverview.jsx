import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Table from '@/components/shared/table/Table'
import { useAppointments } from '../../context/AppointmentContext'
import { useBooking } from '../../contentApi/BookingProvider'
import { usePatient } from '../../context/PatientContext'
import { useAuth } from '../../contentApi/AuthContext'
import { FiEdit3, FiUser, FiFilter, FiX, FiFileText, FiCheck, FiRefreshCw, FiMoreHorizontal } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown';
import { fetchWithAuth } from '@/utils/apiErrorHandler';
import { FaWhatsapp, FaVideo } from 'react-icons/fa';
import Calendar from 'react-calendar'
import './AppointmentCalendar.css'
import 'react-calendar/dist/Calendar.css'
import { toast } from 'react-toastify'
import EditAppointmentModal from './EditAppointmentModal'

const TabAppointmentOverview = () => {
    const { appointments, patientAppointments, updateAppointment, fetchAppointments, fetchAppointmentsByPatient, clearPatientAppointments, updateStatus } = useAppointments();
    console.log('appointments========================', appointments);
    const { doctors } = useBooking();
    const { user, role, hasRole, isAuthenticated, doctorId, doctorName } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: '',
        time: '',
        doctor_id: '',
        type: '',
        status: '',
        source: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
    const [tableKey, setTableKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [patientDetails, setPatientDetails] = useState({});
    const [dateTimeSettings, setDateTimeSettings] = useState({
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'Asia/Calcutta'
    });


    const patientIdFromUrl = searchParams.get('patient_id');
    const [filteredByPatient, setFilteredByPatient] = useState('');
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [videoLinks, setVideoLinks] = useState({
        startUrl: "",
        joinUrl: ""
    });
    const [videoLoading, setVideoLoading] = useState(false);
    const [activeVideoAppointmentId, setActiveVideoAppointmentId] = useState(null);

    const appointmentTypes = ["follow-up", "treatment", "new"];
    const statusOptions = ["done", "approved", "rejected", "pending"]
    const sourceOptions = ["online", "walk-in", "campaign-ads", "referral", "website"]

    // Role-based access control
    const isDoctor = role === 'doctor';
    const isAdmin = role === 'admin';
    const isReceptionist = role === 'receptionist';
    const canViewAllAppointments = isAdmin || isReceptionist;

    // Get current doctor's info
    const currentDoctorId = isDoctor ? (doctorId || user?.id) : null;
    const currentDoctorName = isDoctor ? (doctorName || user?.name) : null;

    // Load date/time settings from localStorage
    useEffect(() => {
        const loadDateTimeSettings = () => {
            try {
                const storedSettings = localStorage.getItem('dateTimeSettings');
                if (storedSettings) {
                    const settings = JSON.parse(storedSettings);
                    setDateTimeSettings({
                        dateFormat: settings.dateFormat || 'MM/DD/YYYY',
                        timeFormat: settings.timeFormat || '12h',
                        timezone: settings.timezone || 'Asia/Calcutta'
                    });
                }
            } catch (error) {
                console.error('Error loading date/time settings:', error);
            }
        };

        loadDateTimeSettings();
    }, []);

    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            setIsRefreshing(true);

            console.log('Updating appointment status:', appointmentId, 'to', newStatus);

            // Find the appointment to get current details
            const appointmentToUpdate = appointments.find(appt => appt.id === appointmentId);
            if (!appointmentToUpdate) {
                console.error('Appointment not found:', appointmentId);
                toast.error("Appointment not found");
                return;
            }

            console.log('Found appointment:', appointmentToUpdate);

            // Use the updateStatus function from context (not updateAppointment)
            const success = await updateStatus(appointmentId, newStatus);

            if (success) {
                toast.success(`Appointment status updated to ${newStatus}`);

                // Force a refresh of appointments
                await fetchAppointments();

                // Force table re-render
                setTableKey(prev => prev + 1);
            } else {
                toast.error(`Failed to update status to ${newStatus}`);
            }

        } catch (error) {
            console.error('Error updating appointment status:', error);
            toast.error('Failed to update appointment status');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Date formatting functions based on user preferences
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date)) return dateString;

            if (dateTimeSettings.dateFormat === 'DD/MM/YYYY') {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            } else if (dateTimeSettings.dateFormat === 'MM/DD/YYYY') {
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
            } else { // YYYY-MM-DD
                return date.toISOString().split('T')[0];
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const formatTimeForDisplay = (timeString) => {
        if (!timeString) return '';

        // If already in 12h format with AM/PM, return as is
        if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
            return timeString;
        }

        // Convert from 24h to 12h format if needed
        if (dateTimeSettings.timeFormat === '12h') {
            try {
                const [hours, minutes] = timeString.split(':');
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
            } catch (error) {
                console.error('Error formatting time:', error);
                return timeString;
            }
        } else {
            // Return as 24h format
            return timeString;
        }
    };

    const handleStartVideoCall = async (appointment) => {
        try {
            setActiveVideoAppointmentId(appointment.id);
            setVideoModalOpen(true);
            setVideoLoading(true);
            toast.info("Creating instant video meeting...");

            const response = await fetchWithAuth(
                "https://bkdemo1.clinicpro.cc/telehealth/instant-meeting",
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || "Failed to create meeting");
            }

            const data = await response.json();

            setVideoLinks({
                startUrl: data.start_url || data.startUrl || "",
                joinUrl: data.join_url || data.joinUrl || data.meeting_url || ""
            });

            toast.success("Video meeting created");

        } catch (error) {
            console.error("❌ Video call error:", error);
            if (user.role === "super_admin") {
                toast.error("Failed to start video call");
            }
            setVideoModalOpen(false);
        } finally {
            setVideoLoading(false);
        }
    };

    const sendVideoLinkOnWhatsapp = (joinUrl, id) => {
        const patient = appointments.find(appt => appt.id === id);
        if (!patient || !joinUrl) return;

        const phoneNumber = patient.patientPhone.replace(/\D/g, "");

        const message = `📹 Zoom Meeting Link\n\n${joinUrl}`;

        const whatsappURL = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");
    };

    const parseDateFromDisplay = (displayDate) => {
        if (!displayDate) return '';

        try {
            let date;
            if (dateTimeSettings.dateFormat === 'DD/MM/YYYY') {
                const [day, month, year] = displayDate.split('/');
                date = new Date(year, month - 1, day);
            } else if (dateTimeSettings.dateFormat === 'MM/DD/YYYY') {
                const [month, day, year] = displayDate.split('/');
                date = new Date(year, month - 1, day);
            } else { // YYYY-MM-DD
                date = new Date(displayDate);
            }

            if (isNaN(date)) return displayDate;
            return date.toISOString().split('T')[0]; // Return in YYYY-MM-DD for API
        } catch (error) {
            console.error('Error parsing date:', error);
            return displayDate;
        }
    };

    const parseTimeFromDisplay = (displayTime) => {
        if (!displayTime) return '';

        // If in 24h format already, return as is
        if (!displayTime.toLowerCase().includes('am') && !displayTime.toLowerCase().includes('pm')) {
            return displayTime;
        }

        // Convert from 12h to 24h format
        try {
            const timeLower = displayTime.toLowerCase();
            const [timePart, modifier] = timeLower.split(' ');
            let [hours, minutes] = timePart.split(':');

            hours = parseInt(hours, 10);
            minutes = parseInt(minutes, 10);

            if (modifier === 'pm' && hours < 12) {
                hours += 12;
            } else if (modifier === 'am' && hours === 12) {
                hours = 0;
            }

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Error parsing time:', error);
            return displayTime;
        }
    };

    console.log('Auth Debug:', {
        user,
        role,
        isDoctor,
        isAdmin,
        isReceptionist,
        currentDoctorId,
        currentDoctorName,
        doctorId,
        doctorName
    });

    const getFilteredAppointments = useMemo(() => {
        let appointmentsToShow = filteredByPatient ? patientAppointments : appointments;

        if (!Array.isArray(appointmentsToShow)) return [];

        // If user is a doctor, filter appointments to show only their own
        if (isDoctor && currentDoctorId) {
            appointmentsToShow = appointmentsToShow.filter(appt => {
                const matchesDoctor =
                    appt.doctor_id?.toString() === currentDoctorId.toString() ||
                    appt.doctorId?.toString() === currentDoctorId.toString() ||
                    (currentDoctorName && appt.doctor?.toLowerCase().includes(currentDoctorName.toLowerCase())) ||
                    (user?.name && appt.doctor?.toLowerCase().includes(user.name.toLowerCase()));

                console.log('Doctor filter check:', {
                    appointmentId: appt.id,
                    apptDoctor: appt.doctor,
                    apptDoctorId: appt.doctor_id,
                    currentDoctorId,
                    currentDoctorName,
                    userName: user?.name,
                    matchesDoctor
                });

                return matchesDoctor;
            });
        }

        // Admin and receptionist can see all appointments
        return appointmentsToShow;
    }, [appointments, patientAppointments, filteredByPatient, isDoctor, currentDoctorId, currentDoctorName, user]);

    // Initialize patient filter from URL or localStorage
    useEffect(() => {
        const initializePatientFilter = async () => {
            let patientIdToUse = patientIdFromUrl;

            if (!patientIdToUse) {
                try {
                    const storedFilter = localStorage.getItem('appointmentPatientFilter');
                    if (storedFilter) {
                        const filterData = JSON.parse(storedFilter);
                        patientIdToUse = filterData.patientId;
                        if (patientIdToUse) {
                            searchParams.set('patient_id', patientIdToUse);
                            setSearchParams(searchParams);
                        }
                    }
                } catch (error) {
                    console.error('Error reading stored patient filter:', error);
                }
            }

            if (patientIdToUse) {
                setFilteredByPatient(patientIdToUse);
                await fetchAppointmentsByPatient(patientIdToUse);
                console.log(`Filtering appointments for patient ID: ${patientIdToUse}`);
            } else {
                setFilteredByPatient('');
                clearPatientAppointments();
            }
        };

        initializePatientFilter();
    }, [patientIdFromUrl]);

    // Update doctorOptions to include availability data
    const doctorOptions = useMemo(() => {
        if (!doctors || !Array.isArray(doctors)) return [];

        let filteredDoctors = doctors;

        if (isDoctor && currentDoctorId) {
            filteredDoctors = doctors.filter(doctor => {
                const matches =
                    doctor.id?.toString() === currentDoctorId.toString() ||
                    (currentDoctorName && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(currentDoctorName.toLowerCase())) ||
                    (user?.name && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(user.name.toLowerCase()));

                return matches;
            });
        }

        return filteredDoctors.map(doctor => {
            if (typeof doctor === 'string') {
                return {
                    value: doctor,
                    label: doctor,
                    id: doctor
                };
            } else if (doctor && typeof doctor === 'object') {
                const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
                return {
                    value: doctor.id,
                    label: doctorName,
                    id: doctor.id,
                    name: doctorName,
                    availability: doctor.availability || []
                };
            }
            return { value: '', label: 'Unknown Doctor', id: '' };
        }).filter(doctor => doctor.value);
    }, [doctors, isDoctor, currentDoctorId, currentDoctorName, user]);

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

    // Function to generate time slots based on doctor's availability
    const generateTimeSlots = (doctor, selectedDate) => {
        if (!doctor || !selectedDate || !doctor.availability) return [];

        const today = new Date();
        const jsDate = convertToJSDate(selectedDate);
        const selectedDay = createLocalDate(jsDate);

        if (!selectedDay) {
            console.error('Invalid date:', selectedDate);
            return [];
        }

        const dayName = selectedDay.toLocaleDateString('en-US', { weekday: 'long' });

        const dayAvailabilities = doctor.availability.filter(avail =>
            avail.day.toLowerCase() === dayName.toLowerCase() &&
            !avail.closed &&
            avail.startTime &&
            avail.endTime
        );

        if (dayAvailabilities.length === 0) {
            return [];
        }

        const slots = [];
        const now = new Date();

        dayAvailabilities.forEach(dayAvailability => {
            try {
                const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
                const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);

                const slotDuration = dayAvailability.slotDuration || 30;

                let currentTime = new Date(selectedDay);
                currentTime.setHours(startHour, startMinute, 0, 0);

                const endTime = new Date(selectedDay);
                endTime.setHours(endHour, endMinute, 0, 0);

                if (currentTime >= endTime) {
                    return;
                }

                while (currentTime < endTime) {
                    const timeValue = currentTime.toTimeString().slice(0, 5); // HH:MM format
                    const timeString = formatTimeForDisplay(timeValue); // Use user's preferred format

                    const isToday = selectedDay.toDateString() === today.toDateString();
                    const isPast = isToday && currentTime < now;

                    if (!isPast) {
                        if (!slots.some(slot => slot.value === timeValue)) {
                            slots.push({
                                value: timeValue,
                                label: timeString,
                                rawTime: new Date(currentTime)
                            });
                        }
                    }

                    currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
                }
            } catch (error) {
                console.error('Error generating time slots for availability:', dayAvailability, error);
            }
        });

        const sortedSlots = slots.sort((a, b) => a.value.localeCompare(b.value));
        return sortedSlots;
    };

    // Update selected doctor when doctor_id changes
    useEffect(() => {
        if (editFormData.doctor_id) {
            const doctorId = parseInt(editFormData.doctor_id);
            const doctor = doctorOptions.find(doc => doc.value === doctorId || doc.value == editFormData.doctor_id);
            setSelectedDoctor(doctor || null);

            if (editFormData.date && doctor) {
                const isDateValid = isDateAvailable(editFormData.date, doctor);
                if (!isDateValid) {
                    setEditFormData(prev => ({
                        ...prev,
                        time: ''
                    }));
                    setSelectedCalendarDate(null);
                    setAvailableTimeSlots([]);
                } else {
                    const slots = generateTimeSlots(doctor, editFormData.date);
                    setAvailableTimeSlots(slots);

                    if (editFormData.time && !slots.some(slot => slot.value === editFormData.time)) {
                        setEditFormData(prev => ({ ...prev, time: '' }));
                    }
                }
            } else {
                setEditFormData(prev => ({
                    ...prev,
                    time: ''
                }));
                setSelectedCalendarDate(null);
                setAvailableTimeSlots([]);
            }
        } else {
            setSelectedDoctor(null);
            setAvailableTimeSlots([]);
        }
    }, [editFormData.doctor_id, doctorOptions]);

    // Update available time slots when date changes
    useEffect(() => {
        if (editFormData.date && selectedDoctor) {
            const slots = generateTimeSlots(selectedDoctor, editFormData.date);
            setAvailableTimeSlots(slots);

            if (editFormData.time && !slots.some(slot => slot.value === editFormData.time)) {
                setEditFormData(prev => ({ ...prev, time: '' }));
            }
        } else {
            setAvailableTimeSlots([]);
        }
    }, [editFormData.date, selectedDoctor]);

    useEffect(() => {
        if (patientIdFromUrl) {
            setFilteredByPatient(patientIdFromUrl);
            fetchAppointmentsByPatient(patientIdFromUrl);
        } else {
            setFilteredByPatient('');
            clearPatientAppointments();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            localStorage.removeItem('appointmentPatientFilter');
        };
    }, []);

    // Function to format appointment type for display
    const formatAppointmentType = (type) => {
        if (!type) return '';

        return type
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleRefresh = async () => {
        try {
            if (fetchAppointments) {
                await fetchAppointments();
            }
            console.log('Appointments refreshed successfully');
        } catch (error) {
            console.error('Error refreshing appointments:', error);
        } finally {
            setIsRefreshing(false);
        }
    }

    const tableData = useMemo(() => {
        const displayAppointments = getFilteredAppointments;
        if (!Array.isArray(displayAppointments)) return [];

        return displayAppointments.map((appt) => {
            // Create sortable date-time string
            const dateTimeForSorting = appt.date && appt.time ?
                `${appt.date} ${appt.time}` : '';

            // Parse time for proper time-based sorting
            let timeForSorting = '';
            if (appt.time) {
                try {
                    const timeLower = appt.time.toLowerCase();
                    let [timePart, modifier] = timeLower.split(' ');
                    let [hours, minutes] = timePart.split(':');

                    hours = parseInt(hours, 10);
                    minutes = parseInt(minutes, 10);

                    if (modifier === 'pm' && hours < 12) {
                        hours += 12;
                    } else if (modifier === 'am' && hours === 12) {
                        hours = 0;
                    }

                    timeForSorting = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                } catch (error) {
                    console.warn('Could not parse time for sorting:', appt.time);
                    timeForSorting = appt.time;
                }
            }

            // Format date and time for display using user preferences
            const displayDate = formatDateForDisplay(appt.date);
            const displayTime = formatTimeForDisplay(appt.time);

            return {
                id: appt.id,
                name: appt.patientName || appt.name,
                email: appt.patientEmail || "—",
                contact: appt.patientPhone || "—",
                doctor: appt.doctor,
                created_at: appt.created_at,
                date: displayDate, // Use formatted date
                time: displayTime, // Use formatted time
                status: appt.status,
                source: appt.source,
                appointment_mode: appt.appointment_mode,
                formattedType: formatAppointmentType(appt.appointment_type),
                appt,
                doctor_obj: appt.doctor_obj || appt.doctor,
                // Add sortable fields (using raw values)
                dateTimeForSorting: dateTimeForSorting,
                timeForSorting: timeForSorting,
                sortableDateTime: appt.date && timeForSorting ?
                    `${appt.date} ${timeForSorting}` : ''
            };
        });
    }, [getFilteredAppointments, dateTimeSettings]);

    // Add function to clear patient filter
    const clearPatientFilter = () => {
        setFilteredByPatient('');
        clearPatientAppointments();

        searchParams.delete('patient_id');
        setSearchParams(searchParams);

        localStorage.removeItem('appointmentPatientFilter');

        console.log('Patient filter cleared');
    };

    // Get patient name for display
    const getPatientName = () => {
        if (!filteredByPatient) return '';

        try {
            const storedFilter = localStorage.getItem('appointmentPatientFilter');
            if (storedFilter) {
                const filterData = JSON.parse(storedFilter);
                return filterData.patientName || '';
            }
        } catch (error) {
            console.error('Error getting patient name:', error);
        }

        return '';
    };

    const handleEdit = (appointment) => {
        // Parse the display date back to YYYY-MM-DD for the form
        const apiDate = (() => {
            const d = appointment.date;

            if (!d) return "";

            // If already YYYY-MM-DD, return as-is
            if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;

            // handle DD/MM/YYYY
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
                const [day, month, year] = d.split("/");
                return `${year}-${month}-${day}`;
            }

            // handle MM/DD/YYYY
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
                const [month, day, year] = d.split("/");
                return `${year}-${month}-${day}`;
            }

            // handle DD-MM-YYYY
            if (/^\d{2}-\d{2}-\d{4}$/.test(d)) {
                const [day, month, year] = d.split("-");
                return `${year}-${month}-${day}`;
            }

            return d;
        })();

        const apiTime = parseTimeFromDisplay(appointment.time) || appointment.time;

        const currentDoctor = doctorOptions.find(doctor =>
            doctor.name === appointment.doctor || doctor.label === appointment.doctor
        );

        console.log('Editing appointment:', appointment);
        console.log('Found current doctor:', currentDoctor);

        setSelectedAppointment(appointment);
        setEditFormData({
            date: apiDate,
            time: apiTime,
            doctor_id: currentDoctor?.value || appointment.doctor?.id || '',
            type: appointment.type || 'new',
            status: appointment.status || 'pending',
            source: appointment.source || 'website'
        });

        // Set the calendar date
        if (apiDate) {
            const jsDate = convertToJSDate(apiDate);
            const calendarDate = createLocalDate(jsDate);
            if (calendarDate) {
                setSelectedCalendarDate(calendarDate);
            }
        }

        // Set the selected doctor immediately
        if (currentDoctor) {
            setSelectedDoctor(currentDoctor);

            if (apiDate && isDateAvailable(apiDate, currentDoctor)) {
                const slots = generateTimeSlots(currentDoctor, apiDate);
                setAvailableTimeSlots(slots);
            } else {
                setAvailableTimeSlots([]);
            }
        } else {
            setSelectedDoctor(null);
            setAvailableTimeSlots([]);
        }

        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedAppointment(null);
        setEditFormData({
            date: '',
            time: '',
            doctor_id: '',
            type: '',
            status: '',
            source: ''
        });
        setAvailableTimeSlots([]);
        setSelectedDoctor(null);
        setSelectedCalendarDate(null);
    };

    const handleInputChange = (field, value) => {
        console.log('handleInputChange called:', { field, value });
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCalendarDateChange = (date) => {
        setSelectedCalendarDate(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        setEditFormData(prev => ({
            ...prev,
            date: formattedDate,
            time: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        // Validate time slot
        if (editFormData.date && editFormData.time) {
            const slots = generateTimeSlots(selectedDoctor, editFormData.date);
            const isValidSlot = slots.some(slot => slot.value === editFormData.time);

            if (!isValidSlot) {
                alert('Please select a valid time slot from the available options.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Format time for API (ensure it's in correct format)
            const apiTime = editFormData.time; // Already in correct format from form

            const updatePayload = {
                doctor_id: parseInt(editFormData.doctor_id),
                appointment_id: parseInt(selectedAppointment.id),
                source: editFormData.source || selectedAppointment.source || "website",
                appointment_type: editFormData.type,
                date: editFormData.date,
                time: apiTime,
                doctor_name: selectedDoctor?.label || selectedAppointment.doctor
            };

            console.log('Updating appointment with:', updatePayload);

            await updateAppointment(selectedAppointment.id, updatePayload);

            console.log('Appointment updated successfully');
            handleCloseModal();
        } catch (error) {
            console.error('Error updating appointment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to get day name from date
    const getDayName = (date) => {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return dayNames[date.getDay()];
    };

    // Check if a specific date is available for a given doctor
    const isDateAvailable = (dateString, doctor = selectedDoctor) => {
        if (!doctor || !dateString || !doctor.availability) return false;

        const jsDate = convertToJSDate(dateString);
        const date = createLocalDate(jsDate);

        if (!date) {
            console.error('Invalid date for availability check:', dateString);
            return false;
        }

        const dayName = getDayName(date);
        const availableDays = getAvailableDays(doctor);

        const isAvailable = availableDays.includes(dayName);

        return isAvailable;
    };

    // Get available days for a given doctor
    const getAvailableDays = (doctor = selectedDoctor) => {
        if (!doctor || !doctor.availability) return [];

        const days = doctor.availability
            .filter(avail => !avail.closed && avail.startTime && avail.endTime)
            .map(avail => avail.day.toLowerCase());

        return days;
    };

    const columns = [
        {
            accessorKey: 'id',
            header: 'id',
            cell: (info) => (
                <span className="badge bg-light text-dark">#{info.getValue()}</span>
            )
        },
        { accessorKey: 'name', header: 'Patient Name' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'contact', header: 'Contact No' },
        { accessorKey: 'doctor', header: 'Doctor' },
        { accessorKey: 'source', header: 'Source' },
        {
            accessorKey: 'sortableDateTime',
            header: 'Appt. Date & Time',
            cell: ({ row }) => {
                const apptDate = row.original.date; // Already formatted
                const apptTime = row.original.time; // Already formatted

                return (
                    <div>
                        <div>{apptDate}</div>
                        <div className="text-muted small">{apptTime}</div>
                    </div>
                );
            },
            sortingFn: (rowA, rowB, columnId) => {
                const dateTimeA = rowA.getValue(columnId);
                const dateTimeB = rowB.getValue(columnId);

                if (!dateTimeA && !dateTimeB) return 0;
                if (!dateTimeA) return -1;
                if (!dateTimeB) return 1;

                return dateTimeA.localeCompare(dateTimeB);
            }
        },
        {
            accessorKey: 'formattedType',
            header: 'Type',
            cell: (info) => {
                const type = info.getValue();
                return (
                    <span className={`badge ${type === 'New' ? 'bg-primary' :
                        type === 'Follow Up' ? 'bg-success' :
                            type === 'Treatment' ? 'bg-info' :
                                'bg-secondary'
                        }`}>
                        {type}
                    </span>
                );
            }
        },
        {
            accessorKey: 'created_at',
            header: 'Created Date',
            cell: ({ row }) => {
                const created = row.original.created_at;
                if (!created) return " ";

                const d = new Date(created);
                if (isNaN(d)) return created;

                const dateStr = formatDateForDisplay(d.toISOString().split("T")[0]);
                const timeStr = formatTimeForDisplay(d.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }));

                return (
                    <div>
                        <div>{dateStr}</div>
                        <div className="text-muted small">{timeStr}</div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status?.toLowerCase();
                const statusColors = {
                    approved: "bg-success text-white",
                    accepted: "bg-success text-white",
                    pending: "bg-warning text-white",
                    cancelled: "bg-danger text-white",
                    rejected: "bg-danger text-white",
                    completed: "bg-primary text-white",
                    done: "bg-info text-white",
                    rescheduled: "bg-secondary text-white",
                };

                const badgeClass = statusColors[status] || "bg-light text-dark border";

                return (
                    <span className={`badge ${badgeClass}`}>
                        {row.original.status}
                    </span>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const appt = row.original.appt;
                const isVideoAppointment = appt?.appointment_mode === "video";
                const status = appt?.status?.toLowerCase();

                const getDropdownActions = () => {
                    if (status === "pending") {
                        return [
                            { icon: <FiCheck size={14} />, label: "Approve" },
                            { icon: <FiX size={14} />, label: "Reject" },
                        ];
                    } else if (status === "approved") {
                        return [
                            { icon: <FiCheck size={14} />, label: "Mark as Done" },
                            { icon: <FiRefreshCw size={14} />, label: "Move to Pending" },
                            { icon: <FiX size={14} />, label: "Reject" },
                        ];
                    } else if (status === "done") {
                        return [
                            { icon: <FiRefreshCw size={14} />, label: "Revert to Approved" },
                            { icon: <FiRefreshCw size={14} />, label: "Move to Pending" },
                            { icon: <FiX size={14} />, label: "Reject" },
                        ];
                    } else if (status === "rejected" || status === "cancelled") {
                        return [
                            { icon: <FiRefreshCw size={14} />, label: "Restore to Pending" },
                        ];
                    }

                    // Default fallback
                    return [
                        { icon: <FiCheck size={14} />, label: "Approve" },
                        { icon: <FiX size={14} />, label: "Reject" },
                    ];
                };

                const handleDropdownAction = (actionLabel, appointment) => {
                    console.log(`Action clicked: ${actionLabel} for appointment ${appointment.id}`);

                    switch (actionLabel) {
                        case "Approve":
                            updateAppointmentStatus(appointment.id, "approved");
                            break;
                        case "Reject":
                            updateAppointmentStatus(appointment.id, "rejected");
                            break;
                        case "Mark as Done":
                            updateAppointmentStatus(appointment.id, "done");
                            break;
                        case "Move to Pending":
                            updateAppointmentStatus(appointment.id, "pending");
                            break;
                        case "Revert to Approved":
                            updateAppointmentStatus(appointment.id, "approved");
                            break;
                        case "Restore to Pending":
                            updateAppointmentStatus(appointment.id, "pending");
                            break;
                        default:
                            console.log(`Unhandled action: ${actionLabel}`);
                    }
                };

                return (
                    <div className="hstack gap-2">
                        {isVideoAppointment && (
                            <button
                                className="avatar-text avatar-md"
                                title="Start Video Call"
                                onClick={() => handleStartVideoCall(appt)}
                            >
                                <FaVideo />
                            </button>
                        )}
                        <button
                            className="avatar-text avatar-md"
                            title="Edit Appointment"
                            onClick={() => handleEdit(row.original)}
                        >
                            <FiEdit3 />
                        </button>
                        <Dropdown
                            dropdownItems={getDropdownActions()}
                            triggerIcon={<FiMoreHorizontal />}
                            triggerClass="avatar-md"
                            onClick={(actionLabel) => handleDropdownAction(actionLabel, appt)}
                        />
                    </div>
                )
            }
        }
    ];

    return (
        <>
            <div className="tab-pane fade active show" id="overviewTab">
                {/* <div className="card-header">
                        <h5 className="card-title">
                            All Appointments
                            {filteredByPatient && (
                                <span className="badge bg-primary ms-2">
                                    Patient: {getPatientName() || `ID: ${filteredByPatient}`}
                                    <button
                                        className="btn-close btn-close-white ms-1"
                                        style={{ fontSize: '0.6rem' }}
                                        onClick={clearPatientFilter}
                                        title="Clear filter"
                                    ></button>
                                </span>
                            )}
                        </h5>
                        {filteredByPatient && (
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={clearPatientFilter}
                            >
                                <FiX className="me-1" />
                                Clear Filter
                            </button>
                        )}
                    </div> */}
                <div>
                    <Table
                        data={tableData}
                        columns={columns}
                        emptyMessage={
                            filteredByPatient
                                ? "No appointments found for this patient"
                                : "No appointments found"
                        }
                        defaultSorting={[{ id: 'id', desc: true }]}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        cardHeader={
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <h5 className="card-title mb-0">
                                    All Appointments
                                    {filteredByPatient && (
                                        <span className="badge bg-primary ms-2">
                                            Patient: {getPatientName() || `ID: ${filteredByPatient}`}
                                            <button
                                                className="btn-close btn-close-white ms-1"
                                                style={{ fontSize: '0.6rem' }}
                                                onClick={clearPatientFilter}
                                                title="Clear filter"
                                            ></button>
                                        </span>
                                    )}
                                </h5>
                                {filteredByPatient && (
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={clearPatientFilter}
                                    >
                                        <FiX className="me-1" />
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                        }
                    />
                </div>
            </div>
            {isEditModalOpen && (
                <EditAppointmentModal
                    appointment={selectedAppointment}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={async (updatePayload) => {
                        try {
                            console.log("📤 Saving appointment via EditAppointmentModal:", updatePayload);
                            await updateAppointment(selectedAppointment.id, updatePayload);
                            toast.success("Appointment updated successfully!");
                            await handleRefresh();
                            setIsEditModalOpen(false);
                        } catch (error) {
                            console.error("❌ Failed to update appointment:", error);
                            if (user.role === "super_admin") {
                                toast.error("Failed to update appointment");
                            }
                        }
                    }}
                    dateTimeSettings={dateTimeSettings}
                    initialSelectedDate={selectedCalendarDate}
                />
            )}
            {videoModalOpen && (
                <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Video Consultation</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setVideoModalOpen(false)}
                                />
                            </div>

                            <div className="modal-body">
                                {videoLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary mb-3" />
                                        <div>Creating meeting…</div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Start URL (Doctor)</label>
                                            <div className="input-group">
                                                <input
                                                    className="form-control"
                                                    value={videoLinks.startUrl}
                                                    readOnly
                                                />
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => window.open(videoLinks.startUrl, "_blank")}
                                                    disabled={!videoLinks.startUrl}
                                                >
                                                    Start
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label fw-semibold">Join URL (Patient)</label>
                                            <div className="input-group">
                                                <input
                                                    className="form-control"
                                                    value={videoLinks.joinUrl}
                                                    readOnly
                                                />
                                                <button
                                                    className="btn btn-success d-flex align-items-center gap-2"
                                                    onClick={() => sendVideoLinkOnWhatsapp(videoLinks.joinUrl, activeVideoAppointmentId)}
                                                    disabled={!videoLinks.joinUrl}
                                                >
                                                    <FaWhatsapp size={18} />
                                                    WhatsApp
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setVideoModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TabAppointmentOverview