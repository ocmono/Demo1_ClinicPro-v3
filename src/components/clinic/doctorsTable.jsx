import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import Table from '@/components/shared/table/Table';
import { FiPhone, FiMail, FiBriefcase, FiEye, FiEdit3, FiTrash2, FiSearch, FiArrowUp, FiArrowDown, FiPlus, FiWifi } from 'react-icons/fi'
import { useAuth } from "../../contentApi/AuthContext";
import { useBooking } from "../../contentApi/BookingProvider";
import { toast } from "react-toastify";
import EditDoctorModal from './EditDoctorModal';
import { BsCake2Fill } from "react-icons/bs";
import DeleteConfirmationModal from '../../pages/clinic/settings/DeleteConfirmationModal';

const DoctorsTable = () => {
  const { user } = useAuth();
  const { doctors, fetchDoctors } = useBooking();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination state
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: 10
  });

  const normalizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  };

  const navigate = useNavigate();

  // Define roles that can manage doctors (edit/delete)
  const canManageDoctorRoles = ["super_admin", "clinic_admin"];

  // Check if current user can manage doctors
  const canManageDoctor = user && canManageDoctorRoles.includes(user.role);

  // Check if current user is a doctor
  const isDoctor = user && user.role === "doctor";

  // Get current doctor's ID for filtering
  const currentDoctorId = useMemo(() => {
    if (!user || !isDoctor) return null;
    return user.doctorId || user.id || user.doctor_id;
  }, [user, isDoctor]);

  // Transform doctors data to match table structure
  const transformedDoctors = useMemo(() => {
    let doctorsList = doctors || [];

    // If user is a doctor, filter to show only their data
    if (isDoctor && currentDoctorId) {
      doctorsList = doctorsList.filter(doctor => {
        const doctorId = doctor.id || doctor.doctor_id || doctor.doctorId;
        return doctorId?.toString() === currentDoctorId.toString();
      });
    }
    return doctorsList.map((doctor, index) => {

      // Enhanced name handling to ensure full names
      let fullName = doctor.name || doctor.doctor_name || doctor.fullName || doctor.doctor_full_name;

      // If we have separate first and last names, combine them
      if (!fullName && (doctor.firstName || doctor.lastName)) {
        const firstName = doctor.firstName || '';
        const lastName = doctor.lastName || '';
        fullName = `${firstName} ${lastName}`.trim();
        if (fullName) {
          fullName = fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`;
        }
      }

      // If still no name, create a fallback
      if (!fullName) {
        fullName = `Dr. Unknown ${index + 1}`;
      }

      // Enhanced specialty mapping from database
      const specialty = normalizeArray(doctor?.drSpeciality);


      // Enhanced qualification mapping from database
      const qualification = normalizeArray(doctor?.qualification);

      // Enhanced experience mapping from database
      const experience = doctor?.experience ||
        doctor?.mapped?.experience ||
        '0';

      // Enhanced appointments mapping from database
      const appointments = doctor.appointments ||
        doctor?.original?.appointment_count ||
        0;

      // Enhanced prescriptions/patients mapping from database
      const patients = doctor?.patients ||
        doctor?.mapped?.patients ||
        0;

      // Log the original doctor data for debugging
      // console.log(`Doctor ${index + 1} data:`, {
      //   original: doctor,
      //   mapped: {
      //     specialty,
      //     qualification,
      //     experience,
      //     appointments,
      //     patients
      //   }
      // });

      return {
        id: doctor.id || doctor.doctor_id || doctor.doctorId || index + 1,
        name: fullName,
        email: doctor.email || doctor.drEmail || doctor.doctor_email || 'Not specified',
        phone: doctor.phone || doctor.drPhone || doctor.doctor_phone || 'Not specified',
        specialty: specialty,
        experience: experience,
        status: doctor.status || doctor.doctor_status || 'Active',
        qualification: qualification,
        appointments: appointments,
        patients: patients,
        originalDoctor: doctor // Keep original data for actions
      };
    });
  }, [doctors, isDoctor, currentDoctorId]);

  // Filter and sort doctors
  const filteredAndSortedDoctors = useMemo(() => {
    return transformedDoctors
      .filter(doctor => {
        const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = !filterSpecialty || doctor.specialty === filterSpecialty;
        const matchesStatus = !filterStatus || doctor.status === filterStatus;
        return matchesSearch && matchesSpecialty && matchesStatus;
      })
      .sort((a, b) => {
        let aValue = a[sortBy] || '';
        let bValue = b[sortBy] || '';

        if (sortBy === 'experience') {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        } else {
          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [transformedDoctors, searchTerm, filterSpecialty, filterStatus, sortBy, sortOrder]);

  // Get unique specialties and statuses for filter
  const uniqueSpecialties = [...new Set(transformedDoctors.map(doctor => doctor.specialty).filter(Boolean))];
  const uniqueStatuses = [...new Set(transformedDoctors.map(doctor => doctor.status).filter(Boolean))];

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleView = (doctor) => {
    navigate(`/clinic/doctors/view/${doctor.id}`);
  };

  const canEditDoctor = useMemo(() => {
    if (!user) return false;

    // Admins can edit anyone
    if (["super_admin", "clinic_admin"].includes(user.role)) {
      return true;
    }

    // Doctors can edit ONLY their own profile
    if (user.role === "doctor") {
      const doctorId = user.doctorId || user.id || user.doctor_id;
      return (
        doctorId &&
        doctorId.toString() ===
        (selectedDoctor?.id ||
          selectedDoctor?.doctor_id ||
          selectedDoctor?.doctorId)?.toString()
      );
    }

    return false;
  }, [user, selectedDoctor]);

  const handleDelete = (doctor) => {
    if (!canManageDoctor) {
      toast.error("You don't have permission to delete doctors");
      return;
    }

    // Prevent deletion if doctor has written prescriptions
    const prescriptionCount = doctor.patients || doctor.prescriptions || 0;
    if (prescriptionCount > 0) {
      toast.error("Cannot delete doctor who has written prescriptions.");
      return;
    }

    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;

    try {
      const response = await fetch(
        `https://bkdemo1.clinicpro.cc/doctor/delete-doctor/${doctorToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      toast.success(`${doctorToDelete.name} has been deleted successfully`);
      setIsDeleteModalOpen(false);
      setDoctorToDelete(null);
      fetchDoctors(); // Refresh the list
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error(`Failed to delete ${doctorToDelete.name}`);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDoctorToDelete(null);
  };

  // Handle pagination change
  const handlePaginationChange = (newPagination) => {
    setPaginationState(newPagination);
  };

  const formatDOB = (dob) => {
    if (!dob) return null;
    const date = new Date(dob);
    if (isNaN(date)) return null;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'bg-success', text: 'Active' },
      'Inactive': { class: 'bg-secondary', text: 'Inactive' },
      'On Leave': { class: 'bg-warning', text: 'On Leave' },
      'Available': { class: 'bg-success', text: 'Available' },
      'Busy': { class: 'bg-warning', text: 'Busy' },
      'Offline': { class: 'bg-secondary', text: 'Offline' }
    };
    const config = statusConfig[status] || statusConfig['Active'];
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
  };

  const getSpecialtyBadge = (specialty) => {
    const specialtyConfig = {
      'Cardiology': { class: 'bg-danger', text: 'Cardiology' },
      'Neurology': { class: 'bg-primary', text: 'Neurology' },
      'Orthopedics': { class: 'bg-info', text: 'Orthopedics' },
      'Pediatrics': { class: 'bg-success', text: 'Pediatrics' },
      'Dermatology': { class: 'bg-warning', text: 'Dermatology' },
      'General': { class: 'bg-secondary', text: 'General' },
      'ENT': { class: 'bg-info', text: 'ENT' },
      'Radiology': { class: 'bg-dark', text: 'Radiology' }
    };
    const config = specialtyConfig[specialty] || { class: 'bg-secondary', text: specialty || 'General' };
    return <span className={`badge ${config.class} small`}>{config.text}</span>;
  };

  const columns = [
    {
      accessorKey: 'id',
      header: () => 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'name',
      header: () => 'Name',
      cell: (info) => {
        const doctor = info.row.original.originalDoctor;
        const dobFormatted = formatDOB(doctor?.dob);
        return (
          <div className="hstack gap-3">
            <div className="text-white avatar-text user-avatar-text avatar-md bg-primary">
              {info.getValue().substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="fw-medium">{info.getValue()}</div>
              {dobFormatted ? (
                <small className="text-muted">
                  <BsCake2Fill /> {dobFormatted}
                </small>
              ) : (
                <small className="text-muted">DOB: —</small>
              )}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'email',
      header: () => 'Contact',
      cell: (info) => (
        <div>
          <div className="d-flex align-items-center gap-1 mb-1">
            <FiMail size={12} className="text-muted" />
            <a href={`mailto:${info.getValue()}`} className="text-decoration-none">
              {info.getValue()}
            </a>
          </div>
          <div className="d-flex align-items-center gap-1">
            <FiPhone size={12} className="text-muted" />
            <a href={`tel:${info.row.original.phone}`} className="text-decoration-none">
              {info.row.original.phone}
            </a>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'specialty',
      header: () => 'Specialty',
      cell: (info) => {
        const values = info.getValue();
        if (!values || !values.length) return <span className="text-muted">—</span>;
        return (
          < span className="badge bg-info small" > {values.join(', ')}</span >
        )
      }
    },
    {
      accessorKey: 'qualification',
      header: () => 'Qualification',
      cell: (info) => {
        const values = info.getValue();
        if (!values || !values.length) return <span className="text-muted">—</span>;
        return (
          < span className="badge bg-primary small" > {values.join(', ')}</span >
      )
      }
    },
    {
      accessorKey: 'status',
      header: () => 'Status',
      cell: (info) => getStatusBadge(info.getValue())
    },
    {
      accessorKey: 'actions',
      header: () => 'Actions',
      cell: (info) => {
        const doctor = info.row.original.originalDoctor;
        return (
          <div className="hstack gap-2 justify-content-start">
            <button
              className="avatar-text avatar-md"
              title="View"
              onClick={() => handleView(doctor)}
            >
              <FiEye />
            </button>
            {(
              ["super_admin", "clinic_admin"].includes(user?.role) ||
              (
                user?.role === "doctor" &&
                (
                  (doctor.id || doctor.doctor_id || doctor.doctorId)?.toString() ===
                  (currentDoctorId)?.toString()
                )
              )
            ) && (
                <button
                  className="avatar-text avatar-md"
                  title="Edit"
                  onClick={() => handleEdit(doctor)}
                >
                  <FiEdit3 />
                </button>
              )}
            {/* {canManageDoctor && (
              <button
                className="avatar-text avatar-md text-danger"
                title="Delete"
                onClick={() => handleDelete(doctor)}
              >
                <FiTrash2 />
              </button>
            )} */}
          </div>
        );
      },
      meta: { headerClassName: 'text-end' },
    },
  ];

  // Add loading state if doctors data is not yet available
  if (!doctors) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="doctors-table">
      <Table
        data={filteredAndSortedDoctors}
        columns={columns}
        showPrint={false}
        // Pass pagination state and change handler
        pagination={paginationState}
        onPaginationChange={handlePaginationChange}
        cardHeader={<h5 class="card-title mb-0">Doctors List</h5>}
        emptyMessage={
          <div className="text-center py-4">
            <div className="text-muted mb-2">
              <FiBriefcase size={32} className="opacity-50" />
            </div>
            <h6 className="text-muted">
              {searchTerm || filterSpecialty || filterStatus ? 'No doctors found matching your criteria' : 'No doctors found'}
            </h6>
            <p className="text-muted small mb-3">
              {searchTerm || filterSpecialty || filterStatus ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first doctor'}
            </p>
            <div className='d-flex align-items-center justify-content-center'>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/users/add')}
              >
                <FiPlus size={14} className="me-1" />
                Add First Doctor
              </button>
            </div>
          </div>
        }
        loading={false}
      />
      <EditDoctorModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        doctor={selectedDoctor}
        onSave={() => {
          handleCloseModal();
          fetchDoctors(); // Refresh the list after edit
          // Pagination state is maintained automatically
        }}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Doctor"
        message={doctorToDelete ? `Are you sure you want to delete ${doctorToDelete.name}? This action cannot be undone.` : ''}
      />
    </div>
  );
};

export default DoctorsTable;