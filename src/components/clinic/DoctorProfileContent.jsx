import { useState } from 'react'
import { FiEdit, FiMail, FiMapPin, FiPhone, FiAward, FiClock, FiCalendar, FiUser, FiTrendingUp, FiActivity, FiStar } from 'react-icons/fi'
import { BsPatchCheckFill } from 'react-icons/bs'
import DoctorProfileCard from './DoctorProfileCard'
import TabOverviewContent from './TabOverviewContent'
import TabScheduleContent from './TabScheduleContent'
import TabPatientsContent from './TabPatientsContent'
import TabActivityContent from './TabActivityContent'

const DoctorProfileContent = ({ doctor, onEditClick }) => {
    const [activeTab, setActiveTab] = useState('overview')

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiUser },
        { id: 'schedule', label: 'Schedule', icon: FiCalendar },
        { id: 'patients', label: 'Patients', icon: FiUser },
        { id: 'activity', label: 'Activity', icon: FiActivity }
    ]

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <TabOverviewContent doctor={doctor} />
            case 'schedule':
                return <TabScheduleContent doctor={doctor} />
            case 'patients':
                return <TabPatientsContent doctor={doctor} />
            case 'activity':
                return <TabActivityContent doctor={doctor} />
            default:
                return <TabOverviewContent doctor={doctor} />
        }
    }

    return (
        <>
            <div className="col-xxl-4 col-xl-6">
                <DoctorProfileCard doctor={doctor} onEditClick={onEditClick} />
            </div>
            <div className="col-xxl-8 col-xl-6">
                <div className="card border-top-0">
                    <div className="card-header p-0">
                        <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="doctorTab" role="tablist">
                            {tabs.map((tab) => {
                                return (
                                    <li className="nav-item flex-fill border-top" role="presentation" key={tab.id}>
                                        <a
                                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab.id)}
                                            type="button"
                                        >
                                            {tab.label}
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="tab-content">
                        <div className="tab-pane fade show active">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DoctorProfileContent 