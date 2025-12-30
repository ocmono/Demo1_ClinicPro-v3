import { useState, useEffect } from 'react'
import { FiUser, FiCalendar, FiFileText, FiTrendingUp, FiActivity } from 'react-icons/fi'
import { toast } from 'react-toastify'

const TabPatientsContent = ({ doctor }) => {
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (doctor?.id) {
            fetchPatients()
        }
    }, [doctor?.id])

    const fetchPatients = async () => {
        setLoading(true)
        try {
            const response = await fetch(`https://bkdemo1.clinicpro.cc/doctor/patients/${doctor.id}`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('Fetched patients data:', data)
            
            // Transform API data to match our component structure
            const transformedPatients = Array.isArray(data) ? data.map(patient => ({
                id: patient.id || patient.patient_id,
                name: patient.name || patient.patient_name || patient.firstName + ' ' + patient.lastName || 'Unknown Patient',
                age: patient.age || patient.patient_age || 0,
                gender: patient.gender || patient.patient_gender || 'Unknown',
                lastVisit: patient.lastVisit || patient.last_visit || patient.updated_at || '',
                nextAppointment: patient.nextAppointment || patient.next_appointment || null,
                status: patient.status || patient.patient_status || 'Active',
                prescriptions: patient.prescriptions || patient.total_prescriptions || 0,
                totalVisits: patient.totalVisits || patient.total_visits || patient.visit_count || 0
            })) : []
            
            setPatients(transformedPatients)
        } catch (error) {
            console.error('Error fetching patients:', error)
            // Don't show error toast for patients, just use empty array
            setPatients([])
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <span className="badge bg-success">Active</span>
            case 'inactive':
                return <span className="badge bg-secondary">Inactive</span>
            default:
                return <span className="badge bg-secondary">{status}</span>
        }
    }

    const getGenderBadge = (gender) => {
        return gender === 'Male' ? 
            <span className="badge bg-info">Male</span> : 
            <span className="badge bg-warning">Female</span>
    }

    if (loading) {
        return (
            <div className="tab-pane fade show active p-4" id="patientsTab" role="tabpanel">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading patients...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="tab-pane fade show active p-4" id="patientsTab" role="tabpanel">
            <div className="row g-4">
                {/* Patient Statistics */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiTrendingUp size={16} className="me-2 text-primary" />
                                Patient Statistics
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiUser size={20} className="text-primary me-2" />
                                            <h4 className="mb-0 fw-bold">{patients.length}</h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Total Patients</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiUser size={20} className="text-success me-2" />
                                            <h4 className="mb-0 fw-bold">
                                                {patients.filter(p => p.status === 'Active').length}
                                            </h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Active Patients</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiCalendar size={20} className="text-info me-2" />
                                            <h4 className="mb-0 fw-bold">
                                                {patients.filter(p => p.nextAppointment).length}
                                            </h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Upcoming Appointments</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <div className="text-center p-3 border border-dashed border-gray-5 rounded-1">
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <FiFileText size={20} className="text-warning me-2" />
                                            <h4 className="mb-0 fw-bold">
                                                {patients.reduce((sum, p) => sum + p.prescriptions, 0)}
                                            </h4>
                                        </div>
                                        <p className="text-muted fs-12 mb-0">Total Prescriptions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Patients */}
                <div className="col-12">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-bold">
                                <FiUser size={16} className="me-2 text-success" />
                                Recent Patients
                            </h6>
                            <button className="btn btn-sm btn-outline-primary">
                                View All Patients
                            </button>
                        </div>
                        <div className="card-body">
                            {patients.length === 0 ? (
                                <div className="text-center py-4">
                                    <FiUser size={48} className="text-muted mb-3" />
                                    <h6 className="text-muted">No patients found</h6>
                                    <p className="text-muted fs-12">This doctor hasn't treated any patients yet</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Patient</th>
                                                <th>Age/Gender</th>
                                                <th>Last Visit</th>
                                                <th>Next Appointment</th>
                                                <th>Status</th>
                                                <th>Prescriptions</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patients.map((patient) => (
                                                <tr key={patient.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar avatar-sm me-3">
                                                                <div className="avatar-title bg-primary rounded-circle">
                                                                    {patient.name.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold fs-14">{patient.name}</h6>
                                                                <small className="text-muted">ID: #{patient.id}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="fs-12">{patient.age} years</span>
                                                            {getGenderBadge(patient.gender)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="fs-12 text-muted">
                                                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {patient.nextAppointment ? (
                                                            <span className="fs-12 text-success">
                                                                {new Date(patient.nextAppointment).toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="fs-12 text-muted">No upcoming</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(patient.status)}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            {patient.prescriptions} prescriptions
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button className="btn btn-sm btn-outline-info" title="View Patient">
                                                                <FiUser size={14} />
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-primary" title="View Records">
                                                                <FiFileText size={14} />
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-success" title="Schedule Appointment">
                                                                <FiCalendar size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Patient Activity Chart */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiActivity size={16} className="me-2 text-info" />
                                Patient Activity (Last 6 Months)
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="text-center py-4">
                                <FiActivity size={48} className="text-muted mb-3" />
                                <h6 className="text-muted">Chart coming soon</h6>
                                <p className="text-muted fs-12">Patient activity visualization will be displayed here</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Patients */}
                <div className="col-md-6">
                    <div className="card border-0 shadow-none">
                        <div className="card-header bg-transparent border-0">
                            <h6 className="mb-0 fw-bold">
                                <FiTrendingUp size={16} className="me-2 text-warning" />
                                Top Patients by Visits
                            </h6>
                        </div>
                        <div className="card-body">
                            {patients.length === 0 ? (
                                <div className="text-center py-4">
                                    <FiUser size={32} className="text-muted mb-2" />
                                    <p className="text-muted fs-12">No patients available</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {patients
                                        .sort((a, b) => b.totalVisits - a.totalVisits)
                                        .slice(0, 5)
                                        .map((patient, index) => (
                                            <div key={patient.id} className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-light rounded-circle p-2 me-3" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span className="fw-bold fs-12">{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold fs-14">{patient.name}</h6>
                                                        <small className="text-muted">{patient.totalVisits} visits</small>
                                                    </div>
                                                </div>
                                                <span className="badge bg-primary">{patient.totalVisits}</span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TabPatientsContent 