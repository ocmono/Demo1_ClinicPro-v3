import React, { useState, useEffect } from 'react';

const CombinedInputSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Type or select...",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);

  // Initialize input value when component receives a value prop
  useEffect(() => {
    if (value && value.medicineName) {
      setInputValue(value.medicineName);
    } else if (value && value.label) {
      setInputValue(value.label);
    } else if (typeof value === 'string') {
      setInputValue(value);
    } else {
      setInputValue('');
    }
  }, [value]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.medicineName?.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
        setShowSuggestions(isFocused && filtered.length > 0);
    } else {
      setFilteredSuggestions(options);
        setShowSuggestions(isFocused && options.length > 0);
    }
  }, [inputValue, options]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    
    // If input is cleared, clear the selected value
    if (!newValue.trim()) {
      onChange(null);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.label || suggestion.medicineName || suggestion.value);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // If there's an exact match in suggestions, use it
      const exactMatch = filteredSuggestions.find(
        option => option.label.toLowerCase() === inputValue.toLowerCase() ||
                 option.medicineName?.toLowerCase() === inputValue.toLowerCase()
      );
      
      if (exactMatch) {
        onChange(exactMatch);
      } else {
        // Create a manual entry
        const manualEntry = {
          label: inputValue,
          value: `manual_${Date.now()}`,
          medicineName: inputValue,
          sku: `MANUAL_${Date.now()}`,
          price: 0,
          isManual: true
        };
        onChange(manualEntry);
      }
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        className={`form-control bg-white border-0 px-3`}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        style={{ 
          fontSize: '1em', 
          borderRadius: 8, 
          height: '38px',
          overflow: 'hidden', 
          resize: 'none',
          border: '1px solid #dee2e6 !important'
        }}
        autoComplete="off"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <ul className="list-group" style={{ margin: 0 }}>
            {filteredSuggestions.map((suggestion, idx) => (
              <li 
                key={idx} 
                className="list-group-item list-group-item-action" 
                style={{ 
                  cursor: 'pointer', 
                  border: 'none',
                  borderBottom: '1px solid #eee',
                  padding: '8px 12px',
                  fontSize: '0.9em'
                }} 
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CombinedInputSelect;