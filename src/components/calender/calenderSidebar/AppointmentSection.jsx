import React from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { RiArrowUpDownLine } from "react-icons/ri";

const AppointmentSection = React.memo(({ 
  title, 
  appointments, 
  expanded, 
  onToggle, 
  sortOrder,
  onSortToggle,
  icon: Icon,
  className,
  children 
}) => {
  if (appointments.length === 0) return null;

  return (
    <div className="calendar-sidebar-item">
      <div className="section-header" onClick={onToggle}>
        <h6 className={`fs-12 fw-bold text-uppercase mb-0 d-flex align-items-center justify-content-between ${className}`}>
          <span>{title}</span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm p-0 ms-1 border-0 bg-transparent"
              style={{ color: '#0d6efd', textDecoration: 'none' }}
              onClick={(e) => {
                e.stopPropagation();
                onSortToggle();
              }}
              title={`Sort by time (${sortOrder === "asc" ? "Earliest First" : "Latest First"})`}
            >
              <RiArrowUpDownLine size={12} />
            </button>
            {expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          </div>
        </h6>
      </div>
      {expanded && children}
    </div>
  );
});

export default AppointmentSection;