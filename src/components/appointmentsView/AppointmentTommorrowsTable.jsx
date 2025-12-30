import React, { useMemo, useContext } from 'react';
import Table from '@/components/shared/table/Table';
import { useAuth } from '../../contentApi/AuthContext';
import { AppointmentContext } from "../../context/AppointmentContext";
import {
  FiEdit3, FiTrash2, FiMoreHorizontal, FiRefreshCw, FiRepeat
} from 'react-icons/fi';
import { FaWhatsapp } from "react-icons/fa";
import Dropdown from '@/components/shared/Dropdown';
import useMessages from "@/hooks/useMessages";
import { Navigate } from 'react-router-dom';
import useCardTitleActions from "@/hooks/useCardTitleActions";

// function formatCustomDate(dateStr) {
//   if (!dateStr) return '—';
//   const d = new Date(dateStr);
//   if (isNaN(d)) return dateStr;

//   const day = d.getDate();
//   const month = d.getMonth() + 1; // Months are 0-based
//   const year = d.getFullYear();

//   // 🔹 Return in D/M/YYYY format (no padding, no names)
//   return `${day}/${month}/${year}`;
// }

const AppointmentTommorrowsTable = () => {
  const { user } = useAuth();
  const { appointments } = useContext(AppointmentContext);

  // Helper: Get tomorrow's date in 'YYYY-MM-DD' format
  const tomorrowDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const { refreshKey, isRemoved, handleRefresh } = useCardTitleActions();

  const { whatsappTemplate, followupTemplate } = useMessages();

  if (isRemoved) return null;

  const whatsappReminder = (id) => {
    const patient = appointments.find((appt) => appt.id === id);
    if (!patient) return;

    const message = whatsappTemplate.message
      .replace("{name}", patient.patientName)
      .replace("{doctor}", patient.doctor)
      .replace("{date}", patient.date)
      .replace("{time}", patient.time);

    const phoneNumber = patient.patientPhone?.replace(/\D/g, "");
    const whatsappURL = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappURL, "_blank");
  };


  const canManageRoles = ["super_admin", "clinic_admin", "doctor", "receptionist", "pharmacist"];
  const canManage = user && canManageRoles.includes(user.role);

  const tableData = useMemo(() => {
    return appointments
      .filter((appt) => appt.date === tomorrowDate && appt.status === "approved")
      .map((appt, index) => ({
        id: appt.id,
        name: appt.patientName,
        email: appt.patientEmail || "—",
        contact: appt.patientPhone || "—",
        doctor: appt.doctor,
        date: appt.date,
        time: appt.time,
        status: appt.status || "pending",
        whatsapp: (
          <span
            className="text-primary cursor-pointer" 
            onClick={() => whatsappReminder(appt.id)}
            title="Send WhatsApp Reminder"
            disabled={appt.status === "rejected"}
          >
            <FaWhatsapp style={{ color: "#25D366", fontSize: "28px" }}/>
          </span>
        ),
        actions: { index, appt },
      }));
  }, [appointments, tomorrowDate]);

  const columns = [
    {
      accessorKey: 'id',
      header: 'Patient ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      )
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'contact', header: 'Contact No' },
    { accessorKey: 'doctor', header: 'Dr Name' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'time', header: 'Time' },
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
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const { index, appt } = row.original.actions;

        if (!canManage) return <span>—</span>;

        const actions = [
          { icon: <FiEdit3 />, label: "Revert" },
          { icon: <FiEdit3 />, label: "Undo visit" },
          { icon: <FiEdit3 />, label: "Reject" },
        ];

        return (
          <Dropdown
            dropdownItems={
              appt.status?.toLowerCase() === "done"
              ? actions
              : actions.filter(
                  (option) => option.label !== "Undo visit"
                )}
            triggerIcon={<FiMoreHorizontal />}
            triggerClass="avatar-md"
            onClick={(actionLabel) => {
              switch (actionLabel) {
                case "Revert":
                  updateStatus(appt.id, "pending");
                  break;
                case "Undo visit":
                  undoVisit(appt.id);
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
      <div className="pending-appointments-header d-flex justify-content-between align-items-center mb-3">
        <h5 className="pending-appointments-title m-0">Tomorrow's Appointments</h5>
      </div>
      <Table data={tableData} columns={columns} emptyMessage={"No appointments scheduled for tomorrow."}/>
    </>
  );
};

export default AppointmentTommorrowsTable;
