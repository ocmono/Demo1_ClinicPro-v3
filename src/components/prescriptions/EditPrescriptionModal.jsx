import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactSelect from "react-select";
import { usePrescription } from "../../contentApi/PrescriptionProvider";
import { toast } from "react-toastify";
import "./EditPrescriptionModal.css";
import { FiCamera, FiInfo, FiPlus, FiMinus, FiTrash2, FiActivity } from 'react-icons/fi'
import useImageUpload from '../../hooks/useImageUpload';
import { useVaccine } from "../../context/VaccineContext";
import { useTests } from "../../context/TestContext";
import { useMedicines } from "../../context/MedicinesContext";

const EditPrescriptionModal = ({ prescription, onClose, onSave }) => {
  const { fetchPrescriptions, updatePrescription } = usePrescription();
  const { medicines, getMedicines } = useMedicines();
  const { vaccines, getVaccines } = useVaccine();
  const { categories: testCategories, fetchCategories } = useTests();

  const [formData, setFormData] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    doctor_name: "",
    doctor_slug: "",
    appointment_date: "",
    appointment_time: "",
    symptoms: [],
    diagnosis: [],
    follow_up_date: "",
    medicines: [],
    instructions: "",
    attachments: [],
    doctor_id: "",
    patient_id: "",
    vaccines: [],
    tests: [],
    height: "",
    weight: "",
    bp: "",
    pulse: "",
    temperature: "",
  });

  const { handleImageUpload, uploadedImage } = useImageUpload();
  const [drawMode, setDrawMode] = useState(false);
  const [signature, setSignature] = useState("");
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
  const [filteredDiagnosisSuggestions, setFilteredDiagnosisSuggestions] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [instructionSuggestions, setInstructionSuggestions] = useState([]);

  useEffect(() => {
    getMedicines();
    fetchCategories();
    getVaccines();
  }, []);

  // Also add debugging for the formData tests
  useEffect(() => {
    console.log("FormData tests:", formData.tests);
  }, [formData.tests]);

  useEffect(() => {
    if (!prescription) return;

    console.log("DEBUG - Original prescription data:", prescription);
    console.log("DEBUG - Has doctor_id:", prescription.doctor_id);
    console.log("DEBUG - Has patient_id:", prescription.patient_id);
    console.log("DEBUG - Has image_urls:", prescription.image_urls);
  }, [prescription]);

  // Function to convert image URLs to attachment objects
  const convertImageUrlsToAttachments = (imageUrls) => {
    if (!imageUrls || !Array.isArray(imageUrls)) return [];

    return imageUrls.map(url => {
      // Extract filename from URL
      const filename = url.split('/').pop() || 'image.jpg';
      // Determine file type from URL extension
      const extension = filename.split('.').pop()?.toLowerCase();
      const type = extension === 'pdf' ? 'application/pdf' : 'image/' + extension;

      return {
        name: filename,
        type: type,
        data: url, // Use the URL directly for existing images
        url: url   // Keep the original URL for reference
      };
    });
  };

  // Ensure medicines are enriched once both props are available
  useEffect(() => {
    if (!prescription) return;

    // Convert image_urls to attachments format
    const existingAttachments = convertImageUrlsToAttachments(prescription.image_urls);

    // Combine with any existing attachments from prescription.attachments
    const allAttachments = [
      ...existingAttachments,
      ...(prescription.attachments || [])
    ];

    let symptomsArray = [];
    if (Array.isArray(prescription.symptoms) && prescription.symptoms.length > 0) {
      symptomsArray = prescription.symptoms.map(s => ({
        symptom: s.symptom || "",
        frequency: s.frequency || "",
        severity: s.severity || "",
        duration: s.duration || "",
        date: s.date || ""
      }));
    } else {
      // If no symptoms, add one empty symptom object
      symptomsArray = [{ symptom: "", frequency: "", severity: "", duration: "", date: "" }];
    }

    let diagnosisArray = [];
    if (Array.isArray(prescription.diagnosis) && prescription.diagnosis.length > 0) {
      diagnosisArray = prescription.diagnosis.map(d => ({
        diagnosis: d.diagnosis || "",
        duration: d.duration || "",
        date: d.date || ""
      }));
    } else {
      // If no symptoms, add one empty symptom object
      diagnosisArray = [{ diagnosis: "", duration: "", date: "" }];
    }

    // Make sure we always have at least an empty medicines array
    const baseMeds = Array.isArray(prescription.medicines) ? prescription.medicines : [];

    setFormData({
      patient_name: prescription.patient_name || "",
      patient_email: prescription.patient_email || "",
      patient_phone: prescription.patient_phone || "",
      doctor_name: prescription.doctor_name || "",
      doctor_slug: prescription.doctor_slug || "",
      appointment_date: prescription.appointment_date || "",
      appointment_time: prescription.appointment_time || "",
      symptoms: symptomsArray,
      diagnosis: diagnosisArray,
      follow_up_date: prescription.follow_up_date || "",
      medicines: prescription.medicines?.map(m => ({
        medicine_name: m.medicine_name?.name || m.medicine_name || "",
        sku: m.medicine_name?.sku || m.sku || "",
        medicine_timing: m.medicine_timing || "0-0-0",
        notes: m.notes || ""
      })),
      instructions: prescription.instructions || "",
      attachments: allAttachments, // Use the combined attachments
      id: prescription.id || prescription._id, // keep id for update call
      doctor_id: prescription.doctor_id || "",
      patient_id: prescription.patient_id || "",
      vaccines: prescription.vaccines?.map(vac => ({
        vaccine_name: vac.vaccine_name || "",
        sku: vac.sku || "",
        notes: vac.notes || ""
      })) || [],
      tests: prescription.lab_tests?.map(test => ({
        test_name: test.test_name || "",
        id: test.id || "",
        notes: test.notes || ""
      })) || [], // Changed from prescription.tests to prescription.lab_tests
      height: prescription.height || "",
      weight: prescription.weight || "",
      bp: prescription.bp || "",
      pulse: prescription.pulse || "",
      temperature: prescription.temperature || "",
    });

    setSignature(prescription.signature || "");
  }, [prescription]);

  useEffect(() => {
    if (!prescription || medicines.length === 0) return;

    setFormData(prev => {
      const enriched = (prev.medicines || []).map(med => {
        const match = medicines.find(
          mm => mm.sku === med.sku || mm.name === med.medicine_name
        );
        return {
          ...med,
          medicine_name: match?.name ?? med.medicine_name,
          sku: match?.sku ?? med.sku,
        };
      });
      return { ...prev, medicines: enriched };
    });
  }, [medicines, prescription]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSymptomChange = (index, field, value) => {
    const updatedSymptoms = [...formData.symptoms];
    updatedSymptoms[index] = {
      ...updatedSymptoms[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, symptoms: updatedSymptoms }));
  };

  const handleAddSymptom = () => {
    setFormData(prev => ({
      ...prev,
      symptoms: [
        ...prev.symptoms,
        { symptom: "", frequency: "", severity: "", duration: "", date: "" }
      ]
    }));
  };

  const handleRemoveSymptom = (index) => {
    if (formData.symptoms.length === 1) {
      // Don't remove the last symptom, just clear it
      const updatedSymptoms = [...formData.symptoms];
      updatedSymptoms[0] = { symptom: "", frequency: "", severity: "", duration: "", date: "" };
      setFormData(prev => ({ ...prev, symptoms: updatedSymptoms }));
    } else {
      const updatedSymptoms = formData.symptoms.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, symptoms: updatedSymptoms }));
    }
  };

  const handleDiagnosisChange = (index, field, value) => {
    const updatedDiagnosis = [...formData.diagnosis];
    updatedDiagnosis[index] = {
      ...updatedDiagnosis[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, diagnosis: updatedDiagnosis }));
  };

  const handleAddDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnosis: [
        ...prev.diagnosis,
        { diagnosis: "", duration: "", date: "" }
      ]
    }));
  };

  const handleRemoveDiagnosis = (index) => {
    if (formData.diagnosis.length === 1) {
      const updatedDiagnosis = [...formData.diagnosis];
      updatedDiagnosis[0] = { diagnosis: "", duration: "", date: "" };
      setFormData(prev => ({ ...prev, diagnosis: updatedDiagnosis }));
    } else {
      const updatedDiagnosis = formData.diagnosis.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, diagnosis: updatedDiagnosis }));
    }
  };

  const handleMedicineChange = (selectedOption, index) => {
    const updated = [...formData.medicines];
    updated[index] = {
      ...updated[index],
      medicine_name: selectedOption.name,
      sku: selectedOption.sku,  // ✅ always save SKU
      notes: updated[index]?.notes || "",
      medicine_timing: updated[index]?.medicine_timing || "0-0-0",
    };
    setFormData(prev => ({ ...prev, medicines: updated }));
  };


  const timingLabels = ["Morning", "Afternoon", "Dinner"];

  const getTimingArray = (timingStr = "") => {
    if (!timingStr) return [0, 0, 0];
    return timingStr.split("-").map((v) => (v === "1" ? 1 : 0));
  };

  const handleTimingCheckboxChange = (index, pos) => {
    const updatedMedicines = [...formData.medicines];
    const currentArr = getTimingArray(updatedMedicines[index].medicine_timing);
    currentArr[pos] = currentArr[pos] ? 0 : 1;
    updatedMedicines[index].medicine_timing = currentArr.join("-");
    setFormData((prev) => ({ ...prev, medicines: updatedMedicines }));
  };

  const handleNotesChange = (value, index) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index].notes = value;
    setFormData((prev) => ({ ...prev, medicines: updatedMedicines }));
  };

  const handleAddMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { medicine_name: "", medicine_timing: "", notes: "", sku: "" },
      ],
    }));
  };

  const handleRemoveMedicine = (index) => {
    const updated = [...formData.medicines];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, medicines: updated }));
  };

  // Drawing logic
  const startDrawing = (e) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
    const canvas = canvasRef.current;
    setSignature(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          type: file.type,
          data: reader.result,
          isNew: true // Mark as new upload
        });
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...results]
      }));
    });
  };

  const handleRemoveAttachment = (idx) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const signatureToSave = drawMode ? signature : (uploadedImage || signature);

      // Transform the data to match API expectations
      const apiData = {
        doctor_id: formData.doctor_id,
        patient_id: formData.patient_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        symptoms: formData.symptoms.filter(s => s.symptom.trim() !== ""),
        diagnosis: formData.diagnosis.filter(d => d.diagnosis.trim() !== ""),
        follow_up_date: formData.follow_up_date,
        instructions: formData.instructions,
        medicines: formData.medicines,
        vaccines: formData.vaccines,
        lab_tests: formData.tests, // Map formData.tests to lab_tests
        signature: signatureToSave,
        attachments: formData.attachments,
        height: formData.height,
        weight: formData.weight,
        bp: formData.bp,
        pulse: formData.pulse,
        temperature: formData.temperature,
      };

      console.log("Sending update data:", apiData);

      const result = await updatePrescription(formData.id, apiData);

      if (result) {
        toast.success("Prescription updated successfully!");
        fetchPrescriptions();
        onClose();
      }
    } catch (err) {
      console.error("Update error:", err);
      // toast.error("Failed to update prescription.");
    }
  };

  const medicineOptions = medicines.flatMap(med =>
    (med.variations || []).map(variation => ({
      label: `${med.name} (${variation.sku})`,
      value: variation.sku,   // 🔑 unique identifier
      name: med.name,
      sku: variation.sku,
      price: variation.price,
    }))
  );

  const vaccineOptions = vaccines.map(vac => ({
    label: vac.name,
    value: vac.variations?.[0]?.sku || vac.id,
    ...vac
  }));

  const testOptions = testCategories.length > 0
    ? testCategories.map(category => ({
      label: category.category,
      value: category.id,
      ...category
    }))
    : formData.tests.map(test => ({
      label: test.test_name,
      value: test.id || test.test_name, // Use test_name as fallback value
      category: test.test_name
    }));


  const diagnosisSuggestions = [
    { label: 'Fever', medicines: ['Paracetamol', 'Ibuprofen'], instructions: ['Take with water', 'Rest and hydrate'] },
    { label: 'Cough', medicines: ['Cough Syrup', 'Antibiotics'], instructions: ['Do not drive', 'Take after food'] },
    { label: 'Headache', medicines: ['Aspirin', 'Paracetamol'], instructions: ['Avoid loud noise', 'Take with food'] },
  ];

  // const handleDiagnosisFocus = () => {
  //   setFilteredDiagnosisSuggestions(diagnosisSuggestions);
  //   setShowDiagnosisSuggestions(true);
  // };

  // const handleDiagnosisChange = (e) => {
  //   const value = e.target.value;
  //   handleFieldChange("diagnosis", value);
  //   setFilteredDiagnosisSuggestions(
  //     diagnosisSuggestions.filter(s => s.label.toLowerCase().includes(value.toLowerCase()))
  //   );
  //   setShowDiagnosisSuggestions(true);
  //   setSelectedDiagnosis(value);
  //   // Update medicine and instruction suggestions
  //   const found = diagnosisSuggestions.find(s => s.label.toLowerCase() === value.toLowerCase());
  //   setMedicineSuggestions(found ? found.medicines : []);
  //   setInstructionSuggestions(found ? found.instructions : []);
  // };

  // const handleDiagnosisSuggestionClick = (suggestion) => {
  //   handleFieldChange("diagnosis", suggestion.label);
  //   setMedicineSuggestions(suggestion.medicines);
  //   setInstructionSuggestions(suggestion.instructions);
  //   setShowDiagnosisSuggestions(false);
  //   setSelectedDiagnosis(suggestion.label);
  // };

  const handleInstructionSuggestionClick = (suggestion) => {
    handleFieldChange('instructions', suggestion);
  };

  // Vaccines
  const handleVaccineChange = (selectedOption, index) => {
    const updated = [...formData.vaccines];
    updated[index] = {
      vaccine_name: selectedOption.name,
      sku: selectedOption.value,
      notes: updated[index]?.notes || ""
    };
    setFormData(prev => ({ ...prev, vaccines: updated }));
  };

  const handleVaccineNotesChange = (value, index) => {
    const updated = [...formData.vaccines];
    updated[index].notes = value;
    setFormData(prev => ({ ...prev, vaccines: updated }));
  };

  const handleAddVaccine = () => {
    setFormData(prev => ({
      ...prev,
      vaccines: [...prev.vaccines, { vaccine_name: "", sku: "", notes: "" }]
    }));
  };

  const handleRemoveVaccine = (index) => {
    const updated = [...formData.vaccines];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, vaccines: updated }));
  };

  // Tests
  const handleTestChange = (selectedOption, index) => {
    const updated = [...formData.tests];
    updated[index] = {
      ...updated[index], // Preserve existing properties like notes
      test_name: selectedOption.label, // Use label which matches category
      id: selectedOption.value
    };
    setFormData(prev => ({ ...prev, tests: updated }));
  };

  const handleTestNotesChange = (value, index) => {
    const updated = [...formData.tests];
    updated[index].notes = value;
    setFormData(prev => ({ ...prev, tests: updated }));
  };

  const handleAddTest = () => {
    setFormData(prev => ({
      ...prev,
      tests: [...prev.tests, { test_name: "", id: "", notes: "" }]
    }));
  };

  const handleRemoveTest = (index) => {
    const updated = [...formData.tests];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, tests: updated }));
  };

  // Function to get image source for display
  const getImageSrc = (file) => {
    // If it's a URL (existing image), use it directly
    // If it's base64 data (new upload), use the data
    return file.url || file.data;
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Prescription</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="card mb-4">
              <div className="card-header bg-light d-flex align-items-center">
                <FiActivity className="me-2" />
                <h6 className="mb-0">Vital Signs</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.height}
                      onChange={(e) => handleFieldChange("height", e.target.value)}
                      placeholder="e.g., 170"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.weight}
                      onChange={(e) => handleFieldChange("weight", e.target.value)}
                      placeholder="e.g., 70"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Blood Pressure</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.bp}
                      onChange={(e) => handleFieldChange("bp", e.target.value)}
                      placeholder="e.g., 120/80"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Pulse (bpm)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.pulse}
                      onChange={(e) => handleFieldChange("pulse", e.target.value)}
                      placeholder="e.g., 72"
                      min="0"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Temperature (°F/°C)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.temperature}
                      onChange={(e) => handleFieldChange("temperature", e.target.value)}
                      placeholder="e.g., 98.6°F or 37°C"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold">Symptoms</label>
                <button
                  type="button"
                  onClick={handleAddSymptom}
                  className="btn btn-sm btn-primary"
                >
                  <FiPlus size={14} /> Add Symptom
                </button>
              </div>

              {formData.symptoms.map((symptom, index) => (
                <div key={index} className="card mb-3 border-0 shadow-sm">
                  <div className="card-body p-3">
                    <div className="row align-items-center g-2">
                      <div className="col-md-3">
                        <label className="form-label small mb-1">Symptom *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={symptom.symptom || ""}
                          onChange={(e) => handleSymptomChange(index, "symptom", e.target.value)}
                          placeholder="e.g., Headache"
                          required
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label small mb-1">Frequency</label>
                        <select
                          className="form-select form-select-sm"
                          value={symptom.frequency || ""}
                          onChange={(e) => handleSymptomChange(index, "frequency", e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="occasional">Occasional</option>
                          <option value="constant">Constant</option>
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label className="form-label small mb-1">Severity</label>
                        <select
                          className="form-select form-select-sm"
                          value={symptom.severity || ""}
                          onChange={(e) => handleSymptomChange(index, "severity", e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label className="form-label small mb-1">Duration</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={symptom.duration || ""}
                          onChange={(e) => handleSymptomChange(index, "duration", e.target.value)}
                          placeholder="e.g., 3 days"
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label small mb-1">Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={symptom.date || ""}
                          onChange={(e) => handleSymptomChange(index, "date", e.target.value)}
                        />
                      </div>

                      <div className="col-md-1 d-flex align-items-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveSymptom(index)}
                          className="btn btn-sm btn-outline-danger"
                          title="Remove symptom"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mb-3">
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold">Diagnosis</label>
                  <button
                    type="button"
                    onClick={handleAddDiagnosis}
                    className="btn btn-sm btn-primary"
                  >
                    <FiPlus size={14} /> Add Diagnosis
                  </button>
                </div>

                {formData.diagnosis.map((diagnosisItem, index) => (
                  <div key={index} className="card mb-3 border-0 shadow-sm">
                    <div className="card-body p-3">
                      <div className="row align-items-center g-2">
                        <div className="col-md-5">
                          <label className="form-label small mb-1">Diagnosis *</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={diagnosisItem.diagnosis || ""}
                            onChange={(e) => handleDiagnosisChange(index, "diagnosis", e.target.value)}
                            placeholder="e.g., Common Cold"
                            required
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small mb-1">Duration</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={diagnosisItem.duration || ""}
                            onChange={(e) => handleDiagnosisChange(index, "duration", e.target.value)}
                            placeholder="e.g., 1 week"
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small mb-1">Date</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={diagnosisItem.date || ""}
                            onChange={(e) => handleDiagnosisChange(index, "date", e.target.value)}
                          />
                        </div>

                        <div className="col-md-1 d-flex align-items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveDiagnosis(index)}
                            className="btn btn-sm btn-outline-danger"
                            title="Remove diagnosis"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Follow-up Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={formData.follow_up_date || ""}
                    onChange={(e) =>
                      handleFieldChange("follow_up_date", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Medication Instructions & Warnings</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    value={formData.instructions}
                    onChange={e => handleFieldChange('instructions', e.target.value)}
                    placeholder="E.g. Take with food, do not drive, etc."
                  />
                  {instructionSuggestions.length > 0 && (
                    <div className="mt-2 d-flex align-items-center flex-wrap gap-2">
                      <span className="">Quick Suggestions:</span>
                      {instructionSuggestions.map((s, idx) => (
                        <button key={idx} type="button" className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => handleInstructionSuggestionClick(s)}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label">Attachments (Lab Reports, Images, etc.)</label>
              <input type="file" multiple accept="image/*,application/pdf" onChange={handleAttachmentsChange} />
              <div className="d-flex flex-wrap gap-2">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                    {file.type.startsWith('image') || (file.url && file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                      <img
                        src={getImageSrc(file)}
                        alt={file.name}
                        style={{ width: 60, height: 60, objectFit: 'cover', border: '1px solid #ccc', borderRadius: 4 }}
                        onError={(e) => {
                          // If image fails to load, show a placeholder
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGOEY4Ii8+CjxwYXRoIGQ9Ik0zMCAzN0MzMy4zMTM3IDM3IDM2IDM0LjMxMzcgMzYgMzFDMzYgMjcuNjg2MyAzMy4zMTM3IDI1IDMwIDI1QzI2LjY4NjMgMjUgMjQgMjcuNjg2MyAyNCAzMUMyNCAzNC4zMTM3IDI2LjY4NjMgMzcgMzAgMzdaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik0zNi41IDQySDE5QzE4LjE3IDQyIDE3LjUgNDEuMzMgMTcuNSA0MC41VjE5QzE3LjUgMTguMTcgMTguMTcgMTcuNSAxOSAxNy41SDQxQzQxLjgzIDE3LjUgNDIuNSAxOC4xNyA0Mi41IDE5VjQwLjVDNDIuNSA0MS4zMyA0MS44MyA0MiA0MSA0MkgzNi41WiIgc3Ryb2tlPSIjQ0VDRUNFIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : (
                      <span style={{ display: 'inline-block', width: 60, height: 60, border: '1px solid #ccc', borderRadius: 4, textAlign: 'center', lineHeight: '60px', background: '#f8f8f8' }}>{file.name}</span>
                    )}
                    <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" style={{ fontSize: 10, padding: 2, borderRadius: '50%' }} onClick={() => handleRemoveAttachment(idx)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rest of your component remains the same */}
            <h5 className="my-2">Medicines</h5>
            {formData.medicines.map((med, index) => (
              <div key={index} className="row align-items-center g-2 mb-2 ">
                <div className="col-md-4">
                  <ReactSelect
                    options={medicineOptions}
                    value={
                      medicineOptions.find(
                        opt => opt.name.toLowerCase() === med.medicine_name.toLowerCase()
                      ) || null
                    }
                    onChange={(option) => handleMedicineChange(option, index)}
                    placeholder="Select Medicine"
                    isClearable
                  />

                </div>
                <div className="col-md-4">
                  <div className="medicine-timing-wrapper d-flex">
                    {timingLabels.map((label, pos) => (
                      <label
                        key={label}
                        className="d-flex align-items-center gap-2 px-2 py-2 rounded-pill"
                      >
                        <input
                          type="checkbox"
                          checked={getTimingArray(med.medicine_timing)[pos] === 1}
                          onChange={() => handleTimingCheckboxChange(index, pos)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Notes"
                    value={med.notes}
                    onChange={(e) => handleNotesChange(e.target.value, index)}
                  />
                </div>
                <div className="col-md-2 d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="bg-soft-primary text-primary rounded-circle"
                    style={{ fontSize: "18px", border: "none", width: "34px", height: "34px", transition: "background-color 0.2s ease" }}
                  >
                    <FiPlus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    className="bg-soft-danger text-danger rounded-circle"
                    style={{ fontSize: "18px", border: "none", width: "34px", height: "34px", transition: "background-color 0.2s ease" }}
                    disabled={formData.medicines.length === 1}
                  >
                    <FiMinus size={16} />
                  </button>
                </div>
              </div>
            ))}

            {formData.vaccines?.length > 0 && (
              <>
                <h5 className="mb-2">Vaccines</h5>
                {formData.vaccines.map((vac, index) => (
                  <div key={index} className="row align-items-center g-2 mb-2">
                    <div className="col-md-4">
                      <ReactSelect
                        options={vaccineOptions}
                        value={vaccineOptions.find(opt => opt.label === vac.vaccine_name) || null}
                        onChange={(option) => handleVaccineChange(option, index)}
                        placeholder="Select Vaccine"
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Notes"
                        value={vac.notes || ""}
                        onChange={(e) => handleVaccineNotesChange(e.target.value, index)}
                      />
                    </div>
                    <div className="col-md-2 d-flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddVaccine}
                        className="bg-soft-primary text-primary rounded-circle"
                        style={{ fontSize: "18px", border: "none", width: "34px", height: "34px", transition: "background-color 0.2s ease" }}
                      >
                        <FiPlus size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveVaccine(index)}
                        className="bg-soft-danger text-danger rounded-circle"
                        style={{ fontSize: "18px", border: "none", width: "34px", height: "34px", transition: "background-color 0.2s ease" }}
                        disabled={formData.vaccines.length === 1}
                      >
                        <FiMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {(formData.tests?.length > 0) && (
              <>
                <h5 className="mb-2">Lab Tests</h5>
                {formData.tests.map((test, index) => (
                  <div key={index} className="row align-items-center g-2 mb-2">
                    <div className="col-md-4">
                      <ReactSelect
                        options={testOptions}
                        value={testOptions.find(opt => opt.label === test.test_name) || null}
                        onChange={(option) => handleTestChange(option, index)}
                        placeholder="Select Lab Test"
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Notes"
                        value={test.notes || ""}
                        onChange={(e) => handleTestNotesChange(e.target.value, index)}
                      />
                    </div>
                    <div className="col-md-2 d-flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddTest}
                        className="bg-soft-primary text-primary rounded-circle"
                        style={{ fontSize: "18px", border: "none", width: "34px", height: "34px", transition: "background-color 0.2s ease" }}
                      >
                        <FiPlus size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(index)}
                        className="bg-soft-danger text-danger rounded-circle"
                        style={{ fontSize: "18px", border: "none", width: "34px", height: "34px", transition: "background-color 0.2s ease" }}
                        disabled={formData.tests.length === 1}
                      >
                        <FiMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* <div className="mb-4">
              <label className="form-label">Doctor's Signature</label>
              <div className="mb-2 d-flex">
                <button type="button" className={`btn btn-sm ${drawMode ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setDrawMode(true)}>Draw</button>
                <button type="button" className={`btn btn-sm ${!drawMode ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setDrawMode(false)}>Upload</button>
              </div>
              {drawMode ? (
                <div>
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={100}
                    style={{ border: '1px solid #ccc', borderRadius: 4, cursor: 'crosshair' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="mt-2">
                    <button type="button" className="btn btn-sm btn-secondary me-2" onClick={clearCanvas}>Clear</button>
                  </div>
                </div>
              ) : (
                <>
                  <input type="file" accept="image/*" className="px-0" onChange={handleImageUpload} />
                </>
              )}
              <div className="mt-2">
                <label className="form-label">Preview:</label>
                {drawMode && signature && <img src={signature} alt="Signature Preview" style={{ maxWidth: 200, maxHeight: 80, display: 'block', border: '1px solid #eee' }} />}
                {!drawMode && uploadedImage && <img src={uploadedImage} alt="Signature Preview" style={{ maxWidth: 200, maxHeight: 80, display: 'block', border: '1px solid #eee' }} />}
                {!drawMode && !uploadedImage && signature && <img src={signature} alt="Signature Preview" style={{ maxWidth: 200, maxHeight: 80, display: 'block', border: '1px solid #eee' }} />}
              </div>
            </div> */}
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSaveChanges} className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPrescriptionModal;