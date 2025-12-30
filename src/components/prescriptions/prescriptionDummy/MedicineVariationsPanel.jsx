import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';

const MedicineVariationsPanel = ({ 
  symptomsChips, 
  activeSymptomInput = "",
  contextMedicines, 
  onAddMedicine,
  onClose 
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  
  // Create a ref for the panel
  const panelRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If panel is open and click is outside the panel, close it
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]); // onClose dependency ensures the latest function is used

  // Get unique medicine types
  const uniqueMedTypes = [...new Set(contextMedicines.map(medicine => medicine?.medicine_type))].filter(Boolean);

  // Filter medicines based on symptoms, active input, selected type, and search query
  useEffect(() => {
    const hasSymptoms = symptomsChips.length > 0 || activeSymptomInput.trim().length > 0;
    
    if (!hasSymptoms) {
      setFilteredMedicines([]);
      return;
    }

    const symptomsKeywords = symptomsChips.map(s => s.toLowerCase());
    const activeInputLower = activeSymptomInput.trim().toLowerCase();
    const searchLower = searchQuery.toLowerCase().trim();
    
    const filtered = contextMedicines.filter(medicine => {
      // Check if any symptom keyword matches medicine keywords
      const medicineKeywords = medicine?.keywords ? 
        (Array.isArray(medicine.keywords) ? medicine.keywords : [medicine.keywords]) : [];
      
      // Match against saved symptoms
      const hasKeywordMatch = medicineKeywords.some(keyword =>
        symptomsKeywords.some(symptom => 
          keyword.toLowerCase().includes(symptom) || symptom.includes(keyword.toLowerCase())
        )
      );

      // Match against active input value
      const hasActiveInputKeywordMatch = activeInputLower && medicineKeywords.some(keyword =>
        keyword.toLowerCase().includes(activeInputLower) || activeInputLower.includes(keyword.toLowerCase())
      );

      // Check if medicine name contains any saved symptom
      const hasNameMatch = symptomsKeywords.some(symptom =>
        medicine.name.toLowerCase().includes(symptom)
      );

      // Check if medicine name contains active input value
      const hasActiveInputNameMatch = activeInputLower && 
        medicine.name.toLowerCase().includes(activeInputLower);

      // Filter by medicine type
      const typeMatch = selectedType === 'all' || medicine.medicine_type === selectedType;

      // Filter by search query
      const searchMatch = !searchQuery || 
        medicine.name.toLowerCase().includes(searchLower) ||
        medicine.medicine_category?.toLowerCase().includes(searchLower) ||
        medicine.brand?.toLowerCase().includes(searchLower) ||
        medicineKeywords.some(keyword => keyword.toLowerCase().includes(searchLower));

      return (hasKeywordMatch || hasActiveInputKeywordMatch || hasNameMatch || hasActiveInputNameMatch) && typeMatch && searchMatch;
    });

    setFilteredMedicines(filtered);
  }, [symptomsChips, activeSymptomInput, contextMedicines, selectedType, searchQuery]);

  // Sort medicines: in-stock first, then by name
  const sortedMedicines = useMemo(() => {
    return [...filteredMedicines].sort((a, b) => {
      // First sort by stock status (in-stock first)
      const aStock = (a.variations?.[0]?.stock || 0) > 0;
      const bStock = (b.variations?.[0]?.stock || 0) > 0;
      
      if (aStock && !bStock) return -1;
      if (!aStock && bStock) return 1;
      
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [filteredMedicines]);

  const handleAddVariation = (medicine, variation) => {
    const medicineOption = {
      label: `${medicine.name} (${variation.sku})`,
      value: variation.sku,
      medicineName: medicine.name,
      sku: variation.sku,
      price: Number(variation.price) || 0,
      unit: variation.unit,
      productId: medicine.id,
      ...variation,
    };
    
    onAddMedicine(medicineOption);
  };

  // Show panel if there are saved symptoms OR active input value
  if (symptomsChips.length === 0 && !activeSymptomInput.trim()) {
    return null;
  }

  return (
    <div 
      ref={panelRef} // Add ref to the main container
      className="position-fixed end-0 z-index-1" 
      style={{ width: '350px', top: '0',  height: '100%' }}
    >
      <div className="card h-100  rounded-0 shadow-lg"
      style={{ boxShadow: '0 10px 25px rgba(40, 60, 80, .15)' }}>
        {/* Header with title, search, and close button */}
        <div className="card-header bg-white border-bottom p-2 pt-3 ht-80">
          {/* Type Filter Buttons */}
          <div className="d-flex flex-wrap gap-1">
            {['all', ...uniqueMedTypes].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  fontSize: '0.65rem',
                  padding: '0.25rem 0.5rem',
                  lineHeight: '1.2',
                  border: '1px solid #d0d0d0',
                  borderRadius: '2px',
                  backgroundColor: selectedType === type ? '#6c757d' : '#f8f9fa',
                  color: selectedType === type ? '#fff' : '#495057',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '40px',
                  minHeight: '24px'
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== type) {
                    e.target.style.backgroundColor = '#e9ecef';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== type) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="card-body p-0 d-flex flex-column" style={{ height: 'calc(100% - 160px)' }}>
          {/* Medicines List - Scrollable Area */}
          <div className="flex-grow-1 overflow-auto" style={{ padding: '12px 8px' }}>
            {sortedMedicines.length > 0 ? (
              <div>
                {sortedMedicines.map((medicine, index) => {
                  const mainVariation = medicine.variations?.[0];
                  const isInStock = mainVariation?.stock > 0;
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => isInStock && handleAddVariation(medicine, mainVariation)}
                      style={{
                        padding: '12px 8px',
                        borderBottom: index < sortedMedicines.length - 1 ? '1px dotted #d0d0d0' : 'none',
                        cursor: isInStock ? 'pointer' : 'not-allowed',
                        opacity: isInStock ? 1 : 0.6,
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (isInStock) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isInStock) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {/* Medicine Name and Price - Top Row */}
                      <div className="d-flex justify-content-between align-items-start">
                        {/* Left: Medicine Name */}
                        <div style={{ flex: 1 }}>
                          <div 
                            style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              color: '#2c3e50',
                              lineHeight: '1.4',
                              marginBottom: '4px'
                            }}
                          >
                            {medicine.name}
                          </div>
                          {/* Secondary Info */}
                          <div 
                            style={{
                              fontSize: '12px',
                              color: '#6c757d',
                              lineHeight: '1.3'
                            }}
                          >
                            {medicine.medicine_category && `${medicine.medicine_category}`}
                            {medicine.brand && ` • ${medicine.brand}`}
                            {medicine.medicine_category || medicine.brand ? ' • ' : ''}
                            <span style={{ color: isInStock ? '#28a745' : '#dc3545' }}>
                              {isInStock ? `stock: ${mainVariation?.stock || 0} ` : 'Out of stock'} /
                            </span>
                            {medicine?.medicine_recommended ? (
                              <span title="RECOMMENDED" style={{ cursor: 'help' }}>
                                {` • ${medicine?.medicine_recommended}`}
                              </span>
                            ) : ' 4'}
                          </div>
                        </div>
                        {/* Right: Price */}
                        <div 
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: '#2c3e50',
                            marginLeft: '16px',
                            textAlign: 'right',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ₹{mainVariation?.price || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
                </div>
                <h6 className="text-muted mb-2">No medicines found</h6>
                <p className="text-muted small">
                  {searchQuery 
                    ? `No medicines found for "${searchQuery}"`
                    : selectedType === 'all' 
                      ? 'No medicines match the entered symptoms'
                      : `No ${selectedType} medicines match the entered symptoms`
                  }
                </p>
                <div className="d-flex justify-content-center align-items-center">
                  
                {searchQuery && (
                  <button 
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                )}
                {selectedType !== 'all' && (
                  <button 
                    className="btn btn-sm btn-outline-primary mt-2 ms-2 "
                    onClick={() => setSelectedType('all')}
                  >
                    Show All Types
                  </button>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineVariationsPanel;