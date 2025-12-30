import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ManufacturersContext = createContext();
const API_URL = "https://bkdemo1.clinicpro.cc/products";

export const ManufacturersProvider = ({ children }) => {
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all manufacturers on mount
    useEffect(() => {
        fetchManufacturers();
    }, []);

    const fetchManufacturers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/manufacturers`);
            setManufacturers(res.data || []);
        } catch (err) {
            console.error("Error fetching manufacturers:", err);
            // toast.error("Failed to load manufacturers");
        } finally {
            setLoading(false);
        }
    };

    const addManufacturer = async (manufacturer) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Authentication token not found. Please login again.");
                throw new Error("No authentication token");
            }
            const res = await axios.post(`${API_URL}/add-manufacturer`, manufacturer, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setManufacturers((prev) => [...prev, res.data]);
            toast.success("Manufacturer added successfully!");
            return res.data;
        } catch (err) {
            console.error("Error adding manufacturer:", err);
            toast.error("Failed to add manufacturer");
            throw err;
        }
    };

    const editManufacturer = async (id, updated) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Authentication token not found. Please login again.");
                throw new Error("No authentication token");
            }
            const res = await axios.put(`${API_URL}/edit-manufacturer/${id}`, updated, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setManufacturers((prev) =>
                prev.map((m) => (m.id === id ? res.data : m))
            );
            toast.success("Manufacturer updated successfully!");
            return res.data;
        } catch (err) {
            console.error("Error editing manufacturer:", err);
            toast.error("Failed to update manufacturer");
            throw err;
        }
    };

    const deleteManufacturer = async (id) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                toast.error("Authentication token not found. Please login again.");
                throw new Error("No authentication token");
            }
            await axios.delete(`${API_URL}/delete-manufacturer/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setManufacturers((prev) => prev.filter((m) => m.id !== id));
            toast.success("Manufacturer deleted successfully!");
        } catch (err) {
            console.error("Error deleting manufacturer:", err);
            toast.error("Failed to delete manufacturer");
            throw err;
        }
    };

    const getManufacturer = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/get-manufacturer/${id}`);
            return res.data;
        } catch (err) {
            console.error("Error fetching manufacturer:", err);
            // toast.error("Failed to fetch manufacturer details");
            return null;
        }
    };

    return (
        <ManufacturersContext.Provider
            value={{
                manufacturers,
                loading,
                fetchManufacturers,
                addManufacturer,
                editManufacturer,
                deleteManufacturer,
                getManufacturer,
            }}
        >
            {children}
        </ManufacturersContext.Provider>
    );
};

export const useManufacturers = () => useContext(ManufacturersContext);