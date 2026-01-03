import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { FiCalendar } from "react-icons/fi";
import './CustomCalendar.css'

const CustomDatePicker = ({
  selected,
  onChange,
  startBufferDate = 0, // days from today as minimum
  endBufferDate = 365, // days from today as maximum
  minDate,
  maxDate,
  placeholder = "Select date",
  className = "",
  disabled = false,
  selectedDoctor = null,
  isDateAvailable = null,
  generateTimeSlots = null, 
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef(null);

  // Calculate min and max dates based on buffers
  const today = new Date();
  const calculatedMinDate = minDate || addDays(today, startBufferDate);
  const calculatedMaxDate = maxDate || addDays(today, endBufferDate);

  // Close datepicker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const normalizeToStartOfDay = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Check if date is selectable
  const isDateSelectable = (date) => {
    const formatted = format(date, "yyyy-MM-dd");

    // Check buffer limits
    const checkDate = normalizeToStartOfDay(date);
    const min = normalizeToStartOfDay(calculatedMinDate);
    const max = normalizeToStartOfDay(calculatedMaxDate);

    if (checkDate < min || checkDate > max) {
      return false;
    }

    // Check if doctor has availability on this weekday
    if (selectedDoctor && isDateAvailable && !isDateAvailable(formatted)) {
      return false;
    }

    return true;
  };

  // Check if date is today
  const isToday = (date) => {
    return isSameDay(date, today);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (isDateSelectable(date)) {
      onChange(date);
      setIsOpen(false);
    }
  };

  // Format displayed date
  const formatDisplayDate = (date) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const days = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="custom-datepicker" ref={datePickerRef}>
      <div className="input-group">
        <input
          type="text"
          className={`form-control form-control-sm ${className}`}
          value={selected ? formatDisplayDate(selected) : ''}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          readOnly
          disabled={disabled}
          {...props}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <FiCalendar />
        </button>
      </div>

      {isOpen && (
        <div className="datepicker-dropdown">
          {/* Header */}
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-nav"
              onClick={() => navigateMonth(-1)}
            >
              ‹
            </button>
            <span className="datepicker-month-year">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              className="datepicker-nav"
              onClick={() => navigateMonth(1)}
            >
              ›
            </button>
          </div>

          {/* Week days */}
          <div className="datepicker-weekdays">
            {weekDays.map(day => (
              <div key={day} className="datepicker-weekday">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="datepicker-days">
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selected && isSameDay(date, selected);
              const selectable = isDateSelectable(date);
              
              return (
                <button
                  key={index}
                  type="button"
                  className={`datepicker-day 
                    ${isCurrentMonth ? 'current-month' : 'other-month'} 
                    ${isSelected ? 'selected' : ''} 
                    ${isToday(date) ? 'today' : ''} 
                    ${!selectable ? 'disabled' : ''}
                  `}
                  onClick={() => handleDateSelect(date)}
                  disabled={!selectable}
                  title={!selectable ? `Date must be between ${format(calculatedMinDate, 'MMM dd, yyyy')} and ${format(calculatedMaxDate, 'MMM dd, yyyy')}` : ''}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="datepicker-quick-actions">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleDateSelect(calculatedMinDate)}
              disabled={!isDateSelectable(calculatedMinDate)}
            >
              Earliest
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;