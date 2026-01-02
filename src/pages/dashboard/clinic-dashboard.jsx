import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CardHeader from '../../components/shared/CardHeader';
import CircleProgress from '../../components/shared/CircleProgress';
import PageHeaderDate from '../../components/shared/pageHeader/PageHeaderDate';
import { useRef } from 'react';
import { useAuth } from '../../contentApi/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { useAppointments } from '../../context/AppointmentContext';
import { useBooking } from "../../contentApi/BookingProvider";
import { useVaccine } from '../../context/VaccineContext';
import { useMedicines } from '../../context/MedicinesContext';
import { useLeads } from '../../context/LeadsContext';
import { usePrescription } from '../../contentApi/PrescriptionProvider';
import { useClinicManagement } from '../../contentApi/ClinicMnanagementProvider';
import { useActivity } from '../../context/ActivityContext';
import PageHeader from '../../components/shared/pageHeader/PageHeader';
import { FiRefreshCw, FiDownload, FiCalendar, FiUser, FiFileText, FiTrendingUp, FiActivity, FiEye, FiEdit3, FiPrinter } from 'react-icons/fi';
import { FaWhatsapp } from "react-icons/fa";
import Footer from '../../components/shared/Footer';
import '../../components/prescriptions/PrescriptionView.css';
import PrescriptionViewPage from '@/components/prescriptions/PrescriptionViewPage';
import EditPrescriptionModal from '@/components/prescriptions/EditPrescriptionModal';
import EditAppointmentModal from '@/components/appointmentsView/EditAppointmentModal';
import PatientModal from '@/components/patients/PatientModal';

const DashboardClinic = () => {

  // Date filter state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });

  // Context hooks for data
  const { user, role } = useAuth();
  const { patients } = usePatient();
  const { doctors } = useBooking();
  const { appointments, updateAppointment } = useAppointments();
  const { clinicSpecialities } = useClinicManagement();
  const { vaccines, getVaccines } = useVaccine();
  const { medicines, getMedicines } = useMedicines();
  const { leads } = useLeads();
  const { allPrescriptions } = usePrescription();
  const { activityLogs, loading, fetchActivityLogsFromBackend } = useActivity();
  const printRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  // Debug: Log appointments data to verify actual data is being used
  useEffect(() => {
    console.log('Dashboard Appointments Data:', {
      totalAppointments: appointments.length,
      sampleAppointment: appointments[0],
      appointmentStatuses: [...new Set(appointments.map(apt => apt.status))],
      appointmentFields: appointments[0] ? Object.keys(appointments[0]) : [],
      dateRange: dateRange
    });
  }, [appointments, dateRange]);

  // Fetch activity logs on component mount
  useEffect(() => {
    fetchActivityLogsFromBackend();
  }, []);

  // Show welcome modal once after login
  useEffect(() => {
    try {
      const shouldShow = localStorage.getItem('cp_show_welcome');
      if (shouldShow === '1') {
        const name = localStorage.getItem('cp_welcome_name') || user?.name || 'User';
        setWelcomeName(name);
        setShowWelcome(true);
        localStorage.removeItem('cp_show_welcome');
      }
    } catch (_) { }
  }, [user]);

  const patientLookup = patients.reduce((acc, patient) => {
    acc[patient.id] = patient;
    return acc;
  }, {});

  const doctorLookup = doctors.reduce((acc, doctor) => {
    acc[doctor.id] = doctor;
    return acc;
  }, {});

  const doctorFilteredAppointments = useMemo(() => {
    if (role?.toLowerCase() === "doctor") {
      return appointments.filter(a =>
        String(a.doctor_id || a.doctorId || a.doctor?.id) === String(user?.doctorId || user?.id)
      );
    }
    return appointments;
  }, [appointments, role, user]);

  const doctorFilteredPrescriptions = useMemo(() => {
    if (role?.toLowerCase() === "doctor") {
      return allPrescriptions.filter(a =>
        String(a.doctor_id || a.doctorId || a.doctor?.id) === String(user?.doctorId || user?.id)
      );
    }
    return allPrescriptions;
  }, [allPrescriptions, role, user]);

  useEffect(() => {
    getVaccines();
    getMedicines();
  }, []);
  console.log("Medicine total", medicines.length);

  const [viewPrescription, setViewPrescription] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editPrescription, setEditPrescription] = useState(null);
  const [printPrescription, setPrintPrescription] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editAppointment, setEditAppointment] = useState(null);

  // Helper functions (add these inside the component)
  const getPatientNameById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return 'Unknown Patient';

    if (patient.user) {
      return `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || 'Unknown Patient';
    }
    return patient.name || 'Unknown Patient';
  };

  const getDoctorNameById = (doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return 'Unknown Doctor';

    if (doctor.firstName && doctor.lastName) {
      return `${doctor.firstName} ${doctor.lastName}`;
    }
    return doctor.name || 'Unknown Doctor';
  };

  // Add this helper function alongside the existing ones
  const getPatientPhoneById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return 'No phone';

    // Handle both patient structures
    if (patient.user) {
      return patient.user.phone || 'No phone';
    }
    return patient.phone || patient.contact || 'No phone';
  };

  // Transform prescription data for dashboard use
  const prescriptions = useMemo(() => {
    if (!allPrescriptions || !Array.isArray(allPrescriptions)) return [];

    console.log('Raw Prescription Data:', allPrescriptions);

    return allPrescriptions.map(prescription => {
      // Extract patient name from various possible locations
      const patientName = prescription.patient_name ||
        prescription.patientName ||
        prescription.patient?.name ||
        prescription.patient?.patientName ||
        `${prescription.patient?.firstName || prescription.patient?.first_name || ''} ${prescription.patient?.lastName || prescription.patient?.last_name || ''}`.trim() ||
        `${prescription.patient_first_name || ''} ${prescription.patient_last_name || ''}`.trim() ||
        `Patient ID: ${prescription.patient_id}` ||
        'Unknown Patient';

      // Extract medicine name from various possible locations
      let medicineName = 'No Medicine';
      if (prescription.medicines && Array.isArray(prescription.medicines) && prescription.medicines.length > 0) {
        medicineName = prescription.medicines[0]?.medicine?.name ||
          prescription.medicines[0]?.name ||
          prescription.medicines[0]?.medicine_name ||
          'No Medicine';
      } else if (prescription.medicine) {
        medicineName = prescription.medicine;
      }

      // Extract status
      const status = prescription.status || 'Active';

      // Extract date
      const date = prescription.created_at ||
        prescription.createdAt ||
        prescription.date ||
        new Date().toISOString();

      // Extract doctor name
      const doctorName = prescription.doctor_name ||
        prescription.doctorName ||
        prescription.doctor?.name ||
        prescription.doctor?.doctorName ||
        prescription.doctor?.drName ||
        prescription.doctor?.fullName ||
        `${prescription.doctor?.firstName || prescription.doctor?.first_name || ''} ${prescription.doctor?.lastName || prescription.doctor?.last_name || ''}`.trim() ||
        `${prescription.doctor_first_name || ''} ${prescription.doctor_last_name || ''}`.trim() ||
        `Dr. ${prescription.doctor_id}` ||
        'Unknown Doctor';

      return {
        id: prescription.id,
        patientName,
        medicine: medicineName,
        status,
        date,
        doctor: doctorName
      };
    });
  }, [allPrescriptions]);

  // Debug: Log prescription data to verify actual data is being used
  useEffect(() => {
    console.log('Dashboard Prescription Data:', {
      totalPrescriptions: allPrescriptions?.length || 0,
      samplePrescription: allPrescriptions?.[0],
      prescriptionFields: allPrescriptions?.[0] ? Object.keys(allPrescriptions[0]) : [],
      prescriptionStatuses: allPrescriptions ? [...new Set(allPrescriptions.map(p => p.status))] : [],
      transformedPrescriptions: prescriptions.length,
      sampleTransformed: prescriptions[0]
    });
  }, [allPrescriptions, prescriptions]);

  // Date filter functions
  const isDateInRange = (dateString) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return true;

    const date = new Date(dateString);
    return date >= dateRange.startDate && date <= dateRange.endDate;
  };

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();

    // Debug: Log appointment data for troubleshooting
    console.log('Appointments for stats:', {
      vaccines: vaccines.length,
      medicines: medicines.length,
      total: appointments.length,
      sample: appointments[0],
      statuses: [...new Set(appointments.map(apt => apt.status))],
      dates: appointments.map(apt => ({ date: apt.date, status: apt.status }))
    });

    // Fix: Use proper status checks and date filtering
    const todayAppointments = doctorFilteredAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === today.toDateString() && isDateInRange(apt.date);
    });

    // Fix: Check multiple possible status values
    const pendingAppointments = doctorFilteredAppointments.filter(apt =>
      (apt.status === 'Pending' || apt.status === 'pending')
    );

    const completedAppointments = doctorFilteredAppointments.filter(apt =>
      (apt.status === 'Done' || apt.status === 'done' || apt.status === 'Completed' || apt.status === 'completed')
    );

    const upcomingAppointments = doctorFilteredAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate > today &&
        !(apt.status === 'Done' || apt.status === 'done' || apt.status === 'Completed' || apt.status === 'completed') &&
        isDateInRange(apt.date);
    });

    const totalAppointments = doctorFilteredAppointments.length;

    // Calculate completion percentages
    const appointmentCompletionRate = totalAppointments > 0
      ? Math.round((completedAppointments.length / totalAppointments) * 100)
      : 0;

    // Calculate revenue (mock data for demo)
    const totalRevenue = completedAppointments.length * 150; // $150 per appointment
    const monthlyRevenue = totalRevenue * 4; // Rough monthly estimate

    // In your stats calculation, update the prescription stats:
    const totalClinicPrescriptions = prescriptions.length;

    // For doctor login → count only their prescriptions
    const totalPrescriptions =
      role?.toLowerCase() === "doctor"
        ? doctorFilteredPrescriptions.length
        : totalClinicPrescriptions;

    // Since there's no status field, skip Active/Completed
    const activePrescriptions = 0;
    const completedPrescriptions = 0;

    // ✅ Compute completion rate based on share of total
    const prescriptionCompletionRate =
      totalClinicPrescriptions > 0
        ? Math.round((totalPrescriptions / totalClinicPrescriptions) * 100)
        : 0;


    // Medicine stats - assuming you have stock data
    const totalMedicines = medicines.length;
    const inStockMedicines = Math.round(totalMedicines * 0.8); // Mock data - replace with actual stock calculation
    const medicineStockRate = totalMedicines > 0
      ? Math.round((inStockMedicines / totalMedicines) * 100)
      : 0;

    // Vaccine stats - assuming you have availability data
    const totalVaccines = vaccines.length;
    const availableVaccines = Math.round(totalVaccines * 0.9); // Mock data - replace with actual availability calculation
    const vaccineAvailabilityRate = totalVaccines > 0
      ? Math.round((availableVaccines / totalVaccines) * 100)
      : 0;


    // Overview statistics
    const newPatientsThisMonth = patients.filter(p => {
      const patientDate = new Date(p.createdAt || p.created_at || Date.now());
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return patientDate > monthAgo;
    }).length;

    const avgAppointmentsPerDay = appointments.length > 0 ? Math.round(appointments.length / 30) : 0;
    const patientSatisfaction = 4.8; // Mock satisfaction rating
    const staffEfficiency = Math.round((completedAppointments.length / appointments.length) * 100) || 0;

    return {
      totalPatients: patients.length,
      totalAppointments,
      todayAppointments: todayAppointments.length,
      pendingAppointments: pendingAppointments.length,
      completedAppointments: completedAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      totalSpecialities: clinicSpecialities.length,
      totalReceptionists: 0,
      totalAccountants: 0,
      totalVaccines: vaccines.length,
      totalMedicines: medicines.length,
      totalLeads: leads.length,
      // Completion percentages
      appointmentCompletionRate,
      prescriptionCompletionRate,
      medicineStockRate,
      vaccineAvailabilityRate,
      // Prescription stats
      totalPrescriptions,
      activePrescriptions,
      completedPrescriptions,
      // Medicine and vaccine detailed stats
      inStockMedicines,
      availableVaccines,
      // Overview stats
      totalRevenue,
      monthlyRevenue,
      newPatientsThisMonth,
      avgAppointmentsPerDay,
      patientSatisfaction,
      staffEfficiency
    };
  }, [patients, appointments, clinicSpecialities, vaccines, medicines, leads, allPrescriptions, dateRange]);

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (role?.toLowerCase() === 'doctor') {
      return appointments.filter(a =>
        String(a.doctor_id || a.doctorId || a.doctor?.id) === String(user?.id)
      );
    }
    // for admin, receptionist, etc → show all
    return appointments;
  }, [appointments, role, user]);

  const filteredPrescriptions = useMemo(() => {
    if (!allPrescriptions) return [];
    if (role?.toLowerCase() === 'doctor') {
      return allPrescriptions.filter(p =>
        String(p.doctor_id || p.doctorId || p.doctor?.id) === String(user?.id)
      );
    }
    // for admin, receptionist, etc → show all
    return allPrescriptions;
  }, [allPrescriptions, role, user]);

  // Get current date range for display
  const getDateRangeDisplay = () => {
    if (!dateRange?.startDate || !dateRange?.endDate) return 'All Time';

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: '2-digit'
      });
    };

    return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
  };

  // const recentActivities = useMemo(() => {
  //   const activities = [];

  //   // Add recent appointments (filtered by date range)
  //   appointments.filter(apt => isDateInRange(apt.date)).slice(0, 5).forEach(apt => {
  //     // Fix: Get proper patient name
  //     const patientName =
  //       apt.patient_name ||
  //       apt.patientName ||
  //       apt.patient?.name ||
  //       apt.patient?.patientName ||
  //       `${apt.patient?.firstName || apt.patient?.first_name || ''} ${apt.patient?.lastName || apt.patient?.last_name || ''}`.trim() ||
  //       `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim() ||
  //       apt.name ||
  //       `Patient ID: ${apt.patient_id}` ||
  //       'Unknown Patient';

  //     const doctorName =
  //       apt.doctor_name ||
  //       apt.doctorName ||
  //       apt.doctor?.name ||
  //       apt.doctor?.doctorName ||
  //       apt.doctor?.drName ||
  //       apt.doctor?.fullName ||
  //       `${apt.doctor?.firstName || apt.doctor?.first_name || ''} ${apt.doctor?.lastName || apt.doctor?.last_name || ''}`.trim() ||
  //       `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim() ||
  //       apt.doctor ||
  //       `Dr. ${apt.doctor_id}` ||
  //       'Unknown Doctor';

  //     activities.push({
  //       id: `appointment-${apt.id}`,
  //       type: 'appointment',
  //     title: `Appointment with ${patientName}`,
  //     description: `${doctorName} - ${apt.status || 'Scheduled'}`,
  //     time: new Date(apt.date),
  //     status: apt.status || 'Scheduled',
  //     icon: FiCalendar
  //   });
  //   });

  //   // Add recent patients
  //   patients.slice(0, 3).forEach(patient => {
  //     const patientName = patient.name || 'Unknown Patient';
  //     activities.push({
  //       id: patient.id,
  //       type: 'patient',
  //     title: `New patient: ${patientName}`,
  //     description: `${patient.age || 'Unknown'} years, ${patient.gender || 'Unknown'}`,
  //     time: new Date(patient.createdAt || patient.created_at || Date.now()),
  //     status: 'active',
  //     icon: FiUser
  //   });
  //   });

  //   // Add recent prescriptions (filtered by date range)
  //   prescriptions.filter(p => isDateInRange(p.date)).slice(0, 2).forEach(prescription => {
  //     activities.push({
  //       id: prescription.id,
  //       type: 'prescription',
  //       title: `Prescription for ${prescription.patientName || 'Unknown Patient'}`,
  //       description: `${prescription.medicine || 'No medicine'} - ${prescription.status || 'Active'}`,
  //       time: new Date(prescription.date),
  //       status: prescription.status || 'Active',
  //       icon: FiFileText
  //     });
  //   });

  //   return activities.sort((a, b) => b.time - a.time).slice(0, 8);
  // }, [appointments, patients, prescriptions, dateRange]);

  // Recent activities - Updated to include activity logs
  const recentActivities = useMemo(() => {
    const activities = [];

    // Add activity logs from your API
    if (activityLogs && activityLogs.length > 0) {
      activityLogs.slice(0, 5).forEach(log => {
        // Parse the details to make it more readable
        let description = log.details || 'Activity recorded';

        // Format the description for better readability
        if (log.action === 'Updated Appointment Status') {
          const statusMatch = log.details?.match(/New Status: (\w+)/);
          const appointmentIdMatch = log.details?.match(/Appointment ID: (\d+)/);
          const status = statusMatch ? statusMatch[1] : 'unknown';
          const appointmentId = appointmentIdMatch ? appointmentIdMatch[1] : 'unknown';

          description = `Appointment #${appointmentId} status changed to ${status}`;
        }

        activities.push({
          id: `activity-${log.id}`,
          type: 'activity',
          title: log.action || 'System Activity',
          description: description,
          time: new Date(log.timestamp),
          status: 'info',
          icon: FiActivity,
          user: log.name || 'System',
          rawData: log // Keep original data for reference
        });
      });
    }

    // Add recent appointments (only if we don't have enough activity logs)
    if (activities.length < 5) {
      appointments
        .filter(apt => isDateInRange(apt.date))
        .slice(0, 5 - activities.length)
        .forEach(apt => {
          const patientName =
            apt.patient_name ||
            apt.patientName ||
            apt.patient?.name ||
            apt.patient?.patientName ||
            `${apt.patient?.firstName || apt.patient?.first_name || ''} ${apt.patient?.lastName || apt.patient?.last_name || ''}`.trim() ||
            `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim() ||
            apt.name ||
            `Patient ID: ${apt.patient_id}` ||
            'Unknown Patient';

          const doctorName =
            apt.doctor_name ||
            apt.doctorName ||
            apt.doctor?.name ||
            apt.doctor?.doctorName ||
            apt.doctor?.drName ||
            apt.doctor?.fullName ||
            `${apt.doctor?.firstName || apt.doctor?.first_name || ''} ${apt.doctor?.lastName || apt.doctor?.last_name || ''}`.trim() ||
            `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim() ||
            apt.doctor ||
            `Dr. ${apt.doctor_id}` ||
            'Unknown Doctor';

          activities.push({
            id: `appointment-${apt.id}`,
            type: 'appointment',
            title: `Appointment with ${patientName}`,
            description: `${doctorName} - ${apt.status || 'Scheduled'}`,
            time: new Date(apt.date || apt.created_at || Date.now()),
            status: apt.status || 'Scheduled',
            icon: FiCalendar
          });
        });
    }

    // Add recent patients (only if we still need more activities)
    if (activities.length < 5) {
      patients
        .sort((a, b) => new Date(b.createdAt || b.created_at || Date.now()) - new Date(a.createdAt || a.created_at || Date.now()))
        .slice(0, 5 - activities.length)
        .forEach(patient => {
          const patientName = patient.name ||
            `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
            'Unknown Patient';

          activities.push({
            id: `patient-${patient.id}`,
            type: 'patient',
            title: `New patient: ${patientName}`,
            description: `${patient.age || 'Unknown'} years, ${patient.gender || 'Unknown'}`,
            time: new Date(patient.createdAt || patient.created_at || Date.now()),
            status: 'active',
            icon: FiUser
          });
        });
    }

    // Add recent prescriptions (only if we still need more activities)
    if (activities.length < 5) {
      prescriptions
        .filter(p => isDateInRange(p.date))
        .slice(0, 5 - activities.length)
        .forEach(prescription => {
          activities.push({
            id: `prescription-${prescription.id}`,
            type: 'prescription',
            title: `Prescription for ${prescription.patientName || 'Unknown Patient'}`,
            description: `${prescription.medicine || 'No medicine'} - ${prescription.status || 'Active'}`,
            time: new Date(prescription.date),
            status: prescription.status || 'Active',
            icon: FiFileText
          });
        });
    }

    // Sort by time (newest first) and take top 5
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  }, [appointments, patients, prescriptions, activityLogs, dateRange]);


  const handleExportData = () => {
    const data = {
      patients: patients.length,
      appointments: appointments.length,
      prescriptions: stats.totalPrescriptions,
      revenue: stats.totalRevenue,
      date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinic-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  // Action button handlers
  const handleViewPrescription = (prescriptionId) => {
    console.log('Viewing prescription:', prescriptionId);
    // Navigate to prescription view page
    window.open(`/prescriptions/view-prescription/${prescriptionId}`, '_blank');
  };

  const handleEditPrescription = (prescriptionId) => {
    console.log('Editing prescription:', prescriptionId);
    // Navigate to prescription edit page
    window.open(`/prescriptions/edit-prescription/${prescriptionId}`, '_blank');
  };

  const handlePrintPrescription = (prescription) => {
    setPrintPrescription(prescription);

    setTimeout(() => {
      if (!printRef.current) {
        console.error("❌ printRef not ready");
        return;
      }

      const printWindow = window.open("", "_blank", "width=800,height=700");
      const html = `
      <html>
        <head>
          <title>Print Prescription</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div id="print-root"></div>
        </body>
      </html>
    `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        const contentClone = printRef.current.cloneNode(true);
        printWindow.document.getElementById("print-root").appendChild(contentClone);
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      setPrintPrescription(null);
    }, 300);
  };


  const handleViewAppointment = (appointmentId) => {
    console.log('Viewing appointment:', appointmentId);
    // Navigate to appointment view page
    window.open(`/appointments/view-appointment/${appointmentId}`, '_blank');
  };

  const handleEditAppointment = (appointment) => {
    console.log('Editing appointment:', appointment);
    setEditAppointment(appointment);
  };

  const handleViewPatientFromAppointment = (apt) => {
    // Try find patient in context first
    let patientCandidate = null;
    const normalizedName = (
      apt.patient_name || apt.patientName || apt.name || `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim()
    )?.trim();
    const byId = apt.patient_id || apt.patientId || apt.patient?.id;
    if (byId && patientLookup[byId]) {
      patientCandidate = patientLookup[byId];
    } else if (normalizedName) {
      patientCandidate = patients.find(p => (p.name || '').trim().toLowerCase() === normalizedName.toLowerCase());
    }

    // Fallback compose minimal patient object from appointment
    const composedPatient = patientCandidate || {
      id: byId || `apt-${apt.id || Date.now()}`,
      name: normalizedName || 'Unknown Patient',
      email: apt.patient_email || apt.patientEmail || '',
      contact: apt.patient_phone || apt.patientPhone || '',
      age: apt.patient_age || apt.patientAge || '',
      gender: apt.patient_gender || apt.patientGender || '',
    };

    setSelectedPatient(composedPatient);
    setShowPatientModal(true);
  };

  const handleSaveAppointment = async (updatedAppointment) => {
    try {
      console.log('Saving appointment update:', updatedAppointment);
      await updateAppointment(editAppointment.id, updatedAppointment);
      console.log('Appointment updated successfully!');
      setEditAppointment(null);
      handleRefreshData(); // Refresh data to show updates
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };
  // Statistics cards data array
  const statsCards = useMemo(() => [
    {
      id: 1,
      title: "Total Appointments",
      value: stats.totalAppointments,
      subtitle: "Total",
      progressValue: stats.appointmentCompletionRate,
      progressColor: "#3454d1",
      badgeText: "Updates",
      links: [
        { to: "/appointments/all-appointments", label: "View All", variant: "outline-primary" },
        { to: "/appointments/book-appointment", label: "Book", variant: "outline-success" }
      ]
    },
    {
      id: 2,
      title: "Total Prescriptions",
      value: stats.totalPrescriptions,
      subtitle: "Total",
      progressValue: stats.prescriptionCompletionRate,
      progressColor: "#17c666",
      badgeText: "Active",
      links: [
        { to: "/prescriptions/all-prescriptions", label: "View All", variant: "outline-primary" },
        { to: "/prescriptions/create-prescription", label: "Create", variant: "outline-success" }
      ]
    },
    {
      id: 3,
      title: "Total Medicines",
      value: Math.round(stats.totalMedicines),
      subtitle: "In Stock",
      progressValue: Math.round(stats.totalMedicines),
      progressColor: "#ffa21d",
      badgeText: "Stock",
      links: [
        { to: "/medicines/all-medicines", label: "View All", variant: "outline-primary" },
        { to: "/inventory/products/product-create", label: "Add", variant: "outline-success" }
      ]
    },
    {
      id: 4,
      title: "Total Vaccines",
      value: vaccines.length,
      subtitle: "Available",
      progressValue: Math.round(vaccines.length),
      progressColor: "#ea4d4d",
      badgeText: "Available",
      links: [
        { to: "/vaccines/dashboard", label: "View All", variant: "outline-primary" },
        { to: "/vaccines/dashboard", label: "Manage", variant: "outline-success" }
      ]
    }
  ], [stats, vaccines]);

  return (
    <>
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowWelcome(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3">
                  <img src="/images/general/confetti.png" alt="celebrate" style={{ width: '100%', height: '100%', maxHeight: '200px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                </div>
                <h4 className="fw-bold mb-1">Welcome to <span className="text-primary">ClinicPro</span></h4>
                <p className="text-muted mb-3">Glad to see you, <strong>{welcomeName}</strong>!</p>
                <div className='d-flex align-items-center justify-content-center'>
                  <button type="button" className="btn btn-primary" onClick={() => setShowWelcome(false)}>Go to Dashboard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PageHeader>
        <PageHeaderDate onDateRangeChange={handleDateRangeChange} dateRange={dateRange} />
      </PageHeader>

      <div className='main-content'>
        <div className='row'>

          {/* Clinic Statistics Cards */}
          <div className="col-12">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4 pb-1">
                  <div>
                    <h5 className="mb-1">Clinic Overview</h5>
                    <span className="fs-12 text-muted">
                      Welcome back, {user?.name || 'Clinic Staff'}! Here&apos;s your clinic overview for {getDateRangeDisplay()}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="text-end me-3">
                      <div className="badge bg-soft-primary text-primary fs-12">{role || 'Staff'}</div>
                      <p className="text-muted small mt-1 mb-0">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button
                      className="btn btn-light-brand btn-sm"
                      onClick={handleRefreshData}
                      title="Refresh Data"
                    >
                      <FiRefreshCw size={14} />
                    </button>
                  </div>
                </div>

                <div className="row g-4">
                  {statsCards.map((card) => (
                    <div key={card.id} className="col-xxl-3 col-md-6">
                      <div className="card-body border border-dashed border-gray-5 rounded-3 position-relative">
                        <div className="hstack justify-content-between gap-4">
                          <div>
                            <h6 className="fs-14 text-truncate-1-line">{card.title}</h6>
                            <div className="fs-12 text-muted">
                              <span className="text-dark fw-medium">{card.subtitle}:</span> {card.value}
                            </div>
                          </div>
                          <div className="project-progress-1">
                            <CircleProgress
                              value={card.progressValue}
                              text_sym={"%"}
                              path_width='8px'
                              path_color={card.progressColor}
                            />
                          </div>
                        </div>
                        <div className="badge bg-gray-200 text-dark project-mini-card-badge">
                          {card.badgeText}
                        </div>
                        <div className="mt-3 d-flex gap-2">
                          {card.links.map((link, index) => (
                            <Link
                              key={index}
                              to={link.to}
                              className={`btn btn-sm btn-${link.variant}`}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments Table */}
          <div className="col-xxl-6">
            <div className="card stretch stretch-full">
              <CardHeader title="Recent Appointments" refresh={handleRefreshData} remove={null} expanded={null} />
              <div className="card-body custom-card-action p-0">
                <div className="table-responsive project-report-table">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Patient</th>
                        <th scope="col">Doctor</th>
                        <th scope="col">Date & Time</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.sort((a, b) => new Date(b.created_at || b.date || b.createdAt) - new Date(a.created_at || a.date || a.createdAt)).slice(0, 5).map((apt, index) => {
                        // ✅ Enhanced name normalization for appointments
                        const patientName =
                          apt.patient_name ||
                          apt.patientName ||
                          apt.patient?.name ||
                          apt.patient?.patientName ||
                          `${apt.patient?.firstName || apt.patient?.first_name || ''} ${apt.patient?.lastName || apt.patient?.last_name || ''}`.trim() ||
                          `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim() ||
                          apt.name ||
                          `Patient ID: ${apt.patient_id}` ||
                          'Unknown Patient';

                        const patientPhone =
                          apt.patient_phone ||
                          apt.patientPhone ||
                          apt.patient?.phone ||
                          apt.patient?.contact ||
                          apt.phone ||
                          apt.contact ||
                          'No phone';


                        const doctorName =
                          apt.doctor_name ||
                          apt.doctorName ||
                          apt.doctor?.name ||
                          apt.doctor?.doctorName ||
                          apt.doctor?.drName ||
                          apt.doctor?.fullName ||
                          `${apt.doctor?.firstName || apt.doctor?.first_name || ''} ${apt.doctor?.lastName || apt.doctor?.last_name || ''}`.trim() ||
                          `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim() ||
                          apt.doctor ||
                          `Dr. ${apt.doctor_id}` ||
                          'Unknown Doctor';

                        // Format appointment date and time
                        const appointmentDate = apt.date ? new Date(apt.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }) : '—';

                        const appointmentTime = apt.time || '—';

                        return (
                          <tr key={apt.id || index}>
                            <td>
                              <div className="hstack gap-3 chat-single-item">
                                {apt.patient_image ? (
                                  <div className="avatar-image avatar-md">
                                    <img src={apt.patient_image} alt="avatar" className="img-fluid" />
                                  </div>
                                ) : (
                                  <div className="text-white avatar-text user-avatar-text avatar-md">
                                    {(patientName.charAt(0) || 'U').toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <span className="fw-semibold">{patientName}</span>
                                  <small className="text-muted d-block">{patientPhone}</small>
                                  {/* <small className="text-muted d-block">Doctor: {doctorName}</small> */}
                                </div>
                              </div>
                            </td>
                            <td><span className="text-muted">{doctorName}</span></td>
                            <td>
                              <div>
                                <div className="fw-semibold">{appointmentDate}</div>
                                <small className="text-muted">{appointmentTime}</small>
                              </div>
                            </td>
                            <td>
                              <span className={`badge bg-${apt.status === 'Accepted' || apt.status === 'approved' ? 'success' :
                                apt.status === 'Pending' || apt.status === 'pending' ? 'warning' :
                                  apt.status === 'Completed' || apt.status === 'completed' || apt.status === 'Done' || apt.status === 'done' ? 'info' :
                                    apt.status === 'Rejected' || apt.status === 'rejected' ? 'danger' :
                                    'secondary'
                                }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td>
                              <div className="hstack gap-2 justify-content-end">
                                <button className="avatar-text avatar-md" title="View" onClick={() => handleViewPatientFromAppointment(apt)}>
                                  <FiEye />
                                </button>
                                <button className="avatar-text avatar-md" title="Edit" onClick={() => handleEditAppointment(apt)}>
                                  <FiEdit3 />
                                </button>
                                {/* <button className="avatar-text avatar-md" title="Print" onClick={() => handlePrintAppointment(apt.id)}>
                                  <FiPrinter />
                                </button> */}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            <div>
                              <FiFileText size={32} className="mb-2 opacity-50" />
                              <p className="mb-0">No appointments found</p>
                              <small>Create your first appointment to see it here</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex gap-2">
                  <Link to="/appointments/all-appointments" className="btn btn-sm btn-outline-primary">View All</Link>
                  <Link to="/appointments/book-appointment" className="btn btn-sm btn-outline-success">Book</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Prescriptions Table */}
          <div className="col-xxl-6">
            <div className="card stretch stretch-full">
              <CardHeader title="Recent Prescriptions" refresh={handleRefreshData} remove={null} expanded={null} />
              <div className="card-body custom-card-action p-0">
                <div className="table-responsive project-report-table">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Patient Name</th>
                        <th scope="col">Doctor</th>
                        <th scope="col">Medicines</th>
                        <th scope="col">Follow Date</th>
                        <th scope="col" className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrescriptions.sort((a, b) => new Date(b.created_at || b.createdAt || b.date) - new Date(a.created_at || a.createdAt || a.date)).slice(0, 5).map((p, index) => {
                        // ✅ Enhanced name normalization for prescriptions
                        const patientId = p.patient_id || p.patientId;
                        const doctorId = p.doctor_id || p.doctorId;

                        const patientName = getPatientNameById(patientId);
                        const doctorName = getDoctorNameById(doctorId);
                        const patientPhone = getPatientPhoneById(patientId);

                        const medicineCount = p.medicines?.length || 0;
                        const medicines =
                          p.medicines?.length > 0
                            ? p.medicines.map(m => m.medicine_name || m.name || 'Unknown').join(", ")
                            : 'No medicines';

                        // Format prescription date
                        const prescriptionDate = p.created_at || p.createdAt || p.date;
                        const formattedDate = prescriptionDate
                          ? new Date(prescriptionDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                          : '—';

                        // WhatsApp share function
                        const handleWhatsAppShare = () => {
                          const message = encodeURIComponent(
                            "Hello 👋, here is your prescription. Please check the PDF I’ve sent."
                          );

                          const encodedMessage = encodeURIComponent(message);
                          const whatsappUrl = `https://wa.me/${patientPhone}?text=${encodedMessage}`;
                          window.open(whatsappUrl, '_blank');
                        };

                        return (
                          <tr key={p.id || index}>
                            <td>
                              <div className="hstack gap-3">
                                {p.patient_image ? (
                                  <div className="avatar-image avatar-md">
                                    <img src={p.patient_image} alt="avatar" className="img-fluid" />
                                  </div>
                                ) : (
                                  <div className="text-white avatar-text user-avatar-text avatar-md bg-primary">
                                    {(patientName?.charAt(0) || "U").toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <span className="fw-semibold">{patientName}</span>
                                  <small className="text-muted d-block">{patientPhone}</small>
                                </div>
                              </div>
                            </td>
                            <td><span className="text-muted">{doctorName}</span></td>
                            <td>
                              <span className="text-muted text-truncate-1-line" style={{ maxWidth: '150px', display: 'inline-block' }}>
                                {medicineCount}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted">
                                {p.follow_up_date
                                  ? new Date(p.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
                                  : '—'}
                              </span>
                            </td>
                            <td>
                              <div className="hstack gap-2 justify-content-end">
                                <button
                                  className="avatar-text avatar-md text-success"
                                  title="Share via WhatsApp"
                                  onClick={handleWhatsAppShare}
                                >
                                  <FaWhatsapp />
                                </button>
                                <button
                                  className="avatar-text avatar-md"
                                  title="View"
                                  onClick={() => {
                                    setViewPrescription(p);
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <FiEye />
                                </button>
                                {role?.toLowerCase() !== 'receptionist' && (
                                  <button className="avatar-text avatar-md" title="Edit"
                                    onClick={() => {
                                      setEditPrescription(p);
                                    }}>
                                    <FiEdit3 />
                                  </button>
                                )}
                                <button className="avatar-text avatar-md" title="Print"
                                  onClick={() => handlePrintPrescription(p)}>
                                  <FiPrinter />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {allPrescriptions.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            <div>
                              <FiFileText size={32} className="mb-2 opacity-50" />
                              <p className="mb-0">No prescriptions found</p>
                              <small>Create your first prescription to see it here</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex gap-2">
                  <Link to="/prescriptions/all-prescriptions" className="btn btn-sm btn-outline-primary">View All</Link>
                  {role?.toLowerCase() !== 'receptionist' && (
                    <Link to="/prescriptions/create-prescription" className="btn btn-sm btn-outline-success">Create New</Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-xxl-4">
            <div className="card stretch stretch-full">
              <CardHeader title="Recent Activities" refresh={fetchActivityLogsFromBackend()} remove={null} expanded={null} />
              <div className="card-body custom-card-action">
                {recentActivities.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="hstack justify-content-between border border-dashed rounded-3 p-3 team-card chat-single-item">
                    <div className="hstack gap-3">
                      <div className="text-white avatar-text user-avatar-text">
                        <activity.icon size={16} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{activity.title}</div>
                        <div className="fs-11 text-muted">{activity.description}</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">
                        {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div className="d-flex flex-column align-items-center justify-content-center py-4 text-muted w-100 h-100">
                    <FiFileText size={32} className="mb-2 opacity-50" />
                    <p className="mb-0">No recent activities found</p>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <Link to="/clinic/activity" className="btn btn-primary">View All Activities</Link>
              </div>
            </div>
          </div>

          {/* Prescription Snapshot */}
          <div className="col-xxl-4">
            <div className="card stretch stretch-full">
              <CardHeader title="Prescription Snapshot" refresh={handleRefreshData} remove={null} expanded={null} />
              <div className="card-body custom-card-action">
                {/* Completed Prescriptions */}
                <div className="hstack justify-content-between border border-dashed rounded-3 p-3 team-card chat-single-item">
                  <div className="hstack gap-3">
                    <div className="text-white avatar-text user-avatar-text">
                      <FiFileText size={16} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Completed Prescriptions</div>
                      <div className="fs-11 text-muted">Completed vs total</div>
                    </div>
                  </div>
                  <div className="team-progress">
                    <CircleProgress value={Math.round((stats.completedPrescriptions / stats.totalPrescriptions) * 100) || 0} text_sym={"%"} path_width='6px' path_color="#17c666" />
                  </div>
                </div>
                {/* Active Prescriptions */}
                <div className="hstack justify-content-between border border-dashed rounded-3 p-3 team-card chat-single-item">
                  <div className="hstack gap-3">
                    <div className="text-white avatar-text user-avatar-text">
                      <FiActivity size={16} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Active Prescriptions</div>
                      <div className="fs-11 text-muted">Current medications</div>
                    </div>
                  </div>
                  <div className="team-progress">
                    <CircleProgress value={Math.round((stats.activePrescriptions / stats.totalPrescriptions) * 100) || 0} text_sym={"%"} path_width='6px' path_color="#3454d1" />
                  </div>
                </div>
                {/* Total Prescriptions */}
                <div className="hstack justify-content-between border border-dashed rounded-3 p-3 team-card chat-single-item">
                  <div className="hstack gap-3">
                    <div className="text-white avatar-text user-avatar-text">
                      <FiFileText size={16} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Total Prescriptions</div>
                      <div className="fs-11 text-muted">All within range</div>
                    </div>
                  </div>
                  <div className="team-progress">
                    <CircleProgress value={100} text_sym={"%"} path_width='6px' path_color="#ffa21d" />
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <Link to="/prescriptions/all-prescriptions" className="btn btn-primary">View Prescription Details</Link>
              </div>
            </div>
          </div>

          {/* Appointments Snapshot */}
          <div className="col-xxl-4">
            <div className="card stretch stretch-full">
              <CardHeader title="Appointments Snapshot" refresh={handleRefreshData} remove={null} expanded={null} />
              <div className="card-body custom-card-action">
                <div className="hstack justify-content-between border border-dashed rounded-3 p-3 team-card chat-single-item">
                  <div className="hstack gap-3">
                    <div className="text-white avatar-text user-avatar-text">
                      <FiCalendar size={16} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Today's Appointments</div>
                      <div className="fs-11 text-muted">Scheduled for today</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold fs-5">{stats.todayAppointments}</div>
                  </div>
                </div>
                <div className="hstack justify-content-between border border-dashed rounded-3 p-3 team-card chat-single-item">
                  <div className="hstack gap-3">
                    <div className="text-white avatar-text user-avatar-text">
                      <FiActivity size={16} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Pending</div>
                      <div className="fs-11 text-muted">Awaiting confirmation</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold fs-5">{stats.pendingAppointments}</div>
                  </div>
                </div>
                <div className="hstack justify-content-between border border-dashed rounded-3 p-3 team-card chat-single-item">
                  <div className="hstack gap-3">
                    <div className="text-white avatar-text user-avatar-text">
                      <FiTrendingUp size={16} />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">Completed</div>
                      <div className="fs-11 text-muted">Finished visits</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-semibold fs-5">{stats.completedAppointments}</div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <Link to="/appointments/all-appointments" className="btn btn-primary">Manage Appointments</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
      {viewModalOpen && viewPrescription && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Prescription Preview</h5>
                <button type="button" className="btn-close" onClick={() => setViewModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                {/* Reuse your PrescriptionViewPage */}
                <PrescriptionViewPage
                  prescription={viewPrescription}
                  hideHeader={true}     // hide PageHeader
                  isPrintMode={false}   // still allow print, share, edit icons
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {editPrescription && (
        <EditPrescriptionModal
          prescription={editPrescription}
          onClose={() => setEditPrescription(null)}
          onSave={() => {
            // Refresh prescriptions after save
            setEditPrescription(null);
          }}
        />
      )}

      {editAppointment && (
        <EditAppointmentModal
          appointment={editAppointment}
          onClose={() => setEditAppointment(null)}
          onSave={handleSaveAppointment}
        />
      )}

      {
        printPrescription && (
          <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
            <div ref={printRef}>
              <PrescriptionViewPage
                prescription={printPrescription}
                hideHeader={true}
                isPrintMode={true}
              />
            </div>
          </div>
        )
      }

      <Footer />
      {showPatientModal && selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          mode={"view"}
          close={() => setShowPatientModal(false)}
        />
      )}
    </>
  );
};

export default DashboardClinic;