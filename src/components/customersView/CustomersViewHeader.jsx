import React from 'react'
import { FiEye, FiPlus, FiStar, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import topTost from '@/utils/topTost';
import { useNavigate } from 'react-router-dom';

const CustomersViewHeader = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        topTost()
    };
    const handleBack = () => {
        navigate('/settings/clinic');
    };
    return (
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
            {/* <a href="#" className="btn btn-icon btn-light-brand" onClick={handleClick}>
                <FiStar size={16} />
            </a>
            <a href="#" className="btn btn-icon btn-light-brand">
                <FiEye size={16} className='me-2' />
                <span>Follow</span>
            </a> */}
            <button
                className="btn btn-icon btn-light"
                onClick={handleBack}
            >
                <FiArrowLeft size={15} />
            </button>
            <Link to="/settings/clinic" className="btn btn-primary">
                <FiPlus size={16} className='me-2' />
                <span>Create Profile</span>
            </Link>
        </div>
    )
}

export default CustomersViewHeader