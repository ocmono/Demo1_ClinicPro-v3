// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";
// import { toast } from "react-toastify";

// const ConfigureSpeciality = () => {
//   const { specialityId } = useParams();
//   const {
//     fetchSymptoms,
//     symptomsBySpeciality,
//     addSymptom,
//     removeSymptom,
//     updateSymptom,
//     updateSymptomsToBackend,
//   } = useClinicManagement();

//   const [newSymptom, setNewSymptom] = useState("");
//   const [diagnosisInputs, setDiagnosisInputs] = useState({});
//   const [treatmentInputs, setTreatmentInputs] = useState({});

//   // Fetch symptoms on load
//   useEffect(() => {
//     if (specialityId && !isNaN(Number(specialityId))) {
//       fetchSymptoms(specialityId);
//     } else {
//       console.warn("❌ Invalid or missing specialityId:", specialityId);
//     }
//   }, [specialityId]);

//   const symptoms = symptomsBySpeciality[specialityId] || [];
//   useEffect(() => {
//     console.log("📥 Loaded symptoms from backend:", symptoms);
//   }, [symptoms]);
//   const handleAddSymptom = () => {
//     if (!newSymptom.trim()) return;
//     addSymptom(specialityId, newSymptom.trim());
//     console.log("➕ Added Symptom:", newSymptom.trim());
//     toast.success(`Symptom "${newSymptom.trim()}" added.`);
//     setNewSymptom("");
//   };

//   const handleAddDiagnosis = (symptomName, value) => {
//     if (!value.trim()) return;
//     const symptom = symptoms.find((s) => s.name === symptomName);
//     if (!symptom) return;

//     const updated = {
//       ...symptom,
//       diagnosis: [...(symptom.diagnosis || []), value.trim()],
//     };
//     updateSymptom(specialityId, symptomName, updated);
//   };

//   const handleRemoveDiagnosis = (symptomName, index) => {
//     const symptom = symptoms.find((s) => s.name === symptomName);
//     const updated = {
//       ...symptom,
//       diagnosis: symptom.diagnosis.filter((_, i) => i !== index),
//     };
//     updateSymptom(specialityId, symptomName, updated);
//   };

//   const handleAddTreatment = (symptomName, value) => {
//     if (!value.trim()) return;
//     const symptom = symptoms.find((s) => s.name === symptomName);
//     if (!symptom) return;

//     const updated = {
//       ...symptom,
//       treatments: [...(symptom.treatments || []), value.trim()],
//     };
//     updateSymptom(specialityId, symptomName, updated);
//   };

//   const handleRemoveTreatment = (symptomName, index) => {
//     const symptom = symptoms.find((s) => s.name === symptomName);
//     const updated = {
//       ...symptom,
//       treatments: symptom.treatments.filter((_, i) => i !== index),
//     };
//     updateSymptom(specialityId, symptomName, updated);
//   };

//   const handleSave = () => {
//     console.log("📤 Final payload to backend:", {
//       specialityId,
//       symptoms,
//     });
//     updateSymptomsToBackend(specialityId);
//   };

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>Configure Speciality ID: {specialityId}</h2>

//       {/* Add Symptom */}
//       <div style={{ marginBottom: "1rem" }}>
//         <input
//           type="text"
//           placeholder="Enter symptom name"
//           value={newSymptom}
//           onChange={(e) => setNewSymptom(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleAddSymptom()}
//         />
//         <button onClick={handleAddSymptom}>Add Symptom</button>
//       </div>

//       {/* List of Symptoms */}

//       {Array.isArray(symptoms) &&
//         symptoms.map((symptom, index) => (
//           <div
//             key={index}
//             style={{
//               border: "1px solid #ccc",
//               marginBottom: "1rem",
//               padding: "1rem",
//             }}
//           >
//             <h4>
//               {symptom.name}
//               <button
//                 style={{ marginLeft: "1rem", color: "red" }}
//                 onClick={() => removeSymptom(specialityId, symptom.name)}
//               >
//                 ❌ Remove Symptom
//               </button>
//             </h4>

