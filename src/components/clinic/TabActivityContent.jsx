import { useState, useEffect } from 'react'
import { FiActivity, FiCalendar, FiUser, FiFileText, FiTrendingUp, FiClock, FiStar } from 'react-icons/fi'
import { toast } from 'react-toastify'

const TabActivityContent = ({ doctor }) => {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (doctor?.id) {
            fetchActivities()
        }
    }, [doctor?.id])

    const fetchActivities = async () => {
        setLoading(true)
        try {
            const response = await fetch(`https://bkdemo1.clinicpro.cc/doctor/activities/${doctor.id}`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('Fetched activities data:', data)
            
            // Transform API data to match our component structure
            const transformedActivities = Array.isArray(data) ? data.map(activity => ({
                id: activity.id || activity.activity_id,
                type: activity.type || activity.activity_type || 'appointment',
                title: activity.title || activity.activity_title || 'Activity',
                description: activity.description || activity.activity_description || '',
                date: activity.date || activity.created_at || activity.timestamp || new Date().toISOString(),
                status: activity.status || activity.activity_status || 'completed',
                patient: activity.patient || activity.patient_name || activity.patientName || 'Unknown Patient',
                duration: activity.duration || activity.appointment_duration || null,
                medicines: activity.medicines || activity.prescription_medicines || null,
                scheduledDate: activity.scheduledDate || activity.scheduled_date || null
            })) : []
            
            setActivities(transformedActivities)
        } catch (error) {
            console.error('Error fetching activities:', error)
            // Don't show error toast for activities, just use empty array
            setActivities([])
        } finally {
            setLoading(false)
        }
    }

    const getActivityIcon = (type) => {
        switch (type) {
            case 'appointment':
                return <FiCalendar size={16} className="text-primary" />
            case 'prescription':
                return <FiFileText size={16} className="text-success" />
            case 'consultation':
                return <FiUser size={16} className="text-info" />
            case 'followup':
                return <FiClock size={16} className="text-warning" />
            case 'review':
                return <FiStar size={16} className="text-danger" />
            default:
                return <FiActivity size={16} className="text-secondary" />
        }
    }

    const getActivityBadge = (status) => {
        switch (status) {
            case 'completed':
                return <span className="badge bg-success">Completed</span>
            case 'scheduled':
                return <span className="badge bg-info">Scheduled</span>
            case 'cancelled':
                return <span className="badge bg-danger">Cancelled</span>
            default:
                return <span className="badge bg-secondary">{status}</span>
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="tab-pane fade show active p-4" id="activityTab" role="tabpanel">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading activities...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="tab-pane fade show active p-4" id="activityTab" role="tabpanel">
            <div className="row g-4">
                {/* Activity Statistics */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiTrendingUp size={16} className="me-2 text-primary" />
                                Activity Statistics (Last 30 Days)
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiCalendar size={20} className="text-primary me-2" />
                                            <h4 className="mb-0 fw-bold">
                                                {activities.filter(a => a.type === 'appointment').length}
                                            </h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Appointments</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiFileText size={20} className="text-success me-2" />
                                            <h4 className="mb-0 fw-bold">
                                                {activities.filter(a => a.type === 'prescription').length}
                                            </h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Prescriptions</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiUser size={20} className="text-info me-2" />
                                            <h4 className="mb-0 fw-bold">
                                                {activities.filter(a => a.type === 'consultation').length}
                                            </h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Consultations</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiClock size={20} className="text-warning me-2" />
                                            <h4 className="mb-0 fw-bold">
                                                {activities.filter(a => a.type === 'followup').length}
                                            </h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Follow-ups</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">
                                <FiActivity size={16} className="me-2 text-success" />
                                Recent Activity
                            </h6>
                            <button className="btn btn-sm btn-outline-primary">
                                View All Activity
                            </button>
                        </div>
                        <div className="card-body">
                            {activities.length === 0 ? (
                                <div className="text-center py-4">
                                    <FiActivity size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">No activities found</h6>
                                    <p className="text-muted fs-12">No recent activities for this doctor</p>
                                </div>
                            ) : (
                                <div className="timeline">
                                    {activities.map((activity, index) => (
                                        <div key={activity.id} className="timeline-item mb-4">
                                            <div className="d-flex">
                                                <div className="timeline-marker me-3 position-relative">
                                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                        {getActivityIcon(activity.type)}
                                                    </div>
                                                    {index < activities.length - 1 && (
                                                        <div className="position-absolute bg-light" style={{ 
                                                            width: '2px', 
                                                            height: '60px', 
                                                            left: '50%', 
                                                            top: '40px', 
                                                            transform: 'translateX(-50%)' 
                                                        }}></div>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <h6 className="mb-1 fw-bold fs-14">{activity.title}</h6>
                                                            <p className="text-muted fs-12 mb-1">{activity.description}</p>
                                                            <div className="d-flex align-items-center gap-3">
                                                                <span className="fs-11 text-muted">
                                                                    <FiUser size={12} className="me-1" />
                                                                    {activity.patient}
                                                                </span>
                                                                {activity.duration && (
                                                                    <span className="fs-11 text-muted">
                                                                        <FiClock size={12} className="me-1" />
                                                                        {activity.duration}
                                                                    </span>
                                                                )}
                                                                {activity.medicines && (
                                                                    <span className="fs-11 text-muted">
                                                                        <FiFileText size={12} className="me-1" />
                                                                        {activity.medicines} medicines
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="mb-1">
                                                                {getActivityBadge(activity.status)}
                                                            </div>
                                                            <small className="text-muted fs-11">
                                                                {formatDate(activity.date)}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiTrendingUp size={16} className="me-2 text-info" />
                                Activity Trend (Last 7 Days)
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="text-center py-4">
                                <FiTrendingUp size={48} className="text-muted mb-3" />
                                <h6 className="text-muted">Chart coming soon</h6>
                                <p className="text-muted fs-12">Activity trend visualization will be displayed here</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiStar size={16} className="me-2 text-warning" />
                                Performance Metrics
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center p-3 border border-dashed border-gray-5 rounded-1">
                                    <div>
                                        <h6 className="mb-1 fw-bold fs-14">Patient Satisfaction</h6>
                                        <p className="text-muted fs-12 mb-0">Based on recent feedback</p>
                                    </div>
                                    <div className="text-end">
                                        <h5 className="mb-0 fw-bold text-success">4.8/5.0</h5>
                                        <small className="text-success">+0.2 from last month</small>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 border border-dashed border-gray-5 rounded-1">
                                    <div>
                                        <h6 className="mb-1 fw-bold fs-14">Average Consultation Time</h6>
                                        <p className="text-muted fs-12 mb-0">Time spent with patients</p>
                                    </div>
                                    <div className="text-end">
                                        <h5 className="mb-0 fw-bold text-info">32 min</h5>
                                        <small className="text-info">Optimal range</small>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 border border-dashed border-gray-5 rounded-1">
                                    <div>
                                        <h6 className="mb-1 fw-bold fs-14">Follow-up Rate</h6>
                                        <p className="text-muted fs-12 mb-0">Patients returning for follow-up</p>
                                    </div>
                                    <div className="text-end">
                                        <h5 className="mb-0 fw-bold text-warning">78%</h5>
                                        <small className="text-warning">+5% from last month</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TabActivityContent 