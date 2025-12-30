import React from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../contentApi/AuthContext';
import './CalendarViewToggle.css';

const CalendarViewToggle = () => {
  const { calendarView, toggleCalendarView } = useAppointments();
  const { user } = useAuth();

  // Only show toggle for super_admin and clinic_admin
  const canAccessBothViews = ['super_admin', 'clinic_admin'].includes(user?.role);

  if (!canAccessBothViews) {
    return null;
  }

  return (
    <div className="calendar-toggle-container">
      <div className="calendar-toggle-wrapper">
        <button
          className={`calendar-toggle-btn ${calendarView === 'doctor' ? 'active' : ''}`}
          onClick={toggleCalendarView}
        >
          Doctor
        </button>
        <button
          className={`calendar-toggle-btn ${calendarView === 'receptionist' ? 'active' : ''}`}
          onClick={toggleCalendarView}
        >
          Receptionist
        </button>
        <div 
          className={`calendar-toggle-slider ${calendarView === 'doctor' ? 'doctor' : 'receptionist'}`}
          style={{ 
            left: calendarView === 'doctor' ? '4px' : '50%'
          }}
        />
      </div>
    </div>
  );
};

export default CalendarViewToggle; 