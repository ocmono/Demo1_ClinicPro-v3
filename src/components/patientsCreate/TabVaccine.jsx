import React, { useState, useEffect, useMemo } from 'react';
import { FiShield, FiCalendar, FiCheckCircle, FiAlertCircle, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { useVaccine } from "../../context/VaccineContext";
import { toast } from "react-toastify";

const TabVaccine = ({ patient, mode }) => {
    const { vaccines, getVaccines, scheduleVaccine } = useVaccine();
    const [selectedVaccines, setSelectedVaccines] = useState([]);
    const [patientData, setPatientData] = useState(null);
    const [isScheduling, setIsScheduling] = useState(false);

    useEffect(() => {
        if (vaccines.length === 0) {
            getVaccines();
        }
    }, [vaccines.length, getVaccines]);

    // Get patient data from session storage
    useEffect(() => {
        if (patient && patient.id) {
            setPatientData(patient);
            sessionStorage.setItem("currentPatientForVaccine", JSON.stringify(patient));
        } else {
            const stored = sessionStorage.getItem("currentPatientForVaccine");
            if (stored) {
                try {
                    setPatientData(JSON.parse(stored));
                } catch (e) {
                    console.error("Invalid stored patient", e);
                }
            }
        }
    }, [patient]);

    // Filter eligible vaccines based on patient age
    const eligibleVaccines = useMemo(() => {
        if (!vaccines || vaccines.length === 0) return [];
        if (!patientData || !patientData.age) return [];
        const age = parseInt(patientData.age, 10);
        return vaccines.filter(vaccine => {
            switch (vaccine.age_grp) {
                case "Infant (0-2 years)":
                    return age >= 0 && age <= 2;
                case "Child (3-12 years)":
                    return age >= 3 && age <= 12;
                case "Adolescent (13-17 years)":
                    return age >= 13 && age <= 17;
                case "Adult (18-64 years)":
                    return age >= 18 && age <= 64;
                case "Senior (65+ years)":
                    return age >= 65;
                case "All Ages":
                    return true;
                default:
                    return false;
            }
        });
    }, [vaccines, patientData]);

    // Add vaccine to selected list
    const addVaccine = (vaccine) => {
        if (!selectedVaccines.find(v => v.id === vaccine.id)) {
            setSelectedVaccines(prev => [...prev, {
                ...vaccine,
                scheduledDate: new Date(),
                status: 'scheduled',
                notes: '',
                dose_number: 1
            }]);
        }
    };

    // Remove vaccine from selected list
    const removeVaccine = (vaccineId) => {
        setSelectedVaccines(prev => prev.filter(v => v.id !== vaccineId));
    };

    // Update vaccine schedule date
    const updateVaccineDate = (vaccineId, date) => {
        setSelectedVaccines(prev => prev.map(v => 
            v.id === vaccineId ? { ...v, scheduledDate: new Date(date) } : v
        ));
    };

    // Update vaccine notes
    const updateVaccineNotes = (vaccineId, notes) => {
        setSelectedVaccines(prev => prev.map(v => 
            v.id === vaccineId ? { ...v, notes } : v
        ));
    };

    // Update vaccine dose number
    const updateVaccineDose = (vaccineId, dose_number) => {
        setSelectedVaccines(prev => prev.map(v =>
            v.id === vaccineId ? { ...v, dose_number: parseInt(dose_number) } : v
        ));
    };

    // Auto-schedule vaccines based on age
    const autoScheduleVaccines = () => {
        const today = new Date();
        const autoScheduled = eligibleVaccines.map(vaccine => ({
            ...vaccine,
            scheduledDate: new Date(today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
            status: 'scheduled',
            notes: 'Auto-scheduled based on age',
            dose_number: 1
        }));
        setSelectedVaccines(autoScheduled);
    };

    // Clear all selected vaccines
    const clearAllVaccines = () => {
        setSelectedVaccines([]);
    };

    // Save vaccine schedule to backend + localStorage
    const saveVaccineSchedule = async () => {
        if (!patientData || !patientData.id) {
            toast.error("Patient data is missing. Please save the patient first.");
            return;
        }

        if (selectedVaccines.length === 0) {
            toast.error("Please select at least one vaccine to save.");
            return;
        }

        try {
            const results = [];

            for (const vaccine of selectedVaccines) {
                const scheduleData = {
                    patient_id: Number(patientData.id),
                    vaccine_id: Number(vaccine.id),
                    dose_number: Number(vaccine.dose_number || 1),
                    schedule_date: vaccine.scheduledDate.toISOString().split("T")[0],
                    status: vaccine.status || "scheduled",
                    notes: vaccine.notes || ""
                };

                console.log("👉 Saving vaccine to backend:", scheduleData);

                try {
                    const result = await scheduleVaccine(scheduleData);
                    results.push({ success: true, vaccine: vaccine.name, data: result });
                } catch (error) {
                    results.push({
                        success: false,
                        vaccine: vaccine.name,
                        error: error.response?.data?.detail || error.message
                    });
                }
            }

            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            if (successful.length > 0) {
                toast.success(`✅ Saved ${successful.length} vaccine(s)`);
                setSelectedVaccines([]);
                setPatientData(null);
                sessionStorage.removeItem("currentPatientForVaccine");
            }

            if (failed.length > 0) {
                // toast.error(`❌ Failed to save ${failed.length} vaccine(s). Check console.`);
                console.error("Failed vaccine saves:", failed);
            }
        } catch (error) {
            console.error("Error saving vaccine schedule:", error);
            // toast.error("Failed to save vaccines. Please try again.");
        }
    };


    // Load vaccine schedule from localStorage
    const loadVaccineSchedule = () => {
        if (!patientData || !patientData.id) {
            toast.error("Patient data is missing. Cannot load schedule.");
            return;
        }

        try {
            const storageKey = `vaccine_schedule_${patientData.id}`;
            const savedSchedule = localStorage.getItem(storageKey);

            if (savedSchedule) {
                const parsedSchedule = JSON.parse(savedSchedule);

                // Map saved schedule back to full vaccine objects
                const loadedVaccines = parsedSchedule.map(item => {
                    const baseVaccine = vaccines.find(v => v.id === item.vaccine_id) || {};
                    return {
                        ...baseVaccine,
                        id: item.vaccine_id,
                        name: item.name,
                        dose_number: item.dose_number,
                        scheduledDate: new Date(item.schedule_date),
                        status: item.status,
                        notes: item.notes
                    };
                });

                setSelectedVaccines(loadedVaccines);
                toast.success("Vaccine schedule loaded successfully!");
            } else {
                toast.info("No saved vaccine schedule found for this patient.");
            }
        } catch (error) {
            console.error("Error loading vaccine schedule:", error);
            // toast.error("Failed to load vaccine schedule. Please try again.");
        }
    };

    // Schedule all selected vaccines
    const scheduleAllVaccines = async () => {
        if (!patientData || !patientData.id) {
            toast.error("Patient data is missing. Please save the patient first.");
            return;
        }

        if (selectedVaccines.length === 0) {
            toast.error("Please select at least one vaccine to schedule.");
            return;
        }

        setIsScheduling(true);
        try {
            const results = [];

            for (const vaccine of selectedVaccines) {
                const scheduleData = {
                    patient_id: patientData.id,
                    vaccine_id: vaccine.id,
                    dose_number: vaccine.dose_number || 1,
                    schedule_date: vaccine.scheduledDate.toISOString().split("T")[0],
                    status: vaccine.status || "scheduled",
                    notes: vaccine.notes
                };

                console.log("👉 Sending to backend:", scheduleData);
                try {
                    const result = await scheduleVaccine(scheduleData);
                    results.push({ success: true, vaccine: vaccine.name, data: result });
                } catch (error) {
                    results.push({
                        success: false,
                        vaccine: vaccine.name,
                        error: error.response?.data?.detail || error.message
                    });
                }
            }

            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            if (successful.length > 0) {
                toast.success(`Successfully scheduled ${successful.length} vaccine(s)`);
                // Clear local state and localStorage
                setSelectedVaccines([]);
                const storageKey = `vaccine_schedule_${patientData.id}`;
                localStorage.removeItem(storageKey);
            }

            if (failed.length > 0) {
                // toast.error(`Failed to schedule ${failed.length} vaccine(s). Check console.`);
                console.error("Failed vaccine schedules:", failed);
            }
        } catch (error) {
            console.error("Error scheduling vaccines:", error);
            // toast.error("Failed to schedule vaccines. Please try again.");
        } finally {
            setIsScheduling(false);
        }
    };


    return (
        <div className="card-body">
            <h5 className="fw-bold mb-4 px-2 pb-2 pt-2">Vaccine Registration</h5>

            {/* Patient Information Display */}
            {patientData ? (
                <div className="mb-4 px-2">
                    <div className="card bg-light">
                        <div className="card-body p-3">
                            <h6 className="fw-semibold mb-2">Patient Information</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Name:</strong> {patientData.name}
                                </div>
                                <div className="col-md-3">
                                    <strong>Age:</strong> {patientData.age}
                                </div>
                                <div className="col-md-3">
                                    <strong>Gender:</strong> {patientData.gender || 'Not specified'}
                                </div>
                                {patientData.id && (
                                    <div className="col-12 mt-2">
                                        <small className="text-muted">
                                            Patient ID: {patientData.id}
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="alert alert-warning mb-4">
                    <FiAlertCircle className="me-2" />
                    Please complete the patient profile first before scheduling vaccines.
                </div>
            )}

            {/* Action Buttons */}
            <div className="mb-4 px-2 d-flex gap-2 flex-wrap">
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={autoScheduleVaccines}
                    disabled={eligibleVaccines.length === 0 || !patientData}
                >
                    <FiPlus size={16} className="me-1" />
                    Auto Schedule All Eligible
                </button>
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearAllVaccines}
                    disabled={selectedVaccines.length === 0}
                >
                    <FiTrash2 size={16} className="me-1" />
                    Clear All
                </button>
                {/* <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={saveVaccineSchedule}
                    disabled={selectedVaccines.length === 0 || !patientData}
                >
                    <FiSave size={16} className="me-1" />
                    Save Schedule
                </button>
                <button
                    type="button"
                    className="btn btn-outline-info btn-sm"
                    onClick={loadVaccineSchedule}
                    disabled={!patientData}
                >
                    <FiSave size={16} className="me-1" />
                    Load Saved Schedule
                </button>
                <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={scheduleAllVaccines}
                    disabled={selectedVaccines.length === 0 || !patientData || isScheduling}
                >
                    <FiSave size={16} className="me-1" />
                    {isScheduling ? 'Scheduling...' : 'Schedule All Vaccines'}
                </button> */}
            </div>

            {/* Eligible Vaccines Section */}
            <div className="mb-4 px-2">
                <h6 className="fw-semibold mb-3">
                    <FiShield size={18} className="me-2" />
                    Eligible Vaccines ({eligibleVaccines.length})
                </h6>
                <div className="row g-3">
                    {eligibleVaccines.map(vaccine => (
                        <div key={vaccine.id} className="col-md-6 col-lg-4">
                            <div className="card border h-100">
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h6 className="card-title mb-1 fw-semibold">{vaccine.name}</h6>
                                        <span className={`badge ${vaccine.mandatory ? 'bg-danger' : 'bg-secondary'} small`}>
                                            {vaccine.mandatory ? 'Mandatory' : 'Optional'}
                                        </span>
                                    </div>
                                    <p className="card-text small text-muted mb-2">{vaccine.description || vaccine.notes || "—"}</p>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <small className="text-muted">
                                            <FiCalendar size={14} className="me-1" />
                                            {vaccine.age_grp}
                                        </small>
                                        <small className="text-muted">
                                            {vaccine.total_doses} dose{vaccine.total_doses > 1 ? 's' : ''}
                                        </small>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm w-100"
                                        onClick={() => addVaccine(vaccine)}
                                        disabled={selectedVaccines.find(v => v.id === vaccine.id)}
                                    >
                                        <FiPlus size={14} className="me-1" />
                                        Add to Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!patientData && (
                    <div className="text-center py-4">
                        <FiAlertCircle size={48} className="text-warning mb-3" />
                        <p className="text-warning fw-semibold">Please complete the patient profile first</p>
                    </div>
                )}

                {patientData && eligibleVaccines.length === 0 && (
                    <div className="text-center py-4">
                        <FiAlertCircle size={48} className="text-muted mb-3" />
                        <p className="text-muted">No vaccines available for this age group</p>
                    </div>
                )}
            </div>

            {/* Selected Vaccines Section */}
            {selectedVaccines.length > 0 && (
                <div className="px-2">
                    <h6 className="fw-semibold mb-3">
                        <FiCheckCircle size={18} className="me-2" />
                        Selected Vaccines ({selectedVaccines.length})
                    </h6>
                    <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Vaccine</th>
                                    <th>Dose</th>
                                    <th>Schedule Date</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedVaccines.map(vaccine => (
                                    <tr key={vaccine.id}>
                                        <td>
                                            <div>
                                                <strong>{vaccine.name}</strong>
                                                <br />
                                                <small className="text-muted">{vaccine.description}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="form-control form-control-sm"
                                                value={vaccine.dose_number || 1}
                                                onChange={(e) => updateVaccineDose(vaccine.id, e.target.value)}
                                            >
                                                {[...Array(vaccine.total_doses || 1).keys()].map(dose => (
                                                    <option key={dose + 1} value={dose + 1}>
                                                        Dose {dose + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm"
                                                value={vaccine.scheduledDate.toISOString().split('T')[0]}
                                                onChange={(e) => updateVaccineDate(vaccine.id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="form-control form-control-sm"
                                                value={vaccine.status}
                                                onChange={(e) => setSelectedVaccines(prev =>
                                                    prev.map(v => v.id === vaccine.id ? { ...v, status: e.target.value } : v)
                                                )}
                                            >
                                                <option value="scheduled">Scheduled</option>
                                                <option value="completed">Completed</option>
                                                <option value="missed">Missed</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Add notes..."
                                                value={vaccine.notes}
                                                onChange={(e) => updateVaccineNotes(vaccine.id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => removeVaccine(vaccine.id)}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mb-4 px-2 d-flex gap-2 flex-wrap mt-4">
                        <button
                            type="button"
                            className="btn btn-info btn-sm"
                            onClick={saveVaccineSchedule}
                            disabled={!patientData || isScheduling}
                        >
                            <FiSave size={16} className="me-1" />
                            Save Schedule
                        </button>
                        {/* <button
                            type="button"
                            className="btn btn-outline-info btn-sm"
                            onClick={loadVaccineSchedule}
                            disabled={!patientData}
                        >
                            <FiSave size={16} className="me-1" />
                            Load Saved Schedule
                        </button>
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={scheduleAllVaccines}
                            disabled={!patientData || isScheduling}
                        >
                            <FiSave size={16} className="me-1" />
                            {isScheduling ? 'Scheduling...' : 'Schedule All Vaccines'}
                        </button> */}
                    </div>
                </div>
            )}

            {/* Summary */}
            {selectedVaccines.length > 0 && (
                <div className="mt-4 px-2">
                    <div className="card bg-light">
                        <div className="card-body p-3">
                            <h6 className="fw-semibold mb-2">Vaccine Summary</h6>
                            <div className="row text-center">
                                <div className="col-3">
                                    <div className="text-primary fw-bold">{selectedVaccines.length}</div>
                                    <small className="text-muted">Total Vaccines</small>
                                </div>
                                <div className="col-3">
                                    <div className="text-success fw-bold">
                                        {selectedVaccines.filter(v => v.mandatory).length}
                                    </div>
                                    <small className="text-muted">Mandatory</small>
                                </div>
                                <div className="col-3">
                                    <div className="text-info fw-bold">
                                        {selectedVaccines.filter(v => !v.mandatory).length}
                                    </div>
                                    <small className="text-muted">Optional</small>
                                </div>
                                <div className="col-3">
                                    <div className="text-warning fw-bold">
                                        {new Set(selectedVaccines.map(v => v.id)).size}
                                    </div>
                                    <small className="text-muted">Unique Vaccines</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TabVaccine;