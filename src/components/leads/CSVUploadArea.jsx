import React, { useState, useRef, useCallback } from 'react';
import { FiUpload, FiX, FiFile, FiCheck } from 'react-icons/fi';
import { importLeadsFromCSV, validateLead } from '@/utils/leadExport';

const CSVUploadArea = ({ onFileSelect, onImportComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [importedLeads, setImportedLeads] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const fileInputRef = useRef(null);

    const processFile = async (file) => {
        if (!file.name.endsWith('.csv')) {
            throw new Error('Please select a CSV file');
        }

        try {
            const leads = await importLeadsFromCSV(file);
            setUploadedFile(file);
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
            onFileSelect && onFileSelect(leads);
        } catch (error) {
            throw new Error(`Failed to process CSV: ${error.message}`);
        }
    };

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await processFile(files[0]);
        }
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await processFile(file);
            } catch (error) {
                alert(error.message);
            }
        }
    };

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
        onImportComplete && onImportComplete(leadsToImport);
        // Reset state
        setUploadedFile(null);
        setImportedLeads([]);
        setSelectedLeads(new Set());
        setValidationResults({});
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setImportedLeads([]);
        setSelectedLeads(new Set());
        setValidationResults({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validCount = Object.values(validationResults).filter(v => v.isValid).length;
    const invalidCount = importedLeads.length - validCount;

    return (
        <div className="csv-upload-area">
            {!uploadedFile ? (
                <div
                    className={`csv-drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="text-center">
                        <FiUpload size={48} className="text-muted mb-3" />
                        <h5>Drop CSV file here or click to browse</h5>
                        <p className="text-muted mb-0">Supports CSV files with lead data</p>
                        <small className="text-muted">Expected columns: Full Name, Mobile, Lead Date, Campaign ID, Lead Source, Lead Status</small>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className="csv-preview">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <FiFile size={24} className="text-primary" />
                            <div>
                                <h6 className="mb-0">{uploadedFile.name}</h6>
                                <small className="text-muted">
                                    {importedLeads.length} leads found • {validCount} valid • {invalidCount} invalid
                                </small>
                            </div>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleRemoveFile}
                        >
                            <FiX size={16} />
                        </button>
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
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleImport}
                            disabled={selectedLeads.size === 0}
                        >
                            <FiCheck className="me-1" />
                            Import {selectedLeads.size} Lead(s)
                        </button>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '300px' }}>
                        <table className="table table-sm table-hover">
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
            )}

            <style>{`
                .csv-drop-zone {
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    padding: 60px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background-color: #fafbfc;
                }
                .csv-drop-zone:hover {
                    border-color: #4285f4;
                    background-color: #f0f7ff;
                }
                .csv-drop-zone.dragging {
                    border-color: #4285f4;
                    background-color: #e3f2fd;
                    transform: scale(1.02);
                }
                .csv-preview {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    background-color: #fff;
                }
            `}</style>
        </div>
    );
};

export default CSVUploadArea;


