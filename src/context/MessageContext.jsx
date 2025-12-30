import React, { createContext, useContext, useState, useEffect } from "react";

const MessageContext = createContext();

const FIXED_FIELDS = ["name", "doctor", "status", "date", "time"];

export const MessageProvider = ({ children }) => {
  const [whatsappTemplate, setWhatsappTemplate] = useState({
    message: "",
    fields: FIXED_FIELDS,
  });
  const [followupTemplate, setFollowupTemplate] = useState({
    message: "",
    fields: FIXED_FIELDS,
  });

  const [loading, setLoading] = useState({
    whatsapp: true,
    followup: true,
    updatingWhatsapp: false,
    updatingFollowup: false,
  });

  const [error, setError] = useState({
    whatsapp: null,
    followup: null,
  });

  const fetchTemplate = async (type) => {
    const endpoint =
      type === "whatsapp"
        ? "https://bkdemo1.clinicpro.cc/templates/get-whatsapp"
        : "https://bkdemo1.clinicpro.cc/templates/get-followup";

    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      setError((prev) => ({ ...prev, [type]: null }));

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch template");

      const data = await response.json();

      // Instead of extracting fields from message, set fixed fields
      data.fields = FIXED_FIELDS;

      if (type === "whatsapp") {
        setWhatsappTemplate(data);
      } else {
        setFollowupTemplate(data);
      }
    } catch (err) {
      setError((prev) => ({ ...prev, [type]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const updateTemplate = async (type, newTemplate) => {
    const endpoint =
      type === "whatsapp"
        ? "https://bkdemo1.clinicpro.cc/templates/update-whatsapp"
        : "https://bkdemo1.clinicpro.cc/templates/update-followup";

    try {
      const key = `updating${type.charAt(0).toUpperCase() + type.slice(1)}`;
      setLoading((prev) => ({ ...prev, [key]: true }));
      setError((prev) => ({ ...prev, [type]: null }));

      // Always use fixed fields here as well
      const fields = FIXED_FIELDS;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTemplate, fields }),
      });

      if (!response.ok) throw new Error("Failed to update template");

      const updated = await response.json();
      // Assign fixed fields again
      updated.fields = FIXED_FIELDS;

      if (type === "whatsapp") setWhatsappTemplate(updated);
      else setFollowupTemplate(updated);

      return true;
    } catch (err) {
      setError((prev) => ({ ...prev, [type]: err.message }));
      return false;
    } finally {
      const key = `updating${type.charAt(0).toUpperCase() + type.slice(1)}`;
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    fetchTemplate("whatsapp");
    fetchTemplate("followup");
  }, []);

  return (
    <MessageContext.Provider
      value={{
        whatsappTemplate,
        followupTemplate,
        updateWhatsappTemplate: (t) => updateTemplate("whatsapp", t),
        updateFollowupTemplate: (t) => updateTemplate("followup", t),
        fetchWhatsappTemplate: () => fetchTemplate("whatsapp"),
        fetchFollowupTemplate: () => fetchTemplate("followup"),
        loading,
        error,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);
