import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiArchive, FiBarChart, FiBell, FiBookOpen, FiBriefcase,
  FiCheck, FiEye, FiFilter, FiPaperclip, FiPlus, FiSend,
  FiShield, FiUser, FiWifiOff, FiList
} from 'react-icons/fi';
import {
  BsFiletypeCsv, BsFiletypeExe, BsFiletypePdf,
  BsFiletypeTsx, BsFiletypeXml, BsPrinter
} from 'react-icons/bs';
import Dropdown from '@/components/shared/Dropdown';

export const filterAction = [
  { label: "All", icon: <FiEye /> },
  { label: "Sent", icon: <FiSend /> },
  { label: "Open", icon: <FiBookOpen /> },
  { label: "Draft", icon: <FiArchive /> },
  { label: "Revised", icon: <FiBell /> },
  { label: "Declined", icon: <FiShield /> },
  { label: "Accepted", icon: <FiCheck /> },
  { label: "Leads", icon: <FiBriefcase /> },
  { label: "Expired", icon: <FiWifiOff /> },
  { label: "Customers", icon: <FiUser /> },
];

export const fileType = [
  { label: "PDF", icon: <BsFiletypePdf /> },
  { label: "CSV", icon: <BsFiletypeCsv /> },
  { label: "XML", icon: <BsFiletypeXml /> },
  { label: "Text", icon: <BsFiletypeTsx /> },
  { label: "Excel", icon: <BsFiletypeExe /> },
  { label: "Print", icon: <BsPrinter /> },
];

const VaccineHeadr = () => {
  const location = useLocation();

  const isOnAddPage = location.pathname.includes("/vaccine/add-vaccines") || location.pathname.includes("/vaccine/add-patient-vaccine");

  return (
    <>
      <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
        {isOnAddPage ? (
          <>
          <Link to="/vaccine/all-vaccines" className="btn btn-primary">
            <FiList size={16} className='me-2' />
            <span>View All Vaccines</span>
          </Link>
          
           <Link to="/vaccine/all-vaccinated-patient" className="btn btn-primary">
            <FiList size={16} className='me-2' />
            <span>View All Patients</span>
          </Link>
          </>
        ) : (
            <>
            <Link to="/vaccine/add-patient-vaccine" className="btn btn-primary">
              <FiPlus size={16} className='me-2' />
              <span>Add Patient</span>
            </Link>
            <Link to="/vaccine/add-vaccines" className="btn btn-primary">
              <FiPlus size={16} className='me-2' />
              <span>Add Vaccine</span>
            </Link>
            </>
        )}
      </div>
    </>
  );
};

export default VaccineHeadr;
