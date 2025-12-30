import React from 'react';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const VaccineCreateHeader = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
                <button
                    className="btn btn-outline-secondary me-3"
                    onClick={() => navigate('/vaccines/dashboard')}
                >
                    <FiArrowLeft size={16} />
                </button>
            </div>
        </div>
    );
};

export default VaccineCreateHeader;