//             {/* Diagnosis */}
//             <div>
//               <strong>Diagnosis:</strong>
//               <ul>
//                 {symptom.diagnosis?.map((d, i) => (
//                   <li key={i}>
//                     {d}{" "}
//                     <button
//                       onClick={() => handleRemoveDiagnosis(symptom.name, i)}
//                     >
//                       ❌
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//               <input
//                 type="text"
//                 placeholder="Add diagnosis"
//                 value={diagnosisInputs[symptom.name] || ""}
//                 onChange={(e) =>
//                   setDiagnosisInputs((prev) => ({
//                     ...prev,
//                     [symptom.name]: e.target.value,
//                   }))
//                 }
//               />
//               <button
//                 onClick={() => {
//                   handleAddDiagnosis(
//                     symptom.name,
//                     diagnosisInputs[symptom.name] || ""
//                   );
//                   setDiagnosisInputs((prev) => ({
//                     ...prev,
//                     [symptom.name]: "",
//                   }));
//                 }}
//               >
//                 ➕ Add
//               </button>
//             </div>

//             {/* Treatments */}
//             <div>
//               <strong>Treatments:</strong>
//               <ul>
//                 {symptom.treatments?.map((t, i) => (
//                   <li key={i}>
//                     {t}{" "}
//                     <button
//                       onClick={() => handleRemoveTreatment(symptom.name, i)}
//                     >
//                       ❌
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//               <input
//                 type="text"
//                 placeholder="Add treatment"
//                 value={treatmentInputs[symptom.name] || ""}
//                 onChange={(e) =>
//                   setTreatmentInputs((prev) => ({
//                     ...prev,
//                     [symptom.name]: e.target.value,
//                   }))
//                 }
//               />
//               <button
//                 onClick={() => {
//                   handleAddTreatment(
//                     symptom.name,
//                     treatmentInputs[symptom.name] || ""
//                   );
//                   setTreatmentInputs((prev) => ({
//                     ...prev,
//                     [symptom.name]: "",
//                   }));
//                 }}
//               >
//                 ➕ Add
//               </button>
//             </div>
//           </div>
//         ))}

//       <button onClick={handleSave}>💾 Save All</button>
//     </div>
//   );
// };

// export default ConfigureSpeciality;
// Version-2
import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit3, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const ConfigureSpeciality = () => {
  const { specialityId } = useParams();
  const {
    fetchSymptoms,
    symptomsBySpeciality,
    addSymptom,
    removeSymptom,
    updateSymptom,
    updateSymptomsToBackend,
    clinicSpecialities,
  } = useClinicManagement();

  const [newSymptom, setNewSymptom] = useState("");
  const [diagnosisInputs, setDiagnosisInputs] = useState({});
  const [treatmentInputs, setTreatmentInputs] = useState({});

  // Fetch symptoms on load
  useEffect(() => {
    if (specialityId && !isNaN(Number(specialityId))) {
      fetchSymptoms(specialityId);
    } else {
      console.warn("❌ Invalid or missing specialityId:", specialityId);
    }
  }, [specialityId]);

  const symptoms = symptomsBySpeciality[specialityId] || [];
  useEffect(() => {
    console.log("📥 Loaded symptoms from backend:", symptoms);
  }, [symptoms]);
  const handleAddSymptom = () => {
    if (!newSymptom.trim()) return;
    addSymptom(specialityId, newSymptom.trim());
    // console.log("➕ Added Symptom:", newSymptom.trim());
    // toast.success(`Symptom "${newSymptom.trim()}" added.`);
    setNewSymptom("");
  };
  const specialityName =
    clinicSpecialities.find((spec) => spec.id === parseInt(specialityId))
      ?.speciality || "Unknown Speciality";

  const handleAddDiagnosis = (symptomName, value) => {
    if (!value.trim()) return;
    const symptom = symptoms.find((s) => s.name === symptomName);
    if (!symptom) return;

    const updated = {
      ...symptom,
      diagnosis: [...(symptom.diagnosis || []), value.trim()],
    };
    updateSymptom(specialityId, symptomName, updated);
  };

  const handleRemoveDiagnosis = (symptomName, index) => {
    const symptom = symptoms.find((s) => s.name === symptomName);
    const updated = {
      ...symptom,
      diagnosis: symptom.diagnosis.filter((_, i) => i !== index),
    };
    updateSymptom(specialityId, symptomName, updated);
  };

  const handleAddTreatment = (symptomName, value) => {
    if (!value.trim()) return;
    const symptom = symptoms.find((s) => s.name === symptomName);
    if (!symptom) return;

    const updated = {
      ...symptom,
      treatments: [...(symptom.treatments || []), value.trim()],
    };
    updateSymptom(specialityId, symptomName, updated);
  };

  const handleRemoveTreatment = (symptomName, index) => {
    const symptom = symptoms.find((s) => s.name === symptomName);
    const updated = {
      ...symptom,
      treatments: symptom.treatments.filter((_, i) => i !== index),
    };
    updateSymptom(specialityId, symptomName, updated);
  };

  const handleSave = () => {
    console.log("📤 Final payload to backend:", {
      specialityId,
      symptoms,
    });
    updateSymptomsToBackend(specialityId);
  };

  const handleRefresh = () => {
    if (specialityId && !isNaN(Number(specialityId))) {
      fetchSymptoms(specialityId);
      setNewSymptom("");
      setDiagnosisInputs({});
      setTreatmentInputs({});
      toast.info("Page data refreshed");
    }
  };

  return (
    <div className="configure-speciality card">
      <div className="content-header">
        <h2>Configure Specialty: {specialityName}</h2>
        <div className="header-actions-combined">
          <input
            type="text"
            placeholder="Enter new symptom"
            value={newSymptom}
            onChange={(e) => setNewSymptom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSymptom()}
          />
          <button className="btn-primary" onClick={handleAddSymptom}>
            Add
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save All Changes
          </button>

          <a href="#" onClick={handleRefresh} className="d-flex">
            <div
              className="avatar-text avatar-md"
              data-bs-toggle="tooltip"
              data-bs-trigger="hover"
              title="Refresh"
            >
              <i>
                <FiRefreshCw />
              </i>
            </div>
          </a>
        </div>
      </div>

      <div className="symptoms-table">
        {Array.isArray(symptoms) &&
          symptoms.map((symptom) => (
            <div className="symptom-card" key={symptom.name}>
              <div className="symptom-header">
                <h3>{symptom.name}</h3>
                <button
                  className="btn-remove"
                  onClick={() => removeSymptom(specialityId, symptom.name)}
                >
                  Remove
                </button>
              </div>

              <div className="symptom-content">
                <div className="diagnosis-section">
                  <h4>Diagnosis</h4>
                  <ul className="items-list">
                    {symptom.diagnosis?.map((d, i) => (
                      <li key={i}>
                        {d}
                        <button
                          className="btn-remove-item"
                          onClick={() => handleRemoveDiagnosis(symptom.name, i)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="input-group input-group-custom">
                    <input
                      type="text"
                      placeholder="Add diagnosis"
                      value={diagnosisInputs[symptom.name] || ""}
                      onChange={(e) =>
                        setDiagnosisInputs((prev) => ({
                          ...prev,
                          [symptom.name]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="btn-add-item"
                      onClick={() => {
                        handleAddDiagnosis(
                          symptom.name,
                          diagnosisInputs[symptom.name] || ""
                        );
                        setDiagnosisInputs((prev) => ({
                          ...prev,
                          [symptom.name]: "",
                        }));
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="treatment-section">
                  <h4>Treatments</h4>
                  <ul className="items-list">
                    {symptom.treatments?.map((t, i) => (
                      <li key={i}>
                        {t}
                        <button
                          className="btn-remove-item"
                          onClick={() => handleRemoveTreatment(symptom.name, i)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="input-group input-group-custom">
                    <input
                      type="text"
                      placeholder="Add treatment"
                      value={treatmentInputs[symptom.name] || ""}
                      onChange={(e) =>
                        setTreatmentInputs((prev) => ({
                          ...prev,
                          [symptom.name]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="btn-add-item"
                      onClick={() => {
                        handleAddTreatment(
                          symptom.name,
                          treatmentInputs[symptom.name] || ""
                        );
                        setTreatmentInputs((prev) => ({
                          ...prev,
                          [symptom.name]: "",
                        }));
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ConfigureSpeciality;
