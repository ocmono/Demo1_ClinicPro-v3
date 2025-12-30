import React from 'react';
import { FiUser } from 'react-icons/fi';
import { FaUser } from "react-icons/fa";

const PatientDetails = ({ patient, colors }) => {
  return (
    <div className="card border-0 shadow-md position-fixed top-10" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
    }}>
      <div className="card-header bg-transparent border-0 p-4 pb-0">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
            width: '48px',
            height: '48px',
            background: `linear-gradient(135deg, ${colors.purple}20, ${colors.purple}40)`
          }}>
            <FiUser size={24} className="text-purple" />
          </div>
          <div>
            <h6 className="fw-bold mb-0" style={{ color: colors.dark }}>Patient Details</h6>
            <small className="text-muted">Selected patient information</small>
          </div>
        </div>
      </div>
      <div className="card-body p-4">
        {patient ? (
          <div className="mb-0">
            <div className="mb-4">
              <h5 className="fw-bold" style={{ color: colors.purple }}>{patient.patientName || "Unknown Patient"}</h5>
              <div className="badge rounded-pill px-3 py-1 mb-3" style={{
                backgroundColor: `${colors.purple}10`,
                color: colors.purple
              }}>
                Patient ID: {patient.patientId || patient.id || "N/A"}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <small className="text-muted d-block">Contact</small>
                <div className="fw-semibold" style={{ color: colors.dark }}>
                  {patient?.patientPhone || "N/A"}
                </div>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Email</small>
                <div className="fw-semibold text-truncate" style={{ color: colors.dark }}>
                  {patient?.patientEmail || "N/A"}
                </div>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Age</small>
                <div className="fw-semibold" style={{ color: colors.dark }}>
                  {patient?.patientAge || "N/A"}
                </div>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Gender</small>
                <div className="fw-semibold" style={{ color: colors.dark }}>
                  {patient?.gender || "N/A"}  
                </div>
              </div>
              <div className="col-12">
                <hr className="my-2" />
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Doctor</small>
                <div className="fw-semibold" style={{ color: colors.dark }}>
                  {patient.doctor || "N/A"}
                </div>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Speciality</small>
                <div className="fw-semibold" style={{ color: colors.dark }}>
                  {patient?.doctorSpeciality || "N/A"}
                </div>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Appointment Date</small>
                <div className="fw-semibold" style={{ color: colors.dark }}>
                  {patient?.appointment_date || "N/A"}
                </div>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Time</small>
                <div className="fw-semibold" style={{ color: colors.dark }}>
                  {patient?.appointment_time || "N/A"}
                </div>
              </div>
              <div className="col-12">
                <hr className="my-2" />
              </div>
              {patient?.bloodGroup && (
                <div className="col-6">
                  <small className="text-muted d-block">Blood Group</small>
                  <div className="fw-semibold" style={{ color: colors.danger }}>
                    {patient.bloodGroup}
                  </div>
                </div>
              )}
              {patient?.weight && (
                <div className="col-6">
                  <small className="text-muted d-block">Weight</small>
                  <div className="fw-semibold" style={{ color: colors.dark }}>
                    {patient.weight} kg
                  </div>
                </div>
              )}
              {patient?.allergies && (
                <div className="col-12">
                  <small className="text-muted d-block">Allergies</small>
                  <div className="fw-semibold" style={{ color: colors.dark }}>
                    {patient.allergies}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{
              width: '80px',
              height: '80px',
              backgroundColor: `${colors.purple}10`
            }}>
              <FaUser style={{
                fontSize: '2rem',
                color: colors.purple
              }} />
            </div>
            <p className="text-muted mb-1">No patient selected</p>
            <small className="text-muted">Select a patient from the dropdown above</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetails;