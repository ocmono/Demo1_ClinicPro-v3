import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiPlus, FiBarChart2, FiSettings, FiUpload, FiMoreHorizontal } from 'react-icons/fi';
import Dropdown from '@/components/shared/Dropdown';

const LeadsHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLeadsPage = location.pathname === '/leads/all-leads';

  const quickActions = [
    { 
      label: 'Analytics & Reports', 
      icon: <FiBarChart2 />, 
      onClick: () => navigate('/leads/analytics')
    },
    { 
      label: 'Automated Workflows', 
      icon: <FiSettings />, 
      onClick: () => navigate('/leads/workflows')
    },
    { 
      label: 'Import/Export', 
      icon: <FiUpload />, 
      onClick: () => navigate('/leads/import-export')
    }
  ];

  return (
    <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
      {location.pathname === '/leads/add-lead' && (
        <Link to="/leads/all-leads" className="btn btn-primary">
          <FiPlus size={16} className="me-2" />
          <span>View All Leads</span>
        </Link>
      )}
      {isLeadsPage && (
        <>
          <Link to="/leads/add-lead" className="btn btn-primary">
            <FiPlus size={16} className="me-2" />
            <span>New Lead</span>
          </Link>
          <Dropdown
            dropdownItems={quickActions}
            triggerClass="btn btn-outline-primary"
            triggerIcon={<FiMoreHorizontal size={29} />}
          />
        </>
      )}
    </div>
  );
};

export default LeadsHeader;