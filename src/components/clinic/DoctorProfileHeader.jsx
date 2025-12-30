import { FiEdit3, FiStar, FiEye, FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import topTost from '@/utils/topTost'

const DoctorProfileHeader = ({ doctor, loading, onEditClick }) => {
    const navigate = useNavigate()

    const handleClick = () => {
        topTost()
    }

    if (loading) {
        return (
            <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                <div className="btn btn-icon btn-light-brand disabled">
                    <FiStar size={16} />
                </div>
                <div className="btn btn-icon btn-light-brand disabled">
                    <FiEye size={16} className='me-2' />
                    <span>Follow</span>
                </div>
                <div className="btn btn-primary disabled">
                    <FiEdit3 size={16} className='me-2' />
                    <span>Edit Doctor</span>
                </div>
            </div>
        )
    }

    return (
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
            <button 
                className="btn btn-icon btn-light-secondary"
                onClick={() => navigate('/clinic/doctors')}
                title="Back to Doctors List"
            >
                <FiArrowLeft size={16} />
            </button>
            {/* <a href="#" className="btn btn-icon btn-light-brand" onClick={handleClick}>
                <FiStar size={16} />
            </a>
            <a href="#" className="btn btn-icon btn-light-brand">
                <FiEye size={16} className='me-2' />
                <span>Follow</span>
            </a> */}
            <button 
                className="btn btn-primary"
                onClick={() => onEditClick(doctor)}
            >
                <FiEdit3 size={16} className='me-2' />
                <span>Edit Doctor</span>
            </button>
        </div>
    )
}

export default DoctorProfileHeader 