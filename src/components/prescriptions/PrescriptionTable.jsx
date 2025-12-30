import React, { useEffect, useRef, useState } from 'react'
import Table from '@/components/shared/table/Table'
import { FiEdit3, FiEye, FiPrinter, FiTrash2, FiDownload } from 'react-icons/fi'
import { FaWhatsapp } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { toast } from "react-toastify";
import { useAuth } from "../../contentApi/AuthContext";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { format, subDays } from "date-fns";
import PrescriptionViewPage from './PrescriptionViewPage';
import EditPrescriptionModal from './EditPrescriptionModal';
import DeleteConfirmationModal from '../../pages/clinic/settings/DeleteConfirmationModal';
import PatientModal from '../patients/PatientModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { usePatient } from "../../context/PatientContext";
import { useBooking } from "../../contentApi/BookingProvider";
import { RxCross2 } from "react-icons/rx";

const PrescriptionTable = ({ patientIdFromUrl }) => {
  const { user, role } = useAuth();
  const roleId = user ? user[`${user.role}Id`] : null;
  const roleName = user ? user[`${user.role}Name`] : null;
  const [patientFilter, setPatientFilter] = useState(null);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Role-based visibility flags
  const canDeleteAnyPrescription = ["super_admin", "clinic_admin"].includes(user?.role);
  // const canViewAllPrescriptions = ["super_admin", "clinic_admin", "doctor"].includes(user?.role);
  // const canEditAnyPrescription = ["super_admin", "clinic_admin"].includes(user?.role);
  // const isPatient = user?.role === "patient";
  // const isDoctor = user?.role === "doctor";

  // Role-based access control similar to AppointmentApprovedTable
  const isDoctor = user?.role === 'doctor';
  const isAdmin = ['super_admin', 'clinic_admin'].includes(user?.role);
  const isPatient = user?.role === 'patient';
  const canViewAllPrescriptions = isAdmin || isDoctor;
  const canManageRoles = ["super_admin", "clinic_admin", "doctor", "receptionist", "pharmacist"];
  const canManage = user && canManageRoles.includes(user.role);

  const {
    allPrescriptions,
    setAllPrescriptions,
    fetchPrescriptions,
    prescriptionFilter,
    deletePrescription,
    getPrescriptionsByPatientId,
  } = usePrescription();

  const [printPrescription, setPrintPrescription] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const printRef = useRef();
  const { doctors } = useBooking();
  const { patients } = usePatient();
  const [modalMode, setModalMode] = useState("view");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    console.log("Doctors from BookingContext:", doctors);
  }, [doctors]);

  // Create lookup objects for better performance
  const patientLookup = patients.reduce((acc, patient) => {
    if (patient.id) acc[patient.id] = patient;
    if (patient.user?.id) acc[patient.user.id] = patient;
    return acc;
  }, {});

  const handleViewPrescription = (prescription) => {
    setViewPrescription(prescription);
    setViewModalOpen(true);
  };

  const doctorLookup = doctors.reduce((acc, doctor) => {
    const docId = doctor.id || doctor.doctorId || doctor.user_id || doctor.user?.id || doctor._id;
    if (docId) acc[docId] = doctor;
    return acc;
  }, {});

  // Get date time settings from localStorage
  const getDateTimeSettings = () => {
    try {
      const settings = localStorage.getItem('dateTimeSettings');
      return settings ? JSON.parse(settings) : {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'Asia/Calcutta'
      };
    } catch (error) {
      console.error('Error loading dateTimeSettings:', error);
      return {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'Asia/Calcutta'
      };
    }
  };

  // Function to format date according to settings
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    
    const settings = getDateTimeSettings();
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) return '—';
    
    try {
      switch (settings.dateFormat) {
        case 'DD/MM/YYYY':
          return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
        case 'MM/DD/YYYY':
          return date.toLocaleDateString('en-US'); // MM/DD/YYYY
        case 'YYYY-MM-DD':
          return date.toISOString().split('T')[0]; // YYYY-MM-DD
        default:
          return date.toLocaleDateString('en-US'); // Default to MM/DD/YYYY
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr; // Return original string if formatting fails
    }
  };

  // Function to format time according to settings
  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    
    const settings = getDateTimeSettings();
    
    try {
      // Create a date object with today's date and the given time
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes || 0), 0);
      
      if (settings.timeFormat === '24h') {
        // 24-hour format
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        // 12-hour format (default)
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr; // Return original string if formatting fails
    }
  };

  // Function to format date and time for display
  const formatDateTimeDisplay = (dateStr, timeStr) => {
    if (!dateStr) return '—';
    
    const formattedDate = formatDate(dateStr);
    const formattedTime = formatTime(timeStr);
    
    return (
      <div>
        <div>{formattedDate}</div>
        <div className="text-muted small">{formattedTime}</div>
      </div>
    );
  };

  // Fetch prescriptions based on patient filter
  useEffect(() => {
    const fetchFilteredPrescriptions = async () => {
      setIsLoading(true);
      try {
        if (patientFilter && patientFilter.patientId) {
          console.log("Fetching prescriptions for patient:", patientFilter);
          // Fetch patient-specific prescriptions
          const patientPrescriptions = await getPrescriptionsByPatientId(patientFilter.patientId);
          console.log("Patient prescriptions:", patientPrescriptions);
          setFilteredPrescriptions(patientPrescriptions);
        } else {
          // Use all prescriptions and apply other filters
          let filtered = allPrescriptions;

          // Apply date filter
          if (prescriptionFilter === "today") {
            filtered = filtered.filter((prescription) => {
              const createdDate = prescription.created_at?.split(",")[0]?.trim();
              return createdDate === format(today, "dd MMM yyyy");
            });
          } else if (prescriptionFilter === "weekly") {
            filtered = filtered.filter((prescription) => {
              const createdDateStr = prescription.created_at?.split(",")[0]?.trim();
              const createdDate = new Date(createdDateStr + " " + today.getFullYear());
              return createdDate >= last7Days && createdDate <= today;
            });
          }

          // Apply role-based filtering
          if (isDoctor) {
            filtered = filtered.filter((p) => {
              const matchesId =
                p.doctor_id?.toString() === roleId?.toString() ||
                p.doctorId?.toString() === roleId?.toString();

              const matchesName =
                p.doctor_name?.toLowerCase()?.includes(roleName?.toLowerCase() || '') ||
                p.doctor?.toLowerCase()?.includes(roleName?.toLowerCase() || '');

              return matchesId || matchesName;
            });
          } else if (isPatient) {
            filtered = filtered.filter((p) => p.patient_id?.toString() === roleId?.toString());
          }

          setFilteredPrescriptions(filtered);
        }
      } catch (error) {
        console.error("Error fetching filtered prescriptions:", error);
        // toast.error("Failed to load prescriptions");
        setFilteredPrescriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredPrescriptions();
  }, [patientFilter, allPrescriptions, prescriptionFilter, getPrescriptionsByPatientId, canViewAllPrescriptions, isPatient, roleId]);

  // Set up patient filter from URL or localStorage
  useEffect(() => {
    const setupPatientFilter = async () => {
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const patientIdFromUrl = urlParams.get('patient_id');

      // Check localStorage for patient filter
      const storedFilter = localStorage.getItem('prescriptionPatientFilter');

      let patientData = null;

      if (storedFilter) {
        patientData = JSON.parse(storedFilter);
        localStorage.removeItem('prescriptionPatientFilter');
      } else if (patientIdFromUrl) {
        // Try to get patient name from lookup
        const patient = patientLookup[patientIdFromUrl];
        patientData = {
          patientId: patientIdFromUrl,
          patientName: patient ?
            (patient.user ? `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() : patient.name)
            : 'Patient'
        };
      } else if (patientIdFromUrl) { // from props
        const patient = patientLookup[patientIdFromUrl];
        patientData = {
          patientId: patientIdFromUrl,
          patientName: patient ?
            (patient.user ? `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() : patient.name)
            : 'Patient'
        };
      }

      if (patientData) {
        console.log("Setting patient filter:", patientData);
        setPatientFilter(patientData);
      }
    };

    setupPatientFilter();
  }, []);

  // Helper function to get patient name by ID
  const getPatientNameById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return 'Unknown Patient';

    // Handle both patient structures
    if (patient.user) {
      return `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || 'Unknown Patient';
    }
    return patient.name || 'Unknown Patient';
  };

  // Helper function to get patient email by ID
  const getPatientEmailById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return '';

    // Handle both patient structures
    if (patient.user) {
      return patient.user.email || '';
    }
    return patient.email || '';
  };

  // Helper function to get doctor name by ID
  const getDoctorNameById = (doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return 'Unknown Doctor';

    if (doctor.firstName || doctor.lastName) {
      return `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    }
    if (doctor.user) {
      return `${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.name || 'Unknown Doctor';
  };

  // Helper function to get doctor specialty by ID
  const getDoctorSpecialtyById = (doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return '';

    return doctor.drSpeciality || doctor.specialty || '';
  };

  const getPatientPhoneById = (patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return "";

    if (patient.user) {
      return patient.user.phone;
    }
    if (patient.contact) {
      return patient.contact;
    }
    return patient.phone || patient.raw?.user?.phone || "";
  };
  console.log("patientLookup:", patientLookup);

  const clearPatientFilter = () => {
    setPatientFilter(null);
    // Also clear from URL if present
    const url = new URL(window.location);
    url.searchParams.delete('patient_id');
    url.searchParams.delete('patient_name');
    window.history.replaceState({}, '', url);
  };


  const handlePrint = (prescription) => {
    setPrintPrescription(prescription); // This is the full object now
  };

  useEffect(() => {
    if (!printPrescription) return;

    const timeout = setTimeout(() => {
      if (!printRef.current) {
        console.error("❌ printRef not ready.");
        return;
      }

      const printWindow = window.open("", "_blank", "width=800,height=700");
      if (!printWindow) {
        alert("Popup blocked. Please allow popups for this site.");
        return;
      }

      const html = `
      <html>
        <head>
          <title>Print Prescription</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            th {
              background: #f9f9f9;
            }
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
        const clonedContent = printRef.current.cloneNode(true);
        const target = printWindow.document.getElementById("print-root");

        if (target && clonedContent) {
          target.appendChild(clonedContent);
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }, 500);
        }
      };

      setPrintPrescription(null);
    }, 300); // ensure <PrescriptionView> has rendered

    return () => clearTimeout(timeout);
  }, [printPrescription]);

  const handleDeleteClick = (prescription) => {
    setPrescriptionToDelete(prescription);
    setDeleteModalOpen(true);
  };

  const handlePatientNameClick = (prescription) => {
    const patientId = prescription.patient_id || prescription.patientId;
    const patient = patientLookup[patientId];

    if (patient) {
      setSelectedPatient(patient);
      setShowPatientModal(true);
    } else {
      toast.error("Patient data not found");
    }
  }

  const handleDeleteConfirm = async () => {
    if (!prescriptionToDelete) return;

    try {
      await deletePrescription(prescriptionToDelete.id);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteModalOpen(false);
      setPrescriptionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setPrescriptionToDelete(null);
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);

  const today = new Date();
  const last7Days = subDays(today, 6);
  const A4_PX_WIDTH = 794;   // 210mm
  const A4_PX_HEIGHT = 1123; // 297mm

  // Filter prescriptions based on user role
  const getRoleFilteredPrescriptions = (prescriptions) => {
    if (canViewAllPrescriptions) {
      return prescriptions;
    }
    if (isPatient) {
      return prescriptions.filter(p => p.patient_id === roleId);
    }
    return prescriptions;
  };

  console.log("Filtered Prescriptions:", allPrescriptions);

  const getTitle = () => {
    switch (prescriptionFilter) {  
      case "today":
        return "Today's Prescriptions";
      case "weekly":
        return "This Week's Prescriptions";
      default:
        return "All Prescriptions";
    }
  };

  const tableData = React.useMemo(() => {
    return filteredPrescriptions.map((p) => {
      const patientId = p.patient_id || p.patientId;
      const doctorId = p.doctor_id || p.doctorId;
  
      return {
        ...p,
        id: p.id || p._id,
        patient_name: p.patient_name || getPatientNameById(patientId) || 'Unknown Patient',
        doctor_name: p.doctor_name || getDoctorNameById(doctorId) || 'Unknown Doctor',
        name: {
          name: p.patient_name || getPatientNameById(patientId) || 'Unknown Patient',
          email: p.patient_email || getPatientEmailById(patientId) || '',
          phone: p.patient_phone || getPatientPhoneById(patientId) || '',
          img: p?.images?.[0] ? URL.createObjectURL(p.images[0]) : null
        },
        doctor: {
          name: p.doctor_name || getDoctorNameById(doctorId) || 'Unknown Doctor',
          specialty:
            p.doctor_specialty ||
            getDoctorSpecialtyById(doctorId) ||
            p.doctorSpecialty ||
            p.doctorSpeciality ||
            '',
          id: doctorId,
        },
        phone: p.patient_phone || getPatientPhoneById(patientId) || '—',
        date: p.appointment_date || '—',
        time: p.appointment_time || '—',
        followup: p.follow_up_date || '—',
        medicines: p.medicines
          ? p.medicines.map(m => m.medicine_name || m.medicineName).join(', ')
          : '—',
        created_at: p.created_at || '—',
        // Sortable fields for proper date-time sorting
        sortableDateTime: p.appointment_date ? `${p.appointment_date}T${p.appointment_time || '00:00'}` : '',
        sortableCreatedAt: p.created_at ? new Date(p.created_at).toISOString() : '',
      };
    });
  }, [filteredPrescriptions]);
  

  const handleEdit = (prescription) => {
    setSelectedPrescription(prescription);
    setEditModalOpen(true);
  };

  const handleSaveEditedPrescription = (updatedPrescription) => {
    const updatedList = allPrescriptions.map((pres) =>
      pres.id === updatedPrescription.id ? updatedPrescription : pres
    );
    setAllPrescriptions(updatedList);
  };

  const handleRefresh = () => {
    fetchPrescriptions();
  };

  // Function to check if the user can delete a specific prescription
  const canDeleteThisPrescription = (prescription) => {
    // Admin roles can delete any prescription
    if (canDeleteAnyPrescription) {
      return true;
    }

    // Doctors can only delete their own prescriptions
    if (user?.role === 'doctor') {
      return (
        prescription.doctor_name === roleName ||
        prescription.doctor_id === roleId
      );
    }

    return false;
  };

  // Function to check if the user can edit a specific prescription
  const canEditThisPrescription = (prescription) => {
    // Admin roles can edit any prescription
    if (canEditAnyPrescription) {
      return {
        canEdit: true,
        tooltip: "Edit (Admin)"
      };
    }

    // Doctors can only edit their own prescriptions
    if (isDoctor) {
      const isOwnPrescription = prescription.doctor_name === roleName || prescription.doctor_id === roleId;
      return {
        canEdit: isOwnPrescription,
        tooltip: isOwnPrescription ? "Edit Own Prescription" : "Cannot edit other doctor's prescription"
      };
    }

    return {
      canEdit: false,
      tooltip: "No edit permission"
    };
  };

  const [pdfPrescription, setPdfPrescription] = useState(null);
  const pdfRef = useRef();

  // PDF export handler
  const handleDownloadPDF = async (prescription) => {
    setPdfPrescription(prescription);

    // wait for React to render the hidden page
    await new Promise(r => setTimeout(r, 50));
    await new Promise(requestAnimationFrame);

    if (!pdfRef.current) return;

    const node = pdfRef.current;

    // snapshot with better quality + white background
    const canvas = await html2canvas(node, {
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      windowWidth: A4_PX_WIDTH, // helps layout
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF and paginate if needed
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfPageWidth = pdf.internal.pageSize.getWidth();   // 210
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297

    // scale the captured image to PDF width
    const imgProps = { width: canvas.width, height: canvas.height };
    const pdfImgHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

    let heightLeft = pdfImgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, pdfImgHeight);
    heightLeft -= pdfPageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfImgHeight; // shift image up for next page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, pdfImgHeight);
      heightLeft -= pdfPageHeight;
    }

    // Generate filename in format: patientname+prescriptiondate+clinicname.pdf
    const fileName = generatePDFFileName(prescription);
    pdf.save(fileName);
    setPdfPrescription(null);
  };

  // Helper function to generate PDF filename
  const generatePDFFileName = (prescription) => {
    // Get patient name
    const patientName = prescription.patient_name ||
      getPatientNameById(prescription.patient_id || prescription.patientId) ||
      'UnknownPatient';

    // Clean patient name: remove special characters and replace spaces with underscores
    const cleanPatientName = patientName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase();

    // Get prescription date
    let prescriptionDate = 'UnknownDate';
    if (prescription.appointment_date) {
      const date = new Date(prescription.appointment_date);
      prescriptionDate = format(date, 'dd-MMM-yyyy'); // Format: 15-Dec-2024
    } else if (prescription.created_at) {
      const date = new Date(prescription.created_at);
      prescriptionDate = format(date, 'dd-MMM-yyyy');
    }

    // Clinic name (you might need to get this from your context or config)
    const clinicName = 'ClinicPro'; // Replace with actual clinic name from your system
    const cleanClinicName = clinicName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    // Construct filename
    return `${cleanPatientName}+${prescriptionDate}+${cleanClinicName}.pdf`;
  };

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      ),
      meta: {
        headerClassName: 'width-30',
      },
    },
    {
      accessorKey: 'patient_name',
      header: () => 'Patient Name',
      cell: (info) => {
        const patientName = info.getValue();
        const patient = info.row.original.name;
        const prescription = info.row.original;
        return (
          <a href="#" className="hstack gap-3" onClick={(e) => { e.preventDefault(); handlePatientNameClick(prescription); }}>
            {patient?.img ? (
              <div className="avatar-image avatar-md">
                <img src={patient.img} alt="avatar" className="img-fluid" />
              </div>
            ) : (
              <div className="text-white avatar-text user-avatar-text avatar-md">
                {(patientName?.charAt(0) || "U").toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-truncate-1-line">{patientName || "Unknown Patient"}</span>
              <small className="fs-12 fw-normal text-muted">{patient?.email || "No email"}</small>
            </div>
          </a>
        );
      }
    },
    {
      accessorKey: 'doctor_name', // Change this to use the direct property
      header: () => 'Doctor',
      cell: (info) => {
        const doctorName = info.getValue();
        const doctor = info.row.original.doctor; // Get the nested doctor object for specialty

        return (
          <div>
            <span className="text-truncate-1-line fw-medium">{doctorName || 'Unknown Doctor'}</span>
            {doctor?.specialty && (
              <small className="fs-12 fw-normal text-muted d-block">{doctor.specialty}</small>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'sortableDateTime', // Use the sortable field as accessor
      header: 'Appt. Date & Time',
      cell: ({ row }) => {
        const apptDate = row.original.date;
        const apptTime = row.original.time;

        return formatDateTimeDisplay(apptDate, apptTime);
      },
      // Add sorting function for proper date-time sorting
      sortingFn: (rowA, rowB, columnId) => {
        const dateTimeA = rowA.getValue(columnId);
        const dateTimeB = rowB.getValue(columnId);

        if (!dateTimeA && !dateTimeB) return 0;
        if (!dateTimeA) return -1;
        if (!dateTimeB) return 1;

        return new Date(dateTimeA) - new Date(dateTimeB);
      }
    },
    {
      accessorKey: 'sortableCreatedAt',
      header: 'Created Date',
      cell: ({ row }) => {
        const created = row.original.created_at;
        if (!created) return " ";

        const d = new Date(created);
        if (isNaN(d)) return created;

        return formatDateTimeDisplay(
          d.toISOString().split("T")[0],
          d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Will be formatted by formatTime function
          })
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateTimeA = rowA.getValue(columnId);
        const dateTimeB = rowB.getValue(columnId);

        if (!dateTimeA && !dateTimeB) return 0;
        if (!dateTimeA) return -1;
        if (!dateTimeB) return 1;

        return new Date(dateTimeA) - new Date(dateTimeB);
      }
    },
    {
      accessorKey: 'followup',
      header: () => 'Follow Up',
      cell: (info) => {
        const followupDate = info.getValue();
        return followupDate && followupDate !== '—' ? formatDate(followupDate) : '—';
      }
    },
    {
      accessorKey: 'medicines',
      header: () => 'Medicines/Vaccines',
      cell: (info) => {
        const medicines = info.getValue();
        if (!medicines || medicines === '—') return '—';

        const medicineArray = typeof medicines === 'string'
          ? medicines.split(', ').filter(m => m.trim())
          : [];

        if (medicineArray.length === 0) return '—';

        // Join with comma and truncate
        const medicinesText = medicineArray.join(', ');
        const maxLength = 20;

        if (medicinesText.length <= maxLength) {
          return <span title={medicinesText}>{medicinesText}</span>;
        }

        return (
          <span title={medicinesText}>
            {medicinesText.substring(0, maxLength)}...
            <small className="text-muted ms-1">({medicineArray.length})</small>
          </span>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: () => "Actions",
      cell: info => (
        <div className="hstack gap-2">
          <button
            className="avatar-text avatar-md"
            title="View"
            onClick={() => {
              const rowData = info.row.original;
              const fullPrescription = allPrescriptions.find(p => p.id === rowData.id);
              if (fullPrescription) {
                handleViewPrescription(fullPrescription);
              } else {
                toast.error("Prescription not found");
              }
            }}
          >
            <FiEye />
          </button>
          {role?.toLowerCase() !== 'receptionist' && (
            <button
              className="avatar-text avatar-md"
              title="Edit Prescription"
              onClick={() => {
                const rowData = info.row.original;
                const fullPrescription = allPrescriptions.find(p => p.id === rowData.id);
                if (fullPrescription) {
                  setSelectedPrescription(fullPrescription);
                  setEditModalOpen(true);
                } else {
                  toast.error("Prescription not found");
                }
              }}
            >
              <FiEdit3 />
            </button>
          )}
          <button
            className="avatar-text avatar-md"
            title="Print"
            onClick={() => {
              const rowData = info.row.original;
              const fullPrescription = allPrescriptions.find(p => p.id === rowData.id);
              if (fullPrescription) {
                handlePrint(fullPrescription);
              } else {
                toast.error("Prescription data not found");
              }
            }}
          >
            <FiPrinter />
          </button>
          <button
            className="avatar-text avatar-md text-success"
            title="Send via WhatsApp"
            onClick={() => {
              const rowData = info.row.original;
              const fullPrescription = allPrescriptions.find(p => p.id === rowData.id);

              if (!fullPrescription) {
                toast.error("Prescription data not found");
                return;
              }

              let phone =
                fullPrescription.patient_phone ||
                fullPrescription.phone ||
                getPatientPhoneById(fullPrescription.patient_id || fullPrescription.patientId);

              console.log("resolved phone:", getPatientPhoneById(fullPrescription.patient_id));

              if (!phone) {
                toast.error("Patient phone number not available");
                return;
              }

              phone = phone.replace(/\D/g, "");
              if (!phone.startsWith("91")) {
                phone = "91" + phone;
              }

              const message = encodeURIComponent(
                "Hello 👋, here is your prescription. Please check the PDF I've sent."
              );
              const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
              window.open(whatsappUrl, "_blank");
            }}
          >
            <FaWhatsapp />
          </button>
          <button
            className="avatar-text avatar-md"
            title="Download PDF"
            onClick={() => {
              const rowData = info.row.original;
              const fullPrescription = allPrescriptions.find(p => p.id === rowData.id);
              if (fullPrescription) {
                handleDownloadPDF(fullPrescription);
              } else {
                toast.error("Prescription data not found");
              }
            }}
          >
            <FiDownload />
          </button>
          {canDeleteThisPrescription(info.row.original) && (
            <button
              className="avatar-text avatar-md text-danger"
              title="Delete Prescription"
              onClick={() => handleDeleteClick(info.row.original)}
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      ),
      meta: {
        headerClassName: 'text-end'
      }
    },
  ]
  return (
    <>
      {isLoading && (
        <div className="alert alert-info mb-3">
          <strong>Loading prescriptions...</strong>
        </div>
      )}
      {patientFilter && !isLoading && (
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>Filtered by Patient:</strong> {patientFilter.patientName}
            {patientFilter.patientId && ` (ID: ${patientFilter.patientId})`}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={clearPatientFilter}
          >
            Clear Filter
          </button>
        </div>
      )}
      <Table data={tableData} columns={columns} emptyMessage={patientFilter ? `No prescriptions found for ${patientFilter.patientName}` : "No Prescription Data found"} defaultSorting={[{ id: 'id', desc: true }]} cardHeader={<h5 class="card-title mb-0">All Prescription List</h5>} />
      {/* Hidden Printable View */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {printPrescription && (
          <div ref={printRef}>
            <PrescriptionViewPage prescription={printPrescription} isPrintMode />
          </div>
        )}
      </div>
      {/* Hidden PDF render for export */}
      {pdfPrescription && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: A4_PX_WIDTH,
            // Make sure it lays out like a page
            background: '#ffffff',
            padding: 16,
            zIndex: -1,
            opacity: 0,          // hide but keep it in normal flow for correct width
            pointerEvents: 'none'
          }}
        >
          <div ref={pdfRef} style={{ width: A4_PX_WIDTH }}>
            <PrescriptionViewPage
              prescription={pdfPrescription}
              hideHeader={true}
              isPrintMode={true}
            />
          </div>
        </div>
      )}

      {editModalOpen && (
        <EditPrescriptionModal
          prescription={selectedPrescription}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveEditedPrescription}
        />
      )}

      {viewModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Prescription Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <PrescriptionViewPage
                  prescription={viewPrescription}
                  hideHeader={true}
                  isPrintMode={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Prescription"
        message={`Are you sure you want to delete the prescription for ${prescriptionToDelete?.patient_name || 'this patient'}? This action cannot be undone.`}
        confirmText="Delete Prescription"
        cancelText="Cancel"
      />
      {
        showPatientModal && selectedPatient && (
          <PatientModal
            patient={selectedPatient}
            mode={"view"}
            close={() => setShowPatientModal(false)}
          />
        )
      }
    </>
  )
}

export default PrescriptionTable