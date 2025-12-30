// components/medicines/AddVariationModal.jsx
import React, { useState } from 'react';
import { FiX, FiPlus, FiMinus, FiSave, FiCalendar, FiTrash } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AddVariationModal = ({ product, onClose, onSave }) => {
    const [variations, setVariations] = useState([
        { sku: '', stock: '', price: '', unit: '', batch_code: '', expiry_date: '', mfg_date: '', status: true, discounts: [] }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBatchDetails, setShowBatchDetails] = useState({});
    const [showDiscountDetails, setShowDiscountDetails] = useState({});
    const [customUnits, setCustomUnits] = useState({});

    const commonUnits = [
        'mg', 'ml', 'tablet', 'capsule', 'g', 'bottle', 'strip', 'sachet', 'drop', 'custom', 'vial'
    ];

    const discountTypes = [
        { value: 'flat', label: 'Flat Amount' },
        { value: 'percent', label: 'Percentage' }
    ];

    const handleVariationChange = (index, field, value) => {
        const updatedVariations = [...variations];
        updatedVariations[index][field] = value;
        setVariations(updatedVariations);
    };

    const addVariation = () => {
        setVariations([...variations,
        {
            sku: '',
            stock: '',
            price: '',
            unit: '',
            batch_code: '',
            expiry_date: '',
            mfg_date: '',
            status: true,
            discounts: []
        }
        ]);
    };

    const removeVariation = (index) => {
        if (variations.length > 1) {
            const updatedVariations = variations.filter((_, i) => i !== index);
            setVariations(updatedVariations);

            // Clean up batch details state
            const updatedBatchDetails = { ...showBatchDetails };
            delete updatedBatchDetails[index];
            setShowBatchDetails(updatedBatchDetails);

            const updatedDiscountDetails = { ...showDiscountDetails };
            delete updatedDiscountDetails[index];
            setShowDiscountDetails(updatedDiscountDetails);

            // Clean up custom units state
            const updatedCustomUnits = { ...customUnits };
            delete updatedCustomUnits[index];
            setCustomUnits(updatedCustomUnits);
        }
    };

    const addDiscount = (variationIndex) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].discounts.push({
            value: '',
            type: 'flat',
            quantity: 1
        });
        setVariations(updatedVariations);
    };

    const removeDiscount = (variationIndex, discountIndex) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].discounts.splice(discountIndex, 1);
        setVariations(updatedVariations);
    };

    const handleDiscountChange = (variationIndex, discountIndex, field, value) => {
        const updatedVariations = [...variations];
        const updatedDiscounts = [...updatedVariations[variationIndex].discounts];

        updatedDiscounts[discountIndex] = {
            ...updatedDiscounts[discountIndex],
            [field]: value
        };

        updatedVariations[variationIndex].discounts = updatedDiscounts;
        setVariations(updatedVariations);
    };

    const toggleDiscountDetails = (variationIndex) => {
        setShowDiscountDetails(prev => ({
            ...prev,
            [variationIndex]: !prev[variationIndex]
        }));
    };

    const getDiscountDisplay = (discount) => {
        if (discount.type === 'flat') {
            return `$${discount.value} off for ${discount.quantity}+ items`;
        } else {
            return `${discount.value}% off for ${discount.quantity}+ items`;
        }
    };

    const handleBatchCodeFocus = (index) => {
        setShowBatchDetails(prev => ({
            ...prev,
            [index]: true
        }));
    };

    const toggleBatchDetails = (index) => {
        setShowBatchDetails(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const validateVariations = () => {
        const errors = [];

        variations.forEach((variation, index) => {
            if (!variation.sku.trim()) {
                errors.push(`Variation ${index + 1}: SKU is required`);
            }
            if (!variation.stock || isNaN(Number(variation.stock)) || Number(variation.stock) <= 0) {
                errors.push(`Variation ${index + 1}: Stock must be a positive number`);
            }
            if (!variation.price || isNaN(Number(variation.price)) || Number(variation.price) <= 0) {
                errors.push(`Variation ${index + 1}: Price must be a positive number`);
            }
            if (!variation.batch_code.trim()) {
                errors.push(`Variation ${index + 1}: Batch code is required`);
            }
            if (!variation.expiry_date) {
                errors.push(`Variation ${index + 1}: Expiry date is required`);
            }
            if (!variation.mfg_date) {
                errors.push(`Variation ${index + 1}: Manufacturing date is required`);
            }

            // Validate dates
            if (variation.expiry_date && variation.mfg_date) {
                const expiryDate = new Date(variation.expiry_date);
                const mfgDate = new Date(variation.mfg_date);

                if (mfgDate >= expiryDate) {
                    errors.push(`Variation ${index + 1}: Manufacturing date must be before expiry date`);
                }
            }

            variation.discounts.forEach((discount, discountIndex) => {
                if (!discount.value || isNaN(Number(discount.value)) || Number(discount.value) <= 0) {
                    errors.push(`Variation ${index + 1}, Discount ${discountIndex + 1}: Discount value must be positive`);
                }
                if (discount.type === 'percent' && Number(discount.value) > 100) {
                    errors.push(`Variation ${index + 1}, Discount ${discountIndex + 1}: Percentage discount cannot exceed 100%`);
                }
                if (!discount.quantity || isNaN(Number(discount.quantity)) || Number(discount.quantity) <= 0) {
                    errors.push(`Variation ${index + 1}, Discount ${discountIndex + 1}: Quantity must be positive`);
                }
            });
        });

        return errors;
    };

    const handleUnitChange = (index, value) => {
        if (value === 'custom') {
            setCustomUnits(prev => ({ ...prev, [index]: '' }));
            handleVariationChange(index, 'unit', '');
        } else {
            setCustomUnits(prev => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
            });
            handleVariationChange(index, 'unit', value);
        }
    };

    const handleCustomUnitChange = (index, value) => {
        setCustomUnits(prev => ({ ...prev, [index]: value }));
        handleVariationChange(index, 'unit', value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateVariations();
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => toast.error(error));
            return;
        }

        setIsSubmitting(true);

        try {
            // Filter out empty variations and send each variation individually
            for (const variation of variations) {
                const variationData = {
                    sku: variation.sku,
                    stock: parseInt(variation.stock),
                    unit: variation.unit || '',
                    price: parseFloat(variation.price),
                    batch_code: variation.batch_code,
                    expiry_date: variation.expiry_date,
                    mfg_date: variation.mfg_date,
                    status: variation.status,
                    discounts: variation.discounts.map(discount => ({
                        value: parseFloat(discount.value),
                        type: discount.type,
                        quantity: parseInt(discount.quantity)
                    }))
                };

                await onSave(product.id, variationData);
            }

            toast.success('Variations added successfully!');
            onClose();
        } catch (error) {
            console.log('Failed to add variations');
            // toast.error('Failed to add variations');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal-dialog modal-xl modal-dialog-centered" style={{ zIndex: "9999" }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <FiPlus className="me-2" />
                            Add Variations to {product.name}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={isSubmitting}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-12">
                                    <div className="alert alert-info">
                                        <small>
                                            <strong>Product:</strong> {product.name} |
                                            <strong> Brand:</strong> {product.brand} |
                                            <strong> Category:</strong> {product.category}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {variations.map((variation, index) => (
                                <div key={index} className="card mb-3">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">Variation {index + 1}</h6>
                                        {variations.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => removeVariation(index)}
                                            >
                                                <FiMinus size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-3">
                                                <label className="form-label">SKU</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={variation.sku}
                                                    onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                                                    placeholder="SKU001"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Stock</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={variation.stock}
                                                    onChange={(e) => handleVariationChange(index, 'stock', e.target.value)}
                                                    placeholder="100"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Price</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={variation.price}
                                                    onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Unit</label>
                                                <select
                                                    className="form-control"
                                                    value={commonUnits.includes(variation.unit) ? variation.unit : (variation.unit ? 'custom' : '')}
                                                    onChange={(e) => handleUnitChange(index, e.target.value)}
                                                >
                                                    <option value="">Select Unit</option>
                                                    {commonUnits.map(unit => (
                                                        <option key={unit} value={unit}>{unit}</option>
                                                    ))}
                                                </select>
                                                {((variation.unit === '' && customUnits[index] !== undefined) || variation.unit === 'custom' || (!commonUnits.includes(variation.unit) && variation.unit)) && (
                                                    <input
                                                        type="text"
                                                        className="form-control mt-1"
                                                        placeholder="Custom unit"
                                                        value={customUnits[index] !== undefined ? customUnits[index] : variation.unit}
                                                        onChange={(e) => handleCustomUnitChange(index, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label">Batch Code</label>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={variation.batch_code}
                                                        onChange={(e) => handleVariationChange(index, 'batch_code', e.target.value)}
                                                        onFocus={() => handleBatchCodeFocus(index)} 
                                                        placeholder="BATCH001"
                                                        required
                                                    />
                                                    {/* <button
                                                        type="button"
                                                        className={`btn ${showBatchDetails[index] ? 'btn-primary' : 'btn-outline-primary'}`}
                                                        onClick={() => toggleBatchDetails(index)}
                                                        title="Show/Hide Batch Details"
                                                    >
                                                        <FiCalendar size={14} />
                                                    </button> */}
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label">Status</label>
                                                <div className="form-check form-switch mt-2">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={variation.status}
                                                        onChange={(e) => handleVariationChange(index, 'status', e.target.checked)}
                                                    />
                                                    <label className="form-check-label">
                                                        {variation.status ? 'Active' : 'Inactive'}
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="card border-0 bg-light">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 className="card-title mb-0">
                                                                Discounts ({variation.discounts.length})
                                                            </h6>
                                                            <div className="d-flex align-items-center">
                                                                {variation.discounts.length > 0 && (
                                                                    <span className="badge bg-info me-2">
                                                                        {variation.discounts.map((discount, i) => (
                                                                            <span key={i} className="d-block small">
                                                                                {getDiscountDisplay(discount)}
                                                                            </span>
                                                                        ))}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => toggleDiscountDetails(index)}
                                                                >
                                                                    {showDiscountDetails[index] ? <FiMinus /> : <FiPlus />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Discount Fields (when expanded) */}
                                                        {showDiscountDetails[index] && (
                                                            <div className="discounts-section">
                                                                {variation.discounts.map((discount, discountIndex) => (
                                                                    <div key={discountIndex} className="discount-row mb-2 p-2 border rounded bg-white">
                                                                        <div className="row g-2 align-items-center">
                                                                            <div className="col-md-4">
                                                                                <label className="form-label small">Discount Value</label>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    value={discount.value}
                                                                                    onChange={(e) => handleDiscountChange(index, discountIndex, 'value', e.target.value)}
                                                                                    placeholder="0.00"
                                                                                    step="0.01"
                                                                                    min="0"
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-4">
                                                                                <label className="form-label small">Discount Type</label>
                                                                                <select
                                                                                    className="form-control form-control-sm"
                                                                                    value={discount.type}
                                                                                    onChange={(e) => handleDiscountChange(index, discountIndex, 'type', e.target.value)}
                                                                                >
                                                                                    {discountTypes.map(type => (
                                                                                        <option key={type.value} value={type.value}>
                                                                                            {type.label}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <label className="form-label small">Minimum Quantity</label>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    value={discount.quantity}
                                                                                    onChange={(e) => handleDiscountChange(index, discountIndex, 'quantity', e.target.value)}
                                                                                    placeholder="1"
                                                                                    min="1"
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-1">
                                                                                <label className="form-label small">&nbsp;</label>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-outline-danger px-3 py-3"
                                                                                    onClick={() => removeDiscount(index, discountIndex)}
                                                                                    title="Remove discount"
                                                                                >
                                                                                    <FiTrash size={12} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Add Discount Button */}
                                                                <div className="text-center mt-2">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => addDiscount(index)}
                                                                    >
                                                                        <FiPlus className="me-1" />
                                                                        Add Discount
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {showBatchDetails[index] && (
                                                <div className="col-12">
                                                    <div className="card border-0 bg-light">
                                                        <div className="card-body">
                                                            <h6 className="card-title mb-3">
                                                                <FiCalendar className="me-2" />
                                                                Batch Details
                                                            </h6>
                                                            <div className="row g-3">
                                                                <div className="col-md-6">
                                                                    <label className="form-label">Manufacturing Date *</label>
                                                                    <input
                                                                        type="date"
                                                                        className="form-control"
                                                                        value={variation.mfg_date}
                                                                        onChange={(e) => handleVariationChange(index, 'mfg_date', e.target.value)}
                                                                        required
                                                                    />
                                                                    <small className="form-text text-muted">
                                                                        Date when the product was manufactured
                                                                    </small>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <label className="form-label">Expiry Date *</label>
                                                                    <input
                                                                        type="date"
                                                                        className="form-control"
                                                                        value={variation.expiry_date}
                                                                        onChange={(e) => handleVariationChange(index, 'expiry_date', e.target.value)}
                                                                        required
                                                                    />
                                                                    <small className="form-text text-muted">
                                                                        Date when the product expires
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="text-center">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={addVariation}
                                >
                                    <FiPlus className="me-1" />
                                    Add Another Variation
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                <FiX className="me-1" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                <FiSave className="me-1" />
                                {isSubmitting ? 'Adding...' : 'Add Variations'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddVariationModal;