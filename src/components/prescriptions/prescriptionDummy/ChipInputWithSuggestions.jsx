import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiXCircle } from 'react-icons/fi';

const ChipInputWithSuggestions = ({
  label,
  value,
  onChange,
  placeholder,
  suggestions = [],
  allowCustom = true,
  error,
  icon,
  iconColor = 'text-primary',
  showSourceTags = false,
  sourceType = 'template'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableSuggestions, setAvailableSuggestions] = useState(suggestions);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const [chips, setChips] = useState(Array.isArray(value) ? value : []);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setAvailableSuggestions(suggestions);
    setFilteredSuggestions(suggestions);
  }, [suggestions]);

  useEffect(() => {
    if (Array.isArray(value)) setChips(value);
  }, [value]);

  useEffect(() => {
    const chipValues = chips.map(c => (typeof c === 'object' ? c.value : c));
    const filtered = suggestions.filter(s => !chipValues.includes(s));
    setAvailableSuggestions(filtered);
    setFilteredSuggestions(filtered);
  }, [chips, suggestions]);

  useEffect(() => {
    const handler = e => {
      if (
        !suggestionsRef.current?.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions(availableSuggestions);
    } else {
      setFilteredSuggestions(
        availableSuggestions.filter(s =>
          s.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    }
  }, [inputValue, availableSuggestions]);

  const handleAddChip = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;

    if (!chips.some(c => (typeof c === 'object' ? c.value : c) === trimmed)) {
      const newChips = [...chips, showSourceTags ? { value: trimmed, source: sourceType } : trimmed];
      setChips(newChips);
      onChange(showSourceTags ? newChips : newChips.map(c => (typeof c === 'object' ? c.value : c)));
    }

    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveChip = (i) => {
    const updated = chips.filter((_, idx) => idx !== i);
    setChips(updated);
    onChange(showSourceTags ? updated : updated.map(c => (typeof c === 'object' ? c.value : c)));
  };

  const handleAddAllSuggestions = () => {
    const newChips = [...chips];
    availableSuggestions.forEach(s => {
      if (!newChips.some(c => (typeof c === 'object' ? c.value : c) === s)) {
        newChips.push(showSourceTags ? { value: s, source: sourceType } : s);
      }
    });
    setChips(newChips);
    onChange(showSourceTags ? newChips : newChips.map(c => (typeof c === 'object' ? c.value : c)));
    setShowSuggestions(false);
  };

  return (
    <div className="mb-3 position-relative">
      <label className="form-label fw-bold d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {icon && <span className={iconColor}>{icon}</span>}
          {label}
          {chips.length > 0 && (
            <span className="badge bg-secondary">{chips.length}</span>
          )}
        </div>
        {chips.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              setChips([]);
              onChange([]);
            }}
          >
            Clear All
          </button>
        )}
      </label>

      {/* Input + Chips (SAME LINE) */}
      <div
        className={`form-control d-flex flex-wrap align-items-center gap-1 p-2 ${error ? 'is-invalid' : ''}`}
        onClick={() => inputRef.current?.focus()}
        style={{ cursor: 'text', minHeight: '42px' }}
      >
        {chips.map((chip, i) => (
          <div
            key={i}
            className="d-flex align-items-center gap-1 bg-light text-dark px-2 py-1 "
            style={{ fontSize: '0.75em' }}
          >
            <span>{typeof chip === 'object' ? chip.value : chip}</span>
            <button
              type="button"
              className="btn p-0 text-dark"
              onClick={e => {
                e.stopPropagation();
                handleRemoveChip(i);
              }}
            >
              <FiX size={14} />
            </button>
          </div>
        ))}

        <input
          ref={inputRef}
          className="border-0 flex-grow-1 p-0"
          placeholder={chips.length ? '' : placeholder}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={e => e.key === 'Enter' && allowCustom && handleAddChip(inputValue)}
          style={{ minWidth: '80px', outline: 'none' }}
        />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="position-absolute bg-white border shadow-sm p-2"
          style={{ width: '100%', zIndex: 10, marginTop: '4px' }}
        >
          {filteredSuggestions.length === 0 ? (
            <div className="text-center text-muted py-3">
              <FiXCircle className="mb-1" />
              <div>No suggestions</div>
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {availableSuggestions.length > 0 && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleAddAllSuggestions}
                >
                  Add All
                </button>
              )}
              {filteredSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="btn btn-sm bg-light text-dark border"
                  onClick={() => handleAddChip(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};


export default ChipInputWithSuggestions;
