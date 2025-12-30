import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { validateLead } from '@/utils/leadExport';

const ImportLeadsModal = ({ isOpen, onClose, onImport }) => {
    const [importedLeads, setImportedLeads] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const [validationResults, setValidationResults] = useState({});

    useEffect(() => {
        if (isOpen && window.importedLeadsData) {
            const leads = window.importedLeadsData;
            setImportedLeads(leads);
            
            // Validate all leads
            const validations = {};
            leads.forEach((lead, index) => {
                validations[index] = validateLead(lead);
            });
            setValidationResults(validations);
            
            // Auto-select valid leads
            const validIndices = leads
                .map((lead, index) => ({ lead, index, validation: validations[index] }))
                .filter(({ validation }) => validation.isValid)
                .map(({ index }) => index);
            
            setSelectedLeads(new Set(validIndices));
        }
    }, [isOpen]);

    const handleSelectAll = () => {
        if (selectedLeads.size === importedLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(importedLeads.map((_, index) => index)));
        }
    };

    const handleToggleLead = (index) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedLeads(newSelected);
    };

    const handleImport = () => {
        const leadsToImport = Array.from(selectedLeads).map(index => importedLeads[index]);
        onImport(leadsToImport);
    };

    if (!isOpen) return null;

    const validCount = Object.values(validationResults).filter(v => v.isValid).length;
    const invalidCount = importedLeads.length - validCount;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Import Leads</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="alert alert-info d-flex align-items-center gap-2 mb-3">
                            <FiAlertCircle />
                            <div>
                                <strong>Found {importedLeads.length} leads</strong>
                                <br />
                                <small>{validCount} valid, {invalidCount} invalid</small>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <input
                                    type="checkbox"
                                    className="form-check-input me-2"
                                    checked={selectedLeads.size === importedLeads.length}
                                    onChange={handleSelectAll}
                                />
                                <label className="form-check-label">
                                    Select All ({selectedLeads.size} selected)
                                </label>
                            </div>
                        </div>

                        <div className="table-responsive" style={{ maxHeight: '400px' }}>
                            <table className="table table-hover">
                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fafbfc', zIndex: 10 }}>
                                    <tr>
                                        <th style={{ width: '40px' }}>Select</th>
                                        <th>Name</th>
                                        <th>Mobile</th>
                                        <th>Date</th>
                                        <th>Source</th>
                                        <th>Status</th>
                                        <th>Validation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importedLeads.map((lead, index) => {
                                        const validation = validationResults[index] || { isValid: false, errors: [] };
                                        const isSelected = selectedLeads.has(index);
                                        
                                        return (
                                            <tr
                                                key={index}
                                                className={validation.isValid ? '' : 'table-warning'}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleToggleLead(index)}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleLead(index)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td>{lead.fullName || <span className="text-muted">N/A</span>}</td>
                                                <td>{lead.mobile || <span className="text-muted">N/A</span>}</td>
                                                <td>{lead.leadDate || <span className="text-muted">N/A</span>}</td>
                                                <td>{lead.leadSource || <span className="text-muted">N/A</span>}</td>
                                                <td>{lead.leadStatus || <span className="text-muted">N/A</span>}</td>
                                                <td>
                                                    {validation.isValid ? (
                                                        <span className="badge bg-success">
                                                            <FiCheck size={12} className="me-1" />
                                                            Valid
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-danger" title={validation.errors.join(', ')}>
                                                            <FiAlertCircle size={12} className="me-1" />
                                                            {validation.errors.length} error(s)
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleImport}
                            disabled={selectedLeads.size === 0}
                        >
                            Import {selectedLeads.size} Lead(s)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportLeadsModal;


