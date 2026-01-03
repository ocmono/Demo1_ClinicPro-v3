import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../utils/apiErrorHandler";

const PrescriptionContext = createContext();

export const usePrescription = () => {
  return useContext(PrescriptionContext);
};

export const PrescriptionProvider = ({ children }) => {
  // To store filtered patient data
  const [patients, setPatients] = useState([]);

  // Keeping medicines here
  const [medicines, setMedicines] = useState([]);
  // Templates
  const [templates, setTemplates] = useState([]);
  // Add attachments state here
  const [attachments, setAttachments] = useState([]);

  const [prescriptionFormData, setPrescriptionFormData] = useState({
    patient: null,
    symptoms: "",
    diagnosis: "",
    followUpDate: "",
    medicines: [{ medicine: null, notes: "", medicine_timing: "" }],
  });

  const resetPrescriptionForm = () => {
    setPrescriptionFormData({
      patient: null,
      symptoms: "",
      diagnosis: "",
      followUpDate: "", // ✅ Reset it too
      medicines: [
        {
          medicine: null,
          notes: "",
          sku: "",
          medicine_timing: "0-0-0",
        },
      ],
      vaccines: [],
      labTests: []
    });
    setAttachments([]);
  };

  /** ==================================================
   *   Fetch Patient data/name
   * ================================================== */
  // Fetch patients from real appointments API
  const fetchPatientsFromAppointments = async () => {
    try {
      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/patients/patients-with-doctor`
      );
      const data = await response.json();
      console.log("Fetched Patients with Doctors:", data);

      // Map fields properly to match what patientOptions expects (same format as getFilteredPatients)
      const mappedPatients = data.map((patient) => {
        // Extract name from the correct fields - adjust based on your actual API response
        const firstName = patient.firstName || patient.user?.firstName || "";
        const lastName = patient.lastName || patient.user?.lastName || "";
        const patientName = `${firstName} ${lastName}`.trim() || patient.patientName || "Unknown";

        const doctor = patient.doctor || {};
        const doctorName = doctor.firstName && doctor.lastName
          ? `${doctor.firstName} ${doctor.lastName}`.trim()
          : doctor.drName || "Doctor Not Assigned";

        // Map to match patientOptions structure: id, patientId, patientName, patientEmail, patientPhone, patientAge, appointment_date, appointment_time, doctor, doctorId, status, appointmentId
        return {
          id: patient.id,
          patientId: patient.id, // Add patientId to match appointment structure
          patientName: patientName,
          patientEmail: patient.email || patient.patientEmail,
          patientPhone: patient.phone || patient.contact || patient.patientPhone,
          patientAge: patient.age || patient.patientAge,
          gender: patient.gender || "Unknown",
          // Doctor information - using optional chaining for safety
          doctor: doctorName,
          doctorId: patient.doctor ? patient.doctor.id : null,
          doctor_id: patient.doctor ? patient.doctor.id : null, // Keep for backward compatibility
          doctorSlug: patient.doctor?.keyword || "",
          doctorSpeciality: patient.doctor?.drSpeciality || "",
          // Appointment information - map to match appointment structure
          appointment_date: patient.appointment_date || "",
          appointment_time: patient.appointment_time || "",
          appointmentId: patient.appointmentId || null, // If available from API
          status: patient.status || "approved", // Default to approved for regular patients
          // Additional patient information
          bloodGroup: patient.bloodGroup || "Not specified",
          weight: patient.weight || "Not specified",
          address: patient.address || "Not specified",
          allergies:
            Array.isArray(patient.allergies) && patient.allergies.length > 0
              ? patient.allergies.join(", ")
              : "No allergies",
          source: patient.source,
          image_urls: patient.image_urls || [],
          patientdob: patient.dob || "N/A",
          headcircumference: patient?.headcircumference || "N/A",
        };
      });

      setPatients(mappedPatients);
      // toast.success("Fetched real patients successfully!");
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // toast.error("Failed to fetch patients");
    }
  };
  useEffect(() => {
    fetchPatientsFromAppointments();
  }, []);

  /** ==================================================
   *   Fetch Medicines - On component mount
   * ================================================== */
  // const fetchMedicines = async () => {
  //   try {
  //     const res = await fetch("https://bkdemo1.clinicpro.cc/medicine/medicine-list");
  //     if (!res.ok) {
  //       throw new Error("Failed to fetch medicines");
  //     }

  //     const rawData = await res.json();

  //     // Flatten variations into medicine items
  //     const formattedMedicines = rawData.flatMap((medicine) =>
  //       medicine.variations.map((variation) => ({
  //         medicineName: medicine.name,
  //         brand: medicine.brand,
  //         sku: variation.sku,
  //         qnty: variation.quantity,
  //         price: variation.price,
  //         id: variation.id,
  //       }))
  //     );

  //     setMedicines(formattedMedicines);
  //     toast.success("Fetched medicine data successfully!");
  //   } catch (error) {
  //     console.error("Error fetching medicines:", error);
  //     toast.error("Failed to fetch medicine data");
  //   }
  // };

  // useEffect(() => {
  //   fetchMedicines();
  //   // toast.success("Fetched medicine data");
  // }, []);

  /** =================================================================
   *  Prescription Form Field Handlers - Update Prescription formData
   * ================================================================== */

  // Add prescription field updates
  // Handles both single field updates: updatePrescriptionFormField("height", "150")
  // and multiple field updates: updatePrescriptionFormField({ height: "150", weight: "20" })
  const updatePrescriptionFormField = (field, value) => {
    if (typeof field === 'object' && field !== null && value === undefined) {
      // Handle object update: updatePrescriptionFormField({ height: "150", weight: "20" })
      setPrescriptionFormData((prev) => ({ ...prev, ...field }));
    } else {
      // Handle single field update: updatePrescriptionFormField("height", "150")
      setPrescriptionFormData((prev) => ({ ...prev, [field]: value }));
    }
    // toast.info(`Updated ${field} successfully!`); // Show info toast on field update
  };

  const addMedicineRow = () => {
    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicine: null, // Initially empty
          notes: "", // Initially empty
          medicine_timing: "0-0-0",
        },
      ],
    }));
    toast.success("New medicine row added");
  };

  const removeMedicineRow = (sku) => {
    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter(
        (medicineRow) => medicineRow.medicine?.sku !== sku
      ),
    }));
    toast.success("Medicine row removed!");
  };

  const handleTimingChange = (e, sku) => {
    const updatedMedicines = prescriptionFormData.medicines.map(
      (medicineRow) => {
        if (medicineRow.medicine?.sku === sku) {
          return { ...medicineRow, medicine_timing: e.target.value };
        }
        return medicineRow;
      }
    );

    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: updatedMedicines,
    }));
    toast.info("Medicine timing updated successfully!");
  };

  // Create prescription
  const addPrescription = async (payload) => {
    try {
      console.log("Sending prescription payload:", payload);

      const res = await fetchWithAuth("https://bkdemo1.clinicpro.cc/prescription/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("API Error Response:", {
          status: res.status,
          statusText: res.statusText,
          errorData: errorData
        });

        if (res.status === 422) {
          const errorMessage = errorData?.detail || errorData?.message || "Validation error occurred";
          if (Array.isArray(errorData?.detail)) {
            const validationErrors = errorData.detail.map(err =>
              `${err.loc ? err.loc.join('.') : 'Field'}: ${err.msg}`
            ).join(', ');
            throw new Error(`Validation errors: ${validationErrors}`);
          } else {
            throw new Error(errorMessage);
          }
        }

        throw new Error(`Failed to create prescription (${res.status}): ${res.statusText}`);
      }

      const saved = await res.json();
      setAllPrescriptions((prev) => [...prev, saved]);
      toast.success("Prescription added successfully!");
      return saved;
    } catch (error) {
      console.error("Error adding prescription:", error);
      toast.error(`Failed to add prescription: ${error.message}`);
      throw error; // Re-throw to allow handling in the component
    }
  };

  // Update prescription
  const updatePrescription = async (id, payload) => {
    try {
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/prescription/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Update prescription error:", {
          status: res.status,
          statusText: res.statusText,
          errorData: errorData
        });
        throw new Error("Failed to update prescription");
      }
      const updated = await res.json();
      setAllPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      toast.success("Prescription updated successfully!");
      return updated;
    } catch (error) {
      console.error("Error updating prescription:", error);
      toast.error("Failed to update prescription");
      throw error;
    }
  };

  // Delete prescription
  const deletePrescription = async (id) => {
    try {
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/prescription/delete/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete prescription");
      setAllPrescriptions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prescription deleted successfully!");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error("Failed to delete prescription");
    }
  };

  const handleNotesChange = (e, sku) => {
    const updatedMedicines = prescriptionFormData.medicines.map(
      (medicineRow) => {
        if (medicineRow.medicine?.sku === sku) {
          return { ...medicineRow, notes: e.target.value };
        }
        return medicineRow;
      }
    );

    setPrescriptionFormData((prev) => ({
      ...prev,
      medicines: updatedMedicines,
    }));
    toast.info("Notes updated successfully!");
  };
  //allPrescription - page
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  // const fetchAllPrescriptions = async () => {
  //   try {
  //     const response = await fetch("/api/prescriptions"); // Replace with actual route
  //     const data = await response.json();
  //     setAllPrescriptions(data);
  //   } catch (error) {
  //     console.error("Error fetching prescriptions:", error);
  //   }
  // };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/prescription/list"
      );
      const data = await response.json();
      console.log("Fetched prescriptions+++++++++++++++++:", data);
      setAllPrescriptions(Array.isArray(data) ? data : []);
      // toast.success("Prescription list updated!");
    } catch (error) {
      console.error("Error fetching prescription list:", error);
      toast.error("Failed to update prescription list.");
    }
  };

  // Toggle of button
  const [prescriptionFilter, setPrescriptionFilter] = useState("all");

  const fetchTemplates = async () => {
    try {
      const res = await fetchWithAuth("https://bkdemo1.clinicpro.cc/prescription-templates/list");
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      setTemplates(data);
      return data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      // toast.error("Failed to load templates");
    }
  };

  const getTemplateById = async (id) => {
    try {
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/prescription-templates/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch template");
      return await res.json();
    } catch (error) {
      console.error("Error fetching template:", error);
      // toast.error("Failed to load template");
    }
  };

  const createTemplate = async (payload) => {
    try {
      const token = localStorage.getItem("access_token");
      const tokenType = localStorage.getItem("token_type") || "Bearer";
      console.log("Token added", token)
      const res = await fetchWithAuth(
        "https://bkdemo1.clinicpro.cc/prescription-templates/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      console.log("Payload sending:", payload);
      if (!res.ok) throw new Error("Failed to create template");
      const saved = await res.json();
      setTemplates((prev) => [...prev, saved]);
      toast.success("Template created successfully!");
      return saved;
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  const updateTemplate = async (id, payload) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/prescription-templates/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update template");
      const updated = await res.json();
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
      toast.success("Template updated successfully!");
      return updated;
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  const deleteTemplate = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/prescription-templates/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Fix
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete template");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const fetchPrescriptionsByPatientId = async (patientId) => {
    try {
      if (!patientId) {
        console.warn("No patient ID provided for fetching prescriptions");
        return [];
      }

      const response = await fetchWithAuth(
        `https://bkdemo1.clinicpro.cc/patients/${patientId}/prescriptions`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Patient has no prescriptions
          console.log(`No prescriptions found for patient ID: ${patientId}`);
          return [];
        }
        throw new Error("Failed to fetch patient prescriptions");
      }

      const data = await response.json();
      console.log(`Fetched prescriptions for patient ${patientId}:`, data);

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching patient prescriptions:", error);
      // toast.error("Failed to load patient prescriptions");
      return [];
    }
  };

  const getPrescriptionsByPatientId = async (patientId) => {
    return await fetchPrescriptionsByPatientId(patientId);
  };

  return (
    <PrescriptionContext.Provider
      value={{
        medicines,
        setMedicines,
        prescriptionFormData,
        setPrescriptionFormData,
        updatePrescriptionFormField,
        addMedicineRow,
        removeMedicineRow,
        handleNotesChange,
        resetPrescriptionForm,
        patients,
        setPatients,
        allPrescriptions,
        setAllPrescriptions,
        // debouncedFetchPatients,
        handleTimingChange,
        fetchPrescriptions,
        // fetchMedicines,

        prescriptionFilter,
        setPrescriptionFilter,
        templates,
        fetchTemplates,
        getTemplateById,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        addPrescription,
        updatePrescription,
        deletePrescription,
        getPrescriptionsByPatientId,
        fetchPrescriptionsByPatientId,
        fetchPatientsFromAppointments,
        // Add attachments to context
        attachments,
        setAttachments
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};
