import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { fetchWithAuth } from "../utils/apiErrorHandler";

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "https://bkdemo1.clinicpro.cc/patients";

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${API_URL}/all-patients`);
        const normalized = response.data.map((p) => ({
          id: p.user?.id || p.id,
          name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || "Unknown",
          email: p.user?.email || "",
          contact: p.user?.phone || "",
          age: p.user?.age || "",
          gender: p.user?.gender || "",
          dob: p.user?.dob || "",
          bloodGroup: p.profile?.bloodGroup || "—",
          image_urls: p.profile?.image_urls || "",
          weight: p.profile?.weight || "",
          address: p.profile?.address || "",
          allergies: p.profile?.allergies || "",
          // keep raw in case needed
          raw: p,
        }));
        setPatients(normalized);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching patients:", err);

        // Demo mode fallback - load from session storage
        console.log("API failed, loading demo patients from session storage");
        const demoPatients = JSON.parse(sessionStorage.getItem('demoPatients') || '[]');
        setPatients(demoPatients);
        setLoading(false);
        setError(null); // Clear error for demo mode
      }
    };

    fetchPatients();
  }, []);

  const addPatient = async (patient) => {
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }

      const formData = new FormData();

      // Split full name into first/last
      // const [firstName, ...lastParts] = patient.name.split(" ");
      formData.append("firstName", patient.firstName || "");
      formData.append("lastName", patient.lastName || "");
      formData.append("gender", patient.gender);
      if (patient.dob) {
        formData.append("dob", patient.dob);
      }
      const ageString = `${patient.age} ${patient.ageType || 'years'}`;
      formData.append("age", ageString);
      formData.append("email", patient.email);
      formData.append("phone", patient.contact);

      // Optional profile fields
      formData.append("address", patient.address || "");
      if (patient.weight) formData.append("weight", Number(patient.weight));
      if (patient.bloodGroup) formData.append("bloodGroup", patient.bloodGroup);
      if (patient.allergies?.length > 0) {
        formData.append("allergies", JSON.stringify(patient.allergies));
      }

      // Images
      if (patient.images?.length > 0) {
        patient.images.forEach((file) => {
          formData.append("images", file, file.name);
        });
      }

      console.log("📤 Submitting patient data:", {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.contact || patient.phone,
        age: ageString,
        dob: patient.dob || 'Not provided',
        gender: patient.gender,
        imagesCount: patient.images?.length || 0
      });

      const response = await axios.post(
        `${API_URL}/add-patient`,
        formData,
        {
          headers:
          {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
        }
      );
      console.log("✅ Patient created successfully:", response.data);

      // Normalize immediately so table doesn’t break
      const p = response.data;
      const normalized = {
        id: p.user?.id || p.id,
        name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || "Unknown",
        email: p.user?.email || "",
        contact: p.user?.phone || "",
        age: p.user?.age || "",
        dob: p.profile?.dob || "",
        gender: p.user?.gender || "",
        bloodGroup: p.profile?.bloodGroup || "—",
        weight: p.profile?.weight || "",
        address: p.profile?.address || "",
        allergies: p.profile?.allergies || [],
        raw: p,
      };

      setPatients((prev) => [...prev, normalized]);
      return normalized;
    } catch (err) {
      console.error("Patient creation failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const refreshPatient = async (patientId) => {
    try {
      const response = await axios.get(`${API_URL}/all-patients`);
      const patient = response.data.find(p =>
        (p.user?.id || p.id) === patientId
      );

      if (patient) {
        const normalized = {
          id: patient.user?.id || patient.id,
          name: `${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`.trim() || "Unknown",
          email: patient.user?.email || "",
          contact: patient.user?.phone || "",
          age: patient.user?.age || "",
          gender: patient.user?.gender || "",
          bloodGroup: patient.profile?.bloodGroup || "—",
          image_urls: patient.profile?.image_urls || "",
          weight: patient.profile?.weight || "",
          address: patient.profile?.address || "",
          allergies: patient.profile?.allergies || "",
          images: patient.profile?.image_urls || [],
          raw: patient,
        };

        // Update the specific patient in the patients array
        setPatients(prev =>
          prev.map(p => p.id === patientId ? normalized : p)
        );

        return normalized;
      }
    } catch (err) {
      console.error("Error refreshing patient:", err);
      throw err;
    }
  };

  const updatePatient = async (updatedPatient) => {
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      // Split full name into first and last name
      const [firstName, ...lastParts] = updatedPatient.name.split(" ");
      const lastName = lastParts.join(" ") || "";

      // Prepare FormData for file uploads
      const formData = new FormData();

      // Basic user information
      formData.append("firstName", firstName || "");
      formData.append("lastName", lastName);
      formData.append("email", updatedPatient.email || "");
      formData.append("phone", updatedPatient.contact || "");
      if (updatedPatient.dob) {
        formData.append("dob", updatedPatient.dob);
      }
      const ageString = updatedPatient.age; // Use the exact value from the form
      formData.append("age", ageString);
      formData.append("gender", updatedPatient.gender || "");

      // Profile information
      if (updatedPatient.bloodGroup) formData.append("bloodGroup", updatedPatient.bloodGroup);
      if (updatedPatient.weight) formData.append("weight", Number(updatedPatient.weight));
      if (updatedPatient.address) formData.append("address", updatedPatient.address);

      // Handle allergies
      if (Array.isArray(updatedPatient.allergies)) {
        formData.append("allergies", JSON.stringify(updatedPatient.allergies));
      }

      // Handle images - separate URLs from File objects
      const imageUrls = [];
      const imageFiles = [];

      if (Array.isArray(updatedPatient.images)) {
        updatedPatient.images.forEach((image, index) => {
          if (image instanceof File) {
            // It's a file - append to FormData with the correct field name
            // Use 'images' as the field name (plural) since that's what your backend expects
            formData.append("images", image, image.name);
            imageFiles.push(image);
          } else if (typeof image === 'string') {
            // It's a URL - collect for later
            imageUrls.push(image);
          }
        });
      }

      // Append existing image URLs with the correct field name
      if (imageUrls.length > 0) {
        formData.append("image_urls", JSON.stringify(imageUrls));
      }

      // Debug logging
      console.log("🖼️ Image Upload Debug:", {
        totalImages: updatedPatient.images?.length || 0,
        fileImages: imageFiles.length,
        urlImages: imageUrls.length,
        formDataFields: Array.from(formData.entries()).map(([key, value]) =>
          key === 'images' ? [key, `File: ${value.name}`] : [key, value]
        )
      });

      const response = await axios.put(
        `${API_URL}/update-patient/${updatedPatient.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          },
        }
      );

      // Update local state with normalized data
      const p = response.data;
      const normalized = {
        id: p.user?.id || p.id,
        name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || "Unknown",
        email: p.user?.email || "",
        contact: p.user?.phone || "",
        age: p.user?.age || "",
        dob: p.user?.dob || "",
        gender: p.user?.gender || "",
        bloodGroup: p.profile?.bloodGroup || "—",
        weight: p.profile?.weight || "",
        address: p.profile?.address || "",
        allergies: p.profile?.allergies || [],
        images: p.profile?.image_urls || [],
        raw: p,
      };

      setPatients((prev) =>
        prev.map((patient) => (patient.id === updatedPatient.id ? normalized : patient))
      );

      return normalized;
    } catch (err) {
      console.error("❌ Error updating patient:", err);
      console.error("Error response:", err.response?.data);

      // More specific error handling for image uploads
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message && errorData.message.includes('images')) {
          throw new Error(`Image upload failed: ${errorData.message}`);
        }
      }

      throw err;
    }
  };
  // const deletePatient = async (id) => {
  //   try {
  //     await axios.delete(`${API_URL}/delete-patients/${id}`);
  //     setPatients((prev) => prev.filter((p) => p.id !== id));
  //   } catch (err) {
  //     console.error("Error deleting patient:", err);
  //     throw err;
  //   }
  // };

  // Fetch all patients with their latest doctor & appointment data
  const fetchPatientsWithDoctorData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/patients-with-doctor`);
      return response.data;
    } catch (err) {
      console.error("Error fetching patients with doctor data:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all patients with their scheduled vaccines
  const fetchPatientsWithVaccines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/with-vaccines`);
      return response.data;
    } catch (err) {
      console.error("Error fetching patients with vaccines:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        loading,
        error,
        addPatient,
        updatePatient,
        refreshPatient,
        // deletePatient,
        fetchPatientsWithDoctorData,
        fetchPatientsWithVaccines,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};
