import React from 'react'
import ReactSelect from "react-select";
import CreatePrescriptionToggle from './CreatePrescriptionToggle';

const PatientSelection = ({ prescriptionFormData, patientFilter, setPatientFilter, errors, onPatientChange, onRefreshPatients }) => {
    const patientOptions = [];

    const customFilterOption = (option, inputValue) => {
        const searchText = inputValue.toLowerCase().trim();
        if (!searchText) return true;
        // Search in the combined searchText field
        return option.data.searchText.includes(searchText);
    };
    return (
        <div className="px-4 pt-3 pb-2">
            <div className="form-group mb-3 mb-md-0">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <label className="form-label fw-bold mb-0">Select Patient:</label>
                    <div className="d-flex align-items-center gap-2">
                        <button
                            type="button"
                            onClick={onRefreshPatients}
                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                            style={{ fontSize: '0.85em', padding: '4px 8px' }}
                            title="Refresh patient list"
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            Refresh
                        </button>
                        <CreatePrescriptionToggle filter={patientFilter} setFilter={setPatientFilter} />
                    </div>
                </div>
                <div className='inputs-container'>
                    <ReactSelect
                        options={patientOptions}
                        value={prescriptionFormData.patient ? patientOptions.find(option => option.rawPatient.id === prescriptionFormData.patient?.id) : null}
                        onChange={onPatientChange}
                        placeholder="Select a patient"
                        formatOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.rawPatient.id}
                        filterOption={customFilterOption}
                        noOptionsMessage={({ inputValue }) =>
                            inputValue ? `No patients found for "${inputValue}"` : "No patients available"
                        }
                    />
                </div>
                {errors.patient && <p className="input-error text-danger mt-2">{errors.patient}</p>}
            </div>
        </div>
    )
}

export default PatientSelection