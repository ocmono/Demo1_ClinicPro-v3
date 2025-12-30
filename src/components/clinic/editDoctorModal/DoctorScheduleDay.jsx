// DoctorScheduleDay.jsx
import React from "react";
import { FiActivity, FiChevronDown, FiChevronUp, FiPlus, FiMinus, FiClock, FiUser, FiUsers, FiWifi } from "react-icons/fi";

const DoctorScheduleDay = ({
    day,
    dayIndex,
    activeDayIndex,
    setActiveDayIndex,
    addSlot,
    removeSlot,
    handleSlotChange,
    calculateDuration,
    getSlotStatus,
    getDayGradient
}) => {

    const isOpen = activeDayIndex === dayIndex;

    const toggleOpen = () => {
        setActiveDayIndex(isOpen ? null : dayIndex);
    };

    const normalizedSlots = day.slots.map(slot => ({
        ...slot,
        appointmentmode: (slot.appointmentmode || "offline").toLowerCase()
    }));

    const activeSlotsArray = normalizedSlots.filter(s => s.startTime && s.endTime);
    const activeSlotsCount = activeSlotsArray.length;

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const getModeInfo = (mode) => {
        if (mode === 'online') {
            return { icon: <FiWifi size={12} />, text: 'Online', className: 'text-primary' };
        } else {
            return { icon: <FiUser size={12} />, text: 'Offline', className: 'text-secondary' };
        }
    };

    return (
        <div className="col-12 mt-2">
            <div className={`card border-0 mb-0 ${isOpen ? "shadow-md" : "shadow-none"}`}>

                {/* HEADER (Gradient + Clickable) */}
                <div
                    className="card-header border-0 p-0 position-relative overflow-hidden"
                    onClick={toggleOpen}
                    style={{ cursor: "pointer", borderRadius: "0 1rem 0 1rem" }}
                >
                    {/* Background Gradient */}
                    <div
                        className="position-absolute w-100 h-100"
                        style={{ background: getDayGradient(day.day), opacity: 0.9 }}
                    ></div>

                    <div className="position-relative p-3 w-100 d-flex align-items-center">
                        <div className="d-flex align-items-center gap-3 flex-wrap">

                            <div className="d-flex align-items-center">
                                <div className="avatar-text avatar-md me-3 bg-white bg-opacity-25">
                                    <FiActivity size={16} />
                                </div>

                                <div>
                                    <h6 className="mb-0 fw-bold text-white">{day.day}</h6>
                                    {activeSlotsCount > 0 && (
                                        <>
                                            <small className="text-white text-opacity-75">
                                                {activeSlotsCount} slot{activeSlotsCount > 1 ? "s" : ""} configured
                                            </small>
                                            <span className="slot-details mt-1 ms-1">
                                                {activeSlotsArray.map((slot, index) => {
                                                    const modeInfo = getModeInfo(slot.appointmentmode || 'offline');
                                                    return (
                                                        <div key={index} className="slot-detail-item d-inline-flex align-items-center me-3 mb-1">
                                                            <small className="text-white text-opacity-90 me-1">
                                                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                            </small>
                                                            <span className="badge bg-white bg-opacity-25 text-black ms-1 d-inline-flex align-items-center">
                                                                <FiUsers size={10} className="me-1" />
                                                                {slot.persons || 1}
                                                            </span>
                                                            <span className={`badge ${modeInfo.className} bg-opacity-25 ms-1 d-inline-flex align-items-center text-white`}>
                                                                {modeInfo.icon}
                                                                <span className="ms-1">{modeInfo.text}</span>
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Add Slot + Chevron */}
                        <div className="ms-auto d-flex align-items-center gap-2">
                            {isOpen && (
                                <button
                                    type="button"
                                    className="btn btn-light btn-sm rounded-pill shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addSlot(dayIndex);
                                    }}
                                >
                                    <FiPlus size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* SMOOTH TRANSITION WRAPPER */}
                <div
                    style={{
                        maxHeight: isOpen ? "1000px" : "0px",
                        opacity: isOpen ? 1 : 0,
                        overflow: "hidden",
                        transition: "max-height 0.5s ease, opacity 0.5s ease",
                    }}
                >
                    <div className="card-body p-3">

                        {day.slots.length === 0 ? (
                            <div className="d-flex align-items-center justify-content-center flex-column gap-2">
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <div className="avatar-text avatar bg-light">
                                        <FiClock size={23} className="text-muted" />
                                    </div>
                                    <h5 className="text-muted mb-0">No time slots configured</h5>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm rounded-pill px-3"
                                    onClick={() => addSlot(dayIndex)}
                                >
                                    <FiPlus size={12} className="me-1" />
                                    Add First Slot
                                </button>
                            </div>
                        ) : (
                            <div className="row g-2">
                                    {normalizedSlots.map((slot, slotIndex) => {
                                    const slotStatus = getSlotStatus(slot);
                                    const duration = calculateDuration(slot.startTime, slot.endTime);

                                    return (
                                        <div key={slotIndex} className="col-12">
                                            <div
                                                className={`card mb-0 shadow-sm border-start border-3 border-0 ${slotStatus === "valid"
                                                        ? "border-success"
                                                        : slotStatus === "invalid"
                                                        ? "border-danger"
                                                        : "border-warning"
                                                    }`}
                                            >

                                                <div className="card-body p-3 pb-2">
                                                    <div className="row g-2 align-items-center">

                                                        {/* Start Time */}
                                                        <div className="col-md-3 mt-0">
                                                            <label className="form-label fw-medium mb-1">Start Time</label>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm p-2"
                                                                value={slot.startTime}
                                                                onChange={(e) =>
                                                                    handleSlotChange(dayIndex, slotIndex, "startTime", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        {/* End Time */}
                                                        <div className="col-md-3 mt-0">
                                                            <label className="form-label fw-medium mb-1">End Time</label>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm p-2"
                                                                value={slot.endTime}
                                                                onChange={(e) =>
                                                                    handleSlotChange(dayIndex, slotIndex, "endTime", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        {/* Slot Duration */}
                                                        <div className="col-md-2 mt-0">
                                                            <label className="form-label fw-medium mb-1">Duration (min)</label>
                                                            <select
                                                                className="form-select form-select-sm p-2"
                                                                value={slot.slotDuration}
                                                                onChange={(e) =>
                                                                    handleSlotChange(
                                                                        dayIndex,
                                                                        slotIndex,
                                                                        "slotDuration",
                                                                        parseInt(e.target.value)
                                                                    )
                                                                }
                                                            >
                                                                <option value={15}>15 min</option>
                                                                <option value={30}>30 min</option>
                                                                <option value={45}>45 min</option>
                                                                <option value={60}>60 min</option>
                                                            </select>
                                                        </div>

                                                        {/* Persons */}
                                                        <div className="col-md-1 mt-0">
                                                            <label className="form-label fw-medium">Persons</label>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm p-2"
                                                                min="1"
                                                                value={slot.persons}
                                                                onChange={(e) =>
                                                                    handleSlotChange(dayIndex, slotIndex, "persons", e.target.value)
                                                                }
                                                            />
                                                        </div>

                                                        <div className="col-md-2 mt-0">
                                                            <label className="form-label fw-medium mb-1">Mode</label>
                                                            <select
                                                                className="form-select form-select-sm p-2"
                                                                value={slot.appointmentmode}
                                                                onChange={(e) =>
                                                                    handleSlotChange(
                                                                        dayIndex,
                                                                        slotIndex,
                                                                        "appointmentmode",
                                                                        e.target.value.toLowerCase()
                                                                    )
                                                                }
                                                            >
                                                                <option value="online">Online</option>
                                                                <option value="offline">Offline</option>
                                                                <option value="offline">Treatment</option>
                                                            </select>
                                                        </div>

                                                        {/* Remove Slot */}
                                                        <div className="col-md-1 d-flex justify-content-end align-items-end">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm rounded-pill"
                                                                onClick={() => removeSlot(dayIndex, slotIndex)}
                                                            >
                                                                <FiMinus size={12} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Duration Text */}
                                                    {duration > 0 && (
                                                        <small
                                                            className={`mt-2 d-block text-${slotStatus === "valid"
                                                                    ? "success"
                                                                    : slotStatus === "invalid"
                                                                    ? "danger"
                                                                    : "warning"
                                                                }`}
                                                        >
                                                            Duration: {duration} minutes
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorScheduleDay;
