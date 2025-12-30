import React, { useState, useEffect } from 'react';
import { FiCalendar, FiCamera, FiMail, FiPhone, FiMapPin, FiUser, FiRefreshCw } from 'react-icons/fi';
import { MdOutlineMonitorWeight, MdOutlineBloodtype } from "react-icons/md";
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import TextArea from '@/components/shared/TextArea';
import SelectDropdown from '@/components/shared/SelectDropdown';
import Input from '@/components/shared/Input';
import { timezonesData } from '@/utils/fackData/timeZonesData';
import { currencyOptionsData } from '@/utils/fackData/currencyOptionsData';
import { languagesData } from '@/utils/fackData/languagesData';
import MultiSelectTags from '@/components/shared/MultiSelectTags';
import { customerCreatePrivacyOptions, customerListStatusOptions, customerListTagsOptions } from '@/utils/options';
import useLocationData from '@/hooks/useLocationData';
import useDatePicker from '@/hooks/useDatePicker';
import { usePatient } from "../../context/PatientContext";
import { useVaccine } from "../../context/VaccineContext";
import { toast } from "react-toastify";

const TabProfile = ({ patient, mode, setActiveTab, setCurrentPatient }) => {
    const { addPatient, updatePatient, refreshPatient } = usePatient();
    const [formData, setFormData] = useState(
        patient
            ? {
                ...patient,
                allergies: patient.allergies || [],
                dob: patient.dob || '',
                ageType: patient.ageType || 'years'
            }
            : {
                firstName: "",
                lastName: "",
                name: "",
                gender: "",
                age: "",
                dob: '',
                ageType: 'years',
                email: "",
                contact: "",
                phone: "",
                address: "",
                weight: "",
                bloodGroup: "",
                allergies: [],
            }
    );

    const [showImageUpload, setShowImageUpload] = useState(false);
    const [images, setImages] = useState([]);
    const [newAllergy, setNewAllergy] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { scheduleVaccine, getVaccines } = useVaccine();
    const [errors, setErrors] = useState({});
    const [submitAction, setSubmitAction] = useState(''); // 'saveOnly' or 'saveAndSchedule'

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    // Calculate age from date of birth
    const calculateAgeFromDOB = (dob) => {
        if (!dob) return { age: '', ageType: 'years' };

        const birthDate = new Date(dob);
        const today = new Date();

        if (isNaN(birthDate)) return { age: '', ageType: 'years' };

        const birthYear = birthDate.getFullYear();
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();

        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        // Calculate age in months
        const ageInMonths = (currentYear - birthYear) * 12 + (currentMonth - birthMonth);

        // Calculate age in days
        const timeDiff = today.getTime() - birthDate.getTime();
        const ageInDays = Math.floor(timeDiff / (1000 * 3600 * 24));

        // Calculate age in years
        let ageInYears = currentYear - birthYear;

        // Adjust if birthday hasn't occurred yet this year
        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
            ageInYears--;
        }

        // Determine age type and value
        if (ageInDays <= 30) {
            // If less than or equal to 30 days, show in days
            return { age: ageInDays.toString(), ageType: 'days' };
        } else if (ageInMonths < 24) {
            // If less than 2 years, show in months
            return { age: ageInMonths.toString(), ageType: 'months' };
        } else {
            // If 2 years or more, show in years
            return { age: ageInYears.toString(), ageType: 'years' };
        }
    };

    const generateEmail = () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            toast.warning("Please enter both first name and last name first to generate email.");
            return;
        }

        const firstName = formData.firstName.trim();
        const lastName = formData.lastName.trim();

        const randomNum = Math.floor(10 + Math.random() * 90); // 2 digit random number

        const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}@clinicpro.cc`;

        // Update the form data with generated email
        setFormData(prev => ({
            ...prev,
            email: email
        }));

        // Clear email error if it exists
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }

        toast.success("Email generated successfully!");
    };

    // Auto-generate email when first and last name are filled (auto-trigger)
    useEffect(() => {
        if (formData.firstName.trim() && formData.lastName.trim() && !formData.email && mode !== "edit") {
            const firstName = formData.firstName.trim();
            const lastName = formData.lastName.trim();
            const randomNum = Math.floor(10 + Math.random() * 90);

            const generatedEmail = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}@clinicpro.cc`;

            setFormData(prev => ({
                ...prev,
                email: generatedEmail
            }));
        }
    }, [formData.firstName, formData.lastName, formData.email, mode]);

    // Fix: Create a proper input change handler
    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle date of birth change and calculate age
    const handleDOBChange = (dob) => {
        if (dob) {
            const { age, ageType } = calculateAgeFromDOB(dob);
            setFormData(prev => ({
                ...prev,
                dob: dob,
                age: age,
                ageType: ageType
            }));

            // Clear age error if it exists
            if (errors.age) {
                setErrors(prev => ({ ...prev, age: '' }));
            }
        } else {
            // If DOB is cleared, clear age fields
            setFormData(prev => ({
                ...prev,
                dob: '',
                age: '',
                ageType: 'years'
            }));
        }
    };

    // Handle manual age change (if user wants to override)
    const handleAgeChange = (value, ageType = 'years') => {
        setFormData(prev => ({
            ...prev,
            age: value,
            ageType: ageType
        }));

        // Clear age error if it exists
        if (errors.age) {
            setErrors(prev => ({ ...prev, age: '' }));
        }
    };

    // Fix: Enhanced handleChange for form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for numeric fields
        if (name === "age" || name === "weight") {
            if (value === "" || /^\d*$/.test(value)) {
                handleInputChange(name, value);
            }
            return;
        }

        // For contact/phone number, allow only digits and max length 10
        if (name === "contact" || name === "phone") {
            if (value === "" || (/^\d{0,10}$/.test(value) && value.length <= 10)) {
                handleInputChange(name, value);
            }
            return;
        }

        handleInputChange(name, value);
    };

    // Fix: Update name when first or last name changes
    useEffect(() => {
        const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
        setFormData(prev => ({
            ...prev,
            name: fullName
        }));
    }, [formData.firstName, formData.lastName]);

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files).slice(0, 2 - images.length);
            setImages((prev) => [...prev, ...filesArray]);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const addAllergy = () => {
        if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
            setFormData((prev) => ({
                ...prev,
                allergies: [...prev.allergies, newAllergy.trim()],
            }));
            setNewAllergy("");
        }
    };

    const removeAllergy = (index) => {
        setFormData((prev) => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index),
        }));
    };

    // Fix: Enhanced validation function
    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.age) newErrors.age = "Age is required";
        if (!formData.email?.trim()) newErrors.email = "Email is required";
        if (!formData.contact?.trim() && !formData.phone?.trim()) {
            newErrors.contact = "Contact number is required";
        }

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        // Contact validation
        const contact = formData.contact || formData.phone;
        if (contact && contact.length !== 10) {
            newErrors.contact = "Contact number must be exactly 10 digits";
        }

        // Age validation based on age type
        if (formData.age) {
            const ageNum = parseInt(formData.age, 10);
            if (isNaN(ageNum) || ageNum < 0) {
                newErrors.age = "Please enter a valid age";
            } else if (formData.ageType === 'days' && ageNum > 365) {
                newErrors.age = "Age in days cannot exceed 365";
            } else if (formData.ageType === 'months' && ageNum > 240) {
                newErrors.age = "Age in months cannot exceed 240 (20 years)";
            } else if (formData.ageType === 'years' && ageNum > 120) {
                newErrors.age = "Age in years cannot exceed 120";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e, action = 'saveOnly') => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate form
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            setIsSubmitting(false);
            return;
        }

        // Prepare data for submission
        const contact = formData.contact || formData.phone;
        const ageNumber = parseInt(formData.age, 10);

        const dataToSubmit = {
            ...formData,
            name: formData.name || `${formData.firstName} ${formData.lastName}`.trim(),
            contact: contact,
            phone: contact,
            age: ageNumber,
            weight: formData.weight ? parseInt(formData.weight, 10) : null,
            images: images,
        };

        console.log("Submitting patient data:", dataToSubmit, "Action:", action);

        try {
            let result;
            if (mode === "edit") {
                result = await updatePatient(dataToSubmit);
                console.log("Patient updated:", result);
                toast.success("Patient updated successfully!");
                if (patient?.id) {
                    try {
                        await refreshPatient(patient.id);
                        console.log("Patient data refreshed after image upload");
                    } catch (error) {
                        console.error("Failed to refresh patient:", error);
                    }
                }
            } else {
                result = await addPatient(dataToSubmit);
                console.log("Patient creation result:", result);

                if (result) {
                    toast.success("Patient added successfully to database!");

                    // If user wants to schedule vaccine
                    if (action === 'saveAndSchedule') {
                        const fullPatient = { ...result };
                        setFormData(prev => ({ ...prev, id: result.id }));
                        if (setCurrentPatient) setCurrentPatient(fullPatient);
                        sessionStorage.setItem("currentPatientForVaccine", JSON.stringify(fullPatient));
                        if (setActiveTab) {
                            setActiveTab("vaccines");
                        }
                    } else {
                        // Reset form for new entry
                        setFormData({
                            firstName: "",
                            lastName: "",
                            name: "",
                            gender: "",
                            age: "",
                            dob: "",
                            ageType: "years",
                            email: "",
                            contact: "",
                            phone: "",
                            address: "",
                            weight: "",
                            bloodGroup: "",
                            allergies: [],
                        });
                        setImages([]);
                        setShowImageUpload(false);
                        setErrors({});
                        sessionStorage.removeItem("currentPatientForVaccine");
                    }
                }
            }
        } catch (error) {
            console.error("Error submitting patient form:", error);
            if (error.message) {
                console.log(error.message)
                // toast.error(error.message);
            } else {
                console.log(`Error ${mode === "edit" ? "updating" : "adding"} patient: ${error.toString()}`);
                // toast.error(`Error ${mode === "edit" ? "updating" : "adding"} patient: ${error.toString()}`);
            }
        } finally {
            setIsSubmitting(false);
            setSubmitAction('');
        }
    };

    // Format age display for better readability
    const getAgeDisplayText = () => {
        if (!formData.age) return '';

        const ageNum = parseInt(formData.age, 10);
        if (isNaN(ageNum)) return '';

        switch (formData.ageType) {
            case 'days':
                return `${ageNum} day${ageNum !== 1 ? 's' : ''}`;
            case 'months':
                return `${ageNum} month${ageNum !== 1 ? 's' : ''}`;
            case 'years':
                return `${ageNum} year${ageNum !== 1 ? 's' : ''}`;
            default:
                return `${ageNum} years`;
        }
    };

    // Update patient data in session storage for vaccine tab
    // useEffect(() => {
    //     if (formData.name && formData.age) {
    //         const patientDataForVaccine = {
    //             name: formData.name,
    //             age: formData.age,
    //             gender: formData.gender,
    //             email: formData.email,
    //             contact: formData.contact || formData.phone,
    //             id: formData.id || patient?.id,
    //         };
    //         sessionStorage.setItem('currentPatientForVaccine', JSON.stringify(patientDataForVaccine));
    //     }
    // }, [formData, patient]);

    return (
        <div className="card-body personal-info">
            <h5 className="fw-bold mb-4 px-2 pb-2 pt-2">Patient Profile</h5>
            <form onSubmit={(e) => handleSubmit(e, 'saveOnly')}>
                <div className="row g-3">
                    {/* First Name */}
                    <div className="col-md-6">
                        <label className="form-label">
                            {/* <FiUser className="me-1" /> */}
                            First Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            placeholder="Enter first name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                        {errors.firstName && (
                            <div className="invalid-feedback">{errors.firstName}</div>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="col-md-6">
                        <label className="form-label">
                            {/* <FiUser className="me-1" /> */}
                            Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                        {errors.lastName && (
                            <div className="invalid-feedback">{errors.lastName}</div>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="col-md-6">
                        <label className="form-label">
                            Gender <span className="text-danger">*</span>
                        </label>
                        <select
                            className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                            <div className="invalid-feedback">{errors.gender}</div>
                        )}
                    </div>

                    {/* DOB */}
                    <div className="col-md-6">
                        <label className="form-label">
                            Date of Birth <span className="text-danger">*</span>
                        </label>
                        <input
                            type="date"
                            className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                            value={formData.dob}
                            onChange={(e) => handleDOBChange(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        {errors.dob && (
                            <div className="invalid-feedback">{errors.dob}</div>
                        )}
                        <small>
                            Age will be automatically calculated from date of birth
                        </small>
                    </div>

                    {/* Age */}
                    <div className="col-md-6">
                        <label className="form-label">
                            Age <span className="text-danger">*</span>
                        </label>
                        <div className="row g-2">
                            <div className="col-8">
                                <input
                                    type="number"
                                    className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                                    placeholder="Enter age"
                                    value={formData.age}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    min="0"
                                    max={formData.ageType === 'days' ? "365" : formData.ageType === 'months' ? "240" : "120"}
                                />
                            </div>
                            <div className="col-4">
                                <select
                                    className="form-select"
                                    value={formData.ageType || 'years'}
                                    onChange={(e) => handleAgeChange(formData.age, e.target.value)}
                                >
                                    <option value="years">Years</option>
                                    <option value="months">Months</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                            {errors.age && (
                                <div className="invalid-feedback">{errors.age}</div>
                            )}
                            {formData.age && (
                                <small className="text-muted">
                                    Calculated age: <strong>{getAgeDisplayText()}</strong>
                                    {formData.dob && ` (from DOB: ${new Date(formData.dob).toLocaleDateString()})`}
                                </small>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                        <label className="form-label">
                            {/* <FiMail className="me-1" /> */}
                            Email <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={generateEmail}
                                title="Generate email from name"
                                disabled={!formData.firstName.trim() || !formData.lastName.trim() || mode === "edit"}
                            >
                                <FiRefreshCw size={14} />
                            </button>
                        </div>
                        {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                        )}
                        <small className="text-muted">
                            {mode === "edit"
                                ? "Email cannot be auto-generated in edit mode"
                                : "Click the refresh button to generate email from name"
                            }
                        </small>
                    </div>

                    {/* Phone */}
                    <div className="col-md-6">
                        <label className="form-label">
                            {/* <FiPhone className="me-1" /> */}
                            Phone <span className="text-danger">*</span>
                        </label>
                        <input
                            type="tel"
                            className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                            placeholder="Enter phone number"
                            value={formData.contact || formData.phone}
                            onChange={(e) => handleInputChange('contact', e.target.value)}
                            maxLength="10"
                        />
                        {errors.contact && (
                            <div className="invalid-feedback">{errors.contact}</div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="col-12">
                        <label className="form-label fw-medium">
                            {/* <FiMapPin className="me-1" /> */}
                            Address
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="Enter complete address"
                        />
                    </div>

                    {/* Weight */}
                    <div className="col-md-6">
                        <label className="form-label fw-medium">
                            {/* <MdOutlineMonitorWeight className="me-1" /> */}
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                            placeholder="Enter weight"
                        />
                    </div>

                    {/* Blood Group */}
                    <div className="col-md-6">
                        <label className="form-label fw-medium">
                            {/* <MdOutlineBloodtype className="me-1" /> */}
                            Blood Group
                        </label>
                        <select
                            className="form-control"
                            value={formData.bloodGroup}
                            onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        >
                            <option value="">Select Blood Group</option>
                            {bloodGroups.map((group) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Allergies */}
                    <div className="col-12">
                        <label className="form-label fw-medium">Allergies</label>
                        <div className="d-flex gap-2 mb-2">
                            <input
                                type="text"
                                className="form-control"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                placeholder="Add allergy"
                            />
                            <button type="button" className="btn btn-sm btn-primary" onClick={addAllergy}>
                                Add
                            </button>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {(formData.allergies || []).map((allergy, index) => (
                                <span key={index} className="badge bg-secondary position-relative">
                                    {allergy}
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white btn-sm ms-2"
                                        onClick={() => removeAllergy(index)}
                                        style={{ fontSize: '0.7rem' }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload Option */}
                    <div className="col-12">
                        <label className="form-label fw-medium mr-2">Do you want to add patient images?</label>
                        <div className="form-check form-check-inline" style={{ marginLeft: "10px" }}>
                            <input
                                className="form-check-input"
                                type="radio"
                                name="uploadOption"
                                id="uploadYes"
                                checked={showImageUpload}
                                onChange={() => setShowImageUpload(true)}
                            />
                            <label className="form-check-label" htmlFor="uploadYes">Yes</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="uploadOption"
                                id="uploadNo"
                                checked={!showImageUpload}
                                onChange={() => setShowImageUpload(false)}
                            />
                            <label className="form-check-label" htmlFor="uploadNo">No</label>
                        </div>
                    </div>

                    {/* Conditional Image Upload */}
                    {showImageUpload && (
                        <div className="col-12">
                            <label className="form-label fw-medium">Patient Images (Max 2)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="form-control"
                                disabled={images.length >= 2}
                            />
                            <div className="d-flex mt-2 gap-2">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="position-relative"
                                        style={{ width: "100px", height: "100px" }}
                                    >
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`img-${index}`}
                                            className="img-thumbnail h-100 w-100 object-fit-cover"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                            onClick={() => removeImage(index)}
                                            style={{ padding: '0.1rem 0.3rem' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Patient Ready Status */}
                    {formData.name && formData.age && (
                        <div className="col-12">
                            <div className="alert alert-info mb-3">
                                <small>
                                    ✓ Patient data ready for vaccine creation: <strong>{formData.name}</strong> (Age: {formData.age})
                                </small>
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="col-12 text-center d-flex gap-2 justify-content-start">
                        <button
                            type="submit"
                            className="btn btn-success px-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : mode === "edit" ? "Update Patient" : "Save Patient"}
                        </button>

                        {!patient && formData.name && formData.age && (
                            <button
                                type="button"
                                className="btn btn-primary px-4"
                                onClick={(e) => handleSubmit(e, 'saveAndSchedule')}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Patient + Schedule Vaccine'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TabProfile;