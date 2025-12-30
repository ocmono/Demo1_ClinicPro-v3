// DeleteConfirmationModal.jsx
import React, { useState } from "react";
import { FiAlertTriangle, FiX, FiTrash2, FiLock } from "react-icons/fi";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
  requirePassword = false
}) => {
  const [password, setPassword] = useState("");
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requirePassword && !password) {
      alert("Please enter your password to confirm deletion.");
      return;
    }
    onConfirm(requirePassword ? password : null);
    setPassword("");
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };


  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title d-flex align-items-center">
              <FiAlertTriangle size={20} className="text-warning me-2" />
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          <div className="modal-body">
            <div className="text-center py-3">
              <div className="mb-3">
                <FiTrash2 size={48} className="text-danger opacity-50" />
              </div>
              <p className="mb-0">{message}</p>
            </div>
            {requirePassword && (
              <div className="input-group mt-3">
                <span className="input-group-text">
                  <FiLock />
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password to confirm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            )}
          </div>

          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              <FiX size={16} className="me-2" />
              {cancelText}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirm}
              disabled={requirePassword && !password}
            >
              <FiTrash2 size={16} className="me-2" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
