import React, { useState, useEffect } from 'react'
import SelectDropdown from '@/components/shared/SelectDropdown'
import TextArea from '@/components/shared/TextArea'
import { customerListTagsOptions, leadsGroupsOptions, leadsSourceOptions, leadsStatusOptions, propsalVisibilityOptions, taskAssigneeOptions } from '@/utils/options'
import useLocationData from '@/hooks/useLocationData'
import { currencyOptionsData } from '@/utils/fackData/currencyOptionsData'
import { languagesData } from '@/utils/fackData/languagesData'
import { timezonesData } from '@/utils/fackData/timeZonesData'
import Loading from '@/components/shared/Loading'
import Input from '@/components/shared/Input'
import MultiSelectImg from '@/components/shared/MultiSelectImg'
import MultiSelectTags from '@/components/shared/MultiSelectTags'
import { toast } from "react-toastify";
import { useLeads } from '../../context/LeadsContext';
import { FiSave } from 'react-icons/fi';

const LeadsCreateContent = ({ lead = null, campaignId = null }) => {
    const { addLead, campaigns, loading: expLoading } = useLeads();
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const { countries, states, cities, loading, error, fetchStates, fetchCities, } = useLocationData();
    const [leadDate, setLeadDate] = useState(lead?.lead_date || new Date().toISOString().split('T')[0]);
    const campaignOptions = campaigns.map(campaign => ({
        label: campaign.displayName,
        value: String(campaign.id),
    }));

    const [formData, setFormData] = useState({
        campaignId: null,
        fullName: "",
        mobile: "",
        email: "",
        leadDate: "",
        leadSource: null,
        leadStatus: null,
        comments: "",
        // Medical/Patient fields
        age: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        weight: "",
        address: "",
        country: "",
        state: "",
        city: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        medicalHistory: "",
        allergies: [],
        insuranceProvider: "",
        insurancePolicyNumber: "",
    });

    const [newAllergy, setNewAllergy] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [isSaving, setIsSaving] = useState(false);
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    const tabs = [
        { id: "basic", title: "Basic Info", description: "Lead status and contact" },
        { id: "medical", title: "Medical Info", description: "Health information" },
        { id: "address", title: "Address & Contact", description: "Location and emergency" },
        { id: "insurance", title: "Insurance & Notes", description: "Additional details" },
    ];

    const isBasicInfoValid = () => {
        return formData.campaignId && formData.fullName && formData.mobile && formData.leadDate && formData.leadSource && formData.leadStatus;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validate basic info if saving from basic tab
        if (activeTab === "basic" && !isBasicInfoValid()) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSaving(true);

        try {
            // Save to localStorage as draft
            const draftData = {
                ...formData,
                savedAt: new Date().toISOString(),
                tab: activeTab
            };
            localStorage.setItem('leadDraft', JSON.stringify(draftData));
            toast.success("Progress saved successfully!");
        } catch (error) {
            toast.error("Failed to save progress");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTabClick = (tabId) => {
        // Allow switching to any tab, but warn if basic info is incomplete
        if (tabId !== "basic" && !isBasicInfoValid()) {
            const proceed = window.confirm("Basic Info is incomplete. Do you want to continue anyway?");
            if (!proceed) return;
        }
        setActiveTab(tabId);
    };

    // Load draft on mount
    React.useEffect(() => {
        const savedDraft = localStorage.getItem('leadDraft');
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setFormData(prev => ({ ...prev, ...draft }));
                if (draft.tab) {
                    setActiveTab(draft.tab);
                }
            } catch (error) {
                console.error("Error loading draft:", error);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for numeric fields
        if (name === "age" || name === "weight") {
            if (value === "" || /^\d*$/.test(value)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === "country" || name === "state" || name === "city") {
            setFormData((prev) => ({ ...prev, [name]: value }));
            return;
        }

        // For contact number, allow only digits and max length 10
        if (name === "mobile" || name === "emergencyContactPhone") {
            if (value === "" || (/^\d{0,10}$/.test(value) && value.length <= 10)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Calculate age from date of birth
    const calculateAgeFromDOB = (dob) => {
        if (!dob) return "";
        const birthDate = new Date(dob);
        if (isNaN(birthDate)) return "";
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    const handleDOBChange = (e) => {
        const dob = e.target.value;
        setFormData((prev) => ({
            ...prev,
            dob: dob,
            age: dob ? calculateAgeFromDOB(dob) : prev.age,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { campaignId, fullName, mobile, leadDate, leadSource, leadStatus } = formData;

        if (
            !campaignId ||
            !fullName ||
            !mobile ||
            !leadDate ||
            !leadSource ||
            !leadStatus
        ) {
            toast.error("Please fill all required fields");
            return;
        }

        if (mobile.length !== 10) {
            toast.error("Mobile number must be exactly 10 digits");
            return;
        }

        // Ensure campaignId is stored as string
        addLead({
            campaignId: campaignId.value,
            fullName,
            mobile: mobile.toString(),
            email: formData.email || "",
            leadDate,
            leadSource: leadSource.value,
            leadStatus: leadStatus.value,
            comments: formData.comments || "",
            // Medical/Patient fields
            age: formData.age ? parseInt(formData.age, 10) : null,
            dob: formData.dob || null,
            gender: formData.gender || "",
            bloodGroup: formData.bloodGroup || "",
            weight: formData.weight ? parseInt(formData.weight, 10) : null,
            address: formData.address || "",
            city: formData.city || "",
            state: formData.state || "",
            country: formData.country || "",
            emergencyContactName: formData.emergencyContactName || "",
            emergencyContactPhone: formData.emergencyContactPhone || "",
            medicalHistory: formData.medicalHistory || "",
            allergies: formData.allergies || [],
            insuranceProvider: formData.insuranceProvider || "",
            insurancePolicyNumber: formData.insurancePolicyNumber || "",
        });

        toast.success("Lead added successfully!");
        setFormData({
            campaignId: null,
            fullName: "",
            mobile: "",
            email: "",
            leadDate: new Date().toISOString().split("T")[0],
            leadSource: null,
            leadStatus: null,
            comments: "",
            age: "",
            dob: "",
            gender: "",
            bloodGroup: "",
            weight: "",
            address: "",
            city: "",
            state: "",
            country: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            medicalHistory: "",
            allergies: [],
            insuranceProvider: "",
            insurancePolicyNumber: "",
        });
        setNewAllergy("");
        setActiveTab("basic");
        localStorage.removeItem('leadDraft');
    };

    // Tab Footer Component - Save button for each tab
    const TabFooter = ({ onSave, showNext = false, onNext, showSubmit = false }) => (
        <div className="card-footer mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    <FiSave size={16} className="me-1" />
                    {isSaving ? "Saving..." : "Save Progress"}
                </button>
                <div className="d-flex gap-2">
                    {showNext && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onNext}
                        >
                            Next Tab
                        </button>
                    )}
                    {showSubmit && (
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={!isBasicInfoValid()}
                        >
                            Submit Lead
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "basic":
                return renderBasicTab();
            case "medical":
                return renderMedicalTab();
            case "address":
                return renderAddressTab();
            case "insurance":
                return renderInsuranceTab();
            default:
                return null;
        }
    };

    const renderBasicTab = () => (
        <>
            <div className="card-body lead-status">
                <div className="mb-5 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 me-4">
                        <span className="d-block mb-2">Lead Status :</span>
                        <span className="fs-12 fw-normal text-muted text-truncate-1-line">Typically refers to adding a new potential customer or sales prospect</span>
                    </h5>
                </div>
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Status <span className="text-danger">*</span></label>
                        <SelectDropdown
                            options={leadsStatusOptions}
                            selectedOption={formData.leadStatus}
                            onSelectOption={(option) =>
                                setFormData((prev) => ({ ...prev, leadStatus: option }))
                            }
                        />
                    </div>
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Source <span className="text-danger">*</span></label>
                        <SelectDropdown
                            options={leadsSourceOptions}
                            selectedOption={formData.leadSource}
                            onSelectOption={(option) =>
                                setFormData((prev) => ({ ...prev, leadSource: option }))
                            }
                        />
                    </div>
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Campaign <span className="text-danger">*</span></label>
                        <SelectDropdown
                            options={campaignOptions}
                            selectedOption={formData.campaignId}
                            onSelectOption={(option) =>
                                setFormData((prev) => ({ ...prev, campaignId: option }))
                            }
                        />
                    </div>
                </div>
            </div>
            <hr className="mt-0" />
            <div className="card-body general-info">
                <div className="mb-5 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 me-4">
                        <span className="d-block mb-2">Lead Info :</span>
                        <span className="fs-12 fw-normal text-muted text-truncate-1-line">General information for your lead</span>
                    </h5>
                </div>
                <Input
                    icon="feather-user"
                    label="Full Name"
                    labelId="nameInput"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    name="fullName"
                    required
                />
                <Input
                    icon='feather-mail'
                    label="Email"
                    labelId="emailInput"
                    placeholder="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <Input
                    icon='feather-phone'
                    label="Phone"
                    labelId="phoneInput"
                    placeholder="10-digit Phone Number"
                    value={formData.mobile}
                    onChange={handleChange}
                    name="mobile"
                    required
                    maxLength={10}
                />
                <div className="row mb-4 align-items-center">
                    <div className="col-lg-4">
                        <label className="fw-semibold">Lead Date <span className="text-danger">*</span></label>
                    </div>
                    <div className="col-lg-8">
                        <input
                            type="date"
                            className="form-control"
                            name="leadDate"
                            value={formData.leadDate || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>
            <TabFooter
                onSave={handleSave}
                showNext={true}
                showSubmit={true}
                onNext={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                        handleTabClick(tabs[currentIndex + 1].id);
                    }
                }}
            />
        </>
    );

    const renderMedicalTab = () => (
        <>
            <div className="card-body general-info">
                <div className="mb-5 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 me-4">
                        <span className="d-block mb-2">Medical Information :</span>
                        <span className="fs-12 fw-normal text-muted text-truncate-1-line">Medical and health information for the lead (Optional)</span>
                    </h5>
                </div>
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Gender</label>
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
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Date of Birth</label>
                        <input
                            type="date"
                            className="form-control"
                            name="dob"
                            value={formData.dob}
                            onChange={handleDOBChange}
                        />
                    </div>
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Age</label>
                        <input
                            type="number"
                            className="form-control"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                        />
                        {/* <Input
                        icon="feather-calendar"
                        labelId="ageInput"
                        placeholder="Age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                    /> */}
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Blood Group</label>
                        <select
                            className="form-select"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                        >
                            <option value="">Select Blood Group</option>
                            {bloodGroups.map((bg) => (
                                <option key={bg} value={bg}>
                                    {bg}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-lg-4 mb-4">
                        <label className="form-label">Weight (kg)</label>
                        <input
                            type="number"
                            className="form-control"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                        />
                        {/* <Input
                        icon="feather-activity"
                        label="Weight (kg)"
                        labelId="weightInput"
                        placeholder="Weight in kg"
                        name="weight"
                        type="number"
                        value={formData.weight}
                        onChange={handleChange}
                    /> */}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="form-label">Allergies</label>
                    <div className="d-flex gap-2 mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add allergy (e.g., Penicillin, Peanuts)"
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addAllergy();
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={addAllergy}
                        >
                            Add
                        </button>
                    </div>
                    {formData.allergies.length > 0 && (
                        <div className="d-flex flex-wrap gap-2">
                            {formData.allergies.map((allergy, index) => (
                                <span key={index} className="badge bg-danger">
                                    {allergy}
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white ms-2"
                                        onClick={() => removeAllergy(index)}
                                        aria-label="Remove"
                                    ></button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <TextArea
                    icon="feather-file-text"
                    label="Medical History"
                    labelId="medicalHistoryInput"
                    placeholder="Previous medical conditions, surgeries, chronic diseases, etc."
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    row="4"
                />
            </div>
            <TabFooter
                onSave={handleSave}
                showNext={true}
                showSubmit={true}
                onNext={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                        handleTabClick(tabs[currentIndex + 1].id);
                    }
                }}
            />
        </>
    );

    const renderAddressTab = () => (
        <>
            <div className="card-body general-info">
                <div className="mb-5 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 me-4">
                        <span className="d-block mb-2">Address Information :</span>
                        <span className="fs-12 fw-normal text-muted text-truncate-1-line">Contact and location details (Optional)</span>
                    </h5>
                </div>
                <div className="row mb-4">
                    <div className='col-lg-4'>
                        <div>
                            <label className="fw-semibold">Country: </label>
                        </div>
                        <div>
                            <SelectDropdown
                                options={countries}
                                selectedOption={selectedCountry}
                                onSelectOption={(option) => {
                                    fetchStates(option.label);
                                    fetchCities(option.label);
                                    setSelectedCountry(option);
                                    setFormData((prev) => ({ ...prev, country: option.label }));
                                    setSelectedState(null);
                                    setSelectedCity(null);
                                    setFormData((prev) => ({ ...prev, state: "", city: "" }));
                                }}
                            />
                        </div>
                    </div>
                    <div className='col-lg-4'>
                        <div>
                            <label className="fw-semibold">State: </label>
                        </div>
                        <div>
                            <SelectDropdown
                                options={states}
                                selectedOption={selectedState}
                                onSelectOption={(option) => {
                                    setSelectedState(option);
                                    setFormData((prev) => ({ ...prev, state: option.label }));
                                    // Reset city when state changes
                                    setSelectedCity(null);
                                    setFormData((prev) => ({ ...prev, city: "" }));
                                }}
                            />
                        </div>
                    </div>
                    <div className='col-lg-4'>
                        <div>
                            <label className="fw-semibold">City: </label>
                        </div>
                        <div>
                            <SelectDropdown
                                options={cities}
                                selectedOption={selectedCity}
                                onSelectOption={(option) => {
                                    setSelectedCity(option);
                                    setFormData((prev) => ({ ...prev, city: option.label }));
                                }}
                            />
                        </div>
                    </div>
                </div>
                <TextArea
                    icon="feather-map-pin"
                    label="Address"
                    labelId="addressInput"
                    placeholder="Street address, apartment, suite, etc."
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    row="3"
                />
                <hr className="mt-0 mb-4" />
                <div className="mb-5 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 me-4">
                        <span className="d-block mb-2">Emergency Contact :</span>
                        <span className="fs-12 fw-normal text-muted text-truncate-1-line">Emergency contact information (Optional)</span>
                    </h5>
                </div>
                <div className="row">
                    <div className="col-lg-6 mb-4">
                        <Input
                            icon="feather-user"
                            label="Emergency Contact Name"
                            labelId="emergencyContactNameInput"
                            placeholder="Full Name"
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-lg-6 mb-4">
                        <Input
                            icon="feather-phone"
                            label="Emergency Contact Phone"
                            labelId="emergencyContactPhoneInput"
                            placeholder="10-digit Phone Number"
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                            maxLength={10}
                        />
                    </div>
                </div>
            </div>
            <TabFooter
                onSave={handleSave}
                showNext={true}
                showSubmit={true}
                onNext={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                        handleTabClick(tabs[currentIndex + 1].id);
                    }
                }}
            />
        </>
    );

    const renderInsuranceTab = () => (
        <>
            <div className="card-body general-info">
                <div className="mb-5 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 me-4">
                        <span className="d-block mb-2">Insurance Information :</span>
                        <span className="fs-12 fw-normal text-muted text-truncate-1-line">Insurance details (Optional)</span>
                    </h5>
                </div>
                <div className="row">
                    <div className="col-lg-6 mb-4">
                        <Input
                            icon="feather-shield"
                            label="Insurance Provider"
                            labelId="insuranceProviderInput"
                            placeholder="Insurance Company Name"
                            name="insuranceProvider"
                            value={formData.insuranceProvider}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-lg-6 mb-4">
                        <Input
                            icon="feather-credit-card"
                            label="Policy Number"
                            labelId="insurancePolicyNumberInput"
                            placeholder="Policy Number"
                            name="insurancePolicyNumber"
                            value={formData.insurancePolicyNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <hr className="mt-0 mb-4" />
                <div className="mb-5 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 me-4">
                        <span className="d-block mb-2">Additional Notes :</span>
                        <span className="fs-12 fw-normal text-muted text-truncate-1-line">Additional comments or notes about the lead</span>
                    </h5>
                </div>
                <TextArea
                    icon="feather-tag"
                    label="Comments"
                    labelId="commentsInput"
                    placeholder="Additional notes, comments, or special instructions"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    row="4"
                />
            </div>
            <TabFooter
                onSave={handleSave}
                showNext={false}
                showSubmit={true}
            />
        </>
    );

    return (
        <>
            {loading && <Loading />}
            <div className="col-lg-12">
                <form className="card stretch stretch-full" onSubmit={handleSubmit}>
                    {/* Tabs Header */}
                    <div className="card-header p-0">
                        <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs">
                            {tabs.map((tab) => (
                                <li key={tab.id} className="nav-item flex-fill border-top">
                                    <a
                                        className={`nav-link ${activeTab === tab.id ? "active" : ""} px-4`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleTabClick(tab.id);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {tab.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {renderTabContent()}
                    </div>
                </form>
            </div>
        </>
    )
}

export default LeadsCreateContent
