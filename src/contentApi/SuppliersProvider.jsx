import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SuppliersContext = createContext();
const API_URL = "https://bkdemo1.clinicpro.cc/products";

export const SuppliersProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/suppliers`);
      setSuppliers(res.data || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplier) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        throw new Error("No authentication token");
      }
      const res = await axios.post(`${API_URL}/add-suppliers`, supplier, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuppliers((prev) => [...prev, res.data]);
      toast.success("Supplier added successfully!");
    } catch (err) {
      console.error("Error adding supplier:", err);
      toast.error("Failed to add supplier");
    }
  };

  const editSupplier = async (id, updated) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        throw new Error("No authentication token");
      }
      const res = await axios.put(`${API_URL}/edit-suppliers/${id}`, updated, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? res.data : s))
      );
      toast.success("Supplier updated successfully!");
    } catch (err) {
      console.error("Error editing supplier:", err);
      toast.error("Failed to update supplier");
    }
  };

  const deleteSupplier = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        throw new Error("No authentication token");
      }
      await axios.delete(`${API_URL}/delete-suppliers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Supplier deleted successfully!");
    } catch (err) {
      console.error("Error deleting supplier:", err);
      toast.error("Failed to delete supplier");
    }
  };

  const getSupplier = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/get-suppliers/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching supplier:", err);
      // toast.error("Failed to fetch supplier details");
      return null;
    }
  };

  return (
    <SuppliersContext.Provider
      value={{
        suppliers,
        loading,
        fetchSuppliers,
        addSupplier,
        editSupplier,
        deleteSupplier,
        getSupplier,
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
};

export const useSuppliers = () => useContext(SuppliersContext);
