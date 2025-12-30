import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FiX, FiSave, FiUser, FiAward, FiCalendar } from "react-icons/fi";
import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";
import SignaturePad from "../shared/SignaturePad";
import DoctorBasicInfoTab from "./editDoctorModal/DoctorBasicInfoTab";
import DoctorProfessionalInfo from "./editDoctorModal/DoctorProfessionalInfo";
import DoctorScheduleDay from "./editDoctorModal/DoctorScheduleDay";

const EditDoctorModal = ({ isOpen, onClose, doctor, onSave }) => {
    const [loading, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const { updateDoctorInDB, clinicSpecialities } = useClinicManagement();
    // console.log(`clinicSpecialities ====================`, clinicSpecialities);
    const initializedDoctorId = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState(null);

    const normalizeArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
            return value.split(",").map(v => v.trim()).filter(Boolean);
        }
        return [];
    };

    /** WEEKLY SCHEDULE STATE */
    const [weeklyAvailability, setWeeklyAvailability] = useState([
        { day: "Monday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
        { day: "Tuesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
        { day: "Wednesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
        { day: "Thursday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
        { day: "Friday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
        { day: "Saturday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
        { day: "Sunday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
    ]);

    const specialityOptions = clinicSpecialities.map(spec => ({
        value: spec.speciality,
        label: spec.speciality,
        img: spec.icon || '/assets/icons/medical.png'
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

    /** BASIC FORM STATE */
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        drSpeciality: [],
        qualification: [],
        experience: "",
        gender: "",
        status: true,
        startBufferTime: "0",
        endBufferTime: "0",
        password: "",
        reg_no: "",
        sign: "",
        dob: "",
        is_clinic_time: true,
        is_video_time: false,
        consultationFee: '',
    });

    /** Convert backend time "10:00:00" → "10:00" */
    const toHHMM = (t) => {
        if (!t) return "";
        const m = String(t).match(/(\d{1,2}):(\d{2})/);
        return m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
    };

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            drSpeciality: [],
            qualification: [],
            experience: "",
            gender: "",
            status: true,
            startBufferTime: "0",
            endBufferTime: "0",
            password: "",
            reg_no: "",
            sign: "",
            dob: "",
            is_clinic_time: true,
            is_video_time: false,
            consultationFee: '',
        });
        setWeeklyAvailability([
            { day: "Monday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
            { day: "Tuesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
            { day: "Wednesday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
            { day: "Thursday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
            { day: "Friday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
            { day: "Saturday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
            { day: "Sunday", closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] },
        ]);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setConfirmPassword("");
        setShowSignatureModal(false);
        setActiveTab("basic");
        setActiveDayIndex(null);
    };

    /** When doctor data loads → populate form */
    useEffect(() => {
        if (!isOpen || !doctor) {
            resetForm();
            return;
        }

        if (initializedDoctorId.current !== doctor.id) {
            resetForm();
            initializedDoctorId.current = doctor.id;
        }

        const firstName = doctor.firstName || doctor.name?.split(" ")[0] || "";
        const lastName =
            doctor.lastName || doctor.name?.split(" ").slice(1).join(" ") || "";

        setFormData({
            firstName,
            lastName,
            email: doctor.email || "",
            phone: doctor.phone || "",
            drSpeciality: normalizeArray(doctor.drSpeciality),
            qualification: normalizeArray(doctor.qualification),
            experience: doctor.experience || "",
            gender: doctor.gender || "",
            status: doctor.status ?? true,
            startBufferTime: doctor.startBufferTime || "0",
            endBufferTime: doctor.endBufferTime || "0",
            reg_no:
                doctor.reg_no ||
                doctor.registrationNumber ||
                doctor.medical_registration_number ||
                "",
            sign:
                typeof doctor.sign === "object" && doctor.sign?.url
                    ? doctor.sign.url
                    : doctor.sign || "",
            dob: doctor.dob,
            is_clinic_time: doctor.is_clinic_time || true,
            is_video_time: doctor.is_video_time || false,
            consultationFee: doctor.consultationFee,
        });

        /** Process weekly schedule */
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        const normalized = days.map((day) => {
            const matches = doctor.availability?.filter((d) => d.day === day) || [];

            if (matches.length === 0)
                return { day, closed: true, slots: [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }] };

            const closed = matches.every((d) => d.closed);

            const slots = matches
                .filter((d) => !d.closed)
                .map((s) => ({
                    startTime: toHHMM(s.startTime),
                    endTime: toHHMM(s.endTime),
                    slotDuration: s.slotDuration ?? 30,
                    persons: String(s.persons || "1"),
                    appointmentmode: s.is_video_time
                        ? "online"
                        : "offline",
                }));

            return {
                day,
                closed,
                slots: slots.length ? slots : [{ startTime: "", endTime: "", slotDuration: 30, persons: "1" }],
            };
        });

        setWeeklyAvailability(normalized);
    }, [doctor, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            resetForm();
            initializedDoctorId.current = null;
        }
    }, [isOpen]);

    /** Input change handler */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "status") {
            return setFormData((prev) => ({
                ...prev,
                status: value === "true",
            }));
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /** WEEKLY SCHEDULE — Helpers */
    const handleClosedToggle = (dayIndex) => {
        setWeeklyAvailability((prev) =>
            prev.map((d, i) =>
                i === dayIndex ? { ...d, closed: !d.closed } : d
            )
        );
    };

    const addSlot = (dayIndex) => {
        setWeeklyAvailability((prev) =>
            prev.map((d, i) =>
                i === dayIndex
                    ? { ...d, slots: [...d.slots, { startTime: "", endTime: "", slotDuration: 30, persons: "1" }] }
                    : d
            )
        );
    };

    const removeSlot = (dayIndex, slotIndex) => {
        setWeeklyAvailability((prev) =>
            prev.map((d, i) =>
                i === dayIndex
                    ? { ...d, slots: d.slots.filter((_, si) => si !== slotIndex) }
                    : d
            )
        );
    };

    const handleSlotChange = (dayIndex, slotIndex, field, value) => {
        setWeeklyAvailability((prev) =>
            prev.map((d, i) =>
                i === dayIndex
                    ? {
                        ...d,
                        slots: d.slots.map((s, si) =>
                            si === slotIndex ? { ...s, [field]: value } : s
                        ),
                    }
                    : d
            )
        );
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const s = new Date(`2000-01-01T${start}`);
        const e = new Date(`2000-01-01T${end}`);
        return (e - s) / 60000;
    };

    const getSlotStatus = (slot) => {
        if (!slot.startTime || !slot.endTime) return "incomplete";
        const diff = calculateDuration(slot.startTime, slot.endTime);
        if (diff <= 0) return "invalid";
        if (diff < 30) return "short";
        return "valid";
    };

    const getDayGradient = (day) => {
        const gradients = {
            Monday: "linear-gradient(135deg,#667eea,#764ba2)",
            Tuesday: "linear-gradient(135deg,#f093fb,#f5576c)",
            Wednesday: "linear-gradient(135deg,#4facfe,#00f2fe)",
            Thursday: "linear-gradient(135deg,#43e97b,#38f9d7)",
            Friday: "linear-gradient(135deg,#fa709a,#fee140)",
            Saturday: "linear-gradient(135deg,#a8edea,#fed6e3)",
            Sunday: "linear-gradient(135deg,#ffecd2,#fcb69f)",
        };
        return gradients[day];
    };

    /** SUBMIT */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        console.log("=== START DOCTOR UPDATE DEBUG ===");
        console.log("1. CURRENT FORM DATA drSpeciality:", formData.drSpeciality);
        console.log("2. CURRENT FORM DATA qualification:", formData.qualification);
        console.log("3. FORM DATA TYPE drSpeciality:", typeof formData.drSpeciality);
        console.log("4. FORM DATA TYPE qualification:", typeof formData.qualification);

        // Add this debug to see the actual array content
        console.log("5. drSpeciality array items:",
            Array.isArray(formData.drSpeciality) ? formData.drSpeciality.map((item, i) => `${i}: "${item}"`) : "Not an array");
        console.log("6. qualification array items:",
            Array.isArray(formData.qualification) ? formData.qualification.map((item, i) => `${i}: "${item}"`) : "Not an array");

        if (formData.password && formData.password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return setSaving(false);
        }

        /** Flatten schedule */
        const flatAvailability = weeklyAvailability.flatMap((dayObj) => {
            // ✅ consider only VALID slots
            const validSlots = dayObj.slots.filter(
                (s) => s.startTime && s.endTime
            );

            // 🔴 Day is closed ONLY if no valid slots
            if (validSlots.length === 0) {
                return [{
                    day: dayObj.day,
                    closed: true,
                    startTime: null,
                    endTime: null,
                    slotDuration: null,
                    persons: null,
                    is_clinic_time: false,
                    is_video_time: false,
                }];
            }
            // 🟢 Day is OPEN → create one record per slot
            return validSlots.map((slot) => {
                const mode = slot.appointmentmode || "offline";

                return {
                    day: dayObj.day,
                    closed: false,
                    startTime: slot.startTime + ":00",
                    endTime: slot.endTime + ":00",
                    slotDuration: slot.slotDuration,
                    persons: Number(slot.persons || 1),
                    is_clinic_time: mode === "offline",
                    is_video_time: mode === "online",
                };
            });
        });


        console.log("6. AVAILABILITY (flatAvailability):", flatAvailability);
        console.log("7. WEEKLY AVAILABILITY (raw):", weeklyAvailability);

        const drSpecialityArray = Array.isArray(formData.drSpeciality)
            ? formData.drSpeciality
            : formData.drSpeciality ? [formData.drSpeciality] : [];

        const qualificationArray = Array.isArray(formData.qualification)
            ? formData.qualification
            : formData.qualification ? [formData.qualification] : [];

        console.log("8. PROCESSED SPECIALITY ARRAY:", drSpecialityArray);
        console.log("9. PROCESSED QUALIFICATION ARRAY:", qualificationArray);

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            drSpeciality: Array.isArray(formData.drSpeciality) ? formData.drSpeciality : [],
            qualification: Array.isArray(formData.qualification) ? formData.qualification : [],
            experience: formData.experience,
            gender: formData.gender,
            status: formData.status,
            startBufferTime: formData.startBufferTime,
            endBufferTime: formData.endBufferTime,
            reg_no: formData.reg_no,
            sign: formData.sign,
            dob: formData.dob,
            is_clinic_time: formData.is_clinic_time,
            is_video_time: formData.is_video_time,
            consultationFee: formData.consultationFee,
            keyword: formData.firstName.toLowerCase().replace(/\s+/g, "-"),
            availability: flatAvailability,
            ...(formData.password ? { password: formData.password } : {}),
        };

        console.log("9. PAYLOAD TO SEND:", JSON.stringify(payload, null, 2));
        console.log("=== END DOCTOR UPDATE DEBUG ===");

        console.log("📤 Sending update payload to updateDoctorInDB...");
        console.log("Doctor ID:", doctor.id);

        try {
            const result = await updateDoctorInDB(doctor.id, payload);
            console.log("✅ Update successful, result:", result);
            onSave(result);
            onClose();
        } catch (err) {
            console.error("❌ Failed to update doctor:", err);
            toast.error("Failed to update doctor");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* HEADER */}
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <FiUser className="me-2" /> Edit Doctor
                        </h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* BODY */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            {/* TABS */}
                            <div className="d-flex justify-content-between align-items-center mb-3">

                                {/* LEFT: Tabs */}
                                <ul className="nav nav-tabs">
                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === "basic" ? "active" : ""}`}
                                            onClick={() => setActiveTab("basic")}
                                        >
                                            <FiUser className="me-1" /> Basic Info
                                        </button>
                                    </li>

                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === "professional" ? "active" : ""}`}
                                            onClick={() => setActiveTab("professional")}
                                        >
                                            <FiAward className="me-1" /> Professional
                                        </button>
                                    </li>

                                    <li className="nav-item">
                                        <button
                                            type="button"
                                            className={`nav-link ${activeTab === "schedule" ? "active" : ""}`}
                                            onClick={() => setActiveTab("schedule")}
                                        >
                                            <FiCalendar className="me-1" /> Schedule
                                        </button>
                                    </li>
                                </ul>
                            </div>


                            {/* TAB CONTENT */}
                            {activeTab === "basic" && (
                                <DoctorBasicInfoTab
                                    formData={formData}
                                    handleChange={handleChange}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    confirmPassword={confirmPassword}
                                    setConfirmPassword={setConfirmPassword}
                                    showConfirmPassword={showConfirmPassword}
                                    setShowConfirmPassword={setShowConfirmPassword}
                                />
                            )}

                            {activeTab === "professional" && (
                                <DoctorProfessionalInfo
                                    formData={formData}
                                    handleChange={handleChange}
                                    clinicSpecialities={clinicSpecialities}
                                    setShowSignatureModal={setShowSignatureModal}
                                    setFormData={setFormData}
                                    specialityOptions={specialityOptions}
                                    qualificationOptions={qualificationOptions}
                                />
                            )}

                            {activeTab === "schedule" && (
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
                        </form>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer">
                        <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                            <FiX className="me-1" /> Cancel
                        </button>

                        <button className="btn btn-primary" type="submit" onClick={handleSubmit} disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" /> Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave className="me-1" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* SIGNATURE MODAL */}
            {showSignatureModal && (
                <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <SignaturePad
                                existingSignature={formData.sign}
                                onSave={(sig) => {
                                    setFormData((prev) => ({ ...prev, sign: sig }));
                                    setShowSignatureModal(false);
                                }}
                                onClose={() => setShowSignatureModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditDoctorModal;
