/**
 * Action Types for Template Management
 * These actions trigger automatic message sending
 */

export const ACTION_TYPES = {
  // Appointment Actions
  APPOINTMENT_BOOKED: 'appointment_booked',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  
  // Prescription Actions
  PRESCRIPTION_CREATED: 'prescription_created',
  PRESCRIPTION_READY: 'prescription_ready',
  PRESCRIPTION_DISPENSED: 'prescription_dispensed',
  
  // Patient Actions
  PATIENT_REGISTERED: 'patient_registered',
  PATIENT_UPDATED: 'patient_updated',
  
  // Payment Actions
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_OVERDUE: 'payment_overdue',
  
  // Vaccine Actions
  VACCINE_SCHEDULED: 'vaccine_scheduled',
  VACCINE_REMINDER: 'vaccine_reminder',
  VACCINE_DUE: 'vaccine_due',
  
  // Follow-up Actions
  FOLLOW_UP_REMINDER: 'follow_up_reminder',
  TEST_RESULTS_READY: 'test_results_ready',
  
  // General
  CUSTOM: 'custom',
};

export const ACTION_TYPE_LABELS = {
  [ACTION_TYPES.APPOINTMENT_BOOKED]: 'Appointment Booked',
  [ACTION_TYPES.APPOINTMENT_CONFIRMED]: 'Appointment Confirmed',
  [ACTION_TYPES.APPOINTMENT_REMINDER]: 'Appointment Reminder',
  [ACTION_TYPES.APPOINTMENT_CANCELLED]: 'Appointment Cancelled',
  [ACTION_TYPES.APPOINTMENT_RESCHEDULED]: 'Appointment Rescheduled',
  [ACTION_TYPES.APPOINTMENT_COMPLETED]: 'Appointment Completed',
  [ACTION_TYPES.PRESCRIPTION_CREATED]: 'Prescription Created',
  [ACTION_TYPES.PRESCRIPTION_READY]: 'Prescription Ready',
  [ACTION_TYPES.PRESCRIPTION_DISPENSED]: 'Prescription Dispensed',
  [ACTION_TYPES.PATIENT_REGISTERED]: 'Patient Registered',
  [ACTION_TYPES.PATIENT_UPDATED]: 'Patient Updated',
  [ACTION_TYPES.PAYMENT_RECEIVED]: 'Payment Received',
  [ACTION_TYPES.PAYMENT_PENDING]: 'Payment Pending',
  [ACTION_TYPES.PAYMENT_OVERDUE]: 'Payment Overdue',
  [ACTION_TYPES.VACCINE_SCHEDULED]: 'Vaccine Scheduled',
  [ACTION_TYPES.VACCINE_REMINDER]: 'Vaccine Reminder',
  [ACTION_TYPES.VACCINE_DUE]: 'Vaccine Due',
  [ACTION_TYPES.FOLLOW_UP_REMINDER]: 'Follow-up Reminder',
  [ACTION_TYPES.TEST_RESULTS_READY]: 'Test Results Ready',
  [ACTION_TYPES.CUSTOM]: 'Custom (Manual)',
};

export const ACTION_TYPE_OPTIONS = Object.keys(ACTION_TYPE_LABELS).map(key => ({
  value: key,
  label: ACTION_TYPE_LABELS[key],
}));

// Template variables available for each action type
export const ACTION_VARIABLES = {
  [ACTION_TYPES.APPOINTMENT_BOOKED]: [
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'doctor_name', label: 'Doctor Name' },
    { key: 'appointment_date', label: 'Appointment Date' },
    { key: 'appointment_time', label: 'Appointment Time' },
    { key: 'appointment_type', label: 'Appointment Type' },
  ],
  [ACTION_TYPES.APPOINTMENT_REMINDER]: [
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'doctor_name', label: 'Doctor Name' },
    { key: 'appointment_date', label: 'Appointment Date' },
    { key: 'appointment_time', label: 'Appointment Time' },
  ],
  [ACTION_TYPES.PRESCRIPTION_READY]: [
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'prescription_id', label: 'Prescription ID' },
    { key: 'doctor_name', label: 'Doctor Name' },
  ],
  [ACTION_TYPES.PATIENT_REGISTERED]: [
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'patient_id', label: 'Patient ID' },
  ],
  [ACTION_TYPES.PAYMENT_RECEIVED]: [
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'payment_id', label: 'Payment ID' },
  ],
  [ACTION_TYPES.VACCINE_REMINDER]: [
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'vaccine_name', label: 'Vaccine Name' },
    { key: 'due_date', label: 'Due Date' },
  ],
};

export default {
  ACTION_TYPES,
  ACTION_TYPE_LABELS,
  ACTION_TYPE_OPTIONS,
  ACTION_VARIABLES,
};


