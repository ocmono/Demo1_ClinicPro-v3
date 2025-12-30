import React, { useState, useEffect } from "react";
import { FiClock, FiCheck, FiX, FiPlus, FiMinus, FiCalendar, FiInfo, FiAlertCircle, FiActivity } from "react-icons/fi";
import { useClinicManagement } from "../../../contentApi/ClinicMnanagementProvider";

const DoctorAvailabilityForm = () => {
  const {
    weeklyAvailability, // Context state
    handleClosedToggle, // Context functions
    handleSlotChange,
    addSlot,
    removeSlot,
  } = useClinicManagement();

  const getDayColor = (dayName) => {
    const colors = {
      'Monday': 'primary',
      'Tuesday': 'info',
      'Wednesday': 'success',
      'Thursday': 'warning',
      'Friday': 'danger',
      'Saturday': 'secondary',
      'Sunday': 'dark'
    };
    return colors[dayName] || 'primary';
  };

  const getDayGradient = (dayName) => {
    const gradients = {
      'Monday': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Tuesday': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Wednesday': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Thursday': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Friday': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'Saturday': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'Sunday': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    };
    return gradients[dayName] || gradients['Monday'];
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    return Math.round(diffMs / (1000 * 60));
  };

  const getSlotStatus = (slot) => {
    if (!slot.startTime || !slot.endTime) return 'incomplete';
    const duration = calculateDuration(slot.startTime, slot.endTime);
    if (duration <= 0) return 'invalid';
    if (duration < 30) return 'short';
    return 'valid';
  };

  const getDayIcon = (dayName) => {
    const icons = {
      'Monday': <FiActivity size={16} />,
      'Tuesday': <FiActivity size={16} />,
      'Wednesday': <FiActivity size={16} />,
      'Thursday': <FiActivity size={16} />,
      'Friday': <FiActivity size={16} />,
      'Saturday': <FiActivity size={16} />,
      'Sunday': <FiActivity size={16} />
    };
    return icons[dayName] || <FiActivity size={16} />;
  };

  return (
    <div className="availability-form">
      {/* Enhanced Header with Statistics */}
      <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card-body text-white p-4">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div className="avatar-text user-avatar-text avatar-lg me-3 bg-white bg-opacity-20">
                  <FiCalendar size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="mb-1 fw-bold text-white">Weekly Schedule</h4>
                  <p className="mb-0 text-white text-opacity-75">Configure doctor's working hours</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end gap-3">
                <div className="text-center">
                  <div className="h3 mb-0 fw-bold text-white">{weeklyAvailability.filter(d => !d.closed).length}</div>
                  <small className="text-white text-opacity-75">Active Days</small>
                </div>
                <div className="text-center">
                  <div className="h3 mb-0 fw-bold text-white">{weeklyAvailability.reduce((acc, day) => acc + day.slots.length, 0)}</div>
                  <small className="text-white text-opacity-75">Total Slots</small>
                </div>
                <div className="text-center">
                  <div className="h3 mb-0 fw-bold text-white">{weeklyAvailability.reduce((acc, day) => acc + day.slots.filter(slot => slot.startTime && slot.endTime).length, 0)}</div>
                  <small className="text-white text-opacity-75">Configured</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {weeklyAvailability.map((day, dayIndex) => {
          const dayColor = getDayColor(day.day);
          const dayGradient = getDayGradient(day.day);
          const activeSlots = day.slots.filter(slot => slot.startTime && slot.endTime).length;
          
          return (
            <div key={day.day} className="col-12">
              <div className="card border-0 shadow-sm hover-shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="card-header border-0 p-0 position-relative overflow-hidden">
                  <div className="position-absolute w-100 h-100" style={{ background: dayGradient, opacity: 0.9 }}></div>
                  <div className="position-relative p-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center">
                          <div className="avatar-text user-avatar-text avatar-md me-3 bg-white bg-opacity-20">
                            {getDayIcon(day.day)}
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold text-white">{day.day}</h6>
                            {!day.closed && activeSlots > 0 && (
                              <small className="text-white text-opacity-75">
                                {activeSlots} slot{activeSlots > 1 ? 's' : ''} configured
                              </small>
                            )}
                          </div>
                        </div>
                        <div className="form-check mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`closed-${dayIndex}`}
                            checked={day.closed}
                            onChange={() => handleClosedToggle(dayIndex)}
                          />
                          <label className="form-check-label text-white fw-medium" htmlFor={`closed-${dayIndex}`}>
                            Closed
                          </label>
                        </div>
                      </div>
                      {!day.closed && (
                        <button
                          type="button"
                          className="btn btn-light btn-sm rounded-pill shadow-sm"
                          onClick={() => addSlot(dayIndex)}
                          title="Add Time Slot"
                        >
                          <FiPlus size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {!day.closed && (
                  <div className="card-body p-4">
                    {day.slots.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="avatar-text user-avatar-text avatar-xl mx-auto mb-3 bg-light">
                          <FiClock size={32} className="text-muted" />
                        </div>
                        <h6 className="text-muted mb-2">No time slots configured</h6>
                        <p className="text-muted small mb-3">Set up working hours for this day</p>
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill px-4"
                          onClick={() => addSlot(dayIndex)}
                        >
                          <FiPlus size={14} className="me-2" />
                          Add First Slot
                        </button>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {day.slots.map((slot, slotIndex) => {
                          const slotStatus = getSlotStatus(slot);
                          const duration = calculateDuration(slot.startTime, slot.endTime);
                          
                          return (
                            <div key={slotIndex} className="col-12">
                              <div className={`card border-0 shadow-sm ${slotStatus === 'valid' ? 'border-start border-success border-3' : slotStatus === 'invalid' ? 'border-start border-danger border-3' : 'border-start border-warning border-3'}`}>
                                <div className="card-body p-3">
                                  <div className="row g-3 align-items-center">
                                    <div className="col-md-3">
                                      <label className="form-label small mb-2 fw-medium text-muted">
                                        <FiClock size={12} className="me-1" />
                                        Start Time
                                      </label>
                                      <input
                                        type="time"
                                        className={`form-control ${slotStatus === 'invalid' ? 'border-danger' : 'border-0 shadow-sm'}`}
                                        value={slot.startTime || ""}
                                        onChange={(e) =>
                                          handleSlotChange(
                                            dayIndex,
                                            slotIndex,
                                            "startTime",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    
                                    <div className="col-md-3">
                                      <label className="form-label small mb-2 fw-medium text-muted">
                                        <FiClock size={12} className="me-1" />
                                        End Time
                                      </label>
                                      <input
                                        type="time"
                                        className={`form-control ${slotStatus === 'invalid' ? 'border-danger' : 'border-0 shadow-sm'}`}
                                        value={slot.endTime || ""}
                                        onChange={(e) =>
                                          handleSlotChange(
                                            dayIndex,
                                            slotIndex,
                                            "endTime",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    
                                    <div className="col-md-2">
                                      <label className="form-label small mb-2 fw-medium text-muted">Duration</label>
                                      <input
                                        type="number"
                                        className="form-control border-0 shadow-sm"
                                        min="5"
                                        step="5"
                                        value={slot.slotDuration}
                                        onChange={(e) =>
                                          handleSlotChange(
                                            dayIndex,
                                            slotIndex,
                                            "slotDuration",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    
                                    <div className="col-md-2">
                                      <div className="d-flex gap-2 justify-content-end">
                                        {day.slots.length > 1 && (
                                          <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm rounded-pill"
                                            onClick={() => removeSlot(dayIndex, slotIndex)}
                                            title="Remove Slot"
                                          >
                                            <FiMinus size={12} />
                                          </button>
                                        )}
                                        {slotIndex === day.slots.length - 1 && (
                                          <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm rounded-pill"
                                            onClick={() => addSlot(dayIndex)}
                                            title="Add Another Slot"
                                          >
                                            <FiPlus size={12} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="col-md-2">
                                      {slot.startTime && slot.endTime && (
                                        <div className="text-center">
                                          <div className={`badge ${slotStatus === 'valid' ? 'bg-success' : slotStatus === 'invalid' ? 'bg-danger' : 'bg-warning'} mb-1`}>
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                          </div>
                                          {duration > 0 && (
                                            <small className="text-muted d-block">
                                              {duration} minutes
                                            </small>
                                          )}
                                          {slotStatus === 'invalid' && (
                                            <small className="text-danger d-block">
                                              <FiAlertCircle size={10} className="me-1" />
                                              Invalid time
                                            </small>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {day.closed && (
                  <div className="card-body p-5 text-center">
                    <div className="avatar-text user-avatar-text avatar-lg mx-auto mb-3 bg-light">
                      <FiX size={24} className="text-muted" />
                    </div>
                    <h6 className="text-muted mb-2">Day Off</h6>
                    <p className="text-muted small mb-0">No appointments available on this day</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Tips Section */}
      <div className="card border-0 shadow-sm mt-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card-body text-white p-4">
          <div className="d-flex align-items-start">
            <div className="avatar-text user-avatar-text avatar-md me-3 bg-white bg-opacity-20">
              <FiInfo size={20} className="text-white" />
            </div>
            <div className="flex-grow-1">
              <h6 className="fw-bold text-white mb-3">Quick Tips for Schedule Configuration</h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="avatar-text user-avatar-text avatar-sm me-2 bg-white bg-opacity-20">
                      <FiCheck size={12} className="text-white" />
                    </div>
                    <small className="text-white text-opacity-90">Set multiple slots for breaks and different schedules</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="avatar-text user-avatar-text avatar-sm me-2 bg-white bg-opacity-20">
                      <FiCheck size={12} className="text-white" />
                    </div>
                    <small className="text-white text-opacity-90">Mark days as closed for holidays and off days</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <div className="avatar-text user-avatar-text avatar-sm me-2 bg-white bg-opacity-20">
                      <FiCheck size={12} className="text-white" />
                    </div>
                    <small className="text-white text-opacity-90">Ensure end time is after start time for valid slots</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityForm;
