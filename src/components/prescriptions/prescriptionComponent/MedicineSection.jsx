import React from 'react';
import ReactSelect from 'react-select';
import { BiSolidCapsule } from "react-icons/bi";
import { FiPlus, FiMinus, FiRefreshCw } from 'react-icons/fi';
import { MdOutlineMedication } from "react-icons/md";

const MedicineSection = ({
  prescriptionFormData,
  colors,
  medicineOptions,
  handleMedicineChange,
  errors,
  getTimingArray,
  timingLabels,
  handleTimingCheckboxChange,
  handleNotesChangeWrapper,
  handleAutoResize,
  handleAddRow,
  handleRemoveRow,
  handleRefreshMedicines,
  isRefreshingMedicines
}) => {
  return (
    <div className="px-3 pt-3 w-100">
      <div className="card border-0 shadow-sm mb-2" style={{
        borderRadius: '5px',
        background: 'white'
      }}>
        <div className="card-header bg-transparent border-0 py-3">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                width: '48px',
                height: '48px',
                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}40)`
              }}>
                <MdOutlineMedication size={24} className="text-primary" />
              </div>
              <div>
                <h5 className="card-title mb-0 fw-bold" style={{ color: colors.dark }}>Medicines</h5>
                <small className="text-muted">Add medicines, dosage, and timing</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                onClick={handleRefreshMedicines}
                disabled={isRefreshingMedicines}
                className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none'
                }}
                title="Refresh medicines list"
              >
                <FiRefreshCw size={14} />
                {isRefreshingMedicines ? 'Refreshing...' : 'Refresh Medicines List'}
              </button>
              <span className="badge rounded-pill px-3 py-2" style={{
                backgroundColor: `${colors.primary}15`,
                color: colors.primary,
                fontSize: '0.9em'
              }}>
                {prescriptionFormData.medicines.length || 0} total
              </span>
            </div>
          </div>
        </div>
        <div className="card-body custom-card-action p-0">
          <div className="table-responsive " style={{ overflowY: "none", overflowX: "auto" }}>
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{
                  backgroundColor: `${colors.primary}05`,
                  borderBottom: `2px solid ${colors.primary}20`
                }}>
                  <th className="text-center py-3" style={{ width: '60px', color: colors.primary }}>#</th>
                  <th className="py-3" style={{ color: colors.primary, textAlign: 'center' }}>Medicine</th>
                  <th className="py-3" style={{ color: colors.primary }}>Price</th>
                  <th className="py-3" style={{ color: colors.primary, textAlign: 'center' }}>Timing</th>
                  <th className="py-3" style={{ color: colors.primary, textAlign: 'center' }}>Notes</th>
                  <th className="text-end ps-0 py-3" style={{ color: colors.primary, width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionFormData.medicines.map((row, index) => {
                  const price = row.medicine && row.medicine.price ? Number(row.medicine.price) : 0;
                  return (
                    <tr key={index} style={{
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}>
                      <td className="text-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: `${colors.primary}15`,
                          color: colors.primary,
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div className="hstack gap-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: `${colors.primary}15`,
                          }}>
                            <BiSolidCapsule style={{ color: colors.primary, fontSize: '1.2em' }} />
                          </div>
                          <div style={{ minWidth: 300 }}>
                            <ReactSelect
                              options={medicineOptions}
                              value={row.medicine}
                              onChange={(option) => handleMedicineChange(option, index)}
                              placeholder="Select Medicine"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                container: (base) => ({
                                  ...base,
                                  width: "100%",
                                  zIndex: 1,
                                }),
                                menu: base => ({
                                  ...base,
                                  zIndex: 99999,
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  width: '100%',
                                  maxHeight: 200,
                                }),
                                menuList: base => ({
                                  ...base,
                                  maxHeight: 200
                                }),
                                control: base => ({
                                  ...base,
                                  position: 'relative',
                                  zIndex: 1,
                                  borderRadius: '10px',
                                  border: `1px solid ${errors[`medicine_${index}`] ? colors.danger : '#dee2e6'}`,
                                  padding: '4px 8px',
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': {
                                    borderColor: colors.primary
                                  }
                                }),
                                option: (base, state) => ({
                                  ...base,
                                  backgroundColor: state.isSelected ? `${colors.primary}20` : state.isFocused ? `${colors.primary}10` : 'white',
                                  color: colors.dark,
                                  padding: '10px 15px'
                                })
                              }}
                            />
                            {errors[`medicine_${index}`] && (
                              <p className="input-error text-danger mt-1 mb-0" style={{ fontSize: '0.92em' }}>{errors[`medicine_${index}`]}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-0' style={{ minWidth: 60, textAlign: 'center' }}>
                        <div className="fw-bold " style={{ color: colors.primary }}>
                          {price > 0 ? `₹${price.toFixed(2)}` : <span className="text-muted">—</span>}
                        </div>
                      </td>
                      <td className='ps-0'>
                        <div className="d-flex gap-2">
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
                      <td className='px-0' style={{ minWidth: 120 }}>
                        <textarea
                          rows={1}
                          className="form-control"
                          value={row.notes}
                          onChange={(e) => { handleNotesChangeWrapper(e, index); handleAutoResize(e); }}
                          placeholder="Notes (optional)"
                          style={{
                            fontSize: '0.9em',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            resize: 'none',
                            minHeight: '38px'
                          }}
                        />
                      </td>
                      <td className=" ps-0 ">
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
                <tr style={{ backgroundColor: `${colors.primary}05` }}>
                  <td colSpan={2} className="py-3">
                    <div className="fw-bold" style={{ color: colors.dark }}>Total</div>
                  </td>
                  <td className="py-3">
                    <div className="fw-bold " style={{ color: colors.primary }}>
                      ₹{prescriptionFormData.medicines
                        .reduce(
                          (sum, row) =>
                            sum +
                            (row.medicine && row.medicine.price
                              ? Number(row.medicine.price)
                              : 0),
                          0
                        )
                        .toFixed(2)}
                    </div>
                  </td>
                  <td colSpan={3} className="py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineSection;