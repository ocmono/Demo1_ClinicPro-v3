import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import Table from '@/components/shared/table/Table'
import { FiEdit3, FiEye, FiPrinter, FiTrash2, FiDownload } from 'react-icons/fi'
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../contentApi/AuthContext";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import PrescriptionViewPage from './PrescriptionViewPage';
import EditPrescriptionModal from './EditPrescriptionModal';
import DeleteConfirmationModal from '../../pages/clinic/settings/DeleteConfirmationModal';
import PatientModal from '../../components/patients/PatientModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { usePatient } from "../../context/PatientContext";
import { useBooking } from "../../contentApi/BookingProvider";

const RecentPrescriptionsTable = () => {
  const { user, role } = useAuth();
  const roleId = user ? user[`${user.role}Id`] : null;
  const roleName = user ? user[`${user.role}Name`] : null;

  // Role-based visibility flags
  const canDeleteAnyPrescription = ["super_admin", "clinic_admin"].includes(user?.role);
  const canViewAllPrescriptions = ["super_admin", "clinic_admin", "doctor"].includes(user?.role);
  const canEditAnyPrescription = ["super_admin", "clinic_admin"].includes(user?.role);
  const isPatient = user?.role === "patient";
  const isDoctor = user?.role === "doctor";

  const {
    allPrescriptions,
    setAllPrescriptions,
    fetchPrescriptions,
    deletePrescription,
  } = usePrescription();

  const [printPrescription, setPrintPrescription] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const printRef = useRef();
  const { doctors } = useBooking();
  const { patients } = usePatient();
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [pdfPrescription, setPdfPrescription] = useState(null);
  const pdfRef = useRef();

  const A4_PX_WIDTH = 794;
  const A4_PX_HEIGHT = 1123;

  // Date time settings from localStorage
  const getDateTimeSettings = useCallback(() => {
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
  }, []);

  // Format date according to settings
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    
    const settings = getDateTimeSettings();
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) return '—';
    
    try {
      switch (settings.dateFormat) {
        case 'DD/MM/YYYY':
          return date.toLocaleDateString('en-GB');
        case 'MM/DD/YYYY':
          return date.toLocaleDateString('en-US');
        case 'YYYY-MM-DD':
          return date.toISOString().split('T')[0];
        default:
          return date.toLocaleDateString('en-US');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  }, [getDateTimeSettings]);

  // Format time according to settings
  const formatTime = useCallback((timeStr) => {
    if (!timeStr) return '—';
    
    const settings = getDateTimeSettings();
    
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes || 0), 0);
      
      if (settings.timeFormat === '24h') {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr;
    }
  }, [getDateTimeSettings]);

  // Format date and time for display
  const formatDateTimeDisplay = useCallback((dateStr, timeStr) => {
    if (!dateStr) return '—';
    
    const formattedDate = formatDate(dateStr);
    const formattedTime = formatTime(timeStr);
    
    return (
      <div>
        <div>{formattedDate}</div>
        <div className="text-muted small">{formattedTime}</div>
      </div>
    );
  }, [formatDate, formatTime]);

  // Create lookup objects for better performance
  const patientLookup = useMemo(() => 
    patients.reduce((acc, patient) => {
      if (patient.id) acc[patient.id] = patient;
      if (patient.user?.id) acc[patient.user.id] = patient;
      return acc;
    }, {}),
    [patients]
  );

  const doctorLookup = useMemo(() => 
    doctors.reduce((acc, doctor) => {
      const docId = doctor.id || doctor.doctorId || doctor.user_id || doctor.user?.id || doctor._id;
      if (docId) acc[docId] = doctor;
      return acc;
    }, {}),
    [doctors]
  );

  // Helper functions
  const getPatientNameById = useCallback((patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return 'Unknown Patient';
    if (patient.user) {
      return `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() || 'Unknown Patient';
    }
    return patient.name || 'Unknown Patient';
  }, [patientLookup]);

  const getPatientEmailById = useCallback((patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return '';
    if (patient.user) {
      return patient.user.email || '';
    }
    return patient.email || '';
  }, [patientLookup]);

  const getDoctorNameById = useCallback((doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return 'Unknown Doctor';
    if (doctor.firstName || doctor.lastName) {
      return `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    }
    if (doctor.user) {
      return `${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.name || 'Unknown Doctor';
  }, [doctorLookup]);

  const getDoctorSpecialtyById = useCallback((doctorId) => {
    const doctor = doctorLookup[doctorId];
    if (!doctor) return '';
    return doctor.drSpeciality || doctor.specialty || '';
  }, [doctorLookup]);

  const getPatientPhoneById = useCallback((patientId) => {
    const patient = patientLookup[patientId];
    if (!patient) return "";
    if (patient.user) {
      return patient.user.phone;
    }
    if (patient.contact) {
      return patient.contact;
    }
    return patient.phone || patient.raw?.user?.phone || "";
  }, [patientLookup]);

  const canDeleteThisPrescription = useCallback((prescription) => {
    if (canDeleteAnyPrescription) return true;
    if (user?.role === 'doctor') {
      return (
        prescription.doctor_name === roleName ||
        prescription.doctor_id === roleId
      );
    }
    return false;
  }, [canDeleteAnyPrescription, user?.role, roleName, roleId]);

  // Event handlers
  const handlePatientNameClick = useCallback((prescription) => {
    const patientId = prescription.patient_id || prescription.patientId;
    const patient = patientLookup[patientId];
    if (patient) {
      setSelectedPatient(patient);
      setShowPatientModal(true);
    } else {
      console.log("Patient data not found");
      // toast.error("Patient data not found");
    }
  }, [patientLookup]);

  const handleViewPrescription = useCallback((prescription) => {
    setViewPrescription(prescription);
    setViewModalOpen(true);
  }, []);

  const handlePrint = useCallback((prescription) => {
    setPrintPrescription(prescription);
  }, []);

  const handleEdit = useCallback((prescription) => {
    setSelectedPrescription(prescription);
    setEditModalOpen(true);
  }, []);

  const handleSaveEditedPrescription = useCallback((updatedPrescription) => {
    const updatedList = allPrescriptions.map((pres) =>
      pres.id === updatedPrescription.id ? updatedPrescription : pres
    );
    setAllPrescriptions(updatedList);
  }, [allPrescriptions, setAllPrescriptions]);

  const handleDeleteClick = useCallback((prescription) => {
    setPrescriptionToDelete(prescription);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!prescriptionToDelete) return;
    try {
      await deletePrescription(prescriptionToDelete.id);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteModalOpen(false);
      setPrescriptionToDelete(null);
    }
  }, [prescriptionToDelete, deletePrescription]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setPrescriptionToDelete(null);
  }, []);

  const handleDownloadPDF = useCallback(async (prescription) => {
    setPdfPrescription(prescription);
    await new Promise(r => setTimeout(r, 50));
    await new Promise(requestAnimationFrame);

    if (!pdfRef.current) return;

    const node = pdfRef.current;
    const canvas = await html2canvas(node, {
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      windowWidth: A4_PX_WIDTH,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = { width: canvas.width, height: canvas.height };
    const pdfImgHeight = (imgProps.height * pdfPageWidth) / imgProps.width;

    let heightLeft = pdfImgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, pdfImgHeight);
    heightLeft -= pdfPageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfImgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, pdfImgHeight);
      heightLeft -= pdfPageHeight;
    }

    const fileName = generatePDFFileName(prescription);
    pdf.save(fileName);
    setPdfPrescription(null);
  }, []);

  const generatePDFFileName = useCallback((prescription) => {
    const patientName = prescription.patient_name ||
      getPatientNameById(prescription.patient_id || prescription.patientId) ||
      'UnknownPatient';

    const cleanPatientName = patientName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    let prescriptionDate = 'UnknownDate';
    if (prescription.appointment_date) {
      const date = new Date(prescription.appointment_date);
      prescriptionDate = format(date, 'dd-MMM-yyyy');
    } else if (prescription.created_at) {
      const date = new Date(prescription.created_at);
      prescriptionDate = format(date, 'dd-MMM-yyyy');
    }

    const clinicName = 'ClinicPro';
    const cleanClinicName = clinicName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    return `${cleanPatientName}+${prescriptionDate}+${cleanClinicName}.pdf`;
  }, [getPatientNameById]);

  // Print effect
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
    }, 300);

    return () => clearTimeout(timeout);
  }, [printPrescription]);

  // Filter for recent prescriptions (last 7 days)
  const today = new Date();
  const last7Days = subDays(today, 7);

  const getRoleFilteredPrescriptions = useCallback((prescriptions) => {
    if (Array.isArray(prescriptions) === false) return [];

    if (["super_admin", "clinic_admin"].includes(user?.role)) {
      return prescriptions;
    }
    if (isDoctor) {
      return prescriptions.filter((p) => {
        const matchesId =
          p.doctor_id?.toString() === roleId?.toString() ||
          p.doctorId?.toString() === roleId?.toString();

        const matchesName =
          p.doctor_name?.toLowerCase()?.includes(roleName?.toLowerCase() || '') ||
          p.doctor?.toLowerCase()?.includes(roleName?.toLowerCase() || '');

        return matchesId || matchesName;
      });
    }
    if (isPatient) {
      return prescriptions.filter(
        (p) =>
          p.patient_id?.toString() === roleId?.toString() ||
          p.patientId?.toString() === roleId?.toString()
      );
    }
    return prescriptions;
  }, [user?.role, isDoctor, roleId, roleName, isPatient]);

  const recentPrescriptions = useMemo(() => {
    let filtered = allPrescriptions;
    filtered = getRoleFilteredPrescriptions(filtered);

    return filtered.filter((prescription) => {
      const createdDateStr = prescription.created_at;
      if (!createdDateStr) return false;
      
      try {
        const createdDate = new Date(createdDateStr);
        return isWithinInterval(createdDate, {
          start: startOfDay(last7Days),
          end: endOfDay(today)
        });
      } catch (error) {
        console.error("Error parsing date:", createdDateStr);
        return false;
      }
    });
  }, [allPrescriptions, getRoleFilteredPrescriptions, last7Days, today]);

  const tableData = useMemo(() => 
    recentPrescriptions.map((p) => {
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
          specialty: p.doctor_specialty || getDoctorSpecialtyById(doctorId) || p.doctorSpecialty || p.doctorSpeciality || '',
          id: doctorId
        },
        phone: p.patient_phone || getPatientPhoneById(patientId) || "—",
        date: p.appointment_date || '—',
        time: p.appointment_time || '—',
        followup: p.follow_up_date || '—',
        medicines: p.medicines ? p.medicines.map(m => m.medicine_name || m.medicineName).join(", ") : '—',
        created_at: p.created_at || "—",
        // Sortable fields for proper date-time sorting
        sortableDateTime: p.appointment_date ? `${p.appointment_date}T${p.appointment_time || '00:00'}` : '',
        sortableCreatedAt: p.created_at ? new Date(p.created_at).toISOString() : '',
      };
    }),
    [recentPrescriptions, getPatientNameById, getPatientEmailById, getPatientPhoneById, getDoctorNameById, getDoctorSpecialtyById]
  );

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      ),
      meta: { headerClassName: 'width-30' },
    },
    {
      accessorKey: 'patient_name',
      header: () => 'Patient Name',
      cell: (info) => {
        const patientName = info.getValue();
        const patient = info.row.original.name;
        const prescription = info.row.original;
        return (
          <a href="#" className="hstack gap-3 text-decoration-none" onClick={(e) => { e.preventDefault(); handlePatientNameClick(prescription); }}>
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
      accessorKey: 'doctor_name',
      header: () => 'Doctor',
      cell: (info) => {
        const doctorName = info.getValue();
        const doctor = info.row.original.doctor;
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
      accessorKey: 'sortableDateTime',
      header: 'Appt. Date & Time',
      cell: ({ row }) => {
        const apptDate = row.original.date;
        const apptTime = row.original.time;
        return formatDateTimeDisplay(apptDate, apptTime);
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
            hour12: false,
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
                  handleEdit(fullPrescription);
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
              let phone = getPatientPhoneById(fullPrescription.patient_id || fullPrescription.patientId);
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
        </div>
      ),
      meta: { headerClassName: 'text-end' }
    },
  ], [
    handlePatientNameClick, 
    formatDateTimeDisplay, 
    formatDate, 
    allPrescriptions, 
    handleViewPrescription, 
    role, 
    handleEdit, 
    handlePrint, 
    getPatientPhoneById, 
    handleDownloadPDF
  ]);

  return (
    <>
      {/* Table Header with Title */}
      {/* <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="card-title mb-0">Recent Prescriptions (Last 7 Days)</h5>
        <div className="text-muted small">
          Showing {tableData.length} prescription{tableData.length !== 1 ? 's' : ''}
        </div>
      </div> */}

      <Table 
        data={tableData} 
        columns={columns} 
        emptyMessage={"No recent prescriptions found"} 
        defaultSorting={[{ id: 'sortableCreatedAt', desc: true }]} 
        cardHeader={<h5 class="card-title mb-0">Recent Prescriptions (Last 7 Days)</h5>}
      />

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
            background: '#ffffff',
            padding: 16,
            zIndex: -1,
            opacity: 0,
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

export default RecentPrescriptionsTable