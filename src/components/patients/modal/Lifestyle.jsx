import React from 'react';

const Lifestyle = () => {
  return (
    <>
      {/* Lifestyle Information Section */}
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
          Lifestyle Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Smoking: No</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Alcohol: Occasional</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Exercise: Regular</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e293b" }}>Diet: Balanced</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lifestyle;