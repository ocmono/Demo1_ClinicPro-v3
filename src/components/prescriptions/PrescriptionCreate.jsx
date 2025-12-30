import React, { useState, useRef } from 'react'
import { FiCamera, FiTrash2, FiUser, FiActivity, FiCalendar, FiClipboard, FiFileText, FiRefreshCw } from 'react-icons/fi'
import { FaFile } from "react-icons/fa";
import { MdOutlineScience } from "react-icons/md";
import { BsCreditCardFill, BsPaypal, BsPrescription } from 'react-icons/bs'
import { IoIosMedical } from "react-icons/io";
import { GrPowerReset } from "react-icons/gr";
import { TbVaccine } from "react-icons/tb";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReactSelect from "react-select";
import { useBooking } from "../../contentApi/BookingProvider";
import { useClinicManagement } from '../../contentApi/ClinicMnanagementProvider'
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { useAppointments } from "../../context/AppointmentContext";
import CreatePrescriptionToggle from './CreatePrescriptionToggle';
import { useEffect } from 'react';
import PreviewPrescription from './PreviewPrescription'
import CustomDatePicker from '../shared/CustomCalendar'

import MedicineSuggestion from './prescriptionComponent/MedicineSuggestions';
import PatientDetails from './prescriptionComponent/PatientDetails';
import MedicineSection from './prescriptionComponent/MedicineSection';
import VaccineSection from './prescriptionComponent/VaccineSection';
import LabTestSection from './prescriptionComponent/LabTestSection';

// Content API
import { useAuth } from "../../contentApi/AuthContext";
import { useMedicines } from "../../context/MedicinesContext";
import { useVaccine } from "../../context/VaccineContext";
import { useTests } from "../../context/TestContext";


const PrescriptionCreation = ({ onResetTimer }) => {
  const {
    prescriptionFormData,
    medicines,
    patients,
    setPatients,
    setPrescriptionFormData,
    addMedicineRow,
    removeMedicineRow,
    updatePrescriptionFormField,
    resetPrescriptionForm,
    fetchPrescriptions,
    addPrescription,
    fetchMedicines,
    getMedicines,
    templates,
    fetchTemplates,
    getTemplateById,
    attachments,
    setAttachments,
    fetchPatientsFromAppointments
  } = usePrescription();

  const { fetchSymptoms, clinicSpecialites, symptomsBySpeciality } = useClinicManagement();
  const { medicines: contextMedicines, getMedicines: fetchContextMedicines } = useMedicines();
  const { vaccines: contextVaccines, getVaccines } = useVaccine();
  const { appointments } = useAppointments();
  const { categories, fetchCategories, fetchTestsBySpeciality } = useTests();
  const { doctors } = useBooking();
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [patientFilter, setPatientFilter] = useState("today");
  const [pendingPatientId, setPendingPatientId] = useState(null);
  const [pendingPatientData, setPendingPatientData] = useState(null);
  const [isRefreshingMedicines, setIsRefreshingMedicines] = useState(false);
  const [isRefreshingVaccines, setIsRefreshingVaccines] = useState(false);
  const [isRefreshingLabTests, setIsRefreshingLabTests] = useState(false);
  const [showVaccineSection, setShowVaccineSection] = useState(false);
  const [showLabTestSection, setShowLabTestSection] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [specialtyLabTests, setSpecialtyLabTests] = useState([]);
  const [loadingSpecialtyTests, setLoadingSpecialtyTests] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [specialtySymptoms, setSpecialtySymptoms] = useState([]);
  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [showSymptomSuggestions, setShowSymptomSuggestions] = useState(false);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [doctorBufferDates, setDoctorBufferDates] = useState({
    startBufferDate: 1,
    endBufferDate: 365,
  })
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [filteredMedicineSuggestions, setFilteredMedicineSuggestions] = useState([]);
  const symptomsInputRef = useRef(null);
  const medicineSuggestionBoxRef = useRef(null);
  const symptomSuggestionsRef = useRef(null);

  const colors = {
    primary: '#4A6FA5',      // Soft blue
    secondary: '#6B8E4E',    // Sage green
    accent: '#D4A76A',       // Warm gold
    success: '#5CB85C',      // Green
    warning: '#F0AD4E',      // Orange
    danger: '#D9534F',       // Red
    info: '#5BC0DE',         // Light blue
    light: '#F8F9FA',
    dark: '#343A40',
    purple: '#8E44AD',
    teal: '#20C997',
    pink: '#E83E8C'
  };

  const frequencyOptions = [
    { value: 'once-daily', label: 'Once Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'thrice-daily', label: 'Thrice Daily' },
    { value: 'four-times-daily', label: 'Four Times Daily' },
    { value: 'every-4-hours', label: 'Every 4 Hours' },
    { value: 'every-6-hours', label: 'Every 6 Hours' },
    { value: 'every-8-hours', label: 'Every 8 Hours' },
    { value: 'every-12-hours', label: 'Every 12 Hours' },
    { value: 'once-weekly', label: 'Once Weekly' },
    { value: 'twice-weekly', label: 'Twice Weekly' },
    { value: 'as-needed', label: 'As Needed' },
    { value: 'before-meals', label: 'Before Meals' },
    { value: 'after-meals', label: 'After Meals' },
    { value: 'with-meals', label: 'With Meals' },
    { value: 'at-bedtime', label: 'At Bedtime' },
  ];

  const durationUnitOptions = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
  ];

  const isOwnAppointment = (appointment) => {
    if (!user) return false;

    if (['super_admin', 'clinic_admin'].includes(user.role)) {
      return true;
    }

    if (user.role === 'doctor') {
      const appointmentDoctorId = appointment.doctor_id || appointment.doctorId;
      const currentDoctorId = user.doctorId || user.id;

      if (appointmentDoctorId && currentDoctorId) {
        return appointmentDoctorId.toString() === currentDoctorId.toString();
      }

      const appointmentDoctorName = appointment.doctor;
      const currentDoctorName = user.doctorName || user.name;

      if (appointmentDoctorName && currentDoctorName) {
        return appointmentDoctorName.toLowerCase().includes(currentDoctorName.toLowerCase()) ||
          currentDoctorName.toLowerCase().includes(appointmentDoctorName.toLowerCase());
      }
    }

    return false;
  };

  const isOwnPatient = (patient) => {
    if (!user) return false;

    if (['super_admin', 'clinic_admin'].includes(user.role)) {
      return true;
    }

    if (user.role === 'doctor') {
      const patientDoctorId = patient.doctor_id || patient.doctorId;
      const currentDoctorId = user.doctorId || user.id;

      if (patientDoctorId && currentDoctorId) {
        return patientDoctorId.toString() === currentDoctorId.toString();
      }

      const patientDoctorName = patient.doctor;
      const currentDoctorName = user.doctorName || user.name;

      if (patientDoctorName && currentDoctorName) {
        return patientDoctorName.toLowerCase().includes(currentDoctorName.toLowerCase()) ||
          currentDoctorName.toLowerCase().includes(patientDoctorName.toLowerCase());
      }
    }

    return false;
  };

  const handleRefreshPatients = async () => {
    try {
      await fetchPatientsFromAppointments();
      toast.success("Patient list refreshed");
    } catch (error) {
      console.error("Error Refreshing patients", error);
      // toast.error("Failed to refresh patient list");
    }
  }

  const extractKeywordsAndFindMedicines = (symptomsText) => {
    if (!symptomsText.trim()) {
      setFilteredMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
      return;
    }

    const keywords = symptomsText.toLowerCase().split(/\s+/).filter(word => word.length > 2);

    const matchedMedicines = contextMedicines.filter(medicine => {
      if (medicine.keywords && Array.isArray(medicine.keywords)) {
        const medicineKeywords = medicine.keywords.map(k => k.toLowerCase());
        return keywords.some(keyword =>
          medicineKeywords.some(medKeyword => medKeyword.includes(keyword) || keyword.includes(medKeyword))
        );
      }

      const medicineName = medicine.name?.toLowerCase() || '';
      const medicineBrand = medicine.brand?.toLowerCase() || '';
      const medicineCategory = medicine.category?.toLowerCase() || '';

      return keywords.some(keyword =>
        medicineName.includes(keyword) ||
        medicineBrand.includes(keyword) ||
        medicineCategory.includes(keyword) ||
        (medicine.notes && medicine.notes.toLowerCase().includes(keyword))
      );
    });

    const suggestions = matchedMedicines.slice(0, 8).map(med => {
      const variation = med.variations?.[0];
      return {
        label: `${med.name} (${variation?.sku || 'N/A'})`,
        value: variation?.sku || med.id,
        medicineName: med.name,
        sku: variation?.sku || med.id,
        price: Number(variation?.price) || 0,
        unit: variation?.unit,
        productId: med.id,
        ...variation,
      };
    });

    setFilteredMedicineSuggestions(suggestions);
    setShowMedicineSuggestions(suggestions.length > 0);
  };

  const fetchPatientSymptomsAndDiagnoses = async (patient) => {
    if (!patient) {
      setSpecialtySymptoms([]);
      setAllDiagnoses([]);
      return;
    }

    const specialtyId = getSpecialtyIdFromPatient(patient);
    if (!specialtyId) {
      setSpecialtySymptoms([]);
      setAllDiagnoses([]);
      return;
    }

    setLoadingSymptoms(true);
    try {
      if (!symptomsBySpeciality[specialtyId]) {
        // If not, fetch them
        await fetchSymptoms(specialtyId);
      }

      const symptomsData = symptomsBySpeciality[specialtyId] || [];
      const symptomsArray = Array.isArray(symptomsData) ? symptomsData : [];
      setSpecialtySymptoms(symptomsArray);

      // Extract all unique diagnoses from symptoms
      const diagnosesSet = new Set();
      symptomsArray.forEach(symptom => {
        // Check if symptom has the diagnosis property
        if (symptom && symptom.diagnosis && Array.isArray(symptom.diagnosis)) {
          symptom.diagnosis.forEach(d => {
            if (d && d.trim()) {
              diagnosesSet.add(d.trim());
            }
          });
        }
      });

      setAllDiagnoses(Array.from(diagnosesSet));
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      // toast.error("Failed to load specialty symptoms");
      setSpecialtySymptoms([]);
      setAllDiagnoses([]);
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleSymptomsChange = (e) => {
    const value = e.target.value;
    handleFieldChange("symptoms", value);
    handleAutoResize(e);

    if (value.trim() && specialtySymptoms.length > 0) {
      const filtered = specialtySymptoms.filter(symptom =>
        symptom.name.toLowerCase().includes(value.toLowerCase())
      );

      if (filtered.length > 0) {
        console.log("Matching specialty symptoms:", filtered);
        setShowSymptomSuggestions(true);
      } else {
        setShowSymptomSuggestions(false);
      }
    } else {
      setShowSymptomSuggestions(false);
    }
    extractKeywordsAndFindMedicines(value);
  };

  const SymptomSuggestions = () => {
    if (loadingSymptoms) {
      return null;
    }

    if (!showSymptomSuggestions || !prescriptionFormData.symptoms || prescriptionFormData.symptoms.trim() === '' || specialtySymptoms.length === 0) {
      return null;
    }

    const inputValue = prescriptionFormData.symptoms.toLowerCase();
    const matchingSymptoms = specialtySymptoms.filter(symptom =>
      symptom && symptom.name && symptom.name.toLowerCase().includes(inputValue)
    );

    if (matchingSymptoms.length === 0) {
      return null;
    }

    return (
      <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 9999 }} ref={symptomSuggestionsRef}>
        <div className="p-2 border-bottom d-flex justify-content-between align-items-center">
          <small className="text-muted fw-bold">Specialty Symptoms</small>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger py-0 px-2"
            onClick={() => setShowSymptomSuggestions(false)}
            style={{ fontSize: '0.7rem' }}
          >
            ×
          </button>
        </div>
        {matchingSymptoms.slice(0, 5).map((symptom, index) => (
          <div
            key={index}
            className="p-2 border-bottom hover-bg cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleFieldChange("symptoms", symptom.name);
              // Don't auto-fill diagnosis here - let user select from diagnosis suggestions
              setShowSymptomSuggestions(false);
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{symptom.name}</strong>
                {symptom.diagnosis && symptom.diagnosis.length > 0 && (
                  <small className="text-muted d-block mt-1">
                    Common diagnoses: {symptom.diagnosis.slice(0, 3).join(', ')}
                    {symptom.diagnosis.length > 3 && '...'}
                  </small>
                )}
              </div>
              <span className="badge bg-primary">Specialty</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DiagnosisSuggestions = () => {
    if (!patient || !prescriptionFormData.diagnosis || prescriptionFormData.diagnosis.trim() === '' || allDiagnoses.length === 0) {
      return null;
    }

    const inputValue = prescriptionFormData.diagnosis.toLowerCase();
    const matchingDiagnoses = allDiagnoses.filter(diagnosis =>
      diagnosis.toLowerCase().includes(inputValue)
    );

    if (matchingDiagnoses.length === 0) {
      return null;
    }

    return (
      <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 9999 }}>
        <div className="p-2 border-bottom">
          <small className="text-muted fw-bold">Specialty Diagnoses</small>
        </div>
        {matchingDiagnoses.slice(0, 5).map((diagnosis, index) => (
          <div
            key={index}
            className="p-2 border-bottom hover-bg cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => handleFieldChange("diagnosis", diagnosis)}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{diagnosis}</strong>
              </div>
              <span className="badge bg-info">Diagnosis</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const clearSpecialtyData = () => {
    setSpecialtySymptoms([]);
    setAllDiagnoses([]);
    setSpecialtyLabTests([]);
    setShowSymptomSuggestions(false);
    setShowMedicineSuggestions(false);
    setShowDiagnosisSuggestions(false);
    setFilteredDiagnosisSuggestions([]);
    setMedicineSuggestions([]);
    setInstructionSuggestions([]);
    setFilteredMedicineSuggestions([]);
  };

  const handleRefreshMedicines = async () => {
    setIsRefreshingMedicines(true);
    try {
      await fetchContextMedicines();
      setPrescriptionFormData(prev => ({
        ...prev,
        medicines: [{
          medicine: null,
          medicine_timing: "",
          notes: "",
          sku: "",
          frequency: "",
          durationValue: "",
          durationUnit: "days"
        }]
      }));
      toast.success("Medicines list refreshed successfully!");
    } catch (error) {
      console.log("Failed to refresh medicines list");
      // toast.error("Failed to refresh medicines list");
    } finally {
      setIsRefreshingMedicines(false);
    }
  };

  const handleRefreshVaccines = async () => {
    setIsRefreshingVaccines(true);
    try {
      await getVaccines();
      resetVaccineFormData();
      setPrescriptionFormData(prev => ({
        ...prev,
        vaccines: []
      }));
      toast.success("Vaccines list refreshed successfully!");
    } catch (error) {
      // console.log("Failed to refresh vaccines list");
      toast.error("Failed to refresh vaccines list");
    } finally {
      setIsRefreshingVaccines(false);
    }
  };

  const handleRefreshLabTests = async () => {
    setIsRefreshingLabTests(true);
    try {
      await fetchCategories();
      resetLabTestFormData();
      setPrescriptionFormData(prev => ({
        ...prev,
        labTests: []
      }));
      toast.success("Lab tests list refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh lab tests list");
    } finally {
      setIsRefreshingLabTests(false);
    }
  };

  const handleResetForm = () => {
    resetPrescriptionForm();
    clearSpecialtyData();
    setPrescriptionFormData(prev => ({
      ...prev,
      patient: null,
      vaccines: [],
      labTests: []
    }));
    setAttachments([]);
    setErrors({});
    setShowVaccineSection(false);
    setShowLabTestSection(false);
    resetVaccineFormData();
    resetLabTestFormData();
    // Also clear the specialty symptoms and diagnoses
    setSpecialtySymptoms([]);
    setAllDiagnoses([]);
    setSpecialtyLabTests([]);

    // Clear suggestion states
    setShowSymptomSuggestions(false);
    setShowDiagnosisSuggestions(false);
    setFilteredDiagnosisSuggestions([]);
    setShowMedicineSuggestions(false);
    setFilteredMedicineSuggestions([]);
    toast.info("Form reset successfully!");
  };


  const handleFetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      await fetchTemplates();
      toast.success("Templates loaded successfully!");
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const fetchLabTestsBySpecialty = async (specialtyId) => {
    if (!specialtyId) return;

    setLoadingSpecialtyTests(true);
    try {
      const tests = await fetchTestsBySpeciality(specialtyId);
      setSpecialtyLabTests(tests);
    } catch (error) {
      console.error("Error fetching specialty lab tests:", error);
      // toast.error("Failed to load specialty lab tests");
      setSpecialtyLabTests([]);
    } finally {
      setLoadingSpecialtyTests(false);
    }
  };

  const handlePreviewAndSubmit = () => {
    const { patient, symptoms, diagnosis, followUpDate, medicines } =
      prescriptionFormData;
    const newErrors = {};

    if (!patient) newErrors.patient = "Please select a patient.";
    if (!symptoms.trim()) newErrors.symptoms = "Symptoms are required.";
    if (!diagnosis.trim()) newErrors.diagnosis = "Diagnosis is required.";

    medicines.forEach((row, index) => {
      if (!row.medicine || !row.medicine.medicineName) {
        newErrors[`medicine_${index}`] = "Please select a medicine.";
      }
      if (!row.medicine_timing || row.medicine.timing === "0-0-0") {
        newErrors[`timing_${index}`] = "Please select a timing for this medicine";
      }
    });

    let doctorId = null;

    if (patient) {
      if (patient.doctorId) {
        doctorId = patient.doctorId;
      } else if (patient.doctor_id) {
        doctorId = patient.doctor_id;
      } else if (patient.doctor && patient.doctor.id) {
        doctorId = patient.doctor.id;
      } else if (user) {
        doctorId = user.id;
      }
    }

    if (!doctorId && user) {
      if (user.role === "doctor" && user.doctorId) {
        doctorId = user.doctorId;
      } else if (user.role === "doctor" && user.id) {
        doctorId = user.id;
      } else if (user.id) {
        doctorId = user.id;
      }
    }

    if (!doctorId) {
      newErrors.doctor = "Doctor information is missing. Please ensure a doctor is assigned to this patient or you are logged in as a doctor.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted errors.");
      return;
    }

    const formattedMedicines = medicines.map((row) => {
      let combinedDuration = null;
      if (row.durationValue && row.durationUnit) {
        combinedDuration = `${row.durationValue} ${row.durationUnit}`;
      }

      return {
        ...row,
        combinedDuration: combinedDuration,
        frequencyLabel: frequencyOptions.find(opt => opt.value === row.frequency)?.label || row.frequency,
      };
    });

    const previewData = {
      ...prescriptionFormData,
      doctor: user,
      previewDate: new Date().toISOString(),
      attachments: attachments
    };

    setPreviewData(previewData);
    setShowPreview(true);
  };

  const fetchSpecialties = async () => {
    setLoadingSpecialties(true);
    try {
      const response = await fetch('https://bkdemo1.clinicpro.cc/speciality/speciality-list');
      if (!response.ok) throw new Error('Failed to fetch specialties');
      const data = await response.json();
      setSpecialties(data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      // toast.error("Failed to load specialties list");
    } finally {
      setLoadingSpecialties(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
    handleFetchTemplates();
    handleRefreshMedicines();
    getVaccines();
    fetchCategories();
  }, []);

  const patient = prescriptionFormData?.patient;

  const getTodaysApprovedAppointments = () => {
    const today = new Date().toISOString().split('T')[0];

    return appointments
      .filter(appt => {
        const apptDate = new Date(appt.date).toISOString().split('T')[0];
        const isTodayAppointment = apptDate === today && (appt.status === 'approved' || appt.status === 'done');
        return isTodayAppointment && isOwnAppointment(appt);
      })
      .map(appt => {
        const patientData = appt.patient || {};
        const doctorData = appt.doctor || {};

        return {
          ...appt,
          id: appt.patientId || appt.id,
          patientId: appt.patientId,
          patientName: appt.patientName,
          patientEmail: appt.patientEmail,
          patientPhone: appt.patientPhone,
          patientAge: appt.patientAge,
          appointment_date: appt.date,
          appointment_time: appt.time,
          doctor: appt.doctor,
          doctorId: appt.doctorId,
          status: appt.status,
          appointmentId: appt.id,
        }
      });
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const getFilteredPatients = () => {
    if (patientFilter === "today") {
      return getTodaysApprovedAppointments();
    }
    if (patientFilter === "all") {
      return patients.filter(patient => isOwnPatient(patient));
    }
    return patients;
  };

  useEffect(() => {
    if (patientFilter === "today") {
      console.log("🔍 TODAY filter active");
      console.log("Patients (raw):", patients);
      console.log("Filtered Patients:", filteredPatients);
    }
  }, [patients, patientFilter]);

  const filteredPatients = getFilteredPatients();

  const patientOptions = filteredPatients.map((patient) => {
    const patientId = patient.patientId || patient.id || "N/A";
    const appointmentId = patient.appointmentId || "N/A";
    const patientphone = patient.patientPhone || "N/A";
    const user = patient?.user || {};
    const displayName = patient.patientName || "Unknown Patient";

    return {
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span>{displayName || "Unknown"}</span>
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#666' }}>
            <span>Appt: {appointmentId}</span>
            <span>PID: {patientId}</span>
            <span>{patientphone}</span>
          </div>
        </div>
      ),
      value: patientId,
      rawPatient: patient,
      searchText: `${displayName} ${appointmentId} ${patientphone} ${patientId}`.toLowerCase()
    };
  });

  const customFilterOption = (option, inputValue) => {
    const searchText = inputValue.toLowerCase().trim();
    if (!searchText) return true;
    return option.data.searchText.includes(searchText);
  };

  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
  const [filteredDiagnosisSuggestions, setFilteredDiagnosisSuggestions] = useState([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [instructionSuggestions, setInstructionSuggestions] = useState([]);
  const diagnosisInputRef = useRef(null);
  const suggestionBoxRef = useRef(null);
  const [doctorsList, setDoctorsList] = useState([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target) &&
        diagnosisInputRef.current &&
        !diagnosisInputRef.current.contains(event.target)
      ) {
        setShowDiagnosisSuggestions(false);
      }

      if (
        medicineSuggestionBoxRef.current &&
        !medicineSuggestionBoxRef.current.contains(event.target) &&
        symptomsInputRef.current &&
        !symptomsInputRef.current.contains(event.target)
      ) {
        setShowMedicineSuggestions(false);
      }

      if (
        symptomSuggestionsRef.current &&
        !symptomSuggestionsRef.current.contains(event.target) &&
        symptomsInputRef.current &&
        !symptomsInputRef.current.contains(event.target)
      ) {
        setShowSymptomSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const diagnosisSuggestions = templates.map(t => ({
    label: t.diagnosis || t.template_name,
    medicines: t.medicines?.map(m => m.medicine_name) || [],
    instructions: t.instructions ? [t.instructions] : []
  }));

  const handleDiagnosisFocus = () => {
    filterDiagnosisSuggestions(prescriptionFormData.diagnosis || '');
    setShowDiagnosisSuggestions(true);
  };

  const handleDiagnosisChange = (e) => {
    const value = e.target.value;
    handleFieldChange("diagnosis", value);

    // Combine specialty diagnoses with template diagnoses
    let combinedSuggestions = [];

    // Add specialty diagnoses
    if (value.trim() && allDiagnoses.length > 0) {
      const filteredSpecialtyDiagnoses = allDiagnoses.filter(diagnosis =>
        diagnosis.toLowerCase().includes(value.toLowerCase())
      );
      combinedSuggestions.push(
        ...filteredSpecialtyDiagnoses.map(d => ({
          label: d,
          medicines: [],
          instructions: [],
          isSpecialty: true
        }))
      );
    }

    // Add template diagnoses
    const filteredTemplateDiagnoses = diagnosisSuggestions.filter(s =>
      s.label.toLowerCase().includes(value.toLowerCase())
    );
    combinedSuggestions.push(...filteredTemplateDiagnoses);

    setFilteredDiagnosisSuggestions(combinedSuggestions);
    setShowDiagnosisSuggestions(true);

    const found = diagnosisSuggestions.find(s => s.label.toLowerCase() === value.toLowerCase());
    setMedicineSuggestions(found ? found.medicines : []);
    setInstructionSuggestions(found ? found.instructions : []);
  };

  const handleDiagnosisSuggestionClick = (suggestion) => {
    handleFieldChange("diagnosis", suggestion.label);
    if (!suggestion.isSpecialty) {
      setMedicineSuggestions(suggestion.medicines);
      setInstructionSuggestions(suggestion.instructions);
    }
    setShowDiagnosisSuggestions(false);
  };

  const handleInstructionSuggestionClick = (suggestion) => {
    handleFieldChange('instructions', suggestion);
  };

  if (!('instructions' in prescriptionFormData)) {
    prescriptionFormData.instructions = '';
  }

  const medicineOptions = contextMedicines.flatMap(med =>
    (med.variations || []).map(variation => ({
      label: `${med.name} (${variation.sku})`,
      value: variation.sku,
      medicineName: med.name,
      sku: variation.sku,
      price: Number(variation.price) || 0,
      unit: variation.unit,
      productId: med.id,
      ...variation,
    }))
  );

  const handlePatientChange = async (selectedOption) => {
    if (!selectedOption) {
      // Clear patient and specialty data
      updatePrescriptionFormField("patient", null);
      setErrors((prev) => ({ ...prev, patient: "" }));
      clearSpecialtyData();
      handleFieldChange("symptoms", "");
      handleFieldChange("diagnosis", "");
      return;
    }
    const selectedPatient = selectedOption.rawPatient;
    updatePrescriptionFormField("patient", selectedPatient);
    setErrors((prev) => ({ ...prev, patient: "" }));
    clearSpecialtyData();
    await new Promise(resolve => setTimeout(resolve, 100));
    await fetchPatientSymptomsAndDiagnoses(selectedPatient);

    if (selectedPatient) {
      const specialtyId = getSpecialtyIdFromPatient(selectedPatient);
      if (specialtyId) {
        fetchLabTestsBySpecialty(specialtyId);
      } else {
        setSpecialtyLabTests([]);
        if (selectedPatient.doctorSpeciality) {
          toast.warn(`No specialty mapping found for "${selectedPatient.doctorSpeciality}". Showing general lab tests.`);
        }
      }
    } else {
      setSpecialtyLabTests([]);
    }
  };

  const clearAllSuggestions = () => {
    setShowSymptomSuggestions(false);
    setShowDiagnosisSuggestions(false);
    setShowMedicineSuggestions(false);
    setFilteredMedicineSuggestions([]);
    setFilteredDiagnosisSuggestions([]);
    setMedicineSuggestions([]);
    setInstructionSuggestions([]);

    // Clear any open suggestion boxes
    if (symptomSuggestionsRef.current) {
      symptomSuggestionsRef.current.style.display = 'none';
    }
    if (suggestionBoxRef.current) {
      suggestionBoxRef.current.style.display = 'none';
    }
    if (medicineSuggestionBoxRef.current) {
      medicineSuggestionBoxRef.current.style.display = 'none';
    }
  };

  const getSpecialtyIdFromPatient = (patient) => {
    if (!patient) return null;

    if (patient.doctorSpecialityId) {
      return patient.doctorSpecialityId;
    }
    if (patient.speciality_id) {
      return patient.speciality_id;
    }
    if (patient.doctor && patient.doctor.speciality_id) {
      return patient.doctor.speciality_id;
    }
    if (patient.doctorSpeciality && specialties.length > 0) {
      const foundSpecialty = specialties.find(
        spec => spec.speciality?.toLowerCase() === patient.doctorSpeciality.toLowerCase()
      );
      if (foundSpecialty) {
        return foundSpecialty.id;
      }
    }

    if (patient.doctor_id && doctors.length > 0) {
      const foundDoctor = doctors.find(doc => doc.id === patient.doctor_id);
      if (foundDoctor && foundDoctor.speciality_id) {
        return foundDoctor.speciality_id;
      }
    }

    return null;
  };

  const handleFieldChange = (field, value) => {
    updatePrescriptionFormField(field, value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleMedicineChange = (selectedOption, index) => {
    const updatedMedicines = [...prescriptionFormData.medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      medicine: selectedOption,
      sku: selectedOption.sku,
    };
    setPrescriptionFormData(prev => ({
      ...prev,
      medicines: updatedMedicines,
    }));
  };

  const handleMedicineSuggestionClick = (medicineOption) => {
    const emptyRowIndex = prescriptionFormData.medicines.findIndex(row => !row.medicine);

    if (emptyRowIndex !== -1) {
      const updatedMedicines = [...prescriptionFormData.medicines];
      updatedMedicines[emptyRowIndex] = {
        ...updatedMedicines[emptyRowIndex],
        medicine: medicineOption,
        sku: medicineOption.sku,
        notes: `For: ${prescriptionFormData.symptoms}`.substring(0, 100)
      };
      setPrescriptionFormData(prev => ({
        ...prev,
        medicines: updatedMedicines,
      }));
    } else {
      const updatedMedicines = [...prescriptionFormData.medicines, {
        medicine: medicineOption,
        medicine_timing: "1-0-0",
        notes: `For: ${prescriptionFormData.symptoms}`.substring(0, 100),
        sku: medicineOption.sku,
        frequency: "",
        durationValue: "",
        durationUnit: "days"
      }];

      setPrescriptionFormData(prev => ({
        ...prev,
        medicines: updatedMedicines,
      }));
    }

    toast.success(`Added ${medicineOption.medicineName} to prescription`);
    setShowMedicineSuggestions(false);
  };

  const handleNotesChangeWrapper = (e, index) => {
    const updatedMedicines = [...prescriptionFormData.medicines];
    updatedMedicines[index].notes = e.target.value;
    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: updatedMedicines,
    }));
  };

  const timingLabels = ["Morning", "Afternoon", "Evening", "Night"];

  const getTimingArray = (timingStr = "") => {
    if (!timingStr) return [0, 0, 0];
    return timingStr.split("-").map((v) => (v === "1" ? 1 : 0));
  };

  const handleTimingCheckboxChange = (index, pos) => {
    const updatedMedicines = [...prescriptionFormData.medicines];
    const currentArr = getTimingArray(updatedMedicines[index].medicine_timing);
    currentArr[pos] = currentArr[pos] ? 0 : 1;
    updatedMedicines[index].medicine_timing = currentArr.join("-");
    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: updatedMedicines,
    }));
  };

  const handleRemoveRow = (index) => {
    if (prescriptionFormData.medicines.length > 1) {
      const updated = [...prescriptionFormData.medicines];
      updated.splice(index, 1);
      setPrescriptionFormData((prev) => ({ ...prev, medicines: updated }));
    } else {
      toast.warn("At least one medicine must be present!");
    }
  };

  const handleAddRow = () => {
    addMedicineRow();
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      setAttachments(prev => [...prev, ...results]);
    });
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkDoctorAvailability = (date) => {
    return true;
  };

  const getAvailabilityStatus = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + doctorBufferDates.startBufferDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + doctorBufferDates.endBufferDate);
    return date >= minDate && date <= maxDate;
  };

  const getMonthAvailabilityStatus = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + doctorBufferDates.startBufferDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + doctorBufferDates.endBufferDate);

    return date >= minDate && date <= maxDate;
  };

  const isDateSelected = (days) => {
    if (!prescriptionFormData.followUpDate) return false;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return prescriptionFormData.followUpDate === targetDate.toISOString().split('T')[0];
  };

  const isMonthSelected = () => {
    if (!prescriptionFormData.followUpDate) return false;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);
    return prescriptionFormData.followUpDate === targetDate.toISOString().split('T')[0];
  };

  const validateFollowUpDate = (dateString) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.warn("Follow-up date cannot be in the past!");
      return false;
    }
    return true;
  };

  const getCurrentDoctorBufferDays = () => {
    if (!user) return { startBufferDate: 1, endBufferDate: 365 };

    if (user.role === 'doctor') {
      const currentDoctor = doctors.find(doc =>
        doc.id === user.doctorId || doc.id === user.id
      );

      if (currentDoctor) {
        return {
          startBufferDate: currentDoctor.startBufferTime || 1,
          endBufferDate: currentDoctor.endBufferTime || 365
        };
      }
    }

    if (prescriptionFormData.patient) {
      const patientDoctorId = prescriptionFormData.patient.doctor_id || prescriptionFormData.patient.doctorId;
      if (patientDoctorId) {
        const patientDoctor = doctors.find(doc => doc.id === patientDoctorId);
        if (patientDoctor) {
          return {
            startBufferDate: patientDoctor.startBufferTime || 1,
            endBufferDate: patientDoctor.endBufferTime || 365
          };
        }
      }
    }

    return { startBufferDate: 1, endBufferDate: 365 };
  };

  useEffect(() => {
    const bufferDays = getCurrentDoctorBufferDays();
    setDoctorBufferDates(bufferDays);
  }, [user, prescriptionFormData.patient, doctors]);

  const handleSubmitPrescription = async (previewData = null) => {
    setIsSubmitting(true);

    try {
      const dataToSubmit = previewData || prescriptionFormData;
      const { patient, symptoms, diagnosis, followUpDate, medicines } = dataToSubmit;

      const formattedMedicines = medicines.map((row) => {
        const medicineTiming = row.medicine_timing && row.medicine_timing.trim() !== ''
          ? row.medicine_timing
          : "0-0-0";

        return {
          medicine_name: row.medicine?.medicineName || row.medicine?.name || null,
          medicine_timing: medicineTiming,
          notes: row.notes || null,
          sku: row.sku || null,
          frequency: null,
          duration: null,
        };
      });

      const imageUrls = attachments.map(attachment => attachment.data);

      let doctorId = null;
      if (patient) {
        if (patient.doctorId) {
          doctorId = patient.doctorId;
        } else if (patient.doctor_id) {
          doctorId = patient.doctor_id;
        } else if (patient.doctor && patient.doctor.id) {
          doctorId = patient.doctor.id;
        } else if (user) {
          doctorId = user.id;
        }
      }

      if (!doctorId && user) {
        if (user.role === "doctor" && user.doctorId) {
          doctorId = user.doctorId;
        } else if (user.role === "doctor" && user.id) {
          doctorId = user.id;
        } else if (user.id) {
          doctorId = user.id;
        }
      }

      const formattedPrescription = {
        doctor_id: doctorId,
        patient_id: patient.id || patient.patient_id,
        appointment_date: patient.appointment_date || "",
        appointment_time: patient.appointment_time || "",
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        follow_up_date: followUpDate || null,
        instructions: dataToSubmit.instructions || "",
        medicines: formattedMedicines,
        vaccines: (dataToSubmit.vaccines || []).map((v) => ({
          vaccine_name: v.vaccine?.medicineName || v.vaccine?.name || v.vaccine?.label || null,
          vaccine_notes: v.notes || null,
          vaccine_sku: v.sku || v.vaccine?.sku || null,
        })),
        lab_tests: (dataToSubmit.labTests || []).map((lt) => ({
          test_name: lt.labTest?.medicineName || lt.labTest?.name || lt.labTest?.label || null,
          test_notes: lt.notes || null,
          test_sku: lt.sku || lt.labTest?.sku || null,
        })),
        image_urls: imageUrls,
      };

      const result = await addPrescription(formattedPrescription);

      if (result) {
        toast.success("Prescription submitted successfully!");
        resetPrescriptionForm();
        resetVaccineFormData();
        resetLabTestFormData();
        setShowVaccineSection(false);
        setShowLabTestSection(false);
        setPrescriptionFormData((prev) => ({
          ...prev,
          vaccines: [],
          labTests: [],
        }));

        if (onResetTimer) {
          onResetTimer();
        }
        setAttachments([]);
        setErrors({});
        setShowPreview(false);
        await fetchPrescriptions();
      }
    } catch (error) {
      console.error("Submit Error:", error);
      // toast.error("Server error while submitting prescription.");
    }

    setIsSubmitting(false);
  };

  const handleSubmitFromPreview = () => {
    if (previewData) {
      handleSubmitPrescription(previewData);
    }
  };

  const handleAutoResize = (e) => {
    e.target.style.height = '28px';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  useEffect(() => {
    const fromCalendar = localStorage.getItem('prescriptionFromCalendar');
    if (fromCalendar) {
      try {
        const { patientId, patientData } = JSON.parse(fromCalendar);
        setPatientFilter('all');
        let found = null;
        if (patients && patients.length > 0) {
          found = patients.find(
            (p) => p.id === patientId || p.patient_id === patientId
          );
        }
        if (!found && patientData) {
          setPendingPatientId(patientId);
          setPendingPatientData(patientData);
          setPatients((prev) => [...prev, patientData]);
        } else if (found) {
          setPrescriptionFormData((prev) => ({ ...prev, patient: found }));
        }
      } catch { }
      localStorage.removeItem('prescriptionFromCalendar');
    }
  }, []);

  useEffect(() => {
    if (pendingPatientId && patients && patients.length > 0) {
      const found = patients.find(
        (p) => p.id === pendingPatientId || p.patient_id === pendingPatientId
      );
      if (found) {
        setPrescriptionFormData((prev) => ({ ...prev, patient: found }));
        setPendingPatientId(null);
        setPendingPatientData(null);
      }
    }
  }, [patients, pendingPatientId, setPrescriptionFormData]);

  const [vaccineFormData, setVaccineFormData] = useState({
    vaccine: null,
    notes: '',
    sku: ''
  });

  const [labTestFormData, setLabTestFormData] = useState({
    labTest: null,
    notes: '',
    sku: ''
  });

  const handleVaccineFieldChange = (field, value) => {
    setVaccineFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetVaccineFormData = () => {
    setVaccineFormData({
      vaccine: null,
      notes: '',
      sku: ''
    });
  };

  const resetLabTestFormData = () => {
    setLabTestFormData({
      labTest: null,
      notes: '',
      sku: ''
    });
  };

  const handleVaccineChange = (selectedOption, index = null) => {
    if (index !== null) {
      const updated = [...prescriptionFormData.vaccines];
      updated[index] = {
        ...updated[index],
        vaccine: selectedOption,
        notes: selectedOption.notes || ''
      };
      setPrescriptionFormData(prev => ({ ...prev, vaccines: updated }));
    } else {
      if (selectedOption) {
        const newVaccine = {
          vaccine: selectedOption,
          notes: selectedOption.notes || '',
          sku: selectedOption.sku || selectedOption.value
        };

        setPrescriptionFormData(prev => ({
          ...prev,
          vaccines: [...(prev.vaccines || []), newVaccine]
        }));

        resetVaccineFormData();
      }
    }
  };

  const handleVaccineNotesChange = (e, index = null) => {
    if (index !== null) {
      const updated = [...prescriptionFormData.vaccines];
      updated[index] = {
        ...updated[index],
        notes: e.target.value
      };
      setPrescriptionFormData(prev => ({ ...prev, vaccines: updated }));
    } else {
      setVaccineFormData(prev => ({ ...prev, notes: e.target.value }));
    }
  };

  const handleLabTestFieldChange = (field, value) => {
    setLabTestFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLabTestChange = (selectedOption, index = null) => {
    if (index !== null) {
      const updated = [...prescriptionFormData.labTests];
      updated[index] = {
        ...updated[index],
        labTest: selectedOption,
        notes: selectedOption.notes || ''
      };
      setPrescriptionFormData(prev => ({ ...prev, labTests: updated }));
    } else {
      if (selectedOption) {
        const newLabTest = {
          labTest: selectedOption,
          notes: selectedOption.notes || '',
          sku: selectedOption.sku || selectedOption.value
        };

        setPrescriptionFormData(prev => ({
          ...prev,
          labTests: [...(prev.labTests || []), newLabTest]
        }));

        resetLabTestFormData();
      }
    }
  };

  const handleLabTestNotesChange = (e, index = null) => {
    if (index !== null) {
      const updated = [...prescriptionFormData.labTests];
      updated[index] = {
        ...updated[index],
        notes: e.target.value
      };
      setPrescriptionFormData(prev => ({ ...prev, labTests: updated }));
    } else {
      setLabTestFormData(prev => ({ ...prev, notes: e.target.value }));
    }
  };

  const handleAddVaccineRow = () => {
    setPrescriptionFormData(prev => ({
      ...prev,
      vaccines: [...(prev.vaccines || []), { vaccine: null, notes: '', sku: '' }]
    }));
  };

  const handleRemoveVaccineRow = (index) => {
    if (prescriptionFormData.vaccines && prescriptionFormData.vaccines.length > 0) {
      const updatedVaccines = prescriptionFormData.vaccines.filter((_, i) => i !== index);
      setPrescriptionFormData(prev => ({
        ...prev,
        vaccines: updatedVaccines
      }));
      toast.success("Vaccine removed successfully!");
    } else {
      toast.warn("No vaccines to remove!");
    }
  };

  const handleAddLabTestRow = () => {
    setPrescriptionFormData(prev => ({
      ...prev,
      labTests: [...(prev.labTests || []), { labTest: null, notes: '', sku: '' }]
    }));
  };

  const getCurrentDoctorInfo = () => {
    if (!user) return null;

    if (user.role === 'doctor') {
      return doctors.find(doc => doc.id === user.doctorId || doc.id === user.id);
    }

    if (prescriptionFormData.patient) {
      const patientDoctorId = prescriptionFormData.patient.doctor_id || prescriptionFormData.patient.doctorId;
      if (patientDoctorId) {
        return doctors.find(doc => doc.id === patientDoctorId);
      }
    }

    return null;
  };

  const handleRemoveLabTestRow = (index) => {
    if (prescriptionFormData.labTests && prescriptionFormData.labTests.length > 0) {
      const updatedLabTests = prescriptionFormData.labTests.filter((_, i) => i !== index);
      setPrescriptionFormData(prev => ({
        ...prev,
        labTests: updatedLabTests
      }));
      toast.success("Lab test removed successfully!");
    } else {
      toast.warn("No lab tests to remove!");
    }
  };

  if (!prescriptionFormData.vaccines) {
    prescriptionFormData.vaccines = [];
  }

  if (!prescriptionFormData.labTests) {
    prescriptionFormData.labTests = [];
  }

  const vaccineOptions = contextVaccines.map((vac) => ({
    label: `${vac.medicineName || vac.name || "Unknown"} (${vac.vaccine_type || "N/A"})`,
    value: vac.sku || vac.id || vac.medicineName || vac.name,
    medicineName: vac.medicineName || vac.name,
    price: vac.price || 0,
    sku: vac.sku || vac.id || vac.medicineName || vac.name,
    notes: vac.notes || '',
    ...vac,
  }));

  const filterDiagnosisSuggestions = (inputValue) => {
    const searchText = inputValue.toLowerCase().trim();

    let combinedSuggestions = [];

    // Add specialty diagnoses
    if (allDiagnoses && allDiagnoses.length > 0) {
      const filteredSpecialtyDiagnoses = allDiagnoses
        .filter(diagnosis => diagnosis.toLowerCase().includes(searchText))
        .map(d => ({
          label: d,
          source: 'Specialty',
          isSpecialty: true,
          medicines: [],
          instructions: []
        }));
      combinedSuggestions.push(...filteredSpecialtyDiagnoses);
    }

    // Add template diagnoses
    const filteredTemplateDiagnoses = diagnosisSuggestions
      .filter(s => s.label && s.label.toLowerCase().includes(searchText))
      .map(d => ({
        ...d,
        source: 'Template',
        isSpecialty: false
      }));
    combinedSuggestions.push(...filteredTemplateDiagnoses);

    // Remove duplicates
    const uniqueSuggestions = combinedSuggestions.filter((item, index, self) =>
      index === self.findIndex((t) => t.label === item.label)
    );

    setFilteredDiagnosisSuggestions(uniqueSuggestions);
  };

  const labTestOptions = specialtyLabTests.map(test => {
    const category = categories.find(cat => cat.id === test.category_id);
    return {
      label: test?.test_name,
      value: test?.id?.toString(),
      medicineName: test?.test_name,
      category: category?.category || 'Specialty Test',
      price: test.price || 0,
      sku: test.id.toString(),
      notes: test.notes || '',
      isSpecialtyTest: true,
      rawTest: test
    };
  });

  // Get unique medicine types for grouping
  const getMedicineTypes = () => {
    const types = new Set();
    types.add("All");

    if (filteredMedicineSuggestions.length > 0) {
      filteredMedicineSuggestions.forEach(medicine => {
        const originalMed = contextMedicines.find(
          med => med.id === medicine.productId ||
            med.variations?.some(v => v.id === medicine.id)
        );
        if (originalMed?.medicine_type) {
          types.add(originalMed.medicine_type);
        }
      });
    }

    return Array.from(types);
  };

  const medicineTypes = getMedicineTypes();
  const [selectedMedicineType, setSelectedMedicineType] = useState("All");

  // Filter medicines by selected type
  const getFilteredMedicinesByType = () => {
    if (selectedMedicineType === "All") {
      return filteredMedicineSuggestions;
    }

    return filteredMedicineSuggestions.filter(medicine => {
      const originalMed = contextMedicines.find(
        med => med.id === medicine.productId ||
          med.variations?.some(v => v.id === medicine.id)
      );
      return originalMed?.medicine_type === selectedMedicineType;
    });
  };

  return (
    <>
      <div className="row align-items-stretch">
        {/* Updated Medicine Suggestions Component */}
        <MedicineSuggestion
          showMedicineSuggestions={showMedicineSuggestions}
          filteredMedicineSuggestions={filteredMedicineSuggestions}
          selectedMedicineType={selectedMedicineType}
          setSelectedMedicineType={setSelectedMedicineType}
          medicineTypes={medicineTypes}
          contextMedicines={contextMedicines}
          handleMedicineSuggestionClick={handleMedicineSuggestionClick}
          setShowMedicineSuggestions={setShowMedicineSuggestions}
          getFilteredMedicinesByType={getFilteredMedicinesByType}
          innerRef={medicineSuggestionBoxRef}
        />

        {/* Prescription Form - center */}
        <div className="col-xl-9 d-flex mb-2 pe-0">
          <div className="card w-100 h-100 border-0 shadow-md" style={{
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
          }}>
            <div className="card-header d-flex align-items-center justify-content-between py-3 px-4 border-0" style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.info} 100%)`,
              color: 'white'
            }}>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <BsPrescription size={20} className="text-white" />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-white">Create Prescription</h5>
                  <small className="opacity-75">Fill in patient details and prescription information</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">

                {/* TEMPLATE DROPDOWN */}
                <div className="card-body p-0">
                  <select
                    className="form-select form-select-sm rounded-pill px-3 py-2"
                    defaultValue=""
                    onChange={e => {
                      const selectedValue = e.target.value;

                      if (selectedValue === "__none") {
                        resetPrescriptionForm();
                        setAttachments([]);
                        toast.info("Template cleared. Start fresh.");
                        return;
                      }

                      const selectedTemplate = templates.find(t => t.id === parseInt(selectedValue));

                      if (selectedTemplate) {
                        const mappedMedicines = selectedTemplate.medicines.map(templateMed => {
                          let foundMedicineOption = medicineOptions.find(opt =>
                            opt.productId === templateMed.product_id ||
                            opt.sku === templateMed.sku
                          );

                          if (!foundMedicineOption) {
                            for (const med of contextMedicines) {
                              const variation =
                                med.variations?.find(v => v.id === templateMed.product_id) ||
                                med.variations?.[0];

                              if (variation) {
                                foundMedicineOption = {
                                  label: `${med.name} (${variation.sku || 'N/A'})`,
                                  value: variation.sku || med.id,
                                  medicineName: med.name,
                                  sku: variation.sku,
                                  price: Number(variation.price) || 0,
                                  unit: variation.unit,
                                  productId: med.id,
                                  ...variation
                                };
                                break;
                              }
                            }
                          }

                          const fallback = {
                            label: `${templateMed.product_name || "Unknown"} (${templateMed.sku || "N/A"})`,
                            value: templateMed.sku || templateMed.product_id,
                            medicineName: templateMed.product_name || "Unknown Medicine",
                            sku: templateMed.sku || "",
                            price: 0,
                            productId: templateMed.product_id
                          };

                          return {
                            medicine: foundMedicineOption || fallback,
                            notes: templateMed.notes || "",
                            medicine_timing: templateMed.timing || "",
                            sku: templateMed.sku || ""
                          };
                        });


                        setPrescriptionFormData(prev => ({
                          ...prev,
                          symptoms: selectedTemplate.symptoms || "",
                          diagnosis: selectedTemplate.diagnosis || "",
                          instructions: selectedTemplate.instructions || "",
                          medicines: mappedMedicines
                        }));

                        toast.success(`Template '${selectedTemplate.template_name}' applied!`);
                      }
                    }}

                    style={{
                      border: "1px solid rgba(255,255,255,0.3)",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white"
                    }}
                  >
                    <option style={{ color: 'black' }} value="__none">Prescription Template...</option>
                    {templates.map(t => (
                      <option style={{ color: 'black' }} key={t.id} value={t.id}>{t.template_name}</option>
                    ))}
                  </select>
                </div>


                {/* RESET BUTTON (MATCHING STYLE) */}
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="btn btn-light btn-sm rounded-pill d-flex align-items-center gap-2 px-3"
                  title="Reset form"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.3)"
                  }}
                >
                  <GrPowerReset size={18} />
                  Reset
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="p-3 pb-0" style={{
                borderRadius: '0 0 20px 20px'
              }}>
<div className="form-group">
  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
    {/* Left side: Label and select input */}
    <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: '300px' }}>
      
      <div className="flex-grow-1 w-100">
        <ReactSelect
          options={patientOptions}
          value={prescriptionFormData.patient ? patientOptions.find(option => option.rawPatient.id === prescriptionFormData.patient?.id) : null}
          onChange={handlePatientChange}
          placeholder="Select Patient..."
          formatOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.rawPatient.id}
          filterOption={customFilterOption}
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: '8px',
              border: `2px solid ${errors.patient ? colors.danger : colors.purple}30`,
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              minHeight: '42px',
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: colors.purple
              }
            }),
            menu: base => ({
              ...base,
              zIndex: 99999,
            }),
            menuPortal: base => ({
              ...base,
              zIndex: 99999,
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? `${colors.purple}20` : state.isFocused ? `${colors.purple}10` : 'white',
              color: colors.dark,
              padding: '10px 14px',
              fontSize: '0.9rem',
              '&:active': {
                backgroundColor: `${colors.purple}30`
              }
            }),
            placeholder: base => ({
              ...base,
              color: '#6c757d',
              fontSize: '0.9rem'
            })
          }}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          noOptionsMessage={({ inputValue }) =>
            inputValue ? `No patients found for "${inputValue}"` : "No patients available"
          }
        />
        {errors.patient && (
          <p className="input-error text-danger mt-1 mb-0" style={{ fontSize: '0.8rem' }}>
            {errors.patient}
          </p>
        )}
      </div>
    </div>

    {/* Right side: Controls */}
    <div className="d-flex align-items-center gap-2 flex-shrink-0">
      <CreatePrescriptionToggle 
        filter={patientFilter} 
        setFilter={setPatientFilter} 
        colors={colors} 
      />
      <button
        type="button"
        onClick={handleRefreshPatients}
        className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-1"
        style={{
          fontSize: '0.63rem',
          backgroundColor: colors.primary,
          color: 'white',
          border: 'none',
          minHeight: '36px'
        }}
        title="Refresh patient list"
      >
        <FiRefreshCw size={14} />
        Refresh Patients list
      </button>
    </div>
  </div>
</div>
      
              </div>
      
              <div className='row p-3 pb-0'>
                <div className="col-md-6">
                  <div className="card bg-light shadow-sm rounded-2">
                    <div className="card-body p-4">
                      {/* <div className="d-flex align-items-center gap-3 mb-3"> */}
                        {/* <label className="form-label fw-bold mb-0" style={{ fontSize: '1.1em', color: colors.dark }}>Symptoms</label> */}
                      {/* </div> */}
                      <div style={{ position: 'relative' }}>
                        <textarea
                          rows={1}
                          className={`form-control bg-white border-0 shadow-sm px-3 ${errors.symptoms ? 'is-invalid' : ''}`}
                          placeholder="Enter Symptoms"
                          value={prescriptionFormData.symptoms}
                          onChange={handleSymptomsChange}
                          onFocus={() => {
                            if (prescriptionFormData.symptoms && specialtySymptoms && specialtySymptoms.length > 0 && !loadingSymptoms) {
                              setShowSymptomSuggestions(true);
                            }
                            extractKeywordsAndFindMedicines(prescriptionFormData.symptoms);
                          }}
                          ref={symptomsInputRef}
                          style={{ fontSize: '1em', borderRadius: 8, minHeight: 32, maxHeight: 120, overflow: 'hidden', resize: 'none', border: errors.symptoms ? `2px solid ${colors.danger}` : '1px solid #dee2e6' }}
                        />
                        <SymptomSuggestions />
                      </div>
                      {errors.symptoms && <p className="input-error text-danger mt-1 mb-0">{errors.symptoms}</p>}
                      {!loadingSymptoms && specialtySymptoms && specialtySymptoms.length > 0 && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-info-circle me-1"></i>
                          Specialty symptoms available for {prescriptionFormData.patient?.doctorSpeciality || 'this specialty'}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light shadow-sm rounded-2">
                    <div className="card-body p-4">
                      {/* <div className="d-flex align-items-center gap-3 mb-3"> */}
                        {/* <label className="form-label fw-bold mb-0" style={{ fontSize: '1.1em', color: colors.dark }}>Diagnosis</label> */}
                      {/* </div> */}

                      <div style={{ position: 'relative' }}>
                        <textarea
                          rows={1}
                          className={`form-control bg-white border-0 shadow-sm px-3 ${errors.diagnosis ? 'is-invalid' : ''}`}
                          placeholder="Enter Diagnosis or click to select from suggestions"
                          value={prescriptionFormData.diagnosis}
                          onFocus={() => {
                            if (!showDiagnosisSuggestions) {
                              handleDiagnosisFocus();
                            }
                          }}
                          onChange={e => {
                            const value = e.target.value;
                            handleFieldChange("diagnosis", value);
                            handleAutoResize(e);

                            // Filter suggestions based on input
                            filterDiagnosisSuggestions(value);
                            setShowDiagnosisSuggestions(true);
                          }}
                          autoComplete="off"
                          ref={diagnosisInputRef}
                          style={{ fontSize: '1em', borderRadius: 8, minHeight: 32, maxHeight: 120, overflow: 'hidden', resize: 'none', border: errors.diagnosis ? `2px solid ${colors.danger}` : '1px solid #dee2e6' }}
                        />

                        {/* Diagnosis Suggestions Dropdown */}
                        {showDiagnosisSuggestions && filteredDiagnosisSuggestions.length > 0 && (
                          <div
                            ref={suggestionBoxRef}
                            className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                            style={{
                              zIndex: 9999,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              top: '100%',
                              left: 0,
                            }}
                          >
                            <div className="p-2 border-bottom bg-light">
                              <small className="fw-bold">Diagnosis Suggestions</small>
                              <small className="text-muted ms-2">
                                ({filteredDiagnosisSuggestions.length} options)
                              </small>
                            </div>
                            {filteredDiagnosisSuggestions.map((diagnosis, index) => (
                              <div
                                key={index}
                                className="p-2 border-bottom hover-bg cursor-pointer"
                                style={{
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onClick={() => {
                                  handleFieldChange("diagnosis", diagnosis.label);
                                  setShowDiagnosisSuggestions(false);

                                  // If this is from a template, load associated medicines and instructions
                                  if (diagnosis.medicines && diagnosis.medicines.length > 0) {
                                    setMedicineSuggestions(diagnosis.medicines);
                                  }
                                  if (diagnosis.instructions && diagnosis.instructions.length > 0) {
                                    setInstructionSuggestions(diagnosis.instructions);
                                  }
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>{diagnosis.label}</strong>
                                    {diagnosis.source && (
                                      <small className="text-muted d-block mt-1">
                                        From: {diagnosis.source}
                                      </small>
                                    )}
                                  </div>
                                  <span className={`badge ${diagnosis.isSpecialty ? 'bg-info' : 'bg-secondary'}`}>
                                    {diagnosis.isSpecialty ? 'Specialty' : 'Template'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.diagnosis && <p className="input-error text-danger mt-1 mb-0">{errors.diagnosis}</p>}
                      {!loadingSymptoms && allDiagnoses && allDiagnoses.length > 0 && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-info-circle me-1"></i>
                          {allDiagnoses.length} specialty diagnoses available
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <MedicineSection
                prescriptionFormData={prescriptionFormData}
                colors={colors}
                medicineOptions={medicineOptions}
                handleMedicineChange={handleMedicineChange}
                errors={errors}
                getTimingArray={getTimingArray}
                timingLabels={timingLabels}
                handleTimingCheckboxChange={handleTimingCheckboxChange}
                handleNotesChangeWrapper={handleNotesChangeWrapper}
                handleAutoResize={handleAutoResize}
                handleAddRow={handleAddRow}
                handleRemoveRow={handleRemoveRow}
                handleRefreshMedicines={handleRefreshMedicines}
                isRefreshingMedicines={isRefreshingMedicines}
              />

              <div className="px-4 pt-2 pb-2 d-flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVaccineSection(!showVaccineSection);
                    if (showVaccineSection) {
                      setShowLabTestSection(false);
                    }
                  }}
                  className={`btn btn-sm ${showVaccineSection ? 'btn-success' : 'btn-outline-success'}`}
                  style={{ fontSize: '0.9em', padding: '6px 12px' }}
                >
                  <TbVaccine size={20} className='me-1' />
                  {showVaccineSection ? 'Hide Vaccine' : 'Add Vaccine'}
                </button>
                {!showVaccineSection && (
                  <button
                    type="button"
                    onClick={() => setShowLabTestSection(!showLabTestSection)}
                    className={`btn btn-sm ${showLabTestSection ? 'btn-info' : 'btn-outline-info'}`}
                    style={{ fontSize: '0.9em', padding: '6px 12px' }}
                  >
                    <MdOutlineScience size={20} className='me-1' />
                    {showLabTestSection ? 'Hide Lab Test' : 'Add Lab Test'}
                  </button>
                )}
              </div>

              <VaccineSection
                showVaccineSection={showVaccineSection}
                prescriptionFormData={prescriptionFormData}
                colors={colors}
                vaccineOptions={vaccineOptions}
                handleVaccineChange={handleVaccineChange}
                handleVaccineNotesChange={handleVaccineNotesChange}
                handleAddVaccineRow={handleAddVaccineRow}
                handleRemoveVaccineRow={handleRemoveVaccineRow}
                handleRefreshVaccines={handleRefreshVaccines}
                isRefreshingVaccines={isRefreshingVaccines}
                vaccineFormData={vaccineFormData}
                handleVaccineFieldChange={handleVaccineFieldChange}
                setShowLabTestSection={setShowLabTestSection}
                showLabTestSection={showLabTestSection}
              />

              <LabTestSection
                showLabTestSection={showLabTestSection}
                prescriptionFormData={prescriptionFormData}
                colors={colors}
                patient={patient}
                specialtyLabTests={specialtyLabTests}
                labTestOptions={labTestOptions}
                handleLabTestChange={handleLabTestChange}
                handleLabTestNotesChange={handleLabTestNotesChange}
                handleAddLabTestRow={handleAddLabTestRow}
                handleRemoveLabTestRow={handleRemoveLabTestRow}
                handleRefreshLabTests={handleRefreshLabTests}
                isRefreshingLabTests={isRefreshingLabTests}
                loadingSpecialtyTests={loadingSpecialtyTests}
                labTestFormData={labTestFormData}
                handleLabTestFieldChange={handleLabTestFieldChange}
              />

              <hr className="my-0 border-dashed" />
              <div className='p-3'>
                <div className="card mb-0 border-0">
                  <div className="card-header bg-transparent border-0 p-4 pb-0">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                        width: '48px',
                        height: '48px',
                        background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}40)`
                      }}>
                        <FiCalendar size={24} className="text-warning" />
                      </div>
                      <div>
                        <h5 className="card-title mb-0 fw-bold" style={{ color: colors.dark }}>Follow-up Date</h5>
                        <small className="text-muted">Schedule next appointment</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      <div className="col-lg-7">
                        <CustomDatePicker
                          selected={prescriptionFormData.followUpDate ? new Date(prescriptionFormData.followUpDate) : null}
                          onChange={(date) => {
                            const dateString = format(date, 'yyyy-MM-dd');
                            if (validateFollowUpDate(dateString)) {
                              handleFieldChange("followUpDate", dateString);
                            }
                          }}
                          startBufferDate={doctorBufferDates.startBufferDate}
                          endBufferDate={doctorBufferDates.endBufferDate}
                          placeholder="Select follow-up date"
                          className={errors.followUpDate ? 'is-invalid' : ''}
                          doctorInfo={getCurrentDoctorInfo()}
                        />
                        {errors.followUpDate && (
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-circle text-danger"></i>
                            <p className="text-danger mb-0" style={{ fontSize: '0.9em' }}>{errors.followUpDate}</p>
                          </div>
                        )}
                      </div>
                      <div className="col-lg-5">
                        <div className="d-flex flex-wrap gap-2 justify-content-end">
                          {[3, 7, 15].map(days => (
                            <button
                              key={days}
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 ${isDateSelected(days)
                                ? ''
                                : getAvailabilityStatus(days)
                                  ? 'btn-outline'
                                  : 'btn-outline-secondary'
                                }`}
                              onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + days);
                                handleFieldChange("followUpDate", date.toISOString().split('T')[0]);
                              }}
                              disabled={!getAvailabilityStatus(days)}
                              style={{
                                backgroundColor: isDateSelected(days) ? colors.accent : 'transparent',
                                color: isDateSelected(days) ? 'white' : colors.accent,
                                borderColor: colors.accent,
                                borderWidth: '2px'
                              }}
                            >
                              {days} Days
                            </button>
                          ))}
                          <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 ${isMonthSelected()
                              ? ''
                              : getMonthAvailabilityStatus()
                                ? 'btn-outline'
                                : 'btn-outline-secondary'
                              }`}
                            onClick={() => {
                              const date = new Date();
                              date.setMonth(date.getMonth() + 1);
                              handleFieldChange("followUpDate", date.toISOString().split('T')[0]);
                            }}
                            disabled={!getMonthAvailabilityStatus()}
                            style={{
                              backgroundColor: isMonthSelected() ? colors.accent : 'transparent',
                              color: isMonthSelected() ? 'white' : colors.accent,
                              borderColor: colors.accent,
                              borderWidth: '2px'
                            }}
                          >
                            1 Month
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='p-3'>
                <div className="card border-0 mb-0">
                  <div className="card-header bg-transparent border-0 p-4 pb-0">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                        width: '48px',
                        height: '48px',
                        background: `linear-gradient(135deg, ${colors.pink}20, ${colors.pink}40)`
                      }}>
                        <FiClipboard size={24} className="text-pink" />
                      </div>
                      <div>
                        <h5 className="card-title mb-0 fw-bold" style={{ color: colors.dark }}>Medication Instructions & Warnings</h5>
                        <small className="text-muted">Important notes for the patient</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={prescriptionFormData.instructions}
                      onChange={e => handleFieldChange('instructions', e.target.value)}
                      placeholder="E.g. Take with food, do not drive, etc."
                      style={{
                        borderRadius: '12px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        resize: 'none'
                      }}
                    />
                    {instructionSuggestions.length > 0 && (
                      <div className="mt-2">
                        <span className="me-2">Quick Suggestions:</span>
                        {instructionSuggestions.map((s, idx) => (
                          <button key={idx} type="button" className="btn btn-sm btn-outline-secondary me-2 mb-1"
                            onClick={() => handleInstructionSuggestionClick(s)}
                            style={{
                              backgroundColor: `${colors.pink}10`,
                              color: colors.pink,
                              border: `1px solid ${colors.pink}30`,
                              padding: '4px 12px'
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='p-3'>
                <div className="card border-0 mb-0">
                  <div className="card-header bg-transparent border-0 p-4 pb-0">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                        width: '48px',
                        height: '48px',
                        background: `linear-gradient(135deg, ${colors.teal}20, ${colors.teal}40)`
                      }}>
                        <FiCamera size={24} className="text-teal" />
                      </div>
                      <div>
                        <h5 className="card-title mb-0 fw-bold" style={{ color: colors.dark }}>Attachments</h5>
                        <small className="text-muted">Upload lab reports, images, or documents</small>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleAttachmentsChange}
                      className="form-control"
                      style={{
                        borderRadius: '12px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: `2px dashed ${colors.teal}30`
                      }}
                    />
                    {attachments.length > 0 ? (
                      <div className="mt-4">
                        <div className="d-flex flex-wrap gap-2">
                          {attachments.map((file, idx) => (
                            <div key={idx} className="position-relative border rounded p-2" style={{
                              width: '120px', height: '120px', backgroundColor: '#f8f9fa'
                            }}>
                              {file.type.startsWith('image') ? (
                                <img
                                  src={file.data}
                                  alt={file.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                  }}
                                />
                              ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                  <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: '2rem', color: colors.teal }}></i>
                                  <small className="text-muted text-center mt-1" style={{ fontSize: '0.75rem' }}>
                                    {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                  </small>
                                </div>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm position-absolute top-0 end-0 m-1 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '20px', height: '20px', fontSize: '10px', padding: '0', backgroundColor: colors.danger, color: 'white', border: 'none' }}
                                onClick={() => handleRemoveAttachment(idx)}
                                title="Remove attachment"
                              >
                                ×
                              </button>
                              <div className="position-absolute bottom-0 start-0 w-100 p-1" style={{
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                              }}>
                                <small className="text-white bg-dark bg-opacity-75 rounded px-1" style={{ fontSize: '0.7rem' }}>
                                  {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: `${colors.teal}10`
                        }}>
                          <FaFile style={{
                            fontSize: '2rem',
                            color: colors.teal
                          }} />
                        </div>
                        <p className="text-muted mb-1">No files selected</p>
                        <small className="text-muted">Drag & drop or click to upload lab reports, images, or documents</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* <hr className="border-dashed my-4" /> */}
              <div className="px-3">
                <div className="d-flex justify-content-end gap-3">
                  <button
                    type="button"
                    onClick={handlePreviewAndSubmit}
                    className="btn btn-primary shadow-lg"
                    disabled={isSubmitting}
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%)`,
                      color: 'white',
                      border: 'none',
                      padding: '12px 40px',
                      fontSize: '0.9rem',
                      fontWeight: '400'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-eye me-2"></i>
                        Preview & Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 d-flex flex-column gap-4">

          <PatientDetails patient={patient} colors={colors} />

        </div>
      </div>

      {showPreview && (
        <PreviewPrescription
          prescriptionData={previewData}
          onClose={handleClosePreview}
          onSubmit={handleSubmitFromPreview}
          isSubmitting={isSubmitting}
        />
      )}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .hover-shadow {
          transition: all 0.3s ease;
        }
        
        .hover-shadow:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
        
        .hover-bg:hover {
          background-color: rgba(91, 192, 222, 0.1) !important;
        }
        
        .text-purple {
          color: ${colors.purple};
        }
        
        .text-teal {
          color: ${colors.teal};
        }
        
        .text-pink {
          color: ${colors.pink};
        }
        
        .btn-outline {
          background-color: transparent;
        }
        
        .checked {
          box-shadow: 0 0 0 3px rgba(74, 111, 165, 0.2);
        }
      `}</style>
    </>
  );
};

export default PrescriptionCreation;