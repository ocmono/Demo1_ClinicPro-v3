import React from 'react';

const renderDiagnosis = (diagnosis) => {
  if (!diagnosis) return "—";

  // If array of diagnosis objects
  if (Array.isArray(diagnosis)) {
    return diagnosis.map((d, index) => (
      <div key={index}>
        • {d.diagnosis} {d.duration ? `(${d.duration})` : ""}
      </div>
    ));
  }

  // If single diagnosis object
  if (typeof diagnosis === "object") {
    return `${diagnosis.diagnosis || "—"} ${diagnosis.duration ? `(${diagnosis.duration})` : ""
      }`;
  }

  // If already string
  return diagnosis;
};

const Overview = ({ formData, renderField, bloodGroups, patientStats, handleViewAllAppointments, handleViewAllPrescriptions }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      // Format: dd-mm-yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };
  return (
    <>
      {/* Basic Information Section */}
      <div
        style={{
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: `1px dashed #e2e8f0`,
        }}
      >
        <h3
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#64748b",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Basic Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {renderField("Name", "name", "text", [], true)}
          {renderField(
            "Gender",
            "gender",
            "select",
            ["Male", "Female", "Other"],
            true
          )}
          {renderField("Date of Birth", "dob", "date", [], false)}
          {renderField("Age", "age", "text", [], true)}
          {renderField("Email", "email", "email", [], true)}
          {renderField("Contact", "contact", "tel", [], true)}
          {renderField("Address", "address")}
          {renderField("Weight (kg)", "weight", "number")}
          {renderField("Blood Group", "bloodGroup", "select", bloodGroups)}
        </div>
      </div>


      <div
        style={{
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: `1px dashed #e2e8f0`,
          display: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
            position: "relative",
            minHeight: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#64748b",
              minWidth: "120px",
              flexShrink: 0,
            }}
          >
            Date of Birth:
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#1e293b",
              fontWeight: "500",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minWidth: 0,
              gap: "8px",
            }}
          >
            <span style={{ flex: 1, minWidth: 0, wordBreak: "break-word", lineHeight: "1.4" }}>
              {formData.dob ? formatDate(formData.dob) :
                <span style={{ color: "#64748b", fontStyle: "italic" }}>Not specified</span>
              }
            </span>
          </div>
        </div>
      </div>
      {/* Allergies Section */}
      <div
        style={{
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: `1px dashed #e2e8f0`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
            position: "relative",
            minHeight: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#64748b",
              minWidth: "120px",
              flexShrink: 0,
            }}
          >
            Allergies:
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#1e293b",
              fontWeight: "500",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minWidth: 0,
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
              {formData.allergies.length > 0 ? (
                formData.allergies.map((allergy, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#ffa21d",
                      color: "#d13b4c",
                      padding: "4px 8px",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      borderRadius: "8px",
                    }}
                  >
                    {allergy}
                  </div>
                ))
              ) : (
                <span style={{ color: "#64748b", fontStyle: "italic" }}>
                  No allergies recorded
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Statistics Section */}
      <div
        style={{
          marginBottom: "0px",
          paddingBottom: "0px",
        }}
      >
        <h3
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#64748b",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Patient Statistics
        </h3>
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          {/* Appointment Count */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "140px" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#17c666" }}>
              {patientStats.appointmentCount}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Appointments
            </span>
          </div>

          {/* Prescription Count */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "140px" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#3dc7be" }}>
              {patientStats.prescriptionCount}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Prescriptions
            </span>
          </div>
        </div>

        {/* Last Appointment */}
        {patientStats.lastAppointment && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px",
              backgroundColor: "#ffffff",
              borderRadius: "4px",
              border: `1px solid #e2e8f0`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>
                Last Appointment:
              </span>
              <button
                onClick={handleViewAllAppointments}
                style={{
                  background: "#17c666",
                  color: "#ffffff",
                  border: "none",
                  padding: "4px 8px",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
              >
                View All Appointments
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "100px" }}>
                <span style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "500" }}>
                  {new Date(patientStats.lastAppointment.date).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "80px" }}>
                <span style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "500" }}>
                  {patientStats.lastAppointment.time}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "120px" }}>
                <span style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "500" }}>
                  {patientStats.lastAppointment.doctor}
                </span>
              </div>
              <span
                style={{
                  padding: "2px 6px",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  backgroundColor:
                    patientStats.lastAppointment.status === "Done" ? "#17c666" :
                      patientStats.lastAppointment.status === "Accepted" ? "#3dc7be" :
                        patientStats.lastAppointment.status === "Pending" ? "#ffa21d" :
                          "#d13b4c",
                  color: "#ffffff",
                  borderRadius: "8px",
                }}
              >
                {patientStats.lastAppointment.status}
              </span>
            </div>
          </div>
        )}

        {/* Last Prescription */}
        {patientStats.lastPrescription && (
          <div
            style={{
              padding: "10px",
              backgroundColor: "#ffffff",
              borderRadius: "4px",
              border: `1px solid #e2e8f0`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b" }}>
                Last Prescription:
              </span>
              <button
                onClick={handleViewAllPrescriptions}
                style={{
                  background: patientStats.lastPrescription && patientStats.lastPrescription.id
                    ? "#3454d1"
                    : "#6b7885",
                  color: "#ffffff",
                  border: "none",
                  padding: "4px 8px",
                  fontSize: "0.7rem",
                  cursor: patientStats.lastPrescription && patientStats.lastPrescription.id
                    ? "pointer"
                    : "not-allowed",
                  borderRadius: "4px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  opacity: patientStats.lastPrescription && patientStats.lastPrescription.id ? 1 : 0.7,
                }}
              >
                {patientStats.lastPrescription && patientStats.lastPrescription.id
                  ? "View All Prescription"
                  : "No Prescription"}
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "100px" }}>
                <span style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "500" }}>
                  {patientStats.lastPrescription.created_at ?
                    new Date(patientStats.lastPrescription.created_at).toLocaleDateString() :
                    "Not available"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "120px" }}>
                <span style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "500" }}>
                  {patientStats.lastPrescription.doctor || "Not specified"}
                </span>
              </div>
              {patientStats.lastPrescription.diagnosis && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "150px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: "500" }}>
                    {renderDiagnosis(patientStats.lastPrescription.diagnosis)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Overview;