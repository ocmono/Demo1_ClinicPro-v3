import React from 'react';

const PatientsViewHeader = ({ title = 'Patient Details', children }) => {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <h2 className="page-title mb-0">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default PatientsViewHeader; 