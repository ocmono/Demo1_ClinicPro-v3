import React, { useState } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import { useMedicines } from '../../context/MedicinesContext'
import { toast } from 'react-toastify'
import { FiTrash, FiCopy, FiArrowUp, FiArrowDown, FiSave, FiX, FiHelpCircle } from 'react-icons/fi'
import MedicineHeadr from '@/components/medicines/MedicineHeadr'
import './add-medicine.css'

const MedicineAdd = () => {
    const { addMedicine } = useMedicines();
    const [medicineForm, setMedicineForm] = useState({
        name: '',
        brand: '',
        variations: [{ sku: '', quantity: '', unit: '', price: '' }]
    });
    const [variationTouched, setVariationTouched] = useState([]);
    const [variationErrors, setVariationErrors] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supplierList = [
        'ABC Pharma',
        'XYZ Distributors',
        'MediLife Suppliers',
        'HealWell Traders',
        'Global Meds',
        'Prime Pharmaceuticals',
        'MediCare Solutions',
        'HealthFirst Distributors',
        'VitalMed Supplies',
        'Elite Pharma Group'
    ];
    const [supplierInput, setSupplierInput] = useState('');
    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierTouched, setSupplierTouched] = useState(false);

    const {
        refreshKey,
        isRemoved,
        isExpanded,
        handleRefresh,
        handleExpand,
        handleDelete
    } = useCardTitleActions();

    if (isRemoved) return null;

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e);
        }

        // Ctrl/Cmd + N to add new variation
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            addVariationRow();
        }

        // Ctrl/Cmd + R to reset form
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            resetForm();
        }

        // Escape to clear supplier suggestions
        if (e.key === 'Escape') {
            setSupplierSuggestions([]);
        }
    };

    const validateField = (name, value) => {
        const errors = {};
        if (name === 'name' && !value.trim()) {
            errors.name = 'Medicine name is required';
        } else if (name === 'brand' && !value.trim()) {
            errors.brand = 'Brand is required';
        } else if (name === 'supplier' && !value.trim()) {
            errors.supplier = 'Supplier is required';
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMedicineForm(prev => ({ ...prev, [name]: value }));
        // Clear field-specific error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleVariationChange = (index, field, value) => {
        const updated = [...medicineForm.variations];
        updated[index][field] = value;
        setMedicineForm(prev => ({ ...prev, variations: updated }));
        // Mark as touched
        setVariationTouched(touched => {
            const arr = [...touched];
            arr[index] = true;
            return arr;
        });
        // Clear variation errors when user types
        if (variationErrors[index] && variationErrors[index][field]) {
            setVariationErrors(prev => {
                const newErrors = [...prev];
                if (newErrors[index]) {
                    newErrors[index] = { ...newErrors[index], [field]: '' };
                }
                return newErrors;
            });
        }
    };

    const validateVariation = (variation) => {
        const errors = {};
        if (!variation.sku.trim()) errors.sku = 'SKU is required';
        if (!variation.quantity || isNaN(Number(variation.quantity)) || Number(variation.quantity) <= 0) {
            errors.quantity = 'Valid quantity is required';
        }
        if (!variation.price || isNaN(Number(variation.price)) || Number(variation.price) <= 0) {
            errors.price = 'Valid price is required';
        }
        return errors;
    };

    const copyVariationRow = (index) => {
        const copy = { ...medicineForm.variations[index] };
        setMedicineForm(prev => ({
            ...prev,
            variations: [
                ...prev.variations.slice(0, index + 1),
                copy,
                ...prev.variations.slice(index + 1)
            ]
        }));
        setVariationTouched(touched => {
            const arr = [...touched];
            arr.splice(index + 1, 0, false);
            return arr;
        });
        toast.success('Variation copied successfully!');
    };

    const moveVariationRow = (index, direction) => {
        const arr = [...medicineForm.variations];
        const touchedArr = [...variationTouched];
        if (direction === 'up' && index > 0) {
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
            [touchedArr[index - 1], touchedArr[index]] = [touchedArr[index], touchedArr[index - 1]];
        } else if (direction === 'down' && index < arr.length - 1) {
            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
            [touchedArr[index + 1], touchedArr[index]] = [touchedArr[index], touchedArr[index + 1]];
        }
        setMedicineForm(prev => ({ ...prev, variations: arr }));
        setVariationTouched(touchedArr);
        toast.success(`Variation moved ${direction}!`);
    };

    const addVariationRow = () => {
        setMedicineForm(prev => ({
            ...prev,
            variations: [...prev.variations, { sku: '', quantity: '', unit: '', price: '' }]
        }));
        setVariationTouched(prev => [...prev, false]);
        toast.success('New variation row added!');
    };

    const deleteVariationRow = (index) => {
        if (index === 0) return;
        const updated = medicineForm.variations.filter((_, i) => i !== index);
        setMedicineForm(prev => ({ ...prev, variations: updated }));
        setVariationTouched(prev => prev.filter((_, i) => i !== index));
        toast.success('Variation deleted!');
    };

    const handleSupplierInput = (e) => {
        const value = e.target.value;
        setSupplierInput(value);
        setSupplierTouched(true);
        setSupplierSuggestions(
            value ? supplierList.filter(s => s.toLowerCase().includes(value.toLowerCase())) : []
        );
        setMedicineForm(prev => ({ ...prev, supplier: value }));
        // Clear supplier error when user types
        if (formErrors.supplier) {
            setFormErrors(prev => ({ ...prev, supplier: '' }));
        }
    };
    const handleSupplierSelect = (s) => {
        setSupplierInput(s);
        setSupplierSuggestions([]);
        setMedicineForm(prev => ({ ...prev, supplier: s }));
        toast.success(`Supplier "${s}" selected!`);
    };

    const resetForm = () => {
        setMedicineForm({
            name: '',
            brand: '',
            variations: [{ sku: '', quantity: '', unit: '', price: '' }]
        });
        setVariationTouched([]);
        setVariationErrors([]);
        setFormErrors({});
        setSupplierInput('');
        setSupplierSuggestions([]);
        setSupplierTouched(false);
        toast.success('Form reset successfully!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate main form fields
        const mainErrors = {};
        if (!medicineForm.name.trim()) mainErrors.name = 'Medicine name is required';
        if (!medicineForm.brand.trim()) mainErrors.brand = 'Brand is required';
        if (!medicineForm.supplier?.trim()) mainErrors.supplier = 'Supplier is required';

        // Validate variations
        let hasVariationErrors = false;
        const errorsArr = medicineForm.variations.map(validateVariation);
        setVariationErrors(errorsArr);
        setVariationTouched(medicineForm.variations.map(() => true));

        for (const err of errorsArr) {
            if (Object.keys(err).length > 0) hasVariationErrors = true;
        }

        setFormErrors(mainErrors);

        if (Object.keys(mainErrors).length > 0 || hasVariationErrors) {
            toast.error("Please fix the highlighted errors before submitting.");
            setIsSubmitting(false);
            return;
        }

        const formattedMedicine = {
            ...medicineForm,
            variations: medicineForm.variations.map(v => ({
                ...v,
                price: parseFloat(v.price),
                quantity: v.quantity + (v.unit || "")
            }))
        };

        try {
            await addMedicine(formattedMedicine);
            toast.success("Medicine added successfully!");
            resetForm();
        } catch (err) {
            console.log("Error adding medicine. Please try again.");
            // toast.error("Error adding medicine. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <PageHeader>
                <MedicineHeadr />
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <div className="col-12">
                        <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey
                            ? "card-loading" : ""}`}>
                            <CardHeader title="Add Medicine" />
                            <div className="progress-indicator mb-3">
                                <div className="progress" style={{ height: '4px' }}>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${(() => {
                                                let progress = 0;
                                                if (medicineForm.name.trim()) progress += 25;
                                                if (medicineForm.brand.trim()) progress += 25;
                                                if (medicineForm.supplier?.trim()) progress += 25;
                                                if (medicineForm.variations.some(v => v.sku && v.quantity && v.price)) progress += 25;
                                                return progress;
                                            })()}%`
                                        }}
                                    ></div>
                                </div>
                                <small className="text-muted mt-1 d-block">
                                    Form completion: {(() => {
                                        let progress = 0;
                                        if (medicineForm.name.trim()) progress += 25;
                                        if (medicineForm.brand.trim()) progress += 25;
                                        if (medicineForm.supplier?.trim()) progress += 25;
                                        if (medicineForm.variations.some(v => v.sku && v.quantity && v.price)) progress += 25;
                                        return progress;
                                    })()}%
                                </small>
                            </div>
                            <div className="card-body">
                                <form className="add-medicine-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Medicine Name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={medicineForm.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter Medicine Name"
                                                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                                />
                                                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Brand <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    name="brand"
                                                    value={medicineForm.brand}
                                                    onChange={handleChange}
                                                    placeholder="Enter Brand"
                                                    className={`form-control ${formErrors.brand ? 'is-invalid' : ''}`}
                                                />
                                                {formErrors.brand && <div className="invalid-feedback">{formErrors.brand}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group position-relative">
                                                <label>Supplier <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    name="supplier"
                                                    value={supplierInput}
                                                    onChange={handleSupplierInput}
                                                    onBlur={() => setTimeout(() => setSupplierSuggestions([]), 200)}
                                                    placeholder="Start typing to search..."
                                                    className={`form-control${supplierTouched && !medicineForm.supplier ? ' is-invalid' : ''}${formErrors.supplier ? ' is-invalid' : ''}`}
                                                    autoComplete="off"
                                                />
                                                {supplierSuggestions.length > 0 && (
                                                    <ul className="list-group position-absolute w-100" style={{ zIndex: 10, top: '100%' }}>
                                                        {supplierSuggestions.map(s => (
                                                            <li
                                                                key={s}
                                                                className="list-group-item list-group-item-action"
                                                                style={{ cursor: 'pointer' }}
                                                                onMouseDown={() => handleSupplierSelect(s)}
                                                            >
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {(supplierTouched && !medicineForm.supplier) && (
                                                    <div className="invalid-feedback d-block">Supplier is required</div>
                                                )}
                                                {formErrors.supplier && <div className="invalid-feedback d-block">{formErrors.supplier}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="variation-section">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="d-flex align-items-center gap-2">
                                                <h5 className="mb-0">Variations <span className="text-danger">*</span></h5>
                                                <span
                                                    className="text-muted"
                                                    title="Add different variations of the same medicine (e.g., different strengths, forms)"
                                                    style={{ cursor: 'help' }}
                                                >
                                                    <FiHelpCircle size={16} />
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button type="button" onClick={addVariationRow} className="btn btn-sm btn-primary">
                                                    + Add Variation
                                                </button>
                                                <button type="button" onClick={resetForm} className="btn btn-sm btn-outline-secondary">
                                                    <FiX className="me-1" /> Reset
                                                </button>
                                            </div>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-bordered variation-table">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>SKU <span className="text-danger">*</span></th>
                                                        <th>Quantity <span className="text-danger">*</span></th>
                                                        <th>Unit</th>
                                                        <th>Price <span className="text-danger">*</span></th>
                                                        <th width="120">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {medicineForm.variations.map((variation, index) => {
                                                        const errors = variationErrors[index] || {};
                                                        return (
                                                            <tr key={index} className={index === 0 ? 'table-primary' : ''}>
                                                                <td>
                                                                    <input type="text" value={variation.sku} onChange={(e) =>
                                                                        handleVariationChange(index, "sku", e.target.value)}
                                                                        className={`form-control${errors.sku && (variationTouched[index] || variationErrors.length) ? ' is-invalid' : ''}`}
                                                                        placeholder="SKU"
                                                                        onBlur={() => setVariationTouched(t => { const arr = [...t]; arr[index] = true; return arr; })}
                                                                    />
                                                                    {errors.sku && (variationTouched[index] || variationErrors.length) && (
                                                                        <div className="invalid-feedback d-block">{errors.sku}</div>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <input type="number" value={variation.quantity} onChange={(e) =>
                                                                        handleVariationChange(index, "quantity", e.target.value)}
                                                                        className={`form-control${errors.quantity && (variationTouched[index] || variationErrors.length) ? ' is-invalid' : ''}`}
                                                                        placeholder="Quantity"
                                                                        min="1"
                                                                        onBlur={() => setVariationTouched(t => { const arr = [...t]; arr[index] = true; return arr; })}
                                                                    />
                                                                    {errors.quantity && (variationTouched[index] || variationErrors.length) && (
                                                                        <div className="invalid-feedback d-block">{errors.quantity}</div>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <select value={variation.unit} onChange={(e) =>
                                                                        handleVariationChange(index, "unit", e.target.value)}
                                                                        className="form-select"
                                                                    >
                                                                        <option value="">Select Unit</option>
                                                                        <option value="mg">mg</option>
                                                                        <option value="gm">gm</option>
                                                                        <option value="ml">ml</option>
                                                                        <option value="tablet">Tablet</option>
                                                                        <option value="capsule">Capsule</option>
                                                                        <option value="drops">Drops</option>
                                                                        <option value="syrup">Syrup</option>
                                                                        <option value="injection">Injection</option>
                                                                        <option value="piece">Piece</option>
                                                                        <option value="bottle">Bottle</option>
                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <input type="number" value={variation.price} onChange={(e) =>
                                                                        handleVariationChange(index, "price", e.target.value)}
                                                                        className={`form-control${errors.price && (variationTouched[index] || variationErrors.length) ? ' is-invalid' : ''}`}
                                                                        placeholder="Price"
                                                                        min="0.01"
                                                                        step="0.01"
                                                                        onBlur={() => setVariationTouched(t => { const arr = [...t]; arr[index] = true; return arr; })}
                                                                    />
                                                                    {errors.price && (variationTouched[index] || variationErrors.length) && (
                                                                        <div className="invalid-feedback d-block">{errors.price}</div>
                                                                    )}
                                                                </td>
                                                                <td className="text-center d-flex gap-1 justify-content-center">
                                                                    <button type="button" className="btn btn-sm btn-outline-secondary" title="Copy" onClick={() => copyVariationRow(index)}><FiCopy /></button>
                                                                    <button type="button" className="btn btn-sm btn-outline-secondary" title="Move Up" onClick={() => moveVariationRow(index, 'up')} disabled={index === 0}><FiArrowUp /></button>
                                                                    <button type="button" className="btn btn-sm btn-outline-secondary" title="Move Down" onClick={() => moveVariationRow(index, 'down')} disabled={index === medicineForm.variations.length - 1}><FiArrowDown /></button>
                                                                    {index !== 0 && (
                                                                        <button type="button" onClick={() => deleteVariationRow(index)}
                                                                            className="btn btn-sm btn-outline-danger" title="Delete">
                                                                            <FiTrash />
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="form-actions mt-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="keyboard-shortcuts">
                                                <small className="text-muted">
                                                    <strong>Keyboard shortcuts:</strong> Ctrl+Enter (Submit) | Ctrl+N (Add Variation) | Ctrl+R (Reset) | Esc (Clear suggestions)
                                                </small>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Adding...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiSave className="me-2" />
                                                            Add Medicine
                                                        </>
                                                    )}
                                                </button>
                                                <button type="button" onClick={resetForm} className="btn btn-outline-secondary">
                                                    <FiX className="me-2" />
                                                    Reset Form
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <CardLoader refreshKey={refreshKey} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default MedicineAdd;