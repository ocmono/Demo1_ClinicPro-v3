import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { FiInfo, FiX, FiTrendingUp, FiActivity, FiHeart, FiThermometer, FiCircle, FiRefreshCcw } from "react-icons/fi";
import { GrPowerReset } from "react-icons/gr";
import { toast } from "react-toastify";
import ReactSelect from "react-select";
import { FaUser } from "react-icons/fa";
import { MdHeight } from "react-icons/md";
import { useNavigate } from "react-router-dom";


// Lazy load heavy components
const PreviewPrescription = React.lazy(() => import("./PreviewPrescription"));
const MedicineSection = React.lazy(() => import("./prescriptionDummy/MedicineSection"));
const VaccineSection = React.lazy(() => import("./prescriptionDummy/VaccineSection"));
const LabTestSection = React.lazy(() => import("./prescriptionDummy/LabTestSection"));
const MedicineVariationsPanel = React.lazy(() => import("./prescriptionDummy/MedicineVariationsPanel"));
const SymptomsSection = React.lazy(() => import("./prescriptionDummy/SymptomsSection"));
const DiagnosisSection = React.lazy(() => import("./prescriptionDummy/DiagnosisSection"));
const GrowthChart = React.lazy(() => import("./prescriptionDummy/GrowthChart"));
const PatientDetailsSidebar = React.lazy(() => import("./prescriptionDummy/PatientDetailsSidebar"));
const PreviousPrescriptions = React.lazy(() => import("./prescriptionDummy/previousPrescriptions"));


// Context imports
import { useBooking } from "../../contentApi/BookingProvider";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { useAppointments } from "../../context/AppointmentContext";
import { useAuth } from "../../contentApi/AuthContext";
import { useMedicines } from "../../context/MedicinesContext";
import { useVaccine } from "../../context/VaccineContext";
import { useTests } from "../../context/TestContext";
import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Reusable Components
const VitalSignsInput = React.memo(({ 
  value, 
  onChange, 
  icon: Icon, 
  placeholder, 
  unit, 
  name 
}) => (
  <div className="col">
    <div className="input-group input-group-sm">
      <span className="input-group-text"><Icon /></span>
      <input
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
      <span className="input-group-text">{unit}</span>
    </div>
  </div>
));
VitalSignsInput.displayName = 'VitalSignsInput';

const FollowUpDateButton = React.memo(({ 
  days, 
  isSelected, 
  isAvailable, 
  label, 
  subLabel,
  onClick 
}) => (
  <button
    type="button"
    className={`btn btn-sm d-flex flex-column align-items-start justify-content-center ${
      isSelected ? "btn-primary" : isAvailable ? "btn-outline-primary" : "btn-outline-secondary"
    }`}
    onClick={onClick}
    disabled={!isAvailable}
  >
    <span className="fw-semibold">{label}</span>
    <span className="text-muted lh-1">{subLabel}</span>
  </button>
));
FollowUpDateButton.displayName = 'FollowUpDateButton';

const PrescriptionsCreateDummy = ({ onResetTimer, showGrowthChart = false }) => {
  // ========== HOOKS & CONTEXTS ==========
  const navigate = useNavigate();
  const {
    prescriptionFormData,
    patients,
    setPatients,
    setPrescriptionFormData,
    updatePrescriptionFormField,
    resetPrescriptionForm,
    fetchPrescriptions,
    addPrescription,
    templates,
    fetchTemplates,
    attachments,
    setAttachments,
  } = usePrescription();

  const { medicines: contextMedicines, getMedicines: fetchContextMedicines } = useMedicines();
  const { vaccines: contextVaccines, getVaccines } = useVaccine();
  const { appointments } = useAppointments();
  const { categories, fetchCategories, fetchTestsBySpeciality } = useTests();
  const { doctors } = useBooking();
  const { user } = useAuth();
  const { clinicSpecialities } = useClinicManagement();

  // ========== STATE VARIABLES ==========
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
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [showMedicinePanel, setShowMedicinePanel] = useState(false);
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSymptomInput, setActiveSymptomInput] = useState("");
  
  // Local form state for better performance
  const [localFormData, setLocalFormData] = useState({
    instructions: prescriptionFormData.instructions || "",
    paymentAmount: prescriptionFormData.paymentAmount || "",
    paymentType: prescriptionFormData.paymentType || "",
    paymentStatus: prescriptionFormData.paymentStatus || "pending",
  });
  
  // Debounced vital signs state
  const [vitalSigns, setVitalSigns] = useState({
    height: prescriptionFormData.height || "",
    weight: prescriptionFormData.weight || "",
    bp: prescriptionFormData.bp || "",
    pulse: prescriptionFormData.pulse || "",
    temperature: prescriptionFormData.temperature || "",
    headCircumference: prescriptionFormData.headCircumference || ""
  });
  
  // Debounce vital signs (300ms delay)
  const debouncedVitalSigns = useDebounce(vitalSigns, 300);
  
  // Tabular data states
  const [symptomsData, setSymptomsData] = useState([{
    symptom: "",
    frequency: "",
    severity: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
  }]);
  
  const [diagnosisData, setDiagnosisData] = useState([{
    diagnosis: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
  }]);

  // Form-specific states
  const [vaccineFormData, setVaccineFormData] = useState({
    vaccine: null,
    notes: "",
    sku: "",
  });

  const [labTestFormData, setLabTestFormData] = useState({
    labTest: null,
    notes: "",
    sku: "",
  });

  // Specialty data states
  const [specialtyKeywords, setSpecialtyKeywords] = useState({
    diagnosis: [],
    symptoms: [],
  });

  const [diagnosisSuggestions, setDiagnosisSuggestions] = useState([]);
  const [symptomsSuggestions, setSymptomsSuggestions] = useState([]);

  // ========== REFS ==========
  const medicinePanelRef = useRef(null);
  const symptomInputRef = useRef(null);
  const diagnosisInputRef = useRef(null);
  const suggestionBoxRef = useRef(null);
  const allFilterRef = useRef(null);
  const todayFilterRef = useRef(null);
  const growthChartRef = useRef(null);
  const renderCount = useRef(0);

  // ========== CONSTANTS ==========
  const timingLabels = ["Morning", "Afternoon", "Dinner"];
  const paymentOptions = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "insurance", label: "Insurance" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "other", label: "Other" },
  ];

  // Initial state for reset
  const initialVitalSigns = {
    height: "",
    weight: "",
    bp: "",
    pulse: "",
    temperature: "",
    headCircumference: ""
  };

  const initialSymptomsData = [{
    symptom: "",
    frequency: "",
    severity: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
  }];

  const initialDiagnosisData = [{
    diagnosis: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
  }];

  const initialLocalFormData = {
    instructions: "",
    paymentAmount: "",
    paymentType: "",
    paymentStatus: "pending",
  };

  // ========== MEMOIZED VALUES ==========
  const patientForGrowthChart = useMemo(() => {
    if (!prescriptionFormData?.patient) return null;
    
    const patient = prescriptionFormData.patient;
    return {
      id: patient.id,
      height: patient.height,
      weight: patient.weight,
      headCircumference: patient.headCircumference,
      age: patient.patientAge || patient.age,
      gender: patient.gender,
    };
  }, [
    prescriptionFormData?.patient?.id,
    prescriptionFormData?.patient?.height,
    prescriptionFormData?.patient?.weight,
    prescriptionFormData?.patient?.headCircumference,
    prescriptionFormData?.patient?.patientAge,
    prescriptionFormData?.patient?.age,
    prescriptionFormData?.patient?.gender,
  ]);

  const medicineOptions = useMemo(() => 
    contextMedicines.flatMap((med) =>
      (med.variations || []).map((variation) => ({
        label: `${med.name} (${variation.sku})`,
        value: variation.sku,
        medicineName: med.name,
        sku: variation.sku,
        price: Number(variation.price) || 0,
        unit: variation.unit,
        productId: med.id,
        ...variation,
      }))
    ), [contextMedicines]
  );

  const vaccineOptions = useMemo(() => 
    contextVaccines.map((vac) => ({
      label: `${vac.medicineName || vac.name || "Unknown"} (${vac.vaccine_type || "N/A"})`,
      value: vac.sku || vac.id || vac.medicineName || vac.name,
      medicineName: vac.medicineName || vac.name,
      price: vac.price || 0,
      sku: vac.sku || vac.id || vac.medicineName || vac.name,
      notes: vac.notes || "",
      ...vac,
    })), [contextVaccines]
  );

  const labTestOptions = useMemo(() => 
    specialtyLabTests.map((test) => {
      const category = categories.find((cat) => cat.id === test.category_id);
      return {
        label: test.test_name,
        value: test.id.toString(),
        medicineName: test.test_name,
        category: category?.category || "Specialty Test",
        price: test.price || 0,
        sku: test.id.toString(),
        notes: test.notes || "",
        isSpecialtyTest: true,
        rawTest: test,
      };
    }), [specialtyLabTests, categories]
  );

  // Helper functions memoized
  const isOwnAppointment = useCallback((appointment) => {
    if (!user) return false;
    if (["super_admin", "clinic_admin"].includes(user.role)) return true;
    if (user.role === "doctor") {
      const appointmentDoctorId = appointment.doctor_id || appointment.doctorId;
      const currentDoctorId = user.doctorId || user.id;
      
      if (appointmentDoctorId && currentDoctorId) {
        return appointmentDoctorId.toString() === currentDoctorId.toString();
      }
      
      const appointmentDoctorName = appointment.doctor;
      const currentDoctorName = user.doctorName || user.name;
      
      if (appointmentDoctorName && currentDoctorName) {
        return (
          appointmentDoctorName.toLowerCase().includes(currentDoctorName.toLowerCase()) ||
          currentDoctorName.toLowerCase().includes(appointmentDoctorName.toLowerCase())
        );
      }
    }
    return false;
  }, [user]);

  const isOwnPatient = useCallback((patient) => {
    if (!user) return false;
    if (["super_admin", "clinic_admin"].includes(user.role)) return true;
    if (user.role === "doctor") {
      const patientDoctorId = patient.doctor_id || patient.doctorId;
      const currentDoctorId = user.doctorId || user.id;
      
      if (patientDoctorId && currentDoctorId) {
        return patientDoctorId.toString() === currentDoctorId.toString();
      }
      
      const patientDoctorName = patient.doctor;
      const currentDoctorName = user.doctorName || user.name;
      
      if (patientDoctorName && currentDoctorName) {
        return (
          patientDoctorName.toLowerCase().includes(currentDoctorName.toLowerCase()) ||
          currentDoctorName.toLowerCase().includes(patientDoctorName.toLowerCase())
        );
      }
    }
    return false;
  }, [user]);

  const getTodaysApprovedAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return appointments
      .filter((appt) => {
        const apptDate = new Date(appt.date).toISOString().split("T")[0];
        const isTodayAppointment =
          apptDate === today &&
          (appt.status === "approved" || appt.status === "done");
        return isTodayAppointment && isOwnAppointment(appt);
      })
      .map((appt) => ({
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
      }));
  }, [appointments, isOwnAppointment]);

  const getFilteredPatients = useMemo(() => {
    if (patientFilter === "today") return getTodaysApprovedAppointments;
    if (patientFilter === "all") return patients.filter((patient) => isOwnPatient(patient));
    return patients;
  }, [patientFilter, getTodaysApprovedAppointments, patients, isOwnPatient]);

  const patientOptions = useMemo(() => getFilteredPatients.map((patient) => {  
    const patientId = patient.patientId || patient.id || "N/A";
    const appointmentId = patient.appointmentId || "N/A";
    const patientphone = patient.patientPhone || "N/A";
    const displayName = patient.patientName || "Unknown Patient";

    return {
      label: (
        <div className="d-flex justify-content-between align-items-center w-100">
          <span>#{patientId} {displayName || "Unknown"}</span>
          <div className="d-flex gap-2 fs-6">
            <span>Appt: {appointmentId}</span>
          </div>
        </div>
      ),
      value: patientId,
      rawPatient: patient,
      searchText: `${displayName} ${appointmentId} ${patientphone} ${patientId}`.toLowerCase(),
    };
  }), [getFilteredPatients]);

  const customFilterOption = useCallback((option, inputValue) => {
    const searchText = inputValue.toLowerCase().trim();
    return !searchText || option.data.searchText.includes(searchText);
  }, []);

  // Memoized GrowthChart component
  const growthChartComponent = useMemo(() => {
    if (!showGrowthChart || !patientForGrowthChart) return null;
    
    return (
      <div className="px-3 mt-1 mb-2" ref={growthChartRef}>
        <React.Suspense fallback={<div>Loading growth chart...</div>}>
          <GrowthChart 
            key={`growth-chart-${patientForGrowthChart.id}`}
            patientData={patientForGrowthChart}
            // previousPrescriptions={previousPrescriptions}
          />
        </React.Suspense>
      </div>
    );
  }, [showGrowthChart, patientForGrowthChart]);

  // ========== HELPER FUNCTIONS ==========
  
  // Helper function to extract price from medicine object
  const getMedicinePrice = useCallback((medicine) => {
    if (!medicine) return 0;
    
    // Try different possible price locations
    const price = medicine.price || medicine.variation?.price || medicine.variationPrice || 0;
    
    // Convert to number and ensure it's valid
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    
    return isNaN(numPrice) || numPrice < 0 ? 0 : numPrice;
  }, []);

  const getSpecialtyIdsFromPatient = useCallback(() => {
    if (!prescriptionFormData?.patient?.doctorSpeciality?.length || !clinicSpecialities?.length) {
      return [];
    }

    return clinicSpecialities
      ?.filter(item =>
        prescriptionFormData?.patient?.doctorSpeciality?.includes(item?.speciality)
      )
      ?.map(item => item?.id)
      ?.filter(Boolean) || [];
  }, [prescriptionFormData?.patient?.doctorSpeciality, clinicSpecialities]);

  const fetchSpecialtyData = useCallback(async (specialtyIds = []) => {
    if (!specialtyIds.length) {
      console.warn('No specialty IDs provided');
      return { diagnosis: [], symptoms: [] };
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return { diagnosis: [], symptoms: [] };
    }

    try {
      const responses = await Promise.all(
        specialtyIds.map(async id => {
          try {
            const res = await fetch(
              `https://bkdemo1.clinicpro.cc/speciality/configure-speciality/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (!res.ok) {
              console.warn(`Failed to fetch specialty ${id}`);
              return null;
            }

            return await res.json();
          } catch (err) {
            console.warn(`Error fetching specialty ${id}`, err);
            return null;
          }
        })
      );

      const validResponses = responses.filter(Boolean);
      
      if (!validResponses.length) {
        return { diagnosis: [], symptoms: [] };
      }

      const diagnosisSet = new Set();
      const symptomsSet = new Set();

      validResponses.forEach(({ diagnosis }) => {
        if (!Array.isArray(diagnosis)) return;

        diagnosis.forEach(({ name, symptoms }) => {
          if (name) diagnosisSet.add(name);

          if (Array.isArray(symptoms)) {
            symptoms.forEach(symptom => {
              if (symptom) symptomsSet.add(symptom);
            });
          }
        });
      });

      return {
        diagnosis: [...diagnosisSet],
        symptoms: [...symptomsSet]
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { diagnosis: [], symptoms: [] };
    }
  }, []);

  const getSpecialtyIdFromPatient = useCallback((patient) => {
    if (!patient) return null;
  
    // 1️⃣ Direct IDs (best case)
    if (patient.doctorSpecialityId) return patient.doctorSpecialityId;
    if (patient.speciality_id) return patient.speciality_id;
    if (patient.doctor?.speciality_id) return patient.doctor.speciality_id;
  
    // 2️⃣ Handle doctorSpeciality as string OR array
    const patientSpecialities = Array.isArray(patient.doctorSpeciality)
      ? patient.doctorSpeciality
      : patient.doctorSpeciality
        ? [patient.doctorSpeciality]
        : [];
  
    if (patientSpecialities.length && specialties.length) {
      const foundSpecialty = specialties.find((spec) =>
        patientSpecialities.some(
          (ps) =>
            typeof ps === "string" &&
            spec.speciality?.toLowerCase() === ps.toLowerCase()
        )
      );
  
      if (foundSpecialty) return foundSpecialty.id;
    }
  
    // 3️⃣ Fallback via doctor
    if (patient.doctor_id && doctors.length > 0) {
      const foundDoctor = doctors.find((doc) => doc.id === patient.doctor_id);
      if (foundDoctor?.speciality_id) return foundDoctor.speciality_id;
    }
  
    return null;
  }, [specialties, doctors]);

  const checkDoctorAvailability = () => true;

  const getAvailabilityStatus = useCallback((days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return checkDoctorAvailability(date);
  }, []);

  const getMonthAvailabilityStatus = useCallback(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return checkDoctorAvailability(date);
  }, []);

  const getFollowUpDateLabel = useCallback((days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, []);

  const getFollowUpMonthLabel = useCallback(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }, []);

  const isDateSelected = useCallback((days) => {
    if (!prescriptionFormData.followUpDate) return false;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return prescriptionFormData.followUpDate === targetDate.toISOString().split("T")[0];
  }, [prescriptionFormData.followUpDate]);

  const isMonthSelected = useCallback(() => {
    if (!prescriptionFormData.followUpDate) return false;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);
    return prescriptionFormData.followUpDate === targetDate.toISOString().split("T")[0];
  }, [prescriptionFormData.followUpDate]);

  const validateFollowUpDate = useCallback((dateString) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.warn("Follow-up date cannot be in the past!");
      return false;
    }
    return true;
  }, []);

  // ========== EFFECTS ==========
  
  const lastSyncedVitalsRef = useRef({});

  useEffect(() => {
    const updates = {};
    let hasChange = false;
  
    Object.entries(debouncedVitalSigns).forEach(([key, value]) => {
      if (lastSyncedVitalsRef.current[key] !== value) {
        updates[key] = value;
        hasChange = true;
      }
    });
  
    if (hasChange) {
      lastSyncedVitalsRef.current = debouncedVitalSigns;
      updatePrescriptionFormField(updates);
    }
  }, [debouncedVitalSigns, updatePrescriptionFormField]);

  // Sync local form data with prescriptionFormData
  useEffect(() => {
    setLocalFormData({
      instructions: prescriptionFormData.instructions || "",
      paymentAmount: prescriptionFormData.paymentAmount || "",
      paymentType: prescriptionFormData.paymentType || "",
      paymentStatus: prescriptionFormData.paymentStatus || "pending",
    });
  }, [
    prescriptionFormData.instructions,
    prescriptionFormData.paymentAmount,
    prescriptionFormData.paymentType,
    prescriptionFormData.paymentStatus
  ]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMedicinePanel &&
        medicinePanelRef.current &&
        !medicinePanelRef.current.contains(event.target) &&
        symptomInputRef.current &&
        !symptomInputRef.current.contains(event.target)
      ) {
        setShowMedicinePanel(false);
      }

      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target) &&
        diagnosisInputRef.current &&
        !diagnosisInputRef.current.contains(event.target)
      ) {
        setShowDiagnosisSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMedicinePanel]);

  const symptomsInitializedRef = useRef(false);

  useEffect(() => {
    if (
      !symptomsInitializedRef.current &&
      Array.isArray(prescriptionFormData.symptoms)
    ) {
      setSymptomsData(prescriptionFormData.symptoms);
      symptomsInitializedRef.current = true;
    }
  }, [prescriptionFormData.symptoms]);

  const diagnosisInitializedRef = useRef(false);

  useEffect(() => {
    if (
      !diagnosisInitializedRef.current &&
      Array.isArray(prescriptionFormData.diagnosis)
    ) {
      setDiagnosisData(prescriptionFormData.diagnosis);
      diagnosisInitializedRef.current = true;
    }
  }, [prescriptionFormData.diagnosis]);

  // Update form data when tabular data changes
  useEffect(() => {
    if (prescriptionFormData.symptoms !== symptomsData) {
      updatePrescriptionFormField("symptoms", symptomsData);
    }
  }, [symptomsData]);
  
  useEffect(() => {
    if (prescriptionFormData.diagnosis !== diagnosisData) {
      updatePrescriptionFormField("diagnosis", diagnosisData);
    }
  }, [diagnosisData]);

  // Show/hide medicine panel based on symptoms or active input
  useEffect(() => {
    const hasSymptoms = symptomsData.some((symptom) => symptom.symptom.trim() !== "");
    const hasActiveInput = activeSymptomInput.trim().length > 0;
    setShowMedicinePanel(hasSymptoms || hasActiveInput);
  }, [symptomsData, activeSymptomInput]);

  // Prepare suggestions from templates
  useEffect(() => {
    if (templates.length > 0) {
      const templateDiagnoses = templates.flatMap((template) => {
        if (template.diagnosis) {
          return template.diagnosis
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        }
        return [];
      });
      setDiagnosisSuggestions([...new Set(templateDiagnoses)]);

      const templateSymptoms = templates.flatMap((template) => {
        if (template.symptoms) {
          return template.symptoms
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
        }
        return [];
      });
      setSymptomsSuggestions([...new Set(templateSymptoms)]);
    }
  }, [templates]);

  // Fetch specialty keywords when patient changes
  useEffect(() => {
    const fetchKeywords = async () => {
      const specialtyIds = getSpecialtyIdsFromPatient();
      if (specialtyIds.length > 0) {
        const result = await fetchSpecialtyData(specialtyIds);
        setSpecialtyKeywords({
          diagnosis: result.diagnosis,
          symptoms: result.symptoms
        });
      } else {
        setSpecialtyKeywords({ diagnosis: [], symptoms: [] });
      }
    };

    if (prescriptionFormData?.patient) {
      fetchKeywords();
    }
  }, [prescriptionFormData?.patient, clinicSpecialities, getSpecialtyIdsFromPatient, fetchSpecialtyData]);

  // Initial data fetching
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchSpecialties(),
        handleFetchTemplates(),
        handleRefreshMedicines(),
        getVaccines(),
        fetchCategories(),
      ]);
    };
    initializeData();

    // Handle calendar prescription
    const fromCalendar = localStorage.getItem("prescriptionFromCalendar");
    if (fromCalendar) {
      try {
        const { patientId, patientData } = JSON.parse(fromCalendar);
        setPatientFilter("all");
        let found = patients?.find((p) => p.id === patientId || p.patient_id === patientId);
        
        if (!found && patientData) {
          setPendingPatientId(patientId);
          setPendingPatientData(patientData);
          setPatients((prev) => [...prev, patientData]);
        } else if (found) {
          setPrescriptionFormData((prev) => ({ ...prev, patient: found }));
        }
      } catch (error) {
        console.error("Error parsing calendar data:", error);
      }
      localStorage.removeItem("prescriptionFromCalendar");
    }
  }, []);

  // Handle pending patient
  useEffect(() => {
    if (pendingPatientId && patients?.length > 0) {
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

  // ========== HANDLER FUNCTIONS ==========
  
  // Data refresh handlers
  const handleRefreshMedicines = useCallback(async () => {
    setIsRefreshingMedicines(true);
    try {
      await fetchContextMedicines();
      setPrescriptionFormData((prev) => ({
        ...prev,
        medicines: [{
          medicine: null,
          dose: "0-0-0",
          when: "",
          frequency: "",
          duration: "",
          notes: "",
          sku: "",
        }],
      }));
    } catch (error) {
      console.log("Failed to refresh medicines list");
    } finally {
      setIsRefreshingMedicines(false);
    }
  }, [fetchContextMedicines, setPrescriptionFormData]);

  const handleRefreshVaccines = useCallback(async () => {
    setIsRefreshingVaccines(true);
    try {
      await getVaccines();
      resetVaccineFormData();
      setPrescriptionFormData((prev) => ({
        ...prev,
        // vaccines: [],
      }));
      toast.success("Vaccines list refreshed successfully!");
    } catch (error) {
      console.log("Failed to refresh vaccines list");
    } finally {
      setIsRefreshingVaccines(false);
    }
  }, [getVaccines, setPrescriptionFormData]);

  const handleRefreshLabTests = useCallback(async () => {
    setIsRefreshingLabTests(true);
    try {
      await fetchCategories();
      resetLabTestFormData();
      setPrescriptionFormData((prev) => ({
        ...prev,
        // labTests: [],
      }));
      toast.success("Lab tests list refreshed successfully!");
    } catch (error) {
      console.log("Failed to refresh lab tests list");
    } finally {
      setIsRefreshingLabTests(false);
    }
  }, [fetchCategories, setPrescriptionFormData]);

  const handleFetchTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      await fetchTemplates();
    } catch (error) {
      console.log("Failed to load templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [fetchTemplates]);

  const fetchSpecialties = useCallback(async () => {
    setLoadingSpecialties(true);
    try {
      const response = await fetch(
        "https://bkdemo.clinicpro.cc/speciality/speciality-list"
      );
      if (!response.ok) throw new Error("Failed to fetch specialties");
      const data = await response.json();
      setSpecialties(data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      toast.error("Failed to load specialties list");
    } finally {
      setLoadingSpecialties(false);
    }
  }, []);

  const fetchLabTestsBySpecialty = useCallback(async (specialtyId) => {
    if (!specialtyId) return;
    setLoadingSpecialtyTests(true);
    try {
      const tests = await fetchTestsBySpeciality(specialtyId);
      setSpecialtyLabTests(tests);
    } catch (error) {
      console.error("Error fetching specialty lab tests:", error);
      setSpecialtyLabTests([]);
    } finally {
      setLoadingSpecialtyTests(false);
    }
  }, [fetchTestsBySpeciality]);

  // Form field handlers
  const handleFieldChange = useCallback((field, value) => {
    updatePrescriptionFormField(field, value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, [updatePrescriptionFormField]);

  const handleLocalFieldChange = useCallback((field, value) => {
    setLocalFormData(prev => ({ ...prev, [field]: value }));
    updatePrescriptionFormField(field, value);
  }, [updatePrescriptionFormField]);

  // Handle vital sign changes
  const handleVitalSignChange = useCallback((field, value) => {
    setVitalSigns(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePatientChange = useCallback((selectedOption) => {
    const selectedPatient = selectedOption.rawPatient;
    updatePrescriptionFormField("patient", selectedPatient);
    setErrors((prev) => ({ ...prev, patient: "" }));

    if (selectedPatient) {
      const specialtyId = getSpecialtyIdFromPatient(selectedPatient);
      if (specialtyId) {
        fetchLabTestsBySpecialty(specialtyId);
      } else {
        setSpecialtyLabTests([]);
        if (selectedPatient.doctorSpeciality) {
          toast.warn(
            `No specialty mapping found for "${selectedPatient.doctorSpeciality}". Showing general lab tests.`
          );
        }
      }
    } else {
      setSpecialtyLabTests([]);
    }
  }, [updatePrescriptionFormField, getSpecialtyIdFromPatient, fetchLabTestsBySpecialty]);

  // Tabular data handlers
  const handleSymptomFieldChange = useCallback((index, field, value) => {
    setSymptomsData(prev => {
      const updated = [...prev];
      if (!updated[index]) return prev;
      updated[index][field] = value;
      return updated;
    });

    if (field === "symptom" && value.trim()) {
      setShowMedicinePanel(true);
    }
  }, []);

  const handleDiagnosisFieldChange = useCallback((index, field, value) => {
    setDiagnosisData(prev => {
      const updatedDiagnosis = [...prev];
      if (updatedDiagnosis[index]) {
        updatedDiagnosis[index][field] = value;
      }
      return updatedDiagnosis;
    });
  }, []);

  const handleAddSymptomRow = useCallback(() => {
    setSymptomsData(prev => [
      ...prev,
      {
        symptom: "",
        frequency: "",
        severity: "",
        date: new Date().toISOString().split("T")[0],
        duration: "",
      },
    ]);
  }, []);

  const handleRemoveSymptomRow = useCallback((index) => {
    if (symptomsData.length > 1) {
      setSymptomsData(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.warn("At least one symptom must be present!");
    }
  }, [symptomsData.length]);

  const handleAddDiagnosisRow = useCallback(() => {
    setDiagnosisData(prev => [
      ...prev,
      {
        diagnosis: "",
        date: new Date().toISOString().split("T")[0],
        duration: "",
      },
    ]);
  }, []);

  const handleRemoveDiagnosisRow = useCallback((index) => {
    if (diagnosisData.length > 1) {
      setDiagnosisData(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.warn("At least one diagnosis must be present!");
    }
  }, [diagnosisData.length]);

  // Medicine handlers - UPDATED FOR MedicineSection COMPONENT
  const handleMedicineChange = useCallback((selectedOption, index) => {
    setPrescriptionFormData((prev) => {
      const updatedMedicines = [...prev.medicines];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        medicine: selectedOption,
        sku: selectedOption.sku,
      };
      return { ...prev, medicines: updatedMedicines };
    });
  }, []);

  // NEW: Handle field changes for medicine (dose, when, frequency, duration)
  const handleMedicineFieldChange = useCallback((index, field, value) => {
    setPrescriptionFormData((prev) => {
      const updatedMedicines = [...prev.medicines];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value,
      };
      return { ...prev, medicines: updatedMedicines };
    });
  }, []);

  const handleAddMedicineFromPanel = useCallback((medicineOption) => {
    setPrescriptionFormData((prev) => {
      const medicines = [...prev.medicines];
      
      // Check if all rows are empty (no medicine selected)
      const allEmpty = medicines.every(row => !row.medicine);
      
      if (allEmpty && medicines.length > 0) {
        // Fill the first row
        medicines[0] = {
          ...medicines[0],
          medicine: medicineOption,
          sku: medicineOption.sku,
        };
      } else {
        // Find the last filled row index
        let lastFilledIndex = -1;
        for (let i = medicines.length - 1; i >= 0; i--) {
          if (medicines[i].medicine) {
            lastFilledIndex = i;
            break;
          }
        }
        
        // Find the first empty row after the last filled row
        let emptyIndex = -1;
        for (let i = lastFilledIndex + 1; i < medicines.length; i++) {
          if (!medicines[i].medicine) {
            emptyIndex = i;
            break;
          }
        }
        
        if (emptyIndex !== -1) {
          // Fill the empty row
          medicines[emptyIndex] = {
            ...medicines[emptyIndex],
            medicine: medicineOption,
            sku: medicineOption.sku,
          };
        } else {
          // Add a new row after the last filled row (or at the end if no filled rows)
          const newRow = {
            medicine: medicineOption,
            dose: "0-0-0",
            when: "",
            frequency: "",
            duration: "",
            notes: "",
            sku: medicineOption.sku,
          };
          
          if (lastFilledIndex === -1) {
            // No filled rows, add at the end
            medicines.push(newRow);
          } else {
            // Insert after the last filled row
            medicines.splice(lastFilledIndex + 1, 0, newRow);
          }
        }
      }
      
      return {
        ...prev,
        medicines,
      };
    });
  }, []);

  const handleNotesChangeWrapper = useCallback((e, index) => {
    setPrescriptionFormData((prev) => {
      const updatedMedicines = [...prev.medicines];
      updatedMedicines[index].notes = e.target.value;
      return { ...prev, medicines: updatedMedicines };
    });
  }, []);

  const handleAddRow = useCallback(() => {
    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicine: null,
          dose: "0-0-0",
          when: "",
          frequency: "",
          duration: "",
          notes: "",
          sku: "",
        },
      ],
    }));
  }, []);

  const handleRemoveRow = useCallback((index) => {
    if (prescriptionFormData.medicines.length > 1) {
      setPrescriptionFormData((prev) => {
        const updated = [...prev.medicines];
        updated.splice(index, 1);
        return { ...prev, medicines: updated };
      });
    } else {
      toast.warn("At least one medicine must be present!");
    }
  }, [prescriptionFormData.medicines.length]);

  // Vaccine handlers
  const handleVaccineFieldChange = useCallback((field, value) => {
    setVaccineFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetVaccineFormData = useCallback(() => {
    setVaccineFormData({
      vaccine: null,
      notes: "",
      sku: "",
    });
  }, []);

  const handleVaccineChange = useCallback((selectedOption, index = null) => {
    if (index !== null) {
      setPrescriptionFormData((prev) => {
        const updated = [...prev.vaccines];
        updated[index] = {
          ...updated[index],
          vaccine: selectedOption,
          notes: selectedOption.notes || "",
        };
        return { ...prev, vaccines: updated };
      });
    } else if (selectedOption) {
      setPrescriptionFormData((prev) => ({
        ...prev,
        vaccines: [...(prev.vaccines || []), {
          vaccine: selectedOption,
          notes: selectedOption.notes || "",
          sku: selectedOption.sku || selectedOption.value,
        }],
      }));
      resetVaccineFormData();
    }
  }, [resetVaccineFormData]);

  const handleVaccineNotesChange = useCallback((e, index = null) => {
    if (index !== null) {
      setPrescriptionFormData((prev) => {
        const updated = [...prev.vaccines];
        updated[index] = { ...updated[index], notes: e.target.value };
        return { ...prev, vaccines: updated };
      });
    } else {
      setVaccineFormData((prev) => ({ ...prev, notes: e.target.value }));
    }
  }, []);

  const handleAddVaccineRow = useCallback(() => {
    setPrescriptionFormData((prev) => ({
      ...prev,
      vaccines: [
        ...(prev.vaccines || []),
        { vaccine: null, notes: "", sku: "" },
      ],
    }));
  }, []);

  const handleRemoveVaccineRow = useCallback((index) => {
    if (prescriptionFormData.vaccines?.length > 0) {
      setPrescriptionFormData((prev) => ({
        ...prev,
        vaccines: prev.vaccines.filter((_, i) => i !== index),
      }));
      toast.success("Vaccine removed successfully!");
    } else {
      toast.warn("No vaccines to remove!");
    }
  }, [prescriptionFormData.vaccines?.length]);

  // Lab test handlers
  const handleLabTestFieldChange = useCallback((field, value) => {
    setLabTestFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetLabTestFormData = useCallback(() => {
    setLabTestFormData({
      labTest: null,
      notes: "",
      sku: "",
    });
  }, []);

  const handleLabTestChange = useCallback((selectedOption, index = null) => {
    if (index !== null) {
      setPrescriptionFormData((prev) => {
        const updated = [...prev.labTests];
        updated[index] = {
          ...updated[index],
          labTest: selectedOption,
          notes: selectedOption.notes || "",
        };
        return { ...prev, labTests: updated };
      });
    } else if (selectedOption) {
      setPrescriptionFormData((prev) => ({
        ...prev,
        labTests: [...(prev.labTests || []), {
          labTest: selectedOption,
          notes: selectedOption.notes || "",
          sku: selectedOption.sku || selectedOption.value,
        }],
      }));
      resetLabTestFormData();
    }
  }, [resetLabTestFormData]);

  const handleLabTestNotesChange = useCallback((e, index = null) => {
    if (index !== null) {
      setPrescriptionFormData((prev) => {
        const updated = [...prev.labTests];
        updated[index] = { ...updated[index], notes: e.target.value };
        return { ...prev, labTests: updated };
      });
    } else {
      setLabTestFormData((prev) => ({ ...prev, notes: e.target.value }));
    }
  }, []);

  const handleAddLabTestRow = useCallback(() => {
    setPrescriptionFormData((prev) => ({
      ...prev,
      labTests: [
        ...(prev.labTests || []),
        { labTest: null, notes: "", sku: "" },
      ],
    }));
  }, []);

  const handleRemoveLabTestRow = useCallback((index) => {
    if (prescriptionFormData.labTests?.length > 0) {
      setPrescriptionFormData((prev) => ({
        ...prev,
        labTests: prev.labTests.filter((_, i) => i !== index),
      }));
      toast.success("Lab test removed successfully!");
    } else {
      toast.warn("No lab tests to remove!");
    }
  }, [prescriptionFormData.labTests?.length]);

  // Attachment handlers
  const handleAttachmentsChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({ name: file.name, type: file.type, data: reader.result });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((results) => {
      setAttachments((prev) => [...prev, ...results]);
    });
  }, [setAttachments]);

  const handleRemoveAttachment = useCallback((idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }, [setAttachments]);

  // Submit handlers - UPDATED FOR MedicineSection FIELDS
  const handlePreviewAndSubmit = useCallback(() => {
    const { patient, symptoms, diagnosis, followUpDate, medicines, vaccines = [], labTests = [] } = prescriptionFormData;
    const newErrors = {};
  
    if (!patient) newErrors.patient = "Please select a patient.";
  
    const validSymptoms = symptoms.filter((s) => s.symptom?.trim());
    if (validSymptoms.length === 0) newErrors.symptoms = "At least one symptom is required.";
  
    // Check if at least one medicine is filled
    const validMedicines = medicines.filter((row) => row.medicine?.medicineName);
    if (validMedicines.length === 0) {
      newErrors.medicines = "At least one medicine is required.";
    }
  
    medicines.forEach((row, index) => {
      if (!row.medicine?.medicineName) {
        newErrors[`medicine_${index}`] = "Please select a medicine.";
      }
      if (!row.dose || row.dose === "0-0-0") {
        newErrors[`dose_${index}`] = "Please select dose timing (M-A-D)";
      }
    });
  
    let doctorId = null;
    if (patient) {
      if (patient.doctorId) doctorId = patient.doctorId;
      else if (patient.doctor_id) doctorId = patient.doctor_id;
      else if (patient.doctor?.id) doctorId = patient.doctor.id;
      else if (user) doctorId = user.id;
    }
  
    if (!doctorId && user) {
      if (user.role === "doctor" && user.doctorId) doctorId = user.doctorId;
      else if (user.role === "doctor" && user.id) doctorId = user.id;
      else if (user.id) doctorId = user.id;
    }
  
    if (!doctorId) {
      newErrors.doctor = "Doctor information is missing.";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted errors.");
      return;
    }
  
    // Calculate totals for preview
    const calculateMedicinesTotal = () => {
      return medicines.reduce((total, med) => {
        return total + getMedicinePrice(med.medicine);
      }, 0);
    };
  
    const calculateVaccinesTotal = () => {
      return (vaccines || []).reduce((total, vac) => {
        return total + (vac.vaccine?.price || 0);
      }, 0);
    };
  
    const calculateLabTestsTotal = () => {
      return (labTests || []).reduce((total, test) => {
        return total + (test.labTest?.price || 0);
      }, 0);
    };
  
    // Format consultation data
    const formattedConsultation = [];
    if (localFormData.paymentAmount) {
      formattedConsultation.push({
        amount: parseFloat(localFormData.paymentAmount) || 0,
        type: localFormData.paymentType || "",
        status: localFormData.paymentStatus || "pending"
      });
    }
  
    const medicinesTotalPrice = calculateMedicinesTotal();
    const vaccinesTotalPrice = calculateVaccinesTotal();
    const labTestsTotalPrice = calculateLabTestsTotal();

    const previewData = {
      ...prescriptionFormData,
      localFormData, // Include local form data
      doctor: user,
      previewDate: new Date().toISOString(),
      attachments: attachments,
      // Add the calculated totals
      medicines_total_price: medicinesTotalPrice,
      vaccines_total_price: vaccinesTotalPrice,
      lab_tests_total_price: labTestsTotalPrice,
      consultation: formattedConsultation,

      image_urls: attachments.map((attachment) => attachment.data),
      // Include individual totals for display if needed
      totals: {
        medicines: medicinesTotalPrice,
        vaccines: vaccinesTotalPrice,
        labTests: labTestsTotalPrice,
        // consultation: formattedConsultation.reduce((sum, item) => sum + (item.amount || 0), 0)
        consultation: localFormData.paymentAmount || 0,
        paymentType: localFormData.paymentType || "cash",
        paymentStatus: localFormData.paymentStatus || "pending",
      }
    };
  
    setPreviewData(previewData);
    setShowPreview(true);
  }, [prescriptionFormData, user, attachments, localFormData, getMedicinePrice]);

  const handleSubmitPrescription = useCallback(async (previewData = null) => {
  setIsSubmitting(true);
  try {
    const dataToSubmit = previewData || prescriptionFormData;
    const { patient, symptoms, diagnosis, followUpDate, medicines, vaccines, labTests } = dataToSubmit;

    // Calculate totals
    const calculateMedicinesTotal = () => {
      return medicines.reduce((total, med) => {
        return total + getMedicinePrice(med.medicine);
      }, 0);
    };

    const calculateVaccinesTotal = () => {
      return (vaccines || []).reduce((total, vac) => {
        return total + (vac.vaccine?.price || 0);
      }, 0);
    };

    const calculateLabTestsTotal = () => {
      return (labTests || []).reduce((total, test) => {
        return total + (test.labTest?.price || 0);
      }, 0);
    };

    // Format medicines according to backend structure
    const formattedMedicines = medicines.map((row) => {
      const medicinePrice = getMedicinePrice(row.medicine);
      
      return {
        medicine_name: row.medicine?.medicineName || row.medicine?.name || "",
        dose: row.dose || "0-0-0", // This should be the dose timing like "1-0-1"
        when: row.when || "",
        frequency: row.frequency || "",
        duration: row.duration || "",
        notes: row.notes || "",
        sku: row.sku || row.medicine?.sku || "",
        price: medicinePrice
      };
    });

    // Format vaccines
    const formattedVaccines = (vaccines || []).map((v) => ({
      vaccine_name: v.vaccine?.medicineName || v.vaccine?.name || v.vaccine?.label || "",
      notes: v.notes || "",
      sku: v.sku || v.vaccine?.sku || "",
      price: v.vaccine?.price || 0
    }));

    // Format lab tests
    const formattedLabTests = (labTests || []).map((lt) => ({
      test_name: lt.labTest?.medicineName || lt.labTest?.name || lt.labTest?.label || "",
      test_type: lt.labTest?.category || "General", // Assuming category field exists
      notes: lt.notes || "",
      sku: lt.sku || lt.labTest?.sku || "",
      price: lt.labTest?.price || 0
    }));

    // Format consultation/payment
    const formattedConsultation = [];
    if (dataToSubmit.paymentAmount) {
      formattedConsultation.push({
        amount: parseFloat(dataToSubmit.paymentAmount) || 0,
        type: dataToSubmit.paymentType || "",
        status: dataToSubmit.paymentStatus || "pending"
      });
    }

    // Process attachments
    const imageUrls = attachments.map((attachment) => attachment.data);

    // Get doctor ID
    let doctorId = null;
    if (patient) {
      if (patient.doctorId) doctorId = patient.doctorId;
      else if (patient.doctor_id) doctorId = patient.doctor_id;
      else if (patient.doctor?.id) doctorId = patient.doctor.id;
      else if (user) doctorId = user.id;
    }

    if (!doctorId && user) {
      if (user.role === "doctor" && user.doctorId) doctorId = user.doctorId;
      else if (user.role === "doctor" && user.id) doctorId = user.id;
      else if (user.id) doctorId = user.id;
    }

    // Calculate totals
    const medicinesTotalPrice = calculateMedicinesTotal();
    const vaccinesTotalPrice = calculateVaccinesTotal();
    const labTestsTotalPrice = calculateLabTestsTotal();

    // Prepare final payload matching backend structure
    const prescriptionPayload = {
      doctor_id: doctorId,
      patient_id: patient.id || patient.patient_id,
      appointment_date: patient.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: patient.appointment_time || new Date().toTimeString().split(' ')[0].substring(0, 5),
      symptoms: symptoms.map(s => ({
        symptom: s.symptom || "",
        frequency: s.frequency || "",
        severity: s.severity || "",
        duration: s.duration || "",
        date: s.date || new Date().toISOString().split('T')[0]
      })),
      diagnosis: diagnosis.map(d => ({
        diagnosis: d.diagnosis || "",
        duration: d.duration || "",
        date: d.date || new Date().toISOString().split('T')[0]
      })),
      follow_up_date: followUpDate || null,
      instructions: dataToSubmit.instructions || "",
      height: dataToSubmit.height || "",
      weight: dataToSubmit.weight || "",
      bp: dataToSubmit.bp || "",
      pulse: dataToSubmit.pulse || "",
      temperature: dataToSubmit.temperature || "",
      medicines: formattedMedicines,
      vaccines: formattedVaccines,
      lab_tests: formattedLabTests,
      image_urls: imageUrls,
      medicines_total_price: medicinesTotalPrice,
      vaccines_total_price: vaccinesTotalPrice,
      lab_tests_total_price: labTestsTotalPrice,
      consultation: formattedConsultation,
      // Include SKUs if needed for tracking
      medicine_skus: medicines.map(m => m.sku || m.medicine?.sku || "").filter(sku => sku),
      vaccine_skus: (vaccines || []).map(v => v.sku || v.vaccine?.sku || "").filter(sku => sku),
      lab_test_skus: (labTests || []).map(lt => lt.sku || lt.labTest?.sku || "").filter(sku => sku)
    };
    console.log("Submitting prescription payload:", prescriptionPayload);

    const result = await addPrescription(prescriptionPayload);

    if (result) {
      toast.success("Prescription submitted successfully!");
      handleFullReset();
      if (onResetTimer) onResetTimer();
      await fetchPrescriptions();
      // Navigate to all prescriptions page
      navigate('/prescriptions/all-prescriptions');
    }
  } catch (error) {
    console.error("Submit Error:", error);
  }
  setIsSubmitting(false);
}, [prescriptionFormData, user, attachments, addPrescription, onResetTimer, fetchPrescriptions, getMedicinePrice, navigate]);


  const handleSubmitFromPreview = useCallback(() => {
    if (previewData) {
      handleSubmitPrescription(previewData);
    }
  }, [previewData, handleSubmitPrescription]);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewData(null);
  }, []);

  const handleFullReset = useCallback(() => {
    // Batch state updates
    React.startTransition(() => {
      resetPrescriptionForm();
      
      // Reset all local states
      setVitalSigns(initialVitalSigns);
      setSymptomsData(initialSymptomsData);
      setDiagnosisData(initialDiagnosisData);
      setVaccineFormData({ vaccine: null, notes: "", sku: "" });
      setLabTestFormData({ labTest: null, notes: "", sku: "" });
      setLocalFormData(initialLocalFormData);
      setShowVaccineSection(false);
      setShowLabTestSection(false);
      setShowMedicinePanel(false);
      setShowDiagnosisSuggestions(false);
      setAttachments([]);
      setErrors({});
      setShowPreview(false);
      setPreviewData(null);
      setIsSubmitting(false);
      setPatientFilter("today");
      setPendingPatientId(null);
      setPendingPatientData(null);
    });
    
    if (onResetTimer) onResetTimer();
    toast.success("Form completely reset! Starting fresh.");
  }, [resetPrescriptionForm, onResetTimer, setAttachments]);

  // Initialize arrays if undefined
  if (!prescriptionFormData.vaccines) prescriptionFormData.vaccines = [];
  if (!prescriptionFormData.labTests) prescriptionFormData.labTests = [];
  if (!prescriptionFormData.medicines || prescriptionFormData.medicines.length === 0) {
    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: [{
        medicine: null,
        dose: "0-0-0",
        when: "",
        frequency: "",
        duration: "",
        notes: "",
        sku: "",
      }],
    }));
  }

  const handleTemplateSelect = useCallback(
    (e) => {
      const value = e.target.value;
  
      // 1️⃣ Do nothing
      if (!value) return;
  
      // 2️⃣ Clear everything
      if (value === "__clear") {
        handleFullReset();
        toast.info("All fields cleared");
        return;
      }
  
      // 3️⃣ Apply template (INTELLIGENT FILL MODE)
      const selectedTemplate = templates.find(
        (t) => t.id === Number(value)
      );
      if (!selectedTemplate) return;
  
      /* ---------------- SYMPTOMS (Fill empty rows first) ---------------- */
      let templateSymptoms = [];
      if (selectedTemplate.symptoms) {
        templateSymptoms = selectedTemplate.symptoms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((symptom) => ({
            symptom,
            frequency: "",
            severity: "",
            duration: "",
            date: new Date().toISOString().split("T")[0],
          }));
      }
  
      // Find empty symptom rows
      const emptySymptomRows = symptomsData
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !row.symptom?.trim());
  
      // Fill empty rows first
      let remainingSymptoms = [...templateSymptoms];
      const updatedSymptoms = [...symptomsData];
  
      emptySymptomRows.forEach(({ index }, i) => {
        if (remainingSymptoms.length > 0) {
          updatedSymptoms[index] = {
            ...updatedSymptoms[index],
            ...remainingSymptoms[0]
          };
          remainingSymptoms.shift();
        }
      });
  
      // Add remaining symptoms as new rows
      if (remainingSymptoms.length > 0) {
        updatedSymptoms.push(...remainingSymptoms);
      }
  
      /* ---------------- DIAGNOSIS (Fill empty rows first) ---------------- */
      let templateDiagnosis = [];
      if (selectedTemplate.diagnosis) {
        templateDiagnosis = selectedTemplate.diagnosis
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
          .map((diagnosis) => ({
            diagnosis,
            duration: "",
            date: new Date().toISOString().split("T")[0],
          }));
      }
  
      // Find empty diagnosis rows
      const emptyDiagnosisRows = diagnosisData
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !row.diagnosis?.trim());
  
      // Fill empty rows first
      let remainingDiagnosis = [...templateDiagnosis];
      const updatedDiagnosis = [...diagnosisData];
  
      emptyDiagnosisRows.forEach(({ index }, i) => {
        if (remainingDiagnosis.length > 0) {
          updatedDiagnosis[index] = {
            ...updatedDiagnosis[index],
            ...remainingDiagnosis[0]
          };
          remainingDiagnosis.shift();
        }
      });
  
      // Add remaining diagnosis as new rows
      if (remainingDiagnosis.length > 0) {
        updatedDiagnosis.push(...remainingDiagnosis);
      }
  
      /* ---------------- MEDICINES (Fill empty rows first, avoid duplicates) ---------------- */
      const templateMedicines = selectedTemplate.medicines?.map((templateMed) => {
        let found = medicineOptions.find(
          (opt) =>
            opt.productId === templateMed.product_id ||
            opt.sku === templateMed.sku
        );
  
        if (!found) {
          return {
            medicine: {
              label: templateMed.product_name || "Unknown",
              medicineName: templateMed.product_name || "Unknown",
              sku: templateMed.sku || "",
              productId: templateMed.product_id,
            },
            notes: templateMed.notes || "",
            dose: templateMed.timing || "0-0-0",
            when: templateMed.when || "",
            frequency: templateMed.frequency || "",
            duration: templateMed.duration || "",
            sku: templateMed.sku || "",
          };
        }
  
        return {
          medicine: found,
          notes: templateMed.notes || "",
          dose: templateMed.timing || "0-0-0",
          when: templateMed.when || "",
          frequency: templateMed.frequency || "",
          duration: templateMed.duration || "",
          sku: found.sku,
        };
      }) || [];
  
      // Find empty medicine rows
      const emptyMedicineRows = prescriptionFormData.medicines
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !row.medicine?.medicineName && !row.medicine?.name);
  
      // Track used SKUs to avoid duplicates
      const usedSkus = new Set(
        prescriptionFormData.medicines
          .map(med => med.sku)
          .filter(sku => sku)
      );
  
      // Filter template medicines to remove duplicates
      const uniqueTemplateMedicines = templateMedicines.filter(
        tm => !usedSkus.has(tm.sku)
      );
  
      // Fill empty rows first
      let remainingMedicines = [...uniqueTemplateMedicines];
      const updatedMedicines = [...prescriptionFormData.medicines];
  
      emptyMedicineRows.forEach(({ index }) => {
        if (remainingMedicines.length > 0) {
          updatedMedicines[index] = {
            ...updatedMedicines[index],
            ...remainingMedicines[0]
          };
          usedSkus.add(remainingMedicines[0].sku);
          remainingMedicines.shift();
        }
      });
  
      // Add remaining medicines as new rows (ensuring no duplicates)
      const filteredRemainingMedicines = remainingMedicines.filter(
        tm => !usedSkus.has(tm.sku)
      );
      if (filteredRemainingMedicines.length > 0) {
        updatedMedicines.push(...filteredRemainingMedicines);
      }
  
      /* ---------------- VACCINES (Fill empty rows first) ---------------- */
      const templateVaccines = selectedTemplate.vaccines?.map((templateVac) => ({
        vaccine: {
          label: templateVac.vaccine_name || "Unknown",
          medicineName: templateVac.vaccine_name || "Unknown",
          sku: templateVac.vaccine_sku || "",
        },
        notes: templateVac.vaccine_notes || "",
        sku: templateVac.vaccine_sku || "",
      })) || [];
  
      // Find empty vaccine rows
      const currentVaccines = prescriptionFormData.vaccines || [];
      const emptyVaccineRows = currentVaccines
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !row.vaccine?.medicineName);
  
      // Fill empty rows first
      let remainingVaccines = [...templateVaccines];
      const updatedVaccines = [...currentVaccines];
  
      emptyVaccineRows.forEach(({ index }) => {
        if (remainingVaccines.length > 0) {
          updatedVaccines[index] = {
            ...updatedVaccines[index],
            ...remainingVaccines[0]
          };
          remainingVaccines.shift();
        }
      });
  
      // Add remaining vaccines as new rows
      if (remainingVaccines.length > 0) {
        updatedVaccines.push(...remainingVaccines);
      }
  
      /* ---------------- LAB TESTS (Fill empty rows first) ---------------- */
      const templateLabTests = selectedTemplate.lab_tests?.map((templateTest) => ({
        labTest: {
          label: templateTest.test_name || "Unknown",
          medicineName: templateTest.test_name || "Unknown",
          sku: templateTest.test_sku || "",
        },
        notes: templateTest.test_notes || "",
        sku: templateTest.test_sku || "",
      })) || [];
  
      // Find empty lab test rows
      const currentLabTests = prescriptionFormData.labTests || [];
      const emptyLabTestRows = currentLabTests
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !row.labTest?.medicineName);
  
      // Fill empty rows first
      let remainingLabTests = [...templateLabTests];
      const updatedLabTests = [...currentLabTests];
  
      emptyLabTestRows.forEach(({ index }) => {
        if (remainingLabTests.length > 0) {
          updatedLabTests[index] = {
            ...updatedLabTests[index],
            ...remainingLabTests[0]
          };
          remainingLabTests.shift();
        }
      });
  
      // Add remaining lab tests as new rows
      if (remainingLabTests.length > 0) {
        updatedLabTests.push(...remainingLabTests);
      }
  
      /* ---------------- APPLY UPDATED DATA ---------------- */
      setSymptomsData(updatedSymptoms);
      setDiagnosisData(updatedDiagnosis);
  
      setPrescriptionFormData((prev) => ({
        ...prev,
        symptoms: updatedSymptoms,
        diagnosis: updatedDiagnosis,
        medicines: updatedMedicines,
        vaccines: updatedVaccines,
        labTests: updatedLabTests,
        instructions:
          prev.instructions && prev.instructions.trim() !== ""
            ? prev.instructions
            : selectedTemplate.instructions || "",
      }));
  
      // Show/hide sections based on template content
      if (templateVaccines.length > 0) {
        setShowVaccineSection(true);
      }
      if (templateLabTests.length > 0) {
        setShowLabTestSection(true);
      }
  
      toast.success(
        `Template "${selectedTemplate.template_name}" applied successfully!`
      );
    },
    [
      templates,
      symptomsData,
      diagnosisData,
      prescriptionFormData.medicines,
      prescriptionFormData.vaccines,
      prescriptionFormData.labTests,
      medicineOptions,
      handleFullReset,
    ]
  );
  

  return (
    <>
      <style>{`
        .btn-primary:hover span,
        .btn-primary:focus span {
          color: white !important;
        }
        .btn-primary:hover .text-muted,
        .btn-primary:focus .text-muted {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        input, select, textarea {
          transition: border-color 0.2s ease-in-out;
        }
      `}</style>
      <div className="row align-items-stretch" ref={symptomInputRef}>
        <div className="col-xl-9 order-2 order-xl-2 d-flex">
          <div className="card w-100 h-100 invoice-container">
            <div className="card-header bg-light border-bottom">
              <div className="col-md-6">
                <div className="input-group">
                  <div className="flex-grow-1">
                    <ReactSelect
                      classNamePrefix="react-select"
                      options={patientOptions}
                      value={
                        prescriptionFormData.patient
                          ? patientOptions.find(
                              (option) =>
                                option.rawPatient.id ===
                                prescriptionFormData.patient?.id
                            )
                          : null
                      }
                      onChange={handlePatientChange}
                      placeholder="Select patient"
                      getOptionValue={(option) => option.rawPatient.id}
                      formatOptionLabel={(option) => option.label}
                      filterOption={customFilterOption}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue
                          ? `No patients found for "${inputValue}"`
                          : "No patients available"
                      }
                    />
                  </div>
                  {/* Integrated Filter Toggle Button */}
                  <div className="prescription-toggle-wrapper ms-2">
                    <div className="prescription-toggle-bg d-flex align-items-center justify-content-between bg-gray-100 p-1 shadow-sm">
                      <button
                        ref={allFilterRef}
                        className={`btn btn-sm ${patientFilter === "all" ? "btn-primary shadow-sm" : "text-dark"}`}
                        onClick={() => setPatientFilter("all")}
                      >
                        All
                      </button>
                      <button
                        ref={todayFilterRef}
                        className={`btn btn-sm ${patientFilter === "today" ? "btn-primary shadow-sm" : "text-dark"}`}
                        onClick={() => setPatientFilter("today")}
                      >
                        Today
                      </button>
                    </div>
                  </div>
                </div>
                {errors.patient && (
                  <small className="text-danger">{errors.patient}</small>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
              <select
  className="form-select form-select-sm px-3 py-1"
  style={{ minWidth: 200 }}
  value=""
  onChange={handleTemplateSelect}
>
  <option value="">Select a template...</option>
  <option value="__clear">Clear all fields</option>

  {templates.map((t) => (
    <option key={t.id} value={t.id}>
      {t.template_name}
    </option>
  ))}
</select>


                <button
                  type="button"
                  onClick={handleFullReset}
                  className="btn btn-sm text-danger py-1 d-flex align-items-center gap-1"
                  title="Reset form completely"
                >
                  <GrPowerReset size={18} />
                </button>
              </div>
            </div>

            <div className="card-body p-0">
              {/* Vital Signs Section - Using debounced values */}
              <div className="row px-3 mt-4 mb-4">
                <VitalSignsInput
                  value={vitalSigns.weight}
                  onChange={handleVitalSignChange}
                  icon={FiTrendingUp}
                  placeholder="Weight"
                  unit="kg"
                  name="weight"
                />
                <VitalSignsInput
                  value={vitalSigns.height}
                  onChange={handleVitalSignChange}
                  icon={MdHeight}
                  placeholder="Height"
                  unit="cm"
                  name="height"
                />
                {showGrowthChart && (
                  <VitalSignsInput
                    value={vitalSigns.headCircumference}
                    onChange={handleVitalSignChange}
                    icon={FiCircle}
                    placeholder="Head Circumference"
                    unit="cm"
                    name="headCircumference"
                  />
                )}
                <VitalSignsInput
                  value={vitalSigns.bp}
                  onChange={handleVitalSignChange}
                  icon={FiActivity}
                  placeholder="BP"
                  unit="mmHg"
                  name="bp"
                />
                <VitalSignsInput
                  value={vitalSigns.pulse}
                  onChange={handleVitalSignChange}
                  icon={FiHeart}
                  placeholder="Pulse"
                  unit="bpm"
                  name="pulse"
                />
                <VitalSignsInput
                  value={vitalSigns.temperature}
                  onChange={handleVitalSignChange}
                  icon={FiThermometer}
                  placeholder="Temp"
                  unit="°F"
                  name="temperature"
                />
              </div>

              {/* Growth Chart Section - Memoized */}
              {growthChartComponent}

              {/* Symptoms Section */}
              <div className="px-4 mt-2 mb-4">
                <React.Suspense fallback={<div>Loading symptoms section...</div>}>
                  <SymptomsSection
                    symptomsData={symptomsData}
                    symptomsSuggestions={[...new Set([...symptomsSuggestions, ...specialtyKeywords.symptoms])]}
                    errors={errors}
                    onAddRow={handleAddSymptomRow}
                    onFieldChange={handleSymptomFieldChange}
                    onRemoveRow={handleRemoveSymptomRow}
                    onActiveInputChange={setActiveSymptomInput}
                  />
                </React.Suspense>
              </div>

              {/* Diagnosis Section */}
              <div className="px-4 mt-2 mb-4">
                <React.Suspense fallback={<div>Loading diagnosis section...</div>}>
                  <DiagnosisSection
                    diagnosisData={diagnosisData}
                    diagnosisSuggestions={[...new Set([...diagnosisSuggestions, ...specialtyKeywords.diagnosis])]}
                    errors={errors}
                    onAddRow={handleAddDiagnosisRow}
                    onFieldChange={handleDiagnosisFieldChange}
                    onRemoveRow={handleRemoveDiagnosisRow}
                  />
                </React.Suspense>
              </div>

              {/* Medicine Section - UPDATED FOR MedicineSection COMPONENT */}
              <div className="px-4 mt-2 mb-4">
                <React.Suspense fallback={<div>Loading medicine section...</div>}>
                  <MedicineSection
                    medicines={prescriptionFormData.medicines}
                    medicineOptions={medicineOptions}
                    onAddRow={handleAddRow}
                    onRemoveRow={handleRemoveRow}
                    onMedicineChange={handleMedicineChange}
                    onNotesChange={handleNotesChangeWrapper}
                    onFieldChange={handleMedicineFieldChange} // New prop for field changes
                    errors={errors}
                    isRefreshingMedicines={isRefreshingMedicines}
                    onRefreshMedicines={handleRefreshMedicines}
                  />
                </React.Suspense>
              </div>

              {/* Vaccine Section */}
              {showVaccineSection && (
                <div className="px-4">
                  <React.Suspense fallback={<div>Loading vaccine section...</div>}>
                    <VaccineSection
                      vaccines={prescriptionFormData.vaccines}
                      vaccineOptions={vaccineOptions}
                      vaccineFormData={vaccineFormData}
                      onAddRow={handleAddVaccineRow}
                      onRemoveRow={handleRemoveVaccineRow}
                      onVaccineChange={handleVaccineChange}
                      onVaccineNotesChange={handleVaccineNotesChange}
                      onVaccineFieldChange={handleVaccineFieldChange}
                      isRefreshingVaccines={isRefreshingVaccines}
                      onRefreshVaccines={handleRefreshVaccines}
                      onHide={() => setShowVaccineSection(false)}
                    />
                  </React.Suspense>
                  {!showLabTestSection && (
                    <div className="px-0 pt-2 pb-2">
                      <button
                        type="button"
                        onClick={() => setShowLabTestSection(true)}
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: "0.9em", padding: "6px 12px" }}
                      >
                        <i className="bi bi-clipboard2-pulse me-1"></i>
                        Add Lab Test
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Lab Test Section */}
              {showLabTestSection && (
                <div className="px-4 mb-4">
                  <React.Suspense fallback={<div>Loading lab test section...</div>}>
                    <LabTestSection
                      labTests={prescriptionFormData.labTests}
                      labTestOptions={labTestOptions}
                      labTestFormData={labTestFormData}
                      onAddRow={handleAddLabTestRow}
                      onRemoveRow={handleRemoveLabTestRow}
                      onLabTestChange={handleLabTestChange}
                      onLabTestNotesChange={handleLabTestNotesChange}
                      onLabTestFieldChange={handleLabTestFieldChange}
                      patient={prescriptionFormData.patient}
                      specialtyLabTests={specialtyLabTests}
                      loadingSpecialtyTests={loadingSpecialtyTests}
                      isRefreshingLabTests={isRefreshingLabTests}
                      onRefreshLabTests={handleRefreshLabTests}
                      onHide={() => setShowLabTestSection(false)}
                    />
                  </React.Suspense>
                </div>
              )}
              {/* Add Vaccine and Lab Test Buttons */}
              <div className="px-4 pb-2 d-flex gap-2">
                {!showVaccineSection && (
                  <button
                    type="button"
                    onClick={() => setShowVaccineSection(true)}
                    className="btn btn-sm btn-outline-primary"
                    style={{ fontSize: "0.9em", padding: "6px 12px" }}
                  >
                    <i className="bi bi-shield-check me-1"></i>
                    Add Vaccine
                  </button>
                )}
                {!showVaccineSection && !showLabTestSection && (
                  <button
                    type="button"
                    onClick={() => setShowLabTestSection(true)}
                    className="btn btn-sm btn-outline-primary"
                    style={{ fontSize: "0.9em", padding: "6px 12px" }}
                  >
                    <i className="bi bi-clipboard2-pulse me-1"></i>
                    Add Lab Test
                  </button>
                )}
              </div>

              <hr className="my-0 border-dashed" />

              {/* Follow Up Date Section */}
              <div className="px-4 pt-3 pb-2 clearfix proposal-table">
                <div className=" d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-2">Follow Up Date</h6>
                  </div>
                  <div
                    className="avatar-text avatar-sm"
                    data-bs-toggle="tooltip"
                    data-bs-trigger="hover"
                    title="Follow-up helps track the patient's recovery and adjust treatment if needed."
                  >
                    <FiInfo />
                  </div>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-1">
                  <input
                    type="date"
                    className={`form-control form-control-sm p-2 ${errors.followUpDate ? "is-invalid" : ""}`}
                    style={{ maxWidth: "200px" }}
                    value={prescriptionFormData.followUpDate || ""}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (validateFollowUpDate(dateValue)) {
                        handleFieldChange("followUpDate", dateValue);
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <div className="d-flex flex-wrap gap-2 align-items-stretch">
                    {[3, 7, 15].map((days) => (
                      <FollowUpDateButton
                        key={days}
                        days={days}
                        label={`${days} Days`}
                        subLabel={getFollowUpDateLabel(days)}
                        isSelected={isDateSelected(days)}
                        isAvailable={getAvailabilityStatus(days)}
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + days);
                          handleFieldChange("followUpDate", date.toISOString().split("T")[0]);
                        }}
                      />
                    ))}
                    <FollowUpDateButton
                      days={30}
                      label="1 Month"
                      subLabel={getFollowUpMonthLabel()}
                      isSelected={isMonthSelected()}
                      isAvailable={getMonthAvailabilityStatus()}
                      onClick={() => {
                        const date = new Date();
                        date.setMonth(date.getMonth() + 1);
                        handleFieldChange("followUpDate", date.toISOString().split("T")[0]);
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-light border d-flex align-items-center justify-content-center "
                      style={{  padding: "4px 8px" }}
                      onClick={() => handleFieldChange("followUpDate", "")}
                      title="Clear selected follow-up date"
                    >
                      <FiRefreshCcw size={14} />
                    </button>
                  </div>
                </div>
                {errors.followUpDate && (
                  <p className="input-error text-danger mt-2">{errors.followUpDate}</p>
                )}
              </div>

              {/* Medication Instructions & Attachments in one row */}
              <div className="px-4 mt-4">
                <div className="row g-3">
                  {/* Medication Instructions */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Medication Instructions & Warnings</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={localFormData.instructions}
                      onChange={(e) => handleLocalFieldChange("instructions", e.target.value)}
                      placeholder="E.g. Take with food, do not drive, etc."
                    />
                  </div>

                  {/* Attachments Section */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Attachments (Lab Reports, Images, etc.)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleAttachmentsChange}
                      className="form-control form-control-sm"
                    />
                    <div className="mt-3">
                      {attachments.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {attachments.map((file, idx) => (
                            <div
                              key={idx}
                              className="position-relative border rounded p-2"
                              style={{ width: "120px", height: "120px" }}
                            >
                              {file.type.startsWith("image") ? (
                                <img
                                  src={file.data}
                                  alt={file.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                  }}
                                />
                              ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                  <i
                                    className="bi bi-file-earmark-pdf text-danger"
                                    style={{ fontSize: "2rem" }}
                                  ></i>
                                  <small
                                    className="text-muted text-center mt-1"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {file.name.length > 15
                                      ? file.name.substring(0, 15) + "..."
                                      : file.name}
                                  </small>
                                </div>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                style={{ width: "20px", height: "20px", fontSize: "10px", padding: "0" }}
                                onClick={() => handleRemoveAttachment(idx)}
                                title="Remove attachment"
                              >
                                ×
                              </button>
                              <div className="position-absolute bottom-0 start-0 w-100 p-1">
                                <small
                                  className="text-white bg-dark bg-opacity-75 rounded px-1"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {file.name.length > 20
                                    ? file.name.substring(0, 20) + "..."
                                    : file.name}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted">
                          <i className="bi bi-cloud-upload" style={{ fontSize: "2rem" }}></i>
                          <p className="mt-2 mb-0">No files selected</p>
                          <small>Upload lab reports, images, or other documents</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="px-4 mt-4">
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Consultation Amount</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={localFormData.paymentAmount}
                        onChange={(e) => handleLocalFieldChange("paymentAmount", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.paymentAmount && (
                      <small className="text-danger">{errors.paymentAmount}</small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Consultation Type</label>
                    <select
                      className="form-select form-control-sm"
                      value={localFormData.paymentType}
                      onChange={(e) => handleLocalFieldChange("paymentType", e.target.value)}
                    >
                      {paymentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.paymentType && (
                      <small className="text-danger">{errors.paymentType}</small>
                    )}
                  </div>
                </div>
                {prescriptionFormData.paymentAmount && (
                  <div className="mt-3 form-check-sm">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input form-check-input-sm"
                        type="radio"
                        name="paymentStatus"
                        id="paymentPaid"
                        value="paid"
                        checked={localFormData.paymentStatus === "paid"}
                        onChange={(e) => handleLocalFieldChange("paymentStatus", e.target.value)}
                      />
                      <label className="form-check-label text-success fw-semibold" htmlFor="paymentPaid">
                        <i className="bi bi-check-circle me-1"></i> Paid
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input form-check-input-sm"
                        type="radio"
                        name="paymentStatus"
                        id="paymentPending"
                        value="pending"
                        checked={localFormData.paymentStatus === "pending" || !localFormData.paymentStatus}
                        onChange={(e) => handleLocalFieldChange("paymentStatus", e.target.value)}
                      />
                      <label className="form-check-label text-warning fw-semibold" htmlFor="paymentPending">
                        <i className="bi bi-clock me-1"></i> Pending
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-dashed my-4" />
              <div className="px-5 pb-5">
                <div className="d-flex gap-3">
                  <button
                    type="button"
                    onClick={handlePreviewAndSubmit}
                    className="btn btn-primary flex-fill shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-eye me-2"></i>
                        Preview & Submit Prescription
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Details Sidebar */}
        <div className="col-xl-3 d-flex flex-column order-3 ps-xl-0">
          <div className="card position-sticky top-0 mb-0">
            <div className="card-header pb-2 px-3">
              <div className="d-flex align-items-center gap-2">
                <FaUser size={22} className="text-warning" />
                <div>
                  <h6 className="fw-bold mb-0">Patient Details</h6>
                  <small className="text-muted">Selected patient information...</small>
                </div>
              </div>
            </div>

            <div className="card-body pt-3">
              <React.Suspense fallback={<div>Loading patient details...</div>}>
                <PatientDetailsSidebar patient={prescriptionFormData.patient} />
              </React.Suspense>
            </div>
          </div>
              <React.Suspense fallback={<div className="mt-3"><div className="text-center text-muted py-2"><small>Loading prescriptions...</small></div></div>}>
                <PreviousPrescriptions patient={prescriptionFormData.patient} />
              </React.Suspense>
        </div>
      </div>

      {/* Medicine Variations Panel - Rendered via Portal with highest z-index */}
      {showMedicinePanel && createPortal(
        <div 
          ref={medicinePanelRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <React.Suspense fallback={<div>Loading medicine panel...</div>}>
              <MedicineVariationsPanel
                symptomsChips={symptomsData.map((s) => s.symptom).filter((s) => s.trim() !== "")}
                activeSymptomInput={activeSymptomInput}
                contextMedicines={contextMedicines}
                onAddMedicine={handleAddMedicineFromPanel}
                onClose={() => setShowMedicinePanel(false)}
              />
            </React.Suspense>
          </div>
        </div>,
        document.body
      )}

      {/* Prescription Preview Modal */}
      {showPreview && (
         <React.Suspense fallback={<div>Loading preview...</div>}>
          <PreviewPrescription
            prescriptionData={previewData}
            onClose={handleClosePreview}
            onSubmit={handleSubmitFromPreview}
            isSubmitting={isSubmitting}
          />
          </React.Suspense>
      )}
    </>
  );
};

export default React.memo(PrescriptionsCreateDummy);