import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiX, FiUserPlus, FiEye, FiEyeOff, FiCalendar, FiClock, FiActivity, FiInfo, FiMapPin, FiRefreshCw, FiEdit3, FiUpload, FiTrash2, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import { useUsers } from '../../../context/UserContext';
import Footer from '@/components/shared/Footer';
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider';
import MultiSelectImg from '@/components/shared/MultiSelectImg';
import DoctorScheduleDay from '@/components/clinic/editDoctorModal/DoctorScheduleDay';

const SignaturePad = ({ onSave, onClose, existingSignature }) => {
    const sigCanvas = useRef(null);
    const [activeTab, setActiveTab] = useState('draw');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [drawing, setDrawing] = useState(false);

    // Initialize canvas context
    useEffect(() => {
        if (sigCanvas.current && activeTab === 'draw') {
            const canvas = sigCanvas.current;
            const ctx = canvas.getContext('2d');

            // Set canvas styles
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [activeTab]);

    const getMousePos = (canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    // Drawing functions
    const startDrawing = (e) => {
        setDrawing(true);
        const canvas = sigCanvas.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!drawing) return;
        const canvas = sigCanvas.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getMousePos(canvas, e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setDrawing(false);
    };

    // Clear signature pad
    const clearSignature = () => {
        const canvas = sigCanvas.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Save drawn signature
    const saveDrawnSignature = () => {
        const canvas = sigCanvas.current;
        if (canvas && !isCanvasBlank(canvas)) {
            const signatureData = canvas.toDataURL('image/png');
            onSave(signatureData);
        } else {
            alert('Please provide a signature first.');
        }
    };

    // Check if canvas is blank
    const isCanvasBlank = (canvas) => {
        const ctx = canvas.getContext('2d');
        const pixelBuffer = new Uint32Array(
            ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        return !pixelBuffer.some(color => color !== 0);
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Save uploaded signature
    const saveUploadedSignature = () => {
        if (!uploadedImage) {
            alert('Please upload a signature image first.');
            return;
        }
        onSave(uploadedImage);
    };

    // Load existing signature if provided
    useEffect(() => {
        if (existingSignature && activeTab === 'draw' && sigCanvas.current) {
            const canvas = sigCanvas.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = existingSignature;
        }
    }, [existingSignature, activeTab]);

    return (
        <div className="signature-modal">
            <div className="modal-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Add Doctor Signature</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
                {/* Tabs for draw/upload */}
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'draw' ? 'active' : ''}`}
                            onClick={() => setActiveTab('draw')}
                        >
                            <FiEdit3 className="me-1" />
                            Draw Signature
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            <FiUpload className="me-1" />
                            Upload Image
                        </button>
                    </li>
                </ul>

                {/* Draw Signature Tab */}
                {activeTab === 'draw' && (
                    <div>
                        <div className="signature-container border rounded p-3 bg-light">
                            <canvas
                                ref={sigCanvas}
                                width={500}
                                height={200}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: 4,
                                    cursor: 'crosshair',
                                    width: '100%',
                                    backgroundColor: 'white'
                                }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    startDrawing(e.touches[0]);
                                }}
                                onTouchMove={(e) => {
                                    e.preventDefault();
                                    draw(e.touches[0]);
                                }}
                                onTouchEnd={stopDrawing}
                            />
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={clearSignature}
                            >
                                <FiTrash2 className="me-1" />
                                Clear
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary ms-auto"
                                onClick={saveDrawnSignature}
                            >
                                <FiDownload className="me-1" />
                                Save Signature
                            </button>
                        </div>
                        <small className="text-muted d-block mt-2">
                            Draw your signature in the box above
                        </small>
                    </div>
                )}

                {/* Upload Image Tab */}
                {activeTab === 'upload' && (
                    <div>
                        <div className="upload-container text-center p-4 border rounded bg-light">
                            {uploadedImage ? (
                                <div>
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded signature"
                                        className="img-fluid mb-3 border rounded"
                                        style={{ maxHeight: '200px', maxWidth: '100%' }}
                                    />
                                    <div className="d-flex gap-2 justify-content-center">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => setUploadedImage(null)}
                                        >
                                            <FiTrash2 className="me-1" />
                                            Remove
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={saveUploadedSignature}
                                        >
                                            <FiDownload className="me-1" />
                                            Use This Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <FiUpload size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-3">
                                        Upload a clear image of your signature
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="form-control"
                                    />
                                    <small className="text-muted d-block mt-2">
                                        Supported formats: JPG, PNG, GIF (Max: 2MB)
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddUser = () => {
    const navigate = useNavigate();
    const { addUser } = useUsers();
    const { updateDoctorInDB, clinicSpecialities } = useClinicManagement();
    const [activeDoctorTab, setActiveDoctorTab] = useState("details");
    const [activeDayIndex, setActiveDayIndex] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        phone: '',
        dob: '',
        age: '',
        ageType: 'years', // 'years' or 'months'
        gender: '',
        status: 'Active',
        role: '',
        // Doctor specific fields
        specialization: [],
        qualification: [],
        experience: '',
        startBufferTime: '',
        endBufferTime: '',
        reg_no: '',
        sign: '',
        // Receptionist specific fields
        receptionistQualification: '',
        receptionistAddress: '',
        // Accountant specific fields
        accountantQualification: '',
        accountantExperience: '',
        consultationFee: '',
        is_clinic_time: true,
        is_video_time: false,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const roles = [
        { value: 'doctor', label: 'Doctor' },
        { value: 'receptionist', label: 'Receptionist' },
        { value: 'accountant', label: 'Accountant' },
        // { value: 'admin', label: 'Administrator' },
        // { value: 'patient', label: 'Patient' },
        // { value: 'pharmacist', label: 'Pharmacist' },
        { value: 'clinic_admin', label: 'Clinic Admin' },
        { value: 'super_admin', label: 'Super Admin' },
        // { value: 'doctor+', label: 'Doctor +' }
    ];

    useEffect(() => {
        if (formData.role !== "doctor") {
            setActiveDoctorTab("details");
        }
    }, [formData.role]);

    // Signature modal functions
    const handleOpenSignatureModal = () => {
        setShowSignatureModal(true);
    };

    const addSlot = (dayIndex) => {
        setWeeklyAvailability(prev =>
            prev.map((day, i) =>
                i === dayIndex
                    ? {
                        ...day,
                        closed: false,
                        slots: [
                            ...day.slots,
                            {
                                startTime: "",
                                endTime: "",
                                slotDuration: 30,
                                persons: 1,
                                appointmentmode: "offline"
                            }
                        ]
                    }
                    : day
            )
        );
    };

    const removeSlot = (dayIndex, slotIndex) => {
        setWeeklyAvailability(prev =>
            prev.map((day, i) =>
                i === dayIndex
                    ? { ...day, slots: day.slots.filter((_, s) => s !== slotIndex) }
                    : day
            )
        );
    };

    const handleSlotChange = (dayIndex, slotIndex, field, value) => {
        setWeeklyAvailability(prev =>
            prev.map((day, i) =>
                i === dayIndex
                    ? {
                        ...day,
                        slots: day.slots.map((slot, s) =>
                            s === slotIndex ? { ...slot, [field]: value } : slot
                        )
                    }
                    : day
            )
        );
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    };

    const getSlotStatus = (slot) => {
        if (!slot.startTime || !slot.endTime) return "warning";
        if (calculateDuration(slot.startTime, slot.endTime) <= 0) return "invalid";
        return "valid";
    };

    const handleSaveSignature = (signatureData) => {
        setFormData(prev => ({
            ...prev,
            sign: signatureData
        }));
        setShowSignatureModal(false);
        toast.success('Signature saved successfully!');
    };

    const handleRemoveSignature = () => {
        setFormData(prev => ({
            ...prev,
            sign: ''
        }));
        setSignature("");
        setUploadedImage("");
        toast.info('Signature removed');
    };

    // const qualifications = [
    //     'MBBS', 'MD', 'MS', 'DNB', 'DM', 'MCh', 'BDS', 'MDS',
    //     'BHMS', 'BAMS', 'BUMS', 'PhD', 'Fellowship', 'Diploma',
    //     'BSc Nursing', 'MSc Nursing', 'B.Pharm', 'M.Pharm',
    //     'CA', 'CPA', 'B.Com', 'M.Com', 'MBA', 'Other'
    // ];

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

    // Auto-generate username when first and last name are filled
    useEffect(() => {
        if (formData.firstName.trim() && formData.lastName.trim() && !formData.username) {
            const firstName = formData.firstName.trim().toLowerCase();
            const lastName = formData.lastName.trim().toLowerCase();
            const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit random number

            const generatedUsername = `${firstName}${lastName}${randomNum}`;
            setFormData(prev => ({
                ...prev,
                username: generatedUsername
            }));

            // Clear username error if it exists
            if (errors.username) {
                setErrors(prev => ({ ...prev, username: '' }));
            }
        }
    }, [formData.firstName, formData.lastName, formData.username]);


    const [weeklyAvailability, setWeeklyAvailability] = useState([
        { day: "Monday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
        { day: "Tuesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
        { day: "Wednesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
        { day: "Thursday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
        { day: "Friday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
        { day: "Saturday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] },
        { day: "Sunday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30 }] }
    ]);

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

    const specialityOptions = clinicSpecialities.map(spec => ({
        value: spec.speciality,
        label: spec.speciality,
        img: spec.icon || '/assets/icons/medical.png' // optional
    }));

    const qualificationOptions = [
        { value: 'MBBS', label: 'MBBS' },
        { value: 'MD', label: 'MD' },
        { value: 'MS', label: 'MS' },
        { value: 'DNB', label: 'DNB' },
        { value: 'DM', label: 'DM' },
        { value: 'MCh', label: 'MCh' },
        { value: 'BDS', label: 'BDS' },
        { value: 'MDS', label: 'MDS' },
        { value: 'BHMS', label: 'BHMS' },
        { value: 'BAMS', label: 'BAMS' },
        { value: 'BUMS', label: 'BUMS' },
        { value: 'PhD', label: 'PhD' },
        { value: 'Fellowship', label: 'Fellowship' },
        { value: 'Diploma', label: 'Diploma' },
    ];

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

    const handleInputChange = (field, value) => {
        if (field === "dob") {
            const birthDate = new Date(value);
            let age = "";
            let ageType = "years";

            if (!isNaN(birthDate)) {
                const today = new Date();
                const birthYear = birthDate.getFullYear();
                const birthMonth = birthDate.getMonth();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();
                const currentDate = today.getDate();
                const birthDateOfMonth = birthDate.getDate();

                // Calculate age in months
                const ageInMonths = (currentYear - birthYear) * 12 + (currentMonth - birthMonth);

                // Calculate age in days for very young infants
                const timeDiff = today.getTime() - birthDate.getTime();
                const ageInDays = Math.floor(timeDiff / (1000 * 3600 * 24));

                if (ageInDays <= 30) {
                    // If less than or equal to 30 days, show in days
                    age = ageInDays.toString();
                    ageType = "days";
                } else if (ageInMonths < 24) {
                    // If less than 2 years, show in months
                    age = ageInMonths.toString();
                    ageType = "months";

                    // Check if born in current month - show in days
                    if (currentYear === birthYear && currentMonth === birthMonth) {
                        age = ageInDays.toString();
                        ageType = "days";
                    }
                    // Check if born in current year but not current month
                    else if (currentYear === birthYear) {
                        age = ageInMonths.toString();
                        ageType = "months";
                    }
                } else {
                    // If 2 years or more, show in years
                    let ageInYears = currentYear - birthYear;

                    // Adjust if birthday hasn't occurred yet this year
                    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDate < birthDateOfMonth)) {
                        ageInYears--;
                    }

                    age = ageInYears.toString();
                    ageType = "years";
                }
            }
            setFormData(prev => ({
                ...prev,
                dob: value,
                age: age,
                ageType: ageType
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        // Role-specific validations
        if (formData.role === 'doctor') {
            if (!formData.specialization.length) {
                newErrors.specialization = 'At least one specialty is required';
            }
            if (!formData.reg_no) {
                newErrors.reg_no = 'Registration number is required for doctors';
            }
            if (!formData.sign) {
                newErrors.sign = 'Doctor signature is required';
            }
        }

        // Age validation
        if (!formData.age.trim()) {
            newErrors.age = 'Age is required';
        } else if (isNaN(formData.age) || parseInt(formData.age) < 0) {
            newErrors.age = 'Please enter a valid age';
        } else if (formData.ageType === 'days' && parseInt(formData.age) > 365) {
            newErrors.age = 'Age in days cannot exceed 365';
        } else if (formData.ageType === 'months' && parseInt(formData.age) > 240) {
            newErrors.age = 'Age in months cannot exceed 240 (20 years)';
        } else if (formData.ageType === 'years' && parseInt(formData.age) > 120) {
            newErrors.age = 'Age in years cannot exceed 120';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatAvailabilityForBackend = (weeklyAvailability) => {
        console.log("Formatting availability for backend...");
        const availabilityPayload = [];

        weeklyAvailability.forEach(day => {
            console.log(`Processing ${day.day}:`, day);
            // If day is closed → send ONE closed record
            const hasValidSlots = day.slots &&
                day.slots.some(slot => slot.startTime && slot.endTime && slot.startTime.trim() && slot.endTime.trim());

            console.log(`${day.day} - hasValidSlots:`, hasValidSlots);
            if (!hasValidSlots) {
                console.log(`${day.day} - Sending closed record`);
                availabilityPayload.push({
                    day: day.day,
                    closed: true,
                    startTime: null,
                    endTime: null,
                    slotDuration: null,
                    persons: null,
                    is_clinic_time: false,
                    is_video_time: false
                });
                return;
            }

            // ✅ Send ONE payload PER SLOT
            day.slots.forEach((slot, slotIndex) => {
                if (slot.startTime && slot.endTime && slot.startTime.trim() && slot.endTime.trim()) {
                    const mode = (slot.appointmentmode || "offline").toLowerCase().trim();

                    console.log(`${day.day} - Slot ${slotIndex}:`, {
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        mode: mode,
                        is_clinic_time: mode === "offline",
                        is_video_time: mode === "online"
                    });
                    availabilityPayload.push({
                        day: day.day,
                        closed: false,
                        startTime: slot.startTime + ":00",
                        endTime: slot.endTime + ":00",
                        slotDuration: slot.slotDuration || 30,
                        persons: slot.persons ? Number(slot.persons) : 1,

                        // ✅ MODE MAPPING (CRITICAL)
                        is_clinic_time: mode === "offline",
                        is_video_time: mode === "online"
                    });
                }
            });
        });
        console.log("Final availability payload:", availabilityPayload);
        return availabilityPayload;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            // Format age for backend based on ageType
            let formattedAge = "";
            if (formData.age && formData.ageType) {
                if (formData.ageType === 'days') {
                    formattedAge = `${formData.age} days`;
                } else if (formData.ageType === 'months') {
                    formattedAge = `${formData.age} months`;
                } else {
                    formattedAge = `${formData.age} years`;
                }
            }
            // Prepare data for API
            let userData = {
                email: formData.email,
                username: formData.username,
                firstName: formData.firstName, // snake_case
                lastName: formData.lastName,   // snake_case
                password: formData.password,
                phone: formData.phone,
                dob: formData.dob,
                age: formattedAge,    // ensure number
                gender: formData.gender,
                status: formData.status,
                role: formData.role,
                created_at: new Date().toISOString().split('T')[0], // Current date
                // Doctor fields
                drSpeciality: [],
                startBufferTime: null,
                endBufferTime: null,
                qualification: [],
                availability: null,
                reg_no: null,
                sign: null,
                consultationFee: formData.consultationFee,

                // Patient fields
                bloodGroup: null,
                weight: null,
                address: null,
                allergies: [],

                // Accountant fields
                acc_experience: null,
                acc_qualification: null,

                // Receptionist fields
                rec_address: null,
                rec_qualification: null
            };

            // Override with actual values based on role
            if (formData.role === "doctor") {
                userData.drSpeciality = Array.isArray(formData.specialization)
                    ? formData.specialization
                    : (formData.specialization ? [formData.specialization] : []);
                userData.qualification = Array.isArray(formData.qualification)
                    ? formData.qualification
                    : (formData.qualification ? [formData.qualification] : []);
                userData.experience = formData.experience || null;
                userData.startBufferTime = formData.startBufferTime ? parseInt(formData.startBufferTime) : null;
                userData.endBufferTime = formData.endBufferTime ? parseInt(formData.endBufferTime) : null;
                userData.reg_no = formData.reg_no || null;
                userData.sign = formData.sign || null;
                userData.availability = formatAvailabilityForBackend(weeklyAvailability);
                userData.consultationFee = formData.consultationFee || null;
            } else if (formData.role === "receptionist") {
                userData.rec_qualification = formData.receptionistQualification || null;
                userData.rec_address = formData.receptionistAddress || null;
            } else if (formData.role === "accountant") {
                userData.acc_qualification = formData.accountantQualification || null;
                userData.acc_experience = formData.accountantExperience || null;
            }

            console.log('User data to be sent:', userData);
            console.log("FINAL PAYLOAD:", userData);

            // Here you would make the actual API call
            // const response = await fetch('/api/users', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(userData)
            // });

            // if (!response.ok) {
            //   throw new Error('Failed to create user');
            // }

            // Simulate API call
            const result = await addUser(userData);
            if (!result || result.error) throw new Error("Failed to create user")
            toast.success('User created successfully!');
            // If success, go back to users list
            navigate('/users');

        } catch (error) {
            console.error('Error creating user:', error);
            // toast.error('Failed to create user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/users');
    };

    return (
        <>
            <PageHeader />
            <div className="main-content">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header d-flex align-items-center gap-2">
                                <FiUserPlus className="text-primary" size={20} />
                                <h5 className="mb-0">Add New User</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">

                                        {/* Personal Information */}
                                        <div className="col-12">
                                            <h6 className="text-primary mb-3">
                                                <FiUser className="me-2" />
                                                Personal Information
                                            </h6>
                                        </div>

                                        {/* <div className="col-md-2">
                                            <label className="form-label">
                                                Title <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-select ${errors.title ? 'is-invalid' : ''}`}
                                                value={formData.title || ''}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                <option value="Mr.">Mr.</option>
                                                <option value="Mrs.">Mrs.</option>
                                                <option value="Ms.">Ms.</option>
                                                <option value="Dr.">Dr.</option>
                                            </select>
                                            {errors.title && (
                                                <div className="invalid-feedback">{errors.title}</div>
                                            )}
                                        </div> */}

                                        <div className="col-md-6">
                                            <label className="form-label">
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

                                        <div className="col-md-6">
                                            <label className="form-label">
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
                                                    disabled={!formData.firstName.trim() || !formData.lastName.trim()}
                                                >
                                                    <FiRefreshCw size={14} />
                                                </button>
                                            </div>
                                            {errors.email && (
                                                <div className="invalid-feedback">{errors.email}</div>
                                            )}
                                            <small className="text-muted">
                                                Click the refresh button to generate email from name
                                            </small>
                                        </div>


                                        <div className="col-md-6">
                                            <label className="form-label">
                                                {/* <FiPhone className="me-1" /> */}
                                                Phone <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                placeholder="Enter phone number"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                            />
                                            {errors.phone && (
                                                <div className="invalid-feedback">{errors.phone}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                {/* <FiCalendar className="me-1" /> */}
                                                Date of Birth <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                placeholder="Enter date of birth"
                                                value={formData.dob}
                                                onChange={(e) => handleInputChange('dob', e.target.value)}
                                            />
                                            {errors.dob && (
                                                <div className="invalid-feedback">{errors.dob}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Age <span className="text-danger">*</span>
                                            </label>
                                            <div className="row g-2">
                                                <div className="col-8">
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        placeholder={formData.ageType === 'days' ? 'Enter age in days' : formData.ageType === 'months' ? 'Enter age in months' : 'Enter age in years'}
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
                                                        onChange={(e) => handleInputChange('ageType', e.target.value)}
                                                    >
                                                        <option value="years">Years</option>
                                                        <option value="months">Months</option>
                                                        <option value="days">Days</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <small className="text-muted">
                                                {formData.ageType === 'days'
                                                    ? 'Auto-calculated for infants under 1 month'
                                                    : formData.ageType === 'months'
                                                        ? 'Auto-calculated for children under 2 years'
                                                        : 'Auto-calculated for ages 2 years and above'
                                                }
                                            </small>
                                        </div>

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

                                        {/* Account Information */}
                                        <div className="col-12 mt-4">
                                            <h6 className="text-primary mb-3">
                                                <FiLock className="me-2" />
                                                Account Information
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Username <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                                placeholder="Enter username"
                                                value={formData.username}
                                                onChange={(e) => handleInputChange('username', e.target.value)}
                                            />
                                            {errors.username && (
                                                <div className="invalid-feedback">{errors.username}</div>
                                            )}
                                            <small className="text-muted">
                                                Username is auto-generated when you enter first and last name
                                            </small>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Password <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                    placeholder="Enter password"
                                                    value={formData.password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                                {errors.password && (
                                                    <div className="invalid-feedback">{errors.password}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Role <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                                                value={formData.role}
                                                onChange={(e) => handleInputChange('role', e.target.value)}
                                            >
                                                <option value="">Select Role</option>
                                                {roles.map((role) => (
                                                    <option key={role.value} value={role.value}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.role && (
                                                <div className="invalid-feedback">{errors.role}</div>
                                            )}
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
                                            </select>
                                        </div>

                                        {formData.role === 'doctor' && (
                                            <div className="col-12 mt-4">
                                                <ul className="nav nav-tabs">
                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeDoctorTab === 'details' ? 'active' : ''}`}
                                                            onClick={() => setActiveDoctorTab('details')}
                                                        >
                                                            <FiUser className="me-1" />
                                                            Doctor Details
                                                        </button>
                                                    </li>

                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeDoctorTab === 'availability' ? 'active' : ''}`}
                                                            onClick={() => setActiveDoctorTab('availability')}
                                                        >
                                                            <FiCalendar className="me-1" />
                                                            Availability
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}

                                        {/* Additional Information */}
                                        {formData.role === 'doctor' && activeDoctorTab === 'details' && (
                                            <>
                                                <div className="col-12 mt-4">
                                                    <h6 className="text-primary mb-3">
                                                        <FiUser className="me-2" />
                                                        Doctor Additional Details
                                                    </h6>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">Specialty <span className="text-danger">*</span></label>
                                                    <MultiSelectImg
                                                        options={specialityOptions}
                                                        placeholder="Select doctor specialties"
                                                        value={specialityOptions.filter(opt =>
                                                            formData.specialization.includes(opt.value)
                                                        )}
                                                        onChange={(selected) => {
                                                            const values = selected ? selected.map(s => s.value) : [];
                                                            handleInputChange('specialization', values);
                                                        }}
                                                    />
                                                    {errors.specialization && (
                                                        <div className="text-danger small mt-1">
                                                            {errors.specialization}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Registration Number <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.reg_no ? 'is-invalid' : ''}`}
                                                        placeholder="Enter registration number"
                                                        value={formData.reg_no || ''}
                                                        onChange={(e) => handleInputChange('reg_no', e.target.value)}
                                                    />
                                                    {errors.reg_no && (
                                                        <div className="invalid-feedback">{errors.reg_no}</div>
                                                    )}
                                                    <small className="text-muted">
                                                        Medical council registration number
                                                    </small>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Doctor Signature <span className="text-danger">*</span>
                                                    </label>
                                                    <div className="signature-field">
                                                        {formData.sign ? (
                                                            <div className="signature-preview border rounded p-3 text-center">
                                                                <img
                                                                    src={formData.sign}
                                                                    alt="Doctor signature"
                                                                    className="img-fluid mb-2"
                                                                    style={{ maxHeight: '80px', maxWidth: '200px' }}
                                                                />
                                                                <div className="d-flex gap-2 justify-content-center">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-primary btn-sm"
                                                                        onClick={handleOpenSignatureModal}
                                                                    >
                                                                        <FiEdit3 size={12} className="me-1" />
                                                                        Change
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        onClick={handleRemoveSignature}
                                                                    >
                                                                        <FiTrash2 size={12} className="me-1" />
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center border rounded p-4 bg-light d-flex justify-content-center flex-column align-items-center">
                                                                <FiUpload size={32} className="text-muted mb-2" />
                                                                <p className="text-muted mb-3">No signature added</p>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    onClick={handleOpenSignatureModal}
                                                                >
                                                                    <FiEdit3 className="me-1" />
                                                                    Add Signature
                                                                </button>
                                                            </div>
                                                        )}
                                                        {errors.sign && (
                                                            <div className="invalid-feedback d-block">{errors.sign}</div>
                                                        )}
                                                        <small className="text-muted d-block mt-1">
                                                            Click to draw or upload your signature
                                                        </small>
                                                    </div>
                                                </div>


                                                <div className="col-md-6">
                                                    <label className="form-label">Qualification</label>
                                                    <MultiSelectImg
                                                        options={qualificationOptions}
                                                        value={qualificationOptions.filter(opt =>
                                                            formData.qualification.includes(opt.value)
                                                        )}
                                                        onChange={(selected) => {
                                                            handleInputChange(
                                                                'qualification',
                                                                Array.isArray(selected) ? selected.map(s => s.value) : []
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                <div className='col-md-6'>
                                                    <label className="form-label">Consultation Fee</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="e.g. 500"
                                                        value={formData.consultationFee || ''}
                                                        onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Experience (Years)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="e.g. 5"
                                                        value={formData.experience || ''}
                                                        onChange={(e) => handleInputChange('experience', e.target.value)}
                                                    />
                                                </div>

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
                                                            onChange={(e) => handleInputChange("startBufferTime", e.target.value)}
                                                            min="0"
                                                            placeholder="e.g. 4"
                                                        />
                                                    </div>
                                                    <small className="text-muted">Days before appointment</small>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-medium">End Buffer Time (Days)</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text">
                                                            <FiClock size={14} />
                                                        </span>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="endBufferTime"
                                                            value={formData.endBufferTime}
                                                            onChange={(e) => handleInputChange("endBufferTime", e.target.value)}
                                                            min="0"
                                                            placeholder="e.g. 1"
                                                        />
                                                    </div>
                                                    <small className="text-muted">Days after appointment</small>
                                                </div>
                                            </>
                                        )}

                                        {formData.role === 'doctor' && activeDoctorTab === 'availability' && (
                                            <div className="row g-3">
                                                {weeklyAvailability.map((day, index) => (
                                                    <DoctorScheduleDay
                                                        key={day.day}
                                                        day={day}
                                                        dayIndex={index}
                                                        activeDayIndex={activeDayIndex}
                                                        setActiveDayIndex={setActiveDayIndex}
                                                        addSlot={addSlot}
                                                        removeSlot={removeSlot}
                                                        handleSlotChange={handleSlotChange}
                                                        calculateDuration={calculateDuration}
                                                        getSlotStatus={getSlotStatus}
                                                        getDayGradient={getDayGradient}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {formData.role === 'receptionist' && (
                                            <>
                                                <div className="col-12 mt-4">
                                                    <h6 className="text-primary mb-3">
                                                        <FiUser className="me-2" />
                                                        Receptionist Additional Details
                                                    </h6>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label fw-medium">Qualification</label>
                                                        <input
                                                            type="text"
                                                            name="receptionistQualification"
                                                            className="form-control"
                                                            value={formData.receptionistQualification || ""}
                                                            onChange={(e) => handleInputChange("receptionistQualification", e.target.value)}
                                                            placeholder="Enter qualification"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label fw-medium">Address</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">
                                                                <FiMapPin size={14} />
                                                            </span>
                                                            <input
                                                                type="text"
                                                                name="address"
                                                                className="form-control"
                                                                value={formData.receptionistAddress || ""}
                                                                onChange={(e) => handleInputChange("receptionistAddress", e.target.value)}
                                                                placeholder="Enter complete address"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {formData.role === 'accountant' && (
                                            <>
                                                <div className="col-12 mt-4">
                                                    <h6 className="text-primary mb-3">
                                                        <FiUser className="me-2" />
                                                        Accountant Additional Details
                                                    </h6>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label fw-medium">Qualification</label>
                                                        <select
                                                            name="qualification"
                                                            className="form-select"
                                                            value={formData.accountantQualification || ""}
                                                            onChange={(e) => handleInputChange("accountantQualification", e.target.value)}
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
                                                        <div className="form-text">
                                                            <FiInfo size={14} className="me-1" />
                                                            Select the accountant's professional qualification
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label fw-medium">Experience (Years)</label>
                                                        <input
                                                            type="text"
                                                            name="experience"
                                                            className="form-control"
                                                            value={formData.accountantExperience || ""}
                                                            onChange={(e) => handleInputChange("accountantExperience", e.target.value)}
                                                            placeholder="Enter years of experience"
                                                            min="0"
                                                            max="50"
                                                        />
                                                        <div className="form-text">
                                                            <FiInfo size={14} className="me-1" />
                                                            Total years of professional experience
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Professional Information */}
                                        {/* <div className="col-12 mt-4">
                                            <h6 className="text-primary mb-3">
                                                Professional Information
                                            </h6>
                                        </div> */}

                                        {/* <div className="col-md-12">
                                            <label className="form-label">
                                                Qualification
                                            </label>
                                            <select
                                                className="form-select"
                                                value={formData.qualification}
                                                onChange={(e) => handleInputChange('qualification', e.target.value)}
                                            >
                                                <option value="">Select Qualification</option>
                                                {qualifications.map((qual) => (
                                                    <option key={qual} value={qual}>
                                                        {qual}
                                                    </option>
                                                ))}
                                            </select>
                                        </div> */}

                                    </div>

                                    {/* Form Actions */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={handleCancel}
                                                    disabled={isSubmitting}
                                                >
                                                    <FiX className="me-1" />
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={isSubmitting}
                                                >
                                                    <FiSave className="me-1" />
                                                    {isSubmitting ? 'Creating...' : 'Create User'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            {showSignatureModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <SignaturePad
                                onSave={handleSaveSignature}
                                onClose={() => setShowSignatureModal(false)}
                                existingSignature={formData.sign}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddUser;