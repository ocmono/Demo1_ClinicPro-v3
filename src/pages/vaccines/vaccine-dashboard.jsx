import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield, FiUsers, FiCalendar, FiCheckCircle, FiAlertCircle,
  FiPlus, FiBarChart, FiSearch, FiRefreshCw, FiDownload,
  FiUser, FiClock, FiEdit3, FiTrash2, FiEye, FiFilter,
  FiFileText, FiBell, FiMail, FiArrowLeft, FiHome,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import PageHeader from '../../components/shared/pageHeader/PageHeader';
import Footer from '../../components/shared/Footer';
import { usePatient } from '../../context/PatientContext';
import { useVaccine } from '../../context/VaccineContext';
import PatientModal from '@/components/patients/PatientModal';
import ViewMedicineModal from '@/components/medicines/ViewMedicineModal';
import EditMedicineModal from '@/components/medicines/EditMedicineModal';
import { useAuth } from "../../contentApi/AuthContext";

const VaccineDashboard = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { fetchPatientsWithVaccines } = usePatient();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAge, setFilterAge] = useState('all');

  // Modal state
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [medicineToView, setMedicineToView] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Mock data
  const [vaccines, setVaccines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientsWithVaccines, setPatientsWithVaccines] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const { getVaccineSchedules, vaccineSchedules, getVaccines, loading: vaccineLoading, deleteVaccineSchedule, updateVaccineScheduleStatus } = useVaccine();
  const [vaccinationRecords, setVaccinationRecords] = useState([]);

  // Get date time settings from localStorage
  const getDateTimeSettings = () => {
    try {
      const settings = localStorage.getItem('dateTimeSettings');
      return settings ? JSON.parse(settings) : {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'Asia/Calcutta'
      };
    } catch (error) {
      console.error('Error loading dateTimeSettings:', error);
      return {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'Asia/Calcutta'
      };
    }
  };

  // Function to format date according to settings
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    
    const settings = getDateTimeSettings();
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) return '—';
    
    try {
      switch (settings.dateFormat) {
        case 'DD/MM/YYYY':
          return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
        case 'MM/DD/YYYY':
          return date.toLocaleDateString('en-US'); // MM/DD/YYYY
        case 'YYYY-MM-DD':
          return date.toISOString().split('T')[0]; // YYYY-MM-DD
        default:
          return date.toLocaleDateString('en-US'); // Default to MM/DD/YYYY
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr; // Return original string if formatting fails
    }
  };

  // Function to format time according to settings
  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    
    const settings = getDateTimeSettings();
    
    try {
      // Create a date object with today's date and the given time
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes || 0), 0);
      
      if (settings.timeFormat === '24h') {
        // 24-hour format
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        // 12-hour format (default)
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr; // Return original string if formatting fails
    }
  };

  // Function to format weekday according to date
  const formatWeekday = (dateStr) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Function to format weekday (short version)
  const formatWeekdayShort = (dateStr) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Function to check if a schedule is overdue
  const checkOverdueSchedules = (schedules) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    return schedules.map(schedule => {
      const scheduleDate = new Date(schedule.schedule_date);
      scheduleDate.setHours(0, 0, 0, 0);

      // If schedule date is in the past and status is not completed, mark as overdue
      if (scheduleDate < today && schedule.status !== 'completed') {
        return {
          ...schedule,
          status: 'overdue'
        };
      }
      return schedule;
    });
  };

  // Get schedules with overdue status applied
  const schedulesWithOverdue = useMemo(() => {
    return checkOverdueSchedules(vaccineSchedules);
  }, [vaccineSchedules]);

  const fetchVaccinesData = async () => {
    try {
      setLoading(true);
      const response = await getVaccines();
      if (response.success) {
        setVaccines(response.data || []);
      } else {
        console.error('Failed to fetch vaccines:', response.error);
        setVaccines([]);
      }
    } catch (err) {
      console.error('Error fetching vaccines:', err);
      setVaccines([]);
    }
  };

  // Fetch patients with vaccines data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientsWithVaccines();
        setPatientsWithVaccines(data || []); // fallback to [] if null
        if (Array.isArray(data)) {
          const patientList = data.map(patient => ({
            id: patient.patient_id,
            name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
            age: patient.age,
            gender: patient.gender,
            contact: patient.phone,
            email: patient.email,
            status: 'active'
          }));
          setPatients(patientList);
        }
      } catch (err) {
        console.error("Error loading patients with vaccines:", err);
        setPatientsWithVaccines([]);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        await getVaccineSchedules(); // this populates vaccineSchedules in context
      } catch (err) {
        console.error("Error loading vaccine schedules:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSchedules();
  }, []);

  useEffect(() => {
    fetchVaccinesData();
  }, []);

  const getPatientName = (id) => {
    const patient = patientsWithVaccines.find(p => p.patient_id === id);
    return patient ? `${patient.firstName} ${patient.lastName}` : `ID: ${id}`;
  };

  const getVaccineName = (id) => {
    const vaccine = vaccines.find(v => v.id === id);
    return vaccine ? vaccine.name : `ID: ${id}`;
  };

  useEffect(() => {
    if (schedulesWithOverdue.length > 0) {
      const records = schedulesWithOverdue.map(schedule => ({
        id: schedule.id,
        patient_id: schedule.patient_id,
        patient_name: getPatientName(schedule.patient_id),
        vaccine_id: schedule.vaccine_id,
        vaccine_name: getVaccineName(schedule.vaccine_id),
        dose_number: schedule.dose_number,
        scheduled_date: schedule.schedule_date,
        status: schedule.status,
        administered_date: schedule.status === 'completed' ? schedule.schedule_date : null,
        notes: schedule.notes || (schedule.status === 'completed' ? 'Administered successfully' : 'Pending')
      }));
      setVaccinationRecords(records);
    }
  }, [schedulesWithOverdue, patients]);

  // Statistics
  const stats = useMemo(() => {
    const totalVaccines = vaccines.length;
    const totalPatients = patients.length;
    const totalSchedules = schedulesWithOverdue.length;
    const completedSchedules = schedulesWithOverdue.filter(s => s.status === 'completed').length;
    const scheduledSchedules = schedulesWithOverdue.filter(s => s.status === 'scheduled').length;
    const overdueSchedules = schedulesWithOverdue.filter(s => s.status === 'overdue').length;
    const lowStockVaccines = vaccines.filter(v => {
      const totalStock = v.variations?.reduce((sum, variation) => sum + (variation.stock || 0), 0) || 0;
      return totalStock < 20;
    }).length;
    const expiringVaccines = vaccines.filter(v => {
      if (!v.variations || v.variations.length === 0) return false;

      const earliestExpiry = v.variations.reduce((earliest, variation) => {
        if (!variation.expiry_date) return earliest;
        const expiryDate = new Date(variation.expiry_date);
        if (!earliest || expiryDate < earliest) return expiryDate;
        return earliest;
      }, null);

      if (!earliestExpiry) return false;

      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return earliestExpiry <= threeMonthsFromNow;
    }).length;

    return {
      totalVaccines,
      totalPatients,
      totalSchedules,
      completedSchedules,
      scheduledSchedules,
      overdueSchedules,
      lowStockVaccines,
      expiringVaccines,
      completionRate: totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0
    };
  }, [vaccines, patients, schedules]);

  // Filtered data
  const filteredSchedules = useMemo(() => {
    return schedulesWithOverdue.filter(schedule => {
      const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
      const matchesSearch =
        searchTerm === '' ||
        getPatientName(schedule.patient_id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getVaccineName(schedule.vaccine_id)?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [schedulesWithOverdue, filterStatus, searchTerm]);

  const filteredVaccines = useMemo(() => {
    return vaccines.filter(vaccine => {
      const matchesSearch = searchTerm === '' ||
        vaccine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccine.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccine.age_grp?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [vaccines, searchTerm]);

  const filteredPatients = useMemo(() => {
    return patientsWithVaccines.filter(patient => {
      const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
      const matchesAge = filterAge === 'all' ||
        (filterAge === '0-1' && patient.age < 2) ||
        (filterAge === '1-2' && patient.age >= 1 && patient.age < 2) ||
        (filterAge === '2-5' && patient.age >= 2 && patient.age < 5) ||
        (filterAge === '5+' && patient.age >= 5);
      const matchesSearch = searchTerm === '' ||
        patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesAge && matchesSearch;
    });
  }, [patientsWithVaccines, filterAge, searchTerm]);

  // Add filtered records for the records tab
  const filteredRecords = useMemo(() => {
    return vaccinationRecords.filter(record => {
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      const matchesSearch =
        searchTerm === '' ||
        record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.vaccine_name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [vaccinationRecords, filterStatus, searchTerm]);

  // Modal handlers
  const handleViewPatient = (patientId) => {
    const patient = patientsWithVaccines.find(p => p.patient_id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setShowPatientModal(true);
    } else {
      console.error('Patient not found:', patientId);
      alert('Patient data not available');
    }
  }

  const handleEditMedicine = (medicine) => {
    setMedicineToEdit(medicine);
    setShowEditModal(true);
  }

  const handleViewMedicine = (medicine) => {
    setMedicineToView(medicine);
    setShowViewModal(true);
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setMedicineToView(null);
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setMedicineToEdit(null);
  }

  const handleClosePatientModal = () => {
    setShowPatientModal(false);
    setSelectedPatientId(null);
  }

  const handleMedicineUpdate = (updatedMedicine) => {
    // Update the local state with the updated medicine
    setVaccines(prev => prev.map(v =>
      v.id === updatedMedicine.id ? updatedMedicine : v
    ));
    setShowEditModal(false);
    setMedicineToEdit(null);
  }

  // Pagination functions
  const getCurrentPageData = (data) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / rowsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const Pagination = ({ data }) => {
    const totalPages = getTotalPages(data);

    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted small">
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, data.length)} of {data.length} entries
        </div>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronLeft size={14} />
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight size={14} />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  // Action handlers
  const handleMarkCompleted = async (scheduleId) => {
    if (window.confirm("Mark this schedule as completed?")) {
      try {
        await updateVaccineScheduleStatus(scheduleId, {
          status: "completed"
        });
        alert("Vaccine marked as completed!");
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to mark as completed. Please try again.");
      }
    }
  };

  const handleReschedule = (scheduleId) => {
    // Create a modal-like date picker
    const currentSchedule = schedulesWithOverdue.find(s => s.id === scheduleId);
    if (!currentSchedule) return;

    // Create a temporary input element for date selection
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = currentSchedule.scheduled_date;
    dateInput.min = new Date().toISOString().split('T')[0]; // Can't schedule in the past

    // Style the input
    dateInput.style.position = 'fixed';
    dateInput.style.top = '50%';
    dateInput.style.left = '50%';
    dateInput.style.transform = 'translate(-50%, -50%)';
    dateInput.style.zIndex = '9999';
    dateInput.style.padding = '10px';
    dateInput.style.border = '2px solid #0d6efd';
    dateInput.style.borderRadius = '8px';
    dateInput.style.fontSize = '16px';
    dateInput.style.backgroundColor = 'white';
    dateInput.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    // Add event listeners
    const handleDateChange = () => {
      const selectedDate = dateInput.value;
      if (selectedDate) {
        // Update the schedule
        setSchedules(prev => prev.map(schedule =>
          schedule.id === scheduleId
            ? {
              ...schedule,
              scheduled_date: selectedDate,
              status: 'scheduled',
              notes: schedule.notes ? `${schedule.notes} (Rescheduled)` : 'Rescheduled'
            }
            : schedule
        ));

        // Show success message
        alert(`Schedule rescheduled to ${formatDate(selectedDate)}`);
      }

      // Clean up
      document.body.removeChild(dateInput);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(dateInput);
      }
    };

    const handleClickOutside = (e) => {
      if (e.target !== dateInput) {
        document.body.removeChild(dateInput);
      }
    };

    dateInput.addEventListener('change', handleDateChange);
    dateInput.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    // Add to DOM and focus
    document.body.appendChild(dateInput);
    dateInput.focus();
    dateInput.click(); // Open the date picker
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm("Are you sure you want to delete this vaccine schedule?")) {
      try {
        await deleteVaccineSchedule(scheduleId); // ✅ calls backend + updates context state
        alert("Schedule deleted successfully!");
      } catch (err) {
        console.error("Error deleting schedule:", err);
        alert("Failed to delete schedule. Please try again.");
      }
    }
  };

  const handleDeleteVaccine = (vaccineId) => {
    if (window.confirm('Are you sure you want to delete this vaccine?')) {
      setVaccines(prev => prev.filter(v => v.id !== vaccineId));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success rounded-pill">Completed</span>;
      case 'scheduled':
        return <span className="badge bg-warning rounded-pill">Scheduled</span>;
      case 'overdue':
        return <span className="badge bg-danger rounded-pill">Overdue</span>;
      default:
        return <span className="badge bg-secondary rounded-pill">{status}</span>;
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity < 10) return { text: 'Low Stock', bg: 'bg-danger' };
    if (quantity < 30) return { text: 'Medium Stock', bg: 'bg-warning' };
    return { text: 'In Stock', bg: 'bg-success' };
  };

  const exportData = () => {
    const data = {
      vaccines: filteredVaccines,
      schedules: filteredSchedules,
      patients: filteredPatients,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaccine-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <FiBarChart /> },
    { id: 'schedules', name: 'Schedules', icon: <FiCalendar /> },
    { id: 'vaccines', name: 'Vaccines', icon: <FiShield /> },
    { id: 'patients', name: 'Patients', icon: <FiUsers /> },
    { id: 'records', name: 'Records', icon: <FiFileText /> }
  ];

  // Reset to page 1 when tab changes and reset filters if needed
  useEffect(() => {
    setCurrentPage(1);
    // Reset filters when switching to tabs that don't use certain filters
    if (activeTab === 'vaccines') {
      setFilterStatus('all'); // Vaccines don't use status filter
      setFilterAge('all'); // Vaccines don't use age filter
    } else if (activeTab === 'overview') {
      // Keep all filters for overview
    }
  }, [activeTab]);

  return (
    <>
      <PageHeader>
        <div className="d-flex justify-content-between align-items-center">

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={exportData}>
              <FiDownload size={16} className="me-2" />
              Export
            </button>
            {/* <button className="btn btn-primary">
              <FiPlus size={16} className="me-2" />
              Quick Add
            </button> */}
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        <div>
          {/* Statistics Cards */}
          <div className="row g-2">
            <div className="col-md-2">
              <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '80px' }}>
                <div className="card-body text-center p-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <FiShield size={18} className="text-white me-2" />
                    <span className="text-white fw-bold fs-5">{stats.totalVaccines}</span>
                  </div>
                  <p className="text-white-50 small mb-0 mt-1">Vaccines</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', minHeight: '80px' }}>
                <div className="card-body text-center p-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <FiUsers size={18} className="text-white me-2" />
                    <span className="text-white fw-bold fs-5">{stats.totalPatients}</span>
                  </div>
                  <p className="text-white-50 small mb-0 mt-1">Patients</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', minHeight: '80px' }}>
                <div className="card-body text-center p-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <FiCalendar size={18} className="text-white me-2" />
                    <span className="text-white fw-bold fs-5">{stats.totalSchedules}</span>
                  </div>
                  <p className="text-white-50 small mb-0 mt-1">Schedules</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', minHeight: '80px' }}>
                <div className="card-body text-center p-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <FiCheckCircle size={18} className="text-white me-2" />
                    <span className="text-white fw-bold fs-5">{stats.completedSchedules}</span>
                  </div>
                  <p className="text-white-50 small mb-0 mt-1">Completed</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', minHeight: '80px' }}>
                <div className="card-body text-center p-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <FiAlertCircle size={18} className="text-white me-2" />
                    <span className="text-white fw-bold fs-5">{stats.overdueSchedules}</span>
                  </div>
                  <p className="text-white-50 small mb-0 mt-1">Overdue</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', minHeight: '80px' }}>
                <div className="card-body text-center p-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <FiBarChart size={18} className="text-white me-2" />
                    <span className="text-white fw-bold fs-5">{stats.completionRate}%</span>
                  </div>
                  <p className="text-white-50 small mb-0 mt-1">Completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="card shadow-sm">
            {/* Tab Navigation */}
            <div className="card-header bg-white">
              <ul className="nav nav-tabs card-header-tabs border-0">
                {tabs.map(tab => (
                  <li className="nav-item" key={tab.id}>
                    <button
                      className={`nav-link ${activeTab === tab.id ? 'active fw-bold border-bottom-0' : 'text-muted'}`}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        borderBottom: activeTab === tab.id ? '2px solid #0d6efd' : 'none',
                        borderRadius: '5px 5px 0px 0px',
                        padding: '12px 20px'
                      }}
                    >
                      <span className="me-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-body p-4">
              {/* Filters */}
              <div className="row align-items-center mb-4">
                <div className="col-md-8 d-flex gap-3">
                  <div className="input-group" style={{ maxWidth: "280px" }}>
                    <span className="input-group-text bg-light border-end-0">
                      <FiSearch size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search patients, vaccines, schedules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {/* Status filter - show for schedules and records tabs */}
                  {(activeTab === 'schedules' || activeTab === 'records') && (
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ maxWidth: "280px" }}
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  )}
                  {/* Age filter - show for patients tab */}
                  {activeTab === 'patients' && (
                    <select
                      className="form-select"
                      value={filterAge}
                      onChange={(e) => setFilterAge(e.target.value)}
                      style={{ maxWidth: "280px" }}
                    >
                      <option value="all">All Ages</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-2">1-2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  )}
                </div>
                <div className="col-md-4 d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterAge('all');
                      setCurrentPage(1);
                    }}
                    title="Clear Filters"
                  >
                    <FiFilter size={16} />
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => window.location.reload()}
                    title="Refresh Data"
                  >
                    <FiRefreshCw size={16} />
                  </button>
                  {activeTab !== 'overview' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        switch (activeTab) {
                          case 'schedules':
                            navigate('/');
                            break;
                          case 'vaccines':
                            navigate('/inventory/products/product-create');
                            break;
                          case 'patients':
                            navigate('/patients/add-patient');
                            break;
                          case 'records':
                            navigate('/');
                            break;
                          default:
                            navigate('/vaccines/add-vaccine');
                        }
                      }}
                      title={`Add New ${activeTab === 'schedules' ? 'Schedule' :
                        activeTab === 'vaccines' ? 'Vaccine' :
                          activeTab === 'patients' ? 'Patient' :
                            activeTab === 'records' ? 'Record' : 'Item'}`}
                    >
                      <FiPlus size={16} className="me-2" />
                      Add {activeTab === 'schedules' ? 'Schedule' :
                        activeTab === 'vaccines' ? 'Vaccine' :
                          activeTab === 'patients' ? 'Patient' :
                            activeTab === 'records' ? 'Record' : 'Item'}
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-3">Loading vaccine data...</p>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="row g-4">
                      <div className="col-lg-8">
                        <div className="card border-0 bg-light">
                          <div className="card-header bg-white border-bottom">
                            <h6 className="mb-0 fw-bold">
                              <FiCalendar size={16} className="me-2" />
                              Recent Schedules
                            </h6>
                          </div>
                          <div className="card-body p-0">
                            <div className="table-responsive">
                              <table className="table table-hover mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th className="border-0">Patient</th>
                                    <th className="border-0">Vaccine</th>
                                    <th className="border-0">Date</th>
                                    <th className="border-0">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                    {getCurrentPageData(schedulesWithOverdue.slice(0, 5)).map(schedule => (
                                    <tr key={schedule.id}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "36px", height: "36px", backgroundColor: "#e8f0fe" }}>
                                            <FiUser size={16} className="text-primary" />
                                          </div>
                                          <div>
                                              <div className="fw-medium">{getPatientName(schedule.patient_id)}</div>
                                            <small className="text-muted">ID: {schedule.patient_id}</small>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                          <div className="fw-medium">{getVaccineName(schedule.vaccine_id)}</div>
                                        <small className="text-muted">Dose {schedule.dose_number}</small>
                                      </td>
                                      <td>
                                          <div className="fw-medium">{formatDate(schedule.schedule_date)}</div>
                                        <small className="text-muted">
                                            {formatWeekdayShort(schedule.schedule_date)}
                                        </small>
                                      </td>
                                      <td>{getStatusBadge(schedule.status)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="card border-0 bg-light">
                          <div className="card-header bg-white border-bottom">
                            <h6 className="mb-0 fw-bold">
                              <FiAlertCircle size={16} className="me-2" />
                              Stock Alerts
                            </h6>
                          </div>
                          <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                                {vaccines.filter(v => {
                                  const totalStock = v.variations?.reduce((sum, variation) => sum + (variation.stock || 0), 0) || 0;
                                  return totalStock < 30;
                                }).map(vaccine => {
                                  const totalStock = vaccine.variations?.reduce((sum, variation) => sum + (variation.stock || 0), 0) || 0;
                                  const stockStatus = getStockStatus(totalStock);
                                return (
                                  <div key={vaccine.id} className="list-group-item border-0 d-flex justify-content-between align-items-center py-3">
                                    <div>
                                      <div className="fw-medium">{vaccine.name}</div>
                                      <small className="text-muted">Stock: {totalStock}</small>
                                    </div>
                                    <span className={`badge ${stockStatus.bg} rounded-pill`}>
                                      {stockStatus.text}
                                    </span>
                                  </div>
                                );
                              })}
                                {vaccines.filter(v => {
                                  const totalStock = v.variations?.reduce((sum, variation) => sum + (variation.stock || 0), 0) || 0;
                                  return totalStock >= 30;
                                }).length === vaccines.length && (
                                    <div className="list-group-item border-0 text-center py-4">
                                      <FiCheckCircle size={24} className="text-success mb-2" />
                                      <p className="text-muted mb-0">All vaccines in stock</p>
                                    </div>
                                  )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedules Tab */}
                  {activeTab === 'schedules' && (
                      <>
                        <div className="card border-0 bg-light">
                          <div className="card-body p-0">
                            <div className="table-responsive">
                              <table className="table table-hover mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th className="border-0">Patient</th>
                                    <th className="border-0">Vaccine</th>
                                    <th className="border-0">Dose</th>
                                    <th className="border-0">Scheduled Date</th>
                                    <th className="border-0">Status</th>
                                    <th className="border-0">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getCurrentPageData(filteredSchedules).map(schedule => (
                                    <tr key={schedule.id}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{
                                            width: "36px",
                                            height: "36px",
                                            backgroundColor: "#f0f9ff" // change per type
                                          }}>
                                            <FiUser size={16} className="text-primary" />
                                          </div>
                                          <div>
                                            <div className="fw-medium">{getPatientName(schedule.patient_id)}</div>
                                            <small className="text-muted">ID: {schedule.patient_id}</small>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="fw-medium">{getVaccineName(schedule.vaccine_id)}</div>
                                        <small className="text-muted">ID: {schedule.vaccine_id}</small>
                                      </td>
                                      <td>
                                        <span className="badge bg-info rounded-pill">Dose {schedule.dose_number}</span>
                                      </td>
                                      <td>
                                        <div className="fw-medium">{formatDate(schedule.schedule_date)}</div>
                                        <small className="text-muted">
                                          {formatWeekday(schedule.schedule_date)}
                                        </small>
                                      </td>
                                      <td>{getStatusBadge(schedule.status)}</td>
                                      <td>
                                        <div className="hstack gap-2">
                                          <button className="avatar-text avatar-md" title="View" onClick={() => handleViewPatient(schedule.patient_id)}>
                                            <FiEye />
                                          </button>
                                          {schedule.status === 'scheduled' && (
                                            <>
                                              <button
                                                className="avatar-text avatar-md"
                                                onClick={() => handleMarkCompleted(schedule.id)}
                                                title="Mark Complete"
                                              >
                                                <FiCheckCircle />
                                              </button>
                                              <button
                                                className="avatar-text avatar-md"
                                                onClick={() => handleReschedule(schedule.id)}
                                                title="Reschedule"
                                              >
                                                <FiEdit3 />
                                              </button>
                                            </>
                                          )}
                                          <button
                                            className="avatar-text avatar-md"
                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                            title="Delete"
                                          >
                                            <FiTrash2 />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <Pagination data={filteredSchedules} />
                      </>
                  )}

                  {/* Vaccines Tab */}
                  {activeTab === 'vaccines' && (
                      <>
                        <div className="card border-0 bg-light">
                          <div className="card-body p-0">
                            <div className="table-responsive">
                              <table className="table table-hover mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th className="border-0">Vaccine Name</th>
                                  <th className="border-0">Brand</th>
                                  <th className="border-0">Type</th>
                                    <th className="border-0">Age Group</th>
                                    <th className="border-0">Doses</th>
                                    <th className="border-0">Stock</th>
                                    <th className="border-0">Expiry</th>
                                    <th className="border-0">Status</th>
                                    <th className="border-0">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getCurrentPageData(filteredVaccines).map(vaccine => {
                                  // Get the first variation for display (you might want to handle multiple variations differently)
                                  const primaryVariation = vaccine.variations && vaccine.variations.length > 0
                                    ? vaccine.variations[0]
                                    : null;

                                  const totalStock = vaccine.variations
                                    ? vaccine.variations.reduce((sum, variation) => sum + (variation.stock || 0), 0)
                                    : 0;

                                  const earliestExpiry = vaccine.variations && vaccine.variations.length > 0
                                    ? vaccine.variations.reduce((earliest, variation) => {
                                      if (!earliest || new Date(variation.expiry_date) < new Date(earliest)) {
                                        return variation.expiry_date;
                                      }
                                      return earliest;
                                    }, null)
                                    : null;

                                  const stockStatus = getStockStatus(totalStock);

                                  return (
                                    <tr key={vaccine.id}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px', backgroundColor: '#FEFFC4' }}>
                                            <FiShield size={16} className="text-warning" />
                                          </div>
                                          <div>
                                            <div className="fw-medium">{vaccine.name}</div>
                                            <small className="text-muted">
                                              {vaccine.mandatory ? 'Mandatory' : 'Optional'}
                                            </small>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="fw-medium">{vaccine.brand}</div>
                                      </td>
                                      <td>
                                        <span className="badge bg-primary rounded-pill">
                                          {vaccine.vaccine_type || 'Medicine'}
                                        </span>
                                      </td>
                                      <td>{vaccine.age_grp}</td>
                                      <td>
                                        <span className="badge bg-info rounded-pill">
                                          {vaccine.total_doses > 0 ? `${vaccine.total_doses} doses` : 'N/A'}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="fw-medium">{totalStock}</div>
                                        <small className="text-muted">
                                          {vaccine.variations?.length > 1 && `(${vaccine.variations.length} variants)`}
                                        </small>
                                      </td>
                                      <td>
                                        {earliestExpiry ? (
                                          <div>
                                            <div className="fw-medium">{formatDate(earliestExpiry)}</div>
                                            {vaccine.variations?.length > 1 && (
                                              <small className="text-muted">Earliest of {vaccine.variations.length}</small>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-muted">N/A</span>
                                        )}
                                      </td>
                                      <td>
                                        <span className={`badge ${stockStatus.bg} rounded-pill`}>
                                          {stockStatus.text}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="hstack gap-2">
                                          <button
                                            className="avatar-text avatar-md"
                                            title="View"
                                            onClick={() => handleViewMedicine(vaccine)}
                                          >
                                            <FiEye />
                                          </button>
                                          {role?.toLowerCase() !== 'receptionist' && (
                                            <button
                                              className="avatar-text avatar-md"
                                              title="Edit"
                                              onClick={() => handleEditMedicine(vaccine)}
                                            >
                                              <FiEdit3 />
                                            </button>
                                          )}
                                          {role?.toLowerCase() !== 'receptionist' && (
                                          <button
                                            className="avatar-text avatar-md"
                                            onClick={() => handleDeleteVaccine(vaccine.id)}
                                            title="Delete"
                                          >
                                            <FiTrash2 />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <Pagination data={filteredVaccines} />
                      </>
                  )}

                  {/* Patients Tab */}
                  {activeTab === 'patients' && (
                      <>
                        <div className="card border-0 bg-light">
                          <div className="card-body p-0">
                          {loading ? (
                            <div className="text-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="text-muted mt-3">Loading patients with vaccines...</p>
                            </div>
                          ) : patientsWithVaccines.length === 0 ? (
                            <div className="text-center py-5">
                              <FiUsers size={48} className="text-muted mb-3" />
                              <h6 className="text-muted">No patients with scheduled vaccines found</h6>
                              <p className="text-muted small">Patients with vaccine schedules will appear here</p>
                            </div>
                          ) : (
                                  <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                      <thead className="table-light">
                                        <tr>
                                          <th>Patient</th>
                                          <th>Age/Gender</th>
                                          <th>Contact</th>
                                          <th>Scheduled Vaccines</th>
                                          <th>Next Due</th>
                                          <th>Status</th>
                                          <th>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {getCurrentPageData(filteredPatients)
                                          .map(patient => {
                                            const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
                                            const scheduledCount = patient.vaccines?.filter(v => v.status === 'scheduled').length || 0;
                                            const completedCount = patient.vaccines?.filter(v => v.status === 'completed').length || 0;
                                            const overdueCount = patient.vaccines?.filter(v => v.status === 'overdue').length || 0;

                                      const upcomingVaccines = patient.vaccines?.filter(v => v.status === 'scheduled') || [];
                                      const nextVaccine = upcomingVaccines.sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date))[0];

                                      return (
                                        <tr key={patient.patient_id}>
                                          <td>
                                            <div className="d-flex align-items-center">
                                              <div
                                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                                style={{ width: '40px', height: '40px', backgroundColor: '#e3f2fd' }}
                                              >
                                                <FiUser size={18} className="text-primary" />
                                              </div>
                                              <div>
                                                <div className="fw-medium">{patientName || 'Unknown'}</div>
                                                <small className="text-muted">{patient.email || 'No email'}</small>
                                              </div>
                                            </div>
                                          </td>
                                          <td>
                                            <div>
                                              <div className="fw-medium">{patient.age || 'N/A'}</div>
                                              <small className="text-muted">{patient.gender || 'N/A'}</small>
                                            </div>
                                          </td>
                                          <td>{patient.phone || 'No phone'}</td>
                                          <td>
                                            <div>
                                              <div className="fw-medium">{patient.vaccines?.length || 0} vaccines</div>
                                              <small className="text-muted">
                                                {scheduledCount} scheduled, {completedCount} completed, {overdueCount} overdue
                                              </small>
                                            </div>
                                          </td>
                                          <td>
                                            {nextVaccine ? (
                                              <div>
                                                <div className="fw-medium">{nextVaccine.vaccine_name}</div>
                                                <small className="text-muted">
                                                  {formatDate(nextVaccine.schedule_date)}
                                                </small>
                                              </div>
                                            ) : (
                                              <span className="text-muted">No upcoming</span>
                                            )}
                                          </td>
                                          <td>
                                            {scheduledCount > 0 && (
                                              <span className="badge bg-warning rounded-pill me-1">
                                                {scheduledCount} Scheduled
                                              </span>
                                            )}
                                            {completedCount > 0 && (
                                              <span className="badge bg-success rounded-pill me-1">
                                                {completedCount} Completed
                                              </span>
                                            )}
                                            {overdueCount > 0 && (
                                              <span className="badge bg-danger rounded-pill">
                                                {overdueCount} Overdue
                                              </span>
                                            )}
                                            {scheduledCount === 0 && completedCount === 0 && overdueCount === 0 && (
                                              <span className="badge bg-secondary rounded-pill">No Records</span>
                                            )}
                                          </td>
                                          <td>
                                            <div className="hstack gap-2">
                                              <button className="avatar-text avatar-md" title="View Patient Details" onClick={() => handleViewPatient(patient.patient_id)}>
                                                <FiEye />
                                              </button>
                                              {/* <button className="avatar-text avatar-md" title="View Vaccine Schedule">
                                                <FiShield />
                                              </button>
                                              <button
                                                className="avatar-text avatar-md"
                                                title="Schedule New Vaccine"
                                                onClick={() => navigate(`/vaccines/schedule/${patient.patient_id}`)}
                                              >
                                                <FiCalendar />
                                              </button> */}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                      </tbody>
                                    </table>
                                  </div>
                          )}
                          </div>
                        </div>
                        <Pagination data={filteredPatients} />
                      </>
                  )}

                  {/* Records Tab */}
                  {activeTab === 'records' && (
                      <>
                        <div className="card border-0 bg-light">
                          <div className="card-body p-0">
                            <div className="table-responsive">
                              <table className="table table-hover mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th className="border-0">Patient</th>
                                    <th className="border-0">Vaccine</th>
                                    <th className="border-0">Dose</th>
                                    <th className="border-0">Scheduled Date</th>
                                    <th className="border-0">Administered Date</th>
                                    <th className="border-0">Status</th>
                                    {/* <th className="border-0">Actions</th> */}
                                  </tr>
                                </thead>
                                <tbody>
                                  {getCurrentPageData(filteredRecords).map(record => (
                                    <tr key={record.id}>
                                      <td>
                                        <div className="d-flex align-items-center">
                                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px', backgroundColor: '#DDF6D2' }}>
                                            <FiUser size={16} className="text-success" />
                                          </div>
                                          <div>
                                            <div className="fw-medium">{record.patient_name}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="fw-medium">{record.vaccine_name}</div>
                                      </td>
                                      <td>
                                        <span className="badge bg-info rounded-pill">Dose {record.dose_number}</span>
                                      </td>
                                      <td>{formatDate(record.scheduled_date)}</td>
                                      <td>
                                        {record.administered_date ?
                                          formatDate(record.administered_date) :
                                          '-'
                                        }
                                      </td>
                                      <td>{getStatusBadge(record.status)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <Pagination data={filteredRecords} />
                      </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {showPatientModal && selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          mode="view"
          close={handleClosePatientModal}
        />
      )}
      {showViewModal && medicineToView && (
        <ViewMedicineModal
          medicine={medicineToView}
          onClose={handleCloseViewModal}
        />
      )}
      {showEditModal && medicineToEdit && (
        <EditMedicineModal
          medicine={medicineToEdit}
          onClose={handleCloseEditModal}
          onSave={handleMedicineUpdate}
        />
      )}
    </>
  );
};

export default VaccineDashboard;