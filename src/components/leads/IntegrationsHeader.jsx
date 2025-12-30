import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const IntegrationsHeader = () => {
    return (
        <>
            <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                <Link to="/leads/all-leads" className="btn btn-light">
                    <FiArrowLeft size={16} className='me-2' />
                    <span>Back to Leads</span>
                </Link>
            </div>
        </>
    );
};

export default IntegrationsHeader;


