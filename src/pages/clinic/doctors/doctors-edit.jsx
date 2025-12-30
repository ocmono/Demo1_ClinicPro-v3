import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, FiAward, FiMapPin, FiClock, FiCalendar, FiPlus, FiMinus, FiCheck, FiX, FiInfo, FiAlertCircle, FiActivity } from "react-icons/fi";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Footer from "@/components/shared/Footer";

const DoctorsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);
  // console.log(`doctor ====================`, doctor);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    qualification: "",
    experience: "",
    gender: "",
    // address: "",
    // city: "",
    // state: "",
    // zipCode: "",
    // bio: "",
    status: "Active",
    startBufferTime: "0",
    endBufferTime: "0"
  });

  // Weekly availability state
  const [weeklyAvailability, setWeeklyAvailability] = useState([
    { day: "Monday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
    { day: "Tuesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
    { day: "Wednesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
    { day: "Thursday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
    { day: "Friday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
    { day: "Saturday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
    { day: "Sunday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] }
  ]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    try {
      // Fetch all doctors from the correct API endpoint
      const response = await fetch("https://bkdemo1.clinicpro.cc/doctor/doctor-list");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const allDoctors = await response.json();
      console.log('Fetched all doctors:', allDoctors);

      // Find the specific doctor by ID
      const doctorData = Array.isArray(allDoctors) ? allDoctors.find(doc =>
        doc.id == id || doc.doctor_id == id || doc.doctorId == id
      ) : null;

      if (!doctorData) {
        console.log('Doctor not found with ID:', id);
        toast.error('Doctor not found');
        navigate('/clinic/doctors');
        return;
      }

      console.log('Found doctor data:', doctorData);

      // Transform API data to match our form structure
      const transformedDoctor = {
        id: doctorData.id || doctorData.doctor_id || doctorData.doctorId || id,
        firstName: doctorData.firstName || doctorData.name?.split(' ')[0] || "",
        lastName: doctorData.lastName || doctorData.name?.split(' ').slice(1).join(' ') || "",
        email: doctorData.email || doctorData.doctor_email || "",
        phone: doctorData.phone || doctorData.doctor_phone || doctorData.contact || "",
        specialty: doctorData.specialty || doctorData.specialization || doctorData.doctor_specialty || "",
        qualification: doctorData.qualification || doctorData.doctor_qualification || "",
        experience: doctorData.experience || doctorData.years_experience || doctorData.doctor_experience || "",
        // gender: doctorData.gender || doctorData.doctor_gender || "",
        // address: doctorData.address || doctorData.doctor_address || "",
        // city: doctorData.city || doctorData.doctor_city || "",
        // state: doctorData.state || doctorData.doctor_state || "",
        // zipCode: doctorData.zipCode || doctorData.zip_code || doctorData.doctor_zip || "",
        // bio: doctorData.bio || doctorData.biography || doctorData.doctor_bio || "",
        status: doctorData.status || doctorData.doctor_status || "Active",
        startBufferTime: doctorData.startBufferTime?.toString() || "0",
        endBufferTime: doctorData.endBufferTime?.toString() || "0"
      };

      setDoctor(transformedDoctor);
      setFormData(transformedDoctor);

      // Set availability if available
      if (doctorData.availability) {
        const updatedAvailability = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => {
          const doctorDay = doctorData.availability.filter((d) => d.day === day);

          if (doctorDay.length === 0) {
            return {
              day,
              closed: true,
              slots: [{ startTime: "", endTime: "", slotDuration: 30 }],
            };
          }

          const closed = doctorDay.every((d) => d.closed);

          const slots = doctorDay
            .filter((d) => !d.closed)
            .map((d) => ({
              startTime: d.startTime ? d.startTime.substring(0, 5) : "",
              endTime: d.endTime ? d.endTime.substring(0, 5) : "",
              slotDuration: d.slotDuration || 30,
            }));

          return {
            day,
            closed,
            slots:
              slots.length > 0
                ? slots
                : [{ startTime: "", endTime: "", slotDuration: 30 }],
          };
        });

        setWeeklyAvailability(updatedAvailability);
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor details');
      navigate('/clinic/doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Availability handlers
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
      // Flatten weeklyAvailability for API
      const flatAvailability = weeklyAvailability.flatMap((dayObj) => {
        if (dayObj.closed) {
          return [
            {
              day: dayObj.day,
              closed: true,
              startTime: null,
              endTime: null,
              slotDuration: null,
            },
          ];
        }

        const formatTimeToISO = (time) => {
          if (!time) return null;
          const [hours, minutes] = time.split(":");
          const date = new Date();
          date.setUTCHours(hours);
          date.setUTCMinutes(minutes);
          date.setUTCSeconds(0);
          date.setMilliseconds(0);
          return date.toISOString().split("T")[1];
        };

        return dayObj.slots.map((slot) => ({
          day: dayObj.day,
          closed: false,
          startTime: slot.startTime ? formatTimeToISO(slot.startTime) : null,
          endTime: slot.endTime ? formatTimeToISO(slot.endTime) : null,
          slotDuration: slot.slotDuration || null,
        }));
      });

      const updatedDoctorData = {
        ...formData,
        availability: flatAvailability,
        keyword: formData.firstName.toLowerCase().replace(/\s+/g, "-"),
        startBufferTime: Number(formData.startBufferTime) || 0,
        endBufferTime: Number(formData.endBufferTime) || 0,
      };

      console.log("📝 Updated Doctor Payload:", updatedDoctorData);

      const response = await fetch(`https://bkdemo1.clinicpro.cc/doctor/update-doctor/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDoctorData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Doctor updated successfully:', result);

      toast.success('Doctor updated successfully!');
      navigate(`/clinic/doctors/view/${id}`);
    } catch (error) {
      console.error('Error updating doctor:', error);
      // toast.error('Failed to update doctor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader>
          <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
            <button
              className="btn btn-icon btn-light-secondary me-2"
              onClick={() => navigate('/clinic/doctors')}
              title="Back to Doctors List"
            >
              <FiArrowLeft size={16} />
            </button>
            <div className="btn btn-primary disabled">
              <FiSave size={16} className="me-2" />
              <span>Saving...</span>
            </div>
          </div>
        </PageHeader>
        <div className='main-content'>
          <div className='row'>
            <div className="col-12">
              <div className="card stretch stretch-full">
                <div className="card-body">
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading doctor details...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          <button
            className="btn btn-icon btn-light-secondary me-2"
            onClick={() => navigate('/clinic/doctors')}
            title="Back to Doctors List"
          >
            <FiArrowLeft size={16} />
          </button>
          <div className="text-muted">
            <small>Use the Save button below to save changes</small>
          </div>
        </div>
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          <div className="col-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <FiUser size={20} className="me-2 text-primary" />
                  Edit Doctor Profile
                </h5>
                <p className="text-muted mb-0">Update doctor information and details</p>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Tab Navigation */}
                  <div className="mb-4">
                    <ul className="nav nav-tabs" id="doctorEditTab" role="tablist">
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
                      </li>
                      <li className="nav-item" role="presentation">
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
                        {/* Basic Information */}
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
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">Last Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
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
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
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
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">Gender</label>
                          <select
                            className="form-select"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
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
                            value={formData.status}
                            onChange={handleChange}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Leave">On Leave</option>
                          </select>
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
                          <input
                            type="text"
                            className="form-control"
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">Qualification *</label>
                          <select
                            className="form-select"
                            name="qualification"
                            value={formData.qualification}
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
                            value={formData.experience}
                            onChange={handleChange}
                            min="0"
                            max="50"
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
                              value={formData.startBufferTime}
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
                              value={formData.endBufferTime}
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
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-medium">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-medium">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-medium">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
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
                            value={formData.bio}
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
                                    <div className="card-header border-0 p-0 position-relative overflow-hidden">
                                      <div className="position-absolute w-100 h-100" style={{ background: dayGradient, opacity: 0.9 }}></div>
                                      <div className="position-relative p-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                          <div className="d-flex align-items-center gap-3">
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
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={saving}
                      >
                        <FiSave size={16} className="me-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>

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

export default DoctorsEdit;
