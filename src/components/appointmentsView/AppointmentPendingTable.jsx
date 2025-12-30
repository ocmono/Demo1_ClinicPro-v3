import React, { useMemo, useState, useContext, useEffect } from 'react';
import Table from '@/components/shared/table/Table';
import { useAuth } from '../../contentApi/AuthContext';
import { Navigate } from "react-router-dom";
import useCardTitleActions from "@/hooks/useCardTitleActions";
import { AppointmentContext } from "../../context/AppointmentContext";
import { FiRefreshCw, FiEdit } from "react-icons/fi";
import EditAppointmentModal from './EditAppointmentModal';

const AppointmentPendingTable = () => {
  const { user, role, hasRole, isAuthenticated, doctorId, doctorName } = useAuth();
  const { appointments, updateStatus, updateAppointment } = useContext(AppointmentContext);
  const {
    refreshKey,
    isRemoved,
    handleRefresh,
  } = useCardTitleActions();
  
  console.log('Appointments:', appointments);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isRemoved) return null;

  // Role-based access control
  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin';
  const isReceptionist = role === 'receptionist';
  const canViewAllAppointments = isAdmin || isReceptionist;

  // Get current doctor's info
  const currentDoctorId = isDoctor ? (doctorId || user?.id) : null;
  const currentDoctorName = isDoctor ? (doctorName || user?.name) : null;

  console.log('Pending Appointments Auth Debug:', {
    user,
    role,
    isDoctor,
    isAdmin,
    isReceptionist,
    currentDoctorId,
    currentDoctorName,
    doctorId,
    doctorName
  });

  const allowedRoles = ["super_admin", "clinic_admin", "doctor", "receptionist"];
  const canManageAppointments = allowedRoles.includes(user.role);

  const moveToApproved = (id) => {
    updateStatus(id, "approved");
  };

  const moveToRejected = (id) => {
    updateStatus(id, "rejected");
  };

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

  // Function to format date and time for display
  const formatDateTimeDisplay = (dateStr, timeStr) => {
    if (!dateStr) return '—';
    
    const formattedDate = formatDate(dateStr);
    const formattedTime = formatTime(timeStr);
    
    return (
      <div>
        <div>{formattedDate}</div>
        <div className="text-muted small">{formattedTime}</div>
      </div>
    );
  };

  const getFilteredPendingAppointments = useMemo(() => {
    let filteredAppointments = appointments.filter(
      (appointment) => appointment.status === "pending"
    );

    // If user is a doctor, filter appointments to show only their own
    if (isDoctor && currentDoctorId) {
      filteredAppointments = filteredAppointments.filter(appt => {
        // Check various possible doctor identification fields
        const matchesDoctor =
          appt.doctor_id?.toString() === currentDoctorId.toString() ||
          appt.doctorId?.toString() === currentDoctorId.toString() ||
          (currentDoctorName && appt.doctor?.toLowerCase().includes(currentDoctorName.toLowerCase())) ||
          (user?.name && appt.doctor?.toLowerCase().includes(user.name.toLowerCase()));

        console.log('Pending Appointments Doctor filter check:', {
          appointmentId: appt.id,
          apptDoctor: appt.doctor,
          apptDoctorId: appt.doctor_id,
          currentDoctorId,
          currentDoctorName,
          userName: user?.name,
          matchesDoctor
        });

        return matchesDoctor;
      });
    }

    return filteredAppointments;
  }, [appointments, isDoctor, currentDoctorId, currentDoctorName, user]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Function to format appointment type for display
  const formatAppointmentType = (type) => {
    if (!type) return '';

    return type
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const tableData = useMemo(() => {
    if (!Array.isArray(getFilteredPendingAppointments)) return [];

    return getFilteredPendingAppointments.map((appt) => {
      return {
        id: appt.id,
        name: appt.patientName,
        email: appt.patientEmail || "—",
        contact: appt.patientPhone || "—",
        doctor: appt.doctor,
        date: appt.date,
        time: appt.time,
        actions: appt,
        source: appt.source,
        formattedType: formatAppointmentType(appt.appointment_type),
        // Sortable fields - use original date for proper sorting
        sortableDateTime: appt.date ? `${appt.date}T${appt.time || '00:00'}` : '',
      };
    });
  }, [getFilteredPendingAppointments]);

  const handleAppointmentUpdate = async (updatedAppt) => {
    try {
      await updateAppointment(updatedAppt.id, updatedAppt);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      )
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'contact', header: 'Contact No' },
    { accessorKey: 'doctor', header: 'Dr Name' },
    { accessorKey: 'source', header: 'Source' },
    {
      accessorKey: 'formattedType',
      header: 'Type',
      cell: (info) => {
        const type = info.getValue();
        return (
          <span className={`badge ${type === 'New' ? 'bg-primary' :
            type === 'Follow Up' ? 'bg-success' :
              type === 'Treatment' ? 'bg-info' :
                'bg-secondary'
            }`}>
            {type}
          </span>
        );
      }
    },
    {
      accessorKey: 'sortableDateTime',
      header: 'Appt. Date & Time',
      cell: ({ row }) => formatDateTimeDisplay(row.original.date, row.original.time),
      sortingFn: (rowA, rowB, columnId) => {
        const dateTimeA = rowA.getValue(columnId);
        const dateTimeB = rowB.getValue(columnId);

        // Handle empty values
        if (!dateTimeA && !dateTimeB) return 0;
        if (!dateTimeA) return -1;
        if (!dateTimeB) return 1;

        // Use Date objects for proper sorting
        return new Date(dateTimeA) - new Date(dateTimeB);
      }
    },
    canManageAppointments && {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const patient = row.original.actions;
        return (
          <div className="pending-appointments-actions d-flex gap-2">
            <button
              className="pending-appointments-btn approve btn btn-sm btn-success"
              onClick={() => moveToApproved(patient.id)}
              title="Approve"
            >
              ✔
            </button>
            <button
              className="pending-appointments-btn reject btn btn-sm btn-danger"
              onClick={() => moveToRejected(patient.id)}
              title="Reject"
            >
              ✖
            </button>
            <button
              className="pending-appointments-btn reject btn btn-sm btn-warning"
              onClick={() => {
                setSelectedAppointment(patient);
                setEditModalOpen(true);
              }}
              title="Edit"
            >
              <FiEdit />
            </button>
          </div>
        );
      }
    }
  ].filter(Boolean);

  return (
    <>
        <div>
          <Table 
            data={tableData} 
            columns={columns} 
            emptyMessage={"No pending appointments"} 
          defaultSorting={[{ id: 'id', desc: true }]}
          cardHeader={
            <h5 className="card-title">Pending Appointments</h5>
          }
          />
          {editModalOpen && (
            <EditAppointmentModal
              appointment={selectedAppointment}
              onClose={() => setEditModalOpen(false)}
              onSave={handleAppointmentUpdate}
            />
          )}
      </div>
    </>
  );
};

export default AppointmentPendingTable;