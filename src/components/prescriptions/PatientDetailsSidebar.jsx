// components/PatientDetailsSidebar.js
import React from 'react';
import { FiInfo } from 'react-icons/fi';

const PatientDetailsSidebar = ({ patient }) => {
  return (
    <div className="card">
      <div className="card-header d-flex align-items-center gap-2">
        <span className="fw-bold">Patient Details</span>
        <span className="fs-5 text-warning"><FiInfo /></span>
      </div>
      <div className="card-body">
        {patient ? (
          <div className="mb-3">
            <div className='w-100 text-muted fs-14' style={{ lineHeight: 1.7 }}>
              <div><b>Patient ID:</b> {patient.patientId || patient.id || "N/A"}</div>
              <div><b>Name:</b> {patient.patientName || "N/A"}</div>
              <div><b>Email:</b> {patient?.patientEmail || "N/A"}</div>
              <div><b>Contact:</b> {patient?.patientPhone || "N/A"}</div>
              <div><b>Age:</b> {patient?.patientAge || "N/A"}</div>
              <div><b>Doctor:</b> {patient.doctor || "N/A"}</div>
              <div><b>Appointment Date:</b> {patient?.appointment_date || "N/A"}</div>
              <div><b>Appointment Time:</b> {patient?.appointment_time || "N/A"}</div>
              <div><b>Gender:</b> {patient?.gender}</div>
              <div><b>Address:</b> {patient?.address}</div>
              <div><b>BloodGroup:</b> {patient?.bloodGroup}</div>
              <div><b>Weight:</b> {patient?.weight}</div>
              <div><b>Source:</b> {patient?.source}</div>
              <div><b>Speciality:</b> {patient?.doctorSpeciality}</div>
              <div><b>Allergies:</b> {patient?.allergies}</div>
            </div>
          </div>
        ) : (
          <p className="text-muted my-2 text-center">No patient selected</p>
        )}
      </div>
    </div>
  );
};

export default PatientDetailsSidebar;