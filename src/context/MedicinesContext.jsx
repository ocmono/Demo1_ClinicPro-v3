import React, { createContext, useContext, useState, useEffect } from "react";

const MedicinesContext = createContext();

export const MedicinesProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);

  // Fetch all medicines function (can be called externally)
  const fetchMedicines = async () => {
    try {
      const res = await fetch("https://bkdemo1.clinicpro.cc/products/list");
      const data = await res.json();
      console.log("Fetched medicines response:", data);
      setMedicines(Array.isArray(data) ? data : []);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
      return { success: false, error: err.message };
    }
  };

  // Fetch all medicines on component mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  const addProductVariations = async (productId, variationData) => {
    try {
      const token = localStorage.getItem("access_token");
      const formattedVariationData = {
        ...variationData,
        price: String(variationData.price), // Convert price to string
        stock: parseInt(variationData.stock), // Ensure stock is integer
        unit: variationData.unit || ''
      };

      console.log('Sending variation data:', formattedVariationData);
      const response = await fetch(`https://bkdemo1.clinicpro.cc/products/${productId}/variations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formattedVariationData)
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.log('Error response body:', errorDetails);
        } catch (e) {
          errorDetails = await response.text();
          console.log('Error response text:', errorDetails);
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
      }

      const result = await response.json();
      console.log('Variation added successfully:', result);
      await fetchMedicines();

      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding variation:', error);
      return { success: false, error: error.message };
    }
  };

  // NEW: Get all product variations (without specific product ID)
  const getAllProductVariations = async (filters = {}) => {
    try {
      // Build query parameters if filters are provided
      const queryParams = new URLSearchParams();

      if (filters.product_id) {
        queryParams.append('product_id', filters.product_id);
      }
      if (filters.sku) {
        queryParams.append('sku', filters.sku);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      if (filters.offset) {
        queryParams.append('offset', filters.offset);
      }

      const url = `https://bkdemo1.clinicpro.cc/products/variations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch variations (status ${response.status})`);
      }

      const data = await response.json();
      console.log("Fetched all product variations:", data);

      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (err) {
      console.error("Error fetching all product variations:", err);
      return {
        success: false,
        error: err.message
      };
    }
  };

  // Add medicine to the backend
  const addMedicine = async (newMedicine) => {
    // In the addMedicine function, modify the payload creation:
    const payload = {
      name: newMedicine.name,
      brand: newMedicine.brand,
      variations: newMedicine.variations.map((v) => ({
        sku: String(v.sku || ""),
        quantity: String(v.quantity || ""), // This now includes the unit
        price: String(v.price || ""),
        unit: String(v.unit || ""), // Still keep unit separate if needed
      })),
    };

    console.log("Submitting payload to backend:", payload);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("https://bkdemo1.clinicpro.cc/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Full backend error:", data);
        alert("Error adding medicine: " + (data.detail || "Unknown error"));
        return;
      }

      console.log("Medicine added successfully:", data);
      setMedicines((prev) => [...prev, data]);
    } catch (err) {
      console.error("Error posting medicine:", err);
      alert("Error: " + err.message);
    }
  };

  // Add medicine with new API endpoint
  const addMedicineNew = async (medicineData) => {
    const formattedMedicine = {
      ...medicineData,
      variations: medicineData.variations.map(v => ({
        ...v,
        price: v.price, // Keep price as string
        stock: parseInt(v.stock), // Changed from quantity to stock
        unit: v.unit || ''
      }))
    };

    console.log('Sending data to API:', JSON.stringify(formattedMedicine, null, 2));

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch('https://bkdemo1.clinicpro.cc/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formattedMedicine)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        // Try to get the error details from the response
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.log('Error response body:', errorDetails);
        } catch (e) {
          errorDetails = await response.text();
          console.log('Error response text:', errorDetails);
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
      }

      const result = await response.json();
      console.log('Medicine added successfully:', result);

      // Update local state if needed
      setMedicines((prev) => [...prev, result]);

      return { success: true, data: result };
    } catch (error) {
      console.error('Error adding medicine:', error);
      return { success: false, error: error.message };
    }
  };

  // Get single medicine by ID
  const getMedicine = async (id) => {
    try {
      const response = await fetch(`https://bkdemo1.clinicpro.cc/products/get/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Medicine fetched successfully:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching medicine:', error);
      return { success: false, error: error.message };
    }
  };

  // Edit medicine by ID
  const editMedicine = async (id, medicineData) => {
    const formattedMedicine = {
      ...medicineData,
      variations: medicineData.variations.map(v => ({
        ...v,
        price: v.price, // Keep price as string
        stock: parseInt(v.stock), // Changed from quantity to stock
        unit: v.unit || ''
      }))
    };

    console.log('Updating medicine with data:', JSON.stringify(formattedMedicine, null, 2));

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`https://bkdemo1.clinicpro.cc/products/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formattedMedicine)
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.log('Error response body:', errorDetails);
        } catch (e) {
          errorDetails = await response.text();
          console.log('Error response text:', errorDetails);
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
      }

      const result = await response.json();
      console.log('Medicine updated successfully:', result);

      // Update local state
      setMedicines((prev) => prev.map(medicine =>
        medicine.id === id ? result : medicine
      ));

      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating medicine:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete medicine by ID
  const deleteMedicine = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`https://bkdemo1.clinicpro.cc/products/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.log('Error response body:', errorDetails);
        } catch (e) {
          errorDetails = await response.text();
          console.log('Error response text:', errorDetails);
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
      }

      console.log('Medicine deleted successfully');

      // Remove from local state
      setMedicines((prev) => prev.filter(medicine => medicine.id !== id));

      return { success: true };
    } catch (error) {
      console.error('Error deleting medicine:', error);
      return { success: false, error: error.message };
    }
  };

  // Adjust stock for a medicine variation
  const adjustStock = async (adjustmentData) => {
    const { variation_id, stock_type, quantity, reason } = adjustmentData;

    // Validate required fields
    if (!variation_id || !stock_type || !quantity || !reason) {
      return {
        success: false,
        error: 'Missing required fields: variation_id, stock_type, quantity, and reason are required'
      };
    }

    // Validate stock_type
    if (!['in', 'out'].includes(stock_type)) {
      return {
        success: false,
        error: 'Invalid stock_type. Must be "in" or "out"'
      };
    }

    // Validate quantity
    if (isNaN(quantity) || parseInt(quantity) <= 0) {
      return {
        success: false,
        error: 'Quantity must be a positive number'
      };
    }

    const requestData = {
      variation_id,
      stock_type,
      quantity: parseInt(quantity),
      reason: reason.trim()
    };

    console.log('Adjusting stock with data:', requestData);

    try {
      const response = await fetch('https://bkdemo1.clinicpro.cc/products/stock-adjustment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.log('Error response body:', errorDetails);
        } catch (e) {
          errorDetails = await response.text();
          console.log('Error response text:', errorDetails);
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
      }

      const result = await response.json();
      console.log('Stock adjusted successfully:', result);

      // Refresh medicines data to get updated stock levels
      await fetchMedicines();

      return { success: true, data: result };
    } catch (error) {
      console.error('Error adjusting stock:', error);
      return { success: false, error: error.message };
    }
  };

  // Get stock history for all medicines or specific medicine
  const getStockHistory = async (filters = {}) => {
    console.log('Fetching stock history with filters:', filters);

    try {
      // Build query parameters if filters are provided
      const queryParams = new URLSearchParams();

      if (filters.medicine_id) {
        queryParams.append('medicine_id', filters.medicine_id);
      }
      if (filters.variation_id) {
        queryParams.append('variation_id', filters.variation_id);
      }
      if (filters.stock_type) {
        queryParams.append('stock_type', filters.stock_type);
      }
      if (filters.start_date) {
        queryParams.append('start_date', filters.start_date);
      }
      if (filters.end_date) {
        queryParams.append('end_date', filters.end_date);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit);
      }
      if (filters.offset) {
        queryParams.append('offset', filters.offset);
      }

      const url = `https://bkdemo1.clinicpro.cc/medicine/stock-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
          console.log('Error response body:', errorDetails);
        } catch (e) {
          errorDetails = await response.text();
          console.log('Error response text:', errorDetails);
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
      }

      const result = await response.json();
      console.log("Received stock history variations:", result.map(r => r.variation_id));

      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching stock history:', error);
      return { success: false, error: error.message };
    }
  };

  const getMedicines = async () => {
    try {
      const response = await fetch('https://bkdemo1.clinicpro.cc/products/medicines', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Medicines fetched successfully:', result);

      // Update local state
      setMedicines(Array.isArray(result) ? result : []);

      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching medicines:', error);
      return { success: false, error: error.message };
    }
  };


  return (
    <MedicinesContext.Provider
      value={{
        medicines,
        fetchMedicines,
        addMedicine,
        editMedicine,
        getMedicines,
        deleteMedicine,
        addMedicineNew,
        getMedicine,
        adjustStock,
        getStockHistory,
        addProductVariations,
        getAllProductVariations
      }}
    >
      {children}
    </MedicinesContext.Provider>
  );
};

export const useMedicines = () => useContext(MedicinesContext);
