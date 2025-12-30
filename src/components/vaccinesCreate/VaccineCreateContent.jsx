import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiUser, FiShield, FiCalendar, FiMapPin, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';

const VaccineCreateContent = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        vaccine_name: '',
        vaccine_type: '',
        manufacturer: '',
        batch_number: '',
        dose_number: '',
        total_doses: '',
        administered_date: '',
        next_dose_date: '',
        administered_by: '',
        location: '',
        side_effects: '',
        notes: '',
        status: 'completed',
        patient_id: '',
        category: ''
    });

    // Get patients from context
    const { patients, loading: patientsLoading } = usePatient();
    const [loading, setLoading] = useState(false);

    // Check if there's a current patient from session storage and pre-select
    useEffect(() => {
        const currentPatientData = sessionStorage.getItem('currentPatientForVaccine');
        if (currentPatientData) {
            try {
                const patientInfo = JSON.parse(currentPatientData);
                console.log('Found patient data in session storage:', patientInfo);

                // Pre-select the patient if they exist in the patients list
                const matchingPatient = patients.find(p =>
                    p.name === patientInfo.name &&
                    p.age === patientInfo.age &&
                    p.email === patientInfo.email
                );

                if (matchingPatient) {
                    console.log('Matching patient found, pre-selecting:', matchingPatient);
                    setFormData(prev => ({
                        ...prev,
                        patient_id: matchingPatient.id.toString()
                    }));
                } else {
                    console.log('No matching patient found in context, available patients:', patients);
                }
            } catch (error) {
                console.error('Error parsing patient data from session storage:', error);
            }
        }
    }, [patients]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.vaccine_name || !formData.patient_id || !formData.administered_date) {
                alert('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Here you would make API call to save the vaccine record
            console.log('Submitting vaccine record:', formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Vaccine record created successfully!');

            // Clear the patient data from session storage after successful creation
            sessionStorage.removeItem('currentPatientForVaccine');

            navigate('/vaccines/dashboard');
        } catch (error) {
            console.error('Error creating vaccine record:', error);
            alert('Error creating vaccine record. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            navigate('/vaccines/dashboard');
        }
    };

    return (
        <div className="col-lg-12">
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            {/* Debug info - show if patient data was loaded from session */}
                            {(() => {
                                const currentPatientData = sessionStorage.getItem('currentPatientForVaccine');
                                if (currentPatientData) {
                                    try {
                                        const patientInfo = JSON.parse(currentPatientData);
                                        return (
                                            <div className="col-12">
                                                <div className="alert alert-success">
                                                    <small>
                                                        ✓ Patient data loaded: <strong>{patientInfo.name}</strong> (Age: {patientInfo.age}, {patientInfo.gender})
                                                        {formData.patient_id ? ' - Patient pre-selected!' : ' - Searching in patient list...'}
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                }
                                return null;
                            })()}

                            {/* Patient Selection */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    <FiUser size={16} className="me-2" />
                                    Patient <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="patient_id"
                                    className="form-select"
                                    value={formData.patient_id}
                                    onChange={handleInputChange}
                                    required
                                    disabled={patientsLoading}
                                >
                                    <option value="">
                                        {patientsLoading ? 'Loading patients...' : 'Select Patient'}
                                    </option>
                                    {patients.map(patient => (
                                        <option key={patient.id} value={patient.id}>
                                            {patient.name} (Age: {patient.age}, {patient.gender})
                                        </option>
                                    ))}
                                </select>
                                {!patientsLoading && patients.length === 0 && (
                                    <small className="text-muted mt-1 d-block">
                                        No patients found. <a href="/patients/add-patient" className="text-primary">Add a patient first</a>
                                    </small>
                                )}
                                {formData.patient_id && (
                                    <small className="text-success mt-1 d-block">
                                        ✓ Patient selected: {patients.find(p => p.id.toString() === formData.patient_id)?.name}
                                    </small>
                                )}
                            </div>

                            {/* Vaccine Name */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    <FiShield size={16} className="me-2" />
                                    Vaccine Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="vaccine_name"
                                    className="form-control"
                                    value={formData.vaccine_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., BCG, DPT, MMR"
                                    required
                                />
                            </div>

                            {/* Vaccine Type */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Vaccine Type</label>
                                <select
                                    name="vaccine_type"
                                    className="form-select"
                                    value={formData.vaccine_type}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Type</option>
                                    <option value="live_attenuated">Live Attenuated</option>
                                    <option value="inactivated">Inactivated</option>
                                    <option value="subunit">Subunit</option>
                                    <option value="toxoid">Toxoid</option>
                                    <option value="conjugate">Conjugate</option>
                                    <option value="mrna">mRNA</option>
                                </select>
                            </div>

                            {/* Manufacturer */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Manufacturer</label>
                                <input
                                    type="text"
                                    name="manufacturer"
                                    className="form-control"
                                    value={formData.manufacturer}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Serum Institute, Bharat Biotech"
                                />
                            </div>

                            {/* Batch Number */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Batch Number</label>
                                <input
                                    type="text"
                                    name="batch_number"
                                    className="form-control"
                                    value={formData.batch_number}
                                    onChange={handleInputChange}
                                    placeholder="e.g., BCG001, DPT123"
                                />
                            </div>

                            {/* Category */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Category</label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Category</option>
                                    <option value="routine">Routine Immunization</option>
                                    <option value="catch_up">Catch-up Vaccination</option>
                                    <option value="travel">Travel Vaccination</option>
                                    <option value="outbreak">Outbreak Response</option>
                                    <option value="special">Special Circumstances</option>
                                </select>
                            </div>

                            {/* Dose Number */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Dose Number</label>
                                <select
                                    name="dose_number"
                                    className="form-select"
                                    value={formData.dose_number}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Dose</option>
                                    <option value="1">1st Dose</option>
                                    <option value="2">2nd Dose</option>
                                    <option value="3">3rd Dose</option>
                                    <option value="4">4th Dose</option>
                                    <option value="5">5th Dose</option>
                                    <option value="booster">Booster</option>
                                </select>
                            </div>

                            {/* Total Doses */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Total Doses Required</label>
                                <select
                                    name="total_doses"
                                    className="form-select"
                                    value={formData.total_doses}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Total</option>
                                    <option value="1">1 Dose</option>
                                    <option value="2">2 Doses</option>
                                    <option value="3">3 Doses</option>
                                    <option value="4">4 Doses</option>
                                    <option value="5">5 Doses</option>
                                </select>
                            </div>

                            {/* Administered Date */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    <FiCalendar size={16} className="me-2" />
                                    Administered Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="administered_date"
                                    className="form-control"
                                    value={formData.administered_date}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            {/* Next Dose Date */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    <FiCalendar size={16} className="me-2" />
                                    Next Dose Date
                                </label>
                                <input
                                    type="date"
                                    name="next_dose_date"
                                    className="form-control"
                                    value={formData.next_dose_date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Administered By */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Administered By</label>
                                <input
                                    type="text"
                                    name="administered_by"
                                    className="form-control"
                                    value={formData.administered_by}
                                    onChange={handleInputChange}
                                    placeholder="Doctor/Nurse name"
                                />
                            </div>

                            {/* Location */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    <FiMapPin size={16} className="me-2" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-control"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Left arm, Right thigh"
                                />
                            </div>

                            {/* Status */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Status</label>
                                <select
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="completed">Completed</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Side Effects */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    <FiAlertTriangle size={16} className="me-2" />
                                    Side Effects
                                </label>
                                <textarea
                                    name="side_effects"
                                    className="form-control"
                                    rows="3"
                                    value={formData.side_effects}
                                    onChange={handleInputChange}
                                    placeholder="Any observed side effects or reactions"
                                />
                            </div>

                            {/* Notes */}
                            <div className="col-md-12">
                                <label className="form-label fw-bold">
                                    <FiFileText size={16} className="me-2" />
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    className="form-control"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Additional notes or observations"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                            {/* Debug button to clear session storage */}
                            {sessionStorage.getItem('currentPatientForVaccine') && (
                                <button
                                    type="button"
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => {
                                        sessionStorage.removeItem('currentPatientForVaccine');
                                        setFormData(prev => ({ ...prev, patient_id: '' }));
                                        alert('Patient selection cleared');
                                    }}
                                >
                                    Clear Patient Selection
                                </button>
                            )}

                            <div className="d-flex gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    <FiX size={16} className="me-2" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={16} className="me-2" />
                                            Save Vaccine Record
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
};

export default VaccineCreateContent;