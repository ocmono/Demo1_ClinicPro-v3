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

const MedicineHeadr = () => {
  const location = useLocation();

  const isOnAddPage = location.pathname.includes("/inventory/products/product-create");

  return (
    <>
      <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
        {/* <a href="#" className="btn btn-icon btn-light-brand" data-bs-toggle="collapse" data-bs-target="#collapseOne">
          <FiBarChart size={16} strokeWidth={1.6} />
        </a>
        <Dropdown
          dropdownItems={filterAction}
          triggerPosition={"0, 12"}
          triggerIcon={<FiFilter size={16} strokeWidth={1.6} />}
          triggerClass='btn btn-icon btn-light-brand'
          isAvatar={false}
        />
        <Dropdown
          dropdownItems={fileType}
          triggerPosition={"0, 12"}
          triggerIcon={<FiPaperclip size={16} strokeWidth={1.6} />}
          triggerClass='btn btn-icon btn-light-brand'
          iconStrokeWidth={0}
          isAvatar={false}
        /> */}

        {isOnAddPage ? (
          <Link to="/medicines/all-medicines" className="btn btn-primary">
            <FiList size={16} className='me-2' />
            <span>View All Medicines</span>
          </Link>
        ) : (
            <Link to="/inventory/products/product-create" className="btn btn-primary">
            <FiPlus size={16} className='me-2' />
            <span>Add Medicine</span>
          </Link>
        )}
      </div>
    </>
  );
};

export default MedicineHeadr;
