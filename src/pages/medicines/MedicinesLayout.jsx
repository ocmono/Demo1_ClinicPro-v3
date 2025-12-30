import React from "react";
import MedicinesSidebarMenu from "../Medicines/MedicinesSidebarMenu";

const MedicinesLayout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MedicinesSidebarMenu activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flexGrow: 1, padding: "20px" }}>{children}</main>
    </div>
  );
};

export default MedicinesLayout;
