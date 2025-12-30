import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiList, FiPlus } from 'react-icons/fi';

const PatientsCreateHeader = ({ title = 'Add Patient', children }) => {
  const location = useLocation();

  return (
    <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          {location.pathname === '/patients/add-patient' && (
            <Link to="/patients/all-patients" className="btn btn-primary">
              <FiList size={16} className="me-2" />
              <span>View All Patients</span>
            </Link>
          )}
          {location.pathname === '/patients/all-patients' && (
            <Link to="/patients/add-patient" className="btn btn-primary">
              <FiPlus size={16} className="me-2" />
              <span>New Patient</span>
            </Link>
          )}
  </div>
  );
};

export default PatientsCreateHeader; 