import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVaccine } from '../../context/VaccineContext';
import { usePatient } from '../../context/PatientContext';
import { 
  FiCalendar, FiUser, FiClock, FiCheckCircle, FiAlertCircle, 
  FiPlus, FiEdit3, FiEye, FiDownload, FiFileText, FiFilter,
  FiArrowLeft, FiRefreshCw, FiBell, FiMail, FiShield, FiUsers,
  FiBarChart, FiActivity, FiInfo
} from 'react-icons/fi';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';

// Indian Government Vaccination Schedule (0-15 years)
const VACCINE_SCHEDULE = {
  'BCG': {
    name: 'BCG (Bacillus Calmette-Guérin)',
    description: 'Tuberculosis vaccine',
    doses: [
      { age: 'At Birth', weeks: 0, months: 0, days: 0, mandatory: true },
      { age: '6 weeks', weeks: 6, months: 1.5, days: 42, mandatory: false }
    ]
  },
  'OPV': {
    name: 'OPV (Oral Polio Vaccine)',
    description: 'Polio vaccine',
    doses: [
      { age: 'At Birth', weeks: 0, months: 0, days: 0, mandatory: true },
      { age: '6 weeks', weeks: 6, months: 1.5, days: 42, mandatory: true },
      { age: '10 weeks', weeks: 10, months: 2.5, days: 70, mandatory: true },
      { age: '14 weeks', weeks: 14, months: 3.5, days: 98, mandatory: true },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: true },
      { age: '5 years', weeks: 260, months: 60, days: 1825, mandatory: true }
    ]
  },
  'DPT': {
    name: 'DPT (Diphtheria, Pertussis, Tetanus)',
    description: 'Combined vaccine for diphtheria, pertussis, and tetanus',
    doses: [
      { age: '6 weeks', weeks: 6, months: 1.5, days: 42, mandatory: true },
      { age: '10 weeks', weeks: 10, months: 2.5, days: 70, mandatory: true },
      { age: '14 weeks', weeks: 14, months: 3.5, days: 98, mandatory: true },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: true },
      { age: '5 years', weeks: 260, months: 60, days: 1825, mandatory: true },
      { age: '10 years', weeks: 520, months: 120, days: 3650, mandatory: true },
      { age: '16 years', weeks: 832, months: 192, days: 5840, mandatory: true }
    ]
  },
  'Hepatitis B': {
    name: 'Hepatitis B',
    description: 'Hepatitis B virus vaccine',
    doses: [
      { age: 'At Birth', weeks: 0, months: 0, days: 0, mandatory: true },
      { age: '6 weeks', weeks: 6, months: 1.5, days: 42, mandatory: true },
      { age: '10 weeks', weeks: 10, months: 2.5, days: 70, mandatory: true },
      { age: '14 weeks', weeks: 14, months: 3.5, days: 98, mandatory: true }
    ]
  },
  'Hib': {
    name: 'Hib (Haemophilus influenzae type b)',
    description: 'Bacterial meningitis vaccine',
    doses: [
      { age: '6 weeks', weeks: 6, months: 1.5, days: 42, mandatory: true },
      { age: '10 weeks', weeks: 10, months: 2.5, days: 70, mandatory: true },
      { age: '14 weeks', weeks: 14, months: 3.5, days: 98, mandatory: true },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: true }
    ]
  },
  'Rotavirus': {
    name: 'Rotavirus',
    description: 'Gastroenteritis vaccine',
    doses: [
      { age: '6 weeks', weeks: 6, months: 1.5, days: 42, mandatory: true },
      { age: '10 weeks', weeks: 10, months: 2.5, days: 70, mandatory: true },
      { age: '14 weeks', weeks: 14, months: 3.5, days: 98, mandatory: true }
    ]
  },
  'IPV': {
    name: 'IPV (Inactivated Polio Vaccine)',
    description: 'Injectable polio vaccine',
    doses: [
      { age: '14 weeks', weeks: 14, months: 3.5, days: 98, mandatory: true },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: true }
    ]
  },
  'PCV': {
    name: 'PCV (Pneumococcal Conjugate Vaccine)',
    description: 'Pneumonia vaccine',
    doses: [
      { age: '6 weeks', weeks: 6, months: 1.5, days: 42, mandatory: true },
      { age: '10 weeks', weeks: 10, months: 2.5, days: 70, mandatory: true },
      { age: '14 weeks', weeks: 14, months: 3.5, days: 98, mandatory: true },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: true }
    ]
  },
  'Measles': {
    name: 'Measles',
    description: 'Measles vaccine',
    doses: [
      { age: '9-12 months', weeks: 39, months: 9, days: 273, mandatory: true },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: true }
    ]
  },
  'MMR': {
    name: 'MMR (Measles, Mumps, Rubella)',
    description: 'Combined vaccine for measles, mumps, and rubella',
    doses: [
      { age: '9-12 months', weeks: 39, months: 9, days: 273, mandatory: true },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: true }
    ]
  },
  'Varicella': {
    name: 'Varicella (Chickenpox)',
    description: 'Chickenpox vaccine',
    doses: [
      { age: '12-15 months', weeks: 52, months: 12, days: 365, mandatory: false },
      { age: '4-6 years', weeks: 208, months: 48, days: 1460, mandatory: false }
    ]
  },
  'Hepatitis A': {
    name: 'Hepatitis A',
    description: 'Hepatitis A virus vaccine',
    doses: [
      { age: '12-23 months', weeks: 52, months: 12, days: 365, mandatory: false },
      { age: '2-18 years', weeks: 104, months: 24, days: 730, mandatory: false }
    ]
  },
  'Typhoid': {
    name: 'Typhoid',
    description: 'Typhoid fever vaccine',
    doses: [
      { age: '9-12 months', weeks: 39, months: 9, days: 273, mandatory: false },
      { age: '2 years', weeks: 104, months: 24, days: 730, mandatory: false },
      { age: '5 years', weeks: 260, months: 60, days: 1825, mandatory: false }
    ]
  },
  'JE': {
    name: 'JE (Japanese Encephalitis)',
    description: 'Japanese encephalitis vaccine',
    doses: [
      { age: '9-12 months', weeks: 39, months: 9, days: 273, mandatory: false },
      { age: '16-24 months', weeks: 70, months: 18, days: 490, mandatory: false }
    ]
  },
  'HPV': {
    name: 'HPV (Human Papillomavirus)',
    description: 'Cervical cancer prevention vaccine',
    doses: [
      { age: '9-14 years', weeks: 468, months: 108, days: 3285, mandatory: false },
      { age: '15-26 years', weeks: 780, months: 180, days: 5475, mandatory: false }
    ]
  }
};

const VaccineCalendar = () => {
  const navigate = useNavigate();
  const { vaccines, patientVaccines, addPatientVaccine, updateVaccine } = useVaccine();
  const { patients: contextPatients } = usePatient();
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vaccineSchedule, setVaccineSchedule] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);

  // Mock patient data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockPatients = [
        {
          id: 1,
          name: 'Aarav Patel',
          birthDate: '2023-01-15',
          age: '1 year 6 months',
          gender: 'Male',
          parentName: 'Rajesh Patel',
          phone: '+91 98765 43210',
          email: 'rajesh.patel@email.com',
          status: 'active'
        },
        {
          id: 2,
          name: 'Zara Khan',
          birthDate: '2022-06-20',
          age: '2 years 1 month',
          gender: 'Female',
          parentName: 'Ahmed Khan',
          phone: '+91 87654 32109',
          email: 'ahmed.khan@email.com',
          status: 'active'
        },
        {
          id: 3,
          name: 'Vihaan Sharma',
          birthDate: '2021-03-10',
          age: '3 years 4 months',
          gender: 'Male',
          parentName: 'Priya Sharma',
          phone: '+91 76543 21098',
          email: 'priya.sharma@email.com',
          status: 'active'
        }
      ];
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  // Generate vaccine schedule for a patient
  const generateVaccineSchedule = (patient) => {
    if (!patient) return [];

    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    const ageInDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));

    const schedule = [];

    Object.entries(VACCINE_SCHEDULE).forEach(([vaccineKey, vaccine]) => {
      vaccine.doses.forEach((dose, doseIndex) => {
        const dueDate = new Date(birthDate);
        dueDate.setDate(dueDate.getDate() + dose.days);

        const isOverdue = dueDate < today && ageInDays >= dose.days;
        const isDue = dueDate >= today && dueDate <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const isUpcoming = dueDate > new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const isCompleted = false;

        schedule.push({
          id: `${vaccineKey}-${doseIndex}`,
          vaccineKey,
          vaccineName: vaccine.name,
          description: vaccine.description,
          doseNumber: doseIndex + 1,
          age: dose.age,
          dueDate: dueDate,
          isOverdue,
          isDue,
          isUpcoming,
          isCompleted,
          mandatory: dose.mandatory,
          status: isCompleted ? 'completed' : isOverdue ? 'overdue' : isDue ? 'due' : 'upcoming'
        });
      });
    });

    return schedule.sort((a, b) => a.dueDate - b.dueDate);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!selectedPatient) return { total: 0, completed: 0, due: 0, overdue: 0, upcoming: 0 };
    
    const schedule = generateVaccineSchedule(selectedPatient);
    return {
      total: schedule.length,
      completed: schedule.filter(v => v.isCompleted).length,
      due: schedule.filter(v => v.isDue).length,
      overdue: schedule.filter(v => v.isOverdue).length,
      upcoming: schedule.filter(v => v.isUpcoming).length
    };
  }, [selectedPatient]);

  // Filter patients by age
  const filteredPatients = useMemo(() => {
    let filtered = patients;
    
    if (filterAge !== 'all') {
      filtered = filtered.filter(patient => {
        const birthDate = new Date(patient.birthDate);
        const today = new Date();
        const ageInMonths = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 30.44));
        
        switch (filterAge) {
          case '0-1': return ageInMonths <= 12;
          case '1-2': return ageInMonths > 12 && ageInMonths <= 24;
          case '2-5': return ageInMonths > 24 && ageInMonths <= 60;
          case '5-15': return ageInMonths > 60 && ageInMonths <= 180;
          default: return true;
        }
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === filterStatus);
    }

    return filtered;
  }, [patients, filterAge, filterStatus]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    const schedule = generateVaccineSchedule(patient);
    setVaccineSchedule(schedule);
  };

  const handleMarkCompleted = (vaccineId) => {
    setVaccineSchedule(prev => 
      prev.map(v => 
        v.id === vaccineId 
          ? { ...v, isCompleted: true, status: 'completed' }
          : v
      )
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { class: 'bg-success', text: 'Completed', icon: FiCheckCircle },
      'overdue': { class: 'bg-danger', text: 'Overdue', icon: FiAlertCircle },
      'due': { class: 'bg-warning', text: 'Due Soon', icon: FiClock },
      'upcoming': { class: 'bg-info', text: 'Upcoming', icon: FiCalendar }
    };
    const config = statusConfig[status] || statusConfig['upcoming'];
    const IconComponent = config.icon;
    
    return (
      <span className={`badge ${config.class} small`}>
        <IconComponent size={12} className="me-1" />
        {config.text}
      </span>
    );
  };

  const getAgeGroup = (birthDate) => {
    const today = new Date();
    const ageInMonths = Math.floor((today - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 30.44));
    
    if (ageInMonths <= 12) return '0-1 years';
    if (ageInMonths <= 24) return '1-2 years';
    if (ageInMonths <= 60) return '2-5 years';
    if (ageInMonths <= 180) return '5-15 years';
    return '15+ years';
  };

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate('/patients/all-patients')}
            >
              <FiArrowLeft size={14} className="me-1" />
              Back to Patients
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        {/* Integration Info */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <FiInfo size={20} className="me-2" />
                <div>
                  <strong>Vaccine Management Integration:</strong> This calendar integrates with the vaccine management system. 
                  Use the buttons above to navigate to the main vaccine dashboard or vaccination management for comprehensive tracking.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Patient Selection */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <FiUser size={16} className="me-2" />
                  Patient Selection
                </h6>
                <small>Select a patient to view their vaccine schedule</small>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <select 
                      className="form-select form-select-sm"
                      value={filterAge}
                      onChange={(e) => setFilterAge(e.target.value)}
                    >
                      <option value="all">All Ages</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-2">1-2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-15">5-15 years</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <select 
                      className="form-select form-select-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Patient List */}
                <div className="patient-list">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-4">
                      <FiUser size={32} className="text-muted mb-2" />
                      <h6 className="text-muted">No patients found</h6>
                      <p className="text-muted small">No patients match the selected filters</p>
                    </div>
                  ) : (
                    filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        className={`patient-card p-3 mb-2 rounded cursor-pointer ${
                          selectedPatient?.id === patient.id 
                            ? 'bg-primary text-white' 
                            : 'bg-light border'
                        }`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="mb-1 fw-bold">{patient.name}</h6>
                            <small className={selectedPatient?.id === patient.id ? 'text-white-50' : 'text-muted'}>
                              {patient.age} • {patient.gender}
                            </small>
                            <br />
                            <small className={selectedPatient?.id === patient.id ? 'text-white-50' : 'text-muted'}>
                              {patient.parentName}
                            </small>
                          </div>
                          <div className="text-end">
                            <small className={`badge ${selectedPatient?.id === patient.id ? 'bg-white text-primary' : 'bg-primary'}`}>
                              {getAgeGroup(patient.birthDate)}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vaccine Schedule */}
          <div className="col-lg-8">
            {selectedPatient ? (
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <FiCalendar size={16} className="me-2" />
                    Vaccine Schedule - {selectedPatient.name}
                  </h6>
                  <small>Age: {selectedPatient.age} • Birth Date: {new Date(selectedPatient.birthDate).toLocaleDateString()}</small>
                </div>
                <div className="card-body">
                  {/* Statistics */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                          <h4 className="mb-1">{stats.total}</h4>
                          <small>Total Vaccines</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <h4 className="mb-1">{stats.completed}</h4>
                          <small>Completed</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                          <h4 className="mb-1">{stats.due}</h4>
                          <small>Due Soon</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-danger text-white">
                        <div className="card-body text-center">
                          <h4 className="mb-1">{stats.overdue}</h4>
                          <small>Overdue</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vaccine Schedule Display */}
                  <div className="vaccine-schedule">
                    {vaccineSchedule.length === 0 ? (
                      <div className="text-center py-4">
                        <FiCalendar size={32} className="text-muted mb-2" />
                        <h6 className="text-muted">No vaccine schedule</h6>
                        <p className="text-muted small">No vaccines scheduled for this patient</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Vaccine</th>
                              <th>Age</th>
                              <th>Due Date</th>
                              <th>Status</th>
                              <th>Mandatory</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vaccineSchedule.map(vaccine => (
                              <tr key={vaccine.id} className={vaccine.isOverdue ? 'table-danger' : vaccine.isDue ? 'table-warning' : ''}>
                                <td>
                                  <div>
                                    <div className="fw-bold">{vaccine.vaccineName}</div>
                                    <small className="text-muted">{vaccine.description}</small>
                                    <br />
                                    <small className="text-muted">Dose {vaccine.doseNumber}</small>
                                  </div>
                                </td>
                                <td>
                                  <span className="fw-medium">{vaccine.age}</span>
                                </td>
                                <td>
                                  <div>
                                    <div className="fw-medium">
                                      {vaccine.dueDate.toLocaleDateString()}
                                    </div>
                                    <small className="text-muted">
                                      {vaccine.dueDate.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </small>
                                  </div>
                                </td>
                                <td>
                                  {getStatusBadge(vaccine.status)}
                                </td>
                                <td>
                                  <span className={`badge ${vaccine.mandatory ? 'bg-danger' : 'bg-secondary'}`}>
                                    {vaccine.mandatory ? 'Mandatory' : 'Optional'}
                                  </span>
                                </td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      className="btn btn-outline-info btn-sm"
                                      title="View Details"
                                    >
                                      <FiEye size={14} />
                                    </button>
                                    {!vaccine.isCompleted && (
                                      <button
                                        className="btn btn-outline-success btn-sm"
                                        title="Mark Completed"
                                        onClick={() => handleMarkCompleted(vaccine.id)}
                                      >
                                        <FiCheckCircle size={14} />
                                      </button>
                                    )}
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
            ) : (
              <div className="card shadow-sm">
                <div className="card-header bg-secondary text-white">
                  <h6 className="mb-0">
                    <FiUser size={16} className="me-2" />
                    Select a Patient
                  </h6>
                  <small>Choose a patient from the list to view their vaccine schedule</small>
                </div>
                <div className="card-body">
                  <div className="text-center py-4">
                    <FiUser size={32} className="text-muted mb-2" />
                    <h6 className="text-muted">No patient selected</h6>
                    <p className="text-muted small">Please select a patient from the list to view their vaccination schedule</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default VaccineCalendar;
