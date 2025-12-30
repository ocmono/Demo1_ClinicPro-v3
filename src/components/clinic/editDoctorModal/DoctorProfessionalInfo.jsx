// DoctorProfessionalInfo.jsx
import React, { useEffect } from "react";
import { FiEdit3, FiUpload, FiTrash2, FiClock } from "react-icons/fi";
import MultiSelectImg from "@/components/shared/MultiSelectImg";

const DoctorProfessionalInfo = ({
    formData,
    handleChange,
    clinicSpecialities,
    setShowSignatureModal,
    specialityOptions,
    qualificationOptions,
    setFormData
}) => {
    useEffect(() => {
        console.log('Form Data updated - drSpeciality:', formData.drSpeciality);
        console.log('Form Data updated - qualification:', formData.qualification);
    }, [formData.drSpeciality, formData.qualification]);
    return (
        <div className="row g-3">
            {/* Specialty */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Specialty</label>
                <MultiSelectImg
                    options={specialityOptions}
                    placeholder="Select specialities"
                    value={specialityOptions.filter(opt =>
                        formData.drSpeciality.includes(opt.value)
                    )}
                    onChange={(selected) => {
                        const values = selected ? selected.map(s => s.value) : [];
                        setFormData(prev => ({ ...prev, drSpeciality: values }));
                    }}
                />
            </div>

            {/* Qualification */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Qualifications</label>
                <MultiSelectImg
                    options={qualificationOptions}
                    placeholder="Select qualifications"
                    value={qualificationOptions.filter(opt =>
                        formData.qualification.includes(opt.value)
                    )}
                    onChange={(selected) => {
                        const values = selected ? selected.map(s => s.value) : [];
                        setFormData(prev => ({ ...prev, qualification: values }));
                    }}
                />
            </div>

            {/* Experience */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Years of Experience</label>
                <input
                    type="text"
                    className="form-control"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label fw-medium">Consultation Fee</label>
                <input
                    type="text"
                    className="form-control"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                />
            </div>

            {/* Registration Number */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Registration Number</label>
                <input
                    type="text"
                    className="form-control"
                    name="reg_no"
                    value={formData.reg_no}
                    onChange={handleChange}
                    placeholder="e.g. MMC/12345"
                />
            </div>

            {/* Signature */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Signature</label>

                {formData.sign ? (
                    <div className="border rounded p-3 text-center bg-light">
                        <img
                            src={formData.sign}
                            alt="Digital Signature"
                            className="img-fluid mb-2"
                            style={{ maxHeight: "80px", objectFit: "contain" }}
                        />

                        <div className="d-flex gap-2 justify-content-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setShowSignatureModal(true)}
                            >
                                <FiEdit3 size={12} className="me-1" />
                                Change
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() =>
                                    setFormData((prev) => ({ ...prev, sign: "" }))
                                }
                            >
                                <FiTrash2 size={12} className="me-1" />
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center border rounded p-4 bg-light">
                        <FiUpload size={32} className="text-muted mb-2" />
                        <p className="text-muted mb-3">No signature added</p>
                            <div className="d-flex justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowSignatureModal(true)}
                                >
                                    <FiEdit3 className="me-1" />
                                    Add Signature
                                </button>
                            </div>
                    </div>
                )}
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
                        onChange={handleChange}
                        min="0"
                        placeholder="e.g. 1"
                    />
                </div>
                <small className="text-muted">Days after appointment</small>
            </div>
        </div>
    );
};

export default DoctorProfessionalInfo;
