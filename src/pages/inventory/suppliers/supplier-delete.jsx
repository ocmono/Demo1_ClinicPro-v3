import React from 'react';
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';

const SupplierDeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Delete",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName = ""
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <FiAlertTriangle className="me-2 text-warning" />
                            {title}
                        </h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="text-center">
                            <FiAlertTriangle size={48} className="text-warning mb-3" />
                            <h6 className="fw-semibold">{message}</h6>
                            {itemName && (
                                <p className="text-muted mt-2">
                                    <strong>{itemName}</strong>
                                </p>
                            )}
                            <p className="text-danger small mt-2">
                                <FiAlertTriangle size={12} className="me-1" />
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="modal-footer border-0 justify-content-center">
                        <button className="btn btn-outline-secondary" onClick={onClose}>
                            <FiX size={16} className="me-1" />
                            Cancel
                        </button>
                        <button className="btn btn-danger" onClick={onConfirm}>
                            <FiTrash2 size={16} className="me-1" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDeleteModal;