import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../contentApi/AuthContext";

const ReceptionistContext = createContext();
export const useReceptionist = () => useContext(ReceptionistContext);

export const ReceptionistProvider = ({ children }) => {
  const { token } = useAuth();
  console.log("token added ", token);
  const [receptionists, setReceptionists] = useState([]);

  useEffect(() => {
    fetchReceptionistsFromBackend();
  }, []);

  const fetchReceptionistsFromBackend = async () => {
    try {
      const response = await fetch(`https://bkdemo1.clinicpro.cc/receptionist/list`);
      const data = await response.json();
      setReceptionists(data);
    } catch (error) {
      console.error("Error fetching receptionists:", error);
    }
  };

  const addReceptionist = async (data) => {
    try {
      const response = await fetch(`https://bkdemo1.clinicpro.cc/receptionist/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      // result has receptionist fields + message
      setReceptionists((prev) => [...prev, result]);
      console.log(result.message); // "Receptionist added successfully"
    } catch (error) {
      console.error("Error adding receptionist:", error);
    }
  };

  const editReceptionist = async (id, updatedData) => {
    if (!token) throw new Error("Missing token");

    try {
      const payload = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
      phone: String(updatedData.phone),
      age: String(updatedData.age),
      gender: updatedData.gender,
      status: Boolean(updatedData.status),

      // ✅ SEND NESTED OBJECT (REQUIRED)
      receptionist_profile: {
        address: updatedData.receptionist_profile?.address || "",
        qualification: updatedData.receptionist_profile?.qualification || "",
      }
    };

      console.log("📤 FINAL PAYLOAD:", payload);

      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/receptionist/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        body: JSON.stringify(payload),
      }
    );

      if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

      const updatedReceptionist = await response.json();

      setReceptionists(prev =>
        prev.map(r => (r.id === id ? updatedReceptionist : r))
      );

      return updatedReceptionist;
    } catch (error) {
      console.error("❌ Receptionist update failed:", error);
      throw error;
    }
  };


  const getReceptionistId = async (id) => {
    try {
      const response = await fetch(`https://bkdemo1.clinicpro.cc/receptionist/get/${id}`);
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error fetching receptionist by ID:", errorDetails);
        throw new Error(errorDetails.detail || "Failed to fetch receptionist");
      }
      const receptionist = await response.json();
      return receptionist;
    } catch (error) {
      console.error("Error fetching receptionist:", error);
      throw error;
    }
  }

  const deleteReceptionist = async (id) => {
    try {
      await fetch(`https://bkdemo1.clinicpro.cc/receptionist/delete/${id}`, {
        method: "DELETE",
      });
      setReceptionists((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting receptionist:", error);
    }
  };

  return (
    <ReceptionistContext.Provider
      value={{
        receptionists,
        addReceptionist,
        editReceptionist,
        deleteReceptionist,
        getReceptionistId,
        fetchReceptionistsFromBackend,
      }}
    >
      {children}
    </ReceptionistContext.Provider>
  );
};
