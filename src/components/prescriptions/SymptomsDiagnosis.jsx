import React, { useState, useRef } from 'react'

const SymptomsDiagnosis = ({ prescriptionFormData, errors, onFieldChange }) => {
    const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState(false);
    const diagnosisInputRef = useRef(null);
    
    const handleAutoResize = (e) => {
        e.target.style.height = '28px';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    };
    return (
        <>
            <hr className="my-0 border-dashed" />
            <div className="px-4 pt-3 pb-2 row justify-content-between">
                <div className="col-12">
                    <div className="card bg-light border-0 shadow-none mb-2">
                        <div className="card-body py-2 px-3">
                            <div className="row g-2 align-items-center">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: '1.05em' }}>
                                        <span className="text-primary" style={{ fontSize: '1.2em' }}><i className="bi bi-activity"></i></span> Symptoms
                                    </label>
                                    <textarea
                                        rows={1}
                                        className={`form-control bg-white border-0 shadow-sm px-3 ${errors.symptoms ? 'is-invalid' : ''}`}
                                        placeholder="Enter Symptoms"
                                        value={prescriptionFormData.symptoms}
                                        onChange={e => { onFieldChange("symptoms", e.target.value); handleAutoResize(e); }}
                                        style={{ fontSize: '1em', borderRadius: 8, minHeight: 32, maxHeight: 120, overflow: 'hidden', resize: 'none' }}
                                    />
                                    {errors.symptoms && <p className="input-error text-danger mt-1 mb-0">{errors.symptoms}</p>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold mb-1 d-flex align-items-center gap-2" style={{ fontSize: '1.05em' }}>
                                        <span className="text-success" style={{ fontSize: '1.2em' }}><i className="bi bi-search-heart"></i></span> Diagnosis
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <textarea
                                            rows={1}
                                            className={`form-control bg-white border-0 shadow-sm px-3 ${errors.diagnosis ? 'is-invalid' : ''}`}
                                            placeholder="Enter Diagnosis"
                                            value={prescriptionFormData.diagnosis}
                                            onChange={e => { handleDiagnosisChange(e); handleAutoResize(e); }}
                                            autoComplete="off"
                                            ref={diagnosisInputRef}
                                            style={{ fontSize: '1em', borderRadius: 8, minHeight: 32, maxHeight: 120, overflow: 'hidden', resize: 'none' }}
                                        />
                                        {/* {showDiagnosisSuggestions && filteredDiagnosisSuggestions.length > 0 && (
                                            <div ref={suggestionBoxRef}>
                                                <ul className="list-group position-absolute bg-white shadow-sm" style={{ zIndex: 10, maxHeight: 120, overflowY: 'auto', width: '100%' }}>
                                                    {filteredDiagnosisSuggestions.map((s, idx) => (
                                                        <li key={idx} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={() => handleDiagnosisSuggestionClick(s)}>{s.label}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )} */}
                                    </div>
                                    {errors.diagnosis && <p className="input-error text-danger mt-1 mb-0">{errors.diagnosis}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SymptomsDiagnosis