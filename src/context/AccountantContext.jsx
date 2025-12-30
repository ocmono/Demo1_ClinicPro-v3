import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from '../contentApi/AuthContext';

const AccountantContext = createContext();
export const useAccountant = () => useContext(AccountantContext);

export const AccountantProvider = ({ children }) => {
  const [accountants, setAccountants] = useState([]);
  const { token } = useAuth();

  console.log("AccountantProvider token:", token);

  useEffect(() => {
    if (token) {
      fetchAccountantsFromBackend();
    }
  }, [token]);

  const fetchAccountantsFromBackend = async () => {
    try {
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(`https://bkdemo1.clinicpro.cc/accountants/list`, requestConfig);
    console.log("Accountants response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Accountants fetch error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const data = await response.json();
    console.log("Accountants data received:", data);

    // ✅ Ensure it's an array
      setAccountants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching accountants:", error);
      setAccountants([]);
    }
  };


  const addAccountant = async (data) => {
    try {
      console.log("Token being sent:", token);
      if (!token) {
        throw new Error("No authentication token available");
      }

      const transformedData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone.toString(),
        qualification: data.qualification,
        experience: parseInt(data.experience) || 0,
        status: data.status,
      };

      const requestConfig = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transformedData),
      };
      console.log("Request config:", requestConfig);

      const response = await fetch(`https://bkdemo1.clinicpro.cc/accountants/add`, requestConfig);

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Backend error:", errorDetails);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
      }

      const result = await response.json();
      setAccountants((prev) => [...prev, result]);
      console.log(result.message);
      return result;
    } catch (error) {
      console.error("Error adding accountant:", error);
      throw error;
    }
  };

  const editAccountant = async (id, updatedData) => {
    try {
      console.log("Edit Accountant - Token:", token);
      if (!token) {
        throw new Error("No authentication token available");
      }

      const completeData = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
        phone: String(updatedData.phone || ""),
        status: updatedData.status === "Active" || updatedData.status === true,
        qualification: updatedData.accountant_profile?.qualification || null,
        experience: updatedData.accountant_profile?.experience || null,
      };
      console.log("Update payload:", completeData);
      const requestConfig = {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(completeData),
      };
      console.log("Update config:", requestConfig);

      const response = await fetch(`https://bkdemo1.clinicpro.cc/accountants/update/${id}`, requestConfig);

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Validation errors:", errorDetails);
        throw new Error(errorDetails.detail || `HTTP error! status: ${response.status}`);
      }

      const updatedAccountant = await response.json();
      console.log("Update successful:", updatedAccountant);

      setAccountants((prev) =>
        prev.map((a) => (a.id === id ? updatedAccountant : a))
      );
      return updatedAccountant;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const getAccountantId = async (id) => {
    try {
      const response = await fetch(`https://bkdemo1.clinicpro.cc/accountants/get/${id}`);
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error fetching receptionist by ID:", errorDetails);
        throw new Error(errorDetails.detail || "Failed to fetch receptionist");
      }
      const accountant = await response.json();
      return accountant;
    } catch (error) {
      console.error("Error fetching accountant:", error);
      throw error;
    }
  }

  const deleteAccountant = async (id) => {
    try {
      if (!token) {
        throw new Error("No authentication token available");
      }

      const requestConfig = {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };
      console.log("Delete config:", requestConfig);

      const response = await fetch(`https://bkdemo1.clinicpro.cc/accountants/delete/${id}`, requestConfig);

      if (!response.ok) {
        const errorDetails = await response.text();
        console.error("Delete error:", errorDetails);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAccountants((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting accountant:", error);
      throw error;
    }
  };

  return (
    <AccountantContext.Provider
      value={{
        accountants,
        addAccountant,
        editAccountant,
        deleteAccountant,
        fetchAccountantsFromBackend,
        getAccountantId,
      }}
    >
      {children}
    </AccountantContext.Provider>
  );
};