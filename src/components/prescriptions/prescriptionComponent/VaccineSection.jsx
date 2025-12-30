import React from 'react';
import ReactSelect from 'react-select';
import { TbVaccine } from "react-icons/tb";
import { FiPlus, FiMinus } from 'react-icons/fi';
import { MdOutlineScience } from "react-icons/md";

const VaccineSection = ({
  showVaccineSection,
  prescriptionFormData,
  colors,
  vaccineOptions,
  handleVaccineChange,
  handleVaccineNotesChange,
  handleAddVaccineRow,
  handleRemoveVaccineRow,
  handleRefreshVaccines,
  isRefreshingVaccines,
  vaccineFormData,
  handleVaccineFieldChange,
  setShowLabTestSection,
  showLabTestSection
}) => {
  if (!showVaccineSection) return null;

  return (
    <>
      <hr className="my-0 border-dashed" />
      <div className="px-3 pt-3 w-100">
        <div className="card border-0 shadow-sm mb-2" style={{
          borderRadius: '5px',
          borderLeft: `4px solid ${colors.success}`,
          background: 'white'
        }}>
          <div className="card-header bg-transparent border-0 p-4 pb-0">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                width: '48px',
                height: '48px',
                background: `linear-gradient(135deg, ${colors.success}20, ${colors.success}40)`
              }}>
                <TbVaccine size={24} className="text-success" />
              </div>
              <div>
                <h5 className="card-title mb-0 fw-bold" style={{ color: colors.dark }}>Vaccines</h5>
                <small className="text-muted">Add recommended vaccines</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshVaccines}
                disabled={isRefreshingVaccines}
                className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
                style={{
                  backgroundColor: colors.success,
                  color: 'white',
                  border: 'none'
                }}
                title="Refresh vaccines list"
              >
                <i className={`bi bi-arrow-clockwise ${isRefreshingVaccines ? 'spin' : ''}`}></i>
                {isRefreshingVaccines ? 'Refreshing...' : 'Refresh'}
              </button>
              <span className="badge rounded-pill px-3 py-2" style={{
                backgroundColor: `${colors.success}15`,
                color: colors.success,
                fontSize: '0.9em'
              }}>
                {prescriptionFormData.vaccines?.length || 0} total
              </span>
            </div>
          </div>
          <div className="card-body custom-card-action p-0">
            <div className="table-responsive " style={{ overflowY: "none", overflowX: "auto" }}>
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr style={{
                    backgroundColor: `${colors.success}05`,
                    borderBottom: `2px solid ${colors.success}20`
                  }}>
                    <th className="text-center py-3" style={{ width: '60px', color: colors.success }}>#</th>
                    <th className="py-3" style={{ color: colors.success }}>Vaccine</th>
                    <th className="py-3" style={{ color: colors.success }}>Price</th>
                    <th className="py-3" style={{ color: colors.success }}>Notes</th>
                    <th className="text-end py-3" style={{ color: colors.success, width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionFormData.vaccines?.map((row, index) => {
                    const price = row.vaccine?.price || 0;
                    return (
                      <tr key={index}>
                        <td className="text-center">
                          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: `${colors.success}15`,
                            color: colors.success,
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
                              backgroundColor: `${colors.success}15`,
                            }}>
                              <TbVaccine style={{ color: colors.accent, fontSize: '1.2em' }} />
                            </div>
                            <div style={{ minWidth: 400 }}>
                              <ReactSelect
                                options={vaccineOptions}
                                value={row.vaccine}
                                onChange={(option) => handleVaccineChange(option, index)}
                                placeholder="Select Vaccine"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  container: (base) => ({
                                    ...base,
                                    width: "100%",
                                    zIndex: 1,
                                  }),
                                  control: (base) => ({
                                    ...base,
                                    borderRadius: "10px",
                                    border: "1px solid #dee2e6",
                                    backgroundColor: "#f8f9fa",
                                    padding: "4px 8px",
                                    "&:hover": { borderColor: colors.success },
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 999999,
                                  }),
                                  menu: (base) => ({
                                    ...base,
                                    zIndex: 999999,
                                    width: "100%",
                                  }),
                                  option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected
                                      ? `${colors.success}20`
                                      : state.isFocused
                                        ? `${colors.success}10`
                                        : "white",
                                    padding: "10px 15px",
                                  }),
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold" style={{ color: colors.success }}>
                            {price > 0 ? `₹${price.toFixed(2)}` : <span className="text-muted">—</span>}
                          </div>
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
                              style={{
                                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                              }}
                            >
                              <FiPlus size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveVaccineRow(index)}
                              className="btn btn-light btn-icon rounded-circle border"
                              style={{
                                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                              }}
                            >
                              <FiMinus size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td className="text-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: `${colors.success}15`,
                        color: colors.success,
                        fontWeight: 'bold'
                      }}>
                        {prescriptionFormData.vaccines?.length + 1 || 1}
                      </div>
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div className="hstack gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: `${colors.success}15`,
                        }}>
                          <TbVaccine style={{ color: colors.success, fontSize: '1.2em' }} />
                        </div>
                        <div style={{ minWidth: 400 }}>
                          <ReactSelect
                            options={vaccineOptions}
                            value={vaccineFormData.vaccine}
                            onChange={(option) => handleVaccineChange(option)}
                            placeholder="Select Vaccine"
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
                                maxHeight: 200
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
                                border: '1px solid #dee2e6',
                                padding: '4px 8px',
                                backgroundColor: '#f8f9fa',
                                '&:hover': {
                                  borderColor: colors.success
                                }
                              })
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold" style={{ color: colors.success }}>
                        {vaccineFormData.vaccine?.price > 0 ? `₹${vaccineFormData.vaccine.price.toFixed(2)}` : <span className="text-muted">—</span>}
                      </div>
                    </td>
                    <td style={{ minWidth: 300 }}>
                      <textarea
                        rows={1}
                        className="form-control"
                        value={vaccineFormData.notes}
                        onChange={(e) => handleVaccineFieldChange('notes', e.target.value)}
                        placeholder="Notes (optional)"
                        style={{
                          fontSize: '0.93em', padding: '8px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none', borderRadius: '10px', backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6'
                        }}
                      />
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <button
                          type="button"
                          onClick={handleAddVaccineRow}
                          className="btn btn-light btn-icon btn-xs rounded-circle border"
                          style={{
                            width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                          }}
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
                  <tr style={{ backgroundColor: `${colors.success}05` }}>
                    <td colSpan={2} className="py-3">
                      <div className="fw-bold" style={{ color: colors.dark }}>Total Vaccines</div>
                    </td>
                    <td className="py-3">
                      <div className="fw-bold" style={{ color: colors.success }}>
                        ₹{prescriptionFormData.vaccines?.reduce(
                          (sum, row) => sum + (row.vaccine?.price || 0),
                          0
                        ).toFixed(2)}
                      </div>
                    </td>
                    <td colSpan={2} className="py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pt-2 pb-2">
        <button
          type="button"
          onClick={() => setShowLabTestSection(!showLabTestSection)}
          className={`btn btn-sm ${showLabTestSection ? 'btn-info' : 'btn-outline-info'}`}
          style={{ fontSize: '0.9em', padding: '6px 12px' }}
        >
          <MdOutlineScience size={20} className='me-1' />
          {showLabTestSection ? 'Hide Lab Test' : 'Add Lab Test'}
        </button>
      </div>
    </>
  );
};

export default VaccineSection;