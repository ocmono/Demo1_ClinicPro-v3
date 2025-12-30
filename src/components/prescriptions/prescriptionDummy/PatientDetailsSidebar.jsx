import React from "react";

const PatientDetailsSidebar = React.memo(({ patient }) => {
  if (!patient) {
    return (
      <div className="text-center text-muted py-4">
        <small>No patient selected</small>
      </div>
    );
  }

  return (
    <div className="patient-details text-muted fs-14 ">
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Patient ID</span>
        <span>{patient.patientId || patient.id || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Name</span>
        <span>{patient.patientName || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Email</span>
        <span>{patient.patientEmail || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Contact</span>
        <span>{patient.patientPhone || "N/A"}</span>
      </div>
      <hr  className="my-2"/>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Age</span>
        <span>{patient.patientAge || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Gender</span>
        <span>{patient.gender || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Blood Group</span>
        <span>{patient.bloodGroup || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Weight</span>
        <span>{patient.weight || "N/A"}</span>
      </div>
      <hr  className="my-2"/>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Doctor</span>
        <span>{patient.doctor || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Speciality</span>
        <span>
          {Array.isArray(patient?.doctorSpeciality) ? 
          patient.doctorSpeciality.join(', ') : patient?.doctorSpeciality || 'N/A'}
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Appointment</span>
        <span>
          {patient.appointment_date || "N/A"}{" "}
          {patient.appointment_time && `• ${patient.appointment_time}`}
        </span>
      </div>
      <hr  className="my-2"/>
      <div>
        <span className="fw-semibold">Address</span>
        <div>{patient.address || "N/A"}</div>
      </div>
      <div className="mt-2">
        <span className="fw-semibold">Allergies</span>
        <div>{patient.allergies || "None reported"}</div>
      </div>
      <div className="mt-2">
        <span className="fw-semibold">Source</span>
        <div>{patient.source || "N/A"}</div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if patient ID changes
  return prevProps.patient?.id === nextProps.patient?.id;
});

PatientDetailsSidebar.displayName = 'PatientDetailsSidebar';
export default PatientDetailsSidebar;