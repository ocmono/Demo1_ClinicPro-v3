import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { usePatient } from "../../context/PatientContext";
import { useAppointments } from "../../context/AppointmentContext";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { toast } from "react-toastify";
import { useVaccine } from "../../context/VaccineContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contentApi/AuthContext';
import { FiEdit3 } from "react-icons/fi";
import VaccineScheduleTab from "../vaccine/VaccineScheduleTab";

// Import the new tab components
import Overview from "./modal/Overview";
import Vitals from "./modal/Vitals";
import Lifestyle from "./modal/Lifestyle";
import Vaccine from "./modal/Vaccine";
import Images from "./modal/Images";

const PatientModal = ({ patient, mode, close }) => {
  const { addPatient, updatePatient, refreshPatient, patients } = usePatient();
  const { appointments } = useAppointments();
  const { user, role } = useAuth();
  const { patients: prescriptionPatients, getPrescriptionsByPatientId, setPrescriptionFormData } = usePrescription();
  const navigate = useNavigate();
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  // Get the latest patient data from context
  const latestPatient = patients.find(p => p.id === patient?.id) || patient;
  console.log("Latest Patient", latestPatient);
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      // split comma-separated strings, trim, drop empties
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return val == null ? [] : [val]; // single value -> array, null/undefined -> []
  };
  const [formData, setFormData] = useState(() => {
    console.log("Patient data received", patient)
    // If patient data comes from your API with user/profile structure
    if (patient?.user) {
      return {
        id: patient.user.id,
        name: `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim(),
        email: patient.user.email || '',
        contact: patient.user.phone || '',
        age: patient.user.age || '',
        gender: patient.user.gender || '',
        // Profile fields
        weight: patient.profile?.weight || '',
        bloodGroup: patient.profile?.bloodGroup || '',
        address: patient.profile?.address || '',
        allergies: toArray(patient.profile?.allergies),
        images: toArray(patient.profile?.image_urls) || [],
        dob: patient.user.dob || '',
        // Keep raw data for reference
        raw: patient
      };
    }
    // If patient data is already flattened
    else if (patient) {
      return {
        ...patient,
        dob: patient.dob || '',
        allergies: toArray(patient.allergies),
        images: patient.images || patient.profile?.image_urls || patient.image_urls || [],
      };
    }
    // New patient
    else {
      return {
        name: '',
        email: '',
        contact: '',
        age: '',
        dob: '',
        gender: '',
        weight: '',
        bloodGroup: '',
        address: '',
        allergies: [],
        images: []
      };
    }
  });
  console.log("Patient Modal Data:", formData);
  const [newAllergy, setNewAllergy] = useState("");
  const [tempImages, setTempImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef(null);
  const previewRef = useRef(null);
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Enhanced theme colors with gradients and modern styling
  const themeColors = {
    primary: "#3454d1",
    secondary: "#6b7885",
    success: "#17c666",
    info: "#3dc7be",
    warning: "#ffa21d",
    danger: "#d13b4c",
    dark: "#283c50",
    light: "#f8fafc",
    border: "#e2e8f0",
    text: "#475569",
    textLight: "#64748b",
    textDark: "#1e293b",
    white: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
    // Enhanced gradients
    primaryGradient: "linear-gradient(135deg, #3454d1 0%, #4f6bff 100%)",
    successGradient: "linear-gradient(135deg, #17c666 0%, #20e676 100%)",
    infoGradient: "linear-gradient(135deg, #3dc7be 0%, #4fd1c7 100%)",
    warningGradient: "linear-gradient(135deg, #ffa21d 0%, #ffb84d 100%)",
    dangerGradient: "linear-gradient(135deg, #d13b4c 0%, #ef4444 100%)",
    glass: "rgba(255, 255, 255, 0.1)",
    glassBorder: "rgba(255, 255, 255, 0.2)",
  };

  // Enhanced theme-based styling constants
  const themeStyles = {
    backdrop: {
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(8px)",
    },
    modal: {
      background: themeColors.white,
      borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    card: {
      background: themeColors.white,
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)",
      border: `1px solid ${themeColors.border}`,
      transition: "all 0.3s ease",
    },
    button: {
      borderRadius: "10px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    input: {
      borderRadius: "10px",
      border: `2px solid ${themeColors.border}`,
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    tab: {
      borderRadius: "10px",
      transition: "all 0.3s ease",
    },
    badge: {
      borderRadius: "8px",
      fontWeight: "600",
    },
    avatar: {
      borderRadius: "50%",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    glass: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return as-is if invalid

      // Format: dd-mm-yyyy (e.g., 15-01-2023)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      // Format: yyyy-mm-dd for input[type="date"]
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  const calculateAgeFromDOB = (dob) => {
    if (!dob) return '';

    try {
      const birthDate = new Date(dob);
      const today = new Date();

      if (isNaN(birthDate.getTime())) return '';

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age.toString();
    } catch (error) {
      return '';
    }
  };

  // Fetch prescriptions when patient changes
  useEffect(() => {
    const fetchPatientPrescriptions = async () => {
      if (patient?.id) {
        try {
          console.log(`Fetching prescriptions for patient ID: ${patient.id}`);
          const prescriptions = await getPrescriptionsByPatientId(patient.id);
          console.log(`Found ${prescriptions.length} prescriptions for patient ${patient.id}:`, prescriptions);
          setPatientPrescriptions(prescriptions);
        } catch (error) {
          console.error("Error fetching patient prescriptions:", error);
          setPatientPrescriptions([]);
        }
      }
    };

    if (mode === "view" && patient?.id) {
      fetchPatientPrescriptions();
    }
  }, [patient?.id, mode, getPrescriptionsByPatientId]);

  // Calculate patient statistics
  const patientStats = useMemo(() => {
    const appointmentCount = appointments.filter(apt => apt.patientId === patient.id || apt.name === patient.name).length;
    const prescriptionCount = patientPrescriptions.length;
    console.log("Count", prescriptionCount);
    const lastAppointment = appointments
      .filter(apt => apt.patientId === patient.id || apt.name === patient.name)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const lastPrescription = patientPrescriptions
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0];
    return {
      appointmentCount,
      prescriptionCount,
      lastAppointment,
      lastPrescription
    };
  }, [appointments, patientPrescriptions, patient?.id, patient?.name]);

  // Add this debug log to see what prescriptions are available
  console.log("Available prescriptions for patient:", prescriptionPatients.filter(p =>
    p.patient_id === patient.id || p.patientId === patient.id
  ));

  useEffect(() => {
    if (patient && mode === "view") {
      console.log("🔄 Patient data updated in modal, refreshing formData...", patient);

      // If patient data comes from your API with user/profile structure
      if (patient?.user) {
        setFormData({
          id: patient.user.id,
          name: `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim(),
          email: patient.user.email || '',
          contact: patient.user.phone || '',
          age: patient.user.age || '',
          dob: patient.user.dob || '',
          gender: patient.user.gender || '',
          weight: patient.profile?.weight || '',
          bloodGroup: patient.profile?.bloodGroup || '',
          address: patient.profile?.address || '',
          allergies: toArray(patient.profile?.allergies),
          images: toArray(patient.profile?.image_urls) || [],
          raw: patient
        });
      }
      // If patient data is already flattened
      else if (patient) {
        setFormData({
          ...patient,
          dob: patient.dob || '',
          allergies: toArray(patient.allergies),
          images: patient.images || patient.profile?.image_urls || patient.image_urls || [],
        });
      }
    }
  }, [patient, mode]); // This will run when patient prop changes

  // useEffect(() => {
  //   if (mode === "view" && patient?.id) {
  //     // Force refresh patient data when modal opens to ensure we have latest images
  //     const refreshPatientData = async () => {
  //       try {
  //         await refreshPatient(patient.id);
  //         console.log("🔄 Patient data refreshed on modal open");
  //       } catch (error) {
  //         console.error("Failed to refresh patient data:", error);
  //       }
  //     };

  //     refreshPatientData();
  //   }
  // }, [mode, patient?.id, refreshPatient]);

  // Close modal when clicking outside (only for patient modal)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if we're not in preview mode and clicked outside modal
      if (
        !previewImage &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close, previewImage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdowns when clicking outside
      setShowQuickActions(false);
      setShowExportDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [close, previewImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Validate files before adding
      const validFiles = filesArray.filter(file =>
        file instanceof File && file.type.startsWith('image/')
      );

      if (validFiles.length === 0) {
        toast.error("Please select valid image files");
        return;
      }

      try {
        setIsSaving(true);

        // For now, we'll use the existing images and add new files
        // In a real app, you'd upload these files first
        const updatedImages = [...formData.images, ...validFiles];
        const updatedData = {
          ...formData,
          images: updatedImages,
        };

        setFormData(updatedData);

        // Update backend if in view mode
        if (mode === "view" && formData.id) {
          await updatePatient(updatedData);
          toast.success(`${validFiles.length} image(s) added successfully!`);
        } else {
          toast.success(`${validFiles.length} image(s) added successfully!`);
        }
      } catch (error) {
        console.error("Error adding images:", error);
        // toast.error("Failed to add images");
        // Revert on error
        setFormData(prev => ({ ...prev, images: formData.images }));
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddImageUrl = async () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      try {
        setIsSaving(true);
        const updatedImages = [...formData.images, url.trim()];
        const updatedData = {
          ...formData,
          images: updatedImages,
        };

        setFormData(updatedData);

        // Update backend if in view mode
        if (mode === "view" && formData.id) {
          await updatePatient(updatedData);
          toast.success("Image URL added successfully!");
        } else {
          toast.success("Image URL added successfully!");
        }
      } catch (error) {
        console.error("Error adding image URL:", error);
        // toast.error("Failed to add image URL");
        setFormData(prev => ({ ...prev, images: formData.images }));
      } finally {
        setIsSaving(false);
      }
    }
  };

  const removeImage = async (index) => {
    try {
      setIsSaving(true);
      const updatedImages = [...formData.images];
      updatedImages.splice(index, 1);
      const updatedData = {
        ...formData,
        images: updatedImages,
      };

      setFormData(updatedData);

      // Update backend if in view mode
      if (mode === "view" && formData.id) {
        await updatePatient(updatedData);
        toast.success("Image removed successfully!");
      } else {
        toast.success("Image removed successfully!");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      // toast.error("Failed to remove image");
      setFormData(prev => ({ ...prev, images: formData.images }));
    } finally {
      setIsSaving(false);
    }
  };

  const addAllergy = async () => {
    const current = toArray(formData.allergies);
    const next = newAllergy.trim();
    if (next && !current.includes(next)) {
      const updatedAllergies = [...current, next];
      const updatedData = {
        ...formData,
        allergies: updatedAllergies,
      };

      setFormData(updatedData);
      setNewAllergy("");

      // Update backend if in view mode
      if (mode === "view" && formData.id) {
        try {
          await updatePatient(updatedData);
          toast.success("Allergy added successfully!");
        } catch (error) {
          console.error("Error adding allergy:", error);
          // toast.error("Failed to add allergy");
          // Revert on error
          setFormData(prev => ({ ...prev, allergies: current }));
        }
      } else {
        toast.success("Allergy added successfully!");
      }
    }
  };

  const removeAllergy = async (index) => {
    const current = toArray(formData.allergies);
    const updatedAllergies = current.filter((_, i) => i !== index);
    const updatedData = {
      ...formData,
      allergies: updatedAllergies,
    };

    setFormData(updatedData);

    // Update backend if in view mode
    if (mode === "view" && formData.id) {
      try {
        await updatePatient(updatedData);
        toast.success("Allergy removed successfully!");
      } catch (error) {
        console.error("Error removing allergy:", error);
        // toast.error("Failed to remove allergy");
        // Revert on error
        setFormData(prev => ({ ...prev, allergies: current }));
      }
    } else {
      toast.success("Allergy removed successfully!");
    }
  };

  // Inline editing functions
  const startEditing = (fieldName, currentValue) => {
    setEditingField(fieldName);
    if (fieldName === "dob" && currentValue) {
      setEditValue(formatDateForInput(currentValue));
    } else {
      setEditValue(currentValue || "");
    }
  };

  const saveEdit = async () => {
    if (editingField) {
      try {
        let processedValue = editValue;

        console.log("=== DEBUG AGE UPDATE ===");
        console.log("Editing field:", editingField);
        console.log("Original editValue:", editValue);
        console.log("Current formData age:", formData.age);
        console.log("Current formData:", formData);

        if (editingField === "age") {
          // Keep the original value including days/months/years
          // Only validate that it contains numbers
          const hasNumbers = /\d/.test(editValue);
          if (!hasNumbers && editValue.trim() !== "") {
            toast.error("Age must contain numbers");
            return;
          }
          processedValue = editValue.trim();
          console.log("Processed age value:", processedValue);
        }
        // Create updated data with the edited field
        const updatedData = {
          ...formData,
          [editingField]: processedValue,
        };
        console.log("Updated data to save:", updatedData);

        // Update local state immediately for better UX
        setFormData(updatedData);

        // If we're in view mode and editing a field, update the backend
        if (mode === "view" && formData.id) {
          console.log("Calling updatePatient with:", updatedData);
          const result = await updatePatient(updatedData);
          console.log("Update result:", result);
          toast.success("Field updated successfully!");
        } else {
          toast.success("Field updated successfully!");
        }

        setEditingField(null);
        setEditValue("");
      } catch (error) {
        console.error("Error updating field:", error);
        // toast.error("Failed to update field");
        // Revert local state on error
        setFormData(prev => ({ ...prev }));
      }
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Advanced feature functions
  const handlePrint = () => {
    // Create a print-friendly version of patient details
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Details - ${formData.name || 'Unknown'}</title>
          <style>
            @media print {
              body { margin: 0; padding: 15px; font-family: Arial, sans-serif; }
              .no-print { display: none !important; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 15px; 
              line-height: 1.4;
              color: #333;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #3454d1; 
              padding-bottom: 8px; 
              margin-bottom: 15px; 
            }
            .header h1 { 
              color: #3454d1; 
              margin: 0; 
              font-size: 18px; 
            }
            .header p { 
              margin: 2px 0; 
              color: #666; 
              font-size: 11px; 
            }
            .main-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 15px;
            }
            .section { 
              margin-bottom: 15px; 
              page-break-inside: avoid; 
            }
            .section h2 { 
              color: #3454d1; 
              border-bottom: 1px solid #e2e8f0; 
              padding-bottom: 4px; 
              margin-bottom: 8px; 
              font-size: 14px; 
              font-weight: bold;
            }
            .field { 
              margin-bottom: 6px; 
              display: flex; 
              align-items: center;
            }
            .field-label { 
              font-weight: bold; 
              min-width: 80px; 
              color: #475569; 
              font-size: 11px;
            }
            .field-value { 
              flex: 1; 
              color: #1e293b; 
              font-size: 11px;
            }
            .stats-row {
              display: flex;
              gap: 15px;
              margin-bottom: 10px;
            }
            .stat-card { 
              border: 1px solid #e2e8f0; 
              padding: 6px 10px; 
              border-radius: 3px; 
              flex: 1;
              text-align: center;
            }
            .stat-number { 
              font-size: 16px; 
              font-weight: bold; 
              color: #3454d1; 
              margin-bottom: 2px; 
            }
            .stat-label { 
              color: #64748b; 
              font-size: 10px; 
            }
            .allergies { 
              color: #d13b4c; 
              font-weight: bold;
              font-size: 11px;
            }
            .recent-activity {
              grid-column: 1 / -1;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              margin-top: 10px;
            }
            .activity-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: 11px;
            }
            .activity-label {
              font-weight: bold;
              color: #475569;
            }
            .activity-value {
              color: #1e293b;
            }
            .footer { 
              margin-top: 15px; 
              text-align: center; 
              color: #64748b; 
              font-size: 10px; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 8px; 
            }
            @page { 
              margin: 0.5in; 
              size: A4; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Patient Details</h1>
            <p>ClinicPro Medical Management System</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <div class="main-content">
            <div class="section">
              <h2>Basic Information</h2>
              <div class="field">
                <span class="field-label">Name:</span>
                <span class="field-value">${formData.name || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Gender:</span>
                <span class="field-value">${formData.gender || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Age:</span>
                <span class="field-value">${formData.age || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Email:</span>
                <span class="field-value">${formData.email || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Contact:</span>
                <span class="field-value">${formData.contact || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Address:</span>
                <span class="field-value">${formData.address || 'N/A'}</span>
              </div>
            </div>

            <div class="section">
              <h2>Medical Information</h2>
              <div class="field">
                <span class="field-label">Weight:</span>
                <span class="field-value">${formData.weight || 'N/A'} kg</span>
              </div>
              <div class="field">
                <span class="field-label">Blood Group:</span>
                <span class="field-value">${formData.bloodGroup || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="field-label">Allergies:</span>
                <span class="field-value">
                  ${formData.allergies && formData.allergies.length > 0 ?
        `<div class="allergies">${toArray(formData.allergies).join(', ') || 'None'}</div>` :
        'None'}
                </span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Patient Statistics</h2>
            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-number">${patientStats.appointmentCount}</div>
                <div class="stat-label">Total Appointments</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${patientStats.prescriptionCount}</div>
                <div class="stat-label">Total Prescriptions</div>
              </div>
            </div>
            <div class="activity-item" style="margin-top: 10px;">
              <span class="activity-label">Last Appointment:</span>
              <span class="activity-value">
                ${patientStats.lastAppointment ?
        `${new Date(patientStats.lastAppointment.date).toLocaleDateString()} at ${patientStats.lastAppointment.time}` :
        'No appointments found'}
              </span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Last Prescription:</span>
              <span class="activity-value">
                ${patientStats.lastPrescription ?
        `${new Date(patientStats.lastPrescription.created_at).toLocaleDateString()}` :
        'No prescriptions found'}
              </span>
            </div>
          </div>

          <div class="footer">
            <p>This document was generated from ClinicPro Medical Management System</p>
            <p>Patient ID: ${formData.id || 'N/A'} | Generated by: System</p>
          </div>
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    toast.success("Printing patient details...");
  };

  const handleExport = () => {
    // Create a simple text export for now
    const exportData = `
Patient Details Export
=====================

Basic Information:
- Name: ${formData.name || 'N/A'}
- Gender: ${formData.gender || 'N/A'}
- Age: ${formData.age || 'N/A'}
- Email: ${formData.email || 'N/A'}
- Contact: ${formData.contact || 'N/A'}
- Address: ${formData.address || 'N/A'}

Medical Information:
- Weight: ${formData.weight || 'N/A'} kg
- Blood Group: ${formData.bloodGroup || 'N/A'}

Allergies: ${formData.allergies.join(', ') || 'None'}

Statistics:
- Total Appointments: ${patientStats.appointmentCount}
- Total Prescriptions: ${patientStats.prescriptionCount}

Last Appointment: ${patientStats.lastAppointment ?
        `${new Date(patientStats.lastAppointment.date).toLocaleDateString()} at ${patientStats.lastAppointment.time}` :
        'No appointments found'}

Last Prescription: ${patientStats.lastPrescription ?
        `${new Date(patientStats.lastPrescription.created_at).toLocaleDateString()}` :
        'No prescriptions found'}

Export Date: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${formData.name || 'details'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Patient data exported successfully!');
  };

  const handleExportExcel = () => {
    // Create CSV format (Excel compatible)
    const csvData = [
      ['Field', 'Value'],
      ['Name', formData.name || 'N/A'],
      ['Gender', formData.gender || 'N/A'],
      ['Age', formData.age || 'N/A'],
      ['Email', formData.email || 'N/A'],
      ['Contact', formData.contact || 'N/A'],
      ['Address', formData.address || 'N/A'],
      ['Weight (kg)', formData.weight || 'N/A'],
      ['Blood Group', formData.bloodGroup || 'N/A'],
      ['Allergies', formData.allergies.join(', ') || 'None'],
      ['Total Appointments', patientStats.appointmentCount],
      ['Total Prescriptions', patientStats.prescriptionCount],
      ['Last Appointment', patientStats.lastAppointment ?
        `${new Date(patientStats.lastAppointment.date).toLocaleDateString()} at ${patientStats.lastAppointment.time}` :
        'No appointments found'],
      ['Last Prescription', patientStats.lastPrescription ?
        `${new Date(patientStats.lastPrescription.created_at).toLocaleDateString()}` :
        'No prescriptions found'],
      ['Export Date', new Date().toLocaleString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${formData.name || 'details'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Patient data exported to Excel format!');
  };

  const handleExportPDF = () => {
    // Create a simple HTML-based PDF export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Patient Details - ${formData.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #3454d1; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-left: 10px; }
            .stats { display: flex; gap: 20px; margin-top: 10px; }
            .stat-item { background: #f8f9fa; padding: 10px; border-radius: 5px; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Patient Details Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h3>Basic Information</h3>
            <div class="field"><span class="label">Name:</span><span class="value">${formData.name || 'N/A'}</span></div>
            <div class="field"><span class="label">Gender:</span><span class="value">${formData.gender || 'N/A'}</span></div>
            <div class="field"><span class="label">Age:</span><span class="value">${formData.age || 'N/A'}</span></div>
            <div class="field"><span class="label">Email:</span><span class="value">${formData.email || 'N/A'}</span></div>
            <div class="field"><span class="label">Contact:</span><span class="value">${formData.contact || 'N/A'}</span></div>
            <div class="field"><span class="label">Address:</span><span class="value">${formData.address || 'N/A'}</span></div>
          </div>
          
          <div class="section">
            <h3>Medical Information</h3>
            <div class="field"><span class="label">Weight:</span><span class="value">${formData.weight || 'N/A'} kg</span></div>
            <div class="field"><span class="label">Blood Group:</span><span class="value">${formData.bloodGroup || 'N/A'}</span></div>
            <div class="field"><span class="label">Allergies:</span><span class="value">${formData.allergies.join(', ') || 'None'}</span></div>
          </div>
          
          <div class="section">
            <h3>Patient Statistics</h3>
            <div class="stats">
              <div class="stat-item">
                <strong>Total Appointments:</strong><br>${patientStats.appointmentCount}
              </div>
              <div class="stat-item">
                <strong>Total Prescriptions:</strong><br>${patientStats.prescriptionCount}
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>Recent Activity</h3>
            <div class="field"><span class="label">Last Appointment:</span><span class="value">${patientStats.lastAppointment ?
        `${new Date(patientStats.lastAppointment.date).toLocaleDateString()} at ${patientStats.lastAppointment.time}` :
        'No appointments found'}</span></div>
            <div class="field"><span class="label">Last Prescription:</span><span class="value">${patientStats.lastPrescription ?
        `${new Date(patientStats.lastPrescription.created_at).toLocaleDateString()}` :
        'No prescriptions found'}</span></div>
          </div>
          
          <div class="footer">
            <p>This report was generated by ClinicPro Management System</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${formData.name || 'details'}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Patient data exported to HTML format (can be converted to PDF)!');
  };

  const handleExportDOC = () => {
    // Create a simple RTF format (Word compatible)
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24
{\\b Patient Details Report}\\par
{\\i Generated on ${new Date().toLocaleString()}}\\par\\par

{\\b Basic Information:}\\par
Name: ${formData.name || 'N/A'}\\par
Gender: ${formData.gender || 'N/A'}\\par
Age: ${formData.age || 'N/A'}\\par
Email: ${formData.email || 'N/A'}\\par
Contact: ${formData.contact || 'N/A'}\\par
Address: ${formData.address || 'N/A'}\\par\\par

{\\b Medical Information:}\\par
Weight: ${formData.weight || 'N/A'} kg\\par
Blood Group: ${formData.bloodGroup || 'N/A'}\\par
Allergies: ${formData.allergies.join(', ') || 'None'}\\par\\par

{\\b Patient Statistics:}\\par
Total Appointments: ${patientStats.appointmentCount}\\par
Total Prescriptions: ${patientStats.prescriptionCount}\\par\\par

{\\b Recent Activity:}\\par
Last Appointment: ${patientStats.lastAppointment ?
        `${new Date(patientStats.lastAppointment.date).toLocaleDateString()} at ${patientStats.lastAppointment.time}` :
        'No appointments found'}\\par
Last Prescription: ${patientStats.lastPrescription ?
        `${new Date(patientStats.lastPrescription.created_at).toLocaleDateString()}` :
        'No prescriptions found'}\\par\\par

{\\i This report was generated by ClinicPro Management System}
}`;

    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${formData.name || 'details'}_${new Date().toISOString().split('T')[0]}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Patient data exported to Word format!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Patient Details - ${formData.name}`,
        text: `Patient: ${formData.name}, Contact: ${formData.contact}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${formData.name} - ${formData.contact}`);
      toast.success("Patient details copied to clipboard!");
    }
  };

  const handleBookAppointment = () => {
    // Store patient data for the booking page
    const patientData = {
      id: formData.id,
      patient_id: formData.id,
    };

    console.log("📋 Storing patient data for booking from modal:", patientData);
    console.log("Patient ID being used for booking:", formData.id);

    // Store in localStorage for the booking page to access
    localStorage.setItem('bookingFromPatientModal', JSON.stringify({
      patientId: formData.id,
      timestamp: new Date().getTime()
    }));

    // Close the modal
    close();

    // Navigate to appointment booking page
    setTimeout(() => {
      navigate(`/appointments/book-appointment?patientId=${formData.id}`);
    }, 100);

    toast.info("Redirecting to appointment booking...");
  };

  const handleCreatePrescription = () => {
    // Store patient data for the prescription page
    const patientData = {
      id: formData.id,
      patient_id: formData.id, // Add patient_id for consistency
      name: formData.name,
      patientName: formData.name,
      patientEmail: formData.email,
      patientPhone: formData.contact,
      patientAge: formData.age,
      gender: formData.gender,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      weight: formData.weight,
      allergies: formData.allergies,
      contact: formData.contact,
      email: formData.email,
    };

    console.log("📋 Storing patient data for prescription from modal:", patientData);
    console.log("Patient ID being used:", formData.id);

    // Store in localStorage for the prescription page to access
    localStorage.setItem('prescriptionFromPatientModal', JSON.stringify({
      patientId: formData.id,
      patientData: patientData,
      timestamp: new Date().getTime()
    }));

    // Also store in the calendar prescription storage for consistency
    localStorage.setItem('prescriptionFromCalendar', JSON.stringify({
      patientId: formData.id,
      patientData: patientData
    }));

    // Set prescription form data
    setPrescriptionFormData((prev) => ({
      ...prev,
      patient: patientData,
    }));

    // Close the modal
    close();

    // Navigate to prescription creation page with patientId parameter
    setTimeout(() => {
      navigate(`/prescriptions/create-prescription?patientId=${formData.id}`);
    }, 100);

    toast.info("Redirecting to prescription creation...");
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'call':
        window.open(`tel:${formData.contact}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${formData.email}`, '_self');
        break;
      case 'sms':
        window.open(`sms:${formData.contact}`, '_self');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${formData.contact}`, '_blank');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log("Current patient data:", patient);
    console.log("Current formData:", formData);
    console.log("Current images in formData:", formData.images);
  }, [patient, formData]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);

      // Prepare data for backend - handle both flat and nested structures
      const dataToSubmit = {
        ...formData,
        // For flat structure compatibility
        images: formData.images || [],
        // For nested structure
        profile: {
          ...patient?.profile,
          image_urls: formData.images.filter(img => typeof img === 'string'), // Only URLs for backend
          bloodGroup: formData.bloodGroup,
          weight: formData.weight,
          allergies: formData.allergies,
          address: formData.address,
        },
      };

      // Remove temporary File objects from images before sending to backend
      const cleanImages = formData.images.map(img => {
        if (img instanceof File) {
          // For File objects, you might want to handle upload separately
          // or convert to base64, but for now we'll keep only URLs
          return null;
        }
        return img;
      }).filter(Boolean);

      dataToSubmit.images = cleanImages;
      dataToSubmit.profile.image_urls = cleanImages;

      if (formData.id) {
        // Update existing patient
        await updatePatient(dataToSubmit);
        toast.success("Patient updated successfully!");
      } else {
        // Add new patient
        await addPatient({ ...dataToSubmit, id: Date.now().toString() });
        toast.success("Patient created successfully!");
      }
      close();
    } catch (error) {
      console.error("Error saving patient:", error);
      // toast.error("Failed to save patient. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [formData, updatePatient, addPatient, close]);

  const handleViewAllAppointments = () => {
    if (formData.id) {
      // Store patient info for the appointments page
      localStorage.setItem('appointmentPatientFilter', JSON.stringify({
        patientId: formData.id,
        patientName: formData.name
      }));

      // Close the modal first
      close();

      // Then navigate to appointments with patient filter
      setTimeout(() => {
        window.location.href = `/appointments/all-appointments?patient_id=${formData.id}`;
      }, 100);
    } else {
      toast.info("No patient ID available");
    }
  };

  const handleViewAllPrescriptions = () => {
    if (formData.id) {
      // Store patient info for the prescriptions page
      localStorage.setItem('prescriptionPatientFilter', JSON.stringify({
        patientId: formData.id,
        patientName: formData.name
      }));

      // Close the modal first
      close();

      // Then navigate to appointments with patient filter
      setTimeout(() => {
        window.location.href = `/prescriptions/all-prescriptions?patient_id=${formData.id}`;
      }, 100);
    } else {
      toast.info("No patient ID available");
    }
  };

  const renderField = (
    label,
    name,
    type = "text",
    options = [],
    required = false
  ) => {
    const value = formData[name] || "";

    if (mode === "view") {
      // Special handling for images
      if (name === "images") {
        return (
          <div
            style={{
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: themeColors.textLight,
                marginBottom: "12px",
                justifyContent: 'space-between'
              }}
            >
              {label}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => document.getElementById('image-upload').click()}
                  disabled={isSaving}
                  style={{
                    background: isSaving ? themeColors.secondary : themeColors.primary,
                    color: themeColors.white,
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? "⏳ Uploading..." : "Upload"}
                </button>
                <button
                  onClick={handleAddImageUrl}
                  style={{
                    background: themeColors.info,
                    color: themeColors.white,
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Add URL
                </button>
              </div>
            </div>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {formData.images && formData.images.length > 0 ? (
                formData.images.map((image, index) => {
                  let imageUrl;

                  // Handle different image types
                  if (image instanceof File) {
                    imageUrl = URL.createObjectURL(image);
                  } else if (typeof image === 'string') {
                    imageUrl = image;
                  } else if (image && image.url) {
                    imageUrl = image.url;
                  } else {
                    return null; // Skip invalid images
                  }
                  return (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: "6px",
                        overflow: "hidden",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={`Patient image ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => setPreviewImage(imageUrl)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          // Show error placeholder
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Error fallback */}
                      <div
                        style={{
                          display: 'none',
                          width: "100%",
                          height: "100%",
                          background: themeColors.light,
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          color: themeColors.textLight,
                          fontSize: "0.7rem",
                          textAlign: "center",
                          padding: "8px",
                        }}
                      >
                        🖼️<br />Image not available
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: themeColors.danger,
                          color: themeColors.white,
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )
                }).filter(Boolean)
              ) : (
                  <div style={{
                    width: "100%",
                    padding: "40px 20px",
                    textAlign: "center",
                    color: themeColors.textLight,
                    fontStyle: "italic",
                    fontSize: "0.9rem",
                    background: themeColors.light,
                    borderRadius: "8px",
                    border: `2px dashed ${themeColors.border}`,
                  }}>
                    No patient images available. Upload images or add image URLs.
                </div>
              )}
            </div>

            {/* Image count and instructions */}
            {formData.images && formData.images.length > 0 && (
              <div style={{
                marginTop: "8px",
                fontSize: "0.75rem",
                color: themeColors.textLight,
                textAlign: "center",
              }}>
                {formData.images.length} image(s) • Click to preview • Shift+Click to add URL
              </div>
            )}
          </div>
        );
      }

      if (name === "dob") {
        const displayValue = formData[name] || "";
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 0",
              position: "relative",
              minHeight: "28px",
            }}
            onMouseEnter={(e) => {
              if (e.currentTarget.querySelector('.edit-buttons')) {
                e.currentTarget.querySelector('.edit-buttons').style.opacity = '1';
              }
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget.querySelector('.edit-buttons')) {
                e.currentTarget.querySelector('.edit-buttons').style.opacity = '0';
              }
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: themeColors.textLight,
                minWidth: "120px",
                flexShrink: 0,
              }}
            >
              {label}:
            </div>

            {editingField === name ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                <input
                  type="date"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: `1px solid ${themeColors.primary}`,
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    minWidth: "120px",
                  }}
                  autoFocus
                  max={new Date().toISOString().split('T')[0]}
                />
                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                  <button
                    onClick={saveEdit}
                    style={{
                      background: themeColors.success,
                      color: themeColors.white,
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 6px",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      background: themeColors.danger,
                      color: themeColors.white,
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 6px",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: themeColors.textDark,
                  fontWeight: "500",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minWidth: 0,
                  gap: "8px",
                }}
              >
                <span style={{ flex: 1, minWidth: 0, wordBreak: "break-word", lineHeight: "1.4" }}>
                  {displayValue ? formatDate(displayValue) :
                    <span style={{ color: themeColors.textLight, fontStyle: "italic" }}>Not specified</span>
                  }
                </span>
                <div
                  className="edit-buttons"
                  style={{
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                    display: "flex",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => startEditing(name, displayValue)}
                    style={{
                      background: themeColors.primary,
                      color: themeColors.white,
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 8px",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Edit"
                  >
                      <FiEdit3 />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
            position: "relative",
            minHeight: "28px",
          }}
          onMouseEnter={(e) => {
            if (e.currentTarget.querySelector('.edit-buttons')) {
              e.currentTarget.querySelector('.edit-buttons').style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (e.currentTarget.querySelector('.edit-buttons')) {
              e.currentTarget.querySelector('.edit-buttons').style.opacity = '0';
            }
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: themeColors.textLight,
              minWidth: "120px",
              flexShrink: 0,
            }}
          >
            {label}:
          </div>

          {editingField === name ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
              {name === "gender" ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: `1px solid ${themeColors.primary}`,
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    minWidth: "120px",
                  }}
                  autoFocus
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : name === "bloodGroup" ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: `1px solid ${themeColors.primary}`,
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    minWidth: "120px",
                  }}
                  autoFocus
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              ) : (
                <input
                      type={name === "age" ? "text" : name === "email" ? "email" : "text"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: `1px solid ${themeColors.primary}`,
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    minWidth: "120px",
                  }}
                  autoFocus
                />
              )}
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                <button
                  onClick={saveEdit}
                  style={{
                    background: themeColors.success,
                    color: themeColors.white,
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 6px",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Save"
                >
                  ✓
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    background: themeColors.danger,
                    color: themeColors.white,
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 6px",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
              <div
                style={{
                fontSize: "0.8rem",
                color: themeColors.textDark,
                fontWeight: "500",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: 0,
                gap: "8px",
              }}
            >
              <span style={{ flex: 1, minWidth: 0, wordBreak: "break-word", lineHeight: "1.4" }}>
                {value || <span style={{ color: themeColors.textLight, fontStyle: "italic" }}>Not specified</span>}
              </span>
              <div
                className="edit-buttons"
                style={{
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  display: "flex",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => startEditing(name, value)}
                  style={{
                    background: themeColors.primary,
                    color: themeColors.white,
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 8px",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Edit"
                >
                    <FiEdit3 />
                </button>
                </div>
            </div>
          )}
        </div>
      );
    }

    if (name === "dob") {
      const displayValue = formData[name] || "";
      return (
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: themeColors.textLight,
              marginBottom: "4px",
              display: "block",
            }}
          >
            {label}
            {required && (
              <span style={{ color: themeColors.danger, marginLeft: "4px" }}>*</span>
            )}
          </label>
          <input
            type="date"
            name={name}
            value={formatDateForInput(displayValue)}
            onChange={handleChange}
            required={required}
            style={{
              width: "100%",
              padding: "6px 10px",
              border: `1px solid ${themeColors.border}`,
              borderRadius: "4px",
              fontSize: "0.8rem",
            }}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      );
    }

    if (type === "select") {
      return (
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
              color: themeColors.textLight,
              marginBottom: "4px",
              display: "block",
            }}
          >
            {label}
            {required && (
              <span style={{ color: themeColors.danger, marginLeft: "4px" }}>*</span>
            )}
          </label>
          <select
            name={name}
            value={value}
            onChange={handleChange}
            required={required}
            style={{
              width: "100%",
              padding: "6px 10px",
              border: `1px solid ${themeColors.border}`,
              borderRadius: "4px",
              fontSize: "0.8rem",
            }}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            fontSize: "0.8rem",
            fontWeight: "500",
            color: themeColors.textLight,
            marginBottom: "4px",
            display: "block",
          }}
        >
          {label}
          {required && (
            <span style={{ color: themeColors.danger, marginLeft: "4px" }}>*</span>
          )}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          style={{
            width: "100%",
            padding: "6px 10px",
            border: `1px solid ${themeColors.border}`,
            borderRadius: "4px",
            fontSize: "0.8rem",
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        ...themeStyles.backdrop,
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: "95%",
          maxWidth: "800px",
          maxHeight: "85vh",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          ...themeStyles.modal,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
            padding: mode === "view" ? "24px" : "0",
            background: mode === "view" ? themeColors.primaryGradient : "transparent",
            borderRadius: "16px",
            margin: mode === "view" ? "-24px -24px 24px -24px" : "0 0 24px 0",
            color: mode === "view" ? themeColors.white : "inherit",
            boxShadow: mode === "view" ? "0 12px 40px rgba(52, 84, 209, 0.2), 0 4px 16px rgba(52, 84, 209, 0.1)" : "none",
            minHeight: "120px",
            flexWrap: "nowrap",
            gap: "10px"
          }}
        >
          {/* Background Pattern */}
          {mode === "view" && (
            <div
              style={{
                position: "absolute",
                top: "-50%",
                right: "-20%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                transform: "rotate(15deg)",
                pointerEvents: "none",
              }}
            />
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, position: "relative", zIndex: 1, minWidth: 0 }}>
            {/* Enhanced Profile Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: mode === "view"
                  ? `linear-gradient(135deg, ${themeColors.white}30 0%, ${themeColors.white}60 100%)`
                  : themeColors.primaryGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: "800",
                color: mode === "view" ? themeColors.white : themeColors.white,
                border: mode === "view"
                  ? `4px solid ${themeColors.white}50`
                  : `4px solid ${themeColors.white}`,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.2), 0 6px 16px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
            >
              {formData.name ? formData.name.charAt(0).toUpperCase() : "P"}
            </div>

            {/* Enhanced Profile Info */}
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "900",
                  color: mode === "view" ? themeColors.white : themeColors.textDark,
                  margin: "0 0 6px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textShadow: mode === "view" ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
                  letterSpacing: "-0.5px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={mode === "view" ? (formData.name || "Patient Details") : formData.id ? "Edit Patient" : "Add Patient"}
              >
                {mode === "view" ? (
                  formData.name || "Patient Details"
                ) : formData.id ? (
                  "Edit Patient"
                ) : (
                  "Add Patient"
                )}
              </h2>
              {mode === "view" && formData.email && (
                <p style={{
                  margin: "0",
                  fontSize: "1rem",
                  color: `${themeColors.white}DD`,
                  fontWeight: "500",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                  title={formData.email}
                >
                  {formData.email}
                </p>
              )}
              {mode === "view" && formData.contact && (
                <p style={{
                  margin: "6px 0 0 0",
                  fontSize: "0.95rem",
                  color: `${themeColors.white}DD`,
                  fontWeight: "400",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                  title={formData.contact}
                >
                  {formData.contact}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {mode === "view" && (
                <>
                  {/* Quick Actions Dropdown */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => {
                        setShowQuickActions(!showQuickActions);
                        setShowExportDropdown(false); // Close export dropdown
                      }}
                      style={{
                        background: themeColors.primary,
                        color: themeColors.white,
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "600",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                      title="Quick Actions"
                      onMouseOver={(e) => {
                        e.target.style.background = themeColors.info;
                        e.target.style.transform = "translateY(-1px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = themeColors.primary;
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      Actions
                    </button>

                    {showQuickActions && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          background: themeColors.white,
                          border: `1px solid ${themeColors.border}`,
                          borderRadius: "8px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                          padding: "8px",
                          zIndex: 1000,
                          minWidth: "160px",
                          marginTop: "4px",
                        }}
                      >
                        <button
                          onClick={() => {
                            handleQuickAction('call');
                            setShowQuickActions(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          Call Patient
                        </button>
                        <button
                          onClick={() => {
                            handleQuickAction('email');
                            setShowQuickActions(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          Send Email
                        </button>
                        <button
                          onClick={() => {
                            handleQuickAction('sms');
                            setShowQuickActions(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          Send SMS
                        </button>
                        <button
                          onClick={() => {
                            handleQuickAction('whatsapp');
                            setShowQuickActions(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          💬 WhatsApp
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Export/Share/Print Buttons */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => {
                        setShowExportDropdown(!showExportDropdown);
                        setShowQuickActions(false); // Close actions dropdown
                      }}
                      style={{
                        background: themeColors.secondary,
                        color: themeColors.white,
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: "500",
                      }}
                      title="Export Data"
                    >
                      Export
                    </button>

                    {showExportDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          background: themeColors.white,
                          border: `1px solid ${themeColors.border}`,
                          borderRadius: "8px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                          padding: "8px",
                          zIndex: 1000,
                          minWidth: "160px",
                          marginTop: "4px",
                        }}
                      >
                        <button
                          onClick={() => {
                            handleExport();
                            setShowExportDropdown(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          Text Export
                        </button>
                        <button
                          onClick={() => {
                            handleExportExcel();
                            setShowExportDropdown(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          Excel (CSV)
                        </button>
                        <button
                          onClick={() => {
                            handleExportPDF();
                            setShowExportDropdown(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          HTML (PDF)
                        </button>
                        <button
                          onClick={() => {
                            handleExportDOC();
                            setShowExportDropdown(false);
                          }}
                          style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            padding: "8px 12px",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8rem",
                            color: themeColors.textDark,
                          }}
                        >
                          Word (RTF)
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleShare}
                    style={{
                      background: themeColors.info,
                      color: themeColors.white,
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Share"
                  >
                    Share
                  </button>
                  <button
                    onClick={handlePrint}
                    style={{
                      background: themeColors.warning,
                      color: themeColors.white,
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                    title="Print"
                    onMouseOver={(e) => {
                      e.target.style.background = themeColors.info;
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = themeColors.warning;
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    Print
                  </button>
                </>
              )}

              <button
                onClick={close}
                style={{
                  background: mode === "view" ? `${themeColors.white}20` : themeColors.light,
                  border: mode === "view" ? `2px solid ${themeColors.white}40` : `1px solid ${themeColors.border}`,
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: mode === "view" ? themeColors.white : themeColors.textDark,
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  fontWeight: "bold",
                  boxShadow: mode === "view" ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  position: "relative",
                  zIndex: 10,
                }}
                onMouseOver={(e) => {
                  e.target.style.background = mode === "view" ? `${themeColors.white}40` : themeColors.border;
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.boxShadow = mode === "view" ? "0 6px 16px rgba(0, 0, 0, 0.2)" : "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = mode === "view" ? `${themeColors.white}20` : themeColors.light;
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = mode === "view" ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
            {mode === "view" && (
              <div style={{ display: "flex", gap: "10px", position: "relative", zIndex: 1 }}>
                <button
                  onClick={handleBookAppointment}
                  style={{
                    background: themeColors.success,
                    color: themeColors.white,
                    border: "none",
                    padding: "8px 16px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  title="Book Appointment"
                  onMouseOver={(e) => {
                    e.target.style.background = themeColors.info;
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = themeColors.success;
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Book
                </button>
                {role?.toLowerCase() !== 'receptionist' && (
                  <button
                    onClick={handleCreatePrescription}
                    style={{
                      background: themeColors.info,
                      color: themeColors.white,
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: "600",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    title="Create Prescription"
                    onMouseOver={(e) => {
                      e.target.style.background = themeColors.primary;
                      e.target.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = themeColors.info;
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    Prescribe
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            overflowY: "auto",
            paddingRight: "8px",
            marginBottom: "20px",
            flex: 1,
          }}
        >
          {/* Tab Navigation */}
          {mode === "view" && (
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid ${themeColors.border}`,
                marginBottom: "20px",
                gap: "0",
                background: "transparent",
              }}
            >
              {[
                { id: "overview", label: "Overview" },
                { id: "medical", label: "Medical & History" },
                { id: "vitals", label: "Vitals" },
                { id: "lifestyle", label: "Lifestyle" },
                { id: "vaccines", label: "Vaccines" },
                { id: "images", label: "Images" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: "transparent",
                    color: activeTab === tab.id ? themeColors.primary : themeColors.textLight,
                    border: "none",
                    borderBottom: activeTab === tab.id ? `2px solid ${themeColors.primary}` : "2px solid transparent",
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: activeTab === tab.id ? "600" : "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          {mode === "view" ? (
            <>
              {activeTab === "overview" && (
                <Overview
                  formData={formData}
                  renderField={renderField}
                  bloodGroups={bloodGroups}
                  patientStats={patientStats}
                  handleViewAllAppointments={handleViewAllAppointments}
                  handleViewAllPrescriptions={handleViewAllPrescriptions}
                />
              )}

              {activeTab === "medical" && (
                <>
                  {/* Medical Information Section */}
                  <div
                    style={{
                      marginBottom: "24px",
                      paddingBottom: "16px",
                      borderBottom: `1px dashed ${themeColors.border}`,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: themeColors.textLight,
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Medical Information
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {renderField("Weight (kg)", "weight", "number")}
                      {renderField("Blood Group", "bloodGroup", "select", bloodGroups)}
                    </div>
                  </div>

                  {/* Medical History Section */}
                  <div
                    style={{
                      marginBottom: "24px",
                      paddingBottom: "16px",
                      borderBottom: `1px dashed ${themeColors.border}`,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: themeColors.textLight,
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Medical History
                    </h3>
                    <div style={{ color: themeColors.textLight, fontSize: "0.85rem" }}>
                      <p>Comprehensive medical history will be displayed here.</p>
                      <p>Including past diagnoses, treatments, and procedures.</p>
                    </div>
                  </div>

                  {/* Family History Section */}
                  <div
                    style={{
                      marginBottom: "0px",
                      paddingBottom: "0px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: themeColors.textLight,
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Family History
                    </h3>
                    <div style={{ color: themeColors.textLight, fontSize: "0.85rem" }}>
                      <p>Family medical history and genetic information.</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "vitals" && (
                <Vitals />
              )}

              {activeTab === "lifestyle" && (
                <Lifestyle />
              )}

              {activeTab === "vaccines" && (
                <Vaccine patientId={formData.id} patientName={formData.name} />
              )}

              {activeTab === "images" && (
                <Images
                  formData={formData}
                  isSaving={isSaving}
                  handleImageUpload={handleImageUpload}
                  handleAddImageUrl={handleAddImageUrl}
                  removeImage={removeImage}
                  setPreviewImage={setPreviewImage}
                />
              )}
            </>
          ) : (
            <>
              {/* Basic Information Section */}
              <div
                style={{
                  marginBottom: "16px",
                  padding: "0",
                  backgroundColor: "transparent",
                  borderRadius: "6px",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: themeColors.textLight,
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Basic Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {renderField("Name", "name", "text", [], true)}
                  {renderField(
                    "Gender",
                    "gender",
                    "select",
                    ["Male", "Female", "Other"],
                    true
                    )}
                    {renderField("Date of Birth", "dob", "date", [], false)}
                  {renderField("Age", "age", "number", [], true)}
                  {renderField("Email", "email", "email", [], true)}
                  {renderField("Contact", "contact", "tel", [], true)}
                  {renderField("Address", "address")}
                </div>
              </div>

              {/* Medical Information Section */}
              <div
                style={{
                  marginBottom: "16px",
                  padding: "0",
                  backgroundColor: "transparent",
                  borderRadius: "6px",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: themeColors.textLight,
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Medical Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {renderField("Weight (kg)", "weight", "number")}
                  {renderField("Blood Group", "bloodGroup", "select", bloodGroups)}
                </div>
              </div>

              {/* Allergies Section */}
              <div
                style={{
                  marginBottom: "16px",
                  padding: "0",
                  backgroundColor: "transparent",
                  borderRadius: "6px",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: themeColors.textLight,
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Allergies
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {formData.allergies.length > 0 ? (
                    formData.allergies.map((allergy, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: themeColors.warning,
                          color: themeColors.danger,
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                        }}
                      >
                        {allergy}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        color: themeColors.textLight,
                        fontStyle: "italic",
                        fontSize: "0.8rem",
                      }}
                    >
                      No allergies recorded
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action buttons - Only show save button in edit/add mode */}
        {mode !== "view" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "auto",
              paddingTop: "20px",
            }}
          >
            <button
              onClick={handleSave}
              style={{
                background: themeColors.primary,
                color: themeColors.white,
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = themeColors.primary)}
              onMouseOut={(e) => (e.target.style.backgroundColor = themeColors.primary)}
            >
              {formData.id ? "Update Patient" : "Save Patient"}
            </button>
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={(e) => {
            // Only close if clicking on the backdrop (not the image or close button)
            if (e.target === e.currentTarget) {
              setPreviewImage(null);
            }
          }}
        >
          <div
            ref={previewRef}
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <img
              src={previewImage}
              alt="Full Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                backgroundColor: themeColors.white,
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PatientModal);