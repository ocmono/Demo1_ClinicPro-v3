import React from 'react'

const InstructionsSection = ({ prescriptionFormData, onFieldChange }) => {
    return (
        <div className="px-4 mt-4">
            <label className="form-label fw-bold">Medication Instructions & Warnings</label>
            <textarea
                className="form-control"
                rows={3}
                value={prescriptionFormData.instructions}
                onChange={e => onFieldChange('instructions', e.target.value)}
                placeholder="E.g. Take with food, do not drive, etc."
            />
            {/* {instructionSuggestions.length > 0 && (
                <div className="mt-2">
                    <span className="me-2">Quick Suggestions:</span>
                    {instructionSuggestions.map((s, idx) => (
                        <button key={idx} type="button" className="btn btn-sm btn-outline-secondary me-2 mb-1" onClick={() => handleInstructionSuggestionClick(s)}>{s}</button>
                    ))}
                </div>
            )} */}
        </div>
    )
}

export default InstructionsSection