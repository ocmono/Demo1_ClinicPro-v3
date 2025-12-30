import React from "react";
import { useState } from "react";
import {
  FiUser,
  FiCheck,
  FiFileText,
  FiRotateCcw,
  FiX,
  FiClock,
} from "react-icons/fi";

// Constants (keep them in component file)
const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DONE: 'done'
};

// Utility functions (keep them in component file)
const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d) ? '' : d.toISOString().split('T')[0];
};

const normalizeStatus = (status) => (status || '').toLowerCase().trim();

const formatAppointmentDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const day = days[d.getDay()];
  const date = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear().toString().slice(-2);

  return `${day}-${date}${month}-${year}`;
};

const parseTime = (timeStr) => {
  if (!timeStr) return 0;

  const time = timeStr.toString().toUpperCase().trim();
  let [timePart, modifier] = time.split(/(AM|PM)/);

  if (!modifier) {
    if (time.includes('AM')) {
      modifier = 'AM';
      timePart = time.replace('AM', '').trim();
    } else if (time.includes('PM')) {
      modifier = 'PM';
      timePart = time.replace('PM', '').trim();
    }
  }

  let [hours, minutes] = timePart.split(':').map(part => parseInt(part) || 0);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const isCurrentAppointment = (appointment) => {
  const today = normalizeDate(new Date());
  const appointmentDate = normalizeDate(appointment.date);

  if (appointmentDate !== today) return false;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const appointmentTime = parseTime(appointment.time);

  const timeWindowBefore = 15;
  const timeWindowAfter = 15;
  const startWindow = appointmentTime - timeWindowBefore;
  const endWindow = appointmentTime + timeWindowAfter;

  return currentTime >= startWindow && currentTime <= endWindow;
};

const AppointmentCard = React.memo(({
  appointment,
  onViewProfile,
  onCreatePrescription,
  onComplete,
  onViewPrescription,
  onRevert,
  onApprove,
  onReject,
  showActions = true,
  status,
  userRole // <- this comes in as a prop
}) => {
  const isCurrent = isCurrentAppointment(appointment);
  const statusClass = normalizeStatus(appointment.status);

  return (
    <div className={`appointment-card ${isCurrent ? 'current-appointment' : ''} ${statusClass}`}>
      {isCurrent && (
        <div className="current-appointment-indicator" title="Current Appointment in Progress">
          <div className="red-pulse-dot"></div>
        </div>
      )}

      {/* Doctor Name Overlay - Only for patients */}
      {userRole === 'doctor' && appointment.doctor && (
        <div className="doctor-name">
          Dr. {appointment.doctor}
        </div>
      )}

      <div className="appointment-card-content">
        <div className="appointment-main-info">
          {isCurrent && <span className="red-dot-before-id"></span>}
          <div className={`appointment-id ${statusClass}`}>#{appointment.id}</div>
          <div className="patient-name">{appointment.patientName}</div>

          <div className="appointment-time">
            <FiClock size={14} />
            <span>{appointment.time}</span>
          </div>
          <div className="appointment-date">{formatAppointmentDate(appointment.date)}</div>
        </div>

        {showActions && (
          <div className="appointment-actions">


            {status === STATUS.APPROVED && (
              <>
                <button className="btn btn-sm btn-outline-info" onClick={() => onViewProfile(appointment)} data-bs-toggle="tooltip" title="View Profile">
                  <FiUser size={12} />
                </button>
                <button className="btn btn-sm btn-outline-success" onClick={() => onComplete(appointment)} data-bs-toggle="tooltip" title="Mark as Done">
                  <FiCheck size={12} />
                </button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onCreatePrescription(appointment)} data-bs-toggle="tooltip" title="Create Prescription">
                  <FiFileText size={12} />
                </button>
              </>
            )}

            {status === STATUS.DONE && (
              <>
                <button className="btn btn-sm btn-outline-info" onClick={() => onViewProfile(appointment)} data-bs-toggle="tooltip" title="View Profile">
                  <FiUser size={12} />
                </button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onViewPrescription(appointment)} data-bs-toggle="tooltip" title="View Prescription">
                  <FiFileText size={12} />
                </button>
                <button className="btn btn-sm btn-outline-warning" onClick={() => onRevert(appointment.id)} data-bs-toggle="tooltip" title="Revert to Approved">
                  <FiRotateCcw size={12} />
                </button>
              </>
            )}

            {status === STATUS.REJECTED && (
              <>
                <button className="btn btn-sm btn-outline-info" onClick={() => onViewProfile(appointment)} data-bs-toggle="tooltip" title="View Profile">
                  <FiUser size={12} />
                </button>
                <button className="btn btn-sm btn-outline-warning" onClick={() => onRevert(appointment.id)} data-bs-toggle="tooltip" title="Restore Appointment">
                  <FiRotateCcw size={12} />
                </button>
              </>
            )}

            {status === STATUS.PENDING && (
              <>
                <button className="btn btn-sm btn-outline-info" onClick={() => onViewProfile(appointment)} data-bs-toggle="tooltip" title="View Profile">
                  <FiUser size={12} />
                </button>
                <button className="btn btn-sm btn-outline-success" onClick={() => onApprove(appointment.id)} data-bs-toggle="tooltip" title="Approve Appointment">
                  <FiCheck size={12} />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onReject(appointment.id)} data-bs-toggle="tooltip" title="Reject Appointment">
                  <FiX size={12} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default AppointmentCard;