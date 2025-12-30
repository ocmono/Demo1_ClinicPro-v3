import React from 'react';
import ReactSelect from 'react-select';
import { MdOutlineScience } from "react-icons/md";
import { FiPlus, FiMinus } from 'react-icons/fi';

const LabTestSection = ({
  showLabTestSection,
  prescriptionFormData,
  colors,
  patient,
  specialtyLabTests,
  labTestOptions,
  handleLabTestChange,
  handleLabTestNotesChange,
  handleAddLabTestRow,
  handleRemoveLabTestRow,
  handleRefreshLabTests,
  isRefreshingLabTests,
  loadingSpecialtyTests,
  labTestFormData,
  handleLabTestFieldChange
}) => {
  if (!showLabTestSection) return null;

  return (
    <>
      <hr className="my-0 border-dashed" />
      <div className="px-3 pt-3 w-100">
        <div className="card border-0 shadow-sm mb-2 " style={{
          borderRadius: '5px',
          borderLeft: `4px solid ${colors.info}`,
          background: 'white'
        }}>
          <div className="card-header bg-transparent border-0 p-4 pb-0">
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                  width: '48px',
                  height: '48px',
                  background: `linear-gradient(135deg, ${colors.info}20, ${colors.info}40)`
                }}>
                  <MdOutlineScience size={24} className="text-info" />
                </div>
                <div>
                  <h5 className="card-title mb-0 fw-bold" style={{ color: colors.dark }}>Lab Tests</h5>
                  <small className="text-muted">Add recommended lab tests</small>
                </div>
                <div className=''>
                  {patient?.doctorSpeciality && specialtyLabTests.length > 0 && (
                    <div className="mb-0 px-3 py-2 alert rounded-pill" style={{
                      backgroundColor: `${colors.info}10`,
                      border: `1px solid ${colors.info}30`,
                      color: colors.info
                    }}>
                      <i className="bi bi-info-circle"></i>
                      Showing recommended lab tests for <strong>{patient.doctorSpeciality}</strong> specialty
                    </div>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {loadingSpecialtyTests && (
                  <div className="spinner-border spinner-border-sm" style={{ color: colors.info }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRefreshLabTests}
                  disabled={isRefreshingLabTests}
                  className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
                  style={{
                    backgroundColor: colors.info,
                    color: 'white',
                    border: 'none'
                  }}
                  title="Refresh lab test list"
                >
                  <i className={`bi bi-arrow-clockwise ${isRefreshingLabTests ? 'spin' : ''}`}></i>
                  {isRefreshingLabTests ? 'Refreshing...' : 'Refresh'}
                </button>
                <div className="badge rounded-pill px-3 py-2" style={{
                  backgroundColor: `${colors.info}15`,
                  color: colors.info,
                  fontSize: '0.9em'
                }}>
                  {prescriptionFormData.labTests?.length || 0} tests
                </div>
              </div>
            </div>
          </div>
          <div className="card-body custom-card-action p-0">
            <div className="table-responsive " style={{ overflowY: "none", overflowX: "auto" }}>
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr style={{
                    backgroundColor: `${colors.info}05`,
                    borderBottom: `2px solid ${colors.info}20`
                  }}>
                    <th className="text-center py-3" style={{ width: '60px', color: colors.info }}>#</th>
                    <th className="py-3" style={{ color: colors.info }}>Lab Test</th>
                    <th className="py-3" style={{ color: colors.info }}>Notes</th>
                    <th className="text-end py-3" style={{ color: colors.info, width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionFormData.labTests?.map((row, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: `${colors.info}15`,
                          color: colors.info,
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
                            backgroundColor: `${colors.info}15`
                          }}>
                            <MdOutlineScience style={{ color: colors.info, fontSize: '1.2em' }} />
                          </div>
                          <div style={{ minWidth: 400 }}>
                            <ReactSelect
                              options={labTestOptions}
                              value={labTestOptions.find(opt => opt.value === row.sku) || null}
                              onChange={(option) => handleLabTestChange(option, index)}
                              placeholder="Select Lab Test"
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
                                    borderColor: colors.info
                                  }
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
                          style={{ fontSize: '0.93em', padding: '10px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none', borderRadius: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}
                        />
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            type="button"
                            onClick={handleAddLabTestRow}
                            className="btn btn-light btn-icon btn-xs rounded-circle border"
                            style={{
                              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                            }}
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
                  <tr>
                    <td className="text-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: `${colors.info}15`,
                        color: colors.info,
                        fontWeight: 'bold'
                      }}>
                        {prescriptionFormData.labTests?.length + 1 || 1}
                      </div>
                    </td>
                    <td style={{ minWidth: 160 }}>
                      <div className="hstack gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: `${colors.info}15`
                        }}>
                          <MdOutlineScience style={{ color: colors.info, fontSize: '1.2em' }} />
                        </div>
                        <div style={{ minWidth: 400 }}>
                          <ReactSelect
                            options={labTestOptions}
                            value={labTestFormData.labTest}
                            onChange={(option) => handleLabTestChange(option)}
                            placeholder="Select Lab Test"
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
                                zIndex: 100,
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
                                  borderColor: colors.info
                                }
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
                        style={{ fontSize: '0.93em', padding: '8px 6px', minHeight: 28, maxHeight: 120, overflow: 'hidden', resize: 'none', borderRadius: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabTestSection;