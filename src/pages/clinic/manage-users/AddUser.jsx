import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiUserPlus, FiX, FiSave, FiCalendar, FiMail, FiPhone, FiMapPin, FiBriefcase, FiAward, FiClock, FiDollarSign, FiShield, FiEye, FiPlus, FiMinus, FiCheck, FiInfo, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import { useClinicManagement } from "../../../contentApi/ClinicMnanagementProvider";

const AddUser = ({ isTab = false }) => {
  const navigate = useNavigate();
  const { clinicSpecialities } = useClinicManagement();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    status: 'Active',
    createdDate: new Date().toISOString().split('T')[0],
    // Standardized Basic Information fields
    phone: '',
    gender: '',
    // dateOfBirth: '',
    age: '',
    // shift: '',
    // languages: '',
    // hireDate: '',
    // address: '',
    // city: '',
    // state: '',
    // postalCode: '',
    // country: '',
    // Role-specific Professional fields
    specialty: '',
    qualification: '',
    experience: '',
    // licenseNumber: '',
    // department: '',
    // shift: '',
    // languages: '',
    accountingQualification: '',
    experienceYears: '',
    // certifications: '',
    // pharmacyLicense: '',
    // pharmacyQualification: '',
    // pharmacyExperience: '',
    // position: '',
    // salary: '',
    // emergencyContact: '',
    startBufferTime: 0,
    endBufferTime: 0,
    adminRole: 'super_admin'
  });

  const roles = [
    { value: 'doctor', label: 'Doctor', icon: FiUser, color: 'primary' },
    { value: 'receptionist', label: 'Receptionist', icon: FiUser, color: 'success' },
    { value: 'accountant', label: 'Accountant', icon: FiUser, color: 'info' },
    // { value: 'pharmacist', label: 'Pharmacist', icon: FiBriefcase, color: 'warning' },
    // { value: 'nurse', label: 'Nurse', icon: FiUser, color: 'danger' },
    // { value: 'lab_technician', label: 'Lab Technician', icon: FiUser, color: 'secondary' },
    { value: 'admin', label: 'Administrator', icon: FiShield, color: 'dark' },
    // { value: 'general', label: 'General Staff', icon: FiUser, color: 'light' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (role) => {
    setSelectedRoles(prevRoles => {
      if (prevRoles.includes(role)) {
        // Remove role if already selected
        return prevRoles.filter(r => r !== role);
      } else {
        // Add role if not selected
        return [...prevRoles, role];
      }
    });
    // Reset to basic tab when changing roles
    setActiveTab('basic');
  };

  const getRoleSpecificFields = () => {
    if (selectedRoles.length === 0) return null;

    return (
      <div className="mb-4">
        {selectedRoles.map((role, index) => (
          <div key={role} className="mb-4">
            <h6 className="card-title mb-3 d-flex align-items-center">
              <FiAward className="me-2 text-primary" />
              {role.charAt(0).toUpperCase() + role.slice(1)} Information
              <span className="badge bg-primary ms-2">{index + 1}</span>
            </h6>
            {getRoleFields(role)}
          </div>
        ))}
      </div>
    );
  };

  const getRoleFields = (role) => {
    switch (role) {
      case 'doctor':
        return (
          <>
            {/* Professional Information Tab */}
            <div className="mb-4">
              <h6 className="card-title mb-3">
                <FiAward className="me-2 text-primary" />
                Professional Information
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Specialty <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    required
                  >
                    <option value="">Select Specialty</option>
                    {clinicSpecialities.map((specialty) => (
                      <option key={specialty.id || specialty.speciality} value={specialty.speciality}>
                        {specialty.speciality}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Qualification <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
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
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter years of experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    min="0"
                    max="50"
                  />
                </div>
                {/* <div className="col-md-6">
                  <label className="form-label">
                    License Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter medical license number"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  />
                </div> */}
                <div className="col-md-6">
                  <label className="form-label">
                    Start Buffer Time (Days)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={formData.startBufferTime || 0}
                      onChange={(e) => handleInputChange('startBufferTime', e.target.value)}
                      min="0"
                      max="30"
                    />
                    <span className="input-group-text">Days before appointment</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    End Buffer Time (Days)
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={formData.endBufferTime || 0}
                      onChange={(e) => handleInputChange('endBufferTime', e.target.value)}
                      min="0"
                      max="365"
                    />
                    <span className="input-group-text">Days after appointment</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'receptionist':
        return (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Shift <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={formData.shift}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                required
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Afternoon">Afternoon (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
                <option value="Full Day">Full Day (9 AM - 6 PM)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Languages Spoken
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., English, Spanish, French"
                value={formData.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
              />
            </div>
          </div>
        );

      case 'accountant':
        return (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Qualification
              </label>
              <select
                className="form-select"
                value={formData.accountingQualification}
                onChange={(e) => handleInputChange('accountingQualification', e.target.value)}
              >
                <option value="">Select Qualification</option>
                <option value="CA">Chartered Accountant (CA)</option>
                <option value="CPA">Certified Public Accountant (CPA)</option>
                <option value="ACCA">Association of Chartered Certified Accountants (ACCA)</option>
                <option value="B.Com">Bachelor of Commerce (B.Com)</option>
                <option value="M.Com">Master of Commerce (M.Com)</option>
                <option value="MBA">Master of Business Administration (MBA)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Experience (Years)
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter years of experience"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                min="0"
                max="50"
              />
            </div>
          </div>
        );

      // case 'pharmacist':
      //   return (
      //     <div className="row g-3">
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Pharmacy License Number *
      //         </label>
      //         <input
      //           type="text"
      //           className="form-control"
      //           placeholder="Enter pharmacy license number"
      //           value={formData.pharmacyLicense}
      //           onChange={(e) => handleInputChange('pharmacyLicense', e.target.value)}
      //           required
      //         />
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Pharmacy Qualification *
      //         </label>
      //         <select
      //           className="form-select"
      //           value={formData.pharmacyQualification}
      //           onChange={(e) => handleInputChange('pharmacyQualification', e.target.value)}
      //           required
      //         >
      //           <option value="">Select Qualification</option>
      //           <option value="B.Pharm">B.Pharm</option>
      //           <option value="M.Pharm">M.Pharm</option>
      //           <option value="PharmD">PharmD</option>
      //           <option value="RPh">RPh (Registered Pharmacist)</option>
      //         </select>
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Years of Experience
      //         </label>
      //         <input
      //           type="number"
      //           className="form-control"
      //           placeholder="Enter years of experience"
      //           value={formData.pharmacyExperience}
      //           onChange={(e) => handleInputChange('pharmacyExperience', e.target.value)}
      //           min="0"
      //           max="50"
      //         />
      //       </div>
      //     </div>
      //   );

      // case 'general':
      //   return (
      //     <div className="row g-3">
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Position *
      //         </label>
      //         <input
      //           type="text"
      //           className="form-control"
      //           placeholder="Enter job position"
      //           value={formData.position}
      //           onChange={(e) => handleInputChange('position', e.target.value)}
      //           required
      //         />
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Salary
      //         </label>
      //         <input
      //           type="number"
      //           className="form-control"
      //           placeholder="Enter salary amount"
      //           value={formData.salary}
      //           onChange={(e) => handleInputChange('salary', e.target.value)}
      //           min="0"
      //         />
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Emergency Contact
      //         </label>
      //         <input
      //           type="tel"
      //           className="form-control"
      //           placeholder="Enter emergency contact number"
      //           value={formData.emergencyContact}
      //           onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
      //         />
      //       </div>
      //     </div>
      //   );

      // case 'nurse':
      //   return (
      //     <div className="row g-3">
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Nursing License Number *
      //         </label>
      //         <input
      //           type="text"
      //           className="form-control"
      //           placeholder="Enter nursing license number"
      //           value={formData.licenseNumber}
      //           onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
      //           required
      //         />
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Nursing Qualification *
      //         </label>
      //         <select
      //           className="form-select"
      //           value={formData.qualification}
      //           onChange={(e) => handleInputChange('qualification', e.target.value)}
      //           required
      //         >
      //           <option value="">Select Qualification</option>
      //           <option value="RN">Registered Nurse (RN)</option>
      //           <option value="LPN">Licensed Practical Nurse (LPN)</option>
      //           <option value="BSN">Bachelor of Science in Nursing (BSN)</option>
      //           <option value="MSN">Master of Science in Nursing (MSN)</option>
      //           <option value="DNP">Doctor of Nursing Practice (DNP)</option>
      //           <option value="Other">Other</option>
      //         </select>
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Years of Experience
      //         </label>
      //         <input
      //           type="number"
      //           className="form-control"
      //           placeholder="Enter years of experience"
      //           value={formData.experience}
      //           onChange={(e) => handleInputChange('experience', e.target.value)}
      //           min="0"
      //           max="50"
      //         />
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Department
      //         </label>
      //         <select
      //           className="form-select"
      //           value={formData.department}
      //           onChange={(e) => handleInputChange('department', e.target.value)}
      //         >
      //           <option value="">Select Department</option>
      //           <option value="Emergency">Emergency</option>
      //           <option value="ICU">ICU</option>
      //           <option value="Surgery">Surgery</option>
      //           <option value="Pediatrics">Pediatrics</option>
      //           <option value="Maternity">Maternity</option>
      //           <option value="General">General</option>
      //           <option value="Other">Other</option>
      //         </select>
      //       </div>
      //     </div>
      //   );

      // case 'lab_technician':
      //   return (
      //     <div className="row g-3">
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Lab Technician License *
      //         </label>
      //         <input
      //           type="text"
      //           className="form-control"
      //           placeholder="Enter lab technician license"
      //           value={formData.licenseNumber}
      //           onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
      //           required
      //         />
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Lab Qualification *
      //         </label>
      //         <select
      //           className="form-select"
      //           value={formData.qualification}
      //           onChange={(e) => handleInputChange('qualification', e.target.value)}
      //           required
      //         >
      //           <option value="">Select Qualification</option>
      //           <option value="MLT">Medical Laboratory Technician (MLT)</option>
      //           <option value="MLS">Medical Laboratory Scientist (MLS)</option>
      //           <option value="BSc">Bachelor of Science in Medical Technology</option>
      //           <option value="MSc">Master of Science in Medical Technology</option>
      //           <option value="Other">Other</option>
      //         </select>
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Years of Experience
      //         </label>
      //         <input
      //           type="number"
      //           className="form-control"
      //           placeholder="Enter years of experience"
      //           value={formData.experience}
      //           onChange={(e) => handleInputChange('experience', e.target.value)}
      //           min="0"
      //           max="50"
      //         />
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Department
      //         </label>
      //         <select
      //           className="form-select"
      //           value={formData.department}
      //           onChange={(e) => handleInputChange('department', e.target.value)}
      //         >
      //           <option value="">Select Department</option>
      //           <option value="Hematology">Hematology</option>
      //           <option value="Biochemistry">Biochemistry</option>
      //           <option value="Microbiology">Microbiology</option>
      //           <option value="Pathology">Pathology</option>
      //           <option value="Immunology">Immunology</option>
      //           <option value="Other">Other</option>
      //         </select>
      //       </div>
      //     </div>
      //   );

      // case 'admin':
      //   return (
      //     <div className="row g-3">
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Admin Level *
      //         </label>
      //         <select
      //           className="form-select"
      //           value={formData.position}
      //           onChange={(e) => handleInputChange('position', e.target.value)}
      //           required
      //         >
      //           <option value="">Select Admin Level</option>
      //           <option value="System Administrator">System Administrator</option>
      //           <option value="Clinic Manager">Clinic Manager</option>
      //           <option value="Department Head">Department Head</option>
      //           <option value="Supervisor">Supervisor</option>
      //           <option value="Other">Other</option>
      //         </select>
      //       </div>
      //       <div className="col-md-6">
      //         <label className="form-label">
      //           Access Level
      //         </label>
      //         <select
      //           className="form-select"
      //           value={formData.status}
      //           onChange={(e) => handleInputChange('status', e.target.value)}
      //         >
      //           <option value="Full Access">Full Access</option>
      //           <option value="Limited Access">Limited Access</option>
      //           <option value="Read Only">Read Only</option>
      //         </select>
      //       </div>
      //     </div>
      //   );
      case 'admin':
        return (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Select Admin Role <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={formData.adminRole}
                onChange={(e) => handleInputChange('role', e.target.value)}
                required
              >
                <option value="">Choose Admin Role</option>
                <option value="super_admin">Super Admin</option>
                <option value="clinic_admin">Clinic Admin</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role!");
      return;
    }

    try {
      let payload = { ...formData };

      // ✅ ensure correct roles
      payload.role = selectedRoles;
      if (selectedRoles.includes('admin')) {
        payload.adminRole = formData.adminRole;
      }

      console.log('Creating user with data:', payload);
      // await fetch("/users/create", { method: "POST", body: JSON.stringify(payload) });

      toast.success(`${payload.role} created successfully!`);
      navigate('/users');
    } catch (error) {
      console.log("Failed to create user. Please try again.");
      // toast.error("Failed to create user. Please try again.");
    }

    try {
      // Here you would make an API call to create the user
      console.log('Creating user with data:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`User with roles: ${selectedRoles.join(', ')} created successfully!`);

      if (isTab) {
        // If used as a tab, just reset the form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          role: '',
          status: 'Active',
          createdDate: new Date().toISOString().split('T')[0],
          // Standardized Basic Information fields
          phone: '',
          gender: '',
          dateOfBirth: '',
          age: '',
          hireDate: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          // Role-specific Professional fields
          specialty: '',
          qualification: '',
          experience: '',
          licenseNumber: '',
          department: '',
          shift: '',
          languages: '',
          accountingQualification: '',
          experienceYears: '',
          certifications: '',
          pharmacyLicense: '',
          pharmacyQualification: '',
          pharmacyExperience: '',
          position: '',
          salary: '',
          emergencyContact: '',
          startBufferTime: 0,
          endBufferTime: 0
        });
        setSelectedRoles([]);
        resetWeeklyAvailability();
      } else {
        // If used as standalone page, navigate back
        navigate('/users');
      }
    } catch (error) {
      toast.error("Failed to create user. Please try again.");
    }
  };

  const handleCancel = () => {
    if (isTab) {
      // If used as a tab, just reset the form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: '',
        status: 'Active',
        createdDate: new Date().toISOString().split('T')[0],
        // Standardized Basic Information fields
        phone: '',
        gender: '',
        dateOfBirth: '',
        age: '',
        hireDate: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        // Role-specific Professional fields
        specialty: '',
        qualification: '',
        experience: '',
        licenseNumber: '',
        department: '',
        shift: '',
        languages: '',
        accountingQualification: '',
        experienceYears: '',
        certifications: '',
        pharmacyLicense: '',
        pharmacyQualification: '',
        pharmacyExperience: '',
        position: '',
        salary: '',
        emergencyContact: '',
        startBufferTime: 0,
        endBufferTime: 0
      });
      setSelectedRoles([]);
      resetWeeklyAvailability();
    } else {
      // If used as standalone page, navigate back
      navigate('/users');
    }
  };

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Weekly availability state and functions
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [weeklyAvailability, setWeeklyAvailability] = useState(
    daysOfWeek.map((day) => ({
      day,
      closed: false,
      slots: [{ startTime: "", endTime: "", slotDuration: 30 }],
    }))
  );

  const handleClosedToggle = (dayIndex) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].closed = !updated[dayIndex].closed;
    setWeeklyAvailability(updated);
  };

  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].slots[slotIndex][field] = value;
    setWeeklyAvailability(updated);
  };

  const addSlot = (dayIndex) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].slots.push({
      startTime: "",
      endTime: "",
      slotDuration: 30,
    });
    setWeeklyAvailability(updated);
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const updated = [...weeklyAvailability];
    updated[dayIndex].slots.splice(slotIndex, 1);
    setWeeklyAvailability(updated);
  };

  const resetWeeklyAvailability = () => {
    setWeeklyAvailability(
      daysOfWeek.map((day) => ({
        day,
        closed: false,
        slots: [{ startTime: "", endTime: "", slotDuration: 30 }],
      }))
    );
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

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setPasswordVisible(!passwordVisible);
    } else if (field === 'confirmPassword') {
      setConfirmPasswordVisible(!confirmPasswordVisible);
    }
  };

  // If used as a tab, render just the form content
  if (isTab) {
    return (
      <form onSubmit={handleSubmit}>
        {/* Role Selection */}
        <div className="mb-4">
          <h6 className="card-title mb-3">
            <FiUserPlus className="me-2 text-primary" />
            Select User Role
          </h6>
          <div className="row g-3">
            {roles.map((role) => (
              <div key={role.value} className="col-md-3 col-sm-6">
                <div
                  className={`card cursor-pointer border-2 ${selectedRoles.includes(role.value)
                    ? `border-${role.color} bg-${role.color}-subtle`
                    : 'border-light'
                    }`}
                  onClick={() => handleRoleChange(role.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body text-center p-3 position-relative">
                    <div className="position-absolute top-0 end-0 p-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedRoles.includes(role.value)}
                        onChange={() => handleRoleChange(role.value)}
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>
                    <div
                      className={`avatar avatar-lg bg-${role.color} text-white mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center`}
                      style={{ width: "60px", height: "60px" }}
                    >
                      <role.icon size={28} />
                    </div>
                    <h6 className="mb-0">{role.label}</h6>
                    {selectedRoles.includes(role.value) && (
                      <div className="mt-2">
                        <FiCheck className="text-success" size={16} />
                        <small className="text-success d-block">Selected</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRoles.length > 0 && (
          <>
            {/* Tab Navigation */}
            <div className="mb-4">
              <ul className="nav nav-tabs nav-tabs-line" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                    type="button"
                  >
                    <FiUser className="me-2" />
                    Basic Information
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'professional' ? 'active' : ''}`}
                    onClick={() => setActiveTab('professional')}
                    type="button"
                  >
                    <FiAward className="me-2" />
                    Professional
                  </button>
                </li>
                {selectedRoles.includes('doctor') && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                      onClick={() => setActiveTab('schedule')}
                      type="button"
                    >
                      <FiCalendar className="me-2" />
                      Weekly Schedule
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && (
              <>
                {/* Common User Information */}
                <div className="mb-4">
                  <h6 className="card-title mb-3">
                    <FiUser className="me-2 text-primary" />
                    Basic Information
                  </h6>
                  <div className="row g-3">
                    {/* Name Fields - Standardized for all roles */}
                    <div className="col-md-6">
                      <label className="form-label">
                        First Name <span className='text-danger'>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Last Name <span className='text-danger'>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="col-md-6">
                      <label className="form-label">
                        <FiMail className="me-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <FiPhone className="me-2" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>

                    {/* Personal Information */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Gender *
                      </label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    {/* <div className="col-md-6">
                      <label className="form-label">
                        <FiCalendar className="me-2" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div> */}

                    <div className="col-md-6">
                      <label className="form-label">
                        Age
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        min="18"
                        max="100"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>

                    {/* Account Information */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Username *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        required
                      />
                    </div>

                    {/* <div className="col-md-6">
                      <label className="form-label">
                        <FiCalendar className="me-2" />
                        Hire Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.hireDate}
                        onChange={(e) => handleInputChange('hireDate', e.target.value)}
                      />
                    </div> */}

                    {/* Address Information */}
                    {/* <div className="col-md-12">
                      <label className="form-label">
                        <FiMapPin className="me-2" />
                        Address
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        <FiMapPin className="me-2" />
                        City
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        <FiMapPin className="me-2" />
                        State/Province
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter state or province"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        <FiMapPin className="me-2" />
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter postal code"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <FiMapPin className="me-2" />
                        Country
                      </label>
                      <select
                        className="form-select"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      >
                        <option value="">Select Country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        <FiCalendar className="me-2" />
                        Created Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.createdDate}
                        onChange={(e) => handleInputChange('createdDate', e.target.value)}
                      />
                    </div> */}
                  </div>
                </div>

                {/* Security Information */}
                <div className="mb-4">
                  <h6 className="card-title mb-3">
                    <FiShield className="me-2 text-primary" />
                    Security Information
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Password *
                      </label>
                      <div className="input-group">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          className="form-control"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => togglePasswordVisibility('password')}
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Confirm Password *
                      </label>
                      <div className="input-group">
                        <input
                          type={confirmPasswordVisible ? "text" : "password"}
                          className="form-control"
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'professional' && (
              <>
                {/* Role-specific fields */}
                <div className="mb-4">
                  <h6 className="card-title mb-3">
                    <FiBriefcase className="me-2 text-primary" />
                    Selected Roles Information
                  </h6>
                  {getRoleSpecificFields()}
                </div>
              </>
            )}

            {activeTab === 'schedule' && (
              <>
                {/* Weekly Schedule Tab */}
                <div className="mb-4">
                  <h6 className="card-title mb-3">
                    <FiCalendar className="me-2 text-primary" />
                    Weekly Schedule
                  </h6>
                  <p className="text-muted mb-4">Configure doctor's working hours for each day of the week</p>

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
              </>
            )}

            {/* Tab Navigation Buttons */}
            <div className="d-flex justify-content-between mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary gap-2"
                onClick={() => {
                  const tabs = selectedRoles.includes('doctor') ? ['basic', 'professional', 'schedule'] : ['basic', 'professional'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
                disabled={activeTab === 'basic'}
              >
                ← PREVIOUS
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <FiSave size={16} className="me-2" />
                CREATE USER
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary gap-2"
                onClick={() => {
                  const tabs = selectedRoles.includes('doctor') ? ['basic', 'professional', 'schedule'] : ['basic', 'professional'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                disabled={selectedRoles.includes('doctor') ? activeTab === 'schedule' : activeTab === 'professional'}
              >
                NEXT →
              </button>
            </div>
          </>
        )}
      </form>
    );
  }

  // Standalone page layout
  return (
    <>
      <PageHeader>
        <div className="d-flex justify-content-between align-items-center">
          {/* <div>
            <h4 className="mb-1 fw-bold">Create New User</h4>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/clinic">Clinic</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/users">Users</a>
                </li>
                <li className="breadcrumb-item active">Add User</li>
              </ol>
            </nav>
          </div> */}
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary gap-2" onClick={handleCancel}>
              <FiX size={16} />
              Cancel
            </button>
            <button className="btn btn-primary gap-2" onClick={handleSubmit}>
              <FiSave size={16} />
              Create User
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {/* Role Selection */}
                    <div className="mb-4">
                      <h6 className="card-title mb-3">
                        <FiUserPlus className="me-2 text-primary" />
                        Select User Role
                      </h6>
                      <div className="row g-3">
                        {roles.map((role) => (
                          <div key={role.value} className="col-md-3 col-sm-6">
                            <div
                              className={`card cursor-pointer border-2 ${selectedRoles.includes(role.value)
                                ? `border-${role.color} bg-${role.color}-subtle`
                                : 'border-light'
                                }`}
                              onClick={() => handleRoleChange(role.value)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="card-body text-center p-3">
                                <div
                                  className={`avatar avatar-lg bg-${role.color} text-white mx-auto mb-2 rounded-circle d-flex align-items-center justify-content-center`}
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  <role.icon size={28} />
                                </div>
                                <h6 className="mb-0">{role.label}</h6>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedRoles.length > 0 && (
                      <>
                        {/* Common User Information */}
                        <div className="mb-4">
                          <h6 className="card-title mb-3">
                            <FiUser className="me-2 text-primary" />
                            Basic Information
                          </h6>
                          <div className="row g-3">
                            {/* Name Fields - Standardized for all roles */}
                            <div className="col-md-6">
                              <label className="form-label">
                                First Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">
                                Last Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                required
                              />
                            </div>

                            {/* Contact Information */}
                            <div className="col-md-6">
                              <label className="form-label">
                                <FiMail className="me-2" />
                                Email Address <span className="text-danger">*</span>
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">
                                <FiPhone className="me-2" />
                                Phone Number <span className="text-danger">*</span>
                              </label>
                              <input
                                type="tel"
                                className="form-control"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                required
                              />
                            </div>

                            {/* Personal Information */}
                            <div className="col-md-6">
                              <label className="form-label">
                                Gender <span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-select"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                required
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                              </select>
                            </div>

                            {/* <div className="col-md-6">
                              <label className="form-label">
                                <FiCalendar className="me-2" />
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                              />
                            </div> */}

                            <div className="col-md-6">
                              <label className="form-label">
                                Age
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter age"
                                value={formData.age}
                                onChange={(e) => handleInputChange('age', e.target.value)}
                                min="18"
                                max="100"
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">
                                Status
                              </label>
                              <select
                                className="form-select"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Pending">Pending</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            </div>

                            {/* Account Information */}
                            <div className="col-md-6">
                              <label className="form-label">
                                Username <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                required
                              />
                            </div>

                            {/* <div className="col-md-6">
                              <label className="form-label">
                                <FiCalendar className="me-2" />
                                Hire Date
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                value={formData.hireDate}
                                onChange={(e) => handleInputChange('hireDate', e.target.value)}
                              />
                            </div> */}

                            {/* Address Information */}
                            {/* <div className="col-md-12">
                              <label className="form-label">
                                <FiMapPin className="me-2" />
                                Address
                              </label>
                              <textarea
                                className="form-control"
                                rows="2"
                                placeholder="Enter address"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                              />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label">
                                <FiMapPin className="me-2" />
                                City
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter city"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                              />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label">
                                <FiMapPin className="me-2" />
                                State/Province
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter state or province"
                                value={formData.state}
                                onChange={(e) => handleInputChange('state', e.target.value)}
                              />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label">
                                <FiMapPin className="me-2" />
                                Postal Code
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter postal code"
                                value={formData.postalCode}
                                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">
                                <FiMapPin className="me-2" />
                                Country
                              </label>
                              <select
                                className="form-select"
                                value={formData.country}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                              >
                                <option value="">Select Country</option>
                                <option value="United States">United States</option>
                                <option value="Canada">Canada</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                                <option value="India">India</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">
                                <FiCalendar className="me-2" />
                                Created Date
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                value={formData.createdDate}
                                onChange={(e) => handleInputChange('createdDate', e.target.value)}
                              />
                            </div> */}
                          </div>
                        </div>

                        {/* Security Information */}
                        <div className="mb-4">
                          <h6 className="card-title mb-3">
                            <FiShield className="me-2 text-primary" />
                            Security Information
                          </h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">
                                Password <span className="text-danger">*</span>
                              </label>
                              <div className="input-group">
                                <input
                                  type={passwordVisible ? "text" : "password"}
                                  className="form-control"
                                  placeholder="Enter password"
                                  value={formData.password}
                                  onChange={(e) => handleInputChange('password', e.target.value)}
                                  required
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => togglePasswordVisibility('password')}
                                >
                                  <FiEye size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">
                                Confirm Password <span className="text-danger">*</span>
                              </label>
                              <div className="input-group">
                                <input
                                  type={confirmPasswordVisible ? "text" : "password"}
                                  className="form-control"
                                  placeholder="Re-enter password"
                                  value={formData.confirmPassword}
                                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                  required
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => togglePasswordVisibility('confirmPassword')}
                                >
                                  <FiEye size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Role-specific fields */}
                        <div className="mb-4">
                          <h6 className="card-title mb-3">
                            <FiBriefcase className="me-2 text-primary" />
                            Selected Roles Information
                          </h6>
                          {getRoleSpecificFields()}
                        </div>

                        {/* Weekly Schedule - Only for doctors */}
                        {selectedRoles.includes('doctor') && (
                          <div className="mb-4">
                            <h6 className="card-title mb-3">
                              <FiCalendar className="me-2 text-primary" />
                              Weekly Schedule
                            </h6>
                            <p className="text-muted mb-4">Configure doctor's working hours for each day of the week</p>

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
                        )}

                        {/* Submit Buttons */}
                        <div className="d-flex justify-content-end gap-2">
                          <button type="button" className="btn btn-outline-secondary gap-2" onClick={handleCancel}>
                            <FiX size={16} />
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary gap-2">
                            <FiSave size={16} />
                            Create User
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUser;
