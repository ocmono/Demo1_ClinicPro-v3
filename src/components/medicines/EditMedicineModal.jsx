import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useMedicines } from "../../context/MedicinesContext";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useSuppliers } from '../../contentApi/SuppliersProvider';
import { useManufacturers } from "../../contentApi/ManufacturersProvider";

const ageGroups = [
    'Infant (0-2 years)',
    'Child (3-12 years)',
    'Adolescent (13-17 years)',
    'Adult (18-64 years)',
    'Senior (65+ years)',
    'All Ages'
];

const EditMedicineModal = ({ medicine, onClose, onSave }) => {
    const { editMedicine } = useMedicines();
    const { suppliers } = useSuppliers();
    const { manufacturers } = useManufacturers();
    const [isLoading, setIsLoading] = useState(false);
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [keywordInput, setKeywordInput] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        notes: "",
        status: true,
        keywords: [],
        // supplier_id: "",
        // manufacturer_id: "",
        // Manufacturer fields (for display only)
        manufacturer_name: "",
        manufacturer_contact_person: "",
        manufacturer_email: "",
        manufacturer_phone: "",
        manufacturer_address: "",
        manufacturer_reg_no: "",
        manufacturer_license_no: "",
        manufacturer_website: "",
        mp_certified: false,
        o_certified: false,
        // Vaccine-specific
        vaccine_type: "",
        age_grp: "",
        storage_temperature: "",
        dose_interval: "",
        total_doses: "",
        mandatory: false,
        side_effects: "",
        special_instructions: "",
        // Medicine-specific
        dosage_form: "",
        strength: "",
        treatment_duration: "",
        food_interaction: "",
        precautions: "",
        medicine_type: "",
        medicine_category: "",
        // Variations
        variations: [],
    });

    // Predefined categories including vaccines
    const predefinedCategories = ["Vaccine", "Medicine"];

    useEffect(() => {
        if (medicine) {
            setFormData({
                ...formData,
                ...medicine,
                keywords: medicine.keywords || [],
                variations: medicine.variations?.map(variation => ({
                    ...variation,
                    id: variation.id // Ensure ID is preserved
                })) || [],
            });
        }
        // eslint-disable-next-line
    }, [medicine]);

    const handleAddKeyword = () => {
        if (keywordInput.trim() && !medicineForm.keywords.includes(keywordInput.trim())) {
            setMedicineForm(prev => ({
                ...prev,
                keywords: [...prev.keywords, keywordInput.trim()]
            }));
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keywordToRemove) => {
        setMedicineForm(prev => ({
            ...prev,
            keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
        }));
    };

    const handleKeywordKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddKeyword();
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "category") {
            if (value === "custom") {
                setShowCustomCategory(true);
                setFormData((prev) => ({
                    ...prev,
                    [name]: "",
                }));
            } else {
                setShowCustomCategory(false);
                setFormData((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleVariationChange = (index, field, value) => {
        const processedValue = (field === 'supplier_id' || field === 'manufacturer_id')
            ? Number(value) || ""
            : value;
        setFormData((prev) => ({
            ...prev,
            variations: prev.variations.map((variation, i) =>
                i === index ? { ...variation, [field]: processedValue, id: variation.id } : variation
            ),
        }));
    };

    const addVariation = () => {
        setFormData((prev) => ({
            ...prev,
            variations: [
                ...prev.variations,
                {
                    sku: "",
                    price: "",
                    stock: "",
                    unit: "",
                    batch_code: "",
                    expiry_date: "",
                    mfg_date: "",
                    status: true,
                    supplier_id: null,
                    manufacturer_id: null,
                },
            ],
        }));
    };

    const removeVariation = (index) => {
        setFormData((prev) => ({
            ...prev,
            variations: prev.variations.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Prepare data to send
            const updateData = {
                ...formData,
                // Keep the variation-specific supplier and manufacturer IDs
                variations: formData.variations.map((v) => ({
                    ...v,
                    id: v.id || null,
                    supplier_id: v.supplier_id ? Number(v.supplier_id) : null,
                    manufacturer_id: v.manufacturer_id ? Number(v.manufacturer_id) : null,
                    stock: parseInt(v.stock || 0),
                    price: parseFloat(v.price || 0),
                })),
            };

            console.log("Sending update data:", updateData);

            const result = await editMedicine(medicine.id, updateData);
            if (result.success) {
                toast.success("Medicine updated successfully!");
                onSave(updateData);
                onClose();
            } else {
                console.log(`Failed to update medicine: ${result.error}`);
                // toast.error(`Failed to update medicine: ${result.error}`);
            }
        } catch (error) {
            console.error("Update error:", error);
            // toast.error("Failed to update medicine");
        } finally {
            setIsLoading(false);
        }
    };

    console.log("Variations being sent:", formData.variations.map(v => ({
        id: v.id,
        sku: v.sku,
        price: v.price,
        supplier_id: v.supplier_id,
        manufacturer_id: v.manufacturer_id
    })));

    // Get selected supplier and manufacturer for display
    const selectedSupplier = suppliers.find(s => s.id === formData?.variations.supplier_id);
    const selectedManufacturer = manufacturers.find(m => m.id === formData.variations.manufacturer_id);

    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div
                className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
                style={{ zIndex: "9999" }}
            >
                <div className="modal-content overflow-auto">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Medicine</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={isLoading}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Basic Info */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">Medicine Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Brand</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={showCustomCategory ? "custom" : formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Category</option>
                                        {predefinedCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Status</label>
                                    <div className="form-check form-switch mt-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="status"
                                            checked={formData.status}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label">
                                            {formData.status ? "Active" : "Inactive"}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Keywords</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            onKeyPress={handleKeywordKeyPress}
                                            placeholder="Enter keyword and press Enter or click Add"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={handleAddKeyword}
                                            disabled={!keywordInput.trim()}
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Display Keywords */}
                                    {formData.keywords.length > 0 && (
                                        <div className="mt-2">
                                            <div className="d-flex flex-wrap gap-2">
                                                {formData.keywords.map((keyword, index) => (
                                                    <span key={index} className="badge bg-primary position-relative d-flex align-items-center">
                                                        {keyword}
                                                        <button
                                                            type="button"
                                                            className="btn-close btn-close-white ms-1"
                                                            onClick={() => handleRemoveKeyword(keyword)}
                                                            style={{ fontSize: '0.7rem', padding: '0.2rem' }}
                                                            aria-label="Remove keyword"
                                                        >
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-4">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Enter any additional notes"
                                />
                            </div>

                            {/* Vaccine-specific fields */}
                            {formData.category === "Vaccine" && (
                                <div className="border p-3 mb-4 rounded bg-light">
                                    <h6>Vaccine Information</h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label">Vaccine Type</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="vaccine_type"
                                                value={formData.vaccine_type}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Age Group</label>
                                            <select
                                                className="form-control"
                                                name="age_grp"
                                                value={formData.age_grp}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Age Group</option>
                                                {ageGroups.map(group => (
                                                    <option key={group} value={group}>
                                                        {group}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Dose Interval</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="dose_interval"
                                                value={formData.dose_interval}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Total Doses</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="total_doses"
                                                value={formData.total_doses}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Medicine-specific fields */}
                            {formData.category === "Medicine" && (
                                <div className="border p-3 mb-4 rounded bg-light">
                                    <h6>Medicine Information</h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label">Dosage Form</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="dosage_form"
                                                value={formData.dosage_form}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Strength</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="strength"
                                                value={formData.strength}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Supplier Info */}
                            {/* <h6 className="mb-3">Supplier Information</h6>
                            <div className="row mb-4">
                                <div className="col-md-12">
                                    <label className="form-label">Select Default Supplier</label>
                                    <select
                                        className="form-select"
                                        name="supplier_id"
                                        value={formData.supplier_id}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                supplier_id: Number(e.target.value) || "" // convert to number
                                            }))
                                        }
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name || supplier.supplier_name}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedSupplier && (
                                        <div className="mt-2 p-2 bg-light rounded">
                                            <small>
                                                <strong>Selected Supplier:</strong><br />
                                                Name: {selectedSupplier.name || selectedSupplier.supplier_name}<br />
                                                Contact: {selectedSupplier.contact || selectedSupplier.supplier_contact}<br />
                                                Email: {selectedSupplier.email || selectedSupplier.supplier_email}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            {/* Manufacturer Info */}
                            {/* <h6 className="mb-3">Manufacturer Information</h6>
                            <div className="row mb-4">
                                <div className="col-md-12">
                                    <label className="form-label">Select Default Manufacturer</label>
                                    <select
                                        className="form-select"
                                        name="manufacturer_id"
                                        value={formData.manufacturer_id}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                manufacturer_id: Number(e.target.value) || "" // convert to number
                                            }))
                                        }
                                    >
                                        <option value="">Select Manufacturer</option>
                                        {manufacturers.map((manufacturer) => (
                                            <option key={manufacturer.id} value={manufacturer.id}>
                                                {manufacturer.name || manufacturer.manufacturer_name}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedManufacturer && (
                                        <div className="mt-2 p-2 bg-light rounded">
                                            <small>
                                                <strong>Selected Manufacturer:</strong><br />
                                                Name: {selectedManufacturer.name || selectedManufacturer.manufacturer_name}<br />
                                                Contact: {selectedManufacturer.phone || selectedManufacturer.manufacturer_phone}<br />
                                                Email: {selectedManufacturer.email || selectedManufacturer.manufacturer_email}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            {/* Variations */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">Variations</h6>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={addVariation}
                                >
                                    <FiPlus className="me-1" /> Add
                                </button>
                            </div>

                            {formData.variations.map((variation, index) => {
                                const variationSupplier = suppliers.find(s => s.id === variation.supplier_id);
                                const variationManufacturer = manufacturers.find(m => m.id === variation.manufacturer_id);

                                return (
                                    <div key={index} className="border rounded p-3 mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0">Variation {index + 1}</h6>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => removeVariation(index)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>

                                        {/* Variation-specific supplier and manufacturer selection */}
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Variation Supplier</label>
                                                <select
                                                    className="form-select"
                                                    value={variation.supplier_id || ""}
                                                    onChange={(e) =>
                                                        handleVariationChange(
                                                            index,
                                                            "supplier_id",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">Use Default Supplier</option>
                                                    {suppliers.map((supplier) => (
                                                        <option key={supplier.id} value={supplier.id}>
                                                            {supplier.name || supplier.supplier_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {variationSupplier && (
                                                    <div className="mt-2 p-2 bg-light rounded">
                                                        <small>
                                                            <strong>Current Supplier:</strong><br />
                                                            Name: {variationSupplier.name || variationSupplier.supplier_name}<br />
                                                            Contact: {variationSupplier.contact || variationSupplier.supplier_contact}<br />
                                                            Email: {variationSupplier.email || variationSupplier.supplier_email}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label">Variation Manufacturer</label>
                                                <select
                                                    className="form-select"
                                                    value={variation.manufacturer_id || ""}
                                                    onChange={(e) =>
                                                        handleVariationChange(
                                                            index,
                                                            "manufacturer_id",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">Use Default Manufacturer</option>
                                                    {manufacturers.map((manufacturer) => (
                                                        <option key={manufacturer.id} value={manufacturer.id}>
                                                            {manufacturer.name || manufacturer.manufacturer_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {variationManufacturer && (
                                                    <div className="mt-2 p-2 bg-light rounded">
                                                        <small>
                                                            <strong>Current Manufacturer:</strong><br />
                                                            Name: {variationManufacturer.name || variationManufacturer.manufacturer_name}<br />
                                                            Contact: {variationManufacturer.phone || variationManufacturer.manufacturer_phone}<br />
                                                            Email: {variationManufacturer.email || variationManufacturer.manufacturer_email}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <label>SKU</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={variation.sku}
                                                    onChange={(e) =>
                                                        handleVariationChange(index, "sku", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label>Price</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={variation.price}
                                                    onChange={(e) =>
                                                        handleVariationChange(index, "price", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label>Stock</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={variation.stock}
                                                    onChange={(e) =>
                                                        handleVariationChange(index, "stock", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <label>Unit</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={variation.unit}
                                                    onChange={(e) =>
                                                        handleVariationChange(index, "unit", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="row mt-2">
                                            <div className="col-md-4">
                                                <label>Batch Code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={variation.batch_code || ""}
                                                    onChange={(e) =>
                                                        handleVariationChange(
                                                            index,
                                                            "batch_code",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label>MFG Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={variation.mfg_date || ""}
                                                    onChange={(e) =>
                                                        handleVariationChange(index, "mfg_date", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label>Expiry Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={variation.expiry_date || ""}
                                                    onChange={(e) =>
                                                        handleVariationChange(
                                                            index,
                                                            "expiry_date",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        ></span>
                                        Updating...
                                    </>
                                ) : (
                                        "Update Medicine"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditMedicineModal;