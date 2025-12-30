import React from "react";
import { MedidcinesMenu } from "./MedicinesMenu";

const MedidcineSidebarMenu = ({ activeTab, setActiveTab }) => (
  <aside className="clinic-sidebar">
    <div className="sidebar-heading">Manage Medicines</div>
    {MedidcinesMenu.map((item) => (
      <button
        key={item.id}
        className={`clinic-menu-item ${activeTab === item.id ? "active" : ""}`}
        onClick={() => setActiveTab(item.id)}
      >
        {item.label}
      </button>
    ))}
  </aside>
);

export default MedidcineSidebarMenu;
