import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import ReactSelect from 'react-select';

const LabTestSection = ({ prescriptionFormData, patient, specialtyLabTests, loadingSpecialtyTests, onFieldChange, onRefreshLabTests, isRefreshingLabTests }) => {
    const [labTestFormData, setLabTestFormData] = useState({
        labTest: null,
        notes: '',
        sku: ''
    });

    const handleLabTestFieldChange = (field, value) => {
        setLabTestFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetLabTestFormData = () => {
        setLabTestFormData({
            labTest: null,
            notes: '',
            sku: ''
        });
    };

    const handleLabTestChange = (selectedOption, index = null) => {
        if (index !== null) {
            const updated = [...prescriptionFormData.labTests];
            updated[index] = {
                ...updated[index],
                labTest: selectedOption,
                notes: selectedOption.notes || ''
            };
            onFieldChange("labTests", updated);
        } else {
            if (selectedOption) {
                const newLabTest = {
                    labTest: selectedOption,
                    notes: selectedOption.notes || '',
                    sku: selectedOption.sku || selectedOption.value
                };

                const newLabTests = [...(prescriptionFormData.labTests || []), newLabTest];
                onFieldChange("labTests", newLabTests);
                resetLabTestFormData();
            }
        }
    };

    const handleLabTestNotesChange = (e, index = null) => {
        if (index !== null) {
            const updated = [...prescriptionFormData.labTests];
            updated[index] = {
                ...updated[index],
                notes: e.target.value
            };
            onFieldChange("labTests", updated);
        } else {
            handleLabTestFieldChange('notes', e.target.value);
        }
    };

    const handleAddLabTestRow = () => {
        const newLabTests = [...(prescriptionFormData.labTests || []), { labTest: null, notes: '', sku: '' }];
        onFieldChange("labTests", newLabTests);
    };

    const handleRemoveLabTestRow = (index) => {
        if (prescriptionFormData.labTests && prescriptionFormData.labTests.length > 0) {
            const updatedLabTests = prescriptionFormData.labTests.filter((_, i) => i !== index);
            onFieldChange("labTests", updatedLabTests);
        }
    };

    const labTestOptions = [];

    return (
        <>
            <hr className="my-0 border-dashed" />
            <div className="px-4 pt-3 w-100">
                <div className="card stretch stretch-full">
                    <div className="card-header d-flex align-items-center justify-content-between">
                        <h5 className="card-title mb-0 fw-bold">
                            Lab Tests
                            {/* {specialtyLabTests.length > 0 && (
                          <span className="badge bg-info ms-2">
                            {patient?.doctorSpeciality || 'Specialty'} Tests Available
                          </span>
                        )} */}
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            {loadingSpecialtyTests && (
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                    <span className="visually-hidden">Loading speciality tests...</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={onRefreshLabTests}
                                disabled={isRefreshingLabTests}
                                className="btn btn-outline-primary btn-sm"
                                style={{ fontSize: '0.85em', padding: '4px 8px' }}
                                title="Refresh lab test list"
                            >
                                <i className={`bi ${isRefreshingLabTests ? 'bi-arrow-clockwise' : 'bi-arrow-clockwise'}`} style={{ fontSize: '0.9em' }}></i>
                                {isRefreshingLabTests ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <span className="badge bg-primary bg-opacity-10 text-white py-2 px-2" style={{ fontSize: '0.92em', padding: '2px 10px', borderRadius: 8 }}>
                                {prescriptionFormData.labTests?.length || 0} total
                            </span>
                        </div>
                    </div>
                    {/* Specialty Info Banner */}
                    {patient?.doctorSpeciality && specialtyLabTests.length > 0 && (
                        <div className="card-body py-2 border-bottom">
                            <div className="alert alert-info mb-0 py-2">
                                <i className="bi bi-info-circle me-2"></i>
                                Showing recommended lab tests for <strong>{patient.doctorSpeciality}</strong> specialty
                            </div>
                        </div>
                    )}
                    <div className="card-body custom-card-action p-0" style={{ overflow: 'visible' }}>
                        <div className="table-responsive project-report-table" style={{ overflow: 'visible' }}>
                            <table className="table table-hover align-middle mb-0" style={{ position: 'relative' }}>
                                <thead>
                                    <tr>
                                        <th className="text-center" style={{ width: '2.2rem' }}>#</th>
                                        <th>Lab Test</th>
                                        <th>Notes</th>
                                        <th className="text-end" style={{ width: '4.5rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionFormData.labTests?.map((row, index) => (
                                        <tr key={index}>
                                            <td className="text-center fw-bold">{index + 1}</td>
                                            <td style={{ minWidth: 160 }}>
                                                <div className="hstack gap-3">
                                                    <div className="avatar-image rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                        <span className="text-primary" style={{ fontSize: 18 }}><i className="bi bi-clipboard2-pulse"></i></span>
                                                    </div>
                                                    <div style={{ minWidth: 400 }}>
                                                        <ReactSelect
                                                            options={labTestOptions}
                                                            value={labTestOptions.find(opt => opt.value === row.sku) || null}
                                                            onChange={(option) => handleLabTestChange(option, index)}
                                                            placeholder="Select Lab Test"
                                                            styles={{
                                                                container: base => ({ ...base, minWidth: 120, zIndex: 0 }),
                                                                menu: base => ({
                                                                    ...base,
                                                                    zIndex: 99999,
                                                                    position: 'absolute',
                                                                    top: '100%',
                                                                    left: 0,
                                                                    right: 0,
                                                                    width: '100%',
                                                                    maxHeight: 200
                                                                }),
                                                                menuList: base => ({
                                                                    ...base,
                                                                    maxHeight: 200
                                                                }),
                                                                control: base => ({
                                                                    ...base,
                                                                    position: 'relative',
                                                                    zIndex: 1
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ minWidth: 300 }}>
                                                <textarea
                                                    rows={1}
                                                    className="form-control"
                                                    value={row.notes}
                                                    onChange={(e) => handleLabTestNotesChange(e, index)}
                                                    placeholder="Notes (optional)"
                                                    style={{ fontSize: '0.93em', padding: '10px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none' }}
                                                />
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex align-items-center justify-content-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddLabTestRow}
                                                        className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                        style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                    >
                                                        <FiPlus size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLabTestRow(index)}
                                                        className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                        style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                    >
                                                        <FiMinus size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Add new lab test row */}
                                    <tr>
                                        <td className="text-center fw-bold">{prescriptionFormData.labTests?.length + 1 || 1}</td>
                                        <td style={{ minWidth: 160 }}>
                                            <div className="hstack gap-3">
                                                <div className="avatar-image rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                    <span className="text-primary" style={{ fontSize: 18 }}><i className="bi bi-clipboard2-pulse"></i></span>
                                                </div>
                                                <div style={{ minWidth: 400 }}>
                                                    <ReactSelect
                                                        options={labTestOptions}
                                                        value={labTestFormData.labTest}
                                                        onChange={(option) => handleLabTestChange(option)}
                                                        placeholder="Select Lab Test"
                                                        styles={{
                                                            container: base => ({ ...base, minWidth: 120, zIndex: 0 }),
                                                            menu: base => ({
                                                                ...base,
                                                                zIndex: 99999,
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: 0,
                                                                right: 0,
                                                                width: '100%',
                                                                maxHeight: 200
                                                            }),
                                                            menuList: base => ({
                                                                ...base,
                                                                maxHeight: 200
                                                            }),
                                                            control: base => ({
                                                                ...base,
                                                                position: 'relative',
                                                                zIndex: 1
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ minWidth: 300 }}>
                                            <textarea
                                                rows={1}
                                                className="form-control"
                                                value={labTestFormData.notes}
                                                onChange={(e) => handleLabTestFieldChange('notes', e.target.value)}
                                                placeholder="Notes (optional)"
                                                style={{ fontSize: '0.93em', padding: '8px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none' }}
                                            />
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex align-items-center justify-content-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={handleAddLabTestRow}
                                                    className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                    style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                >
                                                    <FiPlus size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLabTestRow(index)}
                                                    className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                    style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                >
                                                    <FiMinus size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Summary Row for Lab Tests */}
                                    {/* <tr className="table-light fw-bold">
                              <td colSpan={2}>
                                {prescriptionFormData.labTests?.length > 0 ?
                                  prescriptionFormData.labTests
                                    .filter(row => row.labTest)
                                    .map(row => row.labTest.label || row.labTest.medicineName || row.labTest.name || 'Unknown Lab Test')
                                    .join(', ')
                                  : 'No lab tests'
                                }
                              </td>
                              <td colSpan={2}></td>
                            </tr> */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LabTestSection