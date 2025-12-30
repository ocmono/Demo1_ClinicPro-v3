import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import ReactSelect from 'react-select';

const VaccineSection = ({ prescriptionFormData, onFieldChange, onRefreshVaccines, isRefreshingVaccines }) => {
    const [vaccineFormData, setVaccineFormData] = useState({
        vaccine: null,
        notes: '',
        sku: ''
    });

    const handleVaccineFieldChange = (field, value) => {
        setVaccineFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetVaccineFormData = () => {
        setVaccineFormData({
            vaccine: null,
            notes: '',
            sku: ''
        });
    };

    const handleVaccineChange = (selectedOption, index = null) => {
        if (index !== null) {
            const updated = [...prescriptionFormData.vaccines];
            updated[index] = {
                ...updated[index],
                vaccine: selectedOption,
                notes: selectedOption.notes || ''
            };
            onFieldChange("vaccines", updated);
        } else {
            if (selectedOption) {
                const newVaccine = {
                    vaccine: selectedOption,
                    notes: selectedOption.notes || '',
                    sku: selectedOption.sku || selectedOption.value
                };

                const newVaccines = [...(prescriptionFormData.vaccines || []), newVaccine];
                onFieldChange("vaccines", newVaccines);
                resetVaccineFormData();
            }
        }
    };

    const handleVaccineNotesChange = (e, index = null) => {
        if (index !== null) {
            const updated = [...prescriptionFormData.vaccines];
            updated[index] = {
                ...updated[index],
                notes: e.target.value
            };
            onFieldChange("vaccines", updated);
        } else {
            handleVaccineFieldChange('notes', e.target.value);
        }
    };

    const handleAddVaccineRow = () => {
        const newVaccines = [...(prescriptionFormData.vaccines || []), { vaccine: null, notes: '', sku: '' }];
        onFieldChange("vaccines", newVaccines);
    };

    const handleRemoveVaccineRow = (index) => {
        if (prescriptionFormData.vaccines && prescriptionFormData.vaccines.length > 0) {
            const updatedVaccines = prescriptionFormData.vaccines.filter((_, i) => i !== index);
            onFieldChange("vaccines", updatedVaccines);
        }
    };

    // Add your vaccineOptions logic here
    const vaccineOptions = [];

    return (
        <>
            <hr className="my-0 border-dashed" />
            <div className="px-4 pt-3 w-100">
                <div className="card stretch stretch-full">
                    <div className="card-header d-flex align-items-center justify-content-between">
                        <h5 className="card-title mb-0 fw-bold">Vaccines</h5>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                onClick={onRefreshVaccines}
                                disabled={isRefreshingVaccines}
                                className="btn btn-outline-primary btn-sm"
                                style={{ fontSize: '0.85em', padding: '4px 8px' }}
                                title="Refresh vaccines list"
                            >
                                <i className={`bi ${isRefreshingVaccines ? 'bi-arrow-clockwise' : 'bi-arrow-clockwise'}`} style={{ fontSize: '0.9em' }}></i>
                                {isRefreshingVaccines ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <span className="badge bg-primary bg-opacity-10 text-white py-2 px-2" style={{ fontSize: '0.92em', padding: '2px 10px', borderRadius: 8 }}>
                                {prescriptionFormData.vaccines?.length || 0} total
                            </span>
                        </div>
                    </div>
                    <div className="card-body custom-card-action p-0" style={{ overflow: 'visible' }}>
                        <div className="table-responsive project-report-table" style={{ overflow: 'visible' }}>
                            <table className="table table-hover align-middle mb-0" style={{ position: 'relative' }}>
                                <thead>
                                    <tr>
                                        <th className="text-center" style={{ width: '2.2rem' }}>#</th>
                                        <th>Vaccine</th>
                                        <th>Price</th>
                                        <th>Notes</th>
                                        <th className="text-end" style={{ width: '4.5rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionFormData.vaccines?.map((row, index) => {
                                        const price = row.vaccine?.price || 0;
                                        return (
                                            <tr key={index}>
                                                <td className="text-center fw-bold">{index + 1}</td>
                                                <td style={{ minWidth: 160 }}>
                                                    <div className="hstack gap-3">
                                                        <div className="avatar-image rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                            <span className="text-primary" style={{ fontSize: 18 }}><i className="bi bi-shield-check"></i></span>
                                                        </div>
                                                        <div style={{ minWidth: 400 }}>
                                                            <ReactSelect
                                                                options={vaccineOptions}
                                                                value={row.vaccine}
                                                                onChange={(option) => handleVaccineChange(option, index)}
                                                                placeholder="Select Vaccine"
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
                                                <td style={{ minWidth: 70 }}>
                                                    {price > 0 ? `₹${price.toFixed(2)}` : <span className="text-muted">—</span>}
                                                </td>
                                                <td style={{ minWidth: 300 }}>
                                                    <textarea
                                                        rows={1}
                                                        className="form-control"
                                                        value={row.notes}
                                                        onChange={(e) => handleVaccineNotesChange(e, index)}
                                                        placeholder="Notes (optional)"
                                                        style={{ fontSize: '0.93em', padding: '8px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none' }}
                                                    />
                                                </td>
                                                <td className="text-end">
                                                    <div className="d-flex align-items-center justify-content-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddVaccineRow}
                                                            className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                        >
                                                            <FiPlus size={13} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveVaccineRow(index)}
                                                            className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                        >
                                                            <FiMinus size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {/* Add new vaccine row */}
                                    <tr>
                                        <td className="text-center fw-bold">{prescriptionFormData.vaccines?.length + 1 || 1}</td>
                                        <td style={{ minWidth: 160 }}>
                                            <div className="hstack gap-3">
                                                <div className="avatar-image rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                    <span className="text-primary" style={{ fontSize: 18 }}><i className="bi bi-shield-check"></i></span>
                                                </div>
                                                <div style={{ minWidth: 400 }}>
                                                    <ReactSelect
                                                        options={vaccineOptions}
                                                        value={vaccineFormData.vaccine}
                                                        onChange={(option) => handleVaccineChange(option)}
                                                        placeholder="Select Vaccine"
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
                                        <td style={{ minWidth: 70 }}>
                                            {vaccineFormData.vaccine?.price > 0 ? `₹${vaccineFormData.vaccine.price.toFixed(2)}` : <span className="text-muted">—</span>}
                                        </td>
                                        <td style={{ minWidth: 300 }}>
                                            <textarea
                                                rows={1}
                                                className="form-control"
                                                value={vaccineFormData.notes}
                                                onChange={(e) => handleVaccineFieldChange('notes', e.target.value)}
                                                placeholder="Notes (optional)"
                                                style={{ fontSize: '0.93em', padding: '8px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none' }}
                                            />
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex align-items-center justify-content-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={handleAddVaccineRow}
                                                    className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                    style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                >
                                                    <FiPlus size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVaccineRow(index)}
                                                    className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                    style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                >
                                                    <FiMinus size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Summary Row for Vaccines */}
                                    <tr className="table-light fw-bold">
                                        <td colSpan={2}>
                                            {/* {prescriptionFormData.vaccines?.length > 0 ?
                                              prescriptionFormData.vaccines
                                                .filter(row => row.vaccine)
                                                .map(row => row.vaccine.label || row.vaccine.medicineName || row.vaccine.name || 'Unknown Vaccine')
                                                .join(', ')
                                              : 'No vaccines'
                                            } */}
                                        </td>
                                        <td colSpan={1}>
                                            ₹
                                            {prescriptionFormData.vaccines?.reduce(
                                                (sum, row) => sum + (row.vaccine?.price || 0),
                                                0
                                            ).toFixed(2)}
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default VaccineSection