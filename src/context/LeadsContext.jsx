import React, { createContext, useContext, useState, useEffect } from "react";

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all campaigns from backend when component mounts
  useEffect(() => {
    fetchCampaigns();
    fetchLeads();
  }, []);

  // ================= CAMPAIGN OPERATIONS ================= //

  /**
   * Fetches all campaigns from the backend
   */
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/campaigns/all-campaigns`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new campaign to the backend
   * @param {Object} campaign - The campaign data to add
   * @returns {Object} The newly created campaign
   */
  const addCampaign = async (campaign) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/campaigns/add-campaigns`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(campaign),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add campaign");
      }

      const newCampaign = await response.json();
      setCampaigns((prev) => [...prev, newCampaign]);
      return newCampaign;
    } catch (err) {
      setError(err.message);
      console.error("Error adding campaign:", err);
      throw err; // Re-throw for components to handle
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates an existing campaign
   * @param {string} id - The ID of the campaign to update
   * @param {Object} updatedData - The updated campaign data
   * @returns {Object} The updated campaign
   */
  const updateCampaign = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/campaigns/update-campaigns/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update campaign");
      }

      const updatedCampaign = await response.json();
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? updatedCampaign : c))
      );
      return updatedCampaign;
    } catch (err) {
      setError(err.message);
      console.error("Error updating campaign:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a campaign from the backend
   * @param {string} id - The ID of the campaign to delete
   */
  const deleteCampaign = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/campaigns/delete-campaigns/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }

      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      // Also delete associated leads if needed
      setLeads((prev) => prev.filter((l) => l.campaignId !== id));
    } catch (err) {
      setError(err.message);
      console.error("Error deleting campaign:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ================= LEAD OPERATIONS ================= //

  /**
   * Fetches all leads from the backend
   */
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://bkdemo1.clinicpro.cc/leads/all-leads`);
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new lead to the backend
   * @param {Object} lead - The lead data to add
   * @returns {Object} The newly created lead
   */
  const addLead = async (lead) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      const response = await fetch(`https://bkdemo1.clinicpro.cc/leads/add-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...lead,
          campaignId: lead.campaignId.toString(), // Ensure string ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add lead");
      }

      const newLead = await response.json();
      setLeads((prev) => [...prev, newLead]);
      return newLead;
    } catch (err) {
      setError(err.message);
      console.error("Error adding lead:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates an existing lead
   * @param {string} id - The ID of the lead to update
   * @param {Object} updatedData - The updated lead data
   * @returns {Object} The updated lead
   */
  const updateLead = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/leads/update-leads/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            ...updatedData,
            campaignId: updatedData.campaignId.toString(), // Ensure string ID
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lead");
      }

      const updatedLead = await response.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? updatedLead : l)));
      return updatedLead;
    } catch (err) {
      setError(err.message);
      console.error("Error updating lead:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a lead from the backend
   * @param {string} id - The ID of the lead to delete
   */
  const deleteLead = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token found", token ? "Yes" : "No");

      if (!token) {
        throw new Error("No authentication token found.Please login again.")
      }
      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/leads/delete-leads/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete lead");
      }

      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err.message);
      console.error("Error deleting lead:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ================= BULK OPERATIONS ================= //

  /**
   * Bulk import leads
   * @param {Array} leadsArray - Array of lead objects to import
   * @returns {Object} Import result with success and error counts
   */
  const bulkImportLeads = async (leadsArray) => {
    setLoading(true);
    setError(null);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      for (const lead of leadsArray) {
        try {
          const response = await fetch(`https://bkdemo1.clinicpro.cc/leads/add-leads`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              ...lead,
              campaignId: lead.campaignId?.toString() || lead.campaignId,
            }),
          });

          if (response.ok) {
            const newLead = await response.json();
            setLeads((prev) => [...prev, newLead]);
            successCount++;
          } else {
            errorCount++;
            errors.push({ lead, error: "Failed to add lead" });
          }
        } catch (err) {
          errorCount++;
          errors.push({ lead, error: err.message });
        }
      }

      await fetchLeads(); // Refresh leads list
      return { successCount, errorCount, errors };
    } catch (err) {
      setError(err.message);
      console.error("Error in bulk import:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bulk delete leads
   * @param {Array} leadIds - Array of lead IDs to delete
   * @returns {Object} Delete result with success and error counts
   */
  const bulkDeleteLeads = async (leadIds) => {
    setLoading(true);
    setError(null);
    let successCount = 0;
    let errorCount = 0;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      for (const id of leadIds) {
        try {
          const response = await fetch(
            `https://bkdemo1.clinicpro.cc/leads/delete-leads/${id}`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`
              },
            }
          );

          if (response.ok) {
            setLeads((prev) => prev.filter((l) => l.id !== id));
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`Error deleting lead ${id}:`, err);
        }
      }

      return { successCount, errorCount };
    } catch (err) {
      setError(err.message);
      console.error("Error in bulk delete:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Bulk update leads
   * @param {Array} updates - Array of {id, data} objects
   * @returns {Object} Update result with success and error counts
   */
  const bulkUpdateLeads = async (updates) => {
    setLoading(true);
    setError(null);
    let successCount = 0;
    let errorCount = 0;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      for (const { id, data } of updates) {
        try {
          const response = await fetch(
            `https://bkdemo1.clinicpro.cc/leads/update-leads/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                ...data,
                campaignId: data.campaignId?.toString() || data.campaignId,
              }),
            }
          );

          if (response.ok) {
            const updatedLead = await response.json();
            setLeads((prev) => prev.map((l) => (l.id === id ? updatedLead : l)));
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`Error updating lead ${id}:`, err);
        }
      }

      return { successCount, errorCount };
    } catch (err) {
      setError(err.message);
      console.error("Error in bulk update:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LeadsContext.Provider
      value={{
        // State
        campaigns,
        leads,
        loading,
        error,

        // Campaign operations
        fetchCampaigns,
        addCampaign,
        updateCampaign,
        deleteCampaign,

        // Lead operations
        fetchLeads,
        addLead,
        updateLead,
        deleteLead,

        // Bulk operations
        bulkImportLeads,
        bulkDeleteLeads,
        bulkUpdateLeads,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => useContext(LeadsContext);
