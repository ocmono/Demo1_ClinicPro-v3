import React from 'react';

const Vitals = () => {
  return (
    <>
      {/* Vital Signs Section */}
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
          Vital Signs
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Temperature: 98.6°F</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Heart Rate: 72 bpm</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Blood Pressure: 120/80</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Weight: 70 kg</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Vitals;