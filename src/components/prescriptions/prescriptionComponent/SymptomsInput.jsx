import React, { useState, useRef, useEffect } from 'react';
import { FiActivity } from 'react-icons/fi';
import { toast } from "react-toastify";

const SymptomsInput = ({
  prescriptionFormData,
  errors,
  colors,
  specialtySymptoms,
  loadingSymptoms,
  handleSymptomsChange,
  extractKeywordsAndFindMedicines,
  setShowSymptomSuggestions,
  showSymptomSuggestions,
  symptomsInputRef,
  SymptomSuggestions,
  handleFieldChange,
  handleAutoResize
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (prescriptionFormData.symptoms && specialtySymptoms && specialtySymptoms.length > 0 && !loadingSymptoms) {
      setShowSymptomSuggestions(true);
    }
    extractKeywordsAndFindMedicines(prescriptionFormData.symptoms);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSymptomSuggestions(false);
    }, 200);
  };

  return (
    <div className="col-md-6">
      <div className="card bg-light border-0 shadow-sm mb-0" style={{
        borderRadius: '5px',
        borderLeft: `4px solid ${colors.warning}`,
        background: 'white',
        transition: 'all 0.3s ease',
        transform: isFocused ? 'translateY(-2px)' : 'none',
        boxShadow: isFocused ? '0 8px 25px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
              width: '42px',
              height: '42px',
              background: `linear-gradient(135deg, ${colors.warning}20, ${colors.warning}40)`
            }}>
              <FiActivity size={20} className="text-warning" />
            </div>
            <div className="flex-grow-1">
              <label className="form-label fw-bold mb-0" style={{ fontSize: '1.1em', color: colors.dark }}>
                Symptoms
              </label>
              <small className="text-muted d-block" style={{ fontSize: '0.8em' }}>
                Describe patient's complaints
              </small>
            </div>
            {specialtySymptoms && specialtySymptoms.length > 0 && !loadingSymptoms && (
              <span className="badge" style={{
                backgroundColor: `${colors.warning}20`,
                color: colors.warning
              }}>
                {specialtySymptoms.length} suggestions
              </span>
            )}
          </div>
          
          <div style={{ position: 'relative' }}>
            <textarea
              rows={1}
              className={`form-control bg-white border-0 shadow-sm px-3 ${errors.symptoms ? 'is-invalid' : ''}`}
              placeholder="Enter patient symptoms..."
              value={prescriptionFormData.symptoms}
              onChange={handleSymptomsChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              ref={symptomsInputRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFieldChange("symptoms", prescriptionFormData.symptoms + '\n');
                }
              }}
              style={{
                fontSize: '1em',
                borderRadius: 8,
                minHeight: 32,
                maxHeight: 120,
                overflow: 'hidden',
                resize: 'none',
                border: errors.symptoms ? `2px solid ${colors.danger}` : '1px solid #dee2e6',
                backgroundColor: isFocused ? `${colors.warning}05` : 'white',
                transition: 'all 0.2s ease'
              }}
            />
            
            {showSymptomSuggestions && (
              <div className="position-absolute w-100" style={{ zIndex: 1000 }}>
                <SymptomSuggestions />
              </div>
            )}
          </div>
          
          {errors.symptoms ? (
            <div className="mt-2 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle text-danger"></i>
              <p className="input-error text-danger mb-0" style={{ fontSize: '0.85em' }}>
                {errors.symptoms}
              </p>
            </div>
          ) : (
            !loadingSymptoms && specialtySymptoms && specialtySymptoms.length > 0 && (
              <small className="text-muted d-block mt-2 d-flex align-items-center gap-1">
                <i className="bi bi-info-circle me-1"></i>
                <span>
                  {specialtySymptoms.length} specialty symptoms available for 
                  <span className="fw-semibold ms-1">
                    {prescriptionFormData.patient?.doctorSpeciality || 'this specialty'}
                  </span>
                </span>
              </small>
            )
          )}
          
          {prescriptionFormData.symptoms && (
            <div className="mt-2">
              <small className="text-muted d-flex justify-content-between">
                <span>
                  <i className="bi bi-text-paragraph me-1"></i>
                  {prescriptionFormData.symptoms.length} characters
                </span>
                <span>
                  {prescriptionFormData.symptoms.split(/\s+/).length} words
                </span>
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default SymptomsInput;