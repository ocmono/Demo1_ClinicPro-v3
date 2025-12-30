import React, { useEffect, useRef } from "react";

const SuggestionDropdown = ({
  visible,
  suggestions = [],
  position = { top: 0, left: 0, width: 300 },
  onSelect,
  onClose,
}) => {
  const dropdownRef = useRef(null);

  /* ---- Close on outside click ---- */
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, onClose]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white border shadow-sm"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left - 10,
        width: Math.max(position.width || 350, 350),
        zIndex: 1,
        maxHeight: 300,
        overflowY: "auto",
        borderRadius: 6,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {suggestions.map((item, index) => (
        <button
          key={index}
          type="button"
          className="w-100 text-start px-2 py-1"
          style={{
            border: "none",
            background: "transparent",
            borderBottom:
              index < suggestions.length - 1 ? "1px solid #f1f1f1" : "none",
            fontSize: ".9rem",
            cursor: "pointer",
          }}
          onClick={() => onSelect(item)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#f8f9fa")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {item}
        </button>
      ))}
    </div>
  );
};

export default SuggestionDropdown;
