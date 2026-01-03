import React from "react";

const PatientDetailsSidebar = React.memo(({ patient }) => {
  console.log(patient);
  
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    try {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      
      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();
      let days = today.getDate() - dob.getDate();
      
      // Adjust for negative days
      if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
      }
      
      // Adjust for negative months
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // If age is 1 year or more, show in years and months
      if (years >= 1) {
        const monthsText = months === 0 ? '' : months === 1 ? '1 month' : `${months} months`;
        const yearsText = years === 1 ? '1 year' : `${years} years`;
        return months === 0 ? yearsText : `${yearsText} ${monthsText}`;
      }
      
      // If age is less than 1 year, show in months and days
      const monthsText = months === 0 ? '' : months === 1 ? '1 month' : `${months} months`;
      const daysText = days === 0 ? '' : days === 1 ? '1 day' : `${days} days`;
      
      if (months === 0 && days === 0) {
        return '0 days';
      }
      if (months === 0) {
        return daysText;
      }
      if (days === 0) {
        return monthsText;
      }
      return `${monthsText} ${daysText}`;
    } catch (error) {
      return "N/A";
    }
  };

  if (!patient) {
    return (
      <div className="text-center text-muted py-4">
        <small>No patient selected</small>
      </div>
    );
  }

  return (
    <div className="patient-details text-muted fs-14 ">
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Patient ID</span>
        <span>{patient.patientId || patient.id || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Name</span>
        <span>{patient.patientName || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Email</span>
        <span>{patient.patientEmail || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Contact</span>
        <span>{patient.patientPhone || "N/A"}</span>
      </div>
      <hr  className="my-2"/>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Age</span>
        <span>{calculateAge(patient.patientdob)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Gender</span>
        <span>{patient.gender || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Blood Group</span>
        <span>{patient.bloodGroup || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Weight</span>
        <span>{patient.weight || "N/A"}</span>
      </div>
      <hr  className="my-2"/>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Doctor</span>
        <span>{patient.doctor || "N/A"}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Speciality</span>
        <span>
          {Array.isArray(patient?.doctorSpeciality) ? 
          patient.doctorSpeciality.join(', ') : patient?.doctorSpeciality || 'N/A'}
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-semibold">Appointment</span>
        <span>
          {patient.appointment_date || "N/A"}{" "}
          {patient.appointment_time && `• ${patient.appointment_time}`}
        </span>
      </div>
      <hr  className="my-2"/>
      <div>
        <span className="fw-semibold">Address</span>
        <div>{patient.address || "N/A"}</div>
      </div>
      <div className="mt-2">
        <span className="fw-semibold">Allergies</span>
        <div>{patient.allergies || "None reported"}</div>
      </div>
      <div className="mt-2">
        <span className="fw-semibold">Source</span>
        <div>{patient.source || "N/A"}</div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if patient ID changes
  return prevProps.patient?.id === nextProps.patient?.id;
});

PatientDetailsSidebar.displayName = 'PatientDetailsSidebar';
export default PatientDetailsSidebar;