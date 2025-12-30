import React, { useState } from 'react';
import { FiPlus, FiMinus, FiRefreshCw, FiShield } from 'react-icons/fi';
import ReactSelect from 'react-select';

const VaccineSection = ({
  vaccines = [],
  vaccineOptions = [],
  vaccineFormData = { vaccine: null, notes: '', sku: '' },
  onAddRow,
  onRemoveRow,
  onVaccineChange,
  onVaccineNotesChange,
  onVaccineFieldChange,
  isRefreshingVaccines = false,
  onRefreshVaccines,
  onHide, // optional: called to hide the entire vaccine section
}) => {
  const [autoResize] = useState(() => (e) => {
    e.target.style.height = '28px';
    e.target.style.height = e.target.scrollHeight + 'px';
  });

  const selectStyles = {
    container: (base) => ({ ...base, minWidth: 120 }),
    menuPortal: (base) => ({ ...base, zIndex: 999999 }),
    control: (base) => ({
      ...base,
      border: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minHeight: 32,
    }),
  };

  const buttonStyle = {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  };

  const calculateTotalPrice = () => {
    return vaccines.reduce((sum, row) => sum + (row.vaccine?.price || 0), 0);
  };

  return (
    <div className="w-100">
      <div className="stretch border-0 stretch-full mb-3">
        <div
          className="card-header d-flex align-items-center justify-content-between"
          style={{ border: "0", paddingLeft: 0 }}
        >
          <h5 className="card-title mb-0 fw-bold d-flex align-items-center">
            <span className="d-inline-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: "#dcfce7",
                  color: "#22c55e",
                }}
              >
                <FiShield size={15} />
              </span>
              <span>Vaccines</span>
              {onHide && (
                <button
                  type="button"
                  onClick={onHide}
                  className="btn btn-link p-0 ms-2 text-primary"
                  style={{ fontSize: 13, textDecoration: "none" }}
                >
                  <span
                    style={{
                      padding: "0 10px",
                      color: "#6c757d",
                    }}
                  >
                    |
                  </span>
                  Hide
                </button>
              )}
            </span>
          </h5>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={onRefreshVaccines}
              disabled={isRefreshingVaccines}
              className="btn btn-light btn-icon btn-xs rounded-circle border"
              style={buttonStyle}
              title="Refresh vaccines list"
            >
              <FiRefreshCw size={13} />
            </button>
            <button
              type="button"
              onClick={onAddRow}
              className="btn btn-light btn-icon btn-xs rounded-circle border"
              style={buttonStyle}
              title="Add vaccine row"
            >
              <FiPlus size={13} />
            </button>
            {/* <span className="badge bg-primary bg-opacity-10 text-white">
              {vaccines?.length || 0} total
            </span> */}
          </div>
        </div>

        <div
          className="card-body custom-card-action p-0"
          style={{ overflow: 'visible', backgroundColor: "#f5f5f5" }}
        >
          <div className="table-responsive">
            <table
              className="table align-middle mb-0"
              style={{
                backgroundColor: "#f5f5f5",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    className="text-center"
                    style={{
                      width: "50px",
                      minWidth: "50px",
                      maxWidth: "50px",
                      border: "1px solid #ecedf4",
                      padding: "8px",
                      backgroundColor: "#fafbfc",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      border: "1px solid #ecedf4",
                      padding: "8px",
                      backgroundColor: "#fafbfc",
                    }}
                  >
                    Vaccine
                  </th>
                  <th
                    style={{
                      border: "1px solid #ecedf4",
                      padding: "8px",
                      backgroundColor: "#fafbfc",
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      border: "1px solid #ecedf4",
                      padding: "8px",
                      backgroundColor: "#fafbfc",
                    }}
                  >
                    Notes
                  </th>
                  <th
                    className="text-end"
                    style={{
                      width: "50px",
                      minWidth: "50px",
                      maxWidth: "50px",
                      padding: "8px",
                      borderTop: "none",
                      borderBottom: "none",
                    }}
                  ></th>
                </tr>
              </thead>

              <tbody>
                {vaccines.length === 0 ? (
                  <tr>
                    <td
                      className="text-center fw-bold"
                      style={{
                        width: "50px",
                        minWidth: "50px",
                        maxWidth: "50px",
                        border: "1px solid #ecedf4",
                        padding: "1px 8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      1
                    </td>

                    <td
                      style={{
                        minWidth: 200,
                        border: "1px solid #ecedf4",
                        padding: "1px 8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <div style={{ minWidth: 280 }}>
                        <ReactSelect
                          options={vaccineOptions}
                          value={null}
                          onChange={(option) => onVaccineChange?.(option, 0)}
                          placeholder="Select Vaccine"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={selectStyles}
                        />
                      </div>
                    </td>

                    <td
                      style={{
                        minWidth: 70,
                        border: "1px solid #ecedf4",
                        padding: "1px 8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <span className="text-muted">—</span>
                    </td>

                    <td
                      style={{
                        minWidth: 200,
                        border: "1px solid #ecedf4",
                        padding: "1px 8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <textarea
                        rows={1}
                        className="form-control border-0"
                        style={{
                          backgroundColor: "transparent",
                          fontSize: "0.93em",
                          padding: "8px 6px",
                          minHeight: 28,
                          maxHeight: 120,
                          overflow: "hidden",
                          resize: "none",
                        }}
                        value=""
                        onChange={(e) => {
                          onVaccineNotesChange?.(e, 0);
                          autoResize(e);
                        }}
                        placeholder="Notes (optional)"
                      />
                    </td>

                    <td
                      className="text-end"
                      style={{
                        width: "50px",
                        minWidth: "50px",
                        maxWidth: "50px",
                        padding: "1px 8px",
                        borderTop: "none",
                        borderBottom: "none",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onRemoveRow?.(0)}
                        className="btn btn-link p-0"
                        style={{
                          color: "#666",
                          textDecoration: "none",
                          fontSize: "18px",
                          lineHeight: 1,
                          padding: "0 4px",
                        }}
                        disabled={true}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ) : (
                  vaccines.map((row, index) => (
                    <tr key={index}>
                      <td
                        className="text-center fw-bold"
                        style={{
                          width: "50px",
                          minWidth: "50px",
                          maxWidth: "50px",
                          border: "1px solid #ecedf4",
                          padding: "1px 8px",
                          backgroundColor: "#fff",
                        }}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={{
                          minWidth: 200,
                          border: "1px solid #ecedf4",
                          padding: "1px 8px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <div style={{ minWidth: 280 }}>
                          <ReactSelect
                            options={vaccineOptions}
                            value={row.vaccine}
                            onChange={(option) => onVaccineChange?.(option, index)}
                            placeholder="Select Vaccine"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={selectStyles}
                          />
                        </div>
                      </td>

                      <td
                        style={{
                          minWidth: 70,
                          border: "1px solid #ecedf4",
                          padding: "1px 8px",
                          backgroundColor: "#fff",
                        }}
                      >
                        {row.vaccine?.price ? `₹${row.vaccine.price.toFixed(2)}` : <span className="text-muted">—</span>}
                      </td>

                      <td
                        style={{
                          minWidth: 200,
                          border: "1px solid #ecedf4",
                          padding: "1px 8px",
                          backgroundColor: "#fff",
                        }}
                      >
                        <textarea
                          rows={1}
                          className="form-control border-0"
                          style={{
                            backgroundColor: "transparent",
                            fontSize: "0.93em",
                            padding: "8px 6px",
                            minHeight: 28,
                            maxHeight: 120,
                            overflow: "hidden",
                            resize: "none",
                          }}
                          value={row.notes}
                          onChange={(e) => {
                            onVaccineNotesChange?.(e, index);
                            autoResize(e);
                          }}
                          placeholder="Notes (optional)"
                        />
                      </td>

                      <td
                        className="text-end"
                        style={{
                          width: "50px",
                          minWidth: "50px",
                          maxWidth: "50px",
                          padding: "1px 8px",
                          borderTop: "none",
                          borderBottom: "none",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onRemoveRow?.(index)}
                          className="btn btn-link p-0"
                          style={{
                            color: "#666",
                            textDecoration: "none",
                            fontSize: "18px",
                            lineHeight: 1,
                            padding: "0 4px",
                          }}
                          disabled={vaccines.length === 1}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                )}

                {/* Total Price Row */}
                <tr className="fw-bold">
                  <td
                    colSpan={2}
                    className="py-2"
                    style={{
                      border: "1px solid #ecedf4",
                      backgroundColor: "#fff",
                    }}
                  ></td>
                  <td
                    className="py-2"
                    style={{
                      border: "1px solid #ecedf4",
                      backgroundColor: "#fff",
                    }}
                  >
                    ₹{calculateTotalPrice().toFixed(2)}
                  </td>
                  <td
                    colSpan={2}
                    className="py-2"
                    style={{
                      border: "1px solid #ecedf4",
                      backgroundColor: "#fff",
                    }}
                  ></td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineSection;
