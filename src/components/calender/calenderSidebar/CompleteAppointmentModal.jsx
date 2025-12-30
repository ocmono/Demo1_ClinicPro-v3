import React from "react";
import { FiX, FiFileText, FiPlus, FiCheck } from "react-icons/fi";

const CompleteAppointmentModal = React.memo(({ 
  isOpen, 
  onClose, 
  appointment, 
  hasPrescription, 
  onViewPrescription, 
  onCreatePrescription, 
  onComplete 
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <div className="modal-header">
          <h5>Complete Appointment</h5>
          <button className="btn-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <p>
            Before completing appointment for <b>{appointment.patientName}</b>,
            {hasPrescription
              ? " you can view the existing prescription."
              : " no prescription found. Do you want to create one?"}
          </p>
        </div>
        <div className="modal-footer d-flex gap-2 justify-content-end">
          {hasPrescription ? (
            <>
              <button className="btn btn-outline-info" onClick={onViewPrescription}>
                <FiFileText className="me-1" /> View Prescription
              </button>
              <button className="btn btn-success" onClick={onComplete}>
                <FiCheck className="me-1" /> Mark Complete
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline-primary" onClick={onCreatePrescription}>
                <FiPlus className="me-1" /> Create Prescription
              </button>
              <button className="btn btn-success" onClick={onComplete}>
                <FiCheck className="me-1" /> Complete Anyway
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default CompleteAppointmentModal;