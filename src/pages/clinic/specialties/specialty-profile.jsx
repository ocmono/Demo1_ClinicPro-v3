import React, { useState, useEffect, useMemo } from 'react';
import { usePrescription } from '../../../contentApi/PrescriptionProvider';
import { FiCalendar, FiFileText, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { format, differenceInDays, differenceInWeeks } from 'date-fns';

const PreviousPrescriptions = ({ patient }) => {
  const { fetchPrescriptionsByPatientId } = usePrescription();
  const [previousPrescriptions, setPreviousPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPrescription, setExpandedPrescription] = useState(null);

  // Get patient ID from patient object
  const patientId = useMemo(() => {
    if (!patient) return null;
    return patient.id || patient.patientId || patient.patient_id;
  }, [patient]);

  // Fetch previous prescriptions when patient changes
  useEffect(() => {
    const loadPrescriptions = async () => {
      if (!patientId) {
        setPreviousPrescriptions([]);
        return;
      }

      setLoading(true);
      try {
        const prescriptions = await fetchPrescriptionsByPatientId(patientId);
        
        // Filter appointments: only show until present day and before present time
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
        
        const filtered = Array.isArray(prescriptions)
          ? prescriptions.filter((prescription) => {
              const appointmentDate = prescription.appointment_date || prescription.created_at;
              if (!appointmentDate) return false;
              
              const appointmentDateObj = new Date(appointmentDate);
              const appointmentDateOnly = new Date(
                appointmentDateObj.getFullYear(),
                appointmentDateObj.getMonth(),
                appointmentDateObj.getDate()
              );
              
              // If appointment date is in the future, exclude it
              if (appointmentDateOnly > today) {
                return false;
              }
              
              // If appointment date is today, check if time has passed
              if (appointmentDateOnly.getTime() === today.getTime()) {
                const appointmentTime = prescription.appointment_time;
                if (appointmentTime) {
                  // Parse time string (format: HH:MM or HH:MM:SS)
                  const timeParts = appointmentTime.split(':');
                  if (timeParts.length >= 2) {
                    const appointmentTimeMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
                    // Only include if appointment time is before current time
                    return appointmentTimeMinutes < currentTime;
                  }
                }
                // If no time specified for today's appointment, include it
                return true;
              }
              
              // If appointment date is in the past, include it
              return true;
            })
          : [];
        
        // Sort by date (newest first)
        const sorted = filtered.sort((a, b) => {
          const dateA = new Date(a.appointment_date || a.created_at || 0);
          const dateB = new Date(b.appointment_date || b.created_at || 0);
          return dateB - dateA;
        });
        
        setPreviousPrescriptions(sorted);
      } catch (error) {
        console.error('Error loading previous prescriptions:', error);
        setPreviousPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [patientId, fetchPrescriptionsByPatientId]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateWithRelative = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);
      
      const daysDiff = differenceInDays(today, appointmentDate);
      
      // If within 1 month (30 days), show relative time
      if (daysDiff <= 30) {
        if (daysDiff === 0) {
          return 'Today';
        } else if (daysDiff === 1) {
          return 'Yesterday';
        } else if (daysDiff < 7) {
          return `${daysDiff} days ago`;
        } else {
          const weeksDiff =     (today, appointmentDate);
          if (weeksDiff === 1) {
            return '1 week ago';
          } else {
            return `${weeksDiff} weeks ago`;
          }
        }
      }
      
      // If older than 1 month, show formatted date
      return formatDate(dateString);
    } catch {
      return formatDate(dateString);
    }
  };

  const formatDateSquare = (dateString) => {
    if (!dateString) return { day: '—', month: '' };
    try {
      const date = new Date(dateString);
      return {
        day: format(date, 'dd'),
        month: format(date, 'MMM').toUpperCase(),
        year: format(date, 'yyyy')
      };
    } catch {
      return { day: '—', month: '' };
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Extract HH:MM format
  };

  const toggleExpand = (prescriptionId) => {
    setExpandedPrescription(expandedPrescription === prescriptionId ? null : prescriptionId);
  };

  if (!patient) {
    return (
      <div className="mt-3">
        <div className="text-center text-muted py-3">
          <FiFileText size={24} className="mb-2 opacity-50" />
          <p className="mb-0 small">Select a patient to view previous prescriptions</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-3">
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted small mt-2 mb-0">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (previousPrescriptions.length === 0) {
    return (
      <div className="mt-3">
        <div className="text-center text-muted py-3">
          <FiFileText size={24} className="mb-2 opacity-50" />
          <p className="mb-0 small">No previous prescriptions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="fw-bold mb-0">Previous Prescriptions</h6>
        <span className="badge bg-light text-dark">{previousPrescriptions.length}</span>
      </div>
      
      <div className="position-relative" >
        {/* Timeline line */}
        <div 
          className="position-absolute"
          style={{
            right: '10px',
            top: '20px',
            bottom: '0',
            width: '2px',
            backgroundColor: '#e0e0e0',
            zIndex: 0
          }}
        />
        
        <div className="d-flex flex-column gap-2" style={{ position: 'relative', zIndex: 0, paddingRight: '30px' }}>
          {previousPrescriptions.map((prescription) => {
            const isExpanded = expandedPrescription === prescription.id;
            const appointmentDate = prescription.appointment_date || prescription.created_at;
            const appointmentTime = prescription.appointment_time;
            const dateSquare = formatDateSquare(appointmentDate);
            
            // Count items
            const medicinesCount = Array.isArray(prescription.medicines) ? prescription.medicines.length : 0;
            const vaccinesCount = Array.isArray(prescription.vaccines) ? prescription.vaccines.length : 0;
            const labTestsCount = Array.isArray(prescription.lab_tests) ? prescription.lab_tests.length : 0;
            
            // Get diagnosis preview
            const diagnosisPreview = Array.isArray(prescription.diagnosis)
              ? prescription.diagnosis
                  .map((d) => (typeof d === 'object' ? d.diagnosis : d))
                  .filter(Boolean)
                  .join(', ')
              : prescription.diagnosis || '—';

            return (
              <div
                key={prescription.id}
                className="position-relative"
              >
                {/* Content Section */}
                <div
                  className="border rounded p-2"
                  style={{
                    backgroundColor: '#fafbfc',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleExpand(prescription.id)}
                >
              {/* Header */}
              <div className="d-flex align-items-start justify-content-between">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-1 mb-1">
                    <FiCalendar size={14} className="text-muted" />
                    <span className="small fw-semibold">{formatDateWithRelative(appointmentDate)}</span>
                    {appointmentTime && (
                      <>
                        <FiClock size={12} className="text-muted ms-2" />
                        <span className="small text-muted">{formatTime(appointmentTime)}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Counts */}
                  <div className="d-flex gap-2 flex-wrap">
                    {medicinesCount > 0 && (
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '0.6rem',
                          backgroundColor: 'rgba(13, 110, 253, 0.15)',
                          color: '#0056b3',
                          border: '1px solid rgba(13, 110, 253, 0.2)'
                        }}
                      >
                        {medicinesCount} Med{medicinesCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {vaccinesCount > 0 && (
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '0.6rem',
                          backgroundColor: 'rgba(25, 135, 84, 0.15)',
                          color: '#0f5132',
                          border: '1px solid rgba(25, 135, 84, 0.2)'
                        }}
                      >
                        {vaccinesCount} Vac{vaccinesCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {labTestsCount > 0 && (
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: '0.6rem',
                          backgroundColor: 'rgba(13, 202, 240, 0.15)',
                          color: '#087990',
                          border: '1px solid rgba(13, 202, 240, 0.2)'
                        }}
                      >
                        {labTestsCount} Test{labTestsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Follow-up Date */}
                {prescription.follow_up_date && (
                    <div className="">
                      <small className="fw-semibold text-muted d-block">Follow-up:</small>
                      <span className="small">{formatDate(prescription.follow_up_date)}</span>
                    </div>
                  )}
                <button
                  className="btn btn-sm p-0 border-0 bg-transparent"
                  style={{ minWidth: '20px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(prescription.id);
                  }}
                >
                  {isExpanded ? (
                    <FiChevronUp size={16} className="text-muted" />
                  ) : (
                    <FiChevronDown size={16} className="text-muted" />
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-top">
                  <div className='row'>  
                    {/* Symptoms */}
                    {prescription.symptoms && (
                      <div className="col-6 mb-2">
                        <small className="fw-semibold text-muted d-block mb-1">Symptoms:</small>
                        <div className="d-flex flex-wrap gap-1">
                          {Array.isArray(prescription.symptoms) ? (
                            prescription.symptoms.map((s, idx) => (
                              <span
                                key={idx}
                                className="badge"
                                style={{
                                  backgroundColor: '#e9ecef',
                                  color: '#495057',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  padding: '0.25rem 0.5rem'
                                }}
                              >
                                {typeof s === 'object' ? s.symptom : s}
                              </span>
                            ))
                          ) : (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#e9ecef',
                                color: '#495057',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                padding: '0.25rem 0.5rem'
                              }}
                            >
                              {prescription.symptoms}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {diagnosisPreview !== '—' && (
                      <div className="col-6 mb-2">
                        <small className="fw-semibold text-muted d-block mb-1">Diagnosis:</small>
                        <div className="d-flex flex-wrap gap-1">
                          {Array.isArray(prescription.diagnosis) ? (
                            prescription.diagnosis.map((d, idx) => (
                              <span
                                key={idx}
                                className="badge"
                                style={{
                                  backgroundColor: '#e9ecef',
                                  color: '#495057',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  padding: '0.25rem 0.5rem'
                                }}
                              >
                                {typeof d === 'object' ? d.diagnosis : d}
                              </span>
                            ))
                          ) : (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#e9ecef',
                                color: '#495057',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                padding: '0.25rem 0.5rem'
                              }}
                            >
                              {diagnosisPreview}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Medicines Preview */}
                  {medicinesCount > 0 && (
                    <div className="mb-2">
                      <small className="fw-semibold text-muted d-block mb-1">Medicines:</small>
                      <div className="small">
                        <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem' }}>
                          {prescription.medicines.slice(0, 3).map((med, idx) => (
                            <li key={idx}>
                              {med.medicine_name || med.medicineName || 'Unknown'} 
                              {med.dose && ` - ${med.dose}`}
                            </li>
                          ))}
                          {medicinesCount > 3 && (
                            <li className="text-muted">+{medicinesCount - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {prescription.instructions && (
                    <div>
                      <small className="fw-semibold text-muted d-block mb-1">Instructions:</small>
                      <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                        {prescription.instructions}
                      </div>
                    </div>
                  )}
                </div>
              )}
                </div>

                {/* Square - Rightmost */}
                <div 
                  className="position-absolute py-1"
                  style={{
                    left: '100%',
                    top: '20px',
                    width: '40px',
                    display: 'flex',    
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    border: '1.5px solid #6c757d',
                    borderRadius: '3px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    zIndex: 1,
                    transform: `rotate(90deg)`
                  }}
                >
                  <div 
                    className="text-uppercase"
                    style={{
                      fontSize: '7px',
                      lineHeight: '1',
                      color: '#6c757d',
                      marginTop: '1px',
                      fontWeight: '600'
                    }}
                  >
                    {dateSquare.day} {dateSquare.month}
                  </div>
                  {dateSquare.year && (
                    <div 
                      style={{
                        fontSize: '6px',
                        lineHeight: '1',
                        color: '#adb5bd',
                        marginTop: '0.5px'
                      }}
                    >
                      {dateSquare.year}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PreviousPrescriptions;
