import { FiClock, FiCalendar, FiUser, FiMapPin } from 'react-icons/fi'

const TabScheduleContent = ({ doctor }) => {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    const getDayStatus = (hours) => {
        if (hours.toLowerCase() === 'closed') return 'closed'
        return 'open'
    }

    return (
        <div className="tab-pane fade show active p-4" id="scheduleTab" role="tabpanel">
            <div className="row g-4">
                {/* Weekly Schedule */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiClock size={16} className="me-2 text-primary" />
                                Weekly Schedule
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Day</th>
                                            <th>Hours</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {daysOfWeek.map((day) => {
                                            const hours = doctor?.workingHours?.[day] || 'Not specified'
                                            const status = getDayStatus(hours)
                                            return (
                                                <tr key={day}>
                                                    <td>
                                                        <span className="text-capitalize fw-medium">{day}</span>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted">{hours}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${status === 'open' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {status === 'open' ? 'Open' : 'Closed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiCalendar size={16} className="me-2 text-success" />
                                Today's Schedule
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="text-center py-4">
                                <FiCalendar size={48} className="text-muted mb-3" />
                                <h6 className="text-muted">No appointments scheduled for today</h6>
                                <p className="text-muted fs-12">Check back later for updates</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiUser size={16} className="me-2 text-info" />
                                Upcoming Appointments
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="text-center py-4">
                                <FiUser size={48} className="text-muted mb-3" />
                                <h6 className="text-muted">No upcoming appointments</h6>
                                <p className="text-muted fs-12">All appointments are up to date</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Office Location */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiMapPin size={16} className="me-2 text-danger" />
                                Office Location
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-start">
                                        <div className="bg-light rounded-circle p-2 me-3 mt-1">
                                            <FiMapPin size={16} className="text-danger" />
                                        </div>
                                        <div>
                                            <h6 className="mb-2 fw-bold">Primary Office</h6>
                                            <p className="text-muted mb-2">
                                                {doctor?.address}<br />
                                                {doctor?.city}, {doctor?.state} {doctor?.zipCode}
                                            </p>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-sm btn-outline-primary">
                                                    <FiMapPin size={14} className="me-1" />
                                                    Get Directions
                                                </button>
                                                <button className="btn btn-sm btn-outline-secondary">
                                                    <FiCalendar size={14} className="me-1" />
                                                    Book Appointment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="bg-light rounded p-3 text-center">
                                        <h6 className="mb-2 fw-bold">Office Hours</h6>
                                        <p className="text-muted fs-12 mb-0">
                                            Monday - Friday<br />
                                            9:00 AM - 5:00 PM
                                        </p>
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

export default TabScheduleContent 