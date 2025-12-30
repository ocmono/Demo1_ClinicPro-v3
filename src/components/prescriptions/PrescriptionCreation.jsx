// PrescriptionCreation.js
import React, { useState, useRef, useEffect } from 'react';
import { toast } from "react-toastify";
import { format } from "date-fns";
import { GrPowerReset } from "react-icons/gr";
import { FiInfo } from 'react-icons/fi';
import { useBooking } from "../../contentApi/BookingProvider";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { useAppointments } from "../../context/AppointmentContext";
import { useAuth } from "../../contentApi/AuthContext";
import { useMedicines } from "../../context/MedicinesContext";
import { useVaccine } from "../../context/VaccineContext";
import { useTests } from "../../context/TestContext";

// Import sub-components
import PatientSelection from './PatientSelection';
import SymptomsDiagnosis from './SymptomsDiagnosis';
import MedicinesSection from './MedicinesSection';
import VaccineSection from './VaccineSection';
import LabTestSection from './LabTestSection';
import FollowUpSection from './FollowUpSection';
import InstructionsSection from './InstructionsSection';
import AttachmentsSection from './AttachmentsSection';
import TemplateSidebar from './TemplateSidebar';
import PatientDetailsSidebar from './PatientDetailsSidebar';
import PreviewPrescription from './PreviewPrescription';

