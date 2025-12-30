// Export the SymptomSuggestions component separately
export const SymptomSuggestions = ({
  loadingSymptoms,
  showSymptomSuggestions,
  prescriptionFormData,
  specialtySymptoms,
  handleFieldChange,
  setShowSymptomSuggestions,
  symptomSuggestionsRef
}) => {
  if (loadingSymptoms || !showSymptomSuggestions || !prescriptionFormData.symptoms?.trim() || !specialtySymptoms?.length) {
    return null;
  }

  const inputValue = prescriptionFormData.symptoms.toLowerCase();
  const matchingSymptoms = specialtySymptoms.filter(symptom =>
    symptom?.name?.toLowerCase().includes(inputValue)
  ).slice(0, 5);

  if (matchingSymptoms.length === 0) {
    return null;
  }

  return (
    <div 
      className="bg-white border rounded shadow-sm mt-1 overflow-hidden"
      style={{ 
        zIndex: 9999,
        maxHeight: '300px',
        overflowY: 'auto'
      }} 
      ref={symptomSuggestionsRef}
    >
      <div className="p-2 border-bottom bg-light d-flex justify-content-between align-items-center">
        <div>
          <small className="fw-bold text-primary">Specialty Symptoms</small>
          <small className="text-muted ms-2">
            ({matchingSymptoms.length} matches)
          </small>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger py-0 px-2"
          onClick={() => setShowSymptomSuggestions(false)}
          style={{ fontSize: '0.7rem', lineHeight: '1' }}
        >
          ×
        </button>
      </div>
      
      {matchingSymptoms.map((symptom, index) => (
        <div
          key={`symptom-${index}`}
          className="p-2 border-bottom cursor-pointer symptom-suggestion-item"
          onClick={() => {
            handleFieldChange("symptoms", symptom.name);
            setShowSymptomSuggestions(false);
          }}
          style={{
            transition: 'all 0.2s ease',
            borderLeft: '3px solid transparent'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-plus-circle text-success" style={{ fontSize: '0.8rem' }}></i>
                <strong className="text-dark" style={{ fontSize: '0.95rem' }}>
                  {symptom.name}
                </strong>
              </div>
              
              {symptom.description && (
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.8rem' }}>
                  {symptom.description.length > 60 
                    ? `${symptom.description.substring(0, 60)}...` 
                    : symptom.description}
                </small>
              )}
              
              {symptom.diagnosis?.length > 0 && (
                <div className="mt-1">
                  <small className="text-muted">Common diagnoses:</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {symptom.diagnosis.slice(0, 2).map((diag, idx) => (
                      <span 
                        key={idx} 
                        className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {diag}
                      </span>
                    ))}
                    {symptom.diagnosis.length > 2 && (
                      <span 
                        className="badge bg-secondary bg-opacity-10 text-secondary"
                        style={{ fontSize: '0.7rem' }}
                      >
                        +{symptom.diagnosis.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <span className="badge" style={{
              backgroundColor: '#4A6FA520',
              color: '#4A6FA5',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}>
              Specialty
            </span>
          </div>
        </div>
      ))}
      
      <div className="p-2 bg-light border-top">
        <small className="text-muted d-flex align-items-center gap-1">
          <i className="bi bi-info-circle"></i>
          Click to select a symptom
        </small>
      </div>
      
      <style jsx>{`
        .symptom-suggestion-item:hover {
          background-color: rgba(74, 111, 165, 0.05);
          border-left-color: #4A6FA5 !important;
        }
      `}</style>
    </div>
  );
};