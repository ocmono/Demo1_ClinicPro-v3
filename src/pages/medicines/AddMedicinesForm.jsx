import React, { useState } from "react";
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import "./AddMedicinesForm.css";
import CardHeader from "@/components/shared/CardHeader";
import CardLoader from "@/components/shared/CardLoader";
import useCardTitleActions from "@/hooks/useCardTitleActions";
import { toast } from "react-toastify";
import { FiTrash } from "react-icons/fi";
import { useMedicines } from "../../context/MedicinesContext";

const AddMedicinesForm = ({ onClose }) => {
  const { addMedicine } = useMedicines();
  const [medicineForm, setMedicineForm] = useState({
    name: "",
    brand: "",
    variations: [{ sku: "", quantity: "", price: "" }],
  });

  const {
    refreshKey,
    isRemoved,
    isExpanded,
    handleRefresh,
    handleExpand,
    handleDelete,
  } = useCardTitleActions();

  if (isRemoved) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicineForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariationChange = (index, field, value) => {
    const updated = [...medicineForm.variations];
    updated[index][field] = value;
    setMedicineForm((prev) => ({ ...prev, variations: updated }));
  };

  const addVariationRow = () => {
    setMedicineForm((prev) => ({
      ...prev,
      variations: [...prev.variations, { sku: "", quantity: "", price: "" }],
    }));
  };

  const deleteVariationRow = (index) => {
    if (index === 0) return;
    const updated = medicineForm.variations.filter((_, i) => i !== index);
    setMedicineForm((prev) => ({ ...prev, variations: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicineForm.name || !medicineForm.brand) {
      toast.error("Please fill in Medicine Name and Brand");
      return;
    }

    for (const variation of medicineForm.variations) {
      if (!variation.sku || !variation.quantity || !variation.price) {
        toast.error(
          "All variation fields (SKU, Quantity, Price) must be filled."
        );
        return;
      }
    }

    const formattedMedicine = {
      ...medicineForm,
      variations: medicineForm.variations.map((variation) => ({
        ...variation,
        price: parseFloat(variation.price),
        quantity: variation.quantity + (variation.unit || ""), // Combine quantity and unit
      })),
    };

    try {
      await addMedicine(formattedMedicine);
      toast.success("Medicine added!");
      setMedicineForm({
        name: "",
        brand: "",
        variations: [{ sku: "", quantity: "", price: "" }],
      });
    } catch (error) {
      toast.error("Error adding medicine, please try again.");
    }
  };

  return (
    <><PageHeader />
    <div className="add-medicine-container">
      <div
        className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}
      >
        <CardHeader
          title="Add Medicine"
          children={<button
            onClick={onClose}
            style={{
              backgroundColor: "#636bff", // Indigo base color
              color: "white",
              border: "none",
              borderRadius: "50%", // Makes it circular
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginLeft: "auto",
              transition: "background-color 0.3s ease",
              fontWeight: "bold",
              fontSize: "16px",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#4f54cc")} // Darker on hover
            onMouseOut={(e) => (e.target.style.backgroundColor = "#636bff")}
          >
            x
          </button>} />
        <div className="card-body custom-card-action">
          <div className="form-scroll-container">
            <form className="add-medicine-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Medicine Name</label>
                <input
                  type="text"
                  name="name"
                  value={medicineForm.name}
                  onChange={handleChange}
                  placeholder="Enter Medicine Name" />
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={medicineForm.brand}
                  onChange={handleChange}
                  placeholder="Enter Brand Name" />
              </div>

              <div className="availability-section">
                <div className="variation-header">
                  <h3>Variations</h3>
                  <button
                    type="button"
                    onClick={addVariationRow}
                    className="add-variation-btn"
                  >
                    + Add Variation
                  </button>
                </div>

                <div className="variation-table-container">
                  <table className="variation-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicineForm.variations.map((variation, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="text"
                              placeholder="SKU"
                              value={variation.sku}
                              onChange={(e) => handleVariationChange(
                                index,
                                "sku",
                                e.target.value
                              )} />
                          </td>
                          <td style={{ width: "300px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                overflow: "hidden",
                                width: "100%",
                                backgroundColor: "#fff",
                              }}
                            >
                              {/* Quantity Input */}
                              <input
                                type="number"
                                placeholder="Qty"
                                value={variation.quantity}
                                onChange={(e) => handleVariationChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  border: "none",
                                  outline: "none",
                                  fontSize: "14px",
                                }} />

                              {/* Vertical Divider */}
                              <div
                                style={{
                                  width: "1px",
                                  height: "70%",
                                  backgroundColor: "#ccc",
                                }} />

                              {/* Unit Dropdown */}
                              <select
                                value={variation.unit || ""}
                                onChange={(e) => handleVariationChange(
                                  index,
                                  "unit",
                                  e.target.value
                                )}
                                style={{
                                  padding: "10px",
                                  border: "none",
                                  outline: "none",
                                  fontSize: "14px",
                                  backgroundColor: "white",
                                  borderLeft: "1px solid #eee",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="">Unit</option>
                                <option value="mg">mg</option>
                                <option value="gm">gm</option>
                                <option value="ml">ml</option>
                                <option value="tablet">Tablet</option>
                                <option value="capsule">Capsule</option>
                                <option value="drops">Drops</option>
                                <option value="syrup">Syrup</option>
                                <option value="injection">Injection</option>
                              </select>
                            </div>
                          </td>
                          <td>
                            <div className="input-with-symbol-inside">
                              <input
                                type="text"
                                placeholder="Price"
                                value={variation.price}
                                onChange={(e) => handleVariationChange(
                                  index,
                                  "price",
                                  e.target.value
                                )} />
                            </div>
                          </td>
                          <td className="action-cell">
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => deleteVariationRow(index)}
                                style={{
                                  background: "transparent",
                                  border: "1px solid #d11a2a",
                                  color: "#d11a2a", // icon color
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                  padding: "6px",
                                  borderRadius: "4px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FiTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Add Medicine
              </button>
            </form>
          </div>
        </div>
        <CardLoader refreshKey={refreshKey} />
      </div>
    </div></>
  );
};

export default AddMedicinesForm;
