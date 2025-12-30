import React from 'react';

const MedicineSuggestion = ({
  showMedicineSuggestions,
  filteredMedicineSuggestions,
  selectedMedicineType,
  setSelectedMedicineType,
  medicineTypes,
  contextMedicines,
  handleMedicineSuggestionClick,
  setShowMedicineSuggestions,
  getFilteredMedicinesByType,
  innerRef
}) => {
  if (!showMedicineSuggestions || filteredMedicineSuggestions.length === 0) {
    return null;
  }

  return (
    <div ref={innerRef}>
      <div 
        className="position-fixed bg-white shadow-lg border rounded"
        style={{
          zIndex: 9999,
          maxHeight: 320,
          width: '100%',
          bottom: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 15px 5px 15px',
          boxShadow: '0 -5px 20px rgba(0,0,0,0.15)',
          borderBottom: 'none',
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0',
          animation: 'slideUp 0.3s ease-out',
          overflowY: 'hidden'
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateX(-50%) translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateX(-50%) translateY(0);
              opacity: 1;
            }
          }
        `}</style>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          {/* Left side - Title */}
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>Suggested Medicines</h6>
            <span className="badge bg-primary" style={{ fontSize: '0.75rem' }}>
              {filteredMedicineSuggestions.length} found
            </span>
          </div>

          {/* Center - Medicine Type Filter Tabs */}
          <div className="d-flex align-items-center justify-content-center" style={{ flex: 1, maxWidth: '50%' }}>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <div className="d-flex gap-1" style={{ flexWrap: 'nowrap' }}>
                {medicineTypes.map((type, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn btn-sm ${selectedMedicineType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedMedicineType(type)}
                    style={{
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      minHeight: '26px'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Cancel button */}
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => setShowMedicineSuggestions(false)}
              style={{
                fontSize: '0.75rem',
                padding: '2px 12px',
                minHeight: '26px',
                whiteSpace: 'nowrap'
              }}
            >
              <i className="bi bi-x me-1"></i>
              Cancel
            </button>
          </div>
        </div>

        {/* Medicine Cards Grid - 2 Rows */}
        <div style={{
          height: '128px',
          overflowY: 'auto',
          paddingRight: '5px'
        }}>
          <div className="row" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '10px'
          }}>
            {getFilteredMedicinesByType().map((medicine, idx) => {
              const originalMed = contextMedicines.find(
                med => med.id === medicine.productId ||
                  med.variations?.some(v => v.id === medicine.id)
              );

              const medicineType = originalMed?.medicine_type || 'Other';
              const medicineCategory = originalMed?.medicine_category;
              const brand = originalMed?.brand || 'Generic';

              // Get color based on medicine type
              const getTypeColor = () => {
                switch (medicineType) {
                  case 'Tablet': return '#0d6efd';
                  case 'Syrup': return '#0dcaf0';
                  case 'Injection': return '#dc3545';
                  case 'Capsule': return '#ffc107';
                  default: return '#6c757d';
                }
              };

              const typeColor = getTypeColor();

              return (
                <div
                  key={idx}
                  className="col mt-0"
                  style={{
                    maxHeight: '110px'
                  }}
                >
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderLeft: `3px solid ${typeColor}`,
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                    onClick={() => handleMedicineSuggestionClick(medicine)}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'}
                  >
                    <div className="card-body p-2" style={{ paddingBottom: '4px' }}>
                      <div className="d-flex justify-content-between align-items-start h-100">
                        {/* Left Side - Medicine Info */}
                        <div style={{
                          width: '75%',
                          overflow: 'hidden'
                        }}>
                          <h6 className="fw-bold mb-1" style={{
                            fontSize: '0.85rem',
                            color: '#212529',
                            lineHeight: '1.2',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {medicine.medicineName}
                          </h6>

                          <div className="mb-1">
                            <small className="fw-semibold" style={{ fontSize: '0.7rem' }}>
                              {brand} •
                            </small>
                            <small className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>
                              {medicine.sku}
                            </small>
                          </div>

                          {medicineCategory && (
                            <small
                              className="text-muted rounded-1"
                              style={{
                                fontSize: "0.7rem",
                                backgroundColor: "#e9e9e9",
                                padding: "2px 4px",
                              }}
                            >
                              {medicineCategory}
                            </small>
                          )}

                        </div>

                        {/* Right Side - Price and Add Button */}
                        <div className="d-flex flex-column align-items-end justify-content-between h-100">
                          <div className="fw-bold text-primary text-end" style={{ fontSize: '0.9rem' }}>
                            ₹{medicine.price}
                            <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                              Qut :<span className={medicine.stock <= 5 ? 'text-danger fw-bold' : ''}>
                                {medicine.stock || 'N/A'}
                              </span>
                            </small>
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm rounded-2"
                            style={{
                              backgroundColor: typeColor,
                              color: 'white',
                              padding: '2px 10px',
                              fontSize: '0.75rem',
                              border: 'none',
                              transition: 'all 0.2s ease',
                              minWidth: '60px'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMedicineSuggestionClick(medicine);
                            }}
                          >
                            <i className="bi bi-plus me-1"></i>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineSuggestion;