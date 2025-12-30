import React, { useMemo, useContext } from 'react';
import Table from '@/components/shared/table/Table';
import Dropdown from '@/components/shared/Dropdown';
import { FiEdit3, FiTrash2, FiMoreHorizontal, FiCheck, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../contentApi/AuthContext';
import { AppointmentContext } from "../../context/AppointmentContext";
import useMessages from "@/hooks/useMessages";
import { Navigate } from 'react-router-dom';
import useCardTitleActions from "@/hooks/useCardTitleActions";


const AppointmentUpcommingsTable = () => {
  const { appointments, updateStatus } = useContext(AppointmentContext);
  const { user, role, hasRole, isAuthenticated, doctorId, doctorName } = useAuth();

  // Role-based access control
  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin';
  const isReceptionist = role === 'receptionist';
  const canViewAllAppointments = isAdmin || isReceptionist;

  // Get current doctor's info
  const currentDoctorId = isDoctor ? (doctorId || user?.id) : null;
  const currentDoctorName = isDoctor ? (doctorName || user?.name) : null;

  console.log('Upcoming Appointments Auth Debug:', {
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

  const canManageRoles = ["super_admin", "clinic_admin", "doctor", "receptionist", "pharmacist"];
  const canManage = user && canManageRoles.includes(user.role);

  const dayAfterTomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const { refreshKey, isRemoved, handleRefresh } = useCardTitleActions();

  const { whatsappTemplate, followupTemplate } = useMessages();

  if (isRemoved) return null;

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

  const whatsappReminder = (id) => {
    const patient = appointments.find((appt) => appt.id === id);
    if (!patient) return;

    const message = whatsappTemplate.message
      .replace("{name}", patient.patientName || "Patient")
      .replace("{doctor}", patient.doctor || "Doctor")
      .replace("{date}", patient.date || "")
      .replace("{time}", patient.time || "");

    const phoneNumber = patient.patientPhone.replace(/\D/g, "");
    const whatsappURL = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");
  };

  // Function to parse time for sorting
  const parseTimeForSorting = (timeStr) => {
    if (!timeStr) return '00:00';

    try {
      const timeLower = timeStr.toLowerCase().trim();
      let timePart = timeLower;
      let modifier = '';

      // Extract AM/PM if present
      if (timeLower.includes('am') || timeLower.includes('pm')) {
        [timePart, modifier] = timeLower.split(' ');
        modifier = modifier || '';
      }

      let [hours, minutes] = timePart.split(':');
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes || '0', 10);

      // Handle 12-hour format
      if (modifier === 'pm' && hours < 12) {
        hours += 12;
      } else if (modifier === 'am' && hours === 12) {
        hours = 0;
      }

      // Handle 24-hour format
      if (hours >= 24) hours = 23;
      if (minutes >= 60) minutes = 59;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.warn('Could not parse time for sorting:', timeStr);
      return '00:00';
    }
  };


  // Function to format appointment type for display
  const formatAppointmentType = (type) => {
    if (!type) return '';

    // Convert to title case and replace underscores with spaces
    return type
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter upcoming appointments based on user role
  const getFilteredUpcomingAppointments = useMemo(() => {
    let filteredAppointments = appointments.filter((appt) => {
      const apptDate = new Date(appt.date);
      return apptDate > dayAfterTomorrow;
    });

    // If user is a doctor, filter appointments to show only their own
    if (isDoctor && currentDoctorId) {
      filteredAppointments = filteredAppointments.filter(appt => {
        // Check various possible doctor identification fields
        const matchesDoctor =
          appt.doctor_id?.toString() === currentDoctorId.toString() ||
          appt.doctorId?.toString() === currentDoctorId.toString() ||
          (currentDoctorName && appt.doctor?.toLowerCase().includes(currentDoctorName.toLowerCase())) ||
          (user?.name && appt.doctor?.toLowerCase().includes(user.name.toLowerCase()));

        console.log('Upcoming Appointments Doctor filter check:', {
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
  }, [appointments, dayAfterTomorrow, isDoctor, currentDoctorId, currentDoctorName, user]);


  // Function to get dropdown actions based on status
  const getDropdownActions = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === 'approved' || normalizedStatus === 'accepted') {
      // For approved appointments: show option to revert to pending
      return [
        { icon: <FiClock />, label: "Move to Pending" },
        { icon: <FiTrash2 />, label: "Reject" },
      ];
    } else if (normalizedStatus === 'pending') {
      // For pending appointments: show option to approve
      return [
        { icon: <FiCheck />, label: "Approve" },
        { icon: <FiTrash2 />, label: "Reject" },
      ];
    } else {
      // Default actions for other statuses
      return [
        { icon: <FiEdit3 />, label: "Revert" },
        { icon: <FiTrash2 />, label: "Reject" },
      ];
    }
  };

  // Function to handle dropdown action based on current status
  const handleDropdownAction = (actionLabel, currentStatus, appointmentId) => {
    const normalizedStatus = currentStatus?.toLowerCase();

    switch (actionLabel) {
      case "Move to Pending":
        if (normalizedStatus === 'approved' || normalizedStatus === 'accepted') {
          updateStatus(appointmentId, "pending");
        }
        break;
      case "Approve":
        if (normalizedStatus === 'pending') {
          updateStatus(appointmentId, "approved");
        }
        break;
      case "Reject":
        updateStatus(appointmentId, "rejected");
        break;
      case "Revert":
        updateStatus(appointmentId, "pending");
        break;
      default:
        break;
    }
  };


  const tableData = useMemo(() => {
    return getFilteredUpcomingAppointments
      .map((appt, index) => {
        const timeForSorting = parseTimeForSorting(appt.time);
        const sortableDateTime = appt.date ?
          `${appt.date} ${timeForSorting}` : '';
        return {
          id: appt.id,
          name: appt.patientName,
          email: appt.patientEmail || "—",
          contact: appt.patientPhone || "—",
          doctor: appt.doctor,
          date: appt.date,
          time: appt.time,
          source: appt.source,
          status: appt.status || "pending",
          formattedType: formatAppointmentType(appt.appointment_type),
          sortableDateTime: sortableDateTime,
          timeForSorting: timeForSorting,
          whatsapp: (
            <span
              className="text-primary cursor-pointer"
              onClick={() => whatsappReminder(appt.id)}
              title="Send WhatsApp Reminder"
              disabled={appt.status === "rejected"}
            >
              <FaWhatsapp style={{ color: "#25D366", fontSize: "28px", cursor: appt.status === "rejected" ? "not-allowed" : "pointer", opacity: appt.status === "rejected" ? 0.5 : 1 }} />
            </span>
          ),
          actions: { index, appt },
        }
      });
  }, [getFilteredUpcomingAppointments]);

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
        // Add badge styling for better visual appearance
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

        // Parse dates for proper comparison
        try {
          const [dateA, timeA] = dateTimeA.split(' ');
          const [dateB, timeB] = dateTimeB.split(' ');

          // Compare dates first
          const dateComparison = dateA.localeCompare(dateB);
          if (dateComparison !== 0) return dateComparison;

          // If dates are equal, compare times
          return timeA.localeCompare(timeB);
        } catch (error) {
          // Fallback to string comparison
          return dateTimeA.localeCompare(dateTimeB);
        }
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status?.toLowerCase(); // normalize

        // Map statuses to colors
        const statusColors = {
          approved: "bg-success text-white",
          accepted: "bg-success text-white",
          pending: "bg-warning text-white",
          cancelled: "bg-danger text-white",
          rejected: "bg-danger text-white",
          completed: "bg-primary text-white",
          done: "bg-info text-white",
          rescheduled: "bg-secondary text-white",
        };

        const badgeClass = statusColors[status] || "bg-light text-dark border";

        return (
          <span className={`badge ${badgeClass}`}>
            {row.original.status}
          </span>
        );
      }
    },
    {
        accessorKey: 'whatsapp',
        header: 'WhatsApp',
        cell: ({ row }) => {
        const { appt } = row.original.actions;
        return (
          <span
            className="text-primary cursor-pointer"
            onClick={() => whatsappReminder(appt.id)}
            title="Send WhatsApp Reminder"
          >
            <FaWhatsapp style={{ color: "#25D366", fontSize: "28px" }} />
          </span>
        );
      }
    },
    canManage && {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const { appt } = row.original.actions;
        const currentStatus = appt.status;
        const actions = getDropdownActions(currentStatus);

        return (
          <Dropdown
            dropdownItems={actions}
            triggerIcon={<FiMoreHorizontal />}
            triggerClass="avatar-md"
            onClick={(actionLabel) => {
              handleDropdownAction(actionLabel, currentStatus, appt.id);
            }}
          />
        );
      },
      meta: { headerClassName: 'text-end' }
    }
  ].filter(Boolean);

  return (
    <>
      <div>
        <Table data={tableData} columns={columns} emptyMessage={"No upcoming approved appointments in the next 5 days."} defaultSorting={[{ id: 'sortableDateTime', asc: true }]} cardHeader={
          <h5 className="card-title">Upcoming Appointments</h5>
          } />
      </div>
    </>
  );
};

export default AppointmentUpcommingsTable;