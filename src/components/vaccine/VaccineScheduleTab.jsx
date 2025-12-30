import React, { useEffect, useState } from "react"
import { useVaccine } from "../../context/VaccineContext";

const VaccineScheduleTab = ({ patientId, patientName }) => {
    const {
        vaccineSchedules,
        loading,
        scheduleVaccine,
        updateVaccineScheduleStatus,
        deleteVaccineSchedule,
        getSchedulesByPatient,
        getVaccineSchedules,
        getVaccines,
        vaccines
    } = useVaccine();

    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [formData, setFormData] = useState({
        vaccine_id: "",
        dose_number: "",
        schedule_date: "",
        status: "scheduled",
        notes: ""
    });

    const themeColors = {
        primary: "#3454d1",
        secondary: "#6b7885",
        success: "#17c666",
        info: "#3dc7be",
        warning: "#ffa21d",
        danger: "#d13b4c",
        dark: "#283c50",
        light: "#f8fafc",
        border: "#e2e8f0",
        text: "#475569",
        textLight: "#64748b",
        textDark: "#1e293b",
        white: "#ffffff",
        shadow: "rgba(0, 0, 0, 0.1)",
        // Enhanced gradients
        primaryGradient: "linear-gradient(135deg, #3454d1 0%, #4f6bff 100%)",
        successGradient: "linear-gradient(135deg, #17c666 0%, #20e676 100%)",
        infoGradient: "linear-gradient(135deg, #3dc7be 0%, #4fd1c7 100%)",
        warningGradient: "linear-gradient(135deg, #ffa21d 0%, #ffb84d 100%)",
        dangerGradient: "linear-gradient(135deg, #d13b4c 0%, #ef4444 100%)",
        glass: "rgba(255, 255, 255, 0.1)",
        glassBorder: "rgba(255, 255, 255, 0.2)",
    };

    useEffect(() => {
        if (vaccines.length === 0) {
            getVaccines();
        }
    }, [vaccines.length, getVaccines])

    useEffect(() => {
        getVaccineSchedules();
    }, []);

    // Filter schedules for this patient
    const patientSchedules = getSchedulesByPatient(patientId);

    const availableVaccines = vaccines.filter(vaccine =>
        vaccine.category === 'Vaccine' || vaccine.vaccine_type
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await scheduleVaccine({
                ...formData,
                patient_id: patientId
            });
            setShowScheduleForm(false);
            setFormData({
                vaccine_id: "",
                dose_number: "",
                schedule_date: "",
                status: "scheduled",
                notes: ""
            });
        } catch (error) {
            console.error("Error scheduling vaccine:", error);
        }
    };

    const handleStatusUpdate = async (scheduleId, newStatus) => {
        try {
            await updateVaccineScheduleStatus(scheduleId, {
                status: newStatus,
                notes: "Status updated"
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const getVaccineName = (vaccineId) => {
        const vaccine = vaccines.find(v => v.id === parseInt(vaccineId));
        return vaccine ? vaccine.name : `Vaccine #${vaccineId}`;
    };

    const handleDelete = async (scheduleId) => {
        if (window.confirm("Are you sure you want to delete this vaccine schedule?")) {
            try {
                await deleteVaccineSchedule(scheduleId);
            } catch (error) {
                console.error("Error deleting schedule:", error);
            }
        }
    };

    if (loading) {
        return <div style={{ padding: "20px", textAlign: "center" }}>Loading vaccine schedules...</div>;
    }

    return (
        <div style={{ padding: "0" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
            }}>
                <h3 style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: themeColors.textLight,
                    margin: 0
                }}>
                    Vaccine Schedule for {patientName}
                </h3>
                <button
                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                    style={{
                        background: themeColors.primary,
                        color: themeColors.white,
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        cursor: "pointer"
                    }}
                >
                    {showScheduleForm ? "Cancel" : "Schedule New Vaccine"}
                </button>
            </div>

            {showScheduleForm && (
                <div style={{
                    padding: "16px",
                    backgroundColor: themeColors.light,
                    borderRadius: "8px",
                    marginBottom: "16px"
                }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem" }}>Schedule New Vaccine</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>
                                Vaccine
                            </label>
                            <select
                                value={formData.vaccine_id}
                                onChange={(e) => setFormData({ ...formData, vaccine_id: e.target.value })}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: `1px solid ${themeColors.border}` }}
                            >
                                <option value="">Select Vaccine</option>
                                {availableVaccines.length > 0 ? (
                                    availableVaccines.map(vaccine => (
                                        <option key={vaccine.id} value={vaccine.id}>
                                            {vaccine.name} {vaccine.brand ? `(${vaccine.brand})` : ''}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Loading vaccines...</option>
                                )}
                            </select>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>
                                Dose Number
                            </label>
                            <input
                                type="number"
                                value={formData.dose_number}
                                onChange={(e) => setFormData({ ...formData, dose_number: e.target.value })}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: `1px solid ${themeColors.border}` }}
                            />
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>
                                Schedule Date
                            </label>
                            <input
                                type="date"
                                value={formData.schedule_date}
                                onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                                required
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: `1px solid ${themeColors.border}` }}
                            />
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: `1px solid ${themeColors.border}` }}
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="missed">Missed</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: `1px solid ${themeColors.border}`, minHeight: "60px" }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                background: themeColors.success,
                                color: themeColors.white,
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                cursor: "pointer"
                            }}
                        >
                            Schedule Vaccine
                        </button>
                    </form>
                </div>
            )}

            <div>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem" }}>
                    Scheduled Vaccines ({patientSchedules.length})
                </h4>

                {patientSchedules.length === 0 ? (
                    <div style={{
                        padding: "20px",
                        textAlign: "center",
                        color: themeColors.textLight,
                        backgroundColor: themeColors.light,
                        borderRadius: "8px"
                    }}>
                        No vaccine schedules found for this patient.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {patientSchedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                style={{
                                    padding: "12px",
                                    backgroundColor: themeColors.white,
                                    borderRadius: "8px",
                                    border: `1px solid ${themeColors.border}`,
                                    position: "relative"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                                            {getVaccineName(schedule.vaccine_id)} - Dose {schedule.dose_number}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: themeColors.textLight, marginBottom: "4px" }}>
                                            Scheduled: {new Date(schedule.schedule_date).toLocaleDateString()}
                                        </div>
                                        {schedule.notes && (
                                            <div style={{ fontSize: "0.8rem", color: themeColors.textLight }}>
                                                Notes: {schedule.notes}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                fontSize: "0.7rem",
                                                fontWeight: 500,
                                                backgroundColor:
                                                    schedule.status === "completed" ? themeColors.success :
                                                        schedule.status === "missed" ? themeColors.danger :
                                                            themeColors.info,
                                                color: themeColors.white
                                            }}
                                        >
                                            {schedule.status}
                                        </span>

                                        <select
                                            value={schedule.status}
                                            onChange={(e) => handleStatusUpdate(schedule.id, e.target.value)}
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                border: `1px solid ${themeColors.border}`,
                                                fontSize: "0.7rem"
                                            }}
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="completed">Completed</option>
                                            <option value="missed">Missed</option>
                                        </select>

                                        <button
                                            onClick={() => handleDelete(schedule.id)}
                                            style={{
                                                background: themeColors.danger,
                                                color: themeColors.white,
                                                border: "none",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "0.7rem",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaccineScheduleTab