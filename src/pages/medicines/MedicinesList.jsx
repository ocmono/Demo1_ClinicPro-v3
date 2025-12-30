import React, { useState, useRef } from "react";
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CardHeader from "@/components/shared/CardHeader";
import CardLoader from "@/components/shared/CardLoader";
import useCardTitleActions from "@/hooks/useCardTitleActions";
import { useMedicines } from "../../context/MedicinesContext";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { FiPrinter, FiRefreshCw } from "react-icons/fi";
import Dropdown from "@/components/shared/Dropdown";
import { useAuth } from "../../contentApi/AuthContext";
import "./css/MedicinesList.css";

const MedicinesList = ({ onAddClick }) => {
  const { medicines, editMedicine, deleteMedicine } = useMedicines();
  const { user } = useAuth();
  const safeMedicines = Array.isArray(medicines) ? medicines : [];
  const printRef = useRef();
  const tableContainerRef = useRef();

  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Define roles that can add medicines
  const canAddMedicineRoles = ["super_admin", "clinic_admin", "doctor", "receptionist"];
  
  // Define roles that can print
  const canPrintRoles = ["super_admin", "clinic_admin", "doctor", "receptionist", "pharmacist"];

  // Define roles that can edit and delete medicines
  const canManageMedicineRoles = ["super_admin", "clinic_admin", "doctor", "receptionist", "pharmacist"];
  
  // Check permissions
  const canAddMedicine = user && canAddMedicineRoles.includes(user.role);
  const canPrint = user && canPrintRoles.includes(user.role);
  const canManageMedicine = user && canManageMedicineRoles.includes(user.role);

  const {
    refreshKey,
    isRemoved,
    isExpanded,
    handleRefresh,
    handleExpand,
    handleDelete,
  } = useCardTitleActions();

  if (isRemoved) return null;

  const handlePrint = () => {
    if (!canPrint) return;
    
    const printContents = printRef.current;
    const clonedTable = printContents.cloneNode(true);

    Array.from(clonedTable.querySelectorAll("tr")).forEach((row) => {
      if (row.cells.length > 0) {
        row.deleteCell(row.cells.length - 1);
      }
    });

    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Print Medicines</title>");
    printWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .variations-table { margin: 0 auto; border-collapse: collapse; }
        .variations-table th, 
        .variations-table td { border: 1px solid #ccc; padding: 4px; }
      </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(clonedTable.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleEdit = (index) => {
    if (!canManageMedicine) return;
    setEditIndex(index);
    setEditForm({ ...safeMedicines[index] });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariationChange = (vIndex, field, value) => {
    const updatedVariations = [...editForm.variations];
    updatedVariations[vIndex][field] = value;
    setEditForm((prev) => ({ ...prev, variations: updatedVariations }));
  };

  const saveEdit = () => {
    if (!canManageMedicine) return;
    editMedicine(editIndex, editForm);
    setEditIndex(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditForm(null);
  };

  // Build action options based on permissions
  const getActionOptions = () => {
    if (!canManageMedicine) return [];
    return [
      { icon: <FaEdit />, label: "Edit" },
      { icon: <FaTrash />, label: "Delete" },
    ];
  };

  return (
    <><PageHeader />
            <div className='main-content'><div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
      <CardHeader
        title="Medicines List"
        children={<div className="medicines-controls">
          <button
            className="medicines-btn medicines-no-print"
            onClick={handleRefresh}
            title="Refresh List"
          >
            <FiRefreshCw size={20} />
          </button>
          {canPrint && (
            <button
              className="medicines-btn medicines-no-print"
              onClick={handlePrint}
              title="Print Medicines"
            >
              <FiPrinter size={20} />
            </button>
          )}
          {canAddMedicine && (
            <button
              className="medicines-add-btn medicines-no-print"
              onClick={onAddClick}
            >
              + Add Medicine
            </button>
          )}
        </div>} />
      <div className="card-body">
        <div ref={tableContainerRef} className="medicines-table-wrapper">
          <table className="table medicines-table table-striped table-bordered" ref={printRef}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Variations</th>
                {canManageMedicine && <th className="medicines-no-print">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {safeMedicines.length === 0 ? (
                <tr>
                  <td colSpan={canManageMedicine ? "5" : "4"} className="medicines-no-data">
                    No medicines added yet.
                  </td>
                </tr>
              ) : (
                safeMedicines.map((medicine, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {editIndex === index ? (
                        <input
                          type="text"
                          className="medicines-input"
                          value={editForm.name}
                          onChange={(e) => handleEditChange("name", e.target.value)} />
                      ) : (
                        medicine.name
                      )}
                    </td>
                    <td>
                      {editIndex === index ? (
                        <input
                          type="text"
                          className="medicines-input"
                          value={editForm.brand}
                          onChange={(e) => handleEditChange("brand", e.target.value)} />
                      ) : (
                        medicine.brand
                      )}
                    </td>
                    <td>
                      {Array.isArray(medicine.variations) && medicine.variations.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                          <table className="variations-table">
                            <thead>
                              <tr>
                                <th>SKU</th>
                                <th>Qty</th>
                                <th>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(editIndex === index ? editForm.variations : medicine.variations).map(
                                (v, vIndex) => (
                                  <tr key={vIndex}>
                                    <td>
                                      {editIndex === index ? (
                                        <input
                                          type="text"
                                          className="medicines-input"
                                          value={v.sku}
                                          onChange={(e) => handleVariationChange(vIndex, "sku", e.target.value)} />
                                      ) : (
                                        v.sku
                                      )}
                                    </td>
                                    <td>
                                      {editIndex === index ? (
                                        <div style={{ display: "flex", gap: "4px" }}>
                                          <input
                                            type="text"
                                            className="medicines-input"
                                            value={v.quantity}
                                            onChange={(e) => handleVariationChange(vIndex, "quantity", e.target.value)} />
                                          <select
                                            className="medicines-select"
                                            value={v.unit || ""}
                                            onChange={(e) => handleVariationChange(vIndex, "unit", e.target.value)}
                                          >
                                            <option value="">Unit</option>
                                            <option value="mg">mg</option>
                                            <option value="g">g</option>
                                            <option value="ml">ml</option>
                                            <option value="tablet">Tablet</option>
                                            <option value="capsule">Capsule</option>
                                          </select>
                                        </div>
                                      ) : (
                                        <span>
                                          {v.quantity}
                                          {v.unit && <span style={{ marginLeft: "4px" }}>({v.unit})</span>}
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      {editIndex === index ? (
                                        <input
                                          type="text"
                                          className="medicines-input"
                                          value={v.price}
                                          onChange={(e) => handleVariationChange(vIndex, "price", e.target.value)} />
                                      ) : (
                                        v.price
                                      )}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <i>No variations</i>
                      )}
                    </td>
                    {canManageMedicine && (
                      <td className="medicines-no-print">
                        {editIndex === index ? (
                          <div className="medicines-edit-actions">
                            <button
                              className="medicines-save-btn"
                              onClick={saveEdit}
                              title="Save"
                            >
                              <FaCheck size={14} />
                            </button>
                            <button
                              className="medicines-cancel-btn"
                              onClick={cancelEdit}
                              title="Cancel"
                            >
                              <FaTimes size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="medicines-action-dropdown">
                            <Dropdown
                              dropdownItems={getActionOptions()}
                              triggerClass="medicines-dropdown-trigger"
                              onClick={(actionLabel) => {
                                if (actionLabel === "Edit") {
                                  handleEdit(index);
                                } else if (actionLabel === "Delete" && canManageMedicine) {
                                  deleteMedicine(index);
                                }
                              } } />
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CardLoader refreshKey={refreshKey} />
    </div></div>
    
    
    </>
  );
};

export default MedicinesList;
