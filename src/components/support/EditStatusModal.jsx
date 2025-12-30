import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const EditStatusModal = ({ ticket, isOpen, onClose, refreshTickets }) => {
  const [status, setStatus] = useState(ticket?.status || "");
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || "");
    }
  }, [ticket]);

  const handleSubmit = async () => {
    if (!status.trim()) {
      toast.error("Please select a status");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/support/update-status/${ticket.id}?status=${encodeURIComponent(status)}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) throw new Error("Failed to update status");

      toast.success("Status updated successfully");
      onClose();
      refreshTickets();
    } catch (error) {
      // toast.error("Error updating status");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">

          <div className="modal-header">
            <h5 className="modal-title fw-semibold">
              Edit Ticket Status
            </h5>
            <button className="btn-close" onClick={onClose} disabled={isLoading}></button>
          </div>

          <div className="modal-body px-4">
            <div className="mb-3">
              <label className="form-label fw-semibold">Current Status</label>
              <p className="fw-medium">{ticket.status}</p>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Select New Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="modal-footer border-0 px-4 pb-3">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary px-4" onClick={handleSubmit}>
              Update
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'bg-success';
    case 'in progress':
      return 'bg-warning text-dark';
    case 'resolved':
      return 'bg-info';
    case 'closed':
      return 'bg-secondary';
    default:
      return 'bg-light text-dark';
  }
};

export default EditStatusModal;