const PrescriptionCreation = ({ onResetTimer }) => {
  const {
    prescriptionFormData,
    patients,
    setPatients,
    setPrescriptionFormData,
    resetPrescriptionForm,
    fetchPrescriptions,
    addPrescription,
    attachments,
    setAttachments,
    fetchPatientsFromAppointments
  } = usePrescription();

  const { medicines: contextMedicines, getMedicines: fetchContextMedicines } = useMedicines();
  const { vaccines: contextVaccines, getVaccines } = useVaccine();
  const { appointments } = useAppointments();
  const { categories, fetchCategories, fetchTestsBySpeciality } = useTests();
  const { doctors } = useBooking();
  const { user } = useAuth();

  // State management
  const [errors, setErrors] = useState({});
  const [patientFilter, setPatientFilter] = useState("today");
  const [pendingPatientId, setPendingPatientId] = useState(null);
  const [pendingPatientData, setPendingPatientData] = useState(null);
  const [isRefreshingMedicines, setIsRefreshingMedicines] = useState(false);
  const [isRefreshingVaccines, setIsRefreshingVaccines] = useState(false);
  const [isRefreshingLabTests, setIsRefreshingLabTests] = useState(false);
  const [showVaccineSection, setShowVaccineSection] = useState(false);
  const [showLabTestSection, setShowLabTestSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [specialtyLabTests, setSpecialtyLabTests] = useState([]);
  const [loadingSpecialtyTests, setLoadingSpecialtyTests] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorBufferDates, setDoctorBufferDates] = useState({
    startBufferDate: 1,
    endBufferDate: 365,
  });

  // Doctor availability functions
  const isOwnAppointment = (appointment) => {
    if (!user) return false;
    if (['super_admin', 'clinic_admin'].includes(user.role)) return true;
    
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
    if (['super_admin', 'clinic_admin'].includes(user.role)) return true;
    
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

  // Doctor buffer dates management
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

  // Form field handlers
  const handleFieldChange = (field, value) => {
    setPrescriptionFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: "" }));
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

  // Preview and submission
  const handlePreviewAndSubmit = () => {
    const { patient, symptoms, diagnosis, medicines } = prescriptionFormData;
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
      if (patient.doctorId) doctorId = patient.doctorId;
      else if (patient.doctor_id) doctorId = patient.doctor_id;
      else if (patient.doctor && patient.doctor.id) doctorId = patient.doctor.id;
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

    const previewData = {
      ...prescriptionFormData,
      doctor: user,
      previewDate: new Date().toISOString(),
      attachments: attachments
    };

    setPreviewData(previewData);
    setShowPreview(true);
  };

  const handleSubmitFromPreview = () => {
    if (previewData) {
      handleSubmitPrescription(previewData);
    }
  };

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
        };
      });

      const imageUrls = attachments.map(attachment => attachment.data);

      let doctorId = null;
      if (patient) {
        if (patient.doctorId) doctorId = patient.doctorId;
        else if (patient.doctor_id) doctorId = patient.doctor_id;
        else if (patient.doctor && patient.doctor.id) doctorId = patient.doctor.id;
        else if (user) doctorId = user.id;
      }

      if (!doctorId && user) {
        if (user.role === "doctor" && user.doctorId) doctorId = user.doctorId;
        else if (user.role === "doctor" && user.id) doctorId = user.id;
        else if (user.id) doctorId = user.id;
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
        setShowVaccineSection(false);
        setShowLabTestSection(false);
        setPrescriptionFormData(prev => ({
          ...prev,
          vaccines: [],
          labTests: [],
        }));

        if (onResetTimer) onResetTimer();
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

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleResetForm = () => {
    resetPrescriptionForm();
    setPrescriptionFormData(prev => ({
      ...prev,
      patient: null
    }));
    setAttachments([]);
    setErrors({});
    toast.info("Form reset successfully!");
  };

  return (
    <>
      <div className="row align-items-stretch">
        {/* Main Prescription Form */}
        <div className="col-xl-9 order-2 order-xl-2 d-flex">
          <div className="card w-100 h-100 invoice-container">
            <div className="card-header d-flex align-items-center gap-2 bg-light border-bottom">
              <h5 className="fw-bold mb-0">Create Prescription</h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="btn btn-sm text-danger py-1 d-flex align-items-center gap-1"
                  title="Reset form"
                >
                  <GrPowerReset size={18} />
                </button>
                <span className="fs-4 text-success"><FiInfo /></span>
              </div>
            </div>
            
            <div className="card-body p-0">
              <PatientSelection
                prescriptionFormData={prescriptionFormData}
                patientFilter={patientFilter}
                setPatientFilter={setPatientFilter}
                errors={errors}
                onPatientChange={handleFieldChange}
                onRefreshPatients={fetchPatientsFromAppointments}
              />

              <SymptomsDiagnosis
                prescriptionFormData={prescriptionFormData}
                errors={errors}
                onFieldChange={handleFieldChange}
              />

              <MedicinesSection
                prescriptionFormData={prescriptionFormData}
                errors={errors}
                onFieldChange={handleFieldChange}
                onRefreshMedicines={fetchContextMedicines}
                isRefreshingMedicines={isRefreshingMedicines}
              />

              {/* Vaccine and Lab Test Toggle */}
              <div className="px-4 pt-2 pb-2 d-flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVaccineSection(!showVaccineSection);
                    if (showVaccineSection) setShowLabTestSection(false);
                  }}
                  className={`btn btn-sm ${showVaccineSection ? 'btn-success' : 'btn-outline-success'}`}
                >
                  <i className="bi bi-shield-check me-1"></i>
                  {showVaccineSection ? 'Hide Vaccine' : 'Add Vaccine'}
                </button>
                {!showVaccineSection && (
                  <button
                    type="button"
                    onClick={() => setShowLabTestSection(!showLabTestSection)}
                    className={`btn btn-sm ${showLabTestSection ? 'btn-info' : 'btn-outline-info'}`}
                  >
                    <i className="bi bi-clipboard2-pulse me-1"></i>
                    {showLabTestSection ? 'Hide Lab Test' : 'Add Lab Test'}
                  </button>
                )}
              </div>

              {showVaccineSection && (
                <VaccineSection
                  prescriptionFormData={prescriptionFormData}
                  onFieldChange={handleFieldChange}
                  onRefreshVaccines={getVaccines}
                  isRefreshingVaccines={isRefreshingVaccines}
                />
              )}

              {showLabTestSection && (
                <LabTestSection
                  prescriptionFormData={prescriptionFormData}
                  patient={prescriptionFormData.patient}
                  specialtyLabTests={specialtyLabTests}
                  loadingSpecialtyTests={loadingSpecialtyTests}
                  onFieldChange={handleFieldChange}
                  onRefreshLabTests={fetchCategories}
                  isRefreshingLabTests={isRefreshingLabTests}
                />
              )}

              <FollowUpSection
                prescriptionFormData={prescriptionFormData}
                doctorBufferDates={doctorBufferDates}
                errors={errors}
                onFieldChange={handleFieldChange}
                validateFollowUpDate={validateFollowUpDate}
              />

              <InstructionsSection
                prescriptionFormData={prescriptionFormData}
                onFieldChange={handleFieldChange}
              />

              <AttachmentsSection
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                onRemoveAttachment={(idx) => setAttachments(prev => prev.filter((_, i) => i !== idx))}
              />

              {/* Submit Button */}
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

        {/* Sidebar */}
        <div className="col-xl-3 d-flex flex-column gap-3 order-3 order-xl-3">
          <TemplateSidebar />
          <PatientDetailsSidebar patient={prescriptionFormData.patient} />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewPrescription
          prescriptionData={previewData}
          onClose={handleClosePreview}
          onSubmit={handleSubmitFromPreview}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default PrescriptionCreation;