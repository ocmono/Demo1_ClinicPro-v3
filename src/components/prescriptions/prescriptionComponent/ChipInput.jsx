import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const ChipInput = ({ 
  value = [], 
  onChange, 
  placeholder = "Type and press Enter or comma...", 
  suggestions = [], 
  onSuggestionClick,
  onFocus,
  onBlur,
  disabled = false,
  allowCustom = true,
  maxChips = 20,
  chipClassName = "",
  inputClassName = "",
  containerClassName = "",
  error,
  showSuggestionsOnEmpty = false,
  suggestionTitle = "Suggestions",
  showBadge = true,
  badgeText = "Specialty",
  badgeColor = "#4A6FA5",
  allowCloseSuggestions = true,
  maxSuggestions = 10,
  renderSuggestionItem,
  ...props 
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(inputValue.toLowerCase()) && 
        !value.includes(s)
      );
      setFilteredSuggestions(filtered.slice(0, maxSuggestions));
    } else if (showSuggestionsOnEmpty) {
      // Show all suggestions when input is empty (if enabled)
      const filtered = suggestions.filter(s => !value.includes(s));
      setFilteredSuggestions(filtered.slice(0, maxSuggestions));
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions, value, showSuggestionsOnEmpty, maxSuggestions]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if ((e.target.value.trim() && suggestions.length > 0) || showSuggestionsOnEmpty) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addChip = (chipValue) => {
    const trimmedValue = chipValue.trim();
    if (!trimmedValue || value.includes(trimmedValue)) return;
    
    if (value.length >= maxChips) {
      // Use console.warn instead of toast.warn to avoid dependency
      console.warn(`Maximum ${maxChips} items allowed`);
      return;
    }
    
    onChange([...value, trimmedValue]);
    setInputValue("");
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const removeChip = (index) => {
    const newChips = [...value];
    newChips.splice(index, 1);
    onChange(newChips);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addChip(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeChip(value.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      addChip(suggestion);
    }
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (onFocus) onFocus();
    if ((inputValue.trim() && suggestions.length > 0) || showSuggestionsOnEmpty) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    if (onBlur) onBlur();
    setTimeout(() => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const closeSuggestions = () => {
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Default suggestion item renderer
  const defaultRenderSuggestion = (suggestion, index) => (
    <div
      key={index}
      className="suggestion-item"
      onClick={() => handleSuggestionClick(suggestion)}
      style={{
        padding: '10px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
      onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>{suggestion}</strong>
        </div>
        {showBadge && (
          <span 
            className="badge" 
            style={{ 
              backgroundColor: badgeColor,
              color: 'white'
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`position-relative ${containerClassName}`} ref={containerRef}>
      <div 
        className={`chips-container form-control ${inputClassName} ${error ? 'is-invalid' : ''}`}
        onClick={() => inputRef.current?.focus()}
        style={{
          minHeight: '42px',
          cursor: disabled ? 'not-allowed' : 'text',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: error ? '2px solid #dc3545' : '1px solid #dee2e6',
          backgroundColor: disabled ? '#e9ecef' : 'white'
        }}
      >
        {/* Chips */}
        {value.map((chip, index) => (
          <div
            key={index}
            className={`chip ${chipClassName}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '16px',
              backgroundColor: '#4A6FA5',
              color: 'white',
              fontSize: '0.85rem',
              cursor: 'default',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ marginRight: '4px' }}>{chip}</span>
            <button
              type="button"
              onClick={() => removeChip(index)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                opacity: 0.8
              }}
              onMouseOver={(e) => e.target.style.opacity = '1'}
              onMouseOut={(e) => e.target.style.opacity = '0.8'}
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            minWidth: '100px',
            backgroundColor: 'transparent',
            fontSize: '0.9rem',
            minHeight: '30px'
          }}
          {...props}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="suggestions-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginTop: '4px',
            maxHeight: '250px',
            overflowY: 'auto',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div className="p-2 border-bottom d-flex justify-content-between align-items-center bg-light">
            <small className="text-muted fw-bold">{suggestionTitle}</small>
            {allowCloseSuggestions && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger py-0 px-2"
                onClick={closeSuggestions}
                style={{ fontSize: '0.7rem' }}
              >
                ×
              </button>
            )}
          </div>
          {filteredSuggestions.map((suggestion, index) => (
            renderSuggestionItem 
              ? renderSuggestionItem(suggestion, index, handleSuggestionClick)
              : defaultRenderSuggestion(suggestion, index)
          ))}
        </div>
      )}

      {error && (
        <p className="input-error text-danger mt-1 mb-0" style={{ fontSize: '0.8rem' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ChipInput;