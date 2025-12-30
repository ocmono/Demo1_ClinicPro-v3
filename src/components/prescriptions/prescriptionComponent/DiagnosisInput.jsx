import React, { useState, useRef } from 'react';
import { IoIosMedical } from 'react-icons/io';

const DiagnosisInput = ({
  prescriptionFormData,
  errors,
  colors,
  allDiagnoses,
  loadingSymptoms,
  handleFieldChange,
  handleAutoResize,
  showDiagnosisSuggestions,
  setShowDiagnosisSuggestions,
  filteredDiagnosisSuggestions,
  handleDiagnosisSuggestionClick,
  setMedicineSuggestions,
  setInstructionSuggestions,
  suggestionBoxRef,
  diagnosisInputRef
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleFocus = () => {
    setIsFocused(true);
    if (!showDiagnosisSuggestions && prescriptionFormData.diagnosis) {
      setShowDiagnosisSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding to allow click events
    setTimeout(() => {
      setShowDiagnosisSuggestions(false);
    }, 200);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    handleFieldChange("diagnosis", value);
    handleAutoResize(e);
    
    // Show suggestions if there's input
    if (value.trim()) {
      setShowDiagnosisSuggestions(true);
    }
  };

  const handleSuggestionClick = (diagnosis) => {
    handleFieldChange("diagnosis", diagnosis.label);
    
    // Load associated data if from template
    if (!diagnosis.isSpecialty) {
      if (diagnosis.medicines?.length > 0) {
        setMedicineSuggestions(diagnosis.medicines);
      }
      if (diagnosis.instructions?.length > 0) {
        setInstructionSuggestions(diagnosis.instructions);
      }
    }
    
    setShowDiagnosisSuggestions(false);
    setInputValue('');
  };

  // Filter suggestions based on input
  const getFilteredSuggestions = () => {
    if (!prescriptionFormData.diagnosis?.trim()) {
      return filteredDiagnosisSuggestions.slice(0, 8);
    }
    
    const searchText = prescriptionFormData.diagnosis.toLowerCase();
    return filteredDiagnosisSuggestions
      .filter(item => item.label.toLowerCase().includes(searchText))
      .slice(0, 8);
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div className="col-md-6">
      <div className="card bg-light border-0 shadow-sm" style={{
        borderRadius: '5px',
        borderLeft: `4px solid ${colors.success}`,
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
              background: `linear-gradient(135deg, ${colors.success}20, ${colors.success}40)`
            }}>
              <IoIosMedical size={20} className="text-success" />
            </div>
            <div className="flex-grow-1">
              <label className="form-label fw-bold mb-0" style={{ fontSize: '1.1em', color: colors.dark }}>
                Diagnosis
              </label>
              <small className="text-muted d-block" style={{ fontSize: '0.8em' }}>
                Medical conclusion or select from suggestions
              </small>
            </div>
            {allDiagnoses?.length > 0 && !loadingSymptoms && (
              <span className="badge" style={{
                backgroundColor: `${colors.success}20`,
                color: colors.success
              }}>
                {allDiagnoses.length} diagnoses
              </span>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              rows={1}
              className={`form-control bg-white border-0 shadow-sm px-3 ${errors.diagnosis ? 'is-invalid' : ''}`}
              placeholder="Enter diagnosis or select from suggestions..."
              value={prescriptionFormData.diagnosis}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              autoComplete="off"
              ref={diagnosisInputRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // Handle Enter key for quick selection
                  if (filteredSuggestions.length > 0 && !showDiagnosisSuggestions) {
                    setShowDiagnosisSuggestions(true);
                  } else if (showDiagnosisSuggestions && filteredSuggestions.length > 0) {
                    handleSuggestionClick(filteredSuggestions[0]);
                  }
                }
                if (e.key === 'Escape') {
                  setShowDiagnosisSuggestions(false);
                }
              }}
              style={{
                fontSize: '1em',
                borderRadius: 8,
                minHeight: 32,
                maxHeight: 120,
                overflow: 'hidden',
                resize: 'none',
                border: errors.diagnosis ? `2px solid ${colors.danger}` : '1px solid #dee2e6',
                backgroundColor: isFocused ? `${colors.success}05` : 'white',
                transition: 'all 0.2s ease'
              }}
            />

            {/* Diagnosis Suggestions Dropdown */}
            {showDiagnosisSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionBoxRef}
                className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                style={{
                  zIndex: 9999,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  top: '100%',
                  left: 0,
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div className="p-2 border-bottom bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <small className="fw-bold text-primary">Diagnosis Suggestions</small>
                    <small className="text-muted ms-2">
                      ({filteredSuggestions.length} of {filteredDiagnosisSuggestions.length})
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger py-0 px-2"
                    onClick={() => setShowDiagnosisSuggestions(false)}
                    style={{ fontSize: '0.7rem', lineHeight: '1' }}
                  >
                    ×
                  </button>
                </div>
                
                {filteredSuggestions.map((diagnosis, index) => (
                  <div
                    key={`diagnosis-${index}`}
                    className="p-2 border-bottom cursor-pointer diagnosis-suggestion-item"
                    onClick={() => handleSuggestionClick(diagnosis)}
                    style={{
                      transition: 'all 0.2s ease',
                      borderLeft: '3px solid transparent'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          {diagnosis.isSpecialty ? (
                            <i className="bi bi-hospital text-info" style={{ fontSize: '0.8rem' }}></i>
                          ) : (
                            <i className="bi bi-file-earmark-text text-secondary" style={{ fontSize: '0.8rem' }}></i>
                          )}
                          <strong className="text-dark" style={{ fontSize: '0.95rem' }}>
                            {diagnosis.label}
                          </strong>
                        </div>
                        
                        {diagnosis.source && (
                          <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>
                            <i className="bi bi-tag me-1"></i>
                            From: {diagnosis.source}
                          </small>
                        )}
                        
                        {!diagnosis.isSpecialty && diagnosis.medicines?.length > 0 && (
                          <div className="mt-1">
                            <small className="text-muted">Includes medicines:</small>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {diagnosis.medicines.slice(0, 3).map((med, idx) => (
                                <span 
                                  key={idx} 
                                  className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {med}
                                </span>
                              ))}
                              {diagnosis.medicines.length > 3 && (
                                <span 
                                  className="badge bg-secondary bg-opacity-10 text-secondary"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  +{diagnosis.medicines.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`badge ${diagnosis.isSpecialty ? 'bg-info' : 'bg-secondary'}`}
                        style={{ fontSize: '0.7rem', fontWeight: '600' }}
                      >
                        {diagnosis.isSpecialty ? 'Specialty' : 'Template'}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="p-2 bg-light border-top">
                  <small className="text-muted d-flex align-items-center gap-2">
                    <i className="bi bi-info-circle"></i>
                    <div>
                      <div>Click to select, or press <kbd>Enter</kbd> for first suggestion</div>
                      <div>Press <kbd>Esc</kbd> to close suggestions</div>
                    </div>
                  </small>
                </div>
              </div>
            )}
          </div>
          
          {errors.diagnosis ? (
            <div className="mt-2 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle text-danger"></i>
              <p className="input-error text-danger mb-0" style={{ fontSize: '0.85em' }}>
                {errors.diagnosis}
              </p>
            </div>
          ) : (
            !loadingSymptoms && allDiagnoses?.length > 0 && (
              <small className="text-muted d-block mt-2 d-flex align-items-center gap-1">
                <i className="bi bi-info-circle me-1"></i>
                <span>
                  {allDiagnoses.length} specialty diagnoses available
                </span>
              </small>
            )
          )}
          
          {prescriptionFormData.diagnosis && (
            <div className="mt-2">
              <small className="text-muted d-flex justify-content-between">
                <span>
                  <i className="bi bi-text-paragraph me-1"></i>
                  {prescriptionFormData.diagnosis.length} characters
                </span>
                <span>
                  {prescriptionFormData.diagnosis.split(/\s+/).length} words
                </span>
              </small>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .diagnosis-suggestion-item:hover {
          background-color: rgba(91, 192, 222, 0.05) !important;
          border-left-color: ${diagnosis => diagnosis.isSpecialty ? '#17a2b8' : '#6c757d'} !important;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DiagnosisInput;