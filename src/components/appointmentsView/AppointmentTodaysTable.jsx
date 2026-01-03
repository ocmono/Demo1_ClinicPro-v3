import React, { useMemo, useState, useContext, useEffect } from 'react';
import Table from '@/components/shared/table/Table';
import Dropdown from '@/components/shared/Dropdown';
import {
  FiEdit3, FiTrash2, FiMoreHorizontal, FiRefreshCw, FiRepeat, FiClock, FiCheck
} from 'react-icons/fi';
import { GrRevert } from "react-icons/gr";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from '../../contentApi/AuthContext';
import { AppointmentContext } from "../../context/AppointmentContext";
import useCardTitleActions from "@/hooks/useCardTitleActions";
import CardLoader from "@/components/shared/CardLoader";
import useMessages from "@/hooks/useMessages";
import { Navigate } from 'react-router-dom';

const AppointmentTodaysTable = () => {
  const {
    appointments,
    doneVisits,
    markVisitDone,
    undoVisit,
    fetchAppointments,
    updateStatus,
    setAppointments,
  } = useContext(AppointmentContext);
  const { user, role, hasRole, isAuthenticated, doctorId, doctorName } = useAuth();

  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [dateTimeSettings, setDateTimeSettings] = useState({
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    timezone: 'UTC'
  });

  // Load date/time settings from localStorage
  useEffect(() => {
    const loadDateTimeSettings = () => {
      try {
        const settings = localStorage.getItem('dateTimeSettings');
        
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          setDateTimeSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error loading date/time settings:', error);
      }
    };

    loadDateTimeSettings();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'dateTimeSettings') {
        loadDateTimeSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const canManageRoles = ["super_admin", "clinic_admin", "doctor", "receptionist", "pharmacist"];
  const canManage = user && canManageRoles.includes(user.role);

  const { isRemoved } = useCardTitleActions();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    console.log('Refreshing...');
    setLoading(true);
    await fetchAppointments();
    setTimeout(() => {
      setLoading(false);
      console.log('Done loading');
    }, 500);
  };

  const { whatsappTemplate, followupTemplate } = useMessages();

  // Function to format date based on localStorage settings
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const { dateFormat } = dateTimeSettings;

      switch (dateFormat) {
        case 'MM/DD/YYYY':
          return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        case 'YYYY-MM-DD':
          return date.toISOString().split('T')[0];
        case 'DD/MM/YYYY':
        default:
          return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    } catch (error) {
      return dateString;
    }
  };

  // Function to format time based on localStorage settings
  const formatTime = (timeString) => {
    if (!timeString) return '—';

    try {
      // Parse the time string (could be in various formats)
      let time = timeString.trim().toUpperCase();
      
      // Create a date object with today's date and the given time
      const [timePart] = time.split(' '); // Remove AM/PM if present
      const [hours, minutes] = timePart.split(':').map(part => parseInt(part, 10));
      
      const date = new Date();
      date.setHours(hours, minutes || 0, 0, 0);

      const { timeFormat } = dateTimeSettings;

      if (timeFormat === '24h') {
        return date.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        // 12-hour format
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
    } catch (error) {
      return timeString;
    }
  };

  // Function to get today's date in the proper format for comparison
  const getTodayDate = () => {
    const today = new Date();
    const { dateFormat } = dateTimeSettings;

    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
      case 'YYYY-MM-DD':
        return today.toISOString().split('T')[0];
      case 'DD/MM/YYYY':
      default:
        return today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  const whatsappReminder = (id) => {
    const patient = appointments.find((appt) => appt.id === id);
    if (!patient) return;

    const formattedDate = formatDate(patient.date);
    const formattedTime = formatTime(patient.time);

    const message = whatsappTemplate.message
      .replace("{name}", patient.patientName)
      .replace("{doctor}", patient.doctor)
      .replace("{date}", formattedDate)
      .replace("{time}", formattedTime);

    const phoneNumber = patient.patientPhone?.replace(/\D/g, "");
    const whatsappURL = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");
  };

  const followUpReminder = (id) => {
    const patient = appointments.find((appt) => appt.id === id);
    if (!patient) return;

    const message = followupTemplate.message
      .replace("{name}", patient.patientName)
      .replace("{doctor}", patient.doctor);

    const phoneNumber = patient.patientPhone?.replace(/\D/g, "");
    const whatsappURL = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");
  };

  // Function to convert time to sortable format (always use 24h for sorting)
  const convertTimeToSortable = (timeStr) => {
    if (!timeStr) return '23:59:59';

    try {
      let time = timeStr.trim().toUpperCase();

      if (time.includes(':')) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);

        if (time.includes('AM') || time.includes('PM')) {
          let hour24 = hour;
          if (time.includes('PM') && hour !== 12) {
            hour24 = hour + 12;
          } else if (time.includes('AM') && hour === 12) {
            hour24 = 0;
          }
          return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        }

        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }

      return '23:59:59';
    } catch (error) {
      return '23:59:59';
    }
  };

  const today = getTodayDate();
  const displayRows = appointments
    .filter((appointment) => {
      const appointmentDate = formatDate(appointment.date);
      return appointmentDate === today;
    })
    .filter((appointment) => {
      if (role === "doctor" && doctorId) {
        return (
          appointment.doctor_id?.toString() === doctorId.toString() ||
          appointment.doctorId?.toString() === doctorId.toString() ||
          (appointment.doctor &&
            appointment.doctor
              .toLowerCase()
              .includes(doctorName?.toLowerCase() || user?.name?.toLowerCase() || ""))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = convertTimeToSortable(a.time);
      const timeB = convertTimeToSortable(b.time);
      return timeA.localeCompare(timeB);
    });

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
    if (!Array.isArray(displayRows)) return [];
    return displayRows.map((appt, index) => ({
      id: appt.id,
      name: appt.patientName,
      doctor: appt.doctor,
      email: appt.patientEmail || "—",
      contact: appt.patientPhone || "—",
      time: formatTime(appt.time) || "—",
      status: appt.status || "pending",
      source: appt.source,
      formattedType: formatAppointmentType(appt.appointment_type),
      visit: doneVisits.includes(appt.id) ? "Done" : "Pending",
      whatsapp: (
        <span
          className="text-primary cursor-pointer"
          onClick={() => whatsappReminder(appt.id)}
          title="Send WhatsApp Reminder"
          disabled={appt.status?.toLowerCase() === "rejected"}
        >
          <FaWhatsapp style={{ color: "#25D366", fontSize: "28px" }} />
        </span>
      ),
      followup: (
        <span
          className="text-primary cursor-pointer"
          onClick={() => followUpReminder(appt.id)}
          title="Send Follow Up Reminder"
          disabled={appt.status?.toLowerCase() === "rejected"}
        >
          <FiRepeat style={{ fontSize: "28px" }} />
        </span>
      ),
      actions: { index, appt },
    }));
  }, [appointments, doneVisits, dateTimeSettings]);

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      ),
      meta: { headerClassName: 'width-30' }
    },
    {
      accessorKey: 'name',
      header: 'Patient Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
    },
    {
      accessorKey: 'doctor',
      header: 'DR Name',
    },
    {
      accessorKey: 'time',
      header: 'Time',
      sortingFn: (rowA, rowB, columnId) => {
        const timeA = convertTimeToSortable(rowA.original.appt?.time || '');
        const timeB = convertTimeToSortable(rowB.original.appt?.time || '');
        return timeA.localeCompare(timeB);
      },
    },
    {
      accessorKey: 'source',
      header: 'Source',
    },
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status?.toLowerCase();

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
      accessorKey: 'visit',
      header: 'Visit',
      cell: ({ row }) => {
        const { appt } = row.original.actions;

        return appt.status?.toLowerCase() !== "done" ? (
          <button
            className="visit-btn btn btn-sm btn-success"
            onClick={() => markVisitDone(appt.id)}
            disabled={appt.status?.toLowerCase() === "rejected"}
            title="Mark Visit as Done"
          >
            ✔
          </button>
        ) : (
            <span className="visit-done text-success fw-semibold">Done</span>
        );
      }
    },
    {
      accessorKey: 'whatsapp',
      header: 'WhatsApp',
      cell: ({ row }) => {
        const { appt } = row.original.actions;
        const status = appt.status?.toLowerCase();

        if (status !== 'approved') {
          return <span className="text-muted"></span>;
        }

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
    {
      accessorKey: 'followup',
      header: 'Follow Up',
      cell: ({ row }) => {
        const { appt } = row.original.actions;
        return (
          <span
            className="text-primary cursor-pointer"
            onClick={() => followUpReminder(appt.id)}
            title="Send Follow Up Reminder"
          >
            <FiRepeat style={{ fontSize: "28px" }} />
          </span>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const { index, appt } = row.original.actions;

        if (!canManage) return <span>—</span>;

        const actions = [
          { icon: <FiClock />, label: "Move to Pending" },
          { icon: <GrRevert />, label: "Undo visit" },
          { icon: < FiTrash2 />, label: "Reject" },
        ];

        return (
          <Dropdown
            dropdownItems={
              appt.status === "done"
                ? actions
                : actions.filter(
                  (option) => option.label !== "Undo visit"
                )}
            triggerIcon={<FiMoreHorizontal />}
            triggerClass="avatar-md"
            onClick={(actionLabel) => {
              switch (actionLabel) {
                case "Move to Pending":
                  updateStatus(appt.id, "pending");
                  break;
                case "Undo visit":
                  undoVisit(appt.id);
                  updateStatus(appt.id, "approved")
                  break;
                case "Reject":
                  updateStatus(appt.id, "rejected");
                  break;
                default:
                  break;
              }
            }}
          />
        );
      },
      meta: { headerClassName: 'text-end' }
    }
  ];

  return (
    <>
        <div>
          <Table 
          data={tableData}
          columns={columns}
          onRefresh={handleRefresh}
          emptyMessage={"No appointments booked for today."}
          cardHeader={
            <h5 className="card-title">Today's Appointments</h5>
          }
          />
        {loading && <CardLoader />}
      </div>
    </>
  );
};

export default AppointmentTodaysTable;