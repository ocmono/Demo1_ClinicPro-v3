import React from 'react';
import { format } from "date-fns";
import { FiInfo } from "react-icons/fi";
import CustomDatePicker from '../shared/CustomCalendar';

const FollowUpSection = ({ prescriptionFormData, errors, doctorBufferDates, onFieldChange, validateFollowUpDate }) => {
    const getAvailabilityStatus = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + doctorBufferDates.startBufferDate);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + doctorBufferDates.endBufferDate);
        return date >= minDate && date <= maxDate;
    };

    const getMonthAvailabilityStatus = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + doctorBufferDates.startBufferDate);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + doctorBufferDates.endBufferDate);

        return date >= minDate && date <= maxDate;
    };

    const isDateSelected = (days) => {
        if (!prescriptionFormData.followUpDate) return false;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        return prescriptionFormData.followUpDate === targetDate.toISOString().split('T')[0];
    };

    const isMonthSelected = () => {
        if (!prescriptionFormData.followUpDate) return false;
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 1);
        return prescriptionFormData.followUpDate === targetDate.toISOString().split('T')[0];
    };
    return (
        <>
            <hr className="my-0 border-dashed" />
            <div className="px-4 pt-3 clearfix proposal-table" >
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <div>
                        <h6 className="fw-bold">Follow Up Date</h6>
                    </div>
                    <div className="avatar-text avatar-sm" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Informations">
                        <FiInfo />
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div style={{ minWidth: '70%' }}>
                        <CustomDatePicker
                            selected={prescriptionFormData.followUpDate ? new Date(prescriptionFormData.followUpDate) : null}
                            onChange={(date) => {
                                const dateString = format(date, 'yyyy-MM-dd');
                                if (validateFollowUpDate(dateString)) {
                                    onFieldChange("followUpDate", dateString);
                                }
                            }}
                            startBufferDate={doctorBufferDates.startBufferDate} // Can't select dates before tomorrow
                            endBufferDate={doctorBufferDates.endBufferDate} // Can select up to 1 year from today
                            placeholder="Select follow-up date"
                            className={errors.followUpDate ? 'is-invalid' : ''}
                        />
                        {errors.followUpDate && (
                            <p className="input-error text-danger mt-2">{errors.followUpDate}</p>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className={`btn ${isDateSelected(3)
                                ? 'btn-primary'
                                : getAvailabilityStatus(3)
                                    ? 'btn-outline-primary'
                                    : 'btn-outline-secondary'
                                }`}
                            onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 3);
                                onFieldChange("followUpDate", date.toISOString().split('T')[0]);
                            }}
                            disabled={!getAvailabilityStatus(3)}
                            title={
                                isDateSelected(3)
                                    ? 'Currently selected: 3 days from today'
                                    : getAvailabilityStatus(3)
                                        ? 'Set follow-up to 3 days from today'
                                        : 'Doctor not available on this date'
                            }
                        >
                            3 Days
                        </button>
                        <button
                            type="button"
                            className={`btn ${isDateSelected(7)
                                ? 'btn-primary'
                                : getAvailabilityStatus(7)
                                    ? 'btn-outline-primary'
                                    : 'btn-outline-secondary'
                                }`}
                            onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 7);
                                onFieldChange("followUpDate", date.toISOString().split('T')[0]);
                            }}
                            disabled={!getAvailabilityStatus(7)}
                            title={
                                isDateSelected(7)
                                    ? 'Currently selected: 7 days from today'
                                    : getAvailabilityStatus(7)
                                        ? 'Set follow-up to 7 days from today'
                                        : 'Doctor not available on this date'
                            }
                        >
                            7 Days
                        </button>
                        <button
                            type="button"
                            className={`btn  ${isDateSelected(15)
                                ? 'btn-primary'
                                : getAvailabilityStatus(15)
                                    ? 'btn-outline-primary'
                                    : 'btn-outline-secondary'
                                }`}
                            onClick={() => {
                                const date = new Date();
                                date.setDate(date.getDate() + 15);
                                onFieldChange("followUpDate", date.toISOString().split('T')[0]);
                            }}
                            disabled={!getAvailabilityStatus(15)}
                            title={
                                isDateSelected(15)
                                    ? 'Currently selected: 15 days from today'
                                    : getAvailabilityStatus(15)
                                        ? 'Set follow-up to 15 days from today'
                                        : 'Doctor not available on this date'
                            }
                        >
                            15 Days
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${isMonthSelected()
                                ? 'btn-primary'
                                : getMonthAvailabilityStatus()
                                    ? 'btn-outline-primary'
                                    : 'btn-outline-secondary'
                                }`}
                            onClick={() => {
                                const date = new Date();
                                date.setMonth(date.getMonth() + 1);
                                onFieldChange("followUpDate", date.toISOString().split('T')[0]);
                            }}
                            disabled={!getMonthAvailabilityStatus()}
                            title={
                                isMonthSelected()
                                    ? 'Currently selected: 1 month from today'
                                    : getMonthAvailabilityStatus()
                                        ? 'Set follow-up to 1 month from today'
                                        : 'Doctor not available on this date'
                            }
                        >
                            1 Month
                        </button>
                    </div>
                </div>
                {errors.followUpDate && (
                    <p className="input-error text-danger mt-2">{errors.followUpDate}</p>
                )}
            </div>
        </>
    )
}

export default FollowUpSection