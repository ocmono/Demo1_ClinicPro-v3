import React, { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiFileText, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { format, differenceInDays, differenceInWeeks } from 'date-fns';
import { usePrescription } from '../../../contentApi/PrescriptionProvider';

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

        console.log( `'''''''''''''''''''''`,prescriptions);
        
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
          const weeksDiff = differenceInWeeks(today, appointmentDate);
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
    if (!dateString) return { day: '—', dayAbbr: '' };
    try {
      const date = new Date(dateString);
      return {
        day: format(date, 'dd'),
        dayAbbr: format(date, 'EEE').toUpperCase().substring(0, 3),
        month: format(date, 'MMM').toUpperCase(),
        year: format(date, 'yyyy')
      };
    } catch {
      return { day: '—', dayAbbr: '' };
    }
  };

  const formatTimeRange = (timeString) => {
    if (!timeString) return '';
    // If time is in HH:MM format, convert to 12-hour format
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${period}`;
    }
    return timeString.substring(0, 5);
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
      
      <div className="d-flex flex-column">
        {previousPrescriptions.map((prescription, index) => {
          const isExpanded = expandedPrescription === prescription.id;
          const appointmentDate = prescription.appointment_date || prescription.created_at;
          const appointmentTime = prescription.appointment_time;
          const dateSquare = formatDateSquare(appointmentDate);
          
          // Count items
          const medicinesCount = Array.isArray(prescription.medicines) ? prescription.medicines.length : 0;
          const vaccinesCount = Array.isArray(prescription.vaccines) ? prescription.vaccines.length : 0;
          const labTestsCount = Array.isArray(prescription.lab_tests) ? prescription.lab_tests.length : 0;
          
          // Get diagnosis preview for dropdown
          const diagnosisPreview = Array.isArray(prescription.diagnosis)
            ? prescription.diagnosis
                .map((d) => (typeof d === 'object' ? d.diagnosis : d))
                .filter(Boolean)
                .join(', ')
            : prescription.diagnosis || '—';

          // Calculate time range (assuming appointment_time is start time, need end time or duration)
          // For now, showing just the appointment time
          const timeDisplay = appointmentTime ? appointmentTime : '';

          return (
            <div
              key={prescription.id}
              className="position-relative"
              style={{
                // borderBottom: index < previousPrescriptions.length - 1 ? '1px solid #e8eaed' : 'none',
                // paddingBottom: index < previousPrescriptions.length - 1 ? '12px' : '0',
                marginBottom: index < previousPrescriptions.length - 1 ? '12px' : '0',
              }}
            >
              {/* Unified Card Container */}
              <div
                className="rounded"
                style={{
                  backgroundColor: '#fafbfc',
                  overflow: 'hidden',
                }}
              >
                {/* Card Header - Clickable */}
                <div
                  className="d-flex align-items-center gap-3 p-2"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => toggleExpand(prescription.id)}
                >
                  {/* Date Box - Leftmost (Biggest) */}
                  <div 
                    className="d-flex flex-column align-items-center justify-content-center"
                    style={{
                      minWidth: '60px',
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      padding: '8px',
                    }}
                  >
                    <div 
                      style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        lineHeight: '1',
                        color: '#495057',
                      }}
                    >
                      {dateSquare.day}
                    </div>
                    <div 
                      style={{
                        fontSize: '10px',
                        fontWeight: '500',
                        lineHeight: '1',
                        color: '#6c757d',
                        marginTop: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {dateSquare.month}
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-grow-1 d-flex flex-column gap-1">
                    {/* Time Range */}
                    {timeDisplay && (
                      <div className="d-flex align-items-center gap-1">
                        <FiClock size={12} className="text-muted" />
                        <span className="small text-muted">{timeDisplay}</span> ●
                        <span className="small text-muted" style={{ borderBottom: '1px dashed #000', fontSize: '0.7rem',paddingBottom: '1px' , fontWeight: '600' }}> {formatDateWithRelative(appointmentDate)}</span>
                      </div>
                    )}
                    
                    {/* Counts */}
                    <div className="d-flex gap-2 flex-wrap">
                      {medicinesCount > 0 && (
                        <span 
                          className="badge text-dark" 
                          style={{ 
                            fontSize: '0.65rem',
                            padding: '0.2rem 0.4rem'
                          }}
                        >
                          {medicinesCount} Med{medicinesCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {vaccinesCount > 0 && (
                        <span     
                          className="badge text-dark" 
                          style={{ 
                            fontSize: '0.65rem',
                            padding: '0.2rem 0.4rem'
                          }}
                        >
                          {vaccinesCount} Vac{vaccinesCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {labTestsCount > 0 && (
                        <span 
                          className="badge text-dark" 
                          style={{ 
                            fontSize: '0.65rem',
                            padding: '0.2rem 0.4rem'
                          }}
                        >
                          {labTestsCount} Test{labTestsCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chevron Icon - Rightmost */}
                  {prescription.follow_up_date && (
                      <div className="">
                        <small className="fw-semibold text-muted d-block">Follow-up:</small>
                        <span className="small">{formatDate(prescription.follow_up_date)}</span>
                      </div>
                    )}
                  <button
                    className="btn btn-sm p-0 border-0 bg-transparent"
                    style={{ minWidth: '24px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(prescription.id);
                    }}
                  >
                    {isExpanded ? (
                      <FiChevronUp size={18} className="text-muted" />
                    ) : (
                      <FiChevronDown size={18} className="text-muted" />
                    )}
                  </button>
                </div>

                {/* Expanded Details - Part of the same card */}
                <div
                  style={{
                    maxHeight: isExpanded ? '1000px' : '0',
                    opacity: isExpanded ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out',
                    paddingTop: isExpanded ? '0' : '0',
                    paddingBottom: isExpanded ? '12px' : '0',
                  }}
                >
                  <div className="px-2 " style={{ backgroundColor: '#fafbfc' }}>
                    <div className='row'>  
                      {/* Symptoms */}
                      {prescription.symptoms && (
                        <div className="col-6 mb-2">
                          <small className="fw-semibold text-muted d-block mb-1">Symptoms:</small>
                            {prescription.symptoms.map((s, idx) => (
                              <small key={idx} className="text-muted">
                                {s.symptom} {idx < prescription.symptoms.length - 1 ? ',' : ''}
                              </small>
                            ))}
                        </div>
                      )}

                      {/* Diagnosis */}
                      {diagnosisPreview !== '—' && (
                        <div className="col-6 mb-2">
                          <small className="fw-semibold text-muted d-block mb-1">Diagnosis:</small>
                          {prescription.diagnosis.map((d, idx) => (
                            <small key={idx} className="text-muted">
                              {d.diagnosis} {idx < prescription.diagnosis.length - 1 ? ',' : ''}
                            </small>
                          ))}
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

                    {/* Head Circumference */}
                    {/* {prescription && (
                      <div>
                        <small className="fw-semibold text-muted mb-1">Height:</small>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                          {prescription.height}
                        </div>
                        <small className="fw-semibold text-muted mb-1">Weight:</small>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                          {prescription.weight}
                        </div>
                        <small className="fw-semibold text-muted mb-1">BP:</small>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                          {prescription.bp}
                        </div>
                        <small className="fw-semibold text-muted mb-1">Head Circumference:</small>
                        <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                          {prescription.headcircumference}
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviousPrescriptions;