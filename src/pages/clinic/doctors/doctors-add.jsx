import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import { 
  FiArrowLeft, FiUserPlus, FiSave, FiX, FiUser, FiPhone, FiAward, FiClock, FiInfo, 
  FiMail, FiMapPin, FiCalendar, FiPlus, FiMinus, FiCheck, FiAlertCircle, FiActivity,
  FiLock, FiEye, FiEyeOff
} from 'react-icons/fi';
import { useClinicManagement } from "../../../contentApi/ClinicMnanagementProvider";

const DoctorsAdd = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const {
    clinicSpecialities,
    doctorForm,
    setDoctorForm,
    saveDoctorInDB,
    weeklyAvailability,
    setWeeklyAvailability,
    resetWeeklyAvailability,
  } = useClinicManagement();

  // Initialize form with default values if empty
  React.useEffect(() => {
    if (!doctorForm.startBufferTime) {
      setDoctorForm(prev => ({
        ...prev,
        startBufferTime: "0",
        endBufferTime: "0",
        status: "Active"
      }));
    }
  }, []);

  // Handle input changes for the main form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setDoctorForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Availability handlers (copied from edit form)
  const handleClosedToggle = (dayIndex) => {
    setWeeklyAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, closed: !day.closed } : day
    ));
  };

  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    setWeeklyAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        slots: day.slots.map((slot, sIndex) => 
          sIndex === slotIndex ? { ...slot, [field]: value } : slot
        )
      } : day
    ));
  };

  const addSlot = (dayIndex) => {
    setWeeklyAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        slots: [...day.slots, { startTime: "", endTime: "", slotDuration: 30 }]
      } : day
    ));
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setWeeklyAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? {
        ...day,
        slots: day.slots.filter((_, sIndex) => sIndex !== slotIndex)
      } : day
    ));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
    if (
      !doctorForm.firstName ||
      !doctorForm.lastName ||
      !doctorForm.drSpeciality ||
      !doctorForm.gender ||
      !doctorForm.drPhone ||
      !doctorForm.drEmail ||
      !doctorForm.drQualification ||
      !doctorForm.password
    ) {
        toast.error("Please fill all required fields!");
      return;
    }
      
      if (doctorForm.password !== confirmPassword) {
        toast.error("Passwords do not match!");
        setSaving(false);
        return;
      }

    const fullDoctorData = {
      ...doctorForm,
        availability: weeklyAvailability,
    };
      await saveDoctorInDB(fullDoctorData);


      // ✅ Show success toast
      toast.success("Doctor added successfully!");

      // Clear form only on success
    setDoctorForm({
      firstName: "",
      lastName: "",
      drSpeciality: "",
      gender: "",
      drPhone: "",
      drEmail: "",
      drQualification: "",
      startBufferTime: "0",
      endBufferTime: "0",
      status: "Active",
      password: ""
    });
      setConfirmPassword("");

    resetWeeklyAvailability();
    navigate('/clinic/doctors');
    } catch (error) {
      console.error("Failed to add doctor:", error);
      // toast.error("Failed to add doctor");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/clinic/doctors');
  };

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
            <button 
            className="btn btn-icon btn-light-secondary me-2"
              onClick={handleCancel}
            title="Back to Doctors List"
            >
            <FiArrowLeft size={16} />
            </button>
          <div className="text-muted">
            <small>Fill in the details to add a new doctor</small>
          </div>
        </div>
      </PageHeader>
      
      <div className='main-content'>
        <div className='row'>
          <div className="col-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <FiUserPlus size={20} className="me-2 text-primary" />
                  Add New Doctor
                </h5>
                <p className="text-muted mb-0">Create a new doctor profile with all necessary information</p>
              </div>
              
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Tab Navigation */}
                  <div className="mb-4">
                    <ul className="nav nav-tabs" id="doctorAddTab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                          onClick={() => setActiveTab('basic')}
                          type="button"
                        >
                          <FiUser size={16} className="me-2" />
                          Basic Information
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === 'professional' ? 'active' : ''}`}
                          onClick={() => setActiveTab('professional')}
                          type="button"
                        >
                          <FiAward size={16} className="me-2" />
                          Professional
                        </button>
                      </li>
                      {/* <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === 'address' ? 'active' : ''}`}
                          onClick={() => setActiveTab('address')}
                          type="button"
                        >
                          <FiMapPin size={16} className="me-2" />
                          Address
                        </button>
                      </li> */}
                      {/* <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === 'biography' ? 'active' : ''}`}
                          onClick={() => setActiveTab('biography')}
                          type="button"
                        >
                          <FiUser size={16} className="me-2" />
                          Biography
                        </button>
                      </li> */}
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                          onClick={() => setActiveTab('schedule')}
                          type="button"
                        >
                          <FiCalendar size={16} className="me-2" />
                          Weekly Schedule
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Tab Content */}
                  <div className="tab-content">
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                  <div className="row g-4">
                    <div className="col-12">
                          <h6 className="fw-bold mb-3">
                            <FiUser size={16} className="me-2 text-primary" />
                            Basic Information
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                          <label className="form-label fw-medium">First Name *</label>
                        <input
                          type="text"
                            className="form-control"
                          name="firstName"
                          value={doctorForm.firstName || ""}
                          onChange={handleChange}
                            required
                          placeholder="Enter first name"
                        />
                    </div>
                    
                    <div className="col-md-6">
                          <label className="form-label fw-medium">Last Name *</label>
                        <input
                          type="text"
                            className="form-control"
                          name="lastName"
                          value={doctorForm.lastName || ""}
                          onChange={handleChange}
                            required
                          placeholder="Enter last name"
                        />
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Email *</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FiMail size={14} />
                            </span>
                            <input
                              type="email"
                              className="form-control"
                              name="drEmail"
                              value={doctorForm.drEmail || ""}
                              onChange={handleChange}
                              required
                              placeholder="Enter email address"
                            />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                          <label className="form-label fw-medium">Phone *</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FiPhone size={14} />
                            </span>
                            <input
                              type="tel"
                              className="form-control"
                              name="drPhone"
                              value={doctorForm.drPhone || ""}
                          onChange={handleChange}
                          required
                              placeholder="Enter phone number"
                            />
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                          <label className="form-label fw-medium">Gender *</label>
                        <select
                            className="form-select"
                          name="gender"
                          value={doctorForm.gender || ""}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div className="col-md-6">
                          <label className="form-label fw-medium">Status</label>
                          <select
                            className="form-select"
                            name="status"
                            value={doctorForm.status || "Active"}
                          onChange={handleChange}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Leave">On Leave</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">Password *</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FiLock size={14} />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control"
                              name="password"
                              value={doctorForm.password || ""}
                              onChange={handleChange}
                              required
                              placeholder="Enter password"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                            </button>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">Confirm Password *</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FiLock size={14} />
                            </span>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className="form-control"
                              name="confirmPassword"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              placeholder="Re-enter password"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Professional Information Tab */}
                    {activeTab === 'professional' && (
                      <div className="row g-4">
                    <div className="col-12">
                          <h6 className="fw-bold mb-3">
                            <FiAward size={16} className="me-2 text-success" />
                        Professional Information
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                          <label className="form-label fw-medium">Specialty *</label>
                          <select
                            className="form-select"
                            name="drSpeciality"
                            value={doctorForm.drSpeciality || ""}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Specialty</option>
                            {clinicSpecialities.map((spec, index) => (
                              <option key={index} value={spec.speciality}>
                                {spec.speciality}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Qualification *</label>
                        <select
                            className="form-select"
                          name="drQualification"
                          value={doctorForm.drQualification || ""}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Qualification</option>
                          <option value="MBBS">MBBS</option>
                          <option value="MD">MD</option>
                          <option value="MS">MS</option>
                          <option value="DNB">DNB</option>
                          <option value="DM">DM</option>
                          <option value="MCh">MCh</option>
                          <option value="BDS">BDS</option>
                          <option value="MDS">MDS</option>
                          <option value="BHMS">BHMS</option>
                          <option value="BAMS">BAMS</option>
                          <option value="BUMS">BUMS</option>
                          <option value="PhD">PhD</option>
                          <option value="Fellowship">Fellowship</option>
                          <option value="Diploma">Diploma</option>
                        </select>
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-medium">Years of Experience</label>
                          <input
                            type="number"
                            className="form-control"
                            name="experience"
                            value={doctorForm.experience || ""}
                            onChange={handleChange}
                            min="0"
                            max="50"
                            placeholder="Enter years of experience"
                          />
                    </div>
                    
                        {/* Buffer Times */}
                    <div className="col-md-6">
                        <label className="form-label fw-medium">Start Buffer Time (Days)</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FiClock size={14} />
                            </span>
                        <input
                          type="number"
                              className="form-control"
                          name="startBufferTime"
                          value={doctorForm.startBufferTime || ""}
                          onChange={handleChange}
                          min="0"
                              placeholder="e.g. 4"
                        />
                        </div>
                          <small className="text-muted">Days before appointment</small>
                    </div>
                    
                    <div className="col-md-6">
                        <label className="form-label fw-medium">End Buffer Time (Months)</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FiClock size={14} />
                            </span>
                        <input
                          type="number"
                              className="form-control"
                          name="endBufferTime"
                          value={doctorForm.endBufferTime || ""}
                          onChange={handleChange}
                          min="0"
                              placeholder="e.g. 1"
                        />
                          </div>
                          <small className="text-muted">Months after appointment</small>
                        </div>
                      </div>
                    )}

                    {/* Address Information Tab */}
                    {/* {activeTab === 'address' && (
                      <div className="row g-4">
                        <div className="col-12">
                          <h6 className="fw-bold mb-3">
                            <FiMapPin size={16} className="me-2 text-info" />
                            Address Information
                          </h6>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-medium">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={doctorForm.address || ""}
                            onChange={handleChange}
                            placeholder="Enter full address"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-medium">City</label>
                          <input
                            type="text"
                            className="form-control"
                            name="city"
                            value={doctorForm.city || ""}
                            onChange={handleChange}
                            placeholder="Enter city"
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-medium">State</label>
                          <input
                            type="text"
                            className="form-control"
                            name="state"
                            value={doctorForm.state || ""}
                            onChange={handleChange}
                            placeholder="Enter state"
                          />
                    </div>

                        <div className="col-md-4">
                          <label className="form-label fw-medium">ZIP Code</label>
                          <input
                            type="text"
                            className="form-control"
                            name="zipCode"
                            value={doctorForm.zipCode || ""}
                            onChange={handleChange}
                            placeholder="Enter ZIP code"
                          />
                        </div>
                      </div>
                    )} */}

                    {/* Biography Tab */}
                    {/* {activeTab === 'biography' && (
                      <div className="row g-4">
                    <div className="col-12">
                          <h6 className="fw-bold mb-3">
                            <FiUser size={16} className="me-2 text-warning" />
                            Biography
                      </h6>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-medium">Biography</label>
                          <textarea
                            className="form-control"
                            name="bio"
                            value={doctorForm.bio || ""}
                            onChange={handleChange}
                            rows="8"
                            placeholder="Tell us about the doctor's background, expertise, and experience..."
                          />
                        </div>
                      </div>
                    )} */}

                    {/* Weekly Schedule Tab */}
                    {activeTab === 'schedule' && (
                      <div className="row g-4">
                        <div className="col-12">
                          <h6 className="fw-bold mb-3">
                            <FiCalendar size={16} className="me-2 text-danger" />
                            Weekly Schedule
                          </h6>
                          <p className="text-muted mb-4">Configure doctor's working hours for each day of the week</p>
                        </div>

                        <div className="col-12">
                          <div className="row g-3">
                            {weeklyAvailability.map((day, dayIndex) => {
                              const dayColor = getDayColor(day.day);
                              const dayGradient = getDayGradient(day.day);
                              const activeSlots = day.slots.filter(slot => slot.startTime && slot.endTime).length;
                              
                              return (
                                <div key={day.day} className="col-12">
                                  <div className="card border-0 shadow-sm">
                                    <div className="border-0 p-0 position-relative overflow-hidden">
                                      <div className="position-absolute w-100 h-100" style={{ background: dayGradient, opacity: 0.9 }}></div>
                                      <div className="position-relative p-3">
                                        <div className="d-flex align-items-center w-100">
                                          <div className="d-flex align-items-center gap-3 flex-wrap">
                                            <div className="d-flex align-items-center">
                                              <div className="avatar-text user-avatar-text avatar-md me-3 bg-white bg-opacity-20">
                                                <FiActivity size={16} />
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
                                            <div className="form-check mb-0 me-3">
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
                                              className="btn btn-light btn-sm rounded-pill shadow-sm ms-auto"
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
                                          <div className="text-center py-3">
                                            <div className="avatar-text user-avatar-text avatar-lg mx-auto mb-3 bg-light">
                                              <FiClock size={24} className="text-muted" />
                                            </div>
                                            <h6 className="text-muted mb-2">No time slots configured</h6>
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
                                                            className="form-control form-control-sm"
                                                            value={slot.startTime}
                                                            onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                                                          />
                                                        </div>
                                                        <div className="col-md-3">
                                                          <label className="form-label small mb-2 fw-medium text-muted">
                                                            <FiClock size={12} className="me-1" />
                                                            End Time
                                                          </label>
                                                          <input
                                                            type="time"
                                                            className="form-control form-control-sm"
                                                            value={slot.endTime}
                                                            onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                                                          />
                                                        </div>
                                                        <div className="col-md-2">
                                                          <label className="form-label small mb-2 fw-medium text-muted">
                                                            Duration
                                                          </label>
                                                          <select
                                                            className="form-select form-select-sm"
                                                            value={slot.slotDuration}
                                                            onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'slotDuration', parseInt(e.target.value))}
                                                          >
                                                            <option value={15}>15 min</option>
                                                            <option value={30}>30 min</option>
                                                            <option value={45}>45 min</option>
                                                            <option value={60}>60 min</option>
                                                          </select>
                                                        </div>
                                                        <div className="col-md-2">
                                                          <label className="form-label small mb-2 fw-medium text-muted">
                                                            Status
                                                          </label>
                                                          <div className="d-flex align-items-center">
                                                            {slotStatus === 'valid' && (
                                                              <span className="badge bg-success">
                                                                <FiCheck size={10} className="me-1" />
                                                                Valid
                                                              </span>
                                                            )}
                                                            {slotStatus === 'invalid' && (
                                                              <span className="badge bg-danger">
                                                                <FiX size={10} className="me-1" />
                                                                Invalid
                                                              </span>
                                                            )}
                                                            {slotStatus === 'incomplete' && (
                                                              <span className="badge bg-warning">
                                                                <FiInfo size={10} className="me-1" />
                                                                Incomplete
                                                              </span>
                                                            )}
                                                            {slotStatus === 'short' && (
                                                              <span className="badge bg-info">
                                                                <FiAlertCircle size={10} className="me-1" />
                                                                Short
                                                              </span>
                                                            )}
                                                          </div>
                                                          {slotStatus === 'valid' && (
                                                            <small className="text-muted d-block">
                                                              {duration} min
                                                            </small>
                                                          )}
                                                        </div>
                                                        <div className="col-md-2">
                                                          <label className="form-label small mb-2 fw-medium text-muted">
                                                            Actions
                                                          </label>
                                                          <div className="d-flex gap-1">
                                                            <button
                                                              type="button"
                                                              className="btn btn-outline-danger btn-sm"
                                                              onClick={() => removeSlot(dayIndex, slotIndex)}
                                                              title="Remove Slot"
                                                            >
                                                              <FiMinus size={12} />
                                                            </button>
                                                          </div>
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
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                  
                  {/* Tab Navigation Buttons */}
                  <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                    <button 
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        // const tabs = ['basic', 'professional', 'address', 'biography', 'schedule'];
                        const tabs = ['basic', 'professional', 'schedule'];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1]);
                        }
                      }}
                      disabled={activeTab === 'basic'}
                    >
                      <FiArrowLeft size={16} className="me-2" />
                      Previous
                    </button>
                    
                    <div className="d-flex gap-2">
                      {activeTab === 'professional' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmit}
                          disabled={saving}
                        >
                          <FiSave size={16} className="me-2" />
                          {saving ? 'Adding Doctor...' : 'Add Doctor'}
                        </button>
                      )}

                      {activeTab === 'schedule' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmit}
                          disabled={saving}
                        >
                          <FiSave size={16} className="me-2" />
                          {saving ? 'Adding Doctor...' : 'Add Doctor'}
                        </button>
                      )}
                    </div>

                    {activeTab !== 'schedule' && (
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={() => {
                        // const tabs = ['basic', 'professional', 'address', 'biography', 'schedule'];
                        const tabs = ['basic', 'professional', 'schedule'];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1]);
                        }
                      }}
                      disabled={activeTab === 'schedule'}
                    >
                      Next
                      <FiArrowLeft size={16} className="ms-2" style={{ transform: 'rotate(180deg)' }} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DoctorsAdd;