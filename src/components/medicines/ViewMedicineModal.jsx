import React from "react";
import { FiX, FiPackage, FiCalendar, FiHash, FiTruck, FiGrid, FiBox, FiTag, FiUser, FiMail, FiPhone, FiLayers } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const ViewMedicineModal = ({ medicine, onClose }) => {
    if (!medicine) return null;

    const totalStock = medicine.variations?.reduce((total, v) => total + (parseInt(v.stock) || 0), 0) || 0;
    const priceRange = medicine.variations?.length > 0 ? {
        min: Math.min(...medicine.variations.map(v => parseFloat(v.price) || 0)),
        max: Math.max(...medicine.variations.map(v => parseFloat(v.price) || 0))
    } : { min: 0, max: 0 };

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-danger', bg: 'bg-danger-light' };
        if (stock < 20) return { text: 'Low Stock', color: 'text-warning', bg: 'bg-warning-light' };
        return { text: 'In Stock', color: 'text-success', bg: 'bg-success-light' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const stockStatus = getStockStatus(totalStock);

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ zIndex: "9999" }}>
                <div className="modal-content border-0 shadow-lg">
                    {/* Header */}
                    <div className="modal-header border-bottom align-items-start py-3 px-4">
                        <div className="d-flex align-items-start justify-content-between w-100 gap-3">
                            <div className="d-flex align-items-start gap-2">
                                <div className="bg-primary bg-opacity-10 p-2 rounded mt-1 me-1">
                                    <FiPackage className="text-white" size={30} />
                                </div>
                                <div className="d-flex flex-column">
                                    <h5 className="modal-title fw-bold">{medicine.name || 'N/A'}</h5>
                                    <div className="d-flex align-items-center gap-3">
                                        <span className="badge bg-secondary">{medicine.category || 'N/A'}</span>
                                        <span className={`badge ${medicine.status ? 'bg-success' : 'bg-secondary'}`}>
                                            {medicine.status ? 'Active' : 'Inactive'}
                                        </span>
                                    <div className="d-flex align-items-center gap-1">
                                        <FiTag className="text-muted" size={14} />
                                        <small className="text-muted">Brand:</small>
                                        <span className="fw-medium">{medicine.brand || 'N/A'}</span>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-close mt-1"
                                onClick={onClose}
                            ></button>
                        </div>
                    </div>
                    
                    <div className="modal-body p-0">
                        {/* Top Stats Bar */}
                        <div className="bg-light border-bottom px-3 py-3">
                            <div className="row g-3">
                                <div className="col-xl-3 col-md-6 col-sm-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-white p-2 rounded border shadow-sm">
                                            <FiGrid className="text-primary" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Variants</div>
                                            <div className="fw-bold" style={{ fontSize: '1.25rem' }}>{medicine.variations?.length || 0}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-md-6 col-sm-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-white p-2 rounded border shadow-sm">
                                            <FiBox className="text-success" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Total Stock</div>
                                            <div className="fw-bold" style={{ fontSize: '1.25rem' }}>{totalStock}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-md-6 col-sm-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className={`bg-white p-2 rounded border shadow-sm ${stockStatus.bg}`}>
                                            <FiBox className={stockStatus.color} size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Stock Status</div>
                                            <div className={`fw-bold ${stockStatus.color}`} style={{ fontSize: '1.25rem' }}>{stockStatus.text}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-md-6 col-sm-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-white p-2 rounded border shadow-sm">
                                            <FaRupeeSign className="text-warning" size={17} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Price Range</div>
                                            <div className="fw-bold" style={{ fontSize: '1.25rem' }}>
                                                ₹{priceRange.min === priceRange.max ? priceRange.min : `${priceRange.min} - ${priceRange.max}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="p-4">
                            {/* Supplier Information */}
                            {medicine.supplier && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="card border h-100">
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <FiTruck className="text-primary me-2" size={18} />
                                                    <h6 className="mb-0 fw-bold text-dark">Supplier Information</h6>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-md-4 mb-2 mb-md-0">
                                                        <div className="mb-1">
                                                            <small className="text-muted">Supplier Name</small>
                                                        </div>
                                                        <div className="fw-medium text-dark">{medicine.supplier}</div>
                                                    </div>
                                                    {medicine.supplier_contact && (
                                                        <div className="col-md-4 mb-2 mb-md-0">
                                                            <div className="mb-1">
                                                                <small className="text-muted">Contact Number</small>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <FiPhone className="text-muted me-2" size={14} />
                                                                <span className="fw-medium text-dark">{medicine.supplier_contact}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {medicine.supplier_email && (
                                                        <div className="col-md-4">
                                                            <div className="mb-1">
                                                                <small className="text-muted">Email Address</small>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <FiMail className="text-muted me-2" size={14} />
                                                                <span className="fw-medium text-dark">{medicine.supplier_email}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Variations Table */}
                            
                                                    {/* Variations */}
                        {medicine.variations && medicine.variations.length > 0 && (
                            <div className="row">
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0">Product Variations</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>SKU</th>
                                                            <th>Price</th>
                                                            <th>Stock</th>
                                                            <th>Unit</th>
                                                            <th>Batch Code</th>
                                                            <th>Mfg Date</th>
                                                            <th>Expiry Date</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {medicine.variations.map((variation, index) => {
                                                            const stockStatus = getStockStatus(parseInt(variation.stock) || 0);
                                                            return (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <span className="fw-bold">{variation.sku || 'N/A'}</span>
                                                                    </td>
                                                                    <td>
                                                                        <span className="text-success fw-bold">
                                                                            ₹{variation.price || '0'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`badge ${stockStatus.bg} ${stockStatus.color} pb-0`}>
                                                                            {variation.stock || 0}
                                                                        </span>
                                                                        <br />
                                                                        <small className="text-muted">{stockStatus.text}</small>
                                                                    </td>
                                                                    <td>{variation.unit || 'N/A'}</td>
                                                                    <td>
                                                                        <span className="badge bg-light text-dark">
                                                                            {variation.batch_code || 'N/A'}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <FiCalendar className="me-1 text-muted" size={14} />
                                                                        {formatDate(variation.mfg_date)}
                                                                    </td>
                                                                    <td>
                                                                        <FiCalendar className="me-1 text-muted" size={14} />
                                                                        {formatDate(variation.expiry_date)}
                                                                    </td>
                                                                    <td>
                                                                        <span className={`badge bg-${variation.status ? 'success' : 'secondary'}`}>
                                                                            {variation.status ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                    
                    <div className="modal-footer border-top py-3 px-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add these CSS classes if not already in your styles
const customStyles = `
.bg-danger-light { background-color: rgba(220, 53, 69, 0.1); }
.bg-warning-light { background-color: rgba(255, 193, 7, 0.1); }
.bg-success-light { background-color: rgba(25, 135, 84, 0.1); }
.bg-primary-light { background-color: rgba(13, 110, 253, 0.1); }
`;

export default ViewMedicineModal;