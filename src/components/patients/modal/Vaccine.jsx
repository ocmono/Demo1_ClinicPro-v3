import React from 'react';
import VaccineScheduleTab from "../../vaccine/VaccineScheduleTab";

const Vaccine = ({ patientId, patientName }) => {
  return (
    <VaccineScheduleTab patientId={patientId} patientName={patientName} />
  );
};

export default Vaccine;