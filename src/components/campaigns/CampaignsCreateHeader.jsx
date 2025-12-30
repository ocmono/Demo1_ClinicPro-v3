import React from 'react'
import { FiLayers, FiUserPlus, FiList } from 'react-icons/fi'
import { Link } from 'react-router-dom';
import topTost from '@/utils/topTost';

const CampaignsCreateHeader = () => {
  const handleClick = () => {
    topTost()
};

  return (
    <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
      {/* <a href="#" className="btn btn-light-brand " onClick={handleClick}>
        <FiLayers size={16} className='me-2'/>
        <span>Save as Draft</span>
      </a> */}
      <Link to="/leads/campaigns" className="btn btn-primary">
        <FiList size={16} className='me-2' />
        <span>View All Campaign</span>
      </Link>
    </div>
  )
}

export default CampaignsCreateHeader