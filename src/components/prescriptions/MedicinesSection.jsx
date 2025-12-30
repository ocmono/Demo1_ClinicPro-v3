import React from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import ReactSelect from "react-select";

const MedicineSection = ({ prescriptionFormData, errors, onFieldChange, onRefreshMedicines, isRefreshingMedicines }) => {
    const timingLabels = ["Morning", "Afternoon", "Dinner"];

    const getTimingArray = (timingStr = "") => {
        if (!timingStr) return [0, 0, 0];
        return timingStr.split("-").map((v) => (v === "1" ? 1 : 0));
    };

    const handleMedicineChange = (selectedOption, index) => {
        const updatedMedicines = [...prescriptionFormData.medicines];
        updatedMedicines[index] = {
            ...updatedMedicines[index],
            medicine: selectedOption,
            sku: selectedOption.sku,
        };
        onFieldChange("medicines", updatedMedicines);
    };

    const handleNotesChange = (e, index) => {
        const updatedMedicines = [...prescriptionFormData.medicines];
        updatedMedicines[index].notes = e.target.value;
        onFieldChange("medicines", updatedMedicines);
    };

    const handleTimingCheckboxChange = (index, pos) => {
        const updatedMedicines = [...prescriptionFormData.medicines];
        const currentArr = getTimingArray(updatedMedicines[index].medicine_timing);
        currentArr[pos] = currentArr[pos] ? 0 : 1;
        updatedMedicines[index].medicine_timing = currentArr.join("-");
        onFieldChange("medicines", updatedMedicines);
    };

    const handleAddRow = () => {
        const newMedicines = [...prescriptionFormData.medicines, {
            medicine: null,
            medicine_timing: "",
            notes: "",
            sku: ""
        }];
        onFieldChange("medicines", newMedicines);
    };

    const handleRemoveRow = (index) => {
        if (prescriptionFormData.medicines.length > 1) {
            const updatedMedicines = prescriptionFormData.medicines.filter((_, i) => i !== index);
            onFieldChange("medicines", updatedMedicines);
        }
    };

    const handleAutoResize = (e) => {
        e.target.style.height = '28px';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    };

    const medicineOptions = [];

    return (
        <>
            <hr className="my-0 border-dashed" />
            <div className="px-4 pt-3 w-100">
                <div className="card stretch stretch-full">
                    <div className="card-header d-flex align-items-center justify-content-between">
                        <h5 className="card-title mb-0 fw-bold">Medicines</h5>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                onClick={onRefreshMedicines}
                                disabled={isRefreshingMedicines}
                                className="btn btn-outline-primary btn-sm"
                                style={{ fontSize: '0.85em', padding: '4px 8px' }}
                                title="Refresh medicines list"
                            >
                                <i className={`bi ${isRefreshingMedicines ? 'bi-arrow-clockwise' : 'bi-arrow-clockwise'}`} style={{ fontSize: '0.9em' }}></i>
                                {isRefreshingMedicines ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <span className="badge bg-primary bg-opacity-10 text-white py-2 px-2" style={{ fontSize: '0.92em', padding: '2px 10px', borderRadius: 8 }}>{prescriptionFormData.medicines.length || 0} total</span>
                        </div>
                    </div>
                    <div className="card-body custom-card-action p-0" style={{ overflow: 'visible' }}>
                        <div className="table-responsive project-report-table" style={{ overflow: 'visible' }}>
                            <table className="table table-hover align-middle mb-0" style={{ position: 'relative' }}>
                                <thead>
                                    <tr>
                                        <th className="text-center" style={{ width: '2.2rem' }}>#</th>
                                        <th>Medicine</th>
                                        <th>Price</th>
                                        <th>Timing</th>
                                        <th>Notes</th>
                                        <th className="text-end" style={{ width: '4.5rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionFormData.medicines.map((row, index) => {
                                        const price = row.medicine && row.medicine.price ? Number(row.medicine.price) : 0;
                                        return (
                                            <tr key={index}>
                                                <td className="text-center fw-bold">{index + 1}</td>
                                                <td style={{ minWidth: 160 }}>
                                                    <div className="hstack gap-3">
                                                        <div className="avatar-image rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                            <span className="text-primary" style={{ fontSize: 18 }}><i className="bi bi-capsule"></i></span>
                                                        </div>
                                                        <div style={{ minWidth: 400 }}>
                                                            <ReactSelect
                                                                options={medicineOptions}
                                                                value={row.medicine}
                                                                onChange={(option) => handleMedicineChange(option, index)}
                                                                placeholder="Select Medicine"
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
                                                            {errors[`medicine_${index}`] && (
                                                                <p className="input-error text-danger mt-1 mb-0" style={{ fontSize: '0.92em' }}>{errors[`medicine_${index}`]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ minWidth: 70 }}>
                                                    {price > 0 ? `₹${price.toFixed(2)}` : <span className="text-muted">—</span>}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        {timingLabels.map((label, pos) => {
                                                            const checked = getTimingArray(row.medicine_timing)[pos] === 1;
                                                            return (
                                                                <label key={label} className={`d-flex align-items-center gap-1 px-2 py-1 rounded-pill ${checked ? 'bg-primary text-white' : 'bg-gray-200 text-dark'}`} style={{ fontSize: '0.93em', cursor: 'pointer', minWidth: 26, justifyContent: 'center', marginBottom: 0 }} title={`${label}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={() => handleTimingCheckboxChange(index, pos)}
                                                                        className="form-check-input m-0 d-none"
                                                                    />
                                                                    <span>{label[0]}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors[`timing_${index}`] && (
                                                        <p className="input-error text-danger mt-1 mb-0" style={{ fontSize: '0.8em' }}>
                                                            {errors[`timing_${index}`]}
                                                        </p>
                                                    )}
                                                </td>
                                                <td style={{ minWidth: 100 }}>
                                                    <textarea
                                                        rows={1}
                                                        className="form-control"
                                                        value={row.notes}
                                                        onChange={(e) => { handleNotesChange(e, index); handleAutoResize(e); }}
                                                        placeholder="Notes (optional)"
                                                        style={{ fontSize: '0.93em', padding: '8px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none' }}
                                                    />
                                                </td>
                                                <td className="text-end">
                                                    <div className="d-flex align-items-center justify-content-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddRow}
                                                            className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                        >
                                                            <FiPlus size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRow(index)}
                                                            className="btn btn-light btn-icon btn-xs rounded-circle border"
                                                            style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                                            disabled={prescriptionFormData.medicines.length === 1}
                                                        >
                                                            <FiMinus size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {/* Summary Row */}
                                    <tr className="table-light fw-bold">
                                        <td colSpan={2}>
                                            {/* {prescriptionFormData.medicines.length > 0
                                            ? prescriptionFormData.medicines
                                              .filter(row => row.medicine)
                                              .map(row => {
                                                const med =
                                                  typeof row.medicine === "string"
                                                    ? { medicineName: row.medicine }
                                                    : row.medicine;
            
                                                const medName =
                                                  med.medicineName || med.name || "Unknown Medicine";
                                                const medSku = med.sku || "";
                                                return medSku ? `${medName} (${medSku})` : medName;
                                              })
                                              .join(", ")
                                            : "No medicines"} */}
                                        </td>
                                        <td colSpan={1}>
                                            ₹
                                            {prescriptionFormData.medicines
                                                .reduce(
                                                    (sum, row) =>
                                                        sum +
                                                        (row.medicine && row.medicine.price
                                                            ? Number(row.medicine.price)
                                                            : 0),
                                                    0
                                                )
                                                .toFixed(2)}
                                        </td>
                                        <td colSpan={3}></td>
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

export default MedicineSection