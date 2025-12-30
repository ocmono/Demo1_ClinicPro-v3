import { useState, useMemo } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import SpecialtiesHeader from '@/components/clinic/SpecialtiesHeader'
import SpecialtiesTable from '@/components/clinic/SpecialtiesTable'
import Footer from '@/components/shared/Footer'
import { useClinicManagement } from '../../../contentApi/ClinicMnanagementProvider'
import { FiGrid, FiList, FiFilter, FiSearch, FiUsers, FiClock, FiTag, FiActivity } from 'react-icons/fi'

const SpecialitiesView = () => {
    const [viewMode, setViewMode] = useState('table')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const { clinicSpecialities } = useClinicManagement()

    // Filter and search specialties
    const filteredSpecialities = useMemo(() => {
        return clinicSpecialities.filter(specialty => {
            const searchMatch = !searchTerm || 
                specialty.speciality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                specialty.description?.toLowerCase().includes(searchTerm.toLowerCase())
            const categoryMatch = filterCategory === 'all' || specialty.category === filterCategory
            return searchMatch && categoryMatch
        })
    }, [clinicSpecialities, searchTerm, filterCategory])

    // Get unique categories
    const categories = [...new Set(clinicSpecialities.map(s => s.category).filter(Boolean))]

    // Statistics
    const stats = useMemo(() => {
        return {
            total: clinicSpecialities.length,
            active: clinicSpecialities.filter(s => s.status === 'Active').length,
            totalDoctors: clinicSpecialities.reduce((sum, s) => sum + (s.doctorCount || 0), 0),
            avgDuration: Math.round(clinicSpecialities.reduce((sum, s) => sum + parseInt(s.appointmentDuration || 30), 0) / clinicSpecialities.length) || 30
        }
    }, [clinicSpecialities])

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <h4 className="mb-1 fw-bold">Medical Specialties</h4>
                        <p className="text-muted mb-0">View and explore all medical specialties</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary-subtle text-primary">
                            <FiUsers size={12} className="me-1" />
                            {stats.total} Specialties
                        </span>
                        <span className="badge bg-success-subtle text-success">
                            <FiActivity size={12} className="me-1" />
                            {stats.active} Active
                        </span>
                    </div>
                </div>
            </PageHeader>

            <div className='main-content'>
                {/* Quick Stats */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 bg-primary-subtle">
                            <div className="card-body text-center py-3">
                                <FiUsers className="text-primary mb-2" size={24} />
                                <h5 className="fw-bold text-primary mb-1">{stats.total}</h5>
                                <small className="text-muted">Total Specialties</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-success-subtle">
                            <div className="card-body text-center py-3">
                                <FiActivity className="text-success mb-2" size={24} />
                                <h5 className="fw-bold text-success mb-1">{stats.active}</h5>
                                <small className="text-muted">Active Specialties</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-info-subtle">
                            <div className="card-body text-center py-3">
                                <FiUsers className="text-info mb-2" size={24} />
                                <h5 className="fw-bold text-info mb-1">{stats.totalDoctors}</h5>
                                <small className="text-muted">Total Doctors</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-warning-subtle">
                            <div className="card-body text-center py-3">
                                <FiClock className="text-warning mb-2" size={24} />
                                <h5 className="fw-bold text-warning mb-1">{stats.avgDuration}m</h5>
                                <small className="text-muted">Avg Duration</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='card'>
                    {/* Controls */}
                    <div className="card-header">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <FiSearch size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search specialties..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <select 
                                    className="form-select"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="text-muted small">Results:</span>
                                    <span className="badge bg-primary">{filteredSpecialities.length}</span>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="btn-group w-100" role="group">
                                    <button
                                        type="button"
                                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setViewMode('table')}
                                        title="Table View"
                                    >
                                        <FiList size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setViewMode('grid')}
                                        title="Grid View"
                                    >
                                        <FiGrid size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='card-body'>
                        {viewMode === 'table' ? (
                            <SpecialtiesTable />
                        ) : (
                            <div className="row g-4">
                                {filteredSpecialities.map((specialty) => (
                                    <div key={specialty.id} className="col-md-6 col-lg-4">
                                        <div className="card h-100 border">
                                            <div className="card-body">
                                                <div className="d-flex align-items-start justify-content-between mb-3">
                                                    <div className="text-white avatar-text user-avatar-text avatar-lg bg-primary">
                                                        {specialty.speciality?.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <span className={`badge ${
                                                        specialty.status === 'Active' ? 'bg-success' : 
                                                        specialty.status === 'Inactive' ? 'bg-danger' : 'bg-warning'
                                                    }`}>
                                                        {specialty.status}
                                                    </span>
                                                </div>
                                                
                                                <h6 className="fw-bold mb-2">{specialty.speciality}</h6>
                                                <p className="text-muted small mb-3" style={{minHeight: '40px'}}>
                                                    {specialty.description?.length > 80 
                                                        ? `${specialty.description.substring(0, 80)}...` 
                                                        : specialty.description || 'No description available'}
                                                </p>
                                                
                                                <div className="row g-2 text-center">
                                                    <div className="col-6">
                                                        <div className="bg-light p-2 rounded">
                                                            <FiTag size={14} className="text-muted mb-1" />
                                                            <div className="small fw-medium">{specialty.category || 'Medical'}</div>
                                                            <div className="x-small text-muted">Category</div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="bg-light p-2 rounded">
                                                            <FiClock size={14} className="text-muted mb-1" />
                                                            <div className="small fw-medium">{specialty.appointmentDuration || 30}m</div>
                                                            <div className="x-small text-muted">Duration</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="d-flex align-items-center justify-content-between mt-3">
                                                    <small className="text-muted">
                                                        <FiUsers size={12} className="me-1" />
                                                        {specialty.doctorCount || 0} doctors
                                                    </small>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => window.location.href = `/clinic/specialities/view/${specialty.id}`}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {filteredSpecialities.length === 0 && (
                                    <div className="col-12">
                                        <div className="text-center py-5">
                                            <FiSearch size={48} className="text-muted mb-3" />
                                            <h5 className="text-muted">No specialties found</h5>
                                            <p className="text-muted">Try adjusting your search or filter criteria</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default SpecialitiesView 