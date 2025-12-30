import { FiEdit3, FiMail, FiMapPin, FiPhone, FiAward, FiClock, FiCalendar, FiUser, FiTrendingUp, FiActivity, FiStar } from 'react-icons/fi'
import { BsPatchCheckFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

const DoctorProfileCard = ({ doctor, onEditClick }) => {
    const navigate = useNavigate()
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <span className="badge bg-success">Active</span>
            case 'inactive':
                return <span className="badge bg-secondary">Inactive</span>
            case 'on leave':
                return <span className="badge bg-warning">On Leave</span>
            default:
                return <span className="badge bg-success">Active</span>
        }
    }

    const getSpecialtyBadge = (specialty) => {
        const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary']
        const color = colors[Math.floor(Math.random() * colors.length)]
        return <span className={`badge bg-${color}`}>{specialty}</span>
    }

    return (
        <div className="card stretch stretch-full">
            <div className="card-body">
                <div className="mb-4 text-center">
                    <div className="wd-150 ht-150 mx-auto mb-3 position-relative">
                        <div className="avatar-image wd-150 ht-150 border border-5 border-gray-3">
                            <div className="avatar-title bg-primary rounded-circle w-100 h-100 d-flex align-items-center justify-content-center text-white" style={{ fontSize: '3rem' }}>
                                {doctor?.name?.charAt(0) || 'D'}
                            </div>
                        </div>
                        <div className="wd-10 ht-10 text-success rounded-circle position-absolute translate-middle" style={{ top: "76%", right: "10px" }}>
                            <BsPatchCheckFill size={16} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5 className="fs-14 fw-bold d-block mb-1">{doctor?.name}</h5>
                        <p className="fs-12 fw-normal text-muted d-block mb-2">{doctor?.qualification}</p>
                        <div className="d-flex justify-content-center gap-2 mb-2">
                            {getSpecialtyBadge(doctor?.specialty)}
                            {getStatusBadge(doctor?.status)}
                        </div>
                        <div className="d-flex align-items-center justify-content-center gap-1">
                            <FiStar size={14} className="text-warning" />
                            <span className="fs-12 fw-medium">{doctor?.rating || 4.5}</span>
                            <span className="fs-11 text-muted">({doctor?.experience || 0} years exp)</span>
                        </div>
                    </div>
                    <div className="fs-12 fw-normal text-muted text-center d-flex flex-wrap gap-3 mb-4">
                        <div className="flex-fill py-3 px-4 rounded-1 d-none d-sm-block border border-dashed border-gray-5">
                            <h6 className="fs-15 fw-bolder">{doctor?.appointments || 0}</h6>
                            <p className="fs-12 text-muted mb-0">Appointments</p>
                        </div>
                        <div className="flex-fill py-3 px-4 rounded-1 d-none d-sm-block border border-dashed border-gray-5">
                            <h6 className="fs-15 fw-bolder">{doctor?.patients || 0}</h6>
                            <p className="fs-12 text-muted mb-0">Patients</p>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h6 className="fs-14 fw-bold mb-3">Contact Information</h6>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="wd-10 ht-10 rounded-circle bg-light d-flex align-items-center justify-content-center">
                            <FiMail size={14} className="text-muted" />
                        </div>
                        <div>
                            <p className="fs-12 fw-medium mb-0">Email</p>
                            <a href={`mailto:${doctor?.email}`} className="fs-12 text-muted text-decoration-none">
                                {doctor?.email}
                            </a>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="wd-10 ht-10 rounded-circle bg-light d-flex align-items-center justify-content-center">
                            <FiPhone size={14} className="text-muted" />
                        </div>
                        <div>
                            <p className="fs-12 fw-medium mb-0">Phone</p>
                            <a href={`tel:${doctor?.phone}`} className="fs-12 text-muted text-decoration-none">
                                {doctor?.phone}
                            </a>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <div className="wd-10 ht-10 rounded-circle bg-light d-flex align-items-center justify-content-center">
                            <FiMapPin size={14} className="text-muted" />
                        </div>
                        <div>
                            <p className="fs-12 fw-medium mb-0">Address</p>
                            <p className="fs-12 text-muted mb-0">
                                {doctor?.address}<br />
                                {doctor?.city}, {doctor?.state} {doctor?.zipCode}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h6 className="fs-14 fw-bold mb-3">Quick Stats</h6>
                    <div className="row g-2">
                        <div className="col-6">
                            <div className="p-3 rounded-1 border border-dashed border-gray-5 text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                    <FiCalendar size={16} className="text-primary me-1" />
                                    <span className="fs-13 fw-bold">{doctor?.appointments || 0}</span>
                                </div>
                                <p className="fs-11 text-muted mb-0">This Month</p>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="p-3 rounded-1 border border-dashed border-gray-5 text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                    <FiTrendingUp size={16} className="text-success me-1" />
                                    <span className="fs-13 fw-bold">{doctor?.patients || 0}</span>
                                </div>
                                <p className="fs-11 text-muted mb-0">Total Patients</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h6 className="fs-14 fw-bold mb-3">Languages</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {doctor?.languages?.map((language, index) => (
                            <span key={index} className="badge bg-light text-dark fs-11">
                                {language}
                            </span>
                        )) || <span className="text-muted fs-12">No languages specified</span>}
                    </div>
                </div>

                <div className="mb-4">
                    <h6 className="fs-14 fw-bold mb-3">Working Hours</h6>
                    <div className="fs-12">
                        {Object.entries(doctor?.workingHours || {}).map(([day, hours]) => (
                            <div key={day} className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-capitalize fw-medium">{day}</span>
                                <span className="text-muted">{hours}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <button
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => {
                            console.log("Edit Profile clicked for doctor:", doctor);
                            if (onEditClick) {
                                console.log("Using onEditClick callback");
                                onEditClick(doctor);
                            } else {
                                console.log("No onEditClick callback, navigating to edit page");
                                navigate(`/clinic/doctors/edit/${doctor?.id}`);
                            }
                        }}
                    >
                        <FiEdit3 size={16} className="me-2" />
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DoctorProfileCard 