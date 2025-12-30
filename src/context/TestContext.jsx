import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const TestContext = createContext();
export const useTests = () => useContext(TestContext);

export const TestProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://bkdemo1.clinicpro.cc";

  // ----------------- CATEGORY API -----------------

  // Add new test category
  const addCategory = async (categoryData) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        throw new Error("No authentication token available");
      }

      console.log("Token found", token);
      const res = await axios.post(`${API_URL}/tests/categories/add`, categoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      });
      setCategories((prev) => [...prev, res.data]);
      toast.success("Category added successfully!");
      return res.data;
    } catch (err) {
      console.error("Error adding category:", err);
      // Handle specific error cases
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        // Optional: Redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to add categories.");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
      toast.error("Failed to add category");
      }
      throw err;
    }
  };

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/tests/categories`);
      setCategories(res.data || []);
      return res.data;
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw err;
    }
  };

  // Update category
  const updateCategory = async (categoryId, updatedData) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        throw new Error("No authentication token available");
      }

      console.log("Token found", token);
      const res = await axios.put(`${API_URL}/tests/update-categories/${categoryId}`, updatedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? res.data : c))
      );
      toast.success("Category updated successfully!");
      return res.data;
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error("Failed to update category");
      throw err;
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        throw new Error("No authentication token available");
      }

      console.log("Token found", token);
      await axios.delete(`${API_URL}/tests/delete-categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      });
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success("Category deleted successfully!");
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category");
      throw err;
    }
  };

  // ----------------- LAB TEST API -----------------

  // Add new lab test
  const addTest = async (testData) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        throw new Error("No authentication token available");
      }
      const res = await axios.post(`${API_URL}/tests/add-test`, testData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      });
      setTests((prev) => [...prev, res.data]);
      toast.success("Lab test added successfully!");
      return res.data;
    } catch (err) {
      console.error("Error adding lab test:", err);
      toast.error("Failed to add lab test");
      throw err;
    }
  };

  // Fetch tests by speciality
  const fetchTestsBySpeciality = async (specialityId) => {
    try {
      const res = await axios.get(`${API_URL}/tests/speciality/${specialityId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching tests by speciality:", err);
      throw err;
    }
  };

  // Fetch tests by category
  const fetchTestsByCategory = async (categoryId) => {
    try {
      const res = await axios.get(`${API_URL}/tests/category/${categoryId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching tests by category:", err);
      throw err;
    }
  };

  // Update test
  const updateTest = async (testData) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        throw new Error("No authentication token available");
      }
      const res = await axios.put(`${API_URL}/tests/update-test`, testData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      });
      setTests((prev) =>
        prev.map((t) => (t.id === testData.id ? res.data : t))
      );
      toast.success("Lab test updated successfully!");
      return res.data;
    } catch (err) {
      console.error("Error updating test:", err);
      toast.error("Failed to update lab test");
      throw err;
    }
  };

  // Delete test
  const deleteTest = async (testId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        throw new Error("No authentication token available");
      }
      await axios.delete(`${API_URL}/tests/delete-test/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      });
      setTests((prev) => prev.filter((t) => t.id !== testId));
      toast.success("Lab test deleted successfully!");
    } catch (err) {
      console.error("Error deleting test:", err);
      toast.error("Failed to delete lab test");
      throw err;
    }
  };

  // Auto-fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <TestContext.Provider
      value={{
        categories,
        tests,
        loading,
        addCategory,
        fetchCategories,
        updateCategory,
        deleteCategory,
        addTest,
        fetchTestsBySpeciality,
        fetchTestsByCategory,
        updateTest,
        deleteTest,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};
