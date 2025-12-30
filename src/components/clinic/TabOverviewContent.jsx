import { FiAward, FiClock, FiCalendar, FiUser, FiTrendingUp, FiActivity, FiStar, FiMapPin, FiMail } from 'react-icons/fi'

const TabOverviewContent = ({ doctor }) => {
    return (
        <div className="tab-pane fade show active p-4" id="overviewTab" role="tabpanel">
            <div className="row g-4">
                {/* Bio Section */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiUser size={16} className="me-2 text-primary" />
                                Biography
                            </h6>
                        </div>
                        <div className="card-body">
                            <p className="text-muted mb-0">
                                {doctor?.bio || "No biography available for this doctor."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Education Section */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none h-100">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiAward size={16} className="me-2 text-success" />
                                Education
                            </h6>
                        </div>
                        <div className="card-body">
                            {doctor?.education?.length > 0 ? (
                                <div className="timeline">
                                    {doctor.education.map((edu, index) => (
                                        <div key={index} className="timeline-item mb-3">
                                            <div className="d-flex">
                                                <div className="timeline-marker bg-success rounded-circle me-3" style={{ width: '12px', height: '12px', marginTop: '4px' }}></div>
                                                <div>
                                                    <h6 className="mb-1 fw-bold fs-14">{edu.degree}</h6>
                                                    <p className="mb-1 text-muted fs-12">{edu.institution}</p>
                                                    <span className="badge bg-light text-dark fs-11">{edu.year}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted fs-12">No education information available.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Certifications Section */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none h-100">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiAward size={16} className="me-2 text-warning" />
                                Certifications
                            </h6>
                        </div>
                        <div className="card-body">
                            {doctor?.certifications?.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                    {doctor.certifications.map((cert, index) => (
                                        <div key={index} className="d-flex align-items-center">
                                            <div className="bg-warning rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                                            <span className="fs-12">{cert}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted fs-12">No certifications available.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiTrendingUp size={16} className="me-2 text-info" />
                                Performance Statistics
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiCalendar size={20} className="text-primary me-2" />
                                            <h4 className="mb-0 fw-bold">{doctor?.appointments || 0}</h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Total Appointments</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiUser size={20} className="text-success me-2" />
                                            <h4 className="mb-0 fw-bold">{doctor?.patients || 0}</h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Total Patients</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiStar size={20} className="text-warning me-2" />
                                            <h4 className="mb-0 fw-bold">{doctor?.rating || 4.5}</h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Average Rating</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiClock size={20} className="text-info me-2" />
                                            <h4 className="mb-0 fw-bold">{doctor?.experience || 0}</h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Years Experience</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Details Section */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiMapPin size={16} className="me-2 text-danger" />
                                Contact Details
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="bg-light rounded-circle p-2 me-3">
                                            <FiMail size={16} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="mb-1 fw-bold fs-12">Email Address</p>
                                            <a href={`mailto:${doctor?.email}`} className="text-muted text-decoration-none fs-12">
                                                {doctor?.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="bg-light rounded-circle p-2 me-3">
                                            <FiMapPin size={16} className="text-danger" />
                                        </div>
                                        <div>
                                            <p className="mb-1 fw-bold fs-12">Office Address</p>
                                            <p className="text-muted mb-0 fs-12">
                                                {doctor?.address}<br />
                                                {doctor?.city}, {doctor?.state} {doctor?.zipCode}
                                            </p>
                                        </div>
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

export default TabOverviewContent